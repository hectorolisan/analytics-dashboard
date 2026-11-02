export const SOURCES = [
  { key: 'hydro', label: 'Hidráulica', renewable: true },
  { key: 'solar', label: 'Solar', renewable: true },
  { key: 'wind', label: 'Eólica', renewable: true },
  { key: 'biomass', label: 'Biomasa', renewable: true },
  { key: 'nuclear', label: 'Nuclear', renewable: false },
  { key: 'other', label: 'Cogeneración y otras', renewable: false },
  { key: 'gas', label: 'Ciclo combinado', renewable: false },
  { key: 'coal', label: 'Carbón', renewable: false },
] as const

export type SourceKey = (typeof SOURCES)[number]['key']

/** Energías en GWh/día, pico en MW. exchange < 0 = exportación neta. */
export type Day = { date: string; demand: number; peak: number; exchange: number } & Record<SourceKey, number>

type Columnar = { [K in keyof Day]: Day[K][] }

export async function loadDays(url = '/data/ree-daily.json'): Promise<Day[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`)
  const cols: Columnar = await res.json()
  return cols.date.map((_, i) => Object.fromEntries(Object.keys(cols).map((k) => [k, cols[k as keyof Day][i]])) as Day)
}
