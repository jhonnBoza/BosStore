import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { Game } from '@/types/game'
import GameGrid from '@/components/shop/GameGrid'

export const metadata: Metadata = {
  title: 'Catálogo — BosStore',
  description: 'Explora nuestro catálogo de videojuegos.',
}

async function fetchGames(q?: string): Promise<Game[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  const url  = new URL(`${base}/games`)
  if (q) url.searchParams.set('q', q)

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = (await res.json()) as { success: boolean; data: Game[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function GamesPage(props: {
  searchParams: Promise<{ q?: string; genre?: string; platform?: string }>
}) {
  const { q } = await props.searchParams
  const games  = await fetchGames(q)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      {/* Encabezado */}
      <div className="mb-10">
        <h1 className="font-podium text-5xl uppercase leading-none tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
          Catálogo
        </h1>
        {q && (
          <p className="mt-3 font-inter text-sm text-zinc-500 dark:text-white/50">
            Resultados para:{' '}
            <span className="text-zinc-900 dark:text-white">&ldquo;{q}&rdquo;</span>
          </p>
        )}
      </div>

      {/* GameGrid necesita Suspense porque usa useSearchParams */}
      <Suspense fallback={<GridSkeleton />}>
        <GameGrid games={games} />
      </Suspense>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse border border-zinc-200 bg-white dark:border-white/5 dark:bg-zinc-900">
          <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-800" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-2 w-1/2 bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-4 h-7 bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  )
}
