# Split the large source files under src/

**Status:** IN PROGRESS, 2026-11-20: phase 1 done (D1 `npm run deps`, D2 the size lint and [code-layout.md](../../meta/code-layout.md), which owns the limits, the lint and how to split a file). Next is phase 2 (S1a to S3). Decided 2026-11-20, all as recommended: in scope are `sentence-parser.ts`, `translate.ts`, `morph-gloss.ts`, and the Keys and Context leaf of `read.ts`, not `enforce.ts`; `read.ts` keeps Terms, Units and Readings together; `Translator`'s condition methods move out as functions; the grammar class's rules move into one definer function per rule family (unit S1c); S4 and S5 are phase 3. **Runs unsupervised** (see [Implementation plan](#implementation-plan)).  
**Related:** [code-layout.md](../../meta/code-layout.md), [deps.ts](../../../scripts/deps.ts), [lint-source-size.ts](../../../scripts/lint-source-size.ts), [parser-pipeline.md](../../meta/parser-pipeline.md), [read-ageben.md](../../meta/procedures/read-ageben.md), [interpreter.md](../../meta/interpreter.md), [solver.md](../../meta/solver.md), [proposals.md](../../meta/procedures/proposals.md).  
**Depends on:** none. **Order:** `solver-coverage.md` is in progress and edits `translate.ts` and `read.ts`. Run each phase here between its phases, never during one. Its text names functions by file; the close step updates the ones that moved.  
**Design authority:** *none*. Tooling and code layout only: no form or reading changes, and the parser's accept/reject behavior does not change.

## Design

### Limits

[code-layout.md](../../meta/code-layout.md#limits) owns the 1500-line ceiling and the lint, `scripts/lint-source-size.ts`. Its allowlist starts with `src/parse/sentence-parser.ts` (3040), `src/interpret/translate.ts` (2298) and `src/parse/morph-gloss.ts` (1763). S1a repoints the first row, and each split removes its row.

What the units need to know about `npm run deps` (`npm run -s deps -- --help` lists the modes):

- `--check-move` ignores indentation and each new file's leading comment, so a method that becomes a function does not flag for its new indent.
- Class members are named `Class.member` in every mode, as in `--uses Translator.hinge`.
- `--split` builds cycles from value imports only (type-only imports are listed, not counted). It exits 1 only on a load-time read between two files in one cycle.

### Splits

Ranges as of 2026-11-20; every unit re-measures first. Measurements are in [Seam measurements](#seam-measurements).

| File | New files | Left in the file |
|------|-----------|------------------|
| `sentence-parser.ts` (3040) | `sentence-grammar.ts`: the Chevrotain class (~1440 after S1b, ~300 after S1c; takes the `git mv`); `grammar/*.ts`: the rule families (S1c); `sentence-shapes.ts`: the head (error class, `tokenIs`, slot types and consts, `wOf`, `wTargetOfHead`, the error message provider, `ambiguityReports`) (~190); `mark-context.ts`: `markContext`, the `*TypeAt` lookahead, the word tests and `barTypeAt` it alone uses, and its four small helpers (~520); `sentence-build.ts`: post-parse fixes and CST-to-AST builders (~900) | a new `sentence-parser.ts`: the parser instance and `parseSentenceTokens*` / `sentenceGrammar` (~80) |
| `translate.ts` (2298) | `translate-types.ts`: the exported types (~130); `translate-helpers.ts`: Atoms, Ranges, and the Helpers banner except `readingParts` and `translate` (~300); `translate-conditions.ts`: `condition` through `pool` as functions taking the translator (~470) | the program, `Translator`, `readingParts`, `translate` (~1450) |
| `morph-gloss.ts` (1763) | `morph-gloss-tables.ts`: job tables, the shared types, and the number words (`formatNumberGroup`, `cardinalEnglish`, `ordinalEnglish`) (~350); `morph-gloss-blocks.ts`: Markdown block extraction and comparison (~200); `morph-gloss-labels.ts`: the label builders (~630) | the driver and `analyzeLine` (~560) |
| `read.ts` (1446) | `read-context.ts`: Keys and Context, plus `thing`, `placeFrame`, `nestFrame` (~300) | Terms, Units, Readings (~1150) |

Why the head of `sentence-parser.ts` gets its own file: the class needs about 70 import lines, and keeping the head with it would come to about 1545 lines, over the ceiling. The head is also shared, since the class, the lookahead and the builders all read the slot consts.

**Methods to functions (S3).** `Translator` is exported (`export class`) and imported as a type only (`import type`), so there is no runtime cycle. Each moved method becomes `function name(t: Translator, …)`. `this.` becomes `t.` inside, and a call `this.hinge(x)` becomes `hinge(this, x)`. `Translator` has no `private` fields, so nothing else changes.

**Rule families (S1c).** Chevrotain rules are class fields (`this.RULE("name", () => …)`), and a rule body runs only during `performSelfAnalysis()`, after every field is set. So the order in which rules are defined does not matter, and they can be defined outside the class. Each family moves to a definer function in its own file under `src/parse/grammar/`, called from the constructor before `performSelfAnalysis()`: `defineClauseRules(p)` (document, sentence, left edge, body clause, clause, clause item), `defineUnitRules(p)` (unit chain and its variants), `defineNpRules(p)` (noun phrases, their lists and join closes), `defineVpRules(p)` (verb phrases, items, verb join closes), `defineModifierRules(p)` (`/g/` and `/h/` lists, bars, stand-ins, hooks, zones, same-role pairs), and `definePackageRules(p)` (noun and `/g/` packages, as-of pairs, shared scales and adverbs). `deps` places the boundaries; a family of about 150 to 400 lines is the aim.
- The class keeps each rule field's type declaration (one line each, with `!`), the constructor, and the `lookahead` override, about 300 lines.
- `RULE`, `SUBRULE`, `CONSUME`, `OR`, `MANY` and the other DSL methods are `protected` in `CstParser`. The class exposes them through one typed handle: a `dsl` getter returning the bound methods, or `public` overrides that call `super`. Settle which by what keeps `tsc` strict and the rule bodies unchanged apart from `this.` → `p.`, and log the choice as **(medium)**.
- The rule-building helpers that are methods today (`npRules`, `unitKinds`, `hUnitRuleOf`, …) become functions in their family's file, taking `p`.
- **Gate:** the serialized grammar (`getSerializedGastProductions()` on the parser instance, written to JSON) is byte-identical before and after. That proves the rules, their names and their order are unchanged, so the syntax trees cannot change.

**Renames.** A file that keeps its public path keeps its name, and new files are new. `sentence-parser.ts` is the exception: most of its content goes to `sentence-grammar.ts`. So S1a commits the `git mv` alone, with importers repointed, and S1b then makes the new `sentence-parser.ts` and repoints them back. History follows the class.

## Implementation plan

**Unsupervised.** Nobody reviews this run as it goes. The orchestrator and its subagents settle every decision themselves, by the recommendations and rules here, and do not wait for the user. Each decision made at **(low)** confidence is logged under [Open decisions](#open-decisions) as it is made: the problem, the options, the choice taken, and what would change it. Do the same for **(medium)** when the choice is hard to undo. The user reviews that list when the whole plan is done. Only a [stop-and-alert](../../meta/procedures/proposals.md#stop-and-alert) finding halts the run: a broken premise, or later units that would build on a broken state. Then the orchestrator leaves the tree green, records the point reached on the Status line, and stops.

The work runs through subagents: the units read different files and share little. At the end of each phase, and if the run stops partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

### Phases

- **Phase 2, parser and translator:** S1a, S1b, S1c, S2, S3. Prompt: *Carry out phase 2 of `split-large-source-files.md`*. Cut after S3: the next units read different files (`morph-gloss.ts`, `read.ts`), and five units fill a session.
- **Phase 3, the rest:** S4, S5, then the close. Prompt: *Carry out phase 3 of `split-large-source-files.md`*.

### Units

**S1a Rename the parser file.**
`proposal-worker`, `model: sonnet`, effort `low`.
`git mv src/parse/sentence-parser.ts src/parse/sentence-grammar.ts`. Repoint every importer, every path in `docs/meta/` (`parser-pipeline.md`, `procedures/read-ageben.md`), and the lint's allowlist row. Change nothing else.
**May edit:** `src/**`, `scripts/**` (import lines only), `scripts/lint-source-size.ts`, `docs/meta/parser-pipeline.md`, `docs/meta/procedures/read-ageben.md`.

**S1b Carve the parser.**
`proposal-worker`, `model: opus`, effort `medium`.
From `sentence-grammar.ts`, make `sentence-shapes.ts`, `mark-context.ts`, `sentence-build.ts` and a new `sentence-parser.ts` per [Splits](#splits). Repoint importers to the entry names in `sentence-parser.ts`, and the moved ones to their new files. Let `deps --split` place any name the table does not settle: a name goes with its only user, and a name used by two new files goes to `sentence-shapes.ts`. Then update `parser-pipeline.md` (the file tree, and where `buildUtterances` and `afterTurnWord` live) and `read-ageben.md` (`grammar-check` after changing `sentence-grammar.ts` or `mark-context.ts`). Remove the allowlist row once `sentence-grammar.ts` is under 1500. If it is still over, move the class-only types into `sentence-shapes.ts`. If it is still over after that, keep the row at the new count and log a **(low)** open decision: Chevrotain inheritance, or allowlist.
**May edit:** `src/parse/sentence-*.ts`, `src/parse/mark-context.ts`, importers' import lines, `scripts/lint-source-size.ts`, the two meta docs.

**S1c Rule families.**
`proposal-worker`, `model: opus`, effort `high`.
First write a script under `tmp/scratch/` that loads the parser and saves `getSerializedGastProductions()` as JSON. Run it before any edit. Then move the rules into `src/parse/grammar/*.ts` per [Rule families](#splits). Run the script again: the two JSON files must be byte-identical. `deps --check-move` may print only the `this.` → `p.` lines, the definer signatures, the field declarations, the constructor calls, and the handle. Keep the serialize script's path in the report; the close deletes it.
**May edit:** `src/parse/sentence-grammar.ts`, `src/parse/grammar/**`, `docs/meta/parser-pipeline.md` (the file tree).

**S2 `translate.ts` types and helpers.**
`proposal-worker`, `model: sonnet`, effort `medium`.
Make `translate-types.ts` and `translate-helpers.ts` per [Splits](#splits), and repoint importers. In `solver.md`, the Files line names the new files. In `AGENTS.md`, the `solver.md` row: report the new wording, the orchestrator applies it.
**May edit:** `src/interpret/translate*.ts`, importers' import lines, `docs/meta/solver.md`.

**S3 `translate.ts` conditions.**
`proposal-worker`, `model: opus`, effort `high`.
Make `translate-conditions.ts` per [Methods to functions](#splits): `condition`, `because`, `hinge`, `boundBy`, `nounCondition`, `nounHinge`, `conditionalPairs`, `likely`, `orList`, `orBounds`, `notOne`, `items`, `pool`. Keep a method in the class if `deps` shows that only class methods outside this list call it and it calls nothing in the list. Log that as **(low)**. `deps --check-move` may print only the `export class`, `this.`/`t.`, signature and call-site lines. Remove the allowlist row.
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
- `grep -rn` the in-progress and ready proposals for every moved name with its old file, and repoint each mention.
- Apply the reported `AGENTS.md` rows.
- Delete `tmp/prototypes/deps-probe/` and S1c's serialize script.
- Add the rule-family pattern and the serialized-grammar check to `code-layout.md` under Splitting a file, as the way to split a Chevrotain grammar.
- If Open decisions is empty, delete this proposal: `code-layout.md` owns the rules. Otherwise keep it, with Status `DONE, awaiting review of open decisions`, until the user has reviewed them.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This is tooling and code layout: never change what the parser accepts, a reading, or a form.
> - **Unsupervised:** settle every choice yourself by this brief and its links; never stop to ask. Report each choice you made at low confidence (problem, options, choice, what would change it) under **decisions**. Stop only for the findings below.
> - Measure before moving: `npm run -s outline -- FILE` (`--min-tokens 300` for the big entries) and `npm run -s deps -- FILE`. Ranges in the brief may have drifted; trust the tools.
> - Check the mapping with `deps --split` first. Function-only cycles are allowed. A load-time read across a cycle is not: move the const with what it reads.
> - **Move, never retype.** Copy bodies with a script that cuts line ranges (written to a file under `tmp/scratch/`, run from there, asserting each range starts and ends where expected). Then fix imports from the `tsc` errors. Never edit a moved body, except `this.` → `t.` in S3 and `this.` → `p.` in S1c.
> - After the move, `npm run -s deps -- --check-move HEAD:OLDFILE NEWFILES…` must print nothing (it ignores indentation and each new file's leading comment), except the lines the brief allows.
> - Keep each new file's leading doc comment: one or two lines on what it holds. Keep banners with the code under them.
> - `git mv` only where the brief says. Never re-export a moved name from its old file; repoint the importers.
> - Parser files (S1a to S1c): also run `npm run grammar-check`.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/logs/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds (a seam has a new edge across it that `deps` cannot place); later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **files touched** (count), **line counts** of each file made or cut, **check-move** result, **decisions**, **AGENTS.md lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- At the start of each phase, `npm run verify -- --baseline`.
- Per unit: `npm run verify -- --allow-generate` shows no new errors. The build runs `tsc` and the size lint. The unit's report carries a clean `deps --check-move` (S1a to S5), and for S1a to S1c a passing `npm run grammar-check`. S1c also needs an identical serialized grammar.
- Final gate, at the close: a full `npm run verify` that passes against an empty baseline. Run nothing again after it.

### Commits

One per unit after its gate, plus one per phase for the consolidated proposal. Phase 1 is done. Phase 2: S1a, S1b, S1c, S2, S3, and the consolidation (6). Phase 3: S4, S5, and the close (3). Messages start `split-large-source-files D1:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files.

## Open decisions

Logged for review when the plan is done.

1. **`deps --check-move` ignores indentation** (D1). A method that becomes a function changes indent, so an exact compare would flag every line of it. Options: ignore leading whitespace; compare exactly and list the reindented lines as allowed. Taken: ignore leading whitespace, and each new file's leading comment. What would change it: a move whose only change is indentation inside a multi-line template literal, where whitespace is content; none of the planned splits moves such a literal by reindenting it. **Recommendation:** (medium) keep.
2. **`deps --split` counts value imports only** (D1). Options: count type-only imports in cycles; leave them out. Taken: leave them out, since `import type` is erased and makes no runtime cycle (S3 relies on this for `Translator`). What would change it: a build mode that keeps type imports at run time, which this repo does not use. **Recommendation:** (high) keep.

## Seam measurements

Line ranges from `npm run outline` on 2026-11-20. Edges come from a probe (`npx --no-install tsx tmp/prototypes/deps-probe/edges.ts FILE "name:a-b,…"`) that lists, for each pair of line-range groups, the top-level names and `this.` members one group uses from the other.

**`sentence-parser.ts`.** Head 144–336 (slot types, word tests, `barTypeAt`, error provider); class 337–1698; post-parse 1701–1976 (`disambiguateClause`, `splitUnits`, `markContext`); lookahead 1978–2320 (`hListTypeAt`, `glTypeAt`, `hostedType`, …); builders 2322–3009; entry 3011–3040.
- The class uses 16 head names (slot types and consts, `wOf`, `wTargetOfHead`) and **no** lookahead function: lookahead runs before parsing, through `markContext`, which is its only caller.
- The lookahead uses the word tests (`isStanceWord`, `isZoneHook`, `isHolderWord`, `isIntentionStance`, `isScopeThoVerb`, `joinSeries`) and 4 small helpers from the post-parse range (`scaleNumberAhead`, `factorAhead`, `isOrdinalMarker`, `isLabelMarker`). These move to `mark-context.ts` with it.
- The builders and the post-parse range use each other (`childNodes`, `adjNodes`, `finalizeClause` one way, `mergeAdjLists` the other), so they stay together.
- Importers use `SentenceParseError` (4), `sentenceGrammar` (3), `parseSentenceTokens` (2), `markContext` (2), `takeAmbiguityReports`, `parseSentenceTokensWithCst`.

**`translate.ts`.** Types 26–130; Atoms 132–177; Ranges 179–221; program 223–321; `Translator` 323–2067 (fields and parties to 414, Terms 416, Rules 547, Readings 580, conditions 1511–1980, After the readings 1982); Helpers 2069–2298.
- The conditions group uses 14 state fields, 6 Readings methods (`use`, `unrowed`, `readingFrames`, `wrap`, `useDenied`, `leave`) and `sites`. The body calls into it 5 times, Readings 5 and `finish` 2.
- Every other method group uses the fields and the parties (`speaker`, `listener`, `we`) heavily, so the rest of the class does not split by banner.

**`morph-gloss.ts`.** Tables 66–354; API and types 355–657; blocks 658–860; `analyzeLine` and sense pieces 862–1085; labels 1087–1730; exported label lists 1732–1763.
- Blocks use only `morphGlossLine` and three result types: a clean leaf.
- Labels use 25 table names, the `MorphGlossContext` type, `isNameEnding` and `senseLabel`. Moving the types into the tables file leaves two function back-edges.

**`read.ts`.** Keys 46–138; Context 140–286; Terms 288–745; Units 747–1122; Readings 1124–1446.
- Context reaches out only for `thing` (Terms) and `placeFrame`, `nestFrame` (Units).
- Terms → Readings: `readParse`, `readDependent`, `readIsland`. Units → Readings: `readIsland`, `readClause`. Units → Terms: 12 names.

**`enforce.ts`.** Word rules 290–617, hosts 619–795, the structure visitor 796–1085 and `enforceResult` 1087–1240 call each other both ways. `diagnoseParseError` (1271–1375) is a separate job, but at ~105 lines it is not worth a file.

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
