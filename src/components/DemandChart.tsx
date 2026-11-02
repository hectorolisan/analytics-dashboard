import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { bucketLabel, compact, formatDate, formatEnergy } from '../lib/format'
import type { Day } from '../lib/data'
import type { EventMark } from '../lib/events'
import { ChartTooltip } from './ChartTooltip'
import { SaveImage } from './SaveImage'
import { eventLines } from './EventLines'

type Row = { date: string; prevDate?: string; current: number; previous?: number }

type Props = { current: Day[]; previous: Day[]; total: string; bucket: number; marks: EventMark[] }

export function DemandChart({ current, previous, total, bucket, marks }: Props) {
  const id = useId()
  const rows: Row[] = current.map((d, i) => ({
    date: d.date,
    prevDate: previous[i]?.date,
    current: d.demand,
    previous: previous[i]?.demand,
  }))
  const peak = rows.reduce((m, r) => (r.current > m.current ? r : m))
  const tick = (iso: string) => formatDate(iso, bucket >= 28 ? 'month' : 'short')

  return (
    <section className="card p-5">
      <header className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div>
          <h2 className="text-lg">Demanda en el tiempo</h2>
          <p className="text-xs text-muted-foreground">GWh por {bucketLabel(bucket)}</p>
        </div>
        <ul className="flex gap-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-primary" aria-hidden />
            Este periodo
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 rounded-full bg-muted-foreground/60" aria-hidden />
            Periodo anterior
          </li>
        </ul>
        <p className="ml-auto font-heading text-lg font-extrabold">{total}</p>
        <SaveImage name="demanda" />
      </header>
      <AreaChart
        responsive
        title="Demanda en el tiempo"
        desc={`Total ${total}. Máximo de ${formatEnergy(peak.current)} el ${formatDate(peak.date, 'long')}.`}
        style={{ width: '100%', height: 280 }}
        data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis
          dataKey="date"
          tickFormatter={tick}
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
          domain={['auto', 'auto']}
        />
        <Tooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
          content={
            <ChartTooltip<Row>
              title={(r) => (r.prevDate ? `${formatDate(r.date, 'long')} · vs ${formatDate(r.prevDate, 'long')}` : formatDate(r.date, 'long'))}
              format={formatEnergy}
              reverse
            />
          }
        />
        <Line
          name="Periodo anterior"
          dataKey="previous"
          type="monotone"
          stroke="var(--muted-foreground)"
          strokeOpacity={0.6}
          strokeWidth={1.5}
          dot={false}
          animationDuration={900}
        />
        <Area
          name="Este periodo"
          dataKey="current"
          type="monotone"
          stroke="var(--primary)"
          strokeWidth={2}
          fill={`url(#${id})`}
          activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
          animationDuration={900}
        />
        {eventLines(marks)}
      </AreaChart>
    </section>
  )
}
