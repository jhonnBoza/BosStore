import { supabaseAdmin } from '../../config/supabase'
import { NotFoundError } from '../../lib/errors'
import type { GameInput } from './games.schema'

export async function findAllGames() {
  const { data, error } = await supabaseAdmin
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
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
