# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-19: phase 1 done (F1, F2, RF1, RF2); next is phase 2. Idea and triage 2026-11-19. User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. User, 2026-11-19: add the accounting guard; adopt every recommendation, and *always possibly* precludes *never* ([Decided](#decided)). User, 2026-11-19: the links F1's guard now leaves get rows here (R4d, B6). The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The readings D1–D17 adopt: each goes on its owning grammar page in the unit that builds its row, where no page states it yet. The `hinge` × `contrary` pair-table sample in `interpreter.md` (D14). The recipe rows *dependent on* and *independent* in `say-people-places.md` (D15).

## Design

Phase 1 built the faithful half. The **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused frame, link, SHARED detail, blank or member list (`claimMemberLists`) to `left` with reason `unused` and an `unused: string[]` field; a question with one answers `beyond`. The sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part; it skips examples whose translation throws. Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`; `ask` takes `{ asker }`); `aem` gives at least one; SHARED `/ɡ/` details are facts on first-mention members; `follows` and `couldBe` answer a `fillAsk` question `beyond`. After phase 1 the sweep leaves 394 of 5506 example readings, most of them links.

What remains, in this order. Every new row marks the parts it uses in the accounting, so its readings leave `left`.

1. **Copy rows**: a grammar anchor and the classification table already state the meaning ([Triage](#triage) marks each). Among them: noun conditions on *because* and *if*; hinge or binder over a say word; restrictor, whole-list denial and verbless *no K* inside a holder's wrap; *because* inside a holder; contrary-to with MAY, a holder, a universal or a bare restrictor; MAY over members, whole-list denials, say words, universals and `always`; `vaem vul`; the universal hinge's per-member back rule (its condition may mention `X`, which changes the edge rule) and definitions both ways; `zaya` as the turn's speaker plus addressees (`pronouns.md#special-pronouns`).
2. **Decision rows**: the [decided](#decided) rows are drafted with fixtures and built; a reading no grammar page states yet goes on its owning page in the same change. D14 and D15 also edit their doc pages: the pair-table sample and the two recipe rows.
3. **The fill job**, `fill(log, question)`: each blank a variable over `holds`, answers `{at, term, because}` with `fired` / `used`, adding the fillers `ask` cannot reach (universal to instance, hinges, membership). Copyable: an open blank, a blank limited to listed items (`…ar` with 2+ items), *all of them* (`zarx`), fill-all as tuples.

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

Probes from 2026-11-19 were in a session scratchpad; each item is rebuilt from its probe sentence. Phase 1's reader fixes are done; the notes in brackets name what a row reads.

| Area | Copy | Decision |
|------|------|----------|
| Holders | restrictor, whole-list denial, verbless *no K* in the wrap (R2-5 named rows 5–11; confirm the extension); topic-pronoun, `zawan` and after-`uom` holders [parties from `holderParty()` in `read.ts`] | — |
| Say words | hinge or binder over say; say word over an *and* list | D1 |
| *Because* | noun condition; *because* in a holder; `/ɡ/` stack `gebem gahum` [`stackedHinge()` gives the shared `hosted` term; no grounds-link copy, since `/ɡ/` takes no `blarl`] | D2, D3, D11, D12, D15 |
| Contrary-to | with MAY, holder, universal, bare restrictor; `channel(..)` zone | D1, D4, D14 |
| MAY | members, whole-list denial, MAY over say / universal / `always`, `vaem vul` | D5, D6, D13 |
| Hinges on universals | per-member back rule; definitions both ways; resume pronoun under a universal hinge [left as `anaphor:content`] | — |
| Lists | `oe` tie as data; SHARED hook after a join [the list's `sharedDetails`, role `distribute`, no `shared` link]; the `shared:*` link keys | D7, D9, D17 |
| Turn | `zaya`; `zawan` [`LogEntry.addressees`] | D16 |
| Stance numbers | — | D8 |
| Fill questions | the shapes in Design step 3 | D10 |
| Links (from F1's sweep) | link kinds the guard leaves as `unused` that no other area covers: sentence linkers, polar particles, tags, discourse hooks, stand-ins, carried channel and NOTIONAL, and the rest of the sweep's link keys | none yet; R4d logs them |

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)), in four phases; phase 1 is done. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

Every row is confirmed by the user when it is written ([adding a row](../../meta/solver.md#adding-a-row)). The decisions below settle what each row means; phase 2 drafts each row's encoding, anchor and fixture, and the user confirms them before phase 3 builds any.

### Phase 2: draft the rows

Before the units start, the orchestrator writes one `probe` file with every item of [Triage](#triage), runs it once (`node scripts/reading.mjs probe FILE`), and pastes each area's lines into its brief ([probe in batches](../../meta/procedures/proposals.md#running-with-subagents), step 16).

Each drafting unit writes, for every copy row and decided row in its area: the row (what it concludes, in the encoding of [solver.md](../../meta/solver.md#encoding)); its classification table row; its grammar anchor, quoted, or for a decided reading no page states, the sentence that will go on which page; and fixture sentences in `src/interpret/fixtures/draft-<area>.txt`, checked with one `probe` run, each with the verdict the row should give. A unit writes its drafts to a scratch file the brief names; the orchestrator merges them into a **Rows for confirmation** section here. A row that needs a meaning no decision settles is logged as an open decision, not drafted.

**R4a Holders, say words, turn.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the Holders and Say words lines of [Triage](#triage), D1, D16 and `zaya`. `zawan` and `zaya` read `LogEntry.addressees` (`{by: "call" | "lastCall" | "otherSpeaker", to: Addressee[]}`, worked out under D16), never the call frames on a reading: a call frame lands on every body of an utterance that runs across host turns.  
**May edit:** `src/interpret/fixtures/draft-holders.txt`, its scratch draft file.

**R4b *Because*, contrary-to, MAY, hinges.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the *Because*, Contrary-to, MAY and Hinges on universals lines; D2 to D6 and D11 to D15 (D15's solver half: a named outcome under a `/ɡ/` hinge). The change to the edge rule that a universal hinge's condition must not mention `X`. `vaem vul`: with `aem` now *at least one*, it may take row 21 as `vael vul` does, if `set-joins.md` confirms it.  
**May edit:** `src/interpret/fixtures/draft-because.txt`, `src/interpret/fixtures/draft-maybe.txt`, its scratch draft file.

**R4c Lists, stance numbers, fill.**  
`proposal-worker`, `model: opus`, effort `high`.  
Copy rows of the Lists and Stance numbers lines; D7 to D10 and D17; the `fill` job's inputs, outputs and CLI (`reading.mjs solve` dispatches a `fillAsk` question to it, and `probe` too; `follows` and `couldBe` now answer it `beyond` with reason `fillAsk`).  
**May edit:** `src/interpret/fixtures/draft-lists.txt`, `src/interpret/fixtures/draft-fill.txt`, its scratch draft file.

**R4d Links.**  
`proposal-worker`, `model: opus`, effort `high`.  
User, 2026-11-19: before F1 the translator ignored these links and kept the rest of the clause; the guard now leaves every reading that carries one (about 280 example readings). Run the sweep in `src/interpret/accounting.test.ts` for its counts by part key, and take every link key no other drafting unit covers (the `shared:*` keys of lists go to R4c, `anaphor:content` to R4b). For each kind: where the grammar page and the classification table say the link adds nothing the encoding states (a tag, a polar particle on an assertion), a copy row that marks it used and keeps the clause; where it adds a meaning (a linker such as *therefore* or *but*, a carried channel), a row in the encoding with its anchor, or an open decision with its **Recommendation:** when no page settles it.  
**May edit:** `src/interpret/fixtures/draft-links.txt`, its scratch draft file.

**Order:** R4a, R4b, R4c, R4d. Then the user confirms the rows; the phase ends there.

### Phase 3: build *because*, contrary-to, MAY, holders and say words

Each build unit adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases, moves its `draft-*.txt` cases into the `solve-*.txt` of the same area (`solve-holders.txt`, `solve-because.txt`, `solve-maybe.txt`, `solve-lists.txt`), or `git mv`s the draft to a new `solve-*.txt` when no file fits, then deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`), adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge, and writes each confirmed grammar sentence on its page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; the style gate reviews it).

**B1 Holders, say words, turn.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4a's confirmed rows. A holder party comes from `holderParty()` in `read.ts`; after `uom` the zone reads `contrary.inner = [holder{inner: [stance (member: "channel", holderHost)]}, intention?]`. `holder()` in `translate.ts` must resume a topic-pronoun party through its antecedent (`xazozon theyomalen zalazun vudurul.` is left as `anaphor:topic` until it does), and its doc comment ("the reader gives it no antecedent") is stale. `-r` holders (`bindContent`) still read as named things: switch them to `pronoun()` here with the translator (RF1's recommendation, medium).  
**May edit:** `src/interpret/read.ts` (the `-r` holder party only), `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), `src/interpret/match.ts` (turn terms only), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages R4a's confirmed sentences name.

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
R4c's confirmed rows for `ue`, `oe`, two denial lists, SHARED details and stance numbers (D7, D8, D9, D17). Also fix the throw: `translate()` crashes on `zazozon dugavalx grodol oel growal vayebel.` (`open-ranges.md`) in `inRange` / `compareValues`; then make the sweep in `accounting.test.ts` fail on a throw instead of skipping it.  
**May edit:** as B1, the grammar pages R4c's confirmed sentences name.

**B6 Links.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d's confirmed rows; each marks its link used in the accounting. Report the sweep's new count of `unused` readings by part key.  
**May edit:** as B1, the grammar pages R4d's confirmed sentences name.

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
The `npm run changed-sections -- <rev>` list, where `<rev>` is `9e38c73d`, the commit before F1's.  
**May edit:** the listed sections.

**Order:** B4, B6, B5, P1, S1. Then the recall gate (P1 edits a recipe page), the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

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
- Nothing is dropped silently: a row marks each part it uses in Translation.accounting; anything
  unused goes to left as `unused`. The sweep src/interpret/accounting.test.ts must stay green.
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
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line. Phase 2 makes one commit for the drafts and one for the confirmation. About 18 commits in all, the last deleting this proposal.

## Open decisions

None open. Phase 2 may log some, each with its **Recommendation:**.

## Background

### Problem

[The edge](../../meta/solver.md#the-edge) listed about thirty constructions with no row, and a triage on 2026-11-19 found that several translated into wrong programs with `left` empty, so a job gave a confident wrong answer. The cause was one: the translator wrote what its rows knew and ignored the rest of a reading. Phase 1 fixed the wrong answers and added the guard; what is left is the rows.

### Goals

- No silent drop: every reading is translated whole, or listed in `left`; every question is read whole, or answered `beyond`. A test enforces it.
- No wrong answer from a known bug: speakers, `aem`, fill questions, SHARED details, resume pronouns under a universal.
- Every item of the old edge either has a confirmed row or is named in the edge as still left, with its reason.
- A `fill` job that answers *who*, *which* and *what kind* with the readings behind each answer.

### Non-goals

- **Host policies** (see Status): they wait for a consumer.
- **No consumer.** No site page or tool starts calling the solver here.
- **No new forms.** A reading adopted here goes on its page; a sentence that needs a form the grammar lacks is a finding.
- **When, where, whose and how** fill questions wait for detail-term rows (D10).
