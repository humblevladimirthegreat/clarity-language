import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { toUniqueClarityWord } from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(rootDir, "data", "ngsl.csv");
const outputPath = join(rootDir, "data", "ngsl-clarity.csv");

function parseCsvColumn(content: string): string[] {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new Error("Input CSV is empty");
  }

  const header = lines[0]!.trim().toLowerCase();
  if (header !== "english") {
    throw new Error(`Expected header "english", got "${lines[0]}"`);
  }

  return lines.slice(1);
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const input = readFileSync(inputPath, "utf8");
const words = parseCsvColumn(input);
const usedRoots = new Set<string>();
const failures: string[] = [];
const rows: string[] = ["english,clarity"];

for (const english of words) {
  try {
    const clarity = toUniqueClarityWord(english, usedRoots);
    rows.push(`${escapeCsvField(english)},${escapeCsvField(clarity)}`);
  } catch {
    failures.push(english);
  }
}

if (failures.length > 0) {
  const preview = failures.slice(0, 10).join(", ");
  const suffix = failures.length > 10 ? ", ..." : "";
  throw new Error(
    `Could not assign unique Clarity roots for ${failures.length} word(s): ${preview}${suffix}`,
  );
}

writeFileSync(outputPath, rows.join("\n") + "\n");
console.log(`Wrote ${words.length} rows to ${outputPath}`);
