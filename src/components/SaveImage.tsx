import { ImageDown } from 'lucide-react'
import { saveUrl } from '../lib/export'

/** Descarga como PNG la tarjeta (section) que lo contiene. */
export function SaveImage({ name }: { name: string }) {
  return (
    <button
      type="button"
      data-no-export
      title="Descargar imagen"
      onClick={async (e) => {
        const card = e.currentTarget.closest('section')!
        const { domToPng } = await import('modern-screenshot')
        const url = await domToPng(card, {
          scale: 2,
          backgroundColor: getComputedStyle(card).backgroundColor,
          filter: (n) => !(n instanceof HTMLElement && n.dataset.noExport !== undefined),
        })
        saveUrl(`${name}.png`, url)
      }}
      className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
    >
      <ImageDown className="size-4" aria-hidden />
      <span className="sr-only">Descargar imagen</span>
    </button>
  )
}
