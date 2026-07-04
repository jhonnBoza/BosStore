'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { safeNext } from '@/lib/safeNext'
import {
  AuthShell,
  AuthHeading,
  AuthInput,
  AuthError,
  AuthNotice,
  AuthSubmit,
  AuthDivider,
  OAuthButtons,
} from './ui'

type Step = 'form' | 'otp'

export default function RegisterForm({ next }: { next?: string }) {
  const [step, setStep] = useState<Step>('form')

  // form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  // otp
  const [code, setCode] = useState('')
  const [resent, setResent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

  // Pide al API que genere y envíe un código de 6 dígitos al correo.
  // Todo el fetch va en try/catch: si la red falla (timeout, CORS, servidor
  // caído) no debe dejar el botón en "cargando" para siempre.
  const sendCode = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: name.trim(),
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        if (json?.error?.code === 'SMTP_NOT_CONFIGURED') {
          setError('El envío de correos no está configurado en el servidor (faltan credenciales SMTP en el API).')
        } else {
          setError(json?.error?.message ?? 'No se pudo enviar el código. Intenta de nuevo.')
        }
        return false
      }
      return true
    } catch {
      setError('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
      return false
    }
  }

  const submitForm = async (e: React.FormEvent) => {
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
    const ok = await sendCode()
    setLoading(false)
    if (ok) setStep('otp')
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1) El API valida el código y crea la cuenta ya confirmada en Supabase.
      const res = await fetch(`${API_BASE}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error?.message ?? 'Código incorrecto. Intenta de nuevo.')
        return
      }

      // 2) Iniciamos sesión con la contraseña para obtener la sesión en el navegador.
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) {
        setError('Cuenta creada. Inicia sesión con tu correo y contraseña.')
        return
      }
      window.location.href = safeNext(next)
    } catch {
      setError('No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError('')
    setResent(false)
    const ok = await sendCode()
    if (ok) setResent(true)
  }

  // ── Paso 2: verificación por código ──
  if (step === 'otp') {
    return (
      <AuthShell>
        <button
          type="button"
          onClick={() => { setStep('form'); setError(''); setResent(false) }}
          className="mb-6 inline-flex items-center gap-2 font-inter text-[10px] uppercase tracking-widest text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>

        <div className="mb-6 flex h-12 w-12 items-center justify-center border border-red-600/30 bg-red-600/10">
          <MailCheck className="h-5 w-5 text-red-500" />
        </div>

        <AuthHeading
          title="Verifica tu correo"
          subtitle={`Enviamos un código de 6 dígitos a ${email}. Ingrésalo para activar tu cuenta. Revisa también tu carpeta de spam.`}
        />

        <form onSubmit={verifyCode} className="space-y-4">
          <AuthError>{error}</AuthError>
          {resent && <AuthNotice>Código reenviado. Revisa tu bandeja.</AuthNotice>}

          <label htmlFor="otp-code" className="sr-only">
            Código de verificación de 6 dígitos
          </label>
          <input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label="Código de verificación de 6 dígitos"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-white/10 bg-white/5 px-4 py-4 text-center font-podium text-3xl tracking-[0.5em] text-white placeholder-white/15 outline-none transition-colors focus:border-red-500/50"
          />

          <AuthSubmit loading={loading}>Verificar y entrar</AuthSubmit>
        </form>

        <p className="mt-6 text-center font-inter text-xs text-white/40">
          ¿No te llegó?{' '}
          <button
            type="button"
            onClick={resend}
            className="font-semibold text-red-500 transition-colors hover:text-red-400"
          >
            Reenviar código
          </button>
        </p>
      </AuthShell>
    )
  }

  // ── Paso 1: datos de la cuenta ──
  return (
    <AuthShell>
      <AuthHeading
        title="Crear cuenta"
        subtitle="Regístrate para comprar juegos y construir tu biblioteca."
      />

      <form onSubmit={submitForm} className="space-y-4">
        <AuthError>{error}</AuthError>

        <AuthInput
          label="Nombre"
          type="text"
          name="name"
          autoComplete="name"
          required
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <AuthInput
          label="Contraseña"
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

        <AuthSubmit loading={loading}>Crear cuenta</AuthSubmit>
      </form>

      <div className="my-6">
        <AuthDivider />
      </div>

      <OAuthButtons next={next} disabled={loading} />

      <p className="mt-8 text-center font-inter text-xs text-white/40">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={loginHref}
          className="font-semibold text-red-500 transition-colors hover:text-red-400"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  )
}
