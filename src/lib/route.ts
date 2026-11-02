import { useSyncExternalStore } from 'react'

export const SCREENS = [
  { key: 'resumen', title: 'Resumen' },
  { key: 'evolucion', title: 'Evolución' },
  { key: 'estacionalidad', title: 'Estacionalidad' },
] as const

export type Screen = (typeof SCREENS)[number]['key']

export const parseRoute = (hash: string): Screen =>
  SCREENS.find((s) => `#/${s.key}` === hash.split('?')[0])?.key ?? 'resumen'

export const hashParams = (hash: string) => new URLSearchParams(hash.split('?')[1])

/** Hash con los params cambiados; null borra. */
export function withParams(hash: string, changes: Record<string, string | null>) {
  const params = hashParams(hash)
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) params.delete(k)
    else params.set(k, v)
  }
  const query = params.toString()
  return `${hash.split('?')[0] || '#/resumen'}${query ? `?${query}` : ''}`
}

// replace: los filtros no llenan el historial
export const setParams = (changes: Record<string, string | null>) => location.replace(withParams(location.hash, changes))

const subscribe = (cb: () => void) => {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}

export const useHash = () => useSyncExternalStore(subscribe, () => location.hash)
