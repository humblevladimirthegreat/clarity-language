# Units

**Status:** PROPOSED, 2026-11-10. User decisions, 2026-11-10: units are cut by file size, not by taught-line counts; phase 1 is the sidebar grouping only and ships alone; later phases are not scheduled; units are collapsible; units are not numbered for now. Revised 2026-11-10 after a dependency analysis (`lint:ageben -- --deps`): the unit table below replaces the first draft, and its order is the one the analysis supports.

**Related:** [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [reading-order.test.ts](../grammar/.vitepress/lib/reading-order.test.ts), [config.ts](../grammar/.vitepress/config.ts), [learning-levels.md](../meta/learning-levels.md), [restructure-sittings.md](../meta/procedures/restructure-sittings.md), [grammar-docs.md](../meta/grammar-docs.md), [lint-ageben-docs.ts](../../scripts/lint-ageben-docs.ts), [construction-order.ts](../../src/lint/construction-order.ts), [lint-forward-links.ts](../../scripts/lint-forward-links.ts), [lint-sidebar-pages.ts](../../scripts/lint-sidebar-pages.ts), [peel-band.ts](../../scripts/peel-band.ts), [peel-headings.ts](../../scripts/peel-headings.ts), [constructions.ts](../../src/parse/constructions.ts)

**Depends on:** none.

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

## Dependency analysis

`npm run lint:ageben -- --deps` prints every page-to-page dependency in the reading order, one tab-separated row per pair: a page that uses constructions homed on another page (with counts per construction ID), or links to it (with line numbers). A use whose home comes later fails `lint:ageben`. A link that points later fails `lint:forward-links`, but a link can be fixed by a prose edit, while a use needs an example rewritten.

For a candidate unit table, the check is: order the units, keep each unit's sittings in their current relative order (the current order satisfies every dependency, so this is always valid inside a unit), and count the dependencies that now point to a later sitting. The first draft of the table broke these:

| Band | First-draft table, its own order | First draft, best unit order | Revised table below |
|------|-----|-----|-----|
| Beginner | 1,410 | 717 | 6 uses, 3 links |
| Intermediate | 171 | 61 | 1 use, 2 links |
| Advanced | 4 | 0 | 0 |

Counts are uses plus links. No reorder of the first-draft Beginner units could work: the problems were sittings in the wrong unit.

### What forced the changes

**Beginner**

- `speech-moves` is a hub. The vowel-series join and turn words (`word.family.joinMarker`) are homed there and used by 13 sittings in 7 units: `joins` 126 uses, `dependents` 50, `spans` 30, `causation` 24, `clause-sequence` 18, `ought-for-a-sake` 15, `fault` 13, and others. It moves into *First sentences*.
- `compounds` can't open the band. It uses `clause` (58), `joins` (44), `sakes` (19: mid-word `x` is homed at `sakes.md#met`), `predication` (13), and `roles` (3). It moves to *Who does what to whom*, next to role compounds.
- `label-seams` can't be in *First sentences*. It uses `sakes` (43), `roles` (41), `restrictors` (12), and `joins` (7). It moves to *Who does what to whom*.
- `predication` uses `pronouns` (8), and `left-bound-adjectives` uses `predication` (3). Both move after `pronouns` and `plurality`, which ends the old two-sitting *Pointing at people* unit. It is renamed *Pointing and describing*.
- *Talking together* has to come late. `questions` uses `joins` (198: and-lists and `u` negation), `fill-ask-jobs` uses `joins` (164) and `hooks` (95), and `thanks-and-sorry` uses `sakes` (102). See [open decisions](#open-decisions).

**Intermediate**

- `bars` uses `comparative-arity` (17) and `evidentiality` (8), and `vague-amounts` uses `bars` (10). It moves into *Measuring and ranking*, between `comparative-arity` and `vague-amounts`; *Causes and stakes* keeps three sittings.
- `compound-families` uses `viewpoint` (2 uses, 3 links) and `feelings` (1 use). It moves from *Names and spelling* to *Places and viewpoint*.
- `want-and-decide` uses `contrary-to` (9: the zone hook and the held reading). It moves to *Surprise and what's not so*.
- `dated-channel` uses `bars` (1) and links to `measures-and-percent` and `residue-and-former`. It moves from *How you know* to *Surprise and what's not so*.
- `topic` sits inside a loop: it uses `stand-in-vowels` (2) and links to `sentence-linkers`, while `quote-contents` (5), `spans-as-words` (2), and `collectives` (1) use `topic`. It moves into *Across sentences*. At 59k that unit was too big, so it splits: *Across sentences* keeps the linkers, hinges, stand-ins, and `topic`; `scope-islands`, `spans-as-words`, and `quote-contents` become *Quoting and mentioning*.

**Advanced**

- `hooked-joins` (in *Deep structure*) uses `hook-compounds` (2 uses, 2 links). Putting *Deep structure* last clears it. *Number values* and *Number-built words* depend on each other heavily (`special-values` alone has 104 uses and links with unit 4), so they stay adjacent.

### Limits

The report sees only dependencies that show up as a traced construction or a link. A page that relies on an earlier page's idea in prose, with no Ageben example and no link, is invisible to it. Edges into `phonology` and `word-endings` come from parser productions that nearly every example uses; they are real but never constrain order, since those sittings come first. Homes are registry choices (`constructions.ts`): a family's home is where it is first taught today, so moving a sitting earlier than a family's home can need the anchor moved too (for example mid-word `x` if `compounds` ever came before `sakes`).

## Unit table

Sizes are combined file sizes on 2026-11-10. Unit order and sitting order inside each unit are the analysed order. Sittings inside a unit keep their current relative order.

### Beginner

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Sounds and words | phonology, word-endings | 17k |
| 2 | First sentences | clause, no-subject, speech-moves | 22k |
| 3 | Pointing and describing | pronouns, plurality, predication, left-bound-adjectives | 40k |
| 4 | Linking ideas | dependents, joins, spans, clause-sequence | 49k |
| 5 | Where, when, how often | hooks, restrictors, extra-noun-hooks, here-there, already-still-yet | 43k |
| 6 | Why and what for | causation, sakes, fault, ought-for-a-sake | 34k |
| 7 | Who does what to whom | relations, roles, compounds, social-ties, label-seams | 51k |
| 8 | Wanting, being able, knowing | knowing, intention, can-and-cant | 24k |
| 9 | Talking together | questions, firm-soft, fill-ask-jobs, thanks-and-sorry | 29k |
| 10 | Counting and comparing | numbers, comparatives, digit-strings | 23k |

Still broken in this order:

- `restrictors` uses a polar starter from `questions` (3 uses).
- `ought-for-a-sake` uses soft force from `questions` (2 uses).
- `fault` uses an overlay homed on `knowing` (1 use, 1 link).
- `pronouns` links to `dependents`, and `already-still-yet` links to `sakes`.

Unit 1 is two sittings, unit 7 is just over 50k, and Talking together comes late: see [open decisions](#open-decisions).

### Intermediate

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Names and spelling | phonotactics, letter-names, proper-names, place-name-roots, conversation-length | 29k |
| 2 | Fuller sentences | longer-chains, very-and-slightly, label-reach | 14k |
| 3 | Conversation craft | more-turn-words, speech-manner, tone-marks, polar-inventory, fill-ask-roles | 42k |
| 4 | Across sentences | sentence-linkers, more-hinges, stand-in-vowels, topic | 39k |
| 5 | Keeping track of who | resume-sense, tag-pronouns, collectives | 32k |
| 6 | Lists of things | list-structure, rank-joins, set-joins, universals-domains | 38k |
| 7 | Joining actions | verb-and-stance-joins, list-verbs, join-relations | 29k |
| 8 | Causes and stakes | because-and-iff, cause, for-a-sake | 22k |
| 9 | Feelings and choices | feelings, permission-consent, try | 30k |
| 10 | Quoting and mentioning | spans-as-words, quote-contents, scope-islands | 20k |
| 11 | Number forms | number-markers, number-roles, digitless-exponents | 40k |
| 12 | How you know | evidentiality, holder | 37k |
| 13 | Setting the scene | in-clause-hooks, discourse-hooks, more-occasions, ranges | 37k |
| 14 | Places and viewpoint | abstract-landmarks, locative-relations, viewpoint, role-parts, compound-families | 40k |
| 15 | Likeness and connection | of-relations, exactly-like, same-role-words | 20k |
| 16 | Measuring and ranking | measures-and-percent, comparative-arity, bars, vague-amounts | 38k |
| 17 | Surprise and what's not so | contrary-to, residue-and-former, dated-channel, mirative, notional, want-and-decide | 47k |

Still broken in this order:

- `bars` uses an overlay homed on `residue-and-former` (1 use).
- `topic` links to `tag-pronouns`, and `ranges` links to `locative-relations`.

Unit 2 is small and unit 12 is two sittings: see [open decisions](#open-decisions).

### Advanced

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Fine shades of knowing | universality, usually-vs-must, as-of, stance-bars | 32k |
| 2 | Number values | stacked-markers, special-values | 25k |
| 3 | Number-built words | open-ranges, initials, generations, numeric-derivation | 39k |
| 4 | Building words and voice | root-tails, hook-compounds, singability | 26k |
| 5 | Deep structure | nested-dependents, stand-in-roles, span-nesting, hooked-joins, join-limits, named-phrases | 39k |

Nothing is broken in this order. Unit 2 is two sittings: `special-values.md` (20k) carries it, and folding it into unit 3 would make a 64k unit.

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

Two lints check the result:

- `lint:ageben`: no example uses a construction whose home section comes later ([learning-order check](../meta/learning-levels.md#learning-order-check)).
- `lint:forward-links`: no stage-page link points later on the path.

The [unit table](#unit-table) was planned from `lint:ageben -- --deps` ([dependency analysis](#dependency-analysis)), and each band lists what it still breaks. Those items, and anything new from changes made since 2026-11-10, are fixed in this order:

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
2. **Recheck the dependency map.** Run `npm run lint:ageben -- --deps > <scratchpad>/deps.tsv` on the current tree and compare it against the [unit table](#unit-table): every row whose two pages sit in one band, with the home page in a later unit (or later in the same unit), is a break. The breaks should be the ones the table lists. A new break means a sitting was added, moved, or edited since 2026-11-10; fit it in with the [fix order](#order). A sitting not in the table (a new peel, a band move) goes in the unit of its parent or neighbour. Keep the output in the scratchpad, not the repo.
3. **Order and fill units.** Write the unit table into `reading-order.ts`, in its order, with the open decisions applied as the user settled them. Fix the listed breaks with the [fix order](#order), and update the unit table in this proposal so it matches what shipped.
4. **Lints green.** `npm run build` and `npm test`. Fix forward links and checkpoint leaks as the [order](#order) section allows; log the rest. Gate: `npm run verify` shows no new errors.
5. **Meta notes.** In [learning-levels.md](../meta/learning-levels.md), add a `## Units` section with the five [principles](#what-a-unit-is), and a line saying a reorder is planned with `lint:ageben -- --deps`. In [order inside a band](../meta/learning-levels.md#order-inside-a-band), change tie-break 3 to say units are kept contiguous and ordered by dependency. Add the peel-tool line to [restructure-sittings.md](../meta/procedures/restructure-sittings.md). Group the generated heading map (`docs/meta/grammar-map.md`, from `npm run grammar-map -- --write`) by unit within each band. In `AGENTS.md`, extend the one sentence under **Grammar** that says where stage pages sit, so it also says they are grouped into units in `reading-order.ts`. Leave the topic-family table unchanged, and don't list units in `AGENTS.md` ([agents-md](../meta/agents-md.md): no duplicate indexes, nothing a restructure would force you to edit). Commit.
6. **Check the site.** Run the dev server and confirm the nested sidebar, prev/next across unit boundaries, and that the active page's unit opens.

Commits are made per [commits](../meta/procedures/proposals.md#commits), each with `[skip-cd]`: one after step 1, and one after steps 3 to 5.

### Later phases (not scheduled)

Recorded so phase 1 doesn't block them. Each needs its own go-ahead.

- **Unit intro block.** A short generated block at the top of a unit's first sitting, or a sidebar tooltip, giving the unit's title, what it lets the learner do, and which units it assumes. No unit summary page.
- **Unit capstone practice.** One `### Practice` per unit, on its last sitting, that combines the unit's sittings. Policy goes in [translation-exercises.md](../meta/translation-exercises.md).
- **Vocabulary slices.** Each unit introduces a themed slice of `core` vocabulary that its sittings and checkpoints use. Checkpoint word banks draw on the current unit and the units before it.
- **Purpose thread.** Check that each band's units carry its purpose-bearing sittings early, per tie-break 4. This is not a per-unit requirement.

## Open decisions

Collapsing and numbering were settled on 2026-11-10 (see **Status**).

### Asking comes ninth in Beginner

In the current flat order `questions` is the 11th of 37 sittings. In the table it is in unit 9 of 10, because its unit-mates need much later material (`fill-ask-jobs` needs `hooks`, `thanks-and-sorry` needs `sakes`). `questions` itself needs only units 1 to 4 (`joins` 198 uses, `pronouns` 30, `dependents` 14). Two of the remaining breaks (`restrictors` and `ought-for-a-sake` using question forms) exist only because it is late.

- **A.** Keep *Talking together* whole at unit 9, and rewrite the 5 examples in `restrictors` and `ought-for-a-sake` that use question forms.
- **B.** Move `questions` to the end of *Linking ideas*, renamed *Linking and asking*, and move `spans` (14k; it needs only units 1 to 4, and `roles` needs it) to the start of *Why and what for*. That makes *Linking and asking* 48k and *Why and what for* 48k, and leaves *Talking together* as `firm-soft`, `fill-ask-jobs`, `thanks-and-sorry` at 14k. The 5 question-form breaks go away; `here-there` gains a forward link to `spans`. Checked with `--deps`: the band is left with 1 use and 4 links broken, against 6 uses and 3 links for A.

**Recommendation:** B. Yes/no questions are core conversation, and keeping them near their current place is better for the learner than a theme-tidy unit. The small *Talking together* that is left is still a coherent "asking for details, thanking and apologizing" unit, and it is close to the size floor, not far below it.

### Sounds and words is two sittings

After `compounds` leaves, unit 1 is `phonology` and `word-endings`, 17k.

- **A.** Keep it as a short opening unit.
- **B.** Merge it with *First sentences* as *First words and sentences* (39k, five sittings).

**Recommendation:** B. It follows principle 3 without strain, and the merged unit is an ordinary size. A could be justified as a gentle opener, but nothing in the content needs the break.

### Small Intermediate units

*Fuller sentences* is three short sittings (14k), and *How you know* is two sittings (37k, with `evidentiality` at 25k). Neither has a neighbour it fits with by theme: merging *Fuller sentences* into *Names and spelling* (43k) mixes spelling with degree words and chains, and *How you know* lost `dated-channel` to a dependency on `bars`.

- **A.** Keep both as they are.
- **B.** Merge *Fuller sentences* into *Names and spelling* under a broader title, and keep *How you know*.

**Recommendation:** A. Both are coherent themes, and the exceptions are small. Splitting `evidentiality` (already a non-goal here) would fix *How you know* properly later.
