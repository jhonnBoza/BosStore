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
}

function finalPrice(g: GameRow): number {
  const d = g.discount_percent ?? 0
  return Math.round(Number(g.price) * (1 - d / 100) * 100) / 100
}

// Construye un resumen compacto del catálogo para dárselo al modelo como
// contexto. Así la IA responde SOLO con juegos reales (sin inventar).
async function buildCatalogContext(): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('title, slug, price, discount_percent, genre, platform, stock')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  const games = (data ?? []) as GameRow[]

  const lines = games.map((g) => {
    const d = g.discount_percent ?? 0
    const oferta = d > 0 ? ` | OFERTA -${d}% (final $${finalPrice(g)})` : ''
    const stock = (g.stock ?? 0) > 0 ? `${g.stock} en stock` : 'AGOTADO'
    return `- ${g.title} | ${g.genre ?? 'varios'} | ${g.platform ?? 'multi'} | $${Number(g.price).toFixed(2)}${oferta} | ${stock}`
  })

  return lines.join('\n')
}

const SYSTEM_PROMPT = `Eres "Boz", el asistente virtual de BosStore, una tienda de videojuegos digitales.
Tu trabajo es ayudar a los clientes a encontrar juegos usando ÚNICAMENTE el catálogo que se te proporciona más abajo.

Reglas:
- Responde siempre en español, de forma breve, amable y directa.
- Los precios están en dólares (USD). Cuando un juego tiene OFERTA, menciona el precio final.
- Cuando te pidan "los más baratos", "en oferta/descuento", "por género", "para PC", etc., filtra y ordena la lista tú mismo.
- Muestra los juegos como una lista corta con su precio. No más de 6 a menos que pidan más.
- NUNCA inventes juegos, precios ni datos que no estén en el catálogo.
- Si preguntan por algo que no está en el catálogo, dilo con honestidad y sugiere alternativas parecidas que sí existan.
- Si preguntan algo no relacionado con la tienda de videojuegos, responde con amabilidad que solo puedes ayudar con el catálogo de BosStore.`

export async function askAssistant(
  message: string,
  history: ChatTurn[] = [],
): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(503, 'El asistente de IA no está configurado en el servidor.', 'AI_NOT_CONFIGURED')
  }

  const catalog = await buildCatalogContext()

  const contents = [
    // El catálogo va como primer turno de contexto.
    { role: 'user', parts: [{ text: `CATÁLOGO ACTUAL DE BOSSTORE:\n${catalog}` }] },
    { role: 'model', parts: [{ text: 'Entendido, tengo el catálogo. ¿En qué te ayudo?' }] },
    // Historial previo de la conversación (máximo lo que mande el frontend).
    ...history.slice(-8).map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    // Pregunta actual del usuario.
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
        generationConfig: { temperature: 0.4, maxOutputTokens: 700 },
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
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? ''

  if (!text.trim()) {
    throw new AppError(502, 'El asistente no devolvió una respuesta. Intenta reformular tu pregunta.', 'AI_EMPTY')
  }

  return text.trim()
}
