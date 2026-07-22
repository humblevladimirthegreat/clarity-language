#!/usr/bin/env python3
"""
Apply NGSL metaphor map to data/lexicon-published.csv.

Singleton policy: at most one metaphorical lemma per published row.

Sources (merged; first wins for a lemma):
  1. Existing published metaphorical (preserved)
  2. data/ngsl-metaphor-extra.csv  (curated lemma→literal)
  3. soft token matches for remaining empty rows only

Surfaces mapped in ngsl-lemma-map.csv (inflection or redundant) are never attached.

Run:
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
LEMMA_MAP = ROOT / "data" / "ngsl-lemma-map.csv"
MAP_OUT = ROOT / "data" / "ngsl-metaphor-map.csv"


def parse_meta(cell: str) -> list[str]:
    return [p.strip().lower() for p in (cell or "").split(";") if p.strip()]


def load_lemma_map() -> dict[str, str]:
    """surface → resolved tip (follow chains)."""
    if not LEMMA_MAP.exists():
        return {}
    raw: dict[str, str] = {}
    for line in LEMMA_MAP.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#"):
            continue
        if t.startswith("surface,"):
            continue
        parts = next(csv.reader([t]))
        if len(parts) < 2:
            continue
        surface, lemma = parts[0].strip().lower(), parts[1].strip().lower()
        if surface and lemma and surface != lemma and not surface.startswith("#"):
            raw[surface] = lemma

    def resolve(s: str) -> str:
        cur = s
        seen: set[str] = set()
        while cur in raw:
            if cur in seen:
                break
            seen.add(cur)
            cur = raw[cur]
        return cur

    return {s: resolve(s) for s in raw}


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
    rows = list(csv.DictReader(PUBLISHED.open(encoding="utf-8")))
    by_lit = {r["literal"].strip().lower(): r for r in rows}
    literals = set(by_lit)
    mapped_away = load_lemma_map()

    # lemma → literal; at most one lemma per literal
    cleaned: dict[str, str] = {}
    lit_claimed: dict[str, str] = {}
    skipped: list[str] = []

    def try_claim(lemma: str, lit: str, source: str) -> bool:
        if not lemma or not lit:
            return False
        if lemma in mapped_away and mapped_away[lemma] != lemma:
            skipped.append(f"lemma-map skip '{lemma}' → {mapped_away[lemma]} ({source})")
            return False
        if lit not in by_lit:
            skipped.append(f"missing literal '{lit}' for {lemma} ({source})")
            return False
        if lemma in literals:
            skipped.append(f"lemma '{lemma}' is a published literal ({source})")
            return False
        if lemma in cleaned:
            return False
        if lit in lit_claimed and lit_claimed[lit] != lemma:
            skipped.append(
                f"row '{lit}' already has metaphor '{lit_claimed[lit]}'; skip '{lemma}' ({source})"
            )
            return False
        cleaned[lemma] = lit
        lit_claimed[lit] = lemma
        return True

    # 1) Preserve existing published singles
    for r in rows:
        lit = r["literal"].strip().lower()
        parts = parse_meta(r["metaphorical"])
        if not parts:
            continue
        if len(parts) > 1:
            skipped.append(f"published multi on '{lit}' collapsed to first '{parts[0]}'")
        try_claim(parts[0], lit, "published")

    # 2) Curated extra (only fills empty rows / new lemmas)
    if EXTRA.exists():
        for row in csv.DictReader(EXTRA.open(encoding="utf-8")):
            lemma = (row.get("lemma") or "").strip().lower()
            lit = (row.get("literal") or "").strip().lower()
            try_claim(lemma, lit, "extra")

    # 3) Soft match only for lemmas still unassigned, onto empty rows
    gaps: list[str] = []
    if COVERAGE.exists():
        gaps = [
            r["lemma"]
            for r in csv.DictReader(COVERAGE.open(encoding="utf-8"))
            if r["status"] in ("gap", "metaphor")
        ]

    empty_lits = {lit for lit, r in by_lit.items() if lit not in lit_claimed}
    soft = soft_matches(
        [g for g in gaps if g not in cleaned and g not in mapped_away],
        {lit: by_lit[lit] for lit in empty_lits},
        set(cleaned) | literals,
    )
    for lemma, lit in soft.items():
        try_claim(lemma, lit, "soft")

    with MAP_OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["lemma", "literal"], lineterminator="\n")
        w.writeheader()
        for lemma, lit in sorted(cleaned.items()):
            w.writerow({"lemma": lemma, "literal": lit})

    for r in rows:
        lit = r["literal"].strip().lower()
        r["metaphorical"] = lit_claimed.get(lit, "")

    with PUBLISHED.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["emoji", "literal", "clarity", "metaphorical"],
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(rows)

    multi = sum(1 for r in rows if len(parse_meta(r["metaphorical"])) > 1)
    print(f"Skipped: {len(skipped)}")
    for s in skipped[:20]:
        print(f"  {s}")
    if len(skipped) > 20:
        print(f"  … {len(skipped) - 20} more")
    print(f"Metaphor lemmas: {len(cleaned)}")
    print(f"Rows with metaphorical: {sum(1 for r in rows if r['metaphorical'])}")
    print(f"Multi-metaphor rows: {multi}")
    print(f"Wrote {MAP_OUT.relative_to(ROOT)}")
    print(f"Updated {PUBLISHED.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
