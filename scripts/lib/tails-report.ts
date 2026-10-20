/**
 * Root-tails report for `convert-word --lexicon` and `--report`: the share of five-letter roots that start
 * with the English label's first consonant, confusing pairs (same kind, same first two letters) in total
 * and per kind beside the even-spread floor, and the 👓 root the language name comes from.
 */
import { isFlagLabel } from "../../src/flag-label.js";
import type { PublishedRow } from "../../src/lexicon-search.js";
import { firstConsonant } from "../../src/root-tails-place.js";
import { evenSpreadPairs, KIND_LETTERS, tailMetrics, type Kind } from "../../src/root-tails.js";

function pct(count: number, total: number): string {
  return `${total === 0 ? "0.0" : ((100 * count) / total).toFixed(1)}%`;
}

export function printTailsReport(published: readonly PublishedRow[], pron: Map<string, string>): void {
  const long = published.filter((row) => row.root.length === 5);
  const metrics = tailMetrics(long.map((row) => ({ root: row.root, kind: row.kind ?? "", concrete: row.concrete })));
  // Rate: confusing pairs among the same-kind pairs that could share a prefix. Flags and other
  // rows have different bases (one crowded kind vs eleven smaller ones).
  const share = (count: number, possible: number) => (possible === 0 ? String(count) : `${count} (${pct(count, possible)})`);
  const line = (label: string, value: string) => console.log(`  ${label.padEnd(52)}${value.padStart(16)}`);

  // Flags are left out of the first-consonant share.
  const scored = long.filter((row) => !isFlagLabel(row.concrete) && firstConsonant(pron.get(row.concrete) ?? ""));
  const echoed = scored.filter((row) => row.root[1] === firstConsonant(pron.get(row.concrete)!)).length;
  console.log("");
  line("first consonant is the label's (excluding flags)", pct(echoed, scored.length));
  line("confusing pairs / same-kind pairs", share(metrics.confusing, metrics.possible));
  line("  flags", share(metrics.flag, metrics.flagPossible));
  line("  excluding flags", share(metrics.nonFlag, metrics.nonFlagPossible));
  if (metrics.mixed > 0) line("  mixed flag / other same-kind", share(metrics.mixed, metrics.mixedPossible));

  console.log("");
  console.log("confusing pairs per kind (floor: rows spread evenly over the 48 first-two-letter prefixes):");
  console.log(`  ${"".padEnd(12)}${"rows".padStart(8)}${"pairs".padStart(16)}${"floor".padStart(8)}`);
  for (const kind of Object.keys(KIND_LETTERS) as Kind[]) {
    const entry = metrics.byKind.get(kind) ?? { rows: 0, pairs: 0, possible: 0 };
    console.log(
      `  ${`${kind} ${KIND_LETTERS[kind]}`.padEnd(12)}${String(entry.rows).padStart(8)}${share(entry.pairs, entry.possible).padStart(16)}${String(evenSpreadPairs(entry.rows)).padStart(8)}`,
    );
  }

  console.log("");
  const rootOf = (emoji: string) => published.find((row) => row.emoji === emoji)?.root ?? "";
  console.log(`👓 glasses: ${rootOf("👓")} (language name ${rootOf("👓")}n)`);
  // Read from the rows, not src/closed-roots.ts, which a --lexicon run rewrites after it imports it.
  console.log(`house cast: swan ${rootOf("🦢")}, lion ${rootOf("🦁")}, hibiscus ${rootOf("🌺")}`);
}
