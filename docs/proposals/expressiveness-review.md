# Expressiveness review plan

Editors only — not linked from grammar pages. Phased plan for a systematic suggestion pass over `docs/grammar/`, answering two questions:

1. **Gaps** — Is there common English grammar that Agazan cannot express easily, and that is not intentionally discouraged?
2. **Extensions** — Could existing grammar be extended into other forms (unused slots, other role letters, other endings, other vowels) with intuitive new readings?

Work runs in **batches**, and each batch is reviewed and applied before the next one starts (see [Batch loop](#batch-loop)). There is no separate triage phase and no separate apply phase: a batch's rows are logged, ruled on, and applied through the normal grammar-doc workflow ([grammar-docs](../meta/grammar-docs.md), [doc-style](../meta/doc-style.md)) before the next batch builds its grids on the settled forms.

Status: `[x]` done · `[~]` partial · `[ ]` not started.

## Ground rules

- **Intentionally discouraged ≠ gap.** Before logging a gap, check [why-agazan](../grammar/why-agazan.md) (limits, feature criteria) and the owning page for a deliberate omission (e.g. no general *to-be* `/v/`, no cause-arrow word, no metric prefixes, generics via joins not **-x**). If the omission is deliberate, log it once as **by design** with the citing section, and move on.
- **"Easily" means for the learner.** A gap exists when the only route is long, unnatural, ambiguous, or taught far later than English speakers need it. Dev effort (cross-reference churn, parser work) is not a cost — see `AGENTS.md`.
- **Extensions must be intuitive.** A proposed reading should be guessable from the existing form's meaning (same vowel series, same role-letter semantics, same ending semantics). Reject extensions that merely fill a slot.
- **Check before proposing.** Look up [unassigned-reserved](../meta/unassigned-reserved.md) (free forms), the lexicon CSVs, and [english.md](../grammar/english.md) (existing English → Agazan mappings) so a proposal neither collides with nor duplicates something already published.
- **Re-check against the current docs.** The grammar has moved since the pilot batch: resume is whole-stem only (no short prefix resume), `/x/` content words set a [topic](../grammar/pronouns.md#topic), and the pronoun page now also owns role pointers, ordinal, generic (`oben`) and topic (`ozan`) pronouns, with D-17 to D-21 in [design-decisions](../meta/design-decisions.md). Read the owning page, not an older grid, before ruling a cell empty. Roots have also been respelled (`retie-docs`), so re-run `node scripts/parse.mjs --check-lexicon` on any spelling copied from the results file.
- **No proposal-page links.** New design writeups go in `docs/proposals/` per [proposals](../meta/proposals.md); refer to them by filename in backticks.

## Batch loop

A batch is one wave's grids (or a smaller slice of one), and a wave holds one or two mechanisms. The same loop applies to every batch, whether its rows are extensions (`E-nn`), inconsistencies (`C-nn`), or gaps carried over from Phases 1 and 2. Rows are logged in [extension-results](../meta/extension-results.md).

1. **Build and log.** Build the batch's grids and log each row. Check every candidate spelling with `node scripts/parse.mjs --check-lexicon`, and in context for a competing reading (such as a content resume). Do not edit grammar pages while logging.
2. **Triage.** Within the batch only: merge duplicate rows, link each gap to an extension that closes it (prefer extensions over new forms), and rank by priority, then by how many rows one change closes. For each P1 row, and any multi-row extension, write a short proposal in `docs/proposals/` first (current route, proposed form, examples with morph glosses, interaction with existing forms, learning level per [learning-levels](../meta/learning-levels.md)).
3. **Rule.** The language owner rules on every row: adopt, decline, defer (with a reason), or fix (for `C-nn`). Present rows with a recommendation each.
4. **Apply.** Apply every adopted row and fix in the same pass, before the next batch:
   - the owning grammar page only, per [grammar-docs](../meta/grammar-docs.md) and [doc-style](../meta/doc-style.md) (a stage page never links the recipe track);
   - the parser, lexicon / overlay CSVs and tests where a form is added or reads differently, in the same change as the grammar edit;
   - [english.md](../grammar/english.md) for new English → Agazan mappings;
   - translation checkpoints for new beginner / intermediate features ([drill-generation](../meta/drill-generation.md));
   - [unassigned-reserved](../meta/unassigned-reserved.md) (remove used slots, add confirmed *none* cells) and [design-decisions](../meta/design-decisions.md) (accepted and declined readings, so they are not re-raised).
   - Run `npm run build` and `npm test`.
5. **Close the batch.** Record each row's outcome in the results file, then start the next batch.

New roots come from `npm run convert-word`, never by hand ([lexicon](../meta/lexicon.md)).

## Findings ledger

Phase 1 and 2 gap rows were folded into the grammar and [design-decisions](../meta/design-decisions.md) as they were ruled. Any still open are carried into the batch whose mechanism owns them. Phase 3 rows live in [extension-results](../meta/extension-results.md).

## Phase 3 — Extension sweep (existing grammar, new readings)

Systematically cross every productive mechanism with every place it could plausibly apply, and ask whether the unused combination has an intuitive reading. Waves run in dependency order so foundations settle first: the **Needs** column lists the earlier waves whose settled forms a wave builds on, so check it before reordering. Each wave is one or two mechanisms; if a wave's grids come out larger than about ten rows, split it again and renumber. Each grid cell belongs to exactly one mechanism (the ownership table is in [extension-results](../meta/extension-results.md#how-to-read-this-file)), so no cell is logged twice. The recipe track (`english.md`, `say-*.md`) adds no forms and has no grid.

For each mechanism, build its applicability grid and inspect the empty cells:

| Status | Wave | Mechanism | Owning pages | Needs | Axes to cross |
|--------|------|-----------|--------------|-------|---------------|
| [x] | 0 | Word endings (pilot) | [word-endings](../grammar/word-endings.md) and each family's page | — | **-l / -m / -n / -r** × closed content roots (overlay moods, clause poles, relations, identity), `/y/` act and polar series, linkers, special pronouns |
| [x] | 0 | Role-letter structure | [clause](../grammar/clause.md) | — | lean **`l`** (`gl-`) × other role letters; `/w/` × hosts beyond `/ɡ/` `/h/` `/th/`; hosted `/b/` × other hosts; first-position highlight vs the discourse [topic](../grammar/pronouns.md#topic) |
| [ ] | 1 | Vowel series | [speech-moves](../grammar/speech-moves.md) | 0 | **a / o / e / u** (add / one / order / undo) and stacked pairs × every family that uses the series (acts, polar, joins, hooks, restrictors, sake vowels, ability vowels, stand-ins) — any family using only part of it? |
| [ ] | 1 | Tone marks | [speech-moves](../grammar/speech-moves.md#tone-marks) | 0 | tone marks × scopes and positions not yet defined |
| [ ] | 2 | Pronouns | [pronouns](../grammar/pronouns.md), [roles](../grammar/roles.md#role-pointers-family) | 0 | whole-stem **-r** resume × hosts (closed roots, compounds, joins); [role pointers](../grammar/pronouns.md#role-pointers) (`zaxar` / `zaxor` / `zaxer`, stacked pointers) × role letters, role vowels and pointer vowels (`v` `ɡ` `h` `w` are undefined); ordinal (`z=#n`) × roles and `#0`; generic `oben` and topic `ozan` × roles, **-x** and holder seams; special pronouns × roles. Several cells are now **def**; inspect only what remains empty |
| [ ] | 2 | Plurality | [plurality](../grammar/plurality.md) | 0 | **-x** on hosts where it is currently unused (now defined on role pointers and `/x/` topic nouns, not on `oben` or the linkers) |
| [ ] | 3 | Numbers | [numbers](../grammar/numbers.md), [numbers-applied](../grammar/numbers-applied.md), [numeric-derivation](../grammar/numeric-derivation.md) | 0 | digitless and exponent forms × role letters not yet assigned; number endings × roles; stance numbers × other stances |
| [ ] | 4 | Joins and restrictors | [joins](../grammar/joins.md), [restrictors](../grammar/restrictors.md) | 1 | set / rank vowels × endings × arity × role letters |
| [ ] | 5 | Hooks | [hooks](../grammar/hooks.md) | 1, 4 | hook vowel × ending × use (in-clause, discourse, extra-noun, point-back, span) |
| [ ] | 6 | Spans | [spans](../grammar/spans.md) | 2, 5 | TYPE × EDGE × ending; topic and ordinal scope inside cites and asides |
| [ ] | 7 | Join series on other roles | [join-across-roles](../grammar/join-across-roles.md) | 4 | stance joins, join-act verbs, join-relations × vowel and ending |
| [ ] | 8 | Hosted relations and bars | [relations](../grammar/relations.md), [comparatives](../grammar/comparatives.md) | 4, 5 | each relation × host role (`/ɡ/` `/h/` `/th/` `/w/`); stance bars × other moods |
| [ ] | 9 | Questions | [questions](../grammar/questions.md) | 1 | fill-ask × roles and families; polar stance × turn positions |
| [ ] | 10 | Stand-ins and `/x/` words | [dependents](../grammar/dependents.md) | 2, 4, 5 | stand-in vowel × **-rl / -rm / -rth / -rn** × role letter; `/x/` linkers vs topic words × endings and positions (never in a dependent, after a clause join, or in an aside) |
| [ ] | 11 | Predication | [predication](../grammar/predication.md) | 0 | classification and identity × roles and endings |
| [ ] | 12 | Mid-word `x` and `th`, role compounds | [x-compounds](../grammar/x-compounds.md), [roles](../grammar/roles.md) | 1, 2 | `x` / `th` families × left-hand types not yet allowed; role compounds × role letters |
| [ ] | 13 | Mood roots × role letters | [knowing](../grammar/knowing.md), [causation](../grammar/causation.md), [intention](../grammar/intention.md) | 0 | each overlay kind × `/z/` `/d/` `/b/` `/v/` `/ɡ/` `/w/` `/h/` `/th/` (stance vs noun vs adverb readings) |
| [ ] | 14 | Sakes | [sakes](../grammar/sakes.md) | 12, 13 | sake vowel (`tha` / `the` / `tho` / `thu`) × ending table × role; emotion compose slots |

For each empty cell, record one of:

- **intuitive** — a learner who knows the mechanism and the family could guess the reading without being told, and no design decision rules it out → extension candidate (`E-nn`).
- **intuitive but redundant** — intuitive, but an existing route already says it → log as `E-nn`, noting whether the new form would still improve on that route.
- **forced** — a reading exists but must be taught as a new rule, or a different already-live reading is just as guessable → log as `E-nn` with verdict **forced**.
- **none** — leave unused; mark in [unassigned-reserved](../meta/unassigned-reserved.md) if not already listed.

Each batch follows the [Batch loop](#batch-loop). Inconsistencies in the existing grammar found while building a grid are logged as `C-nn` rows in the same file and ruled in the same batch.

**Exit:** every grid inspected and every batch's rows ruled and applied.

## Phase 4 — Close-out

No new triage or application happens here; both happen per batch. This phase only checks that nothing was left behind.

- [ ] Revisit rows deferred at a batch ruling and any open Phase 2 row; each is now ruled and applied, or recorded as deferred with a reason.
- [ ] Cross-check across batches: duplicate rows that slipped through, and extensions that later batches made redundant or contradictory.
- [ ] Confirm every **awkward** / **missing** row is **covered**, **by design**, or deferred with a reason.
- [ ] Run `npm run build` and `npm test` on the final tree.

**Exit:** build and tests clean; the results file has no row without an outcome.

## Progress

| Phase | Status | Date |
|-------|--------|------|
| 0 — Setup | [x] | 2026-09-25 |
| 1 — English coverage checklist | [x] | 2026-09-25 |
| 2 — Real-text sampling | [~] | 2026-10-01 |
| 3 — Extension sweep (triage and apply per batch) | [~] | 2026-10-02 |
| 4 — Close-out | [ ] | |
