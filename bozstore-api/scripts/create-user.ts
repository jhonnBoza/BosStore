/**
 * Crea (o actualiza) un usuario NORMAL (rol cliente) ya confirmado.
 * Útil para generar credenciales de prueba para demos o laboratorios.
 *
 * Uso:  npx tsx scripts/create-user.ts <email> <password> [nombre]
 * Ej.:  npx tsx scripts/create-user.ts cliente@bosstore.com Cliente2026! "Cliente Demo"
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el .env')
  process.exit(1)
}

const email = process.argv[2] ?? 'cliente@bosstore.com'
const password = process.argv[3] ?? 'Cliente2026!'
const fullName = process.argv[4] ?? 'Cliente Demo'

const supabase = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (!error) {
    console.log(`✅ Usuario creado: ${data.user?.email}`)
    return
  }

  const msg = (error.message ?? '').toLowerCase()
  if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
    // Ya existe → solo actualizar la contraseña
    const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    const existing = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!existing) {
      console.error('El usuario existe pero no se pudo localizar para actualizarlo.')
      process.exit(1)
    }
    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, { password })
    if (updErr) {
      console.error('Error al actualizar la contraseña:', updErr.message)
      process.exit(1)
    }
    console.log(`✅ Usuario ya existía — contraseña actualizada: ${email}`)
    return
  }

  console.error('Error al crear el usuario:', error.message)
  process.exit(1)
}

main()
