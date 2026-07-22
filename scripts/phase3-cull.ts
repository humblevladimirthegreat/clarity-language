/**
 * Phase 3 cull: set keep=y/n on lexicon rows.
 * Run: npm run phase3-cull [report|apply|audit] [--verbose] [--dry-run] [--group="..."]
 */
import { loadLexicon, writeLexicon } from "./collapse-variants.js";
import {
  applyCull,
  auditCull,
  buildCullReport,
  buildDuplicateClusters,
  type LexiconRow,
} from "../src/literal-cull.js";

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("-")) ?? "report";
const verbose = args.includes("--verbose");
const dryRun = args.includes("--dry-run");
const groupArg = args.find((a) => a.startsWith("--group="));
const groupFilter = groupArg ? groupArg.slice("--group=".length) : undefined;

function printReport(rows: LexiconRow[]): void {
  const report = buildCullReport(rows, { groupFilter });

  if (groupFilter) {
    console.log(`Group filter: ${groupFilter}`);
  }
  console.log(`Total rows: ${report.totalRows}`);
  console.log(`Drop A (empty literal): ${report.dropARows}`);
  console.log(`Duplicate clusters: ${report.duplicateClusters}`);
  console.log(`Rows in duplicate clusters: ${report.rowsInDuplicateClusters}`);
  console.log(`Singleton rows (auto keep=y): ${report.singletonRows}`);
  console.log(`Projected keep=y: ${report.projectedKeepY}`);

  console.log("\nLargest duplicate clusters:");
  for (const c of report.largestClusters) {
    console.log(
      `  ${c.winnerEmoji}  ${c.memberCount} members  literal="${c.literal}"  winner="${c.winnerName}"  [${c.clusterKey}]`,
    );
  }

  if (verbose) {
    const clusters = buildDuplicateClusters(rows, { groupFilter });
    console.log(`\nAll duplicate clusters (${clusters.length}):`);
    for (const cluster of clusters) {
      const winner = rows[cluster.winnerIndex]!;
      const literal = (winner.literal ?? "").trim();
      console.log(
        `  ${winner.emoji}  ${cluster.memberIndices.length} members  literal="${literal}"  winner="${winner.name}"  [${cluster.clusterKey}]`,
      );
    }
  }
}

function runApply(rows: LexiconRow[]): void {
  const result = applyCull(rows, { groupFilter, scoped: Boolean(groupFilter) });

  if (groupFilter) {
    console.log(`Applied cull to group: ${groupFilter}`);
  } else {
    console.log("Applied cull to all rows");
  }
  console.log(
    `keep=y: ${result.kept} (${result.singletons} singletons + ${result.clusters} cluster winners)`,
  );
  console.log(`keep=n: ${result.culled} (${result.dropA} Drop A + ${result.culled - result.dropA} duplicate losers)`);
}

function runAudit(rows: LexiconRow[]): void {
  const issues = auditCull(rows);
  const keepY = rows.filter((r) => (r.keep ?? "").trim() === "y").length;
  const keepN = rows.filter((r) => (r.keep ?? "").trim() === "n").length;
  const keepEmpty = rows.filter((r) => !(r.keep ?? "").trim()).length;

  console.log(`Total rows: ${rows.length}`);
  console.log(`keep=y: ${keepY}`);
  console.log(`keep=n: ${keepN}`);
  console.log(`keep empty: ${keepEmpty}`);

  if (issues.length === 0) {
    console.log("\nAudit passed.");
    return;
  }

  console.log(`\nAudit failed (${issues.length} issue(s)):`);
  for (const issue of issues) {
    console.log(`  [${issue.kind}] ${issue.message}`);
  }
  process.exit(1);
}

function printUsage(): void {
  console.log(`Usage:
  npm run phase3-cull [report] [--verbose] [--group="People & Body"]
  npm run phase3-cull apply [--dry-run] [--group="..."]
  npm run phase3-cull audit

Commands:
  report  Duplicate-cluster stats and projected keep counts (default)
  apply   Set keep=y on winners + singletons; keep=n on losers and Drop A
  audit   Validate keep column after apply

Options:
  --verbose   List all duplicate clusters (report mode)
  --group     Filter report or scoped apply to one group
  --dry-run   Apply without writing lexicon.csv`);
}

function main(): void {
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  const { headers, rows } = loadLexicon();

  if (command === "report") {
    printReport(rows);
    return;
  }

  if (command === "apply") {
    runApply(rows);
    if (!dryRun) {
      writeLexicon(headers, rows);
      console.log("Wrote lexicon.csv");
    } else {
      console.log("DRY RUN — no writes");
    }
    return;
  }

  if (command === "audit") {
    runAudit(rows);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exit(1);
}

main();
