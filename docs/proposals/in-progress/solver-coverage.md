# Solver coverage: the edge, wrong answers, and fill questions

**Status:** IN PROGRESS, 2026-11-20: phases 1 to 4 done. Phase 4 (B2b, B3a, T1, B3b, B3c, B3d, B4a, P2): contrary-to zones, MAY over a clause and on hinges, hinges on universals, rank and ties, probe output scoping (T1), and the `verb-and-stance-joins.md` checkpoint (P2); open decisions 2 and 3 settled as D18 and D19 and built. Open decisions 4 and 5 settled 2026-11-20 as D21 and D22. Next is phase 5 (B4b, B4c, B6a, B6b, B6c, B5a, B5b, S1). User, 2026-11-19: close the edge (group 1) and the borderline items (fill questions, `ue` / `oe`, other stance numbers) now, without waiting for a consumer; host policies (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds) wait for a consumer; each later phase is sized to phase 2's spend. The solver's first version shipped; [solver.md](../../meta/solver.md) owns its rows, jobs and edge.  
**Related:** [solver.md](../../meta/solver.md); [interpreter.md](../../meta/interpreter.md) (classification and pair tables); `src/interpret/` (`translate.ts`, `solve.ts`, `read.ts`, `classes.ts`, `match.ts`, `log.ts`, `probe.ts`, `cli.ts`); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [causation](/causation), [contrary to](/contrary-to), [knowing](/knowing), [evidentiality](/evidentiality), [restrictors](/restrictors), [rank joins](/rank-joins), [set joins](/set-joins), [list structure](/list-structure), [comparatives](/comparatives), [pronouns](/pronouns), [collectives](/collectives), [questions](/questions), [fill-ask roles](/fill-ask-roles), [sentence linkers](/sentence-linkers), [polar inventory](/polar-inventory), [hooks](/hooks), [notional](/notional); recipe page `say-people-places.md`.  
**Depends on:** none.  
**Design authority:** no new forms. The page sentences the confirmed rows name (each written in the unit that builds its row).

## Design

Phase 1 built the faithful half: the **accounting guard** in `translate.ts` (`Translation.accounting`) sends a reading with an unused part to `left` with reason `unused` (a question with one answers `beyond`), and the sweep `src/interpret/accounting.test.ts` fails on a kept grammar example with an unused part. Speaker and listener are turn-tied (`listener(N)`, `Translation.site(id)`, `TermSite` in `match.ts`).

Phases 3 and 4 built the rows below; [solver.md](../../meta/solver.md#translation-table) owns each. What phase 5 builds on:

- **The conditional is a claim term.** A plain *if* / *only if* / *iff* claims `if(c(Id),o(Id))`, `onlyif(..)` or `iff(..)`; matching between conditionals is `Translation.conditionals` / `conditionalFits`. MAY wraps a side: `if(may(c),o)`, `if(c,may(o))`, or `may(if(..))` with a choice on the plain term (`Conditional.may` keeps a wrapped one from meeting a plain one). A hinge on a closed universal claims a template term plus a member term per stated member (`Conditional.id` = `"Id",M`), rows 5–7 run per member. A hinge in a holder's view claims `view(H, if(..))`.
- **Zones.** `against(T, Z)` with `Z` = `plan(H)`, `want(H)`, `decision(H)`, `channel(Gloss, H)` or a say word; `H` = `sp("…")` with no holder; a zone over a hinge puts `against` on the conditional.
- **MAY.** Row 15's choice wherever MAY is held (D18, D19); *always* over MAY adds `always(may(T))`, which clashes with and attacks `never(T)`. A MAY question runs as `couldBe` (switch `couldBe`).
- **Rank and ties.** `ranked()` in `translate.ts`: `more(S, A, B)` per ordered pair, `most(S, A)`, `tie(S, A, B, E)`, `ratio(S, A, B, V)` (never pooled for questions; open decision 4); with a verb each member's act holds.
- **Witnesses.** A question's witness facts come from `Translation.witnesses`; a row that adds a first-mention witness fact records its lines there.
- **Holders and say words.** `sayRules()` emits the say rules; `zayan` is `we(..)`; `zawan` reads `LogEntry.addressees`. Reserved names include `if`, `onlyif`, `iff`, `we`, `every`, `because`, `want`, `decision`.
- **One pool of claims.** Every turn's plain claim is `holds(T)`, with no speaker; a per-speaker layer (`said(Speaker, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) will be its first users.
- **Fixtures.** `solve-holders.txt`, `-because`, `-hinges`, `-say`, `-maybe`, `-lists`. `draft-holders.txt` holds only k14 (B6a), `draft-because.txt` only bc36 (tag `zwar`, left), `draft-hinges.txt` hg11 (B6c) and hg23 (left), `draft-lists.txt` R4c-3 and later; `draft-maybe.txt` is gone. Use the inline `blarl …` form of a hinge condition. A draft verdict "→ no" that only means *does not follow* is tested as `unknown`.
- **Probing.** `probe --program` prints the case's own lines; `--case N`, `--terms a,b`, `--program=full` (T1).

After phase 4 the sweep leaves 2489 example readings: 338 `unused` (unit:linker 83, edge:polar 55, slot:tag 44, edge:hook 43, lexReading:standIn 22, shared:scale 22, shared:distribute 20, hookJob:resume 17, lexReading:standInBack 7, carry:channel 5, shared:collective 4, others 16), the rest `noRow`.

## Decided

User, 2026-11-19 (D7–D10) and 2026-11-20 (D21, D22), each as recommended. D1–D6 and D11–D20 are built and live in [solver.md](../../meta/solver.md#translation-table); the numbers of the rest are kept.

7. **`ue`** denies each listed item (the classification row: "as `u`"). The outside item that holds adds no rule, as open `aem` adds none.
8. **Channel stances on your own claim** (`thebam`, `th_N`, `th#N`, `th@+95`, `th-e-`) take row 1, with the frame in `notes`, like row 16 (`evidentiality.md#evidentiality`: "the listener always knows what your claim rests on"). Not R3-7's estimate row: these name sources, not likelihoods.
9. **Two denial lists in one clause** deny the joint substitution, `neg(T[a][b])`.
10. **The fill job.** Cautious answers by default, brave with `--possible`; one `zar` with several fillers lists them all; no filler is *unknown* unless `closedWorld` gives *nobody*; `…er` is an existence yes or no; `gar` answers from `isa` only until named details are encoded; *why* binds `C` from `cause(C, Out)` only, not a met *if*. When, where, whose and how wait for detail-term rows.
21. **`match()` compares SHARED words** (open decision 4 (a)). The scale word, a factor and `-l` / `-m` are compared when a question is matched, a matcher rule in [matching](../../meta/interpreter.md#matching), so a rank or tie question on one scale never fits a reading on another; `ratio(..)` is then pooled for questions. Fitting stays `match()`'s job; the solver matches no family by itself.
22. **A place on a scale** (open decision 5 (a)). `zahelan zol wrogel gelazem` (*Ahelan is the third biggest*, `comparative-arity.md#place-on-a-scale`) claims `place(S, A, N)`. Place 1 is `most(S, A)`; one member holds one place per scale, so two places for the same member clash (and place N > 1 clashes with `most(S, A)`). It claims no `more(..)` against named members, since the set it ranks in is unstated: *is Ahelan bigger than Azozon?* stays *unknown*.

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)); phases 1 to 4 are done, one phase remains. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Every unit runs in sequence: they share `translate.ts`, its tests and `solver.md`.

**Budget** (user, 2026-11-19): each phase spends about what phase 2 did, five drafting units of about 40 tool calls and 110k–140k subagent tokens each. A build unit costs more per row than a drafting unit (code, goldens, tests, page sentences), so each build unit takes about four to eight rows, and each phase five or six units, the lighter units (FX, P1, S1) filling the sixth place.

**Every build unit** adds its confirmed rows to `translate.ts` with golden programs and `solve.test.ts` cases; moves its rows' `draft-*.txt` cases into the `solve-*.txt` of the same area (`solve-holders.txt`, `solve-because.txt`, `solve-say.txt`, `solve-maybe.txt`, `solve-lists.txt`, `solve-hinges.txt`), or `git mv`s a draft to a new `solve-*.txt` when no file fits, and deletes an emptied draft with `git rm` (a `solve-*` fixture holds only cases that translate whole; a case still left is tested in `accounting.test.ts`); adds its rows to the translation table in [solver.md](../../meta/solver.md#translation-table) and removes them from the edge; and writes each page sentence its rows name on that page (the [doc-style checklist](../../meta/doc-style.md#checklist) applies; S1 reviews it). Its brief quotes its rows, the settled decisions they use and its rows' findings, from [Confirmed rows](#confirmed-rows). Its report gives the sweep's `unused` count by part key.

**Every build unit may edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts` (only where a row changes a verdict or reply), their tests, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`, `docs/meta/solver.md`, the grammar pages its rows' page sentences name. A unit's own **May edit:** line adds to this.

### Carried into phase 5

- **B4b:** R4c-5 marks the SHARED hook's `hookJob` frame (R4c finding 3).
- **B6a:** k14 (`draft-holders.txt`, its only case, a topic-pronoun holder) is left only for `unit:linker`; R4d-1 clears it.
- **B6b:** the period form of a hinge condition (`thohem blarl. zalazun vezuyol.`, `slot:grounds`) is left by every hinge row; decide whether R4d-8's stand-in row covers it, or report it for the edge. A `blarth` condition that points back to a denied sentence is left `noRow overlay:clause_hinge:th`.
- **B6c:** R4e finding 5 (hg11).
- **S1:** besides the changed-sections list, the R4b-4 sentence in `because-and-iff.md#choosing-a-hinge` says "holder", which that band teaches later, with no link.
- **For the edge at the end** (no row; fold into [solver.md](../../meta/solver.md#the-edge) when the proposal closes, beside [Outside this proposal](#outside-this-proposal)):
  - a question asked as said over a data wrap (answers unknown); `zul` / `zuam` under a leading say word; `awanx` (`LogEntry.addressees` holds only the turn's own calls, while `collectives.md#addressing-several-people` adds anyone already addressed)
  - zones: a say-word zone with a universal, restrictor or hinge; `zuam` / `zul` with a zone; `huam` or listed exceptions with a zone; *only if* under a zone; a denied hinge with a zone; the fragment `uom hwudum` (`say-reasons.md`)
  - MAY: `huam` under MAY; `hal` / `huam` over MAY; listed exceptions with MAY over a restrictor; open `zuam` and *no K* with no verb under MAY; MAY with a say word, universal or restrictor beside another frame; a carried holder with MAY beside a hinge; row 6's forward rule on a MAY condition reads `holds(neg(may(P)))`, which nothing produces
  - universals: with MAY on the condition, a universal hinge's *only if* half has no back rule; hg23 (a denied universal hinge); bc36 (tag `zwar`, `slot:tag`)
  - rank: an open tie with a factor (`zoem`); a factor on a tie of three or with a verb; `zaol` with one name or a verb; any frame on a rank shape other than R1-8
  - `zazozon guzemel vul.` reads `vul` as the verb *no*, not a denial of the adjective claim (B3c); check how the grammar denies an adjective predication before calling it a reader bug

### Phase 5: lists, links, fill; style

**B4b Lists and stance numbers.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-3 to R4c-8 (D7, D8, D9; SHARED details after a join; likeness; collective `-x`); R4c decisions 5 (verbless lists left with reason `fragment`), 6 (the evidence clause claimed, with `grounds(E, C)`) and 8 (a SHARED number word stays left). Also fix the throw: `translate()` crashes on `zazozon dugavalx grodol oel growal vayebel.` (`open-ranges.md`) in `inRange` / `compareValues`; then make the sweep in `accounting.test.ts` fail on a throw instead of skipping it.

**B4c Matching SHARED words; a place on a scale.**  
`proposal-worker`, `model: opus`, effort `high`.  
D21 and D22. First D21: `match()` compares the SHARED words, `ratio(..)` pooled for questions, with tests that a rank, tie or ratio question on another scale does not fit; then D22's row, its fixture cases in `solve-lists.txt`, and its page sentence on `comparative-arity.md#place-on-a-scale` if the page does not already say that a place rules out another. B4a built rank in `ranked()` (`translate.ts`); B4b runs first.  
**May edit:** as every build unit, plus `src/interpret/match.ts` and `docs/meta/interpreter.md` (the matching section only).

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

**B5a The fill job.**  
`proposal-worker`, `model: opus`, effort `high`.  
R4c-9 to R4c-13 (D10) and R4c decision 7 (`…ur` / `…or` answer `beyond` for now): `fill(log, question, options)` in `solve.ts`, with its `solve.test.ts` cases from `draft-fill.txt`, and the Jobs section of [solver.md](../../meta/solver.md#jobs). Its report gives `fill`'s signature and result shape, which B5b is briefed from.

**B5b Fill wiring.**  
`proposal-worker`, `model: opus`, effort `medium`.  
Export `fill` from `solve-browser.ts` and `browser.ts`; `reading.mjs solve` and `probe` dispatch a `fillAsk` question to it; the reply through `reply.ts`; the CLI section of [solver.md](../../meta/solver.md#cli).  
**May edit:** `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/reply.ts`, `src/interpret/probe.ts`, `src/interpret/cli.ts`, their tests, `docs/meta/solver.md` (Jobs and CLI sections).

**S1 Style gate.**  
`style-editor`, `model: opus`, effort `high`.  
The `npm run changed-sections -- <rev>` list, where `<rev>` is `9e38c73d`, the commit before F1's.  
**May edit:** the listed sections.

**Order:** B4b, B4c, B6a, B6b, B6c, B5a, B5b, S1. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), folding anything left into [solver.md](../../meta/solver.md#the-edge).

**Running phase 5.** Before each build unit the orchestrator runs that unit's draft cases through one `probe` file and appends the result to the brief. A unit that passes about 40 tool calls with more than a few edits left stops and hands back; the orchestrator starts a fresh subagent for the rest.

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
- Final gate, at the end of phase 5: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `solver-coverage <ID>: … [skip-cd]` with the co-author line; phase 5 makes eight unit commits and a last one deleting this proposal.

## Confirmed rows

Drafted in phase 2 (units R4a to R4e) and confirmed by the user, 2026-11-19; the rows phases 3 and 4 built are gone from here and live in [solver.md](../../meta/solver.md#translation-table). Each row's **Fixtures** are in `src/interpret/fixtures/draft-*.txt` (`draft-lists`, `-fill`, `-links`, `-hinges`), with the verdict the row should give and the verdict before the build. [Settled decisions](#settled-decisions), at the end, are part of the rows they name; each unit's findings feed the unit that builds its rows ([Implementation plan](#implementation-plan) names it).

### Outside this proposal

Left groups the drafts met that are host policies or other subsystems: CAUSE `thewom` before a hinge, `/h/` hinges, sake words with MAY, `stimulus:g`, nested hinges.

### R4c drafts: lists, stance numbers, the fill job

Fixtures: `src/interpret/fixtures/draft-lists.txt` (l1–l10, n1–n4), `src/interpret/fixtures/draft-fill.txt` (f1–f10). Probe: scratchpad `r4c-probe.txt` / `r4c-probe.out`. Rank with two names already translates (`holds(more(dt("slot:adj","gamahum"), azozo, alazu))`), so it is not drafted; only its open edges are (Open decisions 1–3).

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

Added by the user, 2026-11-19. Its built rows live in [solver.md](../../meta/solver.md#translation-table); `draft-hinges.txt` keeps hg11 (B6c) and hg23 (left).

#### R4e findings

5. **`thanam thohem thul blarl`** puts both `thanam` and `thohem` in the stance list the `u` join closes; R4e-3 needs D8's channel-on-your-claim row (R4c) to say what denying DEDUCED adds before hg11 can build.

Finding 3 stands as built: rules per reading, the term in each body; pick a generic `holds(O) :- holds(if(S)), …` form only if a consumer must derive a conditional from another rule.

### Settled decisions
<a id="settled-decisions"></a>

The user adopted every recommendation below, 2026-11-19, with these notes:
- **R4c 6:** (a), with the page's wording raising it to high (`evidentiality.md#evidence-clause`: "You state the claim, the strength of your grounds, and the grounds themselves"). `grounds(E, C)` stays apart from `cause`.
- **R4d O-4:** (a). `yaor` claims in the shared pool, with *for now* and the speaker in the notes. The pool has no per-speaker claims; a per-speaker layer (`said(Speaker, T)`, with `holds(T) :- said(_, T)`) waits for the group-views host policy, and `yaor` and the polar answers (R4d-2) are its first users.

#### R4c decisions

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

## Open decisions

None.

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
