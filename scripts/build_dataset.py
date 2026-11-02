"""Genera agregados diarios en public/data/ree-daily.json.

Histórico: Parquet de daniel-dona/ree-data (hasta 2026-05-13), solo si falta el JSON o con --full.
Días nuevos: misma serie de 5 min desde la API de demanda de REE (demanda.ree.es).
"""

import json
import sys
import time
import urllib.request
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "public" / "data" / "ree-daily.json"
BASE = "https://huggingface.co/datasets/daniel-dona/ree-data/resolve/main/data/"
FILES = ["train-00000-of-00002.parquet", "train-00001-of-00002.parquet"]
REE = "https://demanda.ree.es/WSvisionaMovilesPeninsulaRest/resources/demandaGeneracionPeninsula?curva=DEMANDAAU&fecha={}"
MIN_ROWS = 200

# MW medios -> GWh/día. inter < 0 = exportación (gen ≈ dem - inter).
SQL = """
select
  strftime(cast(ts as date), '%Y-%m-%d') as date,
  round(avg(dem) * 0.024, 1) as demand,
  max(dem) as peak,
  round(avg(eol) * 0.024, 1) as wind,
  round(avg(case when solFot + solTer > 0 then solFot + solTer else sol end) * 0.024, 1) as solar,
  round(avg(hid) * 0.024, 1) as hydro,
  round(avg(termRenov) * 0.024, 1) as biomass,
  round(avg(nuc) * 0.024, 1) as nuclear,
  round(avg(cc) * 0.024, 1) as gas,
  round(avg(car) * 0.024, 1) as coal,
  round(avg(cogenResto + gf + vap + aut) * 0.024, 1) as other,
  round(avg(inter) * 0.024, 1) as exchange
from read_parquet(?)
group by 1
having count(*) >= 200
order by 1
"""


def from_parquet() -> dict[str, list]:
    import duckdb

    RAW.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        if not (RAW / name).exists():
            urllib.request.urlretrieve(BASE + name, RAW / name)
    rel = duckdb.sql(SQL, params=[[str(RAW / f) for f in FILES]])
    cols, rows = rel.columns, rel.fetchall()
    return {c: [r[i] for r in rows] for i, c in enumerate(cols)}


def fetch_day(day: date) -> list[dict]:
    """Registros de 5 min del día local. La API devuelve JSONP y a veces una lista vacía: se reintenta."""
    req = urllib.request.Request(REE.format(day.isoformat()), headers={"User-Agent": "analytics-dashboard"})
    rows: list[dict] = []
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                raw = res.read().decode("utf-8")
            data = json.loads(raw[raw.index("(") + 1 : raw.rindex(")")])["valoresHorariosGeneracion"]
            rows = [r for r in data if r["ts"].startswith(day.isoformat())]
            if len(rows) >= MIN_ROWS:
                return rows
        except OSError:
            if attempt == 4:
                raise
        time.sleep(2 + attempt * 3)
    return rows


def aggregate(day: date, rows: list[dict]) -> dict:
    """Misma agregación que SQL. `bio` es el antiguo `termRenov`; `aut` no cuadra el balance desde 2025-12-11 (en el histórico es 0)."""
    avg = lambda f: round(sum(f(r) for r in rows) / len(rows) * 0.024, 1)  # noqa: E731
    return {
        "date": day.isoformat(),
        "demand": avg(lambda r: r["dem"]),
        "peak": max(r["dem"] for r in rows),
        "wind": avg(lambda r: r["eol"]),
        "solar": avg(lambda r: r["solFot"] + r["solTer"] if r["solFot"] + r["solTer"] > 0 else r["sol"]),
        "hydro": avg(lambda r: r["hid"]),
        "biomass": avg(lambda r: r.get("bio", r.get("termRenov", 0))),
        "nuclear": avg(lambda r: r["nuc"]),
        "gas": avg(lambda r: r["cc"]),
        "coal": avg(lambda r: r["car"]),
        "other": avg(lambda r: r["cogenResto"] + r["gf"] + r["vap"]),
        "exchange": avg(lambda r: r["inter"]),
    }


def check_overlap(data: dict[str, list]) -> None:
    """El último día guardado debe salir igual de la API; si no, ha cambiado el esquema o el criterio."""
    last = date.fromisoformat(data["date"][-1])
    fresh = aggregate(last, fetch_day(last))
    for k, v in fresh.items():
        if k != "date":
            stored = data[k][-1]
            assert abs(v - stored) <= 0.5 + abs(stored) * 0.01, f"{last} {k}: API {v} ≠ guardado {stored}"


def extend_from_ree(data: dict[str, list], until: date) -> int:
    check_overlap(data)
    day, added = date.fromisoformat(data["date"][-1]) + timedelta(days=1), 0
    while day <= until:
        rows = fetch_day(day)
        if len(rows) < MIN_ROWS:
            # el último día puede no estar cerrado; un hueco anterior es un error
            if day < until:
                raise SystemExit(f"{day}: {len(rows)} registros, la API no da el día completo")
            break
        for k, v in aggregate(day, rows).items():
            data[k].append(v)
        day, added = day + timedelta(days=1), added + 1
        time.sleep(0.3)
    return added


def main() -> None:
    data = from_parquet() if "--full" in sys.argv or not OUT.exists() else json.loads(OUT.read_text(encoding="utf-8"))
    added = extend_from_ree(data, date.today() - timedelta(days=1))

    dates = data["date"]
    assert len(dates) > 6000, "dataset incompleto"
    assert all(d > 0 for d in data["demand"]), "demanda no positiva"
    assert all(len(v) == len(dates) for v in data.values()), "columnas desiguales"
    assert all((date.fromisoformat(b) - date.fromisoformat(a)).days == 1 for a, b in zip(dates, dates[1:])), "fechas con huecos"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"{len(dates)} días (+{added} de REE) · {dates[0]} – {dates[-1]} · {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
