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
 *                  path and detail. Prints the first 20 (`--limit N` for more) and saves all to tmp/logs/round-trip-detail.txt
 *
 * Run: npm run round-trip
 *      npm run round-trip -- --save
 *      npm run round-trip -- --diff
 *      npm run round-trip -- --lower
 *      npm run round-trip -- --texts claim edge
 *      npm run round-trip -- --detail gap:noSpell edge:force --limit 40
 * One text or one gloss: npm run realize -- view TEXT … | spell GLOSS …
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readSnapshot, writeSnapshot } from "../src/interpret/accounting-walk.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { ratchetOf, roundTrip, type Ratchet, type Trip } from "../src/round-trip/round-trip.js";
import { tmpPath, tmpRel } from "../src/tmp-paths.js";
import { clip } from "./lib/build-output.ts";
import { countTrips, diffTrips, formatDiff, formatTexts, formatTrips, tripTexts, type TripCounts } from "./lib/sweep.ts";

const SAVE = "round-trip.json";
const RATCHET = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "round-trip", "round-trip-ratchet.json");
const USAGE = "Usage: npm run round-trip -- [--save] [--diff] | --ratchet | --lower | --texts KEY … | --detail KEY … [--limit N]";

const fail = (message: string): never => {
  console.error(`${message} ${USAGE}`);
  process.exit(1);
};

const argv = process.argv.slice(2);
const listFlag = argv.find((a) => a === "--texts" || a === "--detail");
const at = listFlag ? argv.indexOf(listFlag) : -1;
let listKeys = at >= 0 ? argv.slice(at + 1) : [];
let limit = 20;
const limitAt = listKeys.indexOf("--limit");
if (limitAt >= 0) {
  if (listFlag !== "--detail") fail("--limit goes with --detail.");
  limit = Number(listKeys[limitAt + 1]);
  if (!Number.isInteger(limit) || limit < 1) fail("--limit takes a positive whole number.");
  listKeys = [...listKeys.slice(0, limitAt), ...listKeys.slice(limitAt + 2)];
}
const args = at >= 0 ? argv.slice(0, at) : argv;
const bad = args.filter((a) => !["--save", "--diff", "--ratchet", "--lower"].includes(a));
if (bad.length) fail(`Unknown argument ${bad[0]}.`);
if (listFlag && (!listKeys.length || args.length)) fail(`${listFlag} takes one or more keys and no other flag.`);
const ratchet = args.includes("--ratchet");
const lower = args.includes("--lower");
if ((ratchet || lower) && args.length > 1) fail(`${ratchet ? "--ratchet" : "--lower"} takes no other flag.`);

const started = Date.now();
const trips = roundTrip(loadDefaultTables());

if (listFlag === "--texts") {
  console.log(formatTexts(tripTexts(trips, listKeys), listKeys, { counted: "trips", none: "trip" }).join("\n"));
  process.exit(0);
}
if (listFlag === "--detail") {
  printDetail(trips, listKeys, limit);
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

/** Whether a key argument names a trip: its verdict, its key, or a type heading its key (`edge` names `edge:force`). */
function names(arg: string, trip: Trip): boolean {
  return trip.verdict === arg || trip.key === arg || trip.key.startsWith(`${arg}:`);
}

/** Each matching trip in full; the first `limit` on stdout, all in a log file. */
function printDetail(all: readonly Trip[], keys: readonly string[], max: number): void {
  const hits = all.filter((trip) => keys.some((k) => names(k, trip)));
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
  const file = tmpPath("logs", "round-trip-detail.txt");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${blocks.join("\n\n")}\n`);
  console.log(blocks.slice(0, max).map((b) => b.split("\n").map(clip).join("\n")).join("\n\n"));
  console.log(`\n${hits.length} trip(s) for ${keys.join(", ")}; ${Math.min(max, hits.length)} shown, all in ${tmpRel("logs", "round-trip-detail.txt")}`);
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
