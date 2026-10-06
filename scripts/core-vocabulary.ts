/**
 * Core vocabulary seed (docs/meta/lexicon.md#core-vocabulary-column).
 *
 * Run: npm run core-vocabulary                 report against the `core` column (or the seed when it is empty)
 *      npm run core-vocabulary -- --write      fill the empty `core` column from first appearance in stage banks
 *      npm run core-vocabulary -- --write --force   reseed, overwriting hand edits
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { readingOrder } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { CORE_CAP, coreReport, firstAppearance, stageCheckpoints, storedCore } from "../src/core-vocabulary.js";
import { parseCsv, serializeCsv } from "../src/csv.js";
import { sidebarPage } from "../src/lint/learning-order.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const files = [
  { path: dataPath("lexicon-published.csv"), key: "root" },
  { path: dataPath("lexicon-compounds.csv"), key: "stem" },
] as const;

function parseArgs(argv: string[]): { write: boolean; force: boolean } {
  const options = { write: false, force: false };
  for (const arg of argv) {
    if (arg === "--write") options.write = true;
    else if (arg === "--force") options.force = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const tables = loadDefaultTables();
  const pages = readingOrder.map((item) => sidebarPage(item.link));
  const checkpoints = stageCheckpoints(
    pages,
    (page) => {
      const path = join(grammarDir, page);
      return existsSync(path) ? readFileSync(path, "utf8") : undefined;
    },
    tables,
  );
  const seed = firstAppearance(checkpoints);

  const csvs = files.map((file) => ({ ...file, ...parseCsv(readFileSync(file.path, "utf8")) }));
  const stored = storedCore();

  if (options.write) {
    if (stored.size > 0 && !options.force) {
      throw new Error(`${stored.size} core cell(s) already set; pass --force to reseed over them`);
    }
    let set = 0;
    for (const csv of csvs) {
      for (const row of csv.rows) {
        row.core = seed.get(row[csv.key]!) ?? "";
        if (row.core) set += 1;
      }
      writeFileSync(csv.path, serializeCsv(csv.headers, csv.rows));
    }
    const missing = [...seed.keys()].filter((root) => !csvs.some((csv) => csv.rows.some((row) => row[csv.key] === root)));
    if (missing.length > 0) throw new Error(`bank roots with no lexicon row: ${missing.join(", ")}`);
    console.log(`Wrote ${set} core cell(s).`);
  }

  const core = options.write || stored.size === 0 ? seed : stored;
  const report = coreReport(checkpoints, core);
  for (const { checkpoint, fresh, review, overCap } of report) {
    const shared = (e: { agazan: string }) => checkpoint.entries.filter((o) => o.agazan === e.agazan).length > 1;
    const words = fresh.map((e) => `${e.english} \`${e.agazan}\`${shared(e) ? ` [${e.root}]` : ""}`).join(", ");
    console.log(`${overCap ? "OVER" : "    "} ${String(fresh.length).padStart(2)} new  ${String(review.length).padStart(2)} review  ${checkpoint.anchor}  ${words}`);
  }
  const over = report.filter((r) => r.overCap);
  console.log("");
  console.log(`${core.size} core root(s) across ${report.length} checkpoint(s); cap ${CORE_CAP}.`);
  console.log(`${over.length} checkpoint(s) over the cap (${over.reduce((n, r) => n + r.fresh.length - CORE_CAP, 0)} root(s) to move).`);
  if (!options.write && stored.size === 0) console.log("Dry-run: core column is empty; pass --write to seed it.");
}

main();
