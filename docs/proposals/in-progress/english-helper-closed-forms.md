# English helper: spell the closed forms, show the frame

**Status:** IN PROGRESS: Phase 1 done (2026-11-13). The tree is green and the changes are uncommitted. Open decisions 1 to 5 were adopted on 2026-11-13 as recommended after Phase 1:
1. **Reach:** whole sheet, filled nearest first, lean rendering, capped at 6,000 characters.
2. **Prompt size:** the median baseline is raised once in Phase 2. Characters per self-contained sentence may rise to about 30,000, from 25,959.
3. **Source:** the blocks are read from the cheat sheets.
4. **Paid runs:** approved, about $2 each on the stored 20 items: `oracle-gloss` after Phase 2, then `oracle-words` and a plain run after Phase 3.
5. **Forms no reach recovers:** no always-shown core block. They go to the helper's Next round.

Next: Phase 2.

**Follow-on:** `english-helper-jev-selection.md` (PROPOSED 2026-11-13) would have the Jev model rank the blocks under the same cap and widen the wanted frames. It builds on this proposal's selection and replaces none of it: the nearest-first fill stays as the candidate list and the fallback. Its Phase 1 reuses the dry measure, so Phase 2 step 3 below waits on it.

**Related:** [English helper quality](../../meta/procedures/english-helper.md) ([oracle ablations](../../meta/procedures/english-helper.md#oracle-ablations), [regression net](../../meta/procedures/english-helper.md#regression-net), [decisions](../../meta/procedures/english-helper.md#decisions)), [cheat sheets](../../meta/grammar-docs.md#cheat-sheets), [`src/english-helper/paradigms.ts`](../../../src/english-helper/paradigms.ts), [`src/english-helper/llm-prompt.ts`](../../../src/english-helper/llm-prompt.ts), [`src/english-helper/load.ts`](../../../src/english-helper/load.ts), [`src/english-helper/browser.ts`](../../../src/english-helper/browser.ts), [`scripts/english-helper-recall.ts`](../../../scripts/english-helper-recall.ts), [`scripts/english-helper-eval.ts`](../../../scripts/english-helper-eval.ts), [`docs/grammar/cheat-sheets/`](../../grammar/cheat-sheets/).

**Depends on:** nothing. **Order:** Phase 2 step 3 after Phase 1 of `english-helper-jev-selection.md`.

**Design authority:** none. Every change is tool code, or a prompt line that restates what a grammar page already teaches. A form or an order rule that no page states is a grammar gap: log it under Open decisions and leave it.

## Phase 1 results

Phases 2 and 3 build on what follows.

### Code in the tree

- [`paradigms.ts`](../../../src/english-helper/paradigms.ts) has `parseParadigmBlocks`, which reads each cheat sheet table into a block: its sheet, its heading, and its rows. Each row carries its canonical `links` and two renderings. `line` holds every cell. `lean` holds the row's code spans, then its italic English. The Stage column is dropped for now. `paradigmLines(blocks, links, reach, style, cap, fill)` chooses the lines to show. The reaches are `rows | table | page | sheet | all`, and the fills are `drop-largest | nearest`. Tests are in `paradigms.test.ts`.
- [`load.ts`](../../../src/english-helper/load.ts) adds two loaders. `loadCanonicalAnchors()` maps `page.md#id` to `page.md#slug`, so a pinned old id and its heading id agree. `loadParadigmBlocks()` returns 239 blocks with 1,640 rows; 147 of the rows have no link.
- `promptLinks(inputs)` in [`llm-prompt.ts`](../../../src/english-helper/llm-prompt.ts) gives the sections the analysis links, without the role-letter link. Example selection uses the same set.
- The recall script runs a dry block measure on checkpoint. Its results are in the report section *Paradigm blocks: dry measure*. `tmp/english-helper-paradigm-reach.csv` lists each missing word, whether it is closed, and the narrowest reach that recovers it.
- The recall script also reports *frame shown*, with a breakdown of the frames not shown. Each item record has a `frame` field, but the metric is not in `HEADLINE`, so the baseline does not keep it yet. These additions raised the recall run time from 84 s to 113 s.

### Reach and cost

These figures are for the 500 checkpoint items. Today 60.6% are self-contained. Of the 234 words missing, 189 are closed. A self-contained sentence costs 25,959 prompt characters, and the median prompt is about 15,100 characters.

| Lean rendering | Self-contained | Closed words recovered | Characters added, median / p90 | Characters per self-contained sentence |
|---|---|---|---|---|
| rows | 63.4% | 16 | 913 / 3,856 | 27,142 |
| table | 68.0% | 45 | 3,248 / 11,187 | 30,063 |
| page | 71.6% | 64 | 5,894 / 18,265 | 32,999 |
| sheet | 78.4% | 107 | 19,113 / 42,025 | 48,556 |
| all (ceiling) | 85.2% | 132 | 69,721 | 100,296 |
| sheet, nearest first, ≤ 3,000 | 67.8% | | 2,980 / 2,995 | 27,410 |
| **sheet, nearest first, ≤ 6,000** | **71.4%** | | 5,949 / 5,995 | **29,917** |
| sheet, nearest first, ≤ 12,000 | 74.4% | | 11,860 / 11,986 | 35,032 |

- The full rendering, with every cell, costs about twice as much as lean for the same coverage, since coverage reads only code spans.
- Dropping the largest block first scores the same as nearest first (71.8% at 6,000). Nearest first is the one adopted because it never drops the table the cue hit just for being large.
- No reach holds *characters per self-contained sentence*. The median prompt is made up of the gloss reader core (7,638), writing rules (2,295), analysis (1,686), task (1,264), examples (936) and tags (633). Trimming examples cannot pay for the blocks.

### What no reach recovers

- **The eight ablation forms.** Blocks reach three of them: `zol` (from rows to sheet, item by item), `gruodol` (table) and `darl` (page). `zayan`, `hwubam` and `grawal` are on a sheet that the analysis never links. `thobathem` and `zahelaln` are on no sheet.
- **On a sheet, never linked (24 closed words):** polar answers (`yom`, `yol`, `yoem`), say words (`hwubam`, `hwuvam`), `grawal`, `gral`, `howar` and `zael`. These are *feature not reached*: a cue or detector miss.
- **On no sheet (57 closed words):** nearly all are built forms that no table lists. They include stance and sake stacks (`thawethamoem`, `thobathem`), spans (`d[azozon]`), live compounds and number codes (`g+25%`). A few are single forms: `zwol`, `gragem`, `gradom`, `gruedol`, `dwor`.

### Frame shown

*Frame shown* starts at 71.4% on checkpoint and 69.8% on doc. Example selection already wants a construction (`c:<id>`, weight 1) when the analysis links its home anchor, but that rule is seldom the one that fails. Of the 789 checkpoint frames not shown:

- 18 were wanted, but no chosen example used them.
- 23 have no example in the index.
- 748 were never wanted. Each of the following would bring part of them in:

| Wanted set | Unwanted frames it would bring in, of 748 |
|---|---|
| Canonical anchors on both sides | 1 |
| Home page linked | 122 |
| Home anchor linked by a shown block's row | 281 |
| Used by a doc example in a linked section | 207 |
| Used by a doc example in a linked section or a shown block row's section | 611 |

Most of the misses are joins (`joins.md#right-close`, `join.o`, *and*-lists) and sakes (`sakes.md#met`). The analysis reaches these through another page: a rank join, for example, through `comparatives.md`.

## Design

### A. Paradigm blocks

- **Index.** As built in Phase 1. The cue index keeps skipping these pages: a block is shown whole, never matched as a cue.
- **Selection.** The reach is the whole sheet, filled nearest first: the tables with a row that links a linked section, then the other tables on the linked pages, then the rest of each sheet those tables sit on. Within each tier the smallest block comes first, and the selection stops at `PARADIGM_CAP` = 6,000 characters. A block that does not fit is skipped, and a smaller one after it may still fit. The blocks go under a new `## Closed forms` heading before the analysis.
- **Rendering.** Each row is one lean line: its forms in backticks, then its English. A span that does not parse as Ageben is notation (`o`, `/ɡ/`, `w+2`) and is dropped, and a row left with no form is dropped. Each row keeps its band from the Stage column, and a staged prompt (`--stage`) drops the rows past its band.
- **Budget.** The cap is the bound. The median prompt grows by about 6,000 characters, and characters per self-contained sentence by about 15%, for about +11 points of self-contained. The baseline takes the new median once.
- **Inspect page.** The blocks, with their links already canonical, travel in `HelperPayload`, and the analysis's links are canonicalized the same way. The CLI, the eval script and the Inspect page then build the same prompt.
- **Coverage.** `promptShows` reads the new section like the rest of the prompt, so *word in prompt* and *self-contained* count the forms with no change to their definitions.

### B. Frames

- **The order rule.** Replace the claim that `h` and `th` words may go anywhere with what the owning pages state: where a restrictor sits relative to the word it restricts, that a rank join follows all the items it ranks, and that a multiplier follows its adjective. Each clause is copied from its page, with the section link in a code comment. If a page does not state the order plainly, that is a doc gap for Open decisions, not a rule to invent here.
- **Wider wanted set.** Phase 1 showed that reach is what fails, not weight. Keep the `c:<id>` feature, and also want each construction that a doc example uses in a linked section (weight 1) or in a shown block row's section (weight 0.5). Example sources (`page.md:line`) give each example's section and the sections that enclose it, and links are compared in canonical form. Rarity weighting already discounts structural constructions. Tune the two weights on *frame shown* and keep the example count as it is.
- **Free metric: frame shown.** For each reference answer, the share of its non-structural constructions that some example in the prompt also uses. Phase 3 guards it on checkpoint, from the `frame` record field. The breakdown of frames not shown stays in the report.

### How each part is tested

| Part | Free | Paid, on the stored 20 items |
|---|---|---|
| A | Checkpoint *self-contained* near the dry 71.4%; characters per self-contained sentence at most about 30,000; wild gap rate flat. (*Closed root row first* reads the analysis rows, so blocks do not move it.) | `oracle-gloss`, against 50%. Blocks reach only `zol`, `gruodol` and `darl` of the eight forms, so expect a partial fall, not 30%. |
| B | *Frame shown* up from 71.4%; nothing else past tolerance | `oracle-words`, against 30% |
| Both | `--check` passes | Plain run, against 55% |

## Implementation plan

Two phases remain. Each is one session in the orchestrator's own context with no subagents, because the work is a handful of source files that share one context. At the end of each phase, and if the user says to stop partway, the agent [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Commits follow the user's standing rule: the agent leaves the tree green and uncommitted unless told otherwise. The paid runs are approved. Before each one, copy the variant's stored `results-<variant>.jsonl` aside so that `--compare` keeps the 2026-11-13 drafts. Report the cost of each run.

### Phase 2: paradigm blocks in the prompt

1. In `llm-prompt.ts`, add selection, rendering and the cap as in part A. Read the row band from the Stage column, and drop notation spans.
2. Carry the blocks in `HelperPayload` (`load.ts`, `browser.ts`), and canonicalize the analysis's links when they are loaded.
3. Strip the Phase 1 scaffolding from the recall script: the dry measure, the `line` style and the `drop-largest` fill. This proposal keeps their numbers. Keep the frame breakdown for Phase 3. Keep the dry measure too until Phase 1 of `english-helper-jev-selection.md` has run or that proposal is rejected, and strip it then.
4. Pin the behavior in `cases.tsv`: a block appears for a linked subsystem, appears once, is absent when nothing links it, and loses its advanced rows on a beginner prompt. Add `llm-prompt.test.ts` cases for the cap and the nearest-first order.
5. Rerun recall and check against the targets in part A, then run `--write-baseline`, which raises the median prompt size once. In [english-helper.md](../../meta/procedures/english-helper.md#decisions), amend *Example budget*: the closed-forms section is bounded by its cap rather than by characters per self-contained sentence.
6. Run `oracle-gloss` on the stored 20 items, and put the result on the Status line.

**Gate:** `npm test`, then recall `--check` with its result on the Status line.

### Phase 3: frames

1. Rewrite the order rule from the owning pages, and log any page that does not state its order.
2. Widen the wanted constructions as in part B. Add tests that a construction used by a linked section's example gets an example that uses it.
3. Guard *frame shown*: add a checkpoint `HEADLINE` entry that reads `frame`, then run `--write-baseline`.
4. Run `oracle-words` and a plain run on the stored 20 items.
5. Update [english-helper.md](../../meta/procedures/english-helper.md): the new metric, the closed-forms section, rows in the ablation table, and Next round. Next round takes these follow-ups:
   - the 24 closed words that are on a sheet but never linked, as *feature not reached*
   - the 57 built forms on no sheet: stance and sake stacks, the ought, the instance ending, spans and number codes, each needing a speller or a frame
   - a trim of the fixed gloss reader core, which is half the prompt (about 7,600 characters), to what the shown examples and blocks use

   Then delete this proposal.

**Gate:** `npm test`, then recall `--check`. There are no grammar prose changes, so no style gate and no build beyond what `npm test` covers.

## Open decisions

None open. The five Phase 1 decisions are on the Status line.

## Background

### Problem

The `--llm-prompt` prompt should let a translator write the Ageben with no other context. The oracle ablations of 2026-11-13 (20 checkpoint items, the same in each column) show where it falls short:

| Miss rate | Plain prompt | Right words given, unordered | Right gloss given, in order |
|---|---|---|---|
| All 20 | 55% | 30% | 50% |
| Self-contained (10) | 30% | 30% | 30% |
| Not self-contained (10) | 80% | 30% | 70% |

Two separate faults account for it.

1. **Closed forms the prompt never spells.** Given the whole plan as a gloss, the drafts still could not write `zol`, `grawal`, `gruodol`, `zayan`, `thobathem`, `hwubam`, `darl` or `zahelaln`. All eight are closed forms: a rank join, a special value, a stacked marker, an address set, an ought, a say word, a stand-in, an instance ending. No lexicon root was missing. Today a closed form reaches the prompt only when an English cue hits the exact table row that spells it.
2. **Order inside a construction.** With every right word handed over, 30% still missed, and four of those six misses were a wrong order. Both compared items go before a rank join (`zazozon zalazun zol gevunom`). `hal` after `herulal` reads *only when*, and before it reads *never*. A multiplier follows its adjective (`garolem hradol`). The prompt's writing rules say `h` and `th` words may go anywhere, which is wrong in these cases.

### Goals

- A closed form is in the prompt whenever the analysis reaches its subsystem at all, whichever row the cue hit.
- For each construction the analysis reaches, the prompt holds one example that shows its word order, and the writing rules say nothing false about order.
- Each part has a free metric that predicts its paid result, so later rounds can steer without a model call.
- Translation miss on the 20 ablation items falls, measured against the stored runs.

### Non-goals

- No new forms, cues on grammar pages, or recipe rows. Those stay in the helper's ordinary [loop](../../meta/procedures/english-helper.md#the-loop).
- No change to what the helper is: it suggests, and never writes the sentence. No gloss compiler, no planning step in the reply, no whole-grammar prompt.
- Sentences where no slot reaches the subsystem at all. That is a cue or detector miss, and it stays on the worklist.
- Stage pages and cheat sheets are read, not edited.
