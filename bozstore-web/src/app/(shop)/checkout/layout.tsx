import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — BosStore',
  description: 'Completa tu compra de forma segura con Stripe.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
