# Tools that read readings

**Status:** IN PROGRESS, 2026-11-19: phases 1–4 done. The practice lint compares with `sameReadings`; construction search (`src/find/`) takes frames, `reach=` and frame order from readings, taught in [searching by construction](../../meta/procedures/read-ageben.md#find). Inspect shows frame notes from readings (`src/interpret/inspect-notes.ts`, rendered in `GlossOverlay.vue`), through the `@interpret-browser` alias; the site build target is now `es2022`, because the reader's browser entry pulls in clingo's worker. Decided 2026-11-19: `terminology.md` gained A–Z entries for say word, intention, contrary to, speaker attitude and negation, and the binder family maps to *Domain / generic / every K*; the 17 drifted `whyFor` links point at their owning sections. Decided earlier: the prompt eval runs first on about 20 examples with two or more whole-clause frames, reusing stored replies as the baseline, goes to the full set only if the subset shows a gain, and the `--structure` flag is kept only if the overall miss rate drops by at least 3 points. Phase 5 is ready.  
**Related:** the reader [read.ts](../../../src/interpret/read.ts) and its note [interpreter.md](../../meta/interpreter.md); the translation prompt [llm-prompt.ts](../../../src/parse/llm-prompt.ts), [scripts/parse.mjs](../../../scripts/parse.mjs), [src/agent/ageben.ts](../../../src/agent/ageben.ts), [scripts/llm-eval.ts](../../../scripts/llm-eval.ts).  
**Depends on:** none. **Order:** lands before `mind-map-view.md`. The mind map reuses the `@interpret-browser` alias and the parse-once plumbing (`inspectText` returns `parsed`) that phase 4 added, instead of adding its own. `clingo-solver.md` is in progress and also edits `src/interpret/`; never run a phase of each at the same time. `structural-search.md` (an idea) keeps claim search; it builds on the reading pass `src/find/` now runs.  
**Design authority:** *none*. Tooling only: no form or reading changes, and the parser's accept/reject behavior does not change. Every comparison rule cites the grammar section it follows. 

## Design

### Reader facts in the translation prompt (phase 5)

`buildPrompt` in `llm-prompt.ts` stays pure and stays in `src/parse/`. It gains an optional input: plain-English structure lines (*"may" covers "want"*, *the order of X and Y is not settled*, *the channel from sentence 1 still applies*). A new `src/interpret/prompt-notes.ts` builds those lines from readings, and `scripts/parse.mjs --llm-prompt` passes them when a new `--structure` flag is set. The flag stays off until the eval says otherwise; the agent bundle does not change in this phase.

## Implementation plan

One phase left, one orchestrator session. At the end of it, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The orchestrator saves `npm run verify -- --baseline` at the start of each phase. Between units the gate is `npm run verify -- --allow-generate` against that baseline; the phase's final gate is a full `npm run verify` that passes with no new errors. No phase edits `say-*.md`, `english.md` or `src/english-helper/`, so there is no recall gate. Phase 5 edits no grammar page, so there is no style gate.

### Phase 5: the translation prompt

**E1 Structure lines.** Agent: `proposal-worker`, `model: opus`, effort `high`.
Write `src/interpret/prompt-notes.ts` and its test per [reader facts in the translation prompt](#reader-facts-in-the-translation-prompt-phase-5); add the optional input to `buildPrompt` (a test that the prompt is byte-identical when it is absent) and a `--structure` flag to `--llm-prompt` in `scripts/parse.mjs`. One line of the [Parsing](../../meta/procedures/read-ageben.md#parsing) section names the flag as experimental.
**May edit:** `src/interpret/prompt-notes.ts`, `src/interpret/prompt-notes.test.ts`, `src/parse/llm-prompt.ts`, `src/parse/llm-prompt.test.ts`, `scripts/parse.mjs`, `docs/meta/procedures/read-ageben.md`.

**E2 Eval.** Agent: *orchestrator*.
Run `scripts/llm-eval.ts` with `--structure` on about 20 examples that have two or more whole-clause frames, using stored replies as the without-structure baseline where they exist (run without the flag only where none is stored). Run the full set only if the subset shows a gain. Record both miss rates and the cost on the Status line.

**E3 Keep or drop.** Agent: *orchestrator*.
If the overall miss rate drops by at least 3 points: make `--structure` the default, say so in `read-ageben.md`, and log whether to add the reader to the agent bundle as a new open decision with the bundle size. Otherwise: remove the flag and `prompt-notes.ts`, and add one line to the [parse or reading](../../meta/interpreter.md#parse-or-reading) table saying the prompt was tried with reader facts on this date and did not improve.
**May edit:** `scripts/parse.mjs`, `src/interpret/prompt-notes*.ts`, `src/parse/llm-prompt*.ts`, `docs/meta/procedures/read-ageben.md`, `docs/meta/interpreter.md`.

### Rule digest

Copied into every subagent brief:

> - Read `AGENTS.md`. This proposal is tooling only: no form or reading changes, and the parser's accept/reject behavior does not change. A change that would need one is a stop-and-alert finding, unless your brief names the user's decision that allows it.
> - A tool that needs what a sentence says reads readings (`src/interpret/`); one that needs how it is written reads the parse ([parse or reading](docs/meta/interpreter.md#parse-or-reading)). When a reading lacks something, add it to the reader with its classification-table row in `docs/meta/interpreter.md`, never a local walk of the parse tree.
> - The reader never defaults a missing field, binds a pronoun, or orders an unsettled pair (interpreter.md#reader-rules). Comparison rules that do (the omitted act word) live in the consumer and cite their grammar anchor. "Same reading" is `sameReadings` in `src/interpret/equal.ts` ([equal readings](docs/meta/interpreter.md#equal-readings)); doc examples load tables with `loadDefaultTables()`.
> - This repo needs Node 24. If `node -v` prints a lower version, prefix every shell command with `export PATH=/opt/node24/bin:$PATH &&` (shell state does not persist between calls).
> - Run `.ts` with `npx --no-install tsx`. Check Ageben forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`; see readings with `npm run -s reading -- '<text>'`; keep `--llm-prompt` for working out what a sentence means.
> - List headings before reading a long page (`npm run -s outline -- <file>`) and read only the ranges you need. Never paste raw build output.
> - Scripts that edit files go in a file under `tmp/scratch/reading-consumers/`, never inline. Reports a later unit or phase reads go in `docs/proposals/in-progress/reading-consumers-files/` (tracked: `tmp/` does not survive between sessions).
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it; skip it when only `tmp/` changed). On a new error, read only that line of `tmp/logs/verify-last.log`.
> - Edit only the files on your **May edit:** line. Do not commit; the orchestrator does.
> - Stop and report, without working around it, when: a premise of the item no longer holds; the item needs a parser or grammar change your brief does not name; skipping it would leave later items on a broken state; or the item cannot be done as written.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
>
> **Report** (about 150 words): done (one line); counts or ids a later unit is briefed from; files touched (a count); `AGENTS.md` Owns changes; the `verify` line; skips with reasons; anything the orchestrator must run or fix; **left:**; **inefficient:**.

Rule sections a subagent may open when the digest does not settle a question: [reader rules](../../meta/interpreter.md#reader-rules), [classification table](../../meta/interpreter.md#classification-table), [stop and alert](../../meta/procedures/proposals.md#stop-and-alert).

### Commits

One commit per unit after its gate, staged to that unit's files, message `reading-consumers <ID>: <what> [skip-cd]` and the co-author line; plus one commit of the consolidated proposal at the end of each phase. Expected: 1–2 + 1. When phase 5 ends, the proposal is deleted.

## Open decisions

None open.

## Background

### Problem

The interpreter turns a parse into readings, one per clause: claim, frames, the order between frames, details, and links ([interpreter.md](../../meta/interpreter.md)). [Parse or reading](../../meta/interpreter.md#parse-or-reading) says no tool walks the parse tree for meaning. Three tools that do work out meaning still walk the tree or the resolve records directly:

- **The "same reading" lint.** `reading-equivalence.ts` decides whether two sentences mean the same thing by flattening the parse with its own rules: a second definition of "same reading" next to the reader's, which ignores frame order beyond keeping `/h/` words in relative order. It checks every **Also correct:**, **Pick one**, **Fix it** and **What changes** item.
- **Construction search's frame queries.** `frame=`, `--over`, `--under`, `--unordered` and `--diff` read `resolve.scope`. Scope records exist only for sentence clauses, members of a clause join, and dependents. So frames inside islands and verb-list items, frames that reach one adjective, and stance lists are invisible to these queries.
- **The translation prompt.** `--llm-prompt` gives the model a morph gloss plus prose rules ("a plan … on `h-` covers the whole sentence") and leaves the model to work out scope. The reader already knows which frame covers which, which pairs are unsettled, and which frames carry over from an earlier sentence.

### Goals

- One definition of "same reading", the interpreter's, used by the practice-item lint.
- Construction search's frame queries see every frame the reader places, with a way to restrict them to whole-clause frames.
- A measured answer on whether reader facts improve the translation prompt, kept only if they do.

### Non-goals

- Moving the scope and carry computation out of the parser's resolve stage (`src/parse/scope.ts`, `src/parse/carry.ts`), or moving the reader's own attachment work (clause-join grouping, hook landmarks, counted ranges) into the tree. Both are boundary moves, not tool switches; they need their own idea.
- Form-level tools stay on the parse (listed in [parse or reading](../../meta/interpreter.md#parse-or-reading)).
- Claim search (`structural-search.md`).
- The mind map (`mind-map-view.md`).
