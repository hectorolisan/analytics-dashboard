import { SOURCES, type Day, type SourceKey } from './data'

export const PERIODS = [
  { key: '7d', label: 'Últimos 7 días', days: 7, bucket: 1 },
  { key: '30d', label: 'Últimos 30 días', days: 30, bucket: 1 },
  { key: '90d', label: 'Últimos 90 días', days: 90, bucket: 1 },
  { key: '1y', label: 'Último año', days: 364, bucket: 7 },
  { key: '5y', label: 'Últimos 5 años', days: 1820, bucket: 28 },
] as const

export type Period = (typeof PERIODS)[number] | { key: 'custom'; label: string; from?: string; to?: string }

export const PERIOD_OPTIONS = [...PERIODS, { key: 'custom', label: 'Personalizado' }] as const

export function parsePeriod(params: URLSearchParams): Period {
  if (params.get('p') === 'custom') {
    return { key: 'custom', label: 'Personalizado', from: params.get('from') ?? undefined, to: params.get('to') ?? undefined }
  }
  return PERIODS.find((p) => p.key === params.get('p')) ?? PERIODS[1]
}

const bucketFor = (n: number) => (n <= 90 ? 1 : n <= 731 ? 7 : 28)

/** Periodo actual, el anterior de igual longitud y el tamaño de agregación. Sin `from`, 30 días. */
export function periodDays(days: Day[], p: Period) {
  if (p.key !== 'custom') return { ...splitPeriod(days, p.days), bucket: p.bucket }
  const end = p.to ? days.filter((d) => d.date <= p.to!) : days
  const n = p.from ? end.filter((d) => d.date >= p.from!).length : 30
  // n = 0 haría slice(-0) = todo
  return n ? { ...splitPeriod(end, n), bucket: bucketFor(n) } : { current: [], previous: [], bucket: 1 }
}

/** Días entre dos años (incluidos); sin límite si falta. */
export const inYears = (days: Day[], y0?: string | null, y1?: string | null) =>
  days.filter((d) => (!y0 || d.date >= y0) && (!y1 || d.date.slice(0, 4) <= y1))
export type SourceFilter = 'all' | 'renewable' | 'fossil'

export const SOURCE_FILTERS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: 'Todas las fuentes' },
  { key: 'renewable', label: 'Renovables' },
  { key: 'fossil', label: 'No renovables' },
]

const SUM_KEYS = ['demand', 'exchange', ...SOURCES.map((s) => s.key)] as const

/** Suma energías y toma el pico máximo; la fecha es la del primer día. */
export function combine(days: Day[]): Day {
  const out = { ...days[0] }
  for (const d of days.slice(1)) {
    for (const k of SUM_KEYS) out[k] += d[k]
    out.peak = Math.max(out.peak, d.peak)
  }
  return out
}

export function bucketize(days: Day[], size: number): Day[] {
  if (size <= 1) return days
  const out: Day[] = []
  for (let i = 0; i < days.length; i += size) out.push(combine(days.slice(i, i + size)))
  return out
}

/** Agrupa días con la misma clave (año 'YYYY', mes 'YYYY-MM'), en orden de aparición. */
export function groupDays(days: Day[], key: (d: Day) => string): Day[][] {
  const groups = new Map<string, Day[]>()
  for (const d of days) {
    const k = key(d)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(d)
  }
  return [...groups.values()]
}

export const byYear = (days: Day[]) => groupDays(days, (d) => d.date.slice(0, 4)).map(combine)

/** Media diaria de demanda y cuota renovable por mes natural. */
export function monthlyCells(days: Day[]) {
  return groupDays(days, (d) => d.date.slice(0, 7)).map((g) => {
    const c = combine(g)
    return { ym: c.date.slice(0, 7), demand: c.demand / g.length, renewable: renewableShare(c) }
  })
}

/** Media de value(d) por índice (día de la semana, mes del año…). */
export function averageBy(days: Day[], n: number, index: (d: Day) => number, value: (d: Day) => number) {
  const sum = Array<number>(n).fill(0)
  const count = Array<number>(n).fill(0)
  for (const d of days) {
    const i = index(d)
    sum[i] += value(d)
    count[i]++
  }
  return sum.map((s, i) => (count[i] ? s / count[i] : 0))
}

export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)

/** 0 = lunes … 6 = domingo */
export const weekday = (d: Day) => (new Date(d.date).getUTCDay() + 6) % 7
export const month = (d: Day) => Number(d.date.slice(5, 7)) - 1

/** Cuota de cada fuente sobre la generación (0–1); hidráulica negativa cuenta como 0. */
export function mixShares(d: Day) {
  const pos = { ...d, hydro: Math.max(0, d.hydro) }
  const gen = generation(pos)
  return Object.fromEntries(SOURCES.map((s) => [s.key, gen ? pos[s.key] / gen : 0])) as Record<SourceKey, number>
}

/** Periodo actual (últimos n días) y el inmediatamente anterior. */
export function splitPeriod(days: Day[], n: number) {
  return { current: days.slice(-n), previous: days.slice(-2 * n, -n) }
}

export function generation(d: Day) {
  return SOURCES.reduce((s, src) => s + d[src.key], 0)
}

export function renewableShare(d: Day) {
  const gen = generation(d)
  return gen ? SOURCES.reduce((s, src) => s + (src.renewable ? d[src.key] : 0), 0) / gen : 0
}

export function visibleSources(filter: SourceFilter) {
  return SOURCES.filter((s) => filter === 'all' || s.renewable === (filter === 'renewable'))
}

export function pctChange(curr: number, prev: number) {
  return prev ? (curr - prev) / Math.abs(prev) : 0
}

export type SourceRow = { key: SourceKey; label: string; renewable: boolean; energy: number; share: number; maxDay: number; change: number }

export function sourceRows(current: Day[], previous: Day[], filter: SourceFilter): SourceRow[] {
  const curr = combine(current)
  const prev = previous.length ? combine(previous) : undefined
  const gen = generation(curr)
  return visibleSources(filter).map((s) => ({
    key: s.key,
    label: s.label,
    renewable: s.renewable,
    energy: curr[s.key],
    share: gen ? curr[s.key] / gen : 0,
    maxDay: Math.max(...current.map((d) => d[s.key])),
    change: prev ? pctChange(curr[s.key], prev[s.key]) : 0,
  }))
}
