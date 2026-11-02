import { describe, expect, it } from 'vitest'
import {
  averageBy,
  bucketize,
  inYears,
  parsePeriod,
  periodDays,
  byYear,
  combine,
  mixShares,
  monthlyCells,
  pctChange,
  renewableShare,
  sourceRows,
  splitPeriod,
  visibleSources,
  weekday,
} from './metrics'
import { day } from './test-utils'

describe('combine', () => {
  it('suma energías y toma el pico máximo', () => {
    const c = combine([day('2026-01-01', { peak: 1 }), day('2026-01-02', { demand: 50, peak: 9 })])
    expect(c).toMatchObject({ date: '2026-01-01', demand: 150, peak: 9, exchange: -20, wind: 60 })
  })
})

describe('bucketize', () => {
  it('agrupa en bloques fijos y deja el resto en el último', () => {
    const days = Array.from({ length: 10 }, (_, i) => day(`2026-01-${String(i + 1).padStart(2, '0')}`))
    const b = bucketize(days, 7)
    expect(b.map((d) => d.demand)).toEqual([700, 300])
    expect(bucketize(days, 1)).toBe(days)
  })
})

describe('splitPeriod', () => {
  it('separa los últimos n días del periodo anterior', () => {
    const days = [1, 2, 3, 4, 5].map((i) => day(`2026-01-0${i}`))
    const { current, previous } = splitPeriod(days, 2)
    expect(current.map((d) => d.date)).toEqual(['2026-01-04', '2026-01-05'])
    expect(previous.map((d) => d.date)).toEqual(['2026-01-02', '2026-01-03'])
  })
})

describe('renewableShare', () => {
  it('divide renovables entre generación total', () => {
    expect(renewableShare(day('x'))).toBeCloseTo(60 / 100)
  })
})

describe('pctChange', () => {
  it('evita dividir por cero', () => {
    expect(pctChange(5, 0)).toBe(0)
    expect(pctChange(110, 100)).toBeCloseTo(0.1)
  })
})

describe('sourceRows', () => {
  it('filtra fuentes y calcula cuota y variación', () => {
    const rows = sourceRows([day('b', { wind: 60 })], [day('a')], 'renewable')
    expect(rows.map((r) => r.key)).toEqual(visibleSources('renewable').map((s) => s.key))
    const wind = rows.find((r) => r.key === 'wind')!
    expect(wind.change).toBeCloseTo(1)
    expect(wind.share).toBeCloseTo(60 / 130)
  })

  it('las cuotas de todas las fuentes suman 1', () => {
    const total = sourceRows([day('a')], [], 'all').reduce((s, r) => s + r.share, 0)
    expect(total).toBeCloseTo(1)
  })
})

describe('byYear / monthlyCells', () => {
  const days = [day('2025-12-31', { demand: 300 }), day('2026-01-01'), day('2026-01-02', { demand: 200 }), day('2026-02-01')]

  it('agrupa por año natural', () => {
    expect(byYear(days).map((y) => [y.date, y.demand])).toEqual([
      ['2025-12-31', 300],
      ['2026-01-01', 400],
    ])
  })

  it('calcula la media diaria por mes', () => {
    expect(monthlyCells(days).map((c) => [c.ym, c.demand])).toEqual([
      ['2025-12', 300],
      ['2026-01', 150],
      ['2026-02', 100],
    ])
  })
})

describe('averageBy / weekday', () => {
  it('lunes es 0 y domingo 6', () => {
    expect(weekday(day('2026-05-11'))).toBe(0)
    expect(weekday(day('2026-05-17'))).toBe(6)
  })

  it('promedia por índice y deja 0 donde no hay datos', () => {
    const avg = averageBy([day('2026-05-11', { demand: 100 }), day('2026-05-18', { demand: 300 })], 7, weekday, (d) => d.demand)
    expect(avg).toEqual([200, 0, 0, 0, 0, 0, 0])
  })
})

describe('mixShares', () => {
  it('suma 1 e ignora el bombeo negativo', () => {
    const s = mixShares(day('x', { hydro: -50 }))
    expect(s.hydro).toBe(0)
    expect(Object.values(s).reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })
})

describe('parsePeriod / periodDays', () => {
  const days = Array.from({ length: 10 }, (_, i) => day(`2026-01-${String(i + 1).padStart(2, '0')}`))

  it('cae en 30 días si el periodo no existe', () => {
    expect(parsePeriod(new URLSearchParams('p=nope')).key).toBe('30d')
    expect(parsePeriod(new URLSearchParams('p=7d')).key).toBe('7d')
  })

  it('rango personalizado con su periodo anterior', () => {
    const p = parsePeriod(new URLSearchParams('p=custom&from=2026-01-06&to=2026-01-08'))
    const { current, previous, bucket } = periodDays(days, p)
    expect(current.map((d) => d.date)).toEqual(['2026-01-06', '2026-01-07', '2026-01-08'])
    expect(previous.map((d) => d.date)).toEqual(['2026-01-03', '2026-01-04', '2026-01-05'])
    expect(bucket).toBe(1)
  })

  it('rango fuera de los datos queda vacío', () => {
    const p = parsePeriod(new URLSearchParams('p=custom&from=2030-01-01&to=2030-02-01'))
    expect(periodDays(days, p).current).toEqual([])
  })
})

describe('inYears', () => {
  it('filtra por años incluidos', () => {
    const days = [day('2024-12-31'), day('2025-06-01'), day('2026-01-01')]
    expect(inYears(days, '2025', '2025').map((d) => d.date)).toEqual(['2025-06-01'])
    expect(inYears(days, null, '2025')).toHaveLength(2)
  })
})
