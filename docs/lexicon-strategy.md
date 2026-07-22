# Clarity Lexicon Strategy

How we build and maintain the emoji-seeded root lexicon. Source of truth for **process**; the working word list is `data/lexicon.csv`; the **published** dictionary is `data/lexicon-published.csv` (Phase 4). Language design still lives in `docs/language-reference.md`.

## Goal

A root dictionary where each kept entry has (in `data/lexicon-published.csv`):

| Field | Role |
|-------|------|
| emoji | Visual anchor and stable ID for the concept |
| literal | Immediate English gloss — what a fluent user reads the emoji as (see below) |
| clarity | Auto-generated Clarity **root** derived from that literal |
| metaphorical | NGSL lemmas attached as figurative senses (Phase 5); semicolon-separated |

Entries are **roots** only. Part-of-speech prefixes (`/z/`, `/v/`, `/w/`, …) and lexical endings (`-l`, `-m`, …) are applied at use time; this file does not list PoS variants or usage notes.

Psychological / Claritish vocabulary goals are out of scope for this lexicon pass.

## Seed and unit of entry

- **Seed:** every row of `data/emojis.csv` (full Unicode emoji inventory in that file).
- **One row per emoji** in `data/lexicon.csv`, including near-duplicates, until the distinctiveness pass marks which to keep.
- Helper columns (`name`, `group`, `subgroup`) come from the Unicode/source inventory — **hints only**, not the gloss.
- Do **not** reuse `concept` / emojese labels from `emojis.csv`; those are often figurative or playful.
- Skeleton is in place: one row per emoji; `keep` empty until Phase 3.

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
| 1️⃣ | keycap: 1 | — | `1` (digit is the meaning) |

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
- **Component modifiers** (`skin-tone`, `hair-style`) — Unicode encoding pieces, not standalone message readings; `keep=n`, empty `literal`. Appearance on people stays collapsed to the base gloss; do not publish Fitzpatrick / hair-component roots.

Dropped rows **stay in `lexicon.csv`** with `keep=n` and `literal` empty (or a brief `name` note in comments only if needed — prefer empty). Do not invent Clarity roots for them. Phase 4 exports **`keep=y` rows only** to the published file; dropped rows are not copied.

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
| 2. Literal glossing | **done** |
| 2.5. People & Body glossing | **done** — 2,418 rows glossed |
| 3. Cull (`keep`) | **done** — 1,367 kept · 2,586 dropped |
| 4. Clarity roots | **done** — 1,367 rows in `lexicon-published.csv` |
| 5. NGSL coverage / metaphors | **done (waves)** — ~1.6k content lemmas assigned; ~1k gaps left intentionally |

```
emojis.csv  →  lexicon.csv (skeleton)          ✓ done
                 ↓
         1. collapse variants (mechanical)     ✓ done
                 ↓
         2. gloss literals (curated)             ✓ done
                 ↓
         2.5. People & Body (curated, waves)  ✓ done
                 ↓
         3. cull: duplicates + no-English-drop (keep=y/n)  ✓ done
                 ↓
         4. generate clarity roots → lexicon-published.csv  ✓ done
                 ↓
         5. NGSL lemmas → literal / metaphorical           ✓ waves done
```

**What exists today:** Phases 1–5 waves complete. Metaphor cells live on `lexicon-published.csv`; curated map in `data/ngsl-metaphor-extra.csv`; regenerate coverage with `npm run ngsl-coverage`. Remaining `gap` lemmas await compounds / non-emoji roots (out of scope).

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
- Component rows (`skin-tone`, `hair-style`) → leave `literal` empty and `keep=n` (modifiers, not roots).

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

`Component` (`skin-tone`, `hair-style`) is not glossed — drop under the Component-modifier rule (empty `literal`, `keep=n`).

### Tier B — immediate reading (curated only)

Signs, UI, faces, people, activities — **no auto-gloss from `name`**. Apply the substitution test row by row or cluster by cluster.

| Groups / subgroups |
|--------------------|
| Symbols (all) |
| Smileys & Emotion (all) |
| Activities (all) |
| Travel & Places (all) |
| Objects — sign-like or label-like: `phone`, `computer`, `money`, `mail`, `lock`, `sound`, `music`, `light & video` |

People & Body is Tier B but glossed in [Phase 2.5](#phase-25--people--body-literal-glossing) (separate pass).

### Subgroup briefs (Tier B)

Short guidance so glosses stay consistent within a subgroup:

| Subgroup | Brief |
|----------|-------|
| `transport-sign` | What the sign means (`parking`, `restroom`, `atm`), not "X sign". |
| `warning` | The prohibition or hazard (`no-smoking`, `radioactive`), not icon description. |
| `alphanum` | Latin-letter buttons → meaning (`parking`, `ok`, `cool`); blood-type → `blood-type-a`. **Japanese ideograph buttons → `keep=n`** (no English association). |
| `av-symbol` | Media control meaning (`play`, `pause`, `shuffle`), not "play button". |
| `arrow` | Direction or action (`up`, `back`, `reload`), not "up arrow". |
| `geometric` | Filled color circles are the color roots (`red`, `orange`, `yellow`, `green`, `blue`, `purple`, `brown`, `black`, `white`). Also keep basic squares/triangles (`black-square`, `white-square`, `up-triangle`, `down-triangle`, `radio-button`). Drop square/diamond color spam and size variants. |
| `keycap` | Bare digit/symbol (`0`…`9`, `10`, `hash`, `asterisk`) — that character is the meaning. |
| `face-*` | What the face reads as (`grin`, `laugh`, `cry`, `wink`) — not Unicode face description. Keep only faces with a **stable everyday English reading**; drop Unicode jargon (`persevering`, `confounded`), near-duplicate intensity variants, and novelty remakes (`cat-face`). Prefer the dominant messaging prototype (`😂` laugh, `😊` smile). |
| `heart` | Keep one default `heart` (❤️) plus hearts with a distinct common reading (`broken-heart`, `beating-heart`, `two-hearts`, `heart-fire`, `mending-heart`, `love-letter`). **Drop all colored hearts** (`pink-heart`, `blue-heart`, …) — color is compositional, not a separate root. Drop decorative/punctuation variants too. |
| `cat-face` | **Drop** — novelty remakes of human face concepts, not distinct English roots. |
| `person-*` | Action or role (`wave`, `doctor`, `runner`), not "woman gesturing OK". No skin-tone or hair/beard literals — see [Phase 2.5](#phase-25--people--body-literal-glossing). |
| `hand-*` / `hands` | Keep gestures with a **stable everyday English reading** (`wave`, `thumbs-up`, `clap`, `point`, `pray`, …). One pointing root only (`point` ← ☝️); compose direction with arrow roots. Drop directional palm/push hands, franchise/meme partial-finger gestures, and vague open-palm variants. |
| `sport` / `game` | Activity (`soccer`, `chess`), not equipment description. |

During glossing, mark obvious drops mentally (or tentatively `keep=n`); confirm in Phase 3. Do not spend time inventing English glosses for Japanese ideograph buttons.

### Glossing checklist (by group)

| Group | Rows | Tier | Status |
|-------|------|------|--------|
| Symbols | 224 | B | done |
| Smileys & Emotion | 171 | B | done |
| People & Body | 2,418 | B | done |
| Travel & Places | 219 | B | done |
| Activities | 85 | B | done |
| Objects | 266 | A + B | done |
| Animals & Nature | 160 | A | done |
| Food & Drink | 131 | A | done |
| Flags | 270 | A | done |
| Component | 9 | — | dropped (`keep=n`) |

Status values: empty · `draft` · `review` · `done` · `re-gloss` (scripted literals that need human pass).

**Note:** Phase 2 glossing for Objects and Symbols uses meaning-first readings (Tier B subgroups) and name-normalized drafts with overrides (Tier A). People & Body is deferred to [Phase 2.5](#phase-25--people--body-literal-glossing).

---

## Phase 2.5 — People & Body (literal glossing)

**Prerequisite:** Phase 2 complete for all other groups.

**Why a separate phase:** People & Body has 2,418 seed rows but only **~280 prototype gloss decisions** after variant collapse (~90% of rows are skin-tone, gender, or hair-style variants that inherit the prototype `literal` via `npm run fill-literals`). It still needs its own pass because role/gesture/family policy must be decided once and applied consistently.

**Goal:** Every People & Body row has a reviewed `literal`, propagated from prototype clusters.

### Global rules (People & Body)

| Rule | Detail |
|------|--------|
| **No skin tone in literals** | Skin-tone rows share the prototype gloss. Never `light-skin-tone-doctor` — just `doctor`. |
| **No hair/beard splits** | Rows named `person: blond hair`, `man: beard`, etc. share the base literal (`person`, `man`, `woman`, …). Do not invent `blond-person` or `bearded-man`. |
| **Gender-neutral roles & actions** | `person-role`, `person-gesture`, `person-activity`, `person-sport` → action or role (`doctor`, `wave`, `dancing`, `wrestling`), not `"woman gesturing OK"`. Gender-prefixed variants collapse to the same literal. |
| **Keep gendered nouns** | Where the emoji reading *is* the gender (`boy`, `girl`, `man`, `woman`), keep that literal. |
| **Align with Activities** | `person-sport` / `person-activity` literals should match the same activity nouns used in the Activities group (`soccer`, `swimming`, …). |
| **Phase 3 in mind** | Many variants will share one literal; gloss semantically. The cull picks the best emoji per literal later. |

Work **by subgroup**, in three waves. Gloss prototype rows per cluster, run `npm run fill-literals`, spot-check, then move on.

### Subgroup briefs (People & Body)

| Subgroup | Rows | Prototypes | Brief |
|----------|-----:|-----------:|-------|
| `body-parts` | 48 | 18 | Anatomical noun (`ear`, `foot`, `brain`). |
| `hand-fingers-open` | 66 | 11 | Hand pose or gesture (`wave`, `raised-hand`, `vulcan-salute`). |
| `hand-fingers-partial` | 54 | 9 | Gesture (`ok-sign`, `crossed-fingers`, `love-you-gesture`). |
| `hand-fingers-closed` | 36 | 6 | Gesture (`fist`, `thumbs-up`, `thumbs-down`). |
| `hand-single-finger` | 42 | 7 | Gesture (`point-up`, `middle-finger`). |
| `hands` | 62 | 7 | Two-hand gesture (`clap`, `handshake`, `pray`). |
| `hand-prop` | 18 | 3 | Hand + object (`writing-hand`, `nail-polish`). |
| `person-symbol` | 11 | 11 | Symbolic figure (`speaking-head`, `bust-in-silhouette`) — one gloss each. |
| `person-resting` | 30 | 3 | Pose (`sleeping`, `in-bed`). |
| `person-gesture` | 180 | 12 | Verb or short phrase (`shrug`, `facepalm`, `bow`, `tipping-hand`). |
| `person-role` | 492 | 34 | Job or role noun (`teacher`, `judge`, `pilot`). |
| `person-activity` | 408 | 21 | Activity (`dancing`, `juggling`, `sauna`). |
| `person-sport` | 308 | 17 | Sport (`basketball`, `wrestling`, `golf`). |
| `person-fantasy` | 158 | 17 | Archetype (`fairy`, `vampire`, `mage`). |
| `person` | 168 | ~12 | Age/gender noun (`baby`, `child`, `boy`, `girl`, `person`, `man`, `woman`, `older-person`). Hair/beard/skin-tone variants → same literal. |
| `family` | 337 | 7 | Relationship or event (`family`, `kiss`, `couple`, `holding-hands`, `women-holding-hands`, `men-holding-hands`, `woman-and-man-holding-hands`). Mixed skin-tone rows share the gloss — fix `family` clustering or gloss the seven base concepts only. |

Prototype counts come from `npm run collapse-variants report` scoped to People & Body; `person` and `family` may show inflated cluster counts until hair/beard and mixed skin-tone names collapse — treat the briefs above as the real gloss inventory.

### Waves

| Wave | Subgroups | ~Glosses | Notes |
|------|-----------|----------|-------|
| **1** | `body-parts`, all `hand-*`, `person-symbol`, `person-resting` | ~75 | Low ambiguity; establishes hand/gesture conventions. |
| **2** | `person-gesture`, `person-role`, `person-activity`, `person-sport`, `person-fantasy` | ~101 | Bulk of the group; cluster-by-cluster with propagate. |
| **3** | `person`, `family` | ~19 | Policy-heavy tail; do last. |

After each wave: `npm run fill-literals`, then spot-check a few multi-member clusters (`collapse-variants report --verbose`).

---

## Phase 3 — Cull (`keep=y` / `keep=n`)

Two reasons to set `keep=n` (rows stay in `lexicon.csv`; never delete seed rows):

### A. No English association (drop)

Apply the [drop rule](#drop-rule-no-english-association). Leave `literal` empty. Examples: most `Japanese “…” button` rows, other signage that fails the substitution test for English speakers, and all `Component` skin-tone / hair-style modifiers.

### B. Distinctiveness (near-duplicates)

Many kept emojis share a `literal` after Phases 1–2. Pick which **emoji** to keep per cluster:

1. Cluster by `group` / `subgroup` and by identical `literal`.
2. For each cluster, **keep only the most distinctive** emoji(s) — the clearest visual prototype for that gloss.
3. Set `keep` to `y` or `n` (empty = not reviewed).
4. Downstream tooling and published dictionaries use **`data/lexicon-published.csv`** (exported from `keep=y` rows only).

“Most distinctive” ≈ fewest competing near-duplicates + most recognizable depiction. When tied, prefer the unqualified / default presentation (no skin tone, no gender variant).

A row can be dropped under A without being a duplicate, or culled under B while still being English-accessible.

### Cull-one policy

When distinct concepts share a `literal` within the same `group`/`subgroup` (e.g. kick-scooter and motor-scooter both `scooter`), **do not split literals** — keep one emoji, cull the rest. Revisit literal splits only if a kept entry is genuinely ambiguous after Phase 4.

### Tooling

`npm run phase3-cull` (`scripts/phase3-cull.ts`, logic in `src/literal-cull.ts`):

- `npm run phase3-cull report` — duplicate-cluster stats; `--verbose` lists all clusters; `--group="People & Body"` filters
- `npm run phase3-cull apply` — set `keep=y` on singletons + cluster winners, `keep=n` on losers and Drop A; `--dry-run` previews; `--group` for scoped apply
- `npm run phase3-cull audit` — validate: all rows reviewed, no duplicate `keep=y` per cluster, Drop A rows correct

**Winner selection:** `prototypeScore` from Phase 1 (prefers unqualified / default presentation). Override table in `src/literal-cull.ts` for clusters where score picks the wrong iconic emoji:

| Cluster key | Winner | Rationale |
|-------------|--------|-----------|
| `Smileys & Emotion\|face-affection\|kiss` | face blowing a kiss (😘) | Dominant everyday reading |
| `Smileys & Emotion\|face-smiling\|laugh` | face with tears of joy (😂) | Dominant everyday reading |
| `Smileys & Emotion\|face-smiling\|smile` | smiling face with smiling eyes (😊) | Dominant everyday reading |
| `Symbols\|other-symbol\|check` | check mark button (✅) | Dominant UI reading |
| `Travel & Places\|sky & weather\|lightning` | high voltage (⚡) | Dominant reading |
| `Travel & Places\|place-building\|castle` | castle (🏰) | Generic over Japanese variant |
| `Travel & Places\|place-building\|post-office` | post office (🏤) | Generic over Japanese variant |
| `People & Body\|hand-fingers-open\|raised-hand` | raised hand | Over raised back of hand |
| `People & Body\|hand-single-finger\|point` | index pointing up (☝️) | Sole pointing gesture; direction via arrows |
| `People & Body\|person-gesture\|deaf` | deaf person | Gender-neutral policy |
| `People & Body\|person-role\|pregnant` | pregnant person | Gender-neutral policy |
| `People & Body\|person-activity\|partying` | people with bunny ears | Unqualified default |

### Results

| Metric | Count |
|--------|------:|
| Total seed rows | 3,953 |
| `keep=y` (published) | 1,367 |
| `keep=n` (dropped) | 2,586 |
| Drop A (empty literal / not lexicon material) | 193 |
| Duplicate clusters culled | 179 |
| Singleton `keep=y` | 1,402 |

---

## Phase 4 — Clarity roots

**Goal:** Emit a **clean published lexicon** — a separate file with only the roots that survived the cull.

**Input:** `data/lexicon.csv` — rows where `keep=y` and `literal` is set.

**Output:** `data/lexicon-published.csv` — **1,367 rows** today (only `keep=y`; dropped rows are not transferred).

| Column | Phase 4 |
|--------|---------|
| `emoji` | Copied from working lexicon |
| `literal` | Copied from working lexicon |
| `clarity` | Auto-generated Clarity **root** from `literal` |
| `metaphorical` | Present but **empty** — filled in a later pass |

**Generation:**

1. Filter `lexicon.csv` to `keep=y` rows with a non-empty `literal`.
2. Derive each `clarity` root from `literal` with the existing converter (`toUniqueClarityWord` / `scripts/convert-emojis.ts` pattern).
3. Uniqueness is over **exported** roots only (and any reserved roots documented later).
4. Store only the root in `clarity` (no PoS prefix, no `-l`/`-m` ending).
5. Write the four columns above to `lexicon-published.csv`. On first publish, leave `metaphorical` blank. On **re**-publish, **preserve** existing `metaphorical` values keyed by `emoji` (Phase 5 edits must survive regenerating roots).

`lexicon.csv` is **not** updated with `clarity` values — it remains the full seed + gloss + cull working file. Regenerate `lexicon-published.csv` in bulk when literals or the keep set change; do not hand-edit generated roots unless documenting an exception in this file.

---

## Phase 5 — NGSL coverage and metaphors

**Goal:** For each **content** NGSL lemma, either match a published `literal` or attach it as a metaphor on exactly one emoji row. Function words are out of scope. Inflections collapse to one core lemma / one row.

### Rules

| Rule | Detail |
|------|--------|
| One lemma → one root | Each NGSL lemma attaches to at most one published row (via `literal` match or `metaphorical`). |
| Metaphors only on emoji rows | Attachments live in `lexicon-published.csv` column `metaphorical` — not a separate NGSL root list. |
| Function words out of scope | Lemmas in `data/ngsl-function-words.txt` get status `function` and are never auto-matched or metaphor-attached. |
| Core lemmas only | Inflections map to a single lemma (`went` / `goes` → `go`) via `data/ngsl-lemma-map.csv`. Coverage is lemma-keyed. |
| Prefer literal | Exact `lemma == literal` wins over metaphor. Do not also list that lemma in `metaphorical`. |
| No forced attach | Leftovers stay `gap` until a later decision (compounds / non-emoji roots) — do not invent bad metaphors. |

### `metaphorical` cell format

- Lowercase English **lemmas** only (no `went`, no glosses).
- **Semicolon-separated**, no spaces required (trim on parse): `go;travel;proceed`
- Many lemmas may share one emoji; each lemma appears on **at most one** row.
- A lemma must not duplicate another row’s `literal`.
- Empty cell = no metaphors yet.

Helpers: `parseMetaphoricalCell` / `formatMetaphoricalCell` in `scripts/ngsl-coverage.ts`.

### Inputs

| File | Role |
|------|------|
| `data/ngsl.csv` | Frequency-ordered English lemmas (`english` column) |
| `data/lexicon-published.csv` | Published roots; `metaphorical` filled by hand during review waves |
| `data/ngsl-function-words.txt` | Closed-class denylist (`#` comments allowed) |
| `data/ngsl-lemma-map.csv` | `surface,lemma` inflection map (`#` comment lines allowed) |

### Coverage report (`data/ngsl-coverage.csv`)

Regenerate anytime with `npm run ngsl-coverage`. Do not hand-edit as source of truth — edit denylist, lemma map, or published `metaphorical`, then re-run.

| Column | Values |
|--------|--------|
| `lemma` | Core lemma (or surface when `skip-inflection`) |
| `status` | `literal` · `metaphor` · `function` · `gap` · `skip-inflection` |
| `emoji` / `literal` / `clarity` | Target root when assigned |
| `source` | `exact` · `metaphorical` · `denylist` · `lemma-map` |
| `notes` | e.g. `→ go` for skip-inflection |

**Auto assignment today:** function denylist + exact literal match + existing `metaphorical` parses. Gaps await metaphor review waves (highest-frequency `gap` rows first).

### Review waves

| Wave | Scope | Status |
|------|-------|--------|
| 1 | Top 50 frequency `gap` lemmas | **done** |
| 2+ | Remaining content lemmas (curated + soft-match) | **done** — see coverage stats |

**Pipeline:** edit `data/ngsl-metaphor-extra.csv` → `npm run ngsl-metaphor-apply` → `npm run ngsl-coverage`.

1. Sort `status=gap` by NGSL order (file order ≈ frequency).
2. For each lemma, pick one published emoji or leave `gap`.
3. Append lemma to that row’s `metaphorical` (semicolon list) via the apply script / map.
4. Re-run `npm run ngsl-coverage` and fix uniqueness warnings.

Leftover `gap` rows are intentional (no forced attach). Revisit later for compounds / non-emoji roots.

**Coverage after waves (approx.):** ~223 `literal` · ~1,400 `metaphor` · ~170 `function` · ~1,000 `gap`. Exact counts: `npm run ngsl-coverage`.

---

## CSV schemas

### Working file (`data/lexicon.csv`)

| Column | Required | Notes |
|--------|----------|-------|
| `emoji` | yes | Glyph; primary key with `name` as backup if glyph normalizes oddly |
| `name` | yes | Unicode/CLDR name from seed (reference only) |
| `group` | yes | Seed taxonomy — clustering aid |
| `subgroup` | yes | Seed taxonomy — glossing brief scope |
| `literal` | phase 2 | Immediate-reading gloss; empty until glossed |
| `clarity` | — | Legacy column; leave empty — roots live in `lexicon-published.csv` |
| `keep` | phase 3 | `y` = export to published lexicon · `n` = dropped (no English association and/or duplicate cull) · empty = unreviewed |

### Published file (`data/lexicon-published.csv`)

| Column | Required | Notes |
|--------|----------|-------|
| `emoji` | yes | Glyph |
| `literal` | yes | Immediate-reading gloss |
| `clarity` | phase 4 | Auto root from `literal` |
| `metaphorical` | phase 5 | Semicolon-separated NGSL lemmas (figurative); empty until review |

## Tooling

| Script | Role |
|--------|------|
| `scripts/collapse-variants.ts` | Phase 1: cluster report + propagate prototype `literal` to variants (`report` / `propagate`) |
| `scripts/fill-literals.ts` | Alias for `collapse-variants propagate` — run after glossing prototype rows |
| `scripts/phase2-gloss.ts` | Phase 2 bulk glossing (`npx tsx scripts/phase2-gloss.ts`; `--dry-run` to preview) |
| `scripts/phase2.5-gloss.ts` | Phase 2.5 People & Body glossing (`npm run phase2.5-gloss`; `--wave=1\|2\|3\|all`) |
| `scripts/phase3-cull.ts` | Phase 3 cull (`npm run phase3-cull`; `report` / `apply` / `audit`) |
| `scripts/phase4-publish.ts` | Phase 4: `keep=y` rows from `lexicon.csv` → `lexicon-published.csv` (`literal` → `clarity`; `metaphorical` blank) |
| `scripts/ngsl-coverage.ts` | Phase 5: NGSL ↔ published coverage report → `data/ngsl-coverage.csv` |
| `scripts/apply-ngsl-metaphor-waves.py` | Phase 5: apply `ngsl-metaphor-extra.csv` (+ soft matches) → published `metaphorical` |
| `scripts/generate-ngsl-metaphor-extra.py` | Validate curated `ngsl-metaphor-extra.csv` |

Manual editing in `data/lexicon.csv` is the source of truth for `literal`. Treat `docs/language-reference.md` as grammar/phonology authority; this doc owns lexicon process only.

## Out of scope (for now)

- Claritish / psychology-driven sense splits
- Usage notes, example sentences, PoS-specific entries
- Compounds and “in the sense of [topic]” infixes
- Non-emoji roots for remaining NGSL `gap` lemmas
- Replacing or deleting rows from the full emoji seed (cull via `keep` instead)

## Immediate deliverable

**Next:** optional — tackle remaining `gap` lemmas via compounds or non-emoji roots; spot-check dubious metaphors in `ngsl-metaphor-extra.csv`.
