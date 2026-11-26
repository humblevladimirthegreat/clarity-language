# Reading realizer

**Status:** IN PROGRESS. Phase 1 done 2026-11-25 (U1, U2, U2b, U3, U4, U4b; literals moved to U15). Phase 2 done 2026-11-25 (U5, U5b, U6, U7, U7b, U8a, U8b, U8c1, U8c2; U8's leftovers moved to U14, U13, U16 and U17). Phase 3 done 2026-11-25 (U9a, U9b, U9a2; U9a2 was U9a's tone-mark remainder, run in the same phase). Phase 4 done 2026-11-26 (U10a, U10b). Next: phase 5. Round trip at phase 4's end: 705 `ok` of 1479; `round-trip --diff` showed one trip moving from a gap to `different` (the `yal` carry end, logged for U16a) and no `ok` trip failing. Five `gap:noRule` keys rose by 1 to 4 (`carry:channel`, `carry:holder`, `overlay:plan:th`, `slot:th`, `anaphor:topic`), because trips now get past the stance frame and stop at a later item. Round trip at phase 3's end: 629 `ok` of 1479; `round-trip --diff` showed no trip that was `ok` turning into a failure. Three first-failure keys rose (`lexReading:restrictor` +1, `unit:linker` +2, `gap:noSpell edge:vocative` +2), because trips that had stopped at the force or call frame now get past it and stop at a later item. User decision 2026-11-25: the rest of the plan is resized to about 5× less usage per phase (phase 2 cost 81 points of the 5-hour window over two executor runs, about 8 per unit): each former unit splits by page set into units of about 40 calls, two units per phase, so phases 3 and 4 become phases 3 to 13, with a hard turn cap in the digest. Round trip at phase 2's end: 480 `ok` of 1479 (102 at phase 1's end). Settled by the orchestrator 2026-11-25 (autonomous, code shape, as U7b did): units may extend `spell` in `src/parse/gloss-inverse.ts` structurally when a realized gloss does not spell; U8c1 did so for built words (`6064a7a`). `reader-solver-boundary.md` is landed in the tree. D1 settled 2026-11-21: equal readings move onto the meaning view (U20). Settled by the orchestrator 2026-11-25 (autonomous, now in [realizer.md](../../meta/realizer.md)): the round-trip harness lives in `src/round-trip/`, outside the `src/realize/` import allowlist, because it needs the parser and `sameReadings`; the ratchet counts each failed trip under every part key of its readings, so progress cannot move a failure onto an unlisted key; `gloss-inverse.ts` spells number glosses structurally. Settled by the orchestrator 2026-11-25 (autonomous, code shape): `fillAskGloss` in `gloss-inverse.ts` wraps the parser's own `glossOne` in the fill-ask context (`zar` → `z-wh`); it is a parser lookup, not a table of whole words, like U9a's act-gloss lookup by spelling.  
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

Thirteen phases, run through subagents; phases 1 to 4 are done. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Phase 1 builds the meaning view, the harness and the bare clause, so later units are briefed from measured counts. Phase 2 covers terms and details, which frames host. Phases 3 to 8 cover the frame families and their reader gaps. Phases 9 to 13 cover nesting, discourse, numbers in full, the variant corpus and equal readings. Each phase holds two units of about 40 calls each, so one executor run costs about a fifth of phase 2's and ends well inside the 2-hour background limit. Each phase reads a different set of grammar pages, and each starts from the round-trip counts the one before it leaves. Counts in brackets after a unit's items are the ratchet's failing trips per key at phase 2's end; a trip counts under every key of its readings, so they size a unit and do not sum.

**Gates.** At the start of each phase the orchestrator saves `npm run verify -- --baseline` and `npm run round-trip -- --save`. Each unit ends with `npm run verify` and passes before its commit. The ratchet is in `npm test`, so `verify` covers it. At each phase end, `npm run round-trip -- --diff` shows no key that got worse. The proposal touches no prose under `docs/grammar/`, so it has no style gate and no recall gate. The final gate is a full `npm run verify` against an empty baseline at the end of phase 13.

**Reader-gap units.** Units U3 to U17b fix in place the reader gaps of triage step 1 that need only a copied field. They log the gaps that need a new shape. The reader-gap units take the logged lists: U14b and U14c for phases 1 to 7, U19 for phases 9 to 12. If a list is empty, the orchestrator drops that unit. A unit that changes the outcome of `run.test.ts`, `src/game/` tests or a solver golden stops and reports; it does not edit the test.

**Solver goldens.** No unit changes a `src/interpret/fixtures/solve-*.lp` golden. A reader field the solver did not read before changes no golden; if one changes, the unit stops and reports.

### Built in phases 1 to 4 (input for later units)

- **Files.** The meaning view is `src/realize/meaning.ts`: `project(readings, tables)` and `Projector`, the `Meaning*` types, and the no-`raw` and import-allowlist tests in `meaning.test.ts` (`REALIZE_IMPORTS`). The realizer is `src/realize/realize.ts` (`realize`, `firstKey`, `spellGloss`, `Gap`), with `claim.ts`, `terms.ts` (`thingLeaf`, `withPlural`, `cited`), `words.ts` (`listedLeaf`), `numbers.ts` (`numericLabel`), `lists.ts` (`hookFront`), `details.ts`, `tags.ts`, `built.ts` (`ROLE_REACH`) and `frames-stance.ts` (stance frames and holders, called from `claim.ts`), `acts.ts` (act words, calls, reactions; each act's gloss is looked up in the gloss index by its spelling `y`+vowel+ending, so the realizer names no act). `terms.ts` also exports `unit`, `leafOf` and the tone helpers `toneOf`, `ownFrames`, `toneMark`, `marked`, `withRestMarks`. `gloss-inverse.ts` exports `fillAskGloss` and `holderCandidates`. The harness is `src/round-trip/`: `corpus.ts` (`corpus`, `readTurn`), `round-trip.ts` (`roundTrip`, `tripEntry`, `partKeys`, `ratchetOf`), `round-trip.test.ts` (case tables `[text, want]` checked with `realize` and `sameReadings`) and **`src/round-trip/round-trip-ratchet.json`**. Wherever this plan says `src/realize/round-trip*`, it means `src/round-trip/`. `spell` is in `src/parse/gloss-inverse.ts`.
- **Realized so far.** The bare clause (verb, `z`/`d`/`b` roles, predicate, plain details, statement `yal` left out); pronouns; number terms in the preferred writing, digitless scale words, factors, fractions after a plain noun or count; list terms (members, each part's own join and shared kind, and-list frame, binders, `u` denial, *no K*, hooked-join bounds, shared distribute words, *respectively*); act words (firm, soft, for-now, stacked; `yal` left out only when it is the turn's only act word; calls and reactions, then a discourse hook, then the act words); polar words (after the act words, before the body), yes/no and fill-ask questions, fill-ask blanks (first in the body with any word they complete) and answers; tone marks (a word mark on its leaf, a sentence mark first when there are no opening `/y/` words, a later rest mark before the first piece that carries it); hooks and relations (ranges, in-clause and extra-noun hooks, same-role words, hosted relations, discourse and point-back hooks, contrary-to zones); comparatives, superlatives, equatives, bars in a fence, number adverbs; tag pronouns and assigning or bound tags; built words (role words, hook prefixes, numeric prefixes, label seams, `x` and hook compounds, listed hook-compound verbs); a party hosted by a built word or bar; MAY and its follow-up endings, live and memory, channels with every evidence strength, a channel's source and its `bl-` offset (`blral`, `blrul`, a time noun with a signed count); a holder on the seam of its channel or MAY word, placed as that word is; stance lists, last in the body; a standalone `thul`, last; a mood word on one adjective (`[w-MEMORY | g-red]`). `spell` spells overlays on `-r` (each row of `lexicon-overlays.csv`), digitless offsets (`bl-later`, `bl-earlier`, `bl-+-e-`, with `.about`), holder seams, digitless scale labels, `x` compounds, fractions and built-word glosses structurally.
- **Reader fields added.** `values.root` on a content-word detail and on an unbound `-r` pronoun; on thing, speaker, listener and number terms, `values.ending`, `values.plural` (`x`) and `values.citation` (`bare`); `values.plural` on details and bound pronouns; `values.ending` and `values.sense` on a pronoun; `values.number` on a number detail; `values.scale` on a digitless shared number; `values.part` and `values.reach` on a role compound on `-r`; `values.part` and `values.pointer` on a role pointer; a hook word's `values.series` and a hook detail's `values.part`; `hookResume` link `values`; each list part's `values` and `shared`; the pairing link's `list`; the `slot:tag` link's `values.tag`, `values.ending` and `tagged`; a tag pronoun's `values.tag`; a standalone join's `values.series`; the `edge:interjection` frame's `values.root`; a `blank` term's join-word `values` (`series`, `ending`, `hook`, `plural`); `builtValues(word)` in `read-context.ts` (`values.built` = `role` | `hookPrefix` | `numeric` | `scope` | `compound` | `hookCompound`, with `part`, `reach`, `stanceVowel`, `hook`, `stemHook`, `number`, `approx`; a built detail's stem as `values.root`). `equal.ts` gained one rule (a number word compares by role letter, shorthand body and ending) and skips the back-references `list` and `tagged` when indexing; no verdict changed.
- **Round trip at phase 4's end:** 705 `ok` of 1479; 2 `different`, 1 `gap:missingValue`, 6 `gap:noParse`, 736 `gap:noRule`, 25 `gap:noSpell`, 4 `skipped:unread`. Still failing under `overlay:evidential:th` 78 and `overlay:may:th` 25 (ratchet counts), all owned by later units. Two stored ratchet counts (`edge:vocative`, `unit:linker`) sit 1 below what the tree gives, from before phase 2, with no verdict change; leave them.
- **Logged for U14b and U14c** (left by U8 and phase 3): an in-clause hook between two `/ɡ/` words hosts nothing (`zazozon gadamul ol guzemel`, `hookJob:clause`); a named hook (`oen`, `en`) makes the span a name (`NAME[...]`), which the view does not record (2 `noSpell`); an adverb resume on `/h/` (`herulor`, `hazuror`) has no antecedent; joins on `-n` (`zobodel zubudal zan`, 4) and a hooked join on `er` (1); a hook prefix on a hook-compound stem (`guoxowurolul`) needs the listed stem in the view; a bar with no ending in the view (`shared:equative`, `bars.md` line 126); `spell` does not spell a role word with an ability vowel (`g-episode-agent-authorship-able`, 3) or a plural role word on `bl-` (`bl-role-agent-learn-x`, 2). From U9b, for U14c: a restrictor blank (`har` *when?*, `hor`, `her`; 3 trips) is a `lexReading:restrictor` frame that nothing marks as the question's blank, and its letter is not in the view; `thar` (*why?*) is a `joinSeries:a` adverb detail with no letter and no blank mark (1). Also for U14c, realizer rules with no owning unit: a call with a stance vowel (`yalazuxon`, `edge:vocative`, 1) and the likeness overlay (`hewem blar`, 1).
- **Left to later units.** U16a: a written `yal` ends a carried channel ([carry forward](../../grammar/intermediate/evidentiality.md#carry-forward)), but the view does not record that it ended one, so the realizer leaves `yal` out and the line takes the channel again (`zalazun thebam vudurul. yal zalazun vezuvel.`, the new `different` under `edge:force`). Record the carry end in the view (for example on the force frame), or decide it from the earlier lines; U10a recommends the view (medium). U11 and U13b: most of the 21 trips left under `xFamily:holder` are PLAN, want, decision or notional frames carrying a holder; the holder seam rule in `frames-stance.ts` should apply to them once their family is realized. U12a: stance lists whose member is a hinge (`zazozon vowurol thahum blerulal thul.`, 3). U12b: restrictors on `usually-vs-must.md` (`zazozon huam vowurol.`, 2). U13a: bars that are ability, say or holder words (`hodaxal`, `hwuvol`, `theguyom`, `thewemum`, about 5) need ability or say values on the bar; speech manner (`theguyom` as `slot:th` with only an ending in its values, left by U9a) needs say or hope values. U15a: **literal terms** (the reader copies the span's kind and marks into a `values` field on the literal term (cite, opaque or mention; `NAME`, `~`, `^`, `@`), then the realizer writes them; `spell` already spells `OPAQUE["kimchi"]`). U16b: a `-m` share, whose pointer gloss does not spell; a resume pinned to one sense (`d-←dog` spells as a plain `-r`); role-compound resumes (`anaphor:role`, 6 `noSpell`), tag recalls on `-r`/`-m` (`gap:noParse`), list pointers spelled alone, and `standIn` links, which all spell only after their antecedent. U16a: calls that resume (`yazozon. yazozor.`, 2 `noSpell` under `edge:vocative`) spell once lines are spelled in context. U15a: a tone mark on a span (`?d[azozon]`) stops at `unit:writingSpan`. U17a and U17b: the number forms their items list, number blanks (`grar`, `wrar`, noRule *a number blank*), plus percent (`g+25%`), number stems `zrawal`/`zruwal` and digit strings in hooks.
- **Logged in `realizer.md` *Gaps*:** prefix labels that are also a root's sense (`infinity`, `grain`, `void`, `origin`, hook `by`) gloss two words alike, so `zrawaxolamal` reads back as `zenuroxolamal` (1 `different`). Recommendation: reword those lexicon rows.
- **Settled for U16a (autonomous).** A resume parses only after what it resumes, so a reading spelled on its own line cannot spell it (`drager`, `gap:noSpell` under `anaphor:number`). U16a spells each reading with the turn's earlier realized lines as context.

### Standard unit

Units marked *the rest as U3* do this: add each canonical choice to `realizer.md` with the anchor that allows it; triage failures on their keys per [triage](#triage-of-a-failure); lower the ratchet with `npm run round-trip -- --lower`; and log shape changes for the phase's reader-gap unit.
**May edit (as U3):** `src/realize/*.ts` (`meaning.ts` only for fields the reader gains), `src/round-trip/round-trip-ratchet.json`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/types.ts` (fields only), `src/interpret/equal.ts` (stated equivalences only), the matching `*.test.ts` files, including `src/round-trip/round-trip.test.ts` (new cases only), `src/parse/gloss-inverse.ts` (structural spelling only) and its test, `docs/meta/realizer.md`, `docs/meta/interpreter.md`, and the read-by blocks that `npm run page-readers -- --write` rewrites.

### Phase 5: residue and condition hinges

**U11. Residue and its neighbors.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `residue`, `phase`, `notional`, `mirative` and `contrary` (`overlay:residue:h` 13, `overlay:phasal:*` 14, `overlay:notional:th` 8, `overlay:mirative:th` 6, `overlay:former_climate:h` 5). Pages: [residue-and-former.md](../../grammar/intermediate/residue-and-former.md), [already-still-yet.md](../../grammar/beginner/already-still-yet.md), [notional.md](../../grammar/intermediate/notional.md), [mirative.md](../../grammar/intermediate/mirative.md), [contrary-to.md](../../grammar/intermediate/contrary-to.md). The rest as U3.  
**May edit:** as U3.

**U12a. Condition and cause hinges.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize the `hinge` family's *if*, *only if*, *iff*, *because*, fault, CAUSE and the result hinge (`overlay:clause_hinge:th` 69, `overlay:cause:th` 8). Pages: [causation.md](../../grammar/beginner/causation.md), [because-and-iff.md](../../grammar/intermediate/because-and-iff.md), [fault.md](../../grammar/beginner/fault.md), [cause.md](../../grammar/intermediate/cause.md). The rest as U3.  
**May edit:** as U3.

### Phase 6: occasions and sakes

**U12b. Restrictors, occasions and time hinges.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `occasion`: restrictors and their occasions, habitual, *again* (`lexReading:restrictor` 40); and the hinges on a relation word (`overlay:clause_hinge:*:…`: as-of 30, after, while, before, by, until 14). Pages: [restrictors.md](../../grammar/beginner/restrictors.md), [more-occasions.md](../../grammar/intermediate/more-occasions.md), [as-of.md](../../grammar/advanced/as-of.md), [same-role-words.md](../../grammar/intermediate/same-role-words.md). The rest as U3.  
**May edit:** as U3.

**U13a. Sakes and bars.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `sake` and `bar`, including the bars left by phase 2 that are ability, say or holder words (see *Left to later units*) (`lexReading:sake` 66). Pages: [sakes.md](../../grammar/beginner/sakes.md), [for-a-sake.md](../../grammar/intermediate/for-a-sake.md), [ought-for-a-sake.md](../../grammar/beginner/ought-for-a-sake.md), [bars.md](../../grammar/intermediate/bars.md). The rest as U3.  
**May edit:** as U3.

### Phase 7: say words, intention and frame order

**U13b. Say words, intention and ability.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize `say`, `intention` and `ability`: permission and consent, plan, try and fallback, want and decide, ability (`overlay:plan:th` 17, `overlay:want:th` 11, `overlay:decision:th` 6, `overlay:attempt:h` 4, `lexReading:ability` 2). Pages: [permission-consent.md](../../grammar/intermediate/permission-consent.md), [intention.md](../../grammar/beginner/intention.md), [try.md](../../grammar/intermediate/try.md), [want-and-decide.md](../../grammar/intermediate/want-and-decide.md), [can-and-cant.md](../../grammar/beginner/can-and-cant.md). The rest as U3.  
**May edit:** as U3.

**U14a. Frame order.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Check frame placement over every pair kind of the [pair table](../../meta/interpreter.md#pair-table): run `npm run round-trip -- --texts` on the examples with two or more whole-clause frames, and fix the placement rules in the realizer. Log any reader shape change it needs for U14b.  
**May edit:** as U3.

### Phase 8: reader gaps for phases 1 to 7

**U14b. Reader gaps, first half.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Make the first half of the reader shape changes in *Logged for U14b and U14c* under *Built in phases 1 to 4*: the in-clause hook between two `/ɡ/` words, the named hook's `NAME[...]` span, the adverb resume on `/h/`, and joins on `-n` and the hooked join on `er`. Each change comes from its owning grammar section, with its [interpreter.md](../../meta/interpreter.md) entry. Prefer a field on an existing kind over a new kind when the grammar section gives no reason for a new kind. Every consumer that switches on a changed kind handles the new one (`equal.ts`, `match.ts`, `reply.ts`, `translate*.ts`, `src/game/host.ts`). Then realize what each change unblocks, as the *Standard unit* says.  
**May edit (as U14):** `src/interpret/types.ts`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/log.ts`, `src/interpret/equal.ts`, `src/interpret/match.ts`, `src/interpret/reply.ts`, `src/interpret/translate*.ts` (kind switches only), `src/game/host.ts` (kind switches only), `src/realize/*.ts`, `src/parse/gloss-inverse.ts` (structural spelling only), the matching `*.test.ts` files (new cases only), `src/round-trip/round-trip-ratchet.json`, `docs/meta/interpreter.md`, `docs/meta/realizer.md`.

**U14c. Reader gaps, second half.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
As U14b, for the rest of that list (the hook prefix on a hook-compound stem, the bar with no ending, the role words `spell` does not spell, the restrictor and `thar` blanks, and the two realizer rules logged with them) and every shape change logged in phases 3 to 7. If that is more than the turn cap holds, the orchestrator splits the rest into U14d and puts it first in phase 9.  
**May edit:** as U14.

### Phase 9: spans and dependents

**U15a. Literal terms and spans.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize literal terms (moved from U4; see *Built in phases 1 to 4*), then spans: asides, quotes and their contents, mention spans, scope islands (`unit:writingSpan` 14, `unit:island` 2). Pages: [spans.md](../../grammar/beginner/spans.md), [spans-as-words.md](../../grammar/intermediate/spans-as-words.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [scope-islands.md](../../grammar/intermediate/scope-islands.md). The rest as U3.  
**May edit:** as U3.

**U15b. Dependents and clause joins.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize dependents and their hinges, nested dependents, clause joins and clause sequences (`slot:dependent` 3). Pages: [dependents.md](../../grammar/beginner/dependents.md), [nested-dependents.md](../../grammar/advanced/nested-dependents.md), [clause-sequence.md](../../grammar/beginner/clause-sequence.md). The rest as U3.  
**May edit:** as U3.

### Phase 10: links across sentences

**U16a. Linkers, discourse hooks and carried frames.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
First make the harness spell each reading with the turn's earlier realized lines as context (settled; see *Built in phases 1 to 4*). Then realize sentence linkers, discourse hooks, grounds, carried frames and topics (`unit:linker` 42, `slot:grounds` 12, `carry` 11). Pages: [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md), [discourse-hooks.md](../../grammar/intermediate/discourse-hooks.md), [topic.md](../../grammar/intermediate/topic.md), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward) (carry forward only). The rest as U3.  
**May edit:** as U3, plus `src/round-trip/round-trip.ts`.

**U16b. Stand-ins, resumes and answers.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Realize stand-ins and point-backs, the resumes left by phase 2 (see *Left to later units*), and answers and polar replies (`lexReading:standIn` 84, `anaphor:*` 50, `lexReading:standInBack` 3, `answer` 1). Pages: [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md), [stand-in-roles.md](../../grammar/advanced/stand-in-roles.md), [resume-sense.md](../../grammar/intermediate/resume-sense.md). The rest as U3.  
**May edit:** as U3.

### Phase 11: numbers in full

**U17a. Number roles and markers.**  
Agent `proposal-worker`, `model: opus`, effort `medium`.  
Realize number roles, stacked markers, digitless forms and exponents, and special values. Pages: [number-roles.md](../../grammar/intermediate/number-roles.md), [stacked-markers.md](../../grammar/advanced/stacked-markers.md), [digitless-exponents.md](../../grammar/intermediate/digitless-exponents.md), [special-values.md](../../grammar/advanced/special-values.md). The rest as U3.  
**May edit:** as U3.

**U17b. Digit strings, ranges and percent.**  
Agent `proposal-worker`, `model: opus`, effort `medium`.  
Realize digit strings and time, initials, rays and named ranges, generations, percent (`g+25%`), the number stems `zrawal` and `zruwal`, and digit strings in hooks. Pages: [digit-strings.md](../../grammar/beginner/digit-strings.md), [initials.md](../../grammar/advanced/initials.md), [open-ranges.md](../../grammar/advanced/open-ranges.md), [generations.md](../../grammar/advanced/generations.md). The rest as U3.  
**May edit:** as U3.

### Phase 12: variant corpus

**U18a. Build the variant corpus.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Write `src/round-trip/variants.ts` (outside the import allowlist, like the harness) per [the variant corpus](#the-variant-corpus), reusing `rewrite.ts`'s slot maps (import them; do not copy them). Add `--variants` to `scripts/round-trip.ts` and a variant ratchet to `round-trip.test.ts`. If the variant run is too slow for `npm test`, it moves behind `npm run round-trip -- --variants` with its ratchet checked there, and `realizer.md` says so. Report the variant counts by verdict and key; triage nothing.  
**May edit:** `src/round-trip/variants.ts`, `src/round-trip/round-trip.ts`, `src/round-trip/round-trip.test.ts`, `src/round-trip/round-trip-ratchet.json`, `scripts/round-trip.ts`, `docs/meta/realizer.md`.

**U18b. Triage the variants.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Triage each variant failure kind per [triage](#triage-of-a-failure), starting from U18a's counts, write the *Variants* section of `realizer.md`, and log shape changes for U19.  
**May edit:** as U18a, and the files U3 may edit.

### Phase 13: reader gaps and equal readings

**U19. Reader gaps for phases 9 to 12.**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
As U14b, for the gaps logged in phases 9 to 12 and by the variant run. If that is more than the turn cap holds, the orchestrator runs the rest as U19b before U20.  
**May edit:** as U14.

**U20. Equal readings on the meaning view (D1).**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
*Precondition:* `npm run round-trip` (doc examples and variants) shows no `different` verdict that is a missing value. If any remain, stop and report; the orchestrator runs another reader-gap unit first. One definition of meaning, used by the realizer and the comparison alike, keeps the two from drifting.  
Rebuild `canonicalReadings` in `equal.ts` on `project`, keeping each listed rule, so two texts compare by meaning view and not by raw spelling. Every existing `equal.test.ts` case keeps its verdict. Run the "same reading" lint over the practice items and report any item whose verdict changes; do not edit the items. Update [equal readings](../../meta/interpreter.md#equal-readings).  
**May edit:** `src/interpret/equal.ts`, `src/interpret/equal.test.ts` (new cases only), `src/realize/meaning.ts`, `docs/meta/interpreter.md`.

**Phase 13 close.** *Orchestrator.* Add a `docs/meta/realizer.md` row to the editor-notes table in `AGENTS.md` (*Owns: meaning view, canonical choices, round trip, variants, realizer gaps*; code `src/realize/`, `src/round-trip/`, `npm run round-trip`). Run a full `npm run verify` against an empty baseline. Report the final round-trip counts and the *Gaps* list to the user. Then move this file per [folder and links](../../meta/procedures/proposals.md#folder-and-links) once `realizer.md` and `interpreter.md` own the result.

### Rule digest (copied into every brief)

- Read only the grammar pages your brief names, in slices: list headings first (`npm run -s outline -- FILE`), then read the ranges you need.
- Before opening any realizer or harness file, run `npm run -s outline -- src/realize --exports` (and `src/round-trip`) for the code map; then read only the ranges you need. Read a whole file only when you will edit across it.
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
- Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`. Probe readings with one `node scripts/reading.mjs probe` file (cases separated by `---`). Start triage of a key with `npm run round-trip -- --tally KEY …` (each failure reason with its count and one sample). List examples behind a key with `--texts KEY`, and see trips in full (gloss, realized line, path, detail) with `--detail KEY …` (`--per-key N` for a sample of each key, `--limit N` for a total cap). Grep meaning views with `npm run realize -- view --key KEY --has TEXT`, never a `--texts` | `view` | `grep` pipeline. See one text's meaning view, realized line and verdict with `npm run realize -- view 'TEXT' …`, and spell glosses with `npm run realize -- spell 'GLOSS' …` ([probes](../../meta/realizer.md#probes)). Never write a one-off script for these.
- Run `npm run verify` at the end of the unit (`--fast` for checks inside it). On a new error, read only that line of `tmp/logs/verify-last.log`.
- Keep files under the [code layout](../../meta/code-layout.md) ceiling. Split with `npm run move-decl`, never by hand.
- Do not commit. Do not edit `AGENTS.md`: report any Owns-line change.
- The harness is in `src/round-trip/`, outside the import allowlist. Lower `src/round-trip/round-trip-ratchet.json` with `npm run round-trip -- --lower`, never by hand (it only lowers, never adds a key, and names any key that rose).
- A new *Canonical choices* row makes its grammar page's read-by block stale: run `npm run page-readers -- --write` before the final `verify`, and report the pages it wrote.
- **Turn cap: 40 tool calls.** Count your tool calls. At the first item boundary after 40, stop even if items remain: leave the tree green, run `npm run verify`, and report **left:** as steps for a fresh worker. Past 40, finish only an item that needs one or two more edits. A long context costs more on every call, so a second worker is cheaper than running on.
- **Report** (about 150 words): done (one line); round-trip `ok` count before and after, and the keys still failing with their count; reader fields added; `equal.ts` rules added with their anchors; gaps logged (key and one line each); shape changes logged for the reader-gap unit; `verify` line; skips with reasons; **left:**; **inefficient:**.

### Commits

One commit per unit after its gate, staged with that unit's files only, named `reading-realizer U<n>: <what it did> [skip-cd]` with the co-author line. One commit per phase for the consolidated proposal. Expected for phases 5 to 13: 18 unit commits (fewer where a reader-gap unit is dropped, more where one splits), plus a read-by commit for each unit that writes read-by blocks, and 9 consolidation commits. A unit whose `page-readers --write` regenerates read-by blocks commits them on their own, after its own commit. A review-later decision gets its own commit per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision).

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
