import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { nameToLiteral } from "../src/literal-normalizer.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const lexiconPath = join(rootDir, "data", "lexicon.csv");

const TARGET_GROUPS = new Set(
  (process.argv[2] ?? "Objects,Symbols").split(",").map((g) => g.trim()),
);

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length === 0) {
    throw new Error("Input CSV is empty");
  }

  const headers = parseCsvLine(lines[0]!);
  const rows = lines.slice(1).map((line) => {
    const fields = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]!] = fields[i] ?? "";
    }
    return row;
  });
  return { headers, rows };
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

const content = readFileSync(lexiconPath, "utf8");
const { headers, rows } = parseCsv(content);

let filled = 0;
for (const row of rows) {
  if (!TARGET_GROUPS.has(row.group ?? "")) {
    continue;
  }
  const literal = nameToLiteral(row.name ?? "");
  row.literal = literal;
  filled++;
}

const out = [
  headers.join(","),
  ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
].join("\n");

writeFileSync(lexiconPath, out + "\n");

const empty = rows.filter(
  (r) => TARGET_GROUPS.has(r.group ?? "") && !(r.literal ?? "").trim(),
).length;

console.log(
  `Filled ${filled} literals in [${[...TARGET_GROUPS].join(", ")}]; ${empty} still empty.`,
);
