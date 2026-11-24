# Scope model: one statement of reach, order, ownership and carry

**Status:** IN PROGRESS. Phase 1 started 2026-11-24. Decided 2026-11-24 (user): edits to existing pages get no style review, because a full style pass over them follows later; the new scope page is not in that pass, so it gets its own style review (L5). Writers of grammar prose still self-check against the [checklist](../../meta/doc-style.md#checklist). Decided 2026-11-24 (user, both as recommended): D1, the scope page is a synthesis page closing Intermediate, in a unit of its own after *Surprise and what's not so*, titled *How far a word reaches*; D2, a scope cheat sheet generated from the profile, boundary and slot tables (L4 runs).

**Related:** [interpreter.md](../../meta/interpreter.md) ([frame families](../../meta/interpreter.md#frame-families), [links](../../meta/interpreter.md#links), [scope statements](../../meta/interpreter.md#scope-statements), [reader rules](../../meta/interpreter.md#reader-rules), [pair table](../../meta/interpreter.md#pair-table)); [scope.ts](../../../src/parse/scope.ts) (`FRAME_KEYS`, `PAIR_ROWS`, `orderPair`, `clauseScopes`); [carry.ts](../../../src/parse/carry.ts); [read.ts](../../../src/interpret/read.ts) (`readClause`, `readIsland`, `readDependent`, `stackedHinge`, `pointBackLinks`, `carriedLinks`); [read-context.ts](../../../src/interpret/read-context.ts) (`placeFrame`, `memberFrame`, `framedMember`, `Here.scoped`); [scope.test.ts](../../../src/parse/scope.test.ts); [classes.test.ts](../../../src/interpret/classes.test.ts); the corpus walk in [accounting-walk.ts](../../../src/interpret/accounting-walk.ts) and [sweep.ts](../../../scripts/sweep.ts). Grammar: [clause.md](../../grammar/beginner/clause.md#which-covers-which), [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period), [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [feelings.md](../../grammar/intermediate/feelings.md#speaker-attitude), [mirative.md](../../grammar/intermediate/mirative.md#mirative), [for-a-sake.md](../../grammar/intermediate/for-a-sake.md#whose-stake), [joins.md](../../grammar/beginner/joins.md#everything-ua), [universals-domains.md](../../grammar/intermediate/universals-domains.md#bound-tags), [scope-islands.md](../../grammar/intermediate/scope-islands.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts).

**Depends on:** none. **Order:** never run a phase of this proposal at the same time as a phase of `reading-realizer.md`, because both edit `read.ts` and `read-context.ts`. Running phase 1 of this proposal first is recommended: realizer unit U14 places frames from the pair table, and phase 1 here turns that table into a few rules it can follow.

**Design authority:** *none* for phase 1: it restructures code and editor notes, and every reading stays the same. Phase 2 changes only the readings the user accepts under [Open decisions](#open-decisions), each through its owning grammar page. Phase 3 adds one teaching page and one cheat sheet, and adds or changes no form.

## Problem

The grammar's rules on how far a word reaches are stated piece by piece, and the code mirrors that scatter:

- **Order of two whole-clause frames.** `PAIR_ROWS` has 158 rows. About 97 say *the earlier covers the later*. 18 say a call commutes. 13 put `force` over the other frame, and 9 of those cite only that the act word sits on the left edge, outside the body: that is nesting by the tree (reader rule 2), not a pair rule. The few real exceptions are hard to see among the repeats.
- **Whose a frame is.** "Stays yours" appears on several pages with different reach. A speaker attitude escapes a question, a holder and a carried frame. MIRATIVE and a sake word escape a question but not a holder: a holder covers MIRATIVE, and a sake word follows text order against a holder. A `contrary` frame escapes neither, yet commutes with the other remarks. WANT, PLAN and DECISION neither take nor end a carried frame. Each is a hand-written row or a constant (`REMARKS`, `NO_CLAIM_KEYS`, `ATTITUDE_KEY`).
- **Boxes.** Five kinds of nested reading (clause-join member, dependent, a hinge's `blarl` next sentence, scope island, quote) each let a different set of things through: a holder goes into a dependent, a carried frame never starts in a dependent or join member, nothing carries into a quote, a binder and a bound tag go on through a stand-in. The rules are conditions spread across `readClause`, `readIsland`, `carriedFrames` and the `scoped` flag.
- **Past a period.** Carried frames live in the parser's resolve stage (`carry.ts`), the topic in the resolver, stand-in point-back and hook resume in the reader (`pointBackLinks`). Each has its own start, end and per-speaker rules, and no one place says which state crosses a speaker change, a quote, *by the way* or a goodbye.
- **Placement in two stages.** The scope stage places whole-clause frames for scoped clauses. The reader places them again for islands and verb-list items (`placeFrame` with `scoped: false`, `memberFrame`), so reach is computed twice.
- **One-off constructions.** `stackedHinge` and `stackedNounHinge` match the glosses `only-if` and `because`. `readStanceList`, `framedMember` and restrictor occasions are other hand-built cases.

So the grammar has no single statement of its scope rules. A learner meets *earlier covers later* in [clause.md](../../grammar/beginner/clause.md#which-covers-which) and then a dozen local exceptions, and an editor can't see which exceptions are principled and which are accidents.

## Goals

1. The code states each scope rule once, as data: family profiles that generate the pair table, a boundary table, and a table of what carries past a period. Phase 1 changes no reading.
2. A report shows how often each rule fires over the doc examples, and lists the rules the grammar never states or that fire only in their own example.
3. An audit turns those results into concrete simplifications, each as a user decision with a recommendation.
4. The accepted simplifications land in the grammar and the code together.
5. One teaching page presents reach, order, boxes, ownership and carry as one system, so instance pages can lean on it.

## Non-goals

- No reading changes in phase 1. A unit whose refactor changes a reading stops and reports.
- No change to the solver, the matcher or the log beyond what a phase 2 decision requires.
- No change to the shape of `ResolveInfo`, `ClauseScope`, `Reading` or `Link`, except additive exports (such as an `explainPair` function) and the records U4 adds for islands.
- No moving of `pointBackLinks` into the resolve stage. The discourse-slot table describes both layers; it does not merge them.
- No style review of edits to existing pages (see Status). Only the new scope page gets one.
- No split of `read.ts` for size alone. It is under the ceiling.

## Design

### Family profiles

Each frame family gets a profile in a new `src/parse/scope-profiles.ts`:

- **seat:** `edge` (outside the body: `force`, `call`), or `body`.
- **order:** `text` (earlier covers later), `covers` (over everything in its clause wherever it sits: `holder`), or `commutes` (`call`).
- **escapes:** the outer frames the family stays outside of because it stays the speaker's: some of `force`, `holder`, `carried`.
- **text anchors:** extra anchors a text-order row involving the family cites (for example `HINGE_LAST` for `hinge`, `MAY_BEFORE` for MAY, `STANDALONE` and `REACH` for `polarity`).
- **member cases:** conditions on one member of a family, such as a channel, a doubled act word or FORMER.

`derivePairRows()` builds every row from the profiles, in a fixed rule order: call, edge, both escape each other, escape, covers, member case, text. A pair the rules can't derive goes in an `EXCEPTIONS` list, each with its anchor and a one-line reason. `PAIR_ROWS` becomes `derivePairRows()`. A test checks that the derived rows equal a frozen copy of today's rows (pair, kind, cases, anchor sets). `explainPair(a, b)` returns the rule id that decided a pair (`call`, `edge`, `escape:force`, `covers:holder`, `exception:<id>`, `text`, and so on).

The seed rules below come from reading `PAIR_ROWS`. U2 settles the final set: fewer exceptions is better, as long as each property cites a grammar sentence.

| Seed | Today's rows it covers |
|------|------------------------|
| `call` commutes with all | the 18 `call` rows |
| `edge`: `force` over a body frame | 9 rows cite only `ACT_EDGE`; 4 more add their own anchor (`hinge`, `stance`, `holder`, `intention`) |
| `escapes: force` | `force` under `attitude`, `mirative`, `sake` |
| `escapes: holder` | `attitude` over `holder` |
| remarks escape each other | the 6 commuting pairs among `sake`, `attitude`, `mirative`, `contrary` |
| `covers: holder` | 10 rows; 3 more are *fixed by word shape* (the seam sits on `stance`, `intention`, `notional`) |
| member cases | channel against `attitude`, `mirative` (commutes) and `hinge` (channel over); FORMER over `occasion`; a doubled act word |
| likely exceptions | `sake` × `holder` and `hinge` × `holder` (text order); `hinge` × `occasion` (occasion over); `contrary` × `stance` and `contrary` × `intention` (commute) |

### Boundaries

A `BOUNDARIES` table in a new `src/parse/boundaries.ts`. Rows are the nested-reading kinds: clause-join member, dependent named by a stand-in, dependent in a slot, `blarl` grounds, scope island, quote, aside. Columns are what might pass in: outer whole-clause frames, the holder, carry start, carry end, an inherited carried frame, binder reach, bound tag, rest-of-sentence tone mark. Each cell is `passes`, `blocks`, or `unstated`, with the anchor that states it. The code consults the table where it now tests a condition: `ownCarry` (main clause only), `readClause` / `readIsland` / `readDependent`, the binder and bound-tag reach through stand-ins. An `unstated` cell is never decided by the unit: it keeps today's behavior, is marked `unstated (today: passes)` or `(today: blocks)`, and goes to the audit.

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

### Scope report

`npm run scope-report` walks every doc example with the same pass as `npm run sweep` (`passFiles`, `collectFileSpans`). For each example it records each reading's frame families, `order` entries (families, kind, anchors), `unordered` pairs, stance lists, nested-reading kinds and the links by kind and key, with targets as relative sentence offsets. `--save` writes `tmp/state/scope-report.json`, and `--diff` lists examples whose record changed. Once profiles exist, it counts examples per `explainPair` rule id, per boundary cell exercised and per discourse slot, naming one sample text each. Stdout is a summary; the full report goes to `tmp/logs/scope-report.md` via `tmpPath()`.

### Seed findings for the audit

These come from reading the code for this plan. U6 checks them against the report and adds to them.

- **F1. `force` rows are tree nesting.** The edge rows follow from reader rule 2. The pair table and the beginner exceptions table could say "the act word stands outside the sentence" once, not 13 times. This changes only editor notes and wording.
- **F2. Remarks escape different frames.** `attitude` escapes `force`, `holder` and the carried frame. `mirative` and `sake` escape only `force`. `contrary` escapes none but commutes with the other three. One class of *remarks that stay yours* would replace four behaviors.
- **F3. The holder is the one position-free clause frame.** It covers everything in its clause wherever it sits, except `sake` and `hinge`, which follow text order against it. Options include letting the holder follow text order like every other frame, or letting it cover `sake` and `hinge` too.
- **F4. Channel-only cases.** A channel commutes with `attitude` and `mirative` and sits over a hinge, while MAY follows text order in all three. A stated reason ("a channel is grounds, not a claim") could explain all three at once, or they could be dropped.
- **F5. MAY under a holder.** The holder carries past a period and the MAY does not.
- **F6. Stacked hinges by gloss.** *Only because* is two hard-coded glosses. A general rule ("a frame word with an empty `/b/` right before another frame word shares its `/b/`") would cover it, along with any later stack.
- **F7. Unstated cells** from the boundary and slot tables.

## Implementation plan

Three phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

- **Phase 1** restructures the code with no change to any reading, then audits it. It ends with the phase 2 decisions due from the user.
- **Phase 2** lands the accepted simplifications. Its units are written at the end of phase 1, from the decisions.
- **Phase 3** writes the teaching page.

Each phase reads a different set of pages, and phase 2 needs the user's answers to phase 1's findings.

**Gates.** At the start of each phase the orchestrator saves `npm run verify -- --baseline`. From U1's commit on, it also saves `npm run scope-report -- --save`. Each unit ends with `npm run verify -- --allow-generate`, and the unit passes before its commit. In phase 1, every unit after U1 also shows an empty `npm run scope-report -- --diff`. No phase 1 unit edits a test expectation, a solver golden (`src/interpret/fixtures/solve-*.lp`), `run.test.ts` or a `src/game/` test. In phase 2, `--diff` lists only the examples the unit's decision names. The final gate is a full `npm run verify` against an empty baseline at the end of phase 3. The proposal edits no `say-*.md`, `english.md` or `src/english-helper/`, so it has no recall gate. Its style gate covers the new scope page only (L5, Status).

### Phase 1: the scope model in code

**U1. Scope report and snapshot.**
Agent `proposal-worker`, `model: opus`, effort `medium`.
Build `npm run scope-report` per [scope report](#scope-report), without rule ids, which U2 adds. First read `scripts/sweep.ts` and reuse its walk and its `--save` / `--diff` handling; import, don't copy. Add a short test that runs the report on two fixture texts. Run `--save` and report the summary counts.
**May edit:** `scripts/scope-report.ts`, `src/interpret/scope-report.ts`, `src/interpret/scope-report.test.ts`, `package.json` (the script entry), and `src/interpret/accounting-walk.ts` or `scripts/sweep.ts` only to export a shared helper.

**U2. Family profiles and escape sets.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write `src/parse/scope-profiles.ts` per [family profiles](#family-profiles). First freeze today's rows into `src/parse/scope-profiles.test.ts` as a literal, then make `PAIR_ROWS` come from `derivePairRows()` with the test checking equality. Export `explainPair`. Make `carry.ts` take its `coveredBy` families (`ATTITUDE_KEY`) and its no-claim members (`NO_CLAIM_KEYS`) from the profiles' `escapes: carried` and a `claims: false` member property, with the same output. Add rule-id counts to the scope report. In [interpreter.md](../../meta/interpreter.md), add a *Family profiles* section before the pair table: the properties, the rule order, and the exception list with reasons. Rewrite the pair table's intro paragraph to say the rows are derived. Leave the rows and samples as they are, except the *Counts* line.
**May edit:** `src/parse/scope-profiles.ts`, `src/parse/scope-profiles.test.ts`, `src/parse/scope.ts`, `src/parse/carry.ts`, `src/parse/scope.test.ts` (imports only), `src/interpret/scope-report.ts`, `docs/meta/interpreter.md`.

**U3. Boundary table.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write `src/parse/boundaries.ts` per [boundaries](#boundaries), and make `carry.ts`, `read.ts` and `scope.ts` consult it where they now test a condition. For each cell, find the stating sentence with `node scripts/find.mjs` and the grammar page's section, reading slices only: [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [joins.md](../../grammar/beginner/joins.md#everything-ua), [universals-domains.md](../../grammar/intermediate/universals-domains.md#bound-tags), [scope-islands.md](../../grammar/intermediate/scope-islands.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [tone-marks.md](../../grammar/intermediate/tone-marks.md). Mark cells with no stating sentence `unstated` with today's behavior, and list them in the report. Add boundary-cell counts to the scope report and a *Boundaries* section to `interpreter.md` after *Scope statements*.
**May edit:** `src/parse/boundaries.ts`, `src/parse/boundaries.test.ts`, `src/parse/carry.ts`, `src/parse/scope.ts`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/scope-report.ts`, `docs/meta/interpreter.md`.

**U4. One placement stage.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Carry out [one placement stage](#one-placement-stage). Measure first with `npm run deps` on `read-context.ts`. If an island or verb-list item record would change a carried frame, or `ResolveInfo.scope` consumers in `gloss-structure.ts` or `src/game/` would need more than skipping the new records, stop and report. Update [reader rules](../../meta/interpreter.md#reader-rules) and the `unread` reasons in `interpreter.md`.
**May edit:** `src/parse/scope.ts`, `src/parse/types.ts` (a record field only), `src/parse/gloss-structure.ts` (skipping the new records only), `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/types.ts` (dropping the `unscoped` reason), `src/interpret/coverage.ts`, the matching tests (removing `unscoped` cases only), `docs/meta/interpreter.md`.

**U5. Discourse slots.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write `src/parse/discourse-slots.ts` per [discourse slots](#discourse-slots). Make `carriedFrames` and `pointBackLinks` read their rows, with no change in output. Find each cell's stating sentence in [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [topic.md](../../grammar/intermediate/topic.md), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume), [notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing), reading slices only. Unstated cells are handled as in U3. Add slot counts to the scope report. In `interpreter.md`, add a *Discourse slots* section after *Links*, and cut the carried-frame row of the links table down to a pointer to it.
**May edit:** `src/parse/discourse-slots.ts`, `src/parse/discourse-slots.test.ts`, `src/parse/carry.ts`, `src/interpret/read.ts`, `src/interpret/scope-report.ts`, `docs/meta/interpreter.md`.

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

Expected commits: 6 unit commits, 1 `AGENTS.md` commit, 1 consolidation commit.

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

None open: D1 and D2 are settled (Status). U6 adds D3 onward.
