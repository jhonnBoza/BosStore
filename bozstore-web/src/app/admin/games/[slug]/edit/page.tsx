import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Game } from '@/types/game'
import GameForm from '@/components/admin/GameForm'
import { updateGame } from '@/app/actions/games'

async function fetchGame(slug: string): Promise<Game | null> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
  try {
    const res = await fetch(`${base}/games/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as { data: Game }
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const game = await fetchGame(slug)
  return { title: game ? `Editar: ${game.title} — Admin` : 'Juego no encontrado — Admin' }
}

export default async function EditGamePage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const game = await fetchGame(slug)
  if (!game) notFound()

  const action = updateGame.bind(null, slug)

  return (
    <div className="px-6 py-8 sm:px-8">
      <Link
        href="/admin/games"
        className="mb-8 inline-flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a juegos
      </Link>

      <h1 className="mb-1 font-podium text-3xl uppercase tracking-tight text-white">
        Editar juego
      </h1>
      <p className="mb-8 font-inter text-sm text-white/35">{game.title}</p>

      <GameForm action={action} game={game} submitLabel="Guardar cambios" />
    </div>
  )
}
