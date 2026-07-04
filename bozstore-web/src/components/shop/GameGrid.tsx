'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, ChevronDown, SlidersHorizontal, Tag, X } from 'lucide-react'
import type { Game } from '@/types/game'
import { finalPrice, formatPrice, hasDiscount } from '@/lib/pricing'
import AddToCartButton from '@/components/cart/AddToCartButton'
import WishlistButton from '@/components/wishlist/WishlistButton'
import Pagination from '@/components/ui/Pagination'
import GameCard from './GameCard'

const ALL = 'all'
const PER_PAGE = 6

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Relevancia' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'name',       label: 'Nombre A-Z' },
  { value: 'discount',   label: 'Mayor descuento' },
  { value: 'newest',     label: 'Mas nuevos' },
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

function ToolbarSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <label className="group relative flex h-[54px] w-full cursor-pointer items-center gap-3 border border-zinc-200 bg-white px-4 shadow-sm shadow-zinc-200/40 transition-colors hover:border-zinc-400 focus-within:border-red-500 dark:border-white/10 dark:bg-zinc-950 dark:shadow-none dark:hover:border-white/25 dark:focus-within:border-red-500">
      <span className="pointer-events-none shrink-0 font-inter text-[10px] uppercase leading-none tracking-[0.22em] text-zinc-400 dark:text-white/35">
        {label}
      </span>
      <span className="relative min-w-0 flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-full w-full appearance-none truncate bg-transparent py-4 pl-0 pr-7 font-inter text-xs font-bold uppercase leading-none tracking-wider text-zinc-900 outline-none disabled:cursor-wait disabled:opacity-70 dark:text-white"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500 transition-transform group-focus-within:rotate-180" />
      </span>
    </label>
  )
}

export default function GameGrid({ games }: { games: Game[] }) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const [isPending, startTransition] = useTransition()

  const activeGenre    = searchParams.get('genre')    ?? ALL
  const activePlatform = searchParams.get('platform') ?? ALL
  const activeSale     = searchParams.get('sale') === 'true'
  const activeSort     = (searchParams.get('sort') ?? 'relevance') as SortValue

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

  const filtered = sortGames(
    games.filter(g => {
      if (activeGenre    !== ALL && g.genre    !== activeGenre)    return false
      if (activePlatform !== ALL && g.platform !== activePlatform) return false
      if (activeSale && !hasDiscount(g))                           return false
      return true
    }),
    activeSort,
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const rawPage    = Number(searchParams.get('page') ?? '1')
  const page       = Math.min(Math.max(Number.isFinite(rawPage) ? Math.floor(rawPage) : 1, 1), totalPages)
  const visible    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const featured   = visible[0] ?? filtered[0] ?? null

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === ALL || value === 'relevance') params.delete(key)
    else params.set(key, value)
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    ;['genre', 'platform', 'sale', 'sort', 'page'].forEach((k) => params.delete(k))
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const hasActiveFilters =
    activeGenre !== ALL || activePlatform !== ALL || activeSale || activeSort !== 'relevance'

  return (
    <div className="grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
      <aside className="border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-950 lg:sticky lg:top-28">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-red-500" />
            <h2 className="font-podium text-xl uppercase tracking-wide text-zinc-900 dark:text-white">
              Filtros
            </h2>
          </div>
          <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/35">
            {filtered.length}
          </span>
        </div>

        <div className="space-y-3">
          {genreOptions.length > 2 && (
            <ToolbarSelect
              label="Genero"
              value={activeGenre}
              options={genreOptions}
              onChange={(v) => setParam('genre', v)}
              disabled={isPending}
            />
          )}

          {platformOptions.length > 2 && (
            <ToolbarSelect
              label="Plataforma"
              value={activePlatform}
              options={platformOptions}
              onChange={(v) => setParam('platform', v)}
              disabled={isPending}
            />
          )}

          <ToolbarSelect
            label="Ordenar"
            value={activeSort}
            options={[...SORT_OPTIONS]}
            onChange={(v) => setParam('sort', v)}
            disabled={isPending}
          />

          {anySale && (
            <button
              type="button"
              onClick={() => setParam('sale', activeSale ? null : 'true')}
              aria-pressed={activeSale}
              disabled={isPending}
              className={`flex h-[54px] w-full items-center gap-2 border px-4 font-inter text-[10px] uppercase tracking-widest transition-colors disabled:cursor-wait disabled:opacity-70 ${
                activeSale
                  ? 'border-red-500 bg-red-500/5 text-red-500 dark:bg-red-500/10'
                  : 'border-zinc-200 bg-white text-zinc-400 shadow-sm shadow-zinc-200/40 hover:border-zinc-400 hover:text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-white/35 dark:shadow-none dark:hover:border-white/25 dark:hover:text-white/70'
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
        </div>

        <div className="mt-5 border-t border-zinc-200 pt-4 dark:border-white/10">
          <p className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/35">
            {filtered.length} {filtered.length === 1 ? 'juego encontrado' : 'juegos encontrados'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-1 font-inter text-[10px] uppercase tracking-widest text-zinc-500 transition-colors hover:text-red-500 dark:text-white/45 dark:hover:text-red-400"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      <main className="min-w-0">
        {filtered.length > 0 ? (
          <>
            {featured && (
              <section className="relative mb-6 overflow-hidden border border-zinc-200 bg-zinc-950 text-white dark:border-white/10">
                {(featured.banner_url ?? featured.cover_url) && (
                  <Image
                    src={featured.banner_url ?? featured.cover_url!}
                    alt=""
                    fill
                    sizes="(max-width:1024px) 100vw, 900px"
                    className="object-cover opacity-35"
                    aria-hidden
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
                <div className="relative grid min-h-[340px] gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1fr)_240px] xl:p-8">
                  <div className="flex min-w-0 flex-col justify-end">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {featured.genre && (
                        <span className="border border-white/15 bg-black/30 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-white/60 backdrop-blur">
                          {featured.genre}
                        </span>
                      )}
                      {featured.platform && (
                        <span className="border border-white/15 bg-black/30 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-white/60 backdrop-blur">
                          {featured.platform}
                        </span>
                      )}
                    </div>
                    <h2 className="max-w-2xl font-podium text-4xl uppercase leading-[0.9] tracking-tight sm:text-5xl lg:text-6xl">
                      {featured.title}
                    </h2>
                    {featured.description && (
                      <p className="mt-4 max-w-2xl line-clamp-2 font-inter text-sm leading-relaxed text-white/55">
                        {featured.description}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-4">
                      <div>
                        {hasDiscount(featured) && (
                          <p className="font-inter text-sm text-white/35 line-through">
                            {formatPrice(featured.price)}
                          </p>
                        )}
                        <p className="font-inter text-3xl font-bold text-white">
                          {formatPrice(finalPrice(featured))}
                        </p>
                      </div>
                      <Link
                        href={`/games/${featured.slug}`}
                        className="group inline-flex items-center gap-2 border border-white/20 px-5 py-3 font-inter text-[10px] uppercase tracking-widest text-white/70 transition-colors hover:border-red-500 hover:text-white"
                      >
                        Ver ficha
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="hidden flex-col justify-end gap-3 xl:flex">
                    <AddToCartButton game={featured} />
                    <WishlistButton slug={featured.slug} variant="full" />
                  </div>
                </div>
              </section>
            )}

            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-podium text-2xl uppercase tracking-wide text-zinc-900 dark:text-white">
                Juegos
              </h3>
              <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/35">
                Pagina {page} de {totalPages}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center border border-zinc-200 py-28 text-center dark:border-white/10">
            <span className="select-none font-podium text-8xl uppercase text-zinc-200 dark:text-white/5">
              Sin juegos
            </span>
            <p className="mt-6 font-inter text-sm text-zinc-400 dark:text-white/40">
              {games.length > 0
                ? 'Ningun juego coincide con los filtros activos.'
                : 'El catalogo esta vacio. Agrega juegos desde el panel admin.'}
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
      </main>
    </div>
  )
}
