# Plan: morph-gloss serializer and doc lint

**Authority:** [`docs/meta/glosses.md`](docs/meta/glosses.md) (morph line only). Grammar and lexicon stay design authority for *what* a form means; glosses.md is authority for *how that meaning is spelled in a morph gloss*.

**Goal:** Parser output and documented Agalan–morph-gloss pairs use the **same string**. Do not compare free English (quoted lines, table **Gloss** / **English** cells, italic cues).

**Existing pieces:** `parseWord` / `inspectText` / `glossFor` (`src/parse/inspect.ts`); `parse(..., { checkAmbiguity: true })` / `collectAmbiguity`; Agalan word lint in `src/lint/agalan-docs.ts` (`npm run lint:md`). The **morph line** is the lint comparison target. Overlay UI keeps **`glossFor` chips**; chip text should use the **same English labels** as the morph serializer (similar to the gloss), not a second vocabulary.

**Out of scope:** Loose/strict free English; inventing new morphology; changing grammar docs in phase 1–2 except tests and fixtures; replacing overlay chips with a single morph-line string.

---

## Phase 1 — Produce a standardized morph gloss from parsed Agalan

Build a **serializer**: parsed words (and, when needed, a sentence inspect result) → one morph-gloss string per Agalan line.

### Deliverable

A pure function, e.g. `morphGlossFor(word)` / `morphGlossLine(tokens | text)`, that emits glosses.md **word shape**:

```
{PoS}-{english}(-x-{english|TAG})*[-x]
```

Words joined with spaced `|`. Prefix-less revisers: English only (no fake PoS). Citations without a role letter: English name or sense only (`Azawan`, not a default `z-`).

### Spec to implement (from glosses.md)

| Rule | Serializer does |
|------|-----------------|
| Sense, not spelling | English label only; no Agalan root letters; no `→` etymology |
| Sense-picking endings | Omit **-l** / **-m** / **-n** and `@` / `~` |
| Named **-n** | English name (`z-Azawan`), not `-proper` |
| Metaphor **-m** | Metaphor sense (`g-happy`) |
| Overlay / special | Overlay or closed label (`h-WITNESSED`, `z-speaker`, `g-SAME`) |
| Associative **-x** | Keep trailing `-x` |
| Resume **-r** | Binder is the gloss root: `z-←Azawan`; no trailing `-r`. Antecedent is **the most recent match** (already defined); not an ambiguity. |
| Mid-word **`x`** | **Always segmented and hyphenated** (`v-walking-unable-temporary`, `wish-x-guidance`, `z-Sushi-x-Coffee`). Never collapse a compound to one unsegmented English name for lint. |
| Joins / revisers | Job in the English (`z-and.open`, `instead`, `h-only-when`) |
| Numbers | Digitless / ordinal labels as in the worked table (`g-three`, `g-second`, `x-starting-with`) |
| Left-bound `/ɡ/` | `gl-…` |

House-cast names are a closed map (`zazawan` → `z-Azawan`, resume `zazar` → `z-←Azawan`). Special pronouns: `zugobon` / `zedonen` / `zahan` / `zenenun` → `z-speaker` / `z-listener` / `z-interlocutors` / `z-someone`.

**Ambiguous teaching labels** that glosses.md allows as contrast (`and.open` vs `and`, `j-question` vs `j-soft-question`, listed vs bare `hal`): pick **one canonical string** per classified reading and document it next to the serializer (small table in code comments or a test fixture file). If glosses.md lists two labels, freeze the one that matches the parser reading, then later retie docs to that freeze.

**Anaphors:** gloss `PoS-←` + the **most recent matching** antecedent’s English sense (`z-←Azawan`, `d-←tea`). Use `resolve` / inspect related tokens; do not invent a second binder rule. Unbound `-r` (no prior match) is a parse/resolve miss, not `--check-ambiguity`.

**Mid-word `x`:** serializer always hyphenates segments (word shape `(-x-{english|TAG})*`). If glosses.md or a grammar page shows a fused name (`j-Ubunexunowen` with no piece hyphens), retie that line to the segmented form in later phases — do not special-case “teaching vs used as a name.”

**Punctuation:** strip `.` `?` `!` from the Agalan input the same way the word linter peels them; they are not gloss pieces.

### Tests (phase 1 gate)

Unit tests against the **worked tables and example blocks in glosses.md** (single words, dialogue turn, metaphor/overlay, ability + values, numbered alternative, inclusive *we*). Parser must produce **byte-for-byte** those morph lines (after whitespace normalize: collapse internal space, require ` | ` between words).

If a glosses.md row is marked “as the docs require for that form” with two options (`z-who` / `z-something`), the test names the chosen canonical.

Do **not** run corpus lint in this phase. Overlay still calls **`glossFor`** (chips, not the joined morph line). Share sense lookup so each chip’s English matches the corresponding morph-gloss piece.

### Suggested layout

- `src/parse/morph-gloss.ts` — serializer
- `src/parse/morph-gloss.test.ts` — glosses.md fixtures
- Keep classify / inspect as the parse source; serializer is presentation of `LexWord` (+ optional inspect context)

---

## Phase 2 — Compare an existing gloss to a produced gloss

Given **Agalan + a claimed morph line**, parse the Agalan, serialize, compare.

### Deliverable

- `compareMorphGloss(agalan: string, documented: string): { ok: boolean; expected: string; actual: string }`
- Normalize both sides the same way (trim, Unicode NFC, ` | ` spacing, ignore a trailing period on Agalan only).
- **Exact match** after normalize. No synonym folding in v1 (that hides the inventory drift glosses.md forbids).

### Extraction helpers (for tests, not full corpus yet)

Recognize a **pair**, not free English:

1. Caller passes two strings (library API).
2. Optional: parse one markdown **example block** (blockquote: backticked Agalan line, then roman morph line with ` | ` or a single `PoS-…` / prefix-less reviser token, then optional `"quoted"` free English — **ignore** the quoted line).

Skip blocks with Agalan but **no** morph line (intentional omit when morph would copy the quote).

Do **not** treat italic after a code span, table **English** / **Gloss** / **Cue**, or `*Azawan*` as morph.

### Tests (phase 2 gate)

- Equal pair → pass.
- Sense mismatch (`z-microphone` vs `z-speaker`) → fail with expected/actual.
- Unparseable Agalan → fail as parse, not as gloss mismatch.
- Example-block fixture from glosses.md (the `jael zugobon zam …` block) round-trips.

No `docs/grammar/` walk yet.

---

## Phase 3 — Lint the grammar corpus

Walk `docs/grammar/` (same tree as `lint-agalan-docs.ts`), find morph pairs, compare, report `file:line`.

Parse every extracted Agalan line with **`parse(text, tables, { checkAmbiguity: true })`** — the same switch as `npm run parse -- --check-ambiguity` (`collectAmbiguity` in `src/parse/ambiguity.ts`). Use that result plus the morph-gloss compare; do not invent a second ambiguity detector.

### How to treat a mismatch or conflict

| Finding | Action |
|---------|--------|
| Parser bug (wrong first-match, classify miss, serializer not following glosses.md, inspect resume wrong when the grammar is clear) | **Fix the parser / serializer.** Do not patch the grammar page around the bug. |
| Documented morph line drifted from a unique legal parse | **Fix the grammar page** (retie the morph line). That is a teaching typo, not a language bug. |
| **`--check-ambiguity` conflict** or two legal readings with no grammar rule that picks a winner | **Do not guess in the parser.** Append the row to the **repo-root report** and **fail CI**. Same if two grammar pages contradict each other, or a form is underdetermined (`hal` listed vs bare). Segmented vs fused `x` gloss is **not** this bucket: serializer always hyphenates; retie docs. **-r** is **not** this bucket. |
| Unparseable / unknown root | Existing Agalan-word lint; not a gloss mismatch and not an ambiguity report row unless classify reports leftover hits. |

**Ambiguity report** (phase 3 deliverable): repo-root Markdown (e.g. `morph-gloss-ambiguity-report.md`). Every leftover `ambiguity[]` hit and every fundamental grammar-doc contradiction: surface, `file:line`, `morph` vs `classify` stage, competing sources, why the grammar does not name a winner. The report is for editors; it does **not** green CI. Non-empty `ambiguity[]` on a scanned line **fails CI**. Parser first-match that *does* have a documented winner is a parser bug, not a report row.

### What to scan

**In v1**

- Example **blockquotes** that match glosses.md layout (Agalan in backticks; next non-empty line is morph; quoted free English ignored).
- Tables with an explicit **Morph** column plus an Agalan example column (join cells with ` | ` if the cell uses ` · ` as a table fallback — glosses.md allows ` ; ` / middot in tables; **normalize documented table separators to ` | `** before compare, or accept ` · ` as equivalent **only** inside table cells).

**Out of v1**

- Free-English **Gloss** columns
- Vocab **English · Agalan** drill tables
- Inline `` `word` *gloss* ``
- `docs/meta/glosses.md` itself may be included as a golden file or skipped if examples mix “Not” column anti-patterns — prefer **include** the “Morph gloss” column of positive tables only

### Wiring

Extend `lintAgalanMarkdown` / `scripts/lint-agalan-docs.ts` (or a sibling `lintMorphGloss`) so corpus gloss compare always calls `parse` with **`{ checkAmbiguity: true }`**. Expose the same **`--check-ambiguity`** flag as `src/parse/cli.ts` on the lint entry (explicit on; corpus lint in CI always on). **CI fails** on morph-line mismatch, parse/unknown-root (existing), and any leftover `ambiguity[]`. Regenerating the root report does not skip those failures.

Report:

```
docs/grammar/foo.md:123  morph gloss mismatch
  agalan: `zazawan godogol.`
  documented: z-Azawan | g-hound
  parser:     z-Azawan | g-dog
```

Parse failures on the Agalan line stay the existing “does not parse / unknown root” issues; do not double-report as gloss mismatch.

### Rollout

1. Dry-run the corpus with `--check-ambiguity`: gloss mismatches, parse failures, and `ambiguity[]` rows.
2. Fix **parser / serializer** bugs; retie **typo** morph lines (including fused `x` names → hyphenated segments).
3. Dump leftover language / docs contradictions into **`morph-gloss-ambiguity-report.md`** at repo root.
4. CI **on**: fail on gloss mismatch, parse issues, and any `--check-ambiguity` hit. Green only after parser bugs and language ambiguities are actually resolved (report may still exist as an empty/historical file).

### Non-goals for phase 3

- Auto-rewriting grammar markdown in the linter
- Requiring a morph line on every example (omit-when-redundant stays)
- Comparing free English to the parser
- Resolving a documented language ambiguity by picking a silent parser winner

---

## Order and dependencies

```
Phase 1 serializer + glosses.md fixtures
    → Phase 2 compare API + example-block parse
        → Phase 3 corpus extract + CI
```

Phase 1 can land without lint. Overlay keeps `glossFor` chips, aligned to serializer labels. Phase 3 must not start until phase 1 fixtures from glosses.md are green (retie fused-name rows in that file to hyphenated segments if they disagree).

## Success

1. Every positive morph example in glosses.md is regenerated identically by the parser.
2. `compareMorphGloss` is the only equality rule.
3. `docs/grammar/` example-block (and Morph-column) pairs fail CI on gloss mismatch.
4. Any `--check-ambiguity` leftover fails CI; the same rows are written to repo-root `morph-gloss-ambiguity-report.md`.
5. Overlay chips still come from `glossFor`, with English matching morph-gloss pieces.
