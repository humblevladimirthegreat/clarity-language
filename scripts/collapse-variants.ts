import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildClusterReport,
  buildClusters,
  propagateLiterals,
  type LexiconRow,
} from "../src/variant-cluster.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
export const lexiconPath = join(rootDir, "data", "lexicon.csv");

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseCsv(content: string): { headers: string[]; rows: Record<string, string>[] } {
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

export function writeLexicon(headers: string[], rows: Record<string, string>[]): void {
  const out = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvField(row[h] ?? "")).join(",")),
  ].join("\n");
  writeFileSync(lexiconPath, out + "\n");
}

export function loadLexicon(): { headers: string[]; rows: LexiconRow[] } {
  const content = readFileSync(lexiconPath, "utf8");
  const { headers, rows } = parseCsv(content);
  return { headers, rows: rows as LexiconRow[] };
}

function printReport(rows: LexiconRow[], verbose: boolean): void {
  const clusters = buildClusters(rows);
  const report = buildClusterReport(rows, clusters);

  console.log(`Total rows: ${report.totalRows}`);
  console.log(`Total clusters: ${report.totalClusters}`);
  console.log(`Multi-member clusters: ${report.multiMemberClusters}`);
  console.log(`Skin-tone variant rows: ${report.skinToneRows}`);
  console.log(`Gender variant rows: ${report.genderVariantRows}`);
  console.log("\nLargest clusters:");
  for (const c of report.largestClusters) {
    const literalTag = c.hasLiteral ? "has literal" : "no literal";
    console.log(`  ${c.prototypeEmoji}  ${c.memberCount} members  (${literalTag})  [${c.clusterKey}]`);
  }

  if (verbose) {
    const multi = clusters.filter((c) => c.memberIndices.length > 1);
    console.log(`\nAll multi-member clusters (${multi.length}):`);
    for (const cluster of multi) {
      const prototype = rows[cluster.prototypeIndex]!;
      const literal = (prototype.literal ?? "").trim();
      const literalTag = literal ? `literal="${literal}"` : "no literal";
      console.log(
        `  ${prototype.emoji}  ${cluster.memberIndices.length} members  ${literalTag}  [${cluster.clusterKey}]`,
      );
    }
  }
}

export interface PropagateOptions {
  force?: boolean;
  dryRun?: boolean;
}

export function runPropagate(options: PropagateOptions = {}): void {
  const { force = false, dryRun = false } = options;
  const { headers, rows } = loadLexicon();
  const clusters = buildClusters(rows);
  const result = propagateLiterals(rows, clusters, { force });

  if (!dryRun && result.rowsUpdated > 0) {
    writeLexicon(headers, rows);
  }

  console.log(
    `Propagated ${result.clustersPropagated} clusters; ${result.rowsUpdated} rows updated; ${result.clustersWaiting} multi-member clusters waiting on prototype gloss.`,
  );
}

function printUsage(): void {
  console.log(`Usage:
  npm run collapse-variants [report] [--verbose]
  npm run collapse-variants propagate [--force] [--dry-run]

Commands:
  report     Cluster stats and largest multi-member groups (default)
  propagate  Copy prototype literal to variant rows

Options:
  --verbose   List all multi-member clusters (report mode)
  --force     Overwrite member literals that differ from prototype
  --dry-run   Propagate without writing lexicon.csv`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args.find((a) => !a.startsWith("-")) ?? "report";
  const verbose = args.includes("--verbose");
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  if (command === "report") {
    const { rows } = loadLexicon();
    printReport(rows, verbose);
    return;
  }

  if (command === "propagate") {
    runPropagate({ force, dryRun });
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
