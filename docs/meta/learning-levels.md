# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish **all beginner** sections across the folder before **intermediate**, then **advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Translation checkpoints at band ends: [translation-exercises.md](translation-exercises.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

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

- Tag **sections** inside each grammar doc (`## Beginner`, `## Intermediate`, `## Advanced`), rather than splitting files by level. Omit a later band when it would only recap or list unused slots ([empty or pointless bands](grammar-docs.md#empty-bands)).
- Do **not** score every morph. For each H2/H3, run the three questions, pick a band, move on.
- When bands conflict, **dependency wins** over subjective difficulty.
- Boundary cases needed early for reading examples → prefer the **earlier** band.
- Grammar prose: [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) — no teaser links to peers the path has not reached yet.
- A thin Beginner that only says “see Intermediate” does **not** earn a Beginner slot. Give one usable pattern, or drop the page from the Beginner path.

## Cross-doc path
<a id="cross-doc-path"></a>

Read **`docs/grammar/`** only, in band order. [why-agelan.md](../grammar/why-agelan.md) and [introduction.md](../grammar/introduction.md) are orientation (not bands).

### Beginner

1. [why-agelan.md](../grammar/why-agelan.md) — psychological purpose, limits, feature criteria, benefit tour (not a learning band)
2. [introduction.md](../grammar/introduction.md) — name, grammar design, how to learn
3. [core.md Beginner](../grammar/core.md#beginner)
4. [vowel-series.md](../grammar/vowel-series.md#beginner) (one-screen map; not a new morph)
5. [phonology.md Beginner](../grammar/phonology.md#beginner) (letters / word edges; optional early)
6. [reference-suffix.md Beginner](../grammar/reference-suffix.md#beginner)
7. [pronouns.md](../grammar/pronouns.md#beginner) · [plurality.md](../grammar/plurality.md#beginner)
8. [predication.md](../grammar/predication.md#beginner)
9. [coordination.md](../grammar/coordination.md#beginner)
10. [questions.md](../grammar/questions.md#beginner)
11. [revisers.md](../grammar/revisers.md#beginner) · [restrictors.md](../grammar/restrictors.md#beginner)
12. [spans.md](../grammar/spans.md#beginner)
13. [numbers.md](../grammar/numbers.md#beginner) · [comparatives.md](../grammar/comparatives.md#beginner) · [causation.md](../grammar/causation.md#beginner)
14. [values.md](../grammar/values.md#beginner) · [ability.md](../grammar/ability.md#beginner) · [commentary.md](../grammar/commentary.md#beginner) · [roles.md](../grammar/roles.md#beginner) · [x-compounds.md](../grammar/x-compounds.md#beginner) · [plan-decision.md](../grammar/plan-decision.md#beginner)

Numbers Intermediate / Advanced and [numeric-derivation.md](../grammar/numeric-derivation.md) are **optional** — not required to finish a first dialogue corpus. [join-extras.md](../grammar/join-extras.md) and leftover [special-vocabulary.md](../grammar/special-vocabulary.md) start at Intermediate (no Beginner slot). [plan-decision.md](../grammar/plan-decision.md) **DECISION** is Intermediate; plan / predict is Beginner.

### Intermediate then Advanced

15. Every peer’s **[Intermediate](../grammar/core.md#intermediate)** section (same dependency order as above is fine). Skip pages with no Intermediate (vowel-series). Numbers Intermediate, [numbers-applied.md](../grammar/numbers-applied.md#intermediate), leftover join / overlay pages, and [plan-decision.md](../grammar/plan-decision.md#intermediate) **DECISION** / forecast source belong here.
16. Every peer’s **Advanced** section. Numbers Advanced and [numeric-derivation.md](../grammar/numeric-derivation.md) stay **optional**.

Learner-facing reading order: site sidebar (**Suggested reading order**); banding notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
