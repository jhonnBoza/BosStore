import { randomInt } from 'crypto'
import { supabaseAdmin } from '../../config/supabase'
import { sendOtpEmail } from '../../lib/mailer'
import { AppError, ValidationError } from '../../lib/errors'

type Pending = {
  email: string
  password: string
  fullName: string
  code: string
  expiresAt: number
  attempts: number
  lastSentAt: number
}

// Registros pendientes en memoria (suficiente para un solo proceso).
// Si el API se reinicia, los códigos pendientes se pierden y el usuario
// simplemente solicita uno nuevo.
const pending = new Map<string, Pending>()

const TTL_MS          = 10 * 60 * 1000 // el código vive 10 minutos
const RESEND_COOLDOWN = 30 * 1000      // mínimo entre envíos
const MAX_ATTEMPTS    = 5              // intentos de código antes de invalidar

function genCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

/** Genera y envía un código de verificación de 6 dígitos al correo. */
export async function requestOtp(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  const key = email.toLowerCase().trim()

  const existing = pending.get(key)
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN) {
    throw new AppError(
      429,
      'Espera unos segundos antes de solicitar otro código.',
      'RATE_LIMITED',
    )
  }

  const code = genCode()
  pending.set(key, {
    email: key,
    password,
    fullName,
    code,
    expiresAt: Date.now() + TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  })

  // Si el envío falla, no dejamos un pendiente "fantasma".
  try {
    await sendOtpEmail(key, code)
  } catch (err) {
    pending.delete(key)
    throw err
  }
}

/** Verifica el código y, si es correcto, crea el usuario ya confirmado en Supabase. */
export async function verifyOtp(email: string, code: string): Promise<void> {
  const key = email.toLowerCase().trim()
  const p = pending.get(key)

  if (!p) {
    throw new ValidationError(
      'No hay un registro pendiente para este correo. Solicita un código nuevo.',
    )
  }
  if (Date.now() > p.expiresAt) {
    pending.delete(key)
    throw new ValidationError('El código expiró. Solicita uno nuevo.')
  }
  if (p.attempts >= MAX_ATTEMPTS) {
    pending.delete(key)
    throw new ValidationError('Demasiados intentos. Solicita un código nuevo.')
  }
  if (p.code !== code) {
    p.attempts += 1
    throw new ValidationError('Código incorrecto. Verifica e intenta de nuevo.')
  }

  // Código correcto → crear el usuario ya confirmado (admin no envía correos).
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email: p.email,
    password: p.password,
    email_confirm: true,
    user_metadata: { full_name: p.fullName || undefined },
  })

  pending.delete(key)

  if (error) {
    const msg = (error.message ?? '').toLowerCase()
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      throw new AppError(409, 'Ya existe una cuenta con este correo.', 'EMAIL_EXISTS')
    }
    throw new AppError(500, 'No se pudo crear la cuenta. Intenta de nuevo.', 'CREATE_FAILED')
  }
}
