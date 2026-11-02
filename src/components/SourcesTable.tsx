import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { sourceColor } from '../lib/data'
import { formatEnergy, formatPct, formatSigned } from '../lib/format'
import type { SourceRow } from '../lib/metrics'

const features = tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns })
const col = createColumnHelper<typeof features, SourceRow>()

const columns = col.columns([
  col.accessor('label', {
    header: 'Fuente',
    cell: ({ row }) => (
      <span className="flex items-center gap-2 font-medium">
        <span className="size-2 rounded-full" style={{ background: sourceColor(row.original.key) }} aria-hidden />
        {row.original.label}
      </span>
    ),
  }),
  col.accessor('renewable', {
    header: 'Tipo',
    cell: ({ getValue }) => (
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        {getValue() ? 'Renovable' : 'No renovable'}
      </span>
    ),
  }),
  col.accessor('energy', { header: 'Energía', cell: ({ getValue }) => formatEnergy(getValue()) }),
  col.accessor('share', {
    header: 'Cuota',
    cell: ({ getValue }) => (
      <span className="flex items-center justify-end gap-2">
        <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted md:block" aria-hidden>
          <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(0, getValue()) * 100}%` }} />
        </span>
        {formatPct(getValue())}
      </span>
    ),
  }),
  col.accessor('maxDay', { header: 'Máx. diario', cell: ({ getValue }) => formatEnergy(getValue()) }),
  col.accessor('change', {
    header: 'Var.',
    cell: ({ getValue }) => formatSigned(formatPct(getValue()), getValue()),
  }),
])

const numeric = new Set(['energy', 'share', 'maxDay', 'change'])

export function SourcesTable({ rows }: { rows: SourceRow[] }) {
  const table = useTable({
    features,
    columns,
    data: rows,
    initialState: { sorting: [{ id: 'energy', desc: true }] },
  })

  return (
    <section className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Generación por fuente en el periodo seleccionado</caption>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b">
                {hg.headers.map((h) => {
                  const sorted = h.column.getIsSorted()
                  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
                  return (
                    <th
                      key={h.id}
                      scope="col"
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                      className={`px-5 py-3 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase ${numeric.has(h.column.id) ? 'text-right' : 'text-left'}`}
                    >
                      <button
                        type="button"
                        onClick={h.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 uppercase hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        <table.FlexRender header={h} />
                        <Icon className={`size-3 ${sorted ? '' : 'opacity-40'}`} aria-hidden />
                      </button>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b transition-colors last:border-0 hover:bg-muted/50">
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`px-5 py-3 whitespace-nowrap ${numeric.has(cell.column.id) ? 'text-right tabular-nums' : ''}`}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
