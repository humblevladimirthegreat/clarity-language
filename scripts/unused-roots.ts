/**
 * Report legal 2- and 3-syllable Agelan roots not yet used in lexicon-published.csv.
 *
 * Run: npm run unused-roots
 *      npm run unused-roots -- --syllables 2
 *      npm run unused-roots -- --summary
 *      npm run unused-roots -- --json
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCsv } from "../src/csv.js";
import { allClarityRoots, isClarityRootShape } from "../src/word-converter.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

type SyllableBand = 2 | 3;

type CliOptions = {
  syllables: SyllableBand[];
  summary: boolean;
  json: boolean;
};

type BandReport = {
  syllables: SyllableBand;
  total: number;
  used: number;
  unused: string[];
};

function parseArgs(argv: string[]): CliOptions {
  let summary = false;
  let json = false;
  let syllables: SyllableBand[] | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--summary") {
      summary = true;
      continue;
    }
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--syllables") {
      const value = argv[++i];
      if (value !== "2" && value !== "3") {
        throw new Error('Missing or invalid value for --syllables (use "2" or "3")');
      }
      syllables = [Number(value) as SyllableBand];
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return {
    syllables: syllables ?? [2, 3],
    summary,
    json,
  };
}

function printUsage(): void {
  console.error(`Usage: npm run unused-roots -- [--syllables 2|3] [--summary] [--json]

Reports V(CV)+ roots from the phonology inventory that are absent from
data/lexicon-published.csv (2-syllable = VCV, 3-syllable = VCVCV).

Examples:
  npm run unused-roots
  npm run unused-roots -- --syllables 2
  npm run unused-roots -- --summary
  npm run unused-roots -- --json`);
}

function loadUsedRoots(path: string): Set<string> {
  const { rows } = parseCsv(readFileSync(path, "utf8"));
  const used = new Set<string>();

  for (const row of rows) {
    const root = (row.clarity ?? "").trim().toLowerCase();
    if (!root) {
      continue;
    }
    if (!isClarityRootShape(root)) {
      console.warn(`Skipping non-V(CV)+ published root: ${root}`);
      continue;
    }
    used.add(root);
  }

  return used;
}

function reportBand(syllables: SyllableBand, used: Set<string>): BandReport {
  const inventory = allClarityRoots(syllables);
  const unused = inventory.filter((root) => !used.has(root));
  return {
    syllables,
    total: inventory.length,
    used: inventory.length - unused.length,
    unused,
  };
}

function printText(reports: BandReport[], summaryOnly: boolean): void {
  for (const report of reports) {
    const unusedCount = report.unused.length;
    console.log(
      `${report.syllables}-syllable: ${unusedCount} unused / ${report.total} legal` +
        ` (${report.used} used in published lexicon)`,
    );
    if (!summaryOnly) {
      for (const root of report.unused) {
        console.log(root);
      }
      if (reports.indexOf(report) < reports.length - 1) {
        console.log("");
      }
    }
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const used = loadUsedRoots(publishedPath);
  const reports = options.syllables.map((syllables) => reportBand(syllables, used));

  if (options.json) {
    const payload = {
      publishedPath,
      usedPublishedRoots: used.size,
      bands: reports.map((report) => ({
        syllables: report.syllables,
        total: report.total,
        used: report.used,
        unusedCount: report.unused.length,
        unused: options.summary ? undefined : report.unused,
      })),
    };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  printText(reports, options.summary);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
