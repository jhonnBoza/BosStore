import { describe, it, expect } from 'vitest'
import { finalPrice, formatPrice, hasDiscount } from './pricing'

describe('hasDiscount', () => {
  it('true solo cuando discount_percent > 0', () => {
    expect(hasDiscount({ price: 59.99, discount_percent: 50 })).toBe(true)
    expect(hasDiscount({ price: 59.99, discount_percent: 0 })).toBe(false)
    expect(hasDiscount({ price: 59.99 })).toBe(false)
  })
})

describe('finalPrice', () => {
  it('sin descuento devuelve el precio base', () => {
    expect(finalPrice({ price: 59.99, discount_percent: 0 })).toBe(59.99)
    expect(finalPrice({ price: 59.99 })).toBe(59.99)
  })

  it('aplica el descuento con redondeo a 2 decimales', () => {
    expect(finalPrice({ price: 59.99, discount_percent: 20 })).toBe(47.99)
    expect(finalPrice({ price: 39.99, discount_percent: 50 })).toBe(20.0)
    expect(finalPrice({ price: 29.99, discount_percent: 90 })).toBe(3.0)
  })

  it('el precio con descuento coincide con lo que cobra el backend (mismo redondeo)', () => {
    // El API hace: Math.round(price * (1 - d/100) * 100) / 100
    const price = 49.99
    const d = 33
    const backend = Math.round(price * (1 - d / 100) * 100) / 100
    expect(finalPrice({ price, discount_percent: d })).toBe(backend)
  })

  it('tolera precios inválidos devolviendo 0', () => {
    expect(finalPrice({ price: NaN as unknown as number, discount_percent: 10 })).toBe(0)
  })
})

describe('formatPrice', () => {
  it('formatea en dólares con 2 decimales', () => {
    expect(formatPrice(47.99)).toBe('$47.99')
    expect(formatPrice(20)).toBe('$20.00')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('valores no finitos se muestran como $0.00 (no NaN en la UI)', () => {
    expect(formatPrice(NaN)).toBe('$0.00')
    expect(formatPrice(Infinity)).toBe('$0.00')
  })
})
