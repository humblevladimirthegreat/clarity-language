/**
 * The context report: how often each pass of `markContext` retypes a word from its neighbors over the grammar
 * examples, and how far past the word each decision had to look (src/parse/context-report.ts).
 *
 * Options: --save  write the counts to tmp/state/context-report.json
 *          --diff  print only the counts that changed since the save (with --save, then save the new counts)
 *
 * Run: npm run context-report
 *      npm run context-report -- --save
 *      npm run context-report -- --diff
 * Stdout is the per-pass summary; the full report, with samples, goes to tmp/logs/context-report.md.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { contextCounts, diffContextCounts, formatReport, formatSummary, walkContext } from "../src/parse/context-report.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { clip } from "./lib/build-output.ts";

const SAVE = tmpPath("state", "context-report.json");
const REPORT = tmpPath("logs", "context-report.md");

const args = process.argv.slice(2);
const bad = args.filter((a) => a !== "--save" && a !== "--diff");
if (bad.length) {
  console.error(`Unknown argument ${bad[0]}. Usage: npm run context-report -- [--save] [--diff]`);
  process.exit(1);
}
const save = args.includes("--save");
const diff = args.includes("--diff");
if (diff && !existsSync(SAVE)) {
  console.error(`No saved counts at ${tmpRel("state", "context-report.json")}; run npm run context-report -- --save first.`);
  process.exit(1);
}

const walk = walkContext(loadDefaultTables());
const counts = contextCounts(walk);
mkdirSync(dirname(REPORT), { recursive: true });
writeFileSync(REPORT, `${formatReport(walk).join("\n")}\n`);
if (diff) {
  const before = JSON.parse(readFileSync(SAVE, "utf8")) as Record<string, number>;
  console.log(diffContextCounts(before, counts).map(clip).join("\n"));
} else {
  console.log(formatSummary(walk).map(clip).join("\n"));
}
console.log(`\nFull report: ${tmpRel("logs", "context-report.md")}`);
if (save) {
  mkdirSync(dirname(SAVE), { recursive: true });
  writeFileSync(SAVE, `${JSON.stringify(counts, null, 2)}\n`);
  console.log(`Saved to ${tmpRel("state", "context-report.json")}`);
}
