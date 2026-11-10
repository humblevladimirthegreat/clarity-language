# Tags for someone, pseudonyms, and logic

**Status:** Partially implemented; consolidated after W4 on 2026-11-10. Done and committed: W1 (retire `umen`), W2 (`zwan` is a pseudonym), W3 (scope by order), W4 (bound tags), and the `AGENTS.md` Owns line. Each of these units also rewrote or added the one Practice item its change needed, so verify stayed green. Left: W5 (one Practice item) and W6 (audit). Settled decisions now live on their grammar pages: [tag pronouns](../grammar/intermediate/tag-pronouns.md), [scope by order](../grammar/beginner/joins.md#everything-ua), [bound tags](../grammar/intermediate/universals-domains.md#bound-tags), D-69 to D-73 in [design-decisions.md](../meta/design-decisions.md).

**Related:** [joins.md](../grammar/beginner/joins.md#everything-ua), [clause.md](../grammar/beginner/clause.md), [tag-pronouns.md](../grammar/intermediate/tag-pronouns.md), [universals-domains.md](../grammar/intermediate/universals-domains.md#bound-tags), [evidentiality.md](../grammar/intermediate/evidentiality.md), [drill-generation.md](../meta/procedures/drill-generation.md), [`src/parse/resolve.ts`](../../src/parse/resolve.ts), [`src/parse/enforce.ts`](../../src/parse/enforce.ts).

**Depends on:** none.

**Design authority:** none. The design has landed; W5 and W6 only drill and audit it.

## Problem

The landed work needs one more Practice item and an independent audit.

## Goals

- Beginner joins Practice drills scope by order.
- Every page the run changed reads consistently, and every example parses.

## Non-goals

- No new forms or readings. An audit finding that needs one goes to Open decisions.

## Implementation plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

### Units

| ID | Items | Agent | Model / effort | May edit |
|----|-------|-------|----------------|----------|
| W5 | Top up beginner `joins.md` Practice with one scope-by-order item (two quantified phrases in one clause; the fronted order reads ∃∀, as in the `### Everything (ua)` example pair). The bound-tag item (`universals-domains.md` Ageben → English 4) and the pseudonym item (`tag-pronouns.md` Ageben → English 1) already exist. | `checkpoint-writer` | `fable` / `high` | `### Practice` of `docs/grammar/beginner/joins.md`; its drill allowlist row |
| W6 | Audit, below. Fix small slips; report anything larger. | `proposal-worker` (fresh) | `fable` / `high` | any file the `tags-and-logic` commits touched (`git log --name-only --grep tags-and-logic`) |

Order: W5, then W6.

**W6 checks:**
- *Someone* reads the same everywhere (`zeyel zar`, or `zwal` when the person is resumed), and `node scripts/find-english.mjs 'someone'` points at those forms.
- No page still teaches named recall, and every page calls a pseudonym a person.
- No page still says that moving a word never changes the meaning. Review the loose wording at `docs/grammar/beginner/speech-moves.md:92` and `docs/grammar/introduction.md:25`: neither states a competing scope rule, so change wording only if a learner would read it as one.
- The parser's reach for bound tags matches [bound tags](../grammar/intermediate/universals-domains.md#bound-tags). W4 carries the reach into the next sentence only when the sentence's last word is a forward stand-in. Check that a stand-in earlier in the sentence (a `blarl` condition mid-clause) is covered too, and fix it with a test if not.
- Every example in the changed sections parses with its stated gloss.

### Rule digest (pasted into every brief)

> - Ageben only; current forms only; no former-name or *used to be* notes ([present the current language only](../meta/grammar-docs.md#present-the-current-language-only)).
> - Parser changes ship with the grammar edit that teaches them, plus an `unassigned-reserved.md` row for each newly rejected spelling and a `design-decisions.md` entry when the reason is more than *no reading yet*.
> - Work out what a sentence means with `node scripts/parse.mjs --llm-prompt`; check that a form parses with `node scripts/parse.mjs` (all sentences in one call).
> - *Someone* is `zeyel zar` (no return planned) or `zwal` (you will return). `zwan` is a pseudonym: a real person whose name is withheld.
> - Scope by order: a quantified phrase covers what comes after it to the end of its sentence; reordering roles chooses scope; who did what never changes.
> - A tag after a `zual` / `zuam` / `zul` fence binds each member in turn, to the end of its sentence and the sentences its stand-ins point to.
> - Do not link to any file under `docs/proposals/`.
> - Read slices: list headings first, read only the ranges you edit.
> - Cheat-sheet tables between `<!-- generated -->` markers are never edited by hand; report that a regeneration is needed and stop there.
> - Grammar decisions not settled here: log them in your report with options and a recommendation, skip the item, carry on.
> - Stop and alert (report and stop; do not work around): a premise no longer holds; later units would need a different design, order, or pages; skipping would leave later work on a broken state; enough is skipped that the goals cannot be met.
> - Parallel work on linting and page order (`scripts/lint-ageben-docs.ts`, `scripts/plan-units.ts`, `src/lint/*`, `docs/grammar/.vitepress/lib/reading-order.ts`, `docs/proposals/units.md`, `package.json`) is not yours: do not edit it.
> - Verify with `npm run verify -- --allow-generate` at the end of each item (`--fast` inside an item). Never paste raw build output; read only the new error's line in `tmp/verify-last.log`.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Report, fixed fields: **done**; **files touched** (count); **registry edits**; **AGENTS.md Owns lines** to change; **verify** line; **skips** with reasons; **left**; **inefficient**.

### Gates

- Orchestrator saves `npm run verify -- --baseline` before W5.
- Each unit ends with a green `npm run verify -- --allow-generate` against that baseline.
- After W6: `npm run grammar-check` if `src/parse/sentence-parser.ts` changed.
- Final gate: clean `npm run build` and `npm test`, with nothing left on a **generate** row.

### Commits

Two or three commits, each `tags-and-logic WN: <what> [skip-cd]` plus the co-author line, staging only that unit's files: W5, W6 (if it fixed anything), and the proposal's removal.

## Open decisions

1. **Bare `zwanx` with A free** (from W2). The parser makes **-x** and pairs on **-n** recall only, so a bare `zwanx` with A free is `tagUnbound`. Options: (a) keep **-x** recall-only; (b) let bare `zwanx` bring in *a real person and associates*. **Recommendation:** (a). Pairs never assign either, and phrase + `zwan` followed by `zwanx` already says it.
2. **A pseudonym assigned inside a bound reach** (from W4). The parser scopes it like any tag, so it expires, or gives A back to its earlier holder, when the reach ends. Options: (a) keep that; (b) a pseudonym is a constant, so it outlives the reach. **Recommendation:** (a). It is one rule (every assignment inside the reach is scoped), and it matches *under every dog, a cat O is a different cat for each dog*. Revisit if a recipe needs a pseudonym brought in under *every*.
