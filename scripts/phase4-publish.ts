/**
 * Phase 4: export keep=y lexicon rows to data/lexicon-published.csv.
 * Run: npm run phase4-publish
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { toUniqueClarityWord } from "../src/word-converter.js";
import { escapeCsvField, loadLexicon } from "./collapse-variants.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(rootDir, "data", "lexicon-published.csv");

const { rows } = loadLexicon();
const kept = rows.filter(
  (row) => (row.keep ?? "").trim().toLowerCase() === "y" && (row.literal ?? "").trim().length > 0,
);

if (kept.length === 0) {
  throw new Error("No keep=y rows with literal found in lexicon.csv");
}

const usedRoots = new Set<string>();
const failures: string[] = [];
const out: string[] = ["emoji,literal,clarity,metaphorical"];

for (const row of kept) {
  const emoji = row.emoji ?? "";
  const literal = (row.literal ?? "").trim();
  try {
    const clarity = toUniqueClarityWord(literal, usedRoots, 2, 8);
    out.push(
      [
        escapeCsvField(emoji),
        escapeCsvField(literal),
        escapeCsvField(clarity),
        "",
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
