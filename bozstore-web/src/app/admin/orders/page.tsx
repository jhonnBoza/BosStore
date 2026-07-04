import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/pricing'
import Pagination from '@/components/ui/Pagination'

export const metadata: Metadata = { title: 'Pedidos — Admin BosStore' }

const PER_PAGE = 10

type OrderItem = {
  id: string
  game_slug: string
  title: string
  price: number
  quantity: number
  cover_url?: string | null
}

type Order = {
  id: string
  user_email: string | null
  total: number
  currency: string
  status: string
  created_at: string
  order_items: OrderItem[]
}

async function fetchAllOrders(): Promise<Order[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return []

    const res = await fetch(`${base}/orders/all`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const json = (await res.json()) as { data: Order[] }
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function AdminOrdersPage(props: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await props.searchParams
  const orders = await fetchAllOrders()

  const now = new Date()
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const thisMonth = orders.filter((o) => {
    const d = new Date(o.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  // Paginación (las stats se calculan sobre el total, la tabla se pagina)
  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE))
  const rawPage    = Number(pageParam ?? '1')
  const page       = Math.min(Math.max(Number.isFinite(rawPage) ? Math.floor(rawPage) : 1, 1), totalPages)
  const visible    = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = [
    { label: 'Pedidos totales',  value: String(orders.length) },
    { label: 'Ingresos totales', value: formatPrice(totalRevenue) },
    { label: 'Pedidos este mes', value: String(thisMonth) },
  ]

  return (
    <div className="px-6 py-8 sm:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-podium text-3xl uppercase tracking-tight text-zinc-900 dark:text-white">Pedidos</h1>
          <p className="mt-1 font-inter text-sm text-zinc-400 dark:text-white/35">
            Historial de órdenes de clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/50 p-5">
            <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/30">
              {label}
            </span>
            <p className="mt-4 font-podium text-4xl text-zinc-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de pedidos */}
      <div className="border border-zinc-200 dark:border-white/5">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 border-b border-zinc-200 dark:border-white/10 px-5 py-3 sm:grid">
          {['Cliente', 'Juegos', 'Total', 'Estado', 'Fecha'].map((h) => (
            <span key={h} className="font-inter text-[9px] uppercase tracking-widest text-zinc-400 dark:text-white/30">
              {h}
            </span>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <ShoppingBag className="mb-4 h-10 w-10 text-zinc-200 dark:text-white/[0.06]" />
            <span className="select-none font-podium text-5xl uppercase text-zinc-200 dark:text-white/[0.06]">
              Sin pedidos
            </span>
            <p className="mt-4 max-w-xs font-inter text-sm text-zinc-400 dark:text-white/25">
              Todavía no hay compras registradas. Las órdenes aparecerán aquí
              automáticamente después de cada pago con Stripe.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 border border-zinc-200 dark:border-white/10 px-5 py-2.5 font-inter text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/30 transition-colors hover:border-zinc-300 dark:hover:border-white/20 hover:text-zinc-500 dark:hover:text-white/50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al dashboard
            </Link>
          </div>
        ) : (
          <ul>
            {visible.map((order) => (
              <li
                key={order.id}
                className="grid grid-cols-1 gap-2 border-b border-zinc-100 px-5 py-4 last:border-b-0 dark:border-white/5 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr] sm:items-center sm:gap-4"
              >
                {/* Cliente */}
                <div className="min-w-0">
                  <p className="truncate font-inter text-sm text-zinc-900 dark:text-white">
                    {order.user_email ?? '—'}
                  </p>
                  <p className="mt-0.5 truncate font-inter text-[10px] text-zinc-400 dark:text-white/30">
                    #{order.id.slice(0, 8)}
                  </p>
                </div>

                {/* Juegos */}
                <p className="line-clamp-2 font-inter text-xs text-zinc-500 dark:text-white/50">
                  {order.order_items
                    .map((it) => (it.quantity > 1 ? `${it.title} ×${it.quantity}` : it.title))
                    .join(', ')}
                </p>

                {/* Total */}
                <span className="font-inter text-sm font-bold text-zinc-900 dark:text-white">
                  {formatPrice(Number(order.total))}
                </span>

                {/* Estado */}
                <span
                  className={`inline-flex w-fit border px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest ${
                    order.status === 'paid'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                  }`}
                >
                  {order.status === 'paid' ? 'Pagado' : order.status}
                </span>

                {/* Fecha */}
                <span className="font-inter text-xs text-zinc-400 dark:text-white/40">
                  {new Date(order.created_at).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Suspense>
        <Pagination page={page} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
