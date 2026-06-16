import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Game } from '@/types/game'
import { hasDiscount } from '@/lib/pricing'
import GamesTable from '@/components/admin/GamesTable'

export const metadata: Metadata = { title: 'Juegos — Admin BosStore' }

async function fetchGames(): Promise<Game[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  try {
    const res = await fetch(`${base}/games`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Game[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function AdminGamesPage() {
  const games = await fetchGames()

  const inStock  = games.filter((g) => g.stock > 0).length
  const onSale   = games.filter((g) => hasDiscount(g)).length
  const outStock = games.filter((g) => g.stock === 0).length

  return (
    <div className="px-6 py-8 sm:px-8">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-podium text-3xl uppercase tracking-tight text-white">Juegos</h1>
          <div className="mt-1.5 flex flex-wrap gap-4">
            <span className="font-inter text-[10px] uppercase tracking-widest text-white/30">
              {games.length} total
            </span>
            {inStock > 0 && (
              <span className="font-inter text-[10px] uppercase tracking-widest text-emerald-400/60">
                {inStock} disponibles
              </span>
            )}
            {outStock > 0 && (
              <span className="font-inter text-[10px] uppercase tracking-widest text-red-400/60">
                {outStock} agotados
              </span>
            )}
            {onSale > 0 && (
              <span className="font-inter text-[10px] uppercase tracking-widest text-red-400/60">
                {onSale} en oferta
              </span>
            )}
          </div>
        </div>
        <Link
          href="/admin/games/new"
          className="flex items-center gap-2 bg-red-600 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo juego
        </Link>
      </div>

      <Suspense fallback={
        <div className="border border-white/5 py-16 text-center">
          <p className="font-inter text-sm text-white/25">Cargando juegos…</p>
        </div>
      }>
        <GamesTable games={games} />
      </Suspense>
    </div>
  )
}
