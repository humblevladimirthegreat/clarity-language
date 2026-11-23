# Read-by blocks, anchor checks, and the placement rule

**Status:** IN PROGRESS. Phase 1 done 2026-11-23 (`d38e9272` U1 placement rule in `claritish-style.md#examples-practice`; `3c5fa590` U2 folder-aware scan and `page-refs`; `ae5da44a` U3 `lint anchors` build step and four dead links fixed). Next: phase 2 (U4). User decisions, 2026-11-23: the list of what reads a page is generated, not kept by hand, as a comment block at the top of each page; every page under `docs/grammar/` gets one, Claritish lessons included; the block sits at the top; readers take ids and patterns from a contracts module, not comment tags; improve the placement test's failure message (shipped before the plan, `placedBy` in `src/claritish-editor/data.test.ts`). Settled in phase 1 (autonomous, code shape), 2026-11-23: the anchor check skips links in inline code and fenced code; pages outside `docs/grammar/` are read on GitHub, so a link into one also passes when it matches GitHub's heading slug; bare (non-link) references in prose and comments resolve by the folder name they spell, so a bare `feelings.md#x` in a lesson's Source comment means the stage page.  
**Related:** [grammar-docs.md](../../meta/grammar-docs.md#claritish-track), [claritish-style.md](../../meta/claritish-style.md#examples-practice), [interpreter.md](../../meta/interpreter.md#classification-table), [code-layout.md](../../meta/code-layout.md), [`src/parse/constructions.ts`](../../../src/parse/constructions.ts), [`src/claritish-editor/data.ts`](../../../src/claritish-editor/data.ts), [`src/claritish-editor/data.test.ts`](../../../src/claritish-editor/data.test.ts), [`src/lint/grammar-anchors.ts`](../../../src/lint/grammar-anchors.ts), [`scripts/lib/link-rewrite.ts`](../../../scripts/lib/link-rewrite.ts), [`scripts/lint-anchors.ts`](../../../scripts/lint-anchors.ts), [`scripts/page-refs.ts`](../../../scripts/page-refs.ts), [`scripts/lib/deps.ts`](../../../scripts/lib/deps.ts), [`scripts/lint-cheat-sheets.ts`](../../../scripts/lint-cheat-sheets.ts), [`scripts/cheat-sheet-blocks.ts`](../../../scripts/cheat-sheet-blocks.ts), [`scripts/build.mjs`](../../../scripts/build.mjs).  
**Depends on:** none.  
**Order:** best landed before the next phase of `claritish-newcomer-rewrite.md`, whose writers it serves. Both edit `docs/meta/claritish-style.md`; do not run a phase of each at once.  
**Design authority:** none. Tooling, tests, and editor notes; no form and no reading changes. Edits under `docs/grammar/` are generated comments only.

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

**Comments.** Lessons already carry `<!-- Agent summary -->` and `<!-- Source (editors) -->` comments. `llms-txt.ts:85` strips comments, and `prose-style.ts:118` blanks them. `cheat-sheet-blocks.ts` claims `<!-- generated: SOURCE -->` … `<!-- /generated -->`, so the new block needs its own marker.

**Built in phase 1, for phase 2 to call:**
- `resolveLinkPage(from, target)` (import from `scripts/lib/link-rewrite.ts`): `from` is a file path or page key, `target` an href with or without `#id`; returns `claritish/x.md`, `x.md`, or `undefined` for an external URL. Also `pageKeyOf(file)`, `pageKeyArg(value)`, `pageKeyFile(key)`. `findPageReferences(text, file, page)` is in `scripts/lib/retarget-id.ts`.
- `npm run page-refs -- PAGE [--id ID]` (`scripts/page-refs.ts`); `retarget-id --page` accepts `claritish/x.md`.
- `scripts/lint-anchors.ts` exports `anchorLinks`, `pageIds`, `githubSlug`, `linkTargetFile`, `deadAnchors`, `blankCode`; it runs as `lint anchors` in `build.mjs` and as `npm run lint:anchors`. D5's "anchor in a registry that resolves to no id" check can call `pageIds`.

## Design

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

**D6. Where writers are told.** `grammar-docs.md` gets a short section on read-by blocks (what they hold, the whole-site list, `page-refs`, the anchor check, including its two settled rules: code spans are skipped, and links into pages outside `docs/grammar/` also pass on GitHub's heading slug). `claritish-style.md` gets a checklist row: before renaming a heading, reshaping a table, or rewording practice, read the page's read-by block. `AGENTS.md` gets one tooling note pointing at `page-refs`, `lint anchors`, and the block, and saying `retarget-id --page` takes `claritish/x.md`. Procedure pages that tell an agent to grep for inbound links point at `page-refs` instead.

## Plan

Phase 2 builds the generator on phase 1's scan, anchor check, and `page-refs`. If the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. No unit writes teaching prose, so there is no style gate; the meta edits in U7 get the self-check against the [doc-style checklist](../../meta/doc-style.md#checklist).

Gates: the orchestrator saves `npm run verify -- --baseline` at the start of the phase; each unit ends with `npm run verify` against it. The final gate is `npm run verify` passing against an empty baseline (`npm run verify -- --baseline` on a clean tree is not it: run plain `npm run verify` after removing `tmp/state/verify-baseline.json`).

### Phase 2: read-by blocks

**U4. Generator, registry lines.** `proposal-worker`, `model: opus`, effort `high`.
Write `scripts/page-readers.ts` (logic in `scripts/lib/page-readers.ts`) per D5: block placement after frontmatter, the `<!-- read-by` marker, check and `--write` modes in the `cheat-sheet-blocks.ts` pattern, the registry lines with counts, the unknown-registry check (resolve registry anchors with `pageIds` from `scripts/lint-anchors.ts` and `resolveLinkPage`), the `Inbound links:` line. Shape lines come in U6; leave a hook for them. Make `page-lines` and any line-count lint skip the block; run `npm run verify -- --fast` after a trial `--write` to find other tools the block disturbs, fix them, then revert the trial output (`git checkout -- docs/grammar`). Do not wire it into `build.mjs`.
**May edit:** new `scripts/page-readers.ts`, `scripts/lib/page-readers.ts` and tests, `package.json`, `src/lint/page-lines.ts` and other tools the trial shows read the top of a page.

**U5. Classify grammar-path readers.** `proposal-worker`, `model: sonnet`, effort `medium`.
List every file in `src/`, `scripts/` and `docs/grammar/.vitepress/` (tests left out) that names a grammar path by the D5 heuristic; there were 87 on 2026-11-23, before `scripts/page-refs.ts` and `scripts/lint-anchors.ts` (both whole-site). For each, from `grep -n` of its path and parsing lines (not whole-file reads), write one row to `tmp/state/page-readers-worklist.tsv`: file, `whole-site` or `shape`, and for `shape` the pages, part, the literal it uses, and what it requires. Also classify the three unread `anchor:` files from [Findings](#findings) as registry or not. Report the counts and every `shape` row.
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
- Page keys and link resolution: `resolveLinkPage`, `pageKeyOf`, `pageKeyFile` from scripts/lib/link-rewrite.ts; published ids: `pageIds` from scripts/lint-anchors.ts. Do not write another resolver.
- Never link to a page under docs/proposals/; name it in backticks.
- A change to what a build step writes, a data file's columns, or a loosened check is not yours to decide: write it up (problem, options, Recommendation (high/medium/low)) and skip the item.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- Do not commit.
Report (about 150 words): done (one line); new commands, exports and file names a later unit calls; files touched (count); verify line; skips and write-ups; left; inefficient.
```

## Open decisions

None block phase 2. Each below is autonomous (code shape), settled by the orchestrator per [settling a decision](../../meta/procedures/proposals.md#settling-a-decision).

- **Whole-site threshold.** Options: a contract goes on the whole-site list when it covers every page of a kind, or only when it covers every page. **Recommendation:** (medium) every page of a kind (all stage pages, all lessons, all cheat sheets). A rule on every lesson in each lesson's block repeats it eleven times, but it is the rule a lesson writer most needs to see; so lesson-wide contracts stay in the lesson blocks, and only stage-wide and site-wide ones move. U6 settles where the line falls if the stage-wide list is long.
- **Count order in registry lines.** **Recommendation:** (medium) one line per section in page order, registries in a fixed order, sections with no rows left out.

## Background

### Problem

The P1 session of `claritish-newcomer-rewrite.md` (session f698d6e5) cost about 2.57M weighted tokens. Writers searched for what reads or links into their lesson: about 83k, about 70k of it avoidable (greps for links into a lesson, how `lint-cheat-sheets.ts` reads tables, `reading-order.ts`, `flashcards-claritish.ts`, `claritish-flows.json`). Nothing a writer reads says what depends on a page. A hand-kept list would not stay right: the first draft of this plan, written from the run, got two readers wrong and missed two. Phase 1 fixed the other causes (no dead-anchor check, an undocumented placement rule).

### Goals

- A writer learns what reads a page from the page's first lines, and the list cannot drift from the code.

### Non-goals

- No inbound-link lists or counts in the blocks. `clause.md` has 436 references to its anchors, 223 from `docs/meta/`; a count goes stale with each edit elsewhere.
- No dead-anchor check for bare `page.md#id` mentions in code comments. Registry anchors are checked by the generator (D5), and construction homes already are by `lint:ageben`.
