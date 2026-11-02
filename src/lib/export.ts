import type { Day, SOURCES } from './data'

export function toCsv(days: Day[], sources: readonly (typeof SOURCES)[number][]) {
  const header = ['fecha', 'demanda_gwh', 'pico_mw', ...sources.map((s) => `${s.key}_gwh`), 'saldo_importador_gwh']
  const lines = days.map((d) => [d.date, d.demand, d.peak, ...sources.map((s) => d[s.key]), d.exchange].join(','))
  return [header.join(','), ...lines].join('\n')
}

export function download(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
