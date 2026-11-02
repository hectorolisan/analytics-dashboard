# Dashboard · Red Eléctrica

Panel de análisis de la demanda y la generación eléctrica peninsular (2008–2026) con KPIs, gráficos animados, filtros y tabla ordenable.

Pantallas:

- **Resumen:** KPIs con sparklines, demanda frente al periodo anterior (área), mix de generación (área apilada) y tabla de fuentes.
- **Evolución:** mix anual en columnas apiladas al 100 % y saldo internacional en barras divergentes.
- **Estacionalidad:** heatmap mes × año (demanda o cuota renovable), barras por día de la semana y radar solar frente a eólica.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Recharts 3 · TanStack Table 9 · Vitest

## Datos

[`daniel-dona/ree-data`](https://huggingface.co/datasets/daniel-dona/ree-data) (CC BY 4.0, datos abiertos de REE): 1,9 M registros cada 5 min, agregados por día en `public/data/ree-daily.json`.

- Energías en GWh/día, pico en MW.
- `exchange < 0` = exportación neta.
- Antes de 2015 REE agrupa solar térmica, biomasa y cogeneración en «régimen especial» (`aut`); aquí cuenta como «Cogeneración y otras», así que la cuota renovable de esos años está infraestimada.

Regenerar:

```bash
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python scripts/build_dataset.py
```

## Scripts

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm lint
```

## Tema

Light/dark y color primario elegible entre la paleta de Tailwind (teal por defecto), guardados en `localStorage`. Tipografías: Bricolage Grotesque (títulos) y Poppins (texto).
