# Style pass

**Status:** PROPOSED (2026-11-11). No user decisions yet. Nothing has run.

**Related:** [doc-style.md](../meta/doc-style.md), [claritish-style.md](../meta/claritish-style.md), [grammar-docs.md](../meta/grammar-docs.md), [restructure-sittings.md](../meta/procedures/restructure-sittings.md), [proposals.md](../meta/procedures/proposals.md), [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [prose-style.ts](../../src/lint/prose-style.ts), [lint-prose-style.ts](../../scripts/lint-prose-style.ts)

**Depends on:** none.

**Design authority:** *none*. The pass changes teaching English only. It adds, removes, and changes no form, reading, gloss, example, or checkpoint.

## Problem

[doc-style.md](../meta/doc-style.md) was revised on 2026-11-11, and the pages under `docs/grammar/` have not been brought up to it as a whole. Two things are wrong.

**The pages are behind the guide.** The seven rules that fail the build pass on all 168 pages. The four warning rules do not:

| Warning | Hits |
|---------|------|
| `bold-density` | 158 |
| `beginner-lead` | 42 |
| `long-paragraph` | 36 |
| `jargon` | 2 |
| All four | 238 |

By folder, the 238 are: Beginner 91, Intermediate 74, Advanced 35, cheat sheets 11, Claritish 4. The remaining hits were not attributed to a folder. Only these totals were measured. The nine *Judgment* rows of the [checklist](../meta/doc-style.md#checklist) have never been checked across the site, and no page was read for this proposal, so their state is unknown.

**The style decays after a reorganization.** Three causes, all visible in the tooling:

- Warnings never fail, so nothing stops a page's count from rising. That is how 238 accumulated.
- The judgment rules depend on what comes before a section: the lead may be one sentence only when the previous H3 made the job obvious, a label is glossed on *first* use, and a point is previewed once. A move or a peel changes what comes before, so a section that was correct in its old place is wrong in its new one, and no check sees it.
- Neither [restructure-sittings.md](../meta/procedures/restructure-sittings.md) nor [proposals.md](../meta/procedures/proposals.md) has a step that re-runs the [closing tests](../meta/doc-style.md#before-you-finish) on moved sections. The worker that moves a section is also the worst reader to test it, because the slogan test asks what a reader "who has never opened this repo" would understand.

## Goals

1. Every learner-facing page passes the checklist: warnings cleared or individually accepted, and the seven closing tests run on every teaching section.
2. A page's warning count cannot rise without someone deciding it should.
3. Any later change that moves, peels, merges, or rewrites sections ends with a style review of exactly those sections, by a reader with a fresh context.

## Non-goals

- No change to Ageben forms, glosses, examples, Practice checkpoints, word banks, or generated cheat-sheet tables.
- No moving or retitling of headings, and no change to heading ids. A heading that needs retitling is logged ([open decision 4](#open-decisions)).
- No new rules of style. Where the guide is silent about a kind of page, the gap is logged for the user, not filled by a worker.
- No lint for rules that need understanding (consequence, say it once, a choice says when, pictures). Those stay with the review gate.

## Design

### What the pass does to a section

For each H2 or H3 in a unit, the worker:

1. Reads which kind of section it is in [which rules apply to which page](../meta/doc-style.md#which-page). A table that finishes a series gets a pointer sentence and skips the slogan test. A pronunciation section has no English job.
2. Clears the lint warnings on it, or records why one stands.
3. Runs the seven [closing tests](../meta/doc-style.md#before-you-finish) and rewrites the prose that fails.
4. Leaves everything else alone.

Two limits keep the rewrite safe:

- **Never invent a fact about the language.** A missing consequence, or a choice with no *when*, may be written only if the page or the owning page already states the fact. Otherwise the worker logs the section and moves on. This is the pass's main risk: a plausible sentence about what a form lets you do, which the grammar does not support.
- **Wording only, checked mechanically.** A new script compares each edited page with its committed version and fails if the code spans, fenced blocks, headings, anchor ids, or anything from `### Practice` to the next heading differ. A worker that needs to change one of these has left the scope.

### Why the unit is the sidebar unit

House shorthand and specialist labels are glossed on first use *in reading order*, so the worker has to know what the pages before it already taught. A sidebar unit from `reading-order.ts` is a run of neighbouring sittings and is within the eight-page limit for one subagent (Beginner 38 pages in 9 units, Intermediate 64 in 17, Advanced 20 in 5). Each worker also gets a short list of the labels the earlier units have already glossed, which the orchestrator carries forward from report to report.

### Keeping it applied

| Change | What it prevents |
|--------|------------------|
| **Warning ratchet.** A committed baseline holds each page's count per warning rule. The build fails when a count rises. `npm run lint:prose -- --update-baseline` lowers or raises it deliberately, and the diff of the baseline file shows the decision. | Slow accumulation. An accepted one-sentence lead stays accepted, which the guide requires ("a warning is a place to look, not a verdict"). |
| **Exact rule for voice.** Fail on maintainer *we* and author *I* in prose, outside italics and quotations, with the acknowledgments and the purpose essay exempt as the guide says. | The one judgment row that is really a pattern. |
| **`changed-sections` script.** Lists the H2 and H3 sections whose text changed, or whose preceding section changed, since a given commit. | A reviewer rereading whole pages, or skipping the review because the scope is unclear. |
| **Style gate in both procedures.** The last unit of any proposal or restructure that touches grammar prose is a style review of the `changed-sections` list, run by a fresh subagent that made none of the changes. | The drop after reorganizations. |
| **`style-editor` agent file.** A standing brief under `.claude/agents/` holding the digest below, so the gate costs one short launch. | The gate being skipped because writing its brief is work. |
| **Which-page rows.** Add the kinds of page the table does not name: recipe pages, cheat sheets, level reviews. | Workers guessing which rules apply there. |

A lint for first-use glossing of house shorthand was considered and dropped. The words are *job*, *point*, *setting*, *body*: ordinary English, so a term list would flag most paragraphs on the site.

## Implementation plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

Every unit is one fresh subagent. Prose units run on `model: opus`, `effort: high`. They run in sequence in reading order, because each one receives the glossed-label list from the one before.

### Phase 0: tooling and rules

| Unit | Work | Agent | Model, effort | May edit |
|------|------|-------|---------------|----------|
| T1 | Warning ratchet and its baseline; the *we* / *I* rule; tests for both; [what the build checks](../meta/doc-style.md#what-the-build-checks) updated | `proposal-worker` | `opus`, `medium` | `src/lint/prose-style.ts`, its test, `scripts/lint-prose-style.ts`, the baseline file, `doc-style.md` |
| T2 | `changed-sections` and the wording-only check, with tests | `proposal-worker` | `opus`, `medium` | `scripts/`, `src/lint/`, `package.json` |
| T3 | `style-editor` agent file; the style gate in both procedures; which-page rows as decided ([open decision 3](#open-decisions)) | `proposal-worker` | `opus`, `medium` | `.claude/agents/style-editor.md`, `restructure-sittings.md`, `proposals.md`, `doc-style.md` |

T1 will find existing *we* / *I* hits. It lists them in its report and leaves them in the baseline as known failures for the page units to clear; the rule starts failing the build in Phase 5.

### Phase 1: calibration

| Unit | Work |
|------|------|
| C1 | The first Beginner unit, by `style-editor`. Its report also sorts that unit's `bold-density` and `beginner-lead` hits by cause. |

**The run stops here.** The user reads the C1 diff. Their corrections go into the digest and the agent file, and [open decision 2](#open-decisions) is settled from C1's sort, before any other page is touched.

### Phases 2 to 4: the pages

| Phase | Units | Pages |
|-------|-------|-------|
| 2 | B2 to B9, one per remaining Beginner unit | Beginner sittings |
| 3 | O1: `purpose.md`, `introduction.md`, with [orientation-style.md](../meta/orientation-style.md) added to the brief. O2: `english.md` and the five `say-*.md` recipes. O3 and O4: the Claritish track in two halves, with [claritish-style.md](../meta/claritish-style.md) added to the brief | On-ramps |
| 4 | I1 to I17, then A1 to A5 | Intermediate, then Advanced |

Each unit may edit only its own pages and the ratchet baseline. A page with a control (a drill, a player, the journal editor) also gets the [interface instructions](../meta/doc-style.md#interface-instructions) check. The orchestrator asks for a go-ahead between phases.

### Phase 5: close

| Unit | Work | Agent | Model, effort |
|------|------|-------|---------------|
| L1 | Cheat-sheet prose outside the `<!-- generated -->` markers, level-review prose outside Practice, `terminology.md` link text and voice only | `style-editor` | `opus`, `high` |
| X1 | Independent audit. A fresh subagent that has read no earlier report takes two sections per unit, chosen by the orchestrator, and runs the slogan test and the why-care test from the lead alone. It edits nothing and reports failures by section | `proposal-worker` | `opus`, `high` |
| X2 | Fix what X1 found, tighten the baseline, turn the *we* / *I* rule on as failing | `style-editor` | `opus`, `high` |

If X1 fails more than about one section in five, that is a [stop-and-alert](../meta/procedures/proposals.md#stop-and-alert) finding: the digest is not working and the user decides what to do.

### Rule digest

Pasted into every prose unit's prompt, and the body of the `style-editor` agent file.

> You are editing the teaching English on these pages so that it meets `docs/meta/doc-style.md`. Read its Checklist, "Which rules apply to which page", and "Before you finish" first (`grep -n '^#'`, then those ranges). Open other sections only when a test needs them.
>
> 1. List each page's headings, then read and edit one page at a time. Run `npm run lint:prose -- --report` once and keep only your pages' lines.
> 2. For each H2 or H3: decide its kind from the which-page table, clear its warnings, then run the seven closing tests and rewrite what fails.
> 3. A lead says the English job, then the Ageben shape, then the consequence, then any cue. Second person. No maintainer *we*, no author *I*.
> 4. A paragraph that lists parallel items becomes a table. Bold is for a term where it is defined and for a control's label.
> 5. These labels are already glossed by earlier units, so do not gloss them again: (list from the orchestrator). Gloss any other label or house shorthand where your pages first use it, and report the ones you glossed.
> 6. **Never state a fact about Ageben that the page, or the page it links to as owner, does not already state.** If a section needs a consequence or a *when* that you cannot find stated, do not write one. Report the section.
> 7. Do not change code spans, fenced blocks, glosses, examples, headings, anchor ids, link targets, anything under `### Practice`, or anything between `<!-- generated -->` markers. Do not move sections. A heading that fails the plain-language rule is reported, not retitled.
> 8. Do not work out what an Ageben sentence means by reading it. If a rewrite depends on a sentence's meaning, use `node scripts/parse.mjs --llm-prompt`.
> 9. A warning you judge correct as it stands (for example a one-sentence lead after an H3 that made the job obvious) stays. Report it with the reason.
> 10. When done, run the wording-only check, then `npm run verify -- --allow-generate`. On a new error read only that line of `tmp/verify-last.log`. Do not commit.
>
> Stop and report to the orchestrator, without working around it, if a page's premise differs from this brief, if most sections on a page need facts you cannot find, or if the wording-only check cannot pass without a change outside your scope.
>
> At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
>
> **Report:** pages and sections rewritten (counts); warnings before and after per rule; warnings kept, with reasons; labels newly glossed; sections reported under rule 6; headings reported under rule 7; the `verify` line; left; inefficient.

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with the wording-only check and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit.
- Final gate: a clean `npm run build` and `npm test` after X2, with every page's warning count at or below its baseline.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. Expected: 3 for Phase 0, 1 for Phase 1, 8 for Phase 2, 4 for Phase 3, 22 for Phase 4, and 2 for Phase 5 (X1 edits nothing), 40 in all. The orchestrator records finished unit ids on the Status line after each commit.

## Open decisions

1. **Does a rising warning count fail the build?** Options: fail (the ratchet above); keep warning only and rely on the review gate; fail only on Beginner pages. **Recommendation:** fail everywhere. The review gate covers reorganizations but not ordinary edits, and the baseline flag keeps the guide's promise that a warning is not a verdict.

2. **What to do about `bold-density`.** It is two thirds of all warnings (158). The guide allows bold for a term at its definition and for a control's label; no page was read, so it is not known whether the hits are overuse or a legitimate pattern the rule miscounts (bold lead-ins on list items, for example). Options: rewrite all of them; exempt a named pattern in the lint; raise the ceiling. **Recommendation:** none yet. C1 sorts its hits by cause, and that sort settles it before Phase 2.

3. **Which rules apply to recipe pages, cheat sheets, and level reviews.** The which-page table does not name them. **Recommendation:** add three rows. A recipe page's heading is already the English job, so its lead starts at the Ageben shape and still ends with the consequence. Cheat sheets and level reviews are lookup and practice, so only punctuation, link text, plain language, and voice apply to their prose. This is a reading of the guide's intent and has not been checked against those pages.

4. **Headings that use an unglossed label.** The guide says a heading may use a label only after its gloss, or must carry the gloss itself. Fixing one means a retitle, which changes sidebar text and may need a pinned id. Options: retitle during the pass; log and batch them in a follow-up; leave headings alone. **Recommendation:** log and batch. Retitles touch registry files that take one writer at a time, and a single follow-up unit can run them through the heading tools.

5. **Scope of the first go-ahead.** The whole pass is 41 subagents, 38 of them on teaching prose at high effort. Options: approve all phases now; approve through Phase 2 (tooling, calibration, Beginner) and decide the rest from the result. **Recommendation:** through Phase 2. Beginner carries the most warnings and the most readers, and the durable tooling lands in Phase 0 either way.
