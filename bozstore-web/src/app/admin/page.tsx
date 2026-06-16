import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Gamepad2, Package, Tag, TrendingUp, AlertTriangle } from 'lucide-react'
import type { Game } from '@/types/game'
import { hasDiscount, finalPrice, formatPrice } from '@/lib/pricing'

export const metadata: Metadata = { title: 'Dashboard — Admin BosStore' }

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

export default async function AdminDashboard() {
  const games = await fetchGames()

  const totalGames    = games.length
  const onSaleCount   = games.filter((g) => hasDiscount(g)).length
  const outOfStock    = games.filter((g) => g.stock === 0).length
  const lowStock      = games.filter((g) => g.stock > 0 && g.stock <= 5)
  const catalogValue  = games.reduce((sum, g) => sum + finalPrice(g), 0)

  const genres = Object.entries(
    games.reduce<Record<string, number>>((acc, g) => {
      if (g.genre) acc[g.genre] = (acc[g.genre] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  const platforms = Object.entries(
    games.reduce<Record<string, number>>((acc, g) => {
      if (g.platform) acc[g.platform] = (acc[g.platform] ?? 0) + 1
      return acc
    }, {}),
  ).sort((a, b) => b[1] - a[1])

  const stats = [
    {
      label:  'Juegos en catálogo',
      value:  totalGames,
      icon:   Gamepad2,
      sub:    totalGames === 0 ? 'Catálogo vacío' : `${totalGames - outOfStock} disponibles`,
      accent: false,
    },
    {
      label:  'En oferta',
      value:  onSaleCount,
      icon:   Tag,
      sub:    onSaleCount > 0 ? `${Math.round((onSaleCount / Math.max(totalGames, 1)) * 100)}% del catálogo` : 'Sin descuentos activos',
      accent: onSaleCount > 0,
    },
    {
      label:  'Sin stock',
      value:  outOfStock,
      icon:   Package,
      sub:    outOfStock > 0 ? 'Requieren reposición' : 'Todo disponible',
      accent: false,
      warn:   outOfStock > 0,
    },
    {
      label:  'Valor catálogo',
      value:  formatPrice(catalogValue),
      icon:   TrendingUp,
      sub:    'Suma de precios finales',
      accent: false,
      big:    true,
    },
  ]

  return (
    <div className="px-6 py-8 sm:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-podium text-3xl uppercase tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 font-inter text-sm text-white/35">
            Vista general de BosStore
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/games"
            target="_blank"
            className="flex items-center gap-2 border border-white/10 px-4 py-2.5 font-inter text-xs uppercase tracking-widest text-white/40 transition-colors hover:border-white/20 hover:text-white/60"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver tienda
          </Link>
          <Link
            href="/admin/games/new"
            className="flex items-center gap-2 bg-red-600 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
          >
            Nuevo juego
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, sub, accent, warn, big }) => (
          <div
            key={label}
            className="border border-white/5 bg-zinc-900/50 p-5 transition-colors hover:border-white/10"
          >
            <div className="flex items-start justify-between">
              <span className="font-inter text-[10px] uppercase tracking-widest text-white/30">
                {label}
              </span>
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  warn ? 'text-amber-400' : accent ? 'text-red-500' : 'text-white/15'
                }`}
              />
            </div>
            <p
              className={`mt-4 font-podium leading-none ${
                big ? 'text-2xl' : 'text-4xl'
              } ${
                warn ? 'text-amber-400' : accent ? 'text-red-400' : 'text-white'
              }`}
            >
              {value}
            </p>
            <p className="mt-2 font-inter text-[10px] text-white/25">{sub}</p>
          </div>
        ))}
      </div>

      {/* Alert — low stock */}
      {lowStock.length > 0 && (
        <div className="mb-8 border border-amber-400/20 bg-amber-400/5 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-inter text-[10px] uppercase tracking-widest text-amber-400">
              Stock bajo — {lowStock.length} {lowStock.length === 1 ? 'juego' : 'juegos'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((g) => (
              <Link
                key={g.id}
                href={`/admin/games/${g.slug}/edit`}
                className="flex items-center gap-2 border border-amber-400/20 px-3 py-1.5 font-inter text-xs text-white/60 transition-colors hover:border-amber-400/40 hover:text-white/80"
              >
                <span className="font-semibold text-amber-400">{g.stock}</span>
                {g.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Últimos juegos */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-podium text-xs uppercase tracking-widest text-white/30">
              Últimos juegos agregados
            </h2>
            <Link
              href="/admin/games"
              className="font-inter text-[10px] uppercase tracking-widest text-white/25 transition-colors hover:text-red-400"
            >
              Ver todos →
            </Link>
          </div>

          {games.length === 0 ? (
            <div className="border border-white/5 py-16 text-center">
              <span className="select-none font-podium text-8xl uppercase text-white/[0.04]">0</span>
              <p className="mt-4 font-inter text-sm text-white/25">El catálogo está vacío.</p>
              <Link
                href="/admin/games/new"
                className="mt-5 inline-block border border-white/10 px-6 py-2.5 font-inter text-[10px] uppercase tracking-widest text-white/35 transition-colors hover:border-white/20 hover:text-white/60"
              >
                Agregar el primero
              </Link>
            </div>
          ) : (
            <div className="border border-white/10">
              {games.slice(0, 8).map((game, i) => {
                const onSale = hasDiscount(game)
                return (
                  <div
                    key={game.id}
                    className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02] ${
                      i < Math.min(games.length, 8) - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    {/* Cover */}
                    <div className="h-10 w-7 shrink-0 overflow-hidden border border-white/5 bg-zinc-800">
                      {game.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={game.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-inter text-[7px] font-bold uppercase text-white/15">
                          {game.title.slice(0, 2)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-inter text-sm text-white/75">{game.title}</p>
                      <p className="font-inter text-[10px] text-white/25">{game.slug}</p>
                    </div>

                    {/* Price */}
                    <div className="flex shrink-0 flex-col items-end">
                      {onSale && (
                        <span className="font-inter text-[10px] text-white/20 line-through">
                          {formatPrice(game.price)}
                        </span>
                      )}
                      <span className="font-inter text-sm text-white/55">
                        {formatPrice(finalPrice(game))}
                      </span>
                    </div>

                    {/* Stock */}
                    <span
                      className={`w-14 shrink-0 text-right font-inter text-xs font-semibold ${
                        game.stock === 0 ? 'text-red-500' : game.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {game.stock === 0 ? 'Agotado' : `${game.stock} u.`}
                    </span>

                    {/* Edit */}
                    <Link
                      href={`/admin/games/${game.slug}/edit`}
                      className="shrink-0 font-inter text-[10px] uppercase tracking-widest text-white/20 transition-colors hover:text-white/50"
                    >
                      Editar
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">

          {/* Géneros */}
          {genres.length > 0 && (
            <div>
              <h3 className="mb-3 font-podium text-xs uppercase tracking-widest text-white/30">
                Géneros
              </h3>
              <div className="space-y-2">
                {genres.slice(0, 6).map(([genre, count]) => (
                  <div key={genre} className="flex items-center gap-3">
                    <div className="relative h-1.5 flex-1 overflow-hidden bg-zinc-800">
                      <div
                        className="absolute inset-y-0 left-0 bg-red-600/40"
                        style={{ width: `${(count / totalGames) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 truncate text-right font-inter text-[10px] text-white/40">
                      {genre}
                    </span>
                    <span className="w-5 text-right font-inter text-[10px] text-white/20">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plataformas */}
          {platforms.length > 0 && (
            <div>
              <h3 className="mb-3 font-podium text-xs uppercase tracking-widest text-white/30">
                Plataformas
              </h3>
              <div className="space-y-1.5">
                {platforms.slice(0, 5).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between gap-3">
                    <span className="font-inter text-[11px] text-white/50">{platform}</span>
                    <div className="flex items-center gap-2">
                      <div className="relative h-1 w-16 overflow-hidden bg-zinc-800">
                        <div
                          className="absolute inset-y-0 left-0 bg-white/15"
                          style={{ width: `${(count / totalGames) * 100}%` }}
                        />
                      </div>
                      <span className="w-4 text-right font-inter text-[10px] text-white/20">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div>
            <h3 className="mb-3 font-podium text-xs uppercase tracking-widest text-white/30">
              Acciones rápidas
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Nuevo juego',      href: '/admin/games/new'    },
                { label: 'Ver catálogo',     href: '/admin/games'        },
                { label: 'Ver pedidos',      href: '/admin/orders'       },
                { label: 'Ir a la tienda',   href: '/games', external: true },
              ].map(({ label, href, external }) => (
                <Link
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  className="flex items-center justify-between border border-white/5 px-4 py-3 font-inter text-xs text-white/50 transition-colors hover:border-white/15 hover:text-white/80"
                >
                  {label}
                  {external ? (
                    <ExternalLink className="h-3 w-3 text-white/20" />
                  ) : (
                    <ArrowRight className="h-3 w-3 text-white/20" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
