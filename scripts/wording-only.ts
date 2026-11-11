/**
 * Check that edits to grammar pages since a revision change wording only.
 *
 * Run: npm run wording-only -- [--since <rev>] [paths…]
 *
 * Default rev HEAD; default paths: every changed or untracked page under docs/grammar/.
 * Fails (exit 1) when any of these differ from <rev>: heading lines, anchor ids, fenced
 * code, Practice sections, generated blocks, or per section the code spans (a new span is
 * allowed only when its text was already bare in that section), link targets, and morph
 * gloss lines (blockquote lines and table cells). See src/lint/sections.ts.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { changedPages, checkRev, pagePath, showAt } from "./lib/grammar-git.ts";
import { WORDING_FIX, wordingProblems } from "../src/lint/sections.ts";
import { REPO_ROOT } from "../src/repo-paths.js";

const args = process.argv.slice(2);
let rev = "HEAD";
const paths: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--since") rev = args[++i] ?? "";
  else paths.push(args[i]!);
}
if (!rev) {
  console.error("usage: npm run wording-only -- [--since <rev>] [paths…]");
  process.exit(2);
}
checkRev(rev);

const pages = paths.length ? paths.map(pagePath) : changedPages(rev, { includeDeleted: true });
const lines: string[] = [];
for (const page of pages) {
  const file = resolve(REPO_ROOT, page);
  const old = showAt(rev, page);
  if (!existsSync(file)) {
    if (old != null) lines.push(`${page}:1 page deleted`);
    else lines.push(`${page}:1 no such page`);
    continue;
  }
  if (old == null) {
    lines.push(`${page}:1 page not at ${rev} (new page)`);
    continue;
  }
  for (const p of wordingProblems(old, readFileSync(file, "utf8"))) lines.push(`${page}:${p.line + 1} ${p.message}`);
}

if (lines.length) {
  for (const l of lines) console.log(l);
  console.log(WORDING_FIX);
  console.log(`FAIL wording-only: ${lines.length} problem(s) on ${pages.length} page(s) since ${rev}`);
  process.exit(1);
}
console.log(`PASS wording-only: ${pages.length} page(s) since ${rev}`);
