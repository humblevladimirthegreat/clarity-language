# Full execution (editors)

How one session carries out a whole proposal, every phase, without the user starting each one. This is optional. The default is one phase per session, per [proposals.md](proposals.md#phases), and every other procedure page assumes it. Run a proposal this way only when the user asks for it (*Run all of `name.md`*); any `READY` or `IN PROGRESS` plan may run this way. Everything in [proposals.md](proposals.md) still holds except where this page says otherwise.

## Roles

| Role | Who | Does |
|------|-----|------|
| **Runner** | the session the user talks to | runs the [usage gate](#usage-gate), starts one phase executor per phase, reads its [phase report](#phase-report), decides whether to go on |
| **Phase executor** | a `phase-executor` subagent (`.claude/agents/phase-executor.md`) | the orchestrator of [proposals.md](proposals.md) for one phase, with the [changes below](#phase-executor) |
| **Worker** | `proposal-worker`, `checkpoint-writer`, `style-editor`, `Explore`, started by the executor | one unit, unchanged |
| **Run reviewer** | a `run-reviewer` subagent (`.claude/agents/run-reviewer.md`) the runner starts once the run ends | the [optimization review](#optimization-review) |

Workers sit two layers below the runner, inside Claude Code's default nesting limit of three. A subagent definition cannot limit which agent types it starts (a type list in its `tools` is ignored), so the agent file names the allowed types.

The runner stays lean so that it can last the whole run:

- It reads the proposal's Status line and phase list only (`npm run outline -- <proposal>`, then that range), never the items, diffs, or worker reports.
- It never edits the proposal or any other file, and never commits.
- It launches each executor with `subagent_type: "phase-executor"`, `model: "opus"` and `effort: "high"`, unless the plan names other values for the phase. The prompt is one line: *Carry out phase N of `name.md` as a full-run phase executor.*

## Usage gate
<a id="usage-gate"></a>

The 5-hour and 7-day usage windows are account-wide: every session, subagent, and claude.ai chat counts toward them. Before each phase the runner reads them with `npm run usage-window -- --label "before name.md phase N"`. That makes one minimal haiku call, under $0.001, and saves the reading to `tmp/state/rate-limits.jsonl`. After each phase it runs the same command with `after` in place of `before`. `npm run usage-window -- --deltas` then lists what each phase cost in both windows.

**Forecast.** The next phase's cost is its unit count times the cost of a unit, plus a quarter for margin. The cost of a unit is the median of (phase delta ÷ the phase's units) over this run's finished phases, or over earlier full runs in `--deltas` when this run has none. A delta marked *window reset* doesn't count. With no history at all, assume a phase costs 40 points of the 5-hour window and 10 of the 7-day window.

**Limits.** Start the phase only when both hold:

- 5-hour window: current use plus the forecast stays at or under **80%**
- 7-day window: current use plus the forecast stays at or under **95%**

When a limit would be crossed:

| Case | Runner |
|------|--------|
| 5-hour limit, and this is the last phase (a split phase's remainder counts) | Waits until the window's `resets_at`, then reads again and starts. While waiting it wakes every 45 minutes (a background `sleep 2700`) so the prompt cache stays warm. |
| 5-hour limit, more than one phase left | Stops the run for human review, so costs can't run away. |
| 7-day limit | Stops the run for human review. |
| The reading fails or has no windows | Stops the run before the phase. A guess near the limit is the overrun the gate exists to prevent. |

To stop for review, the runner tells the user the reading, the forecast, the phases left, and the prompt that resumes the run: *Continue the full run of `name.md`*.

## Phase executor
<a id="phase-executor"></a>

The executor reads [proposals.md](proposals.md) in full and runs the phase as its orchestrator: baseline, briefs, gates, commits, consolidation. These things change, because no user is there to answer:

- **No questions.** It never waits for the user. Where [proposals.md](proposals.md) says to tell the user something, it puts it in the [phase report](#phase-report).
- **Stop and alert.** A [stop-and-alert](proposals.md#stop-and-alert) finding still stops the run. The executor carries out the steps there up to telling the user, then returns `STOPPED`, with the finding and the options it sees in the report.
- **End of phase.** After the phase's last commit and the consolidated proposal's commit, it returns the report instead of naming the next prompt. When it ends a phase early on budget ([phases](proposals.md#phases)), it returns `SPLIT`, and the runner starts a fresh executor for the rest, after the usage gate.
- **Open decisions.** It settles the autonomous and review-later ones, and skips past the blocking ones ([agent decisions](#agent-decisions)).

## Agent decisions
<a id="agent-decisions"></a>

The executor sorts and settles open decisions as [decision classes](proposals.md#decision-classes) and [settling a decision](proposals.md#settling-a-decision) say, the same as in a one-phase run. Only blocking decisions change, because nobody answers until the run ends:

- The executor leaves a blocking decision under Open decisions, skips the items that need it, lists it in the [phase report](#phase-report), and goes on with the rest.
- When later phases build on the skipped items, it [stops the run](proposals.md#stop-and-alert) instead.

## Phase report
<a id="phase-report"></a>

The runner pays for every report on every later turn, so the executor keeps it to these fields, in about 150 words:

- **Outcome:** `DONE`, `SPLIT` (and where it split) or `STOPPED`
- **Phase:** which phase, and the point reached
- **Commits:** hashes, one line
- **Decided by agent:** each review-later decision's topic, its confidence, and whether it is flagged
- **Blocking:** each blocking decision's topic, and whether a later phase needs it
- **Stop:** the finding and its options, only when `STOPPED`
- **Gate:** the final verify line, and the recall gate when the phase ran it
- **Units:** how many ran, for the forecast
- **Inefficient:** anything wasteful in the run, or none

## After each phase

The runner:

1. Runs the usage reading labeled `after`.
2. Checks `git status --short`. If the tree is dirty, it stops and tells the user, because an executor that crashed can leave half-made work.
3. Acts on the outcome:
   - `DONE`: the usage gate, then the next phase.
   - `SPLIT`: the usage gate, then a fresh executor for the rest.
   - `STOPPED`: tells the user what the report says and waits.
4. When the proposal has been deleted or turned back into an idea ([consolidate](proposals.md#consolidate)), ends the run. It starts the [optimization review](#optimization-review) and waits for it, then tells the user:
   - the phases run
   - the *Decided by agent* list, flagged entries first
   - the blocking decisions still open
   - what the run cost in both windows (`--deltas`)
   - the optimization idea's path and its findings in one line each, or that nothing qualified
   - the command for the per-phase token breakdown, `npm run token-report -- --session <runner session id>`, which nests each executor's workers under it with a subtotal

## Optimization review
<a id="optimization-review"></a>

When the run ends, the runner starts one `subagent_type: "run-reviewer"` (`.claude/agents/run-reviewer.md`). The run reviewer writes what used significantly more tokens than needed as an idea under `docs/proposals/ideas/optimization/` and commits it. The prompt holds:

- the proposal's filename
- the runner's session id, and the earlier ones when the run was resumed in a new session
- each phase report's *Inefficient* line, labeled by phase

It returns the file's path and one line per finding, or *no findings*.

## Keeping in step

`.claude/agents/phase-executor.md` restates the [phase executor](#phase-executor) changes, [agent decisions](#agent-decisions), and the [phase report](#phase-report). When you change one of those here, make the same change there. It also counts as one of the agent files that [proposals.md](proposals.md#running-with-subagents) keeps in step.

`.claude/agents/run-reviewer.md` owns the [optimization review](#optimization-review)'s steps, what counts as a finding, and the file's sections. When you change what the runner sends it or reads back, change the agent file to match.
