# English helper: spell the closed forms, show the frame

**Status:** PROPOSED (2026-11-13). No phase started.

**Related:** [English helper quality](../meta/procedures/english-helper.md) ([oracle ablations](../meta/procedures/english-helper.md#oracle-ablations), [regression net](../meta/procedures/english-helper.md#regression-net)), [cheat sheets](../meta/grammar-docs.md#cheat-sheets), [`src/english-helper/llm-prompt.ts`](../../src/english-helper/llm-prompt.ts), [`src/english-helper/coverage.ts`](../../src/english-helper/coverage.ts), [`scripts/english-helper-recall.ts`](../../scripts/english-helper-recall.ts), [`scripts/english-helper-eval.ts`](../../scripts/english-helper-eval.ts), [`scripts/cheat-sheet-blocks.ts`](../../scripts/cheat-sheet-blocks.ts), [`docs/grammar/cheat-sheets/`](../grammar/cheat-sheets/).

**Depends on:** nothing.

**Design authority:** none. Every change is tool code, or a prompt line that restates what a grammar page already teaches. A form or an order rule that no page states is a grammar gap: log it under Open decisions and leave it.

## Problem

The `--llm-prompt` prompt should let a translator write the Ageben with no other context. The oracle ablations of 2026-11-13 (20 checkpoint items, the same in each column) show where it falls short:

| Miss rate | Plain prompt | Right words given, unordered | Right gloss given, in order |
|---|---|---|---|
| All 20 | 55% | 30% | 50% |
| Self-contained (10) | 30% | 30% | 30% |
| Not self-contained (10) | 80% | 30% | 70% |

Two separate faults account for it.

1. **Closed forms the prompt never spells.** Given the whole plan as a gloss, the drafts still could not write `zol`, `grawal`, `gruodol`, `zayan`, `thobathem`, `hwubam`, `darl` or `zahelaln`. All eight are closed forms: a rank join, a special value, a stacked marker, an address set, an ought, a say word, a stand-in, an instance ending. No lexicon root was missing. The free metrics agree: open-class root top-1 is 92.2%, and closed root row first is 55.8%. Today a closed form reaches the prompt only when an English cue hits the exact table row that spells it.
2. **Order inside a construction.** With every right word handed over, 30% still missed, and four of those six misses were a wrong order. Both compared items go before a rank join (`zazozon zalazun zol gevunom`). `hal` after `herulal` reads *only when*, and before it reads *never*. A multiplier follows its adjective (`garolem hradol`). The prompt's writing rules say `h` and `th` words may go anywhere, which is wrong in these cases. The examples are picked by shared roots and row words, so nothing makes sure one of them shows the frame the sentence needs.

## Goals

- A closed form is in the prompt whenever the analysis reaches its subsystem at all, whichever row the cue hit.
- For each construction the analysis reaches, the prompt holds one example that shows its word order, and the writing rules say nothing false about order.
- Each part has a free metric that predicts its paid result, so later rounds can steer without a model call.
- Translation miss on the 20 ablation items falls, measured against the stored runs.

## Non-goals

- No new forms, cues on grammar pages, or recipe rows. Those stay in the helper's ordinary [loop](../meta/procedures/english-helper.md#the-loop).
- No change to what the helper is: it suggests, and never writes the sentence. No gloss compiler, no planning step in the reply, no whole-grammar prompt.
- Sentences where no slot reaches the subsystem at all (construction recall by page is 47.3%). That is a cue or detector miss, and it stays on the worklist. Phase 1 measures how much of the problem this leaves.
- Stage pages and cheat sheets are read, not edited.

## Design

### A. Paradigm blocks

A **paradigm block** is the small table of closed forms that belong together: every row of one cheat sheet table, with its form, its English and its owning section. The cheat sheets already hold these tables, and most are generated from `data/lexicon-overlays.csv` and `src/closed-roots.ts`, so they stay current without hand work.

- **Index.** At load, read each table under `docs/grammar/cheat-sheets/` into blocks keyed by the owning-section link of each row. The cue index keeps skipping these pages: a block is shown whole, never matched as a cue.
- **Selection.** After the analysis, collect the sections its slots and detectors link. Show each block that owns one of them, once, under a new `## Closed forms` heading before the analysis. How wide a link reaches (the same section, the same page, the whole sheet) is settled by the Phase 1 numbers.
- **Rendering.** One line per row: the spelled form in backticks, then its English. A row whose form is only notation is spelled through the same spellers the analysis uses, or left out.
- **Budget.** The cheat sheets total about 258,000 characters and the median prompt is about 15,100, so blocks must be chosen, not dumped. A cap on block characters per prompt drops the largest block first. The guard stays *characters per self-contained sentence*, which must hold or fall.
- **Coverage.** `promptShows` reads the new section like the rest of the prompt, so *word in prompt* and *self-contained* count the forms with no change to their definitions.

### B. Frames

- **The order rule.** Replace the claim that `h` and `th` words may go anywhere with what the owning pages state: where a restrictor sits relative to the word it restricts, that a rank join follows all the items it ranks, and that a multiplier follows its adjective. Each clause is copied from its page with the section link in the code comment. If a page does not state the order plainly, that is a doc gap for Open decisions, not a rule to invent here.
- **Frame examples.** Every doc example already parses to a list of construction ids, and each id has a home anchor (`constructionRegistry`). Give example selection a third feature kind beside `root:` and `word:`: `construction:<id>`, wanted when the analysis links that construction's home anchor, and weighted above a shared root. The greedy pick then takes, for each wanted construction, an example that uses it. A block from part A can widen the wanted set, since it names sections too.
- **Free metric: frame shown.** For each reference answer, the share of its non-structural constructions that some example in the prompt also uses. It is reported per set, stored per sentence in the baseline, and guarded on checkpoint like the other metrics.

### How each part is tested

| Part | Free | Paid, on the stored 20 items |
|---|---|---|
| A | *closed root row first*, *self-contained* up; characters per self-contained sentence not up | `oracle-gloss` again: with the plan given, a miss is a form the prompt lacks. 50% should fall toward 30%. |
| B | *frame shown* up; nothing else past tolerance | `oracle-words` again: with the words given, a miss is order. 30% should fall. |
| Both | `--check` passes | Plain run on the same 20, against 55%. |

Each paid run of 20 costs about $2, and the three together about $6. They run only when the user says so.

## Implementation plan

Three phases, each one session in the orchestrator's own context: the work is a handful of source files that share one context, so no subagents. At the end of each phase, and if the user says to stop partway, the agent [consolidates the proposal](../meta/procedures/proposals.md#consolidate) before the session ends. Commits follow the user's standing rule: the agent leaves the tree green and uncommitted unless told otherwise.

### Phase 1: measure the ceiling (free)

1. Build the block index (part A, index only; nothing shown yet).
2. In the recall script, add a dry measure: for each checkpoint sentence, would it be self-contained if the blocks for its linked sections were shown? Report it for three reaches (same section, same page, whole sheet), each with the characters it would add at the median and the 90th percentile.
3. Report how many missing closed words no reach recovers, because no slot links their subsystem. Those go to the worklist as *feature not reached* or *opener / structure*.
4. Add the *frame shown* metric (part B, metric only) and record its starting value.

**Gate:** `npm test`; `english-helper-recall -- --check` passes with no guarded metric moved. **Cut here** because the reach and the budget are a user decision that the next phase builds on. Write the three-reach table into Open decision 1 before stopping.

### Phase 2: paradigm blocks in the prompt

1. Selection, rendering and budget cap at the reach chosen in Phase 1.
2. Pin behavior in `cases.tsv`: a block appears for a linked subsystem, appears once, and is absent when nothing links it. Add `llm-prompt.test.ts` cases for the cap.
3. Rerun recall. The headline must rise on checkpoint and wild's gap rate must not, then `--write-baseline`.
4. If the user approves: `oracle-gloss` on the stored 20 items.

**Gate:** `npm test`; recall `--check`, its result on the Status line.

### Phase 3: frames

1. Rewrite the order rule from the owning pages. Log any page that does not state its order.
2. `construction:` features in example selection, with tests that a wanted construction gets an example that uses it.
3. Guard *frame shown* in the baseline.
4. If the user approves: `oracle-words` and a plain run on the stored 20 items.
5. Update [english-helper.md](../meta/procedures/english-helper.md): the new metric, the block section, a row in the ablation table, and Next round. Then delete this proposal.

**Gate:** `npm test`; recall `--check`. No grammar prose changes, so no style gate and no build beyond what `npm test` covers.

## Open decisions

1. **How far a link reaches.** A linked section could bring in only the rows that section owns, every block on that section's page, or the whole cheat sheet. Wider reach recovers more forms and costs more characters and more wrong candidates. **Recommendation:** decide from the Phase 1 table. Take the narrowest reach that recovers most of what the widest one does. Without the numbers there is no basis to choose.
2. **The prompt-size guard.** Blocks will raise the median prompt past the 500-character tolerance. Options: raise the baseline once when Phase 2 lands, or keep the ceiling and trim examples to pay for blocks. **Recommendation:** raise it once, and hold the line on characters per self-contained sentence. The ablation shows a missing form costs far more than a longer prompt.
3. **Cheat sheets as the source.** Blocks could instead be built straight from the overlay CSV and `closed-roots.ts`. **Recommendation:** read the cheat sheets. They already group forms the way a learner looks them up, include the hand-written tables the data does not cover, and carry each row's owning section. The cost is that a sheet edit can move helper scores, which the item-level `--check` now names.
4. **Paid runs.** Three runs of 20 at about $2 each. **Recommendation:** run `oracle-gloss` after Phase 2 and the other two after Phase 3. If only one is affordable, the plain run after Phase 3 is the one that answers whether the whole change worked.
5. **Forms no reach recovers.** Phase 1 will list them. Whether they get cues, detectors, or an always-shown core block (role letters, joins, pronouns, question and negation words) is a follow-up to settle from that list.
