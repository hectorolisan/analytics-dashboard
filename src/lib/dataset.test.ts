// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const cols: Record<string, (string | number)[]> = JSON.parse(readFileSync('public/data/ree-daily.json', 'utf8'))

describe('ree-daily.json', () => {
  it('todas las columnas tienen la misma longitud', () => {
    const n = cols.date.length
    expect(n).toBeGreaterThan(6000)
    for (const v of Object.values(cols)) expect(v).toHaveLength(n)
  })

  it('las fechas son consecutivas', () => {
    const t = (cols.date as string[]).map((d) => Date.parse(d))
    expect(t.slice(1).every((x, i) => x - t[i] === 86_400_000)).toBe(true)
  })
})
