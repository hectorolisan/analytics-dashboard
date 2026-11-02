import { ChartArea, ChartColumnStacked, LayoutGrid, Table2, Zap } from 'lucide-react'

const NAV = [
  { href: '#resumen', label: 'Resumen', icon: LayoutGrid },
  { href: '#demanda', label: 'Demanda', icon: ChartArea },
  { href: '#mix', label: 'Mix de generación', icon: ChartColumnStacked },
  { href: '#fuentes', label: 'Fuentes', icon: Table2 },
]

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col items-center gap-6 border-r bg-card py-4 sm:flex">
      <div className="grid size-9 place-items-center rounded-lg bg-foreground text-background" aria-hidden>
        <Zap className="size-4" />
      </div>
      <nav aria-label="Secciones" className="flex flex-col gap-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            title={label}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Icon className="size-4" />
            <span className="sr-only">{label}</span>
          </a>
        ))}
      </nav>
      <div
        className="mt-auto grid size-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        title="Héctor Olivares Sánchez"
      >
        HO
      </div>
    </aside>
  )
}
