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
  const before = tailMetrics(live.map((row) => ({ root: row.root, kind: kindOf.get(tailKey(row)) ?? "" })));
  const after = tailMetrics(tails);
  const line = (label: string, a: string, b: string) => console.log(`  ${label.padEnd(52)}${a.padStart(8)}${b.padStart(8)}`);
  console.log(`lexicon-tails.csv: ${tails.length} roots placed`);
  console.log("");
  line("", "live", "tails");
  const echoed = (rows: { concrete: string; root: string }[]) => {
    const scored = rows.filter((row) => firstConsonant(pron.get(row.concrete) ?? ""));
    return pct(scored.filter((row) => row.root[1] === firstConsonant(pron.get(row.concrete)!)).length, scored.length);
  };
  line("first consonant is the label's first consonant", echoed(live), echoed(tails));
  line("confusing pairs (same kind, same first two letters)", String(before.confusing), String(after.confusing));

  console.log("");
  console.log("confusing pairs per kind (floor: rows spread evenly over the 48 first-two-letter prefixes):");
  console.log(`  ${"".padEnd(12)}${["rows", "live", "tails", "floor"].map((h) => h.padStart(8)).join("")}`);
  for (const kind of Object.keys(KIND_LETTERS) as Kind[]) {
    const rows = after.byKind.get(kind)?.rows ?? 0;
    const cells = [rows, before.byKind.get(kind)?.pairs ?? 0, after.byKind.get(kind)?.pairs ?? 0, evenSpreadPairs(rows)];
    console.log(`  ${`${kind} ${KIND_LETTERS[kind]}`.padEnd(12)}${cells.map((c) => String(c).padStart(8)).join("")}`);
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
