# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-19: phase 1 done (F1, F2, RF1, RF2); phase 2's drafts done (R4a to R4d, [Rows for confirmation](#rows-for-confirmation)); next is phase 2's gate, the user's confirmation of the rows and answers to the [open decisions](#open-decisions). Idea and triage 2026-11-19. User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. User, 2026-11-19: add the accounting guard; adopt every recommendation, and *always possibly* precludes *never* ([Decided](#decided)). User, 2026-11-19: the links F1's guard now leaves get rows here (R4d, B6). The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
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

## Rows for confirmation

Phase 2's drafts, 2026-11-19, merged unedited from units R4a to R4d. Fixtures: `src/interpret/fixtures/draft-holders.txt`, `draft-because.txt`, `draft-maybe.txt`, `draft-lists.txt`, `draft-fill.txt`, `draft-links.txt`. The user confirms these rows (or names the ones to change) before phase 3 builds any; each unit's findings feed the build unit that takes its rows.

### Orchestrator notes

- **A question can answer itself** (R4c finding): `yel zodozel gamahum.` answers `yes` from an unrelated log; the question's witness facts seem to carry the predicate asked. A solver bug, not a row: B5 (the fill job's unit) or the first build unit touching `solve.ts` fixes it first.
- **Reader gaps a row waits on:** a holder after `uom` (R4b-10; `readHook` in `read.ts`); `hookJob:resume` with no `to` (R4d-7); `standInBack` always pointing to the previous sentence (R4d-8); `el` / `em` / `ul` / `um` hooks with no `to` (R4d O-2, O-3). Each build unit fixes the gap its rows need, in `read.ts`, under the same rule as B1's `-r` holder.
- **Outside this proposal** (left groups the drafts met, host policies or other subsystems): CAUSE `thewom` before a hinge, `/h/` hinges, sake words with MAY, `stimulus:g`, nested hinges, and the table fragments with nothing after a stand-in (R4d finding).

### R4a: holders, say words, the turn's addressees

Fixtures: `src/interpret/fixtures/draft-holders.txt` (entries `k1`–`k52`; `k20` dropped). Probe files in the scratchpad: `r4a-probe.txt`, `r4a-probe2.txt`, `r4a-probe3.txt`. "Now" verdicts are from one probe run on 2026-11-19 at commit 0184a2d8.

#### R4a-1: restrictor inside a holder's view
- **Kind:** copy (extends Holders row 4, "rows 5 to 11 run inside the view", to row 15; confirm the extension)
- **Covers:** Holders, restrictor in the wrap; `frameCombination` with `occasion:lexReading:restrictor` + `holder:xFamily:holder` (`zawan vebal hal thevumayan.`, `hal thevumayan`, `hual thevumayan`; probe `holders-5`, `holders-19`, `holders-20`). `ham thevumayan` stays out: bare `ham` has no row even unwrapped.
- **Concludes:** row 15 with each term wrapped. `hual`: `holds(view(H, T)) :- on(Id).` and the marker `always(view(H, T))`; `hal`: `holds(view(H, neg(T))) :- on(Id).` and `never(view(H, T))`; open `huam`: row 10's choice on `view(H, T[X])`. Listed exceptions: only the marker. Marks the restrictor frame and the holder used (the lift of `ctx.wrap && frames.restrictor` → `frameCombination`).
- **Classification:** `lexReading:restrictor` (frame:occasion) under `xFamily:holder`: no new row; scope statement `holder.md#what-the-holder-covers` (against `occasion`) already in the table.
- **Anchor:** `holder.md#what-the-holder-covers`: "Everything else in the clause, wherever it sits, belongs to the holder" and "On MEMORY this is the history you both know, so a sweeping *never* or *always* covers only the times you both remember".
- **Fixtures:** k1 + k2 clash in Azozon's view (now: no clash, both left `frameCombination`); k1 + k3 no clash (now: no clash, left); k1, `? zalazun vozuyel.` → no (now: unknown, left); k4 + k5 clash in the shared view, k5 carried (now: no clash; k4 left, k5 left `carry:holder`).

#### R4a-2: whole-list denial inside a holder's view
- **Kind:** copy (extends Holders row 4 to row 4 of the table; confirm the extension)
- **Covers:** Holders, whole-list denial in the wrap; `noRow joinSeries:u` when `ctx.wrap` is set (no grammar example in the sweep; fixture only).
- **Concludes:** `clash(view(H, notall(Id))) :- fits(i(Id, 1), P1), holds(view(H, P1)), fits(i(Id, 2), P2), holds(view(H, P2)), on(Id).`; never meets your own claims. The `vel vul` / `vem vul` forms (row 21) the same way, wrapped: `clash(view(H, notone(Id)))`. Marks the denial list and the holder used. `Clash.english` names the holder.
- **Classification:** `joinSeries:u` over a closed list, under `xFamily:holder`: no new row.
- **Anchor:** `holder.md#what-the-holder-covers`: "Everything else in the clause, wherever it sits, belongs to the holder".
- **Fixtures:** k6 + k7 + k8 clash in Alazun's view (now: no clash, k6 left `joinSeries:u`); k9 + k10 + k6 no clash (now: no clash, k6 left).

#### R4a-3: verbless *no K* inside a holder's view
- **Kind:** copy (extends Holders row 4 to row 9; confirm the extension)
- **Covers:** Holders, verbless *no K* in the wrap; `noRow joinSeries:u:kind` when `ctx.wrap` is set (fixture only).
- **Concludes:** `clash(view(H, none(Id))) :- holds(view(H, isa(X, K))), on(Id).` Your own `isa` facts never reach it. Marks the binder frame and the holder used.
- **Classification:** `joinSeries:u:kind` + `shared:kind` under `xFamily:holder`: no new row.
- **Anchor:** `holder.md#what-the-holder-covers`: "Everything else in the clause, wherever it sits, belongs to the holder".
- **Fixtures:** k11 + k12 clash in Azozon's view (now: no clash, k11 left `joinSeries:u:kind`); k13 + k11 no clash (now: no clash, k11 left).

#### R4a-4: topic-pronoun holder
- **Kind:** copy
- **Covers:** Holders, topic-pronoun holder; `unused anaphor:topic` (`xazozon theyomalen zalazun vudurul.`, probe `holders-28`).
- **Concludes:** Holders row 1 with `H` the topic the pronoun is bound to (`holderParty()` → `throughAntecedent`), `holds(view(azozon, T))`. The holder marks the pronoun's `anaphor:topic` link used, as `resume()` does for a pronoun in a role. The `unit:linker` link on `xazozon` is not this row's (see Findings).
- **Classification:** `anaphor:topic` (link) and `xFamily:holder`: no new row; the `xFamily:holder` row already says "The topic pronoun is a pronoun with the topic it is bound to as its antecedent".
- **Anchor:** `holder.md#naming-a-holder`: "The holder may be the topic pronoun, whoever the conversation is about now".
- **Fixtures:** k14 + k15 clash in Azozon's view, once the linker has a row (now: no clash, k14 left `unused anaphor:topic`, `unit:linker`).

#### R4a-5: listener holder
- **Kind:** copy (with R4a-8 for who the listener is)
- **Covers:** Holders, `zawan` holder; `noRow xFamily:holder` on a listener party (`thomam thuwathumuem theyomawan.` is also blocked by `lexReading:sake`; fixture `k16`).
- **Concludes:** `holds(view(L, T)) :- on(Id).` with `L` the turn's addressee term from R4a-8 (`azozon`, `sp("Cal")`), else `listener(N)`. A resolved `L` is an ordinary holder, so the listener's view and a view named by name meet. Marks the holder used.
- **Classification:** `xFamily:holder`: no new row ("the listener is the listener term, as `zawan` is in a role").
- **Anchor:** `holder.md#naming-a-holder`: "The holder word ends the way a noun for that person would"; `pronouns.md#special-pronouns`: "**`awan`** | listener in this conversation".
- **Fixtures:** k16 + k15 clash in Azozon's view (now: no clash; call left `edge:vocative`, view left `xFamily:holder`).

#### R4a-6: holder or channel after `uom`
- **Kind:** copy (row 14's zone terms, now that the reader gives the zone's holder a party)
- **Covers:** Holders, after-`uom` holders; `noRow hookJob:zone` (`zazozon vowurol uom theyomalazun thagom.`, `zazozon vowurol uom thebamalazun.`, `zamozal dobedol vagedal uom thebamahelan.`, `zamozal vagedal uom theyomahelan thagom.`; probe `holders-21`, `-22`, `-24`, `-25`). Also the channel zone with no holder (`uom thebam`), unbuilt for the same reason.
- **Concludes:** row 14: `holds(T) :- on(Id).` and `holds(against(T, Z)) :- on(Id).` with `Z` = `plan(H)` (holder + PLAN; no holder, `plan(sp("…"))` as now) or `channel(Gloss, H)` (holder on a channel; no holder, `H` = the turn speaker `sp("…")`). Marker only, never a clash. `H` from `holder()` (R4a-4, R4a-5 for a topic or listener holder). Marks the zone frame, the holder frame and its host used. The `want` host after `uom` (`uom theyomazozon thalom`) stays out: row 14 lists no `want(..)` zone.
- **Classification:** `hookJob:zone` (frame:contrary): no new row; its text already names the holder word after `uom` (`contrary-to.md#contrary-to-holder`).
- **Anchor:** `contrary-to.md#contrary-to-holder`: "A plan or a channel after `uom` is yours, unless a holder word names someone else's" and "A holder on a channel after `uom` names whose view the event goes against. The holder covers only that pair: the event is still your claim."
- **Fixtures:** k17, k18, k19 each, `? zazozon vowurol.` → yes (now: unknown, each left `hookJob:zone`).

#### R4a-7: `zaya` is the turn's speaker plus addressees
- **Kind:** copy
- **Covers:** Turn, `zaya`; `zayan` in a role (now the constant `aya`, so any two turns' `zayan` meet) and the interlocutor holder (`thevumayan`, `theyomayan`; now the constant `interlocutors`).
- **Concludes:** a term `we(S, A1, …, Ak)`: `S` the turn speaker `sp("…")`, then the turn's addressees from `LogEntry.addressees` (R4a-8's terms, sorted by text, so Bea → Cal and Cal → Bea are one term). A turn with no addressees writes `we(N)`, N the turn's place, fitting no other turn's, as `listener(N)` does. The holder `-ayan` writes `view(we(..), T)` with the same term, replacing `interlocutors`. A question's `zayan` is the constant `we`, fitting no logged turn's (as `speaker`). Whether `zayan vowurol.` also gives each member's act is Open decision 2; this row writes the term only. New reserved name `we`; `Translation.site` gives the turn's `we` term to `match()`.
- **Classification:** none (a term: `zayan` reads as a named `thing` on the handshake root; R4a-7 changes only how it is written).
- **Anchor:** `pronouns.md#special-pronouns`: "Inclusive *we* (you and I) uses **`aya`**: the speaker and the people being addressed, together (**interlocutors**)."
- **Fixtures:** k21 + k22 clash (now: clash, atom `owuro(z(aya))`); k23 + k24 + k25 + k26 no clash (now: clash, wrong); k27 + k28 no clash, Bea's first turn has no addressee (now: clash).

#### R4a-8: `zawan` is the turn's addressee
- **Kind:** decision D16
- **Covers:** Turn, `zawan` [`LogEntry.addressees`]; `listener(N)` terms in roles, as a holder (R4a-5), and in a say word's `to(..)`; the `edge:vocative` readings of a call sentence (51 in the sweep).
- **Concludes:** `awan` is written from the turn's `LogEntry.addressees` (never from call frames on the reading): with exactly one addressee, that addressee's term, a call's `party` written as any term in a role (`yazozon` → `azozon`; `-r` through its antecedent) or another speaker `sp("Cal")`. With none, or with several (Open decision 1), `listener(N)` as now. A reading whose only frame is a call gives no rule; its call frame is marked used, since the call is read through `addressees`, so it leaves `left`.
- **Classification:** `edge:vocative` (frame:call): its row already names `LogEntry.addressees` and D16; add "a reading with only a call gives no claim".
- **Anchor:** decided reading; `speech-moves.md#vocative` and `collectives.md#addressing-several-people` state the call and carry-forward. **Page sentence** for `speech-moves.md#vocative`: "After a call, `zawan` is the one you called until you call someone else. In a turn with no call, it is whoever you last called; if you have called no one and only two people are talking, it is the other one."
- **Fixtures:** k29, `? zazozon vowurol.` → yes (now: unknown, call left `edge:vocative`); k30 + k31, same question → yes (now: unknown); k32 + k33 + k34 clash (now: no clash); k23 + k24 + k35 + k36 no clash (now: no clash, stays).

#### R4a-9: hinge over a say word
- **Kind:** copy
- **Covers:** Say words, hinge over say; `frameCombination` from `frames.say && frames.hinge` when the hinge comes after the say word.
- **Concludes:** rows 5 to 7 with the outcome `o(Id)` = the wrapped say term: `holds(say(W, P, R, A, E, T)) :- fits(c(Id), C), holds(C), on(Id).` and back `holds(neg(Cond)) :- fits(S, o(Id)), holds(neg(S)), on(Id).`, which a ban's `neg(say(.., a, ..))` (row 8) feeds. A requirement outcome then gives permission through row 7. Marks the hinge, its `standIn` link and the condition reading used.
- **Classification:** pair row `say` × `hinge` (fixed by a rule, text order): no new row.
- **Anchor:** `clause.md#which-covers-which` via the pair row: "if Alazun talks, it is allowed that Azozon walks" (`zazozon vowurol hwuvam thohem blarl. zalazun vezuyol.`).
- **Fixtures:** k37 + k38, `? zazozon vowurol hwuval.` → yes (now: unknown, k37 left `frameCombination`); k37 + k39, `? zalazun vezuyol vul.` → yes (now: no, the condition sentence stands alone while k37 is left).

#### R4a-10: binder over a say word
- **Kind:** copy
- **Covers:** Say words, binder over say; `frameCombination` from `frames.say && frames.universal` when the fence comes first.
- **Concludes:** row 8 with the head wrapped: `holds(say(W, P, R, A, E, T[X])) :- holds(isa(X, K)), on(Id).` for every answer (each member is allowed, forbidden, required); `zul` *no K* gives `say(.., neg(T[X]))`; open `zuam` row 10's choice on the wrapped head. Row 8 of say words (bans) then denies each member's permission. A part `z` / `d` / `b` say word whose role is the fence takes `X` as `Who`.
- **Classification:** pair row `say` × `binder` (fixed by a rule, text order): no new row.
- **Anchor:** pair row reading: "for every dog: it is allowed that the dog walks" (`zual godozel vowurol hwuvam.`).
- **Fixtures:** k40 + k13, `? zazozon vowurol hwuval.` → yes (now: unknown, k40 left `frameCombination`); k41 + k13, same → no, by the ban (now: unknown).

#### R4a-11: say word over a universal or an *and* list
- **Kind:** decision D1
- **Covers:** Say words, say word over an *and* list (`unused joinSeries:a`: `zazozon vezuyol bahelan balazun bal hwubar.`) and over a universal (`frameCombination`, the say word first).
- **Concludes:** the whole stays one wrapped term, the list as `ls(Id, P)` and the universal as `T[every(K)]`: `holds(say(W, P, R, A, E, T)) :- on(Id).` For answers `a` and `o` only, one per member: `holds(say(W, P, R, A, E, T[X])) :- member(ls(Id, P), X, G), on(Id).` or `:- holds(isa(X, K)), on(Id).`; when the list or fence fills the say word's own part (`z` / `d` / `b`), `Who` is `X` too. Answers `u` and `e`: the whole term only. Marks the list's member list (`claimMemberLists`) and the binder used.
- **Classification:** pair row `say` × `binder`, and `joinSeries:a` with step `claimMemberLists`: no new row.
- **Anchor:** decided reading. **Page sentence** for `permission-consent.md#say-reach` (or a short paragraph after the answer table in `#permission`): "Over a list or *every*, *allow* and *require* reach each one: `zazozon zalazun zal vowurol hwuval.` lets each walk. A ban does not: `hwuvul` there forbids them walking together, not each one walking."
- **Fixtures:** k42 + k13 → yes (now: unknown, k42 left `frameCombination`); k43 + k13 → follows no, couldBe yes (now: unknown, unknown); k44 → yes (now: unknown, left `unused joinSeries:a`); k45 → follows no, couldBe yes (now: unknown, unknown); k46, `? zazozon vezuyol bahelan hwubar.` → yes (now: unknown). Question for k42–k45: `? zazozon vowurol hwuval.`

#### R4a-12: say word over a hinge, *because*, MAY or a contrary zone
- **Kind:** decision D1
- **Covers:** Say words with the say word first over `overlay:clause_hinge:th`, the *because* hinge, `overlay:may:th`, `hookJob:zone` (`frameCombination` now).
- **Concludes:** data only, `holds(say(W, P, R, A, E, D)) :- on(Id).` with `D` the wrapped content as one term: `if(C, O)`, `onlyif(C, O)`, `iff(C, O)`, `because(C, O)`, `may(T)`, `against(T, Z)`. No `holds` of any part, no MAY choice, no hinge rule; only a question asked as said fits it. Marks the say word, the hinge or MAY or zone frame, its `standIn` / `grounds` link and the condition reading used. New reserved names `if`, `onlyif`, `iff` (`because` and `against` exist).
- **Classification:** pair rows `say` × `hinge`, `say` × `stance`, `say` × `contrary` (text order): no new row.
- **Anchor:** decided reading. **Page sentence** for `permission-consent.md#say-words`: "A say word over an *if*, a *because*, a *maybe* or a *contrary to* allows or forbids that whole thought; it says nothing about either half on its own."
- **Fixtures:** k47 + k38, `? zazozon vowurol hwuval.` → no (now: unknown, k47 left); compare k37. k48, k49 → no (now: unknown, left). k50 → no, and `? zalazun vezuyol.` → no (now: unknown; yes, since the condition sentence stands alone while k50 is left).

#### R4a-13: holder over a say word
- **Kind:** copy (not on the Triage lines; the same `say && holder` guard blocks it)
- **Covers:** `frameCombination` from `frames.say && frames.holder` in `wrap()`.
- **Concludes:** both wraps nest, `holds(view(H, say(W, P, R, A, E, T))) :- on(Id).`; say rows 6 to 8 run wrapped (`clash(view(H, say(.., u, ..)))`, `requires`, `bans` inside the view), as Holders row 1 wraps the generic rules. Never meets your own say words. Marks the say word and the holder used.
- **Classification:** pair row `say` × `holder` (fixed by a rule: holder over it): no new row.
- **Anchor:** pair row: "Holder over it: 'The holder covers its clause and any dependent sentence inside it'" (`holder.md#what-the-holder-covers`).
- **Fixtures:** k51 + k52 clash in Alazun's view (now: no clash, both left `frameCombination`); k39 + k51 no clash (now: no clash, k51 left).

#### R4a findings

- **Brief quoted D15, not D16.** The brief's *Decisions you draft* quotes D15 (*no person after `gahum`*) while this unit's item names D16; D16 was read from its line in the proposal. D15 is drafted nowhere here: it belongs to the *Because* area.
- **Topic holder needs the linker row.** `xazozon theyomalen …` also leaves `unit:linker` unused; k14 leaves `left` only once the links unit gives `unit:linker` a row.
- **`awanx` does not match `addressees`.** `collectives.md#addressing-several-people`: `awanx` "names everyone this turn addresses … everyone the turn's calls named, plus anyone you were already addressing"; `LogEntry.addressees` with `by: "call"` holds only the turn's own calls. A row for `awanx` (none drafted: outside these Triage lines) would need the union, or a second field. Probe `Bea: yazozon. yalazun. zawanx vehohel.` → `? zazozon vehohel.` unknown now.
- **Other holder hosts stay out.** Most `holder` readings in `left.tsv` are blocked by PLAN, WANT, decision, sake, mirative, NOTIONAL, a second channel or `edge:force` (`holders-2` … `holders-70`), not by the holder; they belong to those areas' rows.
- **PLAN with a holder has no row** (`zazozon vowurol theyomalazun thagom.` left `overlay:plan:th`), so no fixture pairs a plan zone with the holder's own plan.
- **Carry-forward in fixtures.** A bare sentence after a holder sentence is the holder's view (`carry:holder`), so every "your claim" entry is placed before the holder entry (k9, k10, k13, k39).

### R4b: because, contrary-to, MAY, hinges on universals

Fixtures: `src/interpret/fixtures/draft-because.txt` (`bc1`–`bc40`), `src/interpret/fixtures/draft-maybe.txt` (`my1`–`my18`). Probe file: scratchpad `r4b-probe.txt` (labels match the fixture ids). "Now" verdicts are from one probe run on 2026-11-19 at commit 0184a2d8. Row numbers below are solver.md's translation table (1–17) and its *Holders*, *Because* and *MAY* lists (Holders 1–9, Because 10–14, MAY 15–21).

#### R4b-1: a noun condition on a hinge
- **Kind:** copy
- **Covers:** *Because* noun condition; `noRow overlay:clause_hinge:g` and `:th` with a `bl-` noun (probe `because-8`, `because-9`, `because-11`; `zerulal gahum blugalal.`, `zerulal gohem blugalal.`).
- **Concludes:** rows 5–7 and 10 with the `bl-` noun as its kind K (row 10: "A first-mention noun in the condition reads as its kind"); on `/ɡ/` the outcome noun is its kind too, so `gahum`: `holds(rain)`, `holds(cloud)`, `holds(cause(cloud, rain))`. Marks the hinge, its hosted term and the noun's `slot:newMember` used. Confirm the bare kind term K as *there is K* for a `/ɡ/` outcome.
- **Classification:** `overlay:clause_hinge:th` / `:g` (frame:hinge): no new row.
- **Anchor:** `causation.md#if`: "A common noun with a `/ɡ/` word after it says the thing exists …, so a noun outcome says *there is X if there is Y*."; `because-and-iff.md#choosing-a-hinge`: "A noun after a because hinge names an act or a thing, not a person."
- **Fixtures:** bc1 kept (now: left); bc2 kept (now: left); bc3 `? zahelan vayebel.` → unknown (now: unknown, left); bc4 `? zazozon vowurol.` → yes (now: unknown, left).

#### R4b-2: *because* inside a holder's view
- **Kind:** copy (Holders row 4 names "the *because* and *or* rows" inside the view)
- **Covers:** `frameCombination` with `holder:xFamily:holder stance:overlay:evidential:th hinge:overlay:clause_hinge:th` (3 sweep readings; `theyom thahum blarl`).
- **Concludes:** row 10 wrapped: `holds(view(H, Out))`, `holds(view(H, Cond))`, `holds(view(H, cause(Cond, Out)))`; never `holds(T)`. Marks the hinge and the holder used (lifts `wrapped && frames.because`).
- **Classification:** `hinge` × `holder` pair row: no new row.
- **Anchor:** `holder.md#what-the-holder-covers`: "The holder covers its clause and any dependent sentence inside it".
- **Fixtures:** bc5 + bc6 clash in Azozon's view (now: no clash, bc5 left `frameCombination`); bc5 `? zalazun vudurul.` → unknown (now: unknown).

#### R4b-3: the `/ɡ/` stack, *only because* on a noun
- **Kind:** copy
- **Covers:** `gebem gahum` (`noRow overlay:clause_hinge:g`, 5 sweep readings with no frame list).
- **Concludes:** row 13 (row 10 plus row 6 on one condition) on the kinds, reading the shared `hosted` term from `stackedHinge()`; no grounds link (`/ɡ/` takes no `blarl`). Marks both hinge frames used.
- **Classification:** `overlay:clause_hinge:g` twice, `hinge` scope statement *two hinges*: no new row.
- **Anchor:** `because-and-iff.md#choosing-a-hinge`: "*Only because* stacks two hinges: `thebem` (the outcome needs it), then `thahum` with the condition (and it is a fact)."
- **Fixtures:** bc7 kept, row 13 atoms (now: left `noRow overlay:clause_hinge:g`).

#### R4b-4: a *because* condition with its own frame
- **Kind:** decision D2
- **Covers:** `noRow overlay:clause_hinge:th` where the `blarl` sentence has MAY, a holder or a say word.
- **Concludes:** the condition is the nested reading's own term `C'` = `may(T)` (with that reading's row 15 choice `{ holds(T) }`), `view(H, T)` or `say(.., T)`; `holds(C')`, `holds(Out)`, `holds(cause(C', Out))`. Marks the grounds link, the hinge and the nested frame used.
- **Classification:** `overlay:clause_hinge:th` (`because`) over a nested reading with `overlay:may:th`, `xFamily:holder` or `wordFamily:say`: no new row.
- **Anchor:** **Page sentence** for `because-and-iff.md#choosing-a-hinge`: "A stance or holder inside the sentence after `blarl` stays in it: *because Alazun may be asleep* gives the guess, not the sleeping, as the reason."
- **Fixtures:** bc8 `? zazozon vowurol.` → yes, `? zalazun vezuvel.` → unknown, `?~` → yes (now: unknown all, left); bc9 `? zalazun vezuvel.` → unknown (now: unknown, left); bc10 `? zazozon vowurol.` → yes (now: unknown, left).

#### R4b-5: MAY right before *because* hedges the link
- **Kind:** decision D3
- **Covers:** `frameCombination` with `stance:overlay:may:th hinge:overlay:clause_hinge:th`, MAY over `because` (`thomam thahul blarl`, probe `because-12`).
- **Concludes:** `holds(Out)`, `holds(Cond)`; a gate `{ maybe(Id) }`, with `holds(cause(C, O)) :- maybe(Id), on(Id).` and the `fault` / `share` marker under the same gate; `holds(may(cause(C, O))) :- on(Id).` Marks MAY and the hinge used.
- **Classification:** `hinge` × `stance` pair row (MAY right before a `/th/` word covers it): no new row.
- **Anchor:** `fault.md#fault`: "You can hedge it with MAY right before the hinge (`thomam thahul blarl …`)."
- **Fixtures:** bc11 + bc12 clash on the walking (now: no clash, left); bc13 `? zazozon vowurol.` → yes, `? zalazun vezuyol.` → yes (now: unknown, left).

#### R4b-6: *because* over MAY
- **Kind:** decision D11
- **Covers:** hinge + `blarth` first, then MAY (`thahum blarth thomam …`).
- **Concludes:** `holds(Cond)` (the earlier sentence, through `standInBack`), `{ holds(Out) } :- on(Id).`, `holds(may(Out))`, `holds(cause(Cond, may(Out)))`. Marks the stand-in link, the hinge and MAY used.
- **Classification:** `hinge` × `stance` pair row (hinge + `blarth` put first): no new row.
- **Anchor:** **Page sentence** for `because-and-iff.md#choosing-a-hinge`: "Put the hinge first with `blarth` and MAY after it (`thahum blarth thomam …`) for a fact that makes the outcome possible." (Speaker grounds for a guess, `say-reasons.md#epistemic-because`, stay off the stage page: stage pages never link the recipe track.)
- **Fixtures:** bc14 `? zazozon vowurol.` → unknown, `?~` → yes (now: unknown, t:0.1 left `frameCombination`).

#### R4b-7: *because* under *always*, *often*, and with *or*
- **Kind:** decision D12
- **Covers:** `frameCombination` with `occasion:lexReading:restrictor` + a because hinge (`zalazun genemum huam thahul blarl …`, probe `because-56`); because with an `e` / `ae` list.
- **Concludes:** `hual`: row 10's three atoms, each with the marker `always(..)` (Out, Cond, `cause(C, O)`); `hal` on the same claim clashes through the generic rule. `huam`: a gate `{ maybe(Id) }` over all three (with `switch(defaults)` the gate holds). *Or* (row 20 on the list side): per item k, `holds(cause(C[k], O)) :- holds(C[k]), on(Id).` (or `O[k]` on the outcome side). Marks the restrictor, the hinge and the list used.
- **Classification:** `hinge` × `occasion` pair row ("the hinge holds for each occasion"): no new row.
- **Anchor:** `usually-vs-must.md#how-things-work`: "It holds for *each* member or occasion, the same way the verb does."
- **Fixtures:** bc15 + bc16 clash (now: no clash, left); bc17 `?` → unknown, `?~` → yes (now: unknown, left); bc18 `? zazozon vowurol.` → yes (now: unknown, left); bc19 kept (now: left).

#### R4b-8: a named outcome under a `/ɡ/` *because*
- **Kind:** decision D15 (solver half)
- **Covers:** `gahum` / `gebem gahum` after a name (`zazozon gebem gahum blalazun.` in `say-people-places.md`, which D15's doc half fixes).
- **Concludes:** `holds(Cond)` (the condition's kind) and `holds(cause(Cond, Name))` as data, no `holds(Name)` and no back rule (row 6's back half is off). Marks the hinge(s) used.
- **Classification:** `overlay:clause_hinge:g` on a `named` term: no new row.
- **Anchor:** `because-and-iff.md#choosing-a-hinge`: "A name after the hinge is a named event or place (a storm, a city), never the person."
- **Fixtures:** bc20, bc21 kept; a later denial of the rain clashes (now: left `noRow overlay:clause_hinge:g`).

#### R4b-9: contrary to, with MAY elsewhere in the clause
- **Kind:** copy
- **Covers:** `frameCombination` with `contrary:hookJob:zone … stance:overlay:may:th` (probe `because-34`).
- **Concludes:** row 15 on T (`{ holds(T) }`, `holds(may(T))`) and `holds(against(T, Z)) :- holds(T), on(Id).`; a say-word zone's wrapped say word stays claimed. Marks MAY and the zone used.
- **Classification:** `stance` × `contrary` pair row (commutes): no new row.
- **Anchor:** `contrary-to.md#contrary-to-stance`: "A stance anywhere else in the clause still applies to the claim" (`zazozon vowurol uom thagom thomam.`, "Azozon may be walking, contrary to my plan.").
- **Fixtures:** bc22 `?` → unknown, `?~` → yes (now: unknown, left).

#### R4b-10: contrary to a holder's plan or view
- **Kind:** copy (blocked by a reader gap, see Findings)
- **Covers:** `noRow hookJob:zone` with `holder:xFamily:holder` after `uom` (probe `because-38`, `because-40`; 8 sweep readings).
- **Concludes:** row 14 with `Z` = `plan(H)` or `channel(Gloss, H)`, H from Holders row 3; `holds(T)` stays your claim. Marks the zone, the holder and its channel used.
- **Classification:** `holder` × `contrary` pair row ("A holder after `uom` is the contrary's own content"): no new row.
- **Anchor:** `contrary-to.md#contrary-to-holder`: "The holder covers only that pair: the event is still your claim."
- **Fixtures:** bc23, bc24 `? zazozon vowurol.` → yes (now: unknown, left `noRow hookJob:zone`).

#### R4b-11: the channel zone
- **Kind:** copy (row 14 already names `channel(Gloss, H)`)
- **Covers:** `noRow hookJob:zone` with `stance:overlay:evidential:th` (probe `because-35`, `because-36`, `because-39`, `because-42`).
- **Concludes:** `holds(T)` and `holds(against(T, channel(Gloss, sp("…"))))` (no holder: the turn speaker's); marker only, never a clash. Marks the zone and the channel frame used.
- **Classification:** `hookJob:zone` (frame:contrary): no new row.
- **Anchor:** `contrary-to.md#channel-zone`: "The pair names what the event goes against; the channel then says nothing about how you know the claim."
- **Fixtures:** bc25 `? zazozon vowurol.` → yes (now: unknown, left).

#### R4b-12: contrary to on a universal (binder first)
- **Kind:** copy
- **Covers:** `frameCombination` with `contrary:hookJob:zone` + `binder:joinSeries:ua`.
- **Concludes:** row 8 and, per member, `holds(against(T[X], Z)) :- holds(isa(X, K)), on(Id).` Marks the zone and the binder used.
- **Classification:** `binder` × `contrary` pair row: no new row.
- **Anchor:** `usually-vs-must.md#how-things-work`: "It holds for *each* member or occasion, the same way the verb does." with `clause.md#which-covers-which` (text order).
- **Fixtures:** bc26 + bc28 `? zazozon vowurol.` → yes (now: unknown, left).

#### R4b-13: `uom` before a fence
- **Kind:** decision D4
- **Covers:** `uom thagom zual godozel vowurol.` (the `binder` × `contrary` pair row's first sample).
- **Concludes:** the same per-member rule as R4b-12, `against(T[X], Z)`. Marks the zone and the binder used.
- **Classification:** `binder` × `contrary` pair row: no new row.
- **Anchor:** **Page sentence** for `contrary-to.md#contrary-to-stance`: "Before a fence (`uom thagom zual godozel vowurol.`), `uom` and its stance go with each member, as after it."
- **Fixtures:** bc27 + bc28 `? zazozon vowurol.` → yes (now: unknown, left).

#### R4b-14: contrary to with a bare restrictor
- **Kind:** copy
- **Covers:** `frameCombination` with `contrary:hookJob:zone` + `occasion:lexReading:restrictor`.
- **Concludes:** row 15 (`hual`: `holds(T)` and `always(T)`; `hal`: `holds(neg(T))` and `never(T)`, with no `against`, since no event happens) plus `holds(against(T, Z))` and the marker `always(against(T, Z))` for `hual`. Marks the zone and the restrictor used.
- **Classification:** `contrary` × `occasion` pair row: no new row.
- **Anchor:** `restrictors.md#always-hual` with `clause.md#which-covers-which` (text order; `hual zazozon vowurol uom thagom.` is the pair row's second sample).
- **Fixtures:** bc29 + bc16 clash (now: no clash, left).

#### R4b-15: contrary to with a hinge
- **Kind:** decision D14
- **Covers:** `frameCombination` with `contrary:hookJob:zone` + `hinge:overlay:clause_hinge:th`, both orders.
- **Concludes:** hinge over zone (hinge + `blarth` first): rows 5–7 with the outcome rule also giving `holds(against(Out, Z)) :- fits(c(Id), P), holds(P), on(Id).` Zone over hinge (`uom` first): rows 5–7 plus a fact outside `holds`, `zone(Id, Z)`, read only as said (the encoding has no term for a conditional). Marks the zone and the hinge used.
- **Classification:** `hinge` × `contrary` pair row; its second sample changes to `zalazun vezuyol. thohem blarth zazozon vowurol uom thagom.` (if Alazun talks, Azozon walks contrary to plan), so the two samples follow its text-order rule. `contrary-to.md` teaches no hinge with `uom`, so nothing there conflicts.
- **Anchor:** `stand-in-vowels.md#stand-in-back` (the hinge over a word is a hinge + `blarth` put first), quoted in the pair row.
- **Fixtures:** bc30 `? zazozon vowurol.` → unknown (now: unknown, left); bc31 kept, data only (now: left).

#### R4b-16: a universal hinge whose condition names the member
- **Kind:** copy; changes the edge line "A hinge on a universal gets only the forward rule; its condition must not mention `X`"
- **Covers:** `unused anaphor:content` (probe `because-4`, `because-44`; `-r` resume of the kind in the `blarl` sentence); `zwal` / `zwar` tags (probe `because-45`) once tags resolve.
- **Concludes:** per member, with `c(Id, X)` / `o(Id, X)` slots whose `fits` facts are computed for each member X the log gives `isa(X, K)` for: `holds(T[X]) :- holds(isa(X, K)), fits(c(Id, X), P), holds(P), on(Id).` and back, `holds(neg(C[X])) :- holds(isa(X, K)), fits(P, o(Id, X)), holds(neg(P)), on(Id).` Marks the `anaphor:content` link used. New edge line: "A universal hinge's condition may name the member through a resume pronoun; the slots are built per stated member, so a member known only through `widen` gets no rule."
- **Classification:** `binder` × `hinge` pair row: no new row.
- **Anchor:** `usually-vs-must.md#how-things-work`: "Inside the sentence after `blarl`, resume the kind with `-r` (`zogozer`) to mean *that same one*: each cat, in turn."
- **Fixtures:** bc32 + bc33 + bc34 `? zazozon vezuvel.` → yes; bc32 + bc33 + bc35 `? zazozon guzemel.` → no (now: unknown both, left `unused anaphor:content`); bc36 the same once `zwar` resolves (now: left `noRow overlay:clause_hinge:th`).

#### R4b-17: a definition both ways
- **Kind:** copy
- **Covers:** `thehom` on a closed fence (`zual geyel gwozeduyol thehom blarl zeyer veduyol.`, probe `because-4`).
- **Concludes:** R4b-16 with row 7 (both rules each way, per member): `holds(O[X]) :- isa, fits(c(Id, X), P), holds(P)` and `holds(C[X]) :- isa, fits(o(Id, X), P), holds(P)`, and the two denial rules. Marks the link and the hinge used.
- **Classification:** `binder` × `hinge` pair row: no new row.
- **Anchor:** `usually-vs-must.md#how-things-work`: "A **definition** works both ways: whatever has the property is that kind, and every member of the kind has it."
- **Fixtures:** bc37 + bc38 + bc39 `? zazozon gwozeduyol.` → yes; bc37 + bc38 + bc40 `? zazozon veduyol.` → yes (now: unknown both, left).

#### R4b-18: MAY over members
- **Kind:** copy (row 17's gate on row 11)
- **Covers:** `frameCombination` from `(ctx.choice || mayOver) && claimMemberLists(..)`.
- **Concludes:** `{ maybe(Id) }`; the list claim and each `holds(T[X]) :- member(ls(Id, z), X, G), maybe(Id), on(Id).`; `holds(may(T))` on the list term. Marks MAY and the member list used.
- **Classification:** `stance` over `joinSeries:a`: no new row.
- **Anchor:** `knowing.md#may`: "The sentence now says the leaving is possible, not that it happens".
- **Fixtures:** my1 `?` → unknown, `?~` → yes (now: unknown both, left).

#### R4b-19: MAY over a whole-list denial
- **Kind:** copy
- **Covers:** as R4b-18, with `joinSeries:u` over a closed list.
- **Concludes:** row 4 (and row 21's `notone`) with `maybe(Id)` in each body, under the gate. Marks MAY and the denial list used.
- **Classification:** `stance` × `polarity`: no new row.
- **Anchor:** `knowing.md#may` (as R4b-18).
- **Fixtures:** my2 + my3 no clash in the world without the guess (now: no clash, my2 left).

#### R4b-20: MAY over a say word
- **Kind:** copy
- **Covers:** `frames.may && frames.say` (`thomam zazozon vowurol hwuvam.`, the `say` × `stance` pair row's second sample).
- **Concludes:** row 15 on the wrapped term: `{ holds(say(..T)) }`, `holds(may(say(..T)))`; Holders rows 6–9 run inside the gate. Text order decides: `hwuvam … thomam` stays Holders row 5 with MAY inside (`say(.., may(T))`). Marks MAY and the say word used.
- **Classification:** `say` × `stance` pair row: no new row.
- **Anchor:** `knowing.md#may` with `clause.md#which-covers-which`.
- **Fixtures:** my4 `?` → unknown, `?~` → yes (now: unknown both, left).

#### R4b-21: MAY and a universal, both orders
- **Kind:** copy
- **Covers:** `frames.may && frames.universal`.
- **Concludes:** MAY first: one gate `{ maybe(Id) }` over row 8 for the whole generalization (`holds(T[X]) :- holds(isa(X, K)), maybe(Id), on(Id).`). Binder first: per member `{ holds(T[X]) } :- holds(isa(X, K)), on(Id).` and `holds(may(T[X])) :- holds(isa(X, K)), on(Id).` Marks MAY and the binder used.
- **Classification:** `binder` × `stance` pair row ("Text order for every member"): no new row.
- **Anchor:** `usually-vs-must.md#how-things-work`: "*Maybe every cat sleeps* is [MAY](/knowing#may) on the same clause."
- **Fixtures:** my5 + my7 and my6 + my7, `?` → unknown, `?~` → yes (now: unknown, left).

#### R4b-22: MAY over *always*
- **Kind:** copy
- **Covers:** `frames.may && frames.restrictor`, MAY first.
- **Concludes:** the gate over row 15: `holds(T) :- maybe(Id), on(Id).` and `always(T) :- maybe(Id), on(Id).`; `hal` the same with `neg` and `never`. Marks MAY and the restrictor used.
- **Classification:** `stance` × `occasion` pair row (text order): no new row.
- **Anchor:** `knowing.md#may` with `clause.md#which-covers-which`.
- **Fixtures:** my8 + my10 no clash in the world without the guess (now: no clash, left).

#### R4b-23: *always* over MAY
- **Kind:** decision D13
- **Covers:** `frames.may && frames.restrictor`, restrictor first (`hual zazozon vowurol thomam.`).
- **Concludes:** `holds(may(T))`, the marker `always(may(T))`, and a new clash rule `clash(always(may(T))) :- always(may(T)), never(T).` (with its `fits` form). No clash with `holds(neg(T))`. Marks MAY and the restrictor used.
- **Classification:** `stance` × `occasion` pair row: no new row.
- **Anchor:** **Page sentence** for `restrictors.md#always-hual`: "`hual` before MAY (`hual zazozon vowurol thomam.`) says walking is possible on every occasion; it clashes with *never*, not with one *not*."
- **Fixtures:** my9 + my10 clash (now: no clash, left); my9 + my11 no clash, `?~ zazozon vowurol.` → no (now: no clash, no).

#### R4b-24: `vaem vul`
- **Kind:** copy (row 21 as `vael vul`)
- **Covers:** `noRow joinSeries:u` on a closed `aem` list.
- **Concludes:** each item denied, `holds(neg(T[k])) :- on(Id).` Marks the denial and the list used.
- **Classification:** `joinSeries:u` over a closed `ae` list: no new row.
- **Anchor:** `set-joins.md#exclusivity-and-denying-a-whole-list`: "On `ae`, even `-m` still needs at least one of the listed items." and "this is single-item *not X* with the whole list as X". Denying *at least one* is *none*, as for `vael vul`.
- **Fixtures:** my12 + my13 clash; my12 `? zazozon veruvol.` → no (now: no clash, unknown, left).

#### R4b-25: only-if and iff with MAY on the condition
- **Kind:** decision D5
- **Covers:** `noRow overlay:clause_hinge:th` for `thebem` / `thehom` with a MAY `blarl` sentence.
- **Concludes:** row 18 (`may(T)` in the body, `holds(may(T)) :- holds(T), on(Id).` inside the hinge) with rows 6 and 7; the back rule gives `holds(may(T))`. Marks the link, the hinge and MAY used.
- **Classification:** `overlay:clause_hinge:th` over a nested `overlay:may:th`: no new row.
- **Anchor:** `causation.md#if`: "MAY inside the condition makes the condition a chance" (row 18), extended by D5.
- **Fixtures:** my14 + my13 and my15 + my13, `? zalazun vezuvel.` → unknown, `?~` → yes (now: unknown, left).

#### R4b-26: only-if and iff over MAY
- **Kind:** decision D5
- **Covers:** hinge + `blarth` first, then MAY, for `thebem` / `thehom`.
- **Concludes:** no backward rule; the forward rules only, as row 17 for *if*: `thehom`'s *if* half as the choice `{ holds(Out) } :- fits(c(Id), P), holds(P), on(Id).`; the *only if* half, see Open decisions 1. Marks the stand-in link, the hinge and MAY used.
- **Classification:** `hinge` × `stance` pair row: no new row.
- **Anchor:** solver.md row 17 (`causation.md#if`), extended by D5.
- **Fixtures:** my16 `?` → unknown, `?~` → yes (now: unknown, t:0.1 left).

#### R4b-27: a carried holder on a MAY sentence
- **Kind:** decision D6
- **Covers:** `frameCombination` from `frames.may && !frames.holder` under a carried wrap.
- **Concludes:** `holds(view(H, may(T))) :- on(Id).` (`Wrap.may`), as MAY row 16's own MAY. Marks MAY and the `carry:holder` link used.
- **Classification:** `carry:holder` link + `overlay:may:th`: no new row.
- **Anchor:** `holder.md#naming-a-holder` (holder table: MAY is the holder's).
- **Fixtures:** my17 `? zalazun vezuvel.` → unknown (now: unknown, t:0.1 left).

#### R4b-28: a MAY question
- **Kind:** decision D6
- **Covers:** `edge:force` + `stance:overlay:may:th` questions (probe `because-16`–`because-18`; `left q noRow overlay:may:th`).
- **Concludes:** the question without MAY, run as `couldBe` whichever job is called; the answer names the switch. Marks the question's MAY used.
- **Classification:** `overlay:may:th` in a question: no new row.
- **Anchor:** **Page sentence** for `knowing.md#may`: "A question with MAY (`yel zazozon vabuvul thomal dalazun.`) asks whether it could be so."
- **Fixtures:** my18, `? yel zazozon vabuvul thomal dalazun.` → yes (now: beyond).

#### R4b findings

- **Reader gap (R4b-10):** `uom thebamalazun` and `uom theyomalazun thagom` still leave `noRow hookJob:zone`; solver.md's edge says the holder frame after `uom` carries no party and no channel gloss (`readHook` in `read.ts`). R4b-10 needs that reader fix first.
- **Noun conditions now fail before row 10:** `zazozon vowurol thahum blerulal.` leaves `noRow overlay:clause_hinge:th` although row 10 states the kind reading; the translator seems to read only the `blarl` grounds link. R4b-1 covers it.
- **Outside my area, large in the sweep:** `overlay:cause:th` (CAUSE `thewom` before a hinge, 40 readings, including the page's own `zual gogozel vezuvel thewom thohem blarl zogozer guzemel.`), `overlay:clause_hinge:h` (19), `lexReading:sake` with MAY (22), `overlay:stimulus:g` (12+), nested hinges in `nested-dependents.md` (`thahum blarl … thahum blarl`), and `overlay:phasal:th` under MAY. The tag `zwal` / `zwar` (R4b-16's bc36) needs tag resolution, `slot:tag` unused.

### R4c drafts: lists, stance numbers, the fill job

Fixtures: `src/interpret/fixtures/draft-lists.txt` (l1–l10, n1–n4), `src/interpret/fixtures/draft-fill.txt` (f1–f10). Probe: scratchpad `r4c-probe.txt` / `r4c-probe.out`. Rank with two names already translates (`holds(more(dt("slot:adj","gamahum"), azozo, alazu))`), so it is not drafted; only its open edges are (Open decisions 1–3).

#### R4c-1: Superlative, one name before `zol`
- **Kind:** copy
- **Covers:** `unused shared:scale` with one item before the rank join (lists-10, lists-11, lists-15; `zahelan zol wrogel gelazem.` with a degree too)
- **Concludes:** `holds(most(S, A)) :- on(Id).`, S the shared scale as `more` already writes it (`dt(Key, Word)`), A the one item; data, answered only as said (as row 17). A `/w/` degree before the scale goes to `Translation.notes`. Marks the `shared:scale` link used.
- **Classification:** `shared:scale` (link): add "one item before `o`: the superlative, `most(S, A)`".
- **Anchor:** `comparatives.md#superlatives`: "One name before `zol`, then the same shared adjective, means that person ranks highest in the group you have in mind."
- **Fixtures:** l1: `? yel zahelan zol guzemel.` → yes (now: beyond, `unused shared:scale`)

#### R4c-2: `oe` tie
- **Kind:** decision D17
- **Covers:** `unused shared:equative` (31 readings; lists-12, lists-13, lists-14, lists-38)
- **Concludes:** for each ordered pair of members A ≠ B, `holds(tie(S, A, B, E)) :- on(Id).` (E `l` for `zoel`, `m` for `zoem`), so three or more are tied pairwise and the tie is symmetric. No `isa(X, K)` for any member. Closed only: generic `clash(tie(S, A, B, l)) :- holds(tie(S, A, B, l)), holds(more(S, A, B)).` (the reversed `more` meets the reversed tie fact). With a verb, row 11's `holds(T[X]) :- member(ls(Id, z), X, G), on(Id).` per member, and the tie on the `/h/` scale. Marks the `shared:equative` link and the `oe` list used.
- **Classification:** `joinSeries:oe` (structure) + `shared:equative` (link): add "a tie, `tie(S, A, B, E)` per ordered pair; closed `-l` clashes with rank `o` on the same scale; with a verb each member's act holds (D17)".
- **Anchor:** `comparatives.md#equatives`: "you say two people have the quality to the same degree instead of picking a winner"; "*both are challenging* is an *and*-list plus a shared adjective … It does not rank them or say they match." D17 for the clash, `zoem` and the verb. **Page sentence** for `comparatives.md#equatives`: "A tie does not say either one has the quality: `zazozon zalazun zoel gamahum` can be two people who are both hardly challenging. With a verb, each one does it: `zazozon zalazun zoel hahunom vowurol` is *Azozon walks as intensely as Alazun*, and both walk."
- **Fixtures:** l2: `? yel zalazun zazozon zoel gamahum.` → yes (now: beyond); `? yel zazozon gamahum.` → unknown (now: unknown). l2 + l3: clash `tie` / `more` (now: no clash, l2 left). l4 + l3: no clash (now: no clash, l4 left). l5: `? yel zazozon vowurol.` → yes (now: unknown). l6: `? yel zalazun zahelan zoel gamahum.` → yes (now: beyond)

#### R4c-3: `ue` denies each listed item
- **Kind:** decision D7
- **Covers:** `noRow joinSeries:ue` with a verb (lists-37)
- **Concludes:** row 2: `holds(neg(T[item])) :- on(Id).` per listed item; the outside item that holds adds no rule (as open `aem`). Marks the `joinSeries:ue` frame used. A verbless `ue` list stays left (Open decision 5).
- **Classification:** `joinSeries:ue` already reads "List reach, as `u`"; add "row 2 on each item; nothing for the outside item (D7)".
- **Anchor:** `set-joins.md#full-single-item-and-standalone-inventories`: "`…uel` (`zuel` / …) | closed invert-menu of one | *anything but X*"; D7.
- **Fixtures:** l7: `? yel zalazun dobodel vagedal.` → no (now: unknown, `noRow joinSeries:ue`)

#### R4c-4: Two denial lists in one clause
- **Kind:** decision D9
- **Covers:** the edge note "Two denial lists in one clause have no row" (`noRow joinSeries:u` on such a clause)
- **Concludes:** for each pair (a, b) of the two lists' items, `holds(neg(T[a][b])) :- on(Id).` (joint substitution). Marks both `joinSeries:u` frames used. Drops the edge note.
- **Classification:** `joinSeries:u` (frame:polarity): add "two `u` lists in one clause: every pairing denied, `neg(T[a][b])` (D9)".
- **Anchor:** **Page sentence** for `joins.md#negation-u`: "Two `u` lists in one clause deny every pairing: `zazozon zalazun zul dodozel dogozel dul vayebel.` is *Neither Azozon nor Alazun sees a dog or a cat.*"
- **Fixtures:** l8: `? yel zalazun dogozel vayebel.` → no (now: unknown, `noRow joinSeries:u`)

#### R4c-5: SHARED details after a join, beyond a plain `/ɡ/`
- **Kind:** copy
- **Covers:** the Triage item *SHARED hook after a join* (`unused hookJob:genitive`, the list's `sharedDetails` with role `distribute`); `unused shared:distribute` with a `/ɡ/` that hosts a `/b/` (`zodozel zogozel zam gegunum blazozon.`, `zalazun degodel dededel dal gegunum blahelan vagedal.`) and an `/h/` after a verb join (`zazozon vowurol veruvol val hahunom.`)
- **Concludes:** after a noun join, each first-mention member gets `detail(nm(Id, P), dt(Key, Words))` as row 14 gives a SHARED adjective, and the claim stays row 11's per member; after a verb join, the `/h/`, `/d/` or `/b/` goes into each verb's term (`holds(T[v])` per verb, each with the shared part). Marks the `sharedDetails` entry and the hook's `hookJob` frame used.
- **Classification:** `shared:distribute` (link) already states the hook; add "a hosted `/ɡ/` + `/b/` and a verb join's shared `/d/`, `/b/` or `/h/`: a detail of each member (row 14) / a part of each verb's term".
- **Anchor:** `list-structure.md#shared-after-the-join`: "A hook right after the join word is SHARED, like an adjective there: it belongs to every item."; "A `/ɡ/` word that hosts a `/b/` is SHARED the same way"; "verbs | a `/d/` object, a recipient `/b/`, or an `/h/` adverb: every verb takes it".
- **Fixtures:** l9: `? yel zogozel om bahelan vowurol.` → yes (now: unknown, `unused hookJob:genitive`)

#### R4c-6: Likeness among the members (`zal gewem`, no `bl-`)
- **Kind:** copy
- **Covers:** `unused shared:distribute` with `overlay:likeness:g` (lists-16, lists-17; `zazozon zalazun zal gewem blagayul guzemel.` has a `bl-` model and is the per-member detail of R4c-5)
- **Concludes:** for each ordered pair of members A ≠ B, the term `zazozon gewem blalazun.` now gives, with A as `z` and B as the hosted `bl-`: `holds(T[A][B]) :- on(Id).` Marks the link used.
- **Classification:** `shared:distribute` (link): add "a hosted relation with no `bl-` word: each member to each other member".
- **Anchor:** `relations.md` (beginner, the likeness section): "With no `bl-` word after a joined subject, the model is the other members: each one resembles the others. … Every hosted relation follows this rule."
- **Fixtures:** probe L13 only (`zazozon zalazun zal gewem.` `? yel zazozon gewem blalazun.` → yes; now: unknown, `unused shared:distribute`); not in the fixture file, since `gewem` is not this unit's row family

#### R4c-7: Collective SHARED adjective (`/ɡ/`…`-x`)
- **Kind:** copy
- **Covers:** `unused shared:collective` (lists-23, lists-27, lists-28)
- **Concludes:** `holds(isa(ls(Id, z), K)) :- on(Id).`, the list term as one unit, with no `member` facts and no `isa` per member (as row 11 already does for a collective `-x` verb). Marks the `shared:collective` link and the list used.
- **Classification:** `shared:collective` (link): add "the list as one, `isa(ls(..), K)`; no member facts".
- **Anchor:** `collectives.md#adjectives-g`: "Put `-x` on the adjective, after its ending, when the property holds of the noun's group as one unit."
- **Fixtures:** l10: `? yel zobonol garolem.` → unknown (now: yes from the question alone; Findings 1)

#### R4c-8: Channel stances on your own claim
- **Kind:** decision D8
- **Covers:** `noRow overlay:evidential:th` with the channel as the only frame (136 readings) or with a stance number (`stance:lexReading:number:th`, 4): lists-2, lists-7, lists-8, lists-9, lists-18, lists-25, lists-26, lists-30, lists-34; and the carried channel (`unused carry:channel`) on later bare sentences
- **Concludes:** row 1, `holds(T) :- on(Id).`, with the channel frame, its `bl-` source and any stance number (`th_N`, `th#N`, `th@+95`, `th-e-`) kept in `Translation.notes`, as row 16. A later bare sentence the channel carries to is row 1 too, its `carriedFrame` link marked used. Marks the `overlay:evidential:th` frame (and the number stance) used. Not row 19: these name sources, not likelihoods.
- **Classification:** `overlay:evidential:th` (frame:stance): add "on your own claim, row 1 with the frame in `notes` (D8)"; the `carriedFrame` link for a channel: "row 1 on the later sentence".
- **Anchor:** `evidentiality.md#evidentiality`: "the listener always knows what your claim rests on"; `evidentiality.md#carry-forward`: "Once you put a channel on a claim, your later claims with no channel keep it"; D8.
- **Fixtures:** n1, n2: `? yel zalazun vudurul.` → yes (now: unknown); n3: `? yel zazozon vezuvel.` → yes (now: unknown); n1 + n4: clash (now: no clash; n4 left `unused carry:channel` when it follows a channel)

#### R4c-9: The fill job
- **Kind:** decision D10
- **Covers:** `ask:fillAsk`, which `follows` and `couldBe` answer `beyond` with reason `fillAsk`
- **Concludes:** `fill(log, question, options): Promise<FillAnswer>`, `FillAnswer = {verdict: "filled" | "unknown" | "nobody" | "yes" | "no" | "beyond" | "refused", fillers: Filler[], switches, left, english?}`, `Filler = {at: BlankSite[], term: string[], because: ReadingId[]}` (one `term` per blank, in question order). The job solves the log (cautious: atoms in every clash-free world; `possible`: in some), then matches each `holds(P)` atom against the question with `match()`, each blank a variable; `because` walks `fired` / `used` from P as `explain` does. Universal-to-instance, hinge and membership fillers come from the solved atoms, so they reach what `ask` cannot. No filler: `unknown`, or `nobody` under `closedWorld`. The question's `blank` parts are marked used by `fill` only.
- **Classification:** `ask:fillAsk` (frame:force): add "the fill job binds each `blank` term; `follows` / `couldBe` answer `beyond`".
- **Anchor:** `questions.md#fill-ask`: "That `-r` is the blank …, and the reply names what fills it."; D10.
- **CLI:** `reading.mjs solve FILE '<question>'` dispatches a `fillAsk` question to `fill` (`--possible` brave, `--closed` closedWorld) and prints `verdict`, each filler as `term[, term] — why: [at] speaker: text`, `switches`, `left`; `probe` does the same for `?` / `?~`. `--json` prints the `FillAnswer`.
- **Fixtures:** f10: `?~ yel zar vudurul.` → alazun (brave); `? yel zar vudurul.` → unknown (now: beyond, `fillAsk`)

#### R4c-10: Open blank, listed blank, `zarx`, fill-all
- **Kind:** copy (Design step 3) + D10 (several fillers all listed)
- **Covers:** the copyable fill shapes
- **Concludes:** `zar` (one blank): every binding, all listed. `…ar` after 2+ listed items: only bindings among the listed items. `zarx`: every binding. Fill-all (`zar dar …`): bindings as tuples, in the blanks' order.
- **Classification:** as R4c-9.
- **Anchor:** `questions.md#fill-all`: "the answer is expected to **fill all** of them, in the order the question gave them"; "To ask for several members of one role (*who all?*), put `-x` after the blank"; `fill-ask-roles.md#fill-ask-arity`: "| 2+ | *Which of these?* |".
- **Fixtures:** f1: `? yel zar vowurol.` → azozon; f1 + f2 → azozon, alazun; f1: `? yel zazozon zalazun zar vowurol.` → azozon; f6: `? yel zarx vowurol.` → azozon, alazun; f7 + f8: `? yel zar dar vayebel.` → (azozon, dog), (alazun, cat); f3 + f4: `? yel zar vezuvel.` → azozon; f5 + f1: `? yel zar vehohel.` → alazun; f1: `? yel zar vezuvel.` → unknown, `--closed` nobody (all now: beyond, `fillAsk`)

#### R4c-11: `…er`, existence
- **Kind:** decision D10
- **Covers:** `zer` / `der` / … with no items in a question
- **Concludes:** `yes` when any binding exists (with its `because`), else `unknown`, `no` under `closedWorld`; no fillers listed.
- **Classification:** as R4c-9.
- **Anchor:** `fill-ask-roles.md#fill-ask-arity`: "| 0 | … | *Anything?* |"; D10.
- **Fixtures:** f1: `? yel zer vowurol.` → yes (now: beyond, `fillAsk`)

#### R4c-12: `gar`, what kind, from `isa`
- **Kind:** decision D10
- **Covers:** `gar` in a question
- **Concludes:** fillers K from `holds(isa(X, K))` with X the question's noun; named details wait for detail-term rows.
- **Classification:** as R4c-9.
- **Anchor:** `fill-ask-jobs.md#what-kind`: "put the blank on an adjective: **`gar`**. Answer with the adjective alone."; D10.
- **Fixtures:** f4: `? yel gar zazozon.` → gogozel (now: beyond, `fillAsk`)

#### R4c-13: Why, from `cause` only
- **Kind:** decision D10
- **Covers:** `thahum blar` in a question
- **Concludes:** fillers C from `holds(cause(C, Out))` with Out fitting the question's claim; a met *if* gives none. When, where, whose and how answer `beyond` (reason `fillAsk`) until detail-term rows.
- **Classification:** as R4c-9.
- **Anchor:** `fill-ask-jobs.md#why`: "To ask *why?*, write a condition word …, then the blank `blar`."; D10.
- **Fixtures:** f9: `? yel thahum blar zazozon vowurol.` → zalazun vezuvel; f5 + f1: `? yel thahum blar zalazun vehohel.` → unknown (now: beyond, `fillAsk`)

#### R4c findings

1. **A question answers itself.** `yel zodozel gamahum.` and `yel zobonol garolem.` answer `yes` with an unrelated log (`zazozon vowurol.`; probe E1): the first-mention subject's witness facts seem to carry the asked predicate. Outside this unit; it masks R4c-7's verdict.
2. **Collective adjective gets member facts.** `zobonol zadorol zal garolemx.` translates with `member(ls(..), nm(..), 1..2)`; row 11 gives a collective `-x` verb none. R4c-7 needs the same for `-x` adjectives (`claimMemberLists` or the collective step).
3. **SHARED hook leftover key** is `unused hookJob:genitive`, not `shared:distribute`: R4c-5 must mark the hook's `hookJob` frame.
4. **Carried channel.** A bare sentence after a channel sentence is left `unused carry:channel`; R4c-8 covers it, which also gives own-claim clashes across sentences (n1 + n4 in the fixture order).
5. **Stance-number spellings.** No spelled `th_N`, `th@+95` or `th-e-` example was in this unit's sample; fixtures cover `thebam`, `thebal`, `thevum` and `th#N` (`throgel`, `throdol`). Phase 3 should add one of each from `number-roles.md` / `special-values.md`.
6. **Outside this area:** `theyomazozon thrawal` (lists-40, `noRow frameCombination`, holder + certainty); `el bual gamahal` (lists-39, `unused shared:kind`).

### R4d: links (drafted 2026-11-19)

Fixtures: `src/interpret/fixtures/draft-links.txt` (`lk1` to `lk41`). Probe file: scratchpad `r4d-probe.txt`. Rows are ordered by sweep count; kinds that share the rule "marks the link used, keeps the clause" are grouped.

#### R4d-1: `/x/` continue words: topic words, agenda numbers, sentence linkers
- **Kind:** copy
- **Covers:** `unit:linker` (82: about 58 topic words such as `xazozon`, `xazozor`, `xodozel`, `xuwen`, `x@<Sam>`, `x[odoze]`, agenda numbers `xrodol`, `x#-2`, `xrowul`; about 24 linkers `xahom`, `xezem`, `xezel`, `xahol`, `xugohul`, …), `body:topicMarker` `glegol` beside a span topic; `links-5`, `-6`, `-7`, `-17`, `-18`, `-23`, `-29`, `-35`, `-41` to `-48`, `-61` to `-65`
- **Concludes:** nothing new: the body takes its own rows (row 1 and the rest), and a reading that is only a topic word writes nothing and is not left. A linker adds `linker(Word, To)` to `Translation.notes`, so a reply can mention it. The accounting marks the `unit:linker` link (and `body:topicMarker`) used. The topic pronoun's binding stays `anaphor:topic` (B1); a carried frame stays the carry rows' (`evidentiality.md#carry-forward`: the linker neither ends nor starts it)
- **Classification:** `unit:linker` (link), unchanged class; note to add: "On any other `/x/` word, a topic word or agenda number (`topic.md#topic`): links nothing to the claim"
- **Anchor:** `sentence-linkers.md#sentence-linkers`: "A linker reaches back to one sentence: the one that ends at the period before it."; `evidentiality.md#deduction`: "A linker is not a channel, so the conclusion keeps your frame: a deduction from a report is still REPORTED."; `topic.md#topic`: "it may stand alone as a whole sentence to announce a topic before saying anything about it"
- **Fixtures:** `lk1` yes (now unknown); `lk2` yes / no (now unknown / no); `lk3` yes (now unknown); `lk4` yes, both readings kept (now unknown, both left); `lk5` yes once B1 lands (now unknown); `lk6` unknown, left only for `edge:force` (now unknown); `k14` in `draft-holders.txt` also clears `unit:linker`. *Therefore* adding a cause is O-1

#### R4d-2: a yes / no verdict takes the claim it answers
- **Kind:** copy
- **Covers:** `edge:polar` with `ao` / `uo` on `-l` / `-m` (`yaol`, `yaom`, `yuol`, `yuom`; about 32 of 55) whose `to` reading is a yes / no question or a statement; `links-14`, `-15`, `-16`
- **Concludes:** with R the `to` reading and T its claim term, translated at R's sites (`Translation.site(R)`, so the question's `zawan` stays the answerer): `ao` gives `holds(T) :- on(Id).`, `uo` gives row 2's `holds(neg(T)) :- on(Id).`; a first-mention noun in T gets the answer's own constants (row 14; under `uo`, row 2 on its kind). A body after the particle takes row 1 as well (classification: "a body after it is the answer"). The ending goes to `Translation.notes`. Marks the `edge:polar` link used. A polar word on a fill question (R has blanks) stays `left` `unused`
- **Classification:** `edge:polar` (link), unchanged
- **Anchor:** `questions.md#polar-particle`: "`yaol` / soft `yaom` | the claim matches" and "`yuol` / soft `yuom` | the claim does not match"; "To back up your own statement with *yes*, give `yaol` a turn of its own"; `sentence-linkers.md#past-a-period`: "`-l` vs `-m` on the act word / *yes* / *no* is how firmly you stand behind it"
- **Fixtures:** `lk7`+`lk8` yes; `lk7`+`lk9` no; `lk7`+`lk10` yes; `lk7`+`lk11` yes (all now unknown); `lk12`+`lk13` clash on `walk(z(alazun))` (now no clash); `lk14` yes, no clash (now yes, t:1.0 left)

#### R4d-3: a polar word with no verdict claims nothing
- **Kind:** copy
- **Covers:** `edge:polar` with `ua` (`yual`, `yuam`, `yuar`) and `oe` (`yoel`, `yoem`, `yoer`) on any ending, and any polar word whose `to` reading is a command or that has no `to`
- **Concludes:** no rule; marks the `edge:polar` link used, so the turn is not left; T stays open (`couldBe` yes). The word goes to `Translation.notes`
- **Classification:** `edge:polar` (link), unchanged
- **Anchor:** `polar-inventory.md#polar-endings`: "`yoel`, `yoem` and `yoer` decline to answer without saying *no* and without judging the question. Nobody should hear them as a denial or as a rejected frame."; `polar-inventory.md`: "`yual` … judges the question, not the speaker's willingness"; for a command, `polar-inventory.md#answer-command` (comply / refuse: no claim; force has no row)
- **Fixtures:** `lk15`+`lk16` unknown, couldBe yes, `lk16` not left (now unknown, left); `lk17`+`lk18` unknown, `lk18` not left (now unknown, left)

#### R4d-4: tags mark their link used
- **Kind:** copy
- **Covers:** `slot:tag` (44: `zwal` 34, `zwol` 10, `dwol` 5, `zwan` 3, `zwon` 1); `links-22`, `-45`, `-51` to `-60`, `-66` to `-72`
- **Concludes:** nothing new: the tagged phrase takes its own row (a name, a first-mention noun, a list term, or row 8's template), and a recall binds through its anaphor link, as `zwar` already does. Marks `slot:tag` used once the term it names is written. A bound tag on a `zual` / `zuam` / `zul` fence names the template's member: a recall inside its reach is the `X` of `T[X]` (row 8)
- **Classification:** `slot:tag` (link), unchanged
- **Anchor:** `tag-pronouns.md#naming-with-a-tag`: "A tag with `-l` right after a phrase in the same role names that phrase"; `universals-domains.md#bound-tags`: "binds: it names each member in turn, not the group"
- **Fixtures:** `lk19` `? zodozel dugedel vayebel.` yes (now unknown, t:0.0 left); `lk20`+`lk21` yes (now unknown); `lk22` yes through row 11 (now unknown). A bound tag in a universal hinge (`zual gogozel zwal vezuvel thohem blarl zwar guzemel.`) also needs R4b's universal hinge

#### R4d-5: a discourse hook that adds, rewords or returns keeps the clause
- **Kind:** copy
- **Covers:** `edge:hook` and `hookJob:discourse` with `a` (`al`, `am`, `ar`), `o` (`ol`, `om`, `or`), `ao` (`aol`, `aom`), `ae` (`ael`, `aem`) and `er` (about 33 of 41); `links-11`, `-28`, `-31`, `-32`
- **Concludes:** row 1 on the body; the hook to `Translation.notes`; marks the link used. The prior reading is untouched
- **Classification:** `edge:hook` (link, read as `hookJob:discourse`), unchanged
- **Anchor:** `hooks.md#discourse-hooks`: "`al …` | add another claim you stand behind" and "`ol …` | say the last claim another way"; `discourse-hooks.md#discourse`: "`er …` *Anyway* leaves the side topic standing and returns to the main one"; `discourse-hooks.md#stacked-discourse`: "`ael …` … this sentence is one case of what you just said"
- **Fixtures:** `lk23` to `lk27`, each yes on its own clause (now unknown, left). `el` / `em` / `ur` are O-2, `ul` / `um` O-3

#### R4d-6: a restrictor's occasion clause is the marker's data
- **Kind:** copy
- **Covers:** `lexReading:standIn` on a restrictor's `blarl` (`huxal blarl …`); `links-4`
- **Concludes:** row 15 with listed occasions: only the marker (`never(P)` / `always(P)`), the occasion's nested reading in the marker's data; marks the `standIn` link used
- **Classification:** `lexReading:restrictor` (frame:occasion) with `lexReading:standIn`, unchanged
- **Anchor:** solver.md row 15: "With listed exceptions or occasions, only the marker" (`restrictors.md#only-when-never-hal`)
- **Fixtures:** `lk28` unknown, not left (now unknown, left)

#### R4d-7: a point-back hook takes the landmark it points to
- **Kind:** copy (blocked on a reader gap, see Findings)
- **Covers:** `hookJob:resume` (17 less R4b's under a universal hinge: `er`, `ur`, `ar`, `aor`, `aer`, `uer`); `links-19`, `-24`, `-36`, `-37`
- **Concludes:** the clause gains the extra-noun detail of the hook it resumes: `dt("hookJob:extraNoun", <this hook's vowels with the resumed hook's ending>, L)` with `L` the resumed landmark's own term (its constant, `nm(R, b)` for a first-mention landmark), so *there* is the same house. Under a denial the detail stays inside the denied term (never dropped, so `lk30` never answers *no* to *does Alazun sit?*). Marks `hookJob:resume` used
- **Classification:** `hookJob:resume` (link), unchanged
- **Anchor:** `in-clause-hooks.md#hook-resume`: "after the verb, the hook points back to the landmark already in play, the way resume `-r` does on a noun"; "the vowels keep the extra they named … and `-r` drops the landmark"
- **Fixtures:** `lk29` yes / yes; `lk30` unknown; `lk31` yes (all now unknown, left)

#### R4d-8: a stand-in pointing back holds that content
- **Kind:** copy (`durth` / `derth` / `dorth` blocked on a reader gap)
- **Covers:** `lexReading:standInBack` in `/z/` `/d/` `/b/` (`darth` 4, `durth` 2, `zarth` 1); `links-21`, `-49`, `-50`
- **Concludes:** the role's term is the linked reading's claim as a nested clause, `asserted: false`, as the forward stand-in's dependent is written (`blarth` already resolves this way, solver.md row 17); nothing is claimed again. Marks `standInBack` used
- **Classification:** `lexReading:standInBack` (link), unchanged
- **Anchor:** `stand-in-vowels.md#stand-in-back`: "the word stands for the most recent content of that kind" and "the content is not said again"
- **Fixtures:** `lk32` yes / yes (now unknown / yes); `lk33` yes once `durth` points to the `durl` dependent (now unknown, left)

#### R4d-9: joined verbs claim each verb, with the shared noun
- **Kind:** copy
- **Covers:** `reading:verbSharedNoun` (3), and the verb `val` list itself, which today writes one list claim and is not a part (lk35 answers unknown and is not left); `links-73`, `-74`, `-75`
- **Concludes:** per verb item k of a closed `a` verb list, `holds(V_k(z(..), d(..), …)) :- on(Id).` with the clause's roles and each shared unit; a verb's own object stays its own. Marks `reading:verbSharedNoun` used
- **Classification:** `reading:verbSharedNoun` (link), unchanged; `joinSeries:a` on a verb list: add "a claim per verb (`verb-and-stance-joins.md#vp-clause-forms`)"
- **Anchor:** `verb-and-stance-joins.md#vp-clause-forms`: "Before the subject, a word covers every verb." and the example "Alazun talks to Azozon and pays them, both intensely."
- **Fixtures:** `lk34` yes (now unknown, left); `lk35` yes (now unknown, not left)

#### R4d-10: *respectively* pairs a verb list with the subject list
- **Kind:** copy
- **Covers:** `overlay:pairing:w` on a verb list (2); `links-26`, `-39`
- **Concludes:** row 11 paired by index with the verb as the second list: per verb k, `holds(V_k(z(X), …)) :- member(ls(Id, z), X, k), on(Id).`; adjective lists the same with `isa(X, K_k)`. Marks the `pairing` link used
- **Classification:** `overlay:pairing:w` (link), unchanged
- **Anchor:** `list-structure.md#respectively`: "A list of adjectives or verbs pairs with the subject list the same way: put `wubam` before the join word that closes it."
- **Fixtures:** `lk36` yes / unknown (now unknown, left)

#### R4d findings

- **Reader gaps.** `hookJob:resume` has no `to` and no landmark (`read.ts` `readHook`), so R4d-7 cannot be built until the resolve stage names the resumed hook's landmark and its reading. `standInBack` always points to the previous sentence (`prevTo`), but `durth` / `derth` / `dorth` stand for the most recent content of their kind (`lk33`: the `durl` dependent `t:0.0/d`). `edge:hook` `el` / `em` / `ul` / `um` carry no `to` (O-2, O-3 need one).
- **Fragments, not sentences.** About 25 left readings are table fragments: a stand-in with nothing after it (`herom blarl`, `ul barl`, `huxal blarl`, also `slot:grounds`), `ul oel`, `ul ul`, `zarx ar`, `er xazozor`, `glegol x[odoze]`, `x@[onuren alazun]`. No row can use a dangling stand-in; the sweep should skip fragments or leave them with their own reason.
- **Verb lists are never split.** `zazozon vowurol veruvol val.` answers *does Azozon run?* unknown and is not left, since a verb list is no part; R4d-9 drafts the split, and the accounting should list a verb list as a `list` part.
- **Not this area:** `zeyel zar uol boduvul vowurol.` (`unused hookJob:extraNoun` is a SHARED hook after `zar`, R4c-5's shape); `zodozel zogozel zal om bahelan …` (R4c-5); `zazozon vezuyol bahelan balazun bal hwubar.` (`joinSeries:a` in a say word's `b`, R4a); `… darl zalazun vowurol thahum blarl …` (a hinge inside a *tell* dependent, the because area); `carry:channel` (R4c-8).


## Open decisions

From phase 2's drafts. Each names its row; the user decides before phase 3 builds that row.

### R4a open decisions

1. **`zawan` in a turn with several addressees.** `Bea: yazozon. yalazun. zawan vowurol.` One addressee is `awa` (`collectives.md#addressing-several-people`), but the turn named two. Options: (a) `listener(N)`, fitting no other turn's; (b) one of them, chosen by the last call; (c) each addressee, as `awanx`. **Recommendation:** **(medium)** (a): the grammar says `zawan` is one person and the log cannot tell which, so claiming nothing about either keeps the solver from asserting what the speaker did not say; (b) guesses.
2. **Does `zayan vowurol.` give each member's act?** With `we(sp("Bea"), azozon)`, does *we walk* give *Azozon walks*? Options: (a) the group term only, like `-x` `grp(..)`; (b) members, as an *and* list (row 11), with the collective `-x` verb exception. **Recommendation:** **(medium)** (b): `pronouns.md` calls `aya` "the speaker and the people being addressed, together", and `collectives.md` gives `zayam` to hedge "whether you really share the act", which reads as plain `zayan` claiming each does. Settle by asking whether *we walk* to Azozon lets *does Azozon walk?* answer yes.

### R4b open decisions

1. **The *only if* half of a hinge over MAY** (`zalazun vezuvel vul. thebem blarth thomam zazozon vowurol.`: without the sleeping, could Azozon walk?). Options: (a) plain, `holds(neg(Out)) :- fits(P, c(Id)), holds(neg(P))`: without the condition the outcome is not even possible; (b) a choice, as row 17's *if*; (c) no rule. **Recommendation:** **(medium)** (a): *only then may Azozon walk* rules the walking out without the condition, and (b) would let a learner's *no* answer read as *maybe*. Settled by the user reading the English.
2. **Named outcomes under `gohem`, `gebem`, `gehom`** (`zazozon gebem blerulal.`): D15 claims the condition, which fits `gahum` only. Options: (a) the link as a fact outside `holds`, `hinge(Id, Gloss, Cond, Name)`, nothing claimed; (b) leave in `left`. **Recommendation:** **(low)** (a), so the reading is kept and a reply can quote it; settled by whether any job should read it.
3. **Zones `uom thalom` (want) and `uom thogem` (decision)** (`zazozon vowurol uom thalom.`, 15 sweep readings with `intention:overlay:want:th` / `:decision:th`): row 14 lists only plan, channel and say. Options: (a) `Z` = `want(H)` / `decision(H)`, marker only, as `plan(H)`; (b) leave them. **Recommendation:** **(high)** (a): `contrary-to.md#contrary-to-stance` lets any intention adverb follow `uom`, the same shape as plan.

### R4c open decisions

1. **Reversed rank.** `zazozon zalazun zol gamahum. zalazun zazozon zol gamahum.` gives no clash now (probe L1r). Options: (a) `clash(more(S, B, A)) :- holds(more(S, A, B)), holds(more(S, B, A)).`; (b) data only. **Recommendation:** **(high)** (a): `comparatives.md#comparatives` says "The first name sits higher on that quality than the second", and D17 already treats rank as strict when it clashes with a tie.
2. **Rank with a verb.** `zazozon zahelan zol hahunom velunel.` (`unused shared:scale`): does each member's act hold? Options: (a) as D17 for ties, each member's act holds plus `more(S, A, B)`; (b) only `more`. **Recommendation:** **(medium)** (a): *runs faster than* is said of two runners, and it keeps `o` and `oe` alike; settled by a sentence on `comparatives.md` about `/h/` scales.
3. **Rank of three or more** (`zazozon zalazun zahelan zol gamahum`, also `zaol`, `zom`, and `zol … zul`): Options: (a) `more(S, Xi, Xj)` for each i < j in text order; (b) only first over the rest. **Recommendation:** **(medium)** (a) for `zol`; `zaol` (sorted low to high, `list-structure.md#shared-after-the-join`) reversed; `zom` and a denied rank wait. Settled by `rank-joins.md`'s wording for three items.
4. **A tie with a factor** (`zazozon zalazun zoel gelazem hradol.`, `zogozelx zodozelx zoel gral`): a factor makes it not a tie. Options: (a) data `ratio(S, A, B, V)`, no tie, no clash; (b) leave left. **Recommendation:** **(medium)** (a), since the page reads it as *N times as*; D17 does not cover it.
5. **Verbless lists** (`zobudal zuel.`, `zobonol zabewol zen.`, `zugowal zagorol zomobul zer.`, `zahelan der vagedal.` has a verb but `…er` with no items): no claim term. Options: (a) a fragment stays left with its own reason (`fragment`), later read as a reply to a fill question; (b) existence (`isa`) per item. **Recommendation:** **(medium)** (a): the pages give these as offers and names, not claims (`rank-joins.md`: "The invert `ue` offers a free choice outside the list"). Statement `…er` (*eats anything*) needs its own decision: likely an open universal (row 10), low.
6. **Evidence clause** (`zalazun vabuvul theyom blarl zazozon vozumul.`, lists-31, lists-33; standalone `theyom blarl`, lists-19 to lists-21): is the grounds sentence also your claim, and what joins them? Options: (a) both row 1, plus data `grounds(E, C)`; (b) only the claim. **Recommendation:** **(low)** (a); settled by the wording of `evidentiality.md#evidence-clause`, not read in this unit.
7. **`…ur` and `…or` fill questions, and a blank inside `derl` / `darl`.** D10 does not cover them. Options: `…ur` excludes the listed items and items already named in the turn; `…or` fills from `most` / `more`; a `darl` blank fills through `say` / `view`; or `beyond` until decided. **Recommendation:** **(medium)** `beyond` for now, then `…ur` as the listed-blank complement, which the arity table states ("*Other than these?*").
8. **SHARED number word and `dar` with a resume** (`zazozon zalazun zal growamol.`, `zogozelx zodozelx zal gral`, `zalazun dar godozer gubulel vayebel.`): what a SHARED number says of each member is not stated in this unit's anchors. **Recommendation:** **(low)** leave left; settled by `generations.md` and `resume-sense.md`.

### R4d open decisions

**O-1: does a sentence linker add a term?** `zazozon vowurol. xahom zalazun veruvol.` (*therefore*). The page gives each linker a gloss only ("*therefore* moves forward from the prior claim"; `xahol` "the next claim must hold if the last sentence does"; `xugohul` "the last claim is blocked outright"). Options: (a) notes only for all nine (R4d-1 as drafted); (b) `xahom` adds row 10's `holds(cause(Prior, Next))`, so *why does Alazun run?* cites the walk and *not because* (row 11) can clash with it; `xahol` adds the rule `holds(Next) :- holds(Prior), on(Id).`; contrast and sequence linkers notes only; (c) `xugohul` also denies the prior claim. **Recommendation:** **(medium)** (b) for `xahom` only, (a) for the rest: English *therefore* states a reason and the learner would expect *why?* to find it; a deduction's conclusion is already claimed, so `xahol`'s rule adds nothing a job reads. Reject (c): the page's own example keeps the denied *sleeping* true. Settled by a page sentence on `sentence-linkers.md#sentence-linkers` saying *therefore* gives a reason as *because* does.

**O-2: does *instead* / *never mind* withdraw the last claim?** `zalazun veruvol. el zalazun vezuvel.`; `ur` (*drop the last point*) and `em` the same. Page: "`el …` | this claim replaces the last one". Options: (a) the replaced reading leaves the program (the job's `on` fact off), with a note; (b) keep both and add a one-way attack in `stands`, `att(Id, Last)`; (c) notes only, both claimed. **Recommendation:** **(medium)** (a): *does Alazun run?* should not answer *yes* after the speaker replaced it; (b) still lets `follows` say yes. Needs the reader to give `el` / `em` / `ul` a `to` (only `-r` hooks get one today).

**O-3: what does *except* do to the claim before it?** `zuvayal vowurol. ul zalazun vowurol vul.` Page: "`ul …` | an exception to what was just said". Options: (a) notes only, both claimed (the family's members clash with Alazun's denial once membership reaches him); (b) the prior reading's universal or member rule skips the members the exception names; (c) like O-2, the prior reading leaves. **Recommendation:** **(low)** (b), since an exception should never show as a clash; settled by a page sentence on what `ul …` does to a general claim before it, and how the reader marks the excepted members.

**O-4: does a *for now* polar word claim?** `yaor zazozon vowurol.` Page: "`yaor` takes a claim on board without committing to it" but also "says only that you hold the claim for now". Options: (a) claim as `-l` / `-m` do, `-r` in notes; (b) no claim, as R4d-3. **Recommendation:** **(low)** (a), since the page says the speaker holds the claim and a later reversal shows as a clash the learner can give up; settled by the page saying whether `yaor` asserts.

**O-5: what does taking up or rejecting an option give?** `yael` / `yaem` / `yaer`, `yuel` / `yuem` / `yuer` after an offer or an *or* question. Options: (a) notes only, as R4d-3; (b) on an *or* list question, `yael` claims the offered item and `yuel` denies it. **Recommendation:** **(medium)** (a): accepting an offer is a turn act, not a claim about the world, and "this option" names no item the reader can pick.

**O-6: NOTIONAL and what it carries.** `zazozon theyum vowurol. zazozon vehohel.` leaves `noRow overlay:notional:th` then `unused carry:notional`. Page: "The sentence now describes an imagined scene and makes no claim that it happens"; "The supposition carries, so every step after it stays supposed". Options: (a) a wrap like a view, `holds(view(notional, T))` (ending in notes), carried readings the same, inference inside it as holder rule 4, never `holds(T)`; (b) left `beyond`. **Recommendation:** **(medium)** (a): it keeps a supposition's steps checkable for clashes, as `notional.md` reasons from one, and never leaks into your claims.

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
