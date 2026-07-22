#!/usr/bin/env python3
"""
Apply NGSL metaphor map to data/lexicon-published.csv.

Sources (merged; first wins):
  1. data/ngsl-metaphor-extra.csv  (curated lemma→literal)
  2. soft token matches for remaining gaps

Run:
  python3 scripts/generate-ngsl-metaphor-extra.py
  python3 scripts/apply-ngsl-metaphor-waves.py
  npm run ngsl-coverage
"""
from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = ROOT / "data" / "lexicon-published.csv"
COVERAGE = ROOT / "data" / "ngsl-coverage.csv"
EXTRA = ROOT / "data" / "ngsl-metaphor-extra.csv"
MAP_OUT = ROOT / "data" / "ngsl-metaphor-map.csv"


def soft_matches(gaps: list[str], by_lit: dict[str, dict], taken: set[str]) -> dict[str, str]:
    blacklist = {
        "see-no-evil",
        "hear-no-evil",
        "speak-no-evil",
        "love-hotel",
        "hot-dog",
        "milky-way",
        "statue-of-liberty",
        "isle-of-man",
        "call-me",
        "rock-on",
        "mind-blown",
    }
    prefer = {
        "old": "old-man",
        "high": "mountain",
        "low": "speaker-low",
        "water": "droplet",
        "music": "music-note",
        "game": "video-game",
        "raise": "raise-hand",
        "store": "department-store",
        "fast": "fast-forward",
        "plant": "potted-plant",
        "worker": "office-worker",
        "card": "credit-card",
        "file": "file-folder",
        "oil": "oil-lamp",
        "clock": "mantel-clock",
        "video": "video-camera",
        "roll": "paper-roll",
        "light": "traffic-light",
        "note": "memo",
        "paper": "page",
        "computer": "laptop",
        "head": "silhouette",
        "money": "money-bag",
        "name": "name-tag",
        "question": "question-red",
        "world": "globe",
        "next": "next-track",
        "test": "test-tube",
        "mind": "brain",
        "letter": "letters",
        "food": "hamburger",
        "top": "top-hat",
        "die": "skull",
        "picture": "framed-picture",
        "piece": "puzzle-piece",
        "arm": "bicep",
        "drop": "chart-down",
        "drink": "tropical-drink",
        "park": "national-park",
        "hear": "ear",
        "speak": "speaking-head",
        "sleep": "bed",
        "hot": "fire",
        "cold": "snowflake",
    }
    token_index: dict[str, list[str]] = defaultdict(list)
    for lit in by_lit:
        if lit in blacklist:
            continue
        if any(x in lit for x in ("islands", "republic", "territor", "georgia-south", "bosnia")):
            continue
        for tok in lit.split("-"):
            token_index[tok].append(lit)

    out: dict[str, str] = {}
    for g in gaps:
        if g in taken:
            continue
        if g in prefer and prefer[g] in by_lit:
            out[g] = prefer[g]
            continue
        hits = [l for l in token_index.get(g, []) if l not in blacklist]
        if len(hits) == 1:
            out[g] = hits[0]
    return out


def main() -> None:
    rows = list(csv.DictReader(PUBLISHED.open()))
    by_lit = {r["literal"].strip().lower(): r for r in rows}
    literals = set(by_lit)

    cleaned: dict[str, str] = {}
    skipped: list[str] = []

    if EXTRA.exists():
        for row in csv.DictReader(EXTRA.open()):
            lemma = (row.get("lemma") or "").strip().lower()
            lit = (row.get("literal") or "").strip().lower()
            if not lemma or not lit:
                continue
            if lit not in by_lit:
                skipped.append(f"missing literal '{lit}' for {lemma}")
                continue
            if lemma in literals:
                skipped.append(f"lemma '{lemma}' is a published literal")
                continue
            cleaned.setdefault(lemma, lit)

    gaps: list[str] = []
    if COVERAGE.exists():
        gaps = [
            r["lemma"]
            for r in csv.DictReader(COVERAGE.open())
            if r["status"] in ("gap", "metaphor")
        ]
        # also allow mapping any ngsl content word from coverage
        gaps = list(
            dict.fromkeys(
                r["lemma"]
                for r in csv.DictReader(COVERAGE.open())
                if r["status"] != "function"
            )
        )

    soft = soft_matches(
        [g for g in gaps if g not in cleaned],
        by_lit,
        set(cleaned) | literals,
    )
    for lemma, lit in soft.items():
        cleaned.setdefault(lemma, lit)

    lit_to_lemmas: dict[str, list[str]] = defaultdict(list)
    for lemma, lit in sorted(cleaned.items()):
        lit_to_lemmas[lit].append(lemma)

    with MAP_OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["lemma", "literal"], lineterminator="\n")
        w.writeheader()
        for lemma, lit in sorted(cleaned.items()):
            w.writerow({"lemma": lemma, "literal": lit})

    for r in rows:
        r["metaphorical"] = ""
    for lit, lemmas in lit_to_lemmas.items():
        by_lit[lit]["metaphorical"] = ";".join(lemmas)

    with PUBLISHED.open("w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["emoji", "literal", "clarity", "metaphorical"],
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(rows)

    print(f"Skipped: {len(skipped)}")
    for s in skipped[:15]:
        print(f"  {s}")
    print(f"Metaphor lemmas: {len(cleaned)}")
    print(f"Rows with metaphorical: {sum(1 for r in rows if r['metaphorical'])}")
    print(f"Wrote {MAP_OUT.relative_to(ROOT)}")
    print(f"Updated {PUBLISHED.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
