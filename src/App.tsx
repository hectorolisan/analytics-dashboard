import { Suspense, use, useState, type ReactNode } from 'react'
import { Dashboard } from './components/Dashboard'
import { Evolution } from './components/Evolution'
import { ExportButton, Filters } from './components/Filters'
import { Sidebar } from './components/Sidebar'
import { ChartsSkeleton, DashboardSkeleton, Skeleton } from './components/Skeleton'
import { ThemeControls } from './components/ThemeControls'
import { loadDays, type Day } from './lib/data'
import { PERIODS, type SourceFilter } from './lib/metrics'
import { SCREENS, useRoute } from './lib/route'

const daysPromise: Promise<Day[] | Error> = loadDays().catch((e: Error) => e)

export default function App() {
  const screen = useRoute()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[1])
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const title = SCREENS.find((s) => s.key === screen)!.title

  return (
    <div className="flex min-h-dvh">
      <Sidebar screen={screen} />
      <div className="min-w-0 flex-1 pb-14 sm:pb-0">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
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
            <ChartsSkeleton />
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
