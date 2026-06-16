'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Tag } from 'lucide-react'
import type { Game } from '@/types/game'
import { hasDiscount } from '@/lib/pricing'
import GameCard from './GameCard'

const ALL = 'all'

export default function GameGrid({ games }: { games: Game[] }) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const activeGenre    = searchParams.get('genre')    ?? ALL
  const activePlatform = searchParams.get('platform') ?? ALL
  const activeSale     = searchParams.get('sale') === 'true'

  // Extraer opciones únicas de los datos recibidos
  const genres    = [ALL, ...Array.from(new Set(games.map(g => g.genre).filter((v): v is string => !!v)))]
  const platforms = [ALL, ...Array.from(new Set(games.map(g => g.platform).filter((v): v is string => !!v)))]
  const anySale   = games.some(g => hasDiscount(g))

  // Filtrado client-side por género / plataforma / ofertas (la búsqueda por texto se hace en el servidor)
  const filtered = games.filter(g => {
    if (activeGenre    !== ALL && g.genre    !== activeGenre)    return false
    if (activePlatform !== ALL && g.platform !== activePlatform) return false
    if (activeSale && !hasDiscount(g))                           return false
    return true
  })

  const toggleSale = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeSale) params.delete('sale')
    else params.set('sale', 'true')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const setFilter = (key: 'genre' | 'platform', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === ALL) params.delete(key)
    else params.set(key, value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('genre')
    params.delete('platform')
    params.delete('sale')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const showFilters = genres.length > 1 || platforms.length > 1 || anySale

  return (
    <div>
      {/* Barra de filtros */}
      {showFilters && (
        <div className="mb-8 flex flex-col gap-3">
          {anySale && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-white/40">
                Ofertas
              </span>
              <button
                onClick={toggleSale}
                className={`inline-flex items-center gap-1.5 border px-3 py-1 font-inter text-[10px] uppercase tracking-widest transition-colors ${
                  activeSale
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                <Tag className="h-3 w-3" />
                Solo ofertas
              </button>
            </div>
          )}
          {genres.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-white/40">
                Género
              </span>
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => setFilter('genre', genre)}
                  className={`border px-3 py-1 font-inter text-[10px] uppercase tracking-widest transition-colors ${
                    activeGenre === genre
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {genre === ALL ? 'Todos' : genre}
                </button>
              ))}
            </div>
          )}

          {platforms.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-inter text-[10px] uppercase tracking-widest text-white/40">
                Plataforma
              </span>
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setFilter('platform', platform)}
                  className={`border px-3 py-1 font-inter text-[10px] uppercase tracking-widest transition-colors ${
                    activePlatform === platform
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {platform === ALL ? 'Todas' : platform}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contador */}
      <p className="mb-6 font-inter text-xs uppercase tracking-widest text-white/40">
        {filtered.length} {filtered.length === 1 ? 'juego' : 'juegos'}
      </p>

      {/* Grid o estado vacío */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="select-none font-podium text-8xl uppercase text-white/5">
            Sin juegos
          </span>
          <p className="mt-6 font-inter text-sm text-white/40">
            {games.length > 0
              ? 'Ningún juego coincide con los filtros activos.'
              : 'El catálogo está vacío. Agrega juegos desde el panel admin.'}
          </p>
          {games.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-6 border border-white/15 px-6 py-2.5 font-inter text-[10px] uppercase tracking-widest text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
