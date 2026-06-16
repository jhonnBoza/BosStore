import { type Request, type Response, type NextFunction } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { env } from '../config/env'
import { UnauthorizedError } from '../lib/errors'

const JWKS = createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL))

export async function auth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next(new UnauthorizedError())

  const token = header.slice(7)

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer:   `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    })

    const appMeta = (payload.app_metadata as Record<string, unknown> | undefined) ?? {}

    req.user = {
      id:    payload.sub!,
      email: (payload.email as string | undefined) ?? '',
      role:  (appMeta.role as 'admin' | 'cliente' | undefined) ?? 'cliente',
    }

    next()
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'))
  }
}
