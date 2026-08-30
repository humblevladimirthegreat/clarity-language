/**
 * Validate data/lexicon-compounds.csv against published roots and uniqueness rules.
 *
 * Run: npm run check-compounds
 *      npm run check-compounds -- --json
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseCompoundCsv,
  validateCompoundRows,
  type CompoundValidationError,
} from "../src/lexicon-compounds.js";
import { parsePublishedCsv } from "../src/lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const compoundsPath = join(rootDir, "data", "lexicon-compounds.csv");

function parseArgs(argv: string[]): { json: boolean } {
  let json = false;
  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.error("Usage: npm run check-compounds [--json]");
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return { json };
}

function main(): void {
  const { json } = parseArgs(process.argv.slice(2));
  const publishedRoots = new Set(
    parsePublishedCsv(readFileSync(publishedPath, "utf8"))
      .map((row) => row.clarity.trim())
      .filter(Boolean),
  );
  const compounds = parseCompoundCsv(readFileSync(compoundsPath, "utf8"));
  const errors: CompoundValidationError[] = validateCompoundRows(compounds, publishedRoots);

  if (json) {
    console.log(JSON.stringify({ ok: errors.length === 0, count: compounds.length, errors }, null, 2));
  } else if (errors.length === 0) {
    console.log(`OK: ${compounds.length} compound lemma(s) in lexicon-compounds.csv`);
  } else {
    console.error(`lexicon-compounds.csv: ${errors.length} error(s)`);
    for (const err of errors) {
      console.error(`  row ${err.row ?? "?"} ${err.stem ?? ""}: ${err.reason}`);
    }
  }

  process.exit(errors.length === 0 ? 0 : 1);
}

main();
