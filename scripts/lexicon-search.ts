/**
 * Search data/lexicon-published.csv from the command line.
 *
 * Run: npm run lexicon-search -- happy
 *      npm run lexicon-search -- laugh --limit 10
 *      npm run lexicon-search -- --json uze
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createLexiconIndex,
  parsePublishedCsv,
  searchLexicon,
  type LexiconSearchResult,
} from "../src/lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

type CliOptions = {
  query: string;
  json: boolean;
  limit: number;
};

function parseArgs(argv: string[]): CliOptions {
  let json = false;
  let limit = 20;
  const queryParts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--limit") {
      const value = argv[++i];
      if (!value || Number.isNaN(Number(value))) {
        throw new Error("Missing or invalid value for --limit");
      }
      limit = Number(value);
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    queryParts.push(arg);
  }

  const query = queryParts.join(" ").trim();
  if (!query) {
    printUsage();
    throw new Error("Missing search query");
  }

  return { query, json, limit };
}

function printUsage(): void {
  console.error(`Usage: npm run lexicon-search -- <query> [--limit N] [--json]

Examples:
  npm run lexicon-search -- happy
  npm run lexicon-search -- laugh --limit 10
  npm run lexicon-search -- --json uze`);
}

function formatTable(results: LexiconSearchResult[]): void {
  const headers = ["emoji", "literal", "clarity", "metaphorical", "score"];
  const rows = results.map((r) => [
    r.emoji,
    r.literal,
    r.clarity,
    r.metaphorical || "—",
    r.score.toFixed(2),
  ]);

  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i]!.length)),
  );

  const formatRow = (cells: string[]) =>
    cells.map((cell, i) => cell.padEnd(widths[i]!)).join("  ");

  console.log(formatRow(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(formatRow(row));
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const text = readFileSync(publishedPath, "utf8");
  const rows = parsePublishedCsv(text);
  const index = createLexiconIndex(rows);
  const results = searchLexicon(index, rows, options.query, { limit: options.limit });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log("No matches.");
    return;
  }

  formatTable(results);
}

try {
  main();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
}
