# Proposal: swap `ae` and `oe` in the join series

**Status:** PROPOSED (not current language). Grammar today: join vowels **`ae`** = [equative / equal rank](../grammar/comparatives.md#equatives) (`zael` *as … as*) and **`oe`** = [sequence](../grammar/joins.md#sequence-oe) (`zoel` *A, then B*).  
**Related:** [joins.md](../grammar/joins.md), [comparatives.md](../grammar/comparatives.md), [join-across-roles.md](../grammar/join-across-roles.md), [hooks.md](../grammar/hooks.md#extra-noun-intermediate) (unchanged), [design-decisions.md](../meta/design-decisions.md) (the six standard stacks).  
**Design authority:** none until absorbed.

## Motivation

Join vowels read left to right as a stack of the single-vowel joins: **`ua`** is *undo, then add* ([joins.md](../grammar/joins.md#everything-ua)). Read the same way, the two rank stacks come out backwards today:

| Stack | Stack reading | Today | Reads naturally as |
|-------|---------------|-------|--------------------|
| **`ae`** | **a** ≈ add, then **e** ≈ order | equal rank | *and, in order* = **sequence** |
| **`oe`** | **o** ≈ one, then **e** ≈ order | sequence | *one rank* = **tie / equal rank** |

Today's cues are strained: sequence is "one + order: one after another", and the equative is "add + order; they share a rank". The swap makes both cues derive from the stack. It also keeps **`a`** an additive vowel (an itinerary or *and then* is an add that carries order), and puts the tie beside **`e`** (A over B) and **`ue`** (nothing at the bottom) as three statements about rank.

## Proposed shape

| Join | Today | Proposed |
|------|-------|----------|
| `zael` / `zaem` | equative: *as … as* / *about as … as* | sequence: *A, then B* / *roughly A, then B* |
| `zoel` / `zoem` | sequence | equative |

Only the **join series** changes. Everything else about each join stays as it is:

- Arity table (multi / single-item / standalone), closed **-l** and open **-m**.
- SHARED `/ɡ/` and `/h/` behavior: the equative still takes a shared scale; the sequence still sorts low to high with one.
- Stance bars before the join (`BAR_SERIES`): the bar sits before the equative's fence, so it moves with the equative to `oe`.
- Role letters: every join carries one, so `vael` / `xael` / `thael` become sequence and `voel` / `xoel` / `thoel` become equative.

New cues:

- **`ae`** ≈ add + order: *and then*.
- **`oe`** ≈ one + order: one shared rank.

## Out of scope: stacks that are not joins

Single vowels stay consistent across the grammar. Stacked vowels are chosen per domain, so these keep their current stacks:

- Hooks **`ael`** *using* and **`oel`** *toward* (and **`aem`** / **`oem`**), the hook **`ael`** *in fact*, **`oel`** *A through B*.
- Role compounds: **`ae`** instrument, **`oe`** goal.
- Scope stacks **`thae`** / **`thoe`**, and the sakes SEEKING (**`oe`**) / FAWN (**`ae`**) rows.
- Calendar-date marker **`oe`** ([numbers-applied.md](../grammar/numbers-applied.md)).
- Speech particles **`yael`** / **`yaem`**.

Prefixed joins carry a role letter and hooks do not, so `bael` (sequence) and the hook `ael` never collide in the parser. The one visible echo is for readers.

One wording follow-up: the hook cue for **`ael`** (*add an ordered means*) borrows the old join sense of order. It should be reworded to stand alone (for example *add to the aim: the means that serves it*). That is a hook-table edit, not a change of meaning.

## Why not the alternatives

- **Keep as is.** Both cues stay strained, and `ae` as a tie is the one place where an add-vowel does not add.
- **Swap everything, hooks included.** `oel` *toward* composes cleanly from `ol` *at* + `el` *for*; it loses that if it moves to `ae`. `ael` *using* has no better home either way. Nothing is gained by dragging the hooks along.
- **Reassign to a new stack** (such as a reversed `eo`). Rejected already: reversed or extra pairs are too easy to confuse by ear with their standard twins ([design-decisions.md](../meta/design-decisions.md)).

## Cost

Effort only. Every example is a silent meaning flip (`zael` and `zoel` stay the same length), so the edit must be driven by construction search (`scripts/find.mjs`), not text replace.

- **Grammar:** [joins.md](../grammar/joins.md) (equative / sequence sections, the SHARED table, the `zel` vs `zoel` compare), [comparatives.md](../grammar/comparatives.md) (equatives, ratio, stance bars), [join-across-roles.md](../grammar/join-across-roles.md), [say-amounts.md](../grammar/say-amounts.md), [say-people-places.md](../grammar/say-people-places.md) (possessive-stack closer `boel` becomes `bael`), [say-questions.md](../grammar/say-questions.md) (join-question table and checkpoints), [say-reasons.md](../grammar/say-reasons.md), [numbers-applied.md](../grammar/numbers-applied.md), [knowing.md](../grammar/knowing.md) and [sakes.md](../grammar/sakes.md) where a join `ae` / `oe` is used.
- **Parser:** the series table and `RANK_SERIES` / `BAR_SERIES` / `SCALE_SERIES` in `src/parse/series.ts` (the two entries swap their jobs; the sets then read `oe` for the equative and `ae` for the ordering rank), plus `sentence-parser.ts` and the gloss inverse.
- **Tests and corpus:** `parse.test.ts`, `resolve.test.ts`, `sentence-parser.test.ts`, `morph-gloss.test.ts`, the syntax-test corpus and results, and checkpoint exercises.
- **Meta:** [unassigned-reserved.md](../meta/unassigned-reserved.md) and [glosses.md](../meta/glosses.md) if they name the old readings.
- Per [AGENTS.md](../../AGENTS.md), the parser change ships in the same change as the grammar edit.

## Open points

1. Wording of the new **`ae`** and **`oe`** cues.
2. Whether to reword the hook **`ael`** cue in the same change.
3. Whether to note, once in the introduction, that only single vowels are shared across the grammar and stacks are per-domain.
