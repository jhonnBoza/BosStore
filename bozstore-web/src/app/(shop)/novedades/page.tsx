import { Suspense } from 'react'
import type { Metadata } from 'next'
import type { Game } from '@/types/game'
import GameGrid from '@/components/shop/GameGrid'

export const metadata: Metadata = {
  title: 'Novedades — BosStore',
  description: 'Los últimos lanzamientos y novedades de videojuegos.',
}

async function fetchGames(): Promise<Game[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  try {
    const res = await fetch(`${base}/games`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = (await res.json()) as { success: boolean; data: Game[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function NovedadesPage() {
  const games = await fetchGames()
  // Más recientes primero (mayor id = más nuevo)
  const sorted = [...games].sort((a, b) => Number(b.id) - Number(a.id))

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div className="mb-10">
        <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
          Últimos lanzamientos
        </p>
        <h1 className="font-podium text-5xl uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
          Novedades
        </h1>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <GameGrid games={sorted} />
      </Suspense>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse border border-white/5 bg-zinc-900">
          <div className="aspect-[3/4] bg-zinc-800" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-zinc-800 rounded" />
            <div className="h-3 w-1/2 bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
