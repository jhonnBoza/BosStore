'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

function youtubeId(url?: string | null): string | null {
  if (!url) return null
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  )
  return m ? m[1] : null
}

type Media =
  | { type: 'video'; id: string }
  | { type: 'image'; url: string }

export default function GameGallery({
  screenshots = [],
  trailerUrl,
  title,
}: {
  screenshots?: string[]
  trailerUrl?: string | null
  title: string
}) {
  const ytId = youtubeId(trailerUrl)
  const media: Media[] = [
    ...(ytId ? [{ type: 'video' as const, id: ytId }] : []),
    ...screenshots.map((url) => ({ type: 'image' as const, url })),
  ]

  const [active, setActive] = useState(0)
  if (media.length === 0) return null
  const current = media[Math.min(active, media.length - 1)]

  return (
    <div className="mb-10">
      <h2 className="mb-5 font-podium text-xl uppercase tracking-wide text-white">
        Galería
      </h2>

      {/* Media principal */}
      <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-zinc-900">
        {current.type === 'video' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${current.id}`}
            title={`${title} — tráiler`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Miniaturas */}
      {media.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-video w-28 shrink-0 overflow-hidden border transition-colors ${
                i === active
                  ? 'border-red-500'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {m.type === 'video' ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${m.id}/mqdefault.jpg`}
                    alt="Tráiler"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
