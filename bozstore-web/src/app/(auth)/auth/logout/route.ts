import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

// Logout vía POST para evitar CSRF/prefetch (un GET podría dispararse desde
// un <img> o un prefetch de enlace y cerrar la sesión sin intención).
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = ''
  return NextResponse.redirect(url, { status: 303 })
}
