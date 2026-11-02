import { useSyncExternalStore } from 'react'

export const SCREENS = [
  { key: 'resumen', title: 'Resumen' },
  { key: 'evolucion', title: 'Evolución' },
  { key: 'estacionalidad', title: 'Estacionalidad' },
] as const

export type Screen = (typeof SCREENS)[number]['key']

export const parseRoute = (hash: string): Screen =>
  SCREENS.find((s) => `#/${s.key}` === hash)?.key ?? 'resumen'

const subscribe = (cb: () => void) => {
  addEventListener('hashchange', cb)
  return () => removeEventListener('hashchange', cb)
}

export const useRoute = () => useSyncExternalStore(subscribe, () => parseRoute(location.hash))
