/**
 * Retie Agalan tokens in docs/grammar/, docs/examples/, and lexicon-compounds.csv
 * from the map dumped by convert-word --lexicon.
 *
 * Run: npm run retie-docs
 *      npm run retie-docs -- --write
 *      npm run retie-docs -- --map tmp/lexicon-retie-map.json --write
 *
 * Only spans the doc lint reads as Agalan are rewritten (plus `*emphasised*` prose citations);
 * other hits are listed for review. A rewrite that stops parsing or moves an unmapped root
 * blocks `--write`. A new resume link is a warning. Other parse-tree changes are info.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseCompoundCsv,
  retieCompoundRows,
  serializeCompoundCsv,
} from "../src/lexicon-compounds.js";
import { fillSelf } from "../src/learner-name.js";
import { ENGLISH_IN_CODE, lintAgalanMarkdown, lintAgalanSpans } from "../src/lint/agalan-docs.js";
import { formatMorphGlossFinding, lintMorphGlossMarkdown } from "../src/lint/morph-gloss-docs.js";
import { formatWordBankFinding, lintWordBankMarkdown } from "../src/lint/word-bank-docs.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { parseWord } from "../src/parse/word.js";
import { rewriteMarkdown } from "../src/retie/markdown.js";
import { checkMapCollisions, parseRetieMapJson, RETIE_MAP_RELATIVE_PATH } from "../src/retie/map.js";
import { contentStemRoots } from "../src/retie/resume.js";
import { forEachMarkdownCodeToken, lineNumberAt, peelChunk } from "../src/retie/tokens.js";
import { bridgeTables, verifyRetiedSpans } from "../src/retie/verify.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const markdownDirs = [
  join(rootDir, "docs", "grammar"),
  join(rootDir, "docs", "examples"),
  join(rootDir, "docs", "meta"),
];
const compoundsPath = join(rootDir, "data", "lexicon-compounds.csv");

type CliOptions = {
  mapPath: string;
  write: boolean;
  force: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  let mapPath = join(rootDir, RETIE_MAP_RELATIVE_PATH);
  let write = false;
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--write") {
      write = true;
      continue;
    }
    if (arg === "--force") {
      force = true;
      continue;
    }
    if (arg === "--map") {
      const value = argv[++i];
      if (!value) {
        throw new Error("Missing value for --map");
      }
      mapPath = value;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { mapPath, write, force };
}

function printUsage(): void {
  console.error(`Usage: npm run retie-docs -- [--map PATH] [--write] [--force]

Reads ${RETIE_MAP_RELATIVE_PATH} (from convert-word --lexicon) and reties
Agalan tokens in docs/grammar/, docs/examples/, docs/meta/, and data/lexicon-compounds.csv.
Default is a dry-run. --write refuses when a map collision or a before/after
parse check fails, unless --force.`);
}

function listMarkdown(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === ".vitepress" || name === "public") {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...listMarkdown(full));
    } else if (name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out.sort();
}

/** Content roots spelled in code across the docs, for the collision check. */
function rootsInUse(texts: string[]): Set<string> {
  const roots = new Set<string>();
  for (const text of texts) {
    forEachMarkdownCodeToken(text, ({ chunk }) => {
      const { core } = peelChunk(chunk);
      try {
        for (const root of contentStemRoots(parseWord(core))) roots.add(root);
      } catch {
        // not an Agalan word
      }
    });
  }
  return roots;
}

/** Doc-lint findings for one page (same checks as `npm run build`, minus site-wide ones). */
function lintPage(rel: string, source: string): string[] {
  const tables = loadDefaultTables();
  const text = fillSelf(source);
  const out: string[] = [];
  for (const issue of lintAgalanMarkdown(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.token}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const issue of lintAgalanSpans(text, tables)) {
    out.push(`${rel}:${lineNumberAt(text, issue.index)}  \`${issue.text}\`  ${issue.kind}  (${issue.detail})`);
  }
  for (const finding of lintMorphGlossMarkdown(text, tables).findings) {
    out.push(formatMorphGlossFinding(rel, finding));
  }
  for (const finding of lintWordBankMarkdown(source, tables)) {
    out.push(formatWordBankFinding(rel, finding));
  }
  return out;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.mapPath)) {
    throw new Error(
      `Retie map not found: ${options.mapPath}\nRun npm run convert-word -- --lexicon first, or pass --map.`,
    );
  }

  const map = parseRetieMapJson(readFileSync(options.mapPath, "utf8"));
  const tables = bridgeTables(map);
  const files = markdownDirs.flatMap((dir) => listMarkdown(dir));
  const sources = new Map(files.map((file) => [file, readFileSync(file, "utf8")]));
  let total = 0;
  let blocking = 0;
  let warnings = 0;
  let info = 0;
  const written: { file: string; text: string }[] = [];

  const collisions = checkMapCollisions(map, {
    rootsInUse: rootsInUse([...sources.values()]),
    englishWords: ENGLISH_IN_CODE,
  });
  for (const collision of collisions) {
    blocking += 1;
    console.error(`collision  ${collision.newRoot}  ${collision.reason}`);
  }

  let reviewCount = 0;
  for (const file of files) {
    const original = sources.get(file)!;
    const { text, changes, reviews, spans } = rewriteMarkdown(original, map, tables);
    const rel = relative(rootDir, file);
    for (const review of reviews) {
      reviewCount += 1;
      console.log(`${rel}:${lineNumberAt(original, review.index)}  review  \`${review.text}\`  (${review.reason})`);
    }
    for (const failure of verifyRetiedSpans(spans, map, tables)) {
      const line = lineNumberAt(original, failure.span.index);
      const rendered = `${rel}:${line}  ${failure.level}  \`${failure.span.before}\` → \`${failure.span.after}\`  (${failure.detail})`;
      if (failure.level === "info") {
        info += 1;
        console.log(rendered);
      } else if (failure.level === "warning") {
        warnings += 1;
        console.warn(rendered);
      } else {
        blocking += 1;
        console.error(rendered);
      }
    }
    if (changes.length === 0) {
      continue;
    }
    total += changes.length;
    for (const change of changes) {
      const line = lineNumberAt(original, change.index);
      console.log(`${rel}:${line}  ${change.from} → ${change.to}`);
    }
    written.push({ file, text });
  }

  const compoundOriginal = readFileSync(compoundsPath, "utf8");
  const { rows, changes: compoundChanges } = retieCompoundRows(parseCompoundCsv(compoundOriginal), map);
  if (compoundChanges.length > 0) {
    total += compoundChanges.length;
    const rel = relative(rootDir, compoundsPath);
    for (const change of compoundChanges) {
      console.log(`${rel}:${change.row}  ${change.field} ${change.from} → ${change.to}`);
    }
  }

  const filesChanged = written.length + (compoundChanges.length > 0 ? 1 : 0);
  const summary = `${total} reties in ${filesChanged} files; ${reviewCount} to review; ${warnings} warning; ${info} info; ${blocking} blocking`;
  if (!options.write) {
    console.log(`Dry-run: ${summary}. Pass --write to apply.`);
    return;
  }
  if (blocking > 0 && !options.force) {
    throw new Error(`Not written: ${summary}. Fix the map or pass --force.`);
  }
  for (const { file, text } of written) {
    writeFileSync(file, text);
  }
  if (compoundChanges.length > 0) {
    writeFileSync(compoundsPath, serializeCompoundCsv(rows));
  }
  console.log(`Wrote ${summary}.`);

  // Same pages `npm run build` lints; docs/meta and docs/examples hold unlinted notes.
  const grammarDir = join(rootDir, "docs", "grammar");
  let lintCount = 0;
  for (const { file, text } of written.filter(({ file }) => file.startsWith(`${grammarDir}/`))) {
    for (const line of lintPage(relative(rootDir, file), text)) {
      lintCount += 1;
      console.error(line);
    }
  }
  if (lintCount > 0) {
    throw new Error(`Lint after retie: ${lintCount} issue(s) in changed grammar pages.`);
  }
  console.log("Lint after retie: changed grammar pages clean.");
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
