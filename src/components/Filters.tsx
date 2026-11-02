import { ChevronDown, Download } from 'lucide-react'
import { use } from 'react'
import type { Day } from '../lib/data'
import { download, toCsv } from '../lib/export'
import { PERIODS, SOURCE_FILTERS, splitPeriod, visibleSources, type Period, type SourceFilter } from '../lib/metrics'
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
  onPeriod: (p: Period) => void
  sourceFilter: SourceFilter
  onSourceFilter: (f: SourceFilter) => void
}

export function Filters({ period, onPeriod, sourceFilter, onSourceFilter }: Props) {
  return (
    <>
      <Select
        label="Periodo"
        value={period.key}
        options={PERIODS}
        onChange={(k) => onPeriod(PERIODS.find((p) => p.key === k)!)}
      />
      <Select label="Fuentes" value={sourceFilter} options={SOURCE_FILTERS} onChange={onSourceFilter} />
    </>
  )
}

export function ExportButton({ data, period, sourceFilter }: { data: Promise<Day[] | Error> } & Omit<Props, 'onPeriod' | 'onSourceFilter'>) {
  const days = use(data)
  const ok = !(days instanceof Error)
  return (
    <button
      type="button"
      disabled={!ok}
      onClick={() => {
        if (!ok) return
        const { current } = splitPeriod(days, period.days)
        download(`ree-${period.key}-${current.at(-1)?.date}.csv`, toCsv(current, visibleSources(sourceFilter)))
      }}
      className={`${controlClass} border-foreground bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50`}
    >
      <Download className="size-4" aria-hidden />
      Exportar
    </button>
  )
}
