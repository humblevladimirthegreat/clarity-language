# Cheat sheet print pagination

**Status:** PROPOSED  
**Related:** print CSS in [`custom.css`](../grammar/.vitepress/theme/custom.css); [`PrintButton.vue`](../grammar/.vitepress/components/PrintButton.vue); cheat sheet shape in [grammar-docs.md](../meta/grammar-docs.md#cheat-sheets); content lint in [`scripts/lint-cheat-sheets.ts`](../../scripts/lint-cheat-sheets.ts)  
**Design authority:** none for grammar. This is print layout and editor tooling for existing sheets. Forms and row wording stay on the owning pages and the sheets.

## Problem

Cheat sheets are lookup pages meant to print ([grammar-docs](../meta/grammar-docs.md#cheat-sheets): `pageClass: cheat-sheet`, then `<PrintButton />`). The button calls `window.print()`. Print CSS already hides site chrome, shrinks type to 9pt, and sets `break-inside: avoid` on tables. That is not enough to know or control what a learner gets:

- There is no `@page` rule. Paper size, margins, headers, and scale come from the print dialog, so pagination is not determined by the stylesheet.
- `break-inside: avoid` only *tries* to keep a table on one sheet. A table taller than the space left on the current sheet is pushed (blank leftover, then an implicit extra page). A table taller than one full sheet still splits. Chrome does not always honor avoid on tables.
- Those implicit breaks are invisible in the markdown. The one forced break that exists (Claritish `h2#sakes { break-before: page }`) lives only in CSS.
- An editor (human or agent) cannot inspect real print pages from the screen layout. Print-media emulation restyles a continuous column; it does not fragment. The in-IDE browser does not expose `Page.printToPDF`.

The content lint (`lint-cheat-sheets.ts`) checks rows against owning pages. It does not measure layout.

grammar-docs still says **one printable page per subsystem**. Several sheets already run longer than that on screen (Agebon → English especially). This proposal does not restore a one-page rule, and it does not cap page count. First question: can every table sit on one sheet if we are willing to insert breaks and move blocks?

## Goals

1. **Pin the page box** in CSS so print size and margins are the same for learners and for the lint.
2. **Make page starts visible in the source** with an explicit marker, not a CSS exception and not a form-feed character (HTML treats `\f` as whitespace; it will not start a sheet).
3. **Fail the build when a table would split** across two sheets under that page box.
4. **Fix by rearranging**, not by shrinking type further: insert a marker before the table, swap a short block onto the leftover space, or split a table that is taller than one full sheet into two tables with a marker between.
5. **Report page counts** per sheet (and leftover space) so a later cap, if any, is chosen from data.

## Non-goals

- A page-count cap (four or otherwise). Do not fail a sheet for being long.
- Requiring every *prose* wrap to be an explicit marker in this phase. Implicit page wraps through headings and paragraphs are allowed until the table-split lint is clean and we have counts.
- Matching every print-dialog override (headers and footers, “fit to printable area”). `@page` is the contract the lint uses.
- Paged.js, on-screen letter-sized cards, or a visual print-preview route as the source of truth. A dashed rule on the marker is enough for screenshots.
- Changing what a sheet teaches, or splitting a sheet into several sidebar entries, unless rearrangement cannot save a table.

## What exists

| Piece | Role | Limit |
|-------|------|-------|
| `@media print` in `custom.css` | Hide chrome, 9pt type, tight table padding, `break-inside: avoid` | No `@page`; continuous column on screen |
| `.claritish-cheat-sheet .vp-doc h2#sakes { break-before: page }` | One hardcoded sheet start | Not in the markdown; agents cannot see it |
| `<PrintButton />` | `window.print()` | Dialog settings still apply |
| `lint-cheat-sheets.ts` / `cheat-sheet-blocks.ts` | Rows match owning pages and data | No geometry |

## Design

### Page box

In the existing print block, add:

```css
@page {
  size: letter;
  margin: 0.4in;
}
```

**Letter, not A4:** Letter is shorter, so a table that fits the lint fits A4 with leftover. The content width is `8.5in − 0.8in`. The content height is `11in − 0.8in`.

`break-inside: avoid` stays as a browser safety net. It is not what the lint trusts.

Also force a light print background and dark text on cheat-sheet `pageClass`es, so a dark theme does not print as dark sheets. That is independent of pagination but belongs in the same print CSS.

### Marker

A Vue component `<PageBreak />`, registered next to `PrintButton`. Authors put it on its own line between blocks:

```md
## Joins {#series}

…tables that should share this sheet…

<PageBreak />

## Extra nouns {#place}
```

| Context | Behavior |
|---------|----------|
| Print | `break-before: page`; the marker itself does not paint |
| Screen | A short dashed rule (and a “print page” label) so a screenshot shows the intended start |
| Markdown | Grep-able; same pattern as `<PrintButton />` |

Do not hang pagination on heading classes. A break often belongs *before a table* under the same `##`.

Replace the Claritish `#sakes` CSS rule with a `<PageBreak />` in `claritish/cheat-sheet.md` in the same change as the component.

### Lint: no split table

A small script loads each cheat sheet (grammar `pageClass: cheat-sheet` and Claritish `claritish-cheat-sheet`) in Chromium with print CSS and the `@page` content width. It walks `.vp-doc` in document order, treating `<PageBreak />` as a forced new sheet, and lays other blocks into the remaining content height.

**Fail** when any `table`:

- is taller than one page content box (a marker cannot save it), or
- would start on one sheet and end on the next, given the markers already in the file.

**Do not fail** on page count, leftover blank space, or a heading that lands near the bottom of a sheet.

**Print a report** (stdout, and a file under `tmp/` is fine): per sheet, page count under this model, leftover height on each page, each table’s height, and each failure with the table’s caption or first-row text and the nearest heading id. That report is how we later decide whether a cap is worth it.

Use Playwright (or Puppeteer) against the real print layout. `happy-dom` is already in the repo and will not match 9pt table geometry closely enough. Measuring markdown line counts (`page-lines.ts`) is the wrong unit.

Wire it so `npm run build` runs it once Chromium is a known cost on the publish machine. Until then, a dedicated `npm run lint:cheat-sheet-print` is enough, as long as the first table-split failures are fixed in the same change that turns the check on.

### When it fires

The finding names the table and why (taller than a page, or straddling). The edit is one of:

1. **Marker before the table**, so it starts a new sheet. Extra blank space on the previous sheet is expected.
2. **Move a shorter block** into the leftover space so the table fits without a marker.
3. **Split a too-tall table** in the source into two tables (same columns, a marker between). Do not invent rows. A generated block (`<!-- generated: … -->`) stays generated: if it is too tall, the script that writes it must emit a marker (or two blocks) rather than a hand edit inside the markers.

Do not lower font size below 9pt to squeeze a table. Do not drop `break-inside: avoid`.

## Inspectability

After this ships, “where does the next sheet start?” has two answers that agree:

- In the file: every `<PageBreak />`.
- In the report: page count and which heading opens each page.

Agents still cannot screenshot Chromium’s print compositor from the in-IDE browser. They do not need to, for tables, if the lint is the authority. A later pass can dump each PDF page to PNG for eye checks; that is not required to turn the lint on.

## Open questions

- **Letter vs A4 as the learner default.** Lint to Letter either way. If most printers are A4, `@page { size: A4 }` still leaves the lint on Letter so a table cannot grow into the extra height.
- **Build vs separate script.** Playwright downloads Chromium. If that is too slow or too large for `npm run build` on Amplify, keep the check as its own script and document it on the cheat-sheets meta section until publish CI can run it.
- **Generated blocks that overflow.** Prefer the generator emitting two blocks plus a marker over making those tables an exception.

## Plan

1. Add `@page` and light print colors; add `<PageBreak />`; move the Claritish Sakes break into the markdown.
2. Write the measurement script and a report for every current sheet, with no fail-on-split yet. Read the report: which tables already straddle or exceed one page.
3. Rearrange those sheets (markers, block order, split tables) until the report is clean.
4. Turn table-straddle / table-too-tall into a failing check. Fold the policy (marker in the file, fix by rearranging, no page cap yet) into [grammar-docs.md](../meta/grammar-docs.md#cheat-sheets). Drop or shorten this proposal.
5. Out of scope until we have counts: fail on page count; fail on implicit wraps through prose; require every page start to be a marker.
