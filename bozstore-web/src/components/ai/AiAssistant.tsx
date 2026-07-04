'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Sparkles, X, Send, Loader2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

type GameCard = {
  slug: string
  title: string
  cover_url: string | null
  price: number
  discount_percent: number
  final_price: number
  genre: string | null
  platform: string | null
}

type Turn = { role: 'user' | 'model'; text: string; games?: GameCard[] }

const SUGGESTIONS = [
  'Los juegos más baratos',
  '¿Qué hay en oferta?',
  'Recomiéndame un juego de acción',
  'Juegos para PC menos de $20',
]

function money(n: number) {
  return `$${n.toFixed(2)}`
}

function GameMiniCard({ g, onClick }: { g: GameCard; onClick: () => void }) {
  const hasDiscount = g.discount_percent > 0
  return (
    <Link
      href={`/games/${g.slug}`}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 transition-colors hover:border-red-500 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-500"
    >
      <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
        {g.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.cover_url} alt={g.title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-podium text-lg text-zinc-300 dark:text-white/20">
            {g.title.slice(0, 2)}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute left-0 top-0 bg-red-600 px-1 py-0.5 font-inter text-[9px] font-bold text-white">
            -{g.discount_percent}%
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-inter text-sm font-semibold text-zinc-900 dark:text-white">
          {g.title}
        </span>
        {(g.genre || g.platform) && (
          <span className="block truncate font-inter text-[11px] text-zinc-400 dark:text-white/40">
            {[g.genre, g.platform].filter(Boolean).join(' · ')}
          </span>
        )}
        <span className="mt-0.5 flex items-baseline gap-1.5">
          {hasDiscount && (
            <span className="font-inter text-[11px] text-zinc-400 line-through dark:text-white/30">
              {money(g.price)}
            </span>
          )}
          <span className="font-inter text-sm font-bold text-red-600 dark:text-red-400">
            {money(g.final_price)}
          </span>
        </span>
      </span>
    </Link>
  )
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || loading) return

    const history = turns.map((t) => ({ role: t.role, text: t.text }))
    setTurns((t) => [...t, { role: 'user', text: message }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      })
      const json = (await res.json().catch(() => null)) as
        | { data?: { answer?: string; games?: GameCard[] }; error?: { message?: string } }
        | null
      if (!res.ok) {
        setTurns((t) => [
          ...t,
          { role: 'model', text: json?.error?.message ?? 'No pude responder ahora mismo. Intenta de nuevo.' },
        ])
      } else {
        setTurns((t) => [
          ...t,
          { role: 'model', text: json?.data?.answer ?? '…', games: json?.data?.games ?? [] },
        ])
      }
    } catch {
      setTurns((t) => [
        ...t,
        { role: 'model', text: 'No pude conectar con el asistente. Revisa tu conexión.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Asistente IA"
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-5 z-[60] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-zinc-950 ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
        style={{ height: 'min(34rem, calc(100vh - 8rem))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-zinc-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-podium text-lg uppercase leading-none tracking-wide text-zinc-900 dark:text-white">
              Boz · Asistente
            </p>
            <p className="mt-0.5 font-inter text-[11px] text-zinc-400 dark:text-white/40">
              Pregúntame por juegos, precios y ofertas
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="ml-auto text-zinc-400 transition-colors hover:text-zinc-700 dark:text-white/40 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mensajes */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {turns.length === 0 && (
            <div className="pt-2">
              <p className="mb-3 font-inter text-sm text-zinc-500 dark:text-white/50">
                ¡Hola! Soy Boz 👾 Te ayudo a encontrar tu próximo juego. Prueba con:
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 font-inter text-xs text-zinc-600 transition-colors hover:border-red-500 hover:text-red-500 dark:border-white/15 dark:text-white/60 dark:hover:border-red-500 dark:hover:text-red-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) => (
            <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'space-y-2'}>
              <div className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 font-inter text-sm leading-relaxed ${
                    t.role === 'user'
                      ? 'rounded-br-sm bg-red-600 text-white'
                      : 'rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-white/10 dark:text-white/90'
                  }`}
                >
                  {t.text}
                </div>
              </div>

              {/* Tarjetas de juegos recomendados */}
              {t.role === 'model' && t.games && t.games.length > 0 && (
                <div className="space-y-2">
                  {t.games.map((g) => (
                    <GameMiniCard key={g.slug} g={g} onClick={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-2.5 text-zinc-500 dark:bg-white/10 dark:text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-inter text-sm">Pensando…</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-white/10"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder="Escribe tu pregunta…"
            className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-inter text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-red-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30 dark:focus:border-red-500/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Enviar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  )
}
