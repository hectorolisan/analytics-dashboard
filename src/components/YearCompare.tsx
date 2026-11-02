import { useState } from 'react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { Day } from '../lib/data'
import { compact, METRICS, MONTHS, type Metric } from '../lib/format'
import { monthlyCells } from '../lib/metrics'
import { hashParams, setParams, useHash } from '../lib/route'
import { ChartTooltip } from './ChartTooltip'
import { Select } from './Filters'
import { Segmented } from './Heatmap'

const axis = { tickLine: false, axisLine: false, tick: { fill: 'var(--muted-foreground)', fontSize: 11 } } as const

export function YearCompare({ days }: { days: Day[] }) {
  const params = hashParams(useHash())
  const [metric, setMetric] = useState<Metric>('demand')
  const { format } = METRICS.find((m) => m.key === metric)!
  const cells = monthlyCells(days)
  const years = [...new Set(cells.map((c) => c.ym.slice(0, 4)))].map((y) => ({ key: y, label: y }))
  const pick = (name: string, fallback: string) => years.find((y) => y.key === params.get(name))?.key ?? fallback
  const b = pick('b', years.at(-1)!.key)
  const a = pick('a', years.at(-2)?.key ?? b)

  const value = (year: string, m: number) => cells.find((c) => c.ym === `${year}-${String(m + 1).padStart(2, '0')}`)?.[metric]
  const rows = MONTHS.map((label, m) => ({ label, a: value(a, m), b: value(b, m) }))

  return (
    <section className="card p-5">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h2 className="text-lg">Comparativa anual</h2>
          <p className="text-xs text-muted-foreground">Media mensual de un año frente a otro</p>
        </div>
        <Segmented label="Métrica" value={metric} options={METRICS} onChange={setMetric} />
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full bg-muted-foreground/60" aria-hidden />
          <Select label="Año A" value={a} options={years} onChange={(y) => setParams({ a: y })} />
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-primary" aria-hidden />
          <Select label="Año B" value={b} options={years} onChange={(y) => setParams({ b: y })} />
        </span>
      </header>
      <LineChart responsive style={{ width: '100%', height: 280 }} data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="label" {...axis} />
        <YAxis
          {...axis}
          width={44}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => (metric === 'renewable' ? `${Math.round(v * 100)} %` : compact.format(v))}
        />
        <Tooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
          content={<ChartTooltip<{ label: string }> title={(r) => r.label} format={format} />}
        />
        <Line name={a} dataKey="a" type="monotone" stroke="var(--muted-foreground)" strokeOpacity={0.6} strokeWidth={1.5} dot={false} animationDuration={900} />
        <Line name={b} dataKey="b" type="monotone" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }} animationDuration={900} />
      </LineChart>
    </section>
  )
}
