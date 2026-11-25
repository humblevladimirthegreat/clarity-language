# Cheat sheets (editors)

Steps for adding a cheat sheet or changing a sheet's tables or page breaks. What a sheet holds, how it prints, and what the build checks are policy in [cheat sheets](../grammar-docs.md#cheat-sheets); this page is the step-by-step.

## Adding a sheet {#adding-a-sheet}

1. Create it in `docs/grammar/cheat-sheets/`, in the shape [cheat sheets](../grammar-docs.md#cheat-sheets) gives.
2. Register it in `SHEETS` in `scripts/lint-cheat-sheets.ts`.
3. Add a row to `cheatSheetSidebar` in [`reading-order.ts`](../../grammar/.vitepress/lib/reading-order.ts) (the VitePress config imports it).
4. Mark its owning tables ([opting an owning table in](../grammar-docs.md#cheat-sheets)).
5. Place `<PageBreak />` so Chromium's PDF matches the file, then run the [print check](#print-breaks) with `--only ID`.
6. Run `npm run build`.

## Changing a sheet {#changing-a-sheet}

1. When a sheet holds generated blocks, run `npm run cheat-sheet-blocks -- --write` after the data changes; never edit inside the markers.
2. When a table grew, a block moved, or a `<PageBreak />` moved, run the [print check](#print-breaks) on that sheet.
3. Run `npm run build`.

## Print breaks {#print-breaks}

`npm run lint:cheat-sheet-print` prints Chromium's PDF with the sheets' `@page` box and fails when a PDF page is not a `<PageBreak />` slice, when a table's first and last row land on different pages, or when a table is taller than one page's content box. It is not part of `npm run build`, `npm test` or `npm run verify`, so run it yourself.

- **Scope:** default is every grammar sheet plus Claritish; `--only ID` checks one sheet (its sidebar slug, or `claritish`).
- **Calibrate:** `--calibrate` writes PDFs under `tmp/out/cheat-sheet-print/`. Do not commit them.
- **Setup:** it needs Playwright Chromium once (`npx playwright install chromium`).
- **When:** after changing a sheet's layout or tables, the print CSS, or a `<PageBreak />`.
- **Fixing a failure:** rearrange, following the print rules in [cheat sheets](../grammar-docs.md#cheat-sheets): move a marker, pack a shorter block into leftover space, or split a too-tall table into two with a marker between. Never shrink type or add a CSS `break-before`.
- **Claritish:** a page that renders with no content usually means the journal editor's flow data no longer resolves against the sheet; `npm test -- src/claritish-editor/data.test.ts` shows it.
