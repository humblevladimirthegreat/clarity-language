#!/usr/bin/env tsx
/**
 * Plans unit order for the grammar bands from page-to-page dependencies.
 *
 *   npm run plan-units -- --units <table.md|table.json> [--deps <deps.tsv>] [--band <name>] [--suggest] [--max-size <k>]
 *
 * For each band, prints the unit order that breaks the fewest dependencies
 * (exact search; uses outweigh Review words, which outweigh links; ties keep
 * the table order), the pages in that order (inside a unit, in their current
 * relative order), every dependency still broken, and unit sizes outside
 * 20k–50k. When the table keeps another order, the table order's counts and
 * breaks are printed first: the table may keep it for a reason the counts do
 * not see. `--suggest` also lists, per sitting on a broken dependency of the
 * best order, the best single move to another unit when it breaks fewer;
 * `--max-size` (default 55) caps the unit a sitting moves into. Moves are
 * hints: a unit's theme is the editor's call.
 *
 * A Review word is a root in a checkpoint's **Review** bank; it breaks when the
 * checkpoint its `core` cell names comes later (`lint:ageben` then fails with
 * `core-vocabulary`). Each is listed by root and gloss, and is fixed by moving
 * the cell. Checkpoints and the `core` column are read from the tree.
 *
 * Units come from `--units`: Markdown tables under band headings with `Unit` and
 * `Sittings` columns, or JSON `{ "beginner": [{ "name": …, "pages": [...] }] }`.
 * Without it, `<band>Units` from reading-order.ts is used when it exists.
 * Dependencies come from `--deps` (saved `lint:ageben -- --deps` output), or the
 * script runs that report itself (about 20 s).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as readingOrder from "../docs/grammar/.vitepress/lib/reading-order.js";
import { stageCheckpoints, storedCore } from "../src/core-vocabulary.js";
import {
  countsText,
  membershipProblems,
  pageName,
  parseDeps,
  parseUnitTables,
  planReport,
  planUnits,
  suggestMoves,
  tableOrderPlan,
  withReviewWords,
  type ReviewBank,
  type Unit,
} from "../src/lint/unit-plan.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { grammarFile } from "../src/repo-paths.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(REPO_ROOT, "docs", "grammar");
const { advancedLessons, beginnerLessons, intermediateLessons, levelReviewPages, pageRelPath, pathPages } = readingOrder;

const BANDS = {
  beginner: beginnerLessons,
  intermediate: intermediateLessons,
  advanced: advancedLessons,
} as const;
type BandName = keyof typeof BANDS;

/** Unit size bounds, from the unit principles (`units.md` proposal, principle 3). */
const MIN_SIZE_K = 20;
const MAX_SIZE_K = 50;

type Cli = { units?: string; deps?: string; band?: BandName; suggest: boolean; maxSize: number };

function usage(code: number): never {
  console.error(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0]!.replace(/^#!.*\n\/\*\*\n?/, "").replace(/^ \* ?/gm, ""));
  process.exit(code);
}

function parseCli(argv: string[]): Cli {
  const cli: Cli = { suggest: false, maxSize: 55 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const value = () => argv[++i] ?? usage(2);
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--units") cli.units = value();
    else if (arg === "--deps") cli.deps = value();
    else if (arg === "--suggest") cli.suggest = true;
    else if (arg === "--max-size") cli.maxSize = Number(value());
    else if (arg === "--band") {
      const band = value().toLowerCase();
      if (!(band in BANDS)) usage(2);
      cli.band = band as BandName;
    } else {
      console.error(`Unknown argument: ${arg}`);
      usage(2);
    }
  }
  return cli;
}

function loadUnits(file: string | undefined): Map<string, Unit[]> {
  if (file) {
    const text = readFileSync(resolve(file), "utf8");
    if (!file.endsWith(".json")) return parseUnitTables(text);
    const json = JSON.parse(text) as Record<string, { name: string; pages: string[] }[]>;
    return new Map(Object.entries(json).map(([band, units]) => [band.toLowerCase(), units.map((u) => ({ name: u.name, pages: u.pages.map(pageName) }))]));
  }
  const out = new Map<string, Unit[]>();
  for (const band of Object.keys(BANDS)) {
    const units = (readingOrder as Record<string, unknown>)[`${band}Units`] as { text: string; items: { link: string }[] }[] | undefined;
    if (units) out.set(band, units.map((u) => ({ name: u.text, pages: u.items.map((it) => pageName(it.link)) })));
  }
  if (out.size === 0) {
    console.error("reading-order.ts has no unit arrays yet; pass --units <table.md|table.json>.");
    process.exit(2);
  }
  return out;
}

function loadDeps(file: string | undefined): string {
  if (file) return readFileSync(resolve(file), "utf8");
  console.error("Running lint:ageben -- --deps …");
  const run = spawnSync("npx", ["--no-install", "tsx", "scripts/lint-ageben-docs.ts", "--deps"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.status !== 0) {
    console.error(run.stderr);
    process.exit(run.status ?? 1);
  }
  return run.stdout;
}

/** Each converted checkpoint's Review bank, read as `lint:ageben` reads it. */
function loadReviewBanks(): ReviewBank[] {
  const checkpoints = stageCheckpoints(
    pathPages(),
    (page) => {
      const path = grammarFile(page);
      return existsSync(path) ? readFileSync(path, "utf8") : undefined;
    },
    loadDefaultTables(),
    levelReviewPages,
  );
  return checkpoints
    .filter((c) => c.converted)
    .map((c) => ({ page: c.page, words: c.entries.filter((e) => e.group === "review") }));
}

const sizes = new Map<string, number>();
const sizeK = (page: string) => {
  let k = sizes.get(page);
  if (k === undefined) sizes.set(page, (k = statSync(join(grammarDir, pageRelPath(page))).size / 1000));
  return k;
};
const unitSize = (u: Unit) => u.pages.reduce((s, p) => s + sizeK(p), 0);
const short = (p: string) => p.replace(/\.md$/, "");

function main(): void {
  const cli = parseCli(process.argv.slice(2));
  const tables = loadUnits(cli.units);
  const deps = withReviewWords(parseDeps(loadDeps(cli.deps)), loadReviewBanks(), storedCore());
  const currentOrder = pathPages();
  let problems = 0;

  for (const band of Object.keys(BANDS) as BandName[]) {
    if (cli.band && cli.band !== band) continue;
    const units = tables.get(band);
    if (!units) continue;
    console.log(`\n== ${band[0]!.toUpperCase()}${band.slice(1)} (${units.length} units)`);
    const membership = membershipProblems(units, pathPages(BANDS[band]));
    if (membership.length > 0) {
      problems += membership.length;
      for (const m of membership) console.log(`  table: ${m}`);
      continue;
    }

    const plan = planUnits(units, deps, currentOrder);
    const table = tableOrderPlan(units, deps, currentOrder);
    const unitLine = (u: Unit, pages: string[]) => `${u.name} (${Math.round(unitSize(u))}k): ${pages.map(short).join(", ")}`;
    for (const line of planReport(units, plan, table, unitLine)) console.log(line);
    const sizeNotes = units.flatMap((u) => {
      const k = Math.round(unitSize(u));
      const notes = [];
      if (k < MIN_SIZE_K) notes.push(`${k}k, below ${MIN_SIZE_K}k`);
      if (k > MAX_SIZE_K) notes.push(`${k}k, above ${MAX_SIZE_K}k`);
      if (u.pages.length === 2) notes.push("two sittings");
      return notes.length ? [`  ${u.name}: ${notes.join("; ")}`] : [];
    });
    if (sizeNotes.length > 0) console.log(`Size notes:\n${sizeNotes.join("\n")}`);

    if (cli.suggest && plan.breaks.length > 0) {
      const fits = (moved: readonly Unit[]) =>
        moved.every((u, i) => unitSize(u) <= cli.maxSize || u.pages.length <= units[i]!.pages.length);
      // Best target per sitting; suggestMoves sorts best first.
      const moves = suggestMoves(units, deps, currentOrder, plan, fits).filter(
        (m, i, all) => all.findIndex((o) => o.page === m.page) === i,
      );
      console.log(moves.length ? "Single moves that break fewer than the best order (best target per sitting):" : "No single move breaks fewer than the best order.");
      for (const m of moves) {
        console.log(
          `  ${short(m.page)}: ${units[m.fromUnit]!.name} → ${units[m.toUnit]!.name}  ` +
            `(${countsText(m.plan)})`,
        );
      }
    }
  }
  if (problems > 0) process.exitCode = 1;
}

main();
