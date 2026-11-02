export const EVENTS = [
  { date: '2020-03-14', label: 'Estado de alarma' },
  { date: '2021-01-09', label: 'Filomena' },
  { date: '2025-04-28', label: 'Apagón' },
]

export type EventMark = (typeof EVENTS)[number] & { x: string }

/** Eventos entre la primera fecha y `end`, anclados al último bucket que empieza antes. */
export const eventMarks = (dates: string[], end: string): EventMark[] =>
  EVENTS.filter((e) => e.date >= dates[0] && e.date <= end).map((e) => ({ ...e, x: dates.findLast((d) => d <= e.date)! }))

export const eventIn = (ym: string) => EVENTS.find((e) => e.date.startsWith(ym))
