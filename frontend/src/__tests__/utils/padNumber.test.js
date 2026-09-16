import { describe, it, expect } from 'vitest'

// Función a testear - copiada de RutasSection.vue
const padNumber = (num) => {
  if (!num) return '—'
  return String(num).padStart(3, '0')
}

describe('padNumber utility', () => {
  it('debería formatear 1 como "001"', () => {
    expect(padNumber(1)).toBe('001')
  })

  it('debería formatear 25 como "025"', () => {
    expect(padNumber(25)).toBe('025')
  })

  it('debería formatear 100 como "100"', () => {
    expect(padNumber(100)).toBe('100')
  })

  it('debería formatear 1000 como "1000" (sin truncar)', () => {
    expect(padNumber(1000)).toBe('1000')
  })

  it('debería retornar "—" si num es null', () => {
    expect(padNumber(null)).toBe('—')
  })

  it('debería retornar "—" si num es undefined', () => {
    expect(padNumber(undefined)).toBe('—')
  })

  it('debería retornar "—" si num es 0 (falsy)', () => {
    expect(padNumber(0)).toBe('—')
  })

  it('debería retornar "—" si num es string vacío', () => {
    expect(padNumber('')).toBe('—')
  })

  it('debería funcionar con strings numéricos', () => {
    expect(padNumber('5')).toBe('005')
  })

  it('debería retornar el número sin cambios si es mayor a 3 dígitos', () => {
    expect(padNumber(12345)).toBe('12345')
  })
})
