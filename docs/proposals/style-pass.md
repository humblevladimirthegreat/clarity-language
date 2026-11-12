# Style pass

**Status:** partially implemented. Decided 2026-11-11: a rising warning count fails the build on every page (the ratchet); recipe pages, cheat sheets, and level reviews get which-page rows; headings that need a retitle are logged and retitled together in H1; the user reviews each phase before the next starts; forms take bold only where introduced. **Phase 1 done 2026-11-11** (T1, T2, T3, C1). **Phase 2 done 2026-11-12** (B2 to B5; the user had no further C1 corrections, so no digest commit). `purpose.md` and `introduction.md` were already rewritten to [orientation-style.md](../meta/orientation-style.md), so the pass skips them. Next: the user reviews the Phase 2 diffs (commits `aa7dd70a` to `f15e9460`) and the [open decisions](#open-decisions), then Phase 3.

**Related:** [doc-style.md](../meta/doc-style.md), [claritish-style.md](../meta/claritish-style.md), [orientation-style.md](../meta/orientation-style.md), [grammar-docs.md](../meta/grammar-docs.md), [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [prose-style.ts](../../src/lint/prose-style.ts), [prose-style-baseline.json](../../src/lint/prose-style-baseline.json), [sections.ts](../../src/lint/sections.ts), [style-editor.md](../../.claude/agents/style-editor.md)

**Depends on:** none.

**Design authority:** *none*. The pass changes teaching English only. It adds, removes, and changes no form, reading, gloss, example, or checkpoint.

## Problem

The pages under `docs/grammar/` have not been brought up to [doc-style.md](../meta/doc-style.md) as a whole. After Phase 2 the ratchet baseline holds 178 warnings: `bold-density` 133, `long-paragraph` 32, `beginner-lead` 9, `jargon` 2, `voice` 2. The first five Beginner units are at zero, and the *Judgment* rows of the [checklist](../meta/doc-style.md#checklist) have been checked on them only.

The tooling that keeps the style applied has landed: the warning ratchet, the `voice` rule (a ratcheted warning until X2), `npm run changed-sections`, `npm run wording-only`, the `style-editor` agent, and the style gate in both procedures.

## Goals

1. Every learner-facing page passes the checklist: warnings cleared or individually accepted, and the seven closing tests run on every teaching section.
2. A page's warning count cannot rise without someone deciding it should. *(Done: the ratchet.)*
3. Any later change that moves, peels, merges, or rewrites sections ends with a style review of exactly those sections, by a reader with a fresh context. *(Done: the style gate.)*

## Non-goals

- No change to Ageben forms, glosses, examples, Practice checkpoints, word banks, or generated cheat-sheet tables.
- No moving or retitling of headings, and no change to heading ids, except in H1.
- No new rules of style. Where the guide is silent about a kind of page, the gap is logged for the user, not filled by a worker.

## Design

Each prose unit is one fresh `style-editor` subagent on one sidebar unit from `reading-order.ts`, in reading order. The agent file holds the rule digest, the checks, and the report format. Its prompt adds only the unit's pages, in reading order, the [glossed labels](#glossed-labels) list, and these cautions from earlier units:

- A bulk unbold must not turn bold English words (**is**, **no**) into code spans; unbold only Ageben letters, endings, and forms.
- A sentence that names a feature no earlier page teaches may be cut only when the page that owns the feature states it.
- Cue-column letters in `<!-- cheat-sheet: … -->` tables go in backticks, unless the cheat-sheet lint rejects a letter the cheat sheet lacks; then the letter stays bold and is reported. Each marker sits above its table, never between the header and separator rows.
- Examples stay where they stand. Add or drop a code span only when you must, since the wording-only check compares them. A unit of more than about 1,500 lines may stop at the turn check. A fresh `style-editor` then finishes the pages it names as left, under the same unit id.

The sidebar unit is the right size because a label is glossed on first use *in reading order*, so the worker needs to know what the pages before it already taught. Beginner has 9 units (38 pages), Intermediate 17 (64), Advanced 5 (20).

## Implementation plan

Phases 3 to 9 remain, one orchestrator session each, with no phase over six units. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends, keeping the [glossed labels](#glossed-labels), [headings to retitle](#headings-to-retitle), and [sections missing a fact](#sections-missing-a-fact) lists current.

Prose units run as `style-editor` on `model: opus`, `effort: high`, in sequence. Each one may edit only its own pages and `src/lint/prose-style-baseline.json`. A page with a control (a drill, a player, the journal editor) also gets the [interface instructions](../meta/doc-style.md#interface-instructions) check.

Each phase ends with the phase gate, the last unit's commit, consolidation, the proposal's commit, then a stop. The orchestrator tells the user what the phase settled, which open decisions wait on them, and the prompt for the next phase, *Carry out phase N of `style-pass.md`*.

### Phase 3: Beginner, second half

B6 to B9, one per remaining Beginner unit in `reading-order.ts`: "Counting and comparing", "Who does what to whom", "Wanting and being able", "Talking together".

**Cut:** Beginner is finished, and the on-ramps add style guides to the brief.

### Phase 4: on-ramps

| Unit | Pages | Added to the prompt |
|------|-------|--------------------|
| O2 | `english.md` and the five `say-*.md` recipes | The recipe row of the which-page table |
| O3, O4 | The Claritish track in two halves | Read [claritish-style.md](../meta/claritish-style.md) |

**Cut:** Intermediate needs no added guide.

### Phases 5 to 7: Intermediate

| Phase | Units |
|-------|-------|
| 5 | I1 to I6 |
| 6 | I7 to I12 |
| 7 | I13 to I17 |

**Cuts:** the six-unit budget.

### Phase 8: Advanced

A1 to A5.

**Cut:** every page unit is done, which the audit needs, and the close reads cheat sheets and level reviews under different which-page rows.

### Phase 9: close

| Unit | Work | Agent | Model, effort |
|------|------|-------|---------------|
| L1 | Cheat-sheet prose outside the `<!-- generated -->` markers, level-review prose outside Practice, `terminology.md` link text and voice only | `style-editor` | `opus`, `high` |
| H1 | Retitle the headings in [headings to retitle](#headings-to-retitle) to plain language, each pinning its old id with `{#id}` so no link changes | `proposal-worker` | `opus`, `high` |
| X1 | Independent audit. A fresh subagent that has read no earlier report takes two sections per unit, chosen by the orchestrator, and runs the slogan test and the why-care test from the lead alone. It edits nothing and reports failures by section | `proposal-worker` | `opus`, `high` |
| X2 | Fix what X1 found, lower the baseline, and make `voice` a failing rule in `src/lint/prose-style.ts` (severity error, out of the baseline). The `voice` rule skips table cells, bold, and parentheses to avoid false positives, so X2 also greps those for maintainer *we* and author *I* by hand | `style-editor` | `opus`, `high` |

X1 and X2 share a phase because X2 works from X1's report. If X1 fails more than about one section in five, that is a [stop-and-alert](../meta/procedures/proposals.md#stop-and-alert) finding: the digest is not working and the user decides what to do.

### Glossed labels

Labels that finished units have glossed, in reading order, each with the page that glosses it. The orchestrator pastes this list into each prose unit's prompt and adds each report's newly glossed labels after the unit's commit.

| Label | Glossed on |
|-------|------------|
| root ("the part that carries its meaning"), pitch | `phonology.md` |
| `/z/` notation for a word's first letter | `clause.md` |
| speech move | `speech-moves.md`, page lead |
| role (subject, object, and so on), replacing *slot* | `dependents.md`, page lead |
| associative `-x` ("the ending in *Azozon and associates*") | `pronouns.md`, role pointers |
| body (subject, verb, and so on) | `questions.md` |
| met / unmet sake | `sakes.md`, page lead |
| stance vowel | `sakes.md`, sake inventory |
| prescription | `ought-for-a-sake.md`, lead |
| landmark (the hook's `/b/` noun: place, source, or goal) | `hooks.md`, extra noun |
| restrictor | `restrictors.md`, page lead |
| setting (the general surroundings, for the zone extra) | `extra-noun-hooks.md` |
| fixed word, replacing *stock word* | `restrictors.md`, again |

### Headings to retitle

Headings that prose units reported under rule 7 of the digest, each with its page, its id, and why it fails. H1 works from this list.

*None open.* The four Phase 2 headings were retitled on 2026-11-12, each pinning its old id.

### Sections missing a fact

Sections that prose units reported under rule 6: the section needs a consequence or a *when* that no page states. Each needs a user decision or an owner-page edit; the pass does not fill them.

*None open.* The four Phase 2 reports were settled on 2026-11-12 from facts their owner pages state, or by cutting a preview the owner page teaches.

### Fixes outside the pass

Faults a prose unit found but could not fix within its scope. Each needs an edit the pass does not make, by the user or a later proposal.

| Where | Fault | Fix it needs |
|-------|-------|--------------|
| `restrictors.md`, cheat-sheet tables | cue cells **e** (`her` row), **u** (`hur` row), and **u** (`hual` / `huam` row) stay bold: in backticks the cheat-sheet lint rejects them as missing from `cheat-sheets/restrictors-spans.md` | add those letters to that cheat sheet, then put the cells in backticks |
| `knowing.md#live-vs-memory` | two tables for the same two forms, `thugem` and `thevum`, which fails the *once* test | merge the tables, which changes code spans the pass may not touch |

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with `npm run wording-only`, `npm run lint:prose -- --update-baseline` on its pages (counts only fall), and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit or the report flags one.
- Phase gate: the last unit's `verify` is green against the phase's baseline. When nothing has changed since that run, it is not repeated.
- Final gate, in Phase 9: a clean `npm run verify` against an empty baseline after X2.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. X1 edits nothing and makes no commit. Each phase ends with a commit of the consolidated proposal, `style-pass phase <N>: consolidate [skip-cd]`; in Phase 9 that commit deletes the proposal instead, once the meta notes own the result.

| Phase | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | All |
|-------|---|---|---|---|---|---|---|---|-----|
| Commits | 5 | 5 | 4 | 7 | 7 | 6 | 6 | 4 | 44 |

## Open decisions

None.
