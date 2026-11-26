/**
 * The round trip (docs/meta/realizer.md#round-trip): every doc example read, realized and read again
 * (src/round-trip/round-trip.ts), printed as counts by verdict and by the key each trip is filed under: the key of its
 * first gap or difference, the one triage starts from.
 *
 * Options: --save  write the counts to tmp/state/round-trip.json
 *          --diff  print only the counts that changed since the save (with --save, then save the new counts)
 *          --ratchet  instead of counts, the ratchet's counts as JSON (`ratchetOf`: `ok`, and the failed trips under the
 *                  key of every part of every reading)
 *          --lower  lower src/round-trip/round-trip-ratchet.json to the current counts: `ok` only rises, each stored
 *                  key only falls, no key is added; prints each change, and any key that rose or is new (the ratchet
 *                  test fails on a new key)
 *          --texts KEY …  instead of counts, the examples behind each key: a verdict (`gap:noRule`, `skipped:unread`),
 *                  a key (`claim`, `edge:force`), or a type that heads keys (`edge`); each text with its count and file
 *          --detail KEY …  as --texts, but each trip in full: verdict, key, file, text, realized gloss and spelling,
 *                  path and detail. Prints the first 20 (`--limit N` for more; `--per-key N` for at most N from each key)
 *                  and saves all to tmp/logs/round-trip-detail.txt
 *          --tally KEY …  per key, its trip count, then each reason in the trips' detail lines (`tripReason`: the text
 *                  after the key or gloss, the gloss as `…`) with its count and one sample text with its file:line, the
 *                  commonest first; where triage of a key starts. Prints the top reasons, saves all to tmp/logs/round-trip-tally.txt
 *          --all-gaps  every gap of every trip, not just the first (`allTripGaps`): prints counts by gap kind, by each
 *                  gap's own key (not nested, nested, trips, distinct details) and the commonest noSpell words; saves one
 *                  line per gap to tmp/logs/round-trip-gaps.txt (with --json, the key table to tmp/state/round-trip-gaps.json)
 *
 * Run: npm run round-trip
 *      npm run round-trip -- --save
 *      npm run round-trip -- --diff
 *      npm run round-trip -- --lower
 *      npm run round-trip -- --texts claim edge
 *      npm run round-trip -- --detail gap:noSpell edge:force --limit 40
 *      npm run round-trip -- --detail edge:force unit:linker --per-key 1
 *      npm run round-trip -- --tally edge:force lexReading:restrictor
 *      npm run round-trip -- --all-gaps [--json]
 * One text or one gloss: npm run realize -- view TEXT … | view --key KEY [--has TEXT] | spell GLOSS …
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readSnapshot, writeSnapshot } from "../src/interpret/accounting-walk.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { allTripGaps, gapRows, ratchetOf, roundTrip, type Ratchet, type Trip, type TripGaps } from "../src/round-trip/round-trip.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { clip } from "./lib/build-output.ts";
import { countTrips, diffTrips, formatDiff, formatTexts, formatTrips, tripTexts, type TripCounts } from "./lib/sweep.ts";
import { formatTally, pickTrips, shortLines, tallyTrips, writeLog } from "./lib/trip-triage.ts";

const SAVE = "round-trip.json";
const RATCHET = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "round-trip", "round-trip-ratchet.json");
const USAGE = "Usage: npm run round-trip -- [--save] [--diff] | --ratchet | --lower | --texts KEY … | --detail KEY … [--limit N] [--per-key N] | --tally KEY … | --all-gaps [--json]";

const fail = (message: string): never => {
  console.error(`${message} ${USAGE}`);
  process.exit(1);
};

const argv = process.argv.slice(2);
const listFlag = argv.find((a) => a === "--texts" || a === "--detail" || a === "--tally");
const at = listFlag ? argv.indexOf(listFlag) : -1;
let listKeys = at >= 0 ? argv.slice(at + 1) : [];
/** Take `--NAME N` (detail only) out of the key list: its positive whole number, or undefined when absent. */
const countFlag = (name: string): number | undefined => {
  const i = listKeys.indexOf(name);
  if (i < 0) return undefined;
  if (listFlag !== "--detail") fail(`${name} goes with --detail.`);
  const n = Number(listKeys[i + 1]);
  if (!Number.isInteger(n) || n < 1) fail(`${name} takes a positive whole number.`);
  listKeys = [...listKeys.slice(0, i), ...listKeys.slice(i + 2)];
  return n;
};
const limit = countFlag("--limit");
const perKey = countFlag("--per-key");
const args = at >= 0 ? argv.slice(0, at) : argv;
const bad = args.filter((a) => !["--save", "--diff", "--ratchet", "--lower", "--all-gaps", "--json"].includes(a));
if (bad.length) fail(`Unknown argument ${bad[0]}.`);
if (listFlag && (!listKeys.length || args.length)) fail(`${listFlag} takes one or more keys and no other flag.`);
const ratchet = args.includes("--ratchet");
const lower = args.includes("--lower");
if ((ratchet || lower) && args.length > 1) fail(`${ratchet ? "--ratchet" : "--lower"} takes no other flag.`);

const gapsMode = args.includes("--all-gaps");
if (gapsMode && args.some((a) => a !== "--all-gaps" && a !== "--json")) fail("--all-gaps takes only --json.");
if (args.includes("--json") && !gapsMode) fail("--json goes with --all-gaps.");

const started = Date.now();
if (gapsMode) {
  printGaps(allTripGaps(loadDefaultTables()), args.includes("--json"));
  console.log(`\n${((Date.now() - started) / 1000).toFixed(1)} s`);
  process.exit(0);
}
const trips = roundTrip(loadDefaultTables());

if (listFlag === "--texts") {
  console.log(formatTexts(tripTexts(trips, listKeys), listKeys, { counted: "trips", none: "trip" }).join("\n"));
  process.exit(0);
}
if (listFlag === "--detail") {
  printDetail(trips, listKeys, limit ?? (perKey ? Infinity : 20), perKey);
  process.exit(0);
}
if (listFlag === "--tally") {
  const tallies = tallyTrips(trips, listKeys);
  const top = formatTally(tallies, 8);
  const file = writeLog("round-trip-tally.txt", formatTally(tallies));
  console.log(shortLines(top, top.length));
  console.log(`\n${tallies.reduce((n, t) => n + t.reasons.length, 0)} reason(s) for ${listKeys.join(", ")}; up to 8 per key shown, all in ${file}`);
  process.exit(0);
}
if (ratchet) {
  console.log(JSON.stringify(ratchetOf(trips), null, 2));
  process.exit(0);
}
if (lower) {
  lowerRatchet(ratchetOf(trips));
  process.exit(0);
}

const save = args.includes("--save");
const diff = args.includes("--diff");
const before = diff ? readSnapshot<TripCounts>(SAVE) : undefined;
if (diff && !before) {
  console.error(`No saved counts at ${tmpRel("state", SAVE)}; run npm run round-trip -- --save first.`);
  process.exit(1);
}

const counts = countTrips(trips);
console.log((before ? formatDiff(diffTrips(before, counts)) : formatTrips(counts)).join("\n"));
console.log(`\n${((Date.now() - started) / 1000).toFixed(1)} s`);
if (save) console.log(`Saved to ${writeSnapshot(SAVE, counts)}`);

/** Each matching trip in full; the first `max` on stdout (with `perKey`, at most that many from each key), all in a log file. */
function printDetail(all: readonly Trip[], keys: readonly string[], max: number, perKey?: number): void {
  const hits = pickTrips(all, keys);
  const blocks = hits.map((t) =>
    [
      `${t.verdict} ${t.key}  ${t.source}`,
      `  text:     ${t.ageben}`,
      ...(t.gloss ? [`  gloss:    ${t.gloss}`] : []),
      ...(t.realized ? [`  realized: ${t.realized}`] : []),
      ...(t.path ? [`  path:     ${t.path}`] : []),
      ...(t.detail ? [`  detail:   ${t.detail}`] : []),
    ].join("\n"),
  );
  const file = writeLog("round-trip-detail.txt", blocks.join("\n\n").split("\n"));
  const shown = new Set(pickTrips(hits, keys, perKey).slice(0, max));
  const out = blocks.filter((_, i) => shown.has(hits[i]!));
  console.log(out.map((b) => shortLines(b.split("\n"), Infinity)).join("\n\n"));
  console.log(`\n${hits.length} trip(s) for ${keys.join(", ")}; ${out.length} shown${perKey ? ` (at most ${perKey} per key)` : ""}, all in ${file}`);
}

/** Lower the stored ratchet to `now`: `ok` only rises, stored keys only fall, no key is added. */
function lowerRatchet(now: Ratchet): void {
  const stored = JSON.parse(readFileSync(RATCHET, "utf8")) as Ratchet;
  const changes: string[] = [];
  const rose: string[] = [];
  const ok = Math.max(stored.ok, now.ok);
  if (ok !== stored.ok) changes.push(`ok ${stored.ok} → ${ok}`);
  if (now.ok < stored.ok) rose.push(`ok fell ${stored.ok} → ${now.ok}`);
  const keys: Record<string, number> = {};
  for (const [key, was] of Object.entries(stored.keys)) {
    const count = now.keys[key] ?? 0;
    keys[key] = Math.min(was, count);
    if (count < was) changes.push(`${key} ${was} → ${count}`);
    if (count > was) rose.push(`${key} rose ${was} → ${count}`);
  }
  for (const key of Object.keys(now.keys)) if (!(key in stored.keys)) rose.push(`${key} new (${now.keys[key]}): the ratchet test fails on it`);
  writeFileSync(RATCHET, `${JSON.stringify({ ...stored, ok, keys }, null, 2)}\n`);
  console.log(changes.length ? `Lowered ${changes.length}: ${changes.join(", ")}` : "Nothing to lower.");
  if (rose.length) console.log(`Not lowered (worse than stored): ${rose.join(", ")}`);
}

/** The `--all-gaps` summary on stdout; one line per gap in a log, and with `json` the key table in tmp/state. */
function printGaps(all: readonly TripGaps[], json: boolean): void {
  const gaps = all.flatMap((trip) => trip.gaps.map((gap) => ({ ...gap, trip })));
  const top = (gap: { nested: boolean }): boolean => !gap.nested;
  const lines = gaps.map((g) => `${g.key}  ${g.kind}  ${g.nested ? "nested" : "-"}  ${g.detail}  ‖ ${clip(`${g.trip.source} ${g.trip.ageben}`)}`);
  const file = writeLog("round-trip-gaps.txt", lines);
  const kinds = new Map<string, [number, number]>();
  for (const g of gaps) {
    const n = kinds.get(g.kind) ?? kinds.set(g.kind, [0, 0]).get(g.kind)!;
    n[g.nested ? 1 : 0]++;
  }
  const rows = gapRows(all);
  const words = new Map<string, number>();
  for (const g of gaps) if (g.kind === "noSpell" && !g.detail.includes(": ")) words.set(g.detail.replace(/_[\d,]+/g, "_N"), (words.get(g.detail.replace(/_[\d,]+/g, "_N")) ?? 0) + 1);
  const pad = (n: number): string => String(n).padStart(6);
  console.log(
    [
      `trips judged: ${all.length}, with at least one gap: ${all.filter((t) => t.gaps.length).length}`,
      `gaps: ${gaps.length}, not nested: ${gaps.filter(top).length}`,
      "",
      "by kind (not nested, nested):",
      ...[...kinds].sort((a, b) => b[1][0] - a[1][0]).map(([kind, [n, m]]) => `${pad(n)}${pad(m)}  ${kind}`),
      "",
      `by key, top 40 of ${rows.length} (not nested, nested, trips, details):`,
      ...rows.slice(0, 40).map((r) => `${pad(r.gaps)}${pad(r.nested)}${pad(r.trips)}${pad(r.details)}  ${r.key}`),
      "",
      `noSpell words, top 30 of ${words.size} (digits as _N):`,
      ...[...words].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30).map(([word, n]) => `${pad(n)}  ${word}`),
      "",
      `One line per gap in ${file}`,
    ].join("\n"),
  );
  if (!json) return;
  const out = tmpPath("state", "round-trip-gaps.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`Key table saved to ${tmpRel("state", "round-trip-gaps.json")}`);
}
