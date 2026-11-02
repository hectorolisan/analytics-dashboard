import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

afterEach(cleanup)

function Boom(): never {
  throw new Error('fallo de prueba')
}

describe('ErrorBoundary', () => {
  it('muestra el error en lugar de tumbar la app', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert').textContent).toContain('fallo de prueba')
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeTruthy()
  })
})
