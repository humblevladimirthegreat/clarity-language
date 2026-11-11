// Wording checks on learner-facing grammar pages (docs/meta/doc-style.md#what-the-build-checks).
// Exact rules fail. Heuristic rules print one `warning:` count each, and fail when a page's count
// for a rule rises above src/lint/prose-style-baseline.json (the ratchet).
// Usage: tsx scripts/lint-prose-style.ts [--report] [--update-baseline] [paths under docs/grammar/...]
//   --report           list every heuristic warning with file:line
//   --update-baseline  write the current warning counts to the baseline (only the given pages, if any)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compareWarningBaseline,
  formatWarningBaseline,
  proseStyleIssues,
  RULE_FIX,
  updatedWarningBaseline,
  warningCounts,
  type ProseIssue,
  type ProseRule,
  type WarningCounts,
} from "../src/lint/prose-style.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(root, "docs", "grammar");
const baselineFile = join(root, "src", "lint", "prose-style-baseline.json");
const SKIP_DIRS = new Set([".vitepress", "node_modules", "public"]);
const ANCHOR = "docs/meta/doc-style.md#what-the-build-checks";

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : markdownFiles(join(dir, entry.name));
    return entry.name.endsWith(".md") ? [join(dir, entry.name)] : [];
  });
}

const args = process.argv.slice(2);
const report = args.includes("--report");
const update = args.includes("--update-baseline");
const paths = args.filter((arg) => !arg.startsWith("--")).map((arg) => resolve(arg));
const files = (paths.length ? paths : markdownFiles(grammarDir)).sort();

type Found = ProseIssue & { file: string; page: string };
const found: Found[] = [];
const issuesByPage: Record<string, ProseIssue[]> = {};
for (const file of files) {
  const page = relative(grammarDir, file).split("\\").join("/");
  const issues = proseStyleIssues(page, readFileSync(file, "utf8"));
  issuesByPage[page] = issues;
  for (const issue of issues) found.push({ ...issue, file: relative(root, file), page });
}

const counts = warningCounts(issuesByPage);
const baseline: WarningCounts = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : {};
const checkedPages = Object.keys(counts);

if (update) {
  const next = updatedWarningBaseline(counts, baseline, paths.length ? checkedPages : undefined);
  writeFileSync(baselineFile, formatWarningBaseline(next));
  console.log(`Wrote ${relative(root, baselineFile)} (${paths.length ? `${checkedPages.length} page(s)` : "all pages"}).`);
}

// A full run also compares pages that left the tree, so their entries show up as falls.
const comparePages = paths.length ? checkedPages : [...checkedPages, ...Object.keys(baseline)];
const { rises, falls } = update ? { rises: [], falls: [] } : compareWarningBaseline(counts, baseline, comparePages);
const over = new Set(rises.map((r) => `${r.page}\0${r.rule}`));

function byRule(severity: ProseIssue["severity"]): Map<ProseRule, Found[]> {
  const out = new Map<ProseRule, Found[]>();
  for (const issue of found) {
    if (issue.severity !== severity) continue;
    out.set(issue.rule, [...(out.get(issue.rule) ?? []), issue]);
  }
  return out;
}

const warnings = byRule("warning");
for (const [rule, list] of warnings) {
  if (report) {
    console.log(`${rule} (${list.length}): ${RULE_FIX[rule]}`);
    for (const issue of list) {
      const mark = over.has(`${issue.page}\0${rule}`) ? " [over baseline]" : "";
      console.log(`  ${issue.file}:${issue.line}: ${issue.message}${mark}`);
    }
  } else {
    console.log(`warning: prose style: ${list.length} ${rule}; list them with npm run lint:prose -- --report`);
  }
}

if (falls.length) {
  console.log(
    `prose style: ${falls.length} page/rule warning count(s) below baseline; lock them in with npm run lint:prose -- --update-baseline`,
  );
}

let failed = false;
if (rises.length) {
  console.error(`Prose style, warnings above baseline (${rises.length}):`);
  for (const r of rises) console.error(`  docs/grammar/${r.page}: ${r.rule} ${r.baseline} → ${r.current}`);
  console.error(
    "Fix: clear the new warnings (list them with npm run lint:prose -- --report), or accept them on purpose with " +
      `npm run lint:prose -- --update-baseline <page> (${ANCHOR})`,
  );
  failed = true;
}

const errors = byRule("error");
if (errors.size) {
  for (const [rule, list] of errors) {
    console.error(`Prose style, ${rule} (${list.length}):`);
    for (const issue of list) console.error(`  ${issue.file}:${issue.line}: ${issue.message}`);
    console.error(`Fix ${rule}: ${RULE_FIX[rule]} (${ANCHOR})`);
  }
  failed = true;
}

if (failed) process.exitCode = 1;
else console.log(`OK: prose style, ${files.length} page(s).`);
