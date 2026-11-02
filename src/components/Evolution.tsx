import { Bar, BarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { SOURCES, sourceColor, type Day } from '../lib/data'
import { compact, formatDate, formatEnergy, formatPct } from '../lib/format'
import { byYear, mixShares, renewableShare } from '../lib/metrics'
import { ChartTooltip } from './ChartTooltip'
import { SourceLegend } from './SourceLegend'

const axis = { tickLine: false, tick: { fill: 'var(--muted-foreground)', fontSize: 11 } } as const

export function Evolution({ days }: { days: Day[] }) {
  const last = days.at(-1)!.date
  const partial = !last.endsWith('-12-31')
  const label = (y: Day) => y.date.slice(0, 4) + (partial && y.date.slice(0, 4) === last.slice(0, 4) ? '*' : '')
  const years = byYear(days)
  const full = partial && years.length > 1 ? years.slice(0, -1) : years

  const mix = years.map((y) => ({ year: label(y), ...mixShares(y) }))
  const exchange = years.map((y) => {
    const net = -y.exchange
    return { year: label(y), export: Math.max(0, net), import: Math.min(0, net), net }
  })

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <header className="mb-4">
          <h2 className="text-lg">Mix anual de generación</h2>
          <p className="text-xs text-muted-foreground">
            Cuota renovable: {full[0].date.slice(0, 4)} {formatPct(renewableShare(full[0]))} → {full.at(-1)!.date.slice(0, 4)}{' '}
            {formatPct(renewableShare(full.at(-1)!))}
          </p>
        </header>
        <BarChart responsive style={{ width: '100%', height: 320 }} data={mix} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="year" {...axis} axisLine={{ stroke: 'var(--border)' }} interval="preserveStartEnd" minTickGap={8} />
          <YAxis {...axis} axisLine={false} width={44} domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v: number) => `${v * 100} %`} />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={<ChartTooltip<{ year: string }> title={(r) => r.year} format={formatPct} reverse />}
          />
          {SOURCES.map((s, i) => (
            <Bar
              key={s.key}
              name={s.label}
              dataKey={s.key}
              stackId="mix"
              fill={sourceColor(s.key)}
              stroke="var(--card)"
              strokeWidth={1}
              maxBarSize={28}
              radius={i === SOURCES.length - 1 ? [4, 4, 0, 0] : 0}
              animationDuration={900}
              animationBegin={i * 60}
            />
          ))}
        </BarChart>
        <SourceLegend sources={SOURCES} />
      </section>

      <section className="card p-5">
        <header className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div>
            <h2 className="text-lg">Saldo internacional</h2>
            <p className="text-xs text-muted-foreground">TWh netos por año con Francia, Portugal, Marruecos y Andorra</p>
          </div>
          <ul className="flex gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-primary" aria-hidden />
              Exportador
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-muted-foreground/50" aria-hidden />
              Importador
            </li>
          </ul>
        </header>
        <BarChart
          responsive
          style={{ width: '100%', height: 280 }}
          data={exchange}
          stackOffset="sign"
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="year" {...axis} axisLine={false} interval="preserveStartEnd" minTickGap={8} />
          <YAxis {...axis} axisLine={false} width={44} tickFormatter={(v: number) => compact.format(v / 1000)} />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
            content={
              <ChartTooltip<{ year: string; net: number }>
                title={(r) => `${r.year} · ${r.net >= 0 ? 'exporta' : 'importa'} ${formatEnergy(Math.abs(r.net))}`}
                format={(v) => formatEnergy(Math.abs(v))}
              />
            }
          />
          <Bar name="Exportación" dataKey="export" stackId="x" fill="var(--primary)" maxBarSize={28} radius={[4, 4, 0, 0]} animationDuration={900} />
          <Bar name="Importación" dataKey="import" stackId="x" fill="var(--muted-foreground)" fillOpacity={0.5} maxBarSize={28} radius={[0, 0, 4, 4]} animationDuration={900} />
        </BarChart>
        {partial && <p className="mt-3 text-xs text-muted-foreground">* Año en curso, datos hasta el {formatDate(last, 'long')}.</p>}
      </section>
    </div>
  )
}
