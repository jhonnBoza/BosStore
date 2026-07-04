import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Gamepad2,
  Heart,
  Library,
  LogOut,
  Shield,
  ShoppingBag,
  User,
} from 'lucide-react'
import { formatPrice } from '@/lib/pricing'
import EditProfile from '@/components/account/EditProfile'
import LogoutButton from '@/components/auth/LogoutButton'

export const metadata: Metadata = {
  title: 'Mi cuenta — BosStore',
}

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // middleware garantiza que user no es null aquí
  const email      = user?.email ?? ''
  const full_name  = user?.user_metadata?.full_name  as string | undefined
  const avatar_url = user?.user_metadata?.avatar_url as string | undefined
  const provider   = user?.app_metadata?.provider    as string | undefined
  const isAdmin    = (user?.app_metadata?.role as string | undefined) === 'admin'
  const initial    = (full_name || email).charAt(0).toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  // Biblioteca: juegos comprados (RLS deja ver solo los del usuario actual).
  // Si la tabla aún no existe en Supabase, el error se ignora y queda vacía.
  let library: { slug: string; title: string; cover_url?: string | null }[] = []
  const { data: purchased } = await supabase
    .from('order_items')
    .select('game_slug, title, cover_url')
  if (purchased) {
    const seen = new Set<string>()
    library = purchased
      .filter((row) => {
        if (seen.has(row.game_slug)) return false
        seen.add(row.game_slug)
        return true
      })
      .map((row) => ({
        slug: row.game_slug,
        title: row.title,
        cover_url: row.cover_url,
      }))
  }

  // Mis pedidos: historial de órdenes vía la API (GET /orders con el JWT de sesión)
  type OrderItem = { id: string; title: string; price: number; quantity: number }
  type Order = {
    id: string
    total: number
    status: string
    created_at: string
    order_items: OrderItem[]
  }
  let orders: Order[] = []
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.access_token) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
    try {
      const res = await fetch(`${base}/orders`, {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = (await res.json()) as { data: Order[] }
        orders = json.data ?? []
      }
    } catch {
      // API caída: la sección simplemente se muestra vacía
    }
  }

  // Lista de deseos: wishlist del usuario (RLS) + datos del juego (games es público)
  let wishlist: { slug: string; title: string; cover_url?: string | null }[] = []
  const { data: wishRows } = await supabase.from('wishlists').select('game_slug')
  const wishSlugs = (wishRows ?? []).map((r) => r.game_slug as string)
  if (wishSlugs.length > 0) {
    const { data: wishGames } = await supabase
      .from('games')
      .select('slug, title, cover_url')
      .in('slug', wishSlugs)
    wishlist = (wishGames ?? []).map((g) => ({
      slug: g.slug,
      title: g.title,
      cover_url: g.cover_url,
    }))
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-10">
      {/* Perfil */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        {avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar_url}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-red-600">
            <span className="font-podium text-3xl uppercase text-white">{initial}</span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-podium text-3xl uppercase tracking-tight text-white sm:text-4xl">
              {full_name ?? 'Mi cuenta'}
            </h1>
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 bg-red-600/15 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-red-400 transition-colors hover:bg-red-600/25"
              >
                <Shield className="h-3 w-3" />
                Panel admin
              </Link>
            )}
          </div>
          <p className="mt-1 font-inter text-sm text-white/40">{email}</p>
          {provider && (
            <span className="mt-2 inline-block border border-white/10 px-2.5 py-1 font-inter text-[10px] uppercase tracking-widest text-white/30">
              {provider}
            </span>
          )}
        </div>
      </div>

      {/* Stats rápidas estilo Steam */}
      <div className="mb-10 grid grid-cols-3 gap-px border border-white/10 bg-white/5">
        {[
          { label: 'Juegos',        value: String(library.length) },
          { label: 'Lista deseos',  value: String(wishlist.length) },
          { label: 'Miembro desde', value: memberSince ? memberSince.split(' ').pop()! : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-950 px-4 py-5 text-center">
            <p className="font-podium text-2xl uppercase text-white sm:text-3xl">{value}</p>
            <p className="mt-1 font-inter text-[9px] uppercase tracking-widest text-white/30">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Mi biblioteca */}
        <section className="border border-white/10 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <Library className="h-3.5 w-3.5 text-white/25" />
              <h2 className="font-podium text-xs uppercase tracking-widest text-white/60">
                Mi biblioteca
              </h2>
            </div>
            <span className="font-inter text-[10px] uppercase tracking-widest text-white/25">
              {library.length} {library.length === 1 ? 'juego' : 'juegos'}
            </span>
          </div>

          {library.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 p-6 sm:grid-cols-5">
              {library.map((g) => (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden border border-white/5 bg-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {g.cover_url && (
                    <img
                      src={g.cover_url}
                      alt={g.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
              ))}
            </div>
          ) : (
            /* Estado vacío estilo Steam: grid de portadas placeholder + overlay */
            <div className="relative p-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-[3/4] items-center justify-center border border-white/5 bg-gradient-to-b from-zinc-800/40 to-zinc-900/40"
                  >
                    <Gamepad2 className="h-6 w-6 text-white/[0.05]" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-zinc-900 via-zinc-900/85 to-zinc-900/50 px-6 text-center">
                <Library className="mb-3 h-10 w-10 text-white/15" />
                <p className="font-podium text-xl uppercase tracking-wide text-white/45">
                  Tu biblioteca está vacía
                </p>
                <p className="mt-2 max-w-xs font-inter text-sm leading-relaxed text-white/25">
                  Los juegos que compres aparecerán aquí, listos para descargar al
                  instante.
                </p>
                <Link
                  href="/games"
                  className="mt-5 inline-flex items-center gap-2 bg-red-600 px-6 py-2.5 font-inter text-[10px] uppercase tracking-widest text-white transition-colors hover:bg-red-700"
                >
                  <Gamepad2 className="h-3.5 w-3.5" />
                  Explorar catálogo
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Mis pedidos */}
        <section className="border border-white/10 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-3.5 w-3.5 text-white/25" />
              <h2 className="font-podium text-xs uppercase tracking-widest text-white/60">
                Mis pedidos
              </h2>
            </div>
            <span className="font-inter text-[10px] uppercase tracking-widest text-white/25">
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {orders.length > 0 ? (
            <ul className="divide-y divide-white/5">
              {orders.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-inter text-sm text-white/80">
                      {order.order_items
                        .map((it) => (it.quantity > 1 ? `${it.title} ×${it.quantity}` : it.title))
                        .join(', ')}
                    </p>
                    <p className="mt-0.5 font-inter text-[10px] uppercase tracking-widest text-white/25">
                      #{order.id.slice(0, 8)} ·{' '}
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`border px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest ${
                      order.status === 'paid'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {order.status === 'paid' ? 'Pagado' : order.status}
                  </span>
                  <span className="font-inter text-sm font-bold text-white">
                    {formatPrice(Number(order.total))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="mb-3 h-9 w-9 text-white/10" />
              <p className="font-inter text-sm text-white/25">
                Todavía no tienes pedidos.
              </p>
              <p className="mt-1 font-inter text-xs text-white/15">
                Tus compras aparecerán aquí con su fecha, estado y total.
              </p>
            </div>
          )}
        </section>

        {/* Lista de deseos */}
        <section className="border border-white/10 bg-zinc-900/40">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <Heart className="h-3.5 w-3.5 text-white/25" />
              <h2 className="font-podium text-xs uppercase tracking-widest text-white/60">
                Lista de deseos
              </h2>
            </div>
            <span className="font-inter text-[10px] uppercase tracking-widest text-white/25">
              {wishlist.length} {wishlist.length === 1 ? 'juego' : 'juegos'}
            </span>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 p-6 sm:grid-cols-5">
              {wishlist.map((g) => (
                <Link
                  key={g.slug}
                  href={`/games/${g.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden border border-white/5 bg-zinc-800"
                >
                  {g.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.cover_url}
                      alt={g.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="mb-3 h-9 w-9 text-white/10" />
              <p className="font-inter text-sm text-white/25">
                Tu lista de deseos está vacía.
              </p>
              <p className="mt-1 font-inter text-xs text-white/15">
                Toca el corazón en cualquier juego para guardarlo aquí.
              </p>
            </div>
          )}
        </section>

        {/* Editar perfil */}
        <section className="border border-white/10 bg-zinc-900/40">
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
            <User className="h-3.5 w-3.5 text-white/25" />
            <h2 className="font-podium text-xs uppercase tracking-widest text-white/60">
              Perfil
            </h2>
          </div>
          <EditProfile initialName={full_name ?? ''} />
          <dl className="divide-y divide-white/5 border-t border-white/5 px-6">
            {[
              { label: 'Email',         value: email },
              { label: 'Miembro desde', value: memberSince ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-6 py-4">
                <dt className="w-32 shrink-0 font-inter text-[10px] uppercase tracking-widest text-white/25">
                  {label}
                </dt>
                <dd className="font-inter text-sm text-white/60">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Sesión */}
        <section className="border border-white/10 bg-zinc-900/40">
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
            <Shield className="h-3.5 w-3.5 text-white/25" />
            <h2 className="font-podium text-xs uppercase tracking-widest text-white/60">
              Sesión
            </h2>
          </div>
          <div className="px-6 py-5">
            <LogoutButton
              className="inline-flex items-center gap-2.5 border border-red-600/30 px-5 py-2.5 font-inter text-xs uppercase tracking-widest text-red-500 transition-colors hover:border-red-600 hover:bg-red-600/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </LogoutButton>
          </div>
        </section>
      </div>
    </div>
  )
}
