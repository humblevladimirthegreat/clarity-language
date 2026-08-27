#!/usr/bin/env python3
"""Rewrite grammar/example/meta/test files onto post-conversion published roots."""

from __future__ import annotations

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Long unique old roots → published root for the same English sense.
LONG_MAP: list[tuple[str, str]] = [
    ("ulonu", "ululo"),
    ("ubuzu", "uhubu"),
    ("uzedu", "uzudu"),
    ("edage", "edege"),
    ("ohuze", "ohohu"),
    ("ogodo", "adaga"),
    ("ogobo", "abogo"),
    ("ulebu", "elulu"),
    ("edeje", "arede"),
    ("eleba", "ele"),
    ("odeda", "adeda"),
    ("ogeve", "ogove"),
    ("abeba", "abele"),
    ("udura", "unune"),
    ("onuda", "omonu"),
    ("ebore", "ebere"),
    ("aruna", "anunu"),
    ("ogulo", "uludu"),
    ("ezele", "elebe"),
    ("ezabu", "ezehe"),
    ("ahura", "aju"),
    ("ozowe", "ozowo"),
    ("ohewo", "ozowe"),
    ("uguge", "ugume"),
    ("evede", "eweze"),
]

# 3-letter roots: token / PoS+root+ending / PoS+root+x only (not English substrings).
SHORT_MAP: list[tuple[str, str]] = [
    ("awu", "awala"),
    ("uwa", "uwuru"),
    ("egu", "uzune"),
    ("ejo", "eje"),
    ("uze", "uzumu"),
    ("ada", "adaza"),
    ("ole", "olove"),
]

ENGLISH_NAMES = [
    ("Ulonun", "Ululon"),
    ("Ubuzun", "Uhubun"),
    ("ulonun", "ululon"),
    ("ubuzun", "uhubun"),
]

LETTER = [
    ("zulor", "zulur"),
    ("dulor", "dulur"),
    ("julor", "julur"),
    ("zubur", "zuhur"),
    ("dubur", "duhur"),
    ("jubur", "juhur"),
    ("zogor", "zadar"),
    ("dogor", "dadar"),
]

GLOBS = [
    "docs/grammar/*.md",
    "docs/examples/*.md",
    "docs/meta/grammar-docs.md",
    "docs/meta/glosses.md",
    "docs/meta/drill-generation.md",
    "docs/meta/translation-exercises.md",
    "docs/proposals/dictionary-first-lesson.md",
    "src/parse/*.test.ts",
    "src/tts/*.test.ts",
    "docs/grammar/.vitepress/components/GlossViewer.vue",
]


def load_published_roots() -> set[str]:
    roots: set[str] = set()
    with (ROOT / "data/lexicon-published.csv").open(newline="", encoding="utf8") as fh:
        for row in csv.DictReader(fh):
            roots.add(row["clarity"])
    with (ROOT / "data/lexicon-overlays.csv").open(newline="", encoding="utf8") as fh:
        for row in csv.DictReader(fh):
            roots.add(re.sub(r"[lmnr]$", "", row["sense_form"]))
    return roots


def protect_strings(old: str, published: set[str], extra: list[str]) -> list[str]:
    prot = [p for p in published if old in p and p != old]
    prot.extend(o for o in extra if o != old and old in o)
    return sorted(set(prot), key=len, reverse=True)


def apply_naive(text: str, old: str, new: str, protect: list[str]) -> str:
    holders: list[tuple[str, str]] = []
    tmp = text
    for i, p in enumerate(protect):
        token = f"\x00P{i}_{old}\x00"
        if p in tmp:
            tmp = tmp.replace(p, token)
            holders.append((token, p))
    tmp = tmp.replace(old, new)
    for token, p in holders:
        tmp = tmp.replace(token, p)
    return tmp


def apply_short(text: str, old: str, new: str) -> str:
    text = re.sub(rf"(?<![A-Za-z]){re.escape(old)}(?![A-Za-z])", new, text)
    text = re.sub(
        rf"(?<![A-Za-z])([zdvbwhjxg]){re.escape(old)}([lmnr](?:sh)?)(?![A-Za-z])",
        rf"\1{new}\2",
        text,
    )
    text = re.sub(
        rf"(?<![A-Za-z])([zdvbwhjxg]){re.escape(old)}x",
        rf"\1{new}x",
        text,
    )
    return text


def transform(text: str, published: set[str]) -> str:
    for old, new in ENGLISH_NAMES + LETTER:
        text = text.replace(old, new)
    longs = [o for o, _ in LONG_MAP]
    for old, new in LONG_MAP:
        text = apply_naive(text, old, new, protect_strings(old, published, longs))
    for old, new in SHORT_MAP:
        text = apply_short(text, old, new)
    return text


def main() -> None:
    published = load_published_roots()
    paths: list[Path] = []
    for g in GLOBS:
        paths.extend(ROOT.glob(g))
    changed = 0
    for path in sorted(set(paths)):
        original = path.read_text(encoding="utf8")
        updated = transform(original, published)
        if updated != original:
            path.write_text(updated, encoding="utf8")
            changed += 1
            print(path.relative_to(ROOT))
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
