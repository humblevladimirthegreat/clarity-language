# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish **all beginner** sections across the folder before **intermediate**, then **advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Translation checkpoints at stage ends: [translation-exercises.md](translation-exercises.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

Grammar pages must not link here or mention `meta/` — editors use this rubric privately.

## Rubric (three questions)
<a id="rubric-three-questions"></a>

Ask in order. Prefer the **earlier** stage when a concept sits on a boundary and learners need it to read ordinary examples.

1. **Usable after one short explanation?**  
   Can someone use it in ordinary dialogue after roughly one paragraph and a couple of examples (and at most a second of thought once practiced)?  
   If yes → **beginner** (or at least not advanced). Aligns with the language’s [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features).

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

Read **`docs/grammar/`** only, in stage order. [why-agelan.md](../grammar/why-agelan.md) and [introduction.md](../grammar/introduction.md) are orientation (not stages).

### Beginner

1. [why-agelan.md](../grammar/why-agelan.md) — psychological purpose, limits, feature criteria, benefit tour (not a learning stage)
2. [introduction.md](../grammar/introduction.md) — name, grammar design, how to learn
3. [phonology.md Beginner](../grammar/phonology.md#beginner) (letters / word edges)
4. [reference-suffix.md Beginner](../grammar/reference-suffix.md#beginner) (citation **-l** / **-m** / **-n**)
5. [clause.md Beginner](../grammar/clause.md#beginner)
6. [dependents.md Beginner](../grammar/dependents.md#beginner)
7. [pronouns.md](../grammar/pronouns.md#beginner) · [plurality.md](../grammar/plurality.md#beginner)
8. [predication.md](../grammar/predication.md#beginner)
9. [vowel-series.md](../grammar/vowel-series.md#beginner) (one-screen map; not a new morph)
10. [joins.md](../grammar/joins.md#beginner)
11. [questions.md](../grammar/questions.md#beginner)
12. [hooks.md](../grammar/hooks.md#beginner) · [restrictors.md](../grammar/restrictors.md#beginner)
13. [relations.md Beginner](../grammar/relations.md#beginner)
14. [spans.md](../grammar/spans.md#beginner)
15. [numbers.md](../grammar/numbers.md#beginner) · [comparatives.md](../grammar/comparatives.md#beginner) · [causation.md](../grammar/causation.md#beginner)
16. [values.md](../grammar/values.md#beginner) · [intention.md](../grammar/intention.md#beginner) · [knowing.md](../grammar/knowing.md#beginner) · [roles.md](../grammar/roles.md#beginner) · [x-compounds.md](../grammar/x-compounds.md#beginner) · [intention.md](../grammar/intention.md#beginner)

[join-across-roles.md](../grammar/join-across-roles.md) starts at Intermediate (no Beginner slot). Emotion compose and numbered alternatives are Intermediate sections in [values.md](../grammar/values.md#emotion-compose) and [numbers-applied.md](../grammar/numbers-applied.md#numbered-alternatives); universality is Advanced in [knowing.md](../grammar/knowing.md#universality). [intention.md](../grammar/intention.md) **DECISION** is Intermediate; plan / predict is Beginner. [numbers-applied.md](../grammar/numbers-applied.md) starts at Intermediate (depends on numbers). [numeric-derivation.md](../grammar/numeric-derivation.md) is Advanced-only.

### Intermediate then Advanced

17. Every peer’s **[Intermediate](../grammar/clause.md#intermediate)** section (same dependency order as above is fine). Skip pages with no Intermediate (vowel-series). Include numbers Intermediate, [numbers-applied.md](../grammar/numbers-applied.md#intermediate), join-across-roles and overlay material, and [intention.md](../grammar/intention.md#intermediate) **DECISION** / forecast source.
18. Every peer’s **Advanced** section, including numbers Advanced, [relations.md](../grammar/relations.md#as-of) *as-of*, and [numeric-derivation.md](../grammar/numeric-derivation.md). Skip pages with no Advanced.

Learner-facing reading order: site sidebar (**Suggested reading order**); stage notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
