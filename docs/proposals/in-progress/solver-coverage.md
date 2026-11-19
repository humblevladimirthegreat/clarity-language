# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-19: phase 1 done (F1, F2, RF1, RF2); phase 2 done (R4a to R4e drafted; the user confirmed every row and settled every open decision, 2026-11-19, [Confirmed rows](#confirmed-rows)); next is phase 3. User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer. User, 2026-11-19: add the accounting guard; adopt every recommendation, and *always possibly* precludes *never* ([Decided](#decided)). User, 2026-11-19: give the conditional a claim term (R4e); size each later phase to phase 2's spend. The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles), [sentence linkers](/sentence-linkers), [polar inventory](/polar-inventory), [hooks](/hooks), [notional](/notional); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The page sentences the confirmed rows name (each written in the unit that builds its row). The `hinge` × `contrary` pair-table sample and gloss in `interpreter.md` (D14, R4e decision 3). The recipe rows *dependent on* and *independent* in `say-people-places.md` (D15).

## Design

Phase 1 built the faithful half. The **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused frame, link, SHARED detail, blank or member list to `left` with reason `unused`; a question with one answers `beyond`. The sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part. Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`; `ask` takes `{ asker }`). After phase 1 the sweep leaves 2620 example readings: 394 `unused`, the rest `noRow` (most of those are host policies or other subsystems this proposal does not cover).

Phase 2 drafted every row and the user confirmed them ([Confirmed rows](#confirmed-rows)). Three choices shape the build:

- **The conditional is a claim term** (R4e): each *if* / *only if* / *iff* reading claims `if(c(Id),o(Id))`, `onlyif(..)` or `iff(..)` over its own slots, and the rules of rows 5–7 take that term in their body in place of `on(Id)`. A conditional can then be denied (the link fails), asked, held in a view, put under MAY or a zone, and cited by *why*. It is built first; later units build on it.
- **A `/ɡ/` hinge's noun outcome** is the existence claim of a verbless sentence, `holds(isa(nm(..), K))`; a person's name there stays left.
- **One pool of claims.** Every turn's plain claim is `holds(T)`, with no speaker; a per-speaker layer (`said(Speaker, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) will be its first users.

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

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)); phases 1 and 2 are done, three phases remain. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

**Budget** (user, 2026-11-19): each phase spends about what phase 2 did, five drafting units of about 40 tool calls and 110k–140k subagent tokens each. A build unit costs more per row than a drafting unit (code, goldens, tests, page sentences), so each build unit takes about four to eight rows, and each phase five or six units, the lighter units (FX, P1, S1) filling the sixth place.

**Every build unit** adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases; moves its rows' `draft-*.txt` cases into the `solve-*.txt` of the same area (`solve-holders.txt`, `solve-because.txt`, `solve-maybe.txt`, `solve-lists.txt`, `solve-hinges.txt`), or `git mv`s a draft to a new `solve-*.txt` when no file fits, and deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`); adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge; and writes each page sentence its rows name on that page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; S1 reviews it). Its brief quotes its rows, the settled decisions they use and its rows' findings, from [Confirmed rows](#confirmed-rows). Its report gives the sweep's `unused` count by part key.

**Every build unit may edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages its rows' page sentences name. A unit's own **May edit:** line adds to this.

### Phase 3: the conditional, holders, say words, *because*

**FX A question that answers itself.**  
`proposal-worker`, `model: opus`, effort `high`.  
`yel zodozel gamahum.` answers `yes` from an unrelated log; the question's witness facts seem to carry the predicate it asks (R4c finding). Find the cause, fix it, and add a `solve.test.ts` case. Every later fixture verdict depends on it.  
**May edit:** as every build unit, plus `src/interpret/match.ts` and `src/interpret/probe.ts` if the cause is there.

**B0 The conditional term.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4e-1 to R4e-4 and R4e-7; R4e decisions 1 (a denied conditional: the link fails) and 4 (a separate `onlyif` term). First fix the translator gap: `hinge()` rejects a condition whose only frame is `slot:newMember` (R4e finding 1). Rows 5–7 in `solver.md` change to the term. R4b-1's `/ɡ/` outcome follows R4e-7.

**B1a Holders.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4a-1 to R4a-5, R4a-13, R4e-5 (a holder's conditional). A holder party comes from `holderParty()` in `read.ts`. `holder()` in `translate.ts` must resume a topic-pronoun party through its antecedent (`xazozon theyomalen zalazun vudurul.` is left as `anaphor:topic` until it does), and its doc comment ("the reader gives it no antecedent") is stale. `-r` holders (`bindContent`) still read as named things: switch them to `pronoun()` here with the translator.  
**May edit:** as every build unit, plus `src/interpret/read.ts` (the `-r` holder party only).

**B1b Say words and the turn.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4a-7 to R4a-12 (`zaya`, `zawan`, hinge or binder over a say word, D1); R4a decisions 1 (`zawan` with several addressees: `listener(N)`) and 2 (`zayan` gives each member's act). `zawan` and `zaya` read `LogEntry.addressees` (`{by: "call" | "lastCall" | "otherSpeaker", to: Addressee[]}`), never the call frames on a reading.  
**May edit:** as every build unit, plus `src/interpret/match.ts` (turn terms only) and `src/interpret/log.ts` (`addressees` only).

**B2a *Because*.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-1 to R4b-8 (noun conditions, *because* in a holder, the `/ɡ/` stack, D2, D3, D11, D12, D15's solver half). R4b decision 2 is replaced by R4e-7: R4b-8 keeps only *a person's name as the outcome stays left*.

**P1 Recipe rows.**  
`proposal-worker`, `model: opus`, effort `high`.  
D15: the *dependent on* and *independent* rows in `say-people-places.md` say what about the person is needed, never the person after `gahum` (`because-and-iff.md#choosing-a-hinge`). Read `docs/meta/procedures/english-helper.md` first. Forms checked with `parse.mjs --check-lexicon`; if no natural form exists without new grammar, stop and report.  
**May edit:** `docs/grammar/say-people-places.md` (those two rows), English helper data the procedure names for them.

**Order:** FX, B0, B1a, B1b, B2a, P1. Gate at the end: the recall gate (P1 edits a recipe page).

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
R4b-25 to R4b-28 and R4e-6; R4b decision 1 (the *only if* half of a hinge over MAY is plain). D5, D6.

**B3c Hinges on universals.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4b-16 and R4b-17 with R4e decision 2 (c): one template term plus a member conditional for each stated member, the per-member rules gated on it; the edge line changes as R4b-16 says. A denial of a universal's conditional (hg23) stays left.

**B4a Rank and ties.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-1 and R4c-2 (D17); R4c decisions 1 to 4 (reversed rank clashes, rank with a verb, rank of three or more, a tie with a factor as `ratio(..)`).

**Order:** B2b, B3a, B3b, B3c, B4a.

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
- Recall gate, at the end of phase 3: `npm run english-helper-recall -- --check`, with its result on the Status line.
- Final gate, at the end of phase 5: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line; one consolidation commit at the end of phases 3 and 4. About 19 commits in all, the last deleting this proposal.

## Confirmed rows

Drafted in phase 2 (units R4a to R4e) and confirmed by the user, 2026-11-19: every row as drafted, except R4b-15's zone over a hinge (the `zone(Id, Z)` fact), which R4e decision 3 replaces. Each row's **Fixtures** are in `src/interpret/fixtures/draft-*.txt` (`draft-holders`, `-because`, `-maybe`, `-lists`, `-fill`, `-links`, `-hinges`), with the verdict the row should give and the verdict before the build. [Settled decisions](#settled-decisions), at the end, are part of the rows they name; each unit's findings feed the unit that builds its rows ([Implementation plan](#implementation-plan) names it).

### Outside this proposal

Left groups the drafts met that are host policies or other subsystems: CAUSE `thewom` before a hinge, `/h/` hinges, sake words with MAY, `stimulus:g`, nested hinges.

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


### R4e: a term for the conditional

Added by the user, 2026-11-19, from R4b's open decision 2. Fixtures: `src/interpret/fixtures/draft-hinges.txt` (hg1 to hg23). R4b-1's `/ɡ/` outcome follows R4e-7 (the settled existence outcome), not a bare kind.

#### R4e-1: the conditional as a claim term
- **Kind:** copy (rows 5–7 restated so the conditional is a claim; `causation.md#if`, `#only-if`)
- **Covers:** the missing term behind R4e-3 to R4e-7 and OD3; no sweep key on its own (hg1–hg4 already answer).
- **Concludes:** one term per hinge reading, over its own slots: *if* `holds(if(c(Id), o(Id))) :- on(Id).`, *only if* `onlyif(c(Id), o(Id))`, *iff* `iff(c(Id), o(Id))` (one term each, not two; see OD4). A denied outcome writes `neg(o(Id))` in the term (`if(c(Id), neg(o(Id)))`). The rules of rows 5–7 keep their shape and their per-reading heads but take the term in place of `on(Id)`: *if* `holds(Out) :- holds(if(c(Id),o(Id))), fits(c(Id),P), holds(P).` and back `holds(neg(Cond)) :- holds(if(c(Id),o(Id))), fits(P,o(Id)), holds(neg(P)).`; *only if* row 6's two rules with `holds(onlyif(..))`; *iff* rows 5 and 6 each with `holds(iff(..))`. Twins: `fired(Id, if(c(Id),o(Id))) :- on(Id).`; each rule's `fired(Id, Out)` and `used(Id, Out, P)` plus `used(Id, Out, if(c(Id),o(Id)))`, so *why* walks from the outcome through the conditional to its reading. Marks nothing new (the hinge frame is already used).
- **Classification:** `overlay:clause_hinge:th` / `:g` (frame:hinge): no new row; solver.md rows 5–7 and the reserved names gain `if`, `onlyif`, `iff`.
- **Anchor:** `causation.md#if`: "whenever the condition holds, the outcome holds too … Saying *if* does not claim the condition is true"; `causation.md#only-if`: "*only if* … says the outcome cannot hold without the condition", "*if and only if* says both at once".
- **Fixtures:** hg1 + hg2 `? zalazun vehohel.` → yes, because hg1, hg2 (now: yes); hg3 + hg2 and hg4 + hg2 → yes (now: yes). `solve-hinges.lp` regenerates with the term lines.

#### R4e-2: matching conditionals by their slots
- **Kind:** copy (solver.md Encoding, Fits; extends the slot facts to whole conditionals)
- **Covers:** what lets R4e-3 and R4e-4 meet the conditional they name; the part a build most likely gets wrong.
- **Concludes:** `finish()` adds, for each ordered pair of conditional terms B ≠ A (stated, denied, wrapped, MAY-chosen or a question's), `fits(TB, TA).` when A says at least B: (1) same name, or A is `iff` and B is `if` / `onlyif` / `iff`; (2) the same wrappers (`may(..)`, R4e-6) on each slot and the same outcome sign; (3) the slot claims match, with `sites` from each slot's own reading as now: *if* `match(cA, cB)` and `match(oB, oA)` (outcome reversed, `match(oA, oB)`, when the outcome is denied); *only if* `match(oA, oB)` and `match(cB, cA)`; *iff* both ways on both slots. No fits from the term texts: under a hinge a first mention is written as its kind (R1-3), and a conditional must still meet a fitting one worded otherwise. The generic `clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).` and its `view` form then clash a denied conditional with a stated one; no new clash rule.
- **Classification:** none (solver encoding).
- **Anchor:** solver.md Encoding, Fits: "`fits(Q, T)` means `match(Q, T)` succeeds: T says at least Q."
- **Fixtures:** hg5 + hg6: clash (now: hg5 left `noRow overlay:clause_hinge:th`, hg6 left `noRow joinSeries:u`); hg5 then `? zalazun vehohel thohem blarl zodozel vowurol.` → yes, `? … zogozel vowurol.` → unknown (now: hg5 left, both `beyond`); hg5 + hg7 `? zalazun vehohel.` → yes (now: unknown, hg5 left). Needs Findings 1 first.

#### R4e-3: a denied conditional
- **Kind:** copy, resting on Open decision 1 (recommended (a))
- **Covers:** `noRow joinSeries:u` with a hinge as the stance list's one item (`thohem thul blarl`, `thohem blerulal thul`, `thebem thul`, `thehom thul`); `thanam thohem thul blarl` (2 sweep readings, `say-reasons.md`) once D8 says what the denied channel adds.
- **Concludes:** `holds(neg(if(c(Id),o(Id)))) :- on(Id).` (likewise `onlyif`, `iff`), no `holds` of the condition or the outcome, and no rule of rows 5–7. Clashes through R4e-2 with a conditional that says at least as much. Marks the hinge and the stance list's `u` join used.
- **Classification:** `joinSeries:u` on `/th/` in a stance list (frame:polarity, list reach): no new row.
- **Anchor:** `verb-and-stance-joins.md#stance-join-before-barl`: "The same works for every join vowel and every hinge."; `say-reasons.md#arguments`: "*Q doesn't follow from P* … Q **`thanam thohem thul blarl`** P | only that the link fails".
- **Fixtures:** hg1 + hg8: clash; hg8 + hg2 `? zalazun vehohel.` → unknown; hg3 + hg9, hg4 + hg10: clash; hg1 + hg10: no clash (now: the denial left `noRow joinSeries:u`, no clash, unknown); hg1 + hg11: clash once D8 lands (now: hg11 left).

#### R4e-4: a question over a hinge
- **Kind:** copy, with a page sentence for the user to confirm
- **Covers:** questions with a hinge, now `beyond` (`left q:… noRow overlay:clause_hinge:th`), order `edge:force > overlay:clause_hinge:th`.
- **Concludes:** the question's reading gives the term `if(c(Q),o(Q))` (its claim switched off) and its slots; `follows` gives *yes* from a `holds(TA)` atom with `fits(TQ, TA)`, *no* from `holds(neg(TA))` with `fits(TA, TQ)`, as for any term, read in TypeScript from the R4e-2 facts. A conditional reached only by chaining two stated ones answers *unknown* (no hypothetical reasoning). Marks the hinge used.
- **Classification:** `force` × `hinge` pair row: add "on a question, it asks whether the conditional holds".
- **Anchor:** `questions.md#question`: "every word keeps the form it would have in a statement"; **Page sentence** for `causation.md#if`: "A question with an *if* hinge asks whether the condition is enough for the outcome, not whether either one holds."
- **Fixtures:** hg1 then `? zalazun vehohel thohem blarl zazozon vowurol.` → yes; hg8 then the same → no; hg2 alone → unknown; hg1 + hg12 `? zahelan vezuvel thohem blarl zazozon vowurol.` → unknown (now: all `beyond`, also with `yel`).

#### R4e-5: a holder's conditional
- **Kind:** copy (solver.md Holders row 4)
- **Covers:** holder + hinge, today rules inside the view with no term; a holder's denied conditional (`noRow joinSeries:u`).
- **Concludes:** `holds(view(H, if(c(Id),o(Id)))) :- on(Id).`; Holders row 4 takes it in place of `on(Id)`: `holds(view(H,Out)) :- holds(view(H, if(c(Id),o(Id)))), fits(c(Id),P), holds(view(H,P)).` and the back rule likewise; a denial `holds(view(H, neg(if(..))))`, which clashes in the view through the generic `clash(view(H, Q))` fits form. Marks the holder, the hinge and the `u` join used.
- **Classification:** `hinge` × `holder` pair row: no new row.
- **Anchor:** `holder.md#what-the-holder-covers`: "The holder covers its clause and any dependent sentence inside it".
- **Fixtures:** hg13 + hg14 `? zalazun theyomazozon vehohel.` → yes (now: yes); hg13 + hg15: clash in Azozon's view (now: hg15 left); hg1 + hg15: no clash.

#### R4e-6: MAY with a hinge
- **Kind:** copy (rows 15, 17, 18) and decision D5 (R4b-25, R4b-26)
- **Covers:** rows 17 and 18 as built, now with the term; D5's only-if and iff rows.
- **Concludes:** MAY over a hinge is row 15 on the term: `{ holds(if(c(Id),o(Id))) } :- on(Id).` and `holds(may(if(c(Id),o(Id)))) :- on(Id).`; the `maybe(Id)` gate goes for hinges (it stays for *or* lists), since the rules already wait on the term. A hinge over MAY is `if(c(Id), may(o(Id)))`, held plainly, with row 17's choice `{ holds(Out) } :- holds(if(c(Id),may(o(Id)))), fits(c(Id),P), holds(P).` and no back rule. MAY on the condition is `if(may(c(Id)), o(Id))` with row 18's body. D5: `onlyif` / `iff` take the same wrappers (R4b-25 condition, R4b-26 outcome). The wrappers keep "if A, maybe B" from meeting "if A, B" (R4e-2 (2)).
- **Classification:** no new row.
- **Anchor:** `causation.md#if`: "To make the outcome only a guess …, put MAY first … you claim neither the walking nor the sitting, only that the sitting could follow from the walking"; "MAY inside the condition makes the condition a chance".
- **Fixtures:** hg16 + hg2 `? zalazun vehohel.` → unknown, `?~` → yes (now: the same, through the gate); hg16 + hg8: no clash in some world (now: hg8 left).

#### R4e-7: a noun outcome under a `/ɡ/` hinge (1a, settled)
- **Kind:** copy, pending the user's confirmation of 1a; supersedes R4b-1's bare kind term for a `/ɡ/` outcome
- **Covers:** `noRow overlay:clause_hinge:g` with a common-noun outcome (8 sweep readings in `causation.md`, `why-allowed.md`, `finger-code.md`: `zerulal gohem blugalal.`, `zevelal gebem blelol.`, …); `zerulal gahum blugalal.` and `zegewam gahum blerulal.` under row 10.
- **Concludes:** the outcome is the existence claim `zerulal.` makes, `isa(nm(Id,z), K)`; the condition the existence of its `bl-` noun, `isa(nm(Id,bl), K2)`, slot `c(Id)` holding that verbless claim. *If*: R4e-1's term and forward rule, `holds(isa(nm(Id,z),erula)) :- holds(if(c(Id),o(Id))), fits(c(Id),P), holds(P).`; no back rule, since the encoding has no denied existence term (*no K* is row 9's `clash(none(Id))`). *Only if*: the back rule only, giving `holds(isa(nm(Id,bl),ugala))`. *Because* (`gahum`): row 10 with both `isa` claims and `cause(..)`. A name as the outcome (`zazozon gohem blerulal.`) stays left (D15). Marks the hinge, its hosted term and the `slot:newMember` frame used.
- **Classification:** `overlay:clause_hinge:g` (frame:hinge, on a noun): no new row.
- **Anchor:** `causation.md#if`: "A common noun with a `/ɡ/` word after it says the thing exists ([*there is …*](predication.md#existence)), so a noun outcome says *there is X if there is Y*."
- **Fixtures:** hg17 + hg18 `? zerulal.` → yes; hg19 + hg20 `? zugalal.` → yes; hg21 `? zerulal.` and `? zugalal.` → yes; hg22 stays left (now: all left `noRow overlay:clause_hinge:g`, unknown).

#### R4e findings

1. **Reader gap in the translator: a first mention in a hinge's condition.** `zalazun vehohel thohem blarl zodozel vowurol.` is left `noRow overlay:clause_hinge:th`: `hinge()` rejects a condition with any frame (`cond.frames.length && !mayCond`), and its `slot:newMember` frame counts. The outcome takes one (`zodozel vehohel thohem blarl …` works). R4e-2's fixtures need the check to skip `slot:newMember`, as R1-3 already does for marking.
2. **The brief's premise on fresh constants does not hold under a hinge.** A first mention under a hinge is written as its kind (R1-3, `ehohe(z(odoze))`), not `nm(Id, P)`, so two readings' conditions are equal texts today. R4e-2 still matches by slots, since a conditional must meet a fitting one worded otherwise and a stated `nm` sentence. R4e-7's `nm(Id,z)` / `nm(Id,bl)` outcome and condition are the exception, by 1a.
3. **Rules per reading, not generic.** R4e-1 keeps each reading's rules and puts the term in their body. A generic `holds(O) :- holds(if(S)), fits(c(S),P), holds(P), out(S,O).` over `cond/out` facts gives the same answer sets, but needs a sign fact for denied outcomes and its own variants for the MAY wrappers and universals; every way the term holds keeps the reading's own slots, so the per-reading rule always fires. *Why* cites the conditional either way (`used(Id, Out, if(..))`). Pick the generic form only if a consumer must derive a conditional from another rule.
4. **R4b-1 and R4e-7 disagree** on a `/ɡ/` outcome: R4b-1 drafts the bare kind `holds(rain)`, R4e-7 (1a) `holds(isa(nm(Id,z), erula))`. Keep one; 1a answers `? zerulal.` the way `zerulal.` already does.
5. **`thanam thohem thul blarl`** puts both `thanam` and `thohem` in the stance list the `u` join closes; R4e-3 needs D8's channel-on-your-claim row (R4c) to say what denying DEDUCED adds before hg11 can build.

### Settled decisions
<a id="settled-decisions"></a>

The user adopted every recommendation below, 2026-11-19, with these notes:
- **R4b 2 is replaced.** A kind or event noun as the outcome of a `/ɡ/` hinge takes rows 5–7, with the existence claim of a verbless sentence (`holds(isa(nm(..), K))`) as the outcome; under `gahum` that is plain row 10. A person's name as the outcome stays left. The link becomes a claim term for the conditional, drafted by R4e (pending).
- **R4c 6:** (a), with the page's wording raising it to high (`evidentiality.md#evidence-clause`: "You state the claim, the strength of your grounds, and the grounds themselves"). `grounds(E, C)` stays apart from `cause`.
- **R4e 3:** (b), medium: the zone before a hinge covers the whole link, `holds(against(if(c(Id),o(Id)), Z)) :- on(Id).`, a marker with no clash; the page sentence goes on `contrary-to.md`, and the `hinge` × `contrary` pair-table gloss becomes *(the link goes against the plan)*. Every R4e recommendation is adopted.
- **R4d O-4:** (a). `yaor` claims in the shared pool, with *for now* and the speaker in the notes. The pool has no per-speaker claims; a per-speaker layer (`said(Speaker, T)`, with `holds(T) :- said(_, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) are its first users.

#### R4a decisions

1. **`zawan` in a turn with several addressees.** `Bea: yazozon. yalazun. zawan vowurol.` One addressee is `awa` (`collectives.md#addressing-several-people`), but the turn named two. Options: (a) `listener(N)`, fitting no other turn's; (b) one of them, chosen by the last call; (c) each addressee, as `awanx`. **Recommendation:** **(medium)** (a): the grammar says `zawan` is one person and the log cannot tell which, so claiming nothing about either keeps the solver from asserting what the speaker did not say; (b) guesses.
2. **Does `zayan vowurol.` give each member's act?** With `we(sp("Bea"), azozon)`, does *we walk* give *Azozon walks*? Options: (a) the group term only, like `-x` `grp(..)`; (b) members, as an *and* list (row 11), with the collective `-x` verb exception. **Recommendation:** **(medium)** (b): `pronouns.md` calls `aya` "the speaker and the people being addressed, together", and `collectives.md` gives `zayam` to hedge "whether you really share the act", which reads as plain `zayan` claiming each does. Settle by asking whether *we walk* to Azozon lets *does Azozon walk?* answer yes.

#### R4b decisions

1. **The *only if* half of a hinge over MAY** (`zalazun vezuvel vul. thebem blarth thomam zazozon vowurol.`: without the sleeping, could Azozon walk?). Options: (a) plain, `holds(neg(Out)) :- fits(P, c(Id)), holds(neg(P))`: without the condition the outcome is not even possible; (b) a choice, as row 17's *if*; (c) no rule. **Recommendation:** **(medium)** (a): *only then may Azozon walk* rules the walking out without the condition, and (b) would let a learner's *no* answer read as *maybe*. Settled by the user reading the English.
2. **Named outcomes under `gohem`, `gebem`, `gehom`** (`zazozon gebem blerulal.`): D15 claims the condition, which fits `gahum` only. Options: (a) the link as a fact outside `holds`, `hinge(Id, Gloss, Cond, Name)`, nothing claimed; (b) leave in `left`. **Recommendation:** **(low)** (a), so the reading is kept and a reply can quote it; settled by whether any job should read it.
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

1. **What a denied conditional means** (`zalazun vehohel thohem thul blarl zazozon vowurol.`). Options: (a) the condition does not guarantee the outcome: `neg(if(..))`, no rule fires, nothing else claimed, clashes with the conditional; (b) classical: the condition holds and the outcome does not; (c) (a) plus the outcome claimed, reading "the claim itself still stands" (`verb-and-stance-joins.md#stance-joins`) as the bare outcome. **Recommendation:** **(high)** (a). `say-reasons.md#arguments` gives the form's meaning outright, "only that the link fails"; `causation.md` says no hinge claims its condition, which (b) would; and the stance join leaves standing only what the clause claimed, which under *if* is nothing but the link, so (c) adds a claim.
2. **Hinges on universals** (`zual gogozel vezuvel thohem blarl zogozer guzemel.`, *every cat sleeps if it is sleepy*; R4b-16, R4b-17; a denial, hg23). Options: (a) rules as now, no term: the universal's conditional cannot be denied or asked; (b) one template term `if(c(Id),o(Id))` claimed once, with R4b-16's per-member rules gated on it; (c) (b) plus a member term `holds(if(c(Id,X),o(Id,X))) :- holds(if(c(Id),o(Id))), holds(isa(X,K)).` per stated member, with the per-member rules gated on that and R4e-2's fits over the `c(Id,X)` / `o(Id,X)` slots. **Recommendation:** **(medium)** (c): a question or denial about one cat's conditional (`zazozon vezuvel thohem blarl zazozon guzemel.`) then meets the universal, as a plain question meets row 8's instances. Settled by whether hg23's denial reads "not every cat" or "every cat, not if", which `universals-domains.md` does not say; until then hg23 stays left.
3. **D14's zone over a hinge** (`uom thagom zazozon vowurol thohem blarl. zalazun vezuyol.`). D14 made it data for want of the term. Options: (a) stay data (left); (b) the conditional is still your claim, R4e-1's term and rules, plus `holds(against(if(c(Id),o(Id)), Z)) :- on(Id).`, a marker with no clash, as row 14 does for a plain claim; (c) `against` on the condition, as the pair-table reading gloss says "(the condition goes against the plan)". **Recommendation:** **(low)** (b): row 14's "the event is still your claim" carries over once the conditional is a claim, and a plan goes against events, not against a condition left unclaimed. Settled by `contrary-to.md` saying what a zone before a hinge covers; the pair-table gloss for (c) has no page sentence behind it.
4. **One term for *only if*, or *if* reversed.** `onlyif(c, o)` (separate name, R4e-1) or `if(o(Id), c(Id))` (the same rules, so *Azozon walks only if it rains* would answer *yes* to *does it rain if Azozon walks?*). **Recommendation:** **(medium)** separate names: `causation.md` says the hinges "keep two questions apart: whether the condition is *enough* for the outcome, and whether the outcome *needs* it", and a learner asking about *enough* should not get *yes* from a stated *needs*. Rules stay the same either way.

## Open decisions

None open.

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
