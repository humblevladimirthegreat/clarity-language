# Expressiveness review plan

Editors only — not linked from grammar pages. Phased plan for a systematic suggestion pass over `docs/grammar/`, answering two questions:

1. **Gaps** — Is there common English grammar that Agazan cannot express easily, and that is not intentionally discouraged?
2. **Extensions** — Could existing grammar be extended into other forms (unused slots, other role letters, other endings, other vowels) with intuitive new readings?

This is a **suggestion** pass for Phases 1 and 3: output is a findings ledger plus proposals, not direct edits to grammar pages. Accepted proposals are applied afterwards through the normal grammar-doc workflow ([grammar-docs](../meta/grammar-docs.md), [doc-style](../meta/doc-style.md)).

Status: `[x]` done · `[~]` partial · `[ ]` not started.

## Ground rules

- **Intentionally discouraged ≠ gap.** Before logging a gap, check [why-agazan](../grammar/why-agazan.md) (limits, feature criteria) and the owning page for a deliberate omission (e.g. no general *to-be* `/v/`, no cause-arrow word, no metric prefixes, generics via joins not **-x**). If the omission is deliberate, log it once as **by design** with the citing section, and move on.
- **"Easily" means for the learner.** A gap exists when the only route is long, unnatural, ambiguous, or taught far later than English speakers need it. Dev effort (cross-reference churn, parser work) is not a cost — see `AGENTS.md`.
- **Extensions must be intuitive.** A proposed reading should be guessable from the existing form's meaning (same vowel series, same role-letter semantics, same ending semantics). Reject extensions that merely fill a slot.
- **Check before proposing.** Look up [unassigned-reserved](../meta/unassigned-reserved.md) (free forms), the lexicon CSVs, and [english.md](../grammar/english.md) (existing English → Agazan mappings) so a proposal neither collides with nor duplicates something already published.
- **No proposal-page links.** New design writeups go in `docs/proposals/` per [proposals](../meta/proposals.md); refer to them by filename in backticks.

## Findings ledger

## Phase 3 — Extension sweep (existing grammar, new readings)

Systematically cross every productive mechanism with every place it could plausibly apply, and ask whether the unused combination has an intuitive reading. Mechanisms run in the wave order of their owning page, so foundations settle first. Each grid cell belongs to exactly one mechanism (the ownership table is in [extension-results](../meta/extension-results.md#how-to-read-this-file)), so no cell is logged twice. The recipe track (`english.md`, `say-*.md`) adds no forms and has no grid.

For each mechanism, build its applicability grid and inspect the empty cells:

| Status | Wave | Mechanism | Owning pages | Axes to cross |
|--------|------|-----------|--------------|---------------|
| [x] | 0 | Word endings (pilot) | [word-endings](../grammar/word-endings.md) and each family's page | **-l / -m / -n / -r** × closed content roots (overlay moods, clause poles, relations, identity), `/y/` act and polar series, linkers, special pronouns |
| [ ] | 0 | Role-letter structure | [clause](../grammar/clause.md) | lean **`l`** (`gl-`) × other role letters; `/w/` × hosts beyond `/ɡ/` `/h/` `/th/`; hosted `/b/` × other hosts |
| [ ] | 1 | Numbers | [numbers](../grammar/numbers.md), [numbers-applied](../grammar/numbers-applied.md), [numeric-derivation](../grammar/numeric-derivation.md) | digitless and exponent forms × role letters not yet assigned; number endings × roles; stance numbers × other stances |
| [ ] | 1 | Resume and special pronouns | [pronouns](../grammar/pronouns.md) | **-r** resume × hosts (closed roots, compounds, joins); special pronouns × roles |
| [ ] | 1 | Plurality | [plurality](../grammar/plurality.md) | **-x** on hosts where it is currently unused |
| [ ] | 1 | Vowel series | [speech-moves](../grammar/speech-moves.md) | **a / o / e / u** (add / one / order / undo) and stacked pairs × every family that uses the series (acts, polar, joins, hooks, restrictors, sake vowels, ability vowels, stand-ins) — any family using only part of it? |
| [ ] | 1 | Tone marks | [speech-moves](../grammar/speech-moves.md#tone-marks) | tone marks × scopes and positions not yet defined |
| [ ] | 2 | Joins and restrictors | [joins](../grammar/joins.md), [restrictors](../grammar/restrictors.md) | set / rank vowels × endings × arity × role letters |
| [ ] | 2 | Hooks | [hooks](../grammar/hooks.md) | hook vowel × ending × use (in-clause, discourse, extra-noun, point-back, span) |
| [ ] | 2 | Spans | [spans](../grammar/spans.md) | TYPE × EDGE × ending |
| [ ] | 3 | Join series on other roles | [join-across-roles](../grammar/join-across-roles.md) | stance joins, join-act verbs, join-relations × vowel and ending |
| [ ] | 3 | Hosted relations and bars | [relations](../grammar/relations.md), [comparatives](../grammar/comparatives.md) | each relation × host role (`/ɡ/` `/h/` `/th/` `/w/`); stance bars × other moods |
| [ ] | 4 | Questions | [questions](../grammar/questions.md) | fill-ask × roles and families; polar stance × turn positions |
| [ ] | 4 | Stand-ins | [dependents](../grammar/dependents.md) | stand-in vowel × **-rl / -rm / -rth / -rn** × role letter |
| [ ] | 4 | Predication | [predication](../grammar/predication.md) | classification and identity × roles and endings |
| [ ] | 4 | Mid-word `x` and `th`, role compounds | [x-compounds](../grammar/x-compounds.md), [roles](../grammar/roles.md) | `x` / `th` families × left-hand types not yet allowed; role compounds × role letters |
| [ ] | 5 | Mood roots × role letters | [knowing](../grammar/knowing.md), [causation](../grammar/causation.md), [intention](../grammar/intention.md) | each overlay kind × `/z/` `/d/` `/b/` `/v/` `/ɡ/` `/w/` `/h/` `/th/` (stance vs noun vs adverb readings) |
| [ ] | 5 | Sakes | [sakes](../grammar/sakes.md) | sake vowel (`tha` / `the` / `tho` / `thu`) × ending table × role; emotion compose slots |
| [ ] | 6 | Cross-link pass | — | no new grid: link each extension to the gaps it closes; merge duplicates across grids |

For each empty cell, record one of:

- **intuitive** — a learner who knows the mechanism and the family could guess the reading without being told, and no design decision rules it out → extension candidate (`E-nn`).
- **intuitive but redundant** — intuitive, but an existing route already says it → log as `E-nn`, noting whether the new form would still improve on that route.
- **forced** — a reading exists but must be taught as a new rule, or a different already-live reading is just as guessable → log as `E-nn` with verdict **forced**.
- **none** — leave unused; mark in [unassigned-reserved](../meta/unassigned-reserved.md) if not already listed.

**Batches.** A batch is one wave's grids (or a smaller slice of one). Rows within a batch are resolved before the next batch starts, so later grids build on settled forms:

1. Build the batch's grids and log `E-nn` / `C-nn` rows in [extension-results](../meta/extension-results.md). Do not edit grammar pages while logging.
2. The language owner rules on every row: adopt, decline, or fix (for `C-nn`).
3. Apply each adopted row and fix in the same pass, following Phase 5's steps: owning grammar page, parser and tests, lexicon CSVs, translation checkpoints, [unassigned-reserved](../meta/unassigned-reserved.md), and [design-decisions](../meta/design-decisions.md) for settled limits. Run `npm run build` and `npm test`.
4. Mark each row's outcome in the results file, then start the next batch.

Every candidate spelling is checked with `node scripts/parse.mjs --check-lexicon` when it is logged, and in context for a competing reading (such as a content resume), so collisions show up before the ruling. Inconsistencies in the existing grammar found while building a grid are logged as `C-nn` rows in the same file.

**Exit:** every grid inspected and every batch's rows resolved. Cross-link each adopted extension to any gap it closes.

## Phase 4 — Triage and proposals

- [ ] Merge duplicates (Phase 1 rows, any Phase 3 row deferred at its batch ruling, plus any open Phase 2 row); link gaps to extensions that close them (preferring extensions over new forms).
- [ ] Rank by priority, then by how many ledger rows one proposal closes.
- [ ] For each P1 item and any multi-row extension, write a short proposal in `docs/proposals/` (current route, proposed form, examples with morph glosses, interaction with existing forms, learning level per [learning-levels](../meta/learning-levels.md)).
- [ ] Present proposals to the language owner in batches with a recommendation each; record decisions (accepted / rejected / by design) in the ledger.

**Exit:** every **awkward** / **missing** row is either answered with a proposal decision or deferred with a reason.

## Phase 5 — Apply accepted proposals

- [ ] Apply each accepted proposal to its owning grammar page only (one agent per page), following [grammar-docs](../meta/grammar-docs.md) and [doc-style](../meta/doc-style.md).
- [ ] Update lexicon / overlay CSVs and the parser where the proposal adds forms; add parser tests.
- [ ] Update [english.md](../grammar/english.md) with new English → Agazan mappings.
- [ ] Remove used slots from [unassigned-reserved](../meta/unassigned-reserved.md).
- [ ] Add each accepted and rejected decision to [design-decisions](../meta/design-decisions.md) so it is not re-raised.
- [ ] Add translation checkpoints for new beginner / intermediate features per [drill-generation](../meta/drill-generation.md).
- [ ] Run `npm run build` and `npm test`.

**Exit:** build and tests clean; ledger rows marked **covered**.

## Progress

| Phase | Status | Date |
|-------|--------|------|
| 0 — Setup | [x] | 2026-09-25 |
| 1 — English coverage checklist | [x] | 2026-09-25 |
| 2 — Real-text sampling | [~] | 2026-10-01 |
| 3 — Extension sweep | [~] | 2026-10-02 |
| 4 — Triage and proposals | [ ] | |
| 5 — Apply | [ ] | |
