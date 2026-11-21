# Split the large source files under src/

**Status:** DONE, awaiting review of open decisions, 2026-11-21. All three phases are done. No hand-written file under `src/` or `scripts/` is over 1500 lines, and the lint's allowlist is empty. [code-layout.md](../../meta/code-layout.md) owns the limits, the lint, how to split a file, [methods to functions](../../meta/code-layout.md#methods-to-functions) and the [rule-family pattern](../../meta/code-layout.md#chevrotain-rule-families). [parser-pipeline.md](../../meta/parser-pipeline.md) and [solver.md](../../meta/solver.md) name the new files. Phase 3 split `translate.ts` (into `translate-types.ts`, `translate-helpers.ts`, `translate-conditions.ts`; 1480 left), `morph-gloss.ts` (into `morph-gloss-tables.ts`, `morph-gloss-blocks.ts`, `morph-gloss-labels.ts`; 501 left) and `read.ts` (into `read-context.ts`; 1176 left). The close moved `rootOf` into `read-context.ts`, its only caller, which removed the one cycle between `read.ts` and `read-context.ts`. It also pruned the imports that the phase 2 and 3 moves left unused (`tsc --noUnusedLocals` is clean on every split file; other files still have unused imports, which were there before this work). The final gate ran `verify` against the phase baseline, not an empty one: this container cannot run the flashcards job (no `.venv` Python) or the docs:publish bundle, and those 34 errors were there before phase 3. When the user has reviewed the decisions below, delete this proposal.
**Related:** [code-layout.md](../../meta/code-layout.md), [deps.ts](../../../scripts/deps.ts), [lint-source-size.ts](../../../scripts/lint-source-size.ts), [interpreter.md](../../meta/interpreter.md), [solver.md](../../meta/solver.md).
**Design authority:** *none*. Tooling and code layout only: no form or reading changes.

## Open decisions

Each **(low)** decision the unsupervised run made, and each hard-to-undo **(medium)** one, for review.

1. **How the rule families reach Chevrotain's protected DSL (S1c).** `RULE`, `SUBRULE`, `CONSUME`, `OR` and the rest are `protected` in `CstParser`, and the definer functions under `src/parse/grammar/` call them on `p`. Options: (a) a `dsl` getter returning bound methods, so bodies read `p.dsl.OR(…)`; (b) about 32 `public` overrides that call `super`, each adding a call per DSL call while parsing; (c) a `dsl` getter that returns `this` cast once to `GrammarParser` (the class's public members plus each used DSL method, typed `CstParser["NAME"]`). Taken: (c), because it keeps the rule bodies a plain `this.` → `p.` change, keeps `tsc` strict, and adds no runtime cost. Cost: a DSL method no rule uses yet (such as `OPTION6`) must be added to the type first. **Recommendation:** (medium) keep (c). What would change it: a Chevrotain upgrade that makes the DSL public, or a lint that bans `as unknown as`.
2. **Where the program-section types live (S2).** `translate-helpers.ts` needs `Literal`, `Subst`, `Ctx`, `EveryHinge`, `Why`, `MayOver` and `Frames`, which sat with the program in `translate.ts`. Options: (a) move them into `translate-types.ts`; (b) leave them in `translate.ts` and import them back into the helpers (a type-only cycle). Taken: (a), along with `HINGE_KEYS` and `CONDITIONAL`, which went to `translate-helpers.ts` because the class and the helpers both read them. **Recommendation:** (low) keep (a): all of the solver's types are now in one file. What would change it: wanting the program section to own its own types.
3. **Two condition methods stay in `Translator` (S3).** `likely` and `conditionalPairs` each have one caller outside the moved group (`reading`, `finish`) and call nothing in it. Options: (a) keep them as methods; (b) move them with the group. Taken: (a), by the plan's rule. **Recommendation:** (low) keep (a). What would change it: a later edit that has the conditions call them.
4. **Names in the moved conditions (S3).** Four bodies already use a local `t`, a local `const items` hides the method `items`, and `finish` has a local `pool`. Taken: the parameter is `tr`, `items` became `listItems`, and `translate.ts` imports `pool as poolClaim` and `nounHinge as sayNounHinge` (the helper `nounHinge` in `translate-helpers.ts` has the same name). Only signature and call-site lines changed. [Methods to functions](../../meta/code-layout.md#methods-to-functions) now says this. **Recommendation:** (medium) keep. The other option is renaming locals inside the moved bodies, which breaks "move, never retype" and the `check-move` comparison.

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
- No refactor inside a function or method beyond what moving it requires (`this.` → `tr.` in S3, `this.` → `p.` in S1c).
- No Chevrotain grammar inheritance: the rule families are mutually recursive, and inheritance is a linear chain.
- No generating the one-line rule variants (`unitAfterZOpen`, `unitAfterZShared`, …) from a loop. That changes the code's shape, not just where it lives, and belongs in a later change.
