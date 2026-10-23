/**
 * Peel one band sitting off a grammar page onto a new file.
 *
 * Run: npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Proper names and titled phrases"
 *      npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Proper names and titled phrases" --write
 *
 * Dry run prints the new sitting, parent, hash-map rows, sidebar row, and
 * construction homes on retired band fragments. `--write` applies them, then
 * run `npm run cheat-sheet-blocks -- --write` and `npm run build`.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { BANDS, type Band } from "../src/lint/learning-order.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import {
  appendObjectToExportedArray,
  peelBand,
  rewriteAnchorRefs,
  rewriteMarkdownLinks,
} from "./lib/peel-band.ts";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const readingOrderPath = join(grammarDir, ".vitepress", "lib", "reading-order.ts");
const hashPath = join(grammarDir, ".vitepress", "lib", "hash-redirect.ts");

const LESSON_EXPORT: Record<Band, string> = {
  beginner: "beginnerLessons",
  intermediate: "intermediateLessons",
  advanced: "advancedLessons",
};

const SCAN_DIRS = [
  join(REPO_ROOT, "docs"),
  join(REPO_ROOT, "src"),
  join(REPO_ROOT, "scripts"),
  join(REPO_ROOT, "data"),
  join(grammarDir, ".vitepress"),
];
const SCAN_FILES = ["AGENTS.md", "README.md"].map((name) => join(REPO_ROOT, name));
const SKIP_DIRS = new Set(["node_modules", "public", "dist", "generated", "rejected"]);

type Options = {
  parent: string;
  band: Band;
  to: string;
  title: string;
  h1Id?: string;
  write: boolean;
};

function parseArgs(argv: string[]): Options {
  let parent = "";
  let band: Band | undefined;
  let to = "";
  let title = "";
  let h1Id: string | undefined;
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
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!parent || !band || !to || !title) {
    throw new Error(
      'Usage: npm run peel-band -- --parent word-endings.md --band intermediate --to proper-names.md --title "Proper names and titled phrases" [--h1-id id] [--write]',
    );
  }
  return { parent, band, to, title, h1Id, write };
}

function normalizePage(value: string): string {
  return `${value.replace(/^.*\//, "").replace(/\.(?:md|html)$/, "")}.md`;
}

function rewriteTargets(): string[] {
  const out: string[] = [...SCAN_FILES];
  const stack = [...SCAN_DIRS];
  while (stack.length) {
    const dir = stack.pop()!;
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".") && name !== ".vitepress") continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (SKIP_DIRS.has(name)) continue;
        stack.push(full);
      } else if (/\.(?:md|ts|vue|csv|tsv)$/.test(name) && !/^(?:peel-band|peel-headings)/.test(name)) {
        out.push(full);
      }
    }
  }
  return out;
}

function applyMaps(
  text: string,
  file: string,
  linkMap: Map<string, string>,
  homeMap: Map<string, string>,
): { text: string; changes: { from: string; to: string }[] } {
  const currentPage = file.endsWith(".md") ? file.split(/[/\\]/).pop()! : "";
  const code = /\.(?:ts|vue|csv|tsv)$/.test(file);
  const map = code ? new Map([...linkMap, ...homeMap]) : linkMap;
  let next = text;
  const changes: { from: string; to: string }[] = [];
  if (currentPage) next = rewriteMarkdownLinks(next, currentPage, map);
  const refs = rewriteAnchorRefs(next, map);
  next = refs.text;
  changes.push(...refs.changes);
  return { text: next, changes };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const parentPath = join(grammarDir, options.parent);
  const sittingPath = join(grammarDir, options.to);
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
  console.log(
    `Sidebar: append ${result.holding.page} to ${options.band} (${result.holding.title})`,
  );
  console.log("Construction homes on retired band fragments:");
  for (const [from, to] of result.homeMap) console.log(`  ${from} → ${to}`);
  console.log("Update the AGENTS.md Owns line if a job left the parent.");
  console.log("Then: npm run cheat-sheet-blocks -- --write && npm run build");

  if (!options.write) {
    console.log("\nDry run. Pass --write to apply.");
    return;
  }

  writeFileSync(sittingPath, result.sitting);
  writeFileSync(parentPath, result.parent);
  writeFileSync(
    readingOrderPath,
    appendObjectToExportedArray(readFileSync(readingOrderPath, "utf8"), LESSON_EXPORT[options.band], {
      text: options.title,
      link: `/${options.to.replace(/\.md$/, "")}`,
    }),
  );
  let hashSource = readFileSync(hashPath, "utf8");
  for (const row of result.hashRedirects) {
    hashSource = appendObjectToExportedArray(hashSource, "hashRedirects", row);
  }
  writeFileSync(hashPath, hashSource);

  const skip = new Set([parentPath, sittingPath, readingOrderPath, hashPath]);
  for (const file of rewriteTargets()) {
    if (skip.has(file)) continue;
    const original = readFileSync(file, "utf8");
    const { text, changes } = applyMaps(original, file, result.linkMap, result.homeMap);
    if (changes.length === 0 && text === original) continue;
    if (text !== original) {
      writeFileSync(file, text);
      console.log(`Rewrote ${relative(REPO_ROOT, file)} (${changes.length || "links"})`);
    }
  }
  console.log(`Wrote ${relative(REPO_ROOT, sittingPath)} and updated ${options.parent}.`);
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
