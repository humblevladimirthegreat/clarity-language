/**
 * Core vocabulary seed (docs/meta/lexicon.md#core-vocabulary-column).
 *
 * Run: npm run core-vocabulary                 report against the `core` column (or the seed when it is empty)
 *      npm run core-vocabulary -- --write      fill the empty `core` column from first appearance in stage banks
 *      npm run core-vocabulary -- --write --force   reseed, overwriting hand edits
 *      npm run core-vocabulary -- --for clause.md:beginner [--limit 12]
 *                                              spacing for one checkpoint (page.md:band or page.md#id): roots it may
 *                                              introduce, roots it could pull forward, review roots unused longest
 *      npm run core-vocabulary -- --look-alikes [--limit 12]
 *                                              fix options for each look-alike pair: where each root could be
 *                                              introduced instead, and clash-free substitutes of the same kind
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
  LOOK_ALIKE_GAP,
  lookAlikeMoves,
  lookAlikePairs,
  lookAlikesNear,
  NOT_CORE_ROOTS,
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

type Options = { write: boolean; force: boolean; for?: string; lookAlikes: boolean; limit: number };

function parseArgs(argv: string[]): Options {
  const options: Options = { write: false, force: false, lookAlikes: false, limit: 12 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") options.write = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--for" && argv[i + 1]) options.for = argv[++i];
    else if (arg === "--look-alikes") options.lookAlikes = true;
    else if (arg === "--limit" && /^\d+$/.test(argv[i + 1] ?? "")) options.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if ((options.for || options.lookAlikes) && options.write) throw new Error("--for and --look-alikes do not combine with --write");
  return options;
}

function printSpacing(checkpoints: Checkpoint[], core: ReadonlyMap<string, string>, tables: ClassifyTables, options: Options): void {
  const index = findCheckpoint(checkpoints, options.for!);
  const gloss = (root: string) => {
    const row = tables.published.get(root) ?? tables.compounds.get(root);
    return row && (row.concrete || row.abstract);
  };
  const { checkpoint, introduce, pullForward, review } = spacingPlan(checkpoints, core, index, gloss);
  const show = (w: SpacingWord) => `${w.english} \`${w.egabon}\``;

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

function printLookAlikes(checkpoints: Checkpoint[], core: ReadonlyMap<string, string>, tables: ClassifyTables, options: Options): void {
  const pairs = lookAlikePairs(checkpoints, core);
  const where = (i: number) => `${i + 1} ${checkpoints[i]!.anchor}`;
  const describe = (root: string) => {
    const row = tables.published.get(root);
    const compound = tables.compounds.get(root);
    const english = row?.concrete || compound?.concrete || root;
    const abstract = row?.abstract ? `, abstract *${row.abstract}*` : "";
    const tail = row?.kind ? ` (${row.kind}${row.shape ? ` / ${row.shape}` : ""})` : "";
    return `${row?.emoji ?? ""} *${english}* \`${root}\`${abstract}${tail}`.trim();
  };
  for (const pair of pairs) {
    const same = pair.earlierAt === pair.laterAt ? "both new there" : `new at ${where(pair.earlierAt)}`;
    console.log(`${where(pair.laterAt)}: \`${pair.later}\` ~ \`${pair.earlier}\` (${same})`);
    for (const [root, at] of [[pair.later, pair.laterAt], [pair.earlier, pair.earlierAt]] as const) {
      console.log(`  ${describe(root)}`);
      const uses = checkpoints.flatMap((c, i) => (c.entries.some((e) => e.root === root) ? [i + 1] : []));
      console.log(`    used at checkpoints ${uses.join(", ")}`);
      for (const move of lookAlikeMoves(checkpoints, core, root)) {
        const drop = `replace at ${move.replaceAt.map((i) => i + 1).join(", ")}`;
        if (move.introduceAt === undefined) {
          console.log(`    move: ${drop}; no later checkpoint uses it, so it leaves the core list (clear its cell)`);
          continue;
        }
        const over = move.newCount > CORE_CAP ? " OVER CAP" : "";
        const clash = move.clashes.length ? `; clashes ${move.clashes.map((r) => `\`${r}\``).join(", ")}` : "; clash-free";
        console.log(`    move: ${drop} → introduce at ${where(move.introduceAt)} (${move.newCount}/${CORE_CAP} new${over})${clash}`);
      }
      const row = tables.published.get(root);
      const subs = [...tables.published.values()]
        .filter((r) => r.root !== root && r.root.length === root.length && !core.has(r.root) && !NOT_CORE_ROOTS.has(r.root))
        .filter((r) => !row?.kind || r.kind === row.kind)
        .filter((r) => lookAlikesNear(checkpoints, core, r.root, at).length === 0)
        .sort((a, b) => Number(b.shape === row?.shape) - Number(a.shape === row?.shape));
      const shown = subs.slice(0, options.limit).map((r) => `${r.emoji} ${r.concrete} \`${r.root}\``);
      console.log(`    substitutes at ${at + 1} (same kind, not core, clash-free): ${shown.join(", ") || "(none)"}${subs.length > options.limit ? ` … ${subs.length - options.limit} more` : ""}`);
    }
    console.log("");
  }
  console.log(`${pairs.length} look-alike pair(s) under ${LOOK_ALIKE_GAP} checkpoints apart within a band.`);
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
  if (options.lookAlikes) {
    printLookAlikes(checkpoints, core, tables, options);
    return;
  }
  const report = coreReport(checkpoints, core);
  for (const { checkpoint, fresh, review, overCap } of report) {
    const shared = (e: { egabon: string }) => checkpoint.entries.filter((o) => o.egabon === e.egabon).length > 1;
    const words = fresh.map((e) => `${e.english} \`${e.egabon}\`${shared(e) ? ` [${e.root}]` : ""}`).join(", ");
    console.log(`${overCap ? "OVER" : "    "} ${String(fresh.length).padStart(2)} new  ${String(review.length).padStart(2)} review  ${checkpoint.anchor}  ${words}`);
  }
  const over = report.filter((r) => r.overCap);
  console.log("");
  console.log(`${core.size} core root(s) across ${report.length} checkpoint(s); cap ${CORE_CAP}.`);
  console.log(`${over.length} checkpoint(s) over the cap (${over.reduce((n, r) => n + r.fresh.length - CORE_CAP, 0)} root(s) to move).`);
  if (!options.write && stored.size === 0) console.log("Dry-run: core column is empty; pass --write to seed it.");
}

main();
