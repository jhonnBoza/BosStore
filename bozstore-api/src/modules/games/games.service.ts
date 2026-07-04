import { supabaseAdmin } from '../../config/supabase'
import { NotFoundError } from '../../lib/errors'
import type { GameInput } from './games.schema'

export type ListGamesOptions = {
  q?: string
  limit?: number
  offset?: number
}

export async function findAllGames({ q, limit, offset }: ListGamesOptions = {}) {
  let query = supabaseAdmin
    .from('games')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Búsqueda por texto en título, género y desarrollador.
  // Se limpian los caracteres reservados de la sintaxis .or() de PostgREST.
  const term = q?.trim().replace(/[,()%]/g, '')
  if (term) {
    query = query.or(
      `title.ilike.%${term}%,genre.ilike.%${term}%,developer.ilike.%${term}%`,
    )
  }

  // Paginación opcional: sin limit se devuelve todo (compatibilidad con el frontend)
  if (limit !== undefined) {
    const from = offset ?? 0
    query = query.range(from, from + limit - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { games: data ?? [], total: count ?? 0 }
}

export async function findGameBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) throw new NotFoundError('Game')
  return data
}

export async function createGame(input: GameInput) {
  const { data, error } = await supabaseAdmin
    .from('games')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGame(slug: string, input: Partial<GameInput>) {
  const { data, error } = await supabaseAdmin
    .from('games')
    .update(input)
    .eq('slug', slug)
    .select()
    .single()

  if (error || !data) throw new NotFoundError('Game')
  return data
}

export async function deleteGame(slug: string) {
  const { error } = await supabaseAdmin.from('games').delete().eq('slug', slug)
  if (error) throw new NotFoundError('Game')
}
