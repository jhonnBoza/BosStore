'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteGame } from '@/app/actions/games'

export default function DeleteGameButton({
  slug,
  title,
}: {
  slug: string
  title: string
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!window.confirm(`¿Eliminar "${title}"?\n\nEsta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await deleteGame(slug)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Eliminar ${title}`}
      className="text-white/25 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}
