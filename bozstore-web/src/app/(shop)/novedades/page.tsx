import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, Sparkles } from 'lucide-react'
import type { Game } from '@/types/game'
import GameCard from '@/components/shop/GameCard'
import AddToCartButton from '@/components/cart/AddToCartButton'
import Pagination from '@/components/ui/Pagination'
import { finalPrice, formatPrice, hasDiscount } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'Novedades — BosStore',
  description: 'Los últimos lanzamientos y novedades de videojuegos.',
}

const NEW_DAYS = 30
const PER_PAGE = 15

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

/** Fecha de referencia del juego: lanzamiento real o, si falta, alta en la tienda. */
function refDate(g: Game): string {
  return g.release_date ?? g.created_at ?? ''
}

function isNewRelease(g: Game): boolean {
  const d = refDate(g)
  if (!d) return false
  const days = (Date.now() - new Date(d).getTime()) / 86_400_000
  return days >= 0 && days <= NEW_DAYS
}

function formatRelease(d?: string): string | null {
  if (!d) return null
  return new Date(d).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NovedadesPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await props.searchParams
  const games = await fetchGames()

  // Más recientes primero por fecha de lanzamiento (fallback: fecha de alta)
  const sorted = [...games].sort((a, b) => refDate(b).localeCompare(refDate(a)))
  const [latest, ...rest] = sorted

  // Paginación del listado (el hero queda fijo en todas las páginas)
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE))
  const rawPage    = Number(pageParam ?? '1')
  const page       = Math.min(Math.max(Number.isFinite(rawPage) ? Math.floor(rawPage) : 1, 1), totalPages)
  const visible    = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Agrupar la página actual por año de lanzamiento
  const byYear = new Map<string, Game[]>()
  for (const g of visible) {
    const year = refDate(g) ? String(new Date(refDate(g)).getFullYear()) : 'Sin fecha'
    byYear.set(year, [...(byYear.get(year) ?? []), g])
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div className="mb-10">
        <p className="mb-2 flex items-center gap-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
          <Sparkles className="h-3.5 w-3.5" />
          Últimos lanzamientos
        </p>
        <h1 className="font-podium text-5xl uppercase leading-none tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
          Novedades
        </h1>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="select-none font-podium text-8xl uppercase text-zinc-200 dark:text-white/5">
            Sin juegos
          </span>
          <p className="mt-6 font-inter text-sm text-zinc-400 dark:text-white/40">
            El catálogo está vacío. Vuelve pronto.
          </p>
        </div>
      ) : (
        <>
          {/* DESTACADO — el lanzamiento más reciente */}
          {latest && (
            <section className="group relative mb-14 overflow-hidden border border-zinc-200 dark:border-white/10">
              <div className="absolute inset-0">
                {(latest.banner_url ?? latest.cover_url) && (
                  <Image
                    src={latest.banner_url ?? latest.cover_url!}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-40 transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
              </div>

              <div className="relative flex flex-col gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:gap-14">
                {latest.cover_url && (
                  <Link
                    href={`/games/${latest.slug}`}
                    className="relative hidden aspect-[3/4] w-44 shrink-0 overflow-hidden border border-white/10 shadow-2xl sm:block lg:w-52"
                  >
                    <Image
                      src={latest.cover_url}
                      alt={latest.title}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  </Link>
                )}

                <div className="max-w-xl">
                  <p className="mb-3 inline-flex items-center gap-2 bg-emerald-600 px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-widest text-white">
                    <Sparkles className="h-3 w-3" />
                    Lo más reciente
                  </p>
                  <Link href={`/games/${latest.slug}`}>
                    <h2 className="font-podium text-4xl uppercase leading-none tracking-tight text-white transition-colors hover:text-red-400 sm:text-5xl">
                      {latest.title}
                    </h2>
                  </Link>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                    {formatRelease(latest.release_date) && (
                      <span className="inline-flex items-center gap-1.5 font-inter text-xs text-white/45">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatRelease(latest.release_date)}
                      </span>
                    )}
                    {latest.developer && (
                      <span className="font-inter text-xs uppercase tracking-widest text-white/35">
                        {latest.developer}
                      </span>
                    )}
                  </div>

                  {latest.description && (
                    <p className="mt-4 line-clamp-2 font-inter text-sm leading-relaxed text-white/50">
                      {latest.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-5">
                    <div>
                      {hasDiscount(latest) && (
                        <span className="block font-inter text-sm text-white/35 line-through">
                          {formatPrice(latest.price)}
                        </span>
                      )}
                      <span className="font-podium text-3xl text-white">
                        {formatPrice(finalPrice(latest))}
                      </span>
                    </div>
                    <div className="w-56">
                      <AddToCartButton game={latest} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Línea de tiempo por año */}
          {Array.from(byYear.entries()).map(([year, list]) => (
            <section key={year} className="mb-12">
              <div className="mb-6 flex items-baseline gap-4">
                <h2 className="font-podium text-3xl uppercase tracking-tight text-zinc-900 dark:text-white">
                  {year}
                </h2>
                <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/30">
                  {list.length} {list.length === 1 ? 'lanzamiento' : 'lanzamientos'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {list.map((game) => (
                  <GameCard key={game.id} game={game} isNew={isNewRelease(game)} />
                ))}
              </div>
            </section>
          ))}

          <Suspense>
            <Pagination page={page} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  )
}
