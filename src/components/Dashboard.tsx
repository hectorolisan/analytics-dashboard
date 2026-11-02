import type { Day } from '../lib/data'
import { formatDate, formatEnergy, formatPct, formatPower, formatSigned } from '../lib/format'
import {
  bucketize,
  combine,
  pctChange,
  periodDays,
  renewableShare,
  sourceRows,
  visibleSources,
  type Period,
  type SourceFilter,
} from '../lib/metrics'
import { DemandChart } from './DemandChart'
import { KpiCard } from './KpiCard'
import { MixChart } from './MixChart'
import { SourcesTable } from './SourcesTable'

type Props = { days: Day[]; period: Period; sourceFilter: SourceFilter }

const pctDelta = (x: number) => formatSigned(formatPct(x), x)

export function Dashboard({ days, period, sourceFilter }: Props) {
  const { current, previous, bucket } = periodDays(days, period)
  if (!current.length) return <p role="alert" className="card p-5 text-sm">Sin datos en el rango elegido.</p>
  const curr = combine(current)
  const prev = combine(previous)
  const buckets = bucketize(current, bucket)
  const prevBuckets = bucketize(previous, bucket)

  const share = renewableShare(curr)
  const shareDiff = share - renewableShare(prev)
  const exportNet = -curr.exchange
  const exportDiff = exportNet - -prev.exchange

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
        {formatDate(current[0].date, 'long')} – {formatDate(current.at(-1)!.date, 'long')}
        <span className="sr-only">, comparado con el periodo anterior</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Demanda"
          value={formatEnergy(curr.demand)}
          delta={pctDelta(pctChange(curr.demand, prev.demand))}
          change={curr.demand - prev.demand}
          upIsGood={null}
          spark={buckets.map((d) => d.demand)}
        />
        <KpiCard
          label="Cuota renovable"
          value={formatPct(share)}
          delta={formatSigned(`${(shareDiff * 100).toFixed(1).replace('.', ',')} pt`, shareDiff)}
          change={shareDiff}
          upIsGood
          spark={buckets.map(renewableShare)}
        />
        <KpiCard
          label="Pico de demanda"
          value={formatPower(curr.peak)}
          delta={pctDelta(pctChange(curr.peak, prev.peak))}
          change={curr.peak - prev.peak}
          upIsGood={null}
          spark={buckets.map((d) => d.peak)}
        />
        <KpiCard
          label="Exportación neta"
          value={formatEnergy(exportNet)}
          delta={formatSigned(formatEnergy(exportDiff), exportDiff)}
          change={exportDiff}
          upIsGood={null}
          spark={buckets.map((d) => -d.exchange)}
        />
      </div>
      <DemandChart current={buckets} previous={prevBuckets} total={formatEnergy(curr.demand)} bucket={bucket} />
      <MixChart days={buckets} sources={visibleSources(sourceFilter)} bucket={bucket} />
      <SourcesTable rows={sourceRows(current, previous, sourceFilter)} />
    </div>
  )
}
