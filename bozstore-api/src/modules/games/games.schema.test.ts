import { describe, it, expect } from 'vitest'
import { GameSchema } from './games.schema'

const validGame = {
  title: 'Elden Ring',
  slug: 'elden-ring',
  price: 59.99,
}

describe('GameSchema', () => {
  it('acepta un juego mínimo válido (title, slug, price)', () => {
    const result = GameSchema.safeParse(validGame)
    expect(result.success).toBe(true)
  })

  it('aplica defaults: stock 0 y discount_percent 0', () => {
    const result = GameSchema.parse(validGame)
    expect(result.stock).toBe(0)
    expect(result.discount_percent).toBe(0)
  })

  it('rechaza si falta el título', () => {
    const { title: _omitted, ...rest } = validGame
    expect(GameSchema.safeParse(rest).success).toBe(false)
  })

  it('rechaza precio 0 o negativo', () => {
    expect(GameSchema.safeParse({ ...validGame, price: 0 }).success).toBe(false)
    expect(GameSchema.safeParse({ ...validGame, price: -5 }).success).toBe(false)
  })

  it('rechaza slugs con mayúsculas, espacios o tildes', () => {
    for (const slug of ['Elden-Ring', 'elden ring', 'acción', 'juego_1']) {
      expect(GameSchema.safeParse({ ...validGame, slug }).success).toBe(false)
    }
  })

  it('acepta slugs kebab-case con números', () => {
    expect(GameSchema.safeParse({ ...validGame, slug: 'portal-2' }).success).toBe(true)
  })

  it('limita discount_percent al rango 0–95', () => {
    expect(GameSchema.safeParse({ ...validGame, discount_percent: 96 }).success).toBe(false)
    expect(GameSchema.safeParse({ ...validGame, discount_percent: -1 }).success).toBe(false)
    expect(GameSchema.safeParse({ ...validGame, discount_percent: 95 }).success).toBe(true)
  })

  it('rechaza stock negativo y coerciona strings numéricos', () => {
    expect(GameSchema.safeParse({ ...validGame, stock: -1 }).success).toBe(false)
    const result = GameSchema.parse({ ...validGame, stock: '25' })
    expect(result.stock).toBe(25)
  })

  it('rechaza cover_url que no sea URL', () => {
    expect(GameSchema.safeParse({ ...validGame, cover_url: 'no-es-url' }).success).toBe(false)
    expect(
      GameSchema.safeParse({ ...validGame, cover_url: 'https://cdn.example.com/a.jpg' }).success,
    ).toBe(true)
  })

  it('partial() permite PATCH con un solo campo', () => {
    expect(GameSchema.partial().safeParse({ discount_percent: 50 }).success).toBe(true)
  })
})
