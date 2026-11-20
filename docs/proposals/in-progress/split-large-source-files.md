# Split the large source files under src/

**Status:** IN PROGRESS, 2026-11-20: phases 1 and 2 done. Phase 1 made `npm run deps`, the size lint and [code-layout.md](../../meta/code-layout.md), which owns the limits, the lint and how to split a file. Phase 2 split the parser: `sentence-grammar.ts` (the class, 223 lines), `src/parse/grammar/*-rules.ts` (six rule families), `sentence-shapes.ts`, `mark-context.ts`, `sentence-build.ts` and a new `sentence-parser.ts` entry. [code-layout.md](../../meta/code-layout.md#chevrotain-rule-families) owns the rule-family pattern and [parser-pipeline.md](../../meta/parser-pipeline.md) the file tree. Next is phase 3 (S2 to S5, then the close). Decided 2026-11-20, all as recommended: in scope are `translate.ts`, `morph-gloss.ts`, and the Keys and Context leaf of `read.ts`, not `enforce.ts`; `read.ts` keeps Terms, Units and Readings together; `Translator`'s condition methods move out as functions. **Runs unsupervised** (see [Implementation plan](#implementation-plan)).  
**Related:** [code-layout.md](../../meta/code-layout.md), [deps.ts](../../../scripts/deps.ts), [lint-source-size.ts](../../../scripts/lint-source-size.ts), [interpreter.md](../../meta/interpreter.md), [solver.md](../../meta/solver.md), [proposals.md](../../meta/procedures/proposals.md).  
**Depends on:** none. **Order:** `solver-coverage.md` is in progress and edits `translate.ts` and `read.ts`. Phase 3 runs between its phases, never during one. Its text names functions by file; the close step updates the ones that moved.  
**Design authority:** *none*. Tooling and code layout only: no form or reading changes.

## Design

### Limits

[code-layout.md](../../meta/code-layout.md#limits) owns the 1500-line ceiling and the lint, `scripts/lint-source-size.ts`. Its allowlist now holds `src/interpret/translate.ts` (2298) and `src/parse/morph-gloss.ts` (1763); each split removes its row. `npm run -s deps -- --help` lists the modes; [splitting a file](../../meta/code-layout.md#splitting-a-file) says how each is used.

### Splits

Ranges as of 2026-11-20; every unit re-measures first. Measurements are in [Seam measurements](#seam-measurements).

| File | New files | Left in the file |
|------|-----------|------------------|
| `translate.ts` (2298) | `translate-types.ts`: the exported types (~130); `translate-helpers.ts`: Atoms, Ranges, and the Helpers banner except `readingParts` and `translate` (~300); `translate-conditions.ts`: `condition` through `pool` as functions taking the translator (~470) | the program, `Translator`, `readingParts`, `translate` (~1450) |
| `morph-gloss.ts` (1763) | `morph-gloss-tables.ts`: job tables, the shared types, and the number words (`formatNumberGroup`, `cardinalEnglish`, `ordinalEnglish`) (~350); `morph-gloss-blocks.ts`: Markdown block extraction and comparison (~200); `morph-gloss-labels.ts`: the label builders (~630) | the driver and `analyzeLine` (~560) |
| `read.ts` (1446) | `read-context.ts`: Keys and Context, plus `thing`, `placeFrame`, `nestFrame` (~300) | Terms, Units, Readings (~1150) |

S3 follows [methods to functions](../../meta/code-layout.md#methods-to-functions), which uses `Translator` as its example. No file in phase 3 changes its name, so the [renames rule](../../meta/code-layout.md#splitting-a-file) (step 4) needs no `git mv`.

## Implementation plan

**Unsupervised.** Nobody reviews this run as it goes. The orchestrator and its subagents settle every decision themselves, by the recommendations and rules here, and do not wait for the user. Each decision made at **(low)** confidence is logged under [Open decisions](#open-decisions) as it is made: the problem, the options, the choice taken, and what would change it. Do the same for **(medium)** when the choice is hard to undo. The user reviews that list when the whole plan is done. Only a [stop-and-alert](../../meta/procedures/proposals.md#stop-and-alert) finding halts the run: a broken premise, or later units that would build on a broken state. Then the orchestrator leaves the tree green, records the point reached on the Status line, and stops.

The work runs through subagents: the units read different files and share little. At the end of the phase, and if the run stops partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

### Phases

- **Phase 3, interpreter and gloss:** S2, S3, S4, S5, then the close. Prompt: *Carry out phase 3 of `split-large-source-files.md`*. Run it only while `solver-coverage.md` is between phases.

### Units

**S2 `translate.ts` types and helpers.**
`proposal-worker`, `model: sonnet`, effort `medium`.
Make `translate-types.ts` and `translate-helpers.ts` per [Splits](#splits), and repoint importers. In `solver.md`, the Files line names the new files. In `AGENTS.md`, the `solver.md` row: report the new wording, the orchestrator applies it.
**May edit:** `src/interpret/translate*.ts`, importers' import lines, `docs/meta/solver.md`.

**S3 `translate.ts` conditions.**
`proposal-worker`, `model: opus`, effort `high`.
Make `translate-conditions.ts` per [Splits](#splits): `condition`, `because`, `hinge`, `boundBy`, `nounCondition`, `nounHinge`, `conditionalPairs`, `likely`, `orList`, `orBounds`, `notOne`, `items`, `pool`. Keep a method in the class if `deps` shows that only class methods outside this list call it and it calls nothing in the list. Log that as **(low)**. `deps --check-move` may print only the `export class`, `this.`/`t.`, signature and call-site lines. Remove the allowlist row.
**May edit:** `src/interpret/translate*.ts`, `scripts/lint-source-size.ts`, `docs/meta/solver.md`, `docs/meta/interpreter.md`.

**S4 `morph-gloss.ts`.**
`proposal-worker`, `model: sonnet`, effort `medium`.
Make the three files per [Splits](#splits), and repoint importers of moved names. Move `senseLabel` and `isNameEnding` into `morph-gloss-labels.ts` if `deps --split` shows that removes a cycle. Keep each top-level const in the file of the names it reads at load time (`MORPH_GLOSS_LABELS` with `WRITTEN_SPAN`). Remove the allowlist row.
**May edit:** `src/parse/morph-gloss*.ts`, importers' import lines, `scripts/lint-source-size.ts`.

**S5 `read.ts` context.**
`proposal-worker`, `model: sonnet`, effort `low`.
Make `read-context.ts` per [Splits](#splits), and repoint importers of `wordKey`, `constructionFor` and `ReadOptions`. Update `interpreter.md` where it names these functions by file.
**May edit:** `src/interpret/read*.ts`, importers' import lines, `docs/meta/interpreter.md`.

**Close** (*orchestrator*).
- The allowlist should now be empty; keep the lint and an empty list.
- `grep -rn` the in-progress and ready proposals for every moved name with its old file, and repoint each mention. Phase 2 moved names out of `sentence-parser.ts` (now `sentence-grammar.ts`, `sentence-shapes.ts`, `mark-context.ts`, `sentence-build.ts`, `src/parse/grammar/*-rules.ts`); include those.
- Apply the reported `AGENTS.md` rows.
- Delete `tmp/prototypes/deps-probe/` and `tmp/scratch/split-s1c/` (S1c's serialize script) if they are still there.
- If Open decisions is empty, delete this proposal: `code-layout.md` owns the rules. Otherwise keep it, with Status `DONE, awaiting review of open decisions`, until the user has reviewed them.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This is tooling and code layout: never change a reading, a form, or what any function returns.
> - **Unsupervised:** settle every choice yourself by this brief and its links; never stop to ask. Report each choice you made at low confidence (problem, options, choice, what would change it) under **decisions**. Stop only for the findings below.
> - Measure before moving: `npm run -s outline -- FILE` (`--min-tokens 300` for the big entries) and `npm run -s deps -- FILE`. Ranges in the brief may have drifted; trust the tools.
> - Check the mapping with `deps --split` first. Function-only cycles are allowed. A load-time read across a cycle is not: move the const with what it reads.
> - **Move, never retype.** Copy bodies with a script that cuts line ranges (written to a file under `tmp/scratch/`, run from there, asserting each range starts and ends where expected). Then fix imports from the `tsc` errors. Never edit a moved body, except `this.` → `t.` in S3.
> - After the move, `npm run -s deps -- --check-move HEAD:OLDFILE OLDFILE NEWFILES…` must print nothing (it ignores indentation and each new file's leading comment), except the lines the brief allows. A file that keeps its path gets no new leading comment.
> - Keep each new file's leading doc comment: one or two lines on what it holds. Keep banners with the code under them.
> - Never re-export a moved name from its old file; repoint the importers.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/logs/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds (a seam has a new edge across it that `deps` cannot place); later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **files touched** (count), **line counts** of each file made or cut, **check-move** result, **decisions**, **AGENTS.md lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- At the start of the phase, `npm run verify -- --baseline`.
- Per unit: `npm run verify -- --allow-generate` shows no new errors. The build runs `tsc` and the size lint. The unit's report carries a clean `deps --check-move`.
- Final gate, at the close: a full `npm run verify` that passes against an empty baseline. Run nothing again after it.

### Commits

One per unit after its gate, plus the close: S2, S3, S4, S5, and the close (5). Messages start `split-large-source-files S2:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files.

## Open decisions

The run logs here each **(low)** decision it makes, and each hard-to-undo **(medium)** one, for review when the plan is done.

1. **How the rule families reach Chevrotain's protected DSL (S1c).** `RULE`, `SUBRULE`, `CONSUME`, `OR` and the rest are `protected` in `CstParser`, and the definer functions under `src/parse/grammar/` call them on `p`. Options: (a) a `dsl` getter returning bound methods, so bodies read `p.dsl.OR(…)`; (b) about 32 `public` overrides that call `super`, each adding a call per DSL call while parsing; (c) a `dsl` getter that returns `this` cast once to `GrammarParser` (the class's public members plus each used DSL method, typed `CstParser["NAME"]`). Taken: (c), because it keeps the rule bodies a plain `this.` → `p.` change, keeps `tsc` strict, and adds no runtime cost. Cost: a DSL method no rule uses yet (such as `OPTION6`) must be added to the type first. **Recommendation:** (medium) keep (c). What would change it: a Chevrotain upgrade that makes the DSL public, or a lint that bans `as unknown as`.

## Seam measurements

Line ranges from `npm run outline` on 2026-11-20. Edges come from a probe (`npx --no-install tsx tmp/prototypes/deps-probe/edges.ts FILE "name:a-b,…"`), now replaced by `npm run deps`.

**`translate.ts`.** Types 26–130; Atoms 132–177; Ranges 179–221; program 223–321; `Translator` 323–2067 (fields and parties to 414, Terms 416, Rules 547, Readings 580, conditions 1511–1980, After the readings 1982); Helpers 2069–2298.
- The conditions group uses 14 state fields, 6 Readings methods (`use`, `unrowed`, `readingFrames`, `wrap`, `useDenied`, `leave`) and `sites`. The body calls into it 5 times, Readings 5 and `finish` 2.
- Every other method group uses the fields and the parties (`speaker`, `listener`, `we`) heavily, so the rest of the class does not split by banner.

**`morph-gloss.ts`.** Tables 66–354; API and types 355–657; blocks 658–860; `analyzeLine` and sense pieces 862–1085; labels 1087–1730; exported label lists 1732–1763.
- Blocks use only `morphGlossLine` and three result types: a clean leaf.
- Labels use 25 table names, the `MorphGlossContext` type, `isNameEnding` and `senseLabel`. Moving the types into the tables file leaves two function back-edges.

**`read.ts`.** Keys 46–138; Context 140–286; Terms 288–745; Units 747–1122; Readings 1124–1446.
- Context reaches out only for `thing` (Terms) and `placeFrame`, `nestFrame` (Units).
- Terms → Readings: `readParse`, `readDependent`, `readIsland`. Units → Readings: `readIsland`, `readClause`. Units → Terms: 12 names.

**`enforce.ts`** (out of scope). Word rules 290–617, hosts 619–795, the structure visitor 796–1085 and `enforceResult` 1087–1240 call each other both ways. `diagnoseParseError` (1271–1375) is a separate job, but at ~105 lines it is not worth a file.

## Background

### Problem

A few hand-written files under `src/` are far longer than the rest (2026-11-20):

| Lines | File |
|------:|------|
| 3040 | `src/parse/sentence-parser.ts` |
| 2298 | `src/interpret/translate.ts` |
| 1763 | `src/parse/morph-gloss.ts` |
| 1446 | `src/interpret/read.ts` |
| 1420 | `src/parse/enforce.ts` |

Everything else is at or under about 1340. An agent editing one of these either reads it whole (15k to 35k tokens) or edits from a partial view, and the cost recurs on every session that touches the parser or interpreter. No limit is stated, so the next file drifts the same way.

### Goals

- No hand-written source file over 1500 lines, with the build lint keeping it so.
- Every split moves code without changing behavior, and `git mv` keeps history where a file changes name.

### Non-goals

- No split of `enforce.ts` (1420, no clean seam) or of the test files (`solve.test.ts` at 1340 is a flat list of cases).
- No refactor inside a function or method beyond what moving it requires (`this.` → `t.` in S3, `this.` → `p.` in S1c).
- No Chevrotain grammar inheritance: the rule families are mutually recursive, and inheritance is a linear chain.
- No generating the one-line rule variants (`unitAfterZOpen`, `unitAfterZShared`, …) from a loop. That changes the code's shape, not just where it lives, and belongs in a later change.
