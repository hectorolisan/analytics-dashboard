import type { TooltipContentProps } from 'recharts'

type Props<T> = Partial<TooltipContentProps<number, string>> & {
  title: (row: T) => string
  format: (v: number) => string
  /** series apiladas: la de arriba primero, como en el gráfico */
  reverse?: boolean
}

export function ChartTooltip<T>({ active, payload, title, format, reverse }: Props<T>) {
  if (!active || !payload?.length) return null
  const items = reverse ? payload.toReversed() : payload
  return (
    <div className="card min-w-44 px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold">{title(payload[0].payload as T)}</p>
      <ul className="space-y-1">
        {items.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto pl-3 font-medium tabular-nums">{format(Number(p.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
