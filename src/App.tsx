import { Suspense, use, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { Sidebar } from './components/Sidebar'
import { DashboardSkeleton } from './components/Skeleton'
import { ThemeControls } from './components/ThemeControls'
import { loadDays, type Day } from './lib/data'
import { PERIODS, type SourceFilter } from './lib/metrics'

const daysPromise: Promise<Day[] | Error> = loadDays().catch((e: Error) => e)

export default function App() {
  const [period] = useState(PERIODS[1])
  const [sourceFilter] = useState<SourceFilter>('all')

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mr-auto">
            <h1 className="text-xl">Resumen</h1>
            <p className="text-xs text-muted-foreground">Red Eléctrica · Sistema peninsular</p>
          </div>
          <ThemeControls />
        </header>
        <main id="resumen" className="mx-auto max-w-7xl scroll-mt-20 p-4 sm:p-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <Loaded period={period} sourceFilter={sourceFilter} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function Loaded(props: Omit<Parameters<typeof Dashboard>[0], 'days'>) {
  const days = use(daysPromise)
  if (days instanceof Error) {
    return <p role="alert" className="card p-5 text-sm">{days.message}</p>
  }
  return <Dashboard days={days} {...props} />
}
