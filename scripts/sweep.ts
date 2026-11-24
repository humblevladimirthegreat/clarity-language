/**
 * The translation accounting sweep: walks every grammar example through `translate()` (the walk
 * `src/interpret/accounting.test.ts` runs, from `src/interpret/accounting-walk.ts`) and prints the readings left out by
 * reason and frame key, the unused parts by part key, and the examples where `translate()` threw. It is not the reader
 * coverage sweep (`src/interpret/sweep.test.ts`).
 *
 * Options: --save  write the counts to tmp/state/sweep-accounting.json
 *          --diff  print only the keys whose count changed since the save (with --save, then save the new counts)
 *          --texts KEY …  instead of counts, the example texts behind each key: a left reason (`fragment`), a frame or
 *                  part key (`lexReading:standIn`), or a type that heads keys (`edge`); each text with its count and file
 *
 * Run: npm run sweep
 *      npm run sweep -- --save
 *      npm run sweep -- --diff
 *      npm run sweep -- --texts edge:hook fragment
 */
import { readSnapshot, walkAccounting, writeSnapshot } from "../src/interpret/accounting-walk.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { tmpRel } from "../src/tmp-paths.js";
import { countWalk, diffCounts, formatCounts, formatDiff, formatTexts, textsFor, type SweepCounts } from "./lib/sweep.ts";

const SAVE = "sweep-accounting.json";
const USAGE = "Usage: npm run sweep -- [--save] [--diff] | --texts KEY …";

const argv = process.argv.slice(2);
const at = argv.indexOf("--texts");
const textKeys = at >= 0 ? argv.slice(at + 1) : [];
const args = at >= 0 ? argv.slice(0, at) : argv;
const bad = args.filter((a) => a !== "--save" && a !== "--diff");
if (bad.length || (at >= 0 && (!textKeys.length || args.length))) {
  console.error(bad.length ? `Unknown argument ${bad[0]}. ${USAGE}` : `--texts takes one or more keys and no other flag. ${USAGE}`);
  process.exit(1);
}
if (textKeys.length) {
  console.log(formatTexts(textsFor(walkAccounting(loadDefaultTables()).left, textKeys), textKeys).join("\n"));
  process.exit(0);
}
const save = args.includes("--save");
const diff = args.includes("--diff");
const before = diff ? readSnapshot<SweepCounts>(SAVE) : undefined;
if (diff && !before) {
  console.error(`No saved counts at ${tmpRel("state", SAVE)}; run npm run sweep -- --save first.`);
  process.exit(1);
}

const counts = countWalk(walkAccounting(loadDefaultTables()));
if (before) {
  console.log(formatDiff(diffCounts(before, counts)).join("\n"));
} else {
  console.log(formatCounts(counts).join("\n"));
}
if (save) {
  console.log(`\nSaved to ${writeSnapshot(SAVE, counts)}`);
}
