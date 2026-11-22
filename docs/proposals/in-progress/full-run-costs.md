# Proposal: full-run costs

**Status:** IN PROGRESS 2026-11-22. Phase 1 (the launcher) done 2026-11-22: U1, U2. Phase 2 (the pilot) done 2026-11-22 under a process executor: U3, U4, U5, U6. No unit is left; the proposal waits on the user's **Keep process executors** decision. Written 2026-11-21 as an optimization idea, from the token review of the full run of `vocab-flashcards.md` (runner session `67f2111b`, 46 subagents, 10.6M weighted tokens). Decisions, 2026-11-22:
- Standing context is done for `AGENTS.md`: `omitClaudeMd: true` on the five custom agents. The connector toggle is still open.
- Phase executors run as background `claude -p` processes that the runner starts through `npm run phase-exec`, and pass their report back through a staging file ([full-execution.md](../../meta/procedures/full-execution.md#roles)).
- This proposal's own phase 2 was the pilot: it ran under a process executor, and its measurements (*Pilot result*) inform whether process executors stay.

**Decided by agent:**
- 2026-11-22: a process executor loads `AGENTS.md` (about 24k characters), because `claude -p --agent` ignores the agent file's `omitClaudeMd`. Accepted. `phase-executor.md` and `full-execution.md` now say so instead of *you start without AGENTS.md*. `--bare` would drop it, but it needs an API key, not the subscription login. Its workers still start without it. Medium confidence, not flagged. Commit `c629fd2b`.

**Related:** [full-execution.md](../../meta/procedures/full-execution.md), [proposals.md](../../meta/procedures/proposals.md#running-with-subagents), [phase-executor.md](../../../.claude/agents/phase-executor.md), [proposal-worker.md](../../../.claude/agents/proposal-worker.md), [parser-pipeline.md](../../meta/parser-pipeline.md#repo-layout), [verify.ts](../../../scripts/verify.ts), [token-report.mjs](../../../scripts/token-report.mjs), [phase-exec.ts](../../../scripts/phase-exec.ts), [flashcards-check.py](../../../scripts/flashcards-check.py).  
**Design authority:** none. Tooling and editor procedure only.

## Findings

Costs are weighted tokens, as `npm run token-report` counts them (cache write 1.25× at 5 minutes and 2× at 1 hour, cache read 0.1×, output 5×). What the pilot result compares against:

- **Subagents cache for 5 minutes.** Every subagent executor cache write in the vocab-flashcards run was `ephemeral_5m`. A subagent can't keep its cache warm: its Agent calls run in the foreground, so after a worker that ran past 5 minutes, the executor rewrote its whole context (22.1k and 21.6k written, 0 read, in the 2026-11-21 test).
- **A 1-hour TTL is about break-even by token weights.** The seven vocab-flashcards executors wrote 909k at 5 minutes (1,137k weighted); at 1 hour they'd have written 534k at 2× plus 375k read at 0.1×, about 1,106k. Token weights may not match what the usage windows charge on a subscription, which the pilot measures directly.
- **U1's smoke test** (`claude -p --agent phase-executor`, one worker with a 6.5-minute wait):
  - The process stays up while its background workers run, and an executor that ends its turn is woken by the completion notification. One that polled in a Bash loop wasted 3.5 minutes; `phase-executor.md` now says to end the turn.
  - Every executor cache write was `ephemeral_1h`; workers' stay `ephemeral_5m`. The first call after a 6.6- or 10-minute worker read 18.8k and wrote 0.4k: no rewrite.
  - `AGENTS.md` loads (see *Decided by agent*); no MCP instructions load (`mcp_servers: []`); the agent file's `tools` list holds.
- **The launcher** (`npm run phase-exec -- <proposal> <phase> [--rest] [--model M] [--effort E]`) prints one line on exit: `phase-exec: <staging path> exit <code> session <uuid>`, or `phase-exec: FAIL report missing <path> exit <code> session <uuid>`. The process's own output goes to `tmp/logs/phase-exec-<name>-phase-<N>.log`. Each run appends `{proposal, phase, rest, session, start, end, exit}` to `tmp/state/full-runs.jsonl`, where U6 finds the executor's session id. `npm run token-report -- --session` takes a comma-separated list of id prefixes. The launcher itself has not yet run end to end; phase 2 is its first real run.

## Pilot result

Phase 2 ran as a `claude -p` process, session `0376f33b`, with U3–U5 in one parallel batch and then U6. Numbers come from the transcripts, through U6's launch at 00:56:22:

- **Cache-write kinds.** All 18 executor calls wrote `ephemeral_1h`. All worker calls wrote `ephemeral_5m` (U3 15.4k, U4 14.4k, U5 27.1k).
- **Executor cost.** It wrote 44.1k and read 643k: 88k weighted in writes, 152k with reads. Its first call wrote 14.4k at an 18k context (system prompt and `AGENTS.md`); its second wrote 10.3k (`proposals.md`).
- **Per unit (four units).** The executor wrote about 11k a unit: 22k weighted in writes, 38k with reads. The `AGENTS.md` start is about 7k of that. The vocab-flashcards executors wrote about 29k a unit at 5 minutes, 37k weighted in writes alone (909k over about 31 units).
- **Gaps.** None passed 5 minutes; the longest was 169 s, waiting on the batch. U6 itself ran 91 s, so no executor gap in the whole phase passed 5 minutes, and this phase didn't test read against rewrite after a long worker; U1's smoke test is still the only evidence (a read after 6.6 and 10 minutes).
- **Break-even.** The 1-hour premium on this phase's writes was about 33k weighted (44.1k × 0.75). One rewrite of the 48k context at 5 minutes costs 60k; a read at 1 hour costs 5k. So one gap past 5 minutes a phase pays for the premium.
- **Launcher and hand-off.** The three parallel units each ran `npm run verify`, and their builds clashed in `dist/`: U3's verify failed twice in `docs:publish`, with `FileNotFoundError` writing `dist/grammar/flashcards/*.apkg`. The executor's verify after the batch passed. The `full-runs.jsonl` line is written only when the process exits, so the executor had to pass its session id to U6 in the brief. `token-report` prints neither cache-write kinds nor gaps, so U6 read them from the transcripts with a scratch script.

**Recommendation:** (a): keep process executors as the full-run default. They cost less per unit than the vocab-flashcards subagent executors, and one long worker a phase pays for the 1-hour premium. (b) saves at most the 33k premium; its keep-alive wakes each read the whole context, and a missed wake costs a 60k rewrite. Either way, give parallel batches their own fix in the follow-up: units in a batch run a verify that doesn't write to `dist/`, or verify takes a lock on `dist/`. Then the executor's verify after the batch is the full one. Confidence **medium**: the numbers are token weights, and the windows may charge differently.

The usage-window delta decides it. If phase 2's 5-hour delta is at most about 10 points (2.3 a unit over four units), (a) stands. If it is above about 12 points (3 a unit), the windows charge the 1-hour writes more than their weights, and (b) is the better choice. (c) is the better choice only if the delta is above about 16 points (4 a unit). A process executor would then cost more than a subagent executor even after a keep-alive cut its writes to the 5-minute rate.

## What is left

No unit is left. The runner adds phase 2's usage-window delta to *Pilot result* when it reports the end of the run. The user then settles **Keep process executors**; the orchestrator makes that edit itself, without a subagent, and deletes this proposal. The pilot found three follow-ups, for that edit or a new idea:

- Parallel units each run `npm run verify`, and their builds clash in `dist/` (see *Launcher and hand-off*). Options: units in a batch run a verify that doesn't write `dist/`, or verify takes a lock on it.
- `token-report` prints neither cache-write kinds nor gaps between calls. U6 read them from the transcripts with `tmp/scratch/u6-ttl.mjs`, which the build deletes a week after its last write.
- The `full-runs.jsonl` line is written only when the process exits, so a unit that measures the running executor takes its session id from the executor's prompt.

## Open decisions

- **Keep process executors** (the user's, after phase 2; blocking only the follow-up). Options: (a) keep them as the full-run default and drop the pilot sentence from `full-execution.md`; (b) keep them and add a keep-alive (a background `sleep 270` while a worker runs) with a 5-minute TTL, if the 1-hour writes cost more than they save; (c) go back to subagent executors with parallel batches. **Recommendation:** (a), confidence **medium**, unless the usage-window delta says otherwise (*Pilot result*). Whatever the user picks, the orchestrator makes the edit itself, without a subagent, and deletes this proposal.
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
