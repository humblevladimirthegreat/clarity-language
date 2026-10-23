# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish the **Beginner** sidebar group before **Intermediate**, then **Advanced**. Levels are assigned with a **small fixed rubric**, applied **loosely** — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Translation checkpoints at stage ends: [translation-exercises.md](translation-exercises.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

Grammar pages must not link here or mention `meta/` — editors use this rubric privately.

## Rubric (three questions)
<a id="rubric-three-questions"></a>

Ask in order. Prefer the **earlier** stage when a concept sits on a boundary and learners need it to read ordinary examples.

1. **Usable after one short explanation?**  
   Can someone use it in ordinary dialogue after roughly one paragraph and a couple of examples (and at most a second of thought once practiced)?  
   If yes → **beginner** (or at least not advanced). Aligns with the language’s [easy-to-use feature criterion](feature-criteria.md#easy-to-use).

2. **Does it depend on another subsystem already being fluent?**  
   If the form only makes sense after joins, numbers, values, spans, etc. are already comfortable → at least **intermediate**.  
   Prefer **dependency** over “feels hard”: freestanding but dense material (e.g. basic **-l** / **-m** / **-n**) can stay beginner; easy-feeling but stacked material (e.g. rank joins for *the biggest*) can be intermediate.

3. **Edge-case, stylistic, or rare inventory?**  
   Hyperbole landmarks, uncommon span variants, overlay sense-forms, and similar → **advanced**. Learners should not need these to finish a first dialogue corpus.

## How to apply

- One sitting per file, marked with front matter `band: beginner | intermediate | advanced`. The sidebar groups sittings by band. Peel a later band off a parent with `npm run peel-band` rather than tagging several bands with H2s on a new page. Omit a later sitting when it would only recap or list unused slots ([empty or pointless stages](grammar-docs.md#empty-stages)).
- Sibling splits by **job** when *S* > 10 still apply ([drill-generation](drill-generation.md)); this split is by **sitting**. Later sittings of the same topic use a job title, not the topic name again.
- Do **not** score every morph. For each sitting, run the three questions, pick a stage, move on.
- When stages conflict, **dependency wins** over subjective difficulty.
- Boundary cases needed early for reading examples → prefer the **earlier** stage.
- Grammar prose: [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) — no teaser links to peers the path has not reached yet. Later-stage H3s: [Intermediate and Advanced stage shape](grammar-docs.md#later-stage-shape).
- A thin Beginner that only says “see Intermediate” does **not** earn a Beginner sitting. Give one usable pattern, or drop the page from the Beginner path.

## Cross-doc path
<a id="cross-doc-path"></a>

Read **`docs/grammar/`** only, in the three sidebar groups: every Beginner sitting, then Intermediate, then Advanced. Each group ends with its review. [purpose.md](../grammar/purpose.md) and [introduction.md](../grammar/introduction.md) are orientation (not sittings); they sit above the Beginner group. Learner-facing [How to learn](../grammar/introduction.md#how-to-learn) matches this.

[causation.md](../grammar/causation.md), [intention.md](../grammar/intention.md), [pronouns.md](../grammar/pronouns.md), [questions.md](../grammar/questions.md) and [roles.md](../grammar/roles.md) have no Advanced sitting: their former Advanced sections were applications and live on the recipe track.

### Recipe track (outside the stages) {#recipe-track}

[english.md](../grammar/english.md) and the `say-*.md` pages (**Saying it in Agebon**) sit outside the stage order and off the three lesson groups. Each recipe answers an English job with forms taught elsewhere and lists them on a **Needs:** line. Stage pages never link to the track ([recipe track](grammar-docs.md#recipe-track)).

Learner-facing reading order: site sidebar (the three groups); stage notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
