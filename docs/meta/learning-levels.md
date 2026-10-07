# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish **all beginner** sections across the folder before **intermediate**, then **advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Translation checkpoints at stage ends: [translation-exercises.md](translation-exercises.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

Grammar pages must not link here or mention `meta/` — editors use this rubric privately.

## Rubric (three questions)
<a id="rubric-three-questions"></a>

Ask in order. Prefer the **earlier** stage when a concept sits on a boundary and learners need it to read ordinary examples.

1. **Usable after one short explanation?**  
   Can someone use it in ordinary dialogue after roughly one paragraph and a couple of examples (and at most a second of thought once practiced)?  
   If yes → **beginner** (or at least not advanced). Aligns with the language’s [easy-to-use feature criterion](../grammar/why-agazan.md#criterion-for-features).

2. **Does it depend on another subsystem already being fluent?**  
   If the form only makes sense after joins, numbers, values, spans, etc. are already comfortable → at least **intermediate**.  
   Prefer **dependency** over “feels hard”: freestanding but dense material (e.g. basic **-l** / **-m** / **-n**) can stay beginner; easy-feeling but stacked material (e.g. rank joins for *the biggest*) can be intermediate.

3. **Edge-case, stylistic, or rare inventory?**  
   Hyperbole landmarks, uncommon span variants, overlay sense-forms, and similar → **advanced**. Learners should not need these to finish a first dialogue corpus.

## How to apply

- Tag **sections** inside each grammar doc (`## Beginner`, `## Intermediate`, `## Advanced`), rather than splitting files by level. Omit a later stage when it would only recap or list unused slots ([empty or pointless stages](grammar-docs.md#empty-stages)).
- Do **not** score every morph. For each H2/H3, run the three questions, pick a stage, move on.
- When stages conflict, **dependency wins** over subjective difficulty.
- Boundary cases needed early for reading examples → prefer the **earlier** stage.
- Grammar prose: [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) — no teaser links to peers the path has not reached yet. Later-stage H3s: [Intermediate and Advanced stage shape](grammar-docs.md#later-stage-shape).
- A thin Beginner that only says “see Intermediate” does **not** earn a Beginner slot. Give one usable pattern, or drop the page from the Beginner path.

## Cross-doc path
<a id="cross-doc-path"></a>

Read **`docs/grammar/`** only, in stage order. [why-agazan.md](../grammar/why-agazan.md) and [introduction.md](../grammar/introduction.md) are orientation (not stages).

### Beginner

1. [why-agazan.md](../grammar/why-agazan.md) — psychological purpose, limits, feature criteria, benefit tour (not a learning stage)
2. [introduction.md](../grammar/introduction.md) — name, grammar design, how to learn
3. [phonology.md Beginner](../grammar/phonology.md#beginner) (letters / word edges)
4. [word-endings.md Beginner](../grammar/word-endings.md#beginner) (citation **-l** / **-m** / **-n**)
5. [clause.md Beginner](../grammar/clause.md#beginner)
6. [speech-moves.md Beginner](../grammar/speech-moves.md#beginner)
7. [dependents.md Beginner](../grammar/dependents.md#beginner)
8. [pronouns.md](../grammar/pronouns.md#beginner) · [plurality.md](../grammar/plurality.md#beginner)
9. [predication.md](../grammar/predication.md#beginner)
10. [joins.md](../grammar/joins.md#beginner)
11. [questions.md](../grammar/questions.md#beginner)
12. [hooks.md](../grammar/hooks.md#beginner) · [restrictors.md](../grammar/restrictors.md#beginner)
13. [relations.md Beginner](../grammar/relations.md#beginner)
14. [spans.md](../grammar/spans.md#beginner)
15. [numbers.md](../grammar/numbers.md#beginner) · [comparatives.md](../grammar/comparatives.md#beginner) · [causation.md](../grammar/causation.md#beginner)
16. [sakes.md](../grammar/sakes.md#beginner) · [intention.md](../grammar/intention.md#beginner) · [knowing.md](../grammar/knowing.md#beginner) · [roles.md](../grammar/roles.md#beginner) · [x-compounds.md](../grammar/x-compounds.md#beginner) · [intention.md](../grammar/intention.md#beginner)

Then the [Beginner level review](../grammar/review.md#beginner) ([level reviews](translation-exercises.md#level-reviews)).

[join-across-roles.md](../grammar/join-across-roles.md) starts at Intermediate (no Beginner slot). Emotion compose is an Intermediate section in [sakes.md](../grammar/sakes.md#emotion-compose); channels on a generalization are Advanced in [knowing.md](../grammar/knowing.md#universality). [intention.md](../grammar/intention.md) **DECISION** is Intermediate; plan / predict is Beginner. [numbers-applied.md](../grammar/numbers-applied.md) starts at Intermediate (depends on numbers). [numeric-derivation.md](../grammar/numeric-derivation.md) is Advanced-only.

[causation.md](../grammar/causation.md), [intention.md](../grammar/intention.md), [pronouns.md](../grammar/pronouns.md), [questions.md](../grammar/questions.md) and [roles.md](../grammar/roles.md) have no Advanced stage: their former Advanced sections were applications and live on the recipe track.

### Recipe track (outside the stages) {#recipe-track}

[english.md](../grammar/english.md) and the `say-*.md` pages (**Saying it in Agazan**) sit outside the stage order and off the reading-order sidebar group. Each recipe answers an English job with forms taught elsewhere and lists them on a **Needs:** line. Stage pages never link to the track ([recipe track](grammar-docs.md#recipe-track)).

### Intermediate then Advanced

17. Every peer’s **[Intermediate](../grammar/clause.md#intermediate)** section (same dependency order as above is fine). Include numbers Intermediate, [numbers-applied.md](../grammar/numbers-applied.md#intermediate), join-across-roles and overlay material, and [intention.md](../grammar/intention.md#intermediate) **DECISION** / forecast source.
18. Every peer’s **Advanced** section, including numbers Advanced, [relations.md](../grammar/relations.md#as-of) *as-of*, and [numeric-derivation.md](../grammar/numeric-derivation.md). Skip pages with no Advanced.

Each level closes with its band of [review.md](../grammar/review.md): Intermediate after step 17, Advanced after step 18 (both still to write).

Learner-facing reading order: site sidebar (**Agazan Lessons**); stage notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
