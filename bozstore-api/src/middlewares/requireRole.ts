import { type Request, type Response, type NextFunction } from 'express'
import { ForbiddenError } from '../lib/errors'

export function requireRole(...roles: Array<'admin' | 'cliente'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)                        return next(new ForbiddenError())
    if (!roles.includes(req.user.role))   return next(new ForbiddenError())
    next()
  }
}
