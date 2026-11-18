# Split single-H3 sittings

**Status:** IN PROGRESS. Phase 1 done 2026-11-18: the policy is in [one sitting](../../meta/grammar-docs.md#one-sitting) (**Lower bound** and **Signals**), `npm run retarget-id` exists ([split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading)), and all 41 single-H3 sittings are triaged: 18 split, 23 exempt (exempt pages keep their ids). Settled 2026-11-18: the old heading id is never kept; each link goes to the H3 it means; one hash row sends the old URL to the default target. The style review (Y) covers only new headings and seam leads. Phase 2 done 2026-11-18: S1, S2, S3 (8 pages split, 9 commits); green verify; `english-helper-recall --check` passed. Next: phase 3 (S4).

**Related:** [one sitting](../../meta/grammar-docs.md#one-sitting), [unique ids](../../meta/grammar-docs.md#unique-ids), [retie-safe writing](../../meta/grammar-docs.md#retie-safe-writing), [split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading), [drills as a check](../../meta/grammar-docs.md#beginner-stage-shape), [`hash-redirect.ts`](../../grammar/.vitepress/lib/hash-redirect.ts).

**Depends on:** none.

**Design authority:** *none*. Headings, ids and links only: no form, reading, or parser behavior changes. Teaching prose changes only at the seams a new heading makes.

## Triage

From the A1–A6 triage units, 2026-11-18. Line numbers are those of the unsplit page that day; an S unit finds each seam by its content if the line has drifted. *Raise* means an existing H4 becomes the H3 and keeps its id. Paths are under `docs/grammar/`.

### Split

| Unit | Page | New H3s, in order: title `{#id}` @line | Default target | Notes |
|------|------|------------------------------------------|----------------|-------|
| S4 | `intermediate/tag-pronouns.md` | Naming with a tag `{#naming-with-a-tag}` @9; Two tags at once `{#tag-pairs}` @81 (raise the H4 at 79) | `naming-with-a-tag` | The closing **Compare with** at 111 stays at the page end. |
| S4 | `intermediate/try.md` | Saying someone tries `{#trying}` @10 (drop `<a id="attempt">`; the endings H4 stays under it); Failing that: a backup `{#fallback}` @50 (raise the H4 at 47; keep `<a id="or-else">`) | `trying` | The **Compare with** at 74 stays where it is. |
| S4 | `intermediate/because-and-iff.md` | Choosing the hinge `{#choosing-a-hinge}` @12; Unless and even if `{#unless-and-even-if}` @52 | `choosing-a-hinge` | Triage says drop the `<a id>` lines for because, iff and hinges: retarget any that have refs. Line 52 needs no lead. Exceptions to `unless-and-even-if`: `cheat-sheets/why-allowed.md:33,34`, `say-reasons.md:17`. |
| S4 | `intermediate/very-and-slightly.md` | Grading a quality `{#grading-a-quality}` @9; Grading the action itself `{#grading-the-action}` @44 | `grading-a-quality` | Line 44 (*instead*) needs a seam lead. Exception: `cheat-sheets/word-shape-clause.md:165`. The existing row `longer-chains#degree-w` → `degree-w` is repointed by `retarget-id`. |
| S5 | `intermediate/residue-and-former.md` | What is still in effect `{#residue}` @12; A pattern that used to hold `{#former-climate}` @40 | `residue` | Both ids reuse the page's `<a id>` names (33 and 8 links), whose lines then go; drop `<a id="episode-standing">` (0 refs). The shared table and placement paragraph at 66–72 stay at the page end. ~6 of 15 old-id refs mean FORMER (`to-english.md:142`, `knowing-intending.md:124,142`, `scope.ts:69,331`, likely `lexicon-overlays.csv:67`). |
| S5 | `intermediate/cause.md` | What makes it happen `{#mechanism}` @10; Make someone do it `{#make}` @46 (raise) | `mechanism` | All 18 old-id refs mean part 1. Drop `<a id="cause-mood">` (0 refs). |
| S5 | `advanced/usually-vs-must.md` | A general claim and how you know it `{#general-claims}` @7; How things work, and definitions `{#how-things-work}` @59 | `general-claims` | Drop `<a id="universality-mood">` (0 refs). Line 59 needs no lead. All 5 refs mean part 1. |
| S5 | `advanced/generations.md` | Counting inside one level of a family or outline `{#generation-counting}` @7; Kin `{#kin-generations}` @38 (raise) | `generation-counting` | Drop `<a id="generation-ordinal">` (0 refs). All 10 refs are cheat-sheet number rows. |
| S6 | `advanced/stance-bars.md` | Which expectation is the bar `{#which-bar}` @7; Who sets the bar `{#who-sets-the-bar}` @60; Ranking a whole kind `{#ranking-a-kind}` @84; Ability, rules, and hopes as the bar `{#limits-and-hopes}` @102 | `which-bar` | The closing line at 138 stays at the page end. Drop `<a id>` `worse-than`, `best-effort` (0 refs). Exceptions to `limits-and-hopes`: `cheat-sheets/comparing.md` rows for as-possible, up-to-code, more-than-allowed, than-hoped, than-feared (about lines 98–102, 117–119, 121; hand-written, not generated). **No Practice item** for `ranking-a-kind`: K. |
| S6 | `advanced/stand-in-roles.md` | Verbs that name a speech act `{#speech-act-verbs}` @7; A whole sentence as the subject `{#sentence-as-subject}` @48 | `speech-act-verbs` | Move the paragraph at 56 (*The sentence after one of these verbs has its own subject…*) unchanged to just above the seam at 48: it explains part 1's verbs. Exception: `cheat-sheets/linking-clauses.md:82`. |

### Done in phase 2

Input for K and Y; the git log holds the rest.

| Page | New H3s after the first (for Y) | No Practice item (for K) |
|------|---------------------------------|--------------------------|
| `beginner/label-seams.md` | `#reach-stacks` | |
| `beginner/already-still-yet.md` | `#ever-never` | |
| `beginner/firm-soft.md` | `#act-for-now` | |
| `beginner/thanks-and-sorry.md` | `#saying-sorry` | |
| `intermediate/holder.md` | `#holder-plans-and-motives` (seam lead written), `#what-the-holder-covers` | both |
| `intermediate/tone-marks.md` | `#emphasis-and-clefts` | |
| `intermediate/number-roles.md` | `#number-as-adverb-by-marker`, `#number-as-interjection-by-marker`, `#number-as-discourse-marker-by-marker`, `#number-as-degree`, `#number-as-stance-by-marker` | `#number-as-degree` |
| `intermediate/dated-channel.md` | `#now` | |

Extra Y items:

- `firm-soft.md#act-for-now` opens with a one-sentence lead; the prose lint's `beginner-lead` warning was accepted in `src/lint/prose-style-baseline.json` (entry `beginner/firm-soft.md`). Add one lead sentence and remove that entry.
- `beginner/review.md` *Rule:* link text still uses the old heading wording: about line 351 (*Speech act: firm and soft*) and 387 (*Label reach*). The targets are right.
- `number-roles.md`: the page lead names all six roles and now sits under *A number as the action*; check that it reads as the page lead.

## Design

### Headings and ids

- Each new H3 is named for its part, in learner words, and does not repeat the H1.
- Each new H3 pins an English `{#id}`; no new id equals the old heading id ([unique ids](../../meta/grammar-docs.md#unique-ids)).
- The first new H3 opens with the page's existing lead. A later H3 opens on its own job: at most one new lead sentence at the seam, in place of a transition that leaned on the paragraph above. No other prose changes, except a move a triage row names.

### Links and old URLs

Per [split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading): `retarget-id --list`, choose exceptions from the linking sentences, then `--write`. The tool sends a whole line to one target (a `(×N)` line meaning two H3s is a hand edit), writes one hash row per removed id, and repoints existing rows that land on it. A removed `<a id>` that has references gets its own `retarget-id` run. A hand-written cheat-sheet row must link to the section that holds its forms (`lint-cheat-sheets.ts`), so a row the build flags gets that section's id.

## Implementation plan

### Phases

| Phase | Units | Ends with |
|-------|-------|-----------|
| 3 | S4, S5, S6, K, Y | Every split done, the Practice top-up, style review; the proposal is deleted |

### Units

**S4–S6: splits.** `proposal-worker`, a fresh one per unit, `model: opus`, effort `high`. Each runs in two parts so the `--write` is fenced:

- **Part A:** for each page in the unit's rows of [the triage](#triage), add the H3s and ids as the row says, remove the old heading id and the `<a id>` lines the row names, and write a seam lead only where the row asks for one ([headings and ids](#headings-and-ids)). Run `retarget-id --list` for every removed id, choose the exceptions from the linking sentences (the row's list is a start, not the whole set), confirm with a dry run, and write the `--write` commands, one per line, to a file in the scratchpad. Do not run `--write` or verify. Check that each new H3 has a Practice item. Report and stop.
- The orchestrator commits the split, runs the file, commits the tool output alone, and messages the same worker.
- **Part B:** hand-edit `(×N)` lines whose references mean different H3s, fix cheat-sheet rows the build flags and `cases.tsv` pins (below), run verify, send the full report.

May edit: the unit's pages, the files `retarget-id` writes, any line holding a double reference, cheat-sheet row links the build flags, and `src/english-helper/cases.tsv` pins.

**K: Practice top-up.** `checkpoint-writer`, fresh, `model: opus`, effort `high`.
Add 1–3 items for `stance-bars.md#ranking-a-kind`, for each H3 in the *No Practice item* column of [done in phase 2](#done-in-phase-2), and for any new H3 an S unit reports without one, keeping the checkpoint's setting and bank.
May edit: the named sittings' `### Practice`.

**Y: style review.** `style-editor`, fresh, `model: opus`, effort `high`.
Review only the new H3 headings and the first paragraph under each new H3 after the first on every split page: those in [done in phase 2](#done-in-phase-2) and those the S4–S6 reports list, plus the extra Y items there. Do not review sections whose only change is a link `retarget-id` rewrote, and do not use the whole `changed-sections` list.
May edit: those headings and paragraphs, the `review.md` link text named above, and the `firm-soft.md` entry in `src/lint/prose-style-baseline.json`.

Order: S4 → S5 → S6 → K → Y. S units run one at a time: links and `hash-redirect.ts` are shared. After Y, run `npm run cheat-sheet-blocks -- --write` (a fenced commit if it changes anything) and the final gate, then delete this proposal.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This changes headings, ids and links only: never change a form, a reading, a table row, or what the parser accepts. Prose changes only at a seam a new heading makes (at most one lead sentence, replacing a transition that leaned on the paragraph above), or where your triage row moves a paragraph unchanged.
> - Your pages' triage rows are approved: use their titles, ids and seams. Line numbers are from before any split; find each seam by its content. *Raise* means an existing H4 becomes the H3 and keeps its id.
> - New headings: learner words, never the H1 again; each pins an English `{#id}` that is not the old heading id. Remove the old heading id and the `<a id>` lines the row names.
> - Links: `npm run retarget-id -- --page P --id OLD --to DEFAULT --list`, then decide each reference from its sentence; references meaning another new H3 go in `--except file:line=id`. A removed `<a id>` with references gets its own run. Never retarget a link with sed or by bulk replace; edit by hand only a `(×N)` line whose references mean different H3s, and report it. Procedure: `docs/meta/procedures/restructure-sittings.md#split-heading`.
> - If a recipe row (`say-*.md`) moves off the default, the `link:` pins in `src/english-helper/cases.tsv` that come from it must follow; check them in part A.
> - A cheat-sheet row the build flags gets the id of the section that holds its forms.
> - Never update a lint baseline to accept a warning: report the warning and its line instead.
> - Check that each new H3 has at least one Practice item; do not write Practice. Report the ones without.
> - Check forms you touch with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call). A seam lead follows the [checklist](../../meta/doc-style.md#checklist).
> - Read slices: `npm run page-lines -- --headings P` first, then the ranges you need. Scripted edits go in a file under `tmp/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of part B (`--fast` inside it). Read only new error lines from `tmp/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met. A page that should move, peel, or merge, or be retitled, is a skip with a reason, not an edit.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **ids** (per page: old → new list, default target, exception count), **new headings** (page#id for each H3 after the first, for the style review), **files touched** (count), **no Practice item** (page#id), **hand-edited lines**, **AGENTS.md Owns lines** (expected none), **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- `npm run verify -- --baseline` at the start of the phase; `npm run verify -- --allow-generate` with no new errors before each unit's last commit.
- The final gate is a full `npm run verify` against an empty baseline; don't rerun build or tests after it.
- Recall: `retarget-id` will rewrite links in `say-*.md` (for example `say-reasons.md`). Run `npm run english-helper-recall -- --check` at the end of the phase.

### Commits

Messages start `split-single-h3-sittings <ID>:`, then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files. Each `retarget-id --write` is a [fenced rewrite](../../meta/procedures/proposals.md#fence-automated-rewrites): commit the hand split first, then the tool's output alone, then any hand fixes.

- Phase 3: S4, S5, S6 (two or three each), K, Y, `cheat-sheet-blocks --write` (if it changes anything), the proposal's deletion.

## Open decisions

None.

## Background

### Problem

41 sittings had exactly one taught H3 (`npm run page-lines`, S = 1). The site outline shows H2 and H3 ([`config.ts`](../../grammar/.vitepress/config.ts) `outline.level: [2, 3]`), so on those pages the table of contents is one line, often the page title repeated. A learner cannot see what the page teaches or jump to the second half: [thanks-and-sorry.md](../../grammar/beginner/thanks-and-sorry.md) teaches thanks and sorry, each with its own examples and table, under one heading.

### Goals

- Every sitting that teaches more than one thing has one H3 per thing, and the outline lists them.
- Every link to a removed id lands on the H3 it means; old URLs with the old hash still land on the page.

### Non-goals

- Pages that teach one thing keep their single H3. No filler headings.
- No peels, merges, or moves between pages; no sidebar changes.
- No new Practice beyond what [drills as a check](../../meta/grammar-docs.md#beginner-stage-shape) requires when a new H3 has no item.
- Reviews, recipe pages (`say-*.md`), cheat sheets, Claritish and other non-sitting pages are out of scope as split targets.
