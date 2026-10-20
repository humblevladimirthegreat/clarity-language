/**
 * `npm run convert-word -- --tails`: place every row of data/lexicon-tails.csv by root tails
 * (proposal `root-tails.md`, phase 1), write only its `root` column, and print the report.
 * Nothing else is read for writing: the live lexicon, compounds, overlays and docs stay as they are.
 */
import { readFileSync, writeFileSync } from "node:fs";

import { CLOSED } from "../../src/closed-roots.js";
import { loadPron } from "../../src/echo-metric.js";
import { parseCompoundCsv } from "../../src/lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv } from "../../src/lexicon-search.js";
import { dataPath } from "../../src/repo-paths.js";
import { firstConsonant, placeTailRoots, tailCompounds, type TailPlaceRow } from "../../src/root-tails-place.js";
import {
  evenSpreadPairs,
  holderHostForms,
  KIND_LETTERS,
  parseTailsCsv,
  serializeTailsCsv,
  tailKey,
  tailMetrics,
  validateTails,
  type Kind,
  type Shape,
  type TailRow,
} from "../../src/root-tails.js";

const tailsPath = dataPath("lexicon-tails.csv");

function pct(count: number, total: number): string {
  return `${total === 0 ? "0.0" : ((100 * count) / total).toFixed(1)}%`;
}

export async function convertTails(options: { steps?: number } = {}): Promise<void> {
  const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
  const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
  const tails = parseTailsCsv(readFileSync(tailsPath, "utf8"));
  const holderHosts = holderHostForms(parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8")));

  const structural = validateTails(tails.map((row) => ({ ...row, root: "" })), published, compounds, holderHosts);
  if (structural.length > 0) {
    throw new Error(`lexicon-tails.csv:\n${structural.map((e) => `  ${e.key}: ${e.reason}`).join("\n")}`);
  }

  const byKey = new Map(published.map((row) => [tailKey(row), row]));
  const shortRoots = new Set(published.map((row) => row.root).filter((root) => root.length === 3));
  let pron = new Map<string, string>();
  try {
    pron = loadPron();
  } catch {
    // no pronunciation cache: every row loses only the echo tie-break
  }
  const rows: TailPlaceRow[] = tails.map((row) => ({
    kind: row.kind as Kind,
    shape: row.shape as Shape | "",
    cmu: pron.get(row.concrete) ?? "",
  }));
  const rowOfRoot = new Map(tails.map((row, index) => [byKey.get(tailKey(row))!.root, index]));
  const placement = placeTailRoots({
    rows,
    shortRoots,
    holderHosts,
    compounds: tailCompounds(compounds, rowOfRoot, shortRoots),
    steps: options.steps,
  });
  const next: TailRow[] = tails.map((row, index) => ({ ...row, root: placement.roots[index]! }));
  writeFileSync(tailsPath, serializeTailsCsv(next));

  const checks = [
    ...placement.unmet,
    ...validateTails(next, published, compounds, holderHosts).map((e) => `${e.key}: ${e.reason}`),
  ];
  printReport(next, published, checks, pron);
}

function printReport(tails: TailRow[], published: ReturnType<typeof parsePublishedCsv>, checks: string[], pron: Map<string, string>): void {
  const live = published.filter((row) => row.root.length === 5);
  // Live roots are counted with the kind their row has here, so both columns use the same pairs.
  const kindOf = new Map(tails.map((row) => [tailKey(row), row.kind]));
  const metricRows = (rows: { concrete: string; root: string }[]) =>
    rows.map((row) => ({ root: row.root, kind: kindOf.get(tailKey(row)) ?? "", concrete: row.concrete }));
  const before = tailMetrics(metricRows(live));
  const after = tailMetrics(metricRows(tails));
  // Rate: confusing pairs among the same-kind pairs that could share a prefix. Flags and other
  // rows have different bases (one crowded kind vs eleven smaller ones).
  const share = (count: number, possible: number) => (possible === 0 ? String(count) : `${count} (${pct(count, possible)})`);
  const line = (label: string, a: string, b: string) => console.log(`  ${label.padEnd(52)}${a.padStart(16)}${b.padStart(16)}`);
  console.log(`lexicon-tails.csv: ${tails.length} roots placed`);
  console.log("");
  line("", "live", "tails");
  const echoed = (rows: { concrete: string; root: string }[]) => {
    const scored = rows.filter((row) => firstConsonant(pron.get(row.concrete) ?? ""));
    return pct(scored.filter((row) => row.root[1] === firstConsonant(pron.get(row.concrete)!)).length, scored.length);
  };
  line("first consonant is the label's first consonant", echoed(live), echoed(tails));
  line("confusing pairs / same-kind pairs", share(before.confusing, before.possible), share(after.confusing, after.possible));
  line("  flags", share(before.flag, before.flagPossible), share(after.flag, after.flagPossible));
  line("  excluding flags", share(before.nonFlag, before.nonFlagPossible), share(after.nonFlag, after.nonFlagPossible));
  if (before.mixed > 0 || after.mixed > 0) {
    line("  mixed flag / other same-kind", share(before.mixed, before.mixedPossible), share(after.mixed, after.mixedPossible));
  }

  console.log("");
  console.log("confusing pairs per kind (floor: rows spread evenly over the 48 first-two-letter prefixes):");
  const pairPad = 16;
  console.log(`  ${"".padEnd(12)}${["rows", "live", "tails", "floor"].map((h) => h.padStart(h === "live" || h === "tails" ? pairPad : 8)).join("")}`);
  for (const kind of Object.keys(KIND_LETTERS) as Kind[]) {
    const rows = after.byKind.get(kind)?.rows ?? 0;
    const possible = after.byKind.get(kind)?.possible ?? 0;
    const livePairs = before.byKind.get(kind)?.pairs ?? 0;
    const tailsPairs = after.byKind.get(kind)?.pairs ?? 0;
    console.log(
      `  ${`${kind} ${KIND_LETTERS[kind]}`.padEnd(12)}${String(rows).padStart(8)}${share(livePairs, possible).padStart(pairPad)}${share(tailsPairs, possible).padStart(pairPad)}${String(evenSpreadPairs(rows)).padStart(8)}`,
    );
  }

  console.log("");
  console.log(checks.length === 0 ? "checks: all met" : `checks not met (${checks.length}):`);
  for (const check of checks) console.log(`  ${check}`);

  console.log("");
  const rootOf = (emoji: string) => {
    const row = tails.find((t) => t.emoji === emoji);
    const live = published.find((p) => p.emoji === emoji)?.root ?? "";
    return { live, tails: row?.root ?? "" };
  };
  const glasses = rootOf("👓");
  console.log(`👓 glasses: ${glasses.live} -> ${glasses.tails}`);
  const cast = (["swan", "lion", "hibiscus"] as const).map((name) => {
    const emoji = published.find((p) => p.root === CLOSED[name])?.emoji ?? "";
    return { name, root: rootOf(emoji).tails };
  });
  const onsets = new Set(cast.map((c) => c.root.slice(0, 3)));
  console.log(`house cast: ${cast.map((c) => `${c.name} ${c.root}`).join(", ")}${onsets.size === cast.length ? "" : "  (onsets not all different)"}`);
}
