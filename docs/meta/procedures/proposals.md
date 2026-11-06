# Proposals (editors)

How to keep **`docs/proposals/`**, what a proposal holds, and how an agent carries one out. Grammar pages must **not** link here or mention that folder.

## Folder and links

**Do not link to proposal pages.** Files move between the folder root, `partially-implemented/`, and `rejected/`; a markdown link to a proposal will break. If another editor note must name one, use a backtick filename (`diphone-tts.md`) — never a markdown link whose target is a file under `docs/proposals/`. The same rule applies in grammar, meta, examples, `AGENTS.md`, `TODO.md`, and **other proposals**.

Proposals may link **out** to `docs/grammar/`, `docs/meta/`, `data/`, and code. They are not design authority; absorb into grammar or meta, then drop or reject the proposal.

## What a proposal is

A proposal is a plan for a change that is too large or too undecided to make in one edit. When it is carried out, the grammar pages and meta notes own the result, and the proposal is deleted or moved per [folder and links](#folder-and-links).

**Header lines**, in this order:

| Line | Holds |
|------|-------|
| **Status:** | PROPOSED, ready to implement, partially implemented, and each user decision with its date. While a run is in progress, also which workstreams are done ([resuming](#resuming)). |
| **Related:** | Links out to the grammar pages, meta notes, data, and code it touches. |
| **Depends on:** / **Order:** | Other proposals that must land first, as backtick filenames. |
| **Design authority:** | *none* (moves, retitles, tooling), or exactly which forms and readings it changes. |

**Body sections:** Problem, Goals, Non-goals, then the findings or the design, then the implementation plan, then **Open decisions**.

- Grammar decisions belong to the user. An agent that meets one while carrying out a proposal logs it under Open decisions, skips the item, and carries on with the rest.
- Each logged open decision states the problem, lists the options, and ends with a **Recommendation:** the option the agent would pick and why, in a sentence or two, weighed by its effect on the learner. The user still decides; the recommendation saves a round of analysis. When the agent has no basis to choose, it says so and names what would settle it.
- A settled reading goes on its grammar page. A rejection with a reason beyond *no reading yet* also gets an entry in [design-decisions.md](../design-decisions.md).

### Stop and alert
<a id="stop-and-alert"></a>

Skipping an item is for a decision that stays local to it. When a finding changes the plan itself, the run stops and the orchestrator tells the user. Such findings include:

- a premise of the proposal no longer holds, such as a dependency not landed or a finding that the tree has already resolved
- later phases or workstreams would need a different design, a different order, or different pages
- skipping the item would leave later items building on a broken or half-made state
- enough items are skipped that the proposal's goals can no longer be met

Subagents report such findings to the orchestrator and stop there; they do not work around them. The orchestrator then:

1. Finishes no further items and starts no new workstream.
2. Leaves the tree green. It commits work that is complete and green, per [commits](#commits). It reverts or leaves uncommitted any half-done item, and says which.
3. Records the finding and the point reached on the proposal's Status line ([resuming](#resuming)).
4. Tells the user what it found, which phases it affects, and the options it sees, then waits for the user's decision before going on.

## One session or several subagents

The **orchestrator** is the Claude Code session the user talks to. It reads the proposal, writes each subagent's brief, reads reports, runs gates, commits, and talks to the user. It is a role, not a model.

Carry out a proposal in the orchestrator's session when it fits there: a few pages, one cluster of related changes, and enough room to hold the rules, the pages, and the diffs without the context being compacted.

Use subagents when any of these holds:

- The work spans many pages in clusters that share little.
- The orchestrator's session would compact before the end, losing detail later items need.
- A step needs a fresh context by rule: an independent audit, or a checkpoint writer that may not have read later pages ([what you may read](drill-generation.md#execute)).

Subagents cost tokens, and most of the cost is context carried from turn to turn, so the plan keeps each subagent short and its context small, as below.

## Where the tokens go

- **Every turn re-sends the whole context.** A subagent's earlier turns are a cached prefix, billed at a discount while the cache is warm, but they are still sent again on every turn. So a subagent's input grows with the square of its turn count: each turn costs its current context, and the context grows each turn. Rough arithmetic: one 80-turn subagent that grows from 30k to 180k tokens averages about 105k a turn, about 8M input in all. Four 20-turn subagents that each grow from 30k to 70k average about 50k a turn, about 1M each and 4M in all, for the same work.
- **A cold start is paid in full, but once.** Each new subagent loads `AGENTS.md`, its brief, and the [procedure](../agents-md.md#procedures) files its task names before its first edit. That costs less than carrying a long context through dozens of later turns.
- **Bulk output is the biggest waste.** Raw build output, whole-page reads, and per-link hand edits each add thousands of tokens that every later turn pays for again. The tools below keep them out of the context.
- **The orchestrator pays for everything it reads, every turn.** A diff it reads early is paid for again on every later turn.
- **A fork copies the orchestrator's whole conversation.** By mid-run that is larger than a fresh brief.
- **Parallel subagents save time, not tokens.** Each one pays its own cold start.
- **Break-even for delegating a read.** T tokens read in a context that runs about 70 more calls cost about 9×T over the rest of the session (cache reads at 0.1× each call, plus the write). The short subagents measured cost 21k–120k weighted tokens, so a search that would read more than about 15k tokens, when only its conclusion is needed, is cheaper in an `Explore` subagent.
- **Measure it.** `npm run token-report -- --since DATE` prints spend by component, carry cost by content kind, fix-loop counts, a subagent table, and skills invoked, from this project's transcripts. Its header holds the last baseline.

## Running with subagents

1. **Short-lived subagents.** Give each subagent one or two items, and size a unit by the pages it reads, not by its item count: a unit that walks more than about eight pages, or a whole sidebar group, splits (for example by band). Start a fresh one when the next item reads different pages, or once a context passes about 25 turns or about 80k tokens. Split by shared context, not by file: two items that read the same pages may share a subagent; an item that needs new pages gets a new one.
2. **The item goes in the prompt.** A subagent's first prompt carries everything it needs to start:
   - the item's own finding text, pasted from the proposal
   - the gate run or open decision that settles it, if any
   - the proposal's rule digest (at most about 40 lines), pasted
   - links to the full rule sections it may open if the digest does not settle a question

   It does not tell the subagent to read the whole proposal. Each proposal that runs through subagents holds one reusable digest, which the orchestrator pastes into every prompt. The digest always carries this standing line, because nothing else makes a running subagent stop:

   > At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.

   The orchestrator starts a fresh subagent for what is left.
3. **Read slices.** A subagent lists headings first (`npm run page-lines -- --headings`, or `grep -n '^#'`), then reads only the line ranges it edits. It never opens a whole long page to move one H3.
4. **Move with tools, not by hand.** Moves, peels, and hash rows go through `npm run move-heading` and `npm run peel-headings`, which cut the clusters, rewrite every `page.md#id` link, and write the hash rows. Never retarget links by hand. A subagent's hand work is what the tools leave: Practice, the allowlist, prose seams, and placement.
5. **Quiet verification.** The orchestrator saves `npm run verify -- --baseline` at the start of each phase. Subagents run `npm run verify -- --allow-generate` at the end of each item (`--fast` for checks inside an item) instead of raw build and test runs, and never paste raw build output into their context. When verify reports a new error, read only that line of `tmp/verify-last.log`. A raw `npm run build` or `npm test` ends with a failure footer (each issue with `file:line`, then the summaries that name the fix); read that, not the full log in `tmp/build-last.log` / `tmp/test-last.log`, and never rerun a failed check before editing.
6. **Smaller model for mechanical steps.** Rename scripts, hash-row backfills, redirect checks, and link retargets may run on a smaller model at low effort. Grammar judgment, teaching prose, Practice, placement, and audits stay on the strongest model. The proposal names each unit's Agent tool `model` value (`opus`, `sonnet`, `haiku`) and `effort`, so the setting is not a judgment call at launch. Never write "main model" and never leave `model` out: an omitted `model` uses the configured default subagent model, which may not be the orchestrator's.
7. **Prefer fresh subagents over forks.** Fork only early, while the orchestrator's context is still small and the fork needs most of it.
8. **Run in sequence when files are shared.** Registry files (the sidebar, redirects, the allowlist, level reviews, cheat sheets, the lexicon `core` column, `AGENTS.md`) take one writer at a time. Run in parallel only when the file sets are disjoint and wall time matters.
9. **Script bulk mechanical work.** Renames and the same edit across many files go in one script that a single subagent writes, runs, and checks with one `verify`, not in one subagent per row.
10. **Keep the orchestrator lean.**
    - Read each report and `git diff --stat`, not whole diffs. Open a hunk only when a report flags it, a gate fails, or the stat shows a file outside the item's list.
    - Trim command output (`2>&1 | tail -30`).
    - Run `verify` once per unit, before the commit. Never repeat a green run: when the subagent's last act was a passing `verify` and nothing has changed since, commit on that result. Rerun only after the orchestrator's own edits (such as `AGENTS.md` Owns lines).
11. **Ask for short, fixed-field reports**: what moved (with ids), files touched as a count, registry edits, `AGENTS.md` Owns lines to change, the `verify` line, skips with reasons, **left:** the steps not done when the subagent stopped at its turn cap, and **inefficient:** anything about the run that looked wasteful ([AGENTS.md](../../../AGENTS.md), end of run).
12. **Pay for a fresh context where it buys something**: a new set of pages, an independent audit, or a rule about what a writer may have read. Scope an audit to what the proposal changed, plus close neighbors.
13. **Send failures back to the owner.** When a gate fails, send it to the subagent that made the change, if it is still under the turn and token limits in step 1. Otherwise start a fresh subagent with the item, the failing `verify` lines, and the diff stat.
14. **Keep one writer for `AGENTS.md`.** Subagents report the Owns-line changes; the orchestrator applies them at the end.

## The plan section

A proposal that runs through subagents states, in its plan:

- the units, with IDs, their order, their items, and for each the Agent tool `model` value (`opus`, `sonnet`, `haiku`) and reasoning effort (one fresh subagent per unit; a unit is one or two items)
- the files each unit may edit
- the rule digest every subagent gets pasted, with its report format and the standing stop line from [step 2](#running-with-subagents)
- the gates: `npm run verify -- --allow-generate` against the phase's baseline between items, and the final gate (a clean `npm run build` once nothing is left on a **generate** row)
- the commit plan: how many commits, and their messages ([commits](#commits))

## Commits

A proposal carried out with subagents is exempt from the usual rule that agents never commit. The orchestrator commits regularly, unless the proposal forbids it:

- commit once per workstream (or per unit, when the plan splits a phase into units), after its gate is green
- start the message with the proposal's name and the workstream ID, then `[skip-cd]`, then the co-author line
- stage only that workstream's files, and never amend or force-push
- let only the orchestrator commit, never a subagent
- give the expected commit count in the plan

A workstream whose items were all skipped makes no commit.

### Fence automated rewrites

When a script or tool is about to make a large automated change (`retie-docs --write`, `rename-language --write`, `find.mjs --map … --write`, `convert-word --all`, `peel-band --write`, `cheat-sheet-blocks --write`, a codemod), commit the hand-made work first, then commit the tool's output on its own, then continue by hand. The tool's commit holds only what the tool wrote, so a reviewer can skim it as mechanical and anyone can revert or rerun it without losing hand edits. Name the command in that commit's message. Hand fixes the tool's review list asks for go in the next commit, not the tool's.

## Resuming

A run that stops partway resumes from the git log and the Status line. After each workstream's commit, the orchestrator records the finished workstream IDs in Status. The next session reads them, re-runs build and tests, and starts the next workstream with a fresh subagent.
