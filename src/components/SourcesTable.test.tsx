import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { sourceRows } from '../lib/metrics'
import { day } from '../lib/test-utils'
import { SourcesTable } from './SourcesTable'

afterEach(cleanup)

const firstColumn = () =>
  screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent)

describe('SourcesTable', () => {
  const rows = sourceRows([day('2026-05-13')], [day('2026-05-12')], 'renewable')

  it('ordena por energía descendente al inicio', () => {
    render(<SourcesTable rows={rows} />)
    expect(firstColumn()).toEqual(['Eólica', 'Solar', 'Hidráulica', 'Biomasa'])
  })

  it('reordena al pulsar una cabecera', () => {
    render(<SourcesTable rows={rows} />)
    fireEvent.click(screen.getByRole('button', { name: /fuente/i }))
    expect(firstColumn()).toEqual(['Biomasa', 'Eólica', 'Hidráulica', 'Solar'])
    expect(screen.getByRole('columnheader', { name: /fuente/i }).getAttribute('aria-sort')).toBe('ascending')
  })
})
