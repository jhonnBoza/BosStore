import { getStripe, type StripeClient } from '../../config/stripe'
import { supabaseAdmin } from '../../config/supabase'
import { env } from '../../config/env'
import { AppError, ValidationError } from '../../lib/errors'

export type CheckoutItem = { slug: string; quantity: number }

// Tipos derivados de la instancia de Stripe (evita depender del namespace export)
type SessionCreateParams = NonNullable<
  Parameters<StripeClient['checkout']['sessions']['create']>[0]
>
type LineItem = NonNullable<SessionCreateParams['line_items']>[number]
type CheckoutSession = Awaited<
  ReturnType<StripeClient['checkout']['sessions']['retrieve']>
>

/**
 * Crea una Stripe Checkout Session.
 * SEGURIDAD: nunca confiamos en los precios que manda el cliente —
 * se vuelven a leer desde la base de datos por slug.
 */
export async function createCheckoutSession(
  items: CheckoutItem[],
  userEmail: string,
  userId: string,
): Promise<string> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError('El carrito está vacío')
  }

  const slugs = items.map((i) => i.slug)

  const { data: games, error } = await supabaseAdmin
    .from('games')
    .select('slug, title, price, stock, cover_url, discount_percent')
    .in('slug', slugs)

  if (error) throw error
  if (!games || games.length === 0) {
    throw new ValidationError('No se encontraron los juegos del carrito')
  }

  const lineItems: LineItem[] = items.map((item) => {
    const game = games.find((g) => g.slug === item.slug)
    if (!game) throw new ValidationError(`Juego no encontrado: ${item.slug}`)

    const qty = Math.max(1, Math.floor(item.quantity))
    if (game.stock < qty) {
      throw new ValidationError(`Sin stock suficiente para "${game.title}"`)
    }

    // Aplica el descuento server-side (no se confía en el cliente)
    const discount = Number(game.discount_percent ?? 0)
    const unitPrice = Number(game.price) * (1 - discount / 100)

    return {
      quantity: qty,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(unitPrice * 100),
        product_data: {
          name: game.title,
          ...(game.cover_url ? { images: [game.cover_url] } : {}),
        },
      },
    }
  })

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    // Sin payment_method_types: Stripe muestra automáticamente todos los
    // métodos activados en tu dashboard (tarjeta Visa/MC/AMEX, etc.)
    ...(userEmail ? { customer_email: userEmail } : {}),
    success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/checkout`,
    metadata: {
      user_id: userId,
      slugs: slugs.join(','),
      quantities: items.map((i) => i.quantity).join(','),
    },
  })

  if (!session.url) {
    throw new AppError(502, 'Stripe no devolvió una URL de pago', 'STRIPE_NO_URL')
  }

  return session.url
}

/**
 * Recupera los datos de una sesión completada para mostrarlos en la
 * página de éxito (total pagado, email, estado).
 */
export async function getCheckoutSession(sessionId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    id: session.id,
    status: session.status,
    payment_status: session.payment_status,
    amount_total: session.amount_total,
    currency: session.currency,
    customer_email: session.customer_details?.email ?? session.customer_email,
  }
}

/**
 * Registra la orden (orden + ítems) a partir de una sesión PAGADA y
 * descuenta el stock. Es IDEMPOTENTE: si la sesión ya se registró
 * (mismo stripe_session_id) no hace nada. La llaman tanto el webhook
 * como la confirmación de la página de éxito.
 */
export async function recordOrderFromSession(
  session: CheckoutSession,
): Promise<void> {
  const userId = session.metadata?.user_id
  if (!userId) return
  if (session.payment_status !== 'paid') return

  // Idempotencia
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()
  if (existing) return

  const slugs = session.metadata?.slugs?.split(',').filter(Boolean) ?? []
  const quantities = session.metadata?.quantities?.split(',').map(Number) ?? []

  const { data: games } = await supabaseAdmin
    .from('games')
    .select('slug, title, price, cover_url, stock, discount_percent')
    .in('slug', slugs)
  if (!games || games.length === 0) return

  const items = slugs
    .map((slug, i) => {
      const g = games.find((x) => x.slug === slug)
      if (!g) return null
      const discount = Number(g.discount_percent ?? 0)
      const paidPrice =
        Math.round(Number(g.price) * (1 - discount / 100) * 100) / 100
      return {
        slug,
        title: g.title,
        price: paidPrice,
        cover_url: g.cover_url as string | null,
        qty: quantities[i] ?? 1,
        stock: g.stock as number,
      }
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  if (items.length === 0) return

  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0)

  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId,
      user_email:
        session.customer_details?.email ?? session.customer_email ?? null,
      stripe_session_id: session.id,
      total,
      currency: session.currency ?? 'usd',
      status: 'paid',
    })
    .select()
    .single()

  if (orderErr || !order) return

  await supabaseAdmin.from('order_items').insert(
    items.map((it) => ({
      order_id: order.id,
      game_slug: it.slug,
      title: it.title,
      price: it.price,
      quantity: it.qty,
      cover_url: it.cover_url,
    })),
  )

  // Descontar stock de cada juego comprado
  for (const it of items) {
    await supabaseAdmin
      .from('games')
      .update({ stock: Math.max(0, it.stock - it.qty) })
      .eq('slug', it.slug)
  }

  console.log(`✅ Orden registrada: ${order.id} (${items.length} juegos)`)
}

/**
 * Confirma una compra desde la página de éxito (sin depender del webhook).
 * Verifica con Stripe que la sesión está pagada y que pertenece al usuario.
 */
export async function confirmCheckout(sessionId: string, userId: string) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.metadata?.user_id && session.metadata.user_id !== userId) {
    throw new AppError(403, 'Esta compra no te pertenece', 'FORBIDDEN')
  }

  await recordOrderFromSession(session as CheckoutSession)

  return {
    paid: session.payment_status === 'paid',
    amount_total: session.amount_total,
    currency: session.currency,
  }
}

/**
 * Verifica la firma del webhook y procesa el evento.
 * Requiere el body CRUDO (Buffer), no JSON parseado.
 */
export async function handleWebhook(rawBody: Buffer, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError(
      503,
      'Webhook no configurado. Falta STRIPE_WEBHOOK_SECRET.',
      'WEBHOOK_NOT_CONFIGURED',
    )
  }

  const stripe = getStripe()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    )
  } catch {
    throw new ValidationError('Firma de webhook inválida')
  }

  if (event.type === 'checkout.session.completed') {
    await recordOrderFromSession(event.data.object as CheckoutSession)
  }

  return event
}
