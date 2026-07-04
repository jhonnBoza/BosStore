'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Tag, X } from 'lucide-react'
import type { Game } from '@/types/game'
import { finalPrice, hasDiscount } from '@/lib/pricing'
import Pagination from '@/components/ui/Pagination'
import GameCard from './GameCard'

const ALL = 'all'
const PER_PAGE = 15

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevancia' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name',       label: 'Nombre A–Z' },
  { value: 'discount',   label: 'Mayor descuento' },
  { value: 'newest',     label: 'Más nuevos' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

function sortGames(games: Game[], sort: SortValue): Game[] {
  const sorted = [...games]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => finalPrice(a) - finalPrice(b))
    case 'price-desc':
      return sorted.sort((a, b) => finalPrice(b) - finalPrice(a))
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'es'))
    case 'discount':
      return sorted.sort(
        (a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0),
      )
    case 'newest':
      return sorted.sort((a, b) => {
        const da = a.release_date ?? a.created_at ?? ''
        const db = b.release_date ?? b.created_at ?? ''
        return db.localeCompare(da)
      })
    default:
      return sorted
  }
}

/** Select minimalista con chevron propio (appearance-none). */
function ToolbarSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center gap-2 border border-zinc-300 bg-white px-3 py-2 transition-colors hover:border-zinc-400 focus-within:border-red-500 dark:border-white/15 dark:bg-zinc-900 dark:hover:border-white/30 dark:focus-within:border-red-500">
      <span className="pointer-events-none font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/35">
        {label}
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none cursor-pointer bg-transparent py-0 pl-0 pr-6 font-inter text-xs font-semibold uppercase tracking-wider text-zinc-800 outline-none dark:text-white"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-red-500" />
      </span>
    </label>
  )
}

export default function GameGrid({ games }: { games: Game[] }) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const activeGenre    = searchParams.get('genre')    ?? ALL
  const activePlatform = searchParams.get('platform') ?? ALL
  const activeSale     = searchParams.get('sale') === 'true'
  const activeSort     = (searchParams.get('sort') ?? 'relevance') as SortValue

  // Extraer opciones únicas de los datos recibidos
  const genres    = games.map(g => g.genre).filter((v): v is string => !!v)
  const platforms = games.map(g => g.platform).filter((v): v is string => !!v)
  const genreOptions = [
    { value: ALL, label: 'Todos' },
    ...Array.from(new Set(genres)).map(g => ({ value: g, label: g })),
  ]
  const platformOptions = [
    { value: ALL, label: 'Todas' },
    ...Array.from(new Set(platforms)).map(p => ({ value: p, label: p })),
  ]
  const anySale = games.some(g => hasDiscount(g))

  // Filtrado client-side por género / plataforma / ofertas (la búsqueda por texto se hace en el servidor)
  const filtered = sortGames(
    games.filter(g => {
      if (activeGenre    !== ALL && g.genre    !== activeGenre)    return false
      if (activePlatform !== ALL && g.platform !== activePlatform) return false
      if (activeSale && !hasDiscount(g))                           return false
      return true
    }),
    activeSort,
  )

  // Paginación sobre el resultado filtrado
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const rawPage    = Number(searchParams.get('page') ?? '1')
  const page       = Math.min(Math.max(Number.isFinite(rawPage) ? Math.floor(rawPage) : 1, 1), totalPages)
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === ALL || value === 'relevance') params.delete(key)
    else params.set(key, value)
    params.delete('page') // al cambiar un filtro se vuelve a la página 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['genre', 'platform', 'sale', 'sort', 'page'].forEach((k) => params.delete(k))
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const hasActiveFilters =
    activeGenre !== ALL || activePlatform !== ALL || activeSale || activeSort !== 'relevance'

  const showToolbar =
    genreOptions.length > 2 || platformOptions.length > 2 || anySale || games.length > 1

  return (
    <div>
      {/* Toolbar: una sola línea con dropdowns + toggle + contador */}
      {showToolbar && (
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-3 border-y border-zinc-200 py-4 dark:border-white/10">
          {genreOptions.length > 2 && (
            <ToolbarSelect
              label="Género"
              value={activeGenre}
              options={genreOptions}
              onChange={(v) => setParam('genre', v)}
            />
          )}

          {platformOptions.length > 2 && (
            <ToolbarSelect
              label="Plataforma"
              value={activePlatform}
              options={platformOptions}
              onChange={(v) => setParam('platform', v)}
            />
          )}

          <ToolbarSelect
            label="Ordenar"
            value={activeSort}
            options={[...SORT_OPTIONS]}
            onChange={(v) => setParam('sort', v)}
          />

          {anySale && (
            <button
              type="button"
              onClick={() => setParam('sale', activeSale ? null : 'true')}
              aria-pressed={activeSale}
              className={`inline-flex items-center gap-2 border px-3 py-2 font-inter text-[10px] uppercase tracking-widest transition-colors ${
                activeSale
                  ? 'border-red-500 bg-red-500/5 text-red-500 dark:bg-red-500/10'
                  : 'border-zinc-300 bg-white text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 dark:border-white/15 dark:bg-zinc-900 dark:text-white/35 dark:hover:border-white/30 dark:hover:text-white/70'
              }`}
            >
              <span
                className={`relative inline-block h-3.5 w-7 shrink-0 rounded-full transition-colors ${
                  activeSale ? 'bg-red-600' : 'bg-zinc-300 dark:bg-white/15'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform ${
                    activeSale ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </span>
              <Tag className="h-3 w-3" />
              Solo ofertas
            </button>
          )}

          {/* Contador + limpiar, alineados a la derecha */}
          <div className="ml-auto flex items-center gap-4">
            <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/35">
              {filtered.length} {filtered.length === 1 ? 'juego' : 'juegos'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 font-inter text-[10px] uppercase tracking-widest text-zinc-400 transition-colors hover:text-red-500 dark:text-white/35 dark:hover:text-red-400"
              >
                <X className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid o estado vacío */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="select-none font-podium text-8xl uppercase text-zinc-200 dark:text-white/5">
            Sin juegos
          </span>
          <p className="mt-6 font-inter text-sm text-zinc-400 dark:text-white/40">
            {games.length > 0
              ? 'Ningún juego coincide con los filtros activos.'
              : 'El catálogo está vacío. Agrega juegos desde el panel admin.'}
          </p>
          {games.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-6 border border-zinc-300 px-6 py-2.5 font-inter text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-900 dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
