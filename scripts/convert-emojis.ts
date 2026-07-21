import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { toUniqueClarityWord } from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = join(rootDir, "data", "emojis.csv");
const outputPath = join(rootDir, "data", "emojis-clarity.csv");

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Minimal CSV parser for the emojis.csv shape (quoted fields supported). */
function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new Error("Input CSV is empty");
  }

  const headers = parseCsvLine(lines[0]!);
  return lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]!] = fields[i] ?? "";
    }
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

const rows = parseCsv(readFileSync(inputPath, "utf8"));
const withConcepts = rows.filter((row) => (row.concept ?? "").trim().length > 0);

const usedRoots = new Set<string>();
const failures: string[] = [];
const out: string[] = ["emoji,english,clarity"];

for (const row of withConcepts) {
  const emoji = row.emoji ?? "";
  const english = (row.concept ?? "").trim();
  try {
    // Emoji concepts collide more than NGSL; allow longer roots for uniqueness.
    const clarity = toUniqueClarityWord(english, usedRoots, 2, 8);
    out.push(
      `${escapeCsvField(emoji)},${escapeCsvField(english)},${escapeCsvField(clarity)}`,
    );
  } catch {
    failures.push(`${emoji} (${english})`);
  }
}

if (failures.length > 0) {
  const preview = failures.slice(0, 10).join(", ");
  const suffix = failures.length > 10 ? ", ..." : "";
  throw new Error(
    `Could not assign unique Clarity roots for ${failures.length} emoji(s): ${preview}${suffix}`,
  );
}

writeFileSync(outputPath, out.join("\n") + "\n");
console.log(`Wrote ${withConcepts.length} rows to ${outputPath}`);
