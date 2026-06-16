'use client'

import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'

type Props = {
  slug: string
  variant?: 'icon' | 'full'
  className?: string
}

export default function WishlistButton({ slug, variant = 'icon', className }: Props) {
  const wishlisted = useWishlistStore((s) => s.slugs.has(slug))
  const toggle = useWishlistStore((s) => s.toggle)

  const handle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(slug)
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handle}
        className={`flex w-full items-center justify-center gap-2.5 border py-4 font-inter text-xs uppercase tracking-widest transition-colors ${
          wishlisted
            ? 'border-red-600/40 bg-red-600/10 text-red-500'
            : 'border-white/15 text-white/60 hover:border-red-500 hover:text-white'
        } ${className ?? ''}`}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        {wishlisted ? 'En tu lista de deseos' : 'Añadir a deseos'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={wishlisted ? 'Quitar de deseos' : 'Añadir a deseos'}
      className={`flex h-8 w-8 items-center justify-center bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/80 ${className ?? ''}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          wishlisted ? 'fill-red-500 text-red-500' : 'text-white/70'
        }`}
      />
    </button>
  )
}
