/**
 * One-off helper: group literal/metaphor collisions by type (stdout).
 * Run: npx tsx scripts/group-lexicon-collisions.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCsv } from "../src/csv.js";
import {
  englishCitationForms,
  validatePublishedSenseSeparation,
  type PublishedSenseError,
} from "../src/lexicon-published-lint.js";
import { normalizeEnglish } from "../src/lint/word-bank-docs.js";
import type { PublishedRow } from "../src/lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

function loadRows(): PublishedRow[] {
  const { rows } = parseCsv(readFileSync(publishedPath, "utf8"));
  return rows.map((row) => ({
    emoji: row.emoji ?? "",
    literal: row.literal ?? "",
    clarity: row.clarity ?? "",
    metaphorical: row.metaphorical ?? "",
    mnemonic: row.mnemonic ?? "",
    englishByPos: row.english_by_pos ?? "",
    posEnglish: { literal: {}, metaphorical: {} },
  }));
}

function isFlagEmoji(emoji: string): boolean {
  const t = emoji.trim();
  return /^[\u{1F1E6}-\u{1F1FF}]{2}$/u.test(t);
}

function sharedCitationForms(literal: string, metaphorical: string): string[] {
  const lf = englishCitationForms(literal);
  const mf = englishCitationForms(metaphorical);
  return [...lf].filter((f) => mf.has(f)).sort();
}

/** @deprecated grouping only — linter no longer flags hyphen-segment overlap */
function metaphorMatchesLiteralSegment(literal: string, metaphorical: string): boolean {
  const metNorm = normalizeEnglish(metaphorical);
  for (const segment of normalizeEnglish(literal).split("-")) {
    if (!segment) continue;
    if (englishCitationForms(segment).has(metNorm) || segment === metNorm) {
      return true;
    }
    if (englishCitationForms(metaphorical).has(segment)) {
      return true;
    }
  }
  return false;
}

function collisionBucket(error: PublishedSenseError): string {
  if (error.kind === "exact") {
    return "exact_duplicate";
  }

  const literal = error.literal;
  const metaphorical = error.metaphorical;
  const litNorm = normalizeEnglish(literal);
  const metNorm = normalizeEnglish(metaphorical);

  if (!litNorm.includes("-") && !metNorm.includes("-")) {
    const shared = sharedCitationForms(literal, metaphorical);
    if (shared.length > 0) {
      return "inflectional_related";
    }
  }

  if (metaphorMatchesLiteralSegment(literal, metaphorical)) {
    if (isFlagEmoji(error.emoji) || literal.includes("republic") || literal.includes("islands")) {
      return "flag_place_demonym_segment";
    }
    return "compound_literal_segment";
  }

  if (isFlagEmoji(error.emoji) || metNorm.includes("-")) {
    return "flag_place_demonym_overlap";
  }

  return "other_related";
}

function main(): void {
  const rows = loadRows();
  const errors = validatePublishedSenseSeparation(rows);
  const byBucket = new Map<string, PublishedSenseError[]>();

  for (const error of errors) {
    const bucket = collisionBucket(error);
    const list = byBucket.get(bucket) ?? [];
    list.push(error);
    byBucket.set(bucket, list);
  }

  const order = [
    "exact_duplicate",
    "inflectional_related",
    "compound_literal_segment",
    "flag_place_demonym_segment",
    "flag_place_demonym_overlap",
    "other_related",
  ];

  console.log(`Total collisions: ${errors.length}\n`);

  for (const bucket of order) {
    const items = byBucket.get(bucket);
    if (!items?.length) continue;
    console.log(`## ${bucket} (${items.length})`);
    for (const e of items) {
      const shared = sharedCitationForms(e.literal, e.metaphorical);
      console.log(
        `  row ${e.row} ${e.emoji}  literal=${e.literal}  metaphorical=${e.metaphorical}`,
      );
      if (shared.length) {
        console.log(`    shared citation forms: ${shared.join(", ")}`);
      }
    }
    console.log("");
  }
}

main();
