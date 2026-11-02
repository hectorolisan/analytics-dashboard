import { describe, expect, it } from 'vitest'
import { visibleSources } from './metrics'
import { toCsv } from './export'
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
