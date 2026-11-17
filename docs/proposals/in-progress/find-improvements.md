# find.mjs: search by kind, order, clause, and scope

**Status:** IN PROGRESS, started 2026-11-17. Done: F1, F2, F3 (F2 also did all of F3; one commit). Decided 2026-11-17: scope queries live in find.mjs, over the resolve stage's record; readings-level queries (claims, roles, holders) stay with `structural-search.md`. Frame order is asked with two flags, `--over` and `--under`, not a compact operator. `--diff` gets the old parser from a `git archive` extract, not a worktree. Decided 2026-11-17, after F1 measured it: no worker threads. Each thread rebuilds the sentence parser (about 4 s of Chevrotain lookahead analysis) and concurrent builds slow each other, so 11 workers took 28 s against 8.5 s on one thread; `--diff` runs its two passes one after the other.

**Related:** [find.mjs](../../../scripts/find.mjs), [src/find/](../../../src/find/) ([cli.ts](../../../src/find/cli.ts), [query.ts](../../../src/find/query.ts), [examples.ts](../../../src/find/examples.ts), [walk.ts](../../../src/find/walk.ts)), the bundle runner ([run-bundled.mjs](../../../scripts/lib/run-bundled.mjs)), the resolve stage's scope record ([scope.ts](../../../src/parse/scope.ts), [resolve.ts](../../../src/parse/resolve.ts)), the construction registry ([constructions.ts](../../../src/parse/constructions.ts)), [overlay kinds](../../meta/parser-pipeline.md#overlay-kinds), [data/lexicon-overlays.csv](../../../data/lexicon-overlays.csv), [searching by construction](../../meta/procedures/read-ageben.md#find).

**Depends on:** none. **Order:** independent of `ageben-interpreter.md`; it reads `scope.ts` and never edits it. Landing before that proposal's unit J2 lets J2 measure decision 9b with the one-line query below.

**Design authority:** none. Tooling only: no form or reading changes, and the parser's accept/reject behavior does not change.

## Problem

Weighing a grammar change starts with one question: *which doc examples does this change, and how many?* For decision 9b in `ageben-interpreter.md` the question was "every example with a channel after a universal or restrictor, in the same clause". find.mjs answered it on the fourth try, and only with a script written for the occasion:

- **No key for a kind.** "Any channel" means 21 sense forms. `overlay=evidential` matches nothing, because `overlay` tests the sense form (`ubol`), not the overlay's kind.
- **Undiscoverable values.** `--help` prints the usage line only. The notes on the keys sit in a comment at the top of `cli.ts` and do not say what values look like. `stance` sounds like the kind of stance but holds the join vowel. Construction IDs (`overlay.ubol.th`, `join.ua`) are documented nowhere.
- **No order and no clause.** `--seq` matches neighboring words only. Two `--construction` flags match anywhere in the example, across clauses, so a universal in a dependent counted as a hit for a channel in the main clause.
- **Thin `--json`.** A hit's words carry no construction IDs, overlay kind, or clause, so a post-filter has to guess.
- **No scope.** The resolve stage records which whole-clause frame covers which (`ParseResult.resolve.scope`), and find cannot ask about it.

## Goals

- The 9b question, and questions like it, in one command line.
- Every key, its values, and every construction ID discoverable from the CLI.
- `--diff REV`: which examples a parser change flipped, as a measured cost before a scope decision and a check after it.

## Non-goals

- Queries over readings (claims, roles, holders): `structural-search.md`.
- Comparing the docs at two revisions. `--diff` changes only the parser; both passes read the current docs.
- A parse cache or worker threads. A cache's staleness rules are a bug surface for a saving of seconds; threads each rebuild the parser, which costs more than they save.

## Design

### Keys, clause, and order

- **`overlayKind=KIND`** matches a word whose overlay, or host overlay, has that `kind` in the overlays CSV (`evidential`, `may`, `phasal` …).
- **`frame=FAMILY` or `frame=FAMILY/MEMBER`** matches a word that carries a whole-clause frame in `resolve.scope`, found by `LexWord` identity. A frame word has both values (`stance` and `stance/channel`), so `frame=stance` matches any member. A form whose reach is not the clause carries no frame and has no value.
- **Clause.** Each `Clause` node of the tree (body clause, clause-join member, dependent) gets a number in walk order, and each found word the number of the innermost clause it sits in.
- **`...` in `--seq`** matches zero or more words. **`--same-clause`** requires every word of a `--seq` hit to share one clause.

The 9b question:

```
node scripts/find.mjs --same-clause --seq 'frame=binder|occasion' ... overlayKind=evidential --count
```

### Discovery and JSON

- `--help` prints each key on one line: what it holds and three sample values, plus every flag and how a construction ID is built. The comment at the top of `cli.ts` shrinks to a pointer to `--help`.
- `--values KEY` lists every value the key takes across the paths searched, with counts; `--constructions` does the same for construction IDs.
- `--json` adds to each word its construction IDs, `overlayKind`, `frame` values and clause; to each hit its clause numbers.

### Scope queries

- **`--over F --under G`**, each a family or `family/member`, matches an example with a clause whose `resolve.scope.order` has that pair, and highlights both words. Several pairs must all match, as other flags do.
- **`--unordered`** matches an example with a clause whose `unordered` is not empty.
- **`--diff REV`** runs two passes over the current docs, one with the parser at `REV` and one with the current parser, and lists each example whose orders differ: `file:line  text`, then `-` lines for pairs only at `REV` and `+` lines for pairs only now. A pair is compared as `over family/member raw@position > under family/member raw@position`, plus the unordered set, so the old record's object shape does not matter. Other flags filter which examples are compared, using the current parse. `--count` is the number of examples that differ; `--json` gives the pairs.
  - **The old parser comes from an archive.** `git archive REV src data package.json` is extracted to `tmp/find-rev/<sha>/`, given a `node_modules` link, and `src/parse/index.ts` is bundled to `<dir>/dist/parse-rev/index.bundle.mjs`, so it finds `data/` at `../..` and reads the old lexicon. The folder is removed in a `finally` and on SIGINT. Unlike a worktree, a killed run leaves nothing in `.git`.
  - **Both passes read the current docs.** A difference then comes from the parser alone, and no example has to be matched across edits. The rewrites a decision asks for are in the current text, so the same run checks they landed.
  - **The current find drives both passes.** It loads only `parseWithTables` and `loadDefaultTables` from the old bundle, since find at `REV` may lack the scope output. `examples.ts` calls `parseWithTables` directly today; the pass takes the parse function and tables as parameters (`runPass(files, options, tables)` in `pass.ts` already takes the tables), so the old pass is the same code with the old bundle's pair. When the old bundle lacks either export, or its result has no `resolve.scope`-shaped record, `--diff` exits 2 naming what is missing.
  - **It stops at the scope record.** When `git cat-file -e REV:src/parse/scope.ts` fails, `REV` predates the record (it landed in ff43d91d), and `--diff` exits 2 saying so.

### Timing

One pass with `--construction join.ua --count` takes about 9 s on one thread: about 4 s builds the sentence parser, the rest parses and scans. `--diff` runs two passes in sequence, about 18 s plus under a second to extract and bundle the old parser.

## Plan

One phase, one orchestrator session, units F1 to F5 in order (F2 and F4 both edit `pass.ts` and `cli.ts`, so nothing runs in parallel; F1, as cut down by the 2026-11-17 decision, is done). At the start, the orchestrator saves `npm run verify -- --baseline`. Each subagent unit gets a brief file built from its item text and the digest below.

### F2. Kind, frame, clause, and JSON

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/find/query.ts`, `src/find/examples.ts`, `src/find/pass.ts`, `src/find/cli.ts`, `src/find/*.test.ts`.

- `overlayKind`, `frame`, clause numbers, `...`, `--same-clause`, and the JSON fields, per [keys, clause, and order](#keys-clause-and-order) and [discovery and JSON](#discovery-and-json). `Example` keeps `resolve.scope` for F4.
- **Check:** the 9b one-liner's hits equal those of the two-`--construction` query in decision 9b of `ageben-interpreter.md` (unit J2's text), filtered by hand to a channel after the binder or occasion word in the same clause. Report both counts and any example in one list only, with why.

### F3. Help and discovery

**Agent:** `proposal-worker`, `sonnet`, `medium`.
**May edit:** `src/find/cli.ts`, `src/find/help.ts` (new), `src/find/pass.ts`, `src/find/*.test.ts`.

- `--help`, `--values KEY`, `--constructions`, and the shorter header comment, per [discovery and JSON](#discovery-and-json). Help's sample values are static text taken from a `--values` run; a test checks every key in `TERM_KEYS` has a help line.

### F4. Scope queries and `--diff`

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/find/*` (new files included).

- `--over`, `--under`, `--unordered`, and `--diff REV`, per [scope queries](#scope-queries). The diff logic is a pure function over two passes' records, tested with fixed records.
- **Check:** `--diff HEAD` lists nothing. `--diff` on a commit before ff43d91d exits 2 with the message. Then, in a scratch copy of the tree (never the working tree), flip one pair row in `scope.ts`, commit it there, and confirm `--diff HEAD~1` from that copy lists the examples `--over`/`--under` finds for that pair. Report the wall time of `--diff HEAD`, and that `tmp/find-rev/` is empty afterward.

### F5. Docs (orchestrator)

- Rewrite [searching by construction](../../meta/procedures/read-ageben.md#find): the new keys, `--same-clause` and `...`, `--help`/`--values`/`--constructions`, the scope flags, and `--diff` as the way to measure a scope decision. Point to `--help` for the key list instead of restating it.
- Delete this proposal: nothing is left once F5 lands.

### Digest (copied into every brief)

> - Tooling only. Never change what the parser accepts or how it reads a form; never edit grammar pages or `src/parse/`.
> - `npm test` runs Node's runner via `tsx --test`. Never run bare `npx vitest`. Tests sit beside the source (`src/find/*.test.ts`).
> - find runs from an esbuild bundle that `scripts/lib/run-bundled.mjs` rebuilds when `src/` is newer; run it as `node scripts/find.mjs`.
> - The scope record: `ParseResult.resolve.scope?: ClauseScope[]`, types in `src/parse/scope.ts`. `ClauseScope = { clause, utteranceIndex, frames, order, unordered }`; `ScopeFrame = { family, key, word: LexWord, member?, holderHost? }`; `ScopeOrder = { over, under, kind, anchors }`. Read it; do not edit `scope.ts`.
> - Overlay `kind` is a column of `data/lexicon-overlays.csv`, loaded into the classify tables; `overlayKey` is in `src/parse/classify.ts`.
> - Shell is zsh; GNU `time` and `bc` are absent. Time with zsh `time ( … )` and `TIMEFMT='%E wall, %U user'`.
> - Scratch files go in the session scratchpad or `tmp/`. A script that edits files is written to a file and run from there, never inline.
> - Check with `npm run verify -- --fast` inside an item and `npm run verify` at its end; read only the new error lines in `tmp/verify-last.log`.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Stop and report, without working around it, when a premise no longer holds, later units would need a different design, or skipping an item would leave later ones on a broken state.
> - Never commit.
>
> **Report**, about 150 words: done (one line); files touched (count); checks run and their numbers (times, counts); the `verify` line; skips with reasons; anything the orchestrator must run or fix; **left:**; **inefficient:**.

### Gates and commits

- After each unit: `npm run verify` against the phase baseline. The last one, after F5, is the final gate; no separate build or test run after it.
- No grammar prose changes, so there is no style gate; no `say-*.md` or English-helper changes, so no recall gate.
- Five commits, one per unit after its gate, each starting `find-improvements F<n>:` and ending `[skip-cd]` and the co-author line. F5's commit also deletes this proposal.

## Open decisions

None.
