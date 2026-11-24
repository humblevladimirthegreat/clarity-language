# Spend fixes from grammar-newcomer-rewrite P1

**Status:** READY, 2026-11-24. Decided 2026-11-24 (user): the optimization review's recommendations are accepted. Policy units go to a worker by a wording rule only, with no plan lint. The reading-order pointer and the `parse.mjs --at` flag both land now, since P2 of `grammar-newcomer-rewrite.md` is the next rewrite phase. verify marks baseline-only failed jobs and does not hide them. The review's own tooling fixes (`token-report` cost column, `--top`, `--show`, and `run-reviewer.md` step 2) are in scope.

**Related:** [proposal-plans.md](../../meta/procedures/proposal-plans.md) ([one session or several subagents](../../meta/procedures/proposal-plans.md#one-session-or-several-subagents), [the plan section](../../meta/procedures/proposal-plans.md#the-plan-section), [where the tokens go](../../meta/procedures/proposal-plans.md#where-the-tokens-go)); [proposals.md](../../meta/procedures/proposals.md#running-with-subagents) (steps 2, 5 and 15); [grammar-docs.md](../../meta/grammar-docs.md#newcomer) (*Examples stay within reach*) and [read-by blocks](../../meta/grammar-docs.md#read-by-blocks); [read-ageben.md](../../meta/procedures/read-ageben.md#parsing); [`scripts/verify.ts`](../../../scripts/verify.ts) and [`scripts/lib/verify.ts`](../../../scripts/lib/verify.ts); [`src/parse/cli.ts`](../../../src/parse/cli.ts), [`src/parse/cli-args.ts`](../../../src/parse/cli-args.ts), [`src/lint/learning-order.ts`](../../../src/lint/learning-order.ts), [`src/lint/construction-order.ts`](../../../src/lint/construction-order.ts); [`scripts/page-readers.ts`](../../../scripts/page-readers.ts); [`scripts/token-report.mjs`](../../../scripts/token-report.mjs) and its test; the agent files under `.claude/agents/` (`proposal-worker`, `checkpoint-writer`, `style-editor`, `phase-executor`, `run-reviewer`); the run-state digests of `grammar-newcomer-rewrite.md`.

**Depends on:** none. **Order:** land before P2 of `grammar-newcomer-rewrite.md` starts, so its briefs name `--at`.

**Design authority:** *none*. Tooling and procedure only: no form or reading changes, and the parser's accept/reject behavior does not change.

## Problem

The optimization review of P1 of `grammar-newcomer-rewrite.md` (session 88add311, 3.9M weighted tokens: orchestrator 1.9M over 104 calls, six workers at 260k to 370k each) found five causes of avoidable spend in the run and two in the review itself. Costs are weighted tokens (cache read 0.1×, 1 h write 2×, 5 min write 1.25×, output 5×), summed per cause over every agent it touched.

1. **A multi-page policy unit ran in the orchestrator (about 150k).** U1 was marked *orchestrator* but wrote two sections in `grammar-docs.md`, a cut in `claritish-style.md`, and two digest files, at 83k to 104k context; about 21k of slices and edits were then carried for about 60 more calls. The one-slice rule in [proposal-plans.md](../../meta/procedures/proposal-plans.md#one-session-or-several-subagents) already excluded it, but nothing caught it when the plan was written. This is the main reason P1 took 104 orchestrator turns against the 40 planned.
2. **Workers searched for the reading order (about 115k).** The newcomer rule says examples use only constructions taught on the page or earlier, *check with `node scripts/find.mjs`*, but `find.mjs` has no order filter and nothing named `reading-order.ts`. U4, U5 and A1 each grepped JSON, `src/` and `--help` before finding it, and U3 wrote an example the `learning-order` lint flagged, one more edit-and-verify round.
3. **The U2 brief left out `scripts/page-readers.ts` (about 105k).** U2 added a lint that reads grammar pages; the build's `page readers` step fails such a file unless it is on `WHOLE_SITE`, which was not on U2's edit list. U2 spent 66k finding out why and stopped; the orchestrator then made the one-line fix at 110k context (about 56k).
4. **verify names a baseline-only failure as a failed job (about 80k).** The phase baseline held three open `page readers` errors, so every `verify` line ended *failed jobs: page readers*, and five workers each checked whether they had caused them, two with `git stash`.
5. **The orchestrator read agent files to learn what a brief needs (about 45k).** It read `proposal-worker.md` and `style-editor.md` whole. Step 2 of [running with subagents](../../meta/procedures/proposals.md#running-with-subagents) already lists what a brief holds; the one field it lacks is the style-editor's list of labels earlier pages already gloss.
6. **The review printed the whole `--calls` listing (about 70k).** `token-report --calls` for the whole session put 330 call lines, about 13k tokens, into the run reviewer's context for 55 more calls. Per-agent listings or a grep of the saved listing would have kept about 4k.
7. **The review wrote two scratch scripts (about 25k, likely in every review).** `--calls` shows each result's carry but not each call's own weighted cost, and cannot show a call's input or the reasoning before it, so the reviewer wrote `rr-calls.mjs` and `rr-cost.mjs` to measure calls such as U4's 74k call after a cache expiry.

## Goals

- A plan writer can tell from the rule text alone which units belong to a worker.
- A writer checks a draft example against reading order in one call before splicing it.
- A unit that adds a grammar-page reader has the registry file on its edit list.
- A worker can tell from the `verify` line alone that a red job is not its own.
- An orchestrator writes any brief from [proposals.md](../../meta/procedures/proposals.md#running-with-subagents) without opening an agent file.
- A run reviewer finds the costly calls and their causes with `token-report` alone, keeping its context small.

## Non-goals

- A lint over proposal plans. The orchestrator-unit test stays a wording rule (decided).
- Hiding baseline-only jobs from the `verify` line (decided: mark them).
- An order filter in `find.mjs`. `--at` checks drafts; `find.mjs` keeps searching existing examples.

## Design

### D1 Policy units go to a worker

In [one session or several subagents](../../meta/procedures/proposal-plans.md#one-session-or-several-subagents), after *The plan marks such units orchestrator*, add:

> A policy unit that writes into more than one page, or reads more than one slice, is a `proposal-worker` unit, however short its edits. The orchestrator settles its decisions in the brief and reads only the report and `git diff --stat`. Edits a worker may not make, to `AGENTS.md` and to files under `.claude/`, stay with the orchestrator: workers report each one as exact old and new text, and the orchestrator applies them at the end of the phase.

In [the plan section](../../meta/procedures/proposal-plans.md#the-plan-section), the units bullet adds: *a unit marked orchestrator names its one page and the slice it reads.* [Step 15](../../meta/procedures/proposals.md#running-with-subagents) (*Keep one writer for `AGENTS.md`*) extends to files under `.claude/`, with the same report-then-apply rule.

### D2 Reading-order check for drafts

`node scripts/parse.mjs --check-lexicon --at <page>[#<id>] '<a>' '<b>' …` also reports, for each input that parses, every construction whose home comes after the given point in reading order, in the `learning-order` lint's wording (`learning-order  <id>  →  <home>`), and exits 1 on any. It reuses `learningOrder` and `constructionHomes` from `src/lint/` and the registry the lint builds, so the flag and the lint never disagree.

- `<page>` is a stage page's file name, with or without `.md`, or its path under `docs/grammar/`. With `#<id>` the comparison is by section, as the lint's is. With a page alone, anything homed on that page passes.
- `--at` turns on construction collection itself and works with `-` (one input per line on stdin) and several quoted inputs.
- A page off the reading order (a recipe page, a cheat sheet) is an error that says so: recipe pages are checked by their **Needs:** line.
- If the new code names a grammar path, the unit adds it to `WHOLE_SITE` in `scripts/page-readers.ts` (D3).

The text that sends writers to it:

- [grammar-docs.md](../../meta/grammar-docs.md#newcomer), *Examples stay within reach*: *(check with `node scripts/find.mjs`)* becomes *(check a draft with `node scripts/parse.mjs --check-lexicon --at <page>#<id>` before splicing it; the order is the unit arrays in [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts))*.
- [read-ageben.md](../../meta/procedures/read-ageben.md#parsing): one clause on `--at` in the flag list.
- [proposals.md](../../meta/procedures/proposals.md#running-with-subagents) step 2, the sentence on how a digest checks forms: a unit that writes examples on a stage page adds `--at <page>#<id>`.
- The run-state digests of `grammar-newcomer-rewrite.md` (`docs/proposals/run-state/grammar-newcomer-rewrite/`): where a line names `reading-order.ts` for the order check, it names `--at` instead.

### D3 New page readers list the registry

In [the plan section](../../meta/procedures/proposal-plans.md#the-plan-section), *the files each unit may edit* adds: *a unit that adds a file under `src/`, `scripts/` or `docs/grammar/.vitepress/` that names a grammar path also lists `scripts/page-readers.ts` (for `WHOLE_SITE`), or names the contract it imports from `src/page-contracts.ts` ([read-by blocks](../../meta/grammar-docs.md#read-by-blocks)).*

### D4 verify marks baseline-only jobs

A failed job is **baseline only** when it produced at least one error key and none of its keys is new (each is in the baseline, or on a generate row under `--allow-generate`). A failed job with a new key, or with no key at all, stays under *failed jobs*. The line becomes:

```
verify: PASS, 0 new, 0 resolved, 3 baseline still open (baseline only: page readers; 51s)
verify: FAIL, 2 new, 0 resolved, 3 baseline still open (failed jobs: lint ageben; baseline only: page readers; 51s)
```

`--baseline` mode keeps its line. The split is a pure helper in `scripts/lib/verify.ts`, tested in `scripts/lib/verify.test.ts`; `compare()` is unchanged.

[Step 5](../../meta/procedures/proposals.md#running-with-subagents) and each agent file that restates quiet verification add: *a job under baseline only failed before the phase began and has no new error; it is not the unit's to check.*

### D5 The brief list is complete

In [step 2](../../meta/procedures/proposals.md#running-with-subagents), the list of what a brief carries adds a bullet: *for a `style-editor` unit, the labels earlier pages already gloss (the running list)*. Any other field an agent file expects from its brief, other than what drill-generation.md already gives a `checkpoint-writer`, is added here too. The list ends: *With these, the brief is complete for every agent under `.claude/agents/` that an orchestrator launches; do not open an agent file to write its brief.*

### D6 token-report for reviews

In `scripts/token-report.mjs`:

- **`--calls` gains a cost column:** the weighted cost of the API call that issued the tool call. When one API call issues several tool calls, the first row shows the cost and the others show `"`. The column sits after the context column. A cache expiry shows as one large cost.
- **`--top N`** (with `--calls`): per transcript, keeps the N rows with the largest cost plus carry, printed in call order, with a line saying how many rows were left out.
- **`--show <transcript>:<from>-<to>`**: for those tool-call numbers of one transcript (an agent id prefix, or `main` for the session given by `--session`), prints each call's number, cost, the assistant text before it, and its tool input, each trimmed to about 300 characters, and the result's size. Never the result's body.
- **A long listing goes to a file.** When `--calls` would print more than 200 rows, it prints each transcript's header line and its 10 costliest rows, saves the full listing under `tmp/logs/`, and names the file.
- The header comment documents all of this. `scripts/lib/token-report.test.ts` covers each on its synthetic transcripts.

[Where the tokens go](../../meta/procedures/proposal-plans.md#where-the-tokens-go), *Measure it*, lists the new column and flags.

`run-reviewer.md` step 2 becomes: run `--session <id> --agent <agent id> --calls --top 15` per transcript, never `--calls` over a whole session; then use `--show <agent>:<from>-<to>` on the costly calls to see why they happened. Step 4 then reads transcript lines only when `--show` leaves a cause unclear.

## Implementation plan

One session, through subagents: three code units, then one procedure unit briefed from what the code units built, then the orchestrator's agent-file edits. About 25 orchestrator turns, so it names no phases. If the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

Workers never edit `.claude/`. Each reports the agent-file lines its change needs as exact old and new text, with the file and line number, and O1 applies them all.

### Units

**C1 verify: baseline-only jobs.**
Agent `proposal-worker`, `model: sonnet`, effort `medium`.
Build [D4](#d4-verify-marks-baseline-only-jobs): the helper, its tests, and the new line. Read `proposal-worker.md`, `checkpoint-writer.md`, `style-editor.md` and `phase-executor.md` for the lines that restate quiet verification, and report the sentence to add to each as old and new text. Report the final line format, with one passing and one failing example.
**May edit:** `scripts/verify.ts`, `scripts/lib/verify.ts`, `scripts/lib/verify.test.ts`.

**C2 parse: `--at`.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Build [D2](#d2-reading-order-check-for-drafts) by reusing the lint's helpers, never a second reading of the order. Test it in `src/parse/cli-args.test.ts` for the flag and in a CLI or helper test for one passing input, one taught-later input, a `#id` that changes the result, and a page off the reading order. Then edit the grammar-docs.md bullet, the read-ageben.md flag list, and the `grammar-newcomer-rewrite.md` run-state digests as D2 says. Report the flag's usage line and one example of its output.
**May edit:** `src/parse/cli.ts`, `src/parse/cli-args.ts`, `src/parse/cli-args.test.ts`, a new helper and its test under `src/lint/` or `src/parse/` if one is needed, `src/lint/construction-order.ts`, `scripts/page-readers.ts`, `scripts/lint-ageben-docs.ts` (only to share the registry builder), `docs/meta/grammar-docs.md`, `docs/meta/procedures/read-ageben.md`, `docs/proposals/run-state/grammar-newcomer-rewrite/*.txt`.

**C3 token-report: cost, `--top`, `--show`.**
Agent `proposal-worker`, `model: opus`, effort `medium`.
Build [D6](#d6-token-report-for-reviews) in `scripts/token-report.mjs` and its test. Check it once on a real transcript: run `--session 88add311 --calls --top 5` and one `--show` range, and paste neither output into the report beyond one row of each. Draft the new `run-reviewer.md` step 2 and step 4 text per D6, as old and new text.
**May edit:** `scripts/token-report.mjs`, `scripts/lib/token-report.test.ts`.

**P1 Procedure text.**
Agent `proposal-worker`, `model: opus`, effort `high`.
Write [D1](#d1-policy-units-go-to-a-worker), [D3](#d3-new-page-readers-list-the-registry), [D5](#d5-the-brief-list-is-complete), the step 5 sentence of D4, the step 2 `--at` sentence of D2, and the *Measure it* lines of D6, using the flag names and line formats from the C1 to C3 reports, which the brief carries. For D5, read the brief sections of the five agent files and `drill-generation.md`'s checkpoint pack, and add to step 2 any field they expect that the list lacks. Check whether `phase-executor.md` or `full-execution.md` restate the orchestrator-unit rule or step 15, and report the matching lines as old and new text. Self-check the prose against the [checklist](../../meta/doc-style.md#checklist).
**May edit:** `docs/meta/procedures/proposal-plans.md`, `docs/meta/procedures/proposals.md`, `docs/meta/procedures/full-execution.md`.

**O1 Agent files.**
*Orchestrator* (D1's exception for `.claude/`). Apply the old and new text reported by C1, C3 and P1 to `.claude/agents/proposal-worker.md`, `checkpoint-writer.md`, `style-editor.md`, `phase-executor.md` and `run-reviewer.md`, reading only each reported line's slice. Apply any `AGENTS.md` Owns lines the reports name.
**May edit:** those five agent files, `AGENTS.md`.

After O1, the orchestrator runs the final gate and deletes this proposal: the procedure pages, `grammar-docs.md` and the agent files own the result.

### Rule digest (pasted into every brief)

> - This is tooling and procedure: never change a form, a reading, or what the parser accepts.
> - Never edit `AGENTS.md` or anything under `.claude/`. Report each change they need as the file, the line number, and exact old and new text.
> - Never link to a page under `docs/proposals/`; name it by filename in backticks. Run-state files under it may be edited when the brief lists them.
> - Run any `.ts` probe with `npx --no-install tsx <file>`. Scratch scripts go in `tmp/scratch/`, never inline.
> - Read slices: `npm run -s outline -- <file>` (on a `.ts` file it lists declarations) or `grep -n '^#'`, then the ranges you need. When output says *saved to*, grep or slice the file.
> - A new file under `src/` or `scripts/` that names a grammar path needs `WHOLE_SITE` in `scripts/page-readers.ts` or a contract from `src/page-contracts.ts`; if that file is not on your list, stop and report.
> - Check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call.
> - Prose under `docs/meta/` follows `docs/meta/doc-style.md`; check it against the [checklist](../../meta/doc-style.md#checklist).
> - Verify with `npm run verify -- --allow-generate` (Bash timeout 300000 ms) at the end of the item, `--fast` inside it. The orchestrator saved the baseline; never re-save it. Read only new error lines from `tmp/logs/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields, in about 150 words: **done**, **files touched** (count), **formats** (flag usage and output lines later units cite), **agent-file edits** (file, line, old, new), **AGENTS.md Owns lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- At the start, `npm run verify -- --baseline`.
- Between units, `npm run verify -- --allow-generate` against that baseline shows no new errors before the unit's commit. When the worker's last act was a passing `verify` and nothing has changed since, commit on that result.
- After O1, the final gate: a full `npm run verify` that passes with no errors left in the baseline. It runs the build and the tests, so neither runs again after it.
- No style gate: no prose under `docs/grammar/` changes. No recall gate: no unit edits `say-*.md`, `english.md` or `src/english-helper/`.

### Commits

One commit per unit after its gate, then the deletion of this proposal: six commits (C1, C2, C3, P1, O1, deletion). Messages start `spend-fixes-newcomer-p1 C1:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

None. The shapes the review left open were settled by the user on 2026-11-24 (Status). Within D2 and D6, flag spelling, trimming lengths and test layout are code shape, settled by the worker.
