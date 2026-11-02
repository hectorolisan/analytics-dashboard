import { Suspense, use, useState, type ReactNode } from 'react'
import { Dashboard } from './components/Dashboard'
import { Evolution } from './components/Evolution'
import { Seasonality } from './components/Seasonality'
import { ExportButton, Filters } from './components/Filters'
import { OpenSidebarButton, Sidebar } from './components/Sidebar'
import { ChartsSkeleton, DashboardSkeleton, Skeleton } from './components/Skeleton'
import { ThemeControls } from './components/ThemeControls'
import { loadDays, type Day } from './lib/data'
import { PERIODS, type SourceFilter } from './lib/metrics'
import { SCREENS, useRoute } from './lib/route'
import { useSidebar } from './lib/sidebar'

const daysPromise: Promise<Day[] | Error> = loadDays().catch((e: Error) => e)

export default function App() {
  const screen = useRoute()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[1])
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const title = SCREENS.find((s) => s.key === screen)!.title
  const sidebar = useSidebar()

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        screen={screen}
        open={sidebar.open}
        mobileOpen={sidebar.mobileOpen}
        onToggle={sidebar.toggle}
        onNavigate={sidebar.closeMobile}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <OpenSidebarButton open={sidebar.open} onToggle={sidebar.toggle} />
          <div className="mr-auto">
            <h1 className="text-xl">{title}</h1>
            <p className="text-xs text-muted-foreground">Red Eléctrica · Sistema peninsular</p>
          </div>
          {screen === 'resumen' && (
            <Filters period={period} onPeriod={setPeriod} sourceFilter={sourceFilter} onSourceFilter={setSourceFilter} />
          )}
          <ThemeControls />
          {screen === 'resumen' && (
            <Suspense fallback={<Skeleton className="h-9 w-28" />}>
              <ExportButton data={daysPromise} period={period} sourceFilter={sourceFilter} />
            </Suspense>
          )}
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          {screen === 'resumen' ? (
            <Suspense fallback={<DashboardSkeleton />}>
              <Loaded>{(days) => <Dashboard days={days} period={period} sourceFilter={sourceFilter} />}</Loaded>
            </Suspense>
          ) : screen === 'evolucion' ? (
            <Suspense fallback={<ChartsSkeleton />}>
              <Loaded>{(days) => <Evolution days={days} />}</Loaded>
            </Suspense>
          ) : (
            <Suspense fallback={<ChartsSkeleton />}>
              <Loaded>{(days) => <Seasonality days={days} />}</Loaded>
            </Suspense>
          )}
        </main>
      </div>
    </div>
  )
}

function Loaded({ children }: { children: (days: Day[]) => ReactNode }) {
  const days = use(daysPromise)
  if (days instanceof Error) {
    return <p role="alert" className="card p-5 text-sm">{days.message}</p>
  }
  return children(days)
}
