import { type Request, type Response, type NextFunction } from 'express'
import { type ZodSchema } from 'zod'
import { ValidationError } from '../lib/errors'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      const msg = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return next(new ValidationError(msg))
    }

    // Devuelve los datos ya parseados/coercionados por zod
    Object.assign(req, { [target]: result.data })
    next()
  }
}
