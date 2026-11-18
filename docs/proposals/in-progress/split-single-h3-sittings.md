# Split single-H3 sittings

**Status:** IN PROGRESS. Phase 1 done 2026-11-18: the policy is in [one sitting](../../meta/grammar-docs.md#one-sitting) (**Lower bound** and **Signals**), `npm run retarget-id` exists ([split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading)), and all 41 single-H3 sittings are triaged below: 18 split, 23 exempt. Triage approved 2026-11-18, with every recommendation taken: `number-roles.md` gets six H3s; `firm-soft.md`'s `act-r` becomes `act-for-now`; only `stand-in-roles.md:56` moves (above its seam), and page-wide closing lines stay at the page end; `stance-bars.md` gets four H3s; exempt pages keep their ids, and the `intention.md` lead no longer promises a forecast shape (fixed in phase 1). Settled 2026-11-18: the old heading id is never kept; each link goes to the H3 it means; one hash row sends the old URL to the default target. The style review (Y) covers only new headings and seam leads.

**Related:** [one sitting](../../meta/grammar-docs.md#one-sitting), [unique ids](../../meta/grammar-docs.md#unique-ids), [retie-safe writing](../../meta/grammar-docs.md#retie-safe-writing), [split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading), [drills as a check](../../meta/grammar-docs.md#beginner-stage-shape), [`hash-redirect.ts`](../../grammar/.vitepress/lib/hash-redirect.ts).

**Depends on:** none.

**Design authority:** *none*. Headings, ids and links only: no form, reading, or parser behavior changes. Teaching prose changes only at the seams a new heading makes.

## Triage

From the A1–A6 triage units, 2026-11-18. Line numbers are those of the unsplit page that day; an S unit finds each seam by its content if the line has drifted. *Raise* means an existing H4 becomes the H3 and keeps its id. Paths are under `docs/grammar/`.

### Split

| Unit | Page | New H3s, in order: title `{#id}` @line | Default target | Notes |
|------|------|------------------------------------------|----------------|-------|
| S1 | `beginner/label-seams.md` | Four reach vowels `{#reach-vowels}` @9; Stacked reach `{#reach-stacks}` @103 (raise) | `reach-vowels` | Line 105 states its own job: no new lead. |
| S1 | `beginner/already-still-yet.md` | How far a change has come `{#stage-of-change}` @9; Ever and never `{#ever-never}` @80 (raise) | `stage-of-change` | Line 82 needs no lead. The endings table, MAY and adjective use stay in part 1. |
| S1 | `beginner/firm-soft.md` | Standing behind or offering softly `{#firm-or-soft-act}` @9; For now (**-r**) `{#act-for-now}` @49 (raise the H4, renaming its id `act-r`) | `firm-or-soft-act` | Run `retarget-id --id act-r --to act-for-now` as well; the cheat sheet links `act-r`. None of ~26 sampled old-id links means `-r`. |
| S1 | `beginner/thanks-and-sorry.md` | Saying thanks `{#saying-thanks}` @9; Saying sorry `{#saying-sorry}` @30 | `saying-thanks` | Line 30 states its job: no new lead. Exceptions to `saying-sorry`: `say-reasons.md:182`, `cheat-sheets/why-allowed.md:130–132,137–139`, `beginner/how-you-feel.md:125`. Hand edit: `why-allowed.md:259` (one link each). `beginner/review.md:229` stays on the default. |
| S2 | `intermediate/holder.md` | Naming whose view a sentence gives `{#naming-a-holder}` @10; Someone else's plan, aim, or motive `{#holder-plans-and-motives}` @97; What belongs to the holder `{#what-the-holder-covers}` @129 | `naming-a-holder` | Line 97 (*goes the same way*) needs a seam lead. Drop `<a id="holder-seam">` (0 refs). About 37 of ~100 refs mention plan, motive, aim, or *both*: expect exceptions to the second and third H3. |
| S3 | `intermediate/tone-marks.md` | Showing your tone with a mark `{#showing-your-tone}` @10; Singling out a word `{#emphasis-and-clefts}` @148 (raise the H4 at 146) | `showing-your-tone` | Line 148 needs no lead. |
| S3 | `intermediate/number-roles.md` | A number as the action `{#number-as-verb-by-marker}` @9; … as how often `{#number-as-adverb-by-marker}` @30; … as a shout `{#number-as-interjection-by-marker}` @50; … as a list label `{#number-as-discourse-marker-by-marker}` @69; … as a place on a scale `{#number-as-degree}` @87; … as how likely `{#number-as-stance-by-marker}` @92 (raise all six) | `number-as-verb-by-marker` | Lines 9–11 (page lead) go into the first H3. Keep the `<a id>` lines under the H4s. Old id: 4 refs, all to the whole page. |
| S3 | `intermediate/dated-channel.md` | Counting time from now `{#counting-from-now}` @11; Now and today `{#now}` @75 (raise the H4 at 73) | `counting-from-now` | Drop `<a id="ago">`, `<a id="time-offset">` (0 refs). |
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

Every new H3 has a Practice item except `stance-bars.md#ranking-a-kind`.

### Exempt

Each teaches one form or rule; what follows the first example only extends it.

- **Beginner:** `extra-noun-hooks.md` (one table holds the hooks and their `-m` forms; examples follow both), `intention.md` (one word, PLAN, graded on one scale), `ought-for-a-sake.md`, `fault.md`, `clause-sequence.md`, `left-bound-adjectives.md`, `no-subject.md`.
- **Intermediate:** `of-relations.md`, `conversation-length.md`, `mirative.md`, `scope-islands.md`, `list-verbs.md`, `join-relations.md`, `longer-chains.md`, `abstract-landmarks.md`, `speech-manner.md`, `vague-amounts.md`, `exactly-like.md`, `place-name-roots.md`.
- **Advanced:** `named-phrases.md`, `initials.md`, `nested-dependents.md`, `universality.md`.

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
| 2 | S1, S2, S3 | Beginner pages and `holder`, `tone-marks`, `number-roles`, `dated-channel` split; green build |
| 3 | S4, S5, S6, K, Y | Every split done, the Practice top-up, style review; the proposal is deleted |

### Units

**S1–S6: splits.** `proposal-worker`, a fresh one per unit, `model: opus`, effort `high`.
For each page in the unit's rows of [the triage](#triage), add the H3s and ids as the row says, remove the old heading id and the `<a id>` lines the row names, and write a seam lead only where the row asks for one ([headings and ids](#headings-and-ids)). Run `retarget-id --list`, choose the exceptions from the linking sentences (the row's list is a start, not the whole set), then `--write`. Check that each new H3 has a Practice item, and report the ones that don't.
May edit: the unit's pages, the files `retarget-id` writes, any line holding a double reference, and cheat-sheet row links the build flags.

**K: Practice top-up.** `checkpoint-writer`, fresh, `model: opus`, effort `high`.
Add 1–3 items for `stance-bars.md#ranking-a-kind` and for any new H3 an S unit reported without one, keeping the checkpoint's setting and bank.
May edit: the named sittings' `### Practice`.

**Y: style review.** `style-editor`, fresh, `model: opus`, effort `high`.
Review only the new H3 headings and the first paragraph under each new H3 after the first on every split page, as listed in the S reports. Do not review sections whose only change is a link `retarget-id` rewrote, and do not use the whole `changed-sections` list.
May edit: those headings and paragraphs.

Order: phase 2: S1 → S2 → S3. Phase 3: S4 → S5 → S6 → K → Y. S units run one at a time: links and `hash-redirect.ts` are shared. After Y, run `npm run cheat-sheet-blocks -- --write` (a fenced commit if it changes anything) and the final gate, then delete this proposal.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This changes headings, ids and links only: never change a form, a reading, a table row, or what the parser accepts. Prose changes only at a seam a new heading makes (at most one lead sentence, replacing a transition that leaned on the paragraph above), or where your triage row moves a paragraph unchanged.
> - Your pages' triage rows are approved: use their titles, ids and seams. Line numbers are from before any split; find each seam by its content. *Raise* means an existing H4 becomes the H3 and keeps its id.
> - New headings: learner words, never the H1 again; each pins an English `{#id}` that is not the old heading id. Remove the old heading id and the `<a id>` lines the row names.
> - Links: `npm run retarget-id -- --page P --id OLD --to DEFAULT --list`, then decide each reference from its sentence; references meaning another new H3 go in `--except file:line=id`. Then `--write`. A removed `<a id>` with references gets its own run. Never retarget a link with sed or by bulk replace; edit by hand only a `(×N)` line whose references mean different H3s, and report it. Procedure: `docs/meta/procedures/restructure-sittings.md#split-heading`.
> - A cheat-sheet row the build flags gets the id of the section that holds its forms.
> - Check that each new H3 has at least one Practice item; do not write Practice. Report the ones without.
> - Check forms you touch with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call). A seam lead follows the [checklist](../../meta/doc-style.md#checklist).
> - Read slices: `npm run page-lines -- --headings P` first, then the ranges you need. Scripted edits go in a file under `tmp/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met. A page that should move, peel, or merge, or be retitled, is a skip with a reason, not an edit.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **ids** (per page: old → new list, default target, exception count), **new headings** (page#id for each H3 after the first, for the style review), **files touched** (count), **no Practice item** (page#id), **hand-edited lines**, **AGENTS.md Owns lines** (expected none), **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` with no new errors before each unit's commit.
- End of phase 2 and phase 3: a clean `npm run build` (grammar pages changed). The phase 3 final gate is a full `npm run verify` against an empty baseline; don't rerun build or tests after it.
- Recall: `retarget-id` will rewrite links in `say-*.md` (for example `say-reasons.md`). Run `npm run english-helper-recall -- --check` at the end of each phase and record it in Status.

### Commits

Messages start `split-single-h3-sittings <ID>:`, then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files. Each `retarget-id --write` is a [fenced rewrite](../../meta/procedures/proposals.md#fence-automated-rewrites): commit the hand split first, then the tool's output alone, then any hand fixes.

- Phase 2: S1, S2, S3 (two or three commits each), the consolidated proposal.
- Phase 3: S4, S5, S6 (two or three each), K, Y, `cheat-sheet-blocks --write` (if it changes anything), the proposal's deletion.

## Open decisions

None. All five from phase 1 are settled on the Status line and folded into the triage rows.

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
