import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { sourceColor, type Day } from '../lib/data'
import { bucketLabel, compact, formatDate, formatEnergy } from '../lib/format'
import type { visibleSources } from '../lib/metrics'
import { ChartTooltip } from './ChartTooltip'

type Props = { days: Day[]; sources: ReturnType<typeof visibleSources>; bucket: number }

export function MixChart({ days, sources, bucket }: Props) {
  // shortcut: hidráulica neta < 0 (bombeo) se apila como 0; el valor real está en la tabla
  const rows = days.map((d) => ({ ...d, hydro: Math.max(0, d.hydro) }))

  return (
    <section className="card p-5">
      <header className="mb-4">
        <h2 className="text-lg">Mix de generación</h2>
        <p className="text-xs text-muted-foreground">GWh por {bucketLabel(bucket)}, apilado por fuente</p>
      </header>
      <AreaChart responsive style={{ width: '100%', height: 280 }} data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis
          dataKey="date"
          tickFormatter={(iso: string) => formatDate(iso, bucket >= 28 ? 'month' : 'short')}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          minTickGap={32}
        />
        <YAxis
          tickFormatter={(v: number) => compact.format(v)}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          width={44}
        />
        <Tooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
          content={<ChartTooltip<Day> title={(d) => formatDate(d.date, 'long')} format={formatEnergy} reverse />}
        />
        {sources.map((s) => (
          <Area
            key={s.key}
            name={s.label}
            dataKey={s.key}
            stackId="mix"
            type="monotone"
            stroke="var(--card)"
            strokeWidth={1}
            fill={sourceColor(s.key)}
            fillOpacity={0.85}
            animationDuration={900}
          />
        ))}
      </AreaChart>
      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Leyenda">
        {sources.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm" style={{ background: sourceColor(s.key) }} aria-hidden />
            {s.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
