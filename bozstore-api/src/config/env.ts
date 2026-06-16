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
  // Por defecto apunta a Gmail (smtp.gmail.com:465).
  SMTP_HOST:                z.string().default('smtp.gmail.com'),
  SMTP_PORT:                z.coerce.number().default(465),
  SMTP_USER:                z.string().default(''),
  SMTP_PASS:                z.string().default(''),
  SMTP_FROM:                z.string().default(''),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Variables de entorno inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
