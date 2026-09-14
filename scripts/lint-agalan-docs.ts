/**
 * Check Agalan words in docs/grammar/ code spans: they must parse, and
 * content / x-family host roots must be in the lexicon.
 *
 * Morph-gloss pairs (example blockquotes / Morph-column tables) are compared
 * with `--check-ambiguity` always on for the corpus. Mismatches go to
 * morph-gloss-ambiguity-report.md and do not fail CI; leftover ambiguity[] does.
 *
 * Run: npm run lint:agalan
 *      npm run lint:agalan -- [paths...] [--check-ambiguity] [--write-report]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { lintAgalanMarkdown } from "../src/lint/agalan-docs.js";
import {
  formatMorphGlossReport,
  lintMorphGlossMarkdown,
  type MorphGlossReportFile,
} from "../src/lint/morph-gloss-docs.js";
import {
  parseOverlayCsv,
  parsePublishedCsv,
  validateOverlayPublishedHosts,
} from "../src/lexicon-search.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");
const reportPath = join(rootDir, "morph-gloss-ambiguity-report.md");

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

function parseCli(argv: string[]): { paths: string[]; writeReport: boolean; verbose: boolean } {
  const paths: string[] = [];
  let writeReport = false;
  let verbose = false;
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.error(`Usage: npm run lint:agalan -- [paths...] [--check-ambiguity] [--write-report] [--verbose]

Checks backticked and fenced Agalan words under docs/grammar/.
Corpus morph-gloss compare always uses --check-ambiguity.
--write-report regenerates morph-gloss-ambiguity-report.md.
--verbose prints every morph-gloss mismatch (default: count only; details live in the report).`);
      process.exit(0);
    }
    if (arg === "--write-report") {
      writeReport = true;
      continue;
    }
    if (arg === "--check-ambiguity") {
      continue;
    }
    if (arg === "--verbose") {
      verbose = true;
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(2);
    }
    paths.push(arg);
  }
  return { paths, writeReport, verbose };
}

function resolveTargets(paths: string[]): string[] {
  if (paths.length === 0) {
    return listGrammarMarkdown(grammarDir);
  }
  const out: string[] = [];
  for (const arg of paths) {
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

function lintOverlayHosts(): number {
  const published = parsePublishedCsv(
    readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  );
  const overlays = parseOverlayCsv(
    readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  );
  const errors = validateOverlayPublishedHosts(overlays, published);
  if (errors.length === 0) {
    return 0;
  }
  console.error(`lexicon-overlays.csv: ${errors.length} hosted overlay(s) without a published root`);
  for (const err of errors) {
    console.error(`  row ${err.row ?? "?"} ${err.senseForm}: ${err.reason}`);
  }
  return errors.length;
}

function main(): void {
  const { paths, writeReport, verbose } = parseCli(process.argv.slice(2));
  const hostIssues = lintOverlayHosts();
  const files = resolveTargets(paths);
  const tables = loadDefaultTables();
  let count = 0;
  let ambiguityCount = 0;
  let mismatchCount = 0;
  const reportFiles: MorphGlossReportFile[] = [];

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const rel = relative(rootDir, file);
    const issues = lintAgalanMarkdown(original, tables);
    for (const issue of issues) {
      count += 1;
      const line = lineNumberAt(original, issue.index);
      const label = issue.kind === "parse" ? "does not parse" : "unknown root";
      console.error(`${rel}:${line}  \`${issue.token}\`  ${label}  (${issue.detail})`);
    }

    const morphFindings = lintMorphGlossMarkdown(original, tables);
    if (morphFindings.length > 0) {
      reportFiles.push({ relpath: rel, findings: morphFindings });
    }
    for (const finding of morphFindings) {
      if (finding.kind === "ambiguity") {
        ambiguityCount += 1;
        console.error(
          `${rel}:${finding.line}  --check-ambiguity  \`${finding.conflict.surface}\`  (${finding.conflict.detail})`,
        );
      } else {
        mismatchCount += 1;
        if (verbose) {
          console.error(`${rel}:${finding.line}  morph gloss mismatch`);
          console.error(`  agalan: \`${finding.agalan}\``);
          console.error(`  documented: ${finding.documented}`);
          console.error(`  parser:     ${finding.parser}`);
        }
      }
    }
  }

  const report = formatMorphGlossReport(reportFiles);
  let reportStale = false;
  if (writeReport) {
    writeFileSync(reportPath, report);
    console.log(`Wrote ${relative(rootDir, reportPath)}`);
  } else {
    let committed = "";
    try {
      committed = readFileSync(reportPath, "utf8");
    } catch {
      committed = "";
    }
    if (committed !== report) {
      reportStale = true;
      console.error(
        `${relative(rootDir, reportPath)} is stale. Run: npm run lint:agalan -- --write-report`,
      );
    }
  }

  if (count > 0) {
    console.error(`\n${count} Agalan word issue(s) in docs/grammar/.`);
  }
  if (mismatchCount > 0) {
    console.error(
      `${mismatchCount} morph gloss mismatch(es) recorded in morph-gloss-ambiguity-report.md (not a CI failure).`,
    );
  }
  if (ambiguityCount > 0) {
    console.error(`${ambiguityCount} leftover --check-ambiguity hit(s).`);
  }

  const fail = hostIssues + count + ambiguityCount + (reportStale ? 1 : 0);
  if (fail > 0) {
    process.exit(1);
  }
  console.log("OK: overlay hosts match the published lexicon.");
  console.log("OK: Agalan words in docs/grammar/ parse as legal and match the lexicon.");
  console.log("OK: morph-gloss report is current; no leftover --check-ambiguity hits.");
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
