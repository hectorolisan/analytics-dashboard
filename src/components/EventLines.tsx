import { ReferenceLine } from 'recharts'
import type { EventMark } from '../lib/events'

export const eventLines = (marks: EventMark[]) =>
  marks.map((m) => (
    <ReferenceLine
      key={m.date}
      x={m.x}
      stroke="var(--foreground)"
      strokeOpacity={0.4}
      strokeDasharray="3 3"
      label={{ value: m.label, position: 'insideTopLeft', fill: 'var(--muted-foreground)', fontSize: 11 }}
    />
  ))
