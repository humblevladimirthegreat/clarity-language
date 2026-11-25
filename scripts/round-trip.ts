/**
 * The round trip (docs/meta/realizer.md#round-trip): every doc example read, realized and read again
 * (src/round-trip/round-trip.ts), printed as counts by verdict and by the key each trip is filed under.
 *
 * Options: --save  write the counts to tmp/state/round-trip.json
 *          --diff  print only the counts that changed since the save (with --save, then save the new counts)
 *          --texts KEY …  instead of counts, the examples behind each key: a verdict (`gap:noRule`, `skipped:unread`),
 *                  a key (`claim`, `edge:force`), or a type that heads keys (`edge`); each text with its count and file
 *
 * Run: npm run round-trip
 *      npm run round-trip -- --save
 *      npm run round-trip -- --diff
 *      npm run round-trip -- --texts claim edge
 */
import { readSnapshot, writeSnapshot } from "../src/interpret/accounting-walk.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { roundTrip } from "../src/round-trip/round-trip.js";
import { tmpRel } from "../src/tmp-paths.js";
import { countTrips, diffTrips, formatDiff, formatTexts, formatTrips, tripTexts, type TripCounts } from "./lib/sweep.ts";

const SAVE = "round-trip.json";
const USAGE = "Usage: npm run round-trip -- [--save] [--diff] | --texts KEY …";

const argv = process.argv.slice(2);
const at = argv.indexOf("--texts");
const textKeys = at >= 0 ? argv.slice(at + 1) : [];
const args = at >= 0 ? argv.slice(0, at) : argv;
const bad = args.filter((a) => a !== "--save" && a !== "--diff");
if (bad.length || (at >= 0 && (!textKeys.length || args.length))) {
  console.error(bad.length ? `Unknown argument ${bad[0]}. ${USAGE}` : `--texts takes one or more keys and no other flag. ${USAGE}`);
  process.exit(1);
}
const started = Date.now();
const trips = roundTrip(loadDefaultTables());
if (textKeys.length) {
  console.log(formatTexts(tripTexts(trips, textKeys), textKeys, { counted: "trips", none: "trip" }).join("\n"));
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
