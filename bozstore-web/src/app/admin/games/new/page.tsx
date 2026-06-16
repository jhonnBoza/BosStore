import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GameForm from '@/components/admin/GameForm'
import { createGame } from '@/app/actions/games'

export const metadata: Metadata = { title: 'Nuevo juego — Admin BosStore' }

export default function NewGamePage() {
  return (
    <div className="px-6 py-8 sm:px-8">
      <Link
        href="/admin/games"
        className="mb-8 inline-flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/60"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a juegos
      </Link>

      <h1 className="mb-8 font-podium text-3xl uppercase tracking-tight text-white">
        Nuevo juego
      </h1>

      <GameForm action={createGame} submitLabel="Crear juego" />
    </div>
  )
}

