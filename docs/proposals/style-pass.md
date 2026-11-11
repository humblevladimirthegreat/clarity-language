# Style pass

**Status:** partially implemented. Decided 2026-11-11: a rising warning count fails the build on every page (the ratchet); recipe pages, cheat sheets, and level reviews get which-page rows; headings that need a retitle are logged and retitled together in H1; the user reviews each phase before the next starts; forms take bold only where introduced. **Phase 1 done 2026-11-11** (T1, T2, T3, C1). Decided 2026-11-11 after Phase 1, now in [doc-style.md](../meta/doc-style.md) and the agent file: a recipe lead keeps its consequence; a recipe section's answer form may be bold once; cheat-sheet prose puts bare letters and endings in backticks; a choice whose reason a later page teaches (object-first order, used mostly by other speech acts) needs no *when* yet. `purpose.md` and `introduction.md` were already rewritten to [orientation-style.md](../meta/orientation-style.md), so the pass skips them. Next: the user reviews the C1 diff (commit `d09d8f42`) and settles [open decision](#open-decisions) 1, then Phase 2.

**Related:** [doc-style.md](../meta/doc-style.md), [claritish-style.md](../meta/claritish-style.md), [orientation-style.md](../meta/orientation-style.md), [grammar-docs.md](../meta/grammar-docs.md), [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [prose-style.ts](../../src/lint/prose-style.ts), [prose-style-baseline.json](../../src/lint/prose-style-baseline.json), [sections.ts](../../src/lint/sections.ts), [style-editor.md](../../.claude/agents/style-editor.md)

**Depends on:** none.

**Design authority:** *none*. The pass changes teaching English only. It adds, removes, and changes no form, reading, gloss, example, or checkpoint.

## Problem

The pages under `docs/grammar/` have not been brought up to [doc-style.md](../meta/doc-style.md) as a whole. After C1 the ratchet baseline holds 228 warnings: `bold-density` 154, `beginner-lead` 35, `long-paragraph` 35, `jargon` 2, `voice` 2. The *Judgment* rows of the [checklist](../meta/doc-style.md#checklist) have been checked only on the C1 pages.

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

Each prose unit is one fresh `style-editor` subagent on one sidebar unit from `reading-order.ts`, in reading order. The agent file holds the rule digest, the checks, and the report format. Its prompt adds only the unit's pages, in reading order, and the [glossed labels](#glossed-labels) list. A unit of more than about 1,500 lines may stop at the turn check. A fresh `style-editor` then finishes the pages it names as left, under the same unit id.

The sidebar unit is the right size because a label is glossed on first use *in reading order*, so the worker needs to know what the pages before it already taught. Beginner has 9 units (38 pages), Intermediate 17 (64), Advanced 5 (20).

## Implementation plan

Phases 2 to 9 remain, one orchestrator session each, with no phase over six units. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends, keeping the [glossed labels](#glossed-labels), [headings to retitle](#headings-to-retitle), and [sections missing a fact](#sections-missing-a-fact) lists current.

Prose units run as `style-editor` on `model: opus`, `effort: high`, in sequence. Each one may edit only its own pages and `src/lint/prose-style-baseline.json`. A page with a control (a drill, a player, the journal editor) also gets the [interface instructions](../meta/doc-style.md#interface-instructions) check.

Each phase ends with the phase gate, the last unit's commit, consolidation, the proposal's commit, then a stop. The orchestrator tells the user what the phase settled, which open decisions wait on them, and the prompt for the next phase, *Carry out phase N of `style-pass.md`*.

### Phase 2: Beginner, first half

1. Fold the user's corrections from the C1 review into `.claude/agents/style-editor.md` and, where they are rules, `doc-style.md`. This is an orchestrator edit with its own commit.
2. B2 to B5: Beginner units 2 to 5 in `reading-order.ts`, starting with "Pointing and describing" (`pronouns.md`, `plurality.md`, `predication.md`, `knowing.md`, `left-bound-adjectives.md`).

**Cut:** the six-unit budget.

### Phase 3: Beginner, second half

B6 to B9, one per remaining Beginner unit.

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

### Headings to retitle

Headings that prose units reported under rule 7 of the digest, each with its page, its id, and why it fails. H1 works from this list.

*None yet.*

### Sections missing a fact

Sections that prose units reported under rule 6: the section needs a consequence or a *when* that no page states. Each needs a user decision or an owner-page edit; the pass does not fill them.

| Section | Missing |
|---------|---------|
| `clause.md#intention-adverbs` | No example, no list of the words, no consequence; *intention* is not glossed. See [open decision](#open-decisions) 1 |

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with `npm run wording-only`, `npm run lint:prose -- --update-baseline` on its pages (counts only fall), and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit or the report flags one.
- Phase gate: the last unit's `verify` is green against the phase's baseline. When nothing has changed since that run, it is not repeated.
- Final gate, in Phase 9: a clean `npm run verify` against an empty baseline after X2.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. X1 edits nothing and makes no commit. Phase 2 adds one commit for the digest corrections. Each phase ends with a commit of the consolidated proposal, `style-pass phase <N>: consolidate [skip-cd]`; in Phase 9 that commit deletes the proposal instead, once the meta notes own the result.

| Phase | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | All |
|-------|---|---|---|---|---|---|---|---|-----|
| Commits | 6 | 5 | 4 | 7 | 7 | 6 | 6 | 4 | 45 |

## Open decisions

1. **`clause.md#intention-adverbs` cannot get an example where it is.** Every intention adverb is taught after `clause.md` (the first is `oda` on `/h/`, at `can-and-cant.md#ability-fallback`), so the learning-order lint rejects an example there, and the forward-link lint rejects a pointer. Several Intermediate pages link to the section as the definition of the class. Options: (a) leave the section as a definition with no example, and accept the gap; (b) move the H3 to `can-and-cant.md`, right after `#ability-fallback`, with `npm run move-heading` (it keeps the id and rewrites every link), and give it `hodaxol` as its example and the consequence that it covers the whole claim wherever it sits; (c) cut the section and retarget the links to each word's own page. **Recommendation:** (b). The class is then defined where the learner meets its first member, with an example, and every later link still lands on the definition. It is a move, which this pass otherwise does not make, so it needs your go-ahead.
