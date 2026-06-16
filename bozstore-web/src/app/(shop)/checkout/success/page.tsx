'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Gamepad2, Loader2, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { createClient } from '@/lib/supabase/client'

function SuccessContent() {
  const clearCart = useCartStore((s) => s.clearCart)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const done = useRef(false)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    if (done.current) return
    done.current = true

    const confirm = async () => {
      // Sin session_id no hay nada que confirmar (acceso directo)
      if (!sessionId) {
        clearCart()
        setState('ok')
        return
      }
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const token = session?.access_token

        const base =
          process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
        await fetch(`${base}/payments/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ session_id: sessionId }),
        })
      } catch {
        // aunque falle el registro, el pago ya se hizo; no bloqueamos al usuario
      } finally {
        clearCart()
        setState('ok')
      }
    }

    confirm()
  }, [sessionId, clearCart])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      {state === 'loading' ? (
        <>
          <Loader2 className="mb-6 h-12 w-12 animate-spin text-red-500" />
          <p className="font-inter text-sm text-white/50">
            Confirmando tu compra...
          </p>
        </>
      ) : (
        <>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>

          <h1 className="font-podium text-4xl uppercase tracking-tight text-white sm:text-5xl">
            ¡Pago exitoso!
          </h1>

          <p className="mt-4 max-w-md font-inter text-sm leading-relaxed text-white/50">
            Gracias por tu compra. Tus juegos ya están en tu biblioteca, listos
            para descargar. Te enviamos un correo con los detalles.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 bg-red-600 px-6 py-3.5 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700"
            >
              <Package className="h-4 w-4" />
              Ver mi biblioteca
            </Link>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 border border-white/15 px-6 py-3.5 font-inter text-[11px] uppercase tracking-widest text-white/60 transition-colors hover:border-red-500 hover:text-white"
            >
              <Gamepad2 className="h-4 w-4" />
              Seguir explorando
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
