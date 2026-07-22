#!/usr/bin/env python3
"""Apply Phase 5 quality metaphors + mnemonics to lexicon-published.csv."""
from __future__ import annotations

import csv
import importlib.util
import json
from pathlib import Path

ROOT = Path(__DIR__ if False else __file__).resolve().parent.parent  # type: ignore[name-defined]
ROOT = Path(__file__).resolve().parent.parent

PUB_PATH = ROOT / "data" / "lexicon-published.csv"
LEX_PATH = ROOT / "data" / "lexicon.csv"
BATCH_PATH = ROOT / "data" / "phase5-metaphor-mnemonic-batch.json"
PEOPLE_PATH = ROOT / "data" / "phase5-metaphor-people.json"
FOOD_PATH = ROOT / "data" / "phase5-metaphor-food.json"
SUPPLEMENT_PATH = ROOT / "data" / "phase5-metaphor-supplement.json"

FLAG_METAPHOR = "nation"
FLAG_MNEMONIC = "country is the state; nation is the people"
SUBDIVISION_METAPHOR = "community"
SUBDIVISION_MNEMONIC = "region is the place; community is the people"

# Rows 1–20 were hand-reviewed; do not overwrite.
PRESERVE_FIRST_N = 20


def load_batch_map() -> dict[str, dict[str, str]]:
    spec = importlib.util.spec_from_file_location(
        "generate_metaphor_batch",
        ROOT / "scripts" / "generate-metaphor-batch.py",
    )
    if spec is None or spec.loader is None:
        return {}
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    m = getattr(module, "M", {})
    return {
        emoji: {"metaphorical": meta, "mnemonic": mnem}
        for emoji, (meta, mnem) in m.items()
    }


def load_json_map(path: Path) -> dict[str, dict[str, str]]:
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, dict[str, str]] = {}
    for emoji, value in raw.items():
        if isinstance(value, dict):
            out[emoji] = {
                "metaphorical": (value.get("metaphorical") or "").strip(),
                "mnemonic": (value.get("mnemonic") or "").strip(),
            }
    return out


def merge_maps(*maps: dict[str, dict[str, str]]) -> dict[str, dict[str, str]]:
    merged: dict[str, dict[str, str]] = {}
    for m in maps:
        merged.update(m)
    return merged


def main() -> None:
    lex = {
        row["emoji"]: row
        for row in csv.DictReader(LEX_PATH.open(newline="", encoding="utf-8"))
    }

    with PUB_PATH.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    for col in ("metaphorical", "mnemonic"):
        if col not in fieldnames:
            fieldnames.append(col)

    mappings = merge_maps(
        load_batch_map(),
        load_json_map(BATCH_PATH),
        load_json_map(PEOPLE_PATH),
        load_json_map(FOOD_PATH),
        load_json_map(SUPPLEMENT_PATH),
    )

    stats = {
        "preserved_first_20": 0,
        "from_mapping": 0,
        "country_flag": 0,
        "subdivision_flag": 0,
        "unchanged_existing": 0,
        "review_fallback": 0,
    }

    for i, row in enumerate(rows):
        emoji = row["emoji"]
        subgroup = lex.get(emoji, {}).get("subgroup", "")

        if i < PRESERVE_FIRST_N:
            stats["preserved_first_20"] += 1
            continue

        if subgroup == "country-flag":
            row["metaphorical"] = FLAG_METAPHOR
            row["mnemonic"] = FLAG_MNEMONIC
            stats["country_flag"] += 1
            continue

        if subgroup == "subdivision-flag":
            row["metaphorical"] = SUBDIVISION_METAPHOR
            row["mnemonic"] = SUBDIVISION_MNEMONIC
            stats["subdivision_flag"] += 1
            continue

        if emoji in mappings:
            entry = mappings[emoji]
            row["metaphorical"] = entry["metaphorical"]
            row["mnemonic"] = entry["mnemonic"] or (
                "REVIEW" if not entry["metaphorical"] else ""
            )
            stats["from_mapping"] += 1
            continue

        # Keep face-pass updates already in the file.
        if (row.get("mnemonic") or "").strip() and (row.get("metaphorical") or "").strip():
            stats["unchanged_existing"] += 1
            continue

        row["metaphorical"] = ""
        row["mnemonic"] = "REVIEW"
        stats["review_fallback"] += 1

    with PUB_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    filled = sum(1 for r in rows if (r.get("mnemonic") or "").strip())
    review = sum(1 for r in rows if (r.get("mnemonic") or "").strip() == "REVIEW")
    empty_meta = sum(1 for r in rows if not (r.get("metaphorical") or "").strip())

    print(f"Wrote {len(rows)} rows to {PUB_PATH}")
    print("Stats:", stats)
    print(f"mnemonic filled: {filled}/{len(rows)}")
    print(f"REVIEW: {review}")
    print(f"empty metaphorical: {empty_meta}")


if __name__ == "__main__":
    main()
