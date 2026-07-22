# Clarity Lexicon Strategy

How we build and maintain the emoji-seeded root lexicon. Source of truth for **process**; the living word list is `data/lexicon.csv`. Language design still lives in `docs/language-reference.md`.

## Goal

A root dictionary where each kept entry has:

| Field | Role |
|-------|------|
| emoji | Visual anchor and stable ID for the concept |
| literal | Common literal English gloss (what the emoji **is**) |
| clarity | Auto-generated Clarity **root** derived from that literal |
| metaphorical | Deferred — not filled in this phase |

Entries are **roots** only. Part-of-speech prefixes (`/z/`, `/v/`, `/w/`, …) and lexical endings (`-l`, `-m`, …) are applied at use time; this file does not list PoS variants or usage notes.

Psychological / Claritish vocabulary goals are out of scope for this lexicon pass.

## Seed and unit of entry

- **Seed:** every row of `data/emojis.csv` (full Unicode emoji inventory in that file).
- **One row per emoji** in `data/lexicon.csv`, including near-duplicates, until the distinctiveness pass marks which to keep.
- Helper columns (`name`, `group`, `subgroup`) come from the Unicode/source inventory and are editing aids, not lexicon senses.
- Do **not** reuse `concept` / emojese labels from `emojis.csv`; those are often figurative or playful.
- **Do** derive literals by normalizing the Unicode `name` column (see [Literal format](#literal-format) below).

## Phase 1 — literal definitions (current)

Fill `literal` for **every row** in `data/lexicon.csv` (~3,950 emojis). Work **by `group`** (checklist below); each group can be reviewed before moving on.

1. Normalize `name` into a **common literal gloss**: the everyday, concrete meaning a learner would expect (e.g. 🍎 → `apple`, not `health` or `teachers-pet`).
2. Prefer short, dictionary-like English (usually one word; multi-word only when needed for clarity).
3. Leave `clarity` empty until Phase 3.
4. Leave metaphors alone. Note for later: when metaphors return, they should hang off the same root via the language’s metaphorical lexical ending (`-m`), not as a second unrelated root — and only for common, useful extensions.

### Literal format

| Rule | Example |
|------|---------|
| Lowercase | `apple`, not `Apple` |
| Hyphen-separated multi-word | `grinning-face`, `waving-hand` |
| Singular where reasonable | `apple`, `dog`, `flag` |
| Drop `and` / `&` | `antigua-barbuda`, not `antigua-and-barbuda` |
| Strip Unicode prefixes from `name` | `flag: Japan` → `japan`; `keycap: 1` → `keycap-1` |

**From `name`:** lowercase, replace spaces with hyphens, remove punctuation and filler words (`and`, `&`, `the`), collapse repeated hyphens. Trim skin-tone / hair-style / gender suffixes before choosing the shared literal (see below).

### What “literal” means here

- Name the **depicted** thing, action, or pose — not the emotion or meme reading it suggests.
  - Prefer `grinning-face`, `crying-face`, `waving-hand` over `happy`, `sad`, `hello`.
  - 🍎 → `apple`, not `health`.
- Avoid slang, meme readings, and brand-specific senses unless the emoji is that brand/object.
- **Collapse early:** near-duplicates in the same subgroup share one literal when the depiction is the same sense.
  - Skin-tone, hair-style, and gender variants → same literal as the unqualified base (e.g. all 👋 variants → `waving-hand`).
  - Grinning / smiling face variants in `face-smiling` → one shared literal such as `grinning-face` (not distinct literals per Unicode name).
  - Colored hearts → `red-heart`, `blue-heart`, etc. only when color is the distinguishing feature; otherwise share.
- Flags: the **common English country/territory name**, shortened when that is what people say (`japan`, `usa`, `uae`, `uk`), not official long forms unless needed for disambiguation.
- Letters and keycaps: literal is the referent (`letter-a`, `keycap-1`), not a metaphor.

### Phase 1 checklist (by group)

| Group | Rows | Status |
|-------|------|--------|
| Smileys & Emotion | 171 | |
| People & Body | 2,418 | |
| Animals & Nature | 160 | |
| Food & Drink | 131 | |
| Travel & Places | 219 | |
| Activities | 85 | |
| Objects | 266 | |
| Symbols | 224 | |
| Flags | 270 | |
| Component | 9 | |

Update the Status column as each group is completed (`done` / `review`).

## Phase 2 — distinctiveness cull

Many emojis are near-synonyms (grinning faces, handshake variants, colored hearts). Phase 1 already collapses many of these to shared literals; Phase 2 picks which **emoji** to keep per literal cluster:

1. Cluster by `group` / `subgroup` and by identical or near-identical `literal` values.
2. For each cluster, **keep only the most distinctive** emoji(s) — the clearest visual prototype for that literal.
3. Set `keep` to `y` or `n` (empty = not reviewed).
4. Downstream tooling and published dictionaries should use **`keep=y` rows only**. All rows stay in `lexicon.csv` so cull decisions remain reversible.

“Most distinctive” ≈ fewest competing near-duplicates + most recognizable depiction of the literal. When two are equally good, prefer the unqualified / default presentation (no skin tone, no gender variant) if one exists.

## Phase 3 — Clarity roots

Once a row has a stable literal and `keep=y` (or you are generating provisionally for drafting):

1. Derive the Clarity root from the **literal** string with the existing converter (`toUniqueClarityWord` / `scripts/convert-emojis.ts` pattern).
2. Uniqueness is over **kept** roots (and any reserved roots documented later).
3. Store only the root in `clarity` (no PoS prefix, no `-l`/`-m` ending).

Regenerate clarity in bulk when literals or the keep set change; do not hand-edit roots unless documenting an exception in this file.

## CSV schema (`data/lexicon.csv`)

| Column | Required | Notes |
|--------|----------|-------|
| `emoji` | yes | Glyph; primary key with `name` as backup if glyph normalizes oddly |
| `name` | yes | Unicode/CLDR name from seed (reference) |
| `group` | yes | Seed taxonomy — clustering aid |
| `subgroup` | yes | Seed taxonomy — clustering aid |
| `literal` | phase 1 | Common literal gloss; empty in skeleton |
| `clarity` | phase 3 | Auto root from `literal`; empty until then |
| `keep` | phase 2 | `y` / `n` / empty (unreviewed) |

No `metaphorical` column yet. Add it when metaphors are in scope.

## Workflow

```
emojis.csv  →  lexicon.csv (skeleton: one row per emoji)
                 ↓
            fill literal
                 ↓
            set keep (distinctiveness)
                 ↓
            generate clarity from literal
```

1. Edit literals (and later `keep`) in `data/lexicon.csv`, working group by group (see Phase 1 checklist).
2. Run a lexicon converter script (to be wired; pattern in `scripts/convert-emojis.ts`) to fill `clarity` for rows with non-empty literal — preferably restricted to `keep=y` once phase 2 has started.
3. Treat `docs/language-reference.md` as grammar/phonology authority; this doc owns lexicon process only.

## Out of scope (for now)

- Metaphorical senses and `-m` dictionary text
- Claritish / psychology-driven sense splits
- Usage notes, example sentences, PoS-specific entries
- Compounds and “in the sense of [topic]” infixes
- Replacing or deleting rows from the full emoji seed (cull via `keep` instead)

## Immediate deliverable

Phase 1: all rows in `data/lexicon.csv` have a non-empty `literal`; `clarity` and `keep` remain empty. Skeleton is already in place (one row per `emojis.csv` emoji).
