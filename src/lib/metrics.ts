import { SOURCES, type Day, type SourceKey } from './data'

export const PERIODS = [
  { key: '7d', label: 'Últimos 7 días', days: 7, bucket: 1 },
  { key: '30d', label: 'Últimos 30 días', days: 30, bucket: 1 },
  { key: '90d', label: 'Últimos 90 días', days: 90, bucket: 1 },
  { key: '1y', label: 'Último año', days: 364, bucket: 7 },
  { key: '5y', label: 'Últimos 5 años', days: 1820, bucket: 28 },
] as const

export type Period = (typeof PERIODS)[number]
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

/** Agrupa días consecutivos con la misma clave (año 'YYYY', mes 'YYYY-MM'). */
export function groupBy(days: Day[], key: (d: Day) => string): Day[] {
  const groups = new Map<string, Day[]>()
  for (const d of days) groups.set(key(d), [...(groups.get(key(d)) ?? []), d])
  return [...groups.values()].map(combine)
}

export const byYear = (days: Day[]) => groupBy(days, (d) => d.date.slice(0, 4))
export const byMonth = (days: Day[]) => groupBy(days, (d) => d.date.slice(0, 7))

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
