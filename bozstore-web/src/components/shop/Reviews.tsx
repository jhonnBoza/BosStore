'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Review = {
  id: string
  user_id: string
  user_name: string | null
  user_avatar: string | null
  rating: number
  comment: string | null
  created_at: string
}

function Stars({
  value,
  onSelect,
  onHover,
  hover,
  size = 'sm',
}: {
  value: number
  onSelect?: (n: number) => void
  onHover?: (n: number) => void
  hover?: number
  size?: 'sm' | 'lg'
}) {
  const cls = size === 'lg' ? 'h-6 w-6' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(n)}
            onMouseEnter={() => onHover?.(n)}
            onMouseLeave={() => onHover?.(0)}
            className={onSelect ? 'cursor-pointer' : 'cursor-default'}
            aria-label={`${n} estrellas`}
          >
            <Star
              className={`${cls} transition-colors ${
                active ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export default function Reviews({ gameSlug }: { gameSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('game_slug', gameSlug)
      .order('created_at', { ascending: false })
    setReviews((data as Review[]) ?? [])
    setLoading(false)
  }, [gameSlug])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
    })
    load()
  }, [load])

  const myReview = reviews.find((r) => r.user_id === userId)
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating)
      setComment(myReview.comment ?? '')
    }
  }, [myReview])

  const submit = async () => {
    setError(null)
    if (rating < 1) {
      setError('Selecciona una calificación (1-5 estrellas).')
      return
    }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const next = encodeURIComponent(window.location.pathname)
        window.location.href = `/login?next=${next}`
        return
      }
      const { error: upErr } = await supabase.from('reviews').upsert(
        {
          game_slug: gameSlug,
          user_id: user.id,
          user_name:
            (user.user_metadata?.full_name as string | undefined) ??
            user.email ??
            'Usuario',
          user_avatar:
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: 'game_slug,user_id' },
      )
      if (upErr) {
        setError('No se pudo enviar la reseña. Intenta de nuevo.')
      } else {
        await load()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-12 border-t border-white/10 pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-podium text-2xl uppercase tracking-wide text-white">
          Reseñas
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-podium text-3xl text-white">
              {avg.toFixed(1)}
            </span>
            <div>
              <Stars value={Math.round(avg)} />
              <p className="mt-0.5 font-inter text-[10px] uppercase tracking-widest text-white/40">
                {reviews.length}{' '}
                {reviews.length === 1 ? 'reseña' : 'reseñas'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="mb-10 border border-white/10 bg-zinc-900 p-6">
        <p className="mb-3 font-inter text-xs uppercase tracking-widest text-white/40">
          {myReview ? 'Edita tu reseña' : 'Escribe una reseña'}
        </p>
        <Stars
          value={rating}
          hover={hover}
          onSelect={setRating}
          onHover={setHover}
          size="lg"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="¿Qué te pareció el juego? (opcional)"
          className="mt-4 w-full resize-none border border-white/10 bg-zinc-800 px-4 py-2.5 font-inter text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-red-500/40"
        />
        {error && (
          <p className="mt-2 font-inter text-[11px] text-red-500">{error}</p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="mt-4 inline-flex items-center gap-2 bg-red-600 px-6 py-2.5 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {myReview ? 'Actualizar reseña' : 'Publicar reseña'}
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="py-6 text-center font-inter text-sm text-white/40">
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>
      ) : (
        <ul className="space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-white/10 pb-5 last:border-0">
              <div className="flex items-center gap-3">
                {r.user_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.user_avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center bg-red-600 font-inter text-xs font-bold uppercase text-white">
                    {(r.user_name ?? 'U').charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-inter text-sm font-medium text-white">
                    {r.user_name ?? 'Usuario'}
                    {r.user_id === userId && (
                      <span className="ml-2 font-inter text-[9px] uppercase tracking-widest text-white/40">
                        (tú)
                      </span>
                    )}
                  </p>
                  <Stars value={r.rating} />
                </div>
              </div>
              {r.comment && (
                <p className="mt-3 font-inter text-sm leading-relaxed text-white/50">
                  {r.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
