'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Shield,
  Zap,
} from 'lucide-react'
import { useCartStore, cartTotal, cartCount, useCartHydrated } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/pricing'

const ACCEPTED = ['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL']

export default function CheckoutPage() {
  const router = useRouter()
  const { items: rawItems } = useCartStore()
  const hydrated = useCartHydrated()
  const items = hydrated ? rawItems : []
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = cartTotal(items)
  const count = cartCount(items)

  const handlePay = async () => {
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        router.push('/login?next=/checkout')
        return
      }

      const base =
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
      const res = await fetch(`${base}/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantity: i.quantity })),
        }),
      })

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        const code = json?.error?.code
        if (code === 'STRIPE_NOT_CONFIGURED') {
          setError(
            'Los pagos aún no están activados. Falta pegar las claves de Stripe en el servidor (.env del API).',
          )
        } else {
          setError(json?.error?.message ?? 'No se pudo iniciar el pago.')
        }
        return
      }

      // Redirige a la página de pago alojada por Stripe
      const url = json?.data?.url
      if (!url) {
        setError('No se pudo iniciar el pago. Intenta de nuevo.')
        return
      }
      window.location.href = url
    } catch {
      setError('Error de conexión. ¿Está corriendo el servidor del API (puerto 4000)?')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-500" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-podium text-3xl uppercase text-white/40">
          Tu carrito está vacío
        </p>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 bg-red-600 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 lg:px-16">
      <Link
        href="/games"
        className="mb-8 inline-flex items-center gap-2 font-inter text-xs uppercase tracking-widest text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Seguir comprando
      </Link>

      <h1 className="mb-10 font-podium text-4xl uppercase tracking-tight text-white sm:text-5xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-16">

        {/* Left: pago */}
        <div className="lg:col-span-3">
          <h2 className="mb-6 font-podium text-lg uppercase tracking-wide text-white">
            Pago seguro
          </h2>

          {/* Stripe card */}
          <div className="border border-white/10 bg-zinc-900 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center border border-red-600/40 bg-red-600/10 text-red-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-inter text-sm font-medium text-white">
                  Tarjeta, PayPal y más
                </p>
                <p className="mt-0.5 font-inter text-[11px] text-white/40">
                  Procesado de forma segura por Stripe
                </p>
              </div>
            </div>

            {/* Métodos aceptados */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {ACCEPTED.map((m) => (
                <span
                  key={m}
                  className="border border-white/10 bg-white/5 px-3 py-1.5 font-inter text-[10px] font-semibold uppercase tracking-widest text-white/50"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 border border-red-600/30 bg-red-600/5 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-inter text-xs leading-relaxed text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 bg-red-600 py-4 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirigiendo a Stripe...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pagar {formatPrice(total)}
              </>
            )}
          </button>

          <p className="mt-4 text-center font-inter text-[10px] leading-relaxed text-white/30">
            Al pagar serás redirigido a la pasarela segura de Stripe.
            <br />
            No almacenamos los datos de tu tarjeta.
          </p>
        </div>

        {/* Right: resumen */}
        <div className="lg:col-span-2">
          <div className="border border-white/10 bg-zinc-900 p-6">
            <h2 className="mb-5 font-podium text-lg uppercase tracking-wide text-white">
              Resumen ({count} {count === 1 ? 'ítem' : 'ítems'})
            </h2>

            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden bg-zinc-800">
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-podium text-sm uppercase text-white/15">
                          {item.title.slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-inter text-xs font-medium leading-tight text-white/90">
                      {item.title}
                    </p>
                    <p className="mt-0.5 font-inter text-[10px] text-white/40">
                      x{item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-inter text-sm font-bold text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
              <div className="flex justify-between font-inter text-sm text-white/50">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between font-inter text-sm text-white/50">
                <span>Envío digital</span>
                <span className="text-emerald-400">Gratis</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 font-inter text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 border-t border-white/10 pt-5">
              <div className="flex items-center gap-1.5 font-inter text-[9px] uppercase tracking-widest text-white/30">
                <Lock className="h-3 w-3" />
                SSL
              </div>
              <div className="flex items-center gap-1.5 font-inter text-[9px] uppercase tracking-widest text-white/30">
                <Shield className="h-3 w-3" />
                Seguro
              </div>
              <div className="flex items-center gap-1.5 font-inter text-[9px] uppercase tracking-widest text-white/30">
                <Zap className="h-3 w-3" />
                Instantáneo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
