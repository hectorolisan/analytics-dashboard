import { Suspense, use, type ReactNode } from 'react'
import { Dashboard } from './components/Dashboard'
import { Evolution } from './components/Evolution'
import { Seasonality } from './components/Seasonality'
import { ExportButton, Filters, YearRange } from './components/Filters'
import { OpenSidebarButton, Sidebar } from './components/Sidebar'
import { ChartsSkeleton, DashboardSkeleton, Skeleton } from './components/Skeleton'
import { ThemeControls } from './components/ThemeControls'
import { loadDays, type Day } from './lib/data'
import { inYears, parsePeriod, SOURCE_FILTERS } from './lib/metrics'
import { hashParams, parseRoute, SCREENS, setParams, useHash } from './lib/route'
import { useSidebar } from './lib/sidebar'

const daysPromise: Promise<Day[] | Error> = loadDays().catch((e: Error) => e)

export default function App() {
  const hash = useHash()
  const screen = parseRoute(hash)
  const params = hashParams(hash)
  const period = parsePeriod(params)
  const [y0, y1] = [params.get('y0'), params.get('y1')]
  const sourceFilter = SOURCE_FILTERS.find((f) => f.key === params.get('f'))?.key ?? 'all'
  const title = SCREENS.find((s) => s.key === screen)!.title
  const sidebar = useSidebar()

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        screen={screen}
        query={hash.split('?')[1]}
        open={sidebar.open}
        mobileOpen={sidebar.mobileOpen}
        onToggle={sidebar.toggle}
        onNavigate={sidebar.closeMobile}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <OpenSidebarButton onToggle={sidebar.toggle} />
          <div className="mr-auto">
            <h1 className="text-xl">{title}</h1>
            <p className="text-xs text-muted-foreground">Red Eléctrica · Sistema peninsular</p>
          </div>
          {screen === 'resumen' && (
            <Filters
              period={period}
              onPeriod={(p) => setParams({ p })}
              onRange={setParams}
              sourceFilter={sourceFilter}
              onSourceFilter={(f) => setParams({ f })}
            />
          )}
          {screen !== 'resumen' && (
            <Suspense fallback={<Skeleton className="h-9 w-44" />}>
              <YearRange data={daysPromise} from={y0} to={y1} onChange={setParams} />
            </Suspense>
          )}
          <ThemeControls />
          <Suspense fallback={<Skeleton className="h-9 w-28" />}>
            <ExportButton data={daysPromise} screen={screen} period={period} sourceFilter={sourceFilter} y0={y0} y1={y1} />
          </Suspense>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          {screen === 'resumen' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <Loaded>{(days) => <Dashboard days={days} period={period} sourceFilter={sourceFilter} />}</Loaded>
            </Suspense>
          ) : screen === 'evolucion' ? (
            <Suspense fallback={<ChartsSkeleton />}>
              <Loaded select={(days) => inYears(days, y0, y1)}>{(days) => <Evolution days={days} />}</Loaded>
            </Suspense>
          ) : (
            <Suspense fallback={<ChartsSkeleton />}>
              <Loaded select={(days) => inYears(days, y0, y1)}>{(days) => <Seasonality days={days} />}</Loaded>
            </Suspense>
          )}
        </main>
      </div>
    </div>
  )
}

function Loaded({ children, select = (d) => d }: { children: (days: Day[]) => ReactNode; select?: (days: Day[]) => Day[] }) {
  const days = use(daysPromise)
  if (days instanceof Error) {
    return <p role="alert" className="card p-5 text-sm">{days.message}</p>
  }
  const selected = select(days)
  return selected.length ? children(selected) : <p role="alert" className="card p-5 text-sm">Sin datos en el rango elegido.</p>
}
