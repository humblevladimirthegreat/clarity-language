# Proposal plans (editors)

How to turn an idea into a plan someone can build: what a proposal holds, when it is ready, and how its work splits into phases and units. Carrying a plan out (subagents, gates, commits, resuming, consolidating) is [proposals.md](proposals.md), which also owns the folders and the rule against linking to proposal pages ([folder and links](proposals.md#folder-and-links)). A plan that runs through subagents also follows [running with subagents](proposals.md#running-with-subagents), which sets how units are sized and briefed. A loose spec that nobody has planned yet is an **idea**, written per [ideas.md](ideas.md).

## What a proposal is

A proposal is a plan for a change that is too large to make in one edit. It starts as an idea and becomes a proposal when it passes [ready to implement](#ready-to-implement). When it is carried out, the grammar pages and meta notes own the result, and the proposal is deleted or moved per [folder and links](proposals.md#folder-and-links).

**Header lines**, in this order:

| Line | Holds |
|------|-------|
| **Status:** | `READY` or `IN PROGRESS`, and each user decision with its date. While a run is in progress, also which phases and workstreams are done ([resuming](proposals.md#resuming)). |
| **Related:** | Links out to the grammar pages, meta notes, data, and code it touches. |
| **Depends on:** / **Order:** | Other proposals that must land first, as backtick filenames. |
| **Design authority:** | *none* (moves, retitles, tooling), or exactly which forms and readings it changes. |

**Body sections:** Problem, Goals, Non-goals, then the findings or the design, then the implementation plan, then **Open decisions**, each logged per [open decisions](proposals.md#open-decisions). From the first consolidation on, Problem, Goals and Non-goals move to the end under one `## Background` heading ([consolidate](proposals.md#consolidate)).

Every proposal states, in its plan, that at the end of each [phase](#phases), and if the user says to stop partway, the agent [consolidates the proposal](proposals.md#consolidate) before the session ends.

### Ready to implement
<a id="ready-to-implement"></a>

An idea moves from `ideas/` to `ready/` with `git mv` when the user wants it built and all of these hold:

- No open decision blocks the first phase. Later phases may still log open decisions, each with its **Recommendation:**.
- **Design authority:** names exactly which forms and readings it changes, or says *none*.
- Every proposal named under **Depends on:** has landed.
- The plan section is complete per [the plan section](#the-plan-section).

The agent writes the plan and the missing header lines; the user settles the blocking decisions. Set Status to `READY` with the date.

## One session or several subagents

The **orchestrator** is the Claude Code session the user talks to. It reads the proposal, writes each subagent's brief, reads reports, runs gates, commits, and talks to the user. It is a role, not a model.

Carry out a proposal in the orchestrator's session when it fits there: a few pages, one cluster of related changes, and enough room to hold the rules, the pages, and the diffs without the context being compacted.

Within a subagent run, the orchestrator also does a small unit itself: a few edits on one page it can read in one slice. A subagent's cold start (about 20k tokens) costs more than that slice carried for the rest of the phase. A unit that needs a fresh context by rule (an audit, a checkpoint writer) still gets a subagent. The plan marks such units *orchestrator*.

Use subagents when any of these holds:

- The work spans many pages in clusters that share little.
- The orchestrator's session would compact before the end, losing detail later items need.
- A step needs a fresh context by rule: an independent audit, or a checkpoint writer that may not have read later pages ([what you may read](drill-generation.md#execute)).

Subagents cost tokens, and most of the cost is context carried from turn to turn, so the plan keeps each subagent short and its context small ([running with subagents](proposals.md#running-with-subagents)). Either way, a run too long for one orchestrator session splits into [phases](#phases).

## Phases

A **phase** is the part of a proposal that one orchestrator session carries out; what the orchestrator does at a phase's end is [phases](proposals.md#phases) on the running page.

Split a proposal into phases when one orchestrator session would carry it past about six units or about 60 orchestrator turns. A proposal that fits in one session has one phase and names none.

Cut between phases where:

- the tree is green and every unit before the cut is committed
- the next phase needs this phase's outcome (what moved, the new ids, the decisions), not its reports or diffs
- a user decision is due, or later units depend on what earlier ones find (an audit, a measurement, a tool's review list)
- the next units read a different set of rules or pages, so the digest changes
- a [fenced automated rewrite](proposals.md#fence-automated-rewrites) and its hand fixes have just landed

Never cut inside a unit or where the tree is not green.

## Where the tokens go

- **Every turn re-sends the whole context.** A subagent's earlier turns are a cached prefix, billed at a discount while the cache is warm, but they are still sent again on every turn. So a subagent's input grows with the square of its turn count: each turn costs its current context, and the context grows each turn. Rough arithmetic: one 80-turn subagent that grows from 30k to 180k tokens averages about 105k a turn, about 8M input in all. Four 20-turn subagents that each grow from 30k to 70k average about 50k a turn, about 1M each and 4M in all, for the same work.
- **A cold start is paid in full, but once.** Each new subagent loads `AGENTS.md`, its brief, and the [procedure](../agents-md.md#procedures) files its task names before its first edit. That costs less than carrying a long context through dozens of later turns.
- **Bulk output is the biggest waste.** Raw build output, whole-page reads, and per-link hand edits each add thousands of tokens that every later turn pays for again. The tools in [running with subagents](proposals.md#running-with-subagents) keep them out of the context.
- **The orchestrator pays for everything it reads, every turn.** A diff it reads early is paid for again on every later turn, until the phase ends ([phases](#phases)).
- **A fork copies the orchestrator's whole conversation.** By mid-run that is larger than a fresh brief.
- **Parallel subagents save time, not tokens.** Each one pays its own cold start.
- **Break-even for delegating a read.** T tokens read in a context that runs about 70 more calls cost about 9×T over the rest of the session (cache reads at 0.1× each call, plus the write). The short subagents measured cost 21k–120k weighted tokens, so a search that would read more than about 15k tokens, when only its conclusion is needed, is cheaper in an `Explore` subagent.
- **Measure it.** `npm run token-report -- --since DATE` prints spend by component, carry cost by content kind, fix-loop counts, a subagent table, and skills invoked, from this project's transcripts. Its header holds the last baseline.

## The plan section

A proposal that runs in more than one session states its phases in the plan: each phase's ID, its units, its gate, and its commits, and the cut points chosen per [phases](#phases).

A proposal that runs through subagents also states, in its plan:

- the units, with IDs, their order, their items, and for each the agent type (`proposal-worker` unless a more specific agent fits, [step 6](proposals.md#running-with-subagents)), the Agent tool `model` value (`opus`, `sonnet`, `haiku`) and reasoning effort (one fresh subagent per unit; a unit is one or two items, sized per [step 1](proposals.md#running-with-subagents)). Write the units as paragraphs, never as a table, because item text is too long to read in a table cell. Each unit starts with its bold ID and name, then a line with the agent, `model` and effort, then its items, then a **May edit:** line
- the files each unit may edit
- the rule digest copied into every brief, with its report format and the standing stop line from [step 2](proposals.md#running-with-subagents)
- the gates: `npm run verify -- --allow-generate` against the phase's baseline between items, and the final gate (a clean `npm run build` once nothing is left on a **generate** row). A full `npm run verify` that passes against an empty baseline runs the build and the tests, so it is the final gate; don't run `npm run build` or `npm test` again after it.
- the recall gate, for a phase that edits `say-*.md`, `english.md` or `src/english-helper/`: `npm run english-helper-recall -- --check` at the phase's end, with its result on the Status line. A drop is then owned by the phase that caused it ([English helper](english-helper.md#regression-net)).
- the style gate, for a proposal that touches prose under `docs/grammar/`: its last unit is a style review of the `npm run changed-sections -- <rev>` list, where `<rev>` is the commit before the proposal's first, run by a fresh `style-editor` subagent (`model: opus`, `effort: high`) that made none of the changes. Grammar edits made mid-run join this one pass; they never get a review of their own ([batch style reviews](proposals.md#running-with-subagents)). A move or rewrite changes what comes before a section, so a lead, a first-use gloss, or a preview can go stale ([what the build checks](../doc-style.md#what-the-build-checks)).
- the commit plan: how many commits, and their messages ([commits](proposals.md#commits))
