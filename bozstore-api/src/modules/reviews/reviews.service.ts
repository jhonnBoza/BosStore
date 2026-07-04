import { supabaseAdmin } from '../../config/supabase'

/**
 * Devuelve TODAS las reseñas de un juego usando el service role.
 * Así todos los usuarios ven todas las reseñas, sin depender de las
 * políticas RLS de la tabla (que solo cubrían ciertos casos).
 */
export async function listReviewsByGame(gameSlug: string) {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, game_slug, user_id, user_name, user_avatar, rating, comment, created_at')
    .eq('game_slug', gameSlug)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
