import { useState } from 'react'
import { eventIn } from '../lib/events'
import { formatDate, METRICS, MONTHS, type Metric } from '../lib/format'
import type { monthlyCells } from '../lib/metrics'

type Cell = ReturnType<typeof monthlyCells>[number]
// rampa secuencial de un solo tono: más intensidad = más valor
const shade = (t: number) => `color-mix(in oklch, var(--primary) ${Math.round(8 + t * 92)}%, var(--card))`

export function Heatmap({ cells }: { cells: Cell[] }) {
  const [metric, setMetric] = useState<Metric>('demand')
  const { format, label } = METRICS.find((m) => m.key === metric)!
  const values = cells.map((c) => c[metric])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const peak = cells[values.indexOf(max)]
  const [hover, setHover] = useState<Cell>()
  const shown = hover ?? peak

  const byYear = new Map<string, Cell[]>()
  for (const c of cells) byYear.set(c.ym.slice(0, 4), [...(byYear.get(c.ym.slice(0, 4)) ?? []), c])

  return (
    <section className="card p-5">
      <header className="mb-4 flex flex-wrap items-start gap-3">
        <div className="mr-auto">
          <h2 className="text-lg">Calendario mensual</h2>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {hover ? '' : 'Máximo · '}
            {formatDate(`${shown.ym}-01`, 'month')}: <span className="font-semibold text-foreground">{format(shown[metric])}</span>
            {eventIn(shown.ym) && ` · ${eventIn(shown.ym)!.label}`}
          </p>
        </div>
        <Segmented label="Métrica" value={metric} options={METRICS} onChange={setMetric} />
      </header>

      <div
        role="img"
        aria-label={`${label} por mes y año, de ${format(min)} a ${format(max)}`}
        className="grid grid-cols-[2.5rem_repeat(12,minmax(0,1fr))] gap-0.5 text-[11px] text-muted-foreground"
        onMouseLeave={() => setHover(undefined)}
      >
        <span />
        {MONTHS.map((m) => (
          <span key={m} className="pb-1 text-center">
            {m}
          </span>
        ))}
        {[...byYear].map(([year, row], r) => (
          <Row key={year} year={year} row={row} rowIndex={r} metric={metric} min={min} max={max} onHover={setHover} />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{format(min)}</span>
        <span className="h-2 w-40 rounded-full" style={{ background: `linear-gradient(to right, ${shade(0)}, ${shade(1)})` }} aria-hidden />
        <span className="tabular-nums">{format(max)}</span>
      </div>
    </section>
  )
}

type SegmentedProps<T extends string> = { label: string; value: T; options: readonly { key: T; label: string }[]; onChange: (v: T) => void }

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border bg-muted p-0.5 text-xs font-medium">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={o.key === value}
          onClick={() => onChange(o.key)}
          className="rounded-md px-2.5 py-1 text-muted-foreground transition-colors aria-checked:bg-card aria-checked:text-foreground aria-checked:shadow-xs focus-visible:outline-2 focus-visible:outline-primary"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

type RowProps = { year: string; row: Cell[]; rowIndex: number; metric: Metric; min: number; max: number; onHover: (c: Cell) => void }

function Row({ year, row, rowIndex, metric, min, max, onHover }: RowProps) {
  const first = Number(row[0].ym.slice(5, 7)) - 1
  return (
    <>
      <span className="pr-1 text-right leading-5 tabular-nums">{year}</span>
      {first > 0 && <span style={{ gridColumn: `span ${first}` }} />}
      {row.map((c, i) => (
        <span
          key={c.ym}
          onMouseEnter={() => onHover(c)}
          title={eventIn(c.ym)?.label}
          className={`h-5 rounded-[3px] transition-[background-color] duration-500 hover:outline-2 hover:outline-foreground motion-safe:animate-cell-in ${eventIn(c.ym) ? 'outline-1 -outline-offset-1 outline-foreground/70' : ''}`}
          style={{ background: shade((c[metric] - min) / (max - min || 1)), animationDelay: `${(rowIndex + first + i) * 15}ms` }}
        />
      ))}
    </>
  )
}
