import Stripe from 'stripe'
import { env } from './env'
import { AppError } from '../lib/errors'

/** Tipo de la instancia de Stripe (la clase, ya construida). */
export type StripeClient = InstanceType<typeof Stripe>

let _stripe: StripeClient | null = null

/**
 * Devuelve el cliente Stripe, creándolo de forma perezosa.
 * Lanza un error claro si STRIPE_SECRET_KEY no está configurada,
 * para que el resto del servidor pueda arrancar sin la clave.
 */
export function getStripe(): StripeClient {
  if (!env.STRIPE_SECRET_KEY) {
    throw new AppError(
      503,
      'Stripe no está configurado. Falta STRIPE_SECRET_KEY en el .env del API.',
      'STRIPE_NOT_CONFIGURED',
    )
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY)
  }
  return _stripe
}

export const isStripeConfigured = () => Boolean(env.STRIPE_SECRET_KEY)
