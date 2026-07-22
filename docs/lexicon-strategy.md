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
- Do **not** reuse `concept` / emojese labels from `emojis.csv` as the literal by default; those are often figurative or playful. Literals are written fresh.

## Phase 1 — literal definitions (current)

1. For each emoji, write a **common literal meaning**: the everyday, concrete gloss a learner would expect (e.g. 🍎 → `apple`, not `health` or `teacher’s pet`).
2. Prefer short, dictionary-like English (usually one word; multi-word only when needed for clarity).
3. Leave `clarity` empty until the literal is settled.
4. Leave metaphors alone. Note for later: when metaphors return, they should hang off the same root via the language’s metaphorical lexical ending (`-m`), not as a second unrelated root — and only for common, useful extensions. **This phase focuses on common literals only.**

### What “literal” means here

- Name the depicted thing/action/state as plainly as possible.
- Avoid slang, meme readings, and brand-specific senses unless the emoji is that brand/object.
- Skin-tone and hair-style variants: same literal as the base type; distinctiveness pass will usually drop the variants.
- Flags, letters, and keycaps: literal is the referent (`japan`, `letter-a`, `keycap-1`), not a metaphor.

## Phase 2 — distinctiveness cull

Many emojis are near-synonyms (grinning faces, handshake variants, colored hearts). After literals are drafted:

1. Cluster by `group` / `subgroup` and by near-identical literals.
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

1. Edit literals (and later `keep`) in `data/lexicon.csv`.
2. Run a converter script (to be wired like `npm run convert-emojis`) to fill `clarity` for rows with non-empty literal — preferably restricted to `keep=y` once phase 2 has started.
3. Treat `docs/language-reference.md` as grammar/phonology authority; this doc owns lexicon process only.

## Out of scope (for now)

- Metaphorical senses and `-m` dictionary text
- Claritish / psychology-driven sense splits
- Usage notes, example sentences, PoS-specific entries
- Compounds and “in the sense of [topic]” infixes
- Replacing or deleting rows from the full emoji seed (cull via `keep` instead)

## Immediate deliverable

Skeleton `data/lexicon.csv`: one row per `emojis.csv` emoji; `literal`, `clarity`, and `keep` empty, ready for literal drafting.
