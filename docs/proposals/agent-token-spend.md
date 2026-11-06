# Proposal: Cutting agent token spend

**Status:** PROPOSED (2026-11-06). User decisions 2026-11-06:
- Build and test output go to `tmp/`, with only status lines and a failure footer on stdout ([T4](#t4)).
- `AGENTS.md` licenses `Explore` subagents for large searches ([T3](#t3)).
- The orchestrator keeps reading the whole proposal (see [Non-goals](#non-goals)).
- Unused skills are hidden ([T6](#t6)).

**Related:** [proposals.md](../meta/proposals.md) (running with subagents, where the tokens go), [`scripts/build.mjs`](../../scripts/build.mjs), [`scripts/test.mjs`](../../scripts/test.mjs), [`scripts/lib/verify.ts`](../../scripts/lib/verify.ts), [`scripts/lint-ageben-docs.ts`](../../scripts/lint-ageben-docs.ts), [agents-md.md](../meta/agents-md.md).
**Depends on:** none. `sitting-cohesion.md` is in progress; [T1](#t1) renames terms in its unrun phases.
**Design authority:** none. Tooling, editor notes, settings, and `AGENTS.md` tooling lines only. No form or reading changes.

## Problem

Agent sessions cost more than the work needs. The numbers come from transcripts of 28 sessions and 21 subagents (2026-11-04 to 2026-11-06, 3,517 API calls, about 73M weighted tokens).

Costs are weighted by relative price: cache read 0.1×, 1-hour cache write 2×, output 5×. Token sizes are estimated from characters: about 2.5 characters per token for repo text and 4 for English prose. A share of total spend is the weighted cost of carrying an item, divided by all 73M.

### Context size is the main cost

- No session compacted. Everything read stays in context and is re-sent on every later call.
- Cache reads are 66% of all spend. The part of each call's context beyond the first 80k tokens is **32% of spend**.
- Main sessions start at about 46k tokens and peak at a median of about 205k, over a median of 74 calls. Subagents start at about 38k.
- A call costs about 21k weighted tokens on average. Extra turns cost tokens; slow turns do not.

### Exploration is the largest content carried

Exploration means reads and searches: `Read`, `cat`, `sed -n`, `grep`, `find.mjs`, `parse.mjs`.

| | Main sessions | Subagents |
|---|---|---|
| Exploration share of spend | ~15% | ~25% |
| Share of exploration cost from the first quarter of the session | 59% | 67% |
| Share from results over 2k tokens (about 10% of results) | 55% | 59% |
| Duplicate reads | ~20k tokens | none |

The cost is a few large reads early in a session, not many small ones. Duplicate reads, subagent briefs (about 1k tokens each), and subagent reports (at most 1% of the orchestrator's cost) are not problems.

The largest single items:

- **Saved outputs read whole.** Output over about 30KB is saved to a file with a 2KB preview. Agents then read the saved file whole: 10 times, about 156k tokens, each carried 90–160 calls. Several were whole proposals opened with `cat docs/proposals/X.md && cat docs/meta/proposals.md`, so the proposal entered context twice. Repo-wide greps returned 30–288KB.
- **Whole long pages.** `terminology.md` (38KB) and `glosses.md` (47KB) were `cat`ed whole.
- **Proposal reads overall.** These cost 1.3% of total spend in the orchestrators of subagent runs, 2.7% in single-session proposal runs, and 3.0% in subagents. Most of the subagent share comes from before the 2026-11-05 rewrite of [proposals.md](../meta/proposals.md), which now pastes the item instead.

### Subagents after the 2026-11-05 rewrite of proposals.md

| | Before (16 subagents) | After (5 units) |
|---|---|---|
| Calls | 48–162 | 4–82 |
| Median peak context | ~180k | ~64k |
| Exploration share of spend | 13–37% (median ~26%) | 0–16% |
| Median weighted cost | ~1.1M | ~137k |

The sample is small and the units are smaller by design, but the change is working. The exception is unit 3.4 of `sitting-cohesion.md`: 82 calls, a 167k peak, and about half of all spend after the rewrite. Its one item walked about 35 sittings plus the level reviews, and 56 of its calls were `grep -n` / `sed -n` reads. The 25-turn / 80k cap is a sizing rule for the orchestrator; nothing makes a running subagent stop.

### Fix-and-recheck loops are small but avoidable

- 91 of 333 check runs failed. The failing steps were `lint ageben` 39 times, `test` 15, `lint forward links` 6, and `lint cheat sheets` 6.
- About 2% of spend went to turns that only re-read a failure:
  - 47 re-runs of a check with no edit in between
  - 15 reads of a saved log
  - 20 greps of `src/` for a lint message's text
- The re-runs also cost about 40 minutes of wall-clock time (about 53s per build).
- Only 42 of the 91 failures showed a `file:line` or an assertion in the output the agent saw. Agents nearly always pipe the build through `tail` or `grep`. `build.mjs` prints a failing job's whole buffered output, then its status line, so the issue lines sit in the middle. One 295-line log ended in `4 Ageben sentence / span issue(s)` and `failed: lint ageben`, with the issues above line 293.
- For tests, `test.mjs` prints the whole failing shard. The `✖ name` line survives a grep, but the assertion diff took another run.
- Some lint hints do not name the fix:
  - The learning-order hint points to `docs/proposals/learning-order-check.md`, which no longer exists.
  - The learning-order list names sections, not the `file:line` of the offending example.
  - Agents grepped the source for `has no bank row`, `use different content roots`, and `used before their home section` to learn what to change.

### Every call carries an unused skill listing

Each session and subagent starts with a skill listing of about 19.5k characters (about 5k tokens).

- **Synced skills.** About 11.7k characters (about 3k tokens) are the 20 `anthropic-skills:*` skills synced from the claude.ai account: docs, xlsx, pptx, docx, pdf, google-workspace, computer-use, the two browser skills, deep-research, and others. They are account defaults, not installed plugins.
- **Built-in skills.** The rest are Claude Code's own skills.
- **None was used.** No transcript in the window invoked any skill.
- **Cost.** The synced part costs about 1.8% of total spend.

### "Main agent" and "main model" are unclear

In [proposals.md](../meta/proposals.md) and `sitting-cohesion.md`, "main agent" means the session the user talks to, which runs the plan. "Main model" in the unit tables means the model that session runs on. The two read as one idea, and "main agent" can be taken as a model name.

"Main model" also does not say what to pass. When the Agent tool's `model` field is omitted, a configured default subagent model takes precedence over the parent's model. So "main model" is not guaranteed by leaving the field out.

## Goals

- Keep large reads out of long-lived contexts.
- Keep subagents within the 25-turn / 80k cap without the orchestrator having to step in.
- Make a failed build or test run show every issue, with `file:line` and the fix, in its last lines.
- Stop paying for skills nobody uses.
- One name for the session that runs a plan, and an explicit model value for each unit.
- A repeatable measurement, so the next round can be checked against these numbers.

## Non-goals

- **Making the orchestrator read only the plan.** An earlier draft had the orchestrator read only the Status line, the plan, and the digest, with each subagent reading its own unit's findings.
  - Proposal reads in orchestrators cost 1.3% of total spend. The findings part is about half of a proposal (in `sitting-cohesion.md`, 39KB of 72KB lie outside the plan), so that rule would save about 0.6%.
  - The orchestrator needs the findings to judge reports, spot a broken premise, and [stop and alert](../meta/proposals.md#stop-and-alert).
  - The avoidable part, reading the same proposal twice through a saved output, is covered by [T3](#t3).
- **Faster per-file checks and edit-time hooks.** Speed saves wall-clock time, not turns. A hook adds output to every edit. Most `lint ageben` failures are cross-file checks (learning order, drill coverage, checkpoint inventory, level reviews) that a per-file check cannot run.
- **Auto-fix modes for lint.** The transcripts do not show how many failures were mechanical. Revisit with [T7](#t7) data.
- **Duplicate-read and report-format rules.** Both are already small.
- Changing what any lint accepts or rejects.

## Changes

<a id="t1"></a>

### T1. Terms: orchestrator and an explicit model

In [proposals.md](../meta/proposals.md):

- Define **orchestrator** once, near the top of [one session or several subagents](../meta/proposals.md#one-session-or-several-subagents): *the Claude Code session the user talks to. It reads the proposal, writes each subagent's brief, reads reports, runs gates, commits, and talks to the user. It is a role, not a model.*
- Replace every "main agent" with "orchestrator", and "main session" with "the orchestrator's session".
- Step 6 and [the plan section](../meta/proposals.md#the-plan-section): each unit names the Agent tool `model` value (`opus`, `sonnet`, `haiku`), never "main model" and never an omitted field. Add one sentence of reason: an omitted `model` uses the configured default subagent model, which may not be the orchestrator's.

In `sitting-cohesion.md`: make the same renames in the plan and in the phases not yet run. Change the unit table's model column from "main model" to `opus`. Leave the finished phases' history text alone.

<a id="t2"></a>

### T2. Subagents stop themselves

In [running with subagents](../meta/proposals.md#running-with-subagents):

- **Step 1:** size a unit by the pages it reads, not by its item count. A unit that walks more than about eight pages, or a whole sidebar group, splits (for example by band).
- **The digest template** gains one standing line: *After about 25 tool calls, stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.* The orchestrator starts a fresh subagent for what is left.
- The report format gains a **left:** field.

<a id="t3"></a>

### T3. AGENTS.md: large output and delegated searches

Add two lines to the `AGENTS.md` tooling notes (workflow, within [agents-md.md](../meta/agents-md.md)):

- **Large output:**
  - When a result says *Output too large … saved to*, grep or slice the saved file. Never read it whole.
  - Before reading a long page or proposal, list its headings (`grep -n '^#'`) and read the ranges you need.
  - After a file you have read changes, read the change (`git diff`), not the file again.
  - Run a repo-wide grep with `-l` or `-c` first.
- **Delegated searches:** when a search would read more than about 15k tokens and you need only its conclusion (a repo-wide rename sweep, where a rule is implemented), give it to an `Explore` subagent and keep the answer. Below that, read slices yourself.

The second line has to be in `AGENTS.md`: the harness tells agents not to start subagents unless the user's instructions say to.

Add the break-even to [where the tokens go](../meta/proposals.md#where-the-tokens-go): T tokens read in a context that runs about 70 more calls cost about 9×T. The short subagents measured cost 21k–120k.

<a id="t4"></a>

### T4. Build and test: full output to tmp, a failure footer on stdout

**`build.mjs`:**

- stdout carries only the step status lines, `build ok` / `build FAILED`, and on failure a **Failures** block.
- The block lists each failing job's issue lines with `file:line` kept, up to 30 per job, then *… N more in tmp/build-last.log*.
- An issue line is a path line or an indented detail line as `verify.ts` already parses them. Leave out `OK` and count lines, `▶` suite lines, and stack frames.
- Share the line parser with `verify.ts`, keeping line numbers (verify's keys strip them).
- Every job's full output goes to `tmp/build-last.log`. Passing jobs' `warning:` lines stay as they are now.

**`test.mjs`:**

- stdout carries the shard lines and, on failure, each failing test: its `file:line`, its name, and the first 12 lines of the assertion (message and `+ actual - expected` diff, with no `at …` frames). Then the command that re-runs just that file (`npm test -- <file>`).
- Full shard output goes to `tmp/test-last.log`.

**Both:**

- `BUILD_VERBOSE=1` keeps the old full output on stdout.
- `verify` reads `tmp/build-last.log` rather than parsing stdout, and its keys stay the same.
- Update the [quiet verification](../meta/proposals.md#running-with-subagents) step and the `AGENTS.md` verify line if either names stdout.

**Tests:** fixture output for a failing lint job and a failing test. The footer holds every issue and comes last. `verify`'s keys are unchanged.

<a id="t5"></a>

### T5. Lint hints that name the fix

In `lint-ageben-docs.ts` and `src/lint/`:

- **Learning order:**
  - Point the hint at the meta section that owns the rule, not the deleted proposal. Find the owner; if no meta section states the rule, add one under [learning-levels.md](../meta/learning-levels.md).
  - List each offending example as `file:line  \`span\`  construction → home section`.
- **The messages agents had to look up:**
  - word-bank missing root (`has no bank row`)
  - practice-item content roots (`use different content roots`)
  - learning order
  - checkpoint-inventory **generate**
  - level review
  - drill coverage

  Each issue line says the edit to make, and each summary line names its `docs/meta/…#anchor`.
- **New test:** every hint path in these summaries resolves to an existing meta heading, and none points into `docs/proposals/`.

<a id="t6"></a>

### T6. Hide unused skills

Claude Code's `skillOverrides` setting takes per-skill values:

| Value | Effect |
|---|---|
| `"off"` | Hidden from the model and from `/` commands |
| `"user-invocable-only"` | Hidden from the model; `/name` still works |
| `"name-only"` | Listed without its description |
| absent | On |

The `/skills` menu writes the same setting.

- **Synced skills:** set all 20 `anthropic-skills:*` skills to `"off"` in this project's `.claude/settings.json`. They stay available on claude.ai and in other projects.
- **Built-in skills:** leave on the ones this repo uses or that other tools depend on: `update-config`, `fewer-permission-prompts`, `code-review`, `simplify`, `run`, `init`, and the `artifact-*` skills, which the Artifact tool requires before any page. Set the rest to `"user-invocable-only"`: `dataviz`, `claude-api`, `keybindings-help`, `loop`, `schedule`, `plugin-authoring`, `security-review`.
- **Check the key names first.** The exact key spelling for synced skills (`pptx` or `anthropic-skills:pptx`) is unverified. Set one override with `/skills`, read the key it writes, then write the rest the same way.
- **Gate:** the next session's skill listing lacks the hidden skills. [T7](#t7) can read the listing from the transcript.

<a id="t7"></a>

### T7. A repeatable token report

Add `scripts/token-report.mjs`. It reads this project's transcripts under `~/.claude/projects/<project slug>/` (main sessions and `subagents/`), with `--since DATE`, and prints:

- spend by component (cache read, cache write, output) and the share of context above 80k
- carry cost by content kind (exploration, proposal reads, checks, edits, skill listing, reminders), split by main and subagent, with the largest single items
- the fix-loop numbers: failed checks, re-runs with no edit, log peeks, source greps after a failure
- a subagent table: start, calls, peak context, weighted cost, description
- skills invoked

The scripts that produced this proposal's numbers are in `tmp/token-analysis/` as a starting point (gitignored and local, so they may be gone). Record the baseline from [Problem](#problem) in the script's header comment. Rerun it after about a week of sessions on the new rules, and add the result to this proposal's Status before folding it.

## Implementation plan

Small enough for one session with no subagents ([one session or several subagents](../meta/proposals.md#one-session-or-several-subagents)). The user commits.

| Order | Change | Files | Gate |
|---|---|---|---|
| 1 | [T6](#t6) | `.claude/settings.json` | next session's skill listing |
| 2 | [T1](#t1), [T2](#t2) | `docs/meta/proposals.md`, `docs/proposals/sitting-cohesion.md` | none (meta and proposals skip the build) |
| 3 | [T3](#t3) | `AGENTS.md`, `docs/meta/proposals.md` | `npm run build` |
| 4 | [T4](#t4) | `scripts/build.mjs`, `scripts/test.mjs`, `scripts/lib/verify.ts` and a shared parser, tests | `npm test`, then `npm run build` once with a planted failure to read the footer, then `npm run verify` against a fresh baseline, then once clean |
| 5 | [T5](#t5) | `scripts/lint-ageben-docs.ts`, `src/lint/*`, a meta section if T5 adds one, tests | `npm run build` |
| 6 | [T7](#t7) | `scripts/token-report.mjs`, `package.json` script entry | run it once against the window above; numbers within about 10% of [Problem](#problem) |

## Open decisions

<a id="od1"></a>

**OD1. Where the skill overrides live.** The options:

- (a) this project's `.claude/settings.json`
- (b) user settings (`~/.claude/settings.json`), hiding them in every project
- (c) turning the skills off on claude.ai, which also removes them from claude.ai chats

**Recommendation:** (a). It removes them where they are unused, and leaves them where they might be used.
