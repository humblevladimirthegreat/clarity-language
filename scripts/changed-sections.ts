/**
 * List the H2 / H3 sections on grammar pages that changed since a revision, plus the
 * section right after each one (its lead may lean on what came before).
 *
 * Run: npm run changed-sections -- <rev> [paths…] [--json]
 *
 * Default paths: every page under docs/grammar/ changed since <rev>, working tree and
 * untracked files included; deleted pages are skipped. Sections are matched by id.
 * Reasons: `changed` (text differs), `new` (id not on the page at <rev>), `moved from <page>`
 * (id was on another page at <rev>), `context` (own text unchanged, but the section before it
 * is changed, new, moved, or a different section than at <rev>). `(lead)` is the text before
 * the first H2 / H3; it is listed when changed and counts as the first section's predecessor.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { changedPages, checkRev, idsAt, pagePath, showAt } from "./lib/grammar-git.ts";
import { changedSections, formatChange, type SectionChange } from "../src/lint/sections.ts";
import { REPO_ROOT } from "../src/repo-paths.js";

const args = process.argv.slice(2);
const json = args.includes("--json");
const positional = args.filter((a) => !a.startsWith("--"));
const rev = positional[0];
if (!rev) {
  console.error("usage: npm run changed-sections -- <rev> [paths…] [--json]");
  process.exit(2);
}
checkRev(rev);

const pages = positional.length > 1 ? positional.slice(1).map(pagePath) : changedPages(rev);
let ids: Map<string, string[]> | null = null;

const rows: (SectionChange & { page: string })[] = [];
for (const page of pages) {
  const file = resolve(REPO_ROOT, page);
  if (!existsSync(file)) continue;
  const elsewhere = (id: string): string | undefined => {
    ids ??= idsAt(rev);
    return ids.get(id)?.find((p) => p !== page);
  };
  for (const change of changedSections(showAt(rev, page), readFileSync(file, "utf8"), elsewhere)) {
    rows.push({ page, ...change });
  }
}

if (json) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  for (const row of rows) console.log(formatChange(row.page, row));
  console.log(`${rows.length} section(s) on ${new Set(rows.map((r) => r.page)).size} page(s)`);
}
