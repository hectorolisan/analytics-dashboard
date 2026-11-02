import { CalendarDays, ChartColumnStacked, LayoutGrid, Zap } from 'lucide-react'
import { SCREENS, type Screen } from '../lib/route'

const ICONS = { resumen: LayoutGrid, evolucion: ChartColumnStacked, estacionalidad: CalendarDays }

export function Sidebar({ screen }: { screen: Screen }) {
  return (
    <aside className="fixed inset-x-0 bottom-0 z-20 flex h-14 items-center justify-center border-t bg-card sm:sticky sm:top-0 sm:h-dvh sm:w-16 sm:shrink-0 sm:flex-col sm:justify-start sm:gap-6 sm:border-t-0 sm:border-r sm:py-4">
      <div className="hidden size-9 place-items-center rounded-lg bg-foreground text-background sm:grid" aria-hidden>
        <Zap className="size-4" />
      </div>
      <nav aria-label="Pantallas" className="flex gap-2 sm:flex-col">
        {SCREENS.map(({ key, title }) => {
          const Icon = ICONS[key]
          const active = key === screen
          return (
            <a
              key={key}
              href={`#/${key}`}
              title={title}
              aria-current={active ? 'page' : undefined}
              className={`grid size-10 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-primary sm:size-9 ${
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-4" />
              <span className="sr-only">{title}</span>
            </a>
          )
        })}
      </nav>
      <div
        className="mt-auto hidden size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:grid"
        title="Héctor Olivares Sánchez"
      >
        HO
      </div>
    </aside>
  )
}
