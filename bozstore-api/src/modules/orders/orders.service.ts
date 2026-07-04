import { supabaseAdmin } from '../../config/supabase'
import { NotFoundError } from '../../lib/errors'

/**
 * Lista las órdenes del usuario autenticado, con sus ítems anidados,
 * de la más reciente a la más antigua. Usa el SERVICE ROLE y filtra por
 * user_id, así que nunca devuelve compras de otros usuarios.
 */
export async function findOrdersByUser(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,
      total,
      currency,
      status,
      created_at,
      order_items (
        id,
        game_slug,
        title,
        price,
        quantity,
        cover_url
      )
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Lista TODAS las órdenes de la tienda (solo admin), con ítems anidados,
 * de la más reciente a la más antigua.
 */
export async function findAllOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,
      user_email,
      total,
      currency,
      status,
      created_at,
      order_items (
        id,
        game_slug,
        title,
        price,
        quantity,
        cover_url
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Devuelve una orden concreta del usuario (con sus ítems). Lanza 404 si
 * no existe o no pertenece al usuario — no se filtra por otra vía.
 */
export async function findUserOrderById(userId: string, orderId: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      id,
      total,
      currency,
      status,
      created_at,
      order_items (
        id,
        game_slug,
        title,
        price,
        quantity,
        cover_url
      )
    `,
    )
    .eq('user_id', userId)
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new NotFoundError('Order')
  return data
}
