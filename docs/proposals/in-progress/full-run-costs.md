# Proposal: full-run costs

**Status:** IN PROGRESS 2026-11-22. Phase 1 (the launcher) done 2026-11-22: U1, U2. Next: phase 2, the pilot, under a process executor. Written 2026-11-21 as an optimization idea, from the token review of the full run of `vocab-flashcards.md` (runner session `67f2111b`, 46 subagents, 10.6M weighted tokens). Decisions, 2026-11-22:
- Design 1 (standing context) is done for `AGENTS.md`: `omitClaudeMd: true` on the five custom agents. The connector toggle is still open.
- Phase executors run as background `claude -p` processes that the runner starts through `npm run phase-exec`, and pass their report back through a staging file ([full-execution.md](../../meta/procedures/full-execution.md#roles)).
- This proposal's own phase 2 is the pilot: it runs under a process executor, and its measurements decide whether process executors stay.

**Decided by agent:**
- 2026-11-22: a process executor loads `AGENTS.md` (about 24k characters), because `claude -p --agent` ignores the agent file's `omitClaudeMd`. Accepted. `phase-executor.md` and `full-execution.md` now say so instead of *you start without AGENTS.md*. `--bare` would drop it, but it needs an API key, not the subscription login. Its workers still start without it. Medium confidence, not flagged. Commit `c629fd2b`.

**Related:** [full-execution.md](../../meta/procedures/full-execution.md), [proposals.md](../../meta/procedures/proposals.md#running-with-subagents), [phase-executor.md](../../../.claude/agents/phase-executor.md), [proposal-worker.md](../../../.claude/agents/proposal-worker.md), [parser-pipeline.md](../../meta/parser-pipeline.md#repo-layout), [verify.ts](../../../scripts/verify.ts), [token-report.mjs](../../../scripts/token-report.mjs), [phase-exec.ts](../../../scripts/phase-exec.ts), [flashcards-check.py](../../../scripts/flashcards-check.py).  
**Design authority:** none. Tooling and editor procedure only.

## Design

Costs are weighted tokens, as `npm run token-report` counts them (cache write 1.25× at 5 minutes and 2× at 1 hour, cache read 0.1×, output 5×). The findings each item answers are under [Background](#background).

3. **Name the entry points once** (finding 3). A *Library entry points* list under *Repo layout* in `parser-pipeline.md`:
   - walk every Ageben code span in the docs: `walkAgebenSpans`, `classifyAgebenSpan` (`src/lint/ageben-docs.ts`)
   - parse with tables: `parseWithTables` (`src/parse/parse-core.ts`), `loadDefaultTables` (`src/parse/index.ts`)
   - visit words: `visitResult` (`src/parse/ast-walk.ts`)
   - the site origin: `SITE_ORIGIN` (`scripts/lib/llms-txt.ts`)

   In `proposals.md` (step 2, briefs), the *built by earlier units* notes also list the library helpers each unit used, not just what it built.
4. **Flaky checks** (finding 4). In *Working* in `proposal-worker.md`: when a check fails and then passes on a rerun with no edit, the worker reports it as a possible flake, quoting the failing line, and doesn't bisect it. The release-search failure in `scripts/flashcards-check.py` also prints the found notes' decks and release tags, so one run shows the cause.
6. **Verify prints the assertion** (finding 6). In `scripts/verify.ts`, under each new `test | …` key, print the first assertion message for that test from the log, clipped with `clip()`.

## Findings

What U6 measures the pilot against:

- **Subagents cache for 5 minutes.** Every subagent executor cache write in the vocab-flashcards run was `ephemeral_5m`. A subagent can't keep its cache warm: its Agent calls run in the foreground, so after a worker that ran past 5 minutes, the executor rewrote its whole context (22.1k and 21.6k written, 0 read, in the 2026-11-21 test).
- **A 1-hour TTL is about break-even by token weights.** The seven vocab-flashcards executors wrote 909k at 5 minutes (1,137k weighted); at 1 hour they'd have written 534k at 2× plus 375k read at 0.1×, about 1,106k. Token weights may not match what the usage windows charge on a subscription, which the pilot measures directly.
- **U1's smoke test** (`claude -p --agent phase-executor`, one worker with a 6.5-minute wait):
  - The process stays up while its background workers run, and an executor that ends its turn is woken by the completion notification. One that polled in a Bash loop wasted 3.5 minutes; `phase-executor.md` now says to end the turn.
  - Every executor cache write was `ephemeral_1h`; workers' stay `ephemeral_5m`. The first call after a 6.6- or 10-minute worker read 18.8k and wrote 0.4k: no rewrite.
  - `AGENTS.md` loads (see *Decided by agent*); no MCP instructions load (`mcp_servers: []`); the agent file's `tools` list holds.
- **The launcher** (`npm run phase-exec -- <proposal> <phase> [--rest] [--model M] [--effort E]`) prints one line on exit: `phase-exec: <staging path> exit <code> session <uuid>`, or `phase-exec: FAIL report missing <path> exit <code> session <uuid>`. The process's own output goes to `tmp/logs/phase-exec-<name>-phase-<N>.log`. Each run appends `{proposal, phase, rest, session, start, end, exit}` to `tmp/state/full-runs.jsonl`, where U6 finds the executor's session id. `npm run token-report -- --session` takes a comma-separated list of id prefixes. The launcher itself has not yet run end to end; phase 2 is its first real run.

## Plan

One phase left, in a fresh orchestrator session, well under 40 orchestrator turns. At the end of the phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. The phase starts with `npm run verify -- --baseline`. Every unit ends with `npm run verify -- --allow-generate`, and the orchestrator commits it when green. Subagents never commit. No unit edits `docs/grammar/`, so there is no style gate and no recall gate.

### Rule digest (copied into every brief)

- The language is **Ageben**. This proposal changes tooling and editor procedure only; no form, reading or grammar page changes.
- Edit only the files on your unit's **May edit:** line. Report anything else that needs a change.
- Every file under `tmp/` goes in a tier folder, through `tmpPath()` in code (`src/tmp-paths.ts`). Staging reports and run logs go in `state/`; probes and scratch scripts in `scratch/`.
- Run `.ts` files with `npx --no-install tsx`, never plain `node`. A new script gets an `npm run` entry in `package.json`.
- A script that prints a lot prints a summary and writes the rest to `tmp/logs/`; cap long lines with `clip()` from `scripts/lib/build-output.ts`.
- Write a script that edits files to `tmp/scratch/` and run it from there, never inline. Use the Edit tool for short replacements.
- Read slices: list headings (`npm run -s outline -- <file>`), then read only the ranges you need.
- Check with `npm run verify -- --allow-generate` at the end of the unit (`--fast` inside it). On a new error, read only that line of `tmp/logs/verify-last.log`; never rerun a failed check before editing. If a check fails and then passes on a rerun with no edit, report it as a possible flake with the failing line, and don't chase it.
- Meta prose follows `docs/meta/doc-style.md`; check your sentences against its checklist.
- `.claude/agents/phase-executor.md` and `run-reviewer.md` restate parts of `full-execution.md` (*Keeping in step* there): change both sides together.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report**, about 150 words: done (one line); findings the next unit is briefed from; files touched as a count; the `verify` line; skips with reasons; **left:**; **inefficient:**.

### Phase 2: the pilot

The runner starts this phase with `npm run phase-exec -- full-run-costs.md 2`, after re-reading the *Roles* and *After each phase* sections of `full-execution.md`, which phase 1 changed. The executor records the start of each worker and its duration, for U6. U3, U4 and U5 edit disjoint files and none is briefed from another, so the executor may launch them in one message.

**U3: entry points.**
`proposal-worker`, `model: sonnet`, effort `medium`.
- [Design 3](#design): the *Library entry points* list in `parser-pipeline.md`, each name checked with a grep before it goes in; the helpers note in `proposals.md` step 2.

**May edit:** `docs/meta/parser-pipeline.md`, `docs/meta/procedures/proposals.md`.

**U4: flaky checks.**
`proposal-worker`, `model: sonnet`, effort `medium`.
- [Design 4](#design): the flake rule in `proposal-worker.md`; the release-search diagnostics in `scripts/flashcards-check.py`. Check with `npm run flashcards`.

**May edit:** `.claude/agents/proposal-worker.md`, `scripts/flashcards-check.py`.

**U5: verify prints the assertion.**
`proposal-worker`, `model: sonnet`, effort `medium`.
- [Design 6](#design), with a test that a failing assertion's message shows under its key.

**May edit:** `scripts/verify.ts`, its test, `scripts/lib/` if a helper is shared.

**U6: pilot measurement.**
`proposal-worker`, `model: opus`, effort `medium`. Briefed with the executor's session id (the phase's line in `tmp/state/full-runs.jsonl`, or the session id in the executor's own prompt), its worker timings, the [Findings](#findings) above, and the vocab-flashcards per-unit medians (5-hour window 2.3 points a unit, 7-day 0.2; `npm run usage-window -- --deltas`).
- From `npm run token-report -- --session <executor id> --calls`: the cache-write kinds; each gap over 5 minutes, and whether the next call read or rewrote; what the executor's context cost per unit against the vocab-flashcards executors, including the `AGENTS.md` load.
- Write a *Pilot result* section in this proposal: those numbers, anything that went wrong with the launcher or the report hand-off, and a **Recommendation:** with its confidence on the pilot decision below.

**May edit:** this proposal.

Phase 2 commits: U3, U4, U5, U6, the consolidated proposal (5). The runner adds the phase's usage delta to the *Pilot result* when it reports the end of the run.

### Commits

5 left, each starting `full-run-costs.md U<n>:` (or `full-run-costs.md: phase 2 done`) and ending `[skip-cd]`.

## Open decisions

- **Keep process executors** (the user's, after phase 2; blocking only the follow-up). Options: (a) keep them as the full-run default and drop the pilot sentence from `full-execution.md`; (b) keep them and add a keep-alive (a background `sleep 270` while a worker runs) with a 5-minute TTL, if the 1-hour writes cost more than they save; (c) go back to subagent executors with parallel batches. **Recommendation:** wait for U6. Whatever the user picks, the orchestrator makes the edit itself, without a subagent, and deletes this proposal.
- **The Claude Docs connector** (not blocking). Process executors drop it for full runs. For one-phase sessions, the user can turn it off with `/mcp`, or `"disableClaudeAiConnectors": true` in `.claude/settings.json` drops every claude.ai connector. **Recommendation:** the `/mcp` toggle, a one-time user action, unless no connector is wanted here. Confidence **medium**.

## Background

### Problem

From the token review of the vocab-flashcards full run:

1. **Standing context that no subagent used: about 600k.** Every subagent's first message carried `AGENTS.md` (about 6k tokens) and the claude.ai Claude Docs MCP instructions (about 0.6k). The briefs named every page and file a worker opened, and the executors routed from the proposal, so the routing tables and the MCP block never helped. 45 subagents wrote that context fresh, and the 950 subagent calls each read it again: about 4.2k × 158 ≈ 660k.
2. **Executor cache expiry while a worker runs: 469k, about 430k avoidable.** An executor blocks on its Agent call, so when a worker takes more than 5 minutes, the executor rewrites its whole context when the worker returns. This happened 6 times (Phase 2 after U6, 52k; Phase 3 rest after E4, 74k; Phase 4 after U17, U19 and U22, 55k, 65k and 75k; Phase 6 after U28 and U30 in parallel, 52k): 375k rewritten at 1.25×, where warm reads would have cost about 38k.
3. **Workers searching for code entry points: about 170k avoidable.** U14 spent 15 calls (109k) finding how to walk every Ageben example in the docs; U17 spent 10 calls (111k) finding the site origin (`SITE_ORIGIN` in `scripts/lib/llms-txt.ts`). `export type LexWord` was grepped in 7 subagents, `OverlayRow` in 5, `MorphWord` in 3.
4. **Chasing a check failure that didn't come back: about 75k.** U17's `npm run flashcards` failed once (the Claritish release search found all 98 notes), and U17 spent 8 calls rerunning the import check; every rerun passed.
5. **Executors reading the proposal's Background: about 35k.** Six of seven executors read the whole proposal, including the section consolidation moves to the end so it can be skipped.
6. **A verify FAIL line that didn't name the fix: 32k.** Verify printed only `test | generated WordNet index`; the executor spent 3 calls finding the assertion, which says `run npm run english-helper-wordnet`.

### Goals

- Cut the standing context and the executor rewrites, which were most of the avoidable cost.
- Find out, on a real phase, whether process executors cost less in the usage windows than subagent executors, before making them the default.

### Non-goals

- Changing how workers are briefed or sized, beyond the entry-points note.
- Moving runner work into executors, or executor work into the runner.
