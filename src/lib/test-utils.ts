import type { Day } from './data'

export const day = (date: string, over: Partial<Day> = {}): Day => ({
  date,
  demand: 100,
  peak: 30000,
  exchange: -10,
  hydro: 10,
  solar: 20,
  wind: 30,
  biomass: 0,
  nuclear: 20,
  other: 10,
  gas: 10,
  coal: 0,
  ...over,
})
