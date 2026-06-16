import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../config/env'
import { AppError } from './errors'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true para 465, false para 587
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  }
  return transporter
}

export function isMailerConfigured(): boolean {
  return !!(env.SMTP_USER && env.SMTP_PASS)
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const t = getTransporter()
  if (!t) {
    throw new AppError(
      503,
      'El envío de correos no está configurado en el servidor. Falta SMTP_USER y SMTP_PASS en el .env del API.',
      'SMTP_NOT_CONFIGURED',
    )
  }

  const from = env.SMTP_FROM || env.SMTP_USER
  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px">
    <h1 style="margin:0 0 4px;font-size:22px;letter-spacing:1px">Bos<span style="color:#dc2626">Store</span></h1>
    <p style="color:#a1a1aa;font-size:13px;margin:0 0 24px">Verificación de tu cuenta</p>
    <p style="font-size:14px;color:#d4d4d8;margin:0 0 12px">Tu código de verificación es:</p>
    <div style="font-size:38px;font-weight:bold;letter-spacing:12px;background:#18181b;border:1px solid #27272a;border-radius:8px;padding:18px;text-align:center;color:#fff">${code}</div>
    <p style="font-size:12px;color:#71717a;margin:20px 0 0">Este código expira en 10 minutos. Si no creaste una cuenta en BosStore, ignora este correo.</p>
  </div>`

  await t.sendMail({
    from: `BosStore <${from}>`,
    to,
    subject: `${code} es tu código de verificación — BosStore`,
    text: `Tu código de verificación de BosStore es: ${code} (expira en 10 minutos).`,
    html,
  })
}
