"""
Локальная проверка модуля на одной run_date.

Использование:
  export PG_USER=...
  export PG_PASSWORD=...
  export PG_HOST=...
  export PG_PORT=6432
  export PG_DB=...
  python examples/check_features.py --run-date 2025-08-01
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from batch_features import build_batch_features, create_db_engine, load_source_tables, save_features


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-date", default="2025-08-01")
    parser.add_argument("--out", default=str(ROOT / "outputs"))
    args = parser.parse_args()

    engine = create_db_engine()
    tables = load_source_tables(engine)
    features = build_batch_features(
        tables["customers"],
        tables["sessions"],
        tables["events"],
        tables["orders"],
        run_date=args.run_date,
    )

    print("shape:", features.shape)
    print("unique customer_id × run_date:", features.duplicated(["customer_id", "run_date"]).sum())
    print(features.head())

    path = save_features(features, args.out, run_date=args.run_date)
    print("saved:", path)


if __name__ == "__main__":
    main()
