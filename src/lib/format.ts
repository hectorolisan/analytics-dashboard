const nf = (max: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: max })
const n0 = nf(0)
const n1 = nf(1)

export const formatEnergy = (gwh: number) =>
  Math.abs(gwh) >= 1000 ? `${n1.format(gwh / 1000)} TWh` : `${n0.format(gwh)} GWh`

export const formatPower = (mw: number) => `${n1.format(mw / 1000)} GW`

export const compact = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 })

export const bucketLabel = (days: number) => (days === 1 ? 'día' : days === 7 ? 'semana' : `${days / 7} semanas`)

export const formatPct =(x: number) => `${n1.format(x * 100)} %`

export const formatSigned = (s: string, x: number) => (x > 0 ? `+${s}` : x < 0 ? s.replace('-', '−') : s)

const dShort = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const dMonth = new Intl.DateTimeFormat('es-ES', { month: 'short', year: '2-digit', timeZone: 'UTC' })
const dLong = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

export const formatDate = (iso: string, style: 'short' | 'month' | 'long' = 'short') =>
  (style === 'short' ? dShort : style === 'month' ? dMonth : dLong).format(new Date(iso))

export type Metric = 'demand' | 'renewable'

export const METRICS: { key: Metric; label: string; format: (v: number) => string }[] = [
  { key: 'demand', label: 'Demanda media', format: (v) => `${formatEnergy(v)}/día` },
  { key: 'renewable', label: 'Cuota renovable', format: formatPct },
]

export const MONTHS = Array.from({ length: 12 }, (_, m) =>
  new Intl.DateTimeFormat('es-ES', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, m, 1))),
)
