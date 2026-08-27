/**
 * Reassign published lexicon roots with the order-preserving converter.
 * Pins closed overlay / pronoun / mood hosts so grammar-linked stems stay put.
 *
 * Run: npx tsx scripts/regenerate-lexicon-roots.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "../src/csv.js";
import { parseOverlayCsv, senseFormRoot } from "../src/lexicon-search.js";
import { NEED_ROOTS } from "../src/parse/classify.js";
import { isClarityRootShape, toUniqueClarityWord } from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");

const CLOSED_HOSTS = new Set<string>([
  ...NEED_ROOTS,
  "egera",
  "uho",
  "edahe",
  "umogo",
  "ehado",
  "ana",
  "enu",
  "odo",
  "owaro",
  "edelo",
  "ehege",
  "eroge",
  "onugo",
]);

function serializeCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

function main(): void {
  const overlays = parseOverlayCsv(readFileSync(overlayPath, "utf8"));
  for (const overlay of overlays) {
    const root = senseFormRoot(overlay.senseForm);
    if (isClarityRootShape(root)) {
      CLOSED_HOSTS.add(root);
    }
  }

  const { headers, rows } = parseCsv(readFileSync(publishedPath, "utf8"));
  const used = new Set<string>(CLOSED_HOSTS);
  let pinned = 0;
  let reassigned = 0;

  for (const row of rows) {
    const current = (row.clarity ?? "").trim().toLowerCase();
    if (CLOSED_HOSTS.has(current)) {
      pinned++;
      continue;
    }
    row.clarity = toUniqueClarityWord((row.literal ?? "").trim(), used);
    reassigned++;
  }

  writeFileSync(publishedPath, serializeCsv(headers, rows));
  console.log(`Pinned ${pinned} closed hosts; reassigned ${reassigned} roots → ${publishedPath}`);
}

main();
