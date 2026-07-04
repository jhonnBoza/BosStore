import { describe, it, expect } from 'vitest'
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from './errors'

describe('AppError y subclases', () => {
  it('AppError guarda statusCode, message y code', () => {
    const err = new AppError(502, 'Falla externa', 'UPSTREAM')
    expect(err.statusCode).toBe(502)
    expect(err.message).toBe('Falla externa')
    expect(err.code).toBe('UPSTREAM')
    expect(err).toBeInstanceOf(Error)
  })

  it('NotFoundError → 404 con nombre del recurso', () => {
    const err = new NotFoundError('Game')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toContain('Game')
  })

  it('UnauthorizedError → 401 por defecto', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError → 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403)
  })

  it('ValidationError → 422 con mensaje custom', () => {
    const err = new ValidationError('price: Required')
    expect(err.statusCode).toBe(422)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.message).toBe('price: Required')
  })

  it('todas heredan de AppError (las atrapa el errorHandler)', () => {
    for (const err of [
      new NotFoundError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new ValidationError('x'),
    ]) {
      expect(err).toBeInstanceOf(AppError)
    }
  })
})
