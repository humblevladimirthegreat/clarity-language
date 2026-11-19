# Solver coverage: the edge, wrong answers, and fill questions

**Status:** READY, 2026-11-19. Idea and triage 2026-11-19. User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. User, 2026-11-19: add the accounting guard; adopt every recommendation, and *always possibly* precludes *never* ([Decided](#decided)). The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The readings D1–D17 adopt: each goes on its owning grammar page in the unit that builds its row, where no page states it yet. The `hinge` × `contrary` pair-table sample in `interpreter.md` (D14). The recipe rows *dependent on* and *independent* in `say-people-places.md` (D15).

## Problem

[The edge](../../meta/solver.md#the-edge) lists about thirty constructions with no row. A triage on 2026-11-19 probed each one, and found that several are not refused at all: they translate into wrong programs with `left` empty, so a job gives a confident wrong answer.

- **False clash across speakers.** A: `zuwen vowurol.` B: `zuwen vowurol vul.` clash, because `structural()` in `match.ts` fits any speaker to any speaker. `zawan` is one `listener` constant, so the same happens there.
- **Fill questions answer yes or no.** After `zual gogozel vowurol. zahelan gogozel.`, *who walks?* (`yel zar vowurol.`) answers *Yes*. `solve.ts` never checks the `fillAsk` force; the blank matches as a wildcard.
- **A resume pronoun under a universal hinge becomes the kind.** In `zual geyel gwozeduyol thehom blarl zeyer veduyol.` the condition reads *the person kind teaches*, so after `zahelan geyel. zahelan veduyol.` *is Ahelan a teacher?* is *can't say*.
- **Dropped silently:** a say word over an *and* list (no member rule); the SHARED word of an `oe` list (`zazozon zalazun zoel gamahum.` gives only `be(..)`); SHARED details after a join on first-mention members (`detail` facts missing; the question match sees them, rules do not); SHARED `/ɡ/` on named members with no verb.
- **A doc and translator mismatch.** Row 20 says `aem` adds no rule, but `set-joins.md#exclusivity-and-denying-a-whole-list` says "even `-m` still needs at least one".
- **The edge text is stale.** `uwen` in a role is already turn-tied; a speaker holder (`theyomuwen`) is not a form; the confirmed contrary-to `channel(..)` zone is unbuilt even with no holder.

All of these share one cause: the translator writes what its rows know and ignores the rest of a reading.

## Goals

- No silent drop: every reading is translated whole, or listed in `left`; every question is read whole, or answered `beyond`. A test enforces it.
- No wrong answer from a known bug: speakers, `aem`, fill questions, SHARED details, resume pronouns under a universal.
- Every item of the old edge either has a confirmed row or is named in the edge as still left, with its reason.
- A `fill` job that answers *who*, *which* and *what kind* with the readings behind each answer.

## Non-goals

- **Host policies** (see Status): they wait for a consumer.
- **No consumer.** No site page or tool starts calling the solver here.
- **No new forms.** A reading adopted here goes on its page; a sentence that needs a form the grammar lacks is a finding.
- **When, where, whose and how** fill questions wait for detail-term rows (D10).

## Design

In this order.

1. **Faithfulness.**
   - **The accounting guard** (permanent). The translator marks each frame, link, SHARED detail and blank on a reading as used by a row; a reading with anything unused goes to `left` with reason `unused` and what was unused, and a question with anything unused answers `beyond`. A test runs every grammar example through the translator and fails on a silent drop, so the next one is caught when it lands.
   - **Permanent fixes:** speaker and listener fit only the same turn's person in `match.ts` (the matcher's `ask` shares it); `aem` gives at least one; SHARED details become facts on first-mention members; the edge text is corrected; `follows` and `couldBe` answer `beyond` to a `fillAsk` question (a yes or no job never answers one; step 5's job does).
   - **Temporary, until the row lands** (the guard does this by itself): a say word over an *and* list, the `oe` SHARED word, and a resume pronoun under a universal hinge go to `left`.
2. **Reader fixes**, then copy rows. The reading lacks what a stated row needs:
   - topic-pronoun and `zawan` holder parties (`readH` never calls `pronoun()`);
   - a holder or channel after `uom` (`readHook` zone builds bare frames);
   - a `/ɡ/` stacked hinge (`stackedHinge()` handles `/th/` only);
   - a SHARED hook after a join (`sharedDetails()` handles `/ɡ/` and `/h/` only);
   - the turn's addressees on `Turn`, from its calls, for `zawan` and `zaya`.
3. **Copy rows**: a grammar anchor and the classification table already state the meaning ([Triage](#triage) marks each). Among them: noun conditions on *because* and *if*; hinge or binder over a say word; restrictor, whole-list denial and verbless *no K* inside a holder's wrap; *because* inside a holder; contrary-to with MAY, a holder, a universal or a bare restrictor; MAY over members, whole-list denials, say words, universals and `always`; `vaem vul`; the universal hinge's per-member back rule (its condition may mention `X`, which changes the edge rule) and definitions both ways; `zaya` as the turn's speaker plus addressees (`pronouns.md#special-pronouns`).
4. **Decision rows**: the [decided](#decided) rows are drafted with fixtures and built; a reading no grammar page states yet goes on its owning page in the same change, as R2 and R3's did. D14 and D15 also edit their doc pages: the pair-table sample and the two recipe rows.
5. **The fill job**, `fill(log, question)`: each blank a variable over `holds`, answers `{at, term, because}` with `fired` / `used`, adding the fillers `ask` cannot reach (universal to instance, hinges, membership). Copyable: an open blank, a blank limited to listed items (`…ar` with 2+ items), *all of them* (`zarx`), fill-all as tuples.

## Decided

User, 2026-11-19, each as recommended; D13 as the user stated it.

1. **Say word over a frame.** Over a universal or an *and* list, a say word gives one per member for allow and require only (forbidding *both walk* does not forbid each). Over a hinge, *because*, MAY or a contrary zone, the wrap is data: nothing follows (R2-6).
2. **A *because* condition with its own frame** (MAY, holder, say word) is that clause's own term (`may(T)`, `view(H,T)`, `say(..T)`), claimed, and the link names it, as R3-5 does for *if*.
3. **MAY over *because*** hedges only the link (`cause`, `fault`, `share`); the outcome and condition stay claimed (`fault.md#fault`: "hedge it with MAY right before the hinge").
4. **`uom` before a fence** takes the same per-member rule as the fence first: `against(T[X], Z)`.
5. **Only-if and iff with MAY.** On the condition, R3-5 (`may(T)` in the body). Under the hinge, no backward rule, as R3-1 row 6 for *if*.
6. **A carried holder on a MAY sentence** is the holder's own MAY, `view(H, may(T))` (holder table: MAY is the holder's). **A MAY question** runs as `couldBe`, whatever job is called.
7. **`ue`** denies each listed item (the classification row: "as `u`"). The outside item that holds adds no rule, as open `aem` adds none.
8. **Channel stances on your own claim** (`thebam`, `th_N`, `th#N`, `th@+95`, `th-e-`) take row 1, with the frame in `notes`, like row 16 (`evidentiality.md#evidentiality`: "the listener always knows what your claim rests on"). Not R3-7's estimate row: these name sources, not likelihoods.
9. **Two denial lists in one clause** deny the joint substitution, `neg(T[a][b])`.
10. **The fill job.** Cautious answers by default, brave with `--possible`; one `zar` with several fillers lists them all; no filler is *unknown* unless `closedWorld` gives *nobody*; `…er` is an existence yes or no; `gar` answers from `isa` only until named details are encoded; *why* binds `C` from `cause(C, Out)` only, not a met *if*. When, where, whose and how wait for detail-term rows.

11. ***Because* over MAY** (`thahum blarth thomam zazozon vowurol.`) is a world cause of a possible outcome: the condition claimed, the outcome a choice, the link `cause(C, may(O))`. Speaker grounds have their own form (`say-reasons.md#epistemic-because`).
12. ***Because* under `hual` / `huam`, and with *or*.** The hinge holds for each occasion (the `hinge` × `occasion` pair row), so `always` marks the outcome, the condition and the link; under `huam` the three are one choice together. With *or*, the link is per item, in the worlds where that item holds.
13. ***Always* over MAY** (`hual zazozon vowurol thomam.`) gives `holds(may(T))` and the marker `always(may(T))`, and clashes with *never* (`never(T)`, row 15). It does not clash with a plain denial (R3-2).
14. **Contrary-to with a hinge.** The `hinge` × `contrary` pair row's second sample changes to the `blarth` form, so its two samples follow its own text-order rule (check `contrary-to.md` first). A hinge over a zone puts `against` on the outcome (a copy row); a zone over a hinge is data, since the encoding has no term for a conditional.
15. **No person after `gahum`.** The rule in `because-and-iff.md#choosing-a-hinge` stands ("a named event or place …, never the person"; the reason is in `fault.md#fault`); the recipe rows *dependent on* and *independent* in `say-people-places.md` are fixed to say what about the person is needed. A named outcome under a `/ɡ/` hinge claims the condition and keeps the link as data, with no back rule.
16. **`zawan` with no call** is the speaker's last call; else, with two speakers, the other one; else it fits no other turn's `zawan`. This carries forward as `collectives.md` does for `awanx`.
17. **`oe` ties.** A tie claims no member has the quality (`comparatives.md#equatives` keeps *both are challenging* apart as an *and* list). Closed `zoel` clashes with `zol` on the same scale; `zoem` is data only; with a verb, each member's act holds; three or more are all tied, pairwise.

## Triage

Probes from 2026-11-19 were in a session scratchpad; each item is rebuilt from its probe sentence.

| Area | Copy | Reader first | Decision |
|------|------|--------------|----------|
| Holders | restrictor, whole-list denial, verbless *no K* in the wrap (R2-5 named rows 5–11; confirm the extension) | topic pronoun, `zawan`, after `uom` | — |
| Say words | hinge or binder over say | — | D1 |
| *Because* | noun condition; *because* in a holder | `/ɡ/` stack (`gebem gahum`) | D2, D3, D11, D12, D15 |
| Contrary-to | with MAY, holder, universal, bare restrictor; `channel(..)` zone | holder after `uom` | D1, D4, D14 |
| MAY | members, whole-list denial, MAY over say / universal / `always`, `vaem vul` | — | D5, D6, D13 |
| Hinges on universals | per-member back rule; definitions both ways | — | — |
| Lists | `oe` tie as data, `aem` at least one, SHARED details | SHARED hook | D7, D9, D17 |
| Turn | `uwen` fit, `zaya` | addressees on `Turn` | D16 |
| Stance numbers | — | — | D8 |
| Fill questions | the shapes in Design step 5 | — | D10 |

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)), in four phases. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

Every row is confirmed by the user when it is written ([adding a row](../../meta/solver.md#adding-a-row)). The decisions below settle what each row means; phase 2 drafts each row's encoding, anchor and fixture, and the user confirms them before phase 3 builds any. The faithfulness fixes in phase 1 add no row: they apply confirmed rows (row 14 to SHARED details, row 20 as `set-joins.md` states it) or remove a wrong answer.

### Phase 1: faithfulness and reader fixes

**F1 The accounting guard.**  
`proposal-worker`, `model: opus`, effort `high`.  
Design step 1, first bullet. The translator records which frames, links, SHARED details and blanks of each reading a row used; a reading with anything unused goes to `left` with reason `unused` and what was unused; a question with anything unused answers `beyond` with that reason. A test runs the grammar examples (the reading pass `src/find/` runs) through `translate()` and fails when a reading has an unused part and is not in `left`. Report how many readings the guard newly moves to `left`, by frame key, and any golden that changes.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/solve.ts` (the `beyond` reason only), `src/interpret/solve.test.ts`, a new test file beside them, `src/interpret/fixtures/solve-*.lp` (goldens the guard changes).

**F2 Permanent fixes.**  
`proposal-worker`, `model: opus`, effort `high`.  
Design step 1, second bullet, each with a test that fails before the fix: speaker and listener terms fit only the same turn's person in `match.ts` (check `ask` too, and its tests); `aem` gives *at least one* (`set-joins.md#exclusivity-and-denying-a-whole-list`), and row 20 in `solver.md` says so; SHARED `/ɡ/` details become `detail` facts on first-mention members, and SHARED `/ɡ/` on named members with no verb gives `isa` per member (row 14); `follows` and `couldBe` answer `beyond` to a `fillAsk` question; the edge text in `solver.md` is corrected (`uwen` in a role is turn-tied; `theyomuwen` is not a form; the `channel(..)` zone is unbuilt). Add the triage's cases as a fixture, `solve-faithful.txt`.  
**May edit:** `src/interpret/match.ts`, `src/interpret/translate.ts`, `src/interpret/solve.ts`, their tests, `src/interpret/ask.test.ts`, `src/interpret/fixtures/solve-*`, `docs/meta/solver.md`.

**RF1 Holder parties.**  
`proposal-worker`, `model: opus`, effort `high`.  
Design step 2: a topic-pronoun holder's party carries its antecedent (`readH` calls `pronoun()`); `theyomawan`'s party is the listener term; a holder or channel after `uom` gets its party and its channel gloss (`readHook` zone). A reading test for each; the [classification table](../../meta/interpreter.md#classification-table) rows changed in the same edit. The solver may still leave them; the rows are phase 3's.  
**May edit:** `src/interpret/read.ts`, `src/interpret/classes.ts`, their tests, `src/interpret/coverage-ratchet.json` if the coverage test asks, `docs/meta/interpreter.md` (classification table rows).

**RF2 Stacked hinge, SHARED hook, addressees.**  
`proposal-worker`, `model: opus`, effort `high`.  
Design step 2: `stackedHinge()` handles `/ɡ/` (`gebem gahum`) as it does `/th/`; `sharedDetails()` carries a SHARED hook after a join to every item (`list-structure.md#shared-after-the-join`); `Turn` carries its addressees from its calls, carried forward per D16. A test for each, classification table rows in the same edit.  
**May edit:** `src/interpret/read.ts`, `src/interpret/classes.ts`, `src/interpret/log.ts`, their tests, `src/interpret/coverage-ratchet.json`, `docs/meta/interpreter.md` (classification table rows).

**Order:** F1, F2, RF1, RF2.

### Phase 2: draft the rows

Before the units start, the orchestrator writes one `probe` file with every item of [Triage](#triage), runs it once (`node scripts/reading.mjs probe FILE`), and pastes each area's lines into its brief ([probe in batches](../../meta/procedures/proposals.md#running-with-subagents), step 16).

Each drafting unit writes, for every copy row and decided row in its area: the row (what it concludes, in the encoding of [solver.md](../../meta/solver.md#encoding)); its classification table row; its grammar anchor, quoted, or for a decided reading no page states, the sentence that will go on which page; and fixture sentences in `src/interpret/fixtures/draft-<area>.txt`, checked with one `probe` run, each with the verdict the row should give. A unit writes its drafts to a scratch file the brief names; the orchestrator merges them into a **Rows for confirmation** section here. A row that needs a meaning no decision settles is logged as an open decision, not drafted.

**R4a Holders, say words, turn.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the Holders and Say words lines of [Triage](#triage), D1, D16 and `zaya`.  
**May edit:** `src/interpret/fixtures/draft-holders.txt`, its scratch draft file.

**R4b *Because*, contrary-to, MAY, hinges.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the *Because*, Contrary-to, MAY and Hinges on universals lines; D2 to D6 and D11 to D15 (D15's solver half: a named outcome under a `/ɡ/` hinge). The change to the edge rule that a universal hinge's condition must not mention `X`.  
**May edit:** `src/interpret/fixtures/draft-because.txt`, `src/interpret/fixtures/draft-maybe.txt`, its scratch draft file.

**R4c Lists, stance numbers, fill.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the Lists and Stance numbers lines; D7 to D10 and D17; the `fill` job's inputs, outputs and CLI (`reading.mjs solve` dispatches a `fillAsk` question to it, and `probe` too).  
**May edit:** `src/interpret/fixtures/draft-lists.txt`, `src/interpret/fixtures/draft-fill.txt`, its scratch draft file.

**Order:** R4a, R4b, R4c. Then the user confirms the rows; the phase ends there.

### Phase 3: build *because*, contrary-to, MAY, holders and say words

Each build unit adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases, moves its `draft-*.txt` cases into the `solve-*.txt` of the same area (`solve-holders.txt`, `solve-because.txt`, `solve-maybe.txt`, `solve-lists.txt`), or `git mv`s the draft to a new `solve-*.txt` when no file fits, then deletes an emptied draft with `git rm`, adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge, and writes each confirmed grammar sentence on its page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; the style gate reviews it).

**B1 Holders, say words, turn.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4a's confirmed rows.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), `src/interpret/match.ts` (turn terms only), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages R4a's confirmed sentences name.

**B2 *Because* and contrary-to.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b's confirmed rows for *because* (noun conditions, *because* in a holder, D2, D3, D11, D12, D15's solver half) and contrary-to (with MAY, a holder, a universal, a bare restrictor, the `channel(..)` zone, D4, D14), and D14's pair-table sample in `interpreter.md` (check `contrary-to.md` first, as D14 says).  
**May edit:** as B1, plus `docs/meta/interpreter.md` (the `hinge` × `contrary` row only), the grammar pages R4b's confirmed sentences name.

**B3 MAY and hinges on universals.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b's remaining confirmed rows: MAY over members, whole-list denials, say words, universals and `always` (D13), `vaem vul`, D5, D6; the per-member back rule and definitions both ways, with the edge rule changed.  
**May edit:** as B1, the grammar pages R4b's confirmed sentences name.

**Order:** B1, B2, B3.

### Phase 4: build lists and fill; recipes; style

**B4 Lists and stance numbers.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c's confirmed rows for `ue`, `oe`, two denial lists, SHARED details and stance numbers (D7, D8, D9, D17).  
**May edit:** as B1, the grammar pages R4c's confirmed sentences name.

**B5 The fill job.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c's confirmed `fill` job (D10): `fill(log, question, options)` in `solve.ts`, exported from `solve-browser.ts` and `browser.ts`; `reading.mjs solve` and `probe` dispatch a `fillAsk` question to it; the reply through `reply.ts`; the Jobs and CLI sections of [solver.md](../../meta/solver.md#jobs).  
**May edit:** `src/interpret/solve.ts`, `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/reply.ts`, `src/interpret/probe.ts`, `src/interpret/cli.ts`, their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`.

**P1 Recipe rows.**  
`proposal-worker`, `model: opus`, effort `high`.  
D15: the *dependent on* and *independent* rows in `say-people-places.md` say what about the person is needed, never the person after `gahum` (`because-and-iff.md#choosing-a-hinge`). Read `docs/meta/procedures/english-helper.md` first. Forms checked with `parse.mjs --check-lexicon`; if no natural form exists without new grammar, stop and report.  
**May edit:** `docs/grammar/say-people-places.md` (those two rows), English helper data the procedure names for them.

**S1 Style gate.**  
`style-editor`, `model: opus`, effort `high`.  
The `npm run changed-sections -- <rev>` list, where `<rev>` is the commit before F1's.  
**May edit:** the listed sections.

**Order:** B4, B5, P1, S1. Then the recall gate (P1 edits a recipe page), the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

### Rule digest (pasted into every brief)

```
- Work only on your unit's items and files. Read AGENTS.md; never trust a form from memory.
- Ageben forms come from grammar pages and the parser. Check forms with one batched
  node scripts/parse.mjs --check-lexicon '<a>' '<b>' ...; keep --llm-prompt for working out
  what a sentence means.
- Probe in batches: put every test sentence in one file for node scripts/reading.mjs probe
  [--program] FILE (cases split by ---, ? asks follows, ?~ asks couldBe), run it once, and
  re-probe only what surprised you. find.mjs lists ten examples; ask --all only when needed.
- No new grammar. A sentence that needs a form the grammar lacks is a finding: report the
  English and the nearest workaround, then move on.
- A row copies what a grammar page and the classification table say, or a decision D1-D17 in
  this proposal's Decided section (the brief quotes the ones you need), and cites it. A meaning
  none of them states is an open decision for the user, never a choice you make.
- Encoding, translation table, jobs and edge: docs/meta/solver.md. A denial is holds(neg(T)).
- Code: TypeScript, Node >= 24, run with npx --no-install tsx; tests with tsx --test beside the
  source (*.test.ts). Only solve.ts and solve-browser.ts import clingo-wasm.
- Never walk the parse tree; read Readings. Fitting is match()'s; step conditions are steps.ts's.
  If a reading lacks what a row needs, stop and report.
- Nothing is dropped silently: whatever a row does not use goes to left (the accounting guard).
- Clingo programs keep to the Clingo 5 / 6 common ground: no conditional literals in rule
  bodies, no _ inside not, no integer division.
- The loop (run) and host verdicts stay synchronous; never call the solver from them.
- Never link to a file under docs/proposals/; name it in backticks.
- Read slices: npm run -s outline or grep -n '^#' first, then the line ranges you need.
- Edits that repeat go in a script file under the scratchpad or tmp/scratch/, never inline.
- Verify with npm run verify -- --allow-generate (--fast inside an item); never paste raw build
  output. On a new error, read only that line of tmp/logs/verify-last.log.
- Do not commit; the orchestrator commits.
- Stop and report instead of working around: a premise no longer holds, later units would need a
  different design, or skipping would leave a broken state.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
  If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
  clean point, leave the tree green, and report: done, left (as steps), files touched.
- Report (about 150 words): done; files touched (count); verify line; findings or open decisions
  (problem, options, recommendation with confidence); skips with reasons; AGENTS.md lines to
  change; anything the orchestrator must run; left; inefficient. Add the encoding, ids or
  fixture names a later unit is briefed from.
```

Full rules a subagent may open if the digest does not settle a question: [solver.md](../../meta/solver.md), [interpreter.md](../../meta/interpreter.md) ([classification table](../../meta/interpreter.md#classification-table), [matching](../../meta/interpreter.md#matching)), [read-ageben.md](../../meta/procedures/read-ageben.md).

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` after each unit, before its commit.
- Phase 2's gate is the user's confirmation of the drafted rows, logged on the Status line with its date.
- Recall gate, at the end of phase 4: `npm run english-helper-recall -- --check`, with its result on the Status line.
- Final gate, at the end of phase 4: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line. Phase 2 makes one commit for the drafts and one for the confirmation. About 16 commits in all, the last deleting this proposal.

## Open decisions

None open. Phase 2 may log some, each with its **Recommendation:**.
