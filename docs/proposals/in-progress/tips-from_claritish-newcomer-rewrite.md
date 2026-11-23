# Read-by blocks, anchor checks, and the placement rule

**Status:** IN PROGRESS, 2026-11-23: phase 1 started. User decisions, 2026-11-23: the list of what reads a page is generated, not kept by hand, as a comment block at the top of each page; every page under `docs/grammar/` gets one, Claritish lessons included; the block sits at the top; readers take ids and patterns from a contracts module, not comment tags; build both the dead-anchor check and `page-refs`; improve the placement test's failure message as well as documenting the rule. The message shipped 2026-11-23, before the plan started: it names the cue, its placement, whether it drops its cue words, and the rule's anchor (`placedBy` in `src/claritish-editor/data.test.ts`).  
**Related:** [claritish-style.md](../../meta/claritish-style.md#examples-practice), [grammar-docs.md](../../meta/grammar-docs.md#claritish-track), [interpreter.md](../../meta/interpreter.md#classification-table), [code-layout.md](../../meta/code-layout.md), [`src/parse/constructions.ts`](../../../src/parse/constructions.ts), [`src/claritish-editor/data.ts`](../../../src/claritish-editor/data.ts), [`src/claritish-editor/data.test.ts`](../../../src/claritish-editor/data.test.ts), [`src/lint/grammar-anchors.ts`](../../../src/lint/grammar-anchors.ts), [`scripts/lib/link-rewrite.ts`](../../../scripts/lib/link-rewrite.ts), [`scripts/lib/retarget-id.ts`](../../../scripts/lib/retarget-id.ts), [`scripts/lib/deps.ts`](../../../scripts/lib/deps.ts), [`scripts/lint-cheat-sheets.ts`](../../../scripts/lint-cheat-sheets.ts), [`scripts/cheat-sheet-blocks.ts`](../../../scripts/cheat-sheet-blocks.ts), [`scripts/build.mjs`](../../../scripts/build.mjs).  
**Depends on:** none.  
**Order:** best landed before the next phase of `claritish-newcomer-rewrite.md`, whose writers it serves. Both edit `docs/meta/claritish-style.md`; do not run a phase of each at once.  
**Design authority:** none. Tooling, tests, and editor notes; no form and no reading changes. Edits under `docs/grammar/` are link targets and generated comments only.

## Problem

The P1 session of `claritish-newcomer-rewrite.md` (session f698d6e5, from its start to commit `938e2c2b`) cost about 2.57M weighted tokens. Two causes cost more than they needed to (call numbers from `npm run -s token-report -- --session f698d6e5 --calls`):

1. **Writers searched for what reads or links into their lesson: about 83k, about 70k of it avoidable.** U6 calls 10-11, 13-15 and 18 (how `lint-cheat-sheets.ts` reads tables; greps for links into its lesson; `reading-order.ts`): about 38k. U5 calls 13-15 (scripts that might read headings, `flashcards-claritish.ts`, `claritish-flows.json`): about 19k. U3 calls 12-13 (the table lint again): about 13k. The orchestrator's call 31, a grep for links to a removed `#sakes` anchor: 13k, at about 95k of context per turn. Nothing a writer reads says what depends on a page, and no build step fails on a link to a removed anchor, so the grep was the only safety net. A hand-kept list would not stay right: the first draft of this plan, written from the run, got two readers wrong and missed two.
2. **An undocumented placement rule failed U7's verify: about 61k.** U7 calls 20-28. `data.test.ts` places each practice answer's drop-in the way the journal editor's *Use this* would. The `you-should` cue has `drop_cue` `yes` in `data/claritish-triggers.csv`, so *We should eat together more* is placed as *Eat together more `thawether`*, and an answer that keeps *We should* fails. `claritish-style.md` does not say so, and the failure message names neither the cue nor the rule.

## Goals

- A writer learns what reads a page from the page's first lines, and the list cannot drift from the code.
- Removing or renaming an anchor that a link uses fails the build.
- One command lists every reference to a page or an anchor, telling `claritish/feelings.md` from `intermediate/feelings.md`.
- The placement rule is on the style page, where the test's failure message already points.

## Non-goals

- No inbound-link lists or counts in the blocks. `clause.md` has 436 references to its anchors, 223 from `docs/meta/`; a count goes stale with each edit elsewhere.
- No dead-anchor check for bare `page.md#id` mentions in code comments. Registry anchors are checked by the generator (D4), and construction homes already are by `lint:ageben`.
- No change to what `retarget-id`, `move-heading` or `peel-*` rewrite, beyond resolving pages by folder (D2).

## Findings

Checked against the code on 2026-11-23.

**What reads a Claritish lesson:**
- **Tables:** `lint-cheat-sheets.ts` (`lintClaritish`) checks every line starting `|` in every lesson against the sheet, except `CLARITISH_PATTERN_ONLY` (`feelings.md`, `what-a-feeling-wants.md`).
- **Gap:** `data.ts` `section(markdown, "gap")` reads the `## … {#gap}` section; `scripts/lint-claritish-editor.ts` fails when one of its italic phrases raises no cue.
- **H1:** `data.ts:436` reads it as the editor's lesson title. The sidebar text in `reading-order.ts` (`claritishLessons`) is a separate copy, used by flashcard deck names and `llms.txt`.
- **Order:** `data.ts` `trackOrder` reads the lesson order from the link order in `claritish/index.md`; `data.test.ts:100` repeats the id list.
- **`#forms`:** `data.ts:436` builds `claritish/<id>.html#forms` for the editor's "Learn this" link (`ClaritishEditor.vue:181`). No test checks it.
- **Practice:** `lessonPractice` (`data.ts:136`) parses `**N.** *prompt* (note)` followed by `::: details Show answer`.
- **Examples:** `data.test.ts` places each example sentence too, for `labels` and `what-a-feeling-wants` only.
- **Whole page:** `flashcards-claritish.ts` reads every code span in a lesson to file notes under lessons.

**Stage pages:** 211 `<!-- cheat-sheet: id -->` markers in stage pages are read by `lint-cheat-sheets.ts` (`MARKER_RE`), a page-specific shape reader.

**Registries that already map forms to sections**, each checked by a test or lint today:
- construction homes, `anchor:` in `src/parse/constructions.ts` (526 entries; `clause.md` is home to 20, on 6 anchors);
- the `anchor` column of `data/closed-words.csv` and `data/lexicon-overlays.csv`;
- the Anchor column of the classification table in `docs/meta/interpreter.md` (106 rows on `clause.md`);
- `anchor:` strings in `src/interpret/classes.ts`, `src/parse/scope.ts` and `src/interpret/inspect-notes.ts` (to classify in U5);
- Claritish: the `lesson` column of `data/claritish-triggers.csv`, the `lesson` key in `data/claritish-flows.json`, and cheat-sheet rows that link a lesson (for `oughts-and-motives`: 3 cues, 2 flows, 2 rows).

**The reference scan keys by filename.** `applyMaps` in `link-rewrite.ts` takes `currentPage` as the basename, and `retarget-id --page` strips the folder. Probed with `findReferences`: the key `claritish/labels.md` matches nothing, not even `[x](labels.md#gap)` in a sibling lesson; `[x](feelings.md#gap)` written in a lesson matches the stage key `feelings.md`. Four lessons share a stage page's filename: `can-and-cant`, `feelings`, `thanks-and-sorry`, `tone-marks`. No link points at an anchor in a Claritish page today, so nothing has gone wrong yet.

**Dead anchors.** `config.ts` sets `ignoreDeadLinks: false`, which checks pages only, and no step in `scripts/build.mjs` resolves a link's anchor. A probe over the 4,807 anchored markdown links in `docs/` (proposals left out), `AGENTS.md`, `TODO.md` and `README.md` found seven that resolve to no id and no `hash-redirect.ts` row:
- `docs/grammar/say-amounts.md:276` → `restrictors.md#sometimes--anytime--some-other-time`
- `docs/grammar/say-amounts.md:427` → `joins.md#unspecified-member-r`
- `docs/grammar/say-people-places.md:465` → `hooks.md#rather-el`
- `docs/grammar/say-people-places.md:1076` → `roles.md#arrow-rose`
- `docs/meta/interpreter.md:477` → `parser-pipeline.md#stage-4--resolve-ast--discourse-sidecar`
- `docs/meta/procedures/drill-generation.md:122` → `#6-self-check-then-lint`
- `docs/meta/procedures/restructure-sittings.md:26` → `#old` (may be an example inside prose; check before fixing)

The probe did not skip inline code spans, and it also flagged `docs/meta/translation-exercises.md:248` (`page.md`, likely an example). The probe was `dead-anchors.ts` in a session scratchpad, now gone; U3 writes the real check.

**Comments.** Lessons already carry `<!-- Agent summary -->` and `<!-- Source (editors) -->` comments. `llms-txt.ts:85` strips comments, and `prose-style.ts:118` blanks them. `cheat-sheet-blocks.ts` claims `<!-- generated: SOURCE -->` … `<!-- /generated -->`, so the new block needs its own marker.

## Design

**D1. The placement rule.** In `claritish-style.md#examples-practice`: a practice answer must read as the journal editor would place its drop-in from the prompt's own cue, or by command when the prompt has none, and in the lessons whose examples the test places (*Labels*, *What a feeling wants*) each example sentence must too. Some cues are dropped, as *should* is: *We should eat together more* is answered *Eat together more `thawether`*. A checklist row: Build, fails; `src/claritish-editor/data.test.ts`. The test's failure message already ends *Write it as the editor places it: docs/meta/claritish-style.md#examples-practice*, so the rule must sit in that section.

**D2. Pages resolved by folder.** The shared scan (`applyMaps`, `findReferences`, `retarget-id`'s `--page`) takes a page as its path under `docs/grammar/` (`claritish/feelings.md`, `feelings.md` for a stage page) and resolves each link from the file it sits in: a bare `feelings.md` inside `claritish/` means the lesson, elsewhere the stage page; `claritish/feelings.md` and `../claritish/feelings.md` mean the lesson. Stage pages keep their flat keys, so no existing `retarget-id`, `move-heading` or `peel-*` call changes.

**D3. `npm run page-refs -- PAGE [--id ID]`.** Prints each reference to the page (anchored or not) or to one id: `file:line`, link text, context, as `retarget-id --list` does, grouped by id, with a total. It reads the D2 scan; `retarget-id --list` stays as it is.

**D4. Dead-anchor check.** A build step (`scripts/lint-anchors.ts`, run as `lint anchors` in `build.mjs`) resolves every markdown link with a `#` in `docs/` (proposals left out), `AGENTS.md`, `TODO.md` and `README.md`, outside fenced code and inline code spans, and fails when the target page publishes no such id (`grammarHeadings` plus `anchorTags` from `grammar-anchors.ts`) and no `hash-redirect.ts` row covers it. Grammar links resolve the way the site does (`pageRelPath` for a flat name, D2 for `claritish/`); other `.md` targets resolve by path. Each failure prints `file:line → page#id` and the fix (point the link at the current id, or add a hash row when the id moved). The seven links in [Findings](#findings) are fixed in the same unit.

**D5. Read-by blocks.** `npm run page-readers` (`scripts/page-readers.ts`) writes one comment per page under `docs/grammar/` (not `.vitepress/`), after the frontmatter and before the H1. With no flags it is a build check that fails on a missing or stale block; `--write` refreshes every block. The block is one comment that starts `<!-- read-by` and ends `-->`, so neither `cheat-sheet-blocks` nor `@include` handling matches it. A page that nothing specific reads gets a one-line block, so a missing block is always an error. It has two sources, and nothing in it is typed by hand.

- **Registry lines.** The generator turns each registry in [Findings](#findings) around, from row → section to section → rows, and writes one line per section with a count per registry: `#who-acts-and-the-action: 4 construction homes, 12 interpreter rows`. For Claritish it writes one `Named by data:` line per lesson. An anchor in a registry that resolves to no id fails the generator. A data CSV with an `anchor` column, a `docs/meta/` table with an Anchor column, or a `src/` file with `anchor: "…md#…"` strings that the generator does not read also fails it, naming the file; a new registry joins by one entry in the generator's registry list.
- **Shape lines.** `src/page-contracts.ts` exports one contract per page-shape dependency: the pages it covers (a list or a folder rule), the part (`h1`, `section` by id, `anchor`, `tables`, `practice`, `examples`, `marker`), the id or pattern, and one English line saying what it requires. Readers take the id or pattern from the contract instead of a literal (`section(markdown, lessonGap.id)`; the "Learn this" link from `lessonForms.id`). The generator lists each contract's readers from `importersOf` in `scripts/lib/deps.ts`, so no file names are kept by hand, and fails when a contract's part is missing on a page it covers (a named anchor, a table, a `### Practice`).
- **Whole-site readers.** A contract that covers every page of a kind (every stage page, every page) is listed once in `grammar-docs.md`, in a generated block there, not in each page's block. Tools that read or rewrite every page alike without a shape contract (the lints, `retie-docs`, `find.mjs`, `llms-txt`, the movers) go on the generator's whole-site list.
- **New readers.** A file in `src/`, `scripts/` or `docs/grammar/.vitepress/` (tests left out) that names a grammar path (`grammarFile(`, `GRAMMAR_DIR`, `docs/grammar`, `"docs", "grammar"`, a folder constant such as `claritishDir`) must import a contract or be on the whole-site list, or the generator fails and names it. The detection is a heuristic; a reader that builds its path another way slips through.
- **Inbound links.** The last line names the command: `Inbound links: npm run page-refs -- claritish/oughts-and-motives.md`.

A lesson's block:

```
<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: each italic phrase raises a cue or is exempt (scripts/lint-claritish-editor.ts)
- tables: each drop-in is on the cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: each answer reads as the editor places it from its own cue (src/claritish-editor/data.test.ts)
Named by data: 3 cues (claritish-triggers.csv), 2 flows (claritish-flows.json), 2 cheat-sheet rows.
Inbound links: npm run page-refs -- claritish/oughts-and-motives.md
-->
```

**D6. Where writers are told.** `grammar-docs.md` gets a short section on read-by blocks (what they hold, the whole-site list, `page-refs`, the anchor check). `claritish-style.md` gets a checklist row: before renaming a heading, reshaping a table, or rewording practice, read the page's read-by block. `AGENTS.md` gets one tooling note pointing at both commands and the block. Procedure pages that tell an agent to grep for inbound links point at `page-refs` instead.

## Plan

Two phases. Phase 1 builds the link tooling and the placement fix; phase 2 builds the generator, which uses phase 1's scan, anchor check, and `page-refs`. The cut falls where the digest changes (phase 2 reads `deps.ts` and the registries) and the tree is green. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. No unit writes teaching prose, so there is no style gate; the meta edits in U1 and U7 get the self-check against the [doc-style checklist](../../meta/doc-style.md#checklist).

Gates: the orchestrator saves `npm run verify -- --baseline` at the start of each phase; each unit ends with `npm run verify` against it. The final gate, at the end of phase 2, is `npm run verify` passing against an empty baseline (`npm run verify -- --baseline` on a clean tree is not it: run plain `npm run verify` after removing `tmp/state/verify-baseline.json`).

### Phase 1: link tooling and placement

**U1. Placement rule.** *Orchestrator.*
Make D1: the rule and checklist row in `docs/meta/claritish-style.md`, under `#examples-practice`.
**May edit:** `docs/meta/claritish-style.md`.

**U2. Folder-aware scan and `page-refs`.** `proposal-worker`, `model: opus`, effort `high`.
Make D2 and D3. Start from `applyMaps` (`currentPage` is the basename) and `rewriteMarkdownLinks` / `rewriteAnchorRefs` in `scripts/lib/peel-band.ts`, `findReferences` in `scripts/lib/retarget-id.ts`, and `parseArgs` in `scripts/retarget-id.ts`. Add tests for the four colliding names: a lesson's `feelings.md#x` is the lesson's, a stage page's is the stage page's, `../claritish/feelings.md#x` from `purpose.md` is the lesson's, and every existing stage-page test still passes. Add `page-refs` to `package.json`. Before editing, measure with `npm run deps -- --importers scripts/lib/link-rewrite.ts` so every caller is covered.
**May edit:** `scripts/lib/link-rewrite.ts`, `scripts/lib/peel-band.ts`, `scripts/lib/retarget-id.ts`, `scripts/retarget-id.ts`, new `scripts/page-refs.ts`, their tests, `package.json`.

**U3. Dead-anchor check.** `proposal-worker`, `model: opus`, effort `medium`.
Make D4: write `scripts/lint-anchors.ts` with a test, add it to `scripts/build.mjs`, and fix the links listed under [Findings](#findings) (and any others it finds) by pointing each at the id that now holds its content. A link whose content is gone gets the nearest owning section; a link inside an example of how to write a link is left alone only if it sits in a code span. Report each fix as `file:line old → new`.
**May edit:** new `scripts/lint-anchors.ts` and its test, `scripts/build.mjs`, `package.json`, the files holding dead links (link targets only).

Phase 1 commits: U1, U2, U3, then the consolidated proposal: 4.

### Phase 2: read-by blocks

**U4. Generator, registry lines.** `proposal-worker`, `model: opus`, effort `high`.
Write `scripts/page-readers.ts` (logic in `scripts/lib/page-readers.ts`) per D5: block placement after frontmatter, the `<!-- read-by` marker, check and `--write` modes in the `cheat-sheet-blocks.ts` pattern, the registry lines with counts, the unknown-registry check, the `Inbound links:` line. Shape lines come in U6; leave a hook for them. Make `page-lines` and any line-count lint skip the block; run `npm run verify -- --fast` after a trial `--write` to find other tools the block disturbs, fix them, then revert the trial output (`git checkout -- docs/grammar`). Do not wire it into `build.mjs`.
**May edit:** new `scripts/page-readers.ts`, `scripts/lib/page-readers.ts` and tests, `package.json`, `src/lint/page-lines.ts` and other tools the trial shows read the top of a page.

**U5. Classify grammar-path readers.** `proposal-worker`, `model: sonnet`, effort `medium`.
List every file in `src/`, `scripts/` and `docs/grammar/.vitepress/` (tests left out) that names a grammar path by the D5 heuristic; there were 87 on 2026-11-23. For each, from `grep -n` of its path and parsing lines (not whole-file reads), write one row to `tmp/state/page-readers-worklist.tsv`: file, `whole-site` or `shape`, and for `shape` the pages, part, the literal it uses, and what it requires. Also classify the three unread `anchor:` files from [Findings](#findings) as registry or not. Report the counts and every `shape` row.
**May edit:** `tmp/state/page-readers-worklist.tsv` only.

**U6. Contracts.** `proposal-worker`, `model: opus`, effort `high`.
Create `src/page-contracts.ts` from U5's `shape` rows, change each reader to take its id or pattern from its contract (the Claritish readers in [Findings](#findings) at least, and the `cheat-sheet:` marker reader), and add the shape lines, the whole-site list, the new-reader check and the part-exists check to the generator. The whole-site list comes from U5's `whole-site` rows. Keep each file under the [code-layout](../../meta/code-layout.md) limit.
**May edit:** new `src/page-contracts.ts`, `scripts/lib/page-readers.ts`, `scripts/page-readers.ts`, the reader files U5 lists, their tests.

**U7. Write, wire, and document.** *Orchestrator* for the write and wiring; `proposal-worker`, `model: opus`, effort `medium` for the docs.
The orchestrator commits U6, runs `npm run page-readers -- --write`, and commits the output alone ([fence automated rewrites](../../meta/procedures/proposals.md#fence-automated-rewrites)). It then adds `page readers` to `scripts/build.mjs` next to `cheat sheet blocks`. The worker makes D6: the `grammar-docs.md` section (including the generated whole-site block), the `claritish-style.md` checklist row, and the procedure pages that tell agents to grep for inbound links (`grep -rln 'inbound\|links into\|links to' docs/meta/procedures` to find them), and reports the `AGENTS.md` line for the orchestrator to apply.
**May edit:** `docs/meta/grammar-docs.md`, `docs/meta/claritish-style.md`, `docs/meta/procedures/*.md`; the orchestrator alone edits `scripts/build.mjs` and `AGENTS.md`.

Phase 2 commits: U4, U6, the `--write` output, U7, then the proposal's deletion (nothing planned left): 5. U5 writes only a worklist and makes no commit.

### Digest

Copied into every brief:

```
Proposal: tips-from_claritish-newcomer-rewrite.md. Tooling only: no form, no reading changes.
- Run .ts with `npx --no-install tsx FILE`, never node. Tests: `npm test -- FILE`; never bare tsx --test, never vitest.
- Verify: `npm run verify` at the end of the item (`--fast` inside it). On a new error read only its line in tmp/logs/verify-last.log. Never paste raw build output; never rerun a failed check before editing.
- Read slices: `npm run -s outline -- FILE` (on .ts it lists declarations), then the ranges you need. Never cat more than 150 lines of docs Markdown.
- Before moving code across files: `npm run deps`, and `npm run move-decl` to move; files stay under the code-layout limit (docs/meta/code-layout.md).
- Scripts that print a lot write to tmp/logs/ via tmpPath() (src/tmp-paths.ts) and print a summary, lines capped with clip() (scripts/lib/build-output.ts).
- Scratch scripts go in tmp/scratch/, written to a file, never inline. Edits to data/ JSON: load and save, then `npm run format-json`.
- Never retarget links by hand across many files; links you fix one by one in U3 are the exception.
- Never link to a page under docs/proposals/; name it in backticks.
- A change to what a build step writes, a data file's columns, or a loosened check is not yours to decide: write it up (problem, options, Recommendation (high/medium/low)) and skip the item.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- Do not commit.
Report (about 150 words): done (one line); new commands, exports and file names a later unit calls; files touched (count); verify line; skips and write-ups; left; inefficient.
```

## Open decisions

None block phase 1. Each below is autonomous (code shape), settled by the orchestrator per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision).

- **Inline code in the anchor check.** Options: skip links inside inline code spans, or check them. **Recommendation:** (high) skip them; a link in a code span is an example of syntax, not a link the site renders.
- **Whole-site threshold.** Options: a contract goes on the whole-site list when it covers every page of a kind, or only when it covers every page. **Recommendation:** (medium) every page of a kind (all stage pages, all lessons, all cheat sheets). A rule on every lesson in each lesson's block repeats it eleven times, but it is the rule a lesson writer most needs to see; so lesson-wide contracts stay in the lesson blocks, and only stage-wide and site-wide ones move. U6 settles where the line falls if the stage-wide list is long.
- **Count order in registry lines.** **Recommendation:** (medium) one line per section in page order, registries in a fixed order, sections with no rows left out.
