/**
 * Convert English text to an Agelan root.
 *
 * Run: npm run convert-word -- fishing
 *      npm run convert-word -- --unique fishing
 *      npm run convert-word -- --lexicon
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "../src/csv.js";
import { parseOverlayCsv } from "../src/lexicon-search.js";
import {
  CLARITY_CONSONANTS,
  CLARITY_VOWELS,
  letterDistribution,
  toClarityWord,
  toUniqueClarityWord,
} from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");

/** Join-series overlays stay vowel-series; they are not hosted on a published root. */
const JOIN_SENSE_FORMS = new Set([
  "an",
  "on",
  "aon",
  "un",
  "uan",
  "uon",
  "en",
  "aen",
  "oen",
  "uen",
]);

const OVERLAY_HEADERS = ["sense_form", "pos", "emoji", "definition", "mnemonic"];

type CliOptions = {
  lexicon: boolean;
  input: string;
  unique: boolean;
  syllables: number;
};

function parseArgs(argv: string[]): CliOptions {
  let unique = false;
  let lexicon = false;
  let syllables = 2;
  const parts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--unique") {
      unique = true;
      continue;
    }
    if (arg === "--lexicon") {
      lexicon = true;
      continue;
    }
    if (arg === "--syllables") {
      const value = argv[++i];
      if (!value || Number.isNaN(Number(value))) {
        throw new Error("Missing or invalid value for --syllables");
      }
      syllables = Number(value);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    parts.push(arg);
  }

  const input = parts.join(" ").trim();
  if (!lexicon && !input) {
    printUsage();
    throw new Error("Missing input text");
  }

  return { lexicon, input, unique, syllables };
}

function printUsage(): void {
  console.error(`Usage: npm run convert-word -- <english> [--unique] [--syllables N]
       npm run convert-word -- --lexicon

Examples:
  npm run convert-word -- fishing
  npm run convert-word -- --unique fishing
  npm run convert-word -- --lexicon`);
}

function pct(count: number, total: number): string {
  if (total === 0) {
    return "0.0%";
  }
  return `${((100 * count) / total).toFixed(1)}%`;
}

function serializeCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

function retieSenseForm(senseForm: string, oldRoot: string, newRoot: string): string {
  if (!oldRoot || oldRoot === newRoot) {
    return senseForm;
  }
  if (oldRoot.length >= 3 && senseForm.startsWith(oldRoot)) {
    return newRoot + senseForm.slice(oldRoot.length);
  }
  const ending = senseForm.match(/[lmnr]$/)?.[0] ?? "";
  const xAt = senseForm.indexOf("x");
  const extra = xAt >= 0 ? senseForm.slice(xAt) : ending;
  return extra.startsWith("x") ? newRoot + extra : newRoot + ending;
}

function convertLexicon(): void {
  const { headers, rows } = parseCsv(readFileSync(publishedPath, "utf8"));
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  const used = new Set<string>();
  const assigned: string[] = [];
  const oldToNewByEmoji = new Map<string, { oldRoot: string; newRoot: string }>();
  let skipped = 0;
  let failed = 0;
  let changed = 0;

  for (const row of rows) {
    const literal = (row.literal ?? "").trim();
    if (!literal) {
      skipped += 1;
      continue;
    }
    const previous = (row.clarity ?? "").trim();
    try {
      const neu = toUniqueClarityWord(literal, used);
      row.clarity = neu;
      assigned.push(neu);
      if (row.emoji) {
        oldToNewByEmoji.set(row.emoji, { oldRoot: previous, newRoot: neu });
      }
      if (neu !== previous) {
        changed += 1;
      }
    } catch (err) {
      failed += 1;
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
    }
  }

  for (const overlay of overlays) {
    if (JOIN_SENSE_FORMS.has(overlay.senseForm)) {
      continue;
    }
    if (!overlay.emoji) {
      continue;
    }
    const mapped = oldToNewByEmoji.get(overlay.emoji);
    if (!mapped) {
      continue;
    }
    overlay.senseForm = retieSenseForm(overlay.senseForm, mapped.oldRoot, mapped.newRoot);
  }

  writeFileSync(publishedPath, serializeCsv(headers, rows));
  writeFileSync(
    overlayPath,
    serializeCsv(
      OVERLAY_HEADERS,
      overlays.map((overlay) => ({
        sense_form: overlay.senseForm,
        pos: overlay.pos,
        emoji: overlay.emoji,
        definition: overlay.definition,
        mnemonic: overlay.mnemonic,
      })),
    ),
  );

  const dist = letterDistribution(assigned);
  console.log(`assigned: ${assigned.length}`);
  console.log(`skipped: ${skipped}`);
  console.log(`failed: ${failed}`);
  console.log(`roots changed: ${changed}`);
  console.log("");
  console.log(`vowels (${dist.vowelTokens} tokens):`);
  for (const v of CLARITY_VOWELS) {
    console.log(`  ${v}  ${dist.vowels[v]}  ${pct(dist.vowels[v], dist.vowelTokens)}`);
  }
  console.log(`consonants (${dist.consonantTokens} tokens):`);
  for (const c of CLARITY_CONSONANTS) {
    console.log(`  ${c}  ${dist.consonants[c]}  ${pct(dist.consonants[c], dist.consonantTokens)}`);
  }
  console.log(`letters: ${dist.letters}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (options.lexicon) {
    convertLexicon();
    return;
  }
  const root = options.unique
    ? toUniqueClarityWord(options.input, new Set())
    : toClarityWord(options.input, options.syllables);
  console.log(root);
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
