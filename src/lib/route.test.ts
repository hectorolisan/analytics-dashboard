import { describe, expect, it } from 'vitest'
import { parseRoute } from './route'

describe('parseRoute', () => {
  it('reconoce las pantallas y cae en resumen si no', () => {
    expect(parseRoute('#/evolucion')).toBe('evolucion')
    expect(parseRoute('#/estacionalidad')).toBe('estacionalidad')
    expect(parseRoute('')).toBe('resumen')
    expect(parseRoute('#/otra')).toBe('resumen')
  })
})
