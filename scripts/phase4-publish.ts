/**
 * Phase 4: export keep=y lexicon rows to data/lexicon-published.csv.
 * Preserves existing metaphorical and mnemonic values by emoji when re-publishing.
 * Run: npm run phase4-publish
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { toUniqueClarityWord } from "../src/word-converter.js";
import { escapeCsvField, loadLexicon, parseCsv } from "./collapse-variants.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(rootDir, "data", "lexicon-published.csv");

function loadExistingPublishedFields(): Map<string, { metaphorical: string; mnemonic: string }> {
  const map = new Map<string, { metaphorical: string; mnemonic: string }>();
  if (!existsSync(outputPath)) return map;
  const { rows } = parseCsv(readFileSync(outputPath, "utf8"));
  for (const row of rows) {
    const emoji = row.emoji ?? "";
    const metaphorical = (row.metaphorical ?? "").trim();
    const mnemonic = (row.mnemonic ?? "").trim();
    if (emoji && (metaphorical || mnemonic)) {
      map.set(emoji, { metaphorical, mnemonic });
    }
  }
  return map;
}

const existingPublished = loadExistingPublishedFields();
const { rows } = loadLexicon();
const kept = rows.filter(
  (row) => (row.keep ?? "").trim().toLowerCase() === "y" && (row.literal ?? "").trim().length > 0,
);

if (kept.length === 0) {
  throw new Error("No keep=y rows with literal found in lexicon.csv");
}

const usedRoots = new Set<string>();
const failures: string[] = [];
const out: string[] = ["emoji,literal,clarity,metaphorical,mnemonic"];

for (const row of kept) {
  const emoji = row.emoji ?? "";
  const literal = (row.literal ?? "").trim();
  const existing = existingPublished.get(emoji);
  try {
    const clarity = toUniqueClarityWord(literal, usedRoots, 2, 8);
    out.push(
      [
        escapeCsvField(emoji),
        escapeCsvField(literal),
        escapeCsvField(clarity),
        escapeCsvField(existing?.metaphorical ?? ""),
        escapeCsvField(existing?.mnemonic ?? ""),
      ].join(","),
    );
  } catch {
    failures.push(`${emoji} (${literal})`);
  }
}

if (failures.length > 0) {
  const preview = failures.slice(0, 10).join(", ");
  const suffix = failures.length > 10 ? ", ..." : "";
  throw new Error(
    `Could not assign unique Clarity roots for ${failures.length} row(s): ${preview}${suffix}`,
  );
}

writeFileSync(outputPath, out.join("\n") + "\n");
console.log(`Wrote ${kept.length} rows to ${outputPath}`);
