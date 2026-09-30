/**
 * Validate data/lexicon-compounds.csv against published roots and uniqueness rules.
 *
 * Run: npm run check-compounds
 *      npm run check-compounds -- --json
 */
import { readFileSync } from "node:fs";

import {
  parseCompoundCsv,
  validateCompoundRows,
  type CompoundValidationError,
} from "../src/lexicon-compounds.js";
import { parsePublishedCsv } from "../src/lexicon-search.js";
import { dataPath } from "../src/repo-paths.js";

const publishedPath = dataPath("lexicon-published.csv");
const compoundsPath = dataPath("lexicon-compounds.csv");

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
      .map((row) => row.root.trim())
      .filter(Boolean),
  );
  const published = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
  const publishedSenses = new Set(
    published.flatMap((row) => [row.concrete, row.abstract]).map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  const compounds = parseCompoundCsv(readFileSync(compoundsPath, "utf8"));
  const errors: CompoundValidationError[] = validateCompoundRows(compounds, publishedRoots, publishedSenses);

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
