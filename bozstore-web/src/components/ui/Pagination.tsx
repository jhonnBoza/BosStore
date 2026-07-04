'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Paginador dirigido por URL (?page=N). Conserva el resto de search params.
 * Muestra ventana de páginas con elipsis cuando hay muchas.
 */
export default function Pagination({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p <= 1) params.delete('page')
    else params.set('page', String(p))
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  // Ventana de páginas: 1 … (p-1) p (p+1) … N
  const pages: (number | '…')[] = []
  const window = 1
  let last = 0
  for (let i = 1; i <= totalPages; i++) {
    const show = i === 1 || i === totalPages || Math.abs(i - page) <= window
    if (show) {
      if (last && i - last > 1) pages.push('…')
      pages.push(i)
      last = i
    }
  }

  const btnBase =
    'flex h-9 min-w-9 items-center justify-center border px-2 font-inter text-xs transition-colors'
  const btnIdle =
    'border-zinc-300 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 dark:border-white/15 dark:bg-zinc-900 dark:text-white/50 dark:hover:border-white/30 dark:hover:text-white'
  const btnActive = 'border-red-600 bg-red-600 font-bold text-white'
  const btnDisabled =
    'cursor-not-allowed border-zinc-200 bg-white text-zinc-300 dark:border-white/5 dark:bg-zinc-900 dark:text-white/15'

  return (
    <nav
      aria-label="Paginación"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${btnBase} ${page <= 1 ? btnDisabled : btnIdle}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`gap-${i}`}
            className="flex h-9 min-w-9 items-center justify-center font-inter text-xs text-zinc-400 dark:text-white/30"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${btnBase} ${p === page ? btnActive : btnIdle}`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${btnBase} ${page >= totalPages ? btnDisabled : btnIdle}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
