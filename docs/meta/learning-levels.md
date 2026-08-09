# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish **all beginner** sections across the folder before **intermediate**, then **advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Rollout (folder move, `core.md` rename, banding): [migration-grammar-docs.md](migration-grammar-docs.md).

Grammar pages must not link here or mention `meta/` — editors use this rubric privately.

## Rubric (three questions)

Ask in order. Prefer the **earlier** band when a concept sits on a boundary and learners need it to read ordinary examples.

1. **Usable after one short explanation?**  
   Can someone use it in ordinary dialogue after roughly one paragraph and a couple of examples (and at most a second of thought once practiced)?  
   If yes → **beginner** (or at least not advanced). Aligns with the language’s [easy-to-use feature criterion](../introduction.md#criterion-for-features).

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

1. Read every **`docs/grammar/`** doc’s **Beginner** sections (start from [introduction.md](../introduction.md) for orientation, then [language-reference.md](../language-reference.md) **Beginner** for core sentences, then the other peers in that folder; exact order can be listed here once more docs carry section tags — paths become `../grammar/…` after Phase 0 of the [migration](migration-grammar-docs.md)).
2. Then every **Intermediate** section (including [language-reference.md Intermediate](../language-reference.md#intermediate)).
3. Then every **Advanced** section.

[language-reference.md](../language-reference.md) is the first grammar page with **Beginner** / **Intermediate** / **Advanced** bands; other `grammar/` docs still need the same pass.
