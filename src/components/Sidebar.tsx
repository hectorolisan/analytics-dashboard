import { CalendarDays, ChartColumnStacked, LayoutGrid, PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react'
import { SCREENS, type Screen } from '../lib/route'
import { InfoButton } from './InfoDialog'

const ICONS = { resumen: LayoutGrid, evolucion: ChartColumnStacked, estacionalidad: CalendarDays }

// en escritorio, con la barra cerrada solo quedan los iconos
const whenOpen = 'sm:group-data-[open=false]/sidebar:hidden'
const whenClosed = 'hidden sm:group-data-[open=false]/sidebar:grid'

const item = (active = false) =>
  `flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`

const ghost =
  'grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary'

type Props = { screen: Screen; query?: string; open: boolean; mobileOpen: boolean; onToggle: () => void; onNavigate: () => void }

export function Sidebar({ screen, query, open, mobileOpen, onToggle, onNavigate }: Props) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm sm:hidden" onClick={onNavigate} aria-hidden />}
      <div data-open={open} className="group/sidebar w-0 shrink-0 transition-[width] duration-200 sm:w-60 sm:overflow-x-clip sm:data-[open=false]:w-16">
        <aside
          data-mobile-open={mobileOpen}
          className="fixed inset-y-0 left-0 z-40 flex w-60 -translate-x-full flex-col gap-4 border-r bg-card p-3 transition-[translate,visibility] duration-200 data-[mobile-open=true]:translate-x-0 max-sm:data-[mobile-open=false]:invisible sm:sticky sm:top-0 sm:h-dvh sm:w-full sm:translate-x-0"
        >
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <span className={`grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background ${whenOpen}`} aria-hidden>
              <Zap className="size-4" />
            </span>
            <button
              type="button"
              onClick={onToggle}
              title="Abrir barra lateral (Ctrl+B)"
              className={`group/open size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary ${whenClosed}`}
            >
              <Zap className="size-4 group-hover/open:hidden group-focus-visible/open:hidden" aria-hidden />
              <PanelLeftOpen className="hidden size-4 group-hover/open:block group-focus-visible/open:block" aria-hidden />
              <span className="sr-only">Abrir barra lateral</span>
            </button>
            <div className={`min-w-0 whitespace-nowrap ${whenOpen}`}>
              <p className="font-heading text-base leading-none font-extrabold">Red Eléctrica</p>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">Dashboard</p>
            </div>
            <button type="button" onClick={onToggle} className={`${ghost} ml-auto ${whenOpen}`} title="Cerrar barra lateral (Ctrl+B)">
              <PanelLeftClose className="size-4" />
              <span className="sr-only">Cerrar barra lateral</span>
            </button>
          </div>

          <nav aria-label="Pantallas" className="flex flex-col gap-1">
            {SCREENS.map(({ key, title }) => {
              const Icon = ICONS[key]
              return (
                <a
                  key={key}
                  href={`#/${key}${query ? `?${query}` : ''}`}
                  title={title}
                  onClick={onNavigate}
                  aria-current={key === screen ? 'page' : undefined}
                  className={item(key === screen)}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className={whenOpen}>{title}</span>
                </a>
              )
            })}
          </nav>

          <div className="mt-auto border-t pt-3">
            <InfoButton className={item()} labelClassName={whenOpen} />
          </div>
        </aside>
      </div>
    </>
  )
}

/** Solo en móvil: abre el panel lateral superpuesto. */
export function OpenSidebarButton({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title="Abrir barra lateral"
      className="group/open grid size-9 shrink-0 place-items-center rounded-lg bg-foreground text-background transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary sm:hidden"
    >
      <Zap className="size-4 group-hover/open:hidden group-focus-visible/open:hidden" aria-hidden />
      <PanelLeftOpen className="hidden size-4 group-hover/open:block group-focus-visible/open:block" aria-hidden />
      <span className="sr-only">Abrir barra lateral</span>
    </button>
  )
}
