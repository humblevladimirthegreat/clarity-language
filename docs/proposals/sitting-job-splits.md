# Split later sittings onto job-titled pages

**Status:** Phase 1 shipped. Not design authority; fold into grammar / meta, then drop.  
**Related:** [learning levels](../meta/learning-levels.md#how-to-apply), [later-stage shape](../meta/grammar-docs.md#later-stage-shape), [peel headings](../../scripts/peel-headings.ts), [drill generation](../meta/drill-generation.md), [level reviews](../meta/translation-exercises.md#level-reviews).

A title-and-organization pass already renamed leftover Intermediate / Advanced titles and promoted wrapper subsections. It did **not** split. This file is the worklist and the per-session prompt.

## Problem

Several Intermediate and Advanced sittings still teach unrelated English jobs that happened to peel off the same Beginner parent. A sitting whose title has to list families (`Surprise, residue, and as-if`, `Role scope and viewpoint`) is too big. Later sittings of a topic should use a **job title** (the slice’s first real H3), not the parent topic name again.

## Goals

1. Each sitting names **one English job**.
2. Same band as the parent unless the [gates](../meta/learning-levels.md#gates) say otherwise.
3. No new forms. No emptied Beginner parent URLs. Public URLs stay flat.

## Non-goals

- Scoring sittings or deriving the sidebar from a solver.
- Splitting a page whose H3s finish **one** series (rank joins, every/none, how you know).
- Creating a sitting that only recaps, lists unused slots, or bounces ([empty stages](../meta/grammar-docs.md#empty-stages)). Fold recap into the last sitting that teaches, or drop it. Combination of two Beginner systems is allowed on one Intermediate sitting when it is still one English job.
- Recipe-track pages. If a leftover H3 adds no form, it may belong on [Saying it in Ageben](/english) instead of a new sitting. Stage pages never link to that track.

## Phases

One **agent session per phase**. Each phase is two or three parent pages, dry-run peels, hand-split Practice, review items, sidebar order, then `npm run build`. Do not start the next phase in the same session if build is still red or Practice is unfinished.

Copy the **Session prompt** below, then the phase’s worklist.

Ids below were current when this file was written. Re-read the parent before peeling; pin `{#id}` if a slug is unstable.

| Phase | Parents | Why this bundle |
|-------|---------|-----------------|
| 1 | `viewpoint.md`, `feelings-permission.md`, `notional-standing.md` | Strongest kitchen-sink titles. **Done.** |
| 2 | `ability.md`, `span-mention.md`, `of-relations.md` | **done** |
| 3 | `singability.md`, `join-across-roles.md`, `universality.md` | Place-name leftover; join leftovers; dated channel. **Peels applied; Practice / reviews / build remaining.** |
| 4 | `polar-inventory.md`, `iff-fault.md`, `sentence-linkers.md` | Rest of the must-split list |
| 5 | Optional leftovers in [Phase 5](#phase-5) | Only if the parent title is still a list of unrelated jobs |
| 6 | Sweep | Titles, sidebar order, AGENTS Owns, cheat sheets, reviews |

When a phase finishes, mark its rows done in this file (or move the file to `partially-implemented/` once Phase 1 has shipped).

---

## Session prompt (every phase)

Split the parents named in this phase of `sitting-job-splits.md`. Call the language **Ageben**. Present the current language only. Open the owning grammar page; do not trust titles or ids from memory.

### Peel

Dry-run, then `--write`. Copy the command from the phase worklist. `--ids` names heading ids (an H3 takes its nested H4s). The tool keeps `{#id}`s, rewrites `parent.md#id` across docs / src / data, appends a sidebar row, and refuses to leave the parent with no taught H3. It does **not** split Practice, does **not** add a review item, and appends the sidebar row at the **end** of the band. Move that row to sit next to the parent ([order inside a band](../meta/learning-levels.md#order-inside-a-band)).

Optional `--h1-id` when the default H1 id would collide with a remaining H3 or `<a id>`. After a heading rename, change the heading **and** the id; do not leave a silent `<a id="old">`.

Suggested `--to` slugs and titles are starting points. Change them if a better job title is obvious. Skip a row if, on a fresh read, the leftover sections are one family. Pin `{#id}` on an H3 before peeling it if it has none.

### After each peel (or a small batch)

1. **Practice by hand.** Parent keeps items for the jobs that remain. New sitting gets its own `### Practice {#<band>-practice}` per [drill-generation](../meta/drill-generation.md): unique **Setting:** from the [settings inventory](../meta/drill-generation.md#settings); cover every family the new sitting teaches; *S* = taught H3s above Practice. Drop leaked items from the parent.
2. **Level review.** Add an item for the new sitting (`review-intermediate.md` / `review-advanced.md`). **Rule:** link a teaching H3, not Practice.
3. **`AGENTS.md`.** Edit the parent’s Owns line when a job leaves; add a routing row only for a new topic. Topic nouns, not a second grammar.
4. **Titles.** H1 and sidebar `text:` name the job that remains / moved, in sync. Terminology cells that are nothing but a link must use the sidebar name.
5. After a heading rename, change the heading **and** the id. Do not leave a silent `<a id="old">`. Unique ids on a page. H1 id must not collide with an H3 or `<a id>`.
6. Construction homes in `src/parse/constructions.ts` stay **heading** ids. Peel’s home map should retarget them; verify.
7. `npm run cheat-sheet-blocks -- --write`, then `npm run build`. Fix cheat-sheet rows whose forms now live in a sibling H3 (link the section that actually contains the spelling). Skip `npm run grammar-check` unless the parser changed.

### Constraints

- One sitting, one `band:` front matter; no `## Intermediate` H2.
- Teach now; don’t preview later peers. No “stays on” ownership fences.
- Stage pages never link to the recipe track.
- If a Bash call fails because the auto-mode classifier gave no verdict, retry the same call up to 5 times with exponential backoff.
- Do not commit unless asked.

### Done when this phase’s parents

- have job titles that do not list unrelated families
- each new sitting has Practice, a unique setting, a review item, a sidebar row next to its parent, and an AGENTS Owns update
- `npm run build` is clean

Report: peels applied (parent → new file + title), rows skipped and why, leftover kitchen-sink titles.

---

## Phase 1

`viewpoint.md`, `feelings-permission.md`, `notional-standing.md`.

### `viewpoint.md` (Role scope and viewpoint)

Keep laterals / arrow rose / gravity / landmark facing / endings. Retitle parent **Left, right, and facing** (or the remaining job).

```bash
npm run peel-headings -- --parent viewpoint.md --ids scope,capacity,places-tools-times,content-of-the-event --to role-scope.md --title "Role scope" --band intermediate
```

### `feelings-permission.md` (Feelings and permission)

Keep emotion compose, feeling with no object, speaker attitude. Retitle parent **Feelings**.

```bash
npm run peel-headings -- --parent feelings-permission.md --ids say-words,permission,consent,say-scope --to permission-consent.md --title "Permission and consent" --band intermediate
```

### `notional-standing.md` (Surprise, residue, and as-if)

Three families. Leave residue / former / channel bars / `uom` on the parent; retitle parent **Residue and former**.

```bash
npm run peel-headings -- --parent notional-standing.md --ids mirative --to mirative.md --title "It turns out" --band intermediate
npm run peel-headings -- --parent notional-standing.md --ids notional-as-if-framing,hold-endings-notional --to notional.md --title "As if" --band intermediate
```

---

## Phase 2

`ability.md`, `span-mention.md`, `of-relations.md`.

### `ability.md` (Decision and try)

Keep Decision, Try (and Try’s fallback H4). **Plan or forecast** has no `{#id}`: if it only restates [intention](/intention), drop it rather than making a sitting.

```bash
npm run peel-headings -- --parent ability.md --ids want,whose-intention --to want.md --title "Want" --band intermediate
```

### `span-mention.md` (Mention and islands)

Keep written-only, mention, span-as-noun, `gl-spans`, one-of-a-title, quote-acts, topic-quotes (they apply inside a span).

```bash
npm run peel-headings -- --parent span-mention.md --ids scope-islands --to scope-islands.md --title "Scope islands" --band intermediate
```

### `of-relations.md` (Part of, made of, from)

Keep `#of-relations`. If `locative-relations` is only extra-noun hook reuse with no new form, put the English job on the recipe track instead of the second peel.

```bash
npm run peel-headings -- --parent of-relations.md --ids exactly-like --to exactly-like.md --title "Exactly like" --band intermediate
npm run peel-headings -- --parent of-relations.md --ids locative-relations --to locative-relations.md --title "From and toward" --band intermediate
```

---

## Phase 3

`singability.md`, `join-across-roles.md`, `universality.md`.

Peels are on disk. Resume here: hand-split Practice, unique settings, review items, allowlist rows, `npm run cheat-sheet-blocks -- --write`, `npm run build`. Do not re-peel.

- `singability.md` → `place-name-roots.md` (**Place-name roots**, Intermediate, beside Names and titles). Gates put it with names, not Advanced singing.
- `join-across-roles.md` → `join-acts.md` (**Join-act verbs**) and `join-relations.md` (**With and without**). Parent Practice is already stance-only; the dropped join-act / join-relation items are not yet on the new sittings.
- `universality.md` → `dated-channel.md` (**Dated channel**) and `usually-vs-must.md` (**Usually vs must**). Parent Practice still holds dated-channel and generalization items; drop those when the new sittings get their own.

### `singability.md` (Singing and speech edges)

Keep singing / rhythm / speech edges. Band stays Advanced unless the [gates](../meta/learning-levels.md#gates) put place-name roots with Intermediate names.

```bash
npm run peel-headings -- --parent singability.md --ids place-name-roots --to place-name-roots.md --title "Place-name roots" --band advanced
```

Sidebar: sit the new row next to [Names and titles](/proper-names), not at the end of Advanced.

### `join-across-roles.md` (Stance joins)

Keep `stance-joins`. Parent title can stay **Stance joins**. Use two files if join-act verbs and join-relations do not share a job.

```bash
npm run peel-headings -- --parent join-across-roles.md --ids join-act-verbs,join-relations --to join-acts.md --title "Join-act verbs" --band intermediate
```

### `universality.md` (Mood on one adjective)

Keep mood-on-adjective (`now` is an H4 under `dated-channel`, so it travels). Peel `universality` with dated-channel if they are one job; otherwise a third sitting **Usually vs must**.

```bash
npm run peel-headings -- --parent universality.md --ids dated-channel --to dated-channel.md --title "Dated channel" --band advanced
```

---

## Phase 4

`polar-inventory.md`, `iff-fault.md`, `sentence-linkers.md`.

### `polar-inventory.md` (Yes, no, and not that)

Keep polar stance inventory, confirming a negative, yes/no with single-item / standalone. Split the new sitting further if its title still lists unrelated jobs.

```bash
npm run peel-headings -- --parent polar-inventory.md --ids tags,rhetorical,quiz,stacked-questions --to question-tags.md --title "Tags and rhetorical questions" --band intermediate
```

### `iff-fault.md` (Because, iff, and make)

Keep `only-because`. `make` is an H4 under `cause`, so it travels. **A following sentence** has no `{#id}`: it is the `blarl` pattern already taught on dependents / causation. Fold into the remaining sitting, or drop if it is only recap.

```bash
npm run peel-headings -- --parent iff-fault.md --ids cause --to cause.md --title "CAUSE" --band intermediate
```

### `sentence-linkers.md` (Linking sentences)

Keep sentence linkers, result pole. **Writing and speech rhythm (periods)** may stay as a short finish-the-series H3 on the parent, or peel toward singing / speech edges if it is meter, not linkers.

```bash
npm run peel-headings -- --parent sentence-linkers.md --ids stand-in,stand-in-back,time-pole-on-noun --to stand-in-vowels.md --title "Stand-in vowels" --band intermediate
```

---

## Phase 5

Optional. Split only if, after Phases 1–4, the parent title is still a list of unrelated jobs.

| Parent | Current title | Cut if needed |
|--------|---------------|----------------|
| `label-scope.md` | How a kind holds | Peel `command-property` and **SAME** endings (pin an id; it has none) if they are not how a kind holds |
| `left-bound.md` | Longer chains | Peel `degree-w` and/or `no-subject` if they are not chaining |
| `ending-grids.md` | Closed and open hooks | Peel `abstract-landmarks` and `ranges` from closed / open **-l** / **-m** |
| `number-markers.md` | Number markers and endings | Peel the number-as-verb / adverb / interjection / discourse H3 (pin an id; it has none) from markers / endings / writing |
| `special-values.md` | Infinity, zero, and hyperbole | Peel `special-number-as-stance` if it is not that trio; leave `zero-exponent` and `hyperbole` unless they cease to share a job |
| `join-islands.md` | Named lists and join limits | Named phrase **-n** vs allowed-joins-by-PoS vs constraints vs rare arities |
| `initials.md` | Initials and rays | Initials vs rays vs named ranges vs kin generations |
| `stacked-markers.md` | From the end, and stacked marks | From-the-end vs stacked vs ambient magnitude |
| `compound-families.md` | Which compound | Peel `conversation-length` if it is not which compound |
| `prescription.md` | Motive and stake | Motive vs whose-stake vs contrary vs sake bars |
| `phonotactics.md` | Word shape and letter names | Peel `letter-names` (and maybe `syllabic-l`) from word shape |
| `emphasis.md` | Emphasis and audible start | English clefts (tone-mark application, maybe recipe track) vs audible start |
| `numbers-applied.md` | Measures, ranges, and percent | Letter codes vs measures / ranges / percent |
| `speech-acts.md` | Doubling and stacking acts | Doubling / stacking vs speech manner vs number-as-interjection |

Do not split a page whose H3s finish one series.

---

## Phase 6

No new peels unless a leftover from Phases 1–5 is still open.

- Walk Intermediate then Advanced sidebar titles. Each should be a job, not a leftover parent name.
- `AGENTS.md` Owns lines match which file holds which topic nouns.
- Every new sitting has a review **Rule:** item; no duplicate settings.
- Hand-written cheat-sheet rows link the section that contains the spelling (promotion and peels both shrink H3 subtrees).
- `npm run cheat-sheet-blocks -- --write` and `npm run build`.

Then absorb any remaining notes into [learning-levels](../meta/learning-levels.md) / [grammar-docs](../meta/grammar-docs.md) if the how-to-apply story changed, and drop or reject this proposal.
