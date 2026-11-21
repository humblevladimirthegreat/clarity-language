# Idea: vocab flashcards v3

**Status:** IDEA 2026-11-21. v2 shipped 2026-11-21: four Ageben packs (Beginner, Intermediate, Advanced, Everything), unlocked one checkpoint at a time, with overlay, ending, set and closed-word notes, built at publish and offered on the [Flashcards](../../grammar/flashcards.md) page; [`docs/meta/flashcards.md`](../../meta/flashcards.md) owns it. **Decided by agent** during v2, kept until the user reviews them:
- 2026-11-21: `gezem` / `govam` on a noun are taught at `more-hinges.md#time-hinge-on-noun` with the other noun hinges; their anchors moved there from beginner `dependents.md#hinges`, whose two sentences naming them went (a `/ɡ/` hinge with `/b/` is taught later). High, not flagged, `9a6714b9`.
- 2026-11-21: the `/ɡ/` and `/w/` as-of resume forms (`genar`, `gunor`, `wenar`, `wunor`) take the snapshot of the matching earlier pair, taught with examples at `as-of.md#as-of`. Medium, not flagged, `99d9109f`.
- 2026-11-21: `hadam` on an event names what the act puts in as the filling (`zazozon vobuvul hadam bledudal` *Azozon pours, filling something with tea*), at `of-relations.md#of-relations`. Medium, not flagged, `a63e020d`.
- 2026-11-21: Anki's default import drops the suspension (it resets scheduling), so the Flashcards page tells the learner to tick **Import any learning progress**, and the U25 import check imports with `with_scheduling=True`; the alternative was a different unlock mechanism. Medium, not flagged, `9e905ed2`.
- 2026-11-21: Anki's default new-card sort (*Card type, then order gathered*) breaks note order within a day, so the Flashcards page tells the learner to set the Ageben preset to **Order gathered**; the alternative, a deck preset inside the `.apkg`, applies only if the learner ticks *Import deck presets* and genanki lacks it. Medium, not flagged, `40cf18cf`.

**Related:** [`src/flashcards.ts`](../../../src/flashcards.ts), [`src/flashcards-examples.ts`](../../../src/flashcards-examples.ts), [`scripts/flashcards-package.py`](../../../scripts/flashcards-package.py), [`scripts/flashcards-check.py`](../../../scripts/flashcards-check.py), [`data/lexicon-overlays.csv`](../../../data/lexicon-overlays.csv).

## Problem

The v2 packs drill each word and grammar form on its own: a word note gives the bare form or one anchor example, and a set note blanks one member of a closed set. A learner never has to produce a form inside a fresh sentence, never sees a root with its ending applied as a prompt, and never has to tell apart two forms that look or sound alike.

## Sketch

- **Cloze from sentences.** Blank a form inside a checked example sentence from its anchor section, never from a checkpoint item (checkpoints stay fresh for the page's Practice).
- **Inflected prompts.** Show a root with a part-of-speech letter and ending applied (as the lessons use it) instead of only the citation form.
- **Confusable pairs.** Cards that set two near forms side by side (a spelling or a meaning), so that the learner must pick one.

## Open questions

- **Which confusable pairs.** A measured list (spelling distance, shared host, same kind) or a hand list? No basis to choose yet; a measurement over the lexicon and overlays would settle it.
- **Stage tag on root and compound notes.** v2 root and compound notes carry `ageben::root` / `ageben::compound` and the checkpoint tag, but no `ageben::stage::<band>` tag (overlay and closed-word notes do). Add it, or drop the stage tag everywhere since the checkpoint tag names the band? **Recommendation:** (medium) add it, so one search by band works across every note type.
