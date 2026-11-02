import { describe, expect, it } from 'vitest'
import { PERIODS, visibleSources } from './metrics'
import { screenRows, toCsv } from './export'
import { day } from './test-utils'

describe('toCsv', () => {
  it('genera cabecera y una fila por día con las fuentes visibles', () => {
    const csv = toCsv([day('2026-05-13')], visibleSources('fossil'))
    expect(csv.split('\n')).toEqual([
      'fecha,demanda_gwh,pico_mw,nuclear_gwh,other_gwh,gas_gwh,coal_gwh,saldo_importador_gwh',
      '2026-05-13,100,30000,20,10,10,0,-10',
    ])
  })
})

describe('screenRows', () => {
  const days = [day('2025-12-31'), day('2026-01-01'), day('2026-01-02'), day('2026-02-01')]
  const view = { period: PERIODS[0], sourceFilter: 'renewable' as const, y0: '2026', y1: null }

  it('resumen: días del periodo con las fuentes filtradas', () => {
    const { rows, sources } = screenRows(days, 'resumen', view)
    expect(rows).toHaveLength(4)
    expect(sources).toEqual(visibleSources('renewable'))
  })

  it('evolución por año y estacionalidad por mes dentro del rango', () => {
    expect(screenRows(days, 'evolucion', view).rows.map((r) => [r.date, r.demand])).toEqual([['2026-01-01', 300]])
    expect(screenRows(days, 'estacionalidad', view).rows.map((r) => r.date)).toEqual(['2026-01-01', '2026-02-01'])
  })
})
