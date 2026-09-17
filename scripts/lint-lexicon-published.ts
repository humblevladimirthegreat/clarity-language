/**
 * Validate data/lexicon-published.csv literal vs abstract sense separation.
 *
 * Run: npm run lint:lexicon
 *      npm run lint:lexicon -- --json
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  validatePublishedSenseSeparation,
  type PublishedSenseError,
} from "../src/lexicon-published-lint.js";
import { parsePublishedCsv } from "../src/lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

function parseArgs(argv: string[]): { json: boolean } {
  let json = false;
  for (const arg of argv) {
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.error("Usage: npm run lint:lexicon [--json]");
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return { json };
}

function main(): void {
  const { json } = parseArgs(process.argv.slice(2));
  const rows = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
  const errors: PublishedSenseError[] = validatePublishedSenseSeparation(rows);

  if (json) {
    console.log(JSON.stringify({ ok: errors.length === 0, count: rows.length, errors }, null, 2));
  } else if (errors.length === 0) {
    console.log(`OK: ${rows.length} published lexicon row(s); concrete and abstract senses differ`);
  } else {
    console.error(`lexicon-published.csv: ${errors.length} concrete/abstract collision(s)`);
    for (const err of errors) {
      console.error(
        `  row ${err.row} ${err.emoji} concrete=${err.literal} abstract=${err.abstract}: ${err.reason}`,
      );
    }
  }

  process.exit(errors.length === 0 ? 0 : 1);
}

main();
