'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/types/game'
import AddToCartButton from '@/components/cart/AddToCartButton'
import WishlistButton from '@/components/wishlist/WishlistButton'
import { finalPrice, hasDiscount, formatPrice } from '@/lib/pricing'

export default function GameCard({ game }: { game: Game }) {
  const inStock = game.stock > 0
  const onSale = hasDiscount(game)
  const price = finalPrice(game)

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group flex flex-col border border-white/5 bg-zinc-900 transition-colors duration-300 hover:border-red-600/30"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-800">
        {game.cover_url ? (
          <Image
            src={game.cover_url}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <span className="select-none font-podium text-6xl uppercase text-white/5">
              {game.title.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Agotado overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="border border-white/20 px-3 py-1 font-inter text-[10px] uppercase tracking-widest text-white/50">
              Agotado
            </span>
          </div>
        )}

        {/* Badge de descuento */}
        {onSale && (
          <span className="absolute left-2 top-2 bg-red-600 px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider text-white">
            -{game.discount_percent}%
          </span>
        )}

        {/* Genre tag */}
        {game.genre && (
          <span
            className={`absolute left-2 ${onSale ? 'top-9' : 'top-2'} bg-black/60 px-2 py-0.5 font-inter text-[9px] uppercase tracking-widest text-white/60 backdrop-blur-sm`}
          >
            {game.genre}
          </span>
        )}

        {/* Wishlist */}
        <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <WishlistButton slug={game.slug} />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 bg-zinc-900 p-4">
        <h3 className="line-clamp-2 font-inter text-sm font-semibold uppercase leading-tight tracking-wide text-white/90">
          {game.title}
        </h3>

        {game.platform && (
          <p className="font-inter text-[10px] uppercase tracking-widest text-white/35">
            {game.platform}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            {onSale && (
              <span className="font-inter text-[11px] text-white/30 line-through">
                {formatPrice(game.price)}
              </span>
            )}
            <span className="font-inter text-base font-bold text-white">
              {formatPrice(price)}
            </span>
          </div>

          <AddToCartButton game={game} size="sm" />
        </div>
      </div>
    </Link>
  )
}
