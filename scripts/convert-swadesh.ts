import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { toClarityWord } from "../src/word-converter.js";

const SYLLABLES = 2;

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(rootDir, "data", "swadesh.csv");
const outputPath = join(rootDir, "data", "swadesh-clarity.csv");

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

const rows: string[] = ["english,clarity"];

for (const english of words) {
  let clarity = "";
  try {
    clarity = toClarityWord(english, SYLLABLES);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Warning: could not convert "${english}": ${message}`);
  }
  rows.push(`${escapeCsvField(english)},${escapeCsvField(clarity)}`);
}

writeFileSync(outputPath, rows.join("\n") + "\n");
console.log(`Wrote ${words.length} rows to ${outputPath}`);
