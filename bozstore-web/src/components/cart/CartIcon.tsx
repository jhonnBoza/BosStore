'use client'

import { ShoppingCart } from 'lucide-react'
import { useCartStore, cartCount, useCartHydrated } from '@/store/cart'

export default function CartIcon() {
  const { toggleCart, items } = useCartStore()
  const hydrated = useCartHydrated()
  const count = hydrated ? cartCount(items) : 0

  return (
    <button
      type="button"
      onClick={toggleCart}
      aria-label={`Carrito${count > 0 ? ` (${count} artículos)` : ''}`}
      className="relative p-2.5 text-white/60 transition-colors hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-red-600 px-0.5 font-inter text-[9px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
