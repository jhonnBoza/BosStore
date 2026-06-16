'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { finalPrice } from '@/lib/pricing'
import type { Game } from '@/types/game'

type Props = {
  game: Pick<
    Game,
    'id' | 'slug' | 'title' | 'price' | 'cover_url' | 'stock' | 'discount_percent'
  >
  size?: 'default' | 'sm'
  className?: string
}

export default function AddToCartButton({ game, size = 'default', className }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const inStock = game.stock > 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock || added) return
    addItem({
      id:        game.id,
      slug:      game.slug,
      title:     game.title,
      price:     finalPrice(game),
      cover_url: game.cover_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  if (size === 'sm') {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={!inStock}
        aria-label={`Agregar ${game.title} al carrito`}
        className={`flex items-center gap-1.5 px-3 py-1.5 font-inter text-[9px] uppercase tracking-widest transition-all ${
          added
            ? 'bg-emerald-600 text-white'
            : inStock
            ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
            : 'cursor-not-allowed bg-white/5 text-white/30'
        } ${className ?? ''}`}
      >
        {added ? (
          <Check className="h-3 w-3 shrink-0" />
        ) : (
          <ShoppingCart className="h-3 w-3 shrink-0" />
        )}
        {added ? '¡Añadido!' : 'Agregar'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!inStock}
      className={`flex w-full items-center justify-center gap-2.5 py-4 font-inter text-xs uppercase tracking-widest transition-all ${
        added
          ? 'bg-emerald-600 text-white'
          : inStock
          ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]'
          : 'cursor-not-allowed bg-white/5 text-white/30'
      } ${className ?? ''}`}
    >
      {added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {added ? '¡Añadido al carrito!' : inStock ? 'Agregar al carrito' : 'Sin stock'}
    </button>
  )
}
