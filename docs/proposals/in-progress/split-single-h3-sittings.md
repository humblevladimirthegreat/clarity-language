# Split single-H3 sittings

**Status:** IN PROGRESS, stopped for a decision. Phases 1–3 done 2026-11-18: all 18 split pages are split, links retargeted with hash rows, the Practice top-up (K) and the seam style review (Y) landed; final `npm run verify` PASS against an empty baseline; `english-helper-recall --check` passed; `cheat-sheet-blocks` up to date. **Stopped on a finding (2026-11-18):** the design rule *the first new H3 opens with the page's existing lead* conflicts with [the lead of a whole page](../../meta/doc-style.md) (doc-style table: a page with two or more teaching sections needs a lead between the H1 and the first H3, previewing each section). 17 of the 18 split pages now have nothing between the H1 and the first H3; only `number-roles.md` was fixed (in Y). Next: the user decides on unit L below; if approved, run L, then the final gate, then delete this proposal.

**Related:** [the lead of a whole page](../../meta/doc-style.md), [one sitting](../../meta/grammar-docs.md#one-sitting), [split an H3 on its page](../../meta/procedures/restructure-sittings.md#split-heading).

**Design authority:** *none*. Prose only: no form, reading, id, or link changes.

## Remaining plan

### L: page leads (proposed, awaiting approval)

`style-editor`, fresh, `model: opus`, effort `high`; split by band if it passes the turn cap (beginner + intermediate, then advanced).

Pages (under `docs/grammar/`): `beginner/` label-seams, already-still-yet, firm-soft, thanks-and-sorry; `intermediate/` holder, tone-marks, dated-channel, tag-pronouns, try, because-and-iff, very-and-slightly, residue-and-former, cause; `advanced/` usually-vs-must, generations, stance-bars, stand-in-roles.

On each page, give it a lead between the H1 and the first H3 per doc-style's *lead of a whole page* row: at most one sentence per teaching section. Where the paragraph that opens the first H3 is really the page lead (it was the lead of the unsplit page), move the first `###` heading down below it, as Y did on `number-roles.md`, and make the first section open on its own job; otherwise write the lead fresh. Never change an id, a form, a reading, a table row or a link target. Check any Ageben touched with `node scripts/parse.mjs --check-lexicon`. Gate: `npm run verify -- --allow-generate`.

May edit: those pages' text above the first H3 and the first paragraph under it.

Then: final `npm run verify` (empty baseline), commit `split-single-h3-sittings L: … [skip-cd]`, delete this proposal and commit the deletion.

## Open decisions

- **Page leads on the split pages.** The proposal's design put each page's lead under its first H3; doc-style asks for a lead above it on a page with two or more teaching sections. Options: (a) run unit L as written; (b) accept the pages as they are and delete the proposal (the doc-style rule stays unmet on 17 pages, with no lint to catch it); (c) record the gap in `TODO.md` and delete the proposal. **Recommendation:** (high) (a). The doc-style rule is explicit, and the lead is what lets a learner see the page's parts before the first section; the work is one style-editor unit.

## Background

### Problem

41 sittings had exactly one taught H3 (`npm run page-lines`, S = 1). The site outline shows H2 and H3 ([`config.ts`](../../grammar/.vitepress/config.ts) `outline.level: [2, 3]`), so on those pages the table of contents is one line, often the page title repeated. A learner cannot see what the page teaches or jump to the second half: [thanks-and-sorry.md](../../grammar/beginner/thanks-and-sorry.md) teaches thanks and sorry, each with its own examples and table, under one heading.

### Goals

- Every sitting that teaches more than one thing has one H3 per thing, and the outline lists them.
- Every link to a removed id lands on the H3 it means; old URLs with the old hash still land on the page.

### Non-goals

- Pages that teach one thing keep their single H3. No filler headings.
- No peels, merges, or moves between pages; no sidebar changes.
- No new Practice beyond what [drills as a check](../../meta/grammar-docs.md#beginner-stage-shape) requires when a new H3 has no item.
- Reviews, recipe pages (`say-*.md`), cheat sheets, Claritish and other non-sitting pages are out of scope as split targets.
