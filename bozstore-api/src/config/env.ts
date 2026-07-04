import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV:                 z.enum(['development', 'test', 'production']).default('development'),
  PORT:                     z.coerce.number().default(4000),
  FRONTEND_URL:             z.string().url().default('http://localhost:3000'),
  SUPABASE_URL:             z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWKS_URL:        z.string().url(),
  // Stripe — opcionales: el servidor arranca sin ellas, los pagos se activan al rellenarlas
  STRIPE_SECRET_KEY:        z.string().default(''),
  STRIPE_WEBHOOK_SECRET:    z.string().default(''),
  // SMTP para envío de códigos de verificación — opcionales: el servidor arranca
  // sin ellas; el envío de correos se activa al rellenar SMTP_USER y SMTP_PASS.
  // Por defecto apunta a Gmail (smtp.gmail.com:465). Funciona en local, pero
  // muchos hosts (Render free, etc.) bloquean el tráfico SMTP saliente.
  SMTP_HOST:                z.string().default('smtp.gmail.com'),
  SMTP_PORT:                z.coerce.number().default(465),
  SMTP_USER:                z.string().default(''),
  SMTP_PASS:                z.string().default(''),
  SMTP_FROM:                z.string().default(''),
  // Brevo (API HTTPS) — se usa en vez de SMTP cuando está configurado, porque
  // los hosts que bloquean SMTP sí dejan pasar HTTPS normal. Si se rellena,
  // tiene prioridad sobre SMTP_*.
  BREVO_API_KEY:            z.string().default(''),
  BREVO_SENDER_EMAIL:       z.string().default(''),
  // IA — asistente del catálogo (Google Gemini). Opcional: si no hay key,
  // el endpoint responde 503 y el widget del frontend no se muestra.
  GEMINI_API_KEY:          z.string().default(''),
  GEMINI_MODEL:            z.string().default('gemini-2.5-flash'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Variables de entorno inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
