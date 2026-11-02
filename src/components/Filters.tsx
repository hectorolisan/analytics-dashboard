import { ChevronDown, Download } from 'lucide-react'
import { use } from 'react'
import type { Day } from '../lib/data'
import { download, toCsv } from '../lib/export'
import { PERIOD_OPTIONS, periodDays, SOURCE_FILTERS, visibleSources, type Period, type SourceFilter } from '../lib/metrics'
import { controlClass } from './ThemeControls'

type SelectProps<T extends string> = {
  label: string
  value: T
  options: readonly { key: T; label: string }[]
  onChange: (v: T) => void
}

function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`${controlClass} cursor-pointer appearance-none pr-8`}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </label>
  )
}

type Props = {
  period: Period
  onPeriod: (key: Period['key']) => void
  onRange: (range: { from?: string | null; to?: string | null }) => void
  sourceFilter: SourceFilter
  onSourceFilter: (f: SourceFilter) => void
}

export function Filters({ period, onPeriod, onRange, sourceFilter, onSourceFilter }: Props) {
  return (
    <>
      <Select label="Periodo" value={period.key} options={PERIOD_OPTIONS} onChange={onPeriod} />
      {period.key === 'custom' && (
        <>
          <DateInput label="Desde" value={period.from} onChange={(from) => onRange({ from })} />
          <DateInput label="Hasta" value={period.to} onChange={(to) => onRange({ to })} />
        </>
      )}
      <Select label="Fuentes" value={sourceFilter} options={SOURCE_FILTERS} onChange={onSourceFilter} />
    </>
  )
}

function DateInput({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | null) => void }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} className={controlClass} />
    </label>
  )
}

type YearProps = { data: Promise<Day[] | Error>; from: string | null; to: string | null; onChange: (range: { y0?: string; y1?: string }) => void }

export function YearRange({ data, from, to, onChange }: YearProps) {
  const days = use(data)
  if (days instanceof Error) return null
  const years = [...new Set(days.map((d) => d.date.slice(0, 4)))].map((y) => ({ key: y, label: y }))
  const y0 = from ?? years[0].key
  const y1 = to ?? years.at(-1)!.key
  return (
    <>
      <Select label="Desde" value={y0} options={years.filter((y) => y.key <= y1)} onChange={(y) => onChange({ y0: y })} />
      <Select label="Hasta" value={y1} options={years.filter((y) => y.key >= y0)} onChange={(y) => onChange({ y1: y })} />
    </>
  )
}

export function ExportButton({ data, period, sourceFilter }: { data: Promise<Day[] | Error>; period: Period; sourceFilter: SourceFilter }) {
  const days = use(data)
  const ok = !(days instanceof Error)
  return (
    <button
      type="button"
      disabled={!ok}
      onClick={() => {
        if (!ok) return
        const { current } = periodDays(days, period)
        download(`ree-${period.key}-${current.at(-1)?.date}.csv`, toCsv(current, visibleSources(sourceFilter)))
      }}
      className={`${controlClass} border-foreground bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50`}
    >
      <Download className="size-4" aria-hidden />
      Exportar
    </button>
  )
}
