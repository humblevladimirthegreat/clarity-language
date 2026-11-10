# Units

**Status:** PROPOSED, 2026-11-10. User decisions, 2026-11-10: units are cut by file size, not by taught-line counts; phase 1 is the sidebar grouping only and ships alone; later phases are not scheduled; units are collapsible; units are not numbered for now. Revised 2026-11-10 after a dependency analysis (`lint:ageben -- --deps`): the unit table below replaces the first draft, and its order is the one the analysis supports. User decisions on the revision, 2026-11-10: `questions` moves up into *Linking and asking*; *Sounds and words* merges into *First words and sentences*; the small Intermediate units (*Fuller sentences*, *How you know*) stay as they are. Second revision 2026-11-10, after a review: vocabulary dependencies are measured ([vocabulary](#vocabulary)), `llms-txt.ts` joins unit U1, and the planner gains a review-word count (U2). User decisions on the second revision, 2026-11-10: `dependents` stays 6th and closes *First words and sentences*; `knowing` moves into *Pointing and describing*, leaving *Wanting and being able* as a two-sitting unit; *Counting and comparing* follows *Where, when, how often*; the FORMER row on `bars` moves to `residue-and-former.md`. Third revision 2026-11-10: the plan runs through subagents ([implementation plan](#implementation-plan)), and the table was rechecked with `plan-units` on the tree after `tags-and-logic` W1 to W6. The breaks are unchanged, sizes are updated, and *Lists of things* is now pinned after *Keeping track of who* ([what forced the changes](#what-forced-the-changes)). Run in progress. Done and committed: U1 (structure, no reorder; each band holds one placeholder unit titled with the band name). Next: U2.

**Related:** [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [llms-txt.ts](../../scripts/lib/llms-txt.ts), [core-vocabulary.ts](../../src/core-vocabulary.ts), [lexicon.md](../meta/procedures/lexicon.md), [reading-order.test.ts](../grammar/.vitepress/lib/reading-order.test.ts), [config.ts](../grammar/.vitepress/config.ts), [learning-levels.md](../meta/learning-levels.md), [restructure-sittings.md](../meta/procedures/restructure-sittings.md), [grammar-docs.md](../meta/grammar-docs.md), [lint-ageben-docs.ts](../../scripts/lint-ageben-docs.ts), [construction-order.ts](../../src/lint/construction-order.ts), [plan-units.ts](../../scripts/plan-units.ts), [unit-plan.ts](../../src/lint/unit-plan.ts), [lint-forward-links.ts](../../scripts/lint-forward-links.ts), [lint-sidebar-pages.ts](../../scripts/lint-sidebar-pages.ts), [peel-band.ts](../../scripts/peel-band.ts), [peel-headings.ts](../../scripts/peel-headings.ts), [constructions.ts](../../src/parse/constructions.ts)

**Depends on:** none. **Order:** independent of `tags-and-logic.md`, but the two never run at the same time: both take a `verify` baseline and both edit checkpoints. Take this run's baseline on a tree where that proposal's work is committed.

**Design authority:** *none*. Phase 1 groups and reorders sittings and moves one table row between two pages; it adds, removes, and changes no form or reading.

## Problem

Each band is one long flat list in the sidebar: 37 Beginner sittings, 63 Intermediate, 19 Advanced. A learner can't see where they are inside a band, what a stretch of sittings adds up to, or where a good stopping point is. Editors can't say "this assumes the people-and-pointing material" without naming sittings one by one.

## Goals

- Group the sittings of each band into **units**: named runs of consecutive sittings, each with one theme a learner can name.
- Show units as nested groups inside each band in the sidebar.
- Keep every hard dependency satisfied: the learning-order lints stay green after the reorder.
- Keep the change small enough to ship alone (phase 1).

## Non-goals (phase 1)

- Unit intro pages or blocks, unit summaries, unit capstone practice.
- Vocabulary slices. The `core` column changes only where the reorder makes a Review word leak ([order](#order), rule 4).
- Changes to checkpoints, beyond dropping an item that the reorder makes leak and moving a bank row for a moved `core` cell.
- An optimizer that assigns sittings to units ([why not a solver](#why-not-a-solver)).
- New sittings, splits, or band moves. A sitting that is too heavy (for example `evidentiality.md`) is a separate restructure.
- Units for the Claritish track, the recipe track, or the cheat sheets.

## What a unit is

These principles go into [learning-levels.md](../meta/learning-levels.md) in phase 1 (unit U6), so they outlive this proposal.

1. **Within one band, consecutive.** A unit never crosses a band boundary, and its sittings are adjacent in the reading order. The level review stays last in its band, outside every unit.
2. **Named for what the learner can do.** The title is a plain-English capability or theme (*Asking*, *Where and when*), not a subsystem name or a term from [terminology.md](../grammar/terminology.md).
3. **Comparable size.** As measured by combined file size, a unit holds about 20k to 50k of Markdown, normally 3 to 6 sittings. A unit far above its neighbours is two units, and one far below joins a neighbour. Two-sitting units are avoided.
4. **Dependency first.** The [order inside a band](../meta/learning-levels.md#order-inside-a-band) rules still decide order. Units replace the *topic cluster* tie-break: sittings of one unit sit together, and units are ordered by the dependencies between their sittings.
5. **Adds no forms.** A unit is an organizing layer. Everything taught stays on the sittings.

## Dependency analysis

`npm run lint:ageben -- --deps` prints every page-to-page dependency in the reading order, one tab-separated row per pair: a page that uses constructions homed on another page (with counts per construction ID), or links to it (with line numbers). A use whose home comes later fails `lint:ageben`. A link that points later fails `lint:forward-links`, but a link can be fixed by a prose edit, while a use needs an example rewritten.

`npm run plan-units -- --units <table> --suggest` checks a unit table against that report ([plan-units.ts](../../scripts/plan-units.ts)). It keeps each unit's sittings in their current relative order (the current order satisfies every use, so this is always valid inside a unit), finds the unit order that breaks the fewest dependencies by exact search (uses count before links; ties keep the table order), lists what still breaks, flags unit sizes outside 20k–50k, and suggests single sitting moves that break fewer. The first draft of the table broke these:

| Band | First-draft table, its own order | First draft, best unit order | Revised table below |
|------|-----|-----|-----|
| Beginner | 1,410 | 717 | 0 uses, 3 links |
| Intermediate | 171 | 61 | 1 use, 2 links |
| Advanced | 4 | 0 | 0 |

Counts are uses plus links. No reorder of the first-draft Beginner units could work: the problems were sittings in the wrong unit.

### What forced the changes

**Beginner**

- `speech-moves` is a hub. The vowel-series join and turn words (`word.family.joinMarker`) are homed there and used by 13 sittings in 7 units: `joins` 126 uses, `dependents` 50, `spans` 30, `causation` 24, `clause-sequence` 18, `ought-for-a-sake` 15, `fault` 13, and others. It moves into the first unit, which merges *Sounds and words* with *First sentences* as *First words and sentences* (after `compounds` left, *Sounds and words* was two sittings, 17k).
- `compounds` can't open the band. It uses `clause` (58), `joins` (44), `sakes` (19: mid-word `x` is homed at `sakes.md#met`), `predication` (13), and `roles` (3). It moves to *Who does what to whom*, next to role compounds.
- `label-seams` can't be in the first unit. It uses `sakes` (43), `roles` (41), `restrictors` (12), and `joins` (7). It moves to *Who does what to whom*.
- `predication` uses `pronouns` (8), and `left-bound-adjectives` uses `predication` (3). Both move after `pronouns` and `plurality`, which ends the old two-sitting *Pointing at people* unit. It is renamed *Pointing and describing*.
- *Talking together* has to come late: `fill-ask-jobs` uses `joins` (164) and `hooks` (95), and `thanks-and-sorry` uses `sakes` (102). `questions` needs only earlier material (`joins` 198 uses: and-lists and `u` negation; `pronouns` 30; `dependents` 14), and `restrictors` and `ought-for-a-sake` use question forms. So `questions` leaves *Talking together* and joins *Linking and asking*, near its current place (11th of 37 sittings), since yes/no questions are core conversation. To keep that unit's size, `spans` (14k; it needs only earlier units, and `roles` needs it) opens *Why and what for*.
- `dependents` stays 6th, closing the first unit, instead of opening *Linking and asking* (second revision). Four checkpoints in *Pointing and describing* review words that its checkpoint introduces, and `pronouns` links to it.
- `knowing` moves from the old *Wanting, being able, knowing* into *Pointing and describing*, 10th instead of 29th (second revision). It uses nothing later than that unit, `fault` uses MAY, which is homed on it (`fault.md#fault` hedges a fault claim with it), and it is the band's main rationality payoff, which tie-break 4 in [order inside a band](../meta/learning-levels.md#order-inside-a-band) wants early. `intention` and `can-and-cant` stay behind as *Wanting and being able*.
- *Counting and comparing* doesn't have to close the band (second revision). Its uses reach only units 1 to 3 and *Where, when, how often*, so it follows that unit, and `numbers` is 25th instead of 35th (it is 16th today).

**Intermediate**

- `bars` uses `comparative-arity` (17) and `evidentiality` (8), and `vague-amounts` uses `bars` (10). It moves into *Measuring and ranking*, between `comparative-arity` and `vague-amounts`; *Causes and stakes* keeps three sittings.
- `compound-families` uses `viewpoint` (2 uses, 3 links) and `feelings` (1 use). It moves from *Names and spelling* to *Places and viewpoint*.
- `want-and-decide` uses `contrary-to` (9: the zone hook and the held reading). It moves to *Surprise and what's not so*.
- `dated-channel` uses `bars` (1) and links to `measures-and-percent` and `residue-and-former`. It moves from *How you know* to *Surprise and what's not so*.
- `topic` sits inside a loop: it uses `stand-in-vowels` (2) and links to `sentence-linkers`, while `quote-contents` (5), `spans-as-words` (2), and `collectives` (1) use `topic`. It moves into *Across sentences*. At 59k that unit was too big, so it splits: *Across sentences* keeps the linkers, hinges, stand-ins, and `topic`; `scope-islands`, `spans-as-words`, and `quote-contents` become *Quoting and mentioning*.

- `universals-domains` uses `tag-pronouns` (83 uses, 3 links), since `tags-and-logic` W4 put [bound tags](../grammar/intermediate/universals-domains.md#bound-tags) on it: a tag after an *every* or *no* fence. So *Lists of things* has to follow *Keeping track of who*. The table already had it there, so nothing moves, but the pair is no longer free to trade places. Six more sittings link to `tag-pronouns` (`topic`, `spans-as-words`, `quote-contents`, `permission-consent`, `holder`, `singability`); only the `topic` link points later.

**Advanced**

- `hooked-joins` (in *Deep structure*) uses `hook-compounds` (2 uses, 2 links). Putting *Deep structure* last clears it. *Number values* and *Number-built words* depend on each other heavily (`special-values` alone has 104 uses and links with unit 4), so they stay adjacent.

### Vocabulary

The report misses one kind of dependency. A checkpoint's **Review** bank may list only roots that the `core` column introduces at an earlier checkpoint, and `lint:ageben` fails otherwise (`core-vocabulary`, from `lintCoreCounts` in [core-vocabulary.ts](../../src/core-vocabulary.ts)). A reorder can put the introducing checkpoint later. Running that check on the unit table's order (a one-off script on the 2026-11-10 tree; the current order has no findings) gives 16 leaking Review words, on 10 roots:

| Band | Review words that leak | Where they come from |
|------|-----|-----|
| Beginner | 12 | 6: `left-bound-adjectives`, `causation`, `sakes`, and `fault` review words that `restrictors` introduces (*rain*, *night*, *sleepy*). 3: `spans`, `already-still-yet`, and `digit-strings` review *walk*, introduced at `relations`. 2: `knowing` and `fault` review *pour*, introduced at `hooks`. 1: `here-there` reviews *sleep*, introduced at `roles`. |
| Intermediate | 4 | One each on `cause`, `scope-islands`, `evidentiality`, and `locative-relations`. |
| Advanced | 0 | |

Each one is fixed by moving the root's `core` cell to the earliest checkpoint that reviews it ([order](#order), rule 4): ten cells in all, so none of them blocks the table. The first revision's table leaked 20 in Beginner; seven of those went when `dependents` stayed in the first unit. Unit U2 of the plan adds the count to `plan-units` so that a later reorder sees it.

These counts were taken before `tags-and-logic` W5 and W6, which rewrote or added Practice items on `joins`, `tag-pronouns`, and `universals-domains`. The counts may be off by a word or two on those three checkpoints. U2's gate measures them again, and U4 and U5 work from that measurement, not from this table.

### Why not a solver

A mixed-integer solver (HiGHS, for example) that also chose each sitting's unit would not help. The current reading order breaks nothing, so the solver's best answer is that order cut into runs by size. Every break in the unit table is the price of a thematic grouping, and theme is not in the data. The part that is combinatorial, the unit order, `plan-units` already solves exactly. What the first analysis lacked was data (review words), not search.

### Limits

The report sees only dependencies that show up as a traced construction or a link (and, after U2, a Review word). A page that relies on an earlier page's idea in prose, with no Ageben example and no link, is invisible to it. Edges into `phonology` and `word-endings` come from parser productions that nearly every example uses; they are real but never constrain order, since those sittings come first. Homes are registry choices (`constructions.ts`): a family's home is where it is first taught today, so moving a sitting earlier than a family's home can need the anchor moved too (for example mid-word `x` if `compounds` ever came before `sakes`).

## Unit table

Sizes are combined file sizes on 2026-11-10, after `tags-and-logic` W6. Unit order and sitting order inside each unit are the analysed order, except for one Beginner unit placed by decision (noted under its table). Sittings inside a unit keep their current relative order.

### Beginner

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | First words and sentences | phonology, word-endings, clause, no-subject, speech-moves, dependents | 52k |
| 2 | Pointing and describing | pronouns, plurality, predication, knowing, left-bound-adjectives | 50k |
| 3 | Linking and asking | joins, questions, clause-sequence | 36k |
| 4 | Why and what for | spans, causation, sakes, fault, ought-for-a-sake | 48k |
| 5 | Where, when, how often | hooks, restrictors, extra-noun-hooks, here-there, already-still-yet | 43k |
| 6 | Counting and comparing | numbers, comparatives, digit-strings | 23k |
| 7 | Who does what to whom | relations, roles, compounds, social-ties, label-seams | 51k |
| 8 | Wanting and being able | intention, can-and-cant | 14k |
| 9 | Talking together | firm-soft, fill-ask-jobs, thanks-and-sorry | 15k |

Still broken in this order:

- No use.
- `sakes` links to `restrictors`, `knowing` links to `sakes`, and `comparatives` links to `relations`.
- 12 Review words leak ([vocabulary](#vocabulary)).

By the counts alone, units 1 to 5 are pinned to their slots, *Who does what to whom* comes sixth, and the other three can trade places after it. The table departs from that in one place, by decision: *Counting and comparing* sits ahead of *Who does what to whom*, so that counting doesn't close the band. That costs one link (`comparatives` to `relations`) and one Review word, and `plan-units` will name the other order as best.

*Why and what for* comes before *Where, when, how often* because that order breaks one link fewer and keeps the purpose-bearing unit (`sakes`, `fault`) early. It leaks five more Review words than the other order, which are `core` cell moves a learner never sees.

Units 1 and 7 are just over 50k. *Wanting and being able* (14k, two sittings) and *Talking together* (15k) are below the size floor. Each was kept as one coherent theme rather than merged or scattered.

### Intermediate

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Names and spelling | phonotactics, letter-names, proper-names, place-name-roots, conversation-length | 29k |
| 2 | Fuller sentences | longer-chains, very-and-slightly, label-reach | 14k |
| 3 | Conversation craft | more-turn-words, speech-manner, tone-marks, polar-inventory, fill-ask-roles | 42k |
| 4 | Across sentences | sentence-linkers, more-hinges, stand-in-vowels, topic | 39k |
| 5 | Keeping track of who | resume-sense, tag-pronouns, collectives | 34k |
| 6 | Lists of things | list-structure, rank-joins, set-joins, universals-domains | 43k |
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

- `bars` uses an overlay homed on `residue-and-former` (1 use). U3 clears it by moving one table row ([order](#order)).
- `topic` links to `tag-pronouns`, and `ranges` links to `locative-relations`.
- 4 Review words leak ([vocabulary](#vocabulary)).

*Conversation craft*, *Across sentences*, and *Keeping track of who* are pinned to slots 3 to 5, and *Lists of things* has to come after *Keeping track of who* (bound tags). Past that the order is loose: many unit orders tie for the fewest broken uses and links, and the planner keeps the table's order among ties. So the order of units 7 to 17 is largely an editorial choice.

Unit 2 (14k) is small, and unit 12 is two sittings. Both stay: each is a coherent theme with no neighbour it fits by theme. Splitting `evidentiality` (a non-goal here) would fix unit 12 properly later.

### Advanced

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | Fine shades of knowing | as-of, stance-bars, universality, usually-vs-must | 33k |
| 2 | Number values | stacked-markers, special-values | 26k |
| 3 | Number-built words | initials, open-ranges, generations, numeric-derivation | 41k |
| 4 | Building words and voice | singability, hook-compounds, root-tails | 27k |
| 5 | Deep structure | stand-in-roles, nested-dependents, join-limits, named-phrases, hooked-joins, span-nesting | 39k |

Nothing is broken in this order. Unit 2 is two sittings: `special-values.md` (20k) carries it, and folding it into unit 3 would make a 64k unit.

## Design

### Data

[reading-order.ts](../grammar/.vitepress/lib/reading-order.ts) becomes the one source of units. Each band's list changes from a flat array of links to an array of units:

```ts
type Unit = { text: string; items: LessonLink[] }
export const beginnerUnits: Unit[] = [ { text: 'First words and sentences', items: [...] }, ... ]
export const beginnerLessons = beginnerUnits.flatMap((u) => u.items)
```

`beginnerLessons`, `intermediateLessons`, `advancedLessons`, `readingOrder`, `lessonPages`, `pathPages`, and `pageRelPath` keep their current shapes and meaning: flat, in reading order. Everything that reads them (lints, flashcards, checkpoint packs, the grammar map, the game build) keeps working unchanged and simply sees the new order.

`sidebarGroups` nests the units: each band group's `items` is its units as VitePress sub-groups, followed by the level review as a plain link. Two readers take `sidebarGroups[n].items` today and would be handed groups: `readingOrder` in the same file, and `llmsSections` in [llms-txt.ts](../../scripts/lib/llms-txt.ts). Both switch to a new flat export, `bandLessons`: one `{ text, items }` per band, holding its sittings in reading order and then its review. `llms.txt` keeps one section per band and changes only in page order.

### Sidebar

Each band stays a collapsed group. Inside it, each unit is a collapsed sub-group titled with the unit name, with no number. The unit holding the active page opens. Page titles, URLs, files, and `band:` front matter don't change.

### Order

Three checks decide whether an order holds:

- `lint:ageben`, learning order: no example uses a construction whose home section comes later ([learning-order check](../meta/learning-levels.md#learning-order-check)).
- `lint:ageben`, `core-vocabulary`: no checkpoint reviews a root that the `core` column introduces later ([vocabulary](#vocabulary)).
- `lint:forward-links`: no stage-page link points later on the path.

The [unit table](#unit-table) was planned with `plan-units` ([dependency analysis](#dependency-analysis)), and each band lists what it still breaks. Those items, and anything new from changes made since 2026-11-10, are fixed in this order:

1. Reorder within the unit, or reorder units within the band.
2. Move the blocking sitting to the neighbouring unit it depends on or feeds, and record the change in this proposal's unit table.
3. For a **forward link** only: rewrite or drop the link per [teach now](../meta/grammar-docs.md#teach-now-dont-preview-later). That's a prose edit, not a form change.
4. For a **Review word** only: move the root's `core` cell to the earliest checkpoint that reviews it, per [core vocabulary column](../meta/procedures/lexicon.md#core-vocabulary-column), and move its bank rows to match (**New words** there, **Review** at its old home). No item changes. When that would put more than five New words on the earlier checkpoint, or trips the look-alike check, drop the item and its bank row instead, as long as the checkpoint keeps three Review roots.
5. Anything else, such as an example that needs rewriting with earlier forms, or a section that would have to move, is logged under [open decisions](#open-decisions). The sitting stays where the lints allow, and the run continues.

One use break is left, in Intermediate, and its fix is settled. The table under [channels as comparison bars](../grammar/intermediate/bars.md#channel-bars) has a FORMER row (`helam`, *than it used to be*), and FORMER is homed on `residue-and-former`, one unit later. `vague-amounts` uses `bars`, so `bars` can't move back. The row moves to [residue-and-former.md](../grammar/intermediate/residue-and-former.md), as a line saying FORMER also works as a comparison bar, with a link back to `bars.md#channel-bars`. No form changes.

A checkpoint item that uses a form now taught later is dropped, not rewritten, per [how to apply](../meta/learning-levels.md#how-to-apply).

### Tools that append sidebar rows

`peel-band` and `peel-headings` append a sidebar row to a band list. With units, they append to a unit: by default the parent sitting's unit, directly after the parent; with `--unit "<title>"`, to the end of that unit instead. When the new sitting lands in a different band from its parent, there is no parent unit in that band, and the tool stops and asks for `--unit`. [restructure-sittings.md](../meta/procedures/restructure-sittings.md) gets one line saying so.

## Implementation plan

Phase 1 runs through subagents, per [running with subagents](../meta/procedures/proposals.md#running-with-subagents): one fresh subagent per unit, in sequence. The orchestrator writes each brief, runs the gates, and commits. If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends. Findings that change the plan [stop and alert](../meta/procedures/proposals.md#stop-and-alert).

**Use `fable` wherever a unit would otherwise name `opus`.** A promotion makes `fable` cheap for now. A unit that would normally run on `sonnet` (a mechanical step, per [step 7](../meta/procedures/proposals.md#running-with-subagents)) still names `sonnet`. No unit in phase 1 is mechanical in that sense: each one writes code, teaching prose, or checkpoint word banks, so all six name `fable`. The orchestrator passes the unit's `model` and effort on every launch, including a fresh subagent started for what a stopped one left.

### Phase 1: units in the sidebar

| ID | Items | Agent | Model / effort | May edit |
|----|-------|-------|----------------|----------|
| U1 | **Structure, no reorder.** Add the `Unit` type and unit arrays to `reading-order.ts`, derive the flat lists and `bandLessons`, and nest `sidebarGroups` ([data](#data), [sidebar](#sidebar)). Each band temporarily holds one unit containing its current list, so the reading order is unchanged. Point `readingOrder` and `llmsSections` at `bandLessons`. Update `reading-order.test.ts`: units are non-empty, every sitting appears in exactly one unit, flat lists equal the flattened units, and the review is last and outside every unit. Update `peel-band` and `peel-headings` per [tools](#tools-that-append-sidebar-rows). | `proposal-worker` | `fable` / `medium` | `docs/grammar/.vitepress/lib/reading-order.ts` and its test, `docs/grammar/.vitepress/config.ts`, `scripts/lib/llms-txt.ts`, `scripts/peel-band.ts`, `scripts/peel-headings.ts`, and their tests |
| U2 | **Vocabulary in the planner.** Extend `plan-units`. It reads the checkpoints (`stageCheckpoints`) and the `core` column (`storedCore`) and adds one edge per Review root, from the checkpoint's page to the page of the root's `core` cell. Review words are a third count, ranked between uses and links, and `--suggest` uses it. When the table's order is not the best order, the script prints the table order's counts and breaks as well, since the table may keep an order for a reason the counts don't see. Report the Review-word counts and the leaking words per band for the table's order. | `proposal-worker` | `fable` / `medium` | `src/lint/unit-plan.ts`, `src/lint/unit-plan.test.ts`, `scripts/plan-units.ts` |
| U3 | **Order and fill units.** Write the [unit table](#unit-table) into `reading-order.ts`, in its order. Move the FORMER row from `bars.md` to `residue-and-former.md` ([order](#order)). Rewrite or drop the five forward links the table lists, per fix 3 in [order](#order): `sakes` to `restrictors`, `knowing` to `sakes`, `comparatives` to `relations`, `topic` to `tag-pronouns`, `ranges` to `locative-relations`. This unit ends red by design ([gates](#gates)): report every error `verify` still shows, grouped as Review-word leaks, checkpoint items that use a later form, and anything else. | `proposal-worker` | `fable` / `high` | `reading-order.ts` and its test; `bars.md`, `residue-and-former.md`, `sakes.md`, `knowing.md`, `comparatives.md`, `topic.md`, `ranges.md` (the row and the links only) |
| U4 | **Beginner vocabulary.** Clear each Beginner Review-word leak and checkpoint leak from U3's report with fixes 4 and 5 in [order](#order): move the root's `core` cell, move its bank rows to match, or drop the item. Read [core vocabulary column](../meta/procedures/lexicon.md#core-vocabulary-column) first. | `proposal-worker` | `fable` / `medium` | the `core` column of `data/lexicon-published.csv` and `data/lexicon-compounds.csv`; `### Practice` word banks and dropped items on the Beginner pages U3's report names; their drill allowlist rows |
| U5 | **Intermediate and Advanced vocabulary.** The same as U4, for the other two bands. Ends green. | `proposal-worker` | `fable` / `medium` | as U4, on the Intermediate and Advanced pages U3's report names |
| U6 | **Meta notes.** In [learning-levels.md](../meta/learning-levels.md), add a `## Units` section with the five [principles](#what-a-unit-is), and a line saying a reorder or a new unit table is checked with `npm run plan-units`. In [order inside a band](../meta/learning-levels.md#order-inside-a-band), change tie-break 3 to say units are kept contiguous and ordered by dependency. In [how to apply](../meta/learning-levels.md#how-to-apply), the dispatch line says an in-band reorder edits *the three sidebar lists (no scoring, no solver)*: change it to name the unit arrays and say the planner checks a table but does not choose units. Add the peel-tool line to [restructure-sittings.md](../meta/procedures/restructure-sittings.md). The line also says that a peel into a different band from its parent has no parent unit there, so the tool stops and asks for `--unit` (U1 built it that way rather than guess a unit). Change the heading-map generator so the map is grouped by unit within each band, but do not run it with `--write`. | `proposal-worker` | `fable` / `medium` | `docs/meta/learning-levels.md`, `docs/meta/procedures/restructure-sittings.md`, `scripts/grammar-map.ts` and its test |

Order: U1, U2, the orchestrator's recheck, U3, U4, U5, U6, then the orchestrator's closing steps. U3 to U5 are one workstream, **W3**, with one commit: the reorder and the `core` moves it forces are only green together.

**Orchestrator's own steps** (no subagent):

- **Recheck, after U2.** Run `npm run plan-units -- --units docs/proposals/units.md --suggest 2>&1 | tail -80`. The table order's breaks should be the ones the table lists, plus U2's Review-word counts. For Beginner the script names a different best order, with *Counting and comparing* after *Who does what to whom*; that is expected, and the table's order stands. It stops on a sitting missing from the table or in two units. A sitting not in the table (a new peel, a band move) goes in the unit of its parent or neighbour. A new use break is fitted in with fixes 1 and 2 in [order](#order) and recorded in the unit table before U3 starts; if that would move more than one sitting, or change a unit's theme, [stop and alert](../meta/procedures/proposals.md#stop-and-alert).
- **After U5.** Update the unit table here so it matches what shipped.
- **After U6.** In `AGENTS.md`, extend the one sentence under **Grammar** that says where stage pages sit, so it also says they are grouped into units in `reading-order.ts`. Leave the topic-family table unchanged, and don't list units in `AGENTS.md` ([agents-md](../meta/agents-md.md): no duplicate indexes, nothing a restructure would force you to edit). Commit, then run `npm run grammar-map -- --write` and commit its output alone.
- **Check the site.** Run the dev server and confirm the nested sidebar, prev/next across unit boundaries, and that the active page's unit opens. If the session can't drive a browser, ask the user to look.
- **Close.** Phase 1 is the whole scheduled plan. Cut this proposal down to [later phases](#later-phases-not-scheduled), set Status to partially implemented, and `git mv` it to `partially-implemented/`.

### Rule digest (pasted into every brief)

> - Ageben only; current forms only; no former-name or *used to be* notes ([present the current language only](../meta/grammar-docs.md#present-the-current-language-only)).
> - This proposal adds, removes, and changes no form or reading. If a fix seems to need an example rewritten with other forms, a section moved, or a parser change, don't make it: log it in your report with options and a recommendation, skip the item, and carry on.
> - A unit is a named run of consecutive sittings inside one band. The level review stays last in its band, outside every unit. Units have no numbers in the sidebar.
> - The flat exports of `reading-order.ts` (`beginnerLessons`, `intermediateLessons`, `advancedLessons`, `readingOrder`, `lessonPages`, `pathPages`, `pageRelPath`) keep their shapes and meaning. Don't edit their readers to suit a new shape; only `readingOrder` and `llmsSections` move to `bandLessons`.
> - Page titles, URLs, file paths, and `band:` front matter don't change. No sitting changes band.
> - A forward link is fixed in prose: rewrite or drop it per [teach now](../meta/grammar-docs.md#teach-now-dont-preview-later). Never retarget links by hand after a move; nothing in this proposal moves a heading.
> - A leaking Review word: move the root's `core` cell to the earliest checkpoint that reviews it, and move its bank rows to match (**New words** there, **Review** at its old home). No item changes. If that puts more than five New words on the earlier checkpoint, or trips the look-alike check, drop the item and its bank row instead, as long as the checkpoint keeps three Review roots.
> - A checkpoint item that uses a form now taught later is dropped, not rewritten ([how to apply](../meta/learning-levels.md#how-to-apply)).
> - Stage pages never link to `say-*.md` recipes, and nothing links to a file under `docs/proposals/`.
> - Cheat-sheet tables between `<!-- generated -->` markers and `docs/meta/grammar-map.md` are never edited by hand; report that a regeneration is needed and stop there.
> - Don't edit `AGENTS.md` or `docs/proposals/units.md`; report the change needed. Don't commit.
> - Other work in the tree is not yours: don't edit `src/parse/*`, the tag pages beyond a link this unit names, or any file outside your unit's list. If a fix needs one, report it.
> - Read slices: list headings first (`grep -n '^#'`), read only the ranges you edit.
> - Edit with the Edit tool. When an edit needs a script, write it to a file under `tmp/` and run the file; never pass a script inline (`node -e`, `python -c`, a heredoc).
> - Stop and alert (report and stop; do not work around): a premise no longer holds; later units would need a different design, order, or pages; skipping would leave later work on a broken state; enough is skipped that the goals cannot be met.
> - Verify with `npm run verify -- --allow-generate` at the end of each item (`--fast` inside an item). Never paste raw build output; read only the new error's line in `tmp/verify-last.log`. Never rerun a failed check before editing.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Report, fixed fields: **done**; **files touched** (count); **registry edits** (sidebar, `core` cells, allowlist rows); **AGENTS.md Owns lines** to change; **verify** line; **skips** with reasons; **left**; **inefficient**.

Each brief holds the unit's row from the table above, the sections of this proposal it links to (pasted, not linked), this digest, and for U3 to U5 the unit table and the report of the unit before. No brief tells a subagent to read this proposal.

### Gates

- The orchestrator saves `npm run verify -- --baseline` before U1, on a tree where other work is committed.
- **U1:** `verify` shows no new errors, and the built `llms.txt` is byte-identical to the baseline build's (the orchestrator copies it aside when it takes the baseline).
- **U2:** `verify` shows no new errors, and on the unit table the script reports about the [vocabulary](#vocabulary) counts for the table's order (12, 4, 0), give or take the checkpoints edited since.
- **U3:** the one gate that is red by design. Every new error must be a `core-vocabulary` Review-word leak or a checkpoint item using a later form. A learning-order *use* error other than those, or a forward link left over, goes back to U3's subagent. For U3 the standing stop line's *leave the tree green* means *leave no error outside those two kinds*.
- **U4:** no new error is left on a Beginner page.
- **U5:** `verify -- --allow-generate` shows no new errors. Then the orchestrator runs `npm run cheat-sheet-blocks -- --write`, since the sheets may follow the reading order or the `core` order.
- **U6:** `verify` shows no new errors (`docs/meta/` alone needs no build, but the generator change does).
- **Final gate:** a clean `npm run build` and `npm test`, with nothing left on a **generate** row, then the site check.

A failed gate goes back to the subagent that made the change while it is under about 25 turns; otherwise to a fresh one with the item, the failing `verify` lines, and the diff stat.

### Commits

Five to seven commits, each `units <ID>: <what> [skip-cd]` plus the co-author line, staging only that unit's files, made by the orchestrator only:

1. `units U1`: structure, no reorder.
2. `units U2`: Review words in the planner.
3. `units W3`: the reorder, the FORMER row, the link fixes, the `core` moves (U3 to U5), and this proposal's updated unit table.
4. `units W3: npm run cheat-sheet-blocks -- --write`, only if a table changed ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)).
5. `units U6`: meta notes, the generator change, and the `AGENTS.md` sentence.
6. `units U6: npm run grammar-map -- --write`, on its own.
7. `units`: the consolidated proposal, moved to `partially-implemented/`.

After each commit the orchestrator records the finished IDs on the Status line ([resuming](../meta/procedures/proposals.md#resuming)).

### Later phases (not scheduled)

Recorded so phase 1 doesn't block them. Each needs its own go-ahead.

- **Unit intro block.** A short generated block at the top of a unit's first sitting, or a sidebar tooltip, giving the unit's title, what it lets the learner do, and which units it assumes. No unit summary page.
- **Unit capstone practice.** One `### Practice` per unit, on its last sitting, that combines the unit's sittings. Policy goes in [translation-exercises.md](../meta/translation-exercises.md).
- **Vocabulary slices.** Each unit introduces a themed slice of `core` vocabulary that its sittings and checkpoints use. Checkpoint word banks draw on the current unit and the units before it.

The purpose check (purpose-bearing sittings early, per tie-break 4) is no longer a later phase. The second revision made it for Beginner: `knowing` moved up, and *Why and what for* stayed ahead of *Where, when, how often*.

## Open decisions

None. Collapsing and numbering, the Beginner moves, keeping the small units, where `dependents`, `knowing`, and *Counting and comparing* sit, and the FORMER row were settled on 2026-11-10 (see **Status**).
