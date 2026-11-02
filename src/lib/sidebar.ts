import { useEffect, useState } from 'react'
import { read, write } from './theme'

const isDesktop = () => matchMedia('(min-width: 40rem)').matches

/** Escritorio: abierta/cerrada persistente. Móvil: panel superpuesto, cerrado al cargar. */
export function useSidebar() {
  const [open, setOpen] = useState(() => read('sidebar') !== 'closed')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => write('sidebar', open ? 'open' : 'closed'), [open])

  const toggle = () => (isDesktop() ? setOpen((o) => !o) : setMobileOpen((o) => !o))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        if (isDesktop()) setOpen((o) => !o)
        else setMobileOpen((o) => !o)
      }
      if (e.key === 'Escape') setMobileOpen(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return { open, mobileOpen, toggle, closeMobile: () => setMobileOpen(false) }
}
