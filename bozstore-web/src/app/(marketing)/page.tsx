import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Clock, Compass, Gamepad2, Globe, LayoutGrid,
  Library, LogIn, Monitor, Shield,
  Sword, Swords, Target, Trophy, Zap,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Game } from '@/types/game'
import { createClient } from '@/lib/supabase/server'
import { hasDiscount, finalPrice, formatPrice } from '@/lib/pricing'

export const metadata: Metadata = {
  title: 'BosStore — Tu tienda de videojuegos',
  description: 'Los mejores títulos al precio justo. Entrega digital instantánea.',
}

// Link directo al video de fondo del hero (.mp4)
const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260606_154941_df1a96e1-a06f-450c-bd02-d863414cc1a0.mp4'

async function getGames(): Promise<Game[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  try {
    const res = await fetch(`${base}/games`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const json = (await res.json()) as { data?: Game[] }
    return json.data ?? []
  } catch {
    return []
  }
}

const GENRES = [
  { label: 'RPG',        icon: Sword,      q: 'RPG',        grad: 'from-purple-500/15 to-zinc-900/40', border: 'border-purple-400/20', text: 'text-purple-400' },
  { label: 'FPS',        icon: Target,     q: 'FPS',        grad: 'from-sky-500/15 to-zinc-900/40',    border: 'border-sky-400/20',    text: 'text-sky-400'    },
  { label: 'Deportes',   icon: Trophy,     q: 'Deportes',   grad: 'from-amber-500/15 to-zinc-900/40',  border: 'border-amber-400/20',  text: 'text-amber-400'  },
  { label: 'Aventura',   icon: Compass,    q: 'Aventura',   grad: 'from-blue-500/15 to-zinc-900/40',   border: 'border-blue-400/20',   text: 'text-blue-400'   },
  { label: 'Estrategia', icon: LayoutGrid, q: 'Estrategia', grad: 'from-emerald-500/15 to-zinc-900/40',border: 'border-emerald-400/20',text: 'text-emerald-400'},
  { label: 'Lucha',      icon: Swords,     q: 'Lucha',      grad: 'from-rose-500/15 to-zinc-900/40',   border: 'border-rose-400/20',   text: 'text-rose-400'   },
]

const FEATURES = [
  { icon: Zap,    title: 'Entrega instantánea', desc: 'Accede a tu juego segundos después de comprar. Sin tiempos de espera.' },
  { icon: Shield, title: 'Pago 100% seguro',    desc: 'Transacciones protegidas con cifrado SSL y las principales formas de pago.' },
  { icon: Globe,  title: 'Multiplataforma',     desc: 'PC, consola y cualquier dispositivo. Tu biblioteca siempre accesible.' },
  { icon: Clock,  title: 'Soporte 24/7',        desc: 'Nuestro equipo está disponible en cualquier momento que nos necesites.' },
]

const PLATFORMS = [
  { name: 'PC / Steam',  icon: Monitor,  desc: 'Windows, Mac & Linux' },
  { name: 'PlayStation', icon: Gamepad2, desc: 'PS4 & PS5'            },
  { name: 'Xbox',        icon: Gamepad2, desc: 'Series X/S & One'     },
  { name: 'Nintendo',    icon: Gamepad2, desc: 'Switch & Switch 2'    },
]

const STATS = [
  { value: '500+', label: 'Títulos'   },
  { value: '10K+', label: 'Jugadores' },
  { value: '24/7', label: 'Soporte'   },
  { value: '100%', label: 'Digital'   },
]

const TICKER_FALLBACK =
  'CYBERPUNK 2077 · ELDEN RING · THE WITCHER 3 · RED DEAD REDEMPTION 2 · FIFA 24 · CALL OF DUTY · GTA VI · SPIDER-MAN 2'

export default async function LandingPage() {
  const games = await getGames()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const navUser = user
    ? {
        email: user.email ?? '',
        full_name: (user.user_metadata?.full_name as string | null | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | null | undefined) ?? null,
      }
    : null

  const spotlight = games.find((g) => g.cover_url) ?? games[0] ?? null
  const tickerBase = games.length > 0
    ? games.map((g) => g.title.toUpperCase()).join(' · ')
    : TICKER_FALLBACK

  const popularGames = games.slice(0, 5)
  const offerGames   = games.filter(hasDiscount).slice(0, 3)

  return (
    <div className="bg-zinc-950 text-white">

      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Fondo: video > portada del juego destacado > gradiente oscuro */}
        {VIDEO_URL ? (
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        ) : spotlight?.cover_url ? (
          <Image
            src={spotlight.cover_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 object-cover object-center scale-105"
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full flex-col">
          <Navbar user={navUser} />

          <main className="flex flex-1 flex-col justify-center px-6 pb-20 sm:px-10 lg:px-16">
            <div className="animate-fade-up mb-5 flex items-center gap-3">
              <Gamepad2 className="h-4 w-4 text-red-500" />
              <span className="font-inter text-[10px] uppercase tracking-[0.35em] text-white/50 sm:text-xs">
                Tu tienda de videojuegos
              </span>
            </div>

            <h1 className="animate-fade-up-delay-1 font-podium uppercase leading-[0.88] tracking-tight">
              <span className="block text-[clamp(3.2rem,9.5vw,8.5rem)] text-white">Juega.</span>
              <span className="block text-[clamp(3.2rem,9.5vw,8.5rem)] text-white">Compra.</span>
              <span className="block text-[clamp(3.2rem,9.5vw,8.5rem)] text-red-600">Conquista.</span>
            </h1>

            <p className="animate-fade-up-delay-2 mt-6 max-w-lg font-inter text-sm leading-relaxed text-white/55 sm:text-[15px] lg:mt-8">
              Los mejores títulos al precio justo.{' '}
              <span className="font-semibold text-white">Descarga digital instantánea.</span>
              <br />
              Catálogo en constante crecimiento.
            </p>

            <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-3 lg:mt-10">
              <Link href="/games"
                className="group inline-flex items-center gap-2 bg-red-600 px-7 py-4 font-inter text-[11px] uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-colors hover:bg-red-700">
                Ver catálogo
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              {navUser ? (
                <Link href="/account"
                  className="inline-flex items-center gap-2 border border-white/20 px-7 py-4 font-inter text-[11px] uppercase tracking-widest text-white/70 backdrop-blur transition-colors hover:border-white/40 hover:text-white">
                  <Library className="h-3.5 w-3.5" />
                  Mi biblioteca
                </Link>
              ) : (
                <Link href="/register"
                  className="inline-flex items-center gap-2 border border-white/20 px-7 py-4 font-inter text-[11px] uppercase tracking-widest text-white/70 backdrop-blur transition-colors hover:border-white/40 hover:text-white">
                  <LogIn className="h-3.5 w-3.5" />
                  Crear cuenta
                </Link>
              )}
            </div>

            <div className="animate-fade-up-delay-4 mt-10 flex flex-wrap gap-10 lg:mt-14 lg:gap-16">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-podium text-4xl uppercase text-white sm:text-5xl lg:text-6xl">{s.value}</p>
                  <p className="mt-1 font-inter text-[9px] uppercase tracking-widest text-white/35 sm:text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-8 w-5 rounded-full border border-white/20 p-1">
            <div className="mx-auto h-2 w-0.5 rounded-full bg-white/30" />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-white/5 bg-zinc-900/60 py-4">
        <div className="animate-marquee flex whitespace-nowrap">
          {[tickerBase, tickerBase].map((chunk, ci) => (
            <span key={ci}
              className="flex shrink-0 items-center font-inter text-[10px] uppercase tracking-[0.22em] text-white/20">
              {chunk.split(' · ').map((t, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-5 text-red-600/50">◆</span>
                  <span>{t}</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* JUEGOS POPULARES */}
      {popularGames.length > 0 && (
        <section className="border-t border-white/5 bg-zinc-900/40 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-podium text-3xl uppercase tracking-tight text-white sm:text-4xl">Juegos Populares</h2>
              <Link href="/games"
                className="group flex items-center gap-1 font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-red-500">
                Ver todos <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:h-[420px]">
              {popularGames[0] && (
                <Link href={`/games/${popularGames[0].slug}`}
                  className="group relative overflow-hidden bg-zinc-900 border border-white/5 lg:w-[48%] shrink-0 h-72 lg:h-auto">
                  <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
                    {(popularGames[0].genre ?? '').split('/').filter(Boolean).map((g) => (
                      <span key={g.trim()}
                        className="border border-white/20 bg-black/60 px-2 py-0.5 font-inter text-[9px] uppercase tracking-wider text-white/60 backdrop-blur-sm">
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                  {(popularGames[0].banner_url ?? popularGames[0].cover_url) ? (
                    <Image src={popularGames[0].banner_url ?? popularGames[0].cover_url!} alt={popularGames[0].title} fill
                      sizes="(max-width:1024px) 100vw, 48vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                      <span className="font-podium text-6xl uppercase text-white/5">{popularGames[0].title.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-inter text-sm font-bold text-white leading-tight">{popularGames[0].title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-white/35" />
                        <Gamepad2 className="h-3.5 w-3.5 text-white/35" />
                        {popularGames[0].platform && (
                          <span className="font-inter text-[9px] text-white/35">{popularGames[0].platform}</span>
                        )}
                      </div>
                      <span className="font-inter text-base font-bold text-white">
                        {formatPrice(finalPrice(popularGames[0]))}
                      </span>
                    </div>
                  </div>
                </Link>
              )}
              <div className="grid flex-1 grid-cols-2 gap-3">
                {popularGames.slice(1, 5).map((game) => (
                  <Link key={game.id} href={`/games/${game.slug}`}
                    className="group flex flex-col overflow-hidden border border-white/5 bg-zinc-900">
                    <div className="relative flex-1 min-h-[90px] overflow-hidden">
                      {(game.banner_url ?? game.cover_url) ? (
                        <Image src={game.banner_url ?? game.cover_url!} alt={game.title} fill
                          sizes="(max-width:640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                          <span className="font-podium text-4xl uppercase text-white/5">{game.title.slice(0, 2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 bg-zinc-900 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="font-inter text-[11px] font-semibold text-white truncate leading-tight">{game.title}</p>
                        {game.platform && (
                          <p className="mt-0.5 font-inter text-[9px] text-white/35">{game.platform}</p>
                        )}
                      </div>
                      <span className="ml-2 shrink-0 font-inter text-[11px] font-bold text-white">
                        {formatPrice(finalPrice(game))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OFERTAS DESTACADAS */}
      {offerGames.length > 0 && (
        <section className="border-t border-white/5 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-podium text-3xl uppercase tracking-tight text-white sm:text-4xl">Ofertas Destacadas</h2>
                <p className="mt-1 font-inter text-xs text-white/35">Descuentos activos por tiempo limitado</p>
              </div>
              <Link href="/ofertas"
                className="group flex shrink-0 items-center gap-1 font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-red-500">
                Ver todas <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {offerGames.map((game) => (
                <Link key={game.id} href={`/games/${game.slug}`}
                  className="group flex gap-3 border border-white/5 bg-zinc-900/40 p-3 transition-all hover:border-red-600/20 hover:bg-zinc-900/70">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-zinc-800">
                    {game.cover_url && (
                      <Image src={game.cover_url} alt={game.title} fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center gap-1">
                    <p className="truncate font-inter text-xs font-semibold text-white/90">{game.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600/20 px-1.5 py-0.5 font-inter text-[9px] font-bold text-red-400">
                        -{game.discount_percent}%
                      </span>
                      <span className="font-inter text-[10px] text-white/25 line-through">
                        {formatPrice(game.price)}
                      </span>
                      <span className="font-inter text-sm font-bold text-white">
                        {formatPrice(finalPrice(game))}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GÉNEROS */}
      <section className="border-t border-white/5 bg-zinc-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-10">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">Explora por categoría</p>
            <h2 className="font-podium text-4xl uppercase tracking-tight sm:text-5xl">Géneros</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {GENRES.map(({ label, icon: Icon, q, grad, border, text }) => (
              <Link key={label} href={`/games?genre=${encodeURIComponent(q)}`}
                className={`group relative overflow-hidden border ${border} bg-gradient-to-br ${grad} p-6 transition-all hover:-translate-y-0.5 hover:shadow-md`}>
                <Icon className={`mb-3 h-6 w-6 ${text} transition-transform duration-300 group-hover:scale-110`} />
                <p className="font-podium text-sm uppercase tracking-wide text-white/80">{label}</p>
                <ArrowUpRight className="absolute bottom-3 right-3 h-3 w-3 text-white/15 transition-all group-hover:text-red-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PLATAFORMAS */}
      <section className="border-t border-white/5 bg-zinc-900/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-10 text-center">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">Compatible con</p>
            <h2 className="font-podium text-4xl uppercase tracking-tight sm:text-5xl">Tus plataformas</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PLATFORMS.map(({ name, icon: Icon, desc }) => (
              <div key={name}
                className="group flex flex-col items-center border border-white/5 bg-zinc-900/40 p-8 text-center transition-all hover:border-red-600/20 hover:shadow-md">
                <Icon className="mb-4 h-8 w-8 text-white/20 transition-colors group-hover:text-red-500" />
                <p className="font-podium text-sm uppercase tracking-wide text-white/80">{name}</p>
                <p className="mt-1 font-inter text-[10px] text-white/35">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ¿POR QUÉ BosStore? */}
      <section className="border-t border-white/5 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="mb-12 text-center">
            <p className="mb-2 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">La diferencia BosStore</p>
            <h2 className="font-podium text-4xl uppercase tracking-tight sm:text-5xl">¿Por qué elegirnos?</h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group bg-zinc-950 p-8 transition-colors hover:bg-zinc-900/60">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center border border-red-600/20 bg-red-600/10">
                  <Icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="mb-3 font-podium text-base uppercase tracking-wide">{title}</h3>
                <p className="font-inter text-sm leading-relaxed text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="bg-red-600 py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-podium text-5xl uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">{value}</p>
                <p className="mt-2 font-inter text-[10px] uppercase tracking-widest text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-white/5 py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-10">
          <p className="mb-3 font-inter text-[10px] uppercase tracking-[0.25em] text-red-500">
            {navUser ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
          </p>
          <h2 className="font-podium text-5xl uppercase leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            Tu próxima<br /><span className="text-red-600">partida</span><br />empieza aquí
          </h2>
          <p className="mx-auto mt-6 max-w-md font-inter text-sm leading-relaxed text-white/45">
            {navUser
              ? 'Cientos de títulos te esperan. Explora el catálogo y encuentra tu próxima aventura.'
              : 'Más de 500 títulos esperándote. Crea tu cuenta gratis y accede al mejor catálogo de videojuegos digitales.'}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {navUser ? (
              <>
                <Link href="/games"
                  className="group inline-flex items-center gap-2 bg-red-600 px-8 py-4 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700">
                  Ver catálogo <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/account"
                  className="inline-flex items-center gap-2 border border-white/15 px-8 py-4 font-inter text-xs uppercase tracking-widest text-white/60 transition-colors hover:border-white/30 hover:text-white">
                  <Library className="h-4 w-4" /> Mi biblioteca
                </Link>
              </>
            ) : (
              <>
                <Link href="/register"
                  className="group inline-flex items-center gap-2 bg-red-600 px-8 py-4 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700">
                  Crear cuenta gratis <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link href="/games"
                  className="inline-flex items-center gap-2 border border-white/15 px-8 py-4 font-inter text-xs uppercase tracking-widest text-white/60 transition-colors hover:border-white/30 hover:text-white">
                  <Gamepad2 className="h-4 w-4" /> Explorar sin cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
