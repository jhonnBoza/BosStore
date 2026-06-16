import { type Request, type Response, type NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../lib/errors'

interface ErrorBody {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ErrorBody = {
      success: false,
      error: { code: err.code ?? 'ERROR', message: err.message },
    }
    res.status(err.statusCode).json(body)
    return
  }

  if (err instanceof ZodError) {
    const body: ErrorBody = {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten() },
    }
    res.status(422).json(body)
    return
  }

  // Error inesperado — no exponer detalles en producción
  console.error('[Unhandled error]', err)
  const body: ErrorBody = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  }
  res.status(500).json(body)
}
