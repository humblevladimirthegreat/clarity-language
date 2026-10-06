# Proposal: cheat sheets for the whole grammar

**Status:** PROPOSED. Rollout steps 1–4 done; step 5: batches A and B done (sounds and spelling, word shape and clause, people and pointing; talking, knowing and intending, why and allowed, restrictors and spans); batch C open. Done so far: pilot sheet [joins and hooks](../grammar/cheat-sheets/joins-hooks.md); [`scripts/lint-cheat-sheets.ts`](../../scripts/lint-cheat-sheets.ts) (layers 2 and 3, plus the Claritish sheet); [`scripts/cheat-sheet-blocks.ts`](../../scripts/cheat-sheet-blocks.ts) (layer 1) and the [Agazan → English](../grammar/cheat-sheets/agazan-english.md) sheet; sheets moved to `docs/grammar/cheat-sheets/` with redirects, and the editor rules are in [cheat sheets](../meta/grammar-docs.md#cheat-sheets).  
**Related:** TODO *join vowel decision tree in advanced vowel series*; the existing [Exceptions](../grammar/cheat-sheets/exceptions.md) sheet; the Claritish [cheat sheet](../grammar/claritish/cheat-sheet.md) kept in step by the same lint; [Claritish track policy](../meta/grammar-docs.md#claritish-track).  
**Design authority:** stays with the owning grammar pages and the lexicon CSVs. Sheets add no forms, restate no rule the owning page does not teach, and are never cited as the source for a form.

## Motivation

The Claritish track ends in a printable one-page sheet that a learner keeps open while writing. The grammar proper has nothing like it: one small Exceptions sheet, and otherwise 30 stage pages where the forms for one job (say, every join vowel) are spread over Beginner, Intermediate, and Advanced sections and two or three pages. A learner who has read the pages still has to hunt for a form they half remember.

Grammar sheets give that learner one glance per subsystem, grouped the way they look things up, not one sheet per page.

## Goals

1. One printable sheet (one or two pages at print size) per learner-facing subsystem.
2. Every row links to the section that teaches it, so the sheet is a door into the grammar, not a second grammar.
3. Rows carry a stage tag, so a beginner can skip what they have not reached.
4. Sheets stay in step with the owning pages through build checks, not memory.

## Non-goals

- New forms, readings, or rules. A sheet that needs a sentence the owning page does not have is a sign to fix the owning page first.
- Practice, gap stories, or worked examples beyond a word or two per row.
- Replacing the **Reference tables** tail on stage pages. Those stay as in-page lookups; sheets cut across pages.
- Covering the recipe track or `numeric-derivation.md` (advanced only, and not a lookup job).

## Proposed sheets

| Sheet | Covers (owning pages) | Notes |
|-------|-----------------------|-------|
| **Sounds and spelling** | `phonology.md` | Letters, vowels, `th`, phonotactics, letter names |
| **Word shape and clause** | `word-endings.md`, `clause.md`, `predication.md` | PoS letters × endings, role letters, default order, hosting, chaining. The core sheet. |
| **People and pointing** | `pronouns.md`, `plurality.md` | Pronoun families, the topic, plural, associative, clusivity |
| **Talking** | `speech-moves.md`, `questions.md` | Turns, vocatives, the reusable vowel series, tone marks, yes/no and fill questions, stance particles |
| **Knowing and intending** | `knowing.md`, `intention.md` | Evidentials × strength, MAY, forecasts, plan / decision / try / ability |
| **Why and allowed** | `causation.md`, `sakes.md` | Cause and condition poles, fault, sakes, permission, consent |
| **Joins and hooks** (pilot) | `joins.md`, `join-across-roles.md`, `hooks.md` | One vowel map for both; join arity grid; hook kinds by position. Later: the join-vowel decision tree from TODO. |
| **Restrictors and spans** | `restrictors.md`, `spans.md` | `/h/` and `/w/` restrictors, habitual, span fences, asides, scope islands |
| **Linking clauses** | `dependents.md`, `relations.md` | Continue, stand-ins, subordinators, the relation catalog |
| **Roles and comparing** | `roles.md`, `x-compounds.md`, `comparatives.md` | Role compounds, laterals, `x` families, comparatives and stance bars |
| **Numbers** | `numbers.md`, `numbers-applied.md` | Numerals, digitless forms, time and date, ranges, measures |
| **Agazan → English** | `lexicon-overlays.csv`, `src/closed-roots.ts`, closed function words | Alphabetical reverse lookup of every closed form; generated (see below) |
| **Exceptions** | (exists) | Unchanged |

## Page and policy shape

- **Location.** `docs/grammar/cheat-sheets/`, one file per sheet, named for its subject (`joins-hooks.md`). The earlier flat `*-cheatsheet.md` URLs redirect there ([site redirects](../meta/site-redirects.md)).
- **Sidebar.** All sheets sit in the existing **Cheat Sheets** group, in reading order (sounds first, Agazan → English and Exceptions last).
- **Front matter.** `pageClass: cheat-sheet`, `outline: false`, and `<PrintButton />`. The print CSS already written for the Claritish sheet is shared by both classes.
- **Links.** Sheets link out to owning sections. Stage pages never link to sheets, as with the recipe track ([recipe track](../meta/grammar-docs.md#recipe-track)); the [introduction](../grammar/introduction.md#how-to-learn) may mention the group once.
- **Stage tags.** Each row (or each section, when the whole section is one stage) carries **B** / **I** / **A**. The tag is the stage of the section the row links to.
- **Wording.** The usual [doc style](../meta/doc-style.md): learner names for features, never [terminology](../grammar/terminology.md) links, English cues in italics, forms in backticks so the build parses them and `retie-docs` keeps them current.
- **Editor note.** The rules above live in [cheat sheets](../meta/grammar-docs.md#cheat-sheets); AGENTS.md routes to the `cheat-sheets/` folder.

## Keeping sheets in sync

The Claritish lint works because the sheet and the lessons are two small sets of forms that must match each other exactly. The grammar is too large for that, and much of it does not belong on a sheet, so use three layers, strongest first.

### 1. Generate what the data already owns

`data/lexicon-overlays.csv` carries `kind` and `anchor` for every overlay. Overlays are most of the paradigm content: clause poles (41), evidentials (36), phasal (24), join-relations (20), sakes (18), deontic (15), join-acts (10), and so on.

- Sheets mark generated blocks: `<!-- generated: overlays kind=evidential -->` … `<!-- /generated -->`.
- A script (`scripts/cheat-sheet-blocks.ts`) rebuilds each block from the CSV. In the build it runs as a check and fails when a block is stale; `--write` refreshes the blocks, the same dry-run / write pattern as `retie-docs`.
- The **Agazan → English** sheet is almost entirely generated: overlays, `src/closed-roots.ts`, and `lexicon-compounds.csv`. It cannot drift.

### 2. Every hand-written row must match the section it links to

A new `scripts/lint-cheat-sheets.ts`:

- Every table row on a sheet links to at least one owning section: in the row, the table's header row, or the prose between the nearest heading and the table. A row whose first cell is empty continues the row above and shares its links.
- Every Agazan code span in the row must appear in one of those linked sections (heading to the end of its subtree; a link with no anchor means the whole page), as whole words. A one-word span may also match with its ending swapped among **-l** / **-m** / **-r** (the Claritish rule); a phrase or sentence must match verbatim.
- Spans the Agazan doc lint classes as templates or English (`…el`, `A HOOK B`, `ROOT`) are skipped.

This catches a respelled, removed, or moved form, and it is tighter than "appears somewhere in the grammar." Dead anchors are already caught by the build.

### 3. Owning tables opt in for coverage

On an owning page, an editor puts `<!-- cheat-sheet: joins-hooks -->` on the line right before a table. The lint then requires every form in that table (word, phrase, or sentence spans) to be on that sheet, as whole words anywhere in its text. Mark only tables whose forms are in backticks; a table that sets its forms in bold has nothing to check.

- This catches the opposite drift: a new form added to the grammar that never reaches the sheet.
- Unmarked tables are free, so example-only tables do not bloat the sheets.
- The marker comment sits where an editor changes the table, so the dependency is visible at the moment it matters.
- Rule for [grammar-docs.md](../meta/grammar-docs.md): a change to a marked table updates its sheet in the same change (the same rule the Claritish track has).

### What still slips through

A meaning or gloss change that keeps the spelling passes layers 2 and 3. Generated blocks cover that for overlays. For hand-written rows the opt-in marker is the reminder; that is as much as is worth enforcing.

### One lint for both tracks

`lint-cheat-sheets.ts` replaces `lint-claritish-cheat-sheet.ts`. Claritish becomes one configuration: its "linked section" is the whole lesson page, every lesson table is opted in, and `feelings.md` stays pattern-only.

## Rollout

1. Pilot sheet by hand: **Joins and hooks** (done).
2. Write `lint-cheat-sheets.ts` layers 2 and 3; mark the joins and hooks owning tables; fold the Claritish lint into it (done: 15 tables marked across `joins.md`, `join-across-roles.md`, and `hooks.md`; sheet IDs are registered in the lint's `SHEETS` map).
3. Generated blocks (layer 1) and the **Agazan → English** sheet (done). As built:
   - Sources are `overlays` (filter `pos=` / `kind=`, `|`-separated; sake rows only when `kind=` names them), `sakes` (one row per root, the `/th/` *serves* / *detracts from* pair), `closed-words`, and `compounds` (citation forms: **-l** concrete, **-m** abstract; hook compounds as their stem). Each overlay row links to its CSV `anchor`, titled with that section's heading and tagged with its stage.
   - `src/closed-roots.ts` has no glosses, so `closed-words` keeps a short table in the script (special, generic, and topic pronouns; sentence linkers) with English and anchor; only the root is read from `CLOSED`. Compass arrows and template fillers carry no closed reading and are left out.
   - Layer 2 skips rows inside generated blocks; the generator holds them to the data, and the Agazan doc lint still parses every form.
   - Closed function words with no data source (joins, hooks, turn words, stand-ins, pointers, tags, resumes) get one hand-written **find the family by shape** table that points to the owning sections and the joins and hooks sheet, instead of a full listing.
   - The pilot sheet's join-act / join-relation grid stays hand-written: it is a vowel grid, not a spelling list.
4. Move sheets into `cheat-sheets/` with redirects; add the grammar-docs.md section and the AGENTS.md row (done, ahead of the remaining sheets so they start in the folder; the Exceptions sheet is registered in the lint too, and passes).
5. Remaining sheets, each with its owning tables marked and its ID registered in `SHEETS`. Work in three batches, one session each, so a batch's wording and layout stay consistent:

   | Batch | Sheets | Why together |
   |-------|--------|--------------|
   | **A** | **Sounds and spelling**, **Word shape and clause**, **People and pointing** | Word shape and clause is the core sheet and sets the layout the others follow; sounds and people are small and closest to it. |
   | **B** | **Talking**, **Knowing and intending**, **Why and allowed**, **Restrictors and spans** | Knowing and Why lean on generated overlay blocks (evidentials, poles, deontic, sakes); the four share the stance and scope vocabulary. |
   | **C** | **Linking clauses**, **Roles and comparing**, **Numbers** | Mostly hand-written; Numbers is the largest single sheet and goes last. |

   Within a batch, sheets go in the order listed. Each session starts by reading the finished sheets for layout, and ends with `npm run build` green.
