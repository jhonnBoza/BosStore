'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AuthShell,
  AuthHeading,
  AuthInput,
  AuthError,
  AuthNotice,
  AuthSubmit,
} from './ui'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // El usuario llega autenticado tras el enlace de recuperación (callback ya
  // canjeó el código por una sesión). Verificamos que exista esa sesión.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError('No se pudo actualizar la contraseña. Solicita un nuevo enlace.')
      return
    }
    setDone(true)
    setTimeout(() => { window.location.href = '/account' }, 1500)
  }

  if (done) {
    return (
      <AuthShell>
        <AuthHeading title="¡Listo!" subtitle="Tu contraseña fue actualizada." />
        <AuthNotice>Redirigiéndote a tu cuenta…</AuthNotice>
      </AuthShell>
    )
  }

  if (hasSession === false) {
    return (
      <AuthShell>
        <AuthHeading
          title="Enlace inválido"
          subtitle="El enlace de recuperación expiró o no es válido. Solicita uno nuevo."
        />
        <Link
          href="/forgot-password"
          className="inline-flex bg-red-600 px-6 py-3 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700"
        >
          Solicitar nuevo enlace
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Nueva contraseña"
        subtitle="Crea una contraseña nueva para tu cuenta."
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthError>{error}</AuthError>

        <AuthInput
          label="Nueva contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthInput
          label="Confirmar contraseña"
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          placeholder="Repite tu contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <AuthSubmit loading={loading || hasSession === null}>
          Actualizar contraseña
        </AuthSubmit>
      </form>
    </AuthShell>
  )
}
