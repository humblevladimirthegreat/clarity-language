#!/usr/bin/env python3
"""
Validate / report on data/ngsl-metaphor-extra.csv (curated lemma→literal).

The CSV is the source of truth for curated metaphors (do not regenerate from scratch).
Apply with: python3 scripts/apply-ngsl-metaphor-waves.py && npm run ngsl-coverage
"""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBS = {
    r["literal"]
    for r in csv.DictReader((ROOT / "data" / "lexicon-published.csv").open())
}
EXTRA_PATH = ROOT / "data" / "ngsl-metaphor-extra.csv"
COVERAGE = ROOT / "data" / "ngsl-coverage.csv"


def main() -> None:
    rows = list(csv.DictReader(EXTRA_PATH.open()))
    bad = []
    lemmas = set()
    for r in rows:
        lemma = (r.get("lemma") or "").strip().lower()
        lit = (r.get("literal") or "").strip().lower()
        if not lemma or not lit:
            bad.append(("empty", lemma, lit))
            continue
        if lit not in PUBS:
            bad.append(("missing-literal", lemma, lit))
        if lemma in PUBS:
            bad.append(("lemma-is-literal", lemma, lit))
        if lemma in lemmas:
            bad.append(("duplicate-lemma", lemma, lit))
        lemmas.add(lemma)

    gaps = [
        r["lemma"]
        for r in csv.DictReader(COVERAGE.open())
        if r["status"] == "gap"
    ]
    covered = sum(1 for g in gaps if g in lemmas)

    print(f"Extra rows: {len(rows)}")
    print(f"Unique lemmas: {len(lemmas)}")
    print(f"Validation issues: {len(bad)}")
    for kind, lemma, lit in bad[:20]:
        print(f"  {kind}: {lemma} → {lit}")
    if len(bad) > 20:
        print(f"  ... +{len(bad) - 20} more")
    print(f"Current gaps also in extra: {covered} / {len(gaps)} (should be 0 after apply)")


if __name__ == "__main__":
    main()
