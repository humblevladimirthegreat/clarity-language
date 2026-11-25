# Scope model: what is left

**Status:** IDEA, 2026-11-25. The scope model shipped (phases 1 to 5, 2026-11-24 to 2026-11-25): family profiles, the boundary table and the discourse-slot table in code, owned by [interpreter.md](../../meta/interpreter.md#scope-statements), and the teaching page [How far a word reaches](../../grammar/intermediate/word-reach.md) with its [cheat sheet](../../grammar/cheat-sheets/word-reach.md). Decided by agent, awaiting review: 2026-11-24, carried frames pass into clause-join members, dependents and islands (high, not flagged, `95f8ffc3`); 2026-11-25, terminology names *reach*, *cover*, *box* and *remark* (medium, not flagged, `6df7598b`). Decided 2026-11-24 (user): edits to existing pages got no style review, because a full style pass over them follows later; that pass should cover the cuts on `clause.md` (its remark row now lists the contrary stance), `feelings.md`, `for-a-sake.md` and `mirative.md` (`0ad16c63`).

**Related:** [scope-profiles.ts](../../../src/parse/scope-profiles.ts); [discourse-slots.ts](../../../src/parse/discourse-slots.ts); [scope-report.ts](../../../src/interpret/scope-report.ts); [holder.md](../../grammar/intermediate/holder.md#what-the-holder-covers); [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md#stand-in-back); [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md#past-a-period); [questions.md](../../grammar/beginner/questions.md).

## Problem

Two scope readings are still unsettled, so the scope page and its cheat sheet teach around them: whether the seam word stays outside every holder-owned word before it, not only a sake word (D20), and what the goodbye sentence itself reads (D21). Several smaller gaps turned up while the model was built.

## Sketch

- **D20 (a):** extend the `seam-word` rule (step 7 of the rule order) from `underSeam: sake` to every holder-owned family that can precede the seam word, after listing the changed examples with `find.mjs`; then state it on `holder.md` and drop the sake-only wording from `word-reach.md#whose-it-is`.
- **D21:** state the two `eventSentence` sub-cells on the `sentenceBefore` and `answer` goodbye cells (today `unstated (today: keeps)`); for (c), also let a point-back inside the goodbye sentence reach back, so all four rows treat it alike. Then add the goodbye sentence to `word-reach.md#past-the-period` and the cheat sheet's slot table (its goodbye cells now read only *for the sentences after it*).
- **Smaller gaps:**
  - No reader test covers the goodbye behavior (point-backs, sentence-before and answer stop at a goodbye); only the slot-table tests do.
  - A `-rth` stand-in such as `darth` can point back to a hello (`alahelan.`) as the last statement, though a greeting claims nothing.
  - The `topic` slot row's end events name *by the way* but not *next* (`xevewom`), which [topic.md](../../grammar/intermediate/topic.md#topic) says also clears the topic; check that the row and the reader agree.
  - The scope report does not walk the members of a dependent's reading (`d/m0`, `d/m1`), so `--diff` can miss a change there, and does not record `holderHost`, so it counts seam-word pairs as `text`.

## Open questions

**D20. Does the seam word stay outside everything the holder owns, wherever it sits? (blocking: precedent).** S10 made the seam word cover a sake word under a holder wherever either sits (D16). Other holder-owned words before the seam word, such as `thul` before `thevumazozon`, still keep text order, so they read as covering it. D16's reason (the seam word marks the edge of the holder's view, so nothing the holder owns covers it) applies to them as well, but extending it sets a rule across families and changes readings no unit has listed. Options:
- (a) Extend the `seam-word` rule to every holder-owned family that can come before the seam word, after listing with `find.mjs` the examples it changes.
- (b) Keep it to sake words, as now.

**Recommendation:** (medium) (a): D16's reason does not depend on the family, and a learner told *the seam word is yours wherever it sits* would expect it to hold for every word in the clause.

**D21. Does the goodbye sentence itself still read the sentence-before and answer slots? (blocking: precedent, and restricting what a learner can say for (b)).** A goodbye ends `sentenceBefore` and `answer` for the sentences after it (D18). The goodbye sentence itself still reads them today, so *yes, bye* (`yel zazozon develal. yaol alazuxan.`) answers the question, and so does `alazuxan zazozon.`. The end-cell type defines *ends* to include the event sentence, and S11 followed that for `standInBack` and `hookResume`: a point-back inside the goodbye sentence (`alazuxan zahelan vuguyol aor.`) no longer reaches back. No doc example has a goodbye. Options:
- (a) The goodbye sentence still reads both slots: state the two `eventSentence` sub-cells as *keeps*.
- (b) It reads neither, as the type defines *ends*: *yes, bye* no longer answers.
- (c) As (a), and a point-back inside the goodbye sentence also reaches back, so all four rows treat the goodbye sentence alike.

**Recommendation:** (medium) (c): answering and leaving in one breath is a form a learner reaches for, and one rule for the goodbye sentence across the four rows is less to learn. (a) is the smaller step.
