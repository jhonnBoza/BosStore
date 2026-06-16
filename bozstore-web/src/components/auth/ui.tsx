'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ─── Shell ────────────────────────────────────────────────────────────────────

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
      {/* Ambient red glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.07),transparent_60%)]" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-10 inline-block font-podium text-4xl uppercase tracking-tight text-white"
        >
          Bos<span className="text-red-600">Store</span>
        </Link>
        {children}
      </div>
    </div>
  )
}

export function AuthHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8">
      <h1 className="font-podium text-3xl uppercase tracking-tight text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 font-inter text-sm leading-relaxed text-white/45">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

export function AuthInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </span>
      <input
        {...props}
        className="w-full border border-white/10 bg-white/5 px-4 py-3 font-inter text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-red-500/50"
      />
    </label>
  )
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export function AuthError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <div className="border border-red-600/30 bg-red-600/10 px-4 py-3">
      <p className="font-inter text-xs leading-relaxed text-red-400">{children}</p>
    </div>
  )
}

export function AuthNotice({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return (
    <div className="border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
      <p className="font-inter text-xs leading-relaxed text-emerald-300">
        {children}
      </p>
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function AuthSubmit({
  loading,
  children,
}: {
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 bg-red-600 py-3.5 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

export function AuthDivider({ label = 'o continúa con' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-white/10" />
      <span className="font-inter text-[9px] uppercase tracking-widest text-white/25">
        {label}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  )
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

type Provider = 'google' | 'discord'

const PROVIDERS: { id: Provider; label: string; icon: React.ReactNode }[] = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    label: 'Discord',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#5865F2" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
]

export function OAuthButtons({
  next,
  disabled,
}: {
  next?: string
  disabled?: boolean
}) {
  const [loading, setLoading] = useState<Provider | null>(null)

  const signIn = async (provider: Provider) => {
    setLoading(provider)
    const supabase = createClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (next) callbackUrl.searchParams.set('next', next)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    })
    if (error) setLoading(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {PROVIDERS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => signIn(id)}
          disabled={disabled || !!loading}
          className="flex items-center justify-center gap-2 border border-white/10 bg-white/5 px-4 py-3 font-inter text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading === id ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Error translation ────────────────────────────────────────────────────────

export function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials'))
    return 'Correo o contraseña incorrectos.'
  if (m.includes('email not confirmed'))
    return 'Aún no confirmas tu correo. Revisa tu bandeja e ingresa el código.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta con este correo. Inicia sesión.'
  if (m.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('token has expired') || (m.includes('invalid') && m.includes('otp')))
    return 'El código es inválido o expiró. Solicita uno nuevo.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera un momento e intenta de nuevo.'
  if (m.includes('unable to validate email'))
    return 'El correo no tiene un formato válido.'
  return 'Ocurrió un error. Intenta de nuevo.'
}

export { Link }
