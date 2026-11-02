import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { sourceColor, type Day } from '../lib/data'
import { compact, formatEnergy } from '../lib/format'
import { averageBy, monthlyCells, month, weekday } from '../lib/metrics'
import { ChartTooltip } from './ChartTooltip'
import { Heatmap } from './Heatmap'

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const axis = { tickLine: false, axisLine: false, tick: { fill: 'var(--muted-foreground)', fontSize: 11 } } as const

export function Seasonality({ days }: { days: Day[] }) {
  const recent = days.slice(-364)
  const decadeAgo = days.slice(-364 - 3640, -3640)
  const now = averageBy(recent, 7, weekday, (d) => d.demand)
  const then = averageBy(decadeAgo, 7, weekday, (d) => d.demand)
  const weekRows = WEEKDAYS.map((label, i) => ({ label, now: now[i], then: then[i] }))

  // últimos 3 años completos para un perfil estable
  const lastYear = Number(days.at(-1)!.date.slice(0, 4)) - 1
  const profileDays = days.filter((d) => {
    const y = Number(d.date.slice(0, 4))
    return y > lastYear - 3 && y <= lastYear
  })
  const solar = averageBy(profileDays, 12, month, (d) => d.solar)
  const wind = averageBy(profileDays, 12, month, (d) => d.wind)
  const monthRows = MONTHS.map((label, i) => ({ label, solar: solar[i], wind: wind[i] }))

  return (
    <div className="space-y-4">
      <Heatmap cells={monthlyCells(days)} />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <header className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="mr-auto">
              <h2 className="text-lg">Demanda por día de la semana</h2>
              <p className="text-xs text-muted-foreground">GWh/día de media, último año frente a hace 10 años</p>
            </div>
            <ul className="flex gap-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-primary" aria-hidden />
                Último año
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-muted-foreground/50" aria-hidden />
                Hace 10 años
              </li>
            </ul>
          </header>
          <BarChart responsive style={{ width: '100%', height: 260 }} data={weekRows} barGap={2} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="label" {...axis} />
            <YAxis {...axis} width={40} tickFormatter={(v: number) => compact.format(v)} />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
              content={<ChartTooltip<{ label: string }> title={(r) => r.label} format={formatEnergy} />}
            />
            <Bar name="Último año" dataKey="now" fill="var(--primary)" maxBarSize={20} radius={[4, 4, 0, 0]} animationDuration={900} />
            <Bar
              name="Hace 10 años"
              dataKey="then"
              fill="var(--muted-foreground)"
              fillOpacity={0.5}
              maxBarSize={20}
              radius={[4, 4, 0, 0]}
              animationDuration={900}
              animationBegin={150}
            />
          </BarChart>
        </section>

        <section className="card p-5">
          <header className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="mr-auto">
              <h2 className="text-lg">Solar frente a eólica</h2>
              <p className="text-xs text-muted-foreground">
                GWh/día de media por mes, {lastYear - 2}–{lastYear}
              </p>
            </div>
            <ul className="flex gap-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: sourceColor('solar') }} aria-hidden />
                Solar
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: sourceColor('wind') }} aria-hidden />
                Eólica
              </li>
            </ul>
          </header>
          <RadarChart responsive style={{ width: '100%', height: 260 }} data={monthRows} outerRadius="75%">
            <PolarGrid stroke="var(--grid)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Tooltip content={<ChartTooltip<{ label: string }> title={(r) => r.label} format={formatEnergy} />} />
            <Radar name="Solar" dataKey="solar" stroke={sourceColor('solar')} strokeWidth={2} fill={sourceColor('solar')} fillOpacity={0.15} animationDuration={900} />
            <Radar name="Eólica" dataKey="wind" stroke={sourceColor('wind')} strokeWidth={2} fill={sourceColor('wind')} fillOpacity={0.15} animationDuration={900} />
          </RadarChart>
        </section>
      </div>
    </div>
  )
}
