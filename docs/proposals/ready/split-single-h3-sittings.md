# Split single-H3 sittings

**Status:** READY (2026-11-18). Decided 2026-11-18: a sitting with one H3 that teaches more than one thing splits into one H3 per thing, so the page outline lists them; a sitting that teaches only one thing is exempt and keeps its single H3. The old id is never kept: every new H3 gets its own id (`thanks-and-sorry.md#thanks-sorry` becomes `#thanks` and `#sorry`), each link to the old id goes to the H3 it means, and the old URL gets a hash row to one of them. The style review (Y) covers only the new headings and seam leads on split pages, not the whole `changed-sections` list.

**Related:** [one sitting](../../meta/grammar-docs.md#one-sitting) (the **Lower bound** line), [unique ids](../../meta/grammar-docs.md#unique-ids), [retie-safe writing](../../meta/grammar-docs.md#retie-safe-writing), [cheat sheets](../../meta/grammar-docs.md#cheat-sheets), [restructure sittings](../../meta/procedures/restructure-sittings.md), [sitting length](../../meta/procedures/drill-generation.md#sitting-length), [`scripts/lib/link-rewrite.ts`](../../../scripts/lib/link-rewrite.ts), [`scripts/lib/hash-rows.ts`](../../../scripts/lib/hash-rows.ts), [`scripts/move-heading.ts`](../../../scripts/move-heading.ts), [`hash-redirect.ts`](../../grammar/.vitepress/lib/hash-redirect.ts); the 41 sittings in [the worklist](#worklist).

**Depends on:** none.

**Design authority:** *none*. Headings, ids, links and the editor policy only: no form, reading, or parser behavior changes. Teaching prose changes only at the seams a new heading makes.

## Problem

41 sittings have exactly one taught H3 (`npm run page-lines`, S = 1). The site outline shows H2 and H3 ([`config.ts`](../../grammar/.vitepress/config.ts) `outline.level: [2, 3]`), so on those pages the table of contents is one line, often the page title repeated (11 of them: `### Thanks and sorry` under `# Thanks and sorry`). A learner cannot see what the page teaches or jump to the second half. Many of these pages teach two or more things the learner picks between: [thanks-and-sorry.md](../../grammar/beginner/thanks-and-sorry.md) teaches thanks (a lone met word) and sorry (an unmet word with a `bl-` person), each with its own examples and table.

The policy allows this today: *"A single-H3 sitting is fine when it passes 8 and earns its own checkpoint"* ([one sitting](../../meta/grammar-docs.md#one-sitting)).

## Goals

- Every sitting that teaches more than one thing has one H3 per thing, and the outline lists them.
- The policy says so, so later edits don't merge them back.
- Every link to a removed id lands on the H3 it means; old URLs with the old hash still land on the page.

## Non-goals

- Pages that teach one thing keep their single H3. No filler headings.
- No peels, merges, or moves between pages; no sidebar changes.
- No new Practice beyond what [drills as a check](../../meta/grammar-docs.md#beginner-stage-shape) requires when a new H3 has no item.
- Reviews, recipe pages (`say-*.md`), cheat sheets, Claritish and other non-sitting pages are out of scope.

## Design

### Policy text

Replace the **Lower bound** paragraph in [one sitting](../../meta/grammar-docs.md#one-sitting) with:

> **Lower bound.** A sitting gives each thing it teaches its own H3, so the page outline lists them: each form, reading, or rule the learner tells apart, with its own worked example. A single-H3 sitting is fine only when it teaches one thing and earns its own checkpoint. Do not merge two sittings to fill a page; merge only when both are the same job on the same axis, the merge passes 1–8, and neither URL is a Beginner parent.

Add to **Signals**:

> - A sitting with one H3: check whether it teaches more than one thing ([lower bound](#one-sitting)).

### What counts as one thing

A page **splits** when its single H3 holds two or more parts that each have their own English job or form, their own worked example, and usually their own table or **Compare with** line (thanks / sorry; *already* / *still* / *not yet* / *no longer* if the page teaches them as separate choices).

A page is **exempt** when it teaches one form or rule and everything after the first example only extends it: more rows of one table, one consequence, one contrast. A finished-series inventory (pointer plus table) is one thing. Do not split a pointer from the table it introduces, and do not give a lone **Compare with** line its own H3.

Most splits make two H3s. Make more only when each part passes the test above on its own; never past the [room](../../meta/grammar-docs.md#one-sitting) cap of 10.

### Headings and ids

- Each new H3 is named for its part, in learner words, and does not repeat the H1.
- Each new H3 pins an English `{#id}` ([retie-safe writing](../../meta/grammar-docs.md#retie-safe-writing)); no new id equals the old one ([unique ids](../../meta/grammar-docs.md#unique-ids)). An old `<a id>` line under the heading (`intention.md`, `universality.md`) goes too.
- The first new H3 opens with the page's existing lead. A later H3 opens on its own job: at most one new lead sentence at the seam, saying what this part does, in place of a transition like *Sorry is about …* that leaned on the paragraph above. No other prose changes.

### Links and old URLs

Links to the old id go to the new H3 they mean, judged from the linking sentence. The **default target** is the H3 most links mean (usually the first); the rest are exceptions. One hash row sends `page.html#old` to the default target, so old bookmarks land on the page.

No tool does this today: `move-heading --record-only` writes hash rows but rewrites no links, and its link rewrite needs the id to move to another page. Unit T1 adds `npm run retarget-id`:

```
npm run retarget-id -- --page beginner/thanks-and-sorry.md --id thanks-sorry --to thanks \
  [--except docs/grammar/beginner/feelings.md:88=sorry,src/game/x.ts:12=sorry] [--list] [--write]
```

- Preconditions: `--id` no longer exists on `--page`; `--to` and every `--except` target do.
- `--list` prints each reference to `page.md#old` (and `.html` / `/page#old` forms) repo-wide, the same scan as `rewriteRepo`, one per line: `file:line`, the link text, and about 80 characters around it. Proposals are skipped as in `link-rewrite.ts`.
- Dry run prints every rewrite and the hash row. `--write` rewrites each reference to `--to`, or to its `--except` target by `file:line`, including same-page `](#old)` links on `--page`, and writes the hash row with `applyHashMoves` (same page, `id ≠ toId`, already allowed), so no chain forms.
- A line holding two references that mean different H3s is edited by hand after the tool and reported.
- `retarget-id` joins `SKIP_PREFIX` in `link-rewrite.ts`, gets tests beside `move-heading.test.ts`, and a short section in [restructure-sittings.md](../../meta/procedures/restructure-sittings.md) (*Split an H3 on its page* `{#split-heading}`): split by hand, then `retarget-id --list`, then `--write` with exceptions.

### What the build already catches

- Hand-written cheat-sheet rows must link to a section holding their forms (`lint-cheat-sheets.ts`), so a sorry row retargeted to `#thanks` fails the build: retarget it as an exception.
- Checkpoint coverage is per construction family, not per H3, so splits don't fail it. The split unit still checks that each new H3 has a Practice item ([drills as a check](../../meta/grammar-docs.md#beginner-stage-shape)) and reports any that has none.

## Worklist

From `npm run page-lines` on 2026-11-18. **Refs** counts references to `page#id` in `docs` (not proposals), `src`, `data`, `scripts`, `AGENTS.md`; about 1,150 in all. *=H1*: the H3 repeats the page title.

| Unit | Page | Band | Teach lines | Current id | Refs | H3 now |
|------|------|------|------------:|------------|-----:|--------|
| A1 | `beginner/label-seams.md` | B | 196 | `label-reach` | 42 | Label reach |
| A1 | `beginner/already-still-yet.md` | B | 95 | `phasal` | 95 | Already, still, not yet, no longer |
| A1 | `beginner/extra-noun-hooks.md` | B | 73 | `extra-noun-stacked-vowels-and-loose-m` | 15 | *On*, *through*, *using*, and *near* |
| A1 | `beginner/firm-soft.md` | B | 72 | `speech-act` | 26 | Speech act: firm and soft |
| A1 | `beginner/intention.md` | B | 52 | `plan-predict` (`<a id>`) | 32 | Plan |
| A2 | `beginner/thanks-and-sorry.md` | B | 48 | `thanks-sorry` | 22 | Thanks and sorry *=H1* |
| A2 | `beginner/ought-for-a-sake.md` | B | 42 | `prescription-the-ought-this-act-for-this-sake` | 5 | Should do it for a sake |
| A2 | `beginner/fault.md` | B | 39 | `fault` | 29 | Fault *=H1* |
| A2 | `beginner/clause-sequence.md` | B | 24 | `clause-sequence` | 6 | Sequence (`-n`, clause only) |
| A2 | `beginner/left-bound-adjectives.md` | B | 24 | `left-bound-adjectives` | 21 | Adjectives before the noun |
| A2 | `beginner/no-subject.md` | B | 16 | `no-subject` | 4 | Leaving out who acts *=H1* |
| A2 | `advanced/initials.md` | A | 28 | `initials` | 11 | Initials *=H1* |
| A2 | `advanced/nested-dependents.md` | A | 24 | `nested-dependents` | 6 | Nested dependents *=H1* |
| A3 | `intermediate/holder.md` | I | 204 | `holder` | 124 | Whose view (holder) |
| A3 | `intermediate/tone-marks.md` | I | 162 | `tone-marks` | 60 | Tone marks *=H1* |
| A3 | `intermediate/number-roles.md` | I | 112 | `number-as-roles` | 4 | Number as verb / adverb / interjection / discourse |
| A3 | `intermediate/dated-channel.md` | I | 92 | `dated-channel` | 28 | Dated channel (signed offset) |
| A3 | `advanced/named-phrases.md` | A | 21 | `named-phrase-n` | 0 | A set phrase as one name |
| A4 | `intermediate/tag-pronouns.md` | I | 112 | `tag-pronouns` | 59 | Tag pronouns *=H1* |
| A4 | `intermediate/try.md` | I | 77 | `try` | 23 | Try *=H1* |
| A4 | `intermediate/of-relations.md` | I | 74 | `of-relations` | 57 | Of relations |
| A4 | `intermediate/because-and-iff.md` | I | 72 | `only-because` | 28 | Because, iff, and only because |
| A4 | `intermediate/conversation-length.md` | I | 72 | `conversation-length` | 22 | Saying how long you can talk |
| A4 | `intermediate/mirative.md` | I | 70 | `mirative` | 35 | *It turns out* |
| A4 | `intermediate/very-and-slightly.md` | I | 56 | `degree-w` | 7 | How much: degree words |
| A5 | `intermediate/residue-and-former.md` | I | 72 | `residue-and-former-climate` | 23 | Residue and former climate |
| A5 | `intermediate/scope-islands.md` | I | 69 | `scope-islands` | 41 | Scope islands *=H1* |
| A5 | `intermediate/cause.md` | I | 63 | `cause` | 24 | CAUSE *=H1* |
| A5 | `intermediate/list-verbs.md` | I | 50 | `list-verbs` | 33 | List verbs *=H1* |
| A5 | `intermediate/join-relations.md` | I | 43 | `join-relations` | 64 | Join-relations |
| A5 | `intermediate/longer-chains.md` | I | 42 | `complex-chaining` | 14 | Complex chaining |
| A5 | `intermediate/abstract-landmarks.md` | I | 39 | `abstract-landmarks` | 5 | Abstract landmarks |
| A5 | `intermediate/speech-manner.md` | I | 30 | `speech-manner` | 8 | Speech manner |
| A6 | `advanced/stance-bars.md` | A | 139 | `stance-bars` | 31 | Every bar |
| A6 | `advanced/generations.md` | A | 89 | `ordinal-generation` | 14 | Counting inside one level of a family or outline |
| A6 | `advanced/usually-vs-must.md` | A | 78 | `generalization` | 23 | Channels on a generalization |
| A6 | `advanced/stand-in-roles.md` | A | 57 | `stand-in-roles` | 24 | Lexicalized stand-ins in other roles |
| A6 | `intermediate/vague-amounts.md` | I | 34 | `vague-amounts` | 14 | Vague amounts |
| A6 | `advanced/universality.md` | A | 31 | `mood-on-adjective` (`<a id>`) | 2 | Mood on one adjective *=H1* |
| A6 | `intermediate/exactly-like.md` | I | 24 | `exactly-like` | 12 | Exactly like |
| A6 | `intermediate/place-name-roots.md` | I | 20 | `place-name-roots` | 9 | Place-name roots *=H1* |

Split units in phases 2 and 3 take the pages their triage unit marked **split**, in the same groups: S1 from A1, S2 from A2, and so on.

## Implementation plan

The work runs through subagents: 41 pages in clusters that share little, a triage that needs a fresh context, and a style review that must not have made the changes. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

### Phases

| Phase | Units | Ends with |
|-------|-------|-----------|
| 1 | P1, T1, A1–A6 | The triage table in this proposal (per page: split or exempt, new H3 titles and ids, the default target), for the user to approve. Cut here: the user decides before any page changes |
| 2 | S1, S2, S3 | Beginner pages and the long Intermediate pages split, green build |
| 3 | S4, S5, S6, K, Y | Every split done, any Practice top-ups, style review; the proposal is deleted |

### Units

**P1: policy text.** *Orchestrator.* Put the [policy text](#policy-text) into [one sitting](../../meta/grammar-docs.md#one-sitting).
May edit: `docs/meta/grammar-docs.md`.

**T1: `retarget-id` tool.** `proposal-worker`, `model: opus`, effort `medium`.
Build `npm run retarget-id` per [links and old URLs](#links-and-old-urls): the script, its `package.json` entry, its `SKIP_PREFIX` entry, tests, and the *Split an H3 on its page* section in `restructure-sittings.md`. Check it with a dry run on `thanks-and-sorry.md`, removing the old id in a scratch copy only; do not write.
May edit: `scripts/retarget-id.ts`, `scripts/lib/retarget-id*.ts`, `scripts/lib/link-rewrite.ts`, `package.json`, `docs/meta/procedures/restructure-sittings.md`.

**A1–A6: triage.** `proposal-worker`, a fresh one per unit, `model: opus`, effort `high`.
Triage the unit's pages from [the worklist](#worklist). Read each page's teach body, not its Practice, and decide **split** or **exempt** per [what counts as one thing](#what-counts-as-one-thing). For a split page, give each new H3's title and id, the line where it starts, and the default target for the old id. For an exempt page, give one clause saying why.
May edit: nothing.

**S1–S6: splits.** `proposal-worker`, a fresh one per unit, `model: opus`, effort `high`.
For each **split** page in the matching triage group, add the approved H3s and ids, remove the old heading id and any `<a id>` under it, and write the seam lead where one is needed ([headings and ids](#headings-and-ids)). Run `retarget-id --list`, choose the exceptions from the linking sentences, then run it with `--write`. Check that each new H3 has a Practice item, and report the ones that don't.
May edit: the unit's pages, the files `retarget-id` writes, any line holding a double reference, and cheat-sheet row links the build flags.

**K: Practice top-up.** `checkpoint-writer`, a fresh one per one to three sittings, `model: opus`, effort `high`.
Add 1–3 items for each new H3 that S1–S6 reported without one, keeping the checkpoint's setting and bank. Skip the unit when none were reported.
May edit: the named sittings' `### Practice`.

**Y: style review.** `style-editor`, fresh, `model: opus`, effort `high`.
Review only the new H3 headings and the first paragraph under each new H3 after the first on every split page, as listed in the S reports. Do not review sections whose only change is a link `retarget-id` rewrote, and do not use the whole `changed-sections` list: it holds every page with a rewritten link.
May edit: those headings and paragraphs.

Order: P1 → T1 → A1–A6 (in sequence; any order). The orchestrator copies each triage report into a **Triage** table in this proposal, under [the worklist](#worklist), and ends phase 1. Phase 2: S1 → S2 → S3. Phase 3: S4 → S5 → S6 → K → Y. S units run one at a time: links and `hash-redirect.ts` are shared. After Y, run `npm run cheat-sheet-blocks -- --write` (a fenced commit if it changes anything) and the final gate, then delete this proposal.

A triage finding that a page should move, peel, or merge, or that its title no longer fits, is logged under Open decisions and the page is left as it is.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This changes headings, ids and links only: never change a form, a reading, a table row, or what the parser accepts. Prose changes only at a seam a new heading makes: at most one lead sentence, replacing a transition that leaned on the paragraph above.
> - Split a sitting's single H3 only when it teaches two or more things the learner tells apart, each with its own worked example. One form whose later lines extend it (more table rows, a consequence, a contrast) is exempt. Never split a pointer from its table, and never give a lone **Compare with** its own H3. Usually two H3s; more only when each part passes the test alone.
> - New headings: learner words, never the H1 again; each pins an English `{#id}` that is not the old id and contains no Ageben spelling. Remove the old heading id and any `<a id>` line under it.
> - Links: `npm run retarget-id -- --page P --id OLD --to DEFAULT --list`, then decide each reference from its sentence; references meaning another new H3 go in `--except file:line=id`. Then `--write`. Never retarget a link with sed or by bulk replace; edit by hand only a line holding two references that mean different H3s, and report it.
> - A cheat-sheet row the build flags gets the id of the section that holds its forms.
> - Check that each new H3 has at least one Practice item; do not write Practice. Report the ones without.
> - Check forms you touch with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call).
> - Read slices: `npm run page-lines -- --headings P` first, then the ranges you need. Scripted edits go in a file under `tmp/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met. A page that should move, peel, or merge, or be retitled, is a skip with a reason, not an edit.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **ids** (per page: old → new list, default target, exception count), **new headings** (page#id for each H3 after the first, for the style review), **files touched** (count), **no Practice item** (page#id), **hand-edited lines**, **AGENTS.md Owns lines** (expected none), **verify** line, **skips** with reasons, **left**, **inefficient**. Triage units report instead one row per page: page, **split** / **exempt**, new H3s as `title {#id} @line`, default target, or the exempt reason.

### Gates

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` with no new errors before each unit's commit.
- T1: `npm test` green.
- End of phase 2 and phase 3: a clean `npm run build` (grammar pages changed). The phase 3 final gate is a full `npm run verify` against an empty baseline; don't rerun build or tests after it.
- No recall gate: no `say-*.md`, `english.md` or `src/english-helper/` edits are planned. If `retarget-id` rewrites links in those files, run `npm run english-helper-recall -- --check` at that phase's end and record it in Status.

### Commits

Messages start `split-single-h3-sittings <ID>:`, then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files.

- Phase 1: P1, T1, the consolidated proposal with the triage table (3).
- Phase 2: S1, S2, S3, the consolidated proposal (4).
- Phase 3: S4, S5, S6, K (if any), Y, `cheat-sheet-blocks --write` (if it changes anything), the proposal's deletion (5–7).

An S unit with no **split** pages makes no commit.

## Open decisions

None block phase 1. The triage table at the end of phase 1 is the decision for phases 2 and 3: the user approves or edits each row before S1 starts.
