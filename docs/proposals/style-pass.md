# Style pass

**Status:** PROPOSED (2026-11-11). Decided 2026-11-11: a rising warning count fails the build on every page (the ratchet); recipe pages, cheat sheets, and level reviews get the which-page rows in [keeping it applied](#keeping-it-applied); headings that need a retitle are logged and retitled together in H1; the user reviews each phase before the next starts; forms take bold only where introduced ([bold on forms](#bold-on-forms)). Nothing has run.

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

By folder, the 238 are: Beginner 91, Intermediate 74, Advanced 35, cheat sheets 11, Claritish 4. The remaining hits were not attributed to a folder. Only these totals were measured, except the `bold-density` hits, sorted in [bold on forms](#bold-on-forms). The nine *Judgment* rows of the [checklist](../meta/doc-style.md#checklist) have never been checked across the site, and no page was read for this proposal, so their state is unknown.

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
- No moving or retitling of headings, and no change to heading ids. A heading that needs retitling is logged in [headings to retitle](#headings-to-retitle), and H1 retitles them together in Phase 9.
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
| **Which-page rows.** Add the kinds of page the table does not name. A recipe page's heading is already the English job, so its lead starts at the Ageben shape and still ends with the consequence. Cheat sheets and level reviews are lookup and practice, so only punctuation, link text, plain language, and voice apply to their prose. T3 checks each row against two pages of its kind before writing it. | Workers guessing which rules apply there. |

A lint for first-use glossing of house shorthand was considered and dropped. The words are *job*, *point*, *setting*, *body*: ordinary English, so a term list would flag most paragraphs on the site.

### Bold on forms

All 156 `bold-density` hits were sorted by cause on 2026-11-11, about 990 bold phrases in all:

| Bold on | Phrases | Example |
|---------|---------|---------|
| A form in backticks | about 470 | **`ham`**, **`thenam`** |
| A bare letter or ending, with no backticks | about 340 | **-l**, **-x**, **a** |
| English words, for stress | about 150 | **one**, **now**, **from** |
| Starters and overlay names | about 30 | **Compare with:**, **PLAN** |

Counting only the English bold, 7 of the 156 paragraphs would still be over the ceiling. The warning mostly measures one house habit, bold on forms, which the guide did not mention. The habit is site-wide (about 3,500 bold forms in backticks on grammar pages). Many hit paragraphs are also lists of parallel forms, such as the endings in `firm-soft.md` and the number-word order in `measures-and-percent.md`, which the guide already sends to a table.

The pass treats a form like a term: a form may be bold where the page introduces it, and is plain backticks after that. Bare letters and endings always go in backticks. The lint is unchanged, so a paragraph that introduces more than four forms still warns, and the fix is usually a table. Bold then tells the learner *this is where it is taught*; in a paragraph with eight bold forms it tells them nothing. T3 writes the rule into [doc-style.md](../meta/doc-style.md#voice-and-length).

## Implementation plan

The pass runs in nine [phases](../meta/procedures/proposals.md#phases), one orchestrator session each, with no phase over six units. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends. Consolidation keeps the [glossed labels](#glossed-labels) and [headings to retitle](#headings-to-retitle) lists current, because later units need them and the reports that built them are gone.

Every unit is one fresh subagent. Prose units run as `style-editor` on `model: opus`, `effort: high`. They run in sequence in reading order, because each one receives the glossed-label list from the one before. Each prose unit may edit only its own pages and the ratchet baseline. A page with a control (a drill, a player, the journal editor) also gets the [interface instructions](../meta/doc-style.md#interface-instructions) check.

Each phase ends as [phases](../meta/procedures/proposals.md#phases) says: the phase gate, the last unit's commit, consolidation, the proposal's commit, then a stop. The orchestrator tells the user what the phase settled, which open decisions wait on them, and the prompt for the next phase, *Carry out phase N of `style-pass.md`*. It does not start the next phase in the same session.

### Phase 1: tooling and calibration

| Unit | Work | Agent | Model, effort | May edit |
|------|------|-------|---------------|----------|
| T1 | Warning ratchet and its baseline; the *we* / *I* rule; tests for both; [what the build checks](../meta/doc-style.md#what-the-build-checks) updated | `proposal-worker` | `opus`, `medium` | `src/lint/prose-style.ts`, its test, `scripts/lint-prose-style.ts`, the baseline file, `doc-style.md` |
| T2 | `changed-sections` and the wording-only check, with tests | `proposal-worker` | `opus`, `medium` | `scripts/`, `src/lint/`, `package.json` |
| T3 | `style-editor` agent file; the style gate in both procedures; the which-page rows; the bold rule in [bold on forms](#bold-on-forms) | `proposal-worker` | `opus`, `medium` | `.claude/agents/style-editor.md`, `restructure-sittings.md`, `proposals.md`, `doc-style.md` |
| C1 | The first Beginner unit, under the digest as written | `style-editor` | `opus`, `high` | that unit's pages, the baseline file |

T1 will find existing *we* / *I* hits. It lists them in its report and leaves them in the baseline as known failures for the page units to clear; the rule starts failing the build in Phase 9.

**Cut:** C1 is the first prose unit, and the user's review of its diff calibrates every later one, so no other page is touched until that review is in.

### Phase 2: Beginner, first half

The phase starts by folding the user's corrections from the C1 review into the [rule digest](#rule-digest) and `.claude/agents/style-editor.md`, as an orchestrator edit with its own commit. Then B2 to B5, one per Beginner unit in reading order.

**Cut:** the six-unit budget.

### Phase 3: Beginner, second half

B6 to B9, one per remaining Beginner unit.

**Cut:** Beginner is finished, and the on-ramps add style guides to the brief, so the digest changes.

### Phase 4: on-ramps

| Unit | Pages | Added to the brief |
|------|-------|--------------------|
| O1 | `purpose.md`, `introduction.md` | [orientation-style.md](../meta/orientation-style.md) |
| O2 | `english.md` and the five `say-*.md` recipes | — |
| O3, O4 | The Claritish track in two halves | [claritish-style.md](../meta/claritish-style.md) |

**Cut:** the digest returns to the plain one for Intermediate.

### Phases 5 to 7: Intermediate

| Phase | Units |
|-------|-------|
| 5 | I1 to I6 |
| 6 | I7 to I12 |
| 7 | I13 to I17 |

**Cuts:** the six-unit budget.

### Phase 8: Advanced

A1 to A5.

**Cut:** every page unit is done, which the audit needs, and the close reads cheat sheets and level reviews under different which-page rows.

### Phase 9: close

| Unit | Work | Agent | Model, effort |
|------|------|-------|---------------|
| L1 | Cheat-sheet prose outside the `<!-- generated -->` markers, level-review prose outside Practice, `terminology.md` link text and voice only | `style-editor` | `opus`, `high` |
| H1 | Retitle the headings in [headings to retitle](#headings-to-retitle) to plain language, each pinning its old id with `{#id}` so no link changes | `proposal-worker` | `opus`, `high` |
| X1 | Independent audit. A fresh subagent that has read no earlier report takes two sections per unit, chosen by the orchestrator, and runs the slogan test and the why-care test from the lead alone. It edits nothing and reports failures by section | `proposal-worker` | `opus`, `high` |
| X2 | Fix what X1 found, tighten the baseline, turn the *we* / *I* rule on as failing | `style-editor` | `opus`, `high` |

X1 and X2 share a phase because X2 works from X1's report. If X1 fails more than about one section in five, that is a [stop-and-alert](../meta/procedures/proposals.md#stop-and-alert) finding: the digest is not working and the user decides what to do.

### Rule digest

Pasted into every prose unit's prompt, and the body of the `style-editor` agent file.

> You are editing the teaching English on these pages so that it meets `docs/meta/doc-style.md`. Read its Checklist, "Which rules apply to which page", and "Before you finish" first (`grep -n '^#'`, then those ranges). Open other sections only when a test needs them.
>
> 1. List each page's headings, then read and edit one page at a time. Run `npm run lint:prose -- --report` once and keep only your pages' lines.
> 2. For each H2 or H3: decide its kind from the which-page table, clear its warnings, then run the seven closing tests and rewrite what fails.
> 3. A lead says the English job, then the Ageben shape, then the consequence, then any cue. Second person. No maintainer *we*, no author *I*.
> 4. A paragraph that lists parallel items becomes a table. Bold is for a term or an Ageben form where it is defined or introduced, and for a control's label. Bare letters and endings go in backticks (`-l`, not **-l**).
> 5. These labels are already glossed by earlier units, so do not gloss them again: (list pasted by the orchestrator). Gloss any other label or house shorthand where your pages first use it, and report the ones you glossed.
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

### Glossed labels

Labels that finished units have glossed, in reading order, each with the page that glosses it. The orchestrator pastes this list into rule 5 of each prose unit's prompt and adds each report's newly glossed labels after the unit's commit.

*None yet.*

### Headings to retitle

Headings that prose units reported under rule 7 of the digest, each with its page, its id, and why it fails. The orchestrator adds each report's headings after the unit's commit; H1 works from this list.

*None yet.*

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with the wording-only check and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit.
- Phase gate: the last unit's `verify` is green against the phase's baseline, with no page above its ratchet count once T1 has landed. When nothing has changed since that run, it is not repeated.
- Final gate, in Phase 9: a clean `npm run build` and `npm test` after X2, with every page's warning count at or below its baseline.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. X1 edits nothing and makes no commit. Phase 2 adds one commit for the digest corrections. Each phase ends with a commit of the consolidated proposal, `style-pass phase <N>: consolidate [skip-cd]`; in Phase 9 that commit deletes the proposal instead, once the meta notes own the result.

| Phase | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | All |
|-------|---|---|---|---|---|---|---|---|---|-----|
| Commits | 5 | 6 | 5 | 5 | 7 | 7 | 6 | 6 | 4 | 51 |

The orchestrator records finished unit ids on the Status line after each commit, and the finished phase at its end.

## Open decisions

None.
