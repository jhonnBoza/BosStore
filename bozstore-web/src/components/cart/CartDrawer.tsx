'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react'
import { useCartStore, cartTotal, cartCount, useCartHydrated } from '@/store/cart'
import { formatPrice } from '@/lib/pricing'

export default function CartDrawer() {
  const { items: rawItems, isOpen, closeCart, removeItem, updateQuantity, clearCart } =
    useCartStore()
  const hydrated = useCartHydrated()
  const items = hydrated ? rawItems : []
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const total = cartTotal(items)
  const count = cartCount(items)

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-red-500" />
            <h2 className="font-podium text-lg uppercase tracking-wide text-white">
              Carrito
            </h2>
            {count > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center bg-red-600 px-1.5 font-inter text-[10px] text-white">
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="p-1.5 text-white/40 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-28 text-center">
              <ShoppingCart className="h-14 w-14 text-white/10" />
              <div>
                <p className="font-podium text-xl uppercase tracking-wide text-white/40">
                  Tu carrito está vacío
                </p>
                <p className="mt-1 font-inter text-xs text-white/30">
                  Agrega juegos para empezar
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="font-inter text-[11px] uppercase tracking-widest text-red-500 transition-colors hover:text-red-400"
              >
                Explorar catálogo →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 px-6 py-5">
                  {/* Portada */}
                  <Link
                    href={`/games/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden bg-zinc-800 transition-opacity hover:opacity-80"
                  >
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-podium text-base uppercase text-white/15">
                          {item.title.slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 font-inter text-sm font-medium leading-tight text-white/90">
                        {item.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Eliminar ${item.title}`}
                        className="shrink-0 text-white/30 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Cantidad */}
                      <div className="flex items-center border border-white/10">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Reducir cantidad"
                          className="flex h-7 w-7 items-center justify-center text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-7 w-8 select-none items-center justify-center font-inter text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Aumentar cantidad"
                          className="flex h-7 w-7 items-center justify-center text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="font-inter text-sm font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer checkout */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-zinc-900 px-6 py-6">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-inter text-sm text-white/50">Total</span>
              <span className="font-inter text-2xl font-bold text-white">
                {formatPrice(total)}
              </span>
            </div>
            <p className="mb-5 font-inter text-[9px] uppercase tracking-widest text-white/30">
              Impuestos incluidos · Entrega digital instantánea
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="group flex w-full items-center justify-center gap-2 bg-red-600 py-4 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700"
            >
              Proceder al pago
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="mt-3 flex items-center justify-between">
              <Link
                href="/games"
                onClick={closeCart}
                className="font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
              >
                ← Seguir comprando
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-red-500"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
