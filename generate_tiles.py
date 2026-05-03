#!/usr/bin/env python3
"""Generate multiple element tiles from an Excel sheet.

Expected columns (Korean or English):
- symbol (기호)
- name (이름)
- number (원자량)
- atomic_number (원자번호)
"""

from __future__ import annotations

import argparse
import re
import subprocess
from pathlib import Path

import pandas as pd

COLUMN_ALIASES = {
    "symbol": ["symbol", "기호"],
    "name": ["name", "이름", "원소명"],
    "number": ["number", "원자량"],
    "atomic_number": ["atomic_number", "원자번호", "atomic number"],
}


def find_column(df: pd.DataFrame, aliases: list[str]) -> str:
    lower_map = {c.strip().lower(): c for c in df.columns}
    for alias in aliases:
        key = alias.strip().lower()
        if key in lower_map:
            return lower_map[key]
    raise ValueError(f"Missing one of columns: {aliases}")


def sanitize_filename(text: str) -> str:
    text = str(text).strip()
    text = re.sub(r"[\\/:*?\"<>|]+", "_", text)
    return text or "element"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("excel", help="Path to .xlsx file")
    parser.add_argument("--scad", default="element_tiles.scad", help="Path to SCAD template")
    parser.add_argument("--out", default="out", help="Output directory for STL files")
    parser.add_argument("--openscad", default="openscad", help="OpenSCAD executable")
    args = parser.parse_args()

    df = pd.read_excel(args.excel)

    symbol_col = find_column(df, COLUMN_ALIASES["symbol"])
    name_col = find_column(df, COLUMN_ALIASES["name"])
    number_col = find_column(df, COLUMN_ALIASES["number"])
    atomic_col = find_column(df, COLUMN_ALIASES["atomic_number"])

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    for _, row in df.iterrows():
        symbol = str(row[symbol_col]).strip()
        name = str(row[name_col]).strip()
        number = str(row[number_col]).strip()
        atomic_number = str(row[atomic_col]).strip()

        if not symbol:
            continue

        outfile = out_dir / f"{sanitize_filename(atomic_number)}_{sanitize_filename(symbol)}.stl"
        cmd = [
            args.openscad,
            "-o",
            str(outfile),
            "-D",
            f"symbol=\"{symbol}\"",
            "-D",
            f"name=\"{name}\"",
            "-D",
            f"number=\"{number}\"",
            "-D",
            f"atomic_number=\"{atomic_number}\"",
            str(args.scad),
        ]
        print("Running:", " ".join(cmd))
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
