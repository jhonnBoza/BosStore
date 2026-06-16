'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionState = { errors?: Record<string, string>; message?: string } | null

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

async function getBearerToken(): Promise<string | undefined> {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token
}

async function apiFetch(path: string, init: RequestInit): Promise<Response> {
  const token = await getBearerToken()
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

function formToBody(formData: FormData) {
  const screenshotsRaw = ((formData.get('screenshots') as string) || '').trim()
  const screenshots = screenshotsRaw
    ? screenshotsRaw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined

  return {
    title:            formData.get('title'),
    slug:             formData.get('slug'),
    description:      formData.get('description') || undefined,
    price:            Number(formData.get('price')),
    cover_url:        formData.get('cover_url')    || undefined,
    banner_url:       formData.get('banner_url')   || undefined,
    genre:           formData.get('genre')        || undefined,
    platform:        formData.get('platform')     || undefined,
    stock:           Number(formData.get('stock')),
    discount_percent: Number(formData.get('discount_percent')) || 0,
    trailer_url:     formData.get('trailer_url')  || undefined,
    screenshots,
    developer:       formData.get('developer')    || undefined,
    release_date:    formData.get('release_date') || undefined,
  }
}

export async function createGame(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const res = await apiFetch('/games', {
    method: 'POST',
    body: JSON.stringify(formToBody(formData)),
  })

  if (!res.ok) {
    const json = (await res.json()) as {
      error: { message: string; details?: Record<string, string> }
    }
    return {
      message: json.error?.message ?? 'Error al crear el juego.',
      errors:  json.error?.details,
    }
  }

  revalidatePath('/admin/games')
  revalidatePath('/games')
  redirect('/admin/games')
}

export async function updateGame(
  originalSlug: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const res = await apiFetch(`/games/${originalSlug}`, {
    method: 'PATCH',
    body: JSON.stringify(formToBody(formData)),
  })

  if (!res.ok) {
    const json = (await res.json()) as {
      error: { message: string; details?: Record<string, string> }
    }
    return {
      message: json.error?.message ?? 'Error al actualizar el juego.',
      errors:  json.error?.details,
    }
  }

  revalidatePath('/admin/games')
  revalidatePath('/games')
  redirect('/admin/games')
}

export async function deleteGame(slug: string): Promise<void> {
  await apiFetch(`/games/${slug}`, { method: 'DELETE' })
  revalidatePath('/admin/games')
  revalidatePath('/games')
}
