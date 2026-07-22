#!/usr/bin/env python3
"""
Singleton waves 2+: collapse all remaining multi-lemma metaphorical cells.

Policy (per user):
  - One keep lemma per row (mnemonic > strict semantics; stretch OK).
  - Other lemmas in the bag → ngsl-lemma-map kind=redundant → keep.
  - No relocates required; empty-slot stretches optional and unused here.

Also:
  - Prunes ngsl-metaphor-extra.csv to match final one-lemma homes.
  - Patches apply-ngsl-metaphor-waves.py expectations are documented in strategy;
    this script is the source of the singleton pass.
"""
from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLISHED = ROOT / "data" / "lexicon-published.csv"
LEMMA_MAP = ROOT / "data" / "ngsl-lemma-map.csv"
EXTRA = ROOT / "data" / "ngsl-metaphor-extra.csv"
NGSL = ROOT / "data" / "ngsl.csv"

# Mnemonic overrides when NGSL-frequency pick is a poor association cue.
KEEP_OVERRIDE: dict[str, str] = {
    "smile": "happy",
    "starstruck": "interest",
    "zany": "strange",
    "disguise": "seem",
    "frown": "unhappy",
    "pleading": "want",
    "fear": "afraid",
    "cry": "sad",
    "skull": "death",
    "poop": "dirty",
    "robot": "machine",
    "heartbeat": "feel",
    "broken-heart": "break",
    "fight": "combat",
    "dash": "move",
    "hole": "empty",
    "wave": "hello",
    "hand": "take",
    "crossed-fingers": "try",
    "point": "refer",
    "thumbs-up": "like",
    "thumbs-down": "bad",
    "clap": "praise",
    "writing-hand": "write",
    "nail-polish": "polish",
    "foot": "kick",
    "ear": "hear",
    "nose": "smell",
    "lungs": "breathe",
    "tooth": "teeth",
    "eye": "see",
    "tongue": "taste",
    "baby": "little",
    "child": "young",
    "person": "human",
    "man": "guy",
    "woman": "lady",
    "older-person": "experience",
    "old-man": "old",
    "old-woman": "grandmother",
    "pout": "sulk",
    "raise-hand": "volunteer",
    "shrug": "indifference",
    "doctor": "nurse",
    "teacher": "teach",
    "cook": "kitchen",
    "office-worker": "worker",
    "technologist": "engineer",
    "police": "officer",
    "detective": "agent",
    "ninja": "stealth",
    "construction-worker": "labor",
    "monarch": "king",
    "superhero": "hero",
    "mage": "wizard",
    "haircut": "hair",
    "walking": "go",
    "standing": "stand",
    "levitate": "float",
    "rowing": "row",
    "weightlifting": "lift",
    "cartwheel": "acrobat",
    "wrestling": "wrestle",
    "juggling": "juggle",
    "holding-hands": "friend",
    "couple": "pair",
    "speaking-head": "say",
    "family": "parent",
    "footprints": "follow",
    "dog": "pet",
    "paw-prints": "animal",
    "dove": "free",
    "feather": "soft",
    "whale": "large",
    "snail": "slow",
    "butterfly": "become",
    "ant": "small",
    "microbe": "cell",
    "flower": "beautiful",
    "potted-plant": "plant",
    "tree": "forest",
    "herb": "grass",
    "hamburger": "food",
    "birthday-cake": "cake",
    "pie": "half",
    "plate": "dinner",
    "knife": "edge",
    "world-map": "map",
    "national-park": "nature",
    "brick": "wall",
    "rock": "hard",
    "house": "home",
    "school": "lesson",
    "department-store": "store",
    "factory": "industry",
    "wedding": "marriage",
    "shinto-shrine": "visit",
    "cityscape": "city",
    "sunrise": "morning",
    "bridge-night": "bridge",
    "car": "drive",
    "truck": "transport",
    "bicycle": "bike",
    "gas-pump": "fuel",
    "traffic-light": "traffic",
    "anchor": "harbor",
    "life-ring": "help",
    "airplane": "travel",
    "arrival": "come",
    "bellhop": "service",
    "luggage": "suitcase",
    "hourglass-done": "end",
    "hourglass": "wait",
    "alarm-clock": "late",
    "stopwatch": "moment",
    "thermometer": "temperature",
    "sun": "day",
    "milky-way": "space",
    "cloud": "sky",
    "umbrella": "protect",
    "lightning": "power",
    "fire": "heat",
    "droplet": "water",
    "ocean-wave": "ocean",
    "party-popper": "celebrate",
    "wrapped-gift": "give",
    "trophy": "success",
    "medal": "win",
    "soccer": "sport",
    "fishing": "catch",
    "bullseye": "target",
    "video-game": "game",
    "framed-picture": "picture",
    "palette": "art",
    "t-shirt": "wear",
    "handbag": "bag",
    "crown": "leader",
    "graduation-cap": "learn",
    "gemstone": "value",
    "mute": "silence",
    "speaker-high": "loud",
    "bell": "notify",
    "music-note": "music",
    "microphone": "interview",
    "musical-keyboard": "piano",
    "drum": "beat",
    "phone": "call",
    "laptop": "computer",
    "keyboard": "type",
    "cd": "album",
    "television": "monitor",
    "camera": "photo",
    "lightbulb": "solution",
    "book": "read",
    "notebook": "journal",
    "scroll": "story",
    "page": "paper",
    "newspaper": "news",
    "bookmark-tab": "fact",
    "label": "thing",
    "coin": "cent",
    "credit-card": "payment",
    "receipt": "sale",
    "envelope": "mail",
    "inbox": "submit",
    "ballot-box": "vote",
    "pencil": "draw",
    "memo": "note",
    "file-folder": "document",
    "chart-down": "fail",
    "wastebasket": "waste",
    "locked": "safe",
    "unlocked": "open",
    "key": "owner",
    "hammer": "make",
    "pick": "mining",
    "sword-crossed": "war",
    "bomb": "weapon",
    "bow-arrow": "shoot",
    "shield": "defend",
    "nut-bolt": "steel",
    "link": "join",
    "unlink": "separate",
    "toolbox": "tool",
    "test-tube": "test",
    "dna": "gene",
    "microscope": "examine",
    "syringe": "shot",
    "bandage": "wound",
    "x-ray": "scan",
    "bed": "rest",
    "couch-lamp": "comfortable",
    "broom": "sweep",
    "basket": "gather",
    "soap": "clean",
    "cart": "buy",
    "cigarette": "smoke",
    "coffin": "funeral",
    "headstone": "grave",
    "placard": "sign",
    "id-card": "identify",
    "litter": "trash",
    "drinking-water": "drinking",
    "restroom": "wc",
    "baby-changing": "diaper",
    "passport-control": "border",
    "up": "upward",
    "down": "downward",
    "back": "return",
    "forward": "ahead",
    "atom": "science",
    "om": "god",
    "repeat": "again",
    "play": "start",
    "fast-forward": "fast",
    "next-track": "next",
    "cinema": "show",
    "wireless": "online",
    "exclamation-double": "shock",
    "question-red": "ask",
    "exclamation-red": "important",
    "dash-wavy": "approximately",
    "currency-exchange": "exchange",
    "recycling": "recycle",
    "name-tag": "name",
    "beginner": "introduction",
    "correct": "good",
    "cross": "wrong",
    "1": "one",
    "2": "two",
    "3": "three",
    "numbers": "number",
    "letters": "word",
    "sos": "need",
    "white-square": "square",
    "option": "choose",
    "checkered-flag": "result",
    "mantel-clock": "past",
    "crystal-ball": "future",
    "prohibited": "refuse",
    "infinity": "whole",
    "silhouette": "stranger",
    "raise-hands": "thank",
}


def parse_meta(cell: str) -> list[str]:
    return [p.strip().lower() for p in (cell or "").split(";") if p.strip()]


def load_rank() -> dict[str, int]:
    rank: dict[str, int] = {}
    for i, r in enumerate(csv.DictReader(NGSL.open(encoding="utf-8"))):
        w = (r.get("english") or "").strip().lower()
        if w and w not in rank:
            rank[w] = i
    return rank


def load_function_words() -> set[str]:
    words: set[str] = set()
    path = ROOT / "data" / "ngsl-function-words.txt"
    for line in path.read_text(encoding="utf-8").splitlines():
        t = line.strip().lower()
        if t and not t.startswith("#"):
            words.add(t)
    return words


def pick_keep(
    literal: str, bag: list[str], rank: dict[str, int], funcs: set[str]
) -> str:
    if literal in KEEP_OVERRIDE and KEEP_OVERRIDE[literal] in bag:
        cand = KEEP_OVERRIDE[literal]
        if cand not in funcs:
            return cand
    content = [p for p in bag if p not in funcs]
    pool = content or bag
    # Prefer in-NGSL by frequency
    return sorted(pool, key=lambda p: rank.get(p, 10**9))[0]


def main() -> None:
    rank = load_rank()
    funcs = load_function_words()
    rows = list(csv.DictReader(PUBLISHED.open(encoding="utf-8")))
    by_lit = {r["literal"].strip().lower(): r for r in rows}

    redundant: dict[str, str] = {}
    keeps: dict[str, str] = {}  # literal → keep
    processed = 0

    for row in rows:
        lit = row["literal"].strip().lower()
        bag = parse_meta(row["metaphorical"])
        if len(bag) < 2:
            if len(bag) == 1:
                keeps[lit] = bag[0]
            continue
        keep = pick_keep(lit, bag, rank, funcs)
        if keep not in bag:
            raise SystemExit(f"{lit}: keep {keep!r} not in bag {bag}")
        for lemma in bag:
            if lemma == keep:
                continue
            if lemma in funcs:
                continue  # leave function words to denylist status
            redundant[lemma] = keep
        row["metaphorical"] = keep
        keeps[lit] = keep
        processed += 1

    # Verify no multi left
    multi = sum(1 for r in rows if len(parse_meta(r["metaphorical"])) > 1)
    if multi:
        raise SystemExit(f"Still have {multi} multi cells")

    with PUBLISHED.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["emoji", "literal", "clarity", "metaphorical"],
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(rows)

    # Merge lemma map
    lines = LEMMA_MAP.read_text(encoding="utf-8").splitlines()
    header_idx = next(i for i, ln in enumerate(lines) if ln.startswith("surface,"))
    comments = [
        "# Inflected / alternate surface → core lemma for NGSL coverage.",
        "# Columns: surface,lemma,kind  (kind = inflection | redundant; default inflection).",
        "# Inflection → status skip-inflection; synonym/near-duplicate → status redundant.",
        "# One row per surface. Identity mappings omitted.",
        "# Coverage emits mapped-away surfaces separately; content status is on the resolved lemma.",
        "# Redundant rows may map one NGSL lemma onto another (e.g. cash → money).",
        "# Do not map a surface that is its own distinct NGSL lemma when collapsing would be wrong (e.g. found, left).",
    ]
    out: dict[str, tuple[str, str]] = {}
    for r in csv.DictReader(lines[header_idx:]):
        surface = (r.get("surface") or "").strip().lower()
        lemma = (r.get("lemma") or "").strip().lower()
        kind = (r.get("kind") or "inflection").strip().lower() or "inflection"
        if not surface or not lemma or surface == lemma or surface.startswith("#"):
            continue
        if kind not in ("inflection", "redundant"):
            kind = "inflection"
        out[surface] = (lemma, kind)

    protected = set(keeps.values())
    for surface, canonical in redundant.items():
        if surface == canonical or surface in protected:
            continue
        prev = out.get(surface)
        if prev and prev[1] == "inflection":
            continue
        out[surface] = (canonical, "redundant")

    # Resolve trivial chains one hop is enough for coverage; avoid A→B when B→A
    for surface, (lemma, kind) in list(out.items()):
        if kind != "redundant":
            continue
        # if canonical itself maps away, leave chain (coverage resolves)

    with LEMMA_MAP.open("w", newline="", encoding="utf-8") as f:
        for c in comments:
            f.write(c + "\n")
        w = csv.DictWriter(f, fieldnames=["surface", "lemma", "kind"], lineterminator="\n")
        w.writeheader()
        for surface, (lemma, kind) in sorted(out.items(), key=lambda x: (0 if x[1][1] == "inflection" else 1, x[0])):
            w.writerow({"surface": surface, "lemma": lemma, "kind": kind})

    # Rebuild metaphor-extra from final published singles + any extras whose literal still empty-or-matching
    final_home = {keep: lit for lit, keep in keeps.items()}
    # also singles that weren't in keeps from multi — already in keeps
    for row in rows:
        lit = row["literal"].strip().lower()
        parts = parse_meta(row["metaphorical"])
        if len(parts) == 1:
            final_home[parts[0]] = lit

    extra_old = list(csv.DictReader(EXTRA.open(encoding="utf-8")))
    dedup: dict[str, str] = {}
    for r in extra_old:
        lemma = (r.get("lemma") or "").strip().lower()
        lit = (r.get("literal") or "").strip().lower()
        if not lemma or not lit:
            continue
        if lemma in out and out[lemma][1] == "redundant":
            continue
        if lemma in final_home:
            dedup[lemma] = final_home[lemma]
            continue
        # drop if pointing at a row that now has a different single metaphor
        row = by_lit.get(lit)
        if row is not None:
            cur = parse_meta(row["metaphorical"])
            if cur and cur[0] != lemma:
                continue
            if not cur:
                # don't reattach gaps onto empty via extra; singleton pass owns attachments
                continue
        dedup[lemma] = lit

    for lemma, lit in final_home.items():
        dedup[lemma] = lit

    with EXTRA.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["lemma", "literal"], lineterminator="\n")
        w.writeheader()
        for lemma, lit in sorted(dedup.items()):
            w.writerow({"lemma": lemma, "literal": lit})

    print(f"Collapsed multi bags: {processed}")
    print(f"Redundant mappings set this pass: {len(redundant)}")
    print(f"Lemma-map size: {len(out)}")
    print(f"Metaphor-extra size: {len(dedup)}")
    print(f"Published multi remaining: {multi}")
    print(f"Rows with metaphorical: {sum(1 for r in rows if r['metaphorical'].strip())}")


if __name__ == "__main__":
    main()
