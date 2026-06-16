'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function EditProfile({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: name.trim() },
    })
    setLoading(false)
    if (updateError) {
      setError('No se pudo guardar. Intenta de nuevo.')
      return
    }
    setSaved(true)
    setTimeout(() => window.location.reload(), 900)
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-end">
      <label className="flex-1">
        <span className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-white/40">
          Nombre para mostrar
        </span>
        <input
          type="text"
          name="full_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full border border-white/10 bg-white/5 px-4 py-2.5 font-inter text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-red-500/40"
        />
      </label>
      <button
        type="submit"
        disabled={loading || name.trim() === initialName.trim()}
        className="flex shrink-0 items-center justify-center gap-2 bg-red-600 px-6 py-2.5 font-inter text-[11px] uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5" />
        ) : null}
        {saved ? 'Guardado' : 'Guardar'}
      </button>
      {error && <p className="font-inter text-[11px] text-red-400">{error}</p>}
    </form>
  )
}
