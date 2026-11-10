# Units

**Status:** PROPOSED, 2026-11-10. User decisions, 2026-11-10: units are cut by file size (the table below), not by taught-line counts; phase 1 is the sidebar grouping only and ships alone; later phases are not scheduled; units are collapsible; units are not numbered for now.

**Related:** [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [reading-order.test.ts](../grammar/.vitepress/lib/reading-order.test.ts), [config.ts](../grammar/.vitepress/config.ts), [learning-levels.md](../meta/learning-levels.md), [restructure-sittings.md](../meta/procedures/restructure-sittings.md), [grammar-docs.md](../meta/grammar-docs.md), [lint-forward-links.ts](../../scripts/lint-forward-links.ts), [lint-sidebar-pages.ts](../../scripts/lint-sidebar-pages.ts), [peel-band.ts](../../scripts/peel-band.ts), [peel-headings.ts](../../scripts/peel-headings.ts), [constructions.ts](../../src/parse/constructions.ts)

**Depends on:** the working-tree move of `dated-channel.md` from Advanced to Intermediate (uncommitted when this was written). The unit table assumes it has landed.

**Design authority:** *none*. Phase 1 groups and reorders sittings; it adds, removes, and changes no form or reading.

## Problem

Each band is one long flat list in the sidebar: 37 Beginner sittings, 63 Intermediate, 19 Advanced. A learner can't see where they are inside a band, what a stretch of sittings adds up to, or where a good stopping point is. Editors can't say "this assumes the people-and-pointing material" without naming sittings one by one.

## Goals

- Group the sittings of each band into **units**: named runs of consecutive sittings, each with one theme a learner can name.
- Show units as nested groups inside each band in the sidebar.
- Keep every hard dependency satisfied: the learning-order lints stay green after the reorder.
- Keep the change small enough to ship alone (phase 1).

## Non-goals (phase 1)

- Unit intro pages or blocks, unit summaries, unit capstone practice.
- Vocabulary slices or any change to the `core` column.
- Changes to checkpoints, beyond dropping an item that the reorder makes leak.
- New sittings, splits, or band moves. A sitting that is too heavy (for example `evidentiality.md`) is a separate restructure.
- Units for the Claritish track, the recipe track, or the cheat sheets.

## What a unit is

These principles go into [learning-levels.md](../meta/learning-levels.md) in phase 1 (step 5), so they outlive this proposal.

1. **Within one band, consecutive.** A unit never crosses a band boundary, and its sittings are adjacent in the reading order. The level review stays last in its band, outside every unit.
2. **Named for what the learner can do.** The title is a plain-English capability or theme (*Asking*, *Where and when*), not a subsystem name or a term from [terminology.md](../grammar/terminology.md).
3. **Comparable size.** As measured by combined file size, a unit holds about 20k to 50k of Markdown, normally 3 to 6 sittings. A unit far above its neighbours is two units, and one far below joins a neighbour. Two-sitting units are avoided.
4. **Dependency first.** The [order inside a band](../meta/learning-levels.md#order-inside-a-band) rules still decide order. Units replace the *topic cluster* tie-break: sittings of one unit sit together, and units are ordered by the dependencies between their sittings.
5. **Adds no forms.** A unit is an organizing layer. Everything taught stays on the sittings.

## Unit table

Sizes are combined file sizes on 2026-11-10. Sitting order inside a unit, and unit order inside a band, are worked out in step 2. The order below is a starting point, not a commitment.

### Beginner

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Sounds and words | phonology, word-endings, compounds | 24k |
| 2 | First sentences | clause, no-subject, left-bound-adjectives, predication, label-seams | 36k |
| 3 | Pointing at people | pronouns, plurality | 26k |
| 4 | Who does what to whom | roles, relations, social-ties | 30k |
| 5 | Talking together | speech-moves, firm-soft, questions, fill-ask-jobs, thanks-and-sorry | 37k |
| 6 | Where, when, how often | hooks, extra-noun-hooks, here-there, restrictors, already-still-yet | 42k |
| 7 | Linking ideas | joins, dependents, clause-sequence, spans | 48k |
| 8 | Why and what for | causation, fault, sakes, ought-for-a-sake | 33k |
| 9 | Wanting, being able, knowing | intention, can-and-cant, knowing | 24k |
| 10 | Counting and comparing | numbers, digit-strings, comparatives | 22k |

Unit 3 is the one two-sitting unit. It was kept because the 59k *People and things* unit splits most cleanly there. If step 2 finds one more sitting that belongs with it, move that sitting in.

### Intermediate

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Names and spelling | phonotactics, letter-names, proper-names, place-name-roots, compound-families, conversation-length | 35k |
| 2 | Fuller sentences | very-and-slightly, longer-chains, label-reach, topic | 26k |
| 3 | Keeping track of who | resume-sense, tag-pronouns, collectives | 30k |
| 4 | Conversation craft | more-turn-words, speech-manner, tone-marks, polar-inventory, fill-ask-roles | 41k |
| 5 | Feelings and choices | feelings, permission-consent, want-and-decide, try | 43k |
| 6 | How you know | evidentiality, holder, dated-channel | 45k |
| 7 | Surprise and what's not so | mirative, notional, residue-and-former, contrary-to | 25k |
| 8 | Causes and stakes | because-and-iff, cause, for-a-sake, bars | 32k |
| 9 | Places and viewpoint | locative-relations, viewpoint, role-parts, abstract-landmarks | 34k |
| 10 | Likeness and connection | of-relations, exactly-like, same-role-words | 19k |
| 11 | Setting the scene | in-clause-hooks, discourse-hooks, more-occasions, ranges | 36k |
| 12 | Lists of things | list-structure, rank-joins, set-joins, universals-domains | 38k |
| 13 | Joining actions | verb-and-stance-joins, list-verbs, join-relations | 28k |
| 14 | Across sentences | sentence-linkers, more-hinges, stand-in-vowels, scope-islands, spans-as-words, quote-contents | 45k |
| 15 | Number forms | number-markers, number-roles, digitless-exponents | 39k |
| 16 | Measuring and ranking | measures-and-percent, vague-amounts, comparative-arity | 26k |

### Advanced

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Fine shades of knowing | universality, usually-vs-must, as-of, stance-bars | 32k |
| 2 | Deep structure | nested-dependents, stand-in-roles, span-nesting, hooked-joins, join-limits, named-phrases | 39k |
| 3 | Number values | stacked-markers, special-values | 25k |
| 4 | Number-built words | open-ranges, initials, generations, numeric-derivation | 39k |
| 5 | Building words and voice | root-tails, hook-compounds, singability | 26k |

Advanced unit 3 is also two sittings. `special-values.md` (20k) carries it. Folding it into unit 4 would make a 64k unit.

## Design

### Data

[reading-order.ts](../grammar/.vitepress/lib/reading-order.ts) becomes the one source of units. Each band's list changes from a flat array of links to an array of units:

```ts
type Unit = { text: string; items: LessonLink[] }
export const beginnerUnits: Unit[] = [ { text: 'Sounds and words', items: [...] }, ... ]
export const beginnerLessons = beginnerUnits.flatMap((u) => u.items)
```

`beginnerLessons`, `intermediateLessons`, `advancedLessons`, `readingOrder`, `lessonPages`, `pathPages`, and `pageRelPath` keep their current shapes and meaning: flat, in reading order. Everything that reads them (lints, flashcards, checkpoint packs, the grammar map, `llms.txt`, the game build) keeps working unchanged and simply sees the new order.

`sidebarGroups` nests the units: each band group's `items` is its units as VitePress sub-groups, followed by the level review as a plain link. `readingOrder` must flatten from the unit arrays, not from `sidebarGroups[n].items`, which now holds groups.

### Sidebar

Each band stays a collapsed group. Inside it, each unit is a collapsed sub-group titled with the unit name, with no number. The unit holding the active page opens. Page titles, URLs, files, and `band:` front matter don't change.

### Order

Making units contiguous reorders sittings within each band; the current order interleaves themes. Two lints check the result:

- `lint:ageben`: no example uses a construction whose home section comes later ([learning-order check](../meta/learning-levels.md#learning-order-check)).
- `lint:forward-links`: no stage-page link points later on the path.

The reorder is planned from the dependencies, not by trial and error (step 2). When a unit can't be made contiguous without breaking a hard dependency, the fix order is:

1. Reorder within the unit, or reorder units within the band.
2. Move the blocking sitting to the neighbouring unit it depends on or feeds, and record the change in this proposal's unit table.
3. For a **forward link** only: rewrite or drop the link per [teach now](../meta/grammar-docs.md#teach-now-dont-preview-later). That's a prose edit, not a form change.
4. Anything else, such as an example that needs rewriting with earlier forms, or a section that would have to move, is logged under [open decisions](#open-decisions). The sitting stays where the lints allow, and the run continues.

A checkpoint item that leaks after the reorder (it uses a word or form now taught later) is dropped, not rewritten, per [how to apply](../meta/learning-levels.md#how-to-apply).

### Tools that append sidebar rows

`peel-band` and `peel-headings` append a sidebar row to a band list. With units, they append to a unit: by default the parent sitting's unit, directly after the parent; with `--unit "<title>"`, to the end of that unit instead. [restructure-sittings.md](../meta/procedures/restructure-sittings.md) gets one line saying so.

## Implementation plan

Phase 1 runs in one session with no subagents. It touches one data file, two scripts, a test, and two meta notes, plus whatever small prose fixes the reorder needs. If the user says to stop partway, the agent [consolidates the proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends. Findings that change the plan [stop and alert](../meta/procedures/proposals.md#stop-and-alert).

### Phase 1: units in the sidebar

0. **Baseline.** `npm run verify -- --baseline`.
1. **Structure, no reorder.** Add the `Unit` type and unit arrays to `reading-order.ts`, derive the flat lists, and nest `sidebarGroups`. In this step, each band temporarily holds one unit containing its current list, so the reading order is unchanged. Update `reading-order.test.ts`: units are non-empty, every sitting appears in exactly one unit, flat lists equal the flattened units, and the review is last and outside every unit. Update `peel-band` and `peel-headings` per [tools](#tools-that-append-sidebar-rows). Gate: `npm run verify` shows no new errors. Commit.
2. **Dependency map.** Before editing the order, produce a sitting-to-sitting hard-dependency list for each band: for every construction use in a stage page, record the page that is the construction's home (from `constructions.ts`), and do the same for every link between stage pages. If `lint-forward-links --order-report` or `lint:ageben` already give this, use their output. Otherwise add a `--deps` report flag to `lint-ageben-docs.ts` that prints `user-page → home-page` pairs. Keep the output in the scratchpad, not the repo.
3. **Order and fill units.** For each band, choose an order of the [unit table](#unit-table) that satisfies the dependency map, following the spine and tie-breaks of [order inside a band](../meta/learning-levels.md#order-inside-a-band). Write it into `reading-order.ts`. Apply the [fix order](#order) to anything that doesn't fit, and update the unit table in this proposal so it matches what shipped.
4. **Lints green.** `npm run build` and `npm test`. Fix forward links and checkpoint leaks as the [order](#order) section allows; log the rest. Gate: `npm run verify` shows no new errors.
5. **Meta notes.** In [learning-levels.md](../meta/learning-levels.md), add a `## Units` section with the five [principles](#what-a-unit-is). In [order inside a band](../meta/learning-levels.md#order-inside-a-band), change tie-break 3 to say units are kept contiguous and ordered by dependency. Add the peel-tool line to [restructure-sittings.md](../meta/procedures/restructure-sittings.md). Group the generated heading map (`docs/meta/grammar-map.md`, from `npm run grammar-map -- --write`) by unit within each band. In `AGENTS.md`, extend the one sentence under **Grammar** that says where stage pages sit, so it also says they are grouped into units in `reading-order.ts`. Leave the topic-family table unchanged, and don't list units in `AGENTS.md` ([agents-md](../meta/agents-md.md): no duplicate indexes, nothing a restructure would force you to edit). Commit.
6. **Check the site.** Run the dev server and confirm the nested sidebar, prev/next across unit boundaries, and that the active page's unit opens.

Commits are made per [commits](../meta/procedures/proposals.md#commits), each with `[skip-cd]`: one after step 1, and one after steps 3 to 5.

### Later phases (not scheduled)

Recorded so phase 1 doesn't block them. Each needs its own go-ahead.

- **Unit intro block.** A short generated block at the top of a unit's first sitting, or a sidebar tooltip, giving the unit's title, what it lets the learner do, and which units it assumes. No unit summary page.
- **Unit capstone practice.** One `### Practice` per unit, on its last sitting, that combines the unit's sittings. Policy goes in [translation-exercises.md](../meta/translation-exercises.md).
- **Vocabulary slices.** Each unit introduces a themed slice of `core` vocabulary that its sittings and checkpoints use. Checkpoint word banks draw on the current unit and the units before it.
- **Purpose thread.** Check that each band's units carry its purpose-bearing sittings early, per tie-break 4. This is not a per-unit requirement.

## Open decisions

None. Collapsing and numbering were settled on 2026-11-10 (see **Status**).
