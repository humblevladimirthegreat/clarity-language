# Clarity Lexicon Strategy

How we build and maintain the emoji-seeded root lexicon. Source of truth for **process**; the living word list is `data/lexicon.csv`. Language design still lives in `docs/language-reference.md`.

## Goal

A root dictionary where each kept entry has:

| Field | Role |
|-------|------|
| emoji | Visual anchor and stable ID for the concept |
| literal | Immediate English gloss — what a fluent user reads the emoji as (see below) |
| clarity | Auto-generated Clarity **root** derived from that literal |
| metaphorical | Deferred — not filled in this phase |

Entries are **roots** only. Part-of-speech prefixes (`/z/`, `/v/`, `/w/`, …) and lexical endings (`-l`, `-m`, …) are applied at use time; this file does not list PoS variants or usage notes.

Psychological / Claritish vocabulary goals are out of scope for this lexicon pass.

## Seed and unit of entry

- **Seed:** every row of `data/emojis.csv` (full Unicode emoji inventory in that file).
- **One row per emoji** in `data/lexicon.csv`, including near-duplicates, until the distinctiveness pass marks which to keep.
- Helper columns (`name`, `group`, `subgroup`) come from the Unicode/source inventory — **hints only**, not the gloss.
- Do **not** reuse `concept` / emojese labels from `emojis.csv`; those are often figurative or playful.
- Skeleton is in place: one row per emoji; `clarity` and `keep` empty.

## What `literal` means

The **immediate reading** — the short English word or phrase a fluent emoji user would substitute for the glyph in ordinary use.

**Substitution test:** *If this emoji appeared in a message and I replaced it with one gloss, what would I write?*

| Emoji | Unicode `name` | Wrong (label) | Right (reading) |
|-------|----------------|---------------|-----------------|
| 🅿️ | P button | `p-button` | `parking` |
| 🍎 | red apple | `red-apple` | `apple` |
| ▶️ | play button | `play-button` | `play` |
| 🏧 | ATM sign | `atm-sign` | `atm` |
| 🅰️ | A button (blood type) | — | `blood-type-a` (the label *is* the meaning) |
| 1️⃣ | keycap: 1 | — | `keycap-1` (digit is the meaning) |

Rules:

- Gloss **meaning**, not Unicode naming. When a letter or symbol stands for a word (P → parking), gloss the word.
- When the label **is** the meaning (blood types, keycap digits, country flags), gloss the label.
- Prefer the **dominant everyday reading**, not meme slang or rare figurative use.
- Figurative extensions belong in a later metaphor pass (`-m`), not as a second root.
- Avoid brand-specific senses unless the emoji is that brand/object.
- **English accessibility:** If a typical English-speaking emoji user would not have an immediate gloss, the entry is not lexicon material (see [Drop rule](#drop-rule-no-english-association)).

### Drop rule: no English association

Clarity’s seed is emoji, but the **published lexicon is for English-accessible readings**. Drop rows (via `keep=n`) when an English speaker would not spontaneously know what the glyph means — no forced translation, no romanized Japanese, no “you’d know if you lived there.”

**Substitution test failure:** If you hesitate, reach for a proper noun in another language, or want to write “it means X in Japan,” → **drop**.

| Keep? | Example | Why |
|-------|---------|-----|
| yes | 🅿️ → `parking` | Universal sign reading in English contexts |
| yes | 🏧 → `atm` | Widely recognized |
| yes | 🔰 → `beginner` | Common loan in gaming/anime; single English word |
| no | 🈹 “discount” button | Kanji legible only with Japanese literacy |
| no | 🈶 “not free of charge” button | No spontaneous English reading |
| no | 🈵 “no vacancy” button | Same |
| maybe | 🏯 Japanese castle | English name for a building type — gloss `castle` if kept; drop if too niche vs generic 🏰 |

**Typical drop categories:**

- **Japanese ideograph buttons** (`alphanum` rows named `Japanese “…” button`) — almost all `keep=n`.
- **Region-specific signage** with no English equivalent reading (other CJK shop signs, obscure local symbols).
- **Hyper-niche flags / territories** only if we later decide they fail the usefulness bar (optional; country names usually stay in Tier A).

Dropped rows **stay in `lexicon.csv`** with `keep=n` and `literal` empty (or a brief `name` note in comments only if needed — prefer empty). Do not invent Clarity roots for them. Phase 4 runs on `keep=y` only.

This is separate from the **near-duplicate cull** (Phase 3): a row can be the only one of its kind and still be dropped for no English association.

### Literal format

| Rule | Example |
|------|---------|
| Lowercase | `parking`, not `Parking` |
| Hyphen-separated multi-word | `blood-type-a`, `no-smoking` |
| Singular where reasonable | `apple`, `dog` |
| Drop `and` / `&` | `antigua-barbuda` |
| Common short forms | `usa`, `uae`, `uk`, `japan` |

## Phases (overview)

| Phase | Status |
|-------|--------|
| Skeleton (`lexicon.csv` one row per emoji) | **done** |
| 1. Variant collapse | **done** |
| 2. Literal glossing | **in progress** — all groups **done** except People & Body (2,418 rows); Symbols + 8 others glossed |
| 3. Cull (`keep`) | not started |
| 4. Clarity roots | not started |

```
emojis.csv  →  lexicon.csv (skeleton)          ✓ done
                 ↓
         1. collapse variants (mechanical)     ✓ done
                 ↓
         2. gloss literals (curated)         ← in progress (all except People & Body ✓)
                 ↓
         3. cull: duplicates + no-English-drop (keep=y/n)
                 ↓
         4. generate clarity roots
```

**What exists today:** The skeleton is complete. Phase 1 tooling (`scripts/collapse-variants.ts`, `src/variant-cluster.ts`) clusters variant rows and propagates `literal` from prototypes. Run `npm run collapse-variants report` to audit clusters; after glossing a prototype row in Phase 2, run `npm run fill-literals` (alias for `collapse-variants propagate`) to fan out to variants. **Phase 2 complete** for Symbols (206 glossed, 18 dropped), Smileys & Emotion (171), Travel & Places (219), Activities (85), Objects (266), Animals & Nature (160), Food & Drink (130 glossed, 1 dropped: oden), Flags (270), and Component (9). **People & Body** (2,418) not yet glossed. `clarity` is empty everywhere.

---

## Phase 1 — Variant collapse (mechanical)

**Goal:** Near-duplicate rows share one `literal` before or as glossing proceeds. Reduce redundant judgment.

**Script-assisted.** `npm run collapse-variants` clusters rows; `npm run fill-literals` propagates prototype literals to variants:

- `npm run collapse-variants report` — cluster stats; `--verbose` lists all multi-member clusters.
- `npm run collapse-variants propagate` — copy prototype `literal` to variant rows (empty members only).
- `npm run fill-literals` — same as `propagate` (backward-compatible alias).

**Collapse rules:**

- Skin-tone, hair-style, and gender variants → same `literal` as the unqualified base (e.g. all 👋 variants → whatever 👋 is glossed as).
- Near-duplicate depictions in the same subgroup → one shared `literal` (e.g. grinning-face cluster, colored hearts where color is the point).
- Component rows (`skin-tone`, `hair-style`) → gloss the component itself (`light-skin-tone`, `red-hair`, …).

**Do not** auto-fill `literal` from normalized `name` for Tier B subgroups (see Phase 2). Scripts prepare clusters; they do not assign meaning.

---

## Phase 2 — Literal glossing (curated)

**Prerequisite:** Phase 1 complete (or in progress per subgroup: gloss prototype rows, then propagate).

**Goal:** Every **kept** row has a reviewed `literal`. This is the main lexicon-design pass and requires judgment.

Work **by `subgroup`** within each `group`. Finish one subgroup, review, then move on.

### Tier A — object referent (script draft OK, human review)

Name ≈ meaning. A normalized draft is often correct; spot-check for outliers.

| Groups / subgroups |
|--------------------|
| Animals & Nature (all) |
| Food & Drink (all) |
| Objects — clothing, tool, household, musical-instrument, science, medical, writing, most office/household |
| Flags — `country-flag`, `subdivision-flag` |
| Component |

### Tier B — immediate reading (curated only)

Signs, UI, faces, people, activities — **no auto-gloss from `name`**. Apply the substitution test row by row or cluster by cluster.

| Groups / subgroups |
|--------------------|
| Symbols (all) |
| Smileys & Emotion (all) |
| People & Body (all) |
| Activities (all) |
| Travel & Places (all) |
| Objects — sign-like or label-like: `phone`, `computer`, `money`, `mail`, `lock`, `sound`, `music`, `light & video` |

### Subgroup briefs (Tier B)

Short guidance so glosses stay consistent within a subgroup:

| Subgroup | Brief |
|----------|-------|
| `transport-sign` | What the sign means (`parking`, `restroom`, `atm`), not "X sign". |
| `warning` | The prohibition or hazard (`no-smoking`, `radioactive`), not icon description. |
| `alphanum` | Latin-letter buttons → meaning (`parking`, `ok`, `cool`); blood-type → `blood-type-a`. **Japanese ideograph buttons → `keep=n`** (no English association). |
| `av-symbol` | Media control meaning (`play`, `pause`, `shuffle`), not "play button". |
| `arrow` | Direction or action (`up`, `back`, `reload`), not "up arrow". |
| `geometric` | Color + shape when that is the reading (`red-circle`); otherwise the intended use. |
| `keycap` | `keycap-1`, `keycap-hash`, etc. — digit/symbol is the meaning. |
| `face-*` | What the face reads as (`grin`, `laugh`, `cry`, `wink`) — not Unicode face description. |
| `heart` | Keep color when it matters (`red-heart`); shared concepts otherwise (`broken-heart`). |
| `person-*` | Action or role (`wave`, `doctor`, `runner`), not "woman gesturing OK". |
| `sport` / `game` | Activity (`soccer`, `chess`), not equipment description. |

Leave `clarity` empty until Phase 4.

During glossing, mark obvious drops mentally (or tentatively `keep=n`); confirm in Phase 3. Do not spend time inventing English glosses for Japanese ideograph buttons.

### Glossing checklist (by group)

| Group | Rows | Tier | Status |
|-------|------|------|--------|
| Symbols | 224 | B | done |
| Smileys & Emotion | 171 | B | done |
| People & Body | 2,418 | B | |
| Travel & Places | 219 | B | done |
| Activities | 85 | B | done |
| Objects | 266 | A + B | done |
| Animals & Nature | 160 | A | done |
| Food & Drink | 131 | A | done |
| Flags | 270 | A | done |
| Component | 9 | A | done |

Status values: empty · `draft` · `review` · `done` · `re-gloss` (scripted literals that need human pass).

**Note:** Phase 2 glossing for Objects and Symbols uses meaning-first readings (Tier B subgroups) and name-normalized drafts with overrides (Tier A). People & Body remains unglossed.

---

## Phase 3 — Cull (`keep=y` / `keep=n`)

Two reasons to set `keep=n` (rows stay in `lexicon.csv`; never delete seed rows):

### A. No English association (drop)

Apply the [drop rule](#drop-rule-no-english-association). Leave `literal` empty. Examples: most `Japanese “…” button` rows, other signage that fails the substitution test for English speakers.

### B. Distinctiveness (near-duplicates)

Many kept emojis share a `literal` after Phases 1–2. Pick which **emoji** to keep per cluster:

1. Cluster by `group` / `subgroup` and by identical `literal`.
2. For each cluster, **keep only the most distinctive** emoji(s) — the clearest visual prototype for that gloss.
3. Set `keep` to `y` or `n` (empty = not reviewed).
4. Downstream tooling and published dictionaries use **`keep=y` rows only**.

“Most distinctive” ≈ fewest competing near-duplicates + most recognizable depiction. When tied, prefer the unqualified / default presentation (no skin tone, no gender variant).

A row can be dropped under A without being a duplicate, or culled under B while still being English-accessible.

---

## Phase 4 — Clarity roots

Once a row has a stable `literal` and `keep=y` (or provisional generation while drafting):

1. Derive the Clarity root from **`literal`** with the existing converter (`toUniqueClarityWord` / `scripts/convert-emojis.ts` pattern).
2. Uniqueness is over **kept** roots (and any reserved roots documented later).
3. Store only the root in `clarity` (no PoS prefix, no `-l`/`-m` ending).

Regenerate in bulk when literals or the keep set change; do not hand-edit roots unless documenting an exception in this file.

---

## CSV schema (`data/lexicon.csv`)

| Column | Required | Notes |
|--------|----------|-------|
| `emoji` | yes | Glyph; primary key with `name` as backup if glyph normalizes oddly |
| `name` | yes | Unicode/CLDR name from seed (reference only) |
| `group` | yes | Seed taxonomy — clustering aid |
| `subgroup` | yes | Seed taxonomy — glossing brief scope |
| `literal` | phase 2 | Immediate-reading gloss; empty until glossed |
| `clarity` | phase 4 | Auto root from `literal`; empty until then |
| `keep` | phase 3 | `y` = in published lexicon · `n` = dropped (no English association and/or duplicate cull) · empty = unreviewed |

No `metaphorical` column yet. Add it when metaphors are in scope.

## Tooling

| Script | Role |
|--------|------|
| `scripts/collapse-variants.ts` | Phase 1: cluster report + propagate prototype `literal` to variants (`report` / `propagate`) |
| `scripts/fill-literals.ts` | Alias for `collapse-variants propagate` — run after glossing prototype rows |
| `scripts/phase2-gloss.ts` | Phase 2 bulk glossing (`npx tsx scripts/phase2-gloss.ts`; `--dry-run` to preview) |
| Lexicon converter (to be wired) | Phase 4: `literal` → `clarity` for `keep=y` rows |

Manual editing in `data/lexicon.csv` is the source of truth for `literal`. Treat `docs/language-reference.md` as grammar/phonology authority; this doc owns lexicon process only.

## Out of scope (for now)

- Metaphorical senses and `-m` dictionary text
- Claritish / psychology-driven sense splits
- Usage notes, example sentences, PoS-specific entries
- Compounds and “in the sense of [topic]” infixes
- Replacing or deleting rows from the full emoji seed (cull via `keep` instead)

## Immediate deliverable

**Next:** Phase 2 on **People & Body** (2,418 rows, Tier B — gloss prototype rows per cluster, then `npm run fill-literals` to propagate skin-tone/gender variants). Then Phase 3 cull across all groups.
