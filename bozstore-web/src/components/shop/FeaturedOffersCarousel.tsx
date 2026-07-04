'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Game } from '@/types/game'
import { finalPrice, formatPrice } from '@/lib/pricing'

export default function FeaturedOffersCarousel({ games }: { games: Game[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (games.length <= 1) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % games.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [games.length])

  if (games.length === 0) return null

  const game = games[active]
  const previous = () => setActive((current) => (current - 1 + games.length) % games.length)
  const next = () => setActive((current) => (current + 1) % games.length)

  return (
    <div className="relative overflow-hidden border border-zinc-200 bg-zinc-50 dark:border-white/5 dark:bg-zinc-900/40">
      <Link
        href={`/games/${game.slug}`}
        className="group grid min-h-[300px] grid-cols-1 sm:grid-cols-[44%_1fr]"
      >
        <div className="relative min-h-[260px] overflow-hidden bg-zinc-200 dark:bg-zinc-800 sm:min-h-[340px]">
          {game.cover_url ? (
            <Image
              key={game.cover_url}
              src={game.cover_url}
              alt={game.title}
              fill
              sizes="(max-width:640px) 100vw, 520px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="select-none font-podium text-8xl uppercase text-zinc-300 dark:text-white/5">
                {game.title.slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        <div className="relative flex min-w-0 flex-col justify-center p-7 sm:p-10 lg:p-12">
          <span className="mb-5 w-fit bg-red-100 px-2.5 py-1.5 font-inter text-[10px] font-bold text-red-600 dark:bg-red-600/20 dark:text-red-400">
            Oferta
          </span>
          <p className="max-w-xl font-inter text-3xl font-bold leading-tight text-zinc-900 dark:text-white sm:text-4xl">
            {game.title}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <span className="bg-red-600 px-3 py-2 font-inter text-sm font-bold text-white">
              -{game.discount_percent}%
            </span>
            <span className="font-inter text-base text-zinc-400 line-through dark:text-white/25">
              {formatPrice(game.price)}
            </span>
            <span className="font-inter text-4xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(finalPrice(game))}
            </span>
          </div>
          <ArrowUpRight className="absolute bottom-6 right-6 h-5 w-5 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-red-500 dark:text-white/20" />
        </div>
      </Link>

      {games.length > 1 && (
        <>
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {games.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver oferta ${index + 1}`}
                className={`h-1.5 transition-all ${
                  index === active
                    ? 'w-8 bg-red-600'
                    : 'w-3 bg-zinc-300 hover:bg-zinc-400 dark:bg-white/20 dark:hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={previous}
            aria-label="Oferta anterior"
            className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-zinc-200 bg-white/85 text-zinc-700 backdrop-blur transition-colors hover:border-red-500 hover:text-red-500 dark:border-white/10 dark:bg-black/60 dark:text-white/60 dark:hover:text-white sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente oferta"
            className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-zinc-200 bg-white/85 text-zinc-700 backdrop-blur transition-colors hover:border-red-500 hover:text-red-500 dark:border-white/10 dark:bg-black/60 dark:text-white/60 dark:hover:text-white sm:flex"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  )
}
