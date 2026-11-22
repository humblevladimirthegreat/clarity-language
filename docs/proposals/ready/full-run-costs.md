# Proposal: full-run costs

**Status:** READY 2026-11-22. Written 2026-11-21 as an optimization idea, from the token review of the full run of `vocab-flashcards.md` (runner session `67f2111b`, 46 subagents, 10.6M weighted tokens). Decisions, 2026-11-22:
- Design 1 (standing context) is done for `AGENTS.md`: `omitClaudeMd: true` on the five custom agents. The connector toggle is still open.
- Phase executors run as background `claude -p` processes that the runner starts, and pass their report back through a staging file. The user doesn't expect permissions to be a problem, since executors already run unattended.
- This proposal's own phase 2 is the pilot: it runs under a process executor, and its measurements decide whether process executors stay.

**Related:** [full-execution.md](../../meta/procedures/full-execution.md), [proposals.md](../../meta/procedures/proposals.md#running-with-subagents), [phase-executor.md](../../../.claude/agents/phase-executor.md), [proposal-worker.md](../../../.claude/agents/proposal-worker.md), [run-reviewer.md](../../../.claude/agents/run-reviewer.md), [parser-pipeline.md](../../meta/parser-pipeline.md#repo-layout), [verify.ts](../../../scripts/verify.ts), [token-report.mjs](../../../scripts/token-report.mjs), [flashcards-check.py](../../../scripts/flashcards-check.py), [tmp-paths.ts](../../../src/tmp-paths.ts).  
**Depends on:** the uncommitted 2026-11-22 edits for Design 1 (the five files under `.claude/agents/`, `agents-md.md`, `proposals.md`) and the dirty-path exception in `full-execution.md` are committed first, because U2 edits `phase-executor.md` and `full-execution.md` and commits whole files.  
**Design authority:** none. Tooling and editor procedure only.

## Design

Costs are weighted tokens, as `npm run token-report` counts them (cache write 1.25× at 5 minutes and 2× at 1 hour, cache read 0.1×, output 5×). The findings each item answers are under [Background](#background).

1. **Standing context** (finding 1). *Done 2026-11-22 for `AGENTS.md`.* `omitClaudeMd: true` on `proposal-worker`, `phase-executor`, `checkpoint-writer`, `style-editor` and `run-reviewer`, each restating the `AGENTS.md` tooling notes it uses. The MCP block: a process executor starts with `--strict-mcp-config` and no config, so neither it nor its workers carry the Claude Docs instructions. One-phase sessions still carry them until the user turns the connector off with `/mcp` (Open decisions).
2. **Process executors** (finding 2). The runner starts each phase's executor as a top-level `claude -p` process, in a background Bash call, through `npm run phase-exec -- <proposal> <phase>`:
   - The process runs `--agent phase-executor`, with the plan's model and effort, `--permission-mode auto`, `--strict-mcp-config`, and a `--session-id` the launcher picks.
   - As a top-level session it caches for 1 hour, so a worker that runs past 5 minutes no longer costs the executor a full rewrite. And its Agent calls run in the background, which a subagent's can't, so a keep-alive is possible if the 1-hour write premium turns out to cost more than it saves (Open decisions).
   - The executor writes its phase report, in the same fields as now, to a staging file: `tmp/state/full-runs/<name>-phase-<N>.md`. The launcher prints one line when the process exits: the report's path, the exit code, and the session id. It fails when the report is missing.
   - The launcher appends one line per phase to `tmp/state/full-runs.jsonl` (proposal, phase, session id, start, end, exit code). The runner passes those session ids to the run reviewer, and `token-report --session` takes several ids.
   - Workers sit one level below the executor instead of two below the runner.
   - The subagent executor stays as the fallback when the launcher fails, or when a plan names it for a phase. Its parallel batches of independent units (several Agent calls in one message) still apply.
3. **Name the entry points once** (finding 3). A *Library entry points* list under *Repo layout* in `parser-pipeline.md`:
   - walk every Ageben code span in the docs: `walkAgebenSpans`, `classifyAgebenSpan` (`src/lint/ageben-docs.ts`)
   - parse with tables: `parseWithTables` (`src/parse/parse-core.ts`), `loadDefaultTables` (`src/parse/index.ts`)
   - visit words: `visitResult` (`src/parse/ast-walk.ts`)
   - the site origin: `SITE_ORIGIN` (`scripts/lib/llms-txt.ts`)

   In `proposals.md` (step 2, briefs), the *built by earlier units* notes also list the library helpers each unit used, not just what it built.
4. **Flaky checks** (finding 4). In *Working* in `proposal-worker.md`: when a check fails and then passes on a rerun with no edit, the worker reports it as a possible flake, quoting the failing line, and doesn't bisect it. The release-search failure in `scripts/flashcards-check.py` also prints the found notes' decks and release tags, so one run shows the cause.
5. **Read to Background** (finding 5). In `phase-executor.md`, the executor lists the proposal's headings (`npm run -s outline`) and reads from the top to `## Background`, opening Background only when a unit needs it.
6. **Verify prints the assertion** (finding 6). In `scripts/verify.ts`, under each new `test | …` key, print the first assertion message for that test from the log, clipped with `clip()`.

## Findings

What the 2026-11-21 and 2026-11-22 checks settled, kept for the pilot:

- **`omitClaudeMd` (verified).** The frontmatter field starts a custom subagent without user, project and local instruction files, `AGENTS.md` included (Claude Code v2.1.271 or later; the installed CLI is 2.1.285). A `CLAUDE.md` or `AGENTS.md` in a directory below the root would still load; the repo has none, and no worktree under `.claude/worktrees/` is in use.
- **The MCP block.** A `tools` allowlist doesn't keep it out: all 46 subagents carried it. `/mcp` turns one connector off for this project, in the user's `~/.claude.json`. `"disableClaudeAiConnectors": true` in `.claude/settings.json` turns off every claude.ai connector, Google Drive included. `claude -p --strict-mcp-config` skips every MCP source but `--mcp-config` (from `claude --help`, 2.1.285; the pilot checks that it drops the claude.ai connectors too).
- **Subagents cache for 5 minutes (verified).** The main conversation gets a 1-hour TTL on a subscription within plan usage; everything else, subagents included, gets 5 minutes. Every executor cache write in the run was `ephemeral_5m`.
- **A 1-hour TTL for subagent executors is about break-even.** It exists (`experimental: { cacheTtl: 1h }` in the agent file, or the `subagentPromptCacheTtl` setting). By token weights, the seven executors wrote 909k at 5 minutes (1,137k weighted); at 1 hour they'd have written 534k at 2× plus 375k read at 0.1×, about 1,106k. Token weights may not match what the usage windows charge on a subscription, which the pilot measures directly.
- **A subagent can't keep its cache warm (tested 2026-11-21).** A subagent's Agent tool has no background parameter; `run_in_background: true` is accepted and ignored (`requestShape: foreground`). The call held the executor's turn for the whole worker (364 s and 424 s), a background `sleep 270` couldn't wake it, and both executors rewrote their whole context on return (22.1k and 21.6k written, 0 read).
- **Untested for process executors:** whether a `claude -p` session keeps running while its background workers do, and delivers their results before it exits; whether `--agent phase-executor` honors the agent file's `omitClaudeMd` and `tools`; and whether its cache writes are `ephemeral_1h`. U1's smoke test settles these before anything depends on them.

## Plan

Two phases, each in a fresh orchestrator session, each well under 40 orchestrator turns. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Each phase starts with `npm run verify -- --baseline`. Every unit ends with `npm run verify -- --allow-generate`, and the orchestrator commits it when green. Subagents never commit.

The cut falls where the launcher exists: phase 1 builds it and runs under a subagent executor; phase 2 is the pilot and runs under a process executor. No unit edits `docs/grammar/`, so there is no style gate and no recall gate.

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

### Phase 1: the launcher

Runs under a subagent executor (or a one-phase session), the way full runs work today.

**U1: launcher, staging report, smoke test.**
`proposal-worker`, `model: opus`, effort `high`.
- Write `scripts/phase-exec.ts` and its `npm run phase-exec` entry, per [Design 2](#design): pick a session uuid, run `claude -p` with the flags there and a one-line prompt (*Carry out phase N of `name.md` as a full-run phase executor. Your session id is `<uuid>`; write your report to `<path>`.*), append the `full-runs.jsonl` line, and print the one-line result. `--rest` makes the prompt *the rest of phase N*. `--model` and `--effort` override `opus` and `high`.
- `scripts/token-report.mjs`: `--session` takes a comma-separated list of id prefixes.
- **Smoke test**, before anything depends on the launcher: start a `claude -p --agent phase-executor` process on a throwaway prompt that launches one `proposal-worker` whose job runs past 6 minutes (for example `npm run verify -- --baseline` into a scratch copy of the baseline path, or a backgrounded wait), then writes a stub report to a scratch staging path. Record: (a) whether the process stayed up until the worker returned and wrote the report; (b) the cache-write kinds and whether the executor's first call after the worker read or rewrote its context (`npm run token-report -- --session <uuid> --calls`); (c) whether `AGENTS.md` and the MCP instructions were in its first message; (d) whether the agent file's `tools` held. Put the four results in the report.
- If (a) fails, or the report never reaches the staging file, this is a [stop-and-alert](../../meta/procedures/proposals.md#stop-and-alert) finding. The options: the executor waits on its workers some other way the test finds; the subagent executor with parallel batches; or the runner launches workers itself.

**May edit:** `scripts/phase-exec.ts`, `package.json`, `scripts/token-report.mjs`, a test for the launcher's argument handling under `scripts/` or `test/`, scratch files.

**U2: procedure and agent files.**
`proposal-worker`, `model: opus`, effort `high`. Briefed from U1's report (the smoke-test results and the launcher's exact output line).
- `full-execution.md`: the executor is a `claude -p` process during the pilot. Rewrite *Roles* (executor row, the nesting paragraph), the runner's launch line (`npm run phase-exec` in a background Bash call; on exit, read the staging report), *After each phase* (a missing report or a nonzero exit stops the run), and *Optimization review* (session ids from `tmp/state/full-runs.jsonl`). Keep the subagent executor as the fallback, with when to use it. Note the open pilot in one sentence, naming this proposal by filename.
- `phase-executor.md`: write the report to the path in the prompt as the last act, and also return it. Read the proposal to `## Background` only ([Design 5](#design)). Launch independent units of a phase in one message when their files are disjoint. Drop wording that assumes it is a subagent.
- `run-reviewer.md`: several session ids, one per executor plus the runner; `token-report --session` with the list.
- `proposals.md` line 120 (*a phase-executor subagent*): match the new wording.

**May edit:** `docs/meta/procedures/full-execution.md`, `docs/meta/procedures/proposals.md`, `.claude/agents/phase-executor.md`, `.claude/agents/run-reviewer.md`.

Phase 1 commits: U1, U2, the consolidated proposal (3).

### Phase 2: the pilot

The runner starts this phase with `npm run phase-exec -- full-run-costs.md 2`, after re-reading the *Roles* and *After each phase* sections of `full-execution.md`, which phase 1 changed. The executor records the start of each worker and its duration, for U6.

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
`proposal-worker`, `model: opus`, effort `medium`. Briefed with the executor's session id, its worker timings, and the vocab-flashcards per-unit medians (5-hour window 2.3 points a unit, 7-day 0.2; `npm run usage-window -- --deltas`).
- From `npm run token-report -- --session <executor id> --calls`: the cache-write kinds; each gap over 5 minutes, and whether the next call read or rewrote; what the executor's context cost per unit against the vocab-flashcards executors.
- Write a *Pilot result* section in this proposal: those numbers, anything that went wrong with the launcher or the report hand-off, and a **Recommendation:** with its confidence on the pilot decision below.

**May edit:** this proposal.

Phase 2 commits: U3, U4, U5, U6, the consolidated proposal (5). The runner adds the phase's usage delta to the *Pilot result* when it reports the end of the run.

### Commits

8 in all, each starting `full-run-costs.md U<n>:` (or `full-run-costs.md: phase <n> done`) and ending `[skip-cd]`.

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
