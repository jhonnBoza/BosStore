'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safeNext'
import {
  AuthShell,
  AuthHeading,
  AuthInput,
  AuthError,
  AuthSubmit,
  AuthDivider,
  OAuthButtons,
  translateAuthError,
} from './ui'

export default function LoginForm({
  next,
  error: initialError,
}: {
  next?: string
  error?: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    initialError
      ? 'Hubo un problema al autenticarte. Intenta de nuevo.'
      : '',
  )

  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : '/register'
  const forgotHref = email
    ? `/forgot-password?email=${encodeURIComponent(email)}`
    : '/forgot-password'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (signInError) {
      setError(translateAuthError(signInError.message))
      setLoading(false)
      return
    }
    // Hard navigation so middleware + server components pick up the session cookie
    window.location.href = safeNext(next)
  }

  return (
    <AuthShell>
      <AuthHeading
        title="Bienvenido"
        subtitle="Inicia sesión para gestionar tus pedidos y tu biblioteca."
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

        <div>
          <AuthInput
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 text-right">
            <Link
              href={forgotHref}
              className="font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-red-400"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <AuthSubmit loading={loading}>Iniciar sesión</AuthSubmit>
      </form>

      <div className="my-6">
        <AuthDivider />
      </div>

      <OAuthButtons next={next} disabled={loading} />

      <p className="mt-8 text-center font-inter text-xs text-white/40">
        ¿No tienes cuenta?{' '}
        <Link
          href={registerHref}
          className="font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          Crear cuenta
        </Link>
      </p>
    </AuthShell>
  )
}
