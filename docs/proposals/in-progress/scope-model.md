# Scope model: one statement of reach, order, ownership and carry

**Status:** IN PROGRESS. Phase 1 stopped after U3 at the user's request, 2026-11-24; U4, U5, U6 and the phase 1 close remain, and the next session starts at U4. Phase 1 commits so far: `cdd63e7b` start, `3086d93f` U1, `856423e9` U2, `838e2906` U3. Decided 2026-11-24 (user): edits to existing pages get no style review, because a full style pass over them follows later; the new scope page is not in that pass, so it gets its own style review (L5). Writers of grammar prose still self-check against the [checklist](../../meta/doc-style.md#checklist). Decided 2026-11-24 (user, both as recommended): D1, the scope page is a synthesis page closing Intermediate, in a unit of its own after *Surprise and what's not so*, titled *How far a word reaches*; D2, a scope cheat sheet generated from the profile, boundary and slot tables (L4 runs).

**Related:** [interpreter.md](../../meta/interpreter.md) ([frame families](../../meta/interpreter.md#frame-families), [family profiles](../../meta/interpreter.md#family-profiles), [boundaries](../../meta/interpreter.md#boundaries), [links](../../meta/interpreter.md#links), [scope statements](../../meta/interpreter.md#scope-statements), [reader rules](../../meta/interpreter.md#reader-rules), [pair table](../../meta/interpreter.md#pair-table)); [scope.ts](../../../src/parse/scope.ts) (`FRAME_KEYS`, `PAIR_ROWS`, `orderPair`, `clauseScopes`); [scope-profiles.ts](../../../src/parse/scope-profiles.ts) (`PROFILES`, `derivePairRows`, `EXCEPTIONS`, `explainPair`); [boundaries.ts](../../../src/parse/boundaries.ts) (`BOUNDARIES`); [scope-report.ts](../../../src/interpret/scope-report.ts) (`npm run scope-report`); [carry.ts](../../../src/parse/carry.ts); [read.ts](../../../src/interpret/read.ts) (`readClause`, `readIsland`, `readDependent`, `stackedHinge`, `pointBackLinks`, `carriedLinks`); [read-context.ts](../../../src/interpret/read-context.ts) (`placeFrame`, `memberFrame`, `framedMember`, `Here.scoped`); [scope.test.ts](../../../src/parse/scope.test.ts); [classes.test.ts](../../../src/interpret/classes.test.ts); the corpus walk in [accounting-walk.ts](../../../src/interpret/accounting-walk.ts) and [sweep.ts](../../../scripts/sweep.ts). Grammar: [clause.md](../../grammar/beginner/clause.md#which-covers-which), [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period), [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [feelings.md](../../grammar/intermediate/feelings.md#speaker-attitude), [mirative.md](../../grammar/intermediate/mirative.md#mirative), [for-a-sake.md](../../grammar/intermediate/for-a-sake.md#whose-stake), [joins.md](../../grammar/beginner/joins.md#everything-ua), [universals-domains.md](../../grammar/intermediate/universals-domains.md#bound-tags), [scope-islands.md](../../grammar/intermediate/scope-islands.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts).

**Depends on:** none. **Order:** never run a phase of this proposal at the same time as a phase of `reading-realizer.md`, because both edit `read.ts` and `read-context.ts`. Running phase 1 of this proposal first is recommended: realizer unit U14 places frames from the pair table, and phase 1 here turns that table into a few rules it can follow.

**Design authority:** *none* for phase 1: it restructures code and editor notes, and every reading stays the same. Phase 2 changes only the readings the user accepts under [Open decisions](#open-decisions), each through its owning grammar page. Phase 3 adds one teaching page and one cheat sheet, and adds or changes no form.

## Design

The family profiles, the boundary table and the scope report are built; [built so far](#phase-1-the-scope-model-in-code) says where. What is left to build:

### One placement stage

The scope stage produces a scope record for every clause-like unit whose frames reach the unit: islands and verb-list items as well as bodies, members and dependents. The reader then copies scope records only. `placeFrame` keeps its use for frames that reach less than a clause, and the `scoped` flag and the `unscoped` unread reason go away. If giving an island a record would change any reading or carried frame, the unit stops and reports.

### Discourse slots

A `DISCOURSE_SLOTS` table in a new `src/parse/discourse-slots.ts`, one row per piece of state that crosses a period:

- the carried frame (channel, holder, NOTIONAL, dated offset)
- the topic
- the latest content per act vowel (`-rth` stand-ins)
- the latest extra-noun hook per vowel (hook resume)
- the NOTIONAL supposition a question points to
- the sentence before (linker, discourse hook, polar word)
- the question an answer fills

Columns: set by, read by, ended by (a new value, a written statement word, *by the way*, a goodbye), kept per speaker or shared, crosses a quote, anchor. `carriedFrames` reads its end events and per-speaker rule from its row. `pointBackLinks` reads its own row for whether it looks past a speaker change. A cell the pages don't state is marked `unstated (today: …)`, as in the boundary table.

### Seed findings for the audit

These come from reading the code for this plan and from U2 and U3. U6 checks them against the report and adds to them.

- **F1. `force` rows are tree nesting.** The edge rows follow from reader rule 2. The pair table and the beginner exceptions table could say "the act word stands outside the sentence" once, not 13 times. This changes only editor notes and wording.
- **F2. Remarks escape different frames.** `attitude` escapes `force`, `holder` and the carried frame. `mirative` and `sake` escape only `force`. `contrary` escapes none but commutes with the other three. One class of *remarks that stay yours* would replace four behaviors.
- **F3. The holder is the one position-free clause frame.** It covers everything in its clause wherever it sits, except `sake` and `hinge`, which follow text order against it. Options include letting the holder follow text order like every other frame, or letting it cover `sake` and `hinge` too.
- **F4. Channel-only cases.** A channel commutes with `attitude` and `mirative` and sits over a hinge, while MAY follows text order in all three. A stated reason ("a channel is grounds, not a claim") could explain all three at once, or they could be dropped.
- **F5. MAY under a holder.** The holder carries past a period and the MAY does not.
- **F6. Stacked hinges by gloss.** *Only because* is two hard-coded glosses. A general rule ("a frame word with an empty `/b/` right before another frame word shares its `/b/`") would cover it, along with any later stack.
- **F7. Unstated cells** from the boundary and slot tables. The boundary table has 25, frozen in `src/parse/boundaries.test.ts` and listed in [boundaries](../../meta/interpreter.md#boundaries); most are `outerFrames` and `carried` cells on member, dependent and `blarl` grounds rows, the quote's outer frames, holder and binder, and every aside cell but carry end.
- **F8. Binder reach stated but not carried.** [joins.md](../../grammar/beginner/joins.md#everything-ua) says a binder reaches to the end of the sentence and into the sentence a `blarl` points to. Today a binder in one join member is not in a later member's scope, and nothing carries it into the grounds sentence. The boundary table records the page's cell; the code keeps today's behavior.
- **F9. Bound tags bypass the table.** Bound-tag reach lives in `resolve.ts`, which U3 could not edit, so the `boundTag` cells are recorded but nothing consults them.
- **F10. Pair rows cite fewer anchors than their rule.** `binder` × `hinge` cites only `dependents.md#hinges` (no `blarth` anchor); `polarity` × `binder` leaves out STANDALONE; `polarity` × `phase` leaves out REACH although `phase` has a `/th/` form; the four edge rows with their own anchor cite only it, not ACT_EDGE. The frozen rows keep these as they are.
- **F11. Report blind spots.** No example has a `blarl` sentence with its next sentence, so the grounds row is never exercised, and the report counts asides under `quote`. U6 says whether either hides a candidate.

## Implementation plan

Three phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

- **Phase 1** restructures the code with no change to any reading, then audits it. It ends with the phase 2 decisions due from the user.
- **Phase 2** lands the accepted simplifications. Its units are written at the end of phase 1, from the decisions.
- **Phase 3** writes the teaching page.

Each phase reads a different set of pages, and phase 2 needs the user's answers to phase 1's findings.

**Gates.** At the start of each session the orchestrator saves `npm run verify -- --baseline` and `npm run scope-report -- --save`. Each unit ends with `npm run verify -- --allow-generate`, and the unit passes before its commit. In phase 1, every unit after U1 also shows an empty `npm run scope-report -- --diff`. No phase 1 unit edits a test expectation, a solver golden (`src/interpret/fixtures/solve-*.lp`), `run.test.ts` or a `src/game/` test. In phase 2, `--diff` lists only the examples the unit's decision names. The final gate is a full `npm run verify` against an empty baseline at the end of phase 3. The proposal edits no `say-*.md`, `english.md` or `src/english-helper/`, so it has no recall gate. Its style gate covers the new scope page only (L5, Status).

### Phase 1: the scope model in code

**Built so far** (U1 to U3; input for U4 to U6):
- **Scope report.** `npm run scope-report` (`scripts/scope-report.ts`, logic in `src/interpret/scope-report.ts`). `--save` writes `tmp/state/scope-report.json`, `--diff` compares to it, the full report is `tmp/logs/scope-report.md`. Per reading it records frame families, order entries, unordered pairs, stance lists, nested-reading kind and links (targets as sentence offsets). It counts examples per `explainPair` rule id and per boundary cell; U5 adds slot counts. Walk helpers `forEachExample`, `readSnapshot`, `writeSnapshot` are exported from `src/interpret/accounting-walk.ts`.
- **Family profiles.** `src/parse/scope-profiles.ts`: `PROFILES` (18 families), `derivePairRows()` (8 rules), `EXCEPTIONS` (6), `explainPair`, `caseMatches`. `PAIR_ROWS` in `scope.ts` is derived; a frozen-rows test guards it. Escapes are `force`, `holder`, `carried` and `remark` (two remarks commute). The `carried` escape sits on members (`slot:th` attitude, sake feeling words), since interjections in `attitude` are not covered today; aim members have `claims: false`. `carry.ts` reads both. Documented in [family profiles](../../meta/interpreter.md#family-profiles).
- **Boundaries.** `src/parse/boundaries.ts`: `BOUNDARIES`, 7 nested-reading rows by 8 columns. A passing cell also names how it reaches the nested reading (`copy`, `nesting`, `link`, `resolve`, `sentence`). Consulted by `collectClause` through `copied()` in `scope.ts`, `nestedCarry` in `carry.ts`, and `carriedLinks` in `read.ts` through `nestedKinds` in `read-context.ts`. Documented in [boundaries](../../meta/interpreter.md#boundaries).
- **page-readers.** A new `src/parse/*.ts` file holding `page.md#id` anchors trips the page-readers lint. Register it in `scripts/page-readers.ts` (`REGISTRIES`, `READ_FILES`, `registryRefs()`) as U2 and U3 did, then run `npm run page-readers -- --write`.
- Never run `npx prettier` or another formatter the repo does not depend on.

**U4. One placement stage.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Carry out [one placement stage](#one-placement-stage). What passes into a nested record already comes from `BOUNDARIES` through `copied()` in `collectClause`; give islands and verb-list items their records through the same path, keeping every cell's value. Measure first with `npm run deps` on `read-context.ts`. If an island or verb-list item record would change a carried frame, or `ResolveInfo.scope` consumers in `gloss-structure.ts` or `src/game/` would need more than skipping the new records, stop and report. Update [reader rules](../../meta/interpreter.md#reader-rules) and the `unread` reasons in `interpreter.md`.
**May edit:** `src/parse/scope.ts`, `src/parse/types.ts` (a record field only), `src/parse/gloss-structure.ts` (skipping the new records only), `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/types.ts` (dropping the `unscoped` reason), `src/interpret/coverage.ts`, the matching tests (removing `unscoped` cases only), `docs/meta/interpreter.md`.

**U5. Discourse slots.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write `src/parse/discourse-slots.ts` per [discourse slots](#discourse-slots). Make `carriedFrames` and `pointBackLinks` read their rows, with no change in output. Find each cell's stating sentence in [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [topic.md](../../grammar/intermediate/topic.md), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume), [notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing), reading slices only. Unstated cells are handled as in U3. Add slot counts to the scope report. In `interpreter.md`, add a *Discourse slots* section after *Links*, and cut the carried-frame row of the links table down to a pointer to it.
**May edit:** `src/parse/discourse-slots.ts`, `src/parse/discourse-slots.test.ts`, `src/parse/carry.ts`, `src/interpret/read.ts`, `src/interpret/scope-report.ts`, `docs/meta/interpreter.md`, and `scripts/page-readers.ts` only to register the new table (then `npm run page-readers -- --write`, which rewrites generated read-by blocks).

**U6. Audit: simplification candidates.**
Agent `proposal-worker`, `model: opus`, effort `high`. A fresh context that made none of U1 to U5.
Inputs: the full scope report (`tmp/logs/scope-report.md`), the exception list, the `unstated` cells, the [seed findings](#seed-findings-for-the-audit), and the [scope statements](../../meta/interpreter.md#scope-statements). Also list every reader or scope rule that matches a specific gloss value or a single key (`stackedHinge`, `readStanceList`, `framedMember`, restrictor occasions, `PHRASE_FRAMES`, others found with `grep -n "values.gloss ===\|key === \"" src/interpret/read*.ts src/parse/scope.ts src/parse/carry.ts`). For each candidate, check the examples behind it with `npm run scope-report` sample texts and one batched `node scripts/reading.mjs probe` file. Write each as an open decision in this proposal (D3 onward), per [open decisions](../../meta/procedures/proposals.md#open-decisions):
- the problem
- the options, always including *keep as is*
- which pages and how many examples change
- the effect on the learner
- the decision class
- **Recommendation:** with confidence

Group the candidates that would land together. Change no code and no grammar page.
**May edit:** `docs/proposals/ready/scope-model.md` (or its `in-progress/` path), under *Open decisions* only.

**Phase 1 close.** *Orchestrator.*
1. Apply the `AGENTS.md` Owns-line change for `interpreter.md`: add *family profiles, boundaries, discourse slots*.
2. Consolidate. Write the phase 2 S-units from U6's decisions, one unit per group, each marked *waits on D<n>*.
3. Tell the user the decisions due.

Expected commits left: 3 unit commits, 1 `AGENTS.md` commit, 1 consolidation commit.

### Phase 2: simplifications

Written at phase 1 close, one S-unit per accepted group of decisions, in this form:

**S<n>. <decision topic> (D<n>).**
Agent `proposal-worker`, `model: opus`, effort `high`.
Change the profile, boundary or slot data and any code the decision names. Then edit the owning grammar sections, so the parser and the grammar land together:
- `interpreter.md` (scope statements, pair-table rows and samples)
- a [design-decisions.md](../../meta/design-decisions.md) entry for each alternative the user rejected with a reason
- [unassigned-reserved.md](../../meta/unassigned-reserved.md) if a form is newly rejected

Update the solver goldens and run tests the decision names, and only those. Find Practice items that use a changed construction with `node scripts/find.mjs`, and fix any whose answer changes, per [drill-generation.md](../../meta/procedures/drill-generation.md). `npm run scope-report -- --diff` lists only the examples the decision names.
**May edit:** the files the decision's write-up names, plus `src/parse/scope-profiles.ts`, `src/parse/boundaries.ts`, `src/parse/discourse-slots.ts` and their tests, `docs/meta/interpreter.md`, `docs/meta/design-decisions.md`.

A decision the user rejects gets a `design-decisions.md` entry only when it has a reason beyond *keep as is*. The orchestrator writes that entry itself.

**Phase 2 close.** *Orchestrator.* Consolidate, and note the settled rules that the phase 3 page teaches. Expected commits: one per S-unit, plus one consolidation commit.

### Phase 3: the scope page

**L1. Write the page.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write *How far a word reaches* as the last Intermediate page, in a new unit of its own after *Surprise and what's not so* (Status, D1). Every instance it covers is taught before it, so it uses a real example of each and links back to each. Five sections:
1. How far a word reaches: a word, a phrase, a clause, the rest of the sentence, past the period.
2. Earlier covers later, and the profile properties as the exceptions.
3. Boxes: what gets into a dependent, an island, a quote.
4. Whose it is: you, the holder, the one asked.
5. What carries past a period, and what ends it.

Teach from the profile, boundary and slot tables as phase 2 left them. Use only forms taught on earlier pages (the build's forward-link lint checks this), and link each rule to the section that teaches its instance. Check every form with one batched `node scripts/parse.mjs --check-lexicon`. Add the page to `reading-order.ts` and a read-by block per [read-by blocks](../../meta/grammar-docs.md#read-by-blocks). Propose new English names for [terminology.md](../../grammar/terminology.md) in the report; don't add them. Leave Practice to L3. Self-check against the [doc-style checklist](../../meta/doc-style.md#checklist).
**May edit:** the new page, `docs/grammar/.vitepress/lib/reading-order.ts`.

**L2. Instance pages lean on the general rule.**
Agent `proposal-worker`, `model: opus`, effort `high`.
On these sections, cut sentences that restate a general rule the reader has already met:
- [clause.md](../../grammar/beginner/clause.md#which-covers-which) (its exceptions table, per F1 and phase 2)
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

**Phase 3 close.** *Orchestrator.*
1. Add the terminology names L1 proposed (a review-later decision, its own commit).
2. Add the new page to the grammar table in `AGENTS.md`.
3. Run a full `npm run verify` against an empty baseline.
4. Delete this proposal once `interpreter.md` and the grammar own the result.

Expected commits: 5 unit commits, 1 for the cheat-sheet tool output, 1 terminology commit, 1 `AGENTS.md` commit, 1 final commit.

### Rule digest (copied into every brief)

- Read only the pages and files your brief names, in slices: list headings or declarations first (`npm run -s outline -- FILE`), then read the ranges you need.
- **Phase 1 changes no reading.** `npm run scope-report -- --diff` must be empty after your change. Never edit a test expectation, a solver golden, `run.test.ts` or a `src/game/` test to get green. If behavior changes, stop and report.
- **Never settle a grammar question.** A rule the pages don't state keeps today's behavior, is marked `unstated (today: …)` with its anchor left empty, and goes in your report. A rule you think is wrong goes in your report as a finding, not a fix.
- Each profile property, boundary cell and slot cell cites the grammar section that states it, as `page.md#id`.
- Phase 2: a parser or reader change lands with the grammar edit that teaches it. A newly rejected form also goes in `unassigned-reserved.md`, and a rejection with a reason goes in `design-decisions.md`. A new construction id gets its row in the [classification table](../../meta/interpreter.md#classification-table).
- Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`. Probe readings with one `node scripts/reading.mjs probe` file (cases separated by `---`). Count examples with `node scripts/find.mjs`. Never write a one-off script for these. Run `.ts` probes with `npx --no-install tsx`.
- Before writing a helper, look in `package.json` and `scripts/` for one that exists, and extend it.
- Keep files under the [code layout](../../meta/code-layout.md) ceiling. Move code with `npm run move-decl`, never by hand.
- Run `npm run verify -- --allow-generate` at the end of the unit (`--fast` for checks inside it). On a new error, read only that line of `tmp/logs/verify-last.log`.
- Grammar prose: self-check against the [doc-style checklist](../../meta/doc-style.md#checklist). Only the new scope page gets a style review (L5); edits to existing pages wait for a later full pass.
- Do not commit. Do not edit `AGENTS.md`: report any Owns-line change.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report** (about 150 words): done (one line); rules, cells or exceptions added, as counts; `unstated` cells (one line each); findings (one line each); `scope-report -- --diff` result; `verify` line; skips with reasons; Owns-line changes; **left:**; **inefficient:**.

### Commits

One commit per unit after its gate, staged with that unit's files only. Each is named `scope-model.md <ID>: <what it did> [skip-cd]`, with the co-author line. Each phase ends with a commit of the consolidated proposal. A review-later decision gets its own commit per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision). Expected for phases 1 and 3: about 15 commits; phase 2 adds one per S-unit.

## Open decisions

D1 and D2 are settled (Status). D3 to D14 come from the U6 audit, run against `tmp/logs/scope-report.md` after U5 and a batch of readings (`reading.mjs --file`). Groups that would land together: **G1** D3; **G2** D4, D6 and D8 (wording and editor notes, no reading changes); **G3** D5 and D7 (profile escapes and member cases); **G4** D9 (binder and bound-tag reach); **G5** D10, D11 and D12 (unstated cells, asides, quotes and slots); **G6** D13 and D14 (code tidy).

### D3. Stacked hinges: one rule instead of two glosses

**Problem.** `stackedHinge` in `read.ts` (and `stackedNounHinge`) matches two glosses: an *only-if* hinge with no `/b/` right before a *because* hinge with one shares its `/b/`. Two other stacks are stated and not read. `because-and-iff.md#choosing-a-hinge`: "For *even if*, put the *although* hinge `thezem` right before `thohem`." `cause.md#mechanism`: "`thewom` right before the hinge, and the trigger in the hinge's `/b/`." Read today, `zazozon vowurol thewom thohem blerulal.` and `zazozon vowurol thezem thohem blarl zalazun vezuvel.` leave `thewom` and `thezem` with no hosted term; only `thebem thahum` shares it.

**Options.**
1. Keep as is: two glosses; *even if* and CAUSE stacks stay unread.
2. Add the two stated stacks as further gloss pairs.
3. One word-shape rule: a `/th/` hinge-family word (`overlay:clause_hinge:th`, `overlay:cause:th`) with no `/b/` right before a `/th/` hinge that has one shares that hinge's `/b/` and grounds link; the same on `/ɡ/` among a noun's details.
4. Option 3 for any frame word with an empty `/b/` (F6 as seeded). MAY or a channel right before a hinge (`theyom thahum blarl`, `thomam thahul blarl`) have no `/b/` to share, so this reads nothing more than option 3 and states a broader rule than any page does.

**Pages and examples.** Option 3: no grammar page changes; `interpreter.md` hinge scope statements add the two anchors. About 14 distinct doc examples gain a hosted term (`thewom` + hinge on `cause.md` and `say-reasons.md`, `thezem thohem` on `because-and-iff.md`, `say-reasons.md` and the *why* cheat sheet).

**Learner.** None directly: the pages already teach all three stacks. The solver can then answer *what triggered it* and *even if what* questions on them.

**Class.** Autonomous (following the grammar): each stack is stated on its page; option 3 only reads what they say. Option 4 would be blocking (precedent: a rule for every frame word that no page states).

**Recommendation:** (high) option 3. It covers every stated stack with one rule keyed on word shape, as the pages describe it ("right before the hinge"), and drops the gloss match.

### D4. The act word's rows as one statement

**Problem (F1).** The `edge` rule gives every body family that does not escape `force` its own pair-table row (103 examples), each citing the act-word anchor. They all follow from the act word standing on the turn's edge outside the body (reader rule 2). The beginner table in `clause.md#which-covers-which` already says it once.

**Options.** 1. Keep the rows as they are. 2. Keep the derived rows in code (the frozen-rows test guards them), and in `interpreter.md` replace the edge rows of the pair table with one line: the act word covers every body frame that does not escape `force`, by tree nesting.

**Pages and examples.** `interpreter.md` only; no grammar page, no reading changes.

**Learner.** None: editor notes.

**Class.** Autonomous (writing, code shape).

**Recommendation:** (high) option 2, if the pair table is hand-kept; if it is generated, have the generator fold the edge rows.

### D5. Remarks that stay yours: one class or four behaviors

**Problem (F2).** Four families escape different frames. `attitude` escapes `force`, `holder`, a carried frame (its `/th/` roots) and other remarks. `mirative` escapes `force` and remarks. `sake` escapes `force`, remarks, and a carried frame (its feeling words). `contrary` escapes only remarks: `yel zazozon vowurol uom thagom.` reads the act word over the `uom` frame. The pages do not let all four collapse: `holder.md#what-the-holder-covers` says a sake word after the holder is the holder's ("The second is Azozon's"), so `sake` cannot escape `holder`. No page states `mirative` against a holder (today the holder covers it) or `contrary` in a question.

**Options.**
1. Keep as is.
2. One class for the `force` escape: all four remarks stay outside a question and commute with each other; `holder` and carried-frame escapes stay per family, as their pages state. Only `contrary` changes: in a question, `uom` + its word stays yours.
3. Full unification: one class escaping `force`, `holder` and the carried frame. Contradicts the sake sentence of `holder.md` and changes `holder > mirative` readings.

**Pages and examples.** Option 2: `contrary-to.md` gains a sentence on questions; the beginner table row *A word that only gives your own feeling, your surprise, or whose good the act serves* adds *or what the event went against*. Two examples change (`force > contrary`: 2 in the report). Option 3: `holder.md`, `mirative.md`, and 5 `sake > holder` plus 2 `holder > mirative` examples.

**Learner.** Option 2 turns three named words in the beginner row into one class with four members, and one more word to learn in it. Option 3 would contradict what `holder.md` teaches.

**Class.** Blocking (precedent): option 2 sets a rule for a family of constructions and gives `contrary` a reading in a question no page states.

**Recommendation:** (low) option 2. *Contrary to plan* in a question reads naturally as the asker's own remark, as surprise does, but no page says so. A `contrary-to.md` sentence on questions, or the user's judgment of `yel zazozon vowurol uom thagom.`, would settle it.

### D6. The holder: covers its clause, except sake and *so that*

**Problem (F3).** The holder is the one clause frame free of position: it covers everything in its clause (13 `covers:holder` examples, 102 `seam:holder`), except a sake word and a hinge, which follow text order against it (exceptions `sake-holder`, `hinge-holder`, 6 examples each). The beginner table says the holder "covers the whole clause, wherever it sits", which a sake word or *so that* before the holder contradicts.

**Options.**
1. Keep the model as is.
2. Keep the model, and make the beginner row exact: *Covers the whole clause, wherever it sits, except a sake or* so that *word before it*. Or link the row to `holder.md#what-the-holder-covers` for the two cases.
3. The holder follows text order like every frame. Contradicts `holder.md#what-the-holder-covers` against `occasion` ("a sweeping *never* or *always* covers only the times you both remember", with `hal` before the holder: `zawan vebal hal thevumayan.`), and "covers its clause".
4. The holder covers sake and hinges too. Contradicts the two `holder.md` sentences that are the exceptions.

**Pages and examples.** Option 2: one row on `clause.md`; no reading changes. Option 3: `holder.md`; 13 `covers:holder` examples change. Option 4: `holder.md`, `holder-plans-and-motives`; 12 examples change.

**Learner.** Option 2 removes a beginner rule that the intermediate page then breaks. Options 3 and 4 trade one exception for a reading the pages now teach otherwise.

**Class.** Option 2 autonomous (writing). Options 3 and 4 blocking (contradiction).

**Recommendation:** (high) option 2. Both exceptions are stated on `holder.md` with reasons a learner can follow (whose aim, whose stake); the beginner row is the only thing that misleads.

### D7. A channel's own cases: one reason, or drop them

**Problem (F4).** A channel commutes with `attitude` and `mirative` and covers a hinge wherever it sits (`member:channel`, 31 examples), while MAY follows text order against all three (`thomam thevemem …` reads MAY over the attitude; `zazozon thahum blerulal thomam vowurol.` the hinge over MAY). Each case cites its own page sentence. Also, `evidentiality.md#evidence-clause` says "A cause or condition word may not come before the channel", but `zazozon thahum blerulal theyom vowurol.` parses and reads the channel over the hinge.

**Options.**
1. Keep the three cases as they are.
2. Keep the readings, and state one reason on `evidentiality.md`: a channel says what backs the claim, so it is neither about your feeling or surprise nor under them, and a cause or condition is part of what it backs. The three member cases cite that one sentence.
3. Drop the cases: a channel follows text order like MAY. Changes up to 31 examples and contradicts `evidentiality.md#evidence-clause` and `feelings.md#speaker-attitude` ("the channel says what backs it").
4. For the hinge-before-channel order the page forbids: reject it, or keep reading it as now.

**Pages and examples.** Option 2: `evidentiality.md` gains one sentence; no reading changes. The reason must not reach `sake` or `contrary`: a channel against those follows text order today (8 `sake`/channel examples).

**Learner.** Option 2 gives one reason in place of three facts. Option 4's rejection would ban a form the learner may reach for.

**Class.** Option 2 review later (new learning: a reason stated on a grammar page). Option 3 blocking (contradiction). Rejecting under option 4 is blocking (restricting the language).

**Recommendation:** (medium) option 2, and keep reading the hinge-first order as today: the page's *may not* is advice the reading already honors, since the channel covers the hinge either way.

### D8. MAY under a holder does not carry

**Problem (F5).** `zalazun thomamazozon vudurul. zalazun vezuvel.` carries the holder to the next sentence and not the MAY; with a channel (`theyomazozon`) both carry. `holder.md#naming-a-holder` states it: "A holder on MAY carries too, but the MAY stays on its own sentence."

**Options.** 1. Keep as is. 2. MAY carries with its holder. 3. A holder on MAY does not carry.

**Pages and examples.** Options 2 and 3 change `holder.md` and the `carry:holder` link on MAY examples (1 in the report).

**Learner.** The asymmetry is taught in one sentence with its reason (MAY is not how you learned the claim). Options 2 and 3 replace a stated rule.

**Class.** Options 2 and 3 blocking (contradiction).

**Recommendation:** (high) option 1. It is stated, and MAY is not a channel, so it has no reason to carry.

### D9. Binder and bound-tag reach from the boundary table

**Problem (F8, F9, F11).** `joins.md#everything-ua` says a binder reaches to the end of the sentence and into the sentence a `blarl` points to. Today a binder in one clause-join member is not in a later member's scope (`zual gogozel vehohel xan zazozor vowurol.` puts `zual` in member 1 only), and nothing carries it into the grounds sentence (`zual gogozel vezuvel thahum blarl. gogozer vowurol.` links the grounds but not the binder). The `member` and `grounds` binder cells say *passes, today: blocks*. Bound-tag reach lives in `resolve.ts`, so the `boundTag` cells are recorded and never consulted. No doc example has a `blarl` sentence with its next sentence, so the `grounds` row is never exercised.

**Options.**
1. Keep as is: cells record the page, the code keeps today's reach.
2. Carry out the page: the binder copies into later members and reaches the grounds sentence through the grounds link; `resolve.ts` reads the `boundTag` cells; add one example of a binder with a `blarl` sentence after it to `joins.md#everything-ua`.
3. Reword `joins.md` to today's behavior (the binder stops at the member and at the period).

**Pages and examples.** Option 2: `joins.md` gains one example; readings change only in member examples with a binder in a non-final member (the `member` row has 50 examples in all; `scope-report -- --diff` gives the count). The `boundTag` change should change no reading; if it does, that is a finding.

**Learner.** Option 2 makes the reader do what the beginner page teaches. Option 3 narrows a taught rule.

**Class.** Option 2 autonomous (following the grammar). Option 3 blocking (contradiction).

**Recommendation:** (high) option 2 for the bound tags (code shape only); (medium) for the binder cells, because the member case changes readings and its one sentence ("to the end of its sentence") is all the page says about joins.

### D10. The unstated boundary and slot cells

**Problem (F7, U5 a).** 25 boundary cells and 28 slot cells are `unstated (today: …)`. With examples behind them: `standInDependent` outer frames and carried frame (239 examples), `quote` outer frames, holder and binder (55), `member` outer frames, holder and carried frame (50), `slotDependent` outer frames, carried frame, binder and bound tag (21). The `grounds` and `aside` cells have no example (D11). The slot cells sit on `standInBack`, `hookResume`, `supposition`, `sentenceBefore` and `answer`: statement word, *by the way*, goodbye, kept and quote, plus a new value on `hookResume`, `supposition` and `answer`.

**Options.**
1. Leave them unstated.
2. State the cells that have examples, as today's behavior, each on its owning page (`dependents.md`, `quote-contents.md`, `joins.md`, `stand-in-vowels.md`, `in-clause-hooks.md`, `sentence-linkers.md`, `questions.md`), one decision per cell where a page sentence would read oddly; the rest stay unstated.
3. State every cell, the example-less ones included.

**Pages and examples.** Option 2: about 7 pages gain a sentence or a table row; no reading changes, since each cell keeps today's behavior. Any cell whose today's behavior a page author would not write is split out as its own decision.

**Learner.** Option 2 answers questions a learner can meet in the examples (does my channel cover the dependent? does `darth` look past *by the way*?). Option 3 adds rules for cases no example shows.

**Class.** Review later (new learning on each page), stricter because the cells are many; any cell that turns out to need a reading other than today's is blocking (precedent).

**Recommendation:** (medium) option 2. It closes the cells learners meet without adding rules for cases nobody writes yet; D12 settles the quote cells of `standInBack` and `hookResume` first.

### D11. Asides have no nested reading

**Problem (F11).** The reader reads an aside `th(…)` as a `quote`-family frame (`unit:writingSpan`) with no nested reading: in `zahelan vozuyel th(zalazun vozumul).` the aside's words are never read, so the `aside` boundary row (7 unstated cells, 1 stated) governs nothing, and the report counts asides under `quote`. `spans.md#asides-th` states what an aside is ("a clause with the same speech act as the outer sentence").

**Options.**
1. Keep as is: the row waits for asides to be read.
2. Drop the `aside` row until asides are read.
3. Read an aside's content as a nested reading of its own kind, with its own frame family in the report, and then settle its cells (D10).

**Pages and examples.** Option 3: the aside examples on `spans.md`, `review.md` and `span-nesting.md` gain a nested reading; no grammar page changes until the cells are stated.

**Learner.** None until the solver answers questions about what an aside says; then option 3 makes asides count.

**Class.** Option 3 autonomous (following the grammar: `spans.md` says an aside is a clause). Option 2 autonomous (code shape).

**Recommendation:** (medium) option 1 now, and option 3 as its own item or proposal: reading asides is work beyond simplifying the scope model, and the row records what to settle when it lands.

### D12. Quotes and point-back slots

**Problem (U5 b, c, d).** (b) `pointBackLinks` runs over every reading, quotes included: in `zalazun vehohel. zahelan d[ zazozon vezuyol darth ] varuyol.` the `darth` inside the quote links to the sentence before the quote, and a target found inside the quote can be overwritten or deleted when the outer sentences are resolved again (medium confidence, from U5). The `standInBack` and `hookResume` quote cells are `unstated (today: passes)`, while the carried frame, topic, sentence before and answer all block. (c) The NOTIONAL supposition a question points to is shared across speakers and not ended by `yal`, `xavedam` or a goodbye; the NOTIONAL carried frame is per speaker and ended by all three, so the two can disagree. (d) The reader is not told who says each sentence (`speakerOf` returns `""`).

**Options.**
- (b) 1. Keep as is. 2. A quote blocks both slots: a point-back inside a quote looks only within the quote, as a topic does (`topic.md#topic-dependents`). 3. Passes, but resolve each reading once, so a target inside the quote is kept.
- (c) 1. Keep as is. 2. The supposition ends on the carried frame's end events, and stays shared, so another speaker's question can point to your story. 3. Derive the supposition from the carried frame outright (per speaker).
- (d) Pass speakers to the reader when a slot row becomes per speaker; until then, nothing.

**Pages and examples.** (b) option 2: `stand-in-vowels.md#stand-in-back` and `in-clause-hooks.md#hook-resume` gain a sentence each; no doc example has a point-back inside a quote, so no reading in the corpus changes. (c) option 2: `notional.md#notional-as-if-framing` gains a sentence; the corpus has no example where the two disagree.

**Learner.** (b) option 2 gives the learner one rule: nothing from outside reaches into a quote. (c) option 2 makes a supposition end where the story's frame ends.

**Class.** (b) review later (meanings: an unstated cell gets a value); the double-resolve fix itself is autonomous. (c) review later. (d) autonomous (code shape).

**Recommendation:** (b) (medium) option 2: it matches the four other slots and `evidentiality.md#carry-forward` ("A quote keeps its speaker's frame"). (c) (low) option 2: it keeps a listener's question about your story working, which option 3 would break; a `notional.md` sentence on whether `yal` ends a supposition would settle it. (d) (high) defer.

### D13. Placement stage tidy

**Problem (U4 a to d).** (a) An island or verb-list item with two whole-clause frames of its own now gets order entries; the corpus has none (24 island readings, each with at most one own frame). (b) `placeFrame` still places a whole-clause frame missing from a record, which reader rule 3 says the reader never does; no corpus case reaches it. (c) The `island` boundary row (`what: "a scope island"`) also covers verb-list items and does not say so. (d) Every island gets a record, read or not.

**Options.** (a) Keep; add a scope test with two frames in an island, or not. (b) Keep, or make the missing record an `unread` entry so rule 3 holds in code. (c) Keep, or say *a scope island or a verb-list item with words of its own* in `boundaries.ts` and `interpreter.md`. (d) Keep.

**Pages and examples.** `boundaries.ts`, `read-context.ts`, `interpreter.md`; no reading changes.

**Learner.** None.

**Class.** Autonomous (code shape, writing).

**Recommendation:** (high) add the island test (a), raise `unread` for (b), reword the row (c), keep (d): an unread island's record costs nothing and keeps the walk generic.

### D14. Other rules keyed on one construction

**Problem.** The audit's grep for rules that match one key or gloss (`values.gloss ===`, `key === "`) finds, besides `stackedHinge` (D3):
- `isGreetingScope` (`carry.ts`): a greeting (`reading:greeting`) neither takes nor ends a carried frame. No page states it; it acts as `claims: false` does for WANT, PLAN and DECISION (`evidentiality.md#carry-forward`: "A sentence that only plans, wants, or decides claims nothing: it takes no frame and does not end it").
- `PHRASE_FRAMES` (`read-context.ts`): `slot:newMember` and `reading:greeting` host the phrase their word heads.
- The occasion list on `lexReading:restrictor` (`scope.ts`), the `edge:force` lookups for the question type and for `-rth` (`read.ts`), `joinSeries:u:kind` in `noKindBinder`, and `slot:newMember` in `framedMember`: each is the one construction its page describes.
- `readStanceList` matches word shape (a `/th/` join that closes stance words), not a key: nothing to change.

**Options.**
1. Keep all as is.
2. Fold the greeting into the `claims: false` member property, and state on `evidentiality.md#carry-forward` that a greeting, like a plan, claims nothing; keep the rest.
3. Also move `PHRASE_FRAMES` to a property of its frame-key rows (`hostsPhrase`).

**Pages and examples.** Option 2: one sentence on `evidentiality.md`; no reading changes. Option 3: `scope.ts` and `read-context.ts` only.

**Learner.** Option 2 states a rule the reader already follows and the learner would guess (a greeting is not a claim).

**Class.** Option 2 review later (a page sentence that gives greetings a carry rule). Option 3 autonomous (code shape).

**Recommendation:** (medium) option 2, and option 3 only if a third phrase-hosting frame appears: with two members a set is as clear as a property.

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

- No reading changes in phase 1. A unit whose refactor changes a reading stops and reports.
- No change to the solver, the matcher or the log beyond what a phase 2 decision requires.
- No change to the shape of `ResolveInfo`, `ClauseScope`, `Reading` or `Link`, except additive exports (such as an `explainPair` function) and the records U4 adds for islands.
- No moving of `pointBackLinks` into the resolve stage. The discourse-slot table describes both layers; it does not merge them.
- No style review of edits to existing pages (see Status). Only the new scope page gets one.
- No split of `read.ts` for size alone. It is under the ceiling.
