# Cheat sheet print pagination

**Status:** PARTIALLY IMPLEMENTED. `@page`, light print colors, `<PageBreak />`, and `npm run lint:cheat-sheet-print` exist. Packed vs remaining sheets are in [Sheet status](#sheet-status). The lint default is still consonants only.  
**Related:** print CSS in [`custom.css`](../grammar/.vitepress/theme/custom.css); [`PrintButton.vue`](../grammar/.vitepress/components/PrintButton.vue); cheat sheet shape in [grammar-docs.md](../meta/grammar-docs.md#cheat-sheets); content lint in [`scripts/lint-cheat-sheets.ts`](../../scripts/lint-cheat-sheets.ts)  
**Design authority:** none for grammar. This is print layout and editor tooling for existing sheets. Forms and row wording stay on the owning pages and the sheets.

## Problem

Cheat sheets are lookup pages meant to print ([grammar-docs](../meta/grammar-docs.md#cheat-sheets): `pageClass: cheat-sheet`, then `<PrintButton />`). The button calls `window.print()`. Print CSS already hides site chrome, shrinks type to 9pt, and sets `break-inside: avoid` on tables. That is not enough to know or control what a learner gets:

- There is no `@page` rule. Paper size, margins, headers, and scale come from the print dialog, so pagination is not determined by the stylesheet.
- `break-inside: avoid` only *tries* to keep a table on one sheet. A table taller than the space left on the current sheet is pushed (blank leftover, then an implicit extra page). A table taller than one full sheet still splits. Chrome does not always honor avoid on tables.
- Those implicit breaks are invisible in the markdown. The one forced break that exists (Claritish `h2#sakes { break-before: page }`) lives only in CSS.
- An editor (human or agent) cannot inspect real print pages from the screen layout. Print-media emulation restyles a continuous column; it does not fragment. The in-IDE browser does not expose `Page.printToPDF`.

The content lint (`lint-cheat-sheets.ts`) checks rows against owning pages. It does not measure layout.

grammar-docs still says **one printable page per subsystem**. Several sheets already run longer than that on screen (Agebon → English especially). This proposal does not restore a one-page rule, and it does not cap page count. Authors place every sheet start in the file. The lint’s job is to catch a break Chromium added that the file did not.

## Goals

1. **Pin the page box** in CSS so print size and margins are the same for learners and for the lint.
2. **Every page start after the first is a `<PageBreak />` in the markdown**, not a CSS exception and not a form-feed character (HTML treats `\f` as whitespace; it will not start a sheet).
3. **Fail a dedicated print lint** when Chromium’s PDF has a page the markers do not account for, or when a table straddles two sheets. Not `npm run build`, not `npm test`.
4. **Fix by rearranging**, not by shrinking type further: insert a marker at the overflow, swap a short block onto the leftover space, or split a table that is taller than one full sheet into two tables with a marker between.
5. **Report page counts** per sheet (and leftover space) so a later cap, if any, is chosen from data.

## Non-goals

- A page-count cap (four or otherwise). Do not fail a sheet for being long. Extra blank space at the bottom of a short sheet is expected.
- Matching every print-dialog override (headers and footers, “fit to printable area”). `@page` is the contract the lint uses.
- Paged.js, on-screen letter-sized cards, or a visual print-preview route as the source of truth. The marker does not paint on screen.
- Changing what a sheet teaches, or splitting a sheet into several sidebar entries, unless rearrangement cannot save a table.
- Adding Playwright, Chromium, or this check to `npm run build` or Amplify. Publish stays free of a browser download.

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

`break-inside: avoid` stays as a browser safety net. It is not what the lint trusts: a pushed table is still an unexpected page unless a `<PageBreak />` sits before it.

Also force a light print background and dark text on cheat-sheet `pageClass`es, so a dark theme does not print as dark sheets. That is independent of pagination but belongs in the same print CSS.

### Marker

A Vue component `<PageBreak />`, registered next to `PrintButton`. Authors put it on its own line between blocks. That is the only way a new sheet starts after page 1.

```md
## Joins {#series}

…tables that should share this sheet…

<PageBreak />

## Extra nouns {#place}
```

| Context | Behavior |
|---------|----------|
| Print | `break-before: page`; the marker itself does not paint |
| Screen | Hidden; learners see one continuous column |
| Markdown | Grep-able; same pattern as `<PrintButton />` |

Do not hang pagination on heading classes. A break often belongs *before a table* under the same `##`.

Replace the Claritish `#sakes` CSS rule with a `<PageBreak />` in `claritish/cheat-sheet.md` in the same change as the component. After that, print CSS must not contain any other `break-before: page` (or `page-break-before`) on cheat-sheet pages: the file is the inventory.

### Lint: markers are the only breaks

A dedicated script, `npm run lint:cheat-sheet-print`. It is **not** part of `npm run build` or `npm test`. Document it on the cheat-sheets meta section when this is absorbed. Run it when changing a sheet’s layout, the print CSS, or `<PageBreak />`.

Playwright loads each cheat sheet (grammar `pageClass: cheat-sheet` and Claritish `claritish-cheat-sheet`) and prints with the pinned `@page` box (`page.pdf`, same paper and margins). `happy-dom` will not match 9pt table geometry. Markdown line counts (`page-lines.ts`) are the wrong unit.

Split the sheet’s `.vp-doc` on `<PageBreak />` into slices (page 1 is before the first marker). Each slice is one intended sheet.

**Fail** when any of these hold:

- **Unexpected break.** The PDF has a page that is not slice 1 and not “first extractable text after a marker.” Counting pages is not enough: a slice that overflows can add a page *and* shift a later marker onto the next sheet, so `1 + PageBreaks` still matches. Check that slice *i*’s first text starts PDF page *i*, and that slice *i*’s last text is still on PDF page *i*.
- **Split table.** A table’s first-row text and last-row text land on different pages (a slice taller than one sheet that Chrome cut through a table).
- **Table taller than one page content box.** A marker cannot save it; split the table in the source.

**Do not fail** on leftover blank space, or on a heading that lands near the bottom of a sheet if that slice still fits.

**Print a report** (stdout, and a file under `tmp/` is fine): per sheet, intended pages (`1 + PageBreaks`), PDF page count, leftover height on each page, each table’s height, and each failure (unexpected page start, with the first text on that PDF page and the nearest heading id; or a straddling table). That report is how we later decide whether a cap is worth it.

### Calibration, then no pictures

The real compositor is the PDF Playwright already made. The lint should read **that**, not pixels.

**Production (default):** parse the PDF with pdf.js (or equivalent): text items plus their positions, per page. Compare each slice’s first and last text to those items. A table splits when its first-row text and last-row text land on different pages. Disambiguate repeated headers (“Job / a / o / e / u / Stage”) by the heading text above them in the PDF stream. No screenshots, no vision model, no committed goldens.

**Calibration only (`--calibrate`):** write the Chromium PDF under `tmp/cheat-sheet-print/`. Open it next to the report and check that “unexpected break at …” / “page 2 starts at …” matches the sheets. Tune extraction until it does (heading detection, which strings bound a table or a slice, margin vs `@page`). Then drop `--calibrate` from ordinary runs. Do not commit the PDFs.

(Rendering each PDF page to a PNG in Node via pdf.js hits a worker `structuredClone` error in this environment. The PDF is the same compositor output; use it until a PNG path is worth it.)

**Why not golden screenshots as the lint.** Pixelmatch against committed page images is the usual non-AI use of screenshots: a human approved the pixels, a later run diffs them. That is a poor oracle here. “Did Chromium insert a page the file did not ask for?” is a fact about which page two strings landed on, not about antialiasing. Goldens break across OS, font raster, and Playwright versions, and they bloat the repo. Use them only if PDF text extraction cannot be made to agree with the pictures; that would be a calibration failure to fix, not a reason to lint pixels.

A DOM box-walk (print CSS, letter-wide viewport, `getBoundingClientRect`, treat `<PageBreak />` as a forced new sheet) is optional as a faster cross-check, and only after `--calibrate` shows it agrees with the PDF. The PDF stays the authority: it is what `window.print()` uses.

### When it fires

The finding names the unexpected page start or the table, and why (slice overflow, straddling, or taller than a page). The edit is one of:

1. **Marker at the overflow**, so the new sheet starts where Chromium already broke. Extra blank space on the previous sheet is expected.
2. **Move a shorter block** into the leftover space so the slice fits without another marker.
3. **Split a too-tall table** in the source into two tables (same columns, a marker between). Do not invent rows. A generated block (`<!-- generated: … -->`) stays generated: if it is too tall, the script that writes it must emit a marker (or two blocks) rather than a hand edit inside the markers.

Do not lower font size below 9pt to squeeze a slice. Do not drop `break-inside: avoid`. Do not add a CSS `break-before` to hide an implicit wrap.

## Inspectability

After this ships, “where does the next sheet start?” has two answers that the lint holds equal:

- In the file: every `<PageBreak />`.
- In the PDF: page count is `1 + PageBreaks`, and page *i* + 1 starts with the first text after the *i*-th marker.

`--calibrate` PDFs are for bringing those two into line with Chromium, then they go away. Ordinary runs do not write files.

## Sheet status

**Packed** means markers (or a single Letter page) match the PDF, leftover space was filled when a later block fit, and `npm run lint:cheat-sheet-print -- --only <id>` is clean. **Open** means Chromium still inserts pages the file did not ask for. Counts are from `--all --report` (Letter, 0.4in). Update the row when a sheet is packed.

| Sheet | Status | Chromium pages | What's left |
|-------|--------|----------------|-------------|
| [Sounds and spelling](../grammar/cheat-sheets/sounds-spelling.md) | Packed | 3 | Leftover 43 / 219 / 353 px |
| [Vowels](../grammar/cheat-sheets/vowels.md) | Open | 5 | Markers; tables `acts` and `order` taller than a page |
| [Consonants](../grammar/cheat-sheets/consonants.md) | Packed | 4 | Lint default. Leftover 196 / 81 / 330 / 288 px |
| [Word shape and clause](../grammar/cheat-sheets/word-shape-clause.md) | Open | 5 | Markers; split `packaging` |
| [People and pointing](../grammar/cheat-sheets/people-pointing.md) | Open | 4 | Markers; table `collective` taller than a page |
| [Talking](../grammar/cheat-sheets/talking.md) | Open | 5 | Markers; split `stacked`, `ask`, `several`, `answering` |
| [Knowing and intending](../grammar/cheat-sheets/knowing-intending.md) | Open | 7 | Markers; several tables taller than a page (`holder`, `stance`, `intending`, `ability`) |
| [Why and allowed](../grammar/cheat-sheets/why-allowed.md) | Open | 6 | Markers; split `fault`, `stance-vowels`, `thanks-sorry`, `motion`, `deontic` |
| [Joins and hooks](../grammar/cheat-sheets/joins-hooks.md) | Open | 6 | Markers; one split table |
| [Restrictors and spans](../grammar/cheat-sheets/restrictors-spans.md) | Open | 5 | Markers; four split tables |
| [Linking clauses](../grammar/cheat-sheets/linking-clauses.md) | Open | 7 | Markers; eight split tables |
| [Roles and comparing](../grammar/cheat-sheets/roles-comparing.md) | Open | 9 | Markers; ten split tables |
| [Numbers](../grammar/cheat-sheets/numbers.md) | Open | 10 | Markers; many split tables; `end-stacked` taller than a page |
| [Ageben → English](../grammar/cheat-sheets/to-english.md) | Open | 35 | Markers (generator must emit them for `compounds`); four split tables; `compounds` taller than a page |
| [Exceptions](../grammar/cheat-sheets/exceptions.md) | Fits 1 | 1 | No marker needed. Leftover 412 px |
| [Claritish](../grammar/claritish/cheat-sheet.md) | Marked | 2 | Sakes marker matches the PDF. Not packed as a leftover pass. Leftover 30 / 196 px |

`--all` stays report-only until every Open row is Packed (or Fits 1 / Marked and then packed). Do not make `--all` the lint default while Open rows remain.

## Open questions

- **Letter vs A4 as the learner default.** Lint to Letter either way. If most printers are A4, `@page { size: A4 }` still leaves the lint on Letter so a table cannot grow into the extra height.
- **Generated blocks that overflow.** Prefer the generator emitting two blocks plus a marker over making those tables an exception.
- **Repeated table headers in the PDF.** If two tables on one sheet share a header line, heading context may not be enough. A lint-only caption or `data-` marker that prints as extractable text is allowed if calibration shows collisions.

## Plan

1. ~~Add `@page` and light print colors; add `<PageBreak />`; move the Claritish Sakes break into the markdown; drop other cheat-sheet `break-before: page` rules.~~
2. ~~Add `npm run lint:cheat-sheet-print` with a report-only mode and `--calibrate` PDFs. Do not hook it to `build` or `test`.~~ Default is the consonants pilot.
3. Pack each Open row in [Sheet status](#sheet-status): `--calibrate` / `--only <id>`, place `<PageBreak />`, move a shorter block into leftover space, split a too-tall table. Mark the row Packed when that id is lint-clean.
4. When no Open rows remain, switch the lint default to `--all`.
5. Fold the policy (separate script, every sheet start is a marker, fix by rearranging, pack leftover, no page cap) into [grammar-docs.md](../meta/grammar-docs.md#cheat-sheets) fully and drop or shorten this proposal. A first pass is already on that page.
6. Out of scope until we have counts: fail on page count (a cap), not on unmarked breaks.
