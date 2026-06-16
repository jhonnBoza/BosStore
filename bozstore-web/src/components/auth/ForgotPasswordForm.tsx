'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  AuthShell,
  AuthHeading,
  AuthInput,
  AuthError,
  AuthSubmit,
} from './ui'

export default function ForgotPasswordForm({
  defaultEmail = '',
}: {
  defaultEmail?: string
}) {
  const [email, setEmail] = useState(defaultEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      },
    )
    setLoading(false)
    if (resetError) {
      setError('No se pudo enviar el correo. Intenta de nuevo.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="mb-6 flex h-12 w-12 items-center justify-center border border-emerald-500/30 bg-emerald-500/10">
          <MailCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <AuthHeading
          title="Revisa tu correo"
          subtitle={`Si existe una cuenta con ${email}, te enviamos un enlace para restablecer tu contraseña.`}
        />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a iniciar sesión
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Recuperar acceso"
        subtitle="Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña."
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthError>{error}</AuthError>

        <AuthInput
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <AuthSubmit loading={loading}>Enviar enlace</AuthSubmit>
      </form>

      <p className="mt-8 text-center font-inter text-xs text-white/40">
        <Link
          href="/login"
          className="font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          ← Volver a iniciar sesión
        </Link>
      </p>
    </AuthShell>
  )
}
