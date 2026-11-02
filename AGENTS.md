# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Project

**Analytics Dashboard (Red Eléctrica)** shows demand, generation mix and international exchanges of
the Spanish peninsular power grid (2008–2026). Static SPA: Vite 8 + React 19 + TypeScript 7 +
Tailwind CSS 4 + Recharts 3 + TanStack Table 9, no backend. All visible content is in Spanish.
Vitest covers `src/lib` (pure metrics, theme, export, routing, sidebar hook) and `SourcesTable`
(`*.test.ts(x)`, jsdom by default); chart components are untested.

## Commands

pnpm is the package manager (`pnpm-lock.yaml` is committed; npm/bun also work).

- `pnpm install` — install dependencies
- `pnpm dev` — dev server at localhost:5173
- `pnpm build` — `tsc -b && vite build` into `./dist/` (test files are type-checked too)
- `pnpm lint` — Oxlint (`.oxlintrc.json`)
- `pnpm test` — Vitest (`vitest run`; config lives in `vite.config.ts`, `environment: 'jsdom'`)

Dataset: `python scripts/build_dataset.py` inside a `.venv` (`requirements.txt`: DuckDB). It
downloads the Parquet files of [`daniel-dona/ree-data`](https://huggingface.co/datasets/daniel-dona/ree-data)
(CC BY 4.0, REE open data) into `data/raw/` (git-ignored) and writes `public/data/ree-daily.json`.
Never edit that JSON by hand; `src/lib/dataset.test.ts` checks column lengths and consecutive dates.

## Architecture

`src/main.tsx` applies the stored primary color and renders `App`. `App.tsx` owns the layout
(sidebar, sticky header, screen switch), the period / source filter state and a module-level
`daysPromise` read with React 19 `use()` inside `<Suspense>` (skeleton fallbacks), so the JSON is
fetched once for every screen. Screens: `Dashboard` (Resumen), `Evolution`, `Seasonality`.

Patterns that span files:

- **Data shape**: the JSON is columnar; `loadDays()` turns it into `Day[]`. Energies are GWh/day,
  `peak` is MW, `exchange < 0` means net export (REE's sign, checked against generation − demand —
  the dataset card says the opposite). Hydro is net and can be negative (pumping): charts clamp it
  to 0 (`mixShares`, `MixChart`), KPIs and the table keep the net value.
- **Metrics are pure** (`src/lib/metrics.ts`): `splitPeriod` (current vs previous n days),
  `bucketize` (fixed-size chunks; `PERIODS[].days` must be a multiple of `bucket`), `combine`
  (sums energies, max peak), `groupDays` / `byYear` / `monthlyCells`, `averageBy`. Add logic here
  with a test, not inside components.
- **Source colors follow the entity**: `SOURCES` order equals the categorical slot order
  `--series-1…8` in `index.css`, a palette validated for colour-blind separation in that exact
  order (light and dark steps). Use `sourceColor(key)`; don't reorder `SOURCES` or pick colours by
  index after filtering.
- **Theme**: shadcn-style tokens in `src/index.css` (`--background`, `--card`, `--primary`…, mapped
  with `@theme inline`); no `tailwind.config`. Dark mode is class-based (`@custom-variant dark`);
  an inline script in `index.html` sets `.dark` before first paint. `applyPrimary()` sets
  `var(--color-<name>-600|500)` at runtime, which only works because of
  `@import "tailwindcss" theme(static)` — keep it. Amber/yellow/lime use step 400 with dark text.
  Preferences (`theme`, `primary`, `sidebar`) go through `read`/`write` in `lib/theme.ts`
  (try/catch around `localStorage`).
- **Charts**: Recharts 3 with the chart-level `responsive` prop and a `style` size (no
  `ResponsiveContainer`). Colours are CSS variables so they follow theme and primary.
  `ChartTooltip` is shared (`reverse` for stacks, zero values hidden). The heatmap is a plain CSS
  grid coloured with `color-mix()` on `--primary`; its `animate-cell-in` keyframes live in `@theme`
  and run under `motion-safe:`.
- **TanStack Table v9**: `tableFeatures({ rowSortingFeature, sortedRowModel, sortFns })` +
  `useTable` + `createColumnHelper<typeof features, Row>()` + `<table.FlexRender>`. The v8 API
  (`useReactTable`, `getCoreRowModel`) does not exist here.
- **Navigation**: hash routes (`#/resumen`, `#/evolucion`, `#/estacionalidad`) via
  `useSyncExternalStore` in `lib/route.ts`; no router dependency. Filters and CSV export only show
  on Resumen.
- **Sidebar** (`lib/sidebar.ts` + `components/Sidebar.tsx`): desktop collapses to an icon rail
  (`w-16`, labels hidden with `group-data-[open=false]/sidebar`), state persisted; mobile is an
  overlay sheet closed on navigation, backdrop click or Esc. `Ctrl/Cmd+B` toggles both.
- **Brand**: fonts from Google Fonts in `index.html` — Poppins (`font-sans`), Bricolage Grotesque
  800 (`font-heading`, h1–h3), Geist Mono (`font-mono`, credit only). Section labels are uppercase
  with `tracking-[0.3em]`. `Credit.tsx` is shared with other hectorolisan projects; keep it as is.
- **Info dialog**: native `<dialog>` with `showModal()`, scrollable body and fixed credit footer.
  Keep its dataset facts in sync with `README.md` and `scripts/build_dataset.py`.

## Conventions

- Commits follow Conventional Commits, in English and lowercase (`feat(charts): …`).
- On Windows the Vite watcher sometimes misses an edit and serves a stale module (blank page with
  a `ReferenceError` for a just-added import); touching the file fixes it.
