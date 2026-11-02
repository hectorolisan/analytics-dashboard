import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { useId } from 'react'
import { Area, AreaChart, YAxis } from 'recharts'

type Props = {
  label: string
  value: string
  delta: string
  /** dirección del cambio y si subir es bueno (null = neutro) */
  change: number
  upIsGood: boolean | null
  spark: number[]
}

export function KpiCard({ label, value, delta, change, upIsGood, spark }: Props) {
  const id = useId()
  const tone =
    change === 0 || upIsGood === null ? 'bg-muted text-muted-foreground'
    : change > 0 === upIsGood ? 'bg-good/10 text-good'
    : 'bg-bad/10 text-bad'
  const Icon = change > 0 ? ArrowUp : change < 0 ? ArrowDown : Minus

  return (
    <article className="card relative overflow-hidden p-5">
      <h2 className="font-sans text-sm font-medium text-muted-foreground">{label}</h2>
      <p className="mt-2 font-heading text-3xl font-extrabold tracking-tight">{value}</p>
      <p className={`mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${tone}`}>
        <Icon className="size-3" aria-hidden />
        {delta}
        <span className="sr-only">frente al periodo anterior</span>
      </p>
      <AreaChart
        className="absolute! top-4 right-4"
        width={96}
        height={36}
        data={spark.map((v) => ({ v }))}
        accessibilityLayer={false}
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} fill={`url(#${id})`} animationDuration={900} />
      </AreaChart>
    </article>
  )
}
