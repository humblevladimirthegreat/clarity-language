# Scope model: one statement of reach, order, ownership and carry

**Status:** IN PROGRESS. Phase 1 done 2026-11-24: commits `cdd63e7b` start, `3086d93f` U1, `856423e9` U2, `838e2906` U3, `20222bea` U4, `4e387bae` U5, `194d388b` U6, `aa9a34a5` `AGENTS.md`. The old phase 2 was split in two at phase 1 close: phase 2 is S1 to S4, phase 3 is S5, S5b and S6 to S9, and the scope page is now phase 4. The next session starts phase 2 at S1. Decided 2026-11-24 (user): edits to existing pages get no style review, because a full style pass over them follows later; the new scope page is not in that pass, so it gets its own style review (L5). Writers of grammar prose still self-check against the [checklist](../../meta/doc-style.md#checklist). Decided 2026-11-24 (user, both as recommended): D1, the scope page is a synthesis page closing Intermediate, in a unit of its own after *Surprise and what's not so*, titled *How far a word reaches*; D2, a scope cheat sheet generated from the profile, boundary and slot tables (L4 runs). Decided 2026-11-24 (user), the U6 audit's D3 to D14: each is written into the S-unit that lands it. D8 needs no unit: MAY under a holder stays on its own sentence, as [holder.md](../../grammar/intermediate/holder.md#naming-a-holder) states. D11 is the user's rule, not the audit's recommendation: an aside is self-contained, backward references pass in, and it takes its own speech act (S5; A and C decided 2026-11-24). Decided 2026-11-24 (user): `~[…]` is an approximate quote, not a paraphrase (S5b).

**Related:** [interpreter.md](../../meta/interpreter.md) ([family profiles](../../meta/interpreter.md#family-profiles), [boundaries](../../meta/interpreter.md#boundaries), [links](../../meta/interpreter.md#links), [discourse slots](../../meta/interpreter.md#discourse-slots), [scope statements](../../meta/interpreter.md#scope-statements), [reader rules](../../meta/interpreter.md#reader-rules), [pair table](../../meta/interpreter.md#pair-table)); [scope.ts](../../../src/parse/scope.ts); [scope-profiles.ts](../../../src/parse/scope-profiles.ts); [boundaries.ts](../../../src/parse/boundaries.ts); [discourse-slots.ts](../../../src/parse/discourse-slots.ts); [carry.ts](../../../src/parse/carry.ts); [scope-report.ts](../../../src/interpret/scope-report.ts); [read.ts](../../../src/interpret/read.ts); [read-context.ts](../../../src/interpret/read-context.ts). Grammar: [clause.md](../../grammar/beginner/clause.md#which-covers-which), [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), [contrary-to.md](../../grammar/intermediate/contrary-to.md#contrary-to-stance), [because-and-iff.md](../../grammar/intermediate/because-and-iff.md#choosing-a-hinge), [cause.md](../../grammar/intermediate/cause.md#mechanism), [joins.md](../../grammar/beginner/joins.md#everything-ua), [spans.md](../../grammar/beginner/spans.md#asides-th), [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume), [notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing), [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts).

**Depends on:** none. **Order:** never run a phase of this proposal at the same time as a phase of `reading-realizer.md`, because both edit `read.ts` and `read-context.ts`.

**Design authority:** phases 2 and 3 change the readings that D3, D5, D6, D7, D9, D11 and D12 name, each through its owning grammar page (S1 to S6); S5 also lets an aside take its own speech act, and S5b redefines `~[…]` as an approximate quote. They also state today's behavior for unstated cells (S7, S8). Phase 4 adds one teaching page and one cheat sheet, and adds or changes no form.

## Implementation plan

Four phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

- **Phase 1** (done) built the scope model in code and audited it.
- **Phase 2** lands the decisions that change readings in the profiles, hinges and binder: S1 to S4.
- **Phase 3** lands asides, approximate quotes, the point-back slots, the unstated cells and the tidy: S5, S5b, S6 to S9. S7 and S8 state cells as phase 2 and S5 and S6 left them.
- **Phase 4** writes the teaching page.

**Gates.** At the start of each session the orchestrator saves `npm run verify -- --baseline` and `npm run scope-report -- --save`. Each unit ends with `npm run verify -- --allow-generate`, and the unit passes before its commit. In phases 2 and 3, `npm run scope-report -- --diff` lists only the examples the unit names; S7, S8 and S9 change no reading, so their diff is empty. The final gate is a full `npm run verify` against an empty baseline at the end of phase 4. S5b is the only unit that edits `say-*.md`, `english.md` or `src/english-helper/`, so phase 3 has the recall gate: `npm run english-helper-recall -- --check` after S5b and again at the phase end, with its result on the Status line. Its style gate covers the new scope page only (L5, Status).

**What phase 1 built** (input for every later unit):

- **Scope report.** `npm run scope-report` (`scripts/scope-report.ts`, logic in `src/interpret/scope-report.ts`). `--save` writes `tmp/state/scope-report.json`, `--diff` compares to it, and the full report is `tmp/logs/scope-report.md` (grep or slice it, never read it whole). Per reading it records frame families, order entries, unordered pairs, stance lists, nested-reading kind and links. It counts examples per `explainPair` rule id, per boundary cell and per discourse slot. Walk helpers `forEachExample`, `readSnapshot` and `writeSnapshot` are exported from `src/interpret/accounting-walk.ts`.
- **Family profiles.** `src/parse/scope-profiles.ts`: `PROFILES` (18 families), `derivePairRows()` (8 rules), `EXCEPTIONS` (6), `explainPair`, `caseMatches`. `PAIR_ROWS` in `scope.ts` is derived, and a frozen-rows test guards it. Escapes are `force`, `holder`, `carried` and `remark` (two remarks commute). The `carried` escape sits on members (`slot:th` attitude, sake feeling words). Aim members have `claims: false`. `carry.ts` reads both. Documented in [family profiles](../../meta/interpreter.md#family-profiles).
- **Boundaries.** `src/parse/boundaries.ts`: `BOUNDARIES`, 7 nested-reading rows (member, standInDependent, slotDependent, grounds, island, quote, aside) by 8 columns (outerFrames, holder, carryStart, carryEnd, carried, binder, boundTag, tone). A passing cell names how it reaches the nested reading (`copy`, `nesting`, `link`, `resolve`, `sentence`). Consulted by `collectClause` through `copied()` in `scope.ts`, by `nestedCarry` in `carry.ts`, and by `carriedLinks` in `read.ts` through `nestedKinds` in `read-context.ts`. The unstated cells are frozen in `boundaries.test.ts`. Documented in [boundaries](../../meta/interpreter.md#boundaries).
- **One placement stage.** `collectClause` gives every body, member, dependent, island, and verb-list item with words of its own a scope record. Islands and verb-list items get theirs through `copied(reaching, "island")`. The reader copies records only. `placeFrame` places only frames that reach less than a clause. Reader rules 1 and 3 say so.
- **Discourse slots.** `src/parse/discourse-slots.ts`: `DISCOURSE_SLOTS`, 7 rows (carriedFrame, topic, standInBack, hookResume, supposition, sentenceBefore, answer) by set by, read by, 4 end events (new value, statement word, *by the way*, goodbye), kept, quote, and anchors. 42 cells: 14 stated, 28 `unstated (today: …)`. Frozen in `discourse-slots.test.ts`. `carriedFrames` (`carry.ts`) and `pointBackLinks` (`read.ts`) read their rows. In `pointBackLinks`, `speakerOf` returns `""`: the reader is not told who says each sentence. Documented in [discourse slots](../../meta/interpreter.md#discourse-slots).
- **page-readers.** A new `src/parse/*.ts` file holding `page.md#id` anchors trips the page-readers lint. Register it in `scripts/page-readers.ts` (`REGISTRIES`, `READ_FILES`, `registryRefs()`), then run `npm run page-readers -- --write`.
- Never run `npx prettier` or another formatter the repo does not depend on.

### Phase 2: readings from profiles, hinges and the binder

**S1. Stacked hinges, one rule (D3).**
Agent `proposal-worker`, `model: opus`, effort `high`.
`stackedHinge` in `read.ts` (and `stackedNounHinge`) matches two glosses: an *only-if* hinge with no `/b/` right before a *because* hinge with one shares its `/b/`. Two more stacks are stated on their pages and not read:
- [because-and-iff.md](../../grammar/intermediate/because-and-iff.md#choosing-a-hinge): "For *even if*, put the *although* hinge `thezem` right before `thohem`."
- [cause.md](../../grammar/intermediate/cause.md#mechanism): "`thewom` right before the hinge, and the trigger in the hinge's `/b/`."

Today `zazozon vowurol thewom thohem blerulal.` and `zazozon vowurol thezem thohem blarl zalazun vezuvel.` leave `thewom` and `thezem` with no hosted term. Replace the gloss match with one word-shape rule: a `/th/` hinge-family word (`overlay:clause_hinge:th`, `overlay:cause:th`) with no `/b/`, right before a `/th/` hinge that has one, shares that hinge's `/b/` and grounds link. The same applies on `/ɡ/` among a noun's details. Do not extend it to other frame words. The hinge scope statements in `interpreter.md` cite the two new anchors. No grammar page changes. Expect about 14 examples to gain a hosted term (`cause.md`, `because-and-iff.md`, `say-reasons.md`, the *why* cheat sheet); `--diff` lists only those.
**May edit:** `src/interpret/read.ts`, `src/interpret/read-context.ts`, their tests, the solver goldens and run tests whose stacks now read, `docs/meta/interpreter.md`.

**S2. Remarks share one `force` escape; a channel's one reason (D5, D7).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- **D5.** All four remark families (`attitude`, `mirative`, `sake`, `contrary`) escape `force`, from one shared property in `PROFILES`, and commute with each other. The `holder` and carried-frame escapes stay per family, as their pages state. This changes `contrary` only, and only to follow [contrary-to.md](../../grammar/intermediate/contrary-to.md#contrary-to-stance), which already says: "In a question, `uom` and its stance stay yours and outside what is asked." Today `yel zazozon vowurol uom thagom.` reads the act word over `uom`, a bug. Two examples change (`force > contrary`). Cite that anchor on the escape. No grammar page changes: `uom` is taught on an intermediate page, so the beginner `clause.md` row is not edited here.
- **D7.** Keep the readings: a channel commutes with `attitude` and `mirative` and covers a hinge wherever it sits, while MAY follows text order against all three. State one reason in [evidentiality.md](../../grammar/intermediate/evidentiality.md#evidence-clause): a channel is not part of what you claim, only what backs it, so it is not under your feeling, your surprise or a cause; MAY is part of the claim, so it keeps text order. The three member cases in `PROFILES` cite that one sentence. The reason must not reach `sake` or `contrary`: a channel against those keeps text order. Also lift the page's ban "A cause or condition word may not come before the channel": the hinge-first order parses today and reads the same as channel-first, so say that both orders mean the same and channel-first is the usual one. Remove any `design-decisions.md` or `unassigned-reserved.md` entry for that ban. No reading changes.
**May edit:** `src/parse/scope-profiles.ts` and its tests, `src/parse/scope.ts` (the frozen pair rows the decision names), `docs/grammar/intermediate/evidentiality.md`, `docs/meta/interpreter.md`, `docs/meta/design-decisions.md`, `docs/meta/unassigned-reserved.md`.

**S3. The holder covers its whole clause (D6).**
Agent `proposal-worker`, `model: opus`, effort `high`.
[holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers) says "Everything else in the clause, wherever it sits, belongs to the holder", and its table lists sake words, feeling words, CAUSE hinges and *so that*. The `EXCEPTIONS` `sake-holder` and `hinge-holder` read a sake word or a hinge before the holder as yours (text order). That contradicts the page: its own example `zazozon vezuyol thawethom theyomazozon.` (*I gather Azozon talks to feel connected*) reads today as your motive. It also makes a cycle in `zazozon vowurol thahum blerulal theyomalazun.` (hinge > holder > channel > hinge). Remove both exceptions, so the holder covers sake words and hinges wherever they sit. Keep the stated special case: a holder *right before* `thezem` takes only the hinge's expectation ([holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers), [contrary-to.md](../../grammar/intermediate/contrary-to.md#contrary-to-holder)). In [holder.md](../../grammar/intermediate/holder.md#holder-plans-and-motives), the *so that* sentence says "after a holder" where it means *with* a holder: reword it, and check that the page has no other sentence that reads as position. The beginner `clause.md` row ("covers the whole clause, wherever it sits") is already right; leave it. About 12 examples change (the 6 + 6 exception examples); `--diff` lists only those, and the cycle is gone.
**May edit:** `src/parse/scope-profiles.ts` and its tests, `src/parse/scope.ts` (the frozen pair rows the decision names), `docs/grammar/intermediate/holder.md`, `docs/meta/interpreter.md`, the solver goldens and run tests whose holder readings change.

**S4. Binder and bound-tag reach (D9).**
Agent `proposal-worker`, `model: opus`, effort `high`.
[joins.md](../../grammar/beginner/joins.md#everything-ua) says a binder reaches to the end of its sentence and into the sentence a `blarl` points to. Carry that out:
- A binder in one clause-join member is in every later member's scope. Today `zual gogozel vehohel xan zazozor vowurol.` puts `zual` in member 1 only.
- A binder reaches the grounds sentence through the grounds link. Today `zual gogozel vezuvel thahum blarl. gogozer vowurol.` links the grounds but not the binder.
- The `member` and `grounds` binder cells in `BOUNDARIES`, now *unstated, today: blocks*, become *passes* with the joins.md anchor.
- `resolve.ts` reads the `boundTag` cells instead of its own reach. That should change no reading; if it does, stop and report.
- Add to `joins.md#everything-ua` one example of a binder with a `blarl` sentence after it, checked with `parse.mjs --check-lexicon`.

`--diff` lists only member examples with a binder in a non-final member, plus the new example.
**May edit:** `src/parse/scope.ts`, `src/parse/boundaries.ts` and its test, `src/parse/carry.ts`, `src/parse/resolve.ts`, `src/interpret/read.ts`, `src/interpret/read-context.ts`, their tests, the solver goldens and run tests the binder change names, `docs/grammar/beginner/joins.md`, `docs/meta/interpreter.md`.

**Phase 2 close.** *Orchestrator.* Consolidate: write into S5 to S9 the cells and rows S1 to S4 changed, and the readings S7 and S8 must now state. Expected commits: 4 unit commits, 1 consolidation commit.

### Phase 3: asides, slots, unstated cells, tidy

**S5. Asides are self-contained (D11, user's rule).**
Agent `proposal-worker`, `model: opus`, effort `high`.
The user's rule: an aside inherits nothing from the outer sentence except pronoun antecedents, and nothing in it reaches out, so removing an aside leaves the outer sentence's meaning unchanged.
- **Read asides.** Today `zahelan vozuyel th(zalazun vozumul).` gives a `quote` frame with no content and no `unread` entry, though `spanTerm` and `quoteReadings` in `read.ts` read a cite's content. Find why the aside path comes back empty and fix it, so an aside's content is a nested reading of kind `aside` (`nestedKinds` in `read-context.ts` already tells it from a quote). Give asides their own family in the scope report instead of `quote`.
- **Cells.** Every cell of the `aside` row in `BOUNDARIES` blocks: outerFrames, holder, carryStart, carryEnd (already stated), carried, binder, boundTag, tone. A bound tag needs its binder's scope, and the binder blocks, so `boundTag` blocks too.
- **Backward references pass in (C, user 2026-11-24).** Every backward reference inside an aside resolves against the outer sentence and the turns before it, as it would outside the aside:
  - pronouns (resume, role pointers, tag pronouns, [pronouns.md](../../grammar/beginner/pronouns.md))
  - the topic and the topic pronoun ([quote-contents.md](../../grammar/intermediate/quote-contents.md#topic-quotes) already says an aside starts with your topic)
  - `-rth` stand-ins and hook resume (the `standInBack` and `hookResume` slots pass into an aside, unlike a quote after S6)

  Nothing else passes in.
- **Nothing passes out.** An aside sets no discourse slot: no topic (D-20 already bars a topic word in an aside), no stand-in or hook-resume target, no carried frame, no question to answer. Nothing in it is an antecedent for a reference outside it.
- **Its own speech act (A, user 2026-11-24).** An aside takes its own act word, which may differ from the outer sentence's: a rhetorical question in a statement, a remark inside a question, a command. An aside with no act word is a statement, not a copy of the outer act. An aside question sets no `answer` slot: the listener's reply answers the outer turn, so an aside question is rhetorical or musing. A written `yal` inside an aside does not end your carried frame. Interjections may sit inside an aside. The span itself still never goes under `/y/`. This replaces the spans.md rule "a clause with the same speech act as the outer sentence".
- **Grammar.** In [spans.md](../../grammar/beginner/spans.md#asides-th): an aside is self-contained. What a pronoun or other pointer in it refers to comes from outside, and nothing else does. Drop the aside and the sentence means the same. It takes its own act word, a statement when it has none, and nobody answers an aside question. Add one example of a question aside in a statement and one of a statement aside in a question, checked with `parse.mjs --check-lexicon --at spans.md#asides-th`. In [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward), say that a `yal` inside an aside does not end the frame. spans.md is a beginner page: link nothing later in the reading order.
- **Examples.** About 21 doc examples have asides; `--diff` lists only those. No solver fixture uses an aside. The asides' content now enters the solver as claims of their own.
**May edit:** `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/interpret/scope-report.ts`, `src/parse/boundaries.ts` and its test, `src/parse/discourse-slots.ts` and its test, `src/parse/carry.ts`, the parser and its tests only if an aside act word other than the outer one does not parse today, their tests, `docs/grammar/beginner/spans.md`, `docs/grammar/intermediate/evidentiality.md`, `docs/meta/interpreter.md`, `docs/meta/unassigned-reserved.md` and `docs/meta/design-decisions.md` (entries for the old same-act rule, if any).

**S5b. `~[…]` is an approximate quote (user, 2026-11-24).**
Agent `proposal-worker`, `model: opus`, effort `high`.
The user's decision: `~[…]` no longer means a paraphrase (the gist in the reporter's words). It means an **approximate quote**: you try to give the exact words and may have a few wrong. You claim the meaning in full and the wording only roughly, in the quoted speaker's voice. Indirect speech, the gist in your own words, is a dependent: `darl` for a statement, `derl` for a reported question ([dependents.md](../../grammar/beginner/dependents.md)). The three steps are exact `[…]` (you claim the wording), approximate `~[…]` (roughly the wording), and a dependent (only the meaning).
- **Scope and pronouns.** An approximate quote is treated like an exact one in every boundary and slot cell: it is direct speech, so *I* inside it is the quoted speaker, its pointers keep their own targets, and nothing reaches in or out except what reaches an exact cite. Only the claim about the wording differs. No scope cell changes.
- **Grammar.** Rewrite [spans.md](../../grammar/beginner/spans.md#exact-paraphrase-proper) for the new meaning. The English name is **approximate** (for example *something like "…"*), and the `~` cue ("about / approximately") stays. Say when to use a dependent instead, without linking later in the reading order. Retitle the section and keep its id, or run `npm run page-refs` and `retarget-id` if the id changes. Update `terminology.md` if it names *paraphrase*. The cheat sheet `cheat-sheets/restrictors-spans.md` and any generated block come from their sources: regenerate them, never edit them by hand.
- **Examples.** List every `~[…]` example with `node scripts/find.mjs` (`--all`). Keep each one that reads as *something like "…"* in the quoted speaker's voice. Rewrite each one that is a summary in the reporter's own words as a `darl` or `derl` dependent, checked with `parse.mjs --check-lexicon --at <page>#<id>`. Read a page's read-by block before rewording its practice. Report the count of each.
- **Other readers of *paraphrase*.** `src/parse/constructions.ts`, `src/parse/llm-prompt.ts`, `src/english-helper/analyze.ts`, `docs/grammar/english.md`, `say-amounts.md`, `say-questions.md` and `word-endings.md` mention it: update each to the new meaning. English *paraphrase*, *in other words* and *the gist* go to a dependent in the recipe track and the English helper; *something like "…"* goes to `~[…]`. Leave `src/generated/` alone.
- **Gates.** `--diff` lists only the `~[…]` examples rewritten as dependents. This unit edits the recipe track and the English helper, so after verify, run `npm run english-helper-recall -- --check` and report its result; a drop is this unit's to fix ([English helper](../../meta/procedures/english-helper.md#regression-net)). Read `docs/meta/procedures/english-helper.md` first.
**May edit:** `docs/grammar/beginner/spans.md`, the pages whose `~[…]` examples change, `docs/grammar/terminology.md`, `docs/grammar/english.md`, `docs/grammar/say-amounts.md`, `docs/grammar/say-questions.md`, `docs/grammar/beginner/word-endings.md`, `src/parse/constructions.ts`, `src/parse/llm-prompt.ts`, `src/english-helper/` and its tests, the solver goldens and run tests the rewritten examples name, the drill allowlist for a rewritten Practice item, `docs/meta/interpreter.md`.

**S6. Quotes and point-back slots (D12).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- **(b) A quote blocks the point-back slots.** `standInBack` and `hookResume` quote cells become *blocks*: a `-rth` or point-back hook inside a quote looks only within the quote, as a topic does ([topic.md](../../grammar/intermediate/topic.md#topic-dependents)), and as [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward) says ("A quote keeps its speaker's frame"). Also fix the double resolve: `pointBackLinks` runs over every reading, quotes included, so a target found inside a quote is overwritten or deleted when the outer sentences resolve again. `zalazun vehohel. zahelan d[ zazozon vezuyol darth ] varuyol.` must link `darth` inside the quote only. Add one sentence each to [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back) and [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume). No doc example has a point-back inside a quote, so `--diff` should be empty or list only quote examples with links.
- **(c) A supposition ends with its frame, and stays shared.** A question with NOTIONAL links to the latest stated supposition, by either speaker (A: `zazozon theyur gwozeduyol.` B: `yel zazozon theyur veduyol.`). The `supposition` row's end events become those of its owner's NOTIONAL frame:
  - the owner's new channel, or a new supposition
  - the owner's written `yal`, `yam` or `yar` as the real act
  - the owner's `xavedam`
  - anyone's goodbye

  Kept stays *shared*, so another speaker's question can still point into the story, and another speaker's `yal` does not end it. [notional.md](../../grammar/intermediate/notional.md#notional-as-if-framing) already says that stating a link with its own channel "ends the supposition"; cite it, and add one sentence: either speaker can ask inside a supposition until its frame ends.
- **(d) Speakers.** The owner rule needs to know who said each sentence, and `speakerOf` in `pointBackLinks` returns `""`. Pass speakers to the reader the way `carriedFrames` gets them. If that would change any reading other than the supposition link, stop and report.
**May edit:** `src/interpret/read.ts`, `src/interpret/read-context.ts`, `src/parse/discourse-slots.ts` and its test, `src/parse/carry.ts`, their tests, `docs/grammar/intermediate/stand-in-vowels.md`, `docs/grammar/intermediate/in-clause-hooks.md`, `docs/grammar/intermediate/notional.md`, `docs/meta/interpreter.md`.

**S7. Unstated boundary cells (D10, boundaries).**
Agent `proposal-worker`, `model: opus`, effort `high`.
State each `unstated (today: …)` cell in `BOUNDARIES` that has examples behind it, as today's behavior, on its owning page, then give the cell that anchor. The cells (counts from the U6 report; recount after S4 and S5):
- `standInDependent` outer frames and carried frame (239 examples), on [dependents.md](../../grammar/beginner/dependents.md)
- `quote` outer frames, holder and binder (55), on [quote-contents.md](../../grammar/intermediate/quote-contents.md)
- `member` outer frames, holder and carried frame (50), on [joins.md](../../grammar/beginner/joins.md)
- `slotDependent` outer frames, carried frame, binder and bound tag (21), on [dependents.md](../../grammar/beginner/dependents.md)

The `grounds` and `aside` cells are out of scope: S4 and S5 settled them, or they have no example. A cell whose today's behavior a page author would not write is not stated: write it up as an open decision in your report (blocking, precedent) and skip it. A beginner page links nothing later in the reading order. No reading changes; `--diff` is empty.
**May edit:** `src/parse/boundaries.ts` and its test, `docs/grammar/beginner/dependents.md`, `docs/grammar/intermediate/quote-contents.md`, `docs/grammar/beginner/joins.md`, `docs/meta/interpreter.md`.

**S8. Unstated slot cells (D10, slots).**
Agent `proposal-worker`, `model: opus`, effort `high`.
The same as S7, for the `unstated` cells of `DISCOURSE_SLOTS` that S6 left: the end events (statement word, *by the way*, goodbye, and a new value on `hookResume` and `answer`), kept, and quote, on `standInBack`, `hookResume`, `sentenceBefore` and `answer`. State each as today's behavior on its owning page: [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back), [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md#hook-resume), [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period), [questions.md](../../grammar/beginner/questions.md). A cell a page author would not write goes in the report as an open decision, as in S7. No reading changes; `--diff` is empty.
**May edit:** `src/parse/discourse-slots.ts` and its test, those four pages, `docs/meta/interpreter.md`.

**S9. Tidy: act-word rows, placement, greetings (D4, D13, D14).**
Agent `proposal-worker`, `model: opus`, effort `medium`.
- **D4.** In `interpreter.md`, replace the pair table's edge rows (every body family that does not escape `force`) with one line: the act word covers every body frame that does not escape `force`, by tree nesting (reader rule 2). If the table is generated, make the generator fold them. Keep the derived rows in code; the frozen-rows test still guards them.
- **D13.** Add a scope test with two whole-clause frames of its own in an island. Make a whole-clause frame missing from a record an `unread` entry in `placeFrame`, so reader rule 3 holds in code. In `boundaries.ts` and `interpreter.md`, reword the `island` row to *a scope island or a verb-list item with words of its own*. Keep records for every island, read or not.
- **D14.** Fold `isGreetingScope` (`carry.ts`) into the `claims: false` member property. State on [evidentiality.md](../../grammar/intermediate/evidentiality.md#carry-forward) that a greeting, like a plan, claims nothing: it takes no frame and does not end one. Keep `PHRASE_FRAMES` and the other one-key rules as they are.

No reading changes; `--diff` is empty.
**May edit:** `docs/meta/interpreter.md` (and the pair-table generator, if there is one), `src/parse/scope.ts`, `src/parse/boundaries.ts`, `src/parse/carry.ts`, `src/parse/scope-profiles.ts`, `src/interpret/read-context.ts`, their tests, `docs/grammar/intermediate/evidentiality.md`.

**Phase 3 close.** *Orchestrator.* Run the recall gate and record it on the Status line. Bring the user any open decisions S7 and S8 reported. Consolidate, and note the settled rules the phase 4 page teaches. Expected commits: 6 unit commits, 1 consolidation commit.

### Phase 4: the scope page


**L1. Write the page.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write *How far a word reaches* as the last Intermediate page, in a new unit of its own after *Surprise and what's not so* (Status, D1). Every instance it covers is taught before it, so it uses a real example of each and links back to each. Five sections:

1. How far a word reaches: a word, a phrase, a clause, the rest of the sentence, past the period.
2. Earlier covers later, and the profile properties as the exceptions.
3. Boxes: what gets into a dependent, an island, a quote.
4. Whose it is: you, the holder, the one asked.
5. What carries past a period, and what ends it.

Teach from the profile, boundary and slot tables as phases 2 and 3 left them. Use only forms taught on earlier pages (the build's forward-link lint checks this), and link each rule to the section that teaches its instance. Check every form with one batched `node scripts/parse.mjs --check-lexicon`. Add the page to `reading-order.ts` and a read-by block per [read-by blocks](../../meta/grammar-docs.md#read-by-blocks). Propose new English names for [terminology.md](../../grammar/terminology.md) in the report; don't add them. Leave Practice to L3. Self-check against the [doc-style checklist](../../meta/doc-style.md#checklist).
**May edit:** the new page, `docs/grammar/.vitepress/lib/reading-order.ts`.

**L2. Instance pages lean on the general rule.**
Agent `proposal-worker`, `model: opus`, effort `high`.
On these sections, cut sentences that restate a general rule the reader has already met:

- [clause.md](../../grammar/beginner/clause.md#which-covers-which) (its exceptions table, per D4 and phases 2 and 3; its holder row is already right)
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

**Phase 4 close.** *Orchestrator.*

1. Add the terminology names L1 proposed (a review-later decision, its own commit).
2. Add the new page to the grammar table in `AGENTS.md`.
3. Run a full `npm run verify` against an empty baseline.
4. Delete this proposal once `interpreter.md` and the grammar own the result.

Expected commits: 5 unit commits, 1 for the cheat-sheet tool output, 1 terminology commit, 1 `AGENTS.md` commit, 1 final commit.

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

One commit per unit after its gate, staged with that unit's files only. Each is named `scope-model.md <ID>: <what it did> [skip-cd]`, with the co-author line. Each phase ends with a commit of the consolidated proposal. Expected: phase 2, 5 commits; phase 3, 7; phase 4, 9.

## Open decisions

None open. D1 to D14 are settled (Status); S7 and S8 may report new ones.

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

- No reading changes in phase 1, and in phases 2 and 3 only those the decisions name. A unit that changes any other reading stops and reports.
- No change to the solver, the matcher or the log beyond what a phase 2 or 3 decision requires.
- No change to the shape of `ResolveInfo`, `ClauseScope`, `Reading` or `Link`, except additive exports (such as an `explainPair` function) and the records U4 adds for islands.
- No moving of `pointBackLinks` into the resolve stage. The discourse-slot table describes both layers; it does not merge them.
- No style review of edits to existing pages (see Status). Only the new scope page gets one.
- No split of `read.ts` for size alone. It is under the ceiling.
