'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ExternalLink, Search } from 'lucide-react'
import type { Game } from '@/types/game'
import { hasDiscount, finalPrice, formatPrice } from '@/lib/pricing'
import DeleteGameButton from './DeleteGameButton'

type Filter = 'all' | 'sale' | 'low' | 'out'

export default function GamesTable({ games }: { games: Game[] }) {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return games.filter((g) => {
      const matchText =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.slug.includes(q) ||
        (g.genre ?? '').toLowerCase().includes(q) ||
        (g.platform ?? '').toLowerCase().includes(q)

      const matchFilter =
        filter === 'all' ||
        (filter === 'sale' && hasDiscount(g)) ||
        (filter === 'low'  && g.stock > 0 && g.stock <= 5) ||
        (filter === 'out'  && g.stock === 0)

      return matchText && matchFilter
    })
  }, [games, query, filter])

  const counts = useMemo(() => ({
    sale: games.filter((g) => hasDiscount(g)).length,
    low:  games.filter((g) => g.stock > 0 && g.stock <= 5).length,
    out:  games.filter((g) => g.stock === 0).length,
  }), [games])

  const FILTERS: { key: Filter; label: string; count?: number }[] = [
    { key: 'all',  label: 'Todos',       count: games.length },
    { key: 'sale', label: 'En oferta',   count: counts.sale  },
    { key: 'low',  label: 'Stock bajo',  count: counts.low   },
    { key: 'out',  label: 'Sin stock',   count: counts.out   },
  ]

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, slug, género…"
            className="w-full border border-white/10 bg-zinc-900 py-2 pl-9 pr-4 font-inter text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-white/20 sm:w-80"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 border px-3 py-1.5 font-inter text-[10px] uppercase tracking-widest transition-colors ${
                filter === key
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {label}
              {count !== undefined && (
                <span className={`font-inter text-[9px] ${filter === key ? 'text-white/70' : 'text-white/25'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 font-inter text-[10px] uppercase tracking-widest text-white/20">
        {filtered.length} {filtered.length === 1 ? 'juego' : 'juegos'}
        {query && ` · "${query}"`}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-white/5 py-20 text-center">
          <span className="select-none font-podium text-8xl uppercase text-white/[0.04]">0</span>
          <p className="mt-4 font-inter text-sm text-white/25">
            {query
              ? `Sin resultados para "${query}".`
              : 'No hay juegos con ese filtro.'}
          </p>
          {(query || filter !== 'all') && (
            <button
              onClick={() => { setQuery(''); setFilter('all') }}
              className="mt-5 border border-white/10 px-5 py-2 font-inter text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:border-white/20 hover:text-white/50"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="border border-white/10">
          {/* Table header — desktop only */}
          <div className="hidden grid-cols-[36px_2.5fr_1fr_72px_1fr_auto] gap-4 border-b border-white/10 px-5 py-3 sm:grid">
            {['', 'Juego', 'Precio', 'Stock', 'Género / Plataforma', 'Acciones'].map((h, i) => (
              <span key={i} className="font-inter text-[9px] uppercase tracking-widest text-white/20">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((game) => {
            const onSale = hasDiscount(game)
            const price  = finalPrice(game)
            const stockColor =
              game.stock === 0 ? 'text-red-500'
              : game.stock <= 5 ? 'text-amber-400'
              : 'text-emerald-400'

            return (
              <div
                key={game.id}
                className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 last:border-b-0 hover:bg-white/[0.02] sm:grid sm:grid-cols-[36px_2.5fr_1fr_72px_1fr_auto] sm:items-center sm:gap-4 sm:py-3"
              >
                {/* Cover thumb */}
                <div className="hidden h-12 w-9 shrink-0 overflow-hidden border border-white/5 bg-zinc-800 sm:block">
                  {game.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={game.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-inter text-[7px] font-bold uppercase text-white/15">
                      {game.title.slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Title + badges */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-inter text-sm font-medium text-white/80">
                      {game.title}
                    </p>
                    {onSale && (
                      <span className="shrink-0 bg-red-600/20 px-1.5 py-0.5 font-inter text-[8px] font-bold uppercase leading-none text-red-400">
                        -{game.discount_percent}%
                      </span>
                    )}
                    {game.banner_url && (
                      <span className="shrink-0 border border-white/10 px-1.5 py-0.5 font-inter text-[7px] uppercase leading-none tracking-wider text-white/20">
                        banner
                      </span>
                    )}
                  </div>
                  <p className="truncate font-inter text-[10px] text-white/25">{game.slug}</p>
                </div>

                {/* Price */}
                <div className="flex flex-col">
                  {onSale && (
                    <span className="font-inter text-[10px] text-white/25 line-through">
                      {formatPrice(game.price)}
                    </span>
                  )}
                  <span className="font-inter text-sm text-white/60">
                    {formatPrice(price)}
                  </span>
                </div>

                {/* Stock */}
                <span className={`font-inter text-sm font-semibold ${stockColor}`}>
                  {game.stock === 0 ? 'Agotado' : game.stock}
                </span>

                {/* Genre / Platform */}
                <div className="flex flex-wrap gap-1.5">
                  {game.genre && (
                    <span className="border border-white/10 px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest text-white/30">
                      {game.genre}
                    </span>
                  )}
                  {game.platform && (
                    <span className="border border-white/10 px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest text-white/30">
                      {game.platform}
                    </span>
                  )}
                  {!game.genre && !game.platform && (
                    <span className="font-inter text-[10px] text-white/15">—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/games/${game.slug}`}
                    target="_blank"
                    className="text-white/20 transition-colors hover:text-white/50"
                    title="Ver en tienda"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/admin/games/${game.slug}/edit`}
                    className="font-inter text-[10px] uppercase tracking-widest text-white/35 transition-colors hover:text-white/70"
                  >
                    Editar
                  </Link>
                  <DeleteGameButton slug={game.slug} title={game.title} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
