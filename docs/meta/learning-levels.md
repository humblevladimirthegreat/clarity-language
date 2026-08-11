# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish **all beginner** sections across the folder before **intermediate**, then **advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md).

Grammar pages must not link here or mention `meta/` — editors use this rubric privately.

## Rubric (three questions)
<a id="rubric-three-questions"></a>

Ask in order. Prefer the **earlier** band when a concept sits on a boundary and learners need it to read ordinary examples.

1. **Usable after one short explanation?**  
   Can someone use it in ordinary dialogue after roughly one paragraph and a couple of examples (and at most a second of thought once practiced)?  
   If yes → **beginner** (or at least not advanced). Aligns with the language’s [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features).

2. **Does it depend on another subsystem already being fluent?**  
   If the form only makes sense after joins, numbers, values, spans, etc. are already comfortable → at least **intermediate**.  
   Prefer **dependency** over “feels hard”: freestanding but dense material (e.g. basic **-l** / **-m** / **-n**) can stay beginner; easy-feeling but stacked material (e.g. rank joins for *the biggest*) can be intermediate.

3. **Edge-case, stylistic, or rare inventory?**  
   Hyperbole landmarks, uncommon span variants, overlay sense-forms, and similar → **advanced**. Learners should not need these to finish a first dialogue corpus.

## How to apply

- Tag **sections** inside each grammar doc (`## Beginner`, `## Intermediate`, `## Advanced`), rather than splitting files by level.
- Do **not** score every morph. For each H2/H3, run the three questions, pick a band, move on.
- When bands conflict, **dependency wins** over subjective difficulty.
- Boundary cases needed early for reading examples → prefer the **earlier** band.

## Cross-doc path
<a id="cross-doc-path"></a>

Read **`docs/grammar/`** only, in band order. [why-agelan.md](../grammar/why-agelan.md) and [introduction.md](../grammar/introduction.md) are orientation (not bands).

### Beginner

1. [why-agelan.md](../grammar/why-agelan.md) — psychological purpose, limits, feature criteria, benefit tour (not a learning band)
2. [introduction.md](../grammar/introduction.md) — name, grammar design, how to learn
3. [core.md Beginner](../grammar/core.md#beginner)
4. [phonology.md Beginner](../grammar/phonology.md#beginner) (letters / word edges; optional early)
5. [reference-suffix.md Beginner](../grammar/reference-suffix.md#beginner)
6. [pronouns.md](../grammar/pronouns.md#beginner) · [plurality.md](../grammar/plurality.md#beginner) · [questions.md](../grammar/questions.md#beginner)
7. [predication.md](../grammar/predication.md#beginner) · [revisers.md](../grammar/revisers.md#beginner) · [restrictors.md](../grammar/restrictors.md#beginner)
8. [coordination.md](../grammar/coordination.md#beginner) · [spans.md](../grammar/spans.md#beginner)
9. [numbers.md](../grammar/numbers.md#beginner) · [comparatives.md](../grammar/comparatives.md#beginner) · [causation.md](../grammar/causation.md#beginner)
10. [values.md](../grammar/values.md#beginner) · [special-vocabulary.md](../grammar/special-vocabulary.md#beginner) · [x-compounds.md](../grammar/x-compounds.md#beginner)

### Intermediate then Advanced

10. Every peer’s **[Intermediate](../grammar/core.md#intermediate)** section (same dependency order as above is fine).
11. Every peer’s **Advanced** section.

Learner-facing reading order: site sidebar (**Suggested reading order**); banding notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
