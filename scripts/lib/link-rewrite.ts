/**
 * Repo-wide `page.md#id` retargets for peel-band, peel-headings and move-heading.
 *
 * Covers docs (grammar pages, cheat sheets, Claritish `<!-- Source -->`, meta), src (constructions,
 * game `source`), scripts, data (overlay CSV, lexicon `core` column), AGENTS.md and README.md.
 * Markdown files get relative-link rewrites (`](a.md#x)`, `](/a#x)`, `](./a.html#x)`); every file
 * gets bare `a.md#x` refs. Proposals under docs/proposals get link rewrites only, so their records
 * of what moved (bare `a.md#x` in prose or backticks) stay as written.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { rewriteAnchorRefs, rewriteMarkdownLinks } from "./peel-band.ts";

const SCAN_DIRS = ["docs", "src", "scripts", "data"].map((dir) => join(REPO_ROOT, dir));
const SCAN_FILES = ["AGENTS.md", "README.md"].map((name) => join(REPO_ROOT, name));
const SKIP_DIRS = new Set(["node_modules", "public", "dist", "generated", "rejected"]);
const SKIP_PREFIX = /^(?:peel-band|peel-headings|move-heading|link-rewrite|hash-rows|heading-clusters)/;
const PROPOSALS = `${join(REPO_ROOT, "docs", "proposals")}${sep}`;

export type Change = { from: string; to: string };

export function rewriteTargets(): string[] {
  const out: string[] = SCAN_FILES.filter((file) => existsSync(file));
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
      } else if (/\.(?:md|ts|vue|csv|tsv)$/.test(name) && !SKIP_PREFIX.test(name)) {
        out.push(full);
      }
    }
  }
  return out;
}

/** `homeMap` (construction homes) applies to code and data files only. */
export function applyMaps(
  text: string,
  file: string,
  linkMap: Map<string, string>,
  homeMap: Map<string, string> = new Map(),
): { text: string; changes: Change[] } {
  const currentPage = file.endsWith(".md") ? file.split(/[/\\]/).pop()! : "";
  const code = /\.(?:ts|vue|csv|tsv)$/.test(file);
  const map = code ? new Map([...linkMap, ...homeMap]) : linkMap;
  const changes: Change[] = [];
  let next = text;
  if (currentPage) next = rewriteMarkdownLinks(next, currentPage, map, changes);
  if (file.startsWith(PROPOSALS)) return { text: next, changes };
  const refs = rewriteAnchorRefs(next, map);
  changes.push(...refs.changes);
  return { text: refs.text, changes };
}

/** Rewrite every target file except `skip`; returns per-file changes. Writes only with `write`. */
export function rewriteRepo(
  linkMap: Map<string, string>,
  homeMap: Map<string, string>,
  opts: { skip: ReadonlySet<string>; write: boolean },
): { file: string; changes: Change[] }[] {
  const out: { file: string; changes: Change[] }[] = [];
  for (const file of rewriteTargets()) {
    if (opts.skip.has(file)) continue;
    const original = readFileSync(file, "utf8");
    const { text, changes } = applyMaps(original, file, linkMap, homeMap);
    if (text === original) continue;
    if (opts.write) writeFileSync(file, text);
    out.push({ file: relative(REPO_ROOT, file), changes });
  }
  return out;
}
