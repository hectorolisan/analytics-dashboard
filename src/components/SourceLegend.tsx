import { sourceColor, type SOURCES } from '../lib/data'

export function SourceLegend({ sources }: { sources: readonly (typeof SOURCES)[number][] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground" aria-label="Leyenda">
      {sources.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ background: sourceColor(s.key) }} aria-hidden />
          {s.label}
        </li>
      ))}
    </ul>
  )
}
