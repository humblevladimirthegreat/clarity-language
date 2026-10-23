# Proposal: Band gates, then reassign and reorder sittings

**Status:** Phase 1 done. Gates are in [learning levels](../meta/learning-levels.md). Phases 2–5 apply the inventory; then absorb. Not design authority; fold leftover notes into learning levels and [grammar-docs](../meta/grammar-docs.md), then drop.  
**Related:** [learning levels](../meta/learning-levels.md) ([gates](../meta/learning-levels.md#gates), [order inside a band](../meta/learning-levels.md#order-inside-a-band)), [empty stages](../meta/grammar-docs.md#empty-stages), [page skeleton](../meta/grammar-docs.md#page-skeleton), [later-stage shape](../meta/grammar-docs.md#later-stage-shape), [stage checklist](../meta/grammar-docs.md#stage-checklist), [feature criteria](../meta/feature-criteria.md#easy-to-use), [level reviews](../meta/translation-exercises.md#level-reviews), [recipe track](../meta/grammar-docs.md#recipe-track).  
**Code:** [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts), [`learning-order.ts`](../../src/lint/learning-order.ts), [`lint-forward-links.ts`](../../scripts/lint-forward-links.ts), [`constructions.ts`](../../src/parse/constructions.ts).

Do not run remaining phases in parallel with peels.

## Problem

The former three-question rubric mixed three jobs:

- **Usable after one explanation** is a veto on Beginner, not a band assignment.
- **Depends on another subsystem** is an order constraint, not a reason to promote.
- **Edge / rare / stylistic** is the only question that names a band. “First dialogue corpus” is the right idea, but it is not a test.

So dependency assigned bands ad hoc. Stacked-but-ordinary jobs drifted Intermediate; first-corpus combinations could not sit late in Beginner after their homes. The grouped-sittings pass kept the three-pass story and left in-group reorder out of scope. Criteria now live in [learning levels](../meta/learning-levels.md); this file owns the reanalysis.

## Decision

Policy: [bands](../meta/learning-levels.md#bands), [gates](../meta/learning-levels.md#gates), [order inside a band](../meta/learning-levels.md#order-inside-a-band). Do not score. Do not derive the sidebar from a solver.

## What this changes about the old rubric

| Old habit | Replacement |
|-----------|-------------|
| “Stacked → Intermediate” | Stacked → later **in the same band**, unless it fails corpus or usable |
| “Dense but freestanding → Beginner” | Keep: usable + first-corpus beats “feels hard” |
| “Needed to read examples → earlier stage” | Keep, but first try **thinning examples** or **a smaller slice**, not a silent band shift |
| “Easy → not Advanced” | Keep as the Advanced veto; easy + not first-corpus is Intermediate |
| “Do not score every morph” | Keep; the unit is still a sitting |

## Rules

These hold for every session. A **phase is a named cluster.** One split (or two clean twins) per session. Finish a phase’s rows before starting the next. Do not start a later phase in the same session.

1. **No parallel peels.** One sitting per file (grouped-sittings is absorbed).
2. **Do not move Beginner parent slugs.** The first sitting of a topic that kept the original filename stays that URL. Demote ineligible H3s by peeling them *off* onto a new Intermediate sitting. Promote a *whole* Intermediate sitting by changing `band:` and the sidebar row only (URL and content stay). To add a Beginner slice of an Intermediate-only topic, make a **new** Beginner file named by job; do not empty the Intermediate URL.
3. **Stable heading ids.** A split keeps `{#id}`s. Rewrite `parent.md#id` wherever the id now lives (`docs/`, `src/parse/constructions.ts`, overlay CSV, lexicon `core` cells, game `source` strings, cheat sheets, Claritish `<!-- Source … -->` comments).
4. **No new forms, no pedagogy rewrite.** Do not teach a new construction while moving bands. A promotion may **thin** examples and drills that use later homes (gate 4 option 3). Do not merge H3s, promote H4s, or refill a checkpoint except to drop a leak. Job splits still follow *S* > 10 ([drill-generation](../meta/drill-generation.md)).
5. **AGENTS.md stays topics.** When a job leaves a parent, edit that row’s Owns line. Add a row only for a new topic. Do not number sittings.
6. **Reviews follow the sitting.** The review item for a sitting lives in that sitting’s band file. A band move moves the item. A split gives the new sitting its own item at the end of its group (or in that group’s review).
7. **Lint stays green.** Do not suspend `npm run build`. Skip `grammar-check`, `llm-eval`, and `english-helper-recall` unless those trees change. After a learner-visible edit: `npm run cheat-sheet-blocks -- --write`, then `npm run build`. Phases 2–4 use `[skip-cd]`. Phase 5 (or the next commit) does not, so the published sidebar matches the gates.
8. **One sitting per session** inside a phase. A whole-sidebar reorder is not one session. Two sittings only when they are the same mechanical edit (two `band:` flips, no split, no new file).

## Phased plan

Each phase below is a cluster. Open this file, take the first undone row in the current phase, apply it, mark the row and the matching Inventory row done. New Beginner files are named by **job**. Parent URLs stay.

**Dispatch** on the row’s smell:

| Smell / shape | Do |
|---------------|----|
| Whole-sitting promote or demote | Change `band:`, move the sidebar row, move the review item, thin leaks if promoting. No new file. Do not demote a Beginner parent slug — convert that row to a split and do the split instead. |
| Split (slice passes a gate, or Beginner parent would be demoted) | Peel the leaving H3 cluster onto a new file named by **job**, with the new `band:`. Keep `{#id}`s. Parent keeps its URL and remaining band. Intermediate-only topic gaining a Beginner slice: **new** Beginner file; Intermediate URL unchanged. Reuse `npm run peel-band` only if a whole remaining band is leaving (should not happen after regroup). Otherwise copy by hand and rewrite anchors the way the peel script does. A `peel-headings` script is allowed on the second split if the first was painful. Update AGENTS.md Owns, construction homes, cheat-sheet blocks, Claritish Source comments, lexicon `core` cells. |
| **inverted-home** or other in-band reorder | Editorial only; do not sort by score. Swap the pair or restore one contiguous cluster (spine, then topic cluster, then purpose, then reuse). Change the three sidebar lists (and `readingOrder` if it still feeds the lint). How to learn keeps naming the spine, not every row. Fix leaks; do not reshuffle core roots for taste. |

### Phase 1 — Gates and inventory

**Done.** [learning-levels.md](../meta/learning-levels.md) states the gates and within-band order; the three questions are gone. [Stage checklist](../meta/grammar-docs.md#stage-checklist) and empty-stages cite the gates. Inventory below. No learner pages, no sidebar change.

### Phase 2 — First-corpus talk

Ordinary dialogue jobs that drifted Intermediate because they stack. Homes are already Beginner.

- **speech-acts.md** — split: firm/soft (`#speech-act`, including *-r*) → new B file; parent keeps tone marks, stacking, manner.
- **left-bound.md** — split: adjectives before the noun (`#left-bound-adjectives`) → new B file; parent keeps chaining / degree / leaving-out. Thin family-name examples that need proper-names.
- **ending-grids.md** — split: extra-noun two-vowel + genitive `em` → new B file; parent keeps discourse grids.
- **fill-ask-roles.md** — split: what kind / when / where / whose / how / why → new B file; parent keeps arity + blank-in-dependent. After the ending-grids B slice (`em` for *whose*).
- **discourse-hooks.md** — split: somewhere / nowhere / everywhere + here/there → new B file; parent keeps stacked discourse, hook resume, parallel chains.
- **of-relations.md** — split: social relations → new B file; parent keeps locative / of.
- **join-across-roles.md** — split: clause sequence (`#clause-sequence`) → new B file; parent keeps VP / stance / join-act. Thin the *try* cross-ref.
- **numbers-applied.md** — split: digit-strings + time → new B file; parent keeps letter codes, measures, ranges, percent.

### Phase 3 — Purpose slices

High-frequency purpose moves. Late Beginner, after sakes / knowing / predication.

- **ability.md** — split: ability / incapability → new B file; parent keeps decision / try / want. Thin FORMER examples.
- **evidentiality.md** — split: channel pick (LIVE / MEMORY as the usable slice; other channels may stay on the I parent) → new B file; parent keeps strength, source, forecast, holder.
- **label-scope.md** — split: `#label-scope` → new B file; parent keeps classification packaging, commands to be ADJ, SAME endings.
- **feelings-permission.md** — split: thanks/sorry → new B file; parent keeps emotion compose, attitude, permission/consent. Compose stays I (**purpose-with-no-slice**; Claritish is the early hit).
- **prescription.md** — split: ought `the` → new B file; parent keeps motive, attachment, whose stake, bars.
- **notional-standing.md** — split: already / still / not yet / no longer → new B file; parent keeps mirative, residue/former, notional, channel bars.
- **iff-fault.md** — split: fault → new B file; parent keeps iff, CAUSE, following-sentence recap.

### Phase 4 — Leftovers

- **stance-bars.md** — split: vague amounts (*many* / *few*) → new I file; parent stays A (every bar). After the evidentiality B slice if *many* uses PATTERN.
- **clause.md** — inverted-home: thin or drop `#intention-adverbs` (ability lives later). After the ability B slice, or sooner if the stub still names a later band.

### Phase 5 — Reorder

Put each new B file late Beginner after its homes; purpose slices after sakes / knowing / predication; restore topic clusters. How to learn still names the spine only. One contiguous cluster per session.

### Absorb

When phases 2–5 have no pending row at the start of the session: confirm every Inventory **Proposed** matches the sidebar (or the row’s note says why it stayed). Fold any leftover editor note into [learning-levels.md](../meta/learning-levels.md) (how to apply + order inside a band). Drop this file. Do not keep a construction-by-construction scorecard in meta.

## Inventory

One row per sitting (reviews and orientation omitted). Corpus / usable are for the sitting as a whole; a **split** row means only a named slice passes the Beginner gate.

**Smell:** **promoted-by-stack** (I because it stacks, but a first-corpus slice is usable → late B); **demoted-by-rarity** (inventory that is not first-corpus / not rare → later band); **purpose-with-no-slice** (high-payoff map failed usable; split or leave I and keep Claritish); **inverted-home** (uses a later home); **ok** (gates match; no move).

| Sitting | Corpus? | Usable? | Homes | Now | Proposed | Smell | Notes |
|---------|---------|---------|-------|-----|----------|-------|-------|
| phonology.md | y | y | — | B | B | ok | spine |
| word-endings.md | y | y | phonology | B | B | ok | spine; greeting |
| clause.md | y | y | word-endings | B | B | inverted-home | spine; `#intention-adverbs` names ability (later band) |
| speech-moves.md | y | y | clause | B | B | ok | spine; statements, questions, commands |
| dependents.md | y | y | speech-moves | B | B | ok | *who/that*, poles, times, continue |
| pronouns.md | y | y | word-endings | B | B | ok | *I/you/it*, resume |
| plurality.md | y | y | pronouns | B | B | ok | associative *-x*; counted plural is numbers |
| predication.md | y | y | clause | B | B | ok | *is ADJ*, SAME |
| joins.md | y | y | clause | B | B | ok | *and*-lists; rank intro for comparatives |
| questions.md | y | y | speech-moves, joins | B | B | ok | yes/no, *who/what*, polar |
| hooks.md | y | y | clause | B | B | ok | including; *in/at/from/for* |
| restrictors.md | y | y | clause | B | B | ok | always / sometimes / only when |
| relations.md | y | y | clause | B | B | ok | *like*, exchange, proxy |
| spans.md | y | y | clause | B | B | ok | quotes, loans, asides |
| numbers.md | y | y | word-endings | B | B | ok | counts, ordinals, *more than one* |
| comparatives.md | y | y | joins | B | B | ok | *bigger*, *the most*, *as … as* |
| causation.md | y | y | dependents | B | B | ok | *if*, *only if* |
| sakes.md | y | y | clause | B | B | ok | purpose slice; inventory is the pick-list |
| knowing.md | y | y | clause | B | B | ok | MAY |
| roles.md | y | y | clause | B | B | ok | dense; *a teacher* is first-corpus |
| compounds.md | y | y | word-endings | B | B | ok | two roots, `x` |
| intention.md | y | y | clause | B | B | ok | PLAN |
| phonotactics.md | n | y | phonology | I | I | ok | finish phonology; letter names |
| proper-names.md | n | y | word-endings | I | I | ok | finish names; greeting already B |
| left-bound.md | y | n | clause | I | B `gl-`; I chaining | promoted-by-stack | *angry dog* is first-corpus; chaining is not |
| speech-acts.md | y | n | speech-moves | I | B firm/soft; I rest | promoted-by-stack | *please* / *let's*; tone marks stay I (stylistic, not first-corpus) |
| sentence-linkers.md | n | y | dependents, joins | I | I | ok | discourse machinery |
| tag-pronouns.md | n | y | pronouns | I | I | ok | several referents |
| topic.md | n | y | pronouns | I | I | ok | discourse machinery |
| collectives.md | n | y | plurality, joins | I | I | ok | finish plurality |
| label-scope.md | y | n | predication | I | B label-scope; I packaging | promoted-by-stack | *angry this time*; packaging / SAME endings finish predication |
| rank-joins.md | n | y | joins, comparatives | I | I | ok | finish rank; superlative already B |
| polar-inventory.md | n | y | questions | I | I | ok | finish polar |
| fill-ask-roles.md | y | n | questions, hooks, causation | I | B kind/when/where/whose/how/why; I arity + blank-in-dependent | promoted-by-stack | Beginner milestone wants place, time, reason |
| ending-grids.md | y | n | hooks | I | B extra-noun 2-vowel + `em`; I discourse grids | promoted-by-stack | *on/near/using*, *Uzozen's* |
| discourse-hooks.md | y | n | hooks, pronouns | I | B somewhere + here/there; I stacked/resume | promoted-by-stack | *here/there/somewhere* |
| more-occasions.md | n | y | restrictors, dependents | I | I | ok | finish restrictors |
| of-relations.md | y | n | relations | I | B social; I locative/of | promoted-by-stack | *Uzozen's friend* |
| span-mention.md | n | y | spans, left-bound | I | I | ok | mention vs cite |
| number-markers.md | n | y | numbers | I | I | ok | finish number word-shape |
| digitless-exponents.md | n | y | numbers | I | I | ok | approx / OoM |
| comparative-arity.md | n | y | comparatives | I | I | ok | finish scales |
| iff-fault.md | y | n | causation, sakes | I | B fault; I iff/CAUSE | promoted-by-stack | blame is purpose; iff is not first-corpus |
| prescription.md | y | n | sakes | I | B ought `the`; I motive/bars | promoted-by-stack | *should* for a named sake |
| feelings-permission.md | y | n | sakes, hooks | I | B thanks/sorry; I compose + permission | purpose-with-no-slice | thanks is usable; emotion compose is not (Claritish keeps the early hit) |
| evidentiality.md | y | n | knowing | I | B LIVE/MEMORY; I strength/source/holder | promoted-by-stack | how-you-know in the first stretch |
| notional-standing.md | y | n | clause | I | B phasal; I mirative/residue/notional | promoted-by-stack | *already/still/not yet*; residue stays I |
| viewpoint.md | n | y | roles, hooks | I | I | ok | spatial grammar, not first stretch |
| compound-families.md | n | y | compounds, roles | I | I | ok | finish `x` families |
| ability.md | y | n | word-endings, compounds | I | B can/can't; I decision/try/want | promoted-by-stack | thin FORMER examples if promoting |
| join-across-roles.md | y | n | joins | I | B sequence `xan`; I VP/stance/join-act | promoted-by-stack | *and then* |
| numbers-applied.md | y | n | numbers | I | B digit-strings + time; I codes/measures/ranges | promoted-by-stack | clock/calendar is “enough time” |
| singability.md | n | y | phonology | A | A | ok | singing / speech edges |
| emphasis.md | n | y | speech-moves | A | A | ok | stylistic / clefts |
| stand-in-roles.md | n | y | sentence-linkers | A | A | ok | rare inventory |
| join-islands.md | n | y | joins | A | A | ok | rare arities |
| hook-compounds.md | n | y | hooks | A | A | ok | *walk from* already works; fusion not needed |
| as-of.md | n | y | notional-standing | A | A | ok | skippable for an everyday corpus |
| span-nesting.md | n | y | spans | A | A | ok | editorial close |
| stacked-markers.md | n | y | numbers | A | A | ok | stacked number machinery |
| special-values.md | n | y | numbers | A | A | ok | hyperbole / infinity |
| stance-bars.md | y | n | comparatives, evidentiality | A | I vague amounts; A every bar | demoted-by-rarity | *many/few* is everyday combination, not rare |
| universality.md | n | y | evidentiality | A | A | ok | dated channel |
| root-tails.md | n | y | phonology | A | A | ok | dictionary mnemonic |
| initials.md | n | y | numbers-applied, proper-names | A | A | ok | stacked numbers; kin-generations is not *mom* |
| numeric-derivation.md | n | y | numbers, compounds | A | A | ok | numeric prefixes |

## Out of scope

- One file per H3, or a computationally derived lesson list (dependency / difficulty / usefulness scores). Grouped related lessons is sittings plus job splits when *S* > 10.
- Changing the three-pass story, cheat-sheet Stage column meaning, or the recipe track.
- Folders per topic (`hooks/…`).
- Teaching new forms, closing grammar gaps, or refill-for-coverage of checkpoints.
- Reordering Claritish (update Source comments when a heading moves; do not restack those lessons).
- Band-aware search.

## Done when

- [x] [learning-levels.md](../meta/learning-levels.md) states the gates and within-band order; the three questions are gone.
- Every sitting has an Inventory row, and the published sidebar matches **Proposed** (or an explicit note why a row stayed).
- Beginner parent slugs still teach their Beginner sitting.
- Reviews, cheat-sheet Stage, construction homes, and lexicon `core` cells resolve.
- How to learn still describes three groups and still names the spine.
- This file has been absorbed and dropped.
