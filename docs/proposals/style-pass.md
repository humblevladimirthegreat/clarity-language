# Style pass

**Status:** partially implemented. Decided 2026-11-11: a rising warning count fails the build on every page (the ratchet); recipe pages, cheat sheets, and level reviews get which-page rows; headings that need a retitle are logged and retitled together in H1; the user reviews each phase before the next starts; forms take bold only where introduced. **Phase 1 done 2026-11-11** (T1, T2, T3, C1). Next: the user reviews the C1 diff (commit `d09d8f42`) and the [open decisions](#open-decisions), then Phase 2.

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

1. Fold the user's corrections from the C1 review, and the answers to the [open decisions](#open-decisions) that change the digest, into `.claude/agents/style-editor.md` and, where they are rules, `doc-style.md`. This is an orchestrator edit with its own commit.
2. B2 to B5: Beginner units 2 to 5 in `reading-order.ts`, starting with "Pointing and describing" (`pronouns.md`, `plurality.md`, `predication.md`, `knowing.md`, `left-bound-adjectives.md`).

**Cut:** the six-unit budget.

### Phase 3: Beginner, second half

B6 to B9, one per remaining Beginner unit.

**Cut:** Beginner is finished, and the on-ramps add style guides to the brief.

### Phase 4: on-ramps

| Unit | Pages | Added to the prompt |
|------|-------|--------------------|
| O1 | `purpose.md`, `introduction.md` | Read [orientation-style.md](../meta/orientation-style.md) |
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

Sections that prose units reported under rule 6: the section needs a consequence or a *when* that no page states. Each needs a user decision or an owner-page edit; the pass does not fill them. See [open decisions](#open-decisions) 1 and 2.

| Section | Missing |
|---------|---------|
| `clause.md#intention-adverbs` | No example, no list of the words, no consequence; *intention* is not glossed. It links only to a section on its own page |
| `clause.md`, direct object section | Allows putting the object first, but no page says when you would choose that order |

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with `npm run wording-only`, `npm run lint:prose -- --update-baseline` on its pages (counts only fall), and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit or the report flags one.
- Phase gate: the last unit's `verify` is green against the phase's baseline. When nothing has changed since that run, it is not repeated.
- Final gate, in Phase 9: a clean `npm run verify` against an empty baseline after X2.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. X1 edits nothing and makes no commit. Phase 2 adds one commit for the digest corrections. Each phase ends with a commit of the consolidated proposal, `style-pass phase <N>: consolidate [skip-cd]`; in Phase 9 that commit deletes the proposal instead, once the meta notes own the result.

| Phase | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | All |
|-------|---|---|---|---|---|---|---|---|-----|
| Commits | 6 | 5 | 5 | 7 | 7 | 6 | 6 | 4 | 46 |

## Open decisions

1. **`clause.md#intention-adverbs` has nothing to teach from.** The section has no example, never names the words, and gives no consequence. Options: (a) the owning page for intention adverbs supplies an example and a consequence, and the section points to it; (b) the section becomes a one-sentence pointer to where intention words are taught; (c) cut it from the Beginner clause page. **Recommendation:** (b), unless the owner page is Beginner too, then (a). A learner gains nothing from an exampleless mention on the first clause page, and a pointer keeps the role-letter overview complete.
2. **When to put the direct object first** (`clause.md`). The page allows object-first order but no page says when you would choose it. This is a grammar question. Options: (a) state that the order is free and changes nothing; (b) name the use it serves (for example contrast, or what the sentence is about) if the grammar already assigns one, such as on `topic.md`; (c) cut the mention from the Beginner page. **Recommendation:** check `topic.md` first. If it gives object-first a use, (b). Otherwise (a), so the learner knows it is a free choice.
3. **Recipe leads without a consequence.** The which-page row says a recipe lead "still ends with the consequence", but the echo-question recipe has none. Options: keep the row, so O2 adds a consequence where the owning page states one and reports the rest; or drop the consequence clause for recipe pages. **Recommendation:** keep the row. The consequence is why a learner picks this recipe over the English habit.
4. **Bold on forms on recipe pages.** Recipe pages bold forms that are taught elsewhere (**`yel`**). Options: (a) the general rule, with no bold, since the recipe does not introduce the form; (b) treat each recipe section's answer form as introduced there, bold once per section. **Recommendation:** (b). A recipe is looked up, not read in order, so the bold answer form is what the reader scans for.
5. **Bold endings on cheat sheets.** Cheat-sheet prose bolds bare endings (**-l**), and the cheat-sheet row exempts sheets from the bold rule. Options: keep the exemption; or extend the row so bare letters and endings go in backticks on sheets too, with form bold left alone. **Recommendation:** extend it. Backticks on letters are a marking rule rather than emphasis, and a sheet that marks `-l` the way the lesson does is easier to match.
