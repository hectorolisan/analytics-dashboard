export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />
}

export function ChartsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando datos" className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="card space-y-4 p-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando datos" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
      <div className="card space-y-4 p-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="card space-y-3 p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  )
}
