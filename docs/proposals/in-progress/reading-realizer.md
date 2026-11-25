# Reading realizer

**Status:** IN PROGRESS. Phase 1 done 2026-11-25 (U1, U2, U2b, U3, U4, U4b; literals moved to U15). Phase 2 done 2026-11-25 (U5, U5b, U6, U7, U7b, U8a, U8b, U8c1, U8c2; U8's leftovers moved to U14, U13, U16 and U17). Next: phase 3. Round trip at phase 2's end: 480 `ok` of 1479 (102 at phase 1's end). Settled by the orchestrator 2026-11-25 (autonomous, code shape, as U7b did): units may extend `spell` in `src/parse/gloss-inverse.ts` structurally when a realized gloss does not spell; U8c1 did so for built words (`6064a7a`). `reader-solver-boundary.md` is landed in the tree. D1 settled 2026-11-21: equal readings move onto the meaning view (U20). Settled by the orchestrator 2026-11-25 (autonomous, now in [realizer.md](../../meta/realizer.md)): the round-trip harness lives in `src/round-trip/`, outside the `src/realize/` import allowlist, because it needs the parser and `sameReadings`; the ratchet counts each failed trip under every part key of its readings, so progress cannot move a failure onto an unlisted key; `gloss-inverse.ts` spells number glosses structurally.  
**Decided by agent:** 2026-11-25: the realizer writes number gloss labels itself in `src/realize/numbers.ts`, from the stem the view keeps, instead of widening the import allowlist to the glosser's `numberLabel` (medium, not flagged, `caac6e3`). The other option: add `numberLabel` from `src/parse/morph-gloss-labels.ts` to the allowlist. That function reads no word, but widening the allowlist is a weaker check.
**Related:** [interpreter.md](../../meta/interpreter.md) ([terms](../../meta/interpreter.md#terms), [reader rules](../../meta/interpreter.md#reader-rules), [parse or reading](../../meta/interpreter.md#parse-or-reading), [equal readings](../../meta/interpreter.md#equal-readings), [classification table](../../meta/interpreter.md#classification-table), [pair table](../../meta/interpreter.md#pair-table)), [glosses.md](../../meta/glosses.md#round-trip), [read-ageben.md](../../meta/procedures/read-ageben.md), [`types.ts`](../../../src/interpret/types.ts), [`read.ts`](../../../src/interpret/read.ts), [`equal.ts`](../../../src/interpret/equal.ts), [`reply.ts`](../../../src/interpret/reply.ts), [`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts), [`llm-examples.ts`](../../../src/parse/llm-examples.ts), [`rewrite.ts`](../../../src/find/rewrite.ts), [`sweep.test.ts`](../../../src/interpret/sweep.test.ts), [`scripts/sweep.ts`](../../../scripts/sweep.ts)  
**Depends on:** `reader-solver-boundary.md`  
**Design authority:** *none*. No form or reading changes. The reader gains fields only where the owning grammar section already states the meaning, and `equal.ts` gains a rule only where a grammar section states that two forms mean the same. A meaning the grammar leaves open is logged, never settled here.

## Design

[realizer.md](../../meta/realizer.md) owns the meaning view ([meaning view](../../meta/realizer.md#meaning-view)) and the round trip ([round trip](../../meta/realizer.md#round-trip)), as built in phase 1. What later units still need is below.

### The realizer

`realize(view, tables): Realized`, where `Realized` is `{ gloss, ageben }` or `{ gap }`. It writes a morph gloss per [morph gloss format](../../meta/glosses.md#round-trip), spells it with `spell`, and returns a gap when the line does not spell or does not parse to one tree.

- **Per family.** One file per area (`claim.ts`, `terms.ts`, `lists.ts`, `details.ts`, `frames-*.ts`, `discourse.ts`), switching on `key`, never on a spelling. Files keep to [code layout](../../meta/code-layout.md).
- **Canonical choices.** Wherever the grammar allows several forms with the same meaning, the realizer takes one: the default order of [clause.md](../../grammar/beginner/clause.md), an omissible `yal` left out, the [preferred number writing](../../grammar/intermediate/number-markers.md#writing-style-numeric-vs-spelled), and so on. Each choice is a row in `realizer.md` with the anchor that allows it. A choice must give a text that `sameReadings` finds the same as the original; if none does, it is a gap.
- **Frame placement.** Whole-clause frames go where the [scope statements](../../meta/interpreter.md#scope-statements) put them for the recorded `order`. A commuting pair takes a canonical order. An `unordered` pair keeps its text order.
- **Gaps.** `{ gap: { kind, key, detail } }`, with `kind` one of `noRule` (the realizer has no rule for this key yet), `missingValue` (the meaning view lacks what is needed to choose a word: a reader gap), `noSpell` and `noParse`.

### Triage of a failure

1. **`missingValue`, or `different` where the realizer chose wrongly because the view lacked something.** If the owning grammar section states the meaning and the word's typed fields hold it, the reader copies it into `values` (or `party`, `hosted`) and `interpreter.md` gains a sentence on it. If it needs a new term kind, link kind or reading field, the unit logs it for that phase's reader-gap unit.
2. **`different` where both texts mean the same.** If the owning section says the two forms mean the same, `equal.ts` gains a rule under [equal readings](../../meta/interpreter.md#equal-readings), citing that sentence. If the page is silent, it is a grammar gap: logged in `realizer.md` under *Gaps* with a recommendation, never resolved by the unit.
3. **`different` that is a realizer bug.** Fixed in the realizer.
4. **`unsettled`.** Already a grammar backlog item (rule 3). Counted, not fixed.

### The variant corpus

`src/round-trip/variants.ts` builds variants of each doc example from the `rewrite.ts` letter-slot maps: for each word and each field, every other value of that field. It keeps the variants that parse with no `unread` entry, dedupes by gloss, and caps the number per example so the run stays inside the test budget (`realizer.md` states the cap). The round trip runs on them with their own ratchet. A variant that reads the same as its original but has a different gloss is a lost distinction or an unstated equivalence, and is triaged as above.

## Implementation plan

Four phases, run through subagents; phases 1 and 2 are done. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Phase 1 builds the meaning view, the harness and the bare clause, so later units are briefed from measured counts. Phase 2 covers terms and details, which frames host. Phase 3 covers the frame families. Phase 4 covers nesting, discourse and the variant corpus. Each later phase reads a different set of grammar pages, and each starts from the round-trip counts the one before it leaves.

**Gates.** At the start of each phase the orchestrator saves `npm run verify -- --baseline` and `npm run round-trip -- --save`. Each unit ends with `npm run verify` and passes before its commit. The ratchet is in `npm test`, so `verify` covers it. At each phase end, `npm run round-trip -- --diff` shows no key that got worse. The proposal touches no prose under `docs/grammar/`, so it has no style gate and no recall gate. The final gate is a full `npm run verify` against an empty baseline at the end of phase 4.

**Reader-gap units.** Units U3 to U17 fix in place the reader gaps of triage step 1 that need only a copied field. They log the gaps that need a new shape. The reader-gap unit that closes each phase (U14, U19) takes the logged list. If the list is empty, the orchestrator drops that unit. A unit that changes the outcome of `run.test.ts`, `src/game/` tests or a solver golden stops and reports; it does not edit the test.

**Solver goldens.** No unit changes a `src/interpret/fixtures/solve-*.lp` golden. A reader field the solver did not read before changes no golden; if one changes, the unit stops and reports.

### Built in phases 1 and 2 (input for later units)

- **Files.** The meaning view is `src/realize/meaning.ts`: `project(readings, tables)` and `Projector`, the `Meaning*` types, and the no-`raw` and import-allowlist tests in `meaning.test.ts` (`REALIZE_IMPORTS`). The realizer is `src/realize/realize.ts` (`realize`, `firstKey`, `spellGloss`, `Gap`), with `claim.ts`, `terms.ts` (`thingLeaf`, `withPlural`, `cited`), `words.ts` (`listedLeaf`), `numbers.ts` (`numericLabel`), `lists.ts`, `details.ts`, `tags.ts` and `built.ts` (`ROLE_REACH`). The harness is `src/round-trip/`: `corpus.ts` (`corpus`, `readTurn`), `round-trip.ts` (`roundTrip`, `tripEntry`, `partKeys`, `ratchetOf`), `round-trip.test.ts` (case tables `[text, want]` checked with `realize` and `sameReadings`) and **`src/round-trip/round-trip-ratchet.json`**. Wherever this plan says `src/realize/round-trip*`, it means `src/round-trip/`. `spell` is in `src/parse/gloss-inverse.ts`.
- **Realized so far.** The bare clause (verb, `z`/`d`/`b` roles, predicate, plain details, statement `yal` left out); pronouns; number terms in the preferred writing, digitless scale words, factors, fractions after a plain noun or count; list terms (members, each part's own join and shared kind, and-list frame, binders, `u` denial, *no K*, hooked-join bounds, shared distribute words, *respectively*); hooks and relations (ranges, in-clause and extra-noun hooks, same-role words, hosted relations, discourse and point-back hooks, contrary-to zones); comparatives, superlatives, equatives, bars in a fence, number adverbs; tag pronouns and assigning or bound tags; built words (role words, hook prefixes, numeric prefixes, label seams, `x` and hook compounds, listed hook-compound verbs); a party hosted by a built word or bar. `spell` spells digitless scale labels, `x` compounds, fractions and built-word glosses structurally.
- **Reader fields added.** `values.root` on a content-word detail and on an unbound `-r` pronoun; on thing, speaker, listener and number terms, `values.ending`, `values.plural` (`x`) and `values.citation` (`bare`); `values.plural` on details and bound pronouns; `values.ending` and `values.sense` on a pronoun; `values.number` on a number detail; `values.scale` on a digitless shared number; `values.part` and `values.reach` on a role compound on `-r`; `values.part` and `values.pointer` on a role pointer; a hook word's `values.series` and a hook detail's `values.part`; `hookResume` link `values`; each list part's `values` and `shared`; the pairing link's `list`; the `slot:tag` link's `values.tag`, `values.ending` and `tagged`; a tag pronoun's `values.tag`; a standalone join's `values.series`; `builtValues(word)` in `read-context.ts` (`values.built` = `role` | `hookPrefix` | `numeric` | `scope` | `compound` | `hookCompound`, with `part`, `reach`, `stanceVowel`, `hook`, `stemHook`, `number`, `approx`; a built detail's stem as `values.root`). `equal.ts` gained one rule (a number word compares by role letter, shorthand body and ending) and skips the back-references `list` and `tagged` when indexing; no verdict changed.
- **Round trip at phase 2's end:** 480 `ok` of 1479; 1 `different`, 1 `gap:missingValue`, 6 `gap:noParse`, 964 `gap:noRule`, 23 `gap:noSpell`, 4 `skipped:unread`. Two stored ratchet counts (`edge:vocative`, `unit:linker`) sit 1 below what the tree gives, from before phase 2, with no verdict change; leave them.
- **Logged for U14** (left by U8): an in-clause hook between two `/ɡ/` words hosts nothing (`zazozon gadamul ol guzemel`, `hookJob:clause`); a named hook (`oen`, `en`) makes the span a name (`NAME[...]`), which the view does not record (2 `noSpell`); an adverb resume on `/h/` (`herulor`, `hazuror`) has no antecedent; joins on `-n` (`zobodel zubudal zan`, 4) and a hooked join on `er` (1); a hook prefix on a hook-compound stem (`guoxowurolul`) needs the listed stem in the view; a bar with no ending in the view (`shared:equative`, `bars.md` line 126); `spell` does not spell a role word with an ability vowel (`g-episode-agent-authorship-able`, 3) or a plural role word on `bl-` (`bl-role-agent-learn-x`, 2).
- **Left to later units.** U13: bars that are ability, say or holder words (`hodaxal`, `hwuvol`, `theguyom`, `thewemum`, about 5) need ability or say values on the bar. U15: **literal terms** (the reader copies the span's kind and marks into a `values` field on the literal term (cite, opaque or mention; `NAME`, `~`, `^`, `@`), then the realizer writes them; `spell` already spells `OPAQUE["kimchi"]`). U16: a `-m` share, whose pointer gloss does not spell; a resume pinned to one sense (`d-←dog` spells as a plain `-r`); role-compound resumes (`anaphor:role`, 6 `noSpell`), tag recalls on `-r`/`-m` (`gap:noParse`), list pointers spelled alone, and `standIn` links, which all spell only after their antecedent. U17: the number forms its item lists, plus percent (`g+25%`), number stems `zrawal`/`zruwal` and digit strings in hooks.
- **Logged in `realizer.md` *Gaps*:** prefix labels that are also a root's sense (`infinity`, `grain`, `void`, `origin`, hook `by`) gloss two words alike, so `zrawaxolamal` reads back as `zenuroxolamal` (1 `different`). Recommendation: reword those lexicon rows.
- **Settled for U16 (autonomous).** A resume parses only after what it resumes, so a reading spelled on its own line cannot spell it (`drager`, `gap:noSpell` under `anaphor:number`). U16 spells each reading with the turn's earlier realized lines as context.

### Standard unit

Units marked *the rest as U3* do this: add each canonical choice to `realizer.md` with the anchor that allows it; triage failures on their keys per [triage](#triage-of-a-failure); lower the ratchet from `npm run round-trip -- --ratchet`; and log shape changes for the phase's reader-gap unit.
**May edit (as U3):** `src/realize/*.ts` (`meaning.ts` only for fields the reader gains), `src/round-trip/round-trip-ratchet.json`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/types.ts` (fields only), `src/interpret/equal.ts` (stated equivalences only), the matching `*.test.ts` files, including `src/round-trip/round-trip.test.ts` (new cases only), `src/parse/gloss-inverse.ts` (structural spelling only) and its test, `docs/meta/realizer.md`, `docs/meta/interpreter.md`, and the read-by blocks that `npm run page-readers -- --write` rewrites.

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
Check frame placement over every pair kind of the [pair table](../../meta/interpreter.md#pair-table): run `npm run round-trip -- --texts` on the examples with two or more whole-clause frames, and fix the placement rules in the realizer. Then make the reader shape changes logged in phase 3 and those *Logged for U14* under *Built in phases 1 and 2* (new term kinds, link kinds or reading fields), each from its owning grammar section, with its [interpreter.md](../../meta/interpreter.md) entry. Prefer a field on an existing kind over a new kind when the grammar section gives no reason for a new kind. Every consumer that switches on a changed kind handles the new one (`equal.ts`, `match.ts`, `reply.ts`, `translate*.ts`, `src/game/host.ts`). Then realize what each change unblocks, as the *Standard unit* says. If the unit runs out of turns, the orchestrator splits the rest into U14b, as U8 split into U8a to U8c2 in phase 2.  
**May edit (as U14):** `src/interpret/types.ts`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/log.ts`, `src/interpret/equal.ts`, `src/interpret/match.ts`, `src/interpret/reply.ts`, `src/interpret/translate*.ts` (kind switches only), `src/game/host.ts` (kind switches only), `src/realize/*.ts`, `src/parse/gloss-inverse.ts` (structural spelling only), the matching `*.test.ts` files (new cases only), `src/round-trip/round-trip-ratchet.json`, `docs/meta/interpreter.md`, `docs/meta/realizer.md`.

### Phase 4: nesting, discourse and variants

**U15. Dependents, clause joins and spans.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize literal terms (moved from U4; see *Built in phases 1 and 2*), then nested readings: dependents and their hinges, nested dependents, clause joins and clause sequences, scope islands, asides, quotes and their contents, mention spans. Pages: [dependents.md](../../grammar/beginner/dependents.md), [nested-dependents.md](../../grammar/advanced/nested-dependents.md), [clause-sequence.md](../../grammar/beginner/clause-sequence.md), [spans.md](../../grammar/beginner/spans.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [scope-islands.md](../../grammar/intermediate/scope-islands.md). The rest as U3.  
**May edit:** as U3.

**U16. Links across sentences.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize links in multi-sentence examples: sentence linkers, discourse hooks, stand-ins and point-backs, grounds, carried frames, answers and polar replies, topics. Spell each reading with the turn's earlier realized lines as context (settled; see *Built in phases 1 and 2*). Pages: [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md), [discourse-hooks.md](../../grammar/intermediate/discourse-hooks.md), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md), [stand-in-roles.md](../../grammar/advanced/stand-in-roles.md), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward) (carry forward only). The rest as U3.  
**May edit:** as U3.

**U17. Numbers in full.**  
Agent `proposal-worker`, `model: opus`, effort `medium`.  
Realize what U4 left of numbers: number roles, stacked markers, digitless forms and exponents, special values, digit strings and time, initials, rays and named ranges, generations. Pages: [number-roles.md](../../grammar/intermediate/number-roles.md), [stacked-markers.md](../../grammar/advanced/stacked-markers.md), [digitless-exponents.md](../../grammar/intermediate/digitless-exponents.md), [special-values.md](../../grammar/advanced/special-values.md), [digit-strings.md](../../grammar/beginner/digit-strings.md), [open-ranges.md](../../grammar/advanced/open-ranges.md). The rest as U3.  
**May edit:** as U3.

**U18. Variant corpus.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Write `src/round-trip/variants.ts` (outside the import allowlist, like the harness) per [the variant corpus](#the-variant-corpus), reusing `rewrite.ts`'s slot maps (import them; do not copy them). Add `--variants` to `scripts/round-trip.ts` and a variant ratchet to `round-trip.test.ts`. If the variant run is too slow for `npm test`, it moves behind `npm run round-trip -- --variants` with its ratchet checked there, and `realizer.md` says so. Run it, triage each failure kind per [triage](#triage-of-a-failure), and write the *Variants* section of `realizer.md`.  
**May edit:** `src/round-trip/variants.ts`, `src/round-trip/round-trip.ts`, `src/round-trip/round-trip.test.ts`, `src/round-trip/round-trip-ratchet.json`, `scripts/round-trip.ts`, and the files U3 may edit.

**U19. Phase 4 reader gaps.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
As U14's reader-gap part, for the gaps logged in phase 4 and by the variant run.  
**May edit:** as U14.

**U20. Equal readings on the meaning view (D1).**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
*Precondition:* `npm run round-trip` (doc examples and variants) shows no `different` verdict that is a missing value. If any remain, stop and report; the orchestrator runs another reader-gap unit first. One definition of meaning, used by the realizer and the comparison alike, keeps the two from drifting.  
Rebuild `canonicalReadings` in `equal.ts` on `project`, keeping each listed rule, so two texts compare by meaning view and not by raw spelling. Every existing `equal.test.ts` case keeps its verdict. Run the "same reading" lint over the practice items and report any item whose verdict changes; do not edit the items. Update [equal readings](../../meta/interpreter.md#equal-readings).  
**May edit:** `src/interpret/equal.ts`, `src/interpret/equal.test.ts` (new cases only), `src/realize/meaning.ts`, `docs/meta/interpreter.md`.

**Phase 4 close.** *Orchestrator.* Add a `docs/meta/realizer.md` row to the editor-notes table in `AGENTS.md` (*Owns: meaning view, canonical choices, round trip, variants, realizer gaps*; code `src/realize/`, `src/round-trip/`, `npm run round-trip`). Run a full `npm run verify` against an empty baseline. Report the final round-trip counts and the *Gaps* list to the user. Then move this file per [folder and links](../../meta/procedures/proposals.md#folder-and-links) once `realizer.md` and `interpreter.md` own the result.

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
- No parser change. If one is needed, stop and report. Extending `spell` (`src/parse/gloss-inverse.ts`) is not a parser change: when a realized gloss equals the parser's own gloss but does not spell, add a structural rule there (never a table of whole words) with `gloss-inverse.test.ts` cases. If two words share one gloss, log a *Gaps* entry instead.
- If a `run.test.ts`, `src/game/` test or solver golden changes outcome, stop and report. Do not edit the test or the golden.
- Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`. Probe readings with one `node scripts/reading.mjs probe` file (cases separated by `---`). List examples behind a key with `npm run round-trip -- --texts KEY`. Never write a one-off script for these.
- Run `npm run verify` at the end of the unit (`--fast` for checks inside it). On a new error, read only that line of `tmp/logs/verify-last.log`.
- Keep files under the [code layout](../../meta/code-layout.md) ceiling. Split with `npm run move-decl`, never by hand.
- Do not commit. Do not edit `AGENTS.md`: report any Owns-line change.
- The harness is in `src/round-trip/`, outside the import allowlist. Lower `src/round-trip/round-trip-ratchet.json` from `npm run round-trip -- --ratchet` (counts only go down; never add a key).
- A new *Canonical choices* row makes its grammar page's read-by block stale: run `npm run page-readers -- --write` before the final `verify`, and report the pages it wrote.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report** (about 150 words): done (one line); round-trip `ok` count before and after, and the keys still failing with their count; reader fields added; `equal.ts` rules added with their anchors; gaps logged (key and one line each); shape changes logged for the reader-gap unit; `verify` line; skips with reasons; **left:**; **inefficient:**.

### Commits

One commit per unit after its gate, staged with that unit's files only, named `reading-realizer U<n>: <what it did> [skip-cd]` with the co-author line. One commit per phase for the consolidated proposal. Expected for phases 3 to 4: 12 unit commits (fewer where a reader-gap unit is dropped, more where one splits) and 2 consolidation commits. A unit whose `page-readers --write` regenerates read-by blocks commits them on their own, after its own commit. A review-later decision gets its own commit per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision).

## Open decisions

None open. D1 (equal readings on the meaning view) was settled yes on 2026-11-21; U20 carries it out.

## Background

### Problem

The checks on the reader are structural. Every construction id has a row, every word lands in exactly one place ([`coverage.ts`](../../../src/interpret/coverage.ts), ratchet at 0 / 0), and the solver accounting checks that each part is used. None of them shows that a reading keeps every distinction the grammar makes. A word can be placed while its ending, its series vowel or its reach is dropped from the reading, and nothing notices until a tool built on the reader gives a wrong answer.

Tools are about to be built on the reader. Each one that finds a gap is tempted to read the spelling itself, which [parse or reading](../../meta/interpreter.md#parse-or-reading) forbids. A check that proves the reading is complete is needed before they are built. Producing Ageben from meaning is also something several of those tools need: replies, solver output, canonical forms for learners, drill generation.

### Goals

- A **meaning view**: a projection of readings with no word pointers, no construction ids and no spellings beyond declared identities. It defines what a reading means.
- A **realizer** that turns a meaning view into a morph gloss, then into Ageben through `glossToAgeben`, with one canonical text per reading.
- A **round trip** over every doc example: read, project, realize, read again, judged by `sameReadings` against the original. It runs in `npm test` with a ratchet, and `npm run round-trip` counts it the way `npm run sweep` counts the solver.
- A **variant corpus**: doc examples with one letter slot changed (series, form, marker, scope, answer, stance, pointer, locus), so each value a slot can take is tried, not only the ones the docs happen to use.
- Every round-trip failure ends in one of three places: fixed in the reader, a stated equivalence in `equal.ts`, or a logged grammar gap.
- A meta note, `docs/meta/realizer.md`, owns the meaning view, the canonical choices, the round trip and the gap log.

### Non-goals

- Parser changes. If a round trip needs one, the unit stops and reports.
- Settling a meaning the grammar leaves open. Such a gap is logged with a recommendation and skipped.
- Style options (word order variants, pronoun or name, spelled or numeric). The realizer writes one canonical text. Options are a later proposal.
- Moving `reply.ts`, the solver or the wizard onto the realizer. They can switch once it is complete; each switch is its own change.
- Showing the realizer on the site.
- The other completeness checks discussed with this one: grammar-anchor coverage, a generated family-by-position grid, self-entailment over the corpus, and a lint on spelling tests in consumers. Each can be its own idea; this plan does not depend on them.

### Findings

**F1. Morph gloss to Ageben exists and checks itself.** [`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts) spells a morph gloss and keeps only a line whose gloss matches the input again. Glosses are one-to-one with Ageben ([round trip](../../meta/glosses.md#round-trip)) and name roots by concrete sense, so a realizer that writes glosses never spells a root and survives a respelling.

**F2. Replies already go through it, but read words.** [`reply.ts`](../../../src/interpret/reply.ts) builds each line as a gloss draft, spells it and parses it (`spell`, `checkLine`). Its leaves are glossed from parsed words with `morphGlossFor`. The realizer takes the same spelling path but may not gloss a parsed word: that would copy the form and prove nothing.

**F3. `sameReadings` is a strong judge.** [Equal readings](../../meta/interpreter.md#equal-readings) drops positions, compares details as multisets, treats an omitted act word as the statement act, compares pronouns by referent, and compares every other word by raw spelling. So when the realizer picks a different word than the original because the meaning view lacked something, the raw spellings differ and the verdict is `different`. Differences that are only form are already excused by the listed rules. A new excuse is a new rule there, and needs a grammar sentence behind it.

**F4. Readings carry meaning partly in words.** `Frame`, `Detail`, `Link` and `Term` keep `LexWord`s (reader rule 5), and `values` holds only some of a word's typed fields. Where meaning lives only in a word's spelling, the realizer cannot choose it from the meaning view. Each such place is a reader gap. `reader-solver-boundary.md` closes the ones the solver hit (link values, *we*, holder and say parties, the NOTIONAL link); the round trip finds the rest.

**F5. Identities are spellings by design.** A thing term's `root`, a name, a literal payload and a number stem are identities, not choices (`reader-solver-boundary.md` says the same of the range hook's spelling). The meaning view keeps them: a root as its lexicon row's concrete sense, the others as they are.

**F6. The corpus and the tools to vary it exist.** `buildExampleIndex` gives every doc example with its gloss and source (more than 500; `sweep.test.ts` asserts it). [`rewrite.ts`](../../../src/find/rewrite.ts) swaps letter slots in a parsed word for `find.mjs --map`, over the fields `series`, `form`, `marker`, `scope`, `answer`, `stance`, `pointer` and `locus`. [`scripts/sweep.ts`](../../../scripts/sweep.ts) and `scripts/lib/sweep.ts` have the `--save`, `--diff` and `--texts` pattern.
