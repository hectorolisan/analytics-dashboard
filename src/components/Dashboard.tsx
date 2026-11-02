import type { Day } from '../lib/data'
import { formatEnergy, formatPct, formatPower, formatSigned } from '../lib/format'
import {
  bucketize,
  combine,
  pctChange,
  renewableShare,
  splitPeriod,
  visibleSources,
  type Period,
  type SourceFilter,
} from '../lib/metrics'
import { DemandChart } from './DemandChart'
import { KpiCard } from './KpiCard'
import { MixChart } from './MixChart'

type Props = { days: Day[]; period: Period; sourceFilter: SourceFilter }

const pctDelta = (x: number) => formatSigned(formatPct(x), x)

export function Dashboard({ days, period, sourceFilter }: Props) {
  const { current, previous } = splitPeriod(days, period.days)
  const curr = combine(current)
  const prev = combine(previous)
  const buckets = bucketize(current, period.bucket)
  const prevBuckets = bucketize(previous, period.bucket)

  const share = renewableShare(curr)
  const shareDiff = share - renewableShare(prev)
  const exportNet = -curr.exchange
  const exportDiff = exportNet - -prev.exchange

  return (
    <div className="space-y-4">
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
      <DemandChart current={buckets} previous={prevBuckets} total={formatEnergy(curr.demand)} bucket={period.bucket} />
      <MixChart days={buckets} sources={visibleSources(sourceFilter)} bucket={period.bucket} />
    </div>
  )
}
