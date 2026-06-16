import { createClient } from '@supabase/supabase-js'
import { env } from './env'

// Cliente de administración — nunca exponer al frontend
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
)
