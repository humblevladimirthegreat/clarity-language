/**
 * Check Agalan words in docs/grammar/ code spans: they must parse, and
 * content / x-family host roots must be in the lexicon.
 *
 * Morph-gloss pairs (example blockquotes, Morph-column tables, and visible
 * morph lines in translation-exercise spoilers) are compared to the parser.
 * Teach blocks and exercises with loose English must include a morph unless
 * parser output is trivially redundant with that loose line.
 * Translation **Roots used here** English is checked against the lexicon.
 * On the number pages, shorthand number examples need a
 * pronunciation row that matches the spoken form computed from the shorthand.
 * Mismatches, leftover ambiguity, and missing morph glosses fail the run.
 * Findings print to stdout. Each file logs morph coverage counts.
 *
 * Run: npm run lint:agalan
 *      npm run lint:agalan -- [paths...] [--check-ambiguity]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { emptySpanStats, lintAgalanMarkdown, lintAgalanSpans } from "../src/lint/agalan-docs.js";
import {
  formatMorphGlossFinding,
  lintMorphGlossMarkdown,
} from "../src/lint/morph-gloss-docs.js";
import {
  formatWordBankFinding,
  lintWordBankMarkdown,
} from "../src/lint/word-bank-docs.js";
import {
  parseOverlayCsv,
  parsePublishedCsv,
  validateOverlayPublishedHosts,
} from "../src/lexicon-search.js";
import {
  formatNumberSpeechFinding,
  lintNumberSpeechMarkdown,
  NUMBER_SPEECH_FILES,
} from "../src/lint/number-speech-docs.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const grammarDir = join(rootDir, "docs", "grammar");

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

function parseCli(argv: string[]): { paths: string[] } {
  const paths: string[] = [];
  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.error(`Usage: npm run lint:agalan -- [paths...] [--check-ambiguity]

Checks backticked and fenced Agalan words under docs/grammar/.
Morph-gloss mismatches, leftover ambiguity, missing morph glosses, coverage
gaps, and translation word-bank English/lexicon mismatches fail.
--check-ambiguity is always on for the corpus (flag kept for callers).`);
      process.exit(0);
    }
    if (arg === "--check-ambiguity") {
      continue;
    }
    if (arg.startsWith("-")) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(2);
    }
    paths.push(arg);
  }
  return { paths };
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
  const { paths } = parseCli(process.argv.slice(2));
  const hostIssues = lintOverlayHosts();
  const files = resolveTargets(paths);
  const tables = loadDefaultTables();
  let count = 0;
  let morphCount = 0;
  let morphChecked = 0;
  let morphWithLoose = 0;
  let morphRedundantOmitted = 0;
  let bankCount = 0;
  let speechCount = 0;
  let spanCount = 0;
  const spanStats = emptySpanStats();

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

    for (const issue of lintAgalanSpans(original, tables, spanStats)) {
      spanCount += 1;
      const line = lineNumberAt(original, issue.index);
      console.error(`${rel}:${line}  \`${issue.text}\`  ${issue.kind}  (${issue.detail})`);
    }

    const morphResult = lintMorphGlossMarkdown(original, tables);
    morphChecked += morphResult.checked;
    morphWithLoose += morphResult.withLooseEnglish;
    morphRedundantOmitted += morphResult.redundantOmitted;
    const cov = morphResult.withLooseEnglish
      ? `${morphResult.comparedWithLoose} checked, ${morphResult.redundantOmitted} redundant-omitted / ${morphResult.withLooseEnglish} with loose English; `
      : "";
    console.log(`${rel}: ${cov}${morphResult.checked} morph gloss(es) compared to parser`);
    for (const finding of morphResult.findings) {
      morphCount += 1;
      console.log(formatMorphGlossFinding(rel, finding));
    }

    const bankFindings = lintWordBankMarkdown(original, tables);
    for (const finding of bankFindings) {
      bankCount += 1;
      console.log(formatWordBankFinding(rel, finding));
    }

    if (dirname(file) === grammarDir && NUMBER_SPEECH_FILES.includes(basename(file))) {
      for (const finding of lintNumberSpeechMarkdown(original)) {
        speechCount += 1;
        console.log(formatNumberSpeechFinding(rel, finding));
      }
    }
  }

  if (count > 0) {
    console.error(`\n${count} Agalan word issue(s) in docs/grammar/.`);
  }
  if (spanCount > 0) {
    console.error(`\n${spanCount} Agalan sentence / span issue(s) in docs/grammar/.`);
  }
  if (morphCount > 0) {
    console.log(`\n${morphCount} morph-gloss issue(s).`);
  }
  if (bankCount > 0) {
    console.log(`\n${bankCount} translation word-bank issue(s).`);
  }

  if (speechCount > 0) {
    console.log(`\n${speechCount} number pronunciation issue(s).`);
  }

  const fail = hostIssues + count + spanCount + morphCount + bankCount + speechCount;
  if (fail > 0) {
    process.exit(1);
  }
  console.log("OK: overlay hosts match the published lexicon.");
  console.log("OK: Agalan words in docs/grammar/ parse as legal and match the lexicon.");
  console.log(
    `OK: code spans — ${spanStats.sentence} sentence(s) and ${spanStats.phrase} phrase(s) parsed; ` +
      `${spanStats.word} single word(s), ${spanStats.template} template(s), ${spanStats.english} English, ` +
      `${spanStats["marked-fragment"]} marked fragment(s), ${spanStats["marked-skip"]} marked skip(s); 0 unclassified.`,
  );
  console.log(
    `OK: ${morphChecked} morph gloss(es) compared; ${morphRedundantOmitted} redundant-omitted / ${morphWithLoose} with loose English; glosses match the parser.`,
  );
  console.log("OK: translation word-bank English matches the lexicon.");
  console.log("OK: number pronunciation rows match their shorthand.");
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
