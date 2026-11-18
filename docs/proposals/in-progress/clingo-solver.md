# A solver behind the interpreter: Clingo for what follows, what clashes, and what stands

**Status:** IN PROGRESS, 2026-11-18. Phase 1 done (S1, S2, F1, R1). User, 2026-11-18: confirmed the group (a) rows, decided R1-2 to R1-9 and S1-1 as recommended (R1-6 as A), and the encoding as the lowest-risk shape, size aside ([Group (a) rows and decisions](#group-a-rows-and-decisions)). Phase 2 is ready. Idea 2026-11-14; researched and spiked 2026-11-18 ([Research](#research)). User, 2026-11-18: the wizard integration comes later; the first jobs are what follows, what clashes and what stands. User, 2026-11-18: adopted the recommendations on open generalizations, the unsaid, numbers, the first rows, the browser, *why not*, and clashes under choices; each is in the Sketch. User, 2026-11-18: the matcher's step conditions are shared TypeScript functions that both engines call (Sketch, *the matcher's steps*).  
**Related:** the interpreter's reading, log, matcher, host and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, [reading.mjs](../../../scripts/reading.mjs)); grammar pages [usually vs must](/usually-vs-must#general-claims), [causation](/causation), [everything](/joins#everything-ua), [universals](/universals-domains#universals-domains-generics), [knowing](/knowing), [holder](/holder), [contrary to](/contrary-to), [fault](/fault), [because](/because-and-iff), [measures and percent](/measures-and-percent), [ranges](/ranges), [open ranges](/open-ranges); consumers `ageben-spec.md`, `agent-tool-permissions.md`, `argument-map.md`, `knowledge-store.md`, `structural-search.md`, `who-knows-what.md`, `various-interpreter-applications.md`, later `wizard-adventure.md` and `logic-grids.md`; the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).  
**Depends on:** none (the interpreter's reader, log and matcher have landed). **Order:** none required. `ageben-spec.md` may switch its contradiction check to the solver once phase 2 here lands.  
**Design authority:** *none*. Tooling only: it adds no form and changes no reading. Each translation row states what the solver concludes from a frame family as the grammar page already teaches it; where a row needs a meaning the grammar pages do not state, that is an open decision for the user, and the row waits.

## Implementation plan

Run with subagents. Phase 1 is done; two phases are left. Each ends where the user confirms translation rows, which later units build on ([phases](../../meta/procedures/proposal-plans.md#phases)). At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends, then stops and gives the prompt for the next phase.

No unit edits prose under `docs/grammar/`, so there is no style gate and no recall gate.

**What phase 1 left for later units.**

- `clingo-wasm` 0.6.0 is a dependency and runs under Node 24 with `tsx`. A program text over about 1 MiB fails, and grounding many rules on one shared predicate grows faster than linearly ([Research](#research), S1's table).
- `src/interpret/steps.ts` exports `memberList`, `collective`, `claimMemberLists`, `asMember`, `universalInstance`, `compoundHeads(term, lexicon)`, `throughAntecedent` (`match.ts` re-exports it), and the types `StepLexicon` and `ListTerm`; `steps.test.ts` has a case for each.
- Fixtures are `src/interpret/fixtures/solve-{worked,clash,hinges,denial,lists,compound,numbers}.txt`: a label line `@ <id>`, one Ageben line, `= <English>`; `#` starts a comment. The house cast stands in for the Sketch's names (Azozon for Pingu, Ahelan for Robin, Alazun for Tweety), and *fly* is `v-wing` (`vewobol`). Ids and texts per fixture are in each file.
- The confirmed group (a) rows and the encoding are under [Group (a) rows and decisions](#group-a-rows-and-decisions); B1 builds them.

### Phase 2: fix the reader, build group (a), draft groups (b) and (c)

**B0 Reader fixes.**  
`proposal-worker`, `model: opus`, effort `high`. For R1-2 and R1-7.  
In the reader: `zul` + kind with no members classifies as `shared:kind` after its `u` fence, with the fence a frame:binder carrying its polarity (R1-2); a span between two numbers in a counted noun phrase is a `detail:range` on the noun's number term, both ends there (R1-7). A test for each, and the [classification table](../../meta/interpreter.md#classification-table) rows changed in the same edit. The grammar pages already state both readings (`universals-domains.md#universals-domains-generics`, `ranges.md#ranges`, `open-ranges.md#rays`), so no grammar page changes; if one turns out not to, stop and report.  
**May edit:** `src/interpret/read.ts`, `src/interpret/classes.ts`, their tests, `src/interpret/coverage-ratchet.json` if the coverage test asks, `docs/meta/interpreter.md` (classification table rows).

**B1 Translator.**  
`proposal-worker`, `model: opus`, effort `high`.  
`src/interpret/translate.ts`: a log (readings, nested ones included) to a Clingo program, from the confirmed group (a) rows only. Claims become terms, frames wrap them, every reading gets `on(Id)`, every rule carries its reading id and derives `fired`. Fitting stays the matcher's ([Sketch](#sketch)): fits computed with `match` and emitted as facts. Step facts come from `steps.ts`. Number order facts from `compareValues`. A frame with no row is left out and reported per reading, as `unread` is. The program text keeps to the Clingo 5 / 6 common ground ([Research](#research)). `translate.test.ts`: golden program text per F1 fixture. Report the encoding (atom shapes, what a fit fact holds) in the report, for B5. Add the fixtures R1 found missing, checked with `parse.mjs`: a whole-list denial (R1-1 row 4), and `hual` / `hal` (R1-6, decided A). The encoding is E1; speed and size are not optimized in this proposal.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/fixtures/solve-*`.

**B2 Solve and explain.**  
`proposal-worker`, `model: opus`, effort `high`.  
`src/interpret/solve.ts`, the only importer of `clingo-wasm`: `follows(log, question, options)` (cautious), `couldBe` (brave), and `clashes(log)`. Options: `defaults` (everyday defaults for open universals), `closedWorld` (the unsaid is false); an answer that used either names it, as `Match.switches` does. A question answers *yes*, *no* or *cannot say* per the [Sketch](#sketch), with `because` as the reading ids from the `fired` walk, ready for `whyReply`. `clash` atoms with the one removal pass. A program text over about 1 MiB is refused with a reply that says so, never a crash; brave runs pass `--quiet=1` (S1: 2.0 s without it at 2,000 readings, 0.3 s with). Tests: the worked example's answers and *why* ids, the two smallest clashes, the hinge chain, numbers, and that the two engines agree on every one-step `widen` and `infer` case in `match.test.ts`.  
**May edit:** `src/interpret/solve.ts`, `src/interpret/solve.test.ts`.

**B3 Clashes under choices.**  
`proposal-worker`, `model: opus`, effort `medium`.  
In `solve.ts`, as decision S1-1 settles: when the program has more than one world, re-solve with the switch atoms free: one optimization run for a smallest set to give up (`giveUp(log)`), and QuickXplain for a smallest clash; `clashes` uses them only when needed. *Why not*: `whyNot(log, claim)` adds the claim as a reading and returns the smallest clash it joins. Tests on fixtures with *or* and open universals, and on the clash example (sets {s1, s2, s3}, {s1, s4, s5}; give up {s1}).  
**May edit:** `src/interpret/solve.ts`, `src/interpret/solve.test.ts`, `src/interpret/fixtures/solve-*`.

**B4 Entries: CLI and browser.**  
`proposal-worker`, `model: opus`, effort `medium`.  
`reading.mjs solve [--json] [--possible] [--defaults] [--closed] [--window N] FILE '<question>'`, plus `reading.mjs clashes [--give-up] FILE`, with replies drafted through `reply.ts` (*why*, *these cannot all hold*). Browser: `src/interpret/solve-browser.ts` that loads `clingo-wasm` in a worker on the first call, exported beside `browser.ts`, and a test that a Vite build of a one-line entry importing it succeeds (`worker: { format: "es" }`). If the site's build cannot bundle the worker, stop and report.  
**May edit:** `src/interpret/cli.ts`, `src/interpret/cli.test.ts`, `scripts/reading.mjs`, `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, a test file beside them.

**B5 Meta note.**  
`proposal-worker`, `model: opus`, effort `medium`.  
`docs/meta/solver.md` from what B1 to B4 produced: the encoding, the confirmed group (a) translation table (each row citing its classification table row and grammar anchor), the API and its options, what each job returns, the CLI, and the rule that each new row is confirmed by the user when written. One line in [interpreter.md](../../meta/interpreter.md) under [switches](../../meta/interpreter.md#switches) pointing to it, and `steps.ts` named where that note lists the matcher's files. Report an `AGENTS.md` Editor notes row (solver: translation table, encoding, jobs); the orchestrator applies it.  
**May edit:** `docs/meta/solver.md`, `docs/meta/interpreter.md` (two lines).

**R2 Draft the group (b) and (c) rows.**  
`proposal-worker`, `model: opus`, effort `high`.  
As R1, for holders and say words (group (b)) and because, contrary-to and fault (group (c)), reading `docs/meta/solver.md` for the encoding. For group (c), also draft the attack relation *what stands* uses: which stated relations count as an attack between two readings, and which semantics a consumer gets by default (grounded, with stable and preferred as options). Add F1-style fixtures for each row, checked with `parse.mjs`. Rows go under **Open decisions** with recommendations.  
**May edit:** `src/interpret/fixtures/solve-*`, this proposal (Open decisions and Findings only).

**Order:** B0, B1, B2, B3, B4, B5, R2, in sequence (shared files). The orchestrator applies the `AGENTS.md` row after B5 and commits it with B5. **Stop for the user to confirm the group (b) and (c) rows.**

### Phase 3: build groups (b) and (c), and what stands

**B6 Holders and say words.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (b) rows in `translate.ts`, with golden programs and `solve.test.ts` cases: one holder's own beliefs can clash, two holders' never do, a say word's content stays wrapped.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/solve.test.ts`, `src/interpret/fixtures/solve-*`.

**B7 What stands.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (c) rows in `translate.ts`, the attack relation, and `stands(log, options)` in `solve.ts` with the ASPARTIX encodings (grounded by default; stable and preferred as options), credulous through brave and skeptical through cautious consequences. `reading.mjs stands [--semantics S] FILE`. Tests on the R2 fixtures.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts`, their tests, `src/interpret/cli.ts`, `scripts/reading.mjs`, `src/interpret/fixtures/solve-*`.

**B8 Meta note, groups (b) and (c).**  
`proposal-worker`, `model: sonnet`, effort `medium`.  
Add the confirmed rows, the attack relation, `stands` and its CLI to `docs/meta/solver.md`. Report any change to the `AGENTS.md` row.  
**May edit:** `docs/meta/solver.md`.

**Order:** B6, B7, B8, in sequence. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)).

### Rule digest (pasted into every brief)

```
- Work only on your unit's items and files. Read AGENTS.md; never trust a form from memory.
- Ageben forms come from grammar pages and the parser. Check forms with one batched
  node scripts/parse.mjs --check-lexicon '<a>' '<b>' ...; keep --llm-prompt for working out
  what a sentence means. Root spellings come from npm run convert-word.
- No new grammar. A sentence that needs a form the grammar lacks is logged as a finding with
  the English and the nearest workaround; then move on.
- Tooling only: a translation row copies what a grammar page and the interpreter's
  classification table already say, and cites both. A meaning neither states is an open
  decision for the user, never a choice you make.
- Code: TypeScript, Node >= 24, run with npx --no-install tsx; tests with tsx --test beside the
  source (*.test.ts). Only src/interpret/solve.ts (and solve-browser.ts) import clingo-wasm.
- Never walk the parse tree; read Readings. Fitting is match()'s; step conditions are steps.ts's.
  If a reading lacks what the translator needs, stop and report: the fix is a classification
  table row, not a local walker.
- Clingo programs keep to the Clingo 5 / 6 common ground: no conditional literals in rule
  bodies, no _ inside not, no integer division.
- The loop (run) and host verdicts stay synchronous; never call the solver from them.
- Never link to a file under docs/proposals/; name it in backticks.
- Read slices: grep -n '^#' or npm run -s outline first, then the line ranges you need.
- Edits that repeat go in a script file under the scratchpad or tmp/scratch/, never inline.
- Verify with npm run verify -- --allow-generate (--fast inside an item); never paste raw build
  output. On a new error, read only that line of tmp/logs/verify-last.log.
- Do not commit; the orchestrator commits.
- Stop and report instead of working around: a premise no longer holds, later units would need a
  different design, or skipping would leave a broken state.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
  If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
  clean point, leave the tree green, and report: done, left (as steps), files touched.
- Report (about 150 words): done; files touched (count); verify line; findings or decisions
  logged; skips with reasons; AGENTS.md lines to change; anything the orchestrator must run;
  left; inefficient. Add the encoding or ids a later unit is briefed from.
```

Full rules a subagent may open if the digest does not settle a question: [interpreter.md](../../meta/interpreter.md) ([matching](../../meta/interpreter.md#matching), [the host](../../meta/interpreter.md#the-host), [scope statements](../../meta/interpreter.md#scope-statements)), [read-ageben.md](../../meta/procedures/read-ageben.md), and this proposal's [Sketch](#sketch) and [Research](#research).

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` after each unit, before its commit.
- Final gate, at the end of phase 3: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `clingo-solver <ID>: … [skip-cd]` with the co-author line. S1 commits the dependency with its Research. R1 and R2 commit only the proposal.
- Each phase ends with a commit of the consolidated proposal: phase 1 made 5; phase 2 about 8 with B0, phase 3 about 4 (the last deletes the proposal).

## Group (a) rows and decisions
<a id="group-a-rows-and-decisions"></a>

R1 drafted these rows; the user confirmed them and settled each decision on 2026-11-18. B1 builds them, and B5 copies them into `docs/meta/solver.md`.

**How the rows are written.** Atoms use English names for readability; the translator writes root ids. A claim is `holds(T)`, its denial `-holds(T)`; a classification is `holds(isa(X, K))`, so the one-line step rules can name the kind as a variable (Clingo has no variable predicate names; E1 keeps this shape). A first-mention noun is `nm(Id, Place)` (decision R1-3). A list term is `ls(Id, Place)`. Every rule carries `on(Id)`, and a twin `fired(Id, C)` rule with the same body; templates below show the `fired` line once per row. `fits(c(Id), P)` facts come from `match()`: the condition of reading `Id` fits claim term `P` (logged, nested, or a hinge's outcome). A universal's template is emitted per reading as a rule over `X`: Clingo cannot substitute `X` into a stored term, so `every(Id, Kind, Template)` can only mark that the step applied. `member/3` adds the pairing group from `claimMemberLists`, which *respectively* needs. Every row keeps to the Clingo 5 / 6 common ground.

### R1-1: the rows that copy a stated rule

Each row below reads one classification table row and copies what its grammar anchor states. Confirmed as listed.

1. **Plain claim.** `unit:vp` / `unit:np` / `unit:predicate` (`clause.md#who-acts-and-the-action`, `predication.md#identity`). `holds(T) :- on(Id).` `fired(Id, T) :- on(Id).` A predicate `/ɡ/` gives `holds(isa(X, K))`. Denial fixture d1: `holds(walk(azozon)) :- on(d1).`; d3: `holds(isa(azozon, dog)) :- on(d3).`
2. **Denial on a verb or a term.** `joinSeries:u`, frame:polarity, list reach (`joins.md#negation-u`, `verb-and-stance-joins.md#vp-clause-forms`): the join denies only its items, each one (*neither A nor B*), and the rest of the clause stands. `-holds(T[item]) :- on(Id).` for each item. `fired(Id, -T) :- on(Id).` Open `-m` denies the same stated items. d2: `-holds(walk(azozon)) :- on(d2).`; d4: `-holds(isa(azozon, dog)) :- on(d4).`
3. **A clash.** `clash(P) :- holds(P), -holds(P).` (Sketch, *naming a clash*). d1 + d2 give `clash(walk(azozon))`, d3 + d4 `clash(isa(azozon, dog))`. Where the two terms are not the same term but `match()` says they fit, the clash joins on `fits`; B1 picks the shape.
4. **Whole-list denial** (*not both*, `vowurol veruvol val vul.`). `joinSeries:u` over a closed list as its one item (`set-joins.md#exclusivity-and-denying-a-whole-list`). `clash(notall(Id)) :- holds(T1), holds(T2), on(Id).` with `fired(Id, notall(Id))`. No F1 fixture; F1 or B1 adds one.
5. **If.** `overlay:clause_hinge:th` / `:g`, frame:hinge (`causation.md#if`): "whenever the condition holds, the outcome holds too", and saying *if* "does not claim the condition is true", so the nested reading is not emitted as `holds`. `holds(Out) :- fits(c(Id), P), holds(P), on(Id).` `fired(Id, Out) :- fits(c(Id), P), holds(P), on(Id).` Hinges fixture h1 + h2 + h3:

   ```prolog
   holds(walk(azozon)) :- on(h3).
   fits(c(h1), walk(azozon)).   fits(c(h2), sit(alazun)).   % from match()
   holds(sit(alazun)) :- fits(c(h1), P), holds(P), on(h1).
   holds(sleep(ahelan)) :- fits(c(h2), P), holds(P), on(h2).
   ```

   A hinge on a command makes no claim (`causation.md#if`): the force frame has no group (a) row, so the turn is `beyond`.
6. **Only if.** Same rows (`causation.md#only-if`): "the outcome cannot hold without the condition". `-holds(Out) :- fits(c(Id), P), -holds(P), on(Id).` With h1o + h4: `-holds(walk(azozon)) :- on(h4).` gives `-holds(sit(alazun))`, citing h1o and h4. The other direction is R1-5.
7. **Iff.** `thehom` (`causation.md#only-if`): rows 5 and 6 together. h1i + h3 gives `sit(alazun)`; h1i + h4 gives `-sit(alazun)`.
8. **Closed every kind.** `joinSeries:ua` frame:binder + `shared:kind` (`universals-domains.md#universals-domains-generics`, `usually-vs-must.md#general-claims`: closed `-l` "allows none" [exceptions]); step `universalInstance`. `holds(T[X]) :- holds(isa(X, K)), on(Id).` `fired(Id, T[X]) :- holds(isa(X, K)), on(Id).` With the verb denied (`zual gogozel vezuvel vul.`, *each cat does not sleep*) the head is `-holds(T[X])`. A hinge on it holds for each member (`usually-vs-must.md#how-things-work`): the hinge's rule takes the same `holds(isa(X, K))` in its body. Clash fixture s1 + s3 + s4 + s5:

   ```prolog
   holds(fly(X)) :- holds(isa(X, bird)), on(s1).
   holds(isa(azozon, penguin)) :- on(s3).   holds(isa(azozon, bird)) :- on(s3).
   holds(isa(alazun, bird)) :- on(s4).
   -holds(fly(alazun)) :- on(s5).
   clash(P) :- holds(P), -holds(P).          % clash(fly(alazun)): s1, s4, s5
   ```

9. **Open every kind.** `zuam` + `shared:kind` (`universals-domains.md#not-every`: "you only do not rule them out"; Sketch, adopted 2026-11-18). `{ holds(T[X]) } :- holds(isa(X, K)), not -holds(T[X]), on(Id).` `fired(Id, T[X]) :- holds(T[X]), holds(isa(X, K)), on(Id).` With everyday defaults switched on: `holds(T[X]) :- holds(isa(X, K)), not -holds(T[X]), on(Id), switch(defaults).` Worked fixture s1 + s6: `holds(isa(ahelan, bird)) :- on(s6).` gives *cannot say* and *could be* for `fly(ahelan)`.
10. **Membership.** `joinSeries:a` (`joins.md#and-lists-a`, `list-structure.md#respectively`), steps `memberList` / `claimMemberLists` / `collective`. The claim keeps its list term, and `holds(T[X]) :- member(ls(Id, z), X, G), on(Id).` for one list; for *respectively*, `holds(T[X, Y]) :- member(ls(Id, z), X, G), member(ls(Id, d), Y, G), on(Id).` Lists fixture: l1 gives `walk(azozon)` and `walk(alazun)`; l2 gives `see(azozon, nm(l2, d1))` and `see(alazun, nm(l2, d2))`; l3 (two unpaired lists) and l4 (collective `-x`) get no `member` facts and give only their list claim. s3's predicate list `gawozal gebezel gal` gives both `isa` facts this way.
11. **Compound head.** Step `compoundHeads` (`compounds.md#two-roots-one-word`). `head(robin, bird).` and `holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).` Compound fixture: k1 gives `isa(azozon, bird)`; k2 gives `isa(nm(k2, d), bird)`, so *Ahelan sees a bird*; k3 gives no `isa(alazun, robin)`, since the rule runs only from compound to head.
12. **Numbers.** `wordFamily:number` / `lexReading:number` (`numbers.md#counts`), Sketch *numbers* (adopted). For each pair of values in the log, `compareValues` gives `less(V1, V2)` or `same(V1, V2)`; for each value and each stated range or ray, `within(V, R)`. A counted noun is `count(nm(Id, P), V)`. Numbers fixture: n1 `count(nm(n1, d), v(3))`, n2 `count(nm(n2, d), v(5))`, `less(v(3), v(5))`; asked *more than three*, `within(v(5), above(v(3)))` holds and no `within` fact holds for `v(3)`, so n2 answers it and n1 does not. The question's fit to a `within` fact is decided in TypeScript, not by `match()`, which compares numbers by value only; B1 places it. n5 (`grawagel`) and n6 (`gral`) carry no value and get no facts. Ranges and rays on a counted noun wait on R1-7; *more cats than dogs* on R1-8.

### R1-2: *No K* (`zul` + kind)

Once B0 makes the reader classify `zul` + kind as `shared:kind` with a binder frame carrying its polarity (`universals-domains.md#universals-domains-generics`, `#not-every`), *no K* is row 8 with the head denied: `zul gawozal vewobol.` gives `-holds(fly(X)) :- holds(isa(X, penguin)), on(s2).` With no verb (`zul godozel.`, *there is no dog*), the kind itself is denied: `clash(none(Id)) :- holds(isa(X, dog)), on(Id).`

### R1-3: first-mention nouns (`slot:newMember` binder)

A row in group (a) (`joins.md#everything-ua`): a fresh constant per reading and role, `nm(Id, P)`, with its kind and details as facts (`holds(isa(nm(k2, d), robin)) :- on(k2).`). Two readings of *a dog* are two dogs, and a question still matches by root (question filters, decision 18). A denial *not … a dog* has no constant to deny and takes row 2 on the root's kind; B1 tests it.

### R1-4: the matcher's steps in a solver job

Membership and closed universal to instance always run in a solver job, since the pages state them as what the sentence says. `widen` (compound head) stays a switch, `switch(widen)`, named in the answer, since a compound's head is the lexicon's. Every answer names its readings and, through `fired` and `used`, the step.

### R1-5: condition hinges run both ways

*If* also gives `-holds(Cond) :- -holds(Out), on(Id).`, and *only if* also gives `holds(Cond) :- holds(Out), on(Id).`, so *Alazun sits only if Azozon walks; Alazun sits* gives *Azozon walks*. The derived condition is the hinge's nested term, joined to other claims through `fits`; `fired` names the hinge.

### R1-6: `hual` (*always*) and `hal` (*never*)

Bare `hual` holds at every time, so it covers whatever time a plain sentence is about; the restrictors page (*Always*) now states this. Bare `hual` + P gives row 1, `holds(P) :- on(Id).`, plus the marker `always(P)`, and a plain denial clashes with it. Bare `hal` (*never*) gives `-holds(P)` plus `never(P)`. Open `huam` gives row 9's choice rule. `hual` with listed exceptions (*always except when it rains*) and `hal` with listed occasions (*only when*) give only their marker, since a plain claim may fall on a listed occasion; occasions as terms are later work. B1 adds a fixture with bare `hual`, bare `hal`, `huam`, and an exception list.

### R1-7: ranges and rays on a counted noun

Once B0 puts a span between two numbers in a counted noun phrase as a `detail:range` on the noun's number term (`ranges.md#ranges`, `open-ranges.md#rays`), row 12 builds `within` facts from it.

### R1-8: *more cats than dogs* with no counts (n7)

`zogozelx zodozelx zol gral.` (a rank list, `joinSeries:o`, with a shared scale word) is data, `holds(more(amount, cats, dogs))`, answered only when asked as said, with no link to counts. Linking it to stated counts waits until `comparative-arity.md#amount-scale` states it.

### R1-9: standalone `thul` (*no judgment*) and its kin

`zazozon vowurol thul.` (and `thum`, `thur`) emits the claim as row 1, with the frame noted on the reading so a reply can mention it: "the claim itself is untouched" (`verb-and-stance-joins.md#standalone-stance-joins`). A denial of a stance (`thomam thul`) sits in the stance's list and waits for the stance row.

### S1-1: clashes under choices

Re-solve, as the Sketch plans ([naming a clash](#naming-a-clash)): plain programs and run options, one optimization run for a smallest set to give up, QuickXplain for a smallest clash. A Lua `#script` main with assumption cores (works, S1) waits until a consumer measures a slow clash.

### E1: encoding

The lowest-risk shape, with speed and program size not optimized (user, 2026-11-18):

- **One `holds/1` predicate** around every claim, with `isa(X, K)` inside, as the rows above are written. The generic rules (`clash`, the step rules) stay one line each. A predicate per root grounds 2–4× faster (S1) and waits until a consumer needs the speed.
- **Provenance carries its premises.** Each rule has its `fired(Id, C)` twin and, for each atom in its body, `used(Id, C, Premise)` with the same body, so *why* is a plain walk over the answer set: from a conclusion through `used` to the readings whose `fired` produced each premise. No body re-matching in TypeScript.
- **Fits are computed before solving**, by `match()`, against every term the log holds (stated claims, nested clauses, universal templates with their members), as the Sketch says. A question is matched against the answer set afterwards, in TypeScript.
- **Closed world** (`closedWorld`): a `candidate(P)` fact for each term the log or the question mentions, and `-holds(P) :- candidate(P), not holds(P), switch(closed).`
- **Size.** No patch to `clingo-wasm`. B2 refuses a program text over about 1 MiB with a reply that says so; the limit is the package's fixed WebAssembly stack, which `run.js` copies the program onto.

## Open decisions

None open for phase 2. R2 adds the group (b) and (c) rows and the attack relation here, each with options and a **Recommendation:**.

## Findings

F1 found no sentence the grammar could not say. *(R2 writes here: each sentence the grammar could not say, with its English and the workaround used.)*

## Background

### Problem

The interpreter's matcher is structural on purpose: it finds the readings that say a thing, and never works out what else must be true. Its two switches (`widen`, `infer` in `src/interpret/match.ts`) take one step each and say so. Four jobs need more, and each would otherwise grow its own search code:

| Job | Who wants it | What the matcher cannot do |
|-----|--------------|----------------------------|
| **What follows** | Ageben Spec, structural search, knowledge store, who knows what | chain a condition to its result, or several steps together, and say which readings it used |
| **What clashes** | Ageben Spec, agent permissions, knowledge store, argument map | show that a set of sentences cannot all hold, and name the smallest set that clash, or the smallest set to give up |
| **What stands** | argument map | weigh claims against the objections stated to them and say which survive |
| **What can be done** (later) | the wizard, logic grids | prove a quest reachable, find its shortest walkthrough, generate a puzzle with one solution |

All four are one problem: find the worlds consistent with what was said. That is what an answer-set solver does.

### Goals

- One module, `src/interpret/solve.ts`, is the only code that talks to Clingo. Consumers ask it what follows, what clashes, and what stands, and every answer names the readings that decided it, by the ids `whyReply` already takes.
- A translation table in a meta note, one row per frame family, each row citing the classification table row it reads from and confirmed by the user when it is written.
- The matcher's step conditions are defined once and called by both engines.
- It runs in Node and from the site's browser entry, loading the solver only when a job first runs.

### Non-goals

- **No second grammar authority.** The translation table reads from the classification table and cites it. It never states a meaning of its own.
- **No inference by default.** A solver job runs only when a consumer asks for it, and every answer found through one says so and names the readings.
- **No change to the loop.** `run` and a host's `verdict` stay synchronous and never call the solver; the solver is its own asynchronous entry, which a consumer calls before or beside the loop.
- **No probability.** How strongly a channel supports a claim is not something this solver weighs.
- **No paraphrase.** A different root is still a different claim.
- **No arithmetic across claims**, no Clingo extension, and no second engine (s(CASP)). None of Clingo's extensions has a build that runs on the site, none covers every number form the grammar has (decimals, percent, fractions, rays, *about*), and s(CASP) would add a whole Prolog of 13.7 MB.
- **No held ground program.** Each job grounds its program again. Switching readings on a held program (`knowledge-store.md`) waits for that consumer; S1 measures whether it will be needed.
- **No wizard integration**, and no *what can be done*: user, 2026-11-18.

### Sketch

**Clingo** is an answer-set solver from Potassco. A program is facts, rules, choices and constraints; the output is every consistent world, or none. Its `not` means *not shown*, so a rule can hold by default and give way to an exception. It runs as the `clingo-wasm` package in Node and on the site, where it loads in a worker the first time a solver job runs (about 0.9 MB gzipped). The package bundles Clingo 5.8, so the translator writes programs that mean the same under Clingo 6 ([Research](#research)). Its calls are asynchronous, so the solver is its own entry, never a step inside the loop.

`src/interpret/solve.ts` sits beside the matcher and is the only code that talks to Clingo. The translation lives in `src/interpret/translate.ts`, and the step conditions both engines share in `src/interpret/steps.ts`:

1. **Translate.** Each `Reading` in the log becomes facts and rules. Its `claim` (verb, `z` / `d` / `b` roles, predicate, details) becomes a term, and each frame wraps that term, so frames stay data and never leak: *Ana says Lee paid* is `said(ana, paid(lee))`, not `paid(lee)`. A hinge's clauses are already nested readings in the frame's `content`, and a holder is the frame's `party`. A translation table, one row per frame family, lives in `docs/meta/solver.md` and cites the classification table row it reads from. A frame with no row is left out of the program and is reported like an `unread` part today: the turn is `beyond` for that job.
2. **Switch.** Every reading is switched by one atom, `on(Id)`, and every rule carries the reading id it came from and derives a `fired(Id, Conclusion)` marker.
3. **Solve, then explain.** Walking the `fired` markers back from a conclusion gives the readings that decided it. A contradiction derives a `clash` atom instead of ending the world, so the same walk names the readings that clash ([naming a clash](#naming-a-clash)). Both come back as reading ids, which is what `whyReply(because)` in `reply.ts` already takes.

**Fitting stays the matcher's.** Whether a stated claim fits a condition, or a question, is decided by `match`, never by Clingo's term equality, so roots, referents, details and blanks keep the matcher's rules. The translator runs `match` over each condition and the claims that could meet it (logged and nested readings, and a universal's template with its instance) and emits the fits as facts that the rules join on. A question is matched in TypeScript against the claims the consequences name. B1 designs the encoding under this constraint; if it cannot keep the matcher's rules, B1 stops and reports.

**What a question asks of the worlds.** *Does it follow?* is true in every world (Clingo's cautious consequences); *could it be?* is true in some world (brave consequences). Both are a run option, not a new program. A question answers *yes* when the claim holds in every world, *no* when its denial does, and *cannot say* otherwise.

#### What the solver may conclude
<a id="what-the-solver-may-conclude"></a>

- **Open and closed generalizations.** [Usually vs must](/usually-vs-must#general-claims) teaches that a closed fence (`zual`, `hual`) allows no exceptions and an open one (`zuam`, *as a rule*) leaves them *not ruled out*. So a closed generalization is a strict rule, and an open one gives only *could be*: a member may hold, in some world, unless a stated denial or strict rule rules it out. A host that wants everyday defaults (an open claim holds of a member until an exception is shown) switches them on, and every answer that used one names the switch, as `widen` and `infer` are named today. (*Must* as a rule someone sets is a say word, not a fence.)
- **The unsaid.** The reader's rule is *not stated stays empty* (reader rule 4). By default the solver keeps it: `not` appears only inside an exception check, and a question about something never stated answers *cannot say*. A host whose world is closed (a game) may declare that the unsaid is false. Either way, the solver can answer *no* from a stated denial or a strict rule, which the log alone never does today (`defaultVerdict` in `run.ts`); the answer names the readings, so the step is visible.
- **Numbers.** Number stems stay opaque terms. For the values that appear in the log, the translator adds order and range facts computed in TypeScript (`compareValues` in `value.ts`), which covers *more than*, rays and ranges. A stem with no value (digitless words, the ends of a ray) gets no order facts, so a question that needs one answers *cannot say*. Arithmetic across claims (*three plus two*) stays out; a second solver for it would be its own idea.
- **The first rows.** The translation table grows one job at a time: (a) polarity, condition hinges and closed and open universals, for *what follows* and *what clashes* in Ageben Spec; (b) holders and say words, for permissions and who knows what; (c) because, contrary-to and fault, for *what stands*. Each row is a decision the user confirms when it is written: R1 drafts group (a), R2 groups (b) and (c).
- **The matcher's steps.** The matcher has two switches (`src/interpret/match.ts`): `widen` (a compound matches on its head) and `infer` (a member of an *and* list whose pairing is stated, and a closed `zual` + kind to an instance; neither with a collective `-x` verb or a list frame). The solver needs the same steps as rules, so it can chain them. The conditions for each step stay TypeScript functions that read one reading (`memberList`, `claimMemberLists`, `collective`, `universalInstance`, the lexicon's compound heads), and both engines call them. The matcher uses them as today; the translator uses them to emit facts where a step applies (`member(L, X)`, `every(Id, Kind, Template)`, `head(Compound, Root)`), and the solver's rules only apply those facts, one line each. So each condition is defined once, the matcher stays synchronous and needs no WASM, and a test that the two engines agree on one-step cases guards only the one-line rules. Checked 2026-11-18: each condition reads one claim, its reading's pairing links, and the lexicon, nothing across readings.

**Worked example: what follows, and what clashes.** Four readings, shown here in English:

- s1: *Birds usually fly.*
- s2: *Penguins never fly.*
- s3: *Pingu is a penguin, and a bird.*
- s6: *Robin is a bird.*

```prolog
{ holds(fly(X)) } :- holds(bird(X)), not -holds(fly(X)), on(s1).  % open: could be
-holds(fly(X)) :- holds(penguin(X)), on(s2).                      % strict
holds(bird(pingu)) :- on(s3).   holds(penguin(pingu)) :- on(s3).
holds(bird(robin)) :- on(s6).
fired(s2, -fly(X)) :- holds(penguin(X)), on(s2).
```

Asked *does Pingu fly?*, the solver gives *no*, and the *why* reply cites s2 and s3. Asked *does Robin fly?*, it gives *cannot say*: Robin flies in some worlds, not in all, and *could Robin fly?* gets *yes*, citing s1 and s6. With everyday defaults switched on, s1 becomes `holds(fly(X)) :- holds(bird(X)), not -holds(fly(X)), on(s1).` and Robin flies, with the switch named. Change s1 to *all birds fly* (a closed universal, `zual`) and s1, s2 and s3 clash, and the reply says those three cannot all hold. The grammar already keeps closed and open generalizations apart; this is the first tool that would act on the difference.

#### Naming a clash
<a id="naming-a-clash"></a>

A clash has two answers. A **smallest clash** is a set of readings that cannot all hold, where dropping any one makes the rest consistent: *why is this contradictory?* A **smallest set to give up** is a set whose removal makes everything else consistent: *what should I drop?* Every set to give up takes at least one reading from every clash, so either answer gives the other. Add two readings to the example, with s1 as *all birds fly*:

- s4: *Tweety is a bird.*
- s5: *Tweety doesn't fly.*

There are two smallest clashes, {s1, s2, s3} and {s1, s4, s5}, and one smallest set to give up, {s1}. The reply names each clash on its own line (*These cannot all hold: s1, s2, s3.*) and, when the consumer asks, the set to give up (*Giving up s1 resolves both.*).

The translator writes a contradiction as a derived atom, not a constraint:

```prolog
clash(P) :- holds(P), -holds(P).
```

The program then always has a world, and the `fired` markers behind each `clash(P)` name its readings in one run. That is exact when the program has one world, which holds for the first rows (denials, condition hinges and closed universals are plain rules). A `clash` found this way can carry a reading it does not need, when a fact was derived two ways; one removal pass over those few readings shrinks it.

**Clashes under choices.** *Or*, *maybe* and open generalizations make several worlds, and a clash may hold in some of them only. Then the solver re-solves with the switch atoms free:

- One optimization run maximises the readings kept; the readings left out are a smallest set to give up.
- A smallest clash follows by switching readings off one at a time, or by halves (QuickXplain), keeping each one whose loss restores a world.

Both use only plain programs and run options, so they work on Clingo 5 and 6 alike. Clingo's assumption cores would be faster, but `clingo-wasm`'s JavaScript API does not expose them.

**Why not.** *Why is this not allowed?* has many failed routes. The solver adds the conclusion as a reading and reports the smallest clash it joins: one reason, which is what a reply needs. A goal-directed solver (s(CASP)) would give the whole tree, at the cost of a second engine of 13.7 MB.

Frames stay data, so *Ana says Lee paid* and *Ben says Lee didn't pay* never clash: `said(ana, paid(lee))` and `said(ben, -paid(lee))` are two facts. Whether one person's beliefs clash among themselves is a holder row (group (b)) and `who-knows-what.md`.

**What each job uses:**

| Job | Solver feature | Explanation |
|-----|----------------|-------------|
| What follows | rules, cautious consequences | `fired` markers |
| What clashes | `clash` atoms; switch atoms when there are choices | `fired` markers behind each clash; re-solving when there are choices |
| What stands | the standard ASPARTIX encodings of attack between claims (grounded, stable, preferred) | the attack graph itself |
| What can be done (later) | choices, minimising | the plan; a missing plan has only a partial answer |

The wizard already checks its quests without a solver: each quest has a hand-written `QuestModel` (`src/game/quests.ts`) and `checkReachability` (`src/game/reachability.ts`) searches it. The solver adds to that only when the wizard wants generated quests, hints, or one-solution mysteries (`wizard-adventure.md`), so it waits.

### Research
<a id="research"></a>

Done 2026-11-18 from the package's metadata, README and type files, then run by S1 (2026-11-18): the worked example, an optimization run, a Lua main, and synthetic programs of the worked example's shape, under Node 24.21 with `tsx`.

**Measured (S1).**

- **Loading.** `import clingo from "clingo-wasm"` resolves the `node` export and runs under `tsx` with no setup; the file must be ESM (the repo's `"type": "module"` covers `src/`; a `.ts` file outside it needs `.mts`). `init()` takes about 0.8 s, once per process.
- **Consequences.** On the worked example, `--enum-mode=cautious` gives one witness with the four atoms true in every world (`-holds(fly(pingu))`, no `holds(fly(robin))`), and `brave` adds `holds(fly(robin))`: *no* for Pingu, *cannot say* but *could* for Robin, as the Sketch says. The closed s1 with `:- holds(F), -holds(F).` is UNSATISFIABLE.
- **Optimization.** Free `{ on(s1); on(s2); on(s3); on(s6) }.` with `#maximize { 1,R : on(R) }.` and `--opt-mode=optN` gives OPTIMUM FOUND, cost `[-3]`, and the three optimal sets, each one of s1, s2, s3 left out.
- **JSON shape.** `{ Solver, Call: [{ Witnesses: [{ Value: string[], Costs?, Consequences? }] }], Result, Models: { Number, More, Optimum?, Costs?, Cautious? / Brave? }, Time: { Total, Solve, … } }`. Witness atoms are strings (`"-holds(fly(pingu))"`, `"fired(s2,-fly(pingu))"`). `Result` is `SATISFIABLE`, `UNSATISFIABLE`, `OPTIMUM FOUND`, or `ERROR` with an `Error` string; an error does not throw. `Call[0]` is `null` when unsatisfiable. Use `--quiet=1` with `brave`: without it every intermediate witness is printed and parsed (2 s instead of 0.3 s at 2,000).
- **Lua main.** Works: one `prg:ground`, then `prg:solve{assumptions=…, yield=true}` and `handle:core()` give the core `on(s1), on(s2), on(s3)`, and a second solve on the same ground program without s1 is satisfiable. `print` from Lua corrupts the JSON (`Result: ERROR`); report through facts added with `prg:add` and a last solve. `solve{on_core=…}` returned no core.
- **Size limit.** A program text over about 1 MiB fails with `RuntimeError: memory access out of bounds` (1.03 MB of facts runs, 1.15 MB fails), so 20,000 readings in the `holds(k(X))` encoding did not run. Every run grounds again, and grounding grows faster than linearly when many rules share one predicate.

Synthetic program: per group of four readings, a kind fact, an exception-kind fact, an open rule `{ holds(fly(X)) } :- holds(kI(X)), not -holds(fly(X)), on(gI).` and a strict denial, each guarded by `on/1`. Clingo's `Time.Total` in seconds (solving is under 0.02 s in every row; the rest is grounding):

| Readings | `holds(kI(X))`, cautious | brave (`--quiet=1`) | kind as its own predicate `kI(X)` |
|---|---|---|---|
| 200 | 0.012 | 0.010 | |
| 2,000 | 0.27 | 0.28 | 0.12 |
| 5,000 | 1.6 | | |
| 10,000 | 5.9 | | 1.4 |
| 20,000 | fails (1.19 MB text) | | 5.4 (0.93 MB) |

**What the interpreter gives the translator.**

- A `Reading` (`src/interpret/types.ts`) has an `id` (`<text>:<utterance>.<body>` plus a clause path), a `claim`, `frames` in text order, the `order` between frames (from the pair table), `unordered` pairs, `links` to other readings, and `unread` parts.
- There is no polarity field: a denial is a `polarity` frame, either on a list term (a `u` join denies only its items) or on the whole clause.
- Frames nest: a hinge's or quote's clause is a nested `Reading` in `content`, and a holder is the frame's `party`.
- Values (`value.ts`) are JS floats with a percent kind, ranks, or codes. Digitless words, infinite ray ends and fractions (`g-N`) carry no value, and `compareValues` orders only like with like.
- The *why* reply takes reading ids and held-state sources; a question's verdict is `yes`, `no`, `unknown` (*I can't say.*) or a fill.
- The loop (`run`) and a host's `verdict` are synchronous.

**`clingo-wasm` 0.6.0.** Apache-2.0; Clingo 5.8.1 with Lua 5.4.6, no Python. Single-threaded and threaded builds, 0.93 MB gzipped. It runs in a worker in Node and the browser; threads need a cross-origin isolated page, otherwise it falls back to one thread. Vite needs `worker: { format: "es" }`.

- **API.** `run(program, models, options, onModel)`, `stream(program, models, options)`, `init(wasmUrl)` and `restart()`. `options` are Clingo's command-line flags, so `--enum-mode=cautious` / `brave` and optimization flags work. The result is Clingo's JSON output: `Result` (SATISFIABLE, UNSATISFIABLE, OPTIMUM FOUND, UNKNOWN), witnesses as lists of atom strings, costs, and timings.
- **One-shot.** Each `run` grounds the whole program again. Holding a ground program between solves is possible only inside a Lua `#script` main (works, S1).
- **Cores.** The JavaScript API has no assumption or core call; a Lua main gets a core (S1). The Sketch still has clashes under choices re-solve ([naming a clash](#naming-a-clash)).

**Clingo 5 / 6 common ground.** `clingo-wasm` has no Clingo 6 build. A program means the same under both when it has no conditional literal in a rule body (6 needs every condition, not any), no `_` inside `not` (6 makes it a fresh variable), and no integer division (6 floors). A golden test that solves the translator's output under the bundled version shows any drift when the package moves to 6.

**Cost of re-solving.** Removal one at a time is one solve per reading, and each `clingo-wasm` call grounds the whole program again; QuickXplain needs about k·log(n/k) solves for a clash of k among n.

**Argumentation.** The ASPARTIX encodings for *what stands* are plain Clingo programs:

- grounded semantics is stratified, so it has one world and is fast
- stable and complete are normal programs
- preferred and semi-stable need disjunction, which Clingo supports

Credulous (some extension) and skeptical (every extension) acceptance map onto brave and cautious consequences.
