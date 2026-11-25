# Reading realizer

**Status:** IN PROGRESS (2026-11-25), phase 1 under way. `reader-solver-boundary.md` is landed in the tree (party, holderHost, `we`, NOTIONAL link). D1 settled 2026-11-21: equal readings move onto the meaning view (U20).  
**Related:** [interpreter.md](../../meta/interpreter.md) ([terms](../../meta/interpreter.md#terms), [reader rules](../../meta/interpreter.md#reader-rules), [parse or reading](../../meta/interpreter.md#parse-or-reading), [equal readings](../../meta/interpreter.md#equal-readings), [classification table](../../meta/interpreter.md#classification-table), [pair table](../../meta/interpreter.md#pair-table)), [glosses.md](../../meta/glosses.md#round-trip), [read-ageben.md](../../meta/procedures/read-ageben.md), [`types.ts`](../../../src/interpret/types.ts), [`read.ts`](../../../src/interpret/read.ts), [`equal.ts`](../../../src/interpret/equal.ts), [`reply.ts`](../../../src/interpret/reply.ts), [`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts), [`llm-examples.ts`](../../../src/parse/llm-examples.ts), [`rewrite.ts`](../../../src/find/rewrite.ts), [`sweep.test.ts`](../../../src/interpret/sweep.test.ts), [`scripts/sweep.ts`](../../../scripts/sweep.ts)  
**Depends on:** `reader-solver-boundary.md`  
**Design authority:** *none*. No form or reading changes. The reader gains fields only where the owning grammar section already states the meaning, and `equal.ts` gains a rule only where a grammar section states that two forms mean the same. A meaning the grammar leaves open is logged, never settled here.

## Problem

The checks on the reader are structural. Every construction id has a row, every word lands in exactly one place ([`coverage.ts`](../../../src/interpret/coverage.ts), ratchet at 0 / 0), and the solver accounting checks that each part is used. None of them shows that a reading keeps every distinction the grammar makes. A word can be placed while its ending, its series vowel or its reach is dropped from the reading, and nothing notices until a tool built on the reader gives a wrong answer.

Tools are about to be built on the reader. Each one that finds a gap is tempted to read the spelling itself, which [parse or reading](../../meta/interpreter.md#parse-or-reading) forbids. A check that proves the reading is complete is needed before they are built. Producing Ageben from meaning is also something several of those tools need: replies, solver output, canonical forms for learners, drill generation.

## Goals

- A **meaning view**: a projection of readings with no word pointers, no construction ids and no spellings beyond declared identities. It defines what a reading means.
- A **realizer** that turns a meaning view into a morph gloss, then into Ageben through `glossToAgeben`, with one canonical text per reading.
- A **round trip** over every doc example: read, project, realize, read again, judged by `sameReadings` against the original. It runs in `npm test` with a ratchet, and `npm run round-trip` counts it the way `npm run sweep` counts the solver.
- A **variant corpus**: doc examples with one letter slot changed (series, form, marker, scope, answer, stance, pointer, locus), so each value a slot can take is tried, not only the ones the docs happen to use.
- Every round-trip failure ends in one of three places: fixed in the reader, a stated equivalence in `equal.ts`, or a logged grammar gap.
- A meta note, `docs/meta/realizer.md`, owns the meaning view, the canonical choices, the round trip and the gap log.

## Non-goals

- Parser changes. If a round trip needs one, the unit stops and reports.
- Settling a meaning the grammar leaves open. Such a gap is logged with a recommendation and skipped.
- Style options (word order variants, pronoun or name, spelled or numeric). The realizer writes one canonical text. Options are a later proposal.
- Moving `reply.ts`, the solver or the wizard onto the realizer. They can switch once it is complete; each switch is its own change.
- Showing the realizer on the site.
- The other completeness checks discussed with this one: grammar-anchor coverage, a generated family-by-position grid, self-entailment over the corpus, and a lint on spelling tests in consumers. Each can be its own idea; this plan does not depend on them.

## Findings

**F1. Morph gloss to Ageben exists and checks itself.** [`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts) spells a morph gloss and keeps only a line whose gloss matches the input again. Glosses are one-to-one with Ageben ([round trip](../../meta/glosses.md#round-trip)) and name roots by concrete sense, so a realizer that writes glosses never spells a root and survives a respelling.

**F2. Replies already go through it, but read words.** [`reply.ts`](../../../src/interpret/reply.ts) builds each line as a gloss draft, spells it and parses it (`spell`, `checkLine`). Its leaves are glossed from parsed words with `morphGlossFor`. The realizer takes the same spelling path but may not gloss a parsed word: that would copy the form and prove nothing.

**F3. `sameReadings` is a strong judge.** [Equal readings](../../meta/interpreter.md#equal-readings) drops positions, compares details as multisets, treats an omitted act word as the statement act, compares pronouns by referent, and compares every other word by raw spelling. So when the realizer picks a different word than the original because the meaning view lacked something, the raw spellings differ and the verdict is `different`. Differences that are only form are already excused by the listed rules. A new excuse is a new rule there, and needs a grammar sentence behind it.

**F4. Readings carry meaning partly in words.** `Frame`, `Detail`, `Link` and `Term` keep `LexWord`s (reader rule 5), and `values` holds only some of a word's typed fields. Where meaning lives only in a word's spelling, the realizer cannot choose it from the meaning view. Each such place is a reader gap. `reader-solver-boundary.md` closes the ones the solver hit (link values, *we*, holder and say parties, the NOTIONAL link); the round trip finds the rest.

**F5. Identities are spellings by design.** A thing term's `root`, a name, a literal payload and a number stem are identities, not choices (`reader-solver-boundary.md` says the same of the range hook's spelling). The meaning view keeps them: a root as its lexicon row's concrete sense, the others as they are.

**F6. The corpus and the tools to vary it exist.** `buildExampleIndex` gives every doc example with its gloss and source (more than 500; `sweep.test.ts` asserts it). [`rewrite.ts`](../../../src/find/rewrite.ts) swaps letter slots in a parsed word for `find.mjs --map`, over the fields `series`, `form`, `marker`, `scope`, `answer`, `stance`, `pointer` and `locus`. [`scripts/sweep.ts`](../../../scripts/sweep.ts) and `scripts/lib/sweep.ts` have the `--save`, `--diff` and `--texts` pattern.

## Design

### The meaning view

`src/realize/meaning.ts` exports the `Meaning*` types and `project(readings): MeaningReading[]`.

- **Kept:** reading structure (claim, roles by letter, predicate, details, frames, stance lists, links as reading-id targets, nested readings); each frame's `family` and `key`; each detail's `kind` and `key`; each term's `kind`; every `values` map; `party`, `hosted`, `content`, `inner`, `occasions`, `member`, `holderHost`; `order` and `unordered` as indices into the frames, with each `unordered` pair in text order (rule 3: the order of an unsettled pair is kept, never chosen); pronoun binds as the bind's kind and its antecedent's meaning-view term; the identities of F5.
- **Dropped:** every `LexWord`, `construction`, `anchor`, `at`, reading `source`, and the `unread` list (a reading with `unread` is skipped by the round trip, with that reason).
- No `Meaning*` type mentions `LexWord`, and a test walks the projection of every doc example and fails on any object with a `raw` field.

`src/realize/` may import only `meaning.ts`'s inputs (`src/interpret/types.ts` as types, `src/interpret/read.ts`), lexicon tables, and the spelling path (`gloss-inverse.ts`, `reply.ts`'s `spell` and `checkLine`). A test reads the imports of every file under `src/realize/` other than `meaning.ts` and fails on anything else. In those files, `meaning.ts` is the only door to a reading. Widening the allowlist is a [weaker check](../../meta/procedures/proposals.md#decision-classes).

### The realizer

`realize(view, tables): Realized`, where `Realized` is `{ gloss, ageben }` or `{ gap }`. It writes a morph gloss per [morph gloss format](../../meta/glosses.md#round-trip), spells it with `spell`, and returns a gap when the line does not spell or does not parse to one tree.

- **Per family.** One file per area (`claim.ts`, `terms.ts`, `lists.ts`, `details.ts`, `frames-*.ts`, `discourse.ts`), switching on `key`, never on a spelling. Files keep to [code layout](../../meta/code-layout.md).
- **Canonical choices.** Wherever the grammar allows several forms with the same meaning, the realizer takes one: the default order of [clause.md](../../grammar/beginner/clause.md), an omissible `yal` left out, the [preferred number writing](../../grammar/intermediate/number-markers.md#writing-style-numeric-vs-spelled), and so on. Each choice is a row in `realizer.md` with the anchor that allows it. A choice must give a text that `sameReadings` finds the same as the original; if none does, it is a gap.
- **Frame placement.** Whole-clause frames go where the [scope statements](../../meta/interpreter.md#scope-statements) put them for the recorded `order`. A commuting pair takes a canonical order. An `unordered` pair keeps its text order.
- **Gaps.** `{ gap: { kind, key, detail } }`, with `kind` one of `noRule` (the realizer has no rule for this key yet), `missingValue` (the meaning view lacks what is needed to choose a word: a reader gap), `noSpell` and `noParse`.

### The round trip

`src/realize/round-trip.ts` walks the corpus. Each example is parsed and read as one log of turns (`buildLog`, so links and pronouns cross sentences). Every reading is projected and realized, the realized sentences are joined in order, and the result is judged:

| Verdict | Means |
|---------|-------|
| `ok` | `sameReadings(original, realized)` is `same`, and realizing the realized text again gives the same gloss (idempotence) |
| `different` | `sameReadings` says `different`; the first differing path is kept |
| `unsettled` | `sameReadings` says `unsettled` |
| `gap:<kind>` | the realizer returned a gap |
| `skipped:<reason>` | the original does not parse, or has an `unread` entry |

`src/realize/round-trip.test.ts` holds the ratchet (`round-trip-ratchet.json`): the `ok` count does not fall, and a key with no failures does not gain one. When counts improve, the unit lowers the file. `npm run round-trip` prints counts by verdict and key. `--save` and `--diff` work as in `npm run sweep`, and `--texts KEY …` lists the examples behind a key. `--variants` runs the variant corpus.

### Triage of a failure

1. **`missingValue`, or `different` where the realizer chose wrongly because the view lacked something.** If the owning grammar section states the meaning and the word's typed fields hold it, the reader copies it into `values` (or `party`, `hosted`) and `interpreter.md` gains a sentence on it. If it needs a new term kind, link kind or reading field, the unit logs it for that phase's reader-gap unit.
2. **`different` where both texts mean the same.** If the owning section says the two forms mean the same, `equal.ts` gains a rule under [equal readings](../../meta/interpreter.md#equal-readings), citing that sentence. If the page is silent, it is a grammar gap: logged in `realizer.md` under *Gaps* with a recommendation, never resolved by the unit.
3. **`different` that is a realizer bug.** Fixed in the realizer.
4. **`unsettled`.** Already a grammar backlog item (rule 3). Counted, not fixed.

### The variant corpus

`src/realize/variants.ts` builds variants of each doc example from the `rewrite.ts` letter-slot maps: for each word and each field, every other value of that field. It keeps the variants that parse with no `unread` entry, dedupes by gloss, and caps the number per example so the run stays inside the test budget (`realizer.md` states the cap). The round trip runs on them with their own ratchet. A variant that reads the same as its original but has a different gloss is a lost distinction or an unstated equivalence, and is triaged as above.

## Implementation plan

Four phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Phase 1 builds the meaning view, the harness and the bare clause, so later units are briefed from measured counts. Phase 2 covers terms and details, which frames host. Phase 3 covers the frame families. Phase 4 covers nesting, discourse and the variant corpus. Each later phase reads a different set of grammar pages, and each starts from the round-trip counts the one before it leaves.

**Gates.** At the start of each phase the orchestrator saves `npm run verify -- --baseline` and `npm run round-trip -- --save`. Each unit ends with `npm run verify` and passes before its commit. The ratchet is in `npm test`, so `verify` covers it. At each phase end, `npm run round-trip -- --diff` shows no key that got worse. The proposal touches no prose under `docs/grammar/`, so it has no style gate and no recall gate. The final gate is a full `npm run verify` against an empty baseline at the end of phase 4.

**Reader-gap units.** Units U3 to U17 fix in place the reader gaps of triage step 1 that need only a copied field. They log the gaps that need a new shape. The reader-gap unit that closes each phase (U8, U14, U19) takes the logged list. If the list is empty, the orchestrator drops that unit. A unit that changes the outcome of `run.test.ts`, `src/game/` tests or a solver golden stops and reports; it does not edit the test.

**Solver goldens.** No unit changes a `src/interpret/fixtures/solve-*.lp` golden. A reader field the solver did not read before changes no golden; if one changes, the unit stops and reports.

### Phase 1: meaning view and the bare clause

**U1. Meaning view.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Write `src/realize/meaning.ts` per [the meaning view](#the-meaning-view): the `Meaning*` types and `project`. Add `src/realize/meaning.test.ts`: the no-`raw` walk over every doc example, a projection test per term kind and per link kind, and the import allowlist test. Create `docs/meta/realizer.md` with the sections *Meaning view* (what is kept and dropped, and why), *Canonical choices* (empty table), *Round trip*, *Variants* and *Gaps*. Add a row for the realizer to the [parse or reading](../../meta/interpreter.md#parse-or-reading) table: it reads readings through the meaning view.  
**May edit:** `src/realize/meaning.ts`, `src/realize/meaning.test.ts`, `docs/meta/realizer.md`, `docs/meta/interpreter.md` (the parse-or-reading table only).

**U2. Round-trip harness.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Write `src/realize/realize.ts` with the `realize` entry point and gap type, returning `noRule` for every key. Write `src/realize/round-trip.ts`, `round-trip.test.ts`, `round-trip-ratchet.json` and `scripts/round-trip.ts` per [the round trip](#the-round-trip), sharing the counting and diff helpers in `scripts/lib/sweep.ts` (extend that file; do not copy it). Add `"round-trip": "tsx scripts/round-trip.ts"` to `package.json`. Write the *Round trip* section of `realizer.md`.  
**May edit:** `src/realize/realize.ts`, `src/realize/round-trip.ts`, `src/realize/round-trip.test.ts`, `src/realize/round-trip-ratchet.json`, `scripts/round-trip.ts`, `scripts/lib/sweep.ts`, `package.json` (one script line), `docs/meta/realizer.md`.

**U3. The bare clause.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize the claim: verb, the `z`, `d` and `b` roles, the predicate, the statement act (omitted where omissible), and `thing`, `speaker`, `listener` and `we` terms, with plain adverb, adjective and degree details. Pages: [clause.md](../../grammar/beginner/clause.md) and the pages it names for adjectives, no subject and degree words; [word-endings.md](../../grammar/beginner/word-endings.md); [proper-names.md](../../grammar/intermediate/proper-names.md). Add each canonical choice to `realizer.md`. Triage failures on these keys per [triage](#triage-of-a-failure). Lower the ratchet.  
**May edit:** `src/realize/*.ts` (not `meaning.ts` beyond adding fields the reader gains), `src/realize/round-trip-ratchet.json`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/types.ts` (fields only), `src/interpret/equal.ts` (stated equivalences only), the matching `*.test.ts` files (new cases only), `docs/meta/realizer.md`, `docs/meta/interpreter.md`.

**U4. Pronouns, numbers, names and literals.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `pronoun` terms (resume, role pointers, special and generic, topic pronoun, tags), `number` terms with their markers, and `literal` terms. Pages: [pronouns.md](../../grammar/beginner/pronouns.md), [resume-sense.md](../../grammar/intermediate/resume-sense.md), [tag-pronouns.md](../../grammar/intermediate/tag-pronouns.md), [topic.md](../../grammar/intermediate/topic.md), [numbers.md](../../grammar/beginner/numbers.md), [number-markers.md](../../grammar/intermediate/number-markers.md). The rest as U3.  
**May edit:** as U3.

### Phase 2: lists, details and word-building

**U5. Lists and joins.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `list` terms: set and rank joins, fences, SHARED, *respectively*, `u` list denial, binders and bound tags, hooked joins. Pages: [joins.md](../../grammar/beginner/joins.md), [list-structure.md](../../grammar/intermediate/list-structure.md), [set-joins.md](../../grammar/intermediate/set-joins.md), [rank-joins.md](../../grammar/intermediate/rank-joins.md), [universals-domains.md](../../grammar/intermediate/universals-domains.md), [hooked-joins.md](../../grammar/advanced/hooked-joins.md). The rest as U3.  
**May edit:** as U3.

**U6. Hooks and relations.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize details from hooks and relations: in-clause and extra-noun hooks, ranges, abstract landmarks, hosted relations, locatives, social ties, *as of*, same-role words. Pages: [hooks.md](../../grammar/beginner/hooks.md), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md), [extra-noun-hooks.md](../../grammar/beginner/extra-noun-hooks.md), [ranges.md](../../grammar/intermediate/ranges.md), [relations.md](../../grammar/beginner/relations.md), [locative-relations.md](../../grammar/intermediate/locative-relations.md). If the unit reaches more than six pages, it stops at relations and reports; the orchestrator starts a fresh unit for the rest. The rest as U3.  
**May edit:** as U3.

**U7. Compounds, role words and comparatives.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize role compounds and role parts, mid-word `x` compounds and hook compounds, numeric prefixes, and comparatives, superlatives, equatives, vague amounts, measures and percent. Pages: [roles.md](../../grammar/beginner/roles.md), [compounds.md](../../grammar/beginner/compounds.md), [hook-compounds.md](../../grammar/advanced/hook-compounds.md), [comparatives.md](../../grammar/beginner/comparatives.md), [measures-and-percent.md](../../grammar/intermediate/measures-and-percent.md). The rest as U3.  
**May edit:** as U3.

**U8. Phase 2 reader gaps.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Make the reader shape changes logged in phases 1 and 2 (new term kinds, link kinds or reading fields), each from its owning grammar section, with its [interpreter.md](../../meta/interpreter.md) entry. Every consumer that switches on the changed kind handles the new one (`equal.ts`, `match.ts`, `reply.ts`, `translate*.ts`, `src/game/host.ts`). Then realize what each change unblocks.  
**May edit:** `src/interpret/types.ts`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/log.ts`, `src/interpret/equal.ts`, `src/interpret/match.ts`, `src/interpret/reply.ts`, `src/interpret/translate*.ts` (kind switches only), `src/game/host.ts` (kind switches only), `src/realize/*.ts`, the matching `*.test.ts` files (new cases only), `src/realize/round-trip-ratchet.json`, `docs/meta/interpreter.md`, `docs/meta/realizer.md`.

### Phase 3: frames

**U9. Force, calls and attitude.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize the `force`, `call` and `attitude` families and polar answers: act words, firm and soft, doubled and stacked acts, questions and fill-ask blanks, vocatives, interjections, speaker attitude, speech manner, tone marks. Pages: [speech-moves.md](../../grammar/beginner/speech-moves.md), [firm-soft.md](../../grammar/beginner/firm-soft.md), [questions.md](../../grammar/beginner/questions.md), [fill-ask-roles.md](../../grammar/intermediate/fill-ask-roles.md), [tone-marks.md](../../grammar/intermediate/tone-marks.md), [speech-manner.md](../../grammar/intermediate/speech-manner.md). The rest as U3.  
**May edit:** as U3.

**U10. Knowing.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize the `stance` and `holder` families and stance lists: MAY, live and memory, channels, dated channels, usually and must, mood on one adjective, holders. Pages: [knowing.md](../../grammar/beginner/knowing.md), [evidentiality.md](../../grammar/intermediate/evidentiality.md), [holder.md](../../grammar/intermediate/holder.md), [dated-channel.md](../../grammar/intermediate/dated-channel.md), [usually-vs-must.md](../../grammar/advanced/usually-vs-must.md), [verb-and-stance-joins.md](../../grammar/intermediate/verb-and-stance-joins.md) (stance joins only). The rest as U3.  
**May edit:** as U3.

**U11. Residue and its neighbors.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `residue`, `phase`, `notional`, `mirative` and `contrary`. Pages: [residue-and-former.md](../../grammar/intermediate/residue-and-former.md), [already-still-yet.md](../../grammar/beginner/already-still-yet.md), [notional.md](../../grammar/intermediate/notional.md), [mirative.md](../../grammar/intermediate/mirative.md), [contrary-to.md](../../grammar/intermediate/contrary-to.md). The rest as U3.  
**May edit:** as U3.

**U12. Hinges and occasions.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `hinge` and `occasion`: *if*, *only if*, *iff*, *because*, fault, CAUSE, the result hinge, restrictors and their occasions, habitual, *again*. Pages: [causation.md](../../grammar/beginner/causation.md), [because-and-iff.md](../../grammar/intermediate/because-and-iff.md), [fault.md](../../grammar/beginner/fault.md), [cause.md](../../grammar/intermediate/cause.md), [restrictors.md](../../grammar/beginner/restrictors.md), [more-occasions.md](../../grammar/intermediate/more-occasions.md). The rest as U3.  
**May edit:** as U3.

**U13. Say words, sakes, bars, intention and ability.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `say`, `sake`, `bar`, `intention` and `ability`. Pages: [permission-consent.md](../../grammar/intermediate/permission-consent.md), [sakes.md](../../grammar/beginner/sakes.md), [for-a-sake.md](../../grammar/intermediate/for-a-sake.md), [bars.md](../../grammar/intermediate/bars.md), [intention.md](../../grammar/beginner/intention.md), [can-and-cant.md](../../grammar/beginner/can-and-cant.md). If the unit reaches more than six pages, it stops after sakes and bars and reports. The rest as U3.  
**May edit:** as U3.

**U14. Frame order and phase 3 reader gaps.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Check frame placement over every pair kind of the [pair table](../../meta/interpreter.md#pair-table): run `npm run round-trip -- --texts` on the examples with two or more whole-clause frames, and fix the placement rules in the realizer. Then make the reader shape changes logged in phase 3, as in U8.  
**May edit:** as U8.

### Phase 4: nesting, discourse and variants

**U15. Dependents, clause joins and spans.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize nested readings: dependents and their hinges, nested dependents, clause joins and clause sequences, scope islands, asides, quotes and their contents, mention spans. Pages: [dependents.md](../../grammar/beginner/dependents.md), [nested-dependents.md](../../grammar/advanced/nested-dependents.md), [clause-sequence.md](../../grammar/beginner/clause-sequence.md), [spans.md](../../grammar/beginner/spans.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [scope-islands.md](../../grammar/intermediate/scope-islands.md). The rest as U3.  
**May edit:** as U3.

**U16. Links across sentences.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize links in multi-sentence examples: sentence linkers, discourse hooks, stand-ins and point-backs, grounds, carried frames, answers and polar replies, topics. Pages: [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md), [discourse-hooks.md](../../grammar/intermediate/discourse-hooks.md), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md), [stand-in-roles.md](../../grammar/advanced/stand-in-roles.md), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward) (carry forward only). The rest as U3.  
**May edit:** as U3.

**U17. Numbers in full.**  
Agent `proposal-worker`, `model: opus`, effort `medium`.  
Realize what U4 left of numbers: number roles, stacked markers, digitless forms and exponents, special values, digit strings and time, initials, rays and named ranges, generations. Pages: [number-roles.md](../../grammar/intermediate/number-roles.md), [stacked-markers.md](../../grammar/advanced/stacked-markers.md), [digitless-exponents.md](../../grammar/intermediate/digitless-exponents.md), [special-values.md](../../grammar/advanced/special-values.md), [digit-strings.md](../../grammar/beginner/digit-strings.md), [open-ranges.md](../../grammar/advanced/open-ranges.md). The rest as U3.  
**May edit:** as U3.

**U18. Variant corpus.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Write `src/realize/variants.ts` per [the variant corpus](#the-variant-corpus), reusing `rewrite.ts`'s slot maps (import them; do not copy them). Add `--variants` to `scripts/round-trip.ts` and a variant ratchet to `round-trip.test.ts`. If the variant run is too slow for `npm test`, it moves behind `npm run round-trip -- --variants` with its ratchet checked there, and `realizer.md` says so. Run it, triage each failure kind per [triage](#triage-of-a-failure), and write the *Variants* section of `realizer.md`.  
**May edit:** `src/realize/variants.ts`, `src/realize/round-trip.ts`, `src/realize/round-trip.test.ts`, `src/realize/round-trip-ratchet.json`, `scripts/round-trip.ts`, and the files U3 may edit.

**U19. Phase 4 reader gaps.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
As U8, for the gaps logged in phase 4 and by the variant run.  
**May edit:** as U8.

**U20. Equal readings on the meaning view (D1).**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
*Precondition:* `npm run round-trip` (doc examples and variants) shows no `different` verdict that is a missing value. If any remain, stop and report; the orchestrator runs another reader-gap unit first. One definition of meaning, used by the realizer and the comparison alike, keeps the two from drifting.  
Rebuild `canonicalReadings` in `equal.ts` on `project`, keeping each listed rule, so two texts compare by meaning view and not by raw spelling. Every existing `equal.test.ts` case keeps its verdict. Run the "same reading" lint over the practice items and report any item whose verdict changes; do not edit the items. Update [equal readings](../../meta/interpreter.md#equal-readings).  
**May edit:** `src/interpret/equal.ts`, `src/interpret/equal.test.ts` (new cases only), `src/realize/meaning.ts`, `docs/meta/interpreter.md`.

**Phase 4 close.** *Orchestrator.* Add a `docs/meta/realizer.md` row to the editor-notes table in `AGENTS.md` (*Owns: meaning view, canonical choices, round trip, variants, realizer gaps*). Run a full `npm run verify` against an empty baseline. Report the final round-trip counts and the *Gaps* list to the user. Then move this file per [folder and links](../../meta/procedures/proposals.md#folder-and-links) once `realizer.md` and `interpreter.md` own the result.

### Rule digest (copied into every brief)

- Read only the grammar pages your brief names, in slices: list headings first (`npm run -s outline -- FILE`), then read the ranges you need.
- **The realizer reads only the meaning view.** Never read a `LexWord`, a construction id or an anchor in `src/realize/`, never gloss a parsed word (`morphGlossFor`), and never widen the import allowlist. If a meaning is missing from the view, that is a reader gap: see triage.
- **Spell through glosses.** Every realized line is a morph gloss spelled by `spell` from `reply.ts`. Glosses name roots by concrete sense ([morph gloss format](../../meta/glosses.md#round-trip)). Never spell a root by hand.
- **Triage** each failure per [triage of a failure](#triage-of-a-failure):
  - a missing meaning the grammar states and the word's typed fields hold: copy it into the reader, with an `interpreter.md` sentence;
  - a missing meaning that needs a new kind or field: log it for the reader-gap unit;
  - two forms the grammar says mean the same: an `equal.ts` rule citing that sentence;
  - a page that is silent: a *Gaps* entry in `realizer.md` with a **Recommendation:** and confidence, then skip.
- Never settle a meaning the grammar leaves open. Never loosen `equal.ts` without a cited grammar sentence. Never raise the ratchet; lower it when counts improve.
- Each canonical choice is a row in `realizer.md`'s *Canonical choices* table with the anchor that allows it.
- No parser change. If one is needed, stop and report.
- If a `run.test.ts`, `src/game/` test or solver golden changes outcome, stop and report. Do not edit the test or the golden.
- Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`. Probe readings with one `node scripts/reading.mjs probe` file (cases separated by `---`). List examples behind a key with `npm run round-trip -- --texts KEY`. Never write a one-off script for these.
- Run `npm run verify` at the end of the unit (`--fast` for checks inside it). On a new error, read only that line of `tmp/logs/verify-last.log`.
- Keep files under the [code layout](../../meta/code-layout.md) ceiling. Split with `npm run move-decl`, never by hand.
- Do not commit. Do not edit `AGENTS.md`: report any Owns-line change.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report** (about 150 words): done (one line); round-trip `ok` count before and after, and the keys still failing with their count; reader fields added; `equal.ts` rules added with their anchors; gaps logged (key and one line each); shape changes logged for the reader-gap unit; `verify` line; skips with reasons; **left:**; **inefficient:**.

### Commits

One commit per unit after its gate, staged with that unit's files only, named `reading-realizer U<n>: <what it did> [skip-cd]` with the co-author line. One commit per phase for the consolidated proposal. Expected: 20 unit commits (fewer where a reader-gap unit is dropped) and 4 consolidation commits. A review-later decision gets its own commit per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision).

## Open decisions

None open. D1 (equal readings on the meaning view) was settled yes on 2026-11-21; U20 carries it out.
