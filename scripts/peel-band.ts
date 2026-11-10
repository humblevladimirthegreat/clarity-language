/**
 * Peel one band sitting off a grammar page onto a new file.
 *
 * Run: npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Names and titles"
 *      npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Names and titles" --write
 *
 * The sidebar row goes directly after the parent sitting, in the parent's unit.
 * `--unit "<title>"` puts it at the end of that unit of the band instead; it is
 * required when the parent sits in another band.
 *
 * Dry run prints the new sitting, parent, hash-map rows, sidebar row, and
 * construction homes on retired band fragments. `--write` applies them, then
 * run `npm run cheat-sheet-blocks -- --write` and `npm run build`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { BANDS, type Band } from "../src/lint/learning-order.js";
import { grammarFile, REPO_ROOT } from "../src/repo-paths.js";
import {
  addAllowlistRow,
  addSittingToUnit,
  appendObjectToExportedArray,
  peelBand,
  UNIT_EXPORT,
} from "./lib/peel-band.ts";
import { rewriteRepo } from "./lib/link-rewrite.ts";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const readingOrderPath = join(grammarDir, ".vitepress", "lib", "reading-order.ts");
const allowlistPath = join(REPO_ROOT, "docs", "meta", "procedures", "drill-generation.md");
const hashPath = join(grammarDir, ".vitepress", "lib", "hash-redirect.ts");


type Options = {
  parent: string;
  band: Band;
  to: string;
  title: string;
  h1Id?: string;
  unit?: string;
  write: boolean;
};

function parseArgs(argv: string[]): Options {
  let parent = "";
  let band: Band | undefined;
  let to = "";
  let title = "";
  let h1Id: string | undefined;
  let unit: string | undefined;
  let write = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--parent" && argv[i + 1]) parent = normalizePage(argv[++i]!);
    else if (arg === "--band" && argv[i + 1]) {
      const value = argv[++i]!.toLowerCase();
      if (!BANDS.includes(value as Band)) throw new Error(`--band must be ${BANDS.join(" / ")}`);
      band = value as Band;
    } else if (arg === "--to" && argv[i + 1]) to = normalizePage(argv[++i]!);
    else if (arg === "--title" && argv[i + 1]) title = argv[++i]!;
    else if (arg === "--h1-id" && argv[i + 1]) h1Id = argv[++i]!;
    else if (arg === "--unit" && argv[i + 1]) unit = argv[++i]!;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parent || !band || !to || !title) {
    throw new Error(
      'Usage: npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Names and titles" [--unit "<title>"] [--h1-id id] [--write]',
    );
  }
  return { parent, band, to, title, h1Id, unit, write };
}

function normalizePage(value: string): string {
  return `${value.replace(/^.*\//, "").replace(/\.(?:md|html)$/, "")}.md`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const parentPath = grammarFile(options.parent);
  const sittingPath = join(grammarDir, options.band, options.to);
  if (!existsSync(parentPath)) throw new Error(`missing ${relative(REPO_ROOT, parentPath)}`);
  if (existsSync(sittingPath)) throw new Error(`${options.to} already exists`);

  const result = peelBand({
    parentPage: options.parent,
    parentMarkdown: readFileSync(parentPath, "utf8"),
    band: options.band,
    newPage: options.to,
    title: options.title,
    h1Id: options.h1Id,
  });

  console.log(`Sitting ${options.to} (${options.band}):`);
  console.log(`  H1 ${options.title}`);
  console.log(`  moved ids: ${result.movedIds.join(", ") || "(none)"}`);
  console.log("Hash redirects:");
  for (const row of result.hashRedirects) {
    const dest = row.to === row.page ? `${row.page} (top)` : row.to;
    console.log(`  ${row.page}#${row.hash} → ${dest}`);
  }
  const nextReadingOrder = addSittingToUnit(readFileSync(readingOrderPath, "utf8"), {
    exportName: UNIT_EXPORT[options.band],
    item: { text: options.title, link: `/${options.to.replace(/\.md$/, "")}` },
    parentLink: `/${options.parent.replace(/\.md$/, "")}`,
    unit: options.unit,
  });
  const where = options.unit ? `at the end of unit "${options.unit}"` : `after ${options.parent}, in its unit`;
  console.log(`Sidebar: add ${result.holding.page} to ${options.band} ${where} (${result.holding.title})`);
  console.log("Construction homes on retired band fragments:");
  for (const [from, to] of result.homeMap) console.log(`  ${from} → ${to}`);
  console.log("Update the AGENTS.md Owns line if a job left the parent.");
  console.log(`Allowlist: add ${options.to} as **generate** (docs/meta/procedures/drill-generation.md); the build fails until it has a checkpoint or a **skip** reason.`);
  console.log("Then: npm run cheat-sheet-blocks -- --write && npm run build");

  if (!options.write) {
    console.log("\nDry run. Pass --write to apply.");
    return;
  }

  mkdirSync(dirname(sittingPath), { recursive: true });
  writeFileSync(sittingPath, result.sitting);
  writeFileSync(parentPath, result.parent);
  writeFileSync(readingOrderPath, nextReadingOrder);
  let hashSource = readFileSync(hashPath, "utf8");
  for (const row of result.hashRedirects) {
    hashSource = appendObjectToExportedArray(hashSource, "hashRedirects", row);
  }
  writeFileSync(hashPath, hashSource);

  writeFileSync(
    allowlistPath,
    addAllowlistRow(readFileSync(allowlistPath, "utf8"), { page: options.to, parent: options.parent, band: options.band }),
  );

  const skip = new Set([parentPath, sittingPath, readingOrderPath, hashPath]);
  for (const { file, changes } of rewriteRepo(result.linkMap, result.homeMap, { skip, write: true })) {
    console.log(`Rewrote ${file} (${changes.length || "links"})`);
  }
  console.log(`Wrote ${relative(REPO_ROOT, sittingPath)} and updated ${options.parent}.`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
