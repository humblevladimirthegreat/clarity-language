#!/usr/bin/env python3
"""Migrate docs: strip PoS hyphens; English roots → published Agelan or PoS<…>ENDING."""

from __future__ import annotations

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "data" / "lexicon-published.csv"

# English gloss matches a published root, but doc sense is usually NOT that root.
FALSE_FRIENDS = {
    "left",  # depart ≠ ⬅️ evede
    "saw",  # see ≠ 🪚 awaza
    "age",  # years ≠ call-me root `age`
    "right",  # correct/direction sense often ≠ ➡️
    "man",  # often "person"/name fragment; keep foreign unless clearly 👨
    "pick",  # choose ≠ ⛏️
    "wave",  # ocean wave in emotion docs may be ogena; greeting awe — context-sensitive
}

# Pedagogical spellings → English gloss to resolve (or Agelan root if value is a root).
ALIAS_ROOT = {
    "susi": "sushi",  # old fake nativization; published root is uzuzu
    "meato": "meat",
    "liet": "lie",  # typo for lie + -l
    "truthr": "truth",  # truth + -r written with extra -l in some examples
}

# Full English names whose final letter is also a reference suffix letter.
MERGED_NAME_ENDINGS = {
    "Superman": ("Superman", "n"),
}

# Closed / special Agelan roots (strip hyphen only; never wrap in <>).
SPECIAL_ROOTS = {
    "ivo",
    "ile",
    "enu",
    "odo",
    "oguno",
    "uho",
    "owaro",
    "edelo",
    "uhunu",
    "eroge",
    "awa",
    "eve",
    "erare",
    "ahe",
    "orolo",
    "ewono",
    "ululu",
    "idido",
    "afafa",
    "ebebe",
    "ubezu",
    "egoge",
    "ogalo",
    "erage",
    "ogena",
    "oburo",
    "agena",
    "abobo",
    "ozono",
    # schematic hosts kept as uppercase tokens inside <>
}

# Role-vowel + x + root (agent/patient/reltum)
ROLE_PREFIX = re.compile(r"^([auo])x(.+)$", re.I)
# Ability / values: root + x + stance vowel(s)
STANCE_SUFFIX = re.compile(r"^(.+?)x([aeou]{1,2})$", re.I)
# Numeric derivation: root + x + number stem
NUM_DERIV = re.compile(r"^(.+?)x([+#\-±].*)$", re.I)

# Content word with pedagogical hyphen (optional left-bound l on g)
WORD = re.compile(
    r"\b([zgdvbwhxj])(l)?-([A-Za-z][^`\s]*?)([lmnr])(sh)?\b"
)

# Multipart name compounds written as A x B (+ x C…) with English Capital parts
NAME_COMPOUND = re.compile(
    r"\b([zgdvbwhxj])-(([A-Z][A-Za-z]*)(?:x(?:ta)?[A-Z][A-Za-z]*)+)([lmnr])(sh)?\b"
)


def load_lexicon() -> tuple[dict[str, str], dict[str, str], set[str]]:
    by_lit: dict[str, str] = {}
    by_met: dict[str, str] = {}
    clar: set[str] = set()
    with PUB.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            c = (r.get("clarity") or "").strip()
            lit = (r.get("literal") or "").strip().lower()
            met = (r.get("metaphorical") or "").strip().lower()
            if c:
                clar.add(c.lower())
            if lit and c and lit not in by_lit:
                by_lit[lit] = c
            if met and c and met not in by_met:
                by_met[met] = c
    return by_lit, by_met, clar


BY_LIT, BY_MET, CLAR = load_lexicon()


def is_clarity_shaped(root: str) -> bool:
    r = root.lower()
    if r in CLAR or r in SPECIAL_ROOTS:
        return True
    # V(CV)+ ordinary root (no digits / #)
    return bool(re.fullmatch(r"[aeiou](?:[bcdfghjklmnpqrstvwxyz][aeiou])*", r))


def resolve_simple(english: str, ending: str) -> tuple[str, str]:
    """Return (root_writing, ending) — root_writing is bare Agelan or <Foreign>."""
    # Alias pedagogical / typo spellings to a gloss (preserve capitalization for <>).
    key = english.lower()
    if key in ALIAS_ROOT:
        gloss = ALIAS_ROOT[key]
        english = gloss if english.islower() else gloss[:1].upper() + gloss[1:]
        key = gloss

    if key in FALSE_FRIENDS:
        return f"<{english}>", ending

    # Closed special / published Agelan root used as itself (ivo, oguno, ogena, …)
    if key in SPECIAL_ROOTS:
        return key, ending
    if (
        key in CLAR
        and key not in BY_LIT
        and key not in BY_MET
        and english[:1] in "aeiouAEIOU"
    ):
        return key, ending

    if key in BY_LIT:
        return BY_LIT[key], ending
    if key in BY_MET:
        new_end = "m" if ending in ("l", "m") else ending
        return BY_MET[key], new_end

    return f"<{english}>", ending


def transform_root_body(body: str, ending: str) -> tuple[str, str]:
    """Transform root body (may include x-compounds / role / numeric). Returns (body, ending)."""
    if body.isupper() and body.isalpha():
        return f"<{body}>", ending

    # Merged proper names: b-Superman → b<Superman>n
    if body + ending in MERGED_NAME_ENDINGS or body in MERGED_NAME_ENDINGS:
        name, end = MERGED_NAME_ENDINGS.get(body + ending) or MERGED_NAME_ENDINGS[body]
        return f"<{name}>", end

    # Role compound: axattack / uxattack / oxof
    m = ROLE_PREFIX.match(body)
    if m and m.group(2) and m.group(2)[0] not in "0123456789+-#":
        role, rest = m.group(1).lower(), m.group(2)
        core, ending = resolve_simple(rest, ending)
        return f"{role}x{core}", ending

    # Numeric derivation: ROOTx+0e, ROOTx#1, ROOTx-e-
    m = NUM_DERIV.match(body)
    if m:
        host, num = m.group(1), m.group(2)
        host_out, ending = resolve_simple(host, ending)
        return f"{host_out}x{num}", ending

    # Values / ability: HOSTxu, competxa, singxu
    m = STANCE_SUFFIX.match(body)
    if m:
        host, stance = m.group(1), m.group(2).lower()
        if host.isupper() and host.isalpha():
            return f"<{host}>x{stance}", ending
        host_out, ending = resolve_simple(host, ending)
        return f"{host_out}x{stance}", ending

    return resolve_simple(body, ending)


def format_word(pos: str, left: str | None, body: str, ending: str, plural: str | None) -> str:
    left = left or ""
    pl = plural or ""
    return f"{pos}{left}{body}{ending}{pl}"


def foreign_name_interior(compound: str) -> str:
    parts = re.split(r"x", compound)
    display_parts = []
    for p in parts:
        if p.startswith("ta") and len(p) > 2 and p[2].isupper():
            display_parts.append("da " + p[2:])
        else:
            display_parts.append(p)
    return " ".join(display_parts)


def replace_name_compound(m: re.Match[str]) -> str:
    pos, compound, _first, ending, pl = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
    return format_word(pos, None, f"<{foreign_name_interior(compound)}>", ending, pl)


def replace_word(m: re.Match[str]) -> str:
    pos, left, body, ending, pl = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
    if re.match(r"^[A-Z][A-Za-z]*(?:x(?:ta)?[A-Z][A-Za-z]*)+$", body):
        return format_word(pos, left, f"<{foreign_name_interior(body)}>", ending, pl)

    # b-Superman (name ends with suffix letter)
    merged = MERGED_NAME_ENDINGS.get(body + ending) or MERGED_NAME_ENDINGS.get(body)
    if merged and body[0].isupper():
        name, end = merged
        return format_word(pos, left, f"<{name}>", end, pl)

    new_body, new_ending = transform_root_body(body, ending)
    return format_word(pos, left, new_body, new_ending, pl)


def preprocess_typos(text: str) -> str:
    """Normalize known illegal pedagogical spellings before the main pass."""
    text = re.sub(r"\b([zgdvbwhxj])-liet\b", r"\1-liel", text)
    text = re.sub(r"\b([zgdvbwhxj])-meatol\b", r"\1-meatl", text)
    # Name ends in -n; pedagogical form merges ending into the English spelling.
    text = re.sub(r"\b([zgdvbwhxj])-Superman\b", r"\1<Superman>n", text)
    return text


def migrate_text(text: str) -> str:
    text = preprocess_typos(text)
    text = NAME_COMPOUND.sub(replace_name_compound, text)
    text = WORD.sub(replace_word, text)
    return text


SKIP_DIRS = {".git", "node_modules", "src/generated", "dist", "web/node_modules"}


def iter_md() -> list[Path]:
    out = []
    for p in ROOT.rglob("*.md"):
        if any(part in SKIP_DIRS or part == "node_modules" for part in p.parts):
            continue
        out.append(p)
    return sorted(out)


def main() -> None:
    changed = []
    for path in iter_md():
        old = path.read_text(encoding="utf-8")
        new = migrate_text(old)
        if new != old:
            path.write_text(new, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"updated {len(changed)} files")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
