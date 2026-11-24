/**
 * The scope report: walks every grammar example (the walk `npm run sweep` runs) and records, per reading, its frame
 * families, frame order, unordered pairs, stance lists, nested-reading kind and links (`src/interpret/scope-report.ts`).
 * Prints a summary; the full report goes to tmp/logs/scope-report.md.
 *
 * Options: --save  write the records to tmp/state/scope-report.json
 *          --diff  print only the examples whose record changed since the save (with --save, then save the new records)
 *
 * Run: npm run scope-report
 *      npm run scope-report -- --save
 *      npm run scope-report -- --diff
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { forEachExample, readSnapshot, writeSnapshot } from "../src/interpret/accounting-walk.js";
import {
  countReport,
  diffReports,
  formatReport,
  formatSummary,
  scopeReport,
  type ReportExample,
  type ScopeReport,
} from "../src/interpret/scope-report.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";

const SAVE = "scope-report.json";
const USAGE = "Usage: npm run scope-report -- [--save] [--diff]";

const args = process.argv.slice(2);
const bad = args.filter((a) => a !== "--save" && a !== "--diff");
if (bad.length) {
  console.error(`Unknown argument ${bad[0]}. ${USAGE}`);
  process.exit(1);
}
const save = args.includes("--save");
const before = args.includes("--diff") ? readSnapshot<ScopeReport>(SAVE) : undefined;
if (args.includes("--diff") && !before) {
  console.error(`No saved report at ${tmpRel("state", SAVE)}; run npm run scope-report -- --save first.`);
  process.exit(1);
}

const examples: ReportExample[] = [];
forEachExample(loadDefaultTables(), (file, example) => examples.push({ file, text: example.text, allReadings: example.allReadings }));
const report = scopeReport(examples);
const counts = countReport(report);

const out = tmpPath("logs", "scope-report.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${formatReport(report, counts).join("\n")}\n`);

if (before) {
  const changed = diffReports(before, report);
  console.log(changed.length ? changed.join("\n") : "No example's record changed.");
} else {
  console.log(formatSummary(report, counts).join("\n"));
  console.log(`\nFull report: ${tmpRel("logs", "scope-report.md")}`);
}
if (save) console.log(`\nSaved to ${writeSnapshot(SAVE, report)}`);
