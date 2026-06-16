/**
 * Crea (o promueve) una cuenta de administrador en Supabase.
 *
 * Uso:
 *   npx tsx scripts/create-admin.ts <correo> <contraseña>
 *
 * Si no pasas argumentos usa los valores por defecto de abajo.
 * Si la cuenta ya existe, la actualiza: le pone rol admin y le cambia la
 * contraseña a la indicada (útil si olvidaste la clave).
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env')
  process.exit(1)
}

// ── Credenciales (puedes pasarlas por argumento o editar estos valores) ──
const email = process.argv[2] ?? 'admin@bosstore.com'
const password = process.argv[3] ?? 'BosStore2026!'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(target: string) {
  // listUsers pagina; recorremos hasta encontrarlo
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase())
    if (found) return found
    if (data.users.length < 200) break
  }
  return null
}

async function main() {
  console.log(`\n▸ Procesando admin: ${email}\n`)

  const existing = await findUserByEmail(email)

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, role: 'admin' },
    })
    if (error) throw error
    console.log('✅  La cuenta YA existía → actualizada a admin y contraseña restablecida.')
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    })
    if (error) throw error
    console.log('✅  Cuenta admin creada correctamente.')
  }

  console.log('\n──────────────────────────────────────────')
  console.log('  Inicia sesión en /login con:')
  console.log(`  Correo:     ${email}`)
  console.log(`  Contraseña: ${password}`)
  console.log('──────────────────────────────────────────')
  console.log('\n⚠️  Cambia la contraseña después desde tu cuenta.\n')
}

main().catch((err) => {
  console.error('❌  Error:', err.message ?? err)
  process.exit(1)
})
