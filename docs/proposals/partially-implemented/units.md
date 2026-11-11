# Units

**Status:** Partially implemented. Phase 1 (units in the sidebar) shipped on 2026-11-11: the unit arrays in `reading-order.ts` hold 9 Beginner, 17 Intermediate, and 5 Advanced units, and the unit principles are in [learning-levels.md](../../meta/learning-levels.md#units). The later phases below are not scheduled; each needs its own go-ahead. User decisions: units are cut by file size, not taught-line counts; units are collapsible and not numbered (2026-11-10); when a Review word can't move to its earliest reviewer, one new item at an earlier checkpoint introduces it (2026-11-11, `erula` on `clause-sequence`). Not done: `npm run grammar-map -- --write`, because `docs/meta/grammar-map.md` is not in the tree; the generator groups by unit when it is next run.

**Related:** [reading-order.ts](../../grammar/.vitepress/lib/reading-order.ts), [learning-levels.md](../../meta/learning-levels.md), [translation-exercises.md](../../meta/translation-exercises.md), [lexicon.md](../../meta/procedures/lexicon.md), [plan-units.ts](../../../scripts/plan-units.ts)

**Depends on:** none.

**Design authority:** *none*. Units are an organizing layer; they add, remove, and change no form or reading.

## Problem

Units group each band's sittings in the sidebar, but a unit is only a title so far. A learner can't see what a unit lets them do or which units it assumes, nothing practises a unit as a whole, and vocabulary is not tied to a unit's theme.

## Goals

- Say what each unit is for, where the learner meets it.
- Practise each unit as a whole.
- Tie new vocabulary to the unit's theme.

## Non-goals

- Unit summary pages.
- Units for the Claritish track, the recipe track, or the cheat sheets.
- New sittings, splits, or band moves. A sitting that is too heavy (for example `evidentiality.md`, which leaves *How you know* at two sittings) is a separate restructure.

## Later phases (not scheduled)

- **Unit intro block.** A short generated block at the top of a unit's first sitting, or a sidebar tooltip, giving the unit's title, what it lets the learner do, and which units it assumes.
- **Unit capstone practice.** One `### Practice` per unit, on its last sitting, that combines the unit's sittings. Policy goes in [translation-exercises.md](../../meta/translation-exercises.md).
- **Vocabulary slices.** Each unit introduces a themed slice of `core` vocabulary that its sittings and checkpoints use. Checkpoint word banks draw on the current unit and the units before it.

## Implementation plan

None yet; a phase gets its plan when it is scheduled. If the user says to stop partway through a phase, the agent [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

A reorder or a new unit table is checked with `npm run plan-units -- --units <table> --suggest`.

## Open decisions

None.
