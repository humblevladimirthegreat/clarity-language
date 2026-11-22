# Optimization review: full-run-costs.md

**Status:** IDEA, 2026-11-22. From the token review of the full run of `full-run-costs.md` (runner 737b85e1, phase 2 process executor 0376f33b; 1.8M weighted over 2 sessions and 9 subagents).  
**Related:** [phase-exec.ts](../../../../scripts/phase-exec.ts), [phase-executor.md](../../../../.claude/agents/phase-executor.md), [full-execution.md](../../../meta/procedures/full-execution.md).

The run was lean. Most of its spend was work the task needed: building and smoke-testing the launcher, U2's procedure edits, and the pilot. Two other costs are left out on purpose. Phase 1's subagent executor rewrote 34k of context after U1's 12.8-minute wait; process executors, which this run built, fix that. The parallel `dist/` clash is fixed by the rule that workers never run in parallel. One cause remains.

## Problem

1. **A process executor loads `AGENTS.md`, which it never uses: about 33k in this run, about 30k for every process phase after it.** `claude -p --agent phase-executor` ignores the agent file's `omitClaudeMd: true`, so the phase 2 executor started at 18k context, not the subagent executor's 7.8k. About 7k of that is the `AGENTS.md` instructions attachment (25.9k characters).
   - Phase 2 executor, call 1: wrote it once at the 1-hour rate (about 14k weighted), then read it on each of the other 27 calls (about 19k).
   - U1's two smoke-test sessions (6b5f07f5, 5f310761) each paid it once more, about 34k together. That was a one-off.
   - The executor needs none of it. Its brief, `proposals.md`, and the proposal route all its work, and as a subagent it runs without `AGENTS.md` by design. It should have cost about 0.
   - The proposal's *Decided by agent* line accepted this cost (medium confidence, not flagged), because `--bare` would drop `AGENTS.md` but needs an API key. No other way to drop it was tried. A seven-phase run would pay about 200k.

## Sketch

1. In `scripts/phase-exec.ts`, start the child with `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` added to its environment (`spawn("claude", …, { env: { ...process.env, CLAUDE_CODE_DISABLE_CLAUDE_MDS: "1" }, … })`). The installed CLI binary contains this variable, but nobody has checked whether it also drops the `AGENTS.md` instructions attachment.
   - Before wiring it in, run one smoke check: a 2-call `claude -p --agent phase-executor` with the variable set. Grep the session transcript for `"type":"instructions"` the way U1 did (`agent-a30943e0`, call 36), and confirm that the first call's context drops by about 7k.
   - If it works, change line 14 of `phase-executor.md` (*As a process you load `AGENTS.md`*) and line 14 of `full-execution.md` (*It loads `AGENTS.md`, because…*) to say a process executor starts without it. Add a `claudeArgs`/env test to `scripts/phase-exec.test.ts`.

## Open questions

1. **Which way to drop `AGENTS.md` from the process executor?**
   - (a) The `CLAUDE_CODE_DISABLE_CLAUDE_MDS` env var. It changes nothing else.
   - (b) `--setting-sources user,local`. This may also drop `.claude/settings.json` and the project's agent definitions, which would break `--agent phase-executor`.
   - (c) Keep it and accept about 30k a phase.

   **Recommendation:** (a), if the smoke check shows the attachment gone; otherwise (c). Medium confidence: the variable exists, but whether it covers `AGENTS.md` is untested.
