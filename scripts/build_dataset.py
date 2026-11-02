"""Descarga REE (daniel-dona/ree-data) y genera agregados diarios en public/data/ree-daily.json."""

import json
import urllib.request
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "public" / "data" / "ree-daily.json"
BASE = "https://huggingface.co/datasets/daniel-dona/ree-data/resolve/main/data/"
FILES = ["train-00000-of-00002.parquet", "train-00001-of-00002.parquet"]

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


def main() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        if not (RAW / name).exists():
            urllib.request.urlretrieve(BASE + name, RAW / name)

    rel = duckdb.sql(SQL, params=[[str(RAW / f) for f in FILES]])
    cols, rows = rel.columns, rel.fetchall()
    assert rows and len(rows) > 6000, "dataset incompleto"
    assert all(r[1] > 0 for r in rows), "demanda no positiva"

    OUT.parent.mkdir(parents=True, exist_ok=True)
    data = {c: [r[i] for r in rows] for i, c in enumerate(cols)}
    OUT.write_text(json.dumps(data, separators=(",", ":")), encoding="utf-8")
    print(f"{len(rows)} días · {rows[0][0]} – {rows[-1][0]} · {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
