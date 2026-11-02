import { ChevronDown, Download } from 'lucide-react'
import { use } from 'react'
import type { Day } from '../lib/data'
import { download, screenRows, toCsv } from '../lib/export'
import { PERIOD_OPTIONS, SOURCE_FILTERS, type Period, type SourceFilter } from '../lib/metrics'
import type { Screen } from '../lib/route'
import { controlBase, controlClass } from './ThemeControls'

type SelectProps<T extends string> = {
  label: string
  value: T
  options: readonly { key: T; label: string }[]
  onChange: (v: T) => void
}

export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
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

type ExportProps = { data: Promise<Day[] | Error>; screen: Screen } & Parameters<typeof screenRows>[2]

export function ExportButton({ data, screen, ...view }: ExportProps) {
  const days = use(data)
  const { rows, sources } = days instanceof Error ? { rows: [], sources: [] } : screenRows(days, screen, view)
  const ok = rows.length > 0
  return (
    <button
      type="button"
      disabled={!ok}
      onClick={() => {
        if (ok) download(`ree-${screen}-${rows[0].date}_${rows.at(-1)!.date}.csv`, toCsv(rows, sources))
      }}
      className={`${controlBase} border-foreground bg-foreground text-background hover:bg-foreground/85 disabled:opacity-50`}
    >
      <Download className="size-4" aria-hidden />
      Exportar
    </button>
  )
}
