# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-20: phases 1 to 5 done. Phase 5 (B4b, B4c, B6a): lists and channel stances on your own claim, a `fragment` left reason, SHARED words in `match()` (D21), a place on a scale (D22), and links that add no term (R4d-1 to R4d-5, O-1, O-4, O-5). It ended early at the user's word, to save tokens: B6b moves to phase 6, after a tooling unit (T2) that cuts what each unit rebuilt or hunted for. Open decisions 1 to 3 logged. User, 2026-11-20: phase 6 builds the tooling (T2, T3) and runs only B6b with it, so the user can review how much the tools helped; then phase 7 (B6c, B5a, B5b) and phase 8 (S1). Next is phase 6. User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles), [sentence linkers](/sentence-linkers), [polar inventory](/polar-inventory), [hooks](/hooks), [notional](/notional); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The page sentences the confirmed rows name (each written in the unit that builds its row).

## Design

Phase 1 built the faithful half: the **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused part to `left` with reason `unused` (a question with one answers `beyond`), and the sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part. Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`).

Phases 3 to 5 built the rows below; [solver.md](../../meta/solver.md#translation-table) owns each. What phases 6 to 8 build on:

- **The conditional is a claim term.** A plain *if* / *only if* / *iff* claims `if(c(Id),o(Id))`, `onlyif(..)` or `iff(..)`; matching between conditionals is `Translation.conditionals` / `conditionalFits`. MAY wraps a side: `if(may(c),o)`, `if(c,may(o))`, or `may(if(..))` with a choice on the plain term (`Conditional.may` keeps a wrapped one from meeting a plain one). A hinge on a closed universal claims a template term plus a member term per stated member (`Conditional.id` = `"Id",M`), rows 5–7 run per member. A hinge in a holder's view claims `view(H, if(..))`.
- **Zones.** `against(T, Z)` with `Z` = `plan(H)`, `want(H)`, `decision(H)`, `channel(Gloss, H)` or a say word; `H` = `sp("…")` with no holder; a zone over a hinge puts `against` on the conditional.
- **MAY.** Row 15's choice wherever MAY is held (D18, D19); *always* over MAY adds `always(may(T))`, which clashes with and attacks `never(T)`. A MAY question runs as `couldBe` (switch `couldBe`).
- **Rank, ties and places.** `ranked()` in `translate.ts`: `more(S, A, B)` per ordered pair, `most(S, A)`, `tie(S, A, B, E)`, `ratio(S, A, B, V)`, and `place(S, A, rk(N))` (D22: two places for one member clash; a place other than 1 gives `neg(most(S, A))`; a place with a verb stays left). `match()` compares a list's SHARED words (D21, [matching a claim](../../meta/interpreter.md#matching-a-claim)), so a rank, tie, ratio or place question on another scale never fits; `ratio(..)` is pooled for questions. With a verb each member's act holds.
- **Lists and channels** (solver.md rows 25–31). `ue` denies each item; two `u` lists deny every pairing; SHARED details after a join go on each member or into each verb's term; likeness among members, each to each; a collective `-x` adjective is `isa(ls(..), K)` with no member facts; a channel on your own claim is row 1 with the frame in `notes`, carried readings too; an evidence clause claims both, plus `grounds(E, C)`.
- **The `fragment` reason.** `{ construction: "fragment", key: <join frame>, reason: "fragment" }`, helper `fragment()` in `translate.ts`; today only a verbless claim whose one role is a `z` list with a join frame other than `joinSeries:u`. B6b extends it to table fragments.
- **Links** (rows 33–37). `/x/` continue words, polar verdicts, no-verdict polar words, tags, and discourse hooks with `a`, `o`, `ao`, `ae`, `er` take the body's own rows plus notes. A verdict (`ao` / `uo`, on `-l`, `-m` or `-r`; `yuor` too, open decision 3) reaches only an answered reading with no frame but its act word and first mentions, and no list, blank, clause or quote. `xahom` adds `cause(Prior, Next)` between two plain claims only. `Note.frame` may be a `LinkNote`; `talk()` / `talkRules()`; a reading with an empty claim and only links writes `on(Id)` alone.
- **Witnesses.** A question's witness facts come from `Translation.witnesses`; a row that adds a first-mention witness fact records its lines there.
- **Holders and say words.** `sayRules()` emits the say rules; `zayan` is `we(..)`; `zawan` reads `LogEntry.addressees`. Reserved names include `if`, `onlyif`, `iff`, `we`, `every`, `because`, `want`, `decision`.
- **One pool of claims.** Every turn's plain claim is `holds(T)`, with no speaker; a per-speaker layer (`said(Speaker, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) will be its first users.
- **Fixtures.** `solve-holders.txt`, `-because`, `-hinges`, `-say`, `-maybe`, `-lists`, `-channels`, `-links`. `solve-links.txt` reads as one log, each verdict answering the entry before it; lk7, lk15 and lk17 are tested in `solve.test.ts`, lk6 in `accounting.test.ts`. Drafts left: `draft-because.txt` (bc36, tag `zwar`, left), `draft-hinges.txt` (hg11 for B6c, hg23 left), `draft-links.txt` (lk28–lk33 and lk37–lk39 for B6b; lk34–lk36 and lk41 for B6c), `draft-fill.txt` (B5a). Use the inline `blarl …` form of a hinge condition. A draft verdict "→ no" that only means *does not follow* is tested as `unknown`; a draft "couldBe yes" on a claim nothing states is `unknown` too (`couldBe` says yes only where a choice makes the claim hold).
- **Probing.** `probe --program` prints the case's own lines; `--case N`, `--terms a,b`, `--program=full` (T1).

After phase 5 the sweep leaves 113 `unused` readings: slot:adj 34, shared:scale 28, lexReading:standIn 25, hookJob:resume 17, shared:distribute 15, edge:hook 9, lexReading:standInBack 7, lexReading:number 5, carry:notional 3, edge:polar 2, and 1 or 2 each for slot:grounds, overlay:pairing:w, anaphor:content, overlay:likeness:g, unit:h, hookJob:extraNoun, shared:equative, lexReading:sake:g, shared:kind, overlay:clause_hinge:th. `slot:adj` shows up only now: readings a linker or tag stopped before now get that far. Nobody has triaged it.

## Decided

User, 2026-11-19 (D7–D10) and 2026-11-20 (D21, D22), each as recommended. Every decision but D10 is built and lives in [solver.md](../../meta/solver.md#translation-table); the numbers are kept.

10. **The fill job.** Cautious answers by default, brave with `--possible`; one `zar` with several fillers lists them all; no filler is *unknown* unless `closedWorld` gives *nobody*; `…er` is an existence yes or no; `gar` answers from `isa` only until named details are encoded; *why* binds `C` from `cause(C, Out)` only, not a met *if*. When, where, whose and how wait for detail-term rows.

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)); phases 1 to 5 are done, three phases remain. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

**Budget** (user, 2026-11-19; revised 2026-11-20). Phase 5's build units ran 54 to 88 tool calls and 97k to 176k subagent tokens each, and the session ran short after three of them. Most of the overrun went on start-up reads (`translate.ts`, `solver.md`) and on tools each unit rebuilt (a sweep counter, fixture wiring, classification-row lookups); T2 builds those once. Each phase now takes three units at most. A build unit that passes about 60 tool calls with more than a few edits left stops and hands back; the orchestrator starts a fresh subagent for the rest. Briefs carry only the [Design](#design) bullets a unit builds on, not the whole section.

**Every build unit** adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases; moves its rows' `draft-*.txt` cases into the `solve-*.txt` of the same area, or `git mv`s a draft to a new `solve-*.txt` when no file fits, and deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`); adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge; and writes each page sentence its rows name on that page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; S1 reviews it). Its brief quotes its rows, the settled decisions they use and its rows' findings, from [Confirmed rows](#confirmed-rows). Its report gives the sweep's `unused` count by part key.

**Every build unit may edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages its rows' page sentences name. A unit's own **May edit:** line adds to this.

### Carried into phases 6 to 8

- **B6b:** the period form of a hinge condition (`thohem blarl. zalazun vezuyol.`, `slot:grounds`) is left by every hinge row; decide whether R4d-8's stand-in row covers it, or report it for the edge. A `blarth` condition that points back to a denied sentence is left `noRow overlay:clause_hinge:th`; report it for the edge unless R4d-8 covers it as written.
- **B6c:** R4e finding 5 (hg11).
- **S1:** besides the changed-sections list, the R4b-4 sentence in `because-and-iff.md#choosing-a-hinge` says "holder", which that band teaches later, with no link.
- **For the edge at the end** (no row; fold into [solver.md](../../meta/solver.md#the-edge) when the proposal closes, beside [Outside this proposal](#outside-this-proposal)):
  - a question asked as said over a data wrap (answers unknown); `zul` / `zuam` under a leading say word; `awanx` (`LogEntry.addressees` holds only the turn's own calls, while `collectives.md#addressing-several-people` adds anyone already addressed)
  - zones: a say-word zone with a universal, restrictor or hinge; `zuam` / `zul` with a zone; `huam` or listed exceptions with a zone; *only if* under a zone; a denied hinge with a zone; the fragment `uom hwudum` (`say-reasons.md`)
  - MAY: `huam` under MAY; `hal` / `huam` over MAY; listed exceptions with MAY over a restrictor; open `zuam` and *no K* with no verb under MAY; MAY with a say word, universal or restrictor beside another frame; a carried holder with MAY beside a hinge; row 6's forward rule on a MAY condition reads `holds(neg(may(P)))`, which nothing produces
  - universals: with MAY on the condition, a universal hinge's *only if* half has no back rule; hg23 (a denied universal hinge); bc36 (tag `zwar`, `slot:tag`)
  - rank: an open tie with a factor (`zoem`); a factor on a tie of three or with a verb; `zaol` with one name or a verb; any frame on a rank shape other than R1-8; `zuol` (a superlative or place from the bottom, `noRow joinSeries:uo`); a place with a verb; *is Ahelan the third biggest?* after *Ahelan is the biggest* answers unknown (no row denies a place from `most`; the two claims clash)
  - lists: the likeness term drops its `bl-` model (`zazozon gewem blalazun.` gives `isa(azozo, ewe)`), so with three or more members the pairs pool into one term; a `zam` list brings in no new member (`zodozel zogozel zam gegunum blazozon.`); named members with a `bl-` likeness model (`zazozon zalazun zal gewem blagayul guzemel.`); a SHARED number word and `dar` with a resume (`zazozon zalazun zal growamol.`, `zalazun dar godozer gubulel vayebel.`); `theyomazozon thrawal` (holder + certainty, `noRow frameCombination`); `el bual gohahal` (`unused shared:kind`)
  - links: a polar verdict on a reading with frames, a list, a blank, a clause or a quote (`edge:polar`); `xahom` between claims with frames or lists is a note only; a hinge inside a *tell* dependent (`… darl zalazun vowurol thahum blarl …`)
  - `zazozon guzemel vul.` reads `vul` as the verb *no*, not a denial of the adjective claim (B3c); check how the grammar denies an adjective predication before calling it a reader bug

### Phase 6: tooling, links that point back

Phase 6 tests the tooling: it builds T2 and T3, runs the one unit left from phase 5 (B6b) with them, and measures that unit against phase 5's.

**T2 Unit tooling.**  
`proposal-worker`, `model: sonnet`, effort `high`.  
Build once what each phase 5 unit rebuilt or hunted for:
1. `npm run sweep`: runs the walk that `src/interpret/accounting.test.ts` runs (shared from one module, not copied) and prints left readings by reason and part key, `unused` by part key, and throws. `--save` writes the counts to a `tmp/state/` file through `tmpPath()`; `--diff` prints only the keys whose count changed since the save. Six units each wrote a `tmp/scratch/*-sweep.ts` for this.
2. `npm run class-row -- <key> …`: each classification-table row of `docs/meta/interpreter.md` for a part key (such as `joinSeries:ue`), with its line number and its `notes` cell.
3. A paragraph in [solver.md](../../meta/solver.md) by the Files line: how a `solve-*.txt` fixture is registered in `solve.test.ts`, how its `.lp` golden is written and regenerated, and that a case still left belongs in `accounting.test.ts`.

Tests beside each script. Its report names the commands, one line each, for the rule digest and for the `AGENTS.md` tooling notes; the orchestrator adds the digest line before B6b and applies the `AGENTS.md` lines.  
**May edit:** `scripts/` (not `token-report.mjs`), `package.json`, `src/interpret/accounting.test.ts` and a new module under `src/interpret/` for the shared walk, `docs/meta/solver.md` (the fixture paragraph and the CLI section).

**T3 Token report for one unit.**  
`proposal-worker`, `model: sonnet`, effort `high`.  
Extend `npm run token-report` ([scripts/token-report.mjs](../../../scripts/token-report.mjs)) so one unit's run can be read without a hand-made script (phase 5's orchestrator wrote one to find out why B4b ran to 88 calls):
1. `--agent <id or description text>` and `--session <id>` narrow the report to the matching transcripts; the subagent table already holds each description.
2. `--calls` prints one line per tool call of the selected transcripts: number, kind, result tokens, context at that call, carry cost, label. `analyse()` already works these out per item.
3. `kindOf` gains this repo's kinds, now lumped as `bash other`: probing (`reading.mjs probe` / `solve`), scripted edits (`cat > tmp/scratch/…` heredocs, `node tmp/scratch/*.mjs`), one-off tools (`npx tsx tmp/scratch/*`), and `npm run verify` as a check.
4. A section listing tool calls whose shape recurs across the window's subagents (the same script name pattern written in several, the same grep run in several), so a missing shared tool shows without reading a transcript; six phase 5 and earlier units each wrote a `tmp/scratch/*-sweep.ts`.

Keep the header's baseline as it is; the report names the new flags, one line each, for [proposal-plans.md](../../meta/procedures/proposal-plans.md) (*Measure it*), which the orchestrator applies.  
**May edit:** `scripts/token-report.mjs`, a test beside it.

**B6b Links that point back.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d-6 to R4d-8; R4d decisions O-2 (*instead* drops the replaced reading) and O-3 (*except* narrows the general claim; the page sentence goes on `hooks.md`, in the discourse-hooks section: the general claim stays, minus the members the exception names). First the reader gaps, as their own step with `read.ts` tests: `hookJob:resume` gets its `to` and landmark; `standInBack` takes the latest content of its kind (`durth`, `derth`, `dorth`), not always the previous sentence; `el`, `em`, `ul`, `um` hooks get a `to`. If a gap needs a design beyond a `to` and a landmark, or the reader cannot mark the excepted members without new grammar, stop after it and hand back. Table fragments with nothing after a stand-in (`herom blarl`, `ul barl`) take the `fragment` reason. Fixtures: lk28 to lk33 and lk37 to lk39 into `solve-links.txt` (one log) or `solve.test.ts`. Its report lists the edge items it leaves.  
**May edit:** as every build unit, plus `src/interpret/read.ts` (those hook and stand-in fields only), `docs/meta/interpreter.md` (the links-table rows for the `to` fields, and the `notes` cell of rows its rows name).

**Measure B6b.** After B6b's commit, the orchestrator runs `npm run token-report -- --agent B6b --calls` and the same for B4b and B6a (phase 5, 2026-11-20), and records for the user, on the Status line: calls, peak context and weighted cost of each, the start-up read share, and which T2 tools B6b used and what it still built or hunted for by hand.

**Order:** T2, T3, B6b, then the measurement. Then consolidate this proposal and stop.

### Phase 7: joined verbs, fill

**B6c Joined verbs and NOTIONAL.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d-9 and R4d-10 (a `val` verb list claims each verb; *respectively*), with the verb list counted as an accounting part; R4d decision O-6 (NOTIONAL is a wrap, `view(notional, T)`, carried readings too, never `holds(T)`). R4e finding 5 (`thanam thohem thul blarl`, hg11) builds here if the channel rows (solver.md rows 25–31) say what denying DEDUCED adds. Fixtures: lk34 to lk36 and lk41.

**B5a The fill job.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-9 to R4c-13 (D10) and R4c decision 7 (`…ur` / `…or` answer `beyond` for now): `fill(log, question, options)` in `solve.ts`, with its `solve.test.ts` cases from `draft-fill.txt`, and the Jobs section of [solver.md](../../meta/solver.md#jobs). Verbless lists are left `fragment` (phase 5), later read as replies to a fill question. Its report gives `fill`'s signature and result shape, which B5b is briefed from.

**B5b Fill wiring.**  
`proposal-worker`, `model: opus`, effort `medium`.  
Export `fill` from `solve-browser.ts` and `browser.ts`; `reading.mjs solve` and `probe` dispatch a `fillAsk` question to it; the reply through `reply.ts`; the CLI section of [solver.md](../../meta/solver.md#cli).  
**May edit:** `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/reply.ts`, `src/interpret/probe.ts`, `src/interpret/cli.ts`, their tests, `docs/meta/solver.md` (Jobs and CLI sections).

**Order:** B6c, B5a, B5b. Then consolidate this proposal and stop.

### Phase 8: style

**S1 Style gate.**  
`style-editor`, `model: opus`, effort `high`.  
The `npm run changed-sections -- <rev>` list, where `<rev>` is `9e38c73d`, the commit before F1's.  
**May edit:** the listed sections.

**Order:** S1. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

**Running phases 6 to 8.** Before each build unit the orchestrator runs that unit's draft cases through one `probe` file and appends the result to the brief.

### Rule digest (pasted into every brief)

```
- Work only on your unit's items and files. Read AGENTS.md; never trust a form from memory.
- Ageben forms come from grammar pages and the parser. Check forms with one batched
  node scripts/parse.mjs --check-lexicon '<a>' '<b>' ...; keep --llm-prompt for working out
  what a sentence means.
- Probe in batches: put every test sentence in one file for node scripts/reading.mjs probe
  FILE (cases split by ---, ? asks follows, ?~ asks couldBe), run it once, and re-probe only
  what surprised you. Never add --program to a batch: it is for debugging one case or
  confirming a new row's terms, as probe --program --case N [--terms a,b] FILE (the case's own
  lines; --program=full adds the shared rules). find.mjs lists ten examples; ask --all only
  when needed.
- No new grammar. A sentence that needs a form the grammar lacks is a finding: report the
  English and the nearest workaround, then move on.
- Your rows are confirmed (the brief quotes them, with the decisions they use): build them as
  written and cite their anchors. A row that cannot be built as written, or a meaning no row,
  page or decision states, is a finding for the user, never a choice you make.
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
- Final gate, at the end of phase 6: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line; phase 6 makes three unit commits and a consolidation commit; phase 7 the same; phase 8 one unit commit and a last one deleting this proposal.

## Confirmed rows

Drafted in phase 2 (units R4a to R4e) and confirmed by the user, 2026-11-19; the rows phases 3 to 5 built are gone from here and live in [solver.md](../../meta/solver.md#translation-table). Each row's **Fixtures** are in `src/interpret/fixtures/draft-*.txt` (`draft-lists`, `-fill`, `-links`, `-hinges`), with the verdict the row should give and the verdict before the build. [Settled decisions](#settled-decisions), at the end, are part of the rows they name; each unit's findings feed the unit that builds its rows ([Implementation plan](#implementation-plan) names it).

### Outside this proposal

Left groups the drafts met that are host policies or other subsystems: CAUSE `thewom` before a hinge, `/h/` hinges, sake words with MAY, `stimulus:g`, nested hinges.

### R4c drafts: the fill job

Fixtures: `src/interpret/fixtures/draft-fill.txt` (f1–f10).

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

### R4d: links (drafted 2026-11-19)

Fixtures: `src/interpret/fixtures/draft-links.txt` (`lk28` to `lk41`; the rest moved to `solve-links.txt` in phase 5). Probe file: scratchpad `r4d-probe.txt`. Rows are ordered by sweep count; kinds that share the rule "marks the link used, keeps the clause" are grouped.

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
- **Fragments, not sentences.** About 25 left readings are table fragments: a stand-in with nothing after it (`herom blarl`, `ul barl`, `huxal blarl`, also `slot:grounds`), `ul oel`, `ul ul`, `zarx ar`, `er xazozor`, `glegol x[odoze]`, `x@[onuren alazun]`. No row can use a dangling stand-in; B6b gives them the `fragment` reason.
- **Verb lists are never split.** `zazozon vowurol veruvol val.` answers *does Azozon run?* unknown and is not left, since a verb list is no part; R4d-9 drafts the split, and the accounting should list a verb list as a `list` part.


### R4e: a term for the conditional

Added by the user, 2026-11-19. Its built rows live in [solver.md](../../meta/solver.md#translation-table); `draft-hinges.txt` keeps hg11 (B6c) and hg23 (left).

#### R4e findings

5. **`thanam thohem thul blarl`** puts both `thanam` and `thohem` in the stance list the `u` join closes; R4e-3 needs D8's channel-on-your-claim row (R4c) to say what denying DEDUCED adds before hg11 can build.

Finding 3 stands as built: rules per reading, the term in each body; pick a generic `holds(O) :- holds(if(S)), …` form only if a consumer must derive a conditional from another rule.

### Settled decisions
<a id="settled-decisions"></a>

The user adopted every recommendation below, 2026-11-19.

#### R4c decisions

7. **`…ur` and `…or` fill questions, and a blank inside `derl` / `darl`.** D10 does not cover them. Options: `…ur` excludes the listed items and items already named in the turn; `…or` fills from `most` / `more`; a `darl` blank fills through `say` / `view`; or `beyond` until decided. **Recommendation:** **(medium)** `beyond` for now, then `…ur` as the listed-blank complement, which the arity table states ("*Other than these?*").

#### R4d decisions

**O-2: does *instead* / *never mind* withdraw the last claim?** `zalazun veruvol. el zalazun vezuvel.`; `ur` (*drop the last point*) and `em` the same. Page: "`el …` | this claim replaces the last one". Options: (a) the replaced reading leaves the program (the job's `on` fact off), with a note; (b) keep both and add a one-way attack in `stands`, `att(Id, Last)`; (c) notes only, both claimed. **Recommendation:** **(medium)** (a): *does Alazun run?* should not answer *yes* after the speaker replaced it; (b) still lets `follows` say yes. Needs the reader to give `el` / `em` / `ul` a `to` (only `-r` hooks get one today).

**O-3: what does *except* do to the claim before it?** `zuvayal vowurol. ul zalazun vowurol vul.` Page: "`ul …` | an exception to what was just said". Options: (a) notes only, both claimed (the family's members clash with Alazun's denial once membership reaches him); (b) the prior reading's universal or member rule skips the members the exception names; (c) like O-2, the prior reading leaves. **Recommendation:** **(low)** (b), since an exception should never show as a clash; settled by a page sentence on what `ul …` does to a general claim before it, and how the reader marks the excepted members.

**O-6: NOTIONAL and what it carries.** `zazozon theyum vowurol. zazozon vehohel.` leaves `noRow overlay:notional:th` then `unused carry:notional`. Page: "The sentence now describes an imagined scene and makes no claim that it happens"; "The supposition carries, so every step after it stays supposed". Options: (a) a wrap like a view, `holds(view(notional, T))` (ending in notes), carried readings the same, inference inside it as holder rule 4, never `holds(T)`; (b) left `beyond`. **Recommendation:** **(medium)** (a): it keeps a supposition's steps checkable for clashes, as `notional.md` reasons from one, and never leaks into your claims.

## Open decisions

Logged in phase 5, 2026-11-20. None blocks phase 6.

1. **A genitive on one noun and on a joined list** (B4b). The reader puts `om bahelan` on the clause after a single noun (`yel zogozel om bahelan vowurol.`) but on each member after a join (`zodozel zogozel zal om bahelan vowurol.`), so the question never fits the log and answers unknown; the fixture asks `yel zogozel vowurol.` instead. Options: (a) the matcher treats a clause-level genitive as a detail of the `z` noun; (b) accept the gap and list it on the edge. **Recommendation:** **(medium)** (a): a learner who says *Ahelan's dog and cat walk* expects *does Ahelan's cat walk?* to answer yes, and the program already writes the detail on each member.
2. **A ratio asked the other way round** (B4c). `zazozon zalazun zoel gelazem hradol.` (*twice as big*) and `zalazun zazozon zoel gelazem hrudol.` (*half as big*) encode the same `ratio` atom, but a question in one wording against a log in the other answers unknown, since `match()` compares the members in order and the factor. Options: (a) accept it; (b) pool the inverse claim as a second fitting claim. **Recommendation:** **(medium)** (b): a learner who hears *twice as big* expects *is Alazun half as big?* to answer yes, and the atom is already shared, so only matching changes. B4c leaned (a), with no reason given beyond scope.
3. **`yuor`** (B6a). O-4 names only `yaor`; B6a read it as a rule about the `-r` ending and built `yuor` the same way (the denial, held for now). Options: (a) keep it; (b) `yuor` claims nothing. **Recommendation:** **(medium)** (a): `-r` carries *for now* on both verdicts, and the polar grid stays regular.

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
