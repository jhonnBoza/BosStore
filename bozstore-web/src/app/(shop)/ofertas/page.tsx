import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Flame, Timer } from 'lucide-react'
import type { Game } from '@/types/game'
import GameCard from '@/components/shop/GameCard'
import AddToCartButton from '@/components/cart/AddToCartButton'
import Pagination from '@/components/ui/Pagination'
import { finalPrice, formatPrice, hasDiscount } from '@/lib/pricing'

const PER_PAGE = 15

export const metadata: Metadata = {
  title: 'Ofertas — BosStore',
  description: 'Las mejores ofertas y descuentos en videojuegos.',
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

export default async function OfertasPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await props.searchParams
  const games = await fetchGames()

  // Mejor descuento primero; el primero es el protagonista del hero
  const onSale = games
    .filter(hasDiscount)
    .sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))

  const [featured, ...rest] = onSale
  const savings = featured ? featured.price - finalPrice(featured) : 0

  // Paginación de "Más ofertas"
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE))
  const rawPage    = Number(pageParam ?? '1')
  const page       = Math.min(Math.max(Number.isFinite(rawPage) ? Math.floor(rawPage) : 1, 1), totalPages)
  const visible    = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-16">
      <div className="mb-10">
        <p className="mb-2 flex items-center gap-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
          <Flame className="h-3.5 w-3.5" />
          Descuentos activos
        </p>
        <h1 className="font-podium text-5xl uppercase leading-none tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl">
          Ofertas
        </h1>
      </div>

      {onSale.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <span className="select-none font-podium text-8xl uppercase text-zinc-200 dark:text-white/5">
            Sin ofertas
          </span>
          <p className="mt-6 font-inter text-sm text-zinc-400 dark:text-white/40">
            No hay ofertas activas en este momento. Vuelve pronto.
          </p>
        </div>
      ) : (
        <>
          {/* HERO — la mejor oferta del momento */}
          {featured && (
            <section className="group relative mb-12 overflow-hidden border border-zinc-200 dark:border-white/10">
              {/* Fondo */}
              <div className="absolute inset-0">
                {(featured.banner_url ?? featured.cover_url) && (
                  <Image
                    src={featured.banner_url ?? featured.cover_url!}
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
                {/* Portada */}
                {featured.cover_url && (
                  <Link
                    href={`/games/${featured.slug}`}
                    className="relative hidden aspect-[3/4] w-44 shrink-0 overflow-hidden border border-white/10 shadow-2xl sm:block lg:w-52"
                  >
                    <Image
                      src={featured.cover_url}
                      alt={featured.title}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  </Link>
                )}

                {/* Texto */}
                <div className="max-w-xl">
                  <p className="mb-3 inline-flex items-center gap-2 bg-red-600 px-3 py-1 font-inter text-[10px] font-bold uppercase tracking-widest text-white">
                    <Timer className="h-3 w-3" />
                    Oferta destacada · −{featured.discount_percent}%
                  </p>
                  <Link href={`/games/${featured.slug}`}>
                    <h2 className="font-podium text-4xl uppercase leading-none tracking-tight text-white transition-colors hover:text-red-400 sm:text-5xl">
                      {featured.title}
                    </h2>
                  </Link>
                  {featured.description && (
                    <p className="mt-4 line-clamp-2 font-inter text-sm leading-relaxed text-white/50">
                      {featured.description}
                    </p>
                  )}

                  {/* Precios */}
                  <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-2">
                    <div>
                      <span className="block font-inter text-sm text-white/35 line-through">
                        {formatPrice(featured.price)}
                      </span>
                      <span className="font-podium text-4xl text-white">
                        {formatPrice(finalPrice(featured))}
                      </span>
                    </div>
                    <span className="mb-1 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-inter text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                      Ahorras {formatPrice(savings)}
                    </span>
                  </div>

                  <div className="mt-6 max-w-xs">
                    <AddToCartButton game={featured} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Resto de ofertas, ordenadas por descuento */}
          {rest.length > 0 && (
            <>
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="font-podium text-lg uppercase tracking-wide text-zinc-900 dark:text-white">
                  Más ofertas
                </h2>
                <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/30">
                  {rest.length} en oferta
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visible.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
              <Suspense>
                <Pagination page={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </>
      )}
    </div>
  )
}
