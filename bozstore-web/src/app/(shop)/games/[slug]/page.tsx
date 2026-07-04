import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Monitor, Tag } from 'lucide-react'
import type { Game } from '@/types/game'
import AddToCartButton from '@/components/cart/AddToCartButton'
import WishlistButton from '@/components/wishlist/WishlistButton'
import GameGallery from '@/components/shop/GameGallery'
import Reviews from '@/components/shop/Reviews'
import { finalPrice, hasDiscount, formatPrice } from '@/lib/pricing'

async function fetchGame(slug: string): Promise<Game | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

  try {
    const res = await fetch(`${base}/games/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: Game }
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const game     = await fetchGame(slug)
  if (!game) return { title: 'Juego no encontrado — BosStore' }
  const description = game.description ?? `Compra ${game.title} en BosStore. Entrega digital instantánea.`
  return {
    title:       `${game.title} — BosStore`,
    description,
    openGraph: {
      title:       `${game.title} — BosStore`,
      description,
      type:        'website',
      ...(game.cover_url && { images: [{ url: game.cover_url, width: 600, height: 800, alt: game.title }] }),
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${game.title} — BosStore`,
      description,
      ...(game.cover_url && { images: [game.cover_url] }),
    },
  }
}

export default async function GameDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const game     = await fetchGame(slug)
  if (!game) notFound()

  const inStock = game.stock > 0
  const onSale  = hasDiscount(game)
  const price   = finalPrice(game)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description ?? undefined,
    genre: game.genre ?? undefined,
    gamePlatform: game.platform ?? undefined,
    author: game.developer ? { '@type': 'Organization', name: game.developer } : undefined,
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'PEN',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'BosStore' },
    },
    ...(game.cover_url && { image: game.cover_url }),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero con imagen de fondo desenfocada */}
      <div className="relative min-h-[420px] overflow-hidden bg-zinc-950 sm:h-[55vh]">
        {game.cover_url && (
          <>
            <Image
              src={game.cover_url}
              alt=""
              fill
              priority
              className="scale-110 object-cover opacity-25 blur-md"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20" />
          </>
        )}
        {!game.cover_url && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 to-zinc-900" />
        )}

        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-16">
          <Link
            href="/games"
            className="inline-flex w-fit items-center gap-2 font-inter text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Catálogo
          </Link>

          <div className="mt-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-16">
            <div className="w-full max-w-xs lg:col-span-1">
              <div className="mb-4 flex flex-wrap gap-2">
                {game.genre && (
                  <span className="inline-flex items-center gap-1.5 border border-white/10 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-white/40">
                    <Tag className="h-2.5 w-2.5" />
                    {game.genre}
                  </span>
                )}
                {game.platform && (
                  <span className="inline-flex items-center gap-1.5 border border-white/10 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-white/40">
                    <Monitor className="h-2.5 w-2.5" />
                    {game.platform}
                  </span>
                )}
              </div>

              <h1 className="font-podium text-4xl uppercase leading-[0.9] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {game.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-16">

          {/* Columna izquierda — carátula */}
          <div className="lg:col-span-1">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xs overflow-hidden border border-white/5 bg-zinc-900 lg:mx-0">
              {game.cover_url ? (
                <Image
                  src={game.cover_url}
                  alt={game.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="select-none font-podium text-9xl font-bold uppercase text-white/10">
                    {game.title.slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha — galería + descripción + detalles */}
          <div className="lg:col-span-2">
            <GameGallery
              screenshots={game.screenshots}
              trailerUrl={game.trailer_url}
              title={game.title}
            />

            <h2 className="mb-5 font-podium text-xl uppercase tracking-wide text-white">
              Descripción
            </h2>

            {game.description ? (
              <p className="font-inter text-sm leading-relaxed text-white/50">
                {game.description}
              </p>
            ) : (
              <p className="font-inter text-sm italic text-white/40">
                Sin descripción disponible.
              </p>
            )}

            <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              {/* Ficha técnica */}
              <div>
                <h3 className="mb-5 font-podium text-xs uppercase tracking-widest text-white/40">
                  Ficha técnica
                </h3>
                <dl className="space-y-3">
                  {[
                    { label: 'Género',        value: game.genre },
                    { label: 'Plataforma',    value: game.platform },
                    { label: 'Desarrollador', value: game.developer },
                    {
                      label: 'Lanzamiento',
                      value: game.release_date
                        ? new Date(`${game.release_date}T00:00:00`).toLocaleDateString(
                            'es-MX',
                            { year: 'numeric', month: 'long', day: 'numeric' },
                          )
                        : undefined,
                    },
                    {
                      label: 'Stock',
                      value: `${game.stock} unidades`,
                      className: inStock ? 'text-white/50' : 'text-red-500',
                    },
                  ]
                    .filter(row => row.value)
                    .map(row => (
                      <div key={row.label} className="flex items-start gap-6">
                        <dt className="w-24 shrink-0 font-inter text-[10px] uppercase tracking-widest text-white/40">
                          {row.label}
                        </dt>
                        <dd className={`font-inter text-sm ${row.className ?? 'text-white/50'}`}>
                          {row.value}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>

              {/* Compra */}
              <div className="border border-white/10 bg-zinc-900 p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {onSale && (
                      <span className="bg-red-600 px-2 py-1 font-inter text-sm font-bold text-white">
                        -{game.discount_percent}%
                      </span>
                    )}
                    <div className="flex flex-col">
                      {onSale && (
                        <span className="font-inter text-sm text-white/40 line-through">
                          {formatPrice(game.price)}
                        </span>
                      )}
                      <span
                        className={`font-inter text-3xl font-bold ${onSale ? 'text-red-500' : 'text-white'}`}
                      >
                        {formatPrice(price)}
                      </span>
                    </div>
                  </div>
                  <span className={`whitespace-nowrap font-inter text-xs uppercase tracking-widest ${
                    inStock ? 'text-emerald-500' : 'text-red-500'
                  }`}>
                    {inStock ? `${game.stock} disponibles` : 'Agotado'}
                  </span>
                </div>

                <AddToCartButton game={game} />
                <div className="mt-3">
                  <WishlistButton slug={game.slug} variant="full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas — ancho completo */}
        <Reviews gameSlug={game.slug} />
      </div>
    </div>
  )
}
