# Code layout

Editors only. How large hand-written source files stay small, and how to split one.

## Limits

- **Soft target: about 800 lines** for hand-written source. Past it, a file marks its sections with `// ── Title ──` banners, so `outline` and `deps` see the seams.
- **Hard ceiling: 1500 lines** for hand-written `.ts` and `.mjs` under `src/` and `scripts/`, tests included. `src/generated/` is exempt.
- **The lint** (`scripts/lint-source-size.ts`, run by the build as `npm run lint:source-size`) fails on a file over the ceiling unless its allowlist names it. Failures print as `file:line` with the fix.
- **Allowlist rows** hold the file's line count when added. A row fails when its file grows past that count, and when the file drops under the ceiling, so a finished split removes its row. Never raise a count.

## Splitting a file

1. **Measure.** `npm run -s outline -- FILE` (`--min-tokens 300` keeps the big entries) lists the declarations. `npm run -s deps -- FILE` prints the edges between the file's groups: which top-level names and `this.` members each group uses from each other group. Groups default to the banners, with the lines before the first banner as `head`; `--groups "name:a-b,…"` gives line ranges instead. `--uses NAME` (`Class.member` for a member) lists every reference, and `--importers FILE` lists each export with the files that import it. `--over N` lists files over N lines.
2. **Check the mapping.** `npm run -s deps -- --split FILE "new-a.ts:a-b,c-d;new-b.ts:e-f"` prints the import graph the split would give; lines not listed stay in FILE. Cycles among function-only code are allowed. A **load-time read** is a top-level initializer (a `const`, a static field, a top-level call) that reads an imported binding while the module loads; across a cycle it is not allowed, so move the const with what it reads. Only value imports make a cycle: `import type` is erased at build time, so a type-only import is listed but never counted.
3. **Move bodies by a script**, never by retyping. Write the script under `tmp/scratch/`; it copies line ranges and asserts that each range starts and ends where expected. Then fix imports from the `tsc` errors. Never edit a moved body, except for the methods-to-functions change below. Keep each new file's leading doc comment (one or two lines on what it holds) and keep banners with the code under them.
4. **Apply the renames rule.** A file that keeps its public path keeps its name, and new files are new. A split that moves most of a file's content to a new name is the exception: commit the `git mv` alone with importers repointed, then make the new file at the old path and repoint importers back, so history follows the class. Never re-export a moved name from its old file; repoint the importers.
5. **Check the move.** `npm run -s deps -- --check-move REV:FILE NEWFILES…` compares the old file at REV with the union of the new files, ignoring import and export-list lines, blank lines, a leading `export ` keyword, indentation, and each new file's leading comment, so a method that becomes a function does not flag for its new indent. The one blind spot is whitespace inside a multi-line template literal, where indentation is content; check such a literal by eye if a move reindents it. It prints each line found on only one side; a pure move prints nothing.
6. **Verify.** Remove the file's allowlist row, then `npm run verify`. For parser files also run `npm run grammar-check`.

### Methods to functions

A class that grows past the ceiling can hand methods to plain functions in a new file. Example: `Translator` is exported (`export class`) and imported as a type only (`import type`), so there is no runtime cycle. Each moved method becomes `function name(tr: Translator, …)` in `translate-conditions.ts`. `this.` becomes `tr.` inside, and a call `this.hinge(x)` becomes `hinge(this, x)`. Pick a parameter name no moved body already uses as a local (`t` was taken). When a moved name clashes with a local or another import at a call site, rename the function (`items` became `listItems`) or alias the import (`pool as poolClaim`), so that only signature and call-site lines change. `Translator` has no `private` fields, so nothing else changes. The new file also imports `readingParts` from `translate.ts` as a value; that cycle is allowed because both sides only call each other's functions and neither reads the other at load time. A class with `private` members, or one the new file would import as a value, needs its own check first: a value import back into the class file makes a load-time cycle.

### Chevrotain rule families

A Chevrotain grammar class splits by rule family. Rules are class fields (`this.RULE("name", () => …)`), and a rule body runs only during `performSelfAnalysis()`, after every field is set, so rules can be defined outside the class in any order. `src/parse/sentence-grammar.ts` is the example:

- Each family is a definer function in its own file under `src/parse/grammar/` (`defineClauseRules(p)`, `defineNpRules(p)`, …), called from the constructor before `performSelfAnalysis()`. Inside, `this.` becomes `p.` and a field `public x = this.RULE(…)` becomes `p.x = p.RULE(…)`.
- The class keeps one declaration per rule field (`public x!: ParserRule;`), the constructor, the `lookahead` override, and the handle `dsl`. The DSL methods (`RULE`, `SUBRULE`, `CONSUME`, `OR`, …) are `protected` in `CstParser`, so `dsl` returns `this` cast once to `GrammarParser`: the class's public members plus each DSL method the rules use, typed `CstParser["NAME"]`. A DSL method no rule uses yet (such as `OPTION6`) is added to that type before a rule can use it.
- Rule-building helper methods become functions in their family's file, taking `p`.
- **Check:** save the parser instance's `getSerializedGastProductions()` as JSON before the move and after it; the two files must be byte-identical. That proves the rules, their names and their order are unchanged, so no syntax tree can change.
