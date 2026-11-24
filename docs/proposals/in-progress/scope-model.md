# Scope model: one statement of reach, order, ownership and carry

**Status:** IN PROGRESS. Phases 1 to 3 done 2026-11-24. Phase 1: `cdd63e7b` start, `3086d93f` U1, `856423e9` U2, `838e2906` U3, `20222bea` U4, `4e387bae` U5, `194d388b` U6, `aa9a34a5` `AGENTS.md`. Phase 2 (full run): `2645a9ac` S1, `3aa3fb18` S2, `cb399cd6` S3, `6349564c` S4 (grounds half; the member half is S4b). Phase 3 (full run, two executors): `1b6b16c4` S5, `a648b95c` S5c, `a8f3c94f` S5d, `b6007106` S5b, `3d0c7246` S6, `fedce528` S6c, `55da329e` S7, `7e3efcfa` S8, `d40c972b` S9. Recall gate at the phase end passed (checkpoint recall 99.4 on the same sentences; all sentences 99.4 to 99.2, within the baseline). Next: phase 4, starting at S4b. Decided by agent: 2026-11-24, carried frames pass into clause-join members, dependents and islands (high, not flagged, `95f8ffc3`). Decided 2026-11-24 (user): D16 (a), the seam word escapes a sake word under a holder (S10); D17 to D19 as recommended, a goodbye ends the `standInBack`, `hookResume`, `sentenceBefore` and `answer` slots (S11), and any statement word answers a question (S12). S10 to S12 run in phase 4 after S4b. Split 2026-11-24 (user): phase 4 is the last reading changes (S4b, S10 to S12), and phase 5 writes the scope page (L1 to L5). Decided 2026-11-24 (user): D15 (a), change `coverage.ts` (S4b). Edits to existing pages get no style review, because a full style pass over them follows later; the new scope page is not in that pass, so it gets its own style review (L5). Writers of grammar prose still self-check against the [checklist](../../meta/doc-style.md#checklist). D1, the scope page is a synthesis page closing Intermediate, in a unit of its own after *Surprise and what's not so*, titled *How far a word reaches*; D2, a scope cheat sheet generated from the profile, boundary and slot tables (L4).

**Related:** [interpreter.md](../../meta/interpreter.md) ([family profiles](../../meta/interpreter.md#family-profiles), [boundaries](../../meta/interpreter.md#boundaries), [links](../../meta/interpreter.md#links), [discourse slots](../../meta/interpreter.md#discourse-slots), [scope statements](../../meta/interpreter.md#scope-statements), [reader rules](../../meta/interpreter.md#reader-rules), [pair table](../../meta/interpreter.md#pair-table)); [scope.ts](../../../src/parse/scope.ts); [scope-profiles.ts](../../../src/parse/scope-profiles.ts); [boundaries.ts](../../../src/parse/boundaries.ts); [discourse-slots.ts](../../../src/parse/discourse-slots.ts); [carry.ts](../../../src/parse/carry.ts); [scope-report.ts](../../../src/interpret/scope-report.ts); [read.ts](../../../src/interpret/read.ts); [read-context.ts](../../../src/interpret/read-context.ts). Grammar: [clause.md](../../grammar/beginner/clause.md#which-covers-which), [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [contrary-to.md](../../grammar/intermediate/contrary-to.md#contrary-to-stance), [because-and-iff.md](../../grammar/intermediate/because-and-iff.md#choosing-a-hinge), [cause.md](../../grammar/intermediate/cause.md#mechanism), [joins.md](../../grammar/beginner/joins.md#everything-ua), [spans.md](../../grammar/beginner/spans.md#asides-th), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume), [notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing), [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts).

**Depends on:** none. **Order:** never run a phase of this proposal at the same time as a phase of `reading-realizer.md`, because both edit `read.ts` and `read-context.ts`.

**Design authority:** phase 4 changes only the readings its decisions name: S4b those of D9's member half (four examples), through [joins.md](../../grammar/beginner/joins.md#everything-ua); S10 the seam word under a holder (D16), through [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers); S11 the slots a goodbye ends (D17, D18); S12 replies that open with `yam` or `yar` (D19), which lifts the rejection of `yam azozon.`. Phase 5's L1 to L5 add one teaching page and one cheat sheet, and add or change no form.

## Implementation plan

Five phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

- **Phases 1 to 3** (done) built the scope model in code, audited it, and landed the decisions: profiles, hinges, binders' grounds reach, asides, approximate quotes, the point-back slots, the unstated cells and the tidy.
- **Phase 4** lands the last reading changes: the binder's member reach (S4b) and D16 to D19 (S10 to S12).
- **Phase 5** writes the teaching page and its cheat sheet (L1 to L5).

**Gates.** At the start of the session the orchestrator saves `npm run verify -- --baseline` and `npm run scope-report -- --save`. Each unit ends with `npm run verify -- --allow-generate`, and the unit passes before its commit. After each unit's commit the orchestrator resaves the snapshot (`scope-report -- --save`), so that `npm run scope-report -- --diff` lists only the examples the unit names: the examples each S-unit names, and none for L1 to L5. The final gate is a full `npm run verify` against an empty baseline at the end of phase 5. Phases 4 and 5 edit no recipe page and no English helper, so they have no recall gate. Phase 5's style gate is L5, the new scope page only (Status).

**What earlier phases built** (input for every later unit; the rules the scope page teaches):

- **Scope report.** `npm run scope-report` (`scripts/scope-report.ts`, logic in `src/interpret/scope-report.ts`). `--save` writes `tmp/state/scope-report.json`, `--diff` compares to it, and the full report is `tmp/logs/scope-report.md` (grep or slice it, never read it whole). Per reading it records frame families, order entries, unordered pairs, stance lists, nested-reading kind and links. It counts examples per `explainPair` rule id, per boundary cell and per discourse slot. Walk helpers `forEachExample`, `readSnapshot` and `writeSnapshot` are exported from `src/interpret/accounting-walk.ts`.
- **Family profiles.** `src/parse/scope-profiles.ts`: `PROFILES` (18 families), `derivePairRows()` (8 rules), `EXCEPTIONS` (4), `explainPair`, `caseMatches`. `PAIR_ROWS` in `scope.ts` is derived; the frozen rows that guard it live in `scope-profiles.test.ts`. The holder covers sake words and hinges wherever they sit (S3). The four remark families (`attitude`, `mirative`, `sake`, `contrary`) escape `force` and commute with each other through one shared `remark` property; the `Escape` type is only `holder` and `carried`. The channel member cases cite [evidentiality.md](../../grammar/intermediate/evidentiality.md#evidence-clause) through `BACKING`. Aim members and the `force` member `greeting` (`reading:greeting`) have `claims: false`: a greeting, like a plan, claims nothing, takes no frame and ends none ([evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward)); `isGreetingScope` is gone. `carry.ts` reads both. Documented in [family profiles](../../meta/interpreter.md#family-profiles).
- **Pair table.** The hand-written pair table in `interpreter.md` has no `edge` rows: one paragraph, *The act word*, says the act word covers every body frame that does not escape `force`, by tree nesting (reader rule 2). The code still derives the edge rows.
- **Boundaries.** `src/parse/boundaries.ts`: `BOUNDARIES`, 7 nested-reading rows (member, standInDependent, slotDependent, grounds, island, quote, aside) by 8 columns (outerFrames, holder, carryStart, carryEnd, carried, binder, boundTag, tone). The `island` row is *a scope island or a verb-list item with words of its own*. Every `aside` cell blocks. The 9 cells with examples behind them that were unstated are stated as today's behavior on their owning pages (S7), and carried frames pass into members, dependents and islands (agent decision). The `member` binder cell is still `passesNotToday("copy", …)` until S4b. Documented in [boundaries](../../meta/interpreter.md#boundaries).
- **One placement stage.** `collectClause` gives every body, member, dependent, island, and verb-list item with words of its own a scope record (`copied(reaching, "island")` for islands and verb-list items). The reader copies records only. `placeFrame` (`read-context.ts`) places only frames that reach less than a clause; a whole-clause frame missing from a record becomes an `unplaced` `unread` entry (reader rule 3).
- **Discourse slots.** `src/parse/discourse-slots.ts`: `DISCOURSE_SLOTS`, 7 rows (carriedFrame, topic, standInBack, hookResume, supposition, sentenceBefore, answer) by set by, read by, 4 end events (new value, statement word, *by the way*, goodbye), kept, quote, and anchors. An end cell says whether the event sentence and those after it still read the value. All but 5 cells are stated (S8); S11 and S12 state the last 5 (D17 to D19). A quote blocks `standInBack` and `hookResume`: a point-back inside a quote looks only within it ([stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume)). A plain `-r` hook takes the latest landmark whatever its vowel; a stacked hook looks for its own vowels first. A supposition ends with its owner's NOTIONAL frame and is kept shared ([notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing)). Speakers reach the reader, so `pointBackLinks` knows who says each sentence, and it no longer re-resolves inside quotes. `carriedFrames` (`carry.ts`) and `pointBackLinks` (`read.ts`) read the rows. Documented in [discourse slots](../../meta/interpreter.md#discourse-slots).
- **Asides.** An aside is a nested reading of kind `aside` with its own scope-report family. Backward references (pronouns, topic, `standInBack`, `hookResume`) pass in, through `ParseOptions.aside`; nothing passes out. It takes its own act word, a statement when it has none; an aside question sets no `answer` slot; a `yal` inside an aside does not end the carried frame ([spans.md](../../grammar/beginner/spans.md#asides-th), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward)).
- **Approximate quotes.** `~[…]` is an approximate quote, scoped exactly like `[…]`; the gist in your own words is a `darl` / `derl` dependent ([spans.md](../../grammar/beginner/spans.md#exact-approximate-proper)).
- **Stacked hinges.** `stackedHinge` and `stackedNounHinge` in `read.ts` use one word-shape rule: a `/th/` hinge-family word (`clause_hinge:th`, `cause:th`; on `/ɡ/` `clause_hinge:g`) with no `/b/`, right before one with a `/b/`, shares its hosted term and a copy of its `grounds` link. The scope report does not record hosted terms; count those with `find.mjs`.
- **Binder and grounds.** `groundsBinders` in `read.ts` gives each binder frame before a `blarl` that has a next sentence its own `grounds` / `slot:grounds` link. The `grounds` binder cell is `passes (link)` citing [joins.md](../../grammar/beginner/joins.md#everything-ua). `closeSentence` in `resolve.ts` carries a bound reach past the sentence only when `crosses("grounds","boundTag","resolve")` holds. `copied()` in `scope.ts` reads the `binder` column for binder frames.
- **page-readers.** A new `src/parse/*.ts` file holding `page.md#id` anchors trips the page-readers lint. Register it in `scripts/page-readers.ts` (`REGISTRIES`, `READ_FILES`, `registryRefs()`), then run `npm run page-readers -- --write`. `verify -- --allow-generate` does not regenerate read-by blocks: after editing a grammar page or an anchor-holding `src/parse/*.ts` file, run `npm run page-readers -- --write` before verify.
- **Probes.** `node scripts/reading.mjs probe` gives solver output; for scope order, run plain `node scripts/reading.mjs` on the sentence, or the scope report.
- Never run `npx prettier` or another formatter the repo does not depend on.

### Phase 4: the last reading changes

**S4b. A binder reaches later clause-join members (D9, member half).**
Agent `proposal-worker`, `model: opus`, effort `high`. D15 settled (user, 2026-11-24): (a), change `coverage.ts` so a frame copied from a scope record into a later member counts as the same place as its word's earlier place in the sentence; this also clears the `edge:force` doubles.
[joins.md](../../grammar/beginner/joins.md#everything-ua) says a binder reaches to the end of its sentence. Today `zual gogozel vehohel xan zazozor vowurol.` puts `zual` in member 1 only. The S4 worker tried this: in `collectClause`, collect earlier members' binder frames (`out[at].frames` with family `binder`, not inherited) and pass them through `copied(…, "member")`. `--diff` then listed exactly the four expected examples: `clause-sequence.md` `zahelan duwohel vohel xan zazozon derulal vayebel.` and `zalazun dedavol gehol vayebel xan zahelan veruvol.`, `evidentiality.md` `zual gwozeduyol veduyol xam zazozon gwozeduyol. xahol zazozon veduyol.`, and `number-markers.md` `zalazun duzohelx gragel vayebel xal zazozon drager vayebel.` But the copy puts the binder word into two readings of one sentence, and the coverage ratchet in `sweep.test.ts` flags `joinSeries:ua` as a newly unclean key. Apply the change with D15's (a), make the `member` binder cell plain `passes`, and update its test and the `interpreter.md` row. `--diff` lists only those four examples.
**May edit:** `src/parse/scope.ts`, `src/parse/boundaries.ts` and its test, `docs/meta/interpreter.md`, and `coverage.ts` and its test.

**S10. The seam word escapes a sake word under a holder (D16, user).**
Agent `proposal-worker`, `model: opus`, effort `high`.
D16 settled (user, 2026-11-24): (a). The seam word is the speaker's and marks the boundary of the holder's view, so nothing the holder owns covers it, wherever it sits: in `zazozon vezuyol thawethom theyomazozon.` the holder's motive sits inside the seam word, *I gather [Azozon talks to feel connected]*. Today the D7 rule (a channel against a sake keeps text order) fires first for the seam word, because the seam word is a channel. Make `covers:holder` win over it for the seam word only; D7 still holds between a channel and a sake word of the same mind (both yours, or both the holder's). [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers) already states the reading; add a sentence there only if the page does not say the seam word stays outside the holder's view wherever it sits. Add a `design-decisions.md` entry for the rejected text-order reading: it would make the holder's motive the reason for the speaker's own access, and it would make the usual sentence-final seam word read wrongly. Before the change, list with `find.mjs` the examples where a sake or feeling word comes before a seam word; `--diff` lists only those.
**May edit:** `src/parse/scope-profiles.ts` and its test, `src/parse/scope.ts`, `docs/meta/interpreter.md` (family profiles, pair table), `docs/grammar/intermediate/holder.md`, `docs/meta/design-decisions.md`.

**S11. A goodbye ends the point-back, sentence-before and answer slots (D17, D18, user).**
Agent `proposal-worker`, `model: opus`, effort `high`.
D17 and D18 settled (user, 2026-11-24, as recommended): a goodbye ends `standInBack`, `hookResume`, `sentenceBefore` and `answer`, the same as the topic and carried-frame rows. D17: state *ends* in the two goodbye cells and make `pointBackLinks` stop at a goodbye; say so on [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back) and [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume). D18: probe first that today's behavior already ends both slots at a goodbye; if it does, state *ends* in the two cells and say so on [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period) and [questions.md](../../grammar/beginner/questions.md); if it does not, make it end them and report the examples. Before the change, list the examples that point back past a goodbye; `--diff` lists only those.
**May edit:** `src/parse/discourse-slots.ts` and its test, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `docs/meta/interpreter.md` (discourse slots), and the four grammar pages named.

**S12. Any statement word answers a question (D19, user).**
Agent `proposal-worker`, `model: opus`, effort `high`.
D19 settled (user, 2026-11-24, as recommended): (a). A reply opening with any statement word answers the question before it, so a learner can give a soft or hedged answer: `fillAnswers` accepts `yam` and `yar` as well as `yal`, and the rejection of `yam azozon.` is lifted. This is a parser change, so it lands with its grammar edit on [questions.md](../../grammar/beginner/questions.md) (and wherever the answer is taught), drops the spelling from `unassigned-reserved.md` if it is listed there, adds a [classification table](../../meta/interpreter.md#classification-table) row for any new construction id, and states the `answer` statement-word cell. `--diff` lists only examples that open a reply with `yam` or `yar` after a question.
**May edit:** the parser files that reject `yam azozon.`, `src/interpret/read.ts` (`fillAnswers`), `src/parse/discourse-slots.ts` and its test, `docs/meta/interpreter.md`, `docs/meta/unassigned-reserved.md`, `docs/grammar/beginner/questions.md` and the page that teaches answers, if another.

**Phase 4 close.** *Orchestrator.* Bring the user any open decisions S10 to S12 reported. Consolidate, and add the rules S4b and S10 to S12 settled to *What earlier phases built*, which phase 5's page teaches. Expected commits: 4 unit commits, 1 consolidation commit.

### Phase 5: the scope page

**L1. Write the page.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write *How far a word reaches* as the last Intermediate page, in a new unit of its own after *Surprise and what's not so* (Status, D1). Every instance it covers is taught before it, so it uses a real example of each and links back to each. Five sections:

1. How far a word reaches: a word, a phrase, a clause, the rest of the sentence, past the period.
2. Earlier covers later, and the profile properties as the exceptions.
3. Boxes: what gets into a dependent, an island, a quote.
4. Whose it is: you, the holder, the one asked.
5. What carries past a period, and what ends it.

Teach from the profile, boundary and slot tables as phases 2 to 4 left them, and from the rules under *What earlier phases built*. Teach the cells and the seam-word reading S10 to S12 settled, as they left them. Use only forms taught on earlier pages (the build's forward-link lint checks this), and link each rule to the section that teaches its instance. Check every form with one batched `node scripts/parse.mjs --check-lexicon`. Add the page to `reading-order.ts` and a read-by block per [read-by blocks](../../meta/grammar-docs.md#read-by-blocks). Propose new English names for [terminology.md](../../grammar/terminology.md) in the report; don't add them. Leave Practice to L3. Self-check against the [doc-style checklist](../../meta/doc-style.md#checklist).
**May edit:** the new page, `docs/grammar/.vitepress/lib/reading-order.ts`.

**L2. Instance pages lean on the general rule.**
Agent `proposal-worker`, `model: opus`, effort `high`.
On these sections, cut sentences that restate a general rule the reader has already met:

- [clause.md](../../grammar/beginner/clause.md#which-covers-which) (its exceptions table, per D4 and phases 2 to 4; its holder row is already right)
- [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers)
- [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward)
- [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period)
- [feelings.md](../../grammar/intermediate/feelings.md#speaker-attitude)
- [mirative.md](../../grammar/intermediate/mirative.md#mirative)
- [for-a-sake.md](../../grammar/intermediate/for-a-sake.md#whose-stake)

Replace each with one sentence and a link back to the earliest page that states the rule. Never link forward to the new page from an earlier stage page. Read each page's read-by block before rewording practice. Run `npm run page-refs` on any heading whose id changes. Self-check as L1.
**May edit:** those seven pages, `docs/meta/interpreter.md` (anchors that move).

**L3. Practice.**
Agent `checkpoint-writer`, `model: opus`, effort `high`.
Write the new page's `### Practice` checkpoint per [drill-generation.md](../../meta/procedures/drill-generation.md), with the drill allowlist rows it needs.
**May edit:** the new page's Practice section, the drill allowlist.

**L4. Scope cheat sheet (D2).**
Agent `proposal-worker`, `model: opus`, effort `medium`.
Add a cheat sheet whose tables between `<!-- generated -->` markers come from the profile, boundary and slot tables, via `npm run cheat-sheet-blocks -- --write`. Extend that script to import them, and fence the `--write` per [fence automated rewrites](../../meta/procedures/proposals.md#fence-automated-rewrites). Each row links to its owning section.
**May edit:** `docs/grammar/cheat-sheets/` (the new page), the cheat-sheet block script, `docs/grammar/.vitepress/lib/reading-order.ts` (the cheat-sheet list).

**L5. Style review of the scope page.**
Agent `style-editor`, `model: opus`, effort `high`. A fresh context that made none of L1 to L4.
Review the whole of *How far a word reaches*, Practice included, against [doc-style.md](../../meta/doc-style.md). Only this page: L2's edits to existing pages wait for the later full style pass (Status). It runs last, after L3 and L4, so it sees the page as it ships.
**May edit:** the new page.

**Phase 5 close.** *Orchestrator.*

1. Add the terminology names L1 proposed (a review-later decision, its own commit).
2. Add the new page to the grammar table in `AGENTS.md`.
3. Run a full `npm run verify` against an empty baseline.
4. Delete this proposal once `interpreter.md` and the grammar own the result.

Expected commits: 5 unit commits (L1 to L5), 1 for the cheat-sheet tool output, 1 terminology commit, 1 `AGENTS.md` commit, 1 final commit.

### Rule digest (copied into every brief)

- Read only the pages and files your brief names, in slices: list headings or declarations first (`npm run -s outline -- FILE`), then read the ranges you need.
- **Readings change only where your unit says.** `npm run scope-report -- --diff` lists only the examples your unit names, and is empty for a unit that changes no reading. Update only the tests and solver goldens your unit names. Never edit `run.test.ts` or a `src/game/` test to get green. If any other reading changes, stop and report.
- **Never settle a grammar question your brief does not settle.** A rule the pages don't state keeps today's behavior, is marked `unstated (today: …)` with its anchor left empty, and goes in your report. A rule you think is wrong goes in your report as a finding, not a fix.
- Each profile property, boundary cell and slot cell cites the grammar section that states it, as `page.md#id`.
- A parser or reader change lands with the grammar edit that teaches it. A newly rejected form also goes in `unassigned-reserved.md`, and a rejection with a reason goes in `design-decisions.md`. A new construction id gets its row in the [classification table](../../meta/interpreter.md#classification-table).
- Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`; on a stage page add `--at <page>#<id>`. Probe readings with one `node scripts/reading.mjs probe` file (cases separated by `---`). Count examples with `node scripts/find.mjs`. Never write a one-off script for these. Run `.ts` probes with `npx --no-install tsx`.
- Before writing a helper, look in `package.json` and `scripts/` for one that exists, and extend it.
- Keep files under the [code layout](../../meta/code-layout.md) ceiling. Move code with `npm run move-decl`, never by hand.
- Run `npm run verify -- --allow-generate` at the end of the unit (`--fast` for checks inside it). On a new error, read only that line of `tmp/logs/verify-last.log`.
- Grammar prose: self-check against the [doc-style checklist](../../meta/doc-style.md#checklist). Only the new scope page gets a style review (L5); edits to existing pages wait for a later full pass.
- Do not commit. Do not edit `AGENTS.md`: report any Owns-line change.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report** (about 150 words): done (one line); rules, cells or exceptions changed, as counts; `unstated` cells (one line each); findings (one line each); open decisions written up (one line each); `scope-report -- --diff` result (which examples changed); `verify` line; skips with reasons; Owns-line changes; **left:**; **inefficient:**.

### Commits

One commit per unit after its gate, staged with that unit's files only. Each is named `scope-model.md <ID>: <what it did> [skip-cd]`, with the co-author line. Each phase ends with a commit of the consolidated proposal. Expected: phase 4, 9.

## Open decisions

D1 to D19 are settled (Status).

## Background

### Problem

The grammar's rules on how far a word reaches are stated piece by piece, and the code mirrors that scatter:

- **Order of two whole-clause frames.** `PAIR_ROWS` has 158 rows. About 97 say *the earlier covers the later*. 18 say a call commutes. 13 put `force` over the other frame, and 9 of those cite only that the act word sits on the left edge, outside the body: that is nesting by the tree (reader rule 2), not a pair rule. The few real exceptions are hard to see among the repeats.
- **Whose a frame is.** "Stays yours" appears on several pages with different reach. A speaker attitude escapes a question, a holder and a carried frame. MIRATIVE and a sake word escape a question but not a holder: a holder covers MIRATIVE, and a sake word follows text order against a holder. A `contrary` frame escapes neither, yet commutes with the other remarks. WANT, PLAN and DECISION neither take nor end a carried frame. Each is a hand-written row or a constant (`REMARKS`, `NO_CLAIM_KEYS`, `ATTITUDE_KEY`).
- **Boxes.** Five kinds of nested reading (clause-join member, dependent, a hinge's `blarl` next sentence, scope island, quote) each let a different set of things through: a holder goes into a dependent, a carried frame never starts in a dependent or join member, nothing carries into a quote, a binder and a bound tag go on through a stand-in. The rules are conditions spread across `readClause`, `readIsland`, `carriedFrames` and the `scoped` flag.
- **Past a period.** Carried frames live in the parser's resolve stage (`carry.ts`), the topic in the resolver, stand-in point-back and hook resume in the reader (`pointBackLinks`). Each has its own start, end and per-speaker rules, and no one place says which state crosses a speaker change, a quote, *by the way* or a goodbye.
- **Placement in two stages.** The scope stage places whole-clause frames for scoped clauses. The reader places them again for islands and verb-list items (`placeFrame` with `scoped: false`, `memberFrame`), so reach is computed twice.
- **One-off constructions.** `stackedHinge` and `stackedNounHinge` match the glosses `only-if` and `because`. `readStanceList`, `framedMember` and restrictor occasions are other hand-built cases.

So the grammar has no single statement of its scope rules. A learner meets *earlier covers later* in [clause.md](../../grammar/beginner/clause.md#which-covers-which) and then a dozen local exceptions, and an editor can't see which exceptions are principled and which are accidents.

### Goals

1. The code states each scope rule once, as data: family profiles that generate the pair table, a boundary table, and a table of what carries past a period. Phase 1 changes no reading.
2. A report shows how often each rule fires over the doc examples, and lists the rules the grammar never states or that fire only in their own example.
3. An audit turns those results into concrete simplifications, each as a user decision with a recommendation.
4. The accepted simplifications land in the grammar and the code together.
5. One teaching page presents reach, order, boxes, ownership and carry as one system, so instance pages can lean on it.

### Non-goals

- No reading changes in phase 1, and in phases 2 to 4 only those the decisions name. A unit that changes any other reading stops and reports.
- No change to the solver, the matcher or the log beyond what a phase 2 to 4 decision requires.
- No change to the shape of `ResolveInfo`, `ClauseScope`, `Reading` or `Link`, except additive exports (such as an `explainPair` function) and the records U4 adds for islands.
- No moving of `pointBackLinks` into the resolve stage. The discourse-slot table describes both layers; it does not merge them.
- No style review of edits to existing pages (see Status). Only the new scope page gets one.
- No split of `read.ts` for size alone. It is under the ceiling.
