'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import type { Game } from '@/types/game'
import { finalPrice, formatPrice } from '@/lib/pricing'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

/**
 * Buscador con resultados en vivo (dropdown) mientras escribes.
 * - Enter o "Ver todos" → /games?q=...
 * - Click en un resultado → ficha del juego
 * Cada instancia tiene su propio estado, así que no hay conflictos de refs.
 */
export default function SearchBox({
  className = '',
  onNavigate,
  autoFocus = false,
}: {
  className?: string
  onNavigate?: () => void
  autoFocus?: boolean
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Game[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Búsqueda en vivo con debounce (250 ms)
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_URL}/games?q=${encodeURIComponent(term)}&limit=6`,
          { signal: ctrl.signal },
        )
        const json = (await res.json()) as { data?: Game[] }
        setResults(json.data ?? [])
        setOpen(true)
      } catch {
        /* petición abortada o error de red: se ignora */
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [q])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const seeAll = () => {
    const term = q.trim()
    setOpen(false)
    onNavigate?.()
    router.push(term ? `/games?q=${encodeURIComponent(term)}` : '/games')
  }

  const goToGame = (slug: string) => {
    setOpen(false)
    setQ('')
    onNavigate?.()
    router.push(`/games/${slug}`)
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); seeAll() }}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-white/30" />
          <input
            /* eslint-disable-next-line jsx-a11y/no-autofocus */
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (results.length) setOpen(true) }}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
            type="text"
            placeholder="Buscar juegos..."
            className="w-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-8 font-inter text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-red-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30 dark:focus:border-red-500/40"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); setResults([]); setOpen(false) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-700 dark:text-white/30 dark:hover:text-white/60"
              aria-label="Limpiar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-auto border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 font-inter text-xs text-zinc-400 dark:text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center font-inter text-xs text-zinc-400 dark:text-white/40">
              Sin resultados para &ldquo;{q.trim()}&rdquo;.
            </div>
          ) : (
            <>
              <ul>
                {results.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => goToGame(g.slug)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                    >
                      <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {g.cover_url && (
                          <Image src={g.cover_url} alt="" fill sizes="36px" className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-inter text-sm font-medium text-zinc-900 dark:text-white">
                          {g.title}
                        </span>
                        {g.genre && (
                          <span className="block truncate font-inter text-[11px] text-zinc-400 dark:text-white/40">
                            {g.genre}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-inter text-sm font-bold text-zinc-900 dark:text-white">
                        {formatPrice(finalPrice(g))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={seeAll}
                className="block w-full border-t border-zinc-200 px-4 py-2.5 text-center font-inter text-[11px] uppercase tracking-widest text-red-600 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                Ver todos los resultados
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
