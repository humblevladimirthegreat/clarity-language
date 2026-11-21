/**
 * The translation accounting sweep: walks every grammar example through `translate()` (the walk
 * `src/interpret/accounting.test.ts` runs, from `src/interpret/accounting-walk.ts`) and prints the readings left out by
 * reason and frame key, the unused parts by part key, and the examples where `translate()` threw. It is not the reader
 * coverage sweep (`src/interpret/sweep.test.ts`).
 *
 * Options: --save  write the counts to tmp/state/sweep-accounting.json
 *          --diff  print only the keys whose count changed since the save (with --save, then save the new counts)
 *
 * Run: npm run sweep
 *      npm run sweep -- --save
 *      npm run sweep -- --diff
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { walkAccounting } from "../src/interpret/accounting-walk.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { countWalk, diffCounts, formatCounts, formatDiff, type SweepCounts } from "./lib/sweep.ts";

const SAVE = tmpPath("state", "sweep-accounting.json");
const USAGE = "Usage: npm run sweep -- [--save] [--diff]";

const args = process.argv.slice(2);
const bad = args.filter((a) => a !== "--save" && a !== "--diff");
if (bad.length) {
  console.error(`Unknown argument ${bad[0]}. ${USAGE}`);
  process.exit(1);
}
const save = args.includes("--save");
const diff = args.includes("--diff");
if (diff && !existsSync(SAVE)) {
  console.error(`No saved counts at ${tmpRel("state", "sweep-accounting.json")}; run npm run sweep -- --save first.`);
  process.exit(1);
}

const counts = countWalk(walkAccounting(loadDefaultTables()));
if (diff) {
  const before = JSON.parse(readFileSync(SAVE, "utf8")) as SweepCounts;
  console.log(formatDiff(diffCounts(before, counts)).join("\n"));
} else {
  console.log(formatCounts(counts).join("\n"));
}
if (save) {
  mkdirSync(dirname(SAVE), { recursive: true });
  writeFileSync(SAVE, `${JSON.stringify(counts, null, 2)}\n`);
  console.log(`\nSaved to ${tmpRel("state", "sweep-accounting.json")}`);
}
