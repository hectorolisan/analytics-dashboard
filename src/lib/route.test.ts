import { describe, expect, it } from 'vitest'
import { hashParams, parseRoute, withParams } from './route'

describe('parseRoute', () => {
  it('reconoce las pantallas y cae en resumen si no', () => {
    expect(parseRoute('#/evolucion')).toBe('evolucion')
    expect(parseRoute('#/estacionalidad')).toBe('estacionalidad')
    expect(parseRoute('')).toBe('resumen')
    expect(parseRoute('#/otra')).toBe('resumen')
  })

  it('ignora los params', () => {
    expect(parseRoute('#/evolucion?p=7d')).toBe('evolucion')
  })
})

describe('withParams', () => {
  it('añade, cambia y borra params manteniendo la pantalla', () => {
    expect(withParams('#/evolucion', { p: '7d' })).toBe('#/evolucion?p=7d')
    expect(withParams('#/evolucion?p=7d&f=fossil', { p: '1y', f: null })).toBe('#/evolucion?p=1y')
    expect(withParams('#/evolucion?p=7d', { p: null })).toBe('#/evolucion')
  })

  it('sin pantalla usa resumen', () => {
    expect(withParams('', { f: 'renewable' })).toBe('#/resumen?f=renewable')
    expect(hashParams('#/resumen?f=renewable').get('f')).toBe('renewable')
  })
})
