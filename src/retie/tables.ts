/**
 * The two lexicons a retie reads: the **old** one (pre-retie text parses against it) and the
 * **current** one (retied text parses against it). Each is exact: every row under one spelling.
 *
 * A single table that knew both spellings at once was ambiguous whenever the new lexicon reuses
 * an old spelling for another row (`era` was *ear*, is now *brick*) or the map has a cycle
 * (`oza` → `ezu`, `aza` → `oza`, `ezu` → `aza`): forward-mapping an already-new overlay invented
 * words (`azar` read as *not-yet*), and old and new text classified differently.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseCompoundCsv, retieCompoundRows, type CompoundRow } from "../lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv, type OverlayRow, type PublishedRow } from "../lexicon-search.js";
import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { REPO_ROOT } from "../repo-paths.js";

import { retieCore } from "./rebuild.js";

export type RetieTables = { old: ClassifyTables; current: ClassifyTables };

/** A single table stands for both sides (tests, or a lexicon the map does not touch). */
export function asRetieTables(tables: ClassifyTables | RetieTables): RetieTables {
  return "old" in tables && "current" in tables ? tables : { old: tables, current: tables };
}

type Rows = { published: PublishedRow[]; overlays: OverlayRow[]; compounds: CompoundRow[] };

/** Rows with every root moved through `map` in one simultaneous pass (never chained). */
function shiftRows(rows: Rows, map: ReadonlyMap<string, string>): Rows {
  const rootByEmoji = new Map(rows.published.map((row) => [row.emoji, row.root]));
  return {
    published: rows.published.map((row) => ({ ...row, root: map.get(row.root) ?? row.root })),
    overlays: rows.overlays.map((row) => ({ ...row, senseForm: shiftSenseForm(row, rootByEmoji, map) })),
    compounds: retieCompoundRows(rows.compounds, map).rows,
  };
}

/**
 * An overlay moves with its own emoji's root only (as `convert-word` respells it), parsed with
 * its PoS: a bare `uxegam` is not a word, and a whole-map rewrite could touch another root.
 */
function shiftSenseForm(row: OverlayRow, rootByEmoji: ReadonlyMap<string, string>, map: ReadonlyMap<string, string>): string {
  const from = row.emoji ? rootByEmoji.get(row.emoji) : undefined;
  const to = from === undefined ? undefined : map.get(from);
  if (from === undefined || to === undefined) return row.senseForm;
  const next = retieCore(`${row.pos}${row.senseForm}`, new Map([[from, to]]));
  return next?.startsWith(row.pos) ? next.slice(row.pos.length) : row.senseForm;
}

function tablesOf(rows: Rows): ClassifyTables {
  return createClassifyTablesFromRows(rows.published, rows.overlays, rows.compounds);
}

/**
 * Whether the lexicon CSVs already hold the new spellings (`convert-word --lexicon` ran):
 * more old spellings are missing from them than new ones.
 */
export function lexiconConverted(roots: ReadonlySet<string>, map: ReadonlyMap<string, string>): boolean {
  let oldMissing = 0;
  let newMissing = 0;
  for (const [oldRoot, newRoot] of map) {
    if (!roots.has(oldRoot)) oldMissing += 1;
    if (!roots.has(newRoot)) newMissing += 1;
  }
  return oldMissing >= newMissing;
}

/** Old and current lexicons for `map`, from the CSVs under `rootDir/data` in either state. */
export function retieTables(map: ReadonlyMap<string, string>, rootDir = REPO_ROOT): RetieTables {
  const data = (name: string) => readFileSync(join(rootDir, "data", name), "utf8");
  const rows: Rows = {
    published: parsePublishedCsv(data("lexicon-published.csv")),
    overlays: parseOverlayCsv(data("lexicon-overlays.csv")),
    compounds: parseCompoundCsv(data("lexicon-compounds.csv")),
  };
  const roots = new Set(rows.published.map((row) => row.root));
  if (lexiconConverted(roots, map)) {
    const reverse = new Map([...map].map(([oldRoot, newRoot]) => [newRoot, oldRoot]));
    return { old: tablesOf(shiftRows(rows, reverse)), current: tablesOf(rows) };
  }
  return { old: tablesOf(rows), current: tablesOf(shiftRows(rows, map)) };
}

