# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-21: phases 1 to 7 done; phase 8 remains. Phase 7 (C1, C2, B6c1, B6c2): the 1500-line source ceiling is a warning ([code layout](../../meta/code-layout.md#limits)); `translate-say.ts` holds the say / wrap / holder group; joined verbs, open `vam` lists too (solver.md rows 43–44), NOTIONAL (row 45); hg11 goes to the edge. Phase 6 (T2, T3, B6b): `npm run sweep` and `npm run class-row` (`AGENTS.md` tooling notes); `token-report --agent / --session / --calls` and its recurring-shapes section ([proposal-plans.md](../../meta/procedures/proposal-plans.md), *Measure it*); links that point back (R4d-6 to R4d-8), *instead* (O-2), *except* (O-3, sentence on `hooks.md`), table fragments as `fragment`; solver.md rows 38–42. B6b ran as two subagents. **Measured** (`token-report --agent`; start-up = carry share of the calls before the first edit): B6b 74 + 74 calls, peak 121k / 126k, 912k + 954k weighted, start-up 14% / 17%; phase 5's B4b 80 calls, 174k, 1471k, 29%; B6a 62 calls, 144k, 1000k, 21%. B6b did about twice B4b's work for 1.3× its cost, at a lower peak. It used `sweep` (`--save` / `--diff`, 7 runs) and the fixture paragraph; `class-row` in part 1 only. By hand still: a resolve-record dump, scripts listing the texts of left readings (`sweep` prints counts only), debug scripts, edit scripts. User, 2026-11-21: the per-phase unit cap is dropped; units hold one code path or page set each, so B5a and S1 split in two; phase 8 is fill and close (B5a1, B5a2, B5b, S1a, S1b). User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts` and its `translate-types.ts`, `translate-helpers.ts`, `translate-conditions.ts`, `translate-links.ts`, `translate-say.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles), [sentence linkers](/sentence-linkers), [polar inventory](/polar-inventory), [hooks](/hooks), [notional](/notional); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The page sentences the confirmed rows name (each written in the unit that builds its row).

## Design

Phase 1 built the faithful half: the **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused part to `left` with reason `unused` (a question with one answers `beyond`), and the sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part (`npm run sweep` prints the same walk's counts). Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`).

Phases 3 to 7 built the rows below; [solver.md](../../meta/solver.md#translation-table) owns each. What phase 8 builds on:

- **The conditional is a claim term.** A plain *if* / *only if* / *iff* claims `if(c(Id),o(Id))`, `onlyif(..)` or `iff(..)`; matching between conditionals is `Translation.conditionals` / `conditionalFits`. MAY wraps a side: `if(may(c),o)`, `if(c,may(o))`, or `may(if(..))` with a choice on the plain term (`Conditional.may` keeps a wrapped one from meeting a plain one). A hinge on a closed universal claims a template term plus a member term per stated member (`Conditional.id` = `"Id",M`), rows 5–7 run per member. A hinge in a holder's view claims `view(H, if(..))`.
- **Zones.** `against(T, Z)` with `Z` = `plan(H)`, `want(H)`, `decision(H)`, `channel(Gloss, H)` or a say word; `H` = `sp("…")` with no holder; a zone over a hinge puts `against` on the conditional.
- **Lists and channels** (solver.md rows 25–31). `ue` denies each item; SHARED details after a join go on each member or into each verb's term; a channel on your own claim is row 1 with the frame in `notes`, carried readings too; an evidence clause claims both, plus `grounds(E, C)`. A `val` / `vam` verb list claims each verb, a verb's own first-mention object `nm(Id, Rk)` (row 43); `wubam` pairs a verb list with the subject list (row 44).
- **The `fragment` reason.** `{ construction: "fragment", key: <join frame>, reason: "fragment" }`, helper `fragment()` in `translate-helpers.ts`: a verbless claim whose one role is a `z` list with a join frame other than `joinSeries:u`, and a verbless reading whose links reach nothing (a dangling stand-in such as `thohem blarl` or `ul barl`, a lone discourse hook such as `ul ul`, `zarx ar`). The fill job later reads verbless lists as replies to a fill question.
- **Links** (rows 33–42). `/x/` continue words, polar verdicts, no-verdict polar words, tags, and discourse hooks with `a`, `o`, `ao`, `ae`, `er` take the body's own rows plus notes; `Note.frame` may be a `LinkNote`; `talk()` / `talkRules()`. The reader's post-pass `pointBackLinks` (`read.ts`) gives `-rth` the latest content of its kind, `hookResume` a `to` and `Link.resumed`, and `el` / `em` / `ul` / `um` the previous sentence. A backward stand-in is `cl(..)` of its target; a resumed hook adds `dt("hookJob:extraNoun", form, L, w)`; `el` / `em` / `ur` drop the replaced reading's `on(Id)`; `ul` / `um` skip the excepted members (`X!=M`, in templates, the member pool and `everyHinges`), O-2 and O-3 in `translate-links.ts`. The pool keeps each claim as written; `byId` holds nested readings.
- **Witnesses.** A question's witness facts come from `Translation.witnesses`; a row that adds a first-mention witness fact records its lines there.
- **Holders and say words.** `sayRules()` emits the say rules; `zayan` is `we(..)`; `zawan` reads `LogEntry.addressees`. Reserved names include `if`, `onlyif`, `iff`, `we`, `every`, `because`, `want`, `decision`, `notional`. NOTIONAL is `view(notional, T)`, carried readings too, never `holds(T)` (row 45).
- **One pool of claims.** Every turn's plain claim is `holds(T)`, with no speaker; a per-speaker layer (`said(Speaker, T)`) waits for the group-views host policy.
- **Size.** `translate.ts` is about 1330 lines; past 1500 `lint-source-size` warns (no failure): split at the next clean point (such as `ranked()`), and put new code where it belongs (`translate-links.ts` for links, `translate-conditions.ts` for hinges, `translate-say.ts` for say words, wraps and holders), never into an unrelated file ([code layout](../../meta/code-layout.md#splitting-a-file)).
- **Fixtures.** Wiring: the paragraph by the Files line in [solver.md](../../meta/solver.md). `solve-links.txt` reads as one log, each verdict answering the entry before it. Drafts left: `draft-hinges.txt` (hg11, hg23: both left, on the edge), `draft-fill.txt` (B5a1, B5a2), `draft-because.txt` (bc36, tag `zwar`, left). Use the inline `blarl …` form of a hinge condition. A draft verdict "→ no" that only means *does not follow* is tested as `unknown`; a draft "couldBe yes" on a claim nothing states is `unknown` too.
- **Probing.** `probe --program` prints the case's own lines; `--case N`, `--terms a,b`, `--program=full`. `npm run sweep -- --save`, then `--diff`, and `--texts KEY` for the examples behind a key; `npm run class-row -- KEY`.

After phase 7 `npm run sweep` counts 106 unused parts: slot:adj 34, shared:scale 28, shared:distribute 15, edge:hook 8 (one-sentence doc examples with nothing before the hook), lexReading:number 5, 2 each for anaphor:content, edge:polar, hookJob:resume, overlay:likeness:g and unit:h, and 1 each for hookJob:extraNoun, lexReading:sake:g, lexReading:standIn, overlay:clause_hinge:th, shared:equative, shared:kind. Nobody has triaged `slot:adj`.

## Decided

User, 2026-11-19 (D7–D10) and 2026-11-20 (D21, D22), each as recommended. Every decision but D10 is built and lives in [solver.md](../../meta/solver.md#translation-table); the numbers are kept.

10. **The fill job.** Cautious answers by default, brave with `--possible`; one `zar` with several fillers lists them all; no filler is *unknown* unless `closedWorld` gives *nobody*; `…er` is an existence yes or no; `gar` answers from `isa` only until named details are encoded; *why* binds `C` from `cause(C, Out)` only, not a met *if*. When, where, whose and how wait for detail-term rows.

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)); phases 1 to 7 are done; phase 8 (B5a1, B5a2, B5b, S1a, S1b) remains. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`. Briefs carry only the [Design](#design) bullets a unit builds on, not the whole section.

**Every build unit** adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases; moves its rows' `draft-*.txt` cases into the `solve-*.txt` of the same area, or `git mv`s a draft to a new `solve-*.txt` when no file fits, and deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`); adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge; and writes each page sentence its rows name on that page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; S1a / S1b review it). Its brief quotes its rows, the settled decisions they use and its rows' findings, from [Confirmed rows](#confirmed-rows). Its report gives the sweep's `unused` count by part key.

**Every build unit may edit:** `src/interpret/translate.ts` and `translate-{types,helpers,conditions,links,say}.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages its rows' page sentences name. A unit's own **May edit:** line adds to this.

### Carried into phase 8

- **S1b:** besides the listed sections, the R4b-4 sentence in `because-and-iff.md#choosing-a-hinge` says "holder", which that band teaches later, with no link.
- **For the edge at the end** (no row; fold into [solver.md](../../meta/solver.md#the-edge) when the proposal closes, beside [Outside this proposal](#outside-this-proposal)):
  - a question asked as said over a data wrap (answers unknown); `zul` / `zuam` under a leading say word; `awanx` (`LogEntry.addressees` holds only the turn's own calls, while `collectives.md#addressing-several-people` adds anyone already addressed)
  - zones: a say-word zone with a universal, restrictor or hinge; `zuam` / `zul` with a zone; `huam` or listed exceptions with a zone; *only if* under a zone; a denied hinge with a zone; the fragment `uom hwudum` (`say-reasons.md`)
  - MAY: `huam` under MAY; `hal` / `huam` over MAY; listed exceptions with MAY over a restrictor; open `zuam` and *no K* with no verb under MAY; MAY with a say word, universal or restrictor beside another frame; a carried holder with MAY beside a hinge; row 6's forward rule on a MAY condition reads `holds(neg(may(P)))`, which nothing produces
  - universals: with MAY on the condition, a universal hinge's *only if* half has no back rule; hg23 (a denied universal hinge); bc36 (tag `zwar`, `slot:tag`)
  - rank: an open tie with a factor (`zoem`); a factor on a tie of three or with a verb; `zaol` with one name or a verb; any frame on a rank shape other than R1-8; `zuol` (a superlative or place from the bottom, `noRow joinSeries:uo`); a place with a verb; *is Ahelan the third biggest?* after *Ahelan is the biggest* answers unknown (no row denies a place from `most`; the two claims clash)
  - lists: the likeness term drops its `bl-` model (`zazozon gewem blalazun.` gives `isa(azozo, ewe)`), so with three or more members the pairs pool into one term; a `zam` list brings in no new member (`zodozel zogozel zam gegunum blazozon.`); named members with a `bl-` likeness model (`zazozon zalazun zal gewem blagayul guzemel.`); a SHARED number word and `dar` with a resume (`zazozon zalazun zal growamol.`, `zalazun dar godozer gubulel vayebel.`); `theyomazozon thrawal` (holder + certainty, `noRow frameCombination`); `el bual gohahal` (`unused shared:kind`)
  - links: a polar verdict on a reading with frames, a list, a blank, a clause or a quote (`edge:polar`); `xahom` between claims with frames or lists is a note only; a hinge inside a *tell* dependent (`… darl zalazun vowurol thahum blarl …`)
  - links: the period form of a hinge condition (`thohem blarl. zalazun vezuyol.`, a forward stand-in, `noRow overlay:clause_hinge:th`); a `blarth` condition pointing to a denied sentence (no hinge row takes a denied condition); `edge:hook` on a one-sentence example with nothing before the hook
  - hg11: a stance list denying a channel beside a hinge (`thanam thohem thul blarl …`): no channel row (solver.md rows 25–31) says what denying DEDUCED adds; left `noRow joinSeries:u`
  - `zazozon guzemel vul.` reads `vul` as the verb *no*, not a denial of the adjective claim (B3c); check how the grammar denies an adjective predication before calling it a reader bug

- **Not planned, for the user:** the `% id = label` header in the `solve-*.lp` goldens (`translate.test.ts`) pairs readings with fixture entries by index, so after a turn with several readings most labels in `solve-links.lp` are wrong or `undefined` (found in B6c1; it predates this proposal).

### Phase 8: fill, style, close

**B5a1 The fill job.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-9 to R4c-11 (D10): `fill(log, question, options)` in `solve.ts` with the cautious and `possible` modes and `closedWorld`; the open blank, the listed blank, `zarx` and fill-all; `…er` existence. `solve.test.ts` cases from `draft-fill.txt` (f1–f3, f6–f8, f10), and the Jobs section of [solver.md](../../meta/solver.md#jobs). Its report gives `fill`'s signature, result shape and where a new filler source plugs in, which B5a2 and B5b are briefed from.

**B5a2 What kind, why, and the open fill shapes.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-12 (`gar` from `isa`), R4c-13 (*why* from `cause` only; when, where, whose and how answer `beyond`), R4c decision 7 (`…ur` / `…or` and a blank inside `derl` / `darl` answer `beyond` for now). Cases f4, f5, f9 and the rest of `draft-fill.txt`; `git rm` the emptied draft. The Jobs section gains these rows.

**B5b Fill wiring.**  
`proposal-worker`, `model: opus`, effort `medium`.  
Export `fill` from `solve-browser.ts` and `browser.ts`; `reading.mjs solve` and `probe` dispatch a `fillAsk` question to it; the reply through `reply.ts`; the CLI section of [solver.md](../../meta/solver.md#cli).  
**May edit:** `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/reply.ts`, `src/interpret/probe.ts`, `src/interpret/cli.ts`, their tests, `docs/meta/solver.md` (Jobs and CLI sections).

**S1a, S1b Style gate.**  
`style-editor`, `model: opus`, effort `high`.  
The sections that hold this proposal's own grammar edits, with the section after each (its lead may lean on it). `npm run changed-sections -- 9e38c73d` also lists other proposals' edits since then (202 lines on 2026-11-21), so the orchestrator lists the pages from `git log --grep='^solver-coverage' --name-only -- docs/grammar` and keeps only the sections those commits' hunks touch. S1a takes the beginner pages, S1b the intermediate pages and the recipe page `say-people-places.md` (about 15 pages in all after phase 6; phases 7 and 8 add their own). A band still over about eight pages splits again.  
**May edit:** the listed sections.

**Order:** B5a1, B5a2, B5b, S1a, S1b. Before each B5a unit the orchestrator runs its draft cases through one `probe` file and appends the result to the brief. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

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
- Tools, not hand-made scripts: npm run sweep [-- --save | --diff] (left readings by reason and
  key, unused by part key, throws; --save at the start, --diff after a change; --texts KEY ...
  lists the example texts behind a reason or key); npm run class-row
  -- KEY ... (a part key's classification-table rows with line and notes). Fixture wiring:
  solver.md, the paragraph by the Files line.
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
- Final gate, at the end of phase 8: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line; phase 8 makes five unit commits and a last one deleting this proposal.

## Confirmed rows

Drafted in phase 2 (units R4a to R4e) and confirmed by the user, 2026-11-19; the rows phases 3 to 7 built are gone from here and live in [solver.md](../../meta/solver.md#translation-table). Each row's **Fixtures** are in `src/interpret/fixtures/draft-*.txt` (`draft-fill`), with the verdict the row should give and the verdict before the build. [Settled decisions](#settled-decisions), at the end, are part of the rows they name; each unit's findings feed the unit that builds its rows ([Implementation plan](#implementation-plan) names it).

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

### Settled decisions
<a id="settled-decisions"></a>

The user adopted every recommendation below, 2026-11-19.

#### R4c decisions

7. **`…ur` and `…or` fill questions, and a blank inside `derl` / `darl`.** D10 does not cover them. Options: `…ur` excludes the listed items and items already named in the turn; `…or` fills from `most` / `more`; a `darl` blank fills through `say` / `view`; or `beyond` until decided. **Recommendation:** **(medium)** `beyond` for now, then `…ur` as the listed-blank complement, which the arity table states ("*Other than these?*").

## Open decisions

Logged in phases 5 and 7. None blocks phase 8.

1. **A genitive on one noun and on a joined list** (B4b). The reader puts `om bahelan` on the clause after a single noun (`yel zogozel om bahelan vowurol.`) but on each member after a join (`zodozel zogozel zal om bahelan vowurol.`), so the question never fits the log and answers unknown; the fixture asks `yel zogozel vowurol.` instead. Options: (a) the matcher treats a clause-level genitive as a detail of the `z` noun; (b) accept the gap and list it on the edge. **Recommendation:** **(medium)** (a): a learner who says *Ahelan's dog and cat walk* expects *does Ahelan's cat walk?* to answer yes, and the program already writes the detail on each member.
2. **A ratio asked the other way round** (B4c). `zazozon zalazun zoel gelazem hradol.` (*twice as big*) and `zalazun zazozon zoel gelazem hrudol.` (*half as big*) encode the same `ratio` atom, but a question in one wording against a log in the other answers unknown, since `match()` compares the members in order and the factor. Options: (a) accept it; (b) pool the inverse claim as a second fitting claim. **Recommendation:** **(medium)** (b): a learner who hears *twice as big* expects *is Alazun half as big?* to answer yes, and the atom is already shared, so only matching changes. B4c leaned (a), with no reason given beyond scope.
3. **`yuor`** (B6a). O-4 names only `yaor`; B6a read it as a rule about the `-r` ending and built `yuor` the same way (the denial, held for now). Options: (a) keep it; (b) `yuor` claims nothing. **Recommendation:** **(medium)** (a): `-r` carries *for now* on both verdicts, and the polar grid stays regular.
4. **One holder for every supposition** (B6c2, 2026-11-21; blocking, since it changes the term the user settled in O-6). Row 45 writes every NOTIONAL reading as `view(notional, T)`, so two separate suppositions in one log share one view and can clash with each other. Options: (a) keep it, as O-6 reads; (b) each stated NOTIONAL gets its own holder, such as `notional(Id)`, which the sentences it carries to inherit. **Recommendation:** **(medium)** (b): two unrelated imagined scenes should not clash with each other.

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
