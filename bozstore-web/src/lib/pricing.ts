import type { Game } from '@/types/game'

type Priceable = Pick<Game, 'price' | 'discount_percent'>

/** ¿El juego tiene una oferta activa? */
export function hasDiscount(game: Priceable): boolean {
  return (game.discount_percent ?? 0) > 0
}

/** Precio final a pagar (aplica el descuento si lo hay). */
export function finalPrice(game: Priceable): number {
  const base = Number(game.price)
  const price = Number.isFinite(base) ? base : 0
  const d = game.discount_percent ?? 0
  if (d <= 0) return price
  return Math.round(price * (1 - d / 100) * 100) / 100
}

/** Formatea un número como precio en dólares (USD), la misma moneda que cobra Stripe. */
export function formatPrice(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return `$${safe.toFixed(2)}`
}
