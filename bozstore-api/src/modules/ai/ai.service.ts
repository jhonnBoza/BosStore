import { supabaseAdmin } from '../../config/supabase'
import { AppError } from '../../lib/errors'
import { env } from '../../config/env'

type ChatTurn = { role: 'user' | 'model'; text: string }

type GameRow = {
  title: string
  slug: string
  price: number
  discount_percent: number | null
  genre: string | null
  platform: string | null
  stock: number | null
  cover_url: string | null
}

export type GameCard = {
  slug: string
  title: string
  cover_url: string | null
  price: number
  discount_percent: number
  final_price: number
  genre: string | null
  platform: string | null
}

export type AssistantResult = {
  answer: string
  games: GameCard[]
}

function finalPrice(price: number, discount: number): number {
  return Math.round(Number(price) * (1 - discount / 100) * 100) / 100
}

const SYSTEM_PROMPT = `Eres "Boz", el asistente virtual de BosStore, una tienda de videojuegos digitales.
Ayudas a los clientes a encontrar juegos usando ÚNICAMENTE el catálogo que se te da.

Debes responder en formato JSON con dos campos:
- "reply": un mensaje corto, amable y en español (1 o 2 frases). NO uses asteriscos ni markdown. NO listes los juegos dentro de este texto (se mostrarán como tarjetas aparte). Ej: "¡Claro! Estas son las mejores ofertas ahora mismo:".
- "slugs": un arreglo con los "slug" de los juegos que recomiendas, EN EL ORDEN que quieras mostrarlos (máximo 6). Usa exactamente los slugs del catálogo. Si la pregunta no requiere mostrar juegos, deja el arreglo vacío.

Reglas:
- Cuando pidan "más baratos", "en oferta", "por género", "para PC", etc., filtra y ordena tú los juegos y pon sus slugs.
- NUNCA inventes juegos ni slugs que no estén en el catálogo.
- Si preguntan algo fuera del catálogo o no relacionado con la tienda, responde con amabilidad en "reply" y deja "slugs" vacío.`

async function fetchCatalog(): Promise<GameRow[]> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('title, slug, price, discount_percent, genre, platform, stock, cover_url')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return (data ?? []) as GameRow[]
}

function catalogToText(games: GameRow[]): string {
  return games
    .map((g) => {
      const d = g.discount_percent ?? 0
      const oferta = d > 0 ? ` | OFERTA -${d}% (final $${finalPrice(g.price, d)})` : ''
      const stock = (g.stock ?? 0) > 0 ? 'disponible' : 'AGOTADO'
      return `- slug:${g.slug} | ${g.title} | ${g.genre ?? 'varios'} | ${g.platform ?? 'multi'} | $${Number(g.price).toFixed(2)}${oferta} | ${stock}`
    })
    .join('\n')
}

export async function askAssistant(
  message: string,
  history: ChatTurn[] = [],
): Promise<AssistantResult> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(503, 'El asistente de IA no está configurado en el servidor.', 'AI_NOT_CONFIGURED')
  }

  const games = await fetchCatalog()

  const contents = [
    { role: 'user', parts: [{ text: `CATÁLOGO ACTUAL DE BOSSTORE:\n${catalogToText(games)}` }] },
    { role: 'model', parts: [{ text: '{"reply":"Entendido, tengo el catálogo. ¿En qué te ayudo?","slugs":[]}' }] },
    ...history.slice(-8).map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ]

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              reply: { type: 'STRING' },
              slugs: { type: 'ARRAY', items: { type: 'STRING' } },
            },
            required: ['reply', 'slugs'],
          },
        },
      }),
      signal: AbortSignal.timeout(20_000),
    })
  } catch (err) {
    console.error('[ai] Fallo al llamar a Gemini:', err)
    throw new AppError(502, 'El asistente no está disponible en este momento. Intenta más tarde.', 'AI_UNAVAILABLE')
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error(`[ai] Gemini respondió ${res.status}:`, detail)
    if (res.status === 429) {
      throw new AppError(429, 'El asistente está saturado ahora mismo. Prueba en unos segundos.', 'AI_RATE_LIMITED')
    }
    throw new AppError(502, 'El asistente no pudo procesar tu consulta.', 'AI_ERROR')
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''

  // El modelo responde en JSON; si algo falla, degradamos con elegancia.
  let reply = ''
  let slugs: string[] = []
  try {
    const parsed = JSON.parse(raw) as { reply?: string; slugs?: string[] }
    reply = (parsed.reply ?? '').trim()
    slugs = Array.isArray(parsed.slugs) ? parsed.slugs : []
  } catch {
    reply = raw.replace(/[*_`]/g, '').trim()
  }

  if (!reply && slugs.length === 0) {
    throw new AppError(502, 'El asistente no devolvió una respuesta. Intenta reformular tu pregunta.', 'AI_EMPTY')
  }

  // Mapear los slugs elegidos a datos reales del catálogo (evita imágenes o
  // precios inventados y descarta cualquier slug que no exista).
  const bySlug = new Map(games.map((g) => [g.slug, g]))
  const cards: GameCard[] = slugs
    .map((s) => bySlug.get(s))
    .filter((g): g is GameRow => !!g)
    .slice(0, 6)
    .map((g) => {
      const d = g.discount_percent ?? 0
      return {
        slug: g.slug,
        title: g.title,
        cover_url: g.cover_url,
        price: Number(g.price),
        discount_percent: d,
        final_price: finalPrice(g.price, d),
        genre: g.genre,
        platform: g.platform,
      }
    })

  return { answer: reply || 'Aquí tienes algunas opciones:', games: cards }
}
