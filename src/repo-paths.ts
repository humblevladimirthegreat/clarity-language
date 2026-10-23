import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { pageRelPath } from "../docs/grammar/.vitepress/lib/reading-order.js";

/** The nearest directory above this module with a package.json: the repo, whether run from src/ or a dist/ bundle. */
function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  while (!existsSync(join(dir, "package.json"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error("repo root not found: no package.json above src/repo-paths.ts");
    dir = parent;
  }
  return dir;
}

export const REPO_ROOT = findRepoRoot();

/** A file under data/ (`lexicon-published.csv`, `lexicon-overlays.csv`, `lexicon-compounds.csv`, …). */
export function dataPath(name: string): string {
  return join(REPO_ROOT, "data", name);
}

export function readData(name: string): string {
  return readFileSync(dataPath(name), "utf8");
}

export const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");

/** Absolute path of a grammar page. Sittings live in a band folder; public URLs stay flat. */
export function grammarFile(page: string): string {
  return join(GRAMMAR_DIR, pageRelPath(page));
}
