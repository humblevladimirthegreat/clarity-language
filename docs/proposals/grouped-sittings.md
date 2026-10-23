# Proposal: One sitting per file, grouped by band in the sidebar

**Status:** idea. Not design authority; fold into grammar / meta docs, then drop.  
**Related:** [learning levels](../meta/learning-levels.md), [empty stages](../meta/grammar-docs.md#empty-stages), [page skeleton](../meta/grammar-docs.md#page-skeleton), [level reviews](../meta/translation-exercises.md#level-reviews), [AGENTS.md policy](../meta/agents-md.md), [site redirects](../meta/site-redirects.md).  
**Code:** [`docs/grammar/.vitepress/lib/reading-order.ts`](../../docs/grammar/.vitepress/lib/reading-order.ts), [`src/lint/learning-order.ts`](../../src/lint/learning-order.ts), [`scripts/lint-forward-links.ts`](../../scripts/lint-forward-links.ts), [`src/parse/constructions.ts`](../../src/parse/constructions.ts).

## Problem

Grammar pages are both a **subsystem lookup** and a **three-pass course**. Each file owns a topic and splits it with `## Beginner` / `## Intermediate` / `## Advanced`. Learners are told to finish every Beginner section in sidebar order, then come back for Intermediate, then Advanced, and to skip a page with no section at the current level ([How to learn](../grammar/introduction.md#how-to-learn)).

That path is not what the site does:

- The **Agebon Lessons** list is one row per topic, so Topic (Intermediate-only) sits between Pronouns and Plurality during a Beginner pass.
- Prev/next flatten that list. Hashes are stripped, so the three [Level reviews](../grammar/review.md) collapse to one pager stop.
- Later material on the same page cannot be reordered independently of the first sitting. Sibling splits (`topic.md`, `fill-ask-roles.md`, `discourse-hooks.md`, …) already work around this by carving a job onto its own file; they still carry a band H2 so the lints can see a stage.

A runtime filter on today’s pages would hide rows and could patch the pager, but the files would still refuse to be sittings, and Intermediate clicks would open at Beginner unless hrefs grew hashes. If sections are going to be hidden from a pass, they should be **other pages**, grouped in the sidebar the way the path is already written.

## Decision

**One sitting per file. Three sidebar groups: Beginner, Intermediate, Advanced.** VitePress then flattens Beginner items, then Intermediate, then Advanced, so prev/next match How to learn with no theme fork.

Keep the three-pass story (named stop line, reviews, cheat-sheet **B / I / A**, the [rubric](../meta/learning-levels.md#rubric-three-questions)). Do not go to one unlabeled lesson list.

Keep **topic identity** for lookup and for AI: AGENTS.md stays a routing table of topic nouns ([policy](../meta/agents-md.md)), not a catalog of sittings. New files are named by **job** (`topic.md`, not `pronouns-intermediate.md`). Beginner public slugs stay (`joins.md` remains the first sitting).

This supersedes “tag sections inside each grammar doc rather than splitting files by level” in [learning-levels](../meta/learning-levels.md#how-to-apply), [drill-generation](../meta/drill-generation.md), and `practice-scaling.md`. Sibling splits by **job** when *S* > 10 still apply; this split is by **sitting**.

## Rules

These hold for every phase.

1. **Do not move Beginner URLs.** Peel Intermediate and Advanced off the parent. `joins.html#right-close` keeps working. `pageMoves` is for path changes only ([site redirects](../meta/site-redirects.md)); Amplify never sees `#fragments`.
2. **Stable heading ids.** The slice keeps its `{#id}`s. Only the filename changes. Band fragments `#beginner` / `#intermediate` / `#advanced` retire as heading ids; a generated hash map sends them to the sitting’s top.
3. **Page-level band.** Front matter `band: beginner | intermediate | advanced` marks the whole file. Drop the `## Beginner` (etc.) H2 in the same peel. Do not leave a bounce heading.
4. **Job titles on later sittings.** The sidebar group already says the band. The row is the English job (*Rank joins*, *Hooked joins*), picked from the slice’s first real H3 at peel time. Three rows named “Phonology” is a misclick.
5. **No recap, no pedagogy rewrite.** Copy the slice. A **Needs:** line only when the dependency is not obvious from the group. Do not merge H3s, promote H4s, or refill checkpoints in the same sitting as a peel (those stay `practice-scaling.md` / drill generation).
6. **AGENTS.md: one row per topic, slice nouns.** When a job leaves the parent, edit that row’s Owns line. Add a row only when the new file is a new topic (as with `topic.md`). Do not number sittings, and do not grow a duplicate construction index.
7. **Lint stays green; deploys wait.** Do not suspend `npm run build`. Skip Amplify with `[skip-cd]` until the sidebar regroup. Skip `grammar-check`, `llm-eval`, and `english-helper-recall` unless those trees change.
8. **One parent per session** (or two clean peels that share a pattern), same session cap as `practice-scaling.md`. The rewrite script does not make a twelve-file commit cheap to review.

## Tooling (phase 0 — no new grammar pages)

Today a band is only an H2 title ([`pageSections`](../../src/lint/learning-order.ts)). A peeled file with no such H2 is “unbanded,” and construction homes fail. Land dual-mode **before** any peel.

- **`pageSections`:** if front matter has `band`, every section on the page is that band (still honor `## See also`). Otherwise keep H2 detection so unsplit pages pass.
- **`learningOrder` / forward-links:** still “all Beginner, then Intermediate, then Advanced.” Until regroup, that order can come from H2s on unsplit pages plus front matter on peeled ones, walking the current `readingOrder`. After regroup, it comes from the three sidebar lists.
- **Peel script** (`scripts/peel-band.ts` or similar), given parent, band, new slug, and job title:
  1. Copy that H2’s subtree into the new file (new H1, `band:` front matter, `{#id}`s unchanged, checkpoint ids unchanged).
  2. Delete the subtree from the parent, including the old band H2.
  3. If the parent has only one band left, set its `band:` and drop its remaining band H2.
  4. Rewrite `parent.md#id` in `docs/`, `src/parse/constructions.ts`, overlay CSV, lexicon `core` cells, game `source` strings, cheat sheets, wherever the id now lives.
  5. Append a hash-map row for `#intermediate` / `#advanced` on the parent path.
  6. Add the new file to a **holding list** (not yet a visible sidebar group).
- **Hash map + theme snippet:** on `joins.md`, `#intermediate` replaces to the new sitting (keep `?query`). Same-file `#beginner` after the H2 is gone scrolls to the top.
- **Construction homes** that pointed at `hooks.md#beginner` retarget to the first taught H3 (or the H1 id) on that sitting. The script prints the list; do not leave homes on a retired band fragment.
- Then `npm run cheat-sheet-blocks -- --write`.

Policy edits in the same commit: [learning-levels](../meta/learning-levels.md) (how to apply + cross-doc path wording), [page skeleton](../meta/grammar-docs.md#page-skeleton) item 3, [drill-generation](../meta/drill-generation.md) “do not split by level,” empty-stage notes that assume a missing H2 on the same file. How to learn waits for regroup (learner-facing).

After this phase, `npm run build` is green and no public URL has changed.

## What to peel (inventory)

Count is current H2s under `docs/grammar/` lesson pages. Working titles are placeholders; replace with the slice’s job at peel time.

### No peel — already one sitting

Move at regroup only. Add `band:` when convenient (can ride on regroup).

| File | Band | Sidebar text (keep) |
|------|------|---------------------|
| [topic.md](../grammar/topic.md) | I | Topic |
| [fill-ask-roles.md](../grammar/fill-ask-roles.md) | I | Fill-ask roles |
| [discourse-hooks.md](../grammar/discourse-hooks.md) | I | Discourse hooks |
| [join-across-roles.md](../grammar/join-across-roles.md) | I | Join across roles |
| [notional-standing.md](../grammar/notional-standing.md) | I | Notional and standing |
| [feelings-permission.md](../grammar/feelings-permission.md) | I | Feelings and permission |
| [numeric-derivation.md](../grammar/numeric-derivation.md) | A | Numeric prefixes |

### Peel Intermediate off a B+I parent

Parent keeps the Beginner slug.

| Parent | New sitting (working title) |
|--------|-----------------------------|
| [word-endings.md](../grammar/word-endings.md) | Proper names and titled phrases |
| [speech-moves.md](../grammar/speech-moves.md) | Speech acts and tone marks |
| [pronouns.md](../grammar/pronouns.md) | Tags and role pointers (or whatever the Intermediate H3 cluster is) |
| [plurality.md](../grammar/plurality.md) | Associative, clusivity, collectives |
| [predication.md](../grammar/predication.md) | Identity and label scope |
| [questions.md](../grammar/questions.md) | Polar inventory and rhetorical |
| [restrictors.md](../grammar/restrictors.md) | Habitual and `/w/` |
| [causation.md](../grammar/causation.md) | If, iff, fault |
| [sakes.md](../grammar/sakes.md) | Remaining Intermediate on the lattice page |
| [intention.md](../grammar/intention.md) | Decision, try, ability |
| [roles.md](../grammar/roles.md) | Viewpoint and landmark |

### Peel Intermediate and Advanced off a B+I+A parent

Two peels, usually two sessions unless both cuts are clean and the parent is small.

| Parent | Intermediate sitting | Advanced sitting |
|--------|----------------------|------------------|
| [phonology.md](../grammar/phonology.md) | Phonotactics and letter names | Singability and speech edges |
| [clause.md](../grammar/clause.md) | Left-bound adjectives and chaining | Emphasis and audible start |
| [dependents.md](../grammar/dependents.md) | Subordinators and relatives | (Advanced job from that H2) |
| [joins.md](../grammar/joins.md) | Rank joins and fences | Join islands and role grid |
| [hooks.md](../grammar/hooks.md) | Extra-noun grids, *whose*, ranges | Hook compounds, prefixes, hooked joins |
| [relations.md](../grammar/relations.md) | (Intermediate catalog) | As-of |
| [spans.md](../grammar/spans.md) | Asides | Scope islands |
| [numbers.md](../grammar/numbers.md) | Word shape, markers, endings, writing | End-relative, stacked markers, ambient |
| [comparatives.md](../grammar/comparatives.md) | Superlatives / equatives | Stance bars |
| [knowing.md](../grammar/knowing.md) | Evidentiality, holder | Universality, dated channel |
| [compounds.md](../grammar/compounds.md) | Dictionary compounds | Root tails, conversation length |

### Peel Advanced off an I+A parent

| Parent | New sitting (working title) |
|--------|-----------------------------|
| [digitless-exponents.md](../grammar/digitless-exponents.md) | Special values, hyperbole, number as stance |
| [numbers-applied.md](../grammar/numbers-applied.md) | Initials, rays, named ranges |

### Reviews

[review.md](../grammar/review.md) must become **three files**. Prev/next `uniqBy` drops hashes, so `/review#beginner` and `/review#advanced` in two groups still count as one pager node. Keep `review.md` as the Beginner review (stable URL); peel Intermediate and Advanced reviews to new slugs. Hash map `#intermediate` / `#advanced` on `review.md`. Each file sits at the **end of its sidebar group**.

Orientation ([purpose.md](../grammar/purpose.md), [introduction.md](../grammar/introduction.md)) is not a sitting. Show both above the Beginner group (or as the first two Beginner rows without `band:`). They are not in Intermediate or Advanced.

Claritish, Saying it in Agebon, Tools, and Cheat Sheets do not change.

## Phased plan

One session per phase unless the phase says it is several peel sessions.

### Phase 0 — Dual-mode lint, peel script, hash map, editor policy

No new learner pages. Build stays green. Policy now allows sittings; How to learn still describes H2s until regroup.

### Phase 1 — B+I peels

Eleven parents in the second table. Prefer two clean peels per session, small files first (causation, predication, restrictors). Each commit: script, `lint-forward-links`, `lint-agebon`, cheat-sheet blocks, then `npm run build`. `[skip-cd]`. Update the AGENTS.md Owns line when a job leaves.

### Phase 2 — Three-band peels

Eleven parents. Phonology and clause first (short Advanced). Joins, hooks, dependents, relations last. Intermediate then Advanced on the same parent may share a session only when both cuts are contiguous and the parent is not already a 1,400-line edit.

### Phase 3 — Remaining I+A peels

Digitless-exponents and numbers-applied. Numeric prefixes is already Advanced-only.

### Phase 4 — Reviews, regroup, How to learn, deploy

1. Peel the two later reviews; `review.md` is Beginner-only with `band: beginner`.
2. Replace the single Agebon Lessons list plus the Level reviews group with **three groups**. Intermediate and Advanced start `collapsed: true` (VitePress opens the group that contains the current page). Put each review last in its group.
3. One-band files from the first table join their group; no URL change.
4. Holding-list sittings from phases 1–3 become the extra rows, job titles as link text.
5. [How to learn](../grammar/introduction.md#how-to-learn): finish the Beginner group, take its review, then Intermediate, then Advanced. Drop “skip a page with no section at your level.”
6. Cross-doc path in learning-levels becomes “the three sidebar groups.”
7. Drop any leftover band H2s. Confirm the hash map covers every retired `#beginner` / `#intermediate` / `#advanced` on a parent that still exists.
8. Full `npm run build`. Stop using `[skip-cd]` on the regroup commit (or the next one) so the grouped sidebar is what publishes. Paste Amplify redirects only if any **path** was added to `pageMoves` (Beginner slugs should not have been).

After this phase, prev/next is the curriculum. A filter is unnecessary.

## Out of scope

- Reordering inside a group (allowed after regroup; not part of the peel).
- Folders per topic (`hooks/…`). Optional later if AGENTS.md rows get crowded; not required for routing.
- Changing the rubric, cheat-sheet Stage column, or recipe track.
- Band-aware search, or teaching new forms while peeling.
- Runtime sidebar filter on unsplit pages.

## Done when

- Every lesson file has exactly one `band:` (or is orientation).
- Agebon Lessons is three groups; reviews live in those groups; prev/next walks them.
- Cheat-sheet rows, construction homes, and lexicon `core` cells resolve.
- AGENTS.md still fits in one pass and still names topics, not lesson numbers.
- How to learn matches the sidebar.
