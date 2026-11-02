import { SOURCES, type Day } from './data'
import { byYear, combine, groupDays, inYears, periodDays, visibleSources, type Period, type SourceFilter } from './metrics'
import type { Screen } from './route'

export function toCsv(days: Day[], sources: readonly (typeof SOURCES)[number][]) {
  const header = ['fecha', 'demanda_gwh', 'pico_mw', ...sources.map((s) => `${s.key}_gwh`), 'saldo_importador_gwh']
  const lines = days.map((d) => [d.date, d.demand, d.peak, ...sources.map((s) => d[s.key]), d.exchange].join(','))
  return [header.join(','), ...lines].join('\n')
}

type View = { period: Period; sourceFilter: SourceFilter; y0: string | null; y1: string | null }

/** Lo que muestra cada pantalla: días del periodo, años o meses del rango. */
export function screenRows(days: Day[], screen: Screen, { period, sourceFilter, y0, y1 }: View) {
  if (screen === 'resumen') return { rows: periodDays(days, period).current, sources: visibleSources(sourceFilter) }
  const range = inYears(days, y0, y1)
  const rows = screen === 'evolucion' ? byYear(range) : groupDays(range, (d) => d.date.slice(0, 7)).map(combine)
  return { rows, sources: SOURCES }
}

export function saveUrl(filename: string, href: string) {
  Object.assign(document.createElement('a'), { href, download: filename }).click()
}

export function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  saveUrl(filename, url)
  URL.revokeObjectURL(url)
}
