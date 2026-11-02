import { describe, expect, it } from 'vitest'
import { eventIn, eventMarks } from './events'

describe('eventMarks', () => {
  it('ancla cada evento al bucket que lo contiene y descarta los de fuera', () => {
    const marks = eventMarks(['2025-04-07', '2025-04-21', '2025-05-05'], '2025-05-18')
    expect(marks.map((m) => [m.label, m.x])).toEqual([['Apagón', '2025-04-21']])
    expect(eventMarks(['2025-05-01'], '2025-05-31')).toEqual([])
  })

  it('busca evento por mes', () => {
    expect(eventIn('2020-03')?.label).toBe('Estado de alarma')
    expect(eventIn('2020-04')).toBeUndefined()
  })
})
