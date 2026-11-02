import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSidebar } from './sidebar'

const viewport = (desktop: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: desktop }))
const ctrlB = () => act(() => void dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true })))

beforeEach(() => localStorage.clear())

describe('useSidebar', () => {
  it('escritorio: Ctrl+B cierra y lo recuerda', () => {
    viewport(true)
    const { result } = renderHook(useSidebar)
    expect(result.current.open).toBe(true)
    ctrlB()
    expect(result.current.open).toBe(false)
    expect(localStorage.getItem('sidebar')).toBe('closed')
    expect(renderHook(useSidebar).result.current.open).toBe(false)
  })

  it('móvil: abre como panel y Escape lo cierra', () => {
    viewport(false)
    const { result } = renderHook(useSidebar)
    act(() => result.current.toggle())
    expect(result.current.mobileOpen).toBe(true)
    act(() => void dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
    expect(result.current.mobileOpen).toBe(false)
    expect(result.current.open).toBe(true)
  })
})
