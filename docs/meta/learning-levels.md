# Learning levels (beginner / intermediate / advanced)

Applies **only** to learner grammar pages under **`docs/grammar/`** (not to `meta/`, `examples/`, or `proposals/`). Those pages are organized so a learner can finish the **Beginner** sidebar group before **Intermediate**, then **Advanced**.

**Bands are milestones** (“what can you do when this group is done?”). **Dependency only places** sittings on the path. Assign a sitting with the [gates](#gates) — enough consistency for a cross-doc path, not a score for every morph.

This page is pedagogy, not language design. Design authority stays in the `docs/grammar/` pages. Prose and example style for those pages: [grammar-docs.md](grammar-docs.md). Translation checkpoints at stage ends: [translation-exercises.md](translation-exercises.md). Generating missing checkpoints: [drill-generation.md](drill-generation.md).

Grammar pages must not link here or mention `meta/` — editors use these gates privately.

## Bands
<a id="bands"></a>

Keep the three-pass story (named stop line, reviews, cheat-sheet **B / I / A**). Do not go to one unlabeled lesson list. Do not score sittings, and do not derive the sidebar from a solver.

**Beginner** — after this group, the learner can hold an ordinary first conversation: statements, questions, commands; people and things; enough place, time, and reason to talk; plus the smallest usable slice of each high-frequency purpose move that also passes easy-to-use. They should not need Intermediate to write or read the rest of Beginner.

**Intermediate** — after this group, they can do everyday talk longer than that first stretch: finish maps they already use, handle discourse machinery, and combine two Beginner systems for common English jobs. They should not need Advanced for that.

**Advanced** — rare, stylistic, singing, speech-edge, overlay sense-forms, hyperbole, stacked number machinery. Skip this and you can still finish a full everyday corpus.

Orientation (`purpose.md`, `introduction.md`) is not a band. Applications with no new form stay on the [recipe track](grammar-docs.md#recipe-track).

## Gates
<a id="gates"></a>

Per sitting, not per morph. Do not score. Run in order. Prefer the **earlier** band only when a later gate would leave Beginner examples unwritable. The unit is a sitting (one file). Split a sitting when only a slice passes a gate.

**0. Is it a form?**
New root, overlay, ending reading, role-letter use, word-order/attachment rule, or construction home → a stage sitting.
No new form, common job needed early → short recipe on a stage page ([recipe track](grammar-docs.md#recipe-track)).
No new form, less common English job → recipe track. Stop.

**1. Advanced gate** (any one is enough)
Rare in ordinary speech; stylistic / meter / singing / speech edges; overlay sense-forms; inventory nobody needs for an everyday corpus.
→ **Advanced**. Do not create an Advanced sitting for recap, unused slots, or bounce notes ([empty stages](grammar-docs.md#empty-stages)).

**2. Beginner gate** (all three)

- **Corpus:** Someone speaking ordinary dialogue in the first stretch would hit this English job, *or* many other Beginner sittings cannot show their own examples without it.
- **Usable:** One short explanation, a couple of examples, at most about a second of thought after practice ([easy-to-use](feature-criteria.md#easy-to-use)).
- **Slice:** There is a smallest pattern that does that job without the rest of the paradigm. A thin “see Intermediate” does not count.

→ **Beginner**. If the corpus wants it but the whole map fails usable, **split**: Beginner gets the smallest slice; the rest is Intermediate or Advanced. If you cannot find such a slice, the feature is fighting its own criterion — do not park the whole map in Intermediate as a workaround without noticing that.

**3. Otherwise Intermediate**
Typical shapes (evidence, not extra gates):

- **Finish the series** — rest of a map Beginner already uses.
- **New common job that is not first-corpus** — discourse machinery, identity/label scope, compose grids.
- **Combination** — a job that is the product of two Beginner systems. Combination defaults to Intermediate; override to Beginner only if it still passes gate 2.

**4. Dependency placement** (after the band is chosen)
List every form the sitting *uses in examples or in the definition*. Each home must sit **earlier in the same band** or **in an earlier band**. If that fails, do one of:

1. Pull a smaller slice of the missing home into the earlier band (if that slice passes the Beginner gate).
2. Move this sitting later.
3. Thin this sitting’s examples so they no longer need the later form.

Do **not** promote to Intermediate only because it stacks. Late Beginner, after its homes, is the right place for a first-corpus combination.

Page shape is unchanged: Beginner still [grows one job at a time](grammar-docs.md#beginner-stage-shape); Intermediate may [complete a paradigm as a table](grammar-docs.md#later-stage-shape). That is how you write, not how you assign a band.

## Order inside a band
<a id="order-inside-a-band"></a>

Dependency is the only hard rule. Tie-breaks, in this order:

1. **Hard dependency** — B’s definition or examples use a form whose home is A → A before B.
2. **Spine** — phonology → citation endings → a working clause → turns. Everything else hangs off that.
3. **Topic cluster** — keep one job family together when neither depends on the other. Do not interleave unrelated sittings just because both are free in the graph.
4. **Purpose payoff** — among legal orders, put earlier the Beginner slices that unlock compassion / rationality / empowerment *and already passed the Beginner gate*. This does not pull a form into Beginner by itself. Claritish is the on-ramp when you want the idea before the clause machinery.
5. **Reuse** — a pattern that will be reused across later sittings before a one-off cell of the same difficulty.

Soft dependency (“easier after fluent X”) may swap two sittings that are already legal; it must not cross a band.

## How to apply
<a id="how-to-apply"></a>

- One sitting per file, marked with front matter `band: beginner | intermediate | advanced`. The sidebar groups sittings by band, and the files live on disk as `docs/grammar/{beginner,intermediate,advanced}/`. Public URLs stay flat (`/grammar/clause.html`). Peel a later band off a parent with `npm run peel-band`, or named H3s onto a job-named file with `npm run peel-headings`, rather than tagging several bands with H2s on a new page. Omit a later sitting when it would only recap or list unused slots ([empty or pointless stages](grammar-docs.md#empty-stages)).
- Dispatch: whole-sitting `band:` flip (move the sidebar row and that sitting’s review item; do not demote a Beginner parent slug — peel instead); heading peel onto a job-named file; in-band cluster reorder of the three sidebar lists (no scoring, no solver).
- Sibling splits by **job** when *S* > 10 still apply ([drill-generation](drill-generation.md)); this split is by **sitting**. Later sittings of the same topic use a job title, not the topic name again.
- Do **not** score every morph. For each sitting, run the [gates](#gates), pick a band, then place it with gate 4 and the [within-band order](#order-inside-a-band). Do not teach a new form while moving bands; do not refill a checkpoint except to drop a leak.
- Stacked → later **in the same band**, unless it fails corpus or usable. Dense but freestanding stays Beginner when it is usable and first-corpus. Easy + not first-corpus is Intermediate, not Advanced.
- When examples need a later home, first try **thinning examples** or **a smaller slice**, not a silent band shift.
- Do **not** empty a Beginner parent URL. Demote ineligible H3s by peeling them onto a new Intermediate sitting. Promote a whole Intermediate sitting by changing `band:` and the sidebar row only (URL and content stay). To add a Beginner slice of an Intermediate-only topic, make a **new** Beginner file named by job.
- A split keeps `{#id}`s. Rewrite `parent.md#id` in docs, `constructions.ts`, overlay CSV, lexicon `core`, game `source`, cheat sheets, and Claritish `<!-- Source -->`. `AGENTS.md` stays a routing table of topic nouns: edit the parent’s Owns line when a job leaves; add a row only for a new topic.
- A band move moves that sitting’s review item. A split gives the new sitting its own item at the end of its group (or in that group’s review).
- Grammar prose: [teach now; don’t preview later](grammar-docs.md#teach-now-dont-preview-later) — no teaser links to peers the path has not reached yet. Later-stage H3s: [Intermediate and Advanced stage shape](grammar-docs.md#later-stage-shape).
- A thin Beginner that only says “see Intermediate” does **not** earn a Beginner sitting. Give one usable pattern, or drop the page from the Beginner path.

## Cross-doc path
<a id="cross-doc-path"></a>

Read **`docs/grammar/`** only, in the three sidebar groups: every Beginner sitting, then Intermediate, then Advanced. Each group ends with its review. [purpose.md](../grammar/purpose.md) and [introduction.md](../grammar/introduction.md) are orientation (not sittings); they sit above the Beginner group. Learner-facing [How to learn](../grammar/introduction.md#how-to-learn) matches this.

[causation.md](/causation), [intention.md](/intention), [pronouns.md](/pronouns), [questions.md](/questions) and [roles.md](/roles) have no Advanced sitting: their former Advanced sections were applications and live on the recipe track.

### Recipe track (outside the stages) {#recipe-track}

[english.md](../grammar/english.md) and the `say-*.md` pages (**Saying it in Agebon**) sit outside the stage order and off the three lesson groups. Each recipe answers an English job with forms taught elsewhere and lists them on a **Needs:** line. Stage pages never link to the track ([recipe track](grammar-docs.md#recipe-track)).

Learner-facing reading order: site sidebar (the three groups); stage notes: [introduction.md § How to learn](../grammar/introduction.md#how-to-learn).
