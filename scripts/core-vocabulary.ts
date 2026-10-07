/**
 * Core vocabulary seed (docs/meta/lexicon.md#core-vocabulary-column).
 *
 * Run: npm run core-vocabulary                 report against the `core` column (or the seed when it is empty)
 *      npm run core-vocabulary -- --write      fill the empty `core` column from first appearance in stage banks
 *      npm run core-vocabulary -- --write --force   reseed, overwriting hand edits
 *      npm run core-vocabulary -- --for clause.md:beginner [--limit 12]
 *                                              spacing for one checkpoint (page.md:band or page.md#id): roots it may
 *                                              introduce, roots it could pull forward, review roots unused longest
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { levelReviewPage, readingOrder } from "../docs/grammar/.vitepress/lib/reading-order.js";
import {
  CORE_CAP,
  CORE_REVIEW_MIN,
  coreReport,
  findCheckpoint,
  firstAppearance,
  spacingPlan,
  stageCheckpoints,
  storedCore,
  type Checkpoint,
  type SpacingWord,
} from "../src/core-vocabulary.js";
import { parseCsv, serializeCsv } from "../src/csv.js";
import { sidebarPage } from "../src/lint/learning-order.js";
import type { ClassifyTables } from "../src/parse/classify.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { dataPath, REPO_ROOT } from "../src/repo-paths.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const files = [
  { path: dataPath("lexicon-published.csv"), key: "root" },
  { path: dataPath("lexicon-compounds.csv"), key: "stem" },
] as const;

/** Pull-forward candidates shown with `--for`. */
const PULL_FORWARD_SHOWN = 5;

type Options = { write: boolean; force: boolean; for?: string; limit: number };

function parseArgs(argv: string[]): Options {
  const options: Options = { write: false, force: false, limit: 12 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") options.write = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--for" && argv[i + 1]) options.for = argv[++i];
    else if (arg === "--limit" && /^\d+$/.test(argv[i + 1] ?? "")) options.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (options.for && options.write) throw new Error("--for does not combine with --write");
  return options;
}

function printSpacing(checkpoints: Checkpoint[], core: ReadonlyMap<string, string>, tables: ClassifyTables, options: Options): void {
  const index = findCheckpoint(checkpoints, options.for!);
  const gloss = (root: string) => {
    const row = tables.published.get(root) ?? tables.compounds.get(root);
    return row && (row.concrete || row.abstract);
  };
  const { checkpoint, introduce, pullForward, review } = spacingPlan(checkpoints, core, index, gloss);
  const show = (w: SpacingWord) => `${w.english} \`${w.agazan}\``;

  console.log(`${checkpoint.anchor}  (${checkpoint.band}, checkpoint ${index + 1} of ${checkpoints.length}${checkpoint.converted ? "" : ", legacy"})`);
  console.log("");
  if (checkpoint.review) {
    console.log("Level review: introduces no words; every root comes from the review list below.");
  } else {
    const over = introduce.length > CORE_CAP ? `; ${introduce.length - CORE_CAP} to move to a later checkpoint` : "";
    console.log(`May introduce (${introduce.length} of cap ${CORE_CAP}${over}):`);
    for (const w of introduce) console.log(`  ${show(w)}`);
    if (introduce.length === 0) console.log("  (none named here)");
    console.log("");
    console.log("Pull forward if the setting needs one (moves its core cell here):");
    for (const w of pullForward.slice(0, PULL_FORWARD_SHOWN)) console.log(`  ${show(w)}  core ${w.core}`);
    if (pullForward.length === 0) console.log("  (none)");
  }
  console.log("");
  console.log(review.length === 0 ? "Review:" : `Review, unused longest first (use at least ${Math.min(CORE_REVIEW_MIN, review.length)} of ${review.length}):`);
  for (const w of review.slice(0, options.limit)) console.log(`  ${String(w.gap).padStart(3)}  ${show(w)}  last used ${w.lastUsed}`);
  if (review.length === 0) console.log("  (none: first checkpoint with core roots)");
  else if (review.length > options.limit) console.log(`  … ${review.length - options.limit} more (--limit)`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const tables = loadDefaultTables();
  const pages = [...readingOrder.map((item) => sidebarPage(item.link)), levelReviewPage];
  const checkpoints = stageCheckpoints(
    pages,
    (page) => {
      const path = join(grammarDir, page);
      return existsSync(path) ? readFileSync(path, "utf8") : undefined;
    },
    tables,
    levelReviewPage,
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
  if (options.for) {
    printSpacing(checkpoints, core, tables, options);
    return;
  }
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
