/**
 * Check Agalan words in docs/grammar/ code spans: they must parse, and
 * content / x-family host roots must be in the lexicon.
 *
 * Run: npm run lint:agalan
 *      npm run lint:agalan -- [paths...]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { lintAgalanMarkdown } from "../src/lint/agalan-docs.js";
import { createClassifyTables } from "../src/parse/classify.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");

function loadTables() {
  return createClassifyTables(
    readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
    readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
    readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
  );
}

function listGrammarMarkdown(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress" || name === "public") {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listGrammarMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

function resolveTargets(argv: string[]): string[] {
  if (argv.length === 0) {
    return listGrammarMarkdown(grammarDir);
  }
  const out: string[] = [];
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.error(`Usage: npm run lint:agalan -- [paths...]

Checks backticked and fenced Agalan words under docs/grammar/.`);
      process.exit(0);
    }
    const full = resolve(arg);
    const info = statSync(full);
    if (info.isDirectory()) {
      out.push(...listGrammarMarkdown(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  const files = resolveTargets(process.argv.slice(2));
  const tables = loadTables();
  let count = 0;

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const issues = lintAgalanMarkdown(original, tables);
    if (issues.length === 0) {
      continue;
    }
    const rel = relative(rootDir, file);
    for (const issue of issues) {
      count += 1;
      const line = lineNumberAt(original, issue.index);
      const label = issue.kind === "parse" ? "does not parse" : "unknown root";
      console.error(`${rel}:${line}  \`${issue.token}\`  ${label}  (${issue.detail})`);
    }
  }

  if (count > 0) {
    console.error(`\n${count} Agalan word issue(s) in docs/grammar/.`);
    process.exit(1);
  }
  console.log("OK: Agalan words in docs/grammar/ parse as legal and match the lexicon.");
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
