import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export const metadata: Metadata = { title: 'Pedidos — Admin BosStore' }

export default function AdminOrdersPage() {
  return (
    <div className="px-6 py-8 sm:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-podium text-3xl uppercase tracking-tight text-white">Pedidos</h1>
          <p className="mt-1 font-inter text-sm text-white/35">
            Historial de órdenes de clientes
          </p>
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Pedidos totales',    value: '—' },
          { label: 'Ingresos totales',   value: '—' },
          { label: 'Pedidos este mes',   value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="border border-white/5 bg-zinc-900/50 p-5">
            <span className="font-inter text-[10px] uppercase tracking-widest text-white/30">
              {label}
            </span>
            <p className="mt-4 font-podium text-4xl text-white/20">{value}</p>
            <p className="mt-2 font-inter text-[10px] text-white/15">Próximamente</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="border border-white/5">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-5 py-3 sm:grid">
          {['Cliente', 'Juegos', 'Total', 'Estado', ''].map((h) => (
            <span key={h} className="font-inter text-[9px] uppercase tracking-widest text-white/20">
              {h}
            </span>
          ))}
        </div>

        {/* Empty */}
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <ShoppingBag className="mb-4 h-10 w-10 text-white/[0.06]" />
          <span className="select-none font-podium text-5xl uppercase text-white/[0.06]">
            Sin pedidos
          </span>
          <p className="mt-4 max-w-xs font-inter text-sm text-white/25">
            La gestión de pedidos estará disponible próximamente. Los datos de órdenes se generan
            desde el flujo de pago con Stripe.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center gap-2 border border-white/10 px-5 py-2.5 font-inter text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:border-white/20 hover:text-white/50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
