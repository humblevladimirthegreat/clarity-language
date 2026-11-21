/**
 * Print the classification-table rows of `docs/meta/interpreter.md` for part keys: each row's line number, class,
 * anchor and note cell. A key is the full key a `left` entry names (`joinSeries:ue`, `overlay:clause_hinge:th`); a
 * type or a partial key (`joinSeries`, `overlay:clause_hinge`) lists every row under it.
 *
 * Run: npm run class-row -- joinSeries:ue
 *      npm run class-row -- edge:force shared:equative
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { REPO_ROOT } from "../src/repo-paths.js";
import { formatRow, parseClassTable, rowsFor } from "./lib/class-row.ts";

const FILE = "docs/meta/interpreter.md";
const keys = process.argv.slice(2);
if (!keys.length || keys.some((k) => k.startsWith("-"))) {
  console.error("Usage: npm run class-row -- KEY …   (such as joinSeries:ue)");
  process.exit(1);
}
const rows = parseClassTable(readFileSync(join(REPO_ROOT, FILE), "utf8"));
let missing = 0;
for (const key of keys) {
  const found = rowsFor(rows, key);
  if (!found.length) {
    console.log(`${key}: no row in the classification table`);
    missing++;
  }
  for (const row of found) console.log(formatRow(row, FILE));
}
process.exit(missing ? 1 : 0);
