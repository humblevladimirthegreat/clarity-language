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
- A settled reading goes on its grammar page. A rejection with a reason beyond *no reading yet* also gets an entry in [design-decisions.md](design-decisions.md).

### Stop and alert
<a id="stop-and-alert"></a>

Skipping an item is for a decision that stays local to it. When a finding changes the plan itself, the run stops and the main agent tells the user. Such findings include:

- a premise of the proposal no longer holds, such as a dependency not landed or a finding that the tree has already resolved
- later phases or workstreams would need a different design, a different order, or different pages
- skipping the item would leave later items building on a broken or half-made state
- enough items are skipped that the proposal's goals can no longer be met

Subagents report such findings to the main agent and stop there; they do not work around them. The main agent then:

1. Finishes no further items and starts no new workstream.
2. Leaves the tree green. It commits work that is complete and green, per [commits](#commits). It reverts or leaves uncommitted any half-done item, and says which.
3. Records the finding and the point reached on the proposal's Status line ([resuming](#resuming)).
4. Tells the user what it found, which phases it affects, and the options it sees, then waits for the user's decision before going on.

## One session or several subagents

Carry out a proposal in the main session when it fits there: a few pages, one cluster of related changes, and enough room to hold the rules, the pages, and the diffs without the context being compacted.

Use subagents when any of these holds:

- The work spans many pages in clusters that share little.
- The main session would compact before the end, losing detail later items need.
- A step needs a fresh context by rule: an independent audit, or a checkpoint writer that may not have read later pages ([what you may read](drill-generation.md#execute)).

Subagents cost tokens, so the plan is shaped to need few of them, as below.

## Where the tokens go

- **A cold start is paid in full.** Each new subagent loads `AGENTS.md`, then reads the proposal, the rule sections, and its pages before its first edit. For a small item, that reading costs more than the edit.
- **A continued subagent is cheap.** When it is sent its next item, its earlier turns are a cached prefix, billed at a small fraction of the price while the cache is warm. The cache lasts minutes to an hour, depending on the session.
- **The main agent pays for everything it reads, every turn.** Each turn re-sends its whole context, so a diff it reads early is paid for again on every later turn.
- **A fork copies the main agent's whole conversation.** By mid-run that is larger than a fresh brief.
- **Parallel subagents save time, not tokens.** Each one pays its own cold start.

## Running with subagents

1. **Split by shared context, not by file.** A workstream is a group of items that read the same pages and rules. Size it to end before the subagent would compact, usually three to six moderate items. One subagent per item, or per file, pays the cold start again for context the last one already had.
2. **One subagent per workstream.** Send its first item with the full brief. Send each later item with SendMessage as one line naming the item ID. Start a new subagent at each workstream boundary, or sooner if one compacts.
3. **Write the brief into the proposal.** Then the first prompt can point to it rather than paste it, and every workstream gets the same rules.
4. **Send items back to back.** Hand over the next item as soon as the last one is green, while the cache is warm.
5. **Prefer fresh subagents over forks.** Fork only early, while the main context is still small and the fork needs most of it.
6. **Run in sequence when files are shared.** Registry files (the sidebar, redirects, the allowlist, level reviews, cheat sheets, the lexicon `core` column, `AGENTS.md`) take one writer at a time. Run in parallel only when the file sets are disjoint and wall time matters.
7. **Script bulk mechanical work.** Renames, link retargets, and the same edit across many files go in one script that a single subagent writes, runs, and checks with one build, not in one subagent per row.
8. **Keep the main agent lean.**
   - Read each report and `git diff --stat`, not whole diffs. Open a hunk only when a report flags it, a gate fails, or the stat shows a file outside the item's list.
   - Trim command output (`2>&1 | tail -30`).
   - Leave per-item build and test runs to the subagent; run them once per workstream, before the commit.
   - Never repeat a green run. When the subagent's last act was a passing build or test run and nothing has changed since, the main agent commits on that result. It reruns only after its own edits (such as `AGENTS.md` Owns lines) or a later change to the tree.
9. **Ask for short, fixed-field reports**: what moved (with ids), files touched as a count, registry edits, `AGENTS.md` Owns lines to change, gate results, and skips with reasons.
10. **Pay for a fresh context only where it buys something**: an independent audit, or a rule about what a writer may have read. Scope an audit to what the proposal changed, plus close neighbors.
11. **Send failures back to the owner.** When a gate fails, send it to the subagent that made the change, which already holds the context, not to a new one.
12. **Keep one writer for `AGENTS.md`.** Subagents report the Owns-line changes; the main agent applies them at the end.

A smaller model may run a workstream that is purely mechanical and gated by the build, such as a rename script. Never use one for grammar judgment, teaching prose, or checkpoints.

Set each subagent's reasoning effort to what its workstream needs, through the Agent tool's `effort` field. Mechanical, build-gated work runs at low effort. Grammar judgment, teaching prose, checkpoints, and audits run higher. The proposal names the effort for each workstream, so the setting is not a judgment call at launch.

## The plan section

A proposal that runs through subagents states, in its plan:

- the workstreams, with IDs, their order, their items, and the model and reasoning effort for each
- the files each workstream may edit
- the brief every subagent gets, including the rules it follows and its report format
- the gates between items and between workstreams
- the commit plan: how many commits, and their messages ([commits](#commits))

## Commits

A proposal carried out with subagents is exempt from the usual rule that agents never commit. The main agent commits regularly, unless the proposal forbids it:

- commit once per workstream, after its gate is green
- start the message with the proposal's name and the workstream ID, then `[skip-cd]`, then the co-author line
- stage only that workstream's files, and never amend or force-push
- let only the main agent commit, never a subagent
- give the expected commit count in the plan

A workstream whose items were all skipped makes no commit.

### Fence automated rewrites

When a script or tool is about to make a large automated change (`retie-docs --write`, `rename-language --write`, `find.mjs --map … --write`, `convert-word --all`, `peel-band --write`, `cheat-sheet-blocks --write`, a codemod), commit the hand-made work first, then commit the tool's output on its own, then continue by hand. The tool's commit holds only what the tool wrote, so a reviewer can skim it as mechanical and anyone can revert or rerun it without losing hand edits. Name the command in that commit's message. Hand fixes the tool's review list asks for go in the next commit, not the tool's.

## Resuming

A run that stops partway resumes from the git log and the Status line. After each workstream's commit, the main agent records the finished workstream IDs in Status. The next session reads them, re-runs build and tests, and starts the next workstream with a fresh subagent.
