import { describe, expect, it } from 'vitest'
import { bucketize, combine, pctChange, renewableShare, sourceRows, splitPeriod, visibleSources } from './metrics'
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
