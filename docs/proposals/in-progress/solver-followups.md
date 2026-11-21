# Solver follow-ups: matching, suppositions, fixture labels, and moving declarations

**Status:** IN PROGRESS, 2026-11-21. Phase started. User, 2026-11-21: the four questions left from the coverage work are settled as recommended: 1 (a), 2 (b), 3 (a), 4 (b) ([Decided](#decided)); also fix the fixture-label bug and add a `move-decl` tool.  
**Related:** [solver.md](../../meta/solver.md) (translation table rows 34 and 45, the edge, the fixture paragraph); [interpreter.md](../../meta/interpreter.md#matching) (matching); [code-layout.md](../../meta/code-layout.md#splitting-a-file); `src/interpret/match.ts`, `translate*.ts`, `translate.test.ts`, `solve.test.ts`, `fixtures/solve-lists.txt`, `fixtures/solve-links.txt`; `scripts/deps.ts`, `scripts/lib/deps.ts`, `scripts/outline.ts`; grammar page [notional](/notional) (read only).  
**Depends on:** none.  
**Design authority:** none. No form or reading changes: solver matching, one solver term, a test helper, and a tool.

## Decided

User, 2026-11-21, each as the coverage work recommended:

1. **A genitive on one noun and on a joined list** (a): the matcher treats a genitive the reader puts on the clause as a detail of the `z` noun, so *does Ahelan's cat walk?* (`yel zogozel om bahelan vowurol.`) fits a log that says *Ahelan's dog and cat walk* (`zodozel zogozel zal om bahelan vowurol.`), where the program writes the detail on each member.
2. **A ratio asked the other way round** (b): a ratio claim also fits its inverse, so *twice as big* (`zazozon zalazun zoel gelazem hradol.`) answers yes to *is Alazun half as big?* (`yel zalazun zazozon zoel gelazem hrudol.`) and the other way round. The atom is already shared; only matching changes.
3. **`yuor`** (a): keep it. Row 34 of [solver.md](../../meta/solver.md#translation-table) already says `-r` claims as `-l` and `-m` on both verdicts. Nothing to build.
4. **One holder per supposition** (b), replacing O-6's single holder: each stated NOTIONAL reading gets its own holder, `notional(Id)` with `Id` its reading id, and a sentence it carries to inherits that `Id` through its `carriedFrame` link. Two unrelated suppositions no longer clash with each other; steps inside one supposition still do (holder rule 4).

## Design

- **Matching (decisions 1 and 2)** changes what a question fits, never what a log says. A clause-level genitive on the question is read as a detail of its `z` noun before `match()` compares; a ratio claim also fits with its two members swapped and the factor inverted. Whichever side the change lands on (`match.ts` or the fitting claims `translate.ts` pools), the other fitting rules stay as they are.
- **The supposition holder (decision 4)** replaces `view(notional, T)` with `view(notional(Id), T)` in row 45. A question under NOTIONAL asks inside the view of the latest NOTIONAL reading in the log, the scene the conversation is on, as a carried frame continues; with no NOTIONAL reading in the log it answers unknown. This last rule is the plan's choice, not the user's ([Open decisions](#open-decisions)).
- **Fixture labels.** `translate.test.ts` writes `% id = label` into each golden by pairing the reading at index `i` with the fixture entry at index `i`. A turn with several readings shifts every later pair. The fix pairs each reading with its turn: the turn number in the reading id (`t:N.k`) indexes the entries. The goldens' label comments change; their programs do not.
- **`move-decl`** automates step 3 of [splitting a file](../../meta/code-layout.md#splitting-a-file): `npm run move-decl -- FROM NAME[,NAME…] TO` moves top-level declarations (functions, types, interfaces, consts, classes) from FROM to TO, a new or existing file, fixes the imports on both sides and in every importer, and runs the `deps --check-move` comparison itself, printing nothing for a pure move. `--method Class.name[,…]` does the [methods to functions](../../meta/code-layout.md#methods-to-functions) change: each method becomes `function name(tr: Class, …)` in TO, `this.` becomes the parameter inside it, and each `this.name(…)` call becomes `name(this, …)`. The moved text never passes through the model, which is what a script beats the Edit tool at. The TypeScript language service's *Move to file* refactor (`getEditsForRefactor`, TypeScript 5.2 and later; the repo has 5.9) is the first thing to try for the top-level move.

## Implementation plan

Run with subagents ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents)), in one phase. Every unit runs in sequence: L1, M1 and N1 share the solver tests and goldens, T1 and T2 the same script. At the end of the phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**L1 Fixture labels.**  
*orchestrator*.  
In `translate.test.ts` (the `labels` line in the golden writer), pair each reading with its fixture entry by the turn number in its id, not by its index. Regenerate the goldens with `UPDATE_GOLDEN=1 npm test`, and check that the diff touches only `% id = label` lines. Remove the **Fixture labels** bullet from the edge in [solver.md](../../meta/solver.md#the-edge).  
**May edit:** `src/interpret/translate.test.ts`, `src/interpret/fixtures/solve-*.lp`, `docs/meta/solver.md` (the edge).

**M1 Matching: the genitive and the inverse ratio.**  
`proposal-worker`, `model: opus`, effort `high`.  
Decisions 1 (a) and 2 (b), with the Design **Matching** bullet. Decision 1: in `solve-lists.txt` the entry `zodozel zogozel zal om bahelan vowurol.` and the case at `solve.test.ts` that asks `yel zogozel vowurol.` instead; add the question with the genitive, `yel zogozel om bahelan vowurol.` → yes, and keep the plain one. Decision 2: the `r11` cases (`solve.test.ts`, *twice as big* and *half as big*, entries in `solve-lists.txt`); the case that now expects unknown for the other wording expects yes, both ways round. Add each change to the matching rules in [interpreter.md](../../meta/interpreter.md#matching) and to the row in [solver.md](../../meta/solver.md#translation-table) that owns ratios, and remove anything about these two gaps from the edge.  
**May edit:** `src/interpret/match.ts`, `src/interpret/translate*.ts`, their tests, `src/interpret/fixtures/solve-lists.*`, `docs/meta/solver.md`, `docs/meta/interpreter.md` (matching).

**N1 One holder per supposition.**  
`proposal-worker`, `model: opus`, effort `high`.  
Decision 4 (b), with the Design **supposition holder** bullet. `view(notional, T)` becomes `view(notional(Id), T)`; a carried sentence takes the `Id` of the reading its `carriedFrame` link points to; holder rule 4 runs inside each view. Cases: lk41 keeps its clash inside one supposition; a new case with two separate NOTIONAL readings whose claims conflict gives no clash; a NOTIONAL question asks in the latest supposition's view. Rewrite row 45 of [solver.md](../../meta/solver.md#translation-table), whose sentence *Every NOTIONAL reading shares the one holder `notional`* goes, and add `notional` to the reserved names if the new term needs it. `translate-helpers.ts`, `solve.test.ts` and `solve-links.txt` / `.lp` hold today's term.  
**May edit:** `src/interpret/translate*.ts`, `src/interpret/solve.ts` (only how a NOTIONAL question is asked), their tests, `src/interpret/fixtures/solve-links.*`, `docs/meta/solver.md`.

**T1 `move-decl`: top-level declarations.**  
`proposal-worker`, `model: opus`, effort `high`.  
Build `scripts/move-decl.ts` and its `package.json` script, as the Design **`move-decl`** bullet describes, without `--method`. It refuses rather than guesses: a name not found, a name declared twice, or a move that would add a load-time read across a cycle (`deps --split` already finds these) stops it before it writes. Tests in `scripts/move-decl.test.ts` run it on small fixture files in a temp folder (a move to a new file, to an existing file, an importer repointed, a refused cycle) and wire into `npm test` the way `scripts/deps.test.ts` is. Rewrite step 3 of [splitting a file](../../meta/code-layout.md#splitting-a-file) to name the tool, keeping the script-by-line-range way as the fallback for what it refuses. Report the `AGENTS.md` change for the **Splitting code** tooling note (the orchestrator applies it).  
**May edit:** `scripts/move-decl.ts`, `scripts/move-decl.test.ts`, `scripts/lib/` (only to share code with `deps.ts`), `scripts/test.mjs` (only to register the test), `package.json` (the script line), `docs/meta/code-layout.md`.

**T2 `move-decl --method`.**  
`proposal-worker`, `model: opus`, effort `high`.  
Add `--method Class.name[,…]` to `move-decl`, following [methods to functions](../../meta/code-layout.md#methods-to-functions): the parameter name is `tr` unless a moved body already uses it as a local, then the first free one it tries; a moved name that clashes at a call site with a local or an import is renamed or the import aliased, and the tool prints which. It refuses a class with `private` members, or a move that needs a value import back into the class file at load time. Tests on a small fixture class. As a dry run (no write), check it on `src/interpret/translate.ts` against one method group, and report the `--check-move` output. Update [methods to functions](../../meta/code-layout.md#methods-to-functions) to name the flag.  
**May edit:** as T1.

**Order:** L1, M1, N1, T1, T2. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)) after the `AGENTS.md` tooling-note change from T1.

### Rule digest (pasted into every brief)

```
- Run .ts scripts with npx --no-install tsx, never plain node. Tests: npm test (node runner),
  never vitest.
- Solver fixtures: src/interpret/fixtures/solve-NAME.txt, "@ label" / Ageben line / "= English";
  goldens solve-NAME.lp rewrite under UPDATE_GOLDEN=1 npm test; read the diff of a regenerated
  golden before keeping it. Wiring: solver.md, the paragraph by the Files line.
- Probe in batches: all cases in one node scripts/reading.mjs probe FILE (cases split by ---), run
  once; --program only for one case (--case N, --terms a,b). npm run sweep --save / --diff
  around a solver change; npm run class-row -- KEY for classification rows.
- Clingo programs keep to the Clingo 5 / 6 common ground: no conditional literals in rule
  bodies, no _ inside not, no integer division.
- The loop (run) and host verdicts stay synchronous; never call the solver from them.
- Splitting or moving code: measure with npm run deps first (code-layout.md, splitting a file).
  Past 1500 lines a file prints a warning; never squeeze code to stay under.
- Never link to a file under docs/proposals/; name it in backticks.
- Read slices: npm run -s outline or grep -n '^#' first, then the line ranges you need.
- Edits: the Edit tool for short replacements, several calls in one response when they belong
  together. A script only when whole sections move or one change repeats in many places, written
  to a file under the scratchpad or tmp/scratch/, never inline; a script that quotes the old text
  word for word should be Edit calls.
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
  change; anything the orchestrator must run; left; inefficient.
```

Full rules a subagent may open if the digest does not settle a question: [solver.md](../../meta/solver.md), [interpreter.md](../../meta/interpreter.md) ([matching](../../meta/interpreter.md#matching)), [code-layout.md](../../meta/code-layout.md), [read-ageben.md](../../meta/procedures/read-ageben.md).

### Gates and commits

- `npm run verify -- --baseline` at the start of the phase; `npm run verify -- --allow-generate` after each unit, before its commit.
- No grammar prose changes, so no style gate and no recall gate.
- Final gate: a full `npm run verify` that passes against an empty baseline.
- Six commits: one per unit, `solver-followups <ID>: … [skip-cd]` with the co-author line, then a last one with the `AGENTS.md` tooling note that deletes this proposal.

## Open decisions

1. **What a NOTIONAL question asks about** (plan, 2026-11-21; review-later, N1 builds the recommendation and flags it). With one holder per supposition, a question under NOTIONAL needs a view. Options: (a) the latest NOTIONAL reading's view in the log; (b) any supposition's view, yes when one holds it; (c) `beyond`. **Recommendation:** **(medium)** (a): talk about a supposition continues the scene just set up, as a carried frame does, and (b) would mix unrelated scenes, the problem decision 4 removes.

## Background

### Problem

The coverage work left four cases where the solver answers what a learner would not expect: *unknown* where they expect *yes* (a genitive after a join, a ratio asked the other way round), a reading built past its row (`yuor`), and a clash between unrelated imagined scenes. Two process problems came up with them: the fixture goldens label readings wrongly after a turn with several readings, and splitting `translate.ts` meant moving method bodies by hand-written scripts.

### Goals

- Each case answers as the user decided.
- The goldens' label comments name the right fixture entry.
- Moving declarations between files is one command whose output is checked, with no moved text passing through the model.

### Non-goals

- Host policies the coverage work deferred (group views, one-way attacks, fewest clashes, *not ruled out*, likelihood thresholds).
- Rows still on the edge, such as hg11 and the *why* filler limits.
- A general replacement for the Edit tool.
