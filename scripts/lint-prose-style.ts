// Wording checks on learner-facing grammar pages (docs/meta/doc-style.md#what-the-build-checks).
// Exact rules fail; heuristic rules print one `warning:` count each.
// Usage: tsx scripts/lint-prose-style.ts [--report] [paths under docs/grammar/...]
//   --report  list every heuristic warning with file:line
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { proseStyleIssues, RULE_FIX, type ProseIssue, type ProseRule } from "../src/lint/prose-style.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(root, "docs", "grammar");
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
const paths = args.filter((arg) => !arg.startsWith("--")).map((arg) => resolve(arg));
const files = (paths.length ? paths : markdownFiles(grammarDir)).sort();

type Found = ProseIssue & { file: string };
const found: Found[] = [];
for (const file of files) {
  const page = relative(grammarDir, file).split("\\").join("/");
  for (const issue of proseStyleIssues(page, readFileSync(file, "utf8"))) {
    found.push({ ...issue, file: relative(root, file) });
  }
}

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
    for (const issue of list) console.log(`  ${issue.file}:${issue.line}: ${issue.message}`);
  } else {
    console.log(`warning: prose style: ${list.length} ${rule}; list them with npm run lint:prose -- --report`);
  }
}

const errors = byRule("error");
if (errors.size) {
  for (const [rule, list] of errors) {
    console.error(`Prose style, ${rule} (${list.length}):`);
    for (const issue of list) console.error(`  ${issue.file}:${issue.line}: ${issue.message}`);
    console.error(`Fix ${rule}: ${RULE_FIX[rule]} (${ANCHOR})`);
  }
  process.exitCode = 1;
} else {
  console.log(`OK: prose style, ${files.length} page(s).`);
}
