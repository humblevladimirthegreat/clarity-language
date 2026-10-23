# Proposal: Band gates, then reassign and reorder sittings

**Status:** wait until `grouped-sittings.md` **Done when** is true. Not design authority; fold into [learning levels](../meta/learning-levels.md) and [grammar-docs](../meta/grammar-docs.md), then drop.  
**Related:** [learning levels](../meta/learning-levels.md), [empty stages](../meta/grammar-docs.md#empty-stages), [page skeleton](../meta/grammar-docs.md#page-skeleton), [later-stage shape](../meta/grammar-docs.md#later-stage-shape), [stage checklist](../meta/grammar-docs.md#stage-checklist), [feature criteria](../meta/feature-criteria.md#easy-to-use), [level reviews](../meta/translation-exercises.md#level-reviews), [recipe track](../meta/grammar-docs.md#recipe-track).  
**Code:** [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts), [`learning-order.ts`](../../src/lint/learning-order.ts), [`lint-forward-links.ts`](../../scripts/lint-forward-links.ts), [`constructions.ts`](../../src/parse/constructions.ts).

Start this only after the three sidebar groups exist, every lesson file has one `band:`, and How to learn matches the sidebar. Do not run it in parallel with peels.

## Problem

The current rubric ([three questions](../meta/learning-levels.md#rubric-three-questions)) mixes three jobs:

- **Usable after one explanation** is a veto on Beginner, not a band assignment.
- **Depends on another subsystem** is an order constraint, not a reason to promote.
- **Edge / rare / stylistic** is the only question that names a band. “First dialogue corpus” is the right idea, but it is not a test.

So dependency assigned bands ad hoc. Stacked-but-ordinary jobs drifted Intermediate; first-corpus combinations could not sit late in Beginner after their homes. `grouped-sittings.md` keeps the three-pass story and leaves in-group reorder out of scope. This proposal owns the criteria, then the reanalysis.

## Decision

**Bands are milestones** (“what can you do when this group is done?”). **Dependency only places** sittings on the path.

Keep the three-pass story (named stop line, reviews, cheat-sheet **B / I / A**). Do not go to one unlabeled lesson list. Do not score sittings, and do not derive the sidebar from a solver.

**Beginner** — after this group, the learner can hold an ordinary first conversation: statements, questions, commands; people and things; enough place, time, and reason to talk; plus the smallest usable slice of each high-frequency purpose move that also passes easy-to-use. They should not need Intermediate to write or read the rest of Beginner.

**Intermediate** — after this group, they can do everyday talk longer than that first stretch: finish maps they already use, handle discourse machinery, and combine two Beginner systems for common English jobs. They should not need Advanced for that.

**Advanced** — rare, stylistic, singing, speech-edge, overlay sense-forms, hyperbole, stacked number machinery. Skip this and you can still finish a full everyday corpus.

Orientation (`purpose.md`, `introduction.md`) is not a band. Applications with no new form stay on the [recipe track](../meta/grammar-docs.md#recipe-track).

## Gates (per sitting, not per morph)

Do not score. Run in order. Prefer the **earlier** band only when a later gate would leave Beginner examples unwritable. The unit is a sitting (one file after regroup). Split a sitting when only a slice passes a gate.

**0. Is it a form?**  
New root, overlay, ending reading, role-letter use, word-order/attachment rule, or construction home → a stage sitting.  
No new form, common job needed early → short recipe on a stage page.  
No new form, less common English job → recipe track. Stop.

**1. Advanced gate** (any one is enough)  
Rare in ordinary speech; stylistic / meter / singing / speech edges; overlay sense-forms; inventory nobody needs for an everyday corpus.  
→ **Advanced**. Do not create an Advanced sitting for recap, unused slots, or bounce notes ([empty stages](../meta/grammar-docs.md#empty-stages)).

**2. Beginner gate** (all three)  
- **Corpus:** Someone speaking ordinary dialogue in the first stretch would hit this English job, *or* many other Beginner sittings cannot show their own examples without it.  
- **Usable:** One short explanation, a couple of examples, at most about a second of thought after practice ([easy-to-use](../meta/feature-criteria.md#easy-to-use)).  
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

Page shape is unchanged: Beginner still [grows one job at a time](../meta/grammar-docs.md#beginner-stage-shape); Intermediate may [complete a paradigm as a table](../meta/grammar-docs.md#later-stage-shape). That is how you write, not how you assign a band.

## Order inside a band

Dependency is the only hard rule. Tie-breaks, in this order:

1. **Hard dependency** — B’s definition or examples use a form whose home is A → A before B.  
2. **Spine** — phonology → citation endings → a working clause → turns. Everything else hangs off that.  
3. **Topic cluster** — keep one job family together when neither depends on the other. Do not interleave unrelated sittings just because both are free in the graph.  
4. **Purpose payoff** — among legal orders, put earlier the Beginner slices that unlock compassion / rationality / empowerment *and already passed the Beginner gate*. This does not pull a form into Beginner by itself. Claritish is the on-ramp when you want the idea before the clause machinery.  
5. **Reuse** — a pattern that will be reused across later sittings before a one-off cell of the same difficulty.

Soft dependency (“easier after fluent X”) may swap two sittings that are already legal; it must not cross a band.

## What this changes about the old rubric

| Old habit | Replacement |
|-----------|-------------|
| “Stacked → Intermediate” | Stacked → later **in the same band**, unless it fails corpus or usable |
| “Dense but freestanding → Beginner” | Keep: usable + first-corpus beats “feels hard” |
| “Needed to read examples → earlier stage” | Keep, but first try **thinning examples** or **a smaller slice**, not a silent band shift |
| “Easy → not Advanced” | Keep as the Advanced veto; easy + not first-corpus is Intermediate |
| “Do not score every morph” | Keep; the unit is still a sitting |

## Rules

These hold for every phase after the gates are in meta.

1. **No parallel peels.** If `grouped-sittings.md` still has unsplit parents, stop. This proposal assumes one sitting per file.
2. **Do not move Beginner parent slugs.** The first sitting of a topic that kept the original filename stays that URL. Demote ineligible H3s by peeling them *off* onto a new Intermediate sitting. Promote a *whole* Intermediate sitting by changing `band:` and the sidebar row only (URL and content stay). To add a Beginner slice of an Intermediate-only topic, make a **new** Beginner file named by job; do not empty the Intermediate URL.
3. **Stable heading ids.** A split keeps `{#id}`s. Rewrite `parent.md#id` wherever the id now lives (`docs/`, `src/parse/constructions.ts`, overlay CSV, lexicon `core` cells, game `source` strings, cheat sheets, Claritish `<!-- Source … -->` comments).
4. **No new forms, no pedagogy rewrite.** Do not teach a new construction while moving bands. A promotion may **thin** examples and drills that use later homes (gate 4 option 3). Do not merge H3s, promote H4s, or refill a checkpoint except to drop a leak. Job splits still follow *S* > 10 ([drill-generation](../meta/drill-generation.md)).
5. **AGENTS.md stays topics.** When a job leaves a parent, edit that row’s Owns line. Add a row only for a new topic. Do not number sittings.
6. **Reviews follow the sitting.** The review item for a sitting lives in that sitting’s band file. A band move moves the item. A split gives the new sitting its own item at the end of its group (or in that group’s review).
7. **Lint stays green.** Do not suspend `npm run build`. Skip `grammar-check`, `llm-eval`, and `english-helper-recall` unless those trees change. After a learner-visible move: `npm run cheat-sheet-blocks -- --write`, then `npm run build`. `[skip-cd]` until a smell-category batch is done, then publish.
8. **One sitting per session** (or one contiguous cluster that shares a smell). A whole-sidebar reorder is not one commit.

## Phased plan

### Phase 0 — Wait

Confirm `grouped-sittings.md` **Done when**: every lesson file has one `band:` (or is orientation); Agebon Lessons is three groups; reviews live in those groups; prev/next walks them; How to learn matches the sidebar.

Do not inventory or move sittings before that. The path is shifting during peels; a table filled now would be wrong.

### Phase 1 — Gates into meta (no learner pages)

Replace the three questions in [learning-levels.md](../meta/learning-levels.md) with the gates and within-band order above. Keep “do not score”; keep the cross-doc path as “the three sidebar groups.” Retarget [stage checklist](../meta/grammar-docs.md#stage-checklist) and any other meta cite of `#rubric-three-questions`. Empty-stages still omit recap / bounce sittings.

`npm run build` is skippable (meta only). No sidebar change.

After this phase, the gates are policy. This file remains the plan for phases 2–5.

### Phase 2 — Inventory (read-only)

One line per sitting, appended to **Inventory** below. Do not move files.

| Sitting | Corpus? | Usable? | Homes | Now | Proposed | Smell | Notes |
|---------|---------|---------|-------|-----|----------|-------|-------|

**Smell** is one of:

- **promoted-by-stack** — Intermediate only because it needs joins, numbers, or extra nouns, but the English job is first-corpus and a small slice is usable → candidate for late Beginner.  
- **demoted-by-rarity** — Beginner inventory that is not first-corpus and is really “finish the series” → Intermediate.  
- **purpose-with-no-slice** — high-payoff form that failed usable as a whole → split, or leave Intermediate and keep Claritish as the early hit.  
- **inverted-home** — uses a form whose home is later in the same band (or in a later band).  
- **ok** — gates match the current band; no move.

Fill every sitting before any move. Then sort the worklist: promotions that do not split, demotions that do not split, splits, then within-band inversions.

### Phase 3 — Whole-sitting band moves

For each **ok-to-move-whole** row: change `band:`, move the sidebar row, move the review item, thin leaks if promoting. No new file. One sitting per session unless two obvious twins share the pattern.

Do not demote a Beginner parent slug; those rows wait for phase 4.

### Phase 4 — Splits

When only a slice passes the Beginner gate, or a Beginner parent would otherwise have to be demoted:

- Peel the leaving H3 cluster onto a new file named by **job**, with the new `band:`. Keep `{#id}`s. Parent keeps its URL and remaining band.
- Intermediate-only topic gaining a Beginner slice: **new** Beginner file; Intermediate URL unchanged.
- Reuse `npm run peel-band` only when the leaving slice is a whole remaining band on an unsplit leftover (should not happen after regroup). Otherwise copy by hand and rewrite anchors the way the peel script does. Do not build a solver; a `peel-headings` script is allowed on the second split if the first was painful.
- Update AGENTS.md Owns, construction homes, cheat-sheet blocks, Claritish Source comments, lexicon `core` cells.

Same session cap as a peel: one split (or two clean twins).

### Phase 5 — Within-band reorder

Editorial only. Do not sort by score.

1. Fix **inverted-home** pairs (hard dependency).  
2. Restore **spine** if a move broke phonology → endings → clause → turns.  
3. Restore **topic clusters**, then **purpose payoff**, then **reuse**.

Change the three sidebar lists (and `readingOrder` if it still feeds the lint). How to learn keeps naming the spine, not every row. Forward-links, leak index, and core vocabulary follow the new path; fix leaks, do not reshuffle core roots for taste.

One contiguous cluster per session. Stop using `[skip-cd]` when the last inversion in a band is done (or the next commit), so the published sidebar matches the gates.

### Phase 6 — Absorb and drop

Confirm the Inventory proposed column matches the sidebar. Fold any leftover editor note into [learning-levels.md](../meta/learning-levels.md) (how to apply + order inside a band). Drop this file. Do not keep a construction-by-construction scorecard in meta.

## Inventory

Fill in phase 2. Leave empty until then.

## Out of scope

- One file per H3, or a computationally derived lesson list (dependency / difficulty / usefulness scores). Grouped related lessons is sittings plus job splits when *S* > 10.
- Changing the three-pass story, cheat-sheet Stage column meaning, or the recipe track.
- Folders per topic (`hooks/…`).
- Teaching new forms, closing grammar gaps, or refill-for-coverage of checkpoints.
- Reordering Claritish (update Source comments when a heading moves; do not restack those lessons).
- Band-aware search.

## Done when

- [learning-levels.md](../meta/learning-levels.md) states the gates and within-band order; the three questions are gone.
- Every sitting has an Inventory row, and the published sidebar matches **Proposed** (or an explicit note why a row stayed).
- Beginner parent slugs still teach their Beginner sitting.
- Reviews, cheat-sheet Stage, construction homes, and lexicon `core` cells resolve.
- How to learn still describes three groups and still names the spine.
- This file has been absorbed and dropped.
