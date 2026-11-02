# Analytics Dashboard (Red Eléctrica)

Analytics dashboard for the **Spanish peninsular power grid**: demand, generation mix and international exchanges from 2008 to 2026.
Dense data at a glance: KPI row with sparklines, animated charts, filters, sortable table and loading skeletons.

- **Vite 8** + **React 19** + **TypeScript 7** — static SPA, no backend.
- **Recharts 3** — area, stacked area, stacked 100 % bar, diverging bar, grouped bar and radar charts.
- **TanStack Table 9** — sortable sources table.
- **Tailwind CSS 4** — shadcn/ui-style tokens, light/dark mode and selectable primary color (teal by default).
- **DuckDB** (Python) — aggregates the raw dataset into a daily JSON.
- **Vitest** + **Testing Library** — unit and component tests.
- **pnpm** — package manager.

![cover](./public/cover.webp)

## Screens

| Screen         | Charts                                                                                          |
| :------------- | :---------------------------------------------------------------------------------------------- |
| Resumen        | KPIs with sparklines, demand vs previous period, generation mix, sources table, CSV export      |
| Evolución      | Yearly generation mix (100 % stacked bars), yearly international balance (diverging bars)       |
| Estacionalidad | Month × year heatmap (demand / renewable share), demand by weekday, solar vs wind radar         |

## Dataset

[**REE Iberian Peninsula Electricity Generation (2008–2026)**](https://huggingface.co/datasets/daniel-dona/ree-data) published on Hugging Face by `daniel-dona`, licensed under [**CC BY 4.0**](https://creativecommons.org/licenses/by/4.0/).

- **Source:** open data from [Red Eléctrica de España (REE)](https://www.ree.es/), collected from its API.
- **Content:** 1,931,443 records at 5-minute resolution (MW): demand, generation by technology (wind, solar, hydro, nuclear, combined cycle, coal, cogeneration…) and international exchanges.
- **Processing:** `scripts/build_dataset.py` downloads the Parquet files and aggregates them with DuckDB into `public/data/ree-daily.json` (6,708 days, 2008-01-01 → 2026-05-13): mean MW × 24 h = GWh/day, daily peak in MW.
- **Notes:**
  - Hydro is net generation, so it can be negative on pumping days.
  - A negative REE exchange balance means net export (checked against generation − demand).
  - Before 2015 REE groups solar thermal, biomass and cogeneration as _régimen especial_, so the renewable share for those years is underestimated.

> Data: © Red Eléctrica de España, via [`daniel-dona/ree-data`](https://huggingface.co/datasets/daniel-dona/ree-data) (CC BY 4.0). Aggregated daily; no other changes.
> The source code is under the [MIT License](./LICENSE); the data keeps its CC BY 4.0 license.

## Project Structure

```
/
├── public/
│   ├── data/
│   │   └── ree-daily.json      # Daily aggregates (generated)
│   ├── cover.webp
│   └── favicon.svg
├── scripts/
│   └── build_dataset.py        # Download + DuckDB aggregation
├── src/
│   ├── components/
│   │   ├── ChartTooltip.tsx    # Shared Recharts tooltip
│   │   ├── Credit.tsx          # Footer credit
│   │   ├── Dashboard.tsx       # Resumen screen
│   │   ├── DemandChart.tsx     # Demand vs previous period
│   │   ├── Evolution.tsx       # Evolución screen
│   │   ├── Filters.tsx         # Period / source filters + CSV export
│   │   ├── Heatmap.tsx         # Month × year heatmap
│   │   ├── InfoDialog.tsx      # Dataset info dialog
│   │   ├── KpiCard.tsx         # KPI + sparkline
│   │   ├── MixChart.tsx        # Stacked generation mix
│   │   ├── Seasonality.tsx     # Estacionalidad screen
│   │   ├── Sidebar.tsx         # Collapsible sidebar (icon rail on desktop, sheet on mobile)
│   │   ├── Skeleton.tsx        # Loading skeletons
│   │   ├── SourceLegend.tsx
│   │   ├── SourcesTable.tsx    # TanStack Table
│   │   └── ThemeControls.tsx   # Light/dark + primary color picker
│   ├── lib/
│   │   ├── data.ts             # Day type, sources, loader
│   │   ├── export.ts           # CSV export
│   │   ├── format.ts           # es-ES number/date formatting
│   │   ├── metrics.ts          # Periods, buckets, shares, averages
│   │   ├── route.ts            # Hash routing
│   │   ├── sidebar.ts          # Sidebar state + Ctrl+B
│   │   └── theme.ts            # Theme + primary color persistence
│   ├── App.tsx
│   ├── index.css               # Tailwind + design tokens
│   └── main.tsx
├── AGENTS.md
├── index.html
├── LICENSE
├── package.json
├── requirements.txt            # Python deps for the dataset script
├── vite.config.ts
└── README.md
```

## Available Scripts

| Command        | Action                                    |
| :------------- | :---------------------------------------- |
| `pnpm install` | Install all dependencies                  |
| `pnpm dev`     | Start dev server at `localhost:5173`      |
| `pnpm build`   | Type-check and build into `./dist/`       |
| `pnpm preview` | Preview the production build              |
| `pnpm lint`    | Run Oxlint                                |
| `pnpm test`    | Run Vitest                                |

### Regenerate the dataset

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
python scripts/build_dataset.py
```

> You can also use `npm` or `bun` if you prefer.
