export const PRIMARY_COLORS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan',
  'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'neutral',
] as const

export type PrimaryColor = (typeof PRIMARY_COLORS)[number]
export type Mode = 'light' | 'dark'

// tonos claros: texto oscuro encima para mantener contraste
const BRIGHT = new Set<PrimaryColor>(['amber', 'yellow', 'lime'])

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* almacenamiento bloqueado: se pierde la preferencia, nada más */
  }
}

export function storedMode(): Mode {
  const m = read('theme')
  if (m === 'light' || m === 'dark') return m
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function storedPrimary(): PrimaryColor {
  const c = read('primary') as PrimaryColor | null
  return c && PRIMARY_COLORS.includes(c) ? c : 'teal'
}

export function applyMode(mode: Mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  write('theme', mode)
}

export function applyPrimary(c: PrimaryColor) {
  const s = document.documentElement.style
  const bright = BRIGHT.has(c)
  s.setProperty('--primary-light', `var(--color-${c}-${bright ? 400 : 600})`)
  s.setProperty('--primary-fg-light', bright ? `var(--color-${c}-950)` : 'var(--color-white)')
  s.setProperty('--primary-dark', `var(--color-${c}-500)`)
  s.setProperty('--primary-fg-dark', `var(--color-${c}-950)`)
  write('primary', c)
}
