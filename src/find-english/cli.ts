/**
 * Search the docs by English phrase and print the taught Agazan form.
 *
 *   node scripts/find-english.mjs 'anyway'
 *   node scripts/find-english.mjs 'last time' 'late' --stage intermediate
 *   node scripts/find-english.mjs 'should have' --json
 *
 * Indexes example English, per-word glosses, table rows with an Agazan and an
 * English column, and translation practice (src/find/english.ts), plus the
 * English cues of published roots (senses and `english_aliases` synonyms;
 * `--kind root`). Hits are grouped by section, best first. Paths default to docs/grammar;
 * --include-examples adds docs/examples.
 */
import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";

import { loadDefaultTables } from "../parse/index.js";
import { parsePublishedCsv } from "../lexicon-search.js";
import { dataPath } from "../repo-paths.js";
import { listMarkdown } from "../markdown-files.js";
import { BANDS, type Band } from "../lint/learning-order.js";
import { collectEnglishEntries, collectRootEntries, ENTRY_KINDS, plainText, searchEnglish, type EntryKind, type SectionHit } from "../find/english.js";

function usage(message: string, code = 2): never {
  console.error(`${message}\nusage: find-english.mjs <phrase> [<phrase>…] [--json|--count] [--stage ${BANDS.join("|")}] [--kind ${ENTRY_KINDS.join("|")}] [--include-examples] [--limit N] [paths…]`);
  process.exit(code);
}

const phrases: string[] = [];
const paths: string[] = [];
let output: "text" | "json" | "count" = "text";
let stage: Band | undefined;
let kind: EntryKind | undefined;
let limit = 8;
let includeExamples = false;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === "--json") output = "json";
  else if (arg === "--count") output = "count";
  else if (arg === "--include-examples") includeExamples = true;
  else if (arg === "--stage") {
    const value = args[++i];
    if (!BANDS.includes(value as Band)) usage(`--stage needs one of ${BANDS.join(", ")}`);
    stage = value as Band;
  } else if (arg === "--kind") {
    const value = args[++i];
    if (!ENTRY_KINDS.includes(value as EntryKind)) usage(`--kind needs one of ${ENTRY_KINDS.join(", ")}`);
    kind = value as EntryKind;
  } else if (arg === "--limit") {
    limit = Number(args[++i]);
    if (!Number.isInteger(limit) || limit < 1) usage("--limit needs a positive integer");
  } else if (arg === "--help" || arg === "-h") usage("Search the docs by English phrase.", 0);
  else if (arg.startsWith("--")) usage(`unknown flag ${arg}`);
  else if (existsSync(arg)) paths.push(arg);
  else phrases.push(arg);
}
if (phrases.length === 0) usage("give at least one English phrase");

const roots = paths.length ? paths : ["docs/grammar", ...(includeExamples ? ["docs/examples"] : [])].filter((dir) => existsSync(dir));
const tables = loadDefaultTables();
const entries = roots.flatMap((root) =>
  listMarkdown(root).flatMap((file) => collectEnglishEntries(readFileSync(file, "utf8"), relative(process.cwd(), file), tables)),
);

if (paths.length === 0) entries.push(...collectRootEntries(parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"))));

const results = phrases.map((phrase) => ({ phrase, sections: searchEnglish(entries, phrase, { stage, kind }).slice(0, limit) }));

function stageName(band: Band | undefined): string {
  return band ? band[0]!.toUpperCase() + band.slice(1) : "";
}

function printSection(section: SectionHit): void {
  const anchor = section.slug ? ` (#${section.slug})` : "";
  console.log(`${section.page} § ${section.title || "(top)"}${anchor}  ${stageName(section.band)}`.trimEnd());
  for (const { entry, via } of section.hits) {
    const english = entry.kind === "example" || entry.kind === "practice" ? `"${plainText(entry.english)}"` : plainText(entry.english);
    const note = via ? `   (via synonym: ${via})` : entry.alias ? "   (lexicon synonym)" : "";
    console.log(`  ${entry.kind.padEnd(8)} \`${entry.form}\`   ${english}${note}   :${entry.line}`);
  }
}

if (output === "json") {
  console.log(
    JSON.stringify(
      results.map(({ phrase, sections }) => ({
        phrase,
        sections: sections.map(({ hits, ...s }) => ({
          ...s,
          hits: hits.map(({ entry: { tokens: _, ...entry }, score, via }) => ({ ...entry, score, via })),
        })),
      })),
      null,
      2,
    ),
  );
} else if (output === "count") {
  for (const { phrase, sections } of results) console.log(phrases.length > 1 ? `${sections.length}\t${phrase}` : sections.length);
} else {
  for (const { phrase, sections } of results) {
    if (phrases.length > 1) console.log(`== ${phrase}`);
    if (sections.length === 0) console.log("no entry");
    sections.forEach(printSection);
    if (phrases.length > 1) console.log();
  }
}
