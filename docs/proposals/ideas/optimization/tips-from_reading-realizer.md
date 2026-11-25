# Tips from reading-realizer: token spend

**Status:** IDEA, 2026-11-25.  
**Related:** [proposals.md](../../../meta/procedures/proposals.md#running-with-subagents), [proposal-plans.md](../../../meta/procedures/proposal-plans.md#phases), [full-execution.md](../../../meta/procedures/full-execution.md#phase-executor), `.claude/agents/proposal-worker.md`, `.claude/agents/phase-executor.md`, `scripts/round-trip.ts`, `scripts/phase-exec.ts`, `scripts/hooks/guard-long-output.mjs`. The run reviewed is phase 2 of `reading-realizer.md` (runner, the phase 2 executor killed at the 2-hour limit, the rest executor; 11 workers; 10.3M weighted tokens).

Not design authority. Tooling and procedure only.

## Problem

Costs are weighted tokens (cache read 0.1×, 1 h write 2×, 5 min write 1.25×, output 5×), summed per cause over every agent it touched. The five causes come to about 1.7M of 10.3M. Most of the rest is the normal cost of a unit (see *Measurements*).

1. **Workers ran far past the 25-turn / 80k point (about 500k net).** [Running with subagents](../../../meta/procedures/proposals.md#running-with-subagents) step 1 says to start a fresh subagent once a context passes about 25 turns or 80k. Each brief gave 5 to 6 items "in order, at the turn cap", but named no cap, so five units ran 65 to 90 calls up to 127k–156k: U8c2 (rest, `aed9867d`, 90 calls), U8b (`a99eb945`, 84), U7 (phase 2, `ad22a94d`, 84), U6 (`a832ce5b`, 65), U5b (`ab706d00`, 72). Each crossed 80k between calls 29 and 37. Context above 80k cost 895k across the workers (U8c2 263k, U8b 187k, U7 147k, U6 111k, U5b 91k, U8a 56k). A fresh worker at the cap would re-orient for about 70k, so about 500k could have been saved.
2. **The round trip has no flags for trip detail, ratchet lowering, the meaning view or spelling, so workers built their own (about 520k).** 10 of 11 workers read `scripts/round-trip.ts` or `src/round-trip/round-trip.ts` for flags and exports (20 calls, 237k, e.g. U8c2 calls 15–17, U8b 5–8, U5 23–24). Then they wrote 21 scratch tools (285k). A ratchet lowerer was written in 6 workers (`u5-lower.ts`, `u5b-lower-ratchet.mjs`, `u6-lower-ratchet.mjs`, `u7-ratchet.mjs`, `u7b-lower.mjs`, `lower-ratchet.mjs`). A per-trip printer of gloss, realized line and detail was written in 5 (`*-trips.ts`, `u6-trip.ts`, `u7-trip.ts`). A meaning-view printer was written in 3 (`u5-view.ts`, `u6-view.ts`, `u8c2-view.ts`). U8c wrote a `spell` probe. `--texts` lists only texts, and `--ratchet` only prints JSON. Running the 74 scratch tools (1.2M) is not counted, since a built-in tool would cost about the same to run. With built-in flags, finding and writing them would have cost about nothing.
3. **Hook-blocked inline scripts (about 245k).** The inline-script hook blocked 17 calls, at least one in every worker. There were 4 `python3 - <<EOF` edits (U8a call 27, U6 32, U5 32, U7 14), about 6 heredoc edit scripts (U6 36, U5b 55, U7b 41, U7 71, U8b 47, U8c2 45), about 6 heredoc read-only probes into `tmp/scratch/` (U8c2 26, U8c1 23, U8c 20, U5b 17, U8a 9, U8a-resumed 36), and one `sleep 60` (U6 10). Each block wasted the whole call, including the script's output tokens at 5×, and the worker then wrote the script again with Write. The rule is already in `proposal-worker.md` (the edit-shape bullet) and in the hook's message, yet every worker hit it at least once. The read-only probes were blocked only because a heredoc wrote them, although writing the same file with Write is allowed.
4. **U8c started without a spell probe (about 250k).** The first U8c worker (rest, `aebb091d`, 30 calls, 276k) found at calls 21–28 that built-word glosses do not spell. It stopped, and the executor split the unit into U8c1 (spell) and U8c2. One spell probe of the unit's sample glosses before briefing would have cost about 20k and shown it at once. [Running with subagents](../../../meta/procedures/proposals.md#running-with-subagents) asks the orchestrator to probe shared premises only for research units (`reading.mjs probe`). Nothing asks it to probe the lower layer a code unit relies on, and there is no `spell` command to probe with.
5. **The phase 2 executor was killed at the 2-hour background limit (about 200k).** The phase held 10 units at 17–24 min each, about 200 min, in one `phase-exec` run, and nothing tracks wall time. The process was killed (exit 143) mid-U8a. Recovery cost the runner about 10 turns at 100–115k context (about 146k, including the run's only cache rewrite: 34k tokens, 68k, after the runner's 117.7-min wait). The rest executor's start up to its first worker cost 172k, against 142k for the original executor. Re-orienting U8a cost about 70k: the partial `git diff`, `verify --fast`, and three round-trip diffs. A planned `SPLIT` at a unit boundary would still pay one executor start (about 140k) and a few runner turns.

**The build-time hypothesis does not hold.** No worker's gap between calls exceeded 5 min (the longest was 4.6 min). `npm run verify` (build included) took 174–261 s in the foreground, and each worker's 5 min cache writes equal its peak context, so each token was written once. The executors use 1 h writes and waited 11–21 min, with no rewrites (1–1.7k written after each wait). The only rewrite in the run was the runner's after the kill, 68k (0.7%). The margin is thin: U5's final `page-readers` plus `verify` took 261 s.

## Sketch

1. **A turn cap in every code brief.** Have `phase-executor.md` add one line to each code brief: *stop at an item boundary after about 40 calls or once context passes about 90k, leave the tree green, and report* **left:**. The executor then briefs a fresh worker from that list. Also say in [running with subagents](../../../meta/procedures/proposals.md#running-with-subagents) step 1 that a brief must give the cap as a number, not "the turn cap". For example, U8c2's six items would run as two workers of about 45 calls each, each peaking near 80k.
2. **Round-trip and realizer probes as flags.** In `scripts/round-trip.ts`, add `--detail KEY…` (each trip's verdict, key, text, gloss, realized line and detail: what the `*-trips.ts` scripts printed) and `--lower`. `--lower` lowers `src/round-trip/round-trip-ratchet.json` to min(stored, now), never adds a key, and prints any count that would rise. Add `view TEXT…` (the meaning view from `project`) and `spell GLOSS…`, either as round-trip subcommands or as a new `scripts/realize.ts`. Name all of them in the brief's digest, which already lists `--texts` and `--ratchet`.
3. **Let a quoted heredoc create a scratch file.** In `scripts/hooks/guard-long-output.mjs`, allow `cat > <tmp/scratch or scratchpad path> <<'EOF'` with a quoted delimiter. It is the same as a Write call, and shell quoting cannot break it. Keep blocking `python3 -`, `-c`, `node -e`, and heredocs that write outside scratch. Move the rule to a one-line *Shell* bullet near the top of `proposal-worker.md`: *scripts go in a file (Write, or a quoted heredoc into tmp/scratch); never `python3 -`, `node -e`; never `sleep`*.
4. **Probe the lower layer before briefing a code unit.** In [running with subagents](../../../meta/procedures/proposals.md#running-with-subagents), extend the "orchestrator probes what the subagents share" bullet to code units. When a unit's items depend on a layer it may not edit (spelling, parsing), the executor first runs one probe over 5–10 of the unit's samples. With item 2 that is one command: `spell` or `view`. If the probe fails, the blocker becomes its own unit, as U8c1 became.
5. **Fit a phase run under the 2-hour limit.** Have `scripts/phase-exec.ts` put the start time in the executor's prompt. Have `phase-executor.md` say: *at the first unit boundary after about 95 min, commit and return `SPLIT`*. In [phases](../../../meta/procedures/proposal-plans.md#phases), note that one executor run fits about 4–5 code units of about 20 min each.

## Open questions

- **Cap by calls or by context?** Calls are easy to count, but a worker cannot see its own context size. Options: (a) a call count in the brief; (b) a PostToolUse hook that reads the transcript's last usage and warns a `proposal-worker` past 90k. **Recommendation:** (a) now, (b) only if workers ignore it. Confidence **medium**.
- **Where do `view` and `spell` live?** As round-trip subcommands, or in a new `scripts/realize.ts`? **Recommendation:** a new `realize.ts`. These probes are about one line, not the corpus, and that keeps `round-trip.ts` about the corpus. Confidence **low**.
- **Relax the hook, or only reword?** The rule is already written twice and was still hit 17 times. **Recommendation:** relax the hook for quoted scratch heredocs. That alone removes about 6 of the 17 blocks, and the rest need the shorter bullet. Confidence **medium**.

## Measurements

**Split.** Of the 10.3M:

| Part | Weighted tokens | Share |
|------|-----------------|-------|
| Workers (11) | 8.53M | 83% |
| Executor turns, phase 2 | 0.41M | 4% |
| Executor turns, rest | 0.64M | 6% |
| Runner | 0.67M | 6.5% |

The runner's turns run at 83–115k context, about 13k each.

**A typical unit** is U5b: 891k over 72 calls, peaking at 127k.

| Part | Weighted tokens | Share | What it is |
|------|-----------------|-------|------------|
| Cache reads | 533k | 60% | The context sent again on every call, about 74k on average |
| Output | 207k | 23% | 41k tokens. About 11k are visible tool input (edits 6k, Bash 5k); about 30k are thinking |
| Cache writes | 151k | 17% | The context's growth, each token written once |

The context holds the brief (about 5k), `read-ageben.md` and `realizer.md` (about 7k, read whole although the brief says headings first), source reads (about 35k), and round-trip output. Cost follows calls × context, not the size of the diff. The fixed part of a unit is about 12k of start reads, carried through every call: about 100k per unit.
