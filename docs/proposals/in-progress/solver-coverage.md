# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-19: phases 1 and 2 done; phase 3 done (FX, B0, B1a, B1b, B2a, P1): the conditional is a claim term, holders, say words and the turn's addressees, *because*; P1 rewrote the *dependent on* and *independent* recipe rows in `say-people-places.md` with Alazun's support (`agobo`) as a `blarl` clause. Recall gate after phase 3: passed (baseline check). Next is phase 4 (B2b, B3a, B3b, B3c, B4a, and P2, added from a P1 finding); one open decision waits on the user ([Open decisions](#open-decisions)). User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer; each later phase is sized to phase 2's spend. The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles), [sentence linkers](/sentence-linkers), [polar inventory](/polar-inventory), [hooks](/hooks), [notional](/notional); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The page sentences the confirmed rows name (each written in the unit that builds its row). The `hinge` × `contrary` pair-table sample and gloss in `interpreter.md` (D14, R4e decision 3). The recipe rows *dependent on* and *independent* in `say-people-places.md` (D15).

## Design

Phase 1 built the faithful half: the **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused part to `left` with reason `unused` (a question with one answers `beyond`), and the sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part. Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`).

Phase 3 built the conditional, holders, say words and *because*. What later units build on:

- **The conditional is a claim term.** Each plain *if* / *only if* / *iff* reading claims `if(c(Id),o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), and rows 5–7 take the term in their bodies; matching between conditionals is `Translation.conditionals` / `Translation.conditionalFits`. A hinge on a universal, or with MAY anywhere, still keeps the old rules and gets no term (B3b, B3c). A hinge in a holder's view claims `view(H, if(..))`; a denied conditional inside a view, under MAY, or beside *because* is still left.
- **Witnesses.** A question's witness facts come from `Translation.witnesses` (FX); a row that adds a first-mention witness fact records its lines there.
- **Holders and say words.** `sayRules()` in `translate.ts` emits the say clash / requires / bans rules (view-wrapped copies only when a reading holds a say word in a view). `zayan` is `we(..)`; `zawan` reads `LogEntry.addressees`; a reading that is only a call writes just `on(Id).`. Reserved names now include `if`, `onlyif`, `iff`, `we`, `every`, `because`.
- **One pool of claims.** Every turn's plain claim is `holds(T)`, with no speaker; a per-speaker layer (`said(Speaker, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) will be its first users.
- **Fixtures.** `solve-holders.txt`, `solve-because.txt`, `solve-hinges.txt`, `solve-say.txt` (new). Use the inline `blarl …` form of a hinge condition: the period form (`thohem blarl. zalazun vezuyol.`, the `grounds` link) is left by every hinge row. A draft verdict "→ no" that only means *does not follow* is tested as `unknown`; the draft files mean *no* only where the denial is derivable.

After phase 3 the sweep leaves 2516 example readings: 397 `unused` (unit:linker 83, edge:polar 55, shared:scale 48, slot:tag 44, edge:hook 43, shared:equative 31, lexReading:standIn 22, shared:distribute 20, hookJob:resume 17, others 34), the rest `noRow`.

## Decided

User, 2026-11-19, each as recommended; D13 as the user stated it. D1–D3, D11, D12, D15 and D16 are built (phase 3) and live in [solver.md](../../meta/solver.md#translation-table); the numbers of the rest are kept.

4. **`uom` before a fence** takes the same per-member rule as the fence first: `against(T[X], Z)`.
5. **Only-if and iff with MAY.** On the condition, R3-5 (`may(T)` in the body). Under the hinge, no backward rule, as R3-1 row 6 for *if*.
6. **A carried holder on a MAY sentence** is the holder's own MAY, `view(H, may(T))` (holder table: MAY is the holder's). **A MAY question** runs as `couldBe`, whatever job is called.
7. **`ue`** denies each listed item (the classification row: "as `u`"). The outside item that holds adds no rule, as open `aem` adds none.
8. **Channel stances on your own claim** (`thebam`, `th_N`, `th#N`, `th@+95`, `th-e-`) take row 1, with the frame in `notes`, like row 16 (`evidentiality.md#evidentiality`: "the listener always knows what your claim rests on"). Not R3-7's estimate row: these name sources, not likelihoods.
9. **Two denial lists in one clause** deny the joint substitution, `neg(T[a][b])`.
10. **The fill job.** Cautious answers by default, brave with `--possible`; one `zar` with several fillers lists them all; no filler is *unknown* unless `closedWorld` gives *nobody*; `…er` is an existence yes or no; `gar` answers from `isa` only until named details are encoded; *why* binds `C` from `cause(C, Out)` only, not a met *if*. When, where, whose and how wait for detail-term rows.

13. ***Always* over MAY** (`hual zazozon vowurol thomam.`) gives `holds(may(T))` and the marker `always(may(T))`, and clashes with *never* (`never(T)`, row 15). It does not clash with a plain denial (R3-2).
14. **Contrary-to with a hinge.** The `hinge` × `contrary` pair row's second sample changes to the `blarth` form, so its two samples follow its own text-order rule (check `contrary-to.md` first). A hinge over a zone puts `against` on the outcome (a copy row); a zone over a hinge is data, since the encoding has no term for a conditional.
17. **`oe` ties.** A tie claims no member has the quality (`comparatives.md#equatives` keeps *both are challenging* apart as an *and* list). Closed `zoel` clashes with `zol` on the same scale; `zoem` is data only; with a verb, each member's act holds; three or more are all tied, pairwise.

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)); phases 1 to 3 are done, two phases remain. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

**Budget** (user, 2026-11-19): each phase spends about what phase 2 did, five drafting units of about 40 tool calls and 110k–140k subagent tokens each. A build unit costs more per row than a drafting unit (code, goldens, tests, page sentences), so each build unit takes about four to eight rows, and each phase five or six units, the lighter units (FX, P1, S1) filling the sixth place.

**Every build unit** adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases; moves its rows' `draft-*.txt` cases into the `solve-*.txt` of the same area (`solve-holders.txt`, `solve-because.txt`, `solve-say.txt`, `solve-maybe.txt`, `solve-lists.txt`, `solve-hinges.txt`), or `git mv`s a draft to a new `solve-*.txt` when no file fits, and deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`); adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge; and writes each page sentence its rows name on that page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; S1 reviews it). Its brief quotes its rows, the settled decisions they use and its rows' findings, from [Confirmed rows](#confirmed-rows). Its report gives the sweep's `unused` count by part key.

**Every build unit may edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages its rows' page sentences name. A unit's own **May edit:** line adds to this.

### Carried from phase 3

- **B2b:** the `uom` reader gap (R4b findings) is still open. A plan zone paired with the holder's own plan has no fixture: PLAN with a holder has no row (`zazozon vowurol theyomalazun thagom.` left `overlay:plan:th`).
- **B3b:** R4b-7 accepted a hinge's hosted *or* list with `parts: []` (the reader gives none) as an *or* list when it has at most one part; R4b-4 covers a framed condition only on a plain *because*; a restrictor beside a holder, MAY or `thebem` over *because* stays left. A noun hinge with a carried holder is left `unused`.
- **B6a:** k14 (`draft-holders.txt`, a topic-pronoun holder) is left only for `unit:linker`; R4d-1 clears it. `draft-because.txt` holds bc22 and later (B2b, B3a, B3b, B3c).
- **B6b:** the period form of a hinge condition (`thohem blarl. zalazun vezuyol.`, `slot:grounds`) is left by every hinge row; decide whether R4d-8's stand-in row covers it, or report it for the edge.
- **No row, for the edge at the end:** a question asked as said over a data wrap (answers unknown); `zul` / `zuam` under a leading say word (left); `awanx` (`LogEntry.addressees` holds only the turn's own calls, while `collectives.md#addressing-several-people` adds anyone already addressed).
- **B3b, also:** a stance join that denies a *because* link is misread or left. `zazozon vowurol vul thahum blanurul.` reads as *does not walk, because of the night*, while `review-intermediate.md` (item 16) and the `verb-and-stance-joins.md` checkpoint give it as *walks, but not because of the night*; the `thul` form after the hinge (`… thahum blanurul thul.`, and P1's `thebem blarl … thul` recipe rows) is left `noRow overlay:clause_hinge:th`. The pages own the reading: both forms deny only the link, as R4e-3 does for *if*.
- **P2:** the `verb-and-stance-joins.md` checkpoint item *Azozon runs, but not because of Alazun.* (`… thahum blalazun thul.` / `… vul thahum blalazun.`) puts a person after a because hinge, which `because-and-iff.md#choosing-a-hinge` forbids; `src/interpret/read.test.ts` still parses `zazozon gebem gahum blalazun.` (structure only, harmless).
- **S1:** besides the changed-sections list, the R4b-4 sentence in `because-and-iff.md#choosing-a-hinge` says "holder", which that band teaches later, with no link.

### Phase 4: contrary-to, MAY, universals, rank

**B2b Contrary-to.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-9 to R4b-15 and R4a-6; R4b decision 3 (`uom thalom` / `uom thogem` zones) and R4e decision 3 (a zone over a hinge marks the link, replacing R4b-15's `zone(Id, Z)` fact). First fix the reader gap: a holder after `uom` leaves `noRow hookJob:zone` (`readHook` in `read.ts`; after `uom` the zone reads `contrary.inner = [holder{inner: [stance (member: "channel", holderHost)]}, intention?]`). The `hinge` × `contrary` pair row in `interpreter.md`: its second sample becomes the `blarth` form (D14, check `contrary-to.md` first) and its gloss *(the link goes against the plan)*.  
**May edit:** as every build unit, plus `src/interpret/read.ts` (`readHook` zone only) and `docs/meta/interpreter.md` (the `hinge` × `contrary` row only).

**B3a MAY over a clause.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-18 to R4b-24: MAY over members, whole-list denials, say words, universals and `always` (D13), *always* over MAY, `vaem vul`.

**B3b MAY with hinges, holders and questions.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-25 to R4b-28 and R4e-6; R4b decision 1 (the *only if* half of a hinge over MAY is plain). D5, D6. Also the stance join that denies a *because* link ([carried from phase 3](#carried-from-phase-3)).

**B3c Hinges on universals.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-16 and R4b-17 with R4e decision 2 (c): one template term plus a member conditional for each stated member, the per-member rules gated on it; the edge line changes as R4b-16 says. A denial of a universal's conditional (hg23) stays left.

**B4a Rank and ties.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-1 and R4c-2 (D17); R4c decisions 1 to 4 (reversed rank clashes, rank with a verb, rank of three or more, a tie with a factor as `ratio(..)`).

**P2 A person after a *because* hinge.**  
`checkpoint-writer`, `model: opus`, effort `high`.  
Rewrite the `verb-and-stance-joins.md` checkpoint item *Azozon runs, but not because of Alazun.* so that what follows the hinge names an act or a thing about Alazun, not Alazun (`because-and-iff.md#choosing-a-hinge`; P1 used Alazun's support, `agobo`, in a `blarl` clause). Keep both answer forms (the `thul` join and `vul`) if the rewrite allows. Read `docs/meta/procedures/drill-generation.md` first.  
**May edit:** that checkpoint item, and the drill allowlist if the procedure asks.

**Order:** B2b, B3a, B3b, B3c, B4a, P2.

### Phase 5: lists, links, fill; style

**B4b Lists and stance numbers.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-3 to R4c-8 (D7, D8, D9; SHARED details after a join; likeness; collective `-x`); R4c decisions 5 (verbless lists left with reason `fragment`), 6 (the evidence clause claimed, with `grounds(E, C)`) and 8 (a SHARED number word stays left). Also fix the throw: `translate()` crashes on `zazozon dugavalx grodol oel growal vayebel.` (`open-ranges.md`) in `inRange` / `compareValues`; then make the sweep in `accounting.test.ts` fail on a throw instead of skipping it.

**B6a Links that add no term.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d-1 to R4d-5; R4d decisions O-1 (only `xahom` adds `cause(Prior, Next)`), O-4 (`yaor` claims, *for now* in notes) and O-5 (taking up an option is a note). The `unit:linker` row in the classification table gets a note that topic words and agenda numbers share the key.  
**May edit:** as every build unit, plus `docs/meta/interpreter.md` (the `unit:linker` row only).

**B6b Links that point back.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d-6 to R4d-8; R4d decisions O-2 (*instead* drops the replaced reading) and O-3 (*except* narrows the general claim; the page sentence goes on `hooks.md`). First the reader gaps: `hookJob:resume` gets its `to` and landmark; `standInBack` takes the latest content of its kind (`durth`, `derth`, `dorth`), not always the previous sentence; `el`, `em`, `ul`, `um` hooks get a `to`. Table fragments with nothing after a stand-in (`herom blarl`, `ul barl`) take reason `fragment` (B4b's).  
**May edit:** as every build unit, plus `src/interpret/read.ts` (those hook and stand-in fields only).

**B6c Joined verbs and NOTIONAL.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4d-9 and R4d-10 (a `val` verb list claims each verb; *respectively*), with the verb list counted as an accounting part; R4d decision O-6 (NOTIONAL is a wrap, `view(notional, T)`, carried readings too, never `holds(T)`). R4e finding 5 (`thanam thohem thul blarl`, hg11) builds here if B4b's channel row says what denying DEDUCED adds.

**B5 The fill job.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-9 to R4c-13 (D10) and R4c decision 7 (`…ur` / `…or` answer `beyond` for now): `fill(log, question, options)` in `solve.ts`, exported from `solve-browser.ts` and `browser.ts`; `reading.mjs solve` and `probe` dispatch a `fillAsk` question to it; the reply through `reply.ts`; the Jobs and CLI sections of [solver.md](../../meta/solver.md#jobs).  
**May edit:** as every build unit, plus `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/reply.ts`, `src/interpret/probe.ts`, `src/interpret/cli.ts`.

**S1 Style gate.**  
`style-editor`, `model: opus`, effort `high`.  
The `npm run changed-sections -- <rev>` list, where `<rev>` is `9e38c73d`, the commit before F1's.  
**May edit:** the listed sections.

**Order:** B4b, B6a, B6b, B6c, B5, S1. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

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
- Final gate, at the end of phase 5: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line; one consolidation commit at the end of phases 3 and 4. About 19 commits in all, the last deleting this proposal.

## Confirmed rows

Drafted in phase 2 (units R4a to R4e) and confirmed by the user, 2026-11-19: every row as drafted, except R4b-15's zone over a hinge (the `zone(Id, Z)` fact), which R4e decision 3 replaces. Each row's **Fixtures** are in `src/interpret/fixtures/draft-*.txt` (`draft-holders`, `-because`, `-maybe`, `-lists`, `-fill`, `-links`, `-hinges`), with the verdict the row should give and the verdict before the build. [Settled decisions](#settled-decisions), at the end, are part of the rows they name; each unit's findings feed the unit that builds its rows ([Implementation plan](#implementation-plan) names it).

### Outside this proposal

Left groups the drafts met that are host policies or other subsystems: CAUSE `thewom` before a hinge, `/h/` hinges, sake words with MAY, `stimulus:g`, nested hinges.

### R4a: holders, say words, the turn's addressees

Fixtures: `src/interpret/fixtures/draft-holders.txt` (entries `k1`–`k52`; `k20` dropped). Probe files in the scratchpad: `r4a-probe.txt`, `r4a-probe2.txt`, `r4a-probe3.txt`. "Now" verdicts are from one probe run on 2026-11-19 at commit 0184a2d8.

#### R4a-6: holder or channel after `uom`
- **Kind:** copy (row 14's zone terms, now that the reader gives the zone's holder a party)
- **Covers:** Holders, after-`uom` holders; `noRow hookJob:zone` (`zazozon vowurol uom theyomalazun thagom.`, `zazozon vowurol uom thebamalazun.`, `zamozal dobedol vagedal uom thebamahelan.`, `zamozal vagedal uom theyomahelan thagom.`; probe `holders-21`, `-22`, `-24`, `-25`). Also the channel zone with no holder (`uom thebam`), unbuilt for the same reason.
- **Concludes:** row 14: `holds(T) :- on(Id).` and `holds(against(T, Z)) :- on(Id).` with `Z` = `plan(H)` (holder + PLAN; no holder, `plan(sp("…"))` as now) or `channel(Gloss, H)` (holder on a channel; no holder, `H` = the turn speaker `sp("…")`). Marker only, never a clash. `H` from `holder()` (R4a-4, R4a-5 for a topic or listener holder). Marks the zone frame, the holder frame and its host used. The `want` host after `uom` (`uom theyomazozon thalom`) stays out: row 14 lists no `want(..)` zone.
- **Classification:** `hookJob:zone` (frame:contrary): no new row; its text already names the holder word after `uom` (`contrary-to.md#contrary-to-holder`).
- **Anchor:** `contrary-to.md#contrary-to-holder`: "A plan or a channel after `uom` is yours, unless a holder word names someone else's" and "A holder on a channel after `uom` names whose view the event goes against. The holder covers only that pair: the event is still your claim."
- **Fixtures:** k17, k18, k19 each, `? zazozon vowurol.` → yes (now: unknown, each left `hookJob:zone`).

#### R4a findings

- **Other holder hosts stay out.** Most `holder` readings in `left.tsv` are blocked by PLAN, WANT, decision, sake, mirative, NOTIONAL, a second channel or `edge:force` (`holders-2` … `holders-70`), not by the holder; they belong to those areas' rows.
- **Carry-forward in fixtures.** A bare sentence after a holder sentence is the holder's view (`carry:holder`), so every "your claim" entry is placed before the holder entry.

### R4b: because, contrary-to, MAY, hinges on universals

Fixtures: `src/interpret/fixtures/draft-because.txt` (`bc1`–`bc40`), `src/interpret/fixtures/draft-maybe.txt` (`my1`–`my18`). Probe file: scratchpad `r4b-probe.txt` (labels match the fixture ids). "Now" verdicts are from one probe run on 2026-11-19 at commit 0184a2d8. Row numbers below are solver.md's translation table (1–17) and its *Holders*, *Because* and *MAY* lists (Holders 1–9, Because 10–14, MAY 15–21).

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


### R4e: a term for the conditional

Added by the user, 2026-11-19, from R4b's open decision 2. Fixtures: `src/interpret/fixtures/draft-hinges.txt` (hg1 to hg23). R4b-1's `/ɡ/` outcome follows R4e-7 (the settled existence outcome), not a bare kind.

#### R4e-6: MAY with a hinge
- **Kind:** copy (rows 15, 17, 18) and decision D5 (R4b-25, R4b-26)
- **Covers:** rows 17 and 18 as built, now with the term; D5's only-if and iff rows.
- **Concludes:** MAY over a hinge is row 15 on the term: `{ holds(if(c(Id),o(Id))) } :- on(Id).` and `holds(may(if(c(Id),o(Id)))) :- on(Id).`; the `maybe(Id)` gate goes for hinges (it stays for *or* lists), since the rules already wait on the term. A hinge over MAY is `if(c(Id), may(o(Id)))`, held plainly, with row 17's choice `{ holds(Out) } :- holds(if(c(Id),may(o(Id)))), fits(c(Id),P), holds(P).` and no back rule. MAY on the condition is `if(may(c(Id)), o(Id))` with row 18's body. D5: `onlyif` / `iff` take the same wrappers (R4b-25 condition, R4b-26 outcome). The wrappers keep "if A, maybe B" from meeting "if A, B" (R4e-2 (2)).
- **Classification:** no new row.
- **Anchor:** `causation.md#if`: "To make the outcome only a guess …, put MAY first … you claim neither the walking nor the sitting, only that the sitting could follow from the walking"; "MAY inside the condition makes the condition a chance".
- **Fixtures:** hg16 + hg2 `? zalazun vehohel.` → unknown, `?~` → yes (now: the same, through the gate); hg16 + hg8: no clash in some world (now: hg8 left).

#### R4e findings

5. **`thanam thohem thul blarl`** puts both `thanam` and `thohem` in the stance list the `u` join closes; R4e-3 needs D8's channel-on-your-claim row (R4c) to say what denying DEDUCED adds before hg11 can build.

Finding 3 stands as built: rules per reading, the term in each body; pick a generic `holds(O) :- holds(if(S)), …` form only if a consumer must derive a conditional from another rule.

### Settled decisions
<a id="settled-decisions"></a>

The user adopted every recommendation below, 2026-11-19, with these notes:
- **R4c 6:** (a), with the page's wording raising it to high (`evidentiality.md#evidence-clause`: "You state the claim, the strength of your grounds, and the grounds themselves"). `grounds(E, C)` stays apart from `cause`.
- **R4e 3:** (b), medium: the zone before a hinge covers the whole link, `holds(against(if(c(Id),o(Id)), Z)) :- on(Id).`, a marker with no clash; the page sentence goes on `contrary-to.md`, and the `hinge` × `contrary` pair-table gloss becomes *(the link goes against the plan)*. Every R4e recommendation is adopted; decisions 1 and 4 are built (phase 3).
- **R4d O-4:** (a). `yaor` claims in the shared pool, with *for now* and the speaker in the notes. The pool has no per-speaker claims; a per-speaker layer (`said(Speaker, T)`, with `holds(T) :- said(_, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) are its first users.

#### R4b decisions

1. **The *only if* half of a hinge over MAY** (`zalazun vezuvel vul. thebem blarth thomam zazozon vowurol.`: without the sleeping, could Azozon walk?). Options: (a) plain, `holds(neg(Out)) :- fits(P, c(Id)), holds(neg(P))`: without the condition the outcome is not even possible; (b) a choice, as row 17's *if*; (c) no rule. **Recommendation:** **(medium)** (a): *only then may Azozon walk* rules the walking out without the condition, and (b) would let a learner's *no* answer read as *maybe*. Settled by the user reading the English.
3. **Zones `uom thalom` (want) and `uom thogem` (decision)** (`zazozon vowurol uom thalom.`, 15 sweep readings with `intention:overlay:want:th` / `:decision:th`): row 14 lists only plan, channel and say. Options: (a) `Z` = `want(H)` / `decision(H)`, marker only, as `plan(H)`; (b) leave them. **Recommendation:** **(high)** (a): `contrary-to.md#contrary-to-stance` lets any intention adverb follow `uom`, the same shape as plan.

#### R4c decisions

1. **Reversed rank.** `zazozon zalazun zol gamahum. zalazun zazozon zol gamahum.` gives no clash now (probe L1r). Options: (a) `clash(more(S, B, A)) :- holds(more(S, A, B)), holds(more(S, B, A)).`; (b) data only. **Recommendation:** **(high)** (a): `comparatives.md#comparatives` says "The first name sits higher on that quality than the second", and D17 already treats rank as strict when it clashes with a tie.
2. **Rank with a verb.** `zazozon zahelan zol hahunom velunel.` (`unused shared:scale`): does each member's act hold? Options: (a) as D17 for ties, each member's act holds plus `more(S, A, B)`; (b) only `more`. **Recommendation:** **(medium)** (a): *runs faster than* is said of two runners, and it keeps `o` and `oe` alike; settled by a sentence on `comparatives.md` about `/h/` scales.
3. **Rank of three or more** (`zazozon zalazun zahelan zol gamahum`, also `zaol`, `zom`, and `zol … zul`): Options: (a) `more(S, Xi, Xj)` for each i < j in text order; (b) only first over the rest. **Recommendation:** **(medium)** (a) for `zol`; `zaol` (sorted low to high, `list-structure.md#shared-after-the-join`) reversed; `zom` and a denied rank wait. Settled by `rank-joins.md`'s wording for three items.
4. **A tie with a factor** (`zazozon zalazun zoel gelazem hradol.`, `zogozelx zodozelx zoel gral`): a factor makes it not a tie. Options: (a) data `ratio(S, A, B, V)`, no tie, no clash; (b) leave left. **Recommendation:** **(medium)** (a), since the page reads it as *N times as*; D17 does not cover it.
5. **Verbless lists** (`zobudal zuel.`, `zobonol zabewol zen.`, `zugowal zagorol zomobul zer.`, `zahelan der vagedal.` has a verb but `…er` with no items): no claim term. Options: (a) a fragment stays left with its own reason (`fragment`), later read as a reply to a fill question; (b) existence (`isa`) per item. **Recommendation:** **(medium)** (a): the pages give these as offers and names, not claims (`rank-joins.md`: "The invert `ue` offers a free choice outside the list"). Statement `…er` (*eats anything*) needs its own decision: likely an open universal (row 10), low.
6. **Evidence clause** (`zalazun vabuvul theyom blarl zazozon vozumul.`, lists-31, lists-33; standalone `theyom blarl`, lists-19 to lists-21): is the grounds sentence also your claim, and what joins them? Options: (a) both row 1, plus data `grounds(E, C)`; (b) only the claim. **Recommendation:** **(low)** (a); settled by the wording of `evidentiality.md#evidence-clause`, not read in this unit.
7. **`…ur` and `…or` fill questions, and a blank inside `derl` / `darl`.** D10 does not cover them. Options: `…ur` excludes the listed items and items already named in the turn; `…or` fills from `most` / `more`; a `darl` blank fills through `say` / `view`; or `beyond` until decided. **Recommendation:** **(medium)** `beyond` for now, then `…ur` as the listed-blank complement, which the arity table states ("*Other than these?*").
8. **SHARED number word and `dar` with a resume** (`zazozon zalazun zal growamol.`, `zogozelx zodozelx zal gral`, `zalazun dar godozer gubulel vayebel.`): what a SHARED number says of each member is not stated in this unit's anchors. **Recommendation:** **(low)** leave left; settled by `generations.md` and `resume-sense.md`.

#### R4d decisions

**O-1: does a sentence linker add a term?** `zazozon vowurol. xahom zalazun veruvol.` (*therefore*). The page gives each linker a gloss only ("*therefore* moves forward from the prior claim"; `xahol` "the next claim must hold if the last sentence does"; `xugohul` "the last claim is blocked outright"). Options: (a) notes only for all nine (R4d-1 as drafted); (b) `xahom` adds row 10's `holds(cause(Prior, Next))`, so *why does Alazun run?* cites the walk and *not because* (row 11) can clash with it; `xahol` adds the rule `holds(Next) :- holds(Prior), on(Id).`; contrast and sequence linkers notes only; (c) `xugohul` also denies the prior claim. **Recommendation:** **(medium)** (b) for `xahom` only, (a) for the rest: English *therefore* states a reason and the learner would expect *why?* to find it; a deduction's conclusion is already claimed, so `xahol`'s rule adds nothing a job reads. Reject (c): the page's own example keeps the denied *sleeping* true. Settled by a page sentence on `sentence-linkers.md#sentence-linkers` saying *therefore* gives a reason as *because* does.

**O-2: does *instead* / *never mind* withdraw the last claim?** `zalazun veruvol. el zalazun vezuvel.`; `ur` (*drop the last point*) and `em` the same. Page: "`el …` | this claim replaces the last one". Options: (a) the replaced reading leaves the program (the job's `on` fact off), with a note; (b) keep both and add a one-way attack in `stands`, `att(Id, Last)`; (c) notes only, both claimed. **Recommendation:** **(medium)** (a): *does Alazun run?* should not answer *yes* after the speaker replaced it; (b) still lets `follows` say yes. Needs the reader to give `el` / `em` / `ul` a `to` (only `-r` hooks get one today).

**O-3: what does *except* do to the claim before it?** `zuvayal vowurol. ul zalazun vowurol vul.` Page: "`ul …` | an exception to what was just said". Options: (a) notes only, both claimed (the family's members clash with Alazun's denial once membership reaches him); (b) the prior reading's universal or member rule skips the members the exception names; (c) like O-2, the prior reading leaves. **Recommendation:** **(low)** (b), since an exception should never show as a clash; settled by a page sentence on what `ul …` does to a general claim before it, and how the reader marks the excepted members.

**O-4: does a *for now* polar word claim?** `yaor zazozon vowurol.` Page: "`yaor` takes a claim on board without committing to it" but also "says only that you hold the claim for now". Options: (a) claim as `-l` / `-m` do, `-r` in notes; (b) no claim, as R4d-3. **Recommendation:** **(low)** (a), since the page says the speaker holds the claim and a later reversal shows as a clash the learner can give up; settled by the page saying whether `yaor` asserts.

**O-5: what does taking up or rejecting an option give?** `yael` / `yaem` / `yaer`, `yuel` / `yuem` / `yuer` after an offer or an *or* question. Options: (a) notes only, as R4d-3; (b) on an *or* list question, `yael` claims the offered item and `yuel` denies it. **Recommendation:** **(medium)** (a): accepting an offer is a turn act, not a claim about the world, and "this option" names no item the reader can pick.

**O-6: NOTIONAL and what it carries.** `zazozon theyum vowurol. zazozon vehohel.` leaves `noRow overlay:notional:th` then `unused carry:notional`. Page: "The sentence now describes an imagined scene and makes no claim that it happens"; "The supposition carries, so every step after it stays supposed". Options: (a) a wrap like a view, `holds(view(notional, T))` (ending in notes), carried readings the same, inference inside it as holder rule 4, never `holds(T)`; (b) left `beyond`. **Recommendation:** **(medium)** (a): it keeps a supposition's steps checkable for clashes, as `notional.md` reasons from one, and never leaks into your claims.

#### R4e decisions

2. **Hinges on universals** (`zual gogozel vezuvel thohem blarl zogozer guzemel.`, *every cat sleeps if it is sleepy*; R4b-16, R4b-17; a denial, hg23). Options: (a) rules as now, no term: the universal's conditional cannot be denied or asked; (b) one template term `if(c(Id),o(Id))` claimed once, with R4b-16's per-member rules gated on it; (c) (b) plus a member term `holds(if(c(Id,X),o(Id,X))) :- holds(if(c(Id),o(Id))), holds(isa(X,K)).` per stated member, with the per-member rules gated on that and R4e-2's fits over the `c(Id,X)` / `o(Id,X)` slots. **Recommendation:** **(medium)** (c): a question or denial about one cat's conditional (`zazozon vezuvel thohem blarl zazozon guzemel.`) then meets the universal, as a plain question meets row 8's instances. Settled by whether hg23's denial reads "not every cat" or "every cat, not if", which `universals-domains.md` does not say; until then hg23 stays left.
3. **D14's zone over a hinge** (`uom thagom zazozon vowurol thohem blarl. zalazun vezuyol.`). D14 made it data for want of the term. Options: (a) stay data (left); (b) the conditional is still your claim, R4e-1's term and rules, plus `holds(against(if(c(Id),o(Id)), Z)) :- on(Id).`, a marker with no clash, as row 14 does for a plain claim; (c) `against` on the condition, as the pair-table reading gloss says "(the condition goes against the plan)". **Recommendation:** **(low)** (b): row 14's "the event is still your claim" carries over once the conditional is a claim, and a plan goes against events, not against a condition left unclaimed. Settled by `contrary-to.md` saying what a zone before a hinge covers; the pair-table gloss for (c) has no page sentence behind it.

## Open decisions

1. **The `say` × `hinge` pair row's second sample** (`interpreter.md`, pair table). The sample `zazozon vowurol hwuvam thohem blarl. zalazun vezuyol.` is glossed *if Alazun talks, it is allowed that Azozon walks* (hinge over say), but the row's own rule (the earlier covers the later; the hinge over a word is a `blarth` hinge put first) and the reader give say over hinge, *it is allowed that, if Alazun talks, Azozon walks*. B1b built R4a-9 on the `thohem blarth` form (k53); k37, in the sample's form, reads as R4a-12 (data). Options: (a) change the second sample to the `blarth` form put first, as D14 does for `hinge` × `contrary`; (b) keep the sample and give the say word a carve-out from text order. **Recommendation:** **(high)** (a): the row's own text names the `blarth` form as the way to put the hinge over the word, D14 settled the same mismatch the same way, and (b) would make text order fail for one family only. B2b, which edits the `hinge` × `contrary` row, can make the change in the same edit.

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
