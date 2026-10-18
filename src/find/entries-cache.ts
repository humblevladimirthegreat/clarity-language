/**
 * The English ↔ Agazan entries of a docs folder (src/find/english.ts), cached under dist/find/.
 * Collecting them parses every gloss, which builds the sentence parser and takes seconds; the
 * cache is rebuilt when the folder, src, or data change. Pages are relative to the repo root.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { listMarkdown } from "../markdown-files.js";
import { loadDefaultTables } from "../parse/index.js";
import { REPO_ROOT } from "../repo-paths.js";
import { collectEnglishEntries, type EnglishEntry } from "./english.js";

function newestMtime(path: string): number {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = stat.mtimeMs;
  for (const entry of readdirSync(path)) {
    if (entry === "node_modules" || entry === "cache" || entry === "dist") continue;
    newest = Math.max(newest, newestMtime(join(path, entry)));
  }
  return newest;
}

/** Every entry under `dir` (repo-relative, default docs/grammar), from the cache when it is fresh. */
export function loadEnglishEntries(dir = "docs/grammar"): EnglishEntry[] {
  const root = join(REPO_ROOT, dir);
  const cache = join(REPO_ROOT, "dist", "find", `${dir.replace(/[\\/]/g, "-")}-entries.json`);
  const sources = [root, join(REPO_ROOT, "src"), join(REPO_ROOT, "data")];
  if (existsSync(cache) && statSync(cache).mtimeMs >= Math.max(...sources.map(newestMtime))) {
    return JSON.parse(readFileSync(cache, "utf8")) as EnglishEntry[];
  }
  const tables = loadDefaultTables();
  const entries = listMarkdown(root).flatMap((file) => collectEnglishEntries(readFileSync(file, "utf8"), relative(REPO_ROOT, file), tables));
  mkdirSync(dirname(cache), { recursive: true });
  writeFileSync(cache, JSON.stringify(entries));
  return entries;
}

/** The grammar pages' entries. */
export function loadGrammarEntries(): EnglishEntry[] {
  return loadEnglishEntries("docs/grammar");
}
