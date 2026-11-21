# Proposals (editors)

How the orchestrator (the session the user talks to) carries out a plan in **`docs/proposals/`**: stopping on a finding, running subagents, commits, phases, resuming, and consolidating. Writing the plan (what a proposal holds, when it is ready, phases and units) is [proposal-plans.md](proposal-plans.md). Grammar pages must **not** link here or mention that folder. A loose spec that nobody has planned yet is an **idea**, written per [ideas.md](ideas.md) without reading this page.

## Folder and links

| Folder | Holds | Status keyword |
|--------|-------|----------------|
| `ideas/` | loose specs ([ideas.md](ideas.md)) | `IDEA` |
| `ready/` | plans that pass [ready to implement](proposal-plans.md#ready-to-implement) | `READY` |
| `in-progress/` | plans with a phase under way or stopped partway | `IN PROGRESS` |
| `rejected/` | ideas and plans turned down | `REJECTED` |

A file's Status keyword matches its folder. Move a file between folders with `git mv`, never by copying. When the first phase starts, the orchestrator moves the file from `ready/` to `in-progress/` and sets `IN PROGRESS`.

**Do not link to proposal pages.** Files move between these folders; a markdown link to a proposal will break. If another editor note must name one, use a backtick filename (`diphone-tts.md`) — never a markdown link whose target is a file under `docs/proposals/`. The same rule applies in grammar, meta, examples, `AGENTS.md`, `TODO.md`, and **other proposals**.

Proposals may link **out** to `docs/grammar/`, `docs/meta/`, `data/`, and code. They are not design authority; absorb into grammar or meta, then drop or reject the proposal.

## Open decisions
<a id="open-decisions"></a>

- A worker settles no decision its brief does not hand it. It writes the decision up, skips the item, and carries on with the rest. The orchestrator sorts it into a [decision class](#decision-classes), which says who settles it.
- Each write-up states the problem, lists the options, and ends with a **Recommendation:** the option the agent would pick and why, in a sentence or two, weighed by its effect on the learner. The recommendation saves whoever decides a round of analysis. When the agent has no basis to choose, it says so and names what would settle it.
- Each recommendation states its confidence, as **(high)**, **(medium)** or **(low)** right after **Recommendation:**.
  - **High:** the grammar pages or a stated design goal point to one option, and the others cost the learner something clear.
  - **Medium:** a judgment call with a clear reason, where another option is still defensible.
  - **Low:** a slight lean only, because the options are close or the agent lacks something that would settle it. Name what that is.
- A settled reading goes on its grammar page. A rejection with a reason beyond *no reading yet* also gets an entry in [design-decisions.md](../design-decisions.md).

### Decision classes
<a id="decision-classes"></a>

| Class | Who settles it | Record |
|-------|----------------|--------|
| **Autonomous** | the orchestrator | the item's commit, and the grammar page or `design-decisions.md` entry |
| **Review later** | the orchestrator; the user looks it over afterwards | its own commit and a *Decided by agent* entry ([settling a decision](#settling-a-decision)) |
| **Blocking** | the user only | the write-up stays under Open decisions in the proposal |

The class comes from what the decision touches, not from the confidence. A blocking decision stays blocking however sure the agent is, and an autonomous one is still settled when confidence is low.

**Blocking** decisions:

- **Language goals.** It makes a parse ambiguous, touches one of the psychological themes of [purpose.md](../../grammar/purpose.md) or a test in [feature-criteria.md](../feature-criteria.md), or changes phonology, orthography or singability.
- **Restricting the language.** It bans or rejects a form a learner would reach for, or marks a spelling closed in [unassigned-reserved.md](../unassigned-reserved.md). Allowing a second natural way to say something is not blocking.
- **Precedent.** It sets a general rule for a family of constructions, rather than applying an existing rule to one case.
- **Contradiction.** It goes against a `design-decisions.md` entry, a grammar page, or a design goal of [purpose.md](../../grammar/purpose.md) or [introduction.md](../../grammar/introduction.md).
- **Maintainability.** It adds a library or other dependency, or chooses between one and custom code. Or it changes a format that other code relies on: the columns or shape of a file in `data/`, or what a build step writes.
- **Weaker checks.** It loosens a test, adds to an allowlist, turns off a lint rule, or leaves out a coverage row to get the tree green.
- **Process.** It changes a procedure page, an agent file, or this policy in a way the plan does not spell out.
- **Public surface.** It changes a public URL or redirect, a sidebar group or a page name, or starts a deploy.
- **Spending.** It runs a paid eval, uses a costlier model than the plan names, or would push a full run past its [usage gate](full-execution.md#usage-gate).
- **Scope.** It drops a proposal item or a teaching section, rather than deferring it.

**Review later** decisions:

- **New learning.** It adds a form, an exception, or a distinction a learner has to learn.
- **Meanings.** It gives a reading to an open spelling, or moves an overlay to another anchor.
- **Names.** It sets a learner-facing English name in [terminology.md](../../grammar/terminology.md).
- **Band.** It places a form in a band within the gates of [learning-levels.md](../learning-levels.md). Changing a gate is blocking.

**Autonomous** decisions:

- **Combining readings.** How two readings combine, unless a blocking test applies.
- **Lexicon detail.** A root's sense, alias or gloss, and the `core` order.
- **Following the grammar.** How the parser, interpreter or solver carries out what the owning grammar section already says.
- **Writing.** Wording, example sentences, house cast choices, checkpoint content.
- **Code shape.** File splits, internal helpers, script flags, so long as no format that other code relies on changes.

Two rules break ties:

- When the class is unclear, take the stricter one, and say why in the write-up.
- When later units would build on the decision, so that undoing it takes more than reverting its commit, move it up one class.

### Settling a decision
<a id="settling-a-decision"></a>

The orchestrator settles autonomous and review-later decisions itself, so that one context keeps a phase's decisions consistent with each other.

- **High or medium confidence.** It takes the recommendation, unless something it knows from other units argues against it.
- **Low confidence.** It first starts a research unit: a `proposal-worker` whose brief names the question, the options, and what would raise the confidence. Research uses the grammar pages, `design-decisions.md`, and batched probes with `parse.mjs`, `find.mjs` and `reading.mjs`, never the web. The report gives the evidence and the new confidence.
- **Still low after research.** It decides anyway and flags the decision. A flagged autonomous decision becomes review later.

Each decision lands the way a user's decision would: the settled reading on its grammar page, and a `design-decisions.md` entry for a rejection with a reason. An autonomous decision lands in the commit of the item it unblocks. A review-later decision also gets:

- **its own commit**, named *`name.md`: decide <topic> (agent, <confidence>)*, so the user can revert it alone
- **an entry under *Decided by agent:*** on the Status line: the date, the decision in a clause, its confidence, whether it is flagged, and the commit hash. Consolidation keeps these entries until the user has reviewed them.

The items a decision unblocks then go to a fresh worker as usual. At the end of the phase the orchestrator tells the user the new *Decided by agent* entries, flagged ones first, and any blocking decisions. A blocking decision that later items or phases build on is a [stop-and-alert](#stop-and-alert) finding.

## Stop and alert
<a id="stop-and-alert"></a>

Skipping an item is for a decision that stays local to it. When a finding changes the plan itself, the run stops and the orchestrator tells the user. Such findings include:

- a premise of the proposal no longer holds, such as a dependency not landed or a finding that the tree has already resolved
- later phases or workstreams would need a different design, a different order, or different pages
- skipping the item would leave later items building on a broken or half-made state
- enough items are skipped that the proposal's goals can no longer be met

Subagents report such findings to the orchestrator and stop there; they do not work around them. The agent files restate this list ([running with subagents](#running-with-subagents)); keep them in step. The orchestrator then:

1. Finishes no further items and starts no new workstream.
2. Leaves the tree green. It commits work that is complete and green, per [commits](#commits). It reverts or leaves uncommitted any half-done item, and says which.
3. Records the finding and the point reached on the proposal's Status line ([resuming](#resuming)).
4. Tells the user what it found, which phases it affects, and the options it sees, then waits for the user's decision before going on.

## Phases

A **phase** is the part of a proposal that one orchestrator session carries out. Subagents keep each unit's context small, but the orchestrator's own context still grows with every brief, report, diff stat, gate, and exchange with the user, and every later turn pays for all of it again ([where the tokens go](proposal-plans.md#where-the-tokens-go)). Phases reset it: each phase starts in a fresh session that reads only the consolidated proposal. Where a plan cuts between phases is [phases](proposal-plans.md#phases) in the planning page.

At the end of each phase the orchestrator:

1. Runs the phase's gate and commits its last unit ([commits](#commits)).
2. [Consolidates the proposal](#consolidate), records the finished phase on the Status line, and commits the proposal.
3. Stops. It tells the user what the phase settled, which open decisions wait on them, and the prompt that starts the next phase in a fresh session, such as *Carry out phase 2 of `name.md`*. It does not start the next phase in the same session, even when its context seems to have room.

When a phase runs over its budget and there is more than one unit left to do, the orchestrator ends it early at the next unit boundary, the same way, and the Status line says where the split fell. The next session starts the next phase as in [resuming](#resuming).

When the user asks for a whole proposal in one session, a runner starts each phase in a phase-executor subagent instead, per [full-execution.md](full-execution.md). Nothing on this page changes for a one-phase session.

## Running with subagents

The agent files under `.claude/agents/` (`proposal-worker`, `checkpoint-writer`, `style-editor`, and `phase-executor` for [full runs](full-execution.md)) restate parts of this page so that subagents never read it: the [stop-and-alert](#stop-and-alert) findings, the stop line, reading slices, script files for scripted edits, quiet verification, and the report fields. When you change one of those rules here, make the same change in every agent file that restates it.

1. **Short-lived subagents.** Give each subagent one item, or two only when they read the same pages. Size a unit by the pages it reads, not by its item count: a unit that walks more than about six pages, or a whole sidebar group, splits (for example by band). Small units mean more of them, which is fine: each costs the orchestrator only a few turns, and a phase is sized by orchestrator turns, not unit count ([phases](proposal-plans.md#phases)). Start a fresh one when the next item reads different pages, or once a context passes about 25 turns or about 80k tokens. Split by shared context, not by file: two items that read the same pages may share a subagent; an item that needs new pages gets a new one. A unit that changes code whose design is not settled in the plan (a new tree node, a new data shape) and also writes the prose that teaches the result splits in two: the code unit first, then a prose unit briefed from what the code produced (its forms, glosses and ids, checked with `parse.mjs`). The prose needs the result, not the code's internals, and a code design that is redone midway leaves a context every prose turn would pay for again.
2. **The item goes in a brief file.** The orchestrator writes each subagent's brief to its own file in the session's scratchpad directory (`tmp/scratch/briefs/` when the session has none), and the prompt only names it: *Read your brief at `<path>` and follow it.* Every prompt the orchestrator sends stays in its context for the rest of the phase, while the subagent reads the file once, at its cold start. Build each brief by a script from parts kept in files (the digest, a running list such as glossed labels), and never print a finished brief back into the orchestrator's context. The brief carries everything the subagent needs to start:
   - the item's own finding text, copied from the proposal
   - the gate run or open decision that settles it, if any
   - the proposal's rule digest (at most about 40 lines)
   - links to the full rule sections it may open if the digest does not settle a question

   It does not tell the subagent to read the whole proposal. Each proposal that runs through subagents holds one reusable digest, which the orchestrator copies into every brief. When the digest says how to check forms, it names `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call, a gloss or an error per input), and keeps `--llm-prompt` for working out what a sentence means: that prompt runs to pages per call ([reading Ageben](read-ageben.md#parsing)). The digest always carries this standing line, because nothing else makes a running subagent stop:

   > At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.

   The orchestrator starts a fresh subagent for what is left.
3. **Read slices.** A subagent lists headings first (`npm run page-lines -- --headings`, or `grep -n '^#'`), then reads only the line ranges it edits. It never opens a whole long page to move one H3.
4. **Move with tools, not by hand.** Moves, peels, and hash rows go through `npm run move-heading` and `npm run peel-headings`, which cut the clusters, rewrite every `page.md#id` link, and write the hash rows. Never retarget links by hand. A subagent's hand work is what the tools leave: Practice, the allowlist, prose seams, and placement.
5. **Quiet verification.** The orchestrator saves `npm run verify -- --baseline` at the start of each phase. Subagents run `npm run verify -- --allow-generate` at the end of each item (`--fast` for checks inside an item) instead of raw build and test runs, and never paste raw build output into their context. When verify reports a new error, read only that line of `tmp/logs/verify-last.log`. A raw `npm run build` or `npm test` ends with a failure footer (each issue with `file:line`, then the summaries that name the fix); read that, not the full log in `tmp/logs/build-last.log` / `tmp/logs/test-last.log`, and never rerun a failed check before editing.
6. **Use `proposal-worker` unless a specific agent fits.** Launch each subagent with `subagent_type: "proposal-worker"` (`.claude/agents/proposal-worker.md`). It has only Bash, Read, Edit, and Write and a short standing brief, while the general-purpose agent carries every tool the session has, including web and MCP tools a unit never uses, and pays for them on every turn. Use a more specific agent when one exists for the unit's task, such as `checkpoint-writer` for Practice checkpoints and `style-editor` for style reviews. Add a new agent under `.claude/agents/` only when several units share a standing brief the generic one lacks.
7. **Smaller model for mechanical steps.** Rename scripts, hash-row backfills, redirect checks, and link retargets may run on a smaller model at low effort. Grammar judgment, teaching prose, Practice, placement, and audits stay on the strongest model. The proposal names each unit's Agent tool `model` value (`opus`, `sonnet`, `haiku`) and `effort` (`low` to `max`), so the setting is not a judgment call at launch, and the orchestrator passes both on every launch. `proposal-worker` sets neither: an omitted `model` uses the configured default subagent model, which may not be the orchestrator's, and an omitted `effort` uses the default. Never write "main model", and never leave either out.
8. **Prefer fresh subagents over forks.** Fork only early, while the orchestrator's context is still small and the fork needs most of it.
9. **Run in sequence when files are shared.** Registry files (the sidebar, redirects, the allowlist, level reviews, cheat sheets, the lexicon `core` column, `AGENTS.md`) take one writer at a time. Run in parallel only when the file sets are disjoint and wall time matters.
10. **Script bulk mechanical work.** Renames and the same edit across many files go in one script that a single subagent writes, runs, and checks with one `verify`, not in one subagent per row. A script that edits files is written to a file under `tmp/scratch/` and run from there, never passed inline (`node -e`, `python -c`, a heredoc): shell quoting breaks an inline script, and each fix-up is another turn. Choose between the Edit tool and a script by the shape of the change, not by the task:
    - **Edit tool** when the text being replaced is short: a line, a sentence, a table row. The tool needs the exact old text, so it suits text that is cheap to quote. A script whose replacements quote the old text word for word is Edit calls in disguise, with escaping on top (backticks, `${`, `\b` in a template literal), so make those Edit calls instead, several in one response when they belong together.
    - **Script file** when whole sections are cut or replaced, or the same change repeats in many places. The script finds a section by its headings (from this heading up to that one), so it never has to reproduce the old text. Consolidating a proposal is this kind of change. Have the script assert that each anchor matches exactly once, so that a miss stops it before it writes.
11. **Keep the orchestrator lean.**
    - Read each report and `git diff --stat`, not whole diffs. Open a hunk only when a report flags it, a gate fails, or the stat shows a file outside the item's list.
    - Trim command output (`2>&1 | tail -30`).
    - Run `verify` once per unit, before the commit. Never repeat a green run: when the subagent's last act was a passing `verify` and nothing has changed since, commit on that result. Rerun only after the orchestrator's own edits (such as `AGENTS.md` Owns lines).
12. **Ask for short, fixed-field reports** that hold only what the orchestrator acts on: what moved (with ids), files touched as a count, registry edits, `AGENTS.md` Owns lines to change, the `verify` line, skips with reasons, lexicon choices, anything the orchestrator must run or fix, **left:** the steps not done when the subagent stopped at its turn cap, and **inefficient:** anything about the run that looked wasteful ([AGENTS.md](../../../AGENTS.md), end of run). *Done* is one line. The report never narrates edits page by page, restates the brief, or lists file names: the diff and `git status` hold those. Keep it to about 150 words, plus any forms, ids or worklist a later unit is briefed from. Every later orchestrator turn pays for the report again.
13. **Pay for a fresh context where it buys something**: a new set of pages, an independent audit, or a rule about what a writer may have read. Scope an audit to what the proposal changed, plus close neighbors.
    - **Batch style reviews.** A grammar edit made mid-run, such as the sentence that settles an open decision, never gets a style review of its own. It joins the proposal's [style gate](proposal-plans.md#the-plan-section), which reviews every changed section in one pass. When the proposal has no style gate left and the phase's grammar edits come to more than a few sentences or add a section, the orchestrator adds a style-gate unit at the end of that phase.
    - **Small edits get a self-check.** When the phase's grammar edits total a few sentences and add no section, the one who wrote them checks them against the [checklist](../doc-style.md#checklist) in `doc-style.md` and no `style-editor` runs. A brief that writes grammar prose names that checklist, so the prose is right when it lands.
14. **Send failures back to the owner.** When a gate fails, send it to the subagent that made the change, if it is still under the turn and token limits in step 1. Otherwise start a fresh subagent with the item, the failing `verify` lines, and the diff stat.
15. **Keep one writer for `AGENTS.md`.** Subagents report the Owns-line changes; the orchestrator applies them at the end.
16. **Probe in batches.** Research that tests many sentences (a triage of solver or parser gaps, a survey of what a construction reads as) costs turns, not reads, and every turn re-sends the context. Per probe, a subagent that probes one sentence at a time spends three or four calls (`find.mjs`, `reading.mjs`, a rerun).
    - **The orchestrator probes what the subagents share.** Before it splits the work, it runs every item through one `node scripts/reading.mjs probe` file, and pastes the compact result (each item's `left` reason or verdict) into the briefs. Items that two areas both touch go to one of them.
    - **The brief says to batch.** The subagent writes all its probes into one `probe` file (cases separated by `---`), runs it once, and re-probes only what surprised it. It never adds `--program` to a batch: the program is for debugging one case or confirming a new row's terms, with `--case N` and `--terms a,b`. `find.mjs` lists ten examples unless asked for `--all`; the brief asks for `--all` only when the unit needs every one.
    - **Split by the pages read**, as step 1 says: each research subagent gets the grammar pages of one area, and the brief carries the shared context (the note it extends, the decisions already settled) as a digest, not as files to read in full.

## Commits

A proposal carried out with subagents is exempt from the usual rule that agents never commit. The orchestrator commits regularly, unless the proposal forbids it:

- commit once per workstream (or per unit, when the plan splits a phase into units), after its gate is green
- start the message with the proposal's name and the workstream ID, then `[skip-cd]`, then the co-author line
- stage only that workstream's files, and never amend or force-push
- let only the orchestrator commit, never a subagent
- give the expected commit count in the plan
- end each phase with a commit of the consolidated proposal ([phases](#phases))

A workstream whose items were all skipped makes no commit.

### Fence automated rewrites

When a script or tool is about to make a large automated change (`retie-docs --write`, `rename-language --write`, `find.mjs --map … --write`, `convert-word --all`, `peel-band --write`, `cheat-sheet-blocks --write`, a codemod), commit the hand-made work first, then commit the tool's output on its own, then continue by hand. The tool's commit holds only what the tool wrote, so a reviewer can skim it as mechanical and anyone can revert or rerun it without losing hand edits. Name the command in that commit's message. Hand fixes the tool's review list asks for go in the next commit, not the tool's.

## Resuming

A run resumes from the git log and the Status line, either at the next phase or at the point where a stop left it. After each workstream's commit, the orchestrator records the finished workstream IDs in Status, and after each phase, the finished phase. The next session reads the consolidated proposal, saves a fresh `npm run verify -- --baseline`, and starts the next workstream with a fresh subagent.

### Consolidate
<a id="consolidate"></a>

At the end of each [phase](#phases), and when the user says to stop partway, the agent rewrites the proposal before the session ends, so the next session reads only what it still needs:

- delete finished items, their findings, and finished workstreams; the git log holds them
- drop background, digest lines, and gate notes that only finished work needed
- move each settled decision to its grammar page or meta note, or to the Status line with its date
- write into the remaining items what they build on from finished work: new ids and page names, audit findings still to act on, changed digest lines; this is input for later items, not a history
- keep the remaining plan, open decisions, and the point reached on the Status line
- when what is left leaves a phase holding a single subagent unit, fold that unit into a neighboring phase ([phases](proposal-plans.md#phases)), and say so on the Status line
- put Problem, Goals and Non-goals last, as H3s under one `## Background` heading after Open decisions, so the next session reads from the top to `## Background` in one range and opens the background only if it needs it (`npm run outline -- <proposal>` gives the line numbers)

Commit the consolidated proposal as the phase's last commit when the run commits ([commits](#commits)); otherwise leave it in the tree.

When nothing planned is left, delete the proposal. When the run stops for good with work left that nobody has planned (a later version, a deferred item), cut the proposal down to an idea per [ideas.md](ideas.md): drop the plan, keep Problem, Sketch, and Open questions for what is left, set Status to `IDEA` with one clause naming what shipped and the doc that owns it, and `git mv` it to `ideas/`.
