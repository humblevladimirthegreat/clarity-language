/**
 * Probes for realizer work (docs/meta/realizer.md#probes): one text's round trip, or one gloss spelled.
 *
 *   view TEXT …   each text read as one turn: the parser's own morph gloss, each reading's meaning view (one JSON line per
 *                 reading), what the realizer writes for it (gloss and spelling, or its gap), and the trip's verdict with
 *                 its key, path and detail, as the round trip would judge it
 *   view --key KEY [--has TEXT]
 *                 the same for every text behind a round-trip key (as `npm run round-trip -- --texts KEY` lists them);
 *                 with --has, only the readings whose meaning-view JSON contains TEXT, and only texts with one. Prints a
 *                 count line and the first 10 texts, clipped; saves all to tmp/logs/realize-view.txt
 *   spell GLOSS … each morph gloss spelled as the realizer spells it (`spellGloss`): the Ageben line, or the
 *                 `noSpell` / `noParse` gap with its detail
 *
 * Run: npm run realize -- view 'zazozon gadamul.' 'herulor.'
 *      npm run realize -- view --key edge:polar --has '"blank"'
 *      npm run realize -- spell 'g-episode-agent-authorship-able' 'bl-role-agent-learn-x'
 */
import { morphGlossLine } from "../src/parse/morph-gloss.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { project } from "../src/realize/meaning.js";
import { realize, spellGloss } from "../src/realize/realize.js";
import { readTurn } from "../src/round-trip/corpus.js";
import { roundTrip, tripEntry } from "../src/round-trip/round-trip.js";
import { tripTexts } from "./lib/sweep.ts";
import { shortLines, writeLog } from "./lib/trip-triage.ts";

const USAGE = "Usage: npm run realize -- view TEXT … | view --key KEY [--has TEXT] | spell GLOSS …";
const [mode, ...items] = process.argv.slice(2);
const usage = (): never => {
  console.error(USAGE);
  process.exit(1);
};
if ((mode !== "view" && mode !== "spell") || items.length === 0) usage();
const byKey = mode === "view" && items[0] === "--key";
if (byKey && !((items.length === 2 && items[1]) || (items.length === 4 && items[2] === "--has" && items[3]))) usage();
const tables = loadDefaultTables();

if (mode === "spell") {
  for (const gloss of items) {
    const out = spellGloss(gloss, "probe", tables);
    console.log("gap" in out ? `${gloss}\n  gap:${out.gap.kind} ${out.gap.detail}` : `${gloss}\n  → ${out.ageben}`);
  }
  process.exit(0);
}

if (byKey) {
  const [, key, , has] = items as [string, string, string?, string?];
  const texts = [...new Set(tripTexts(roundTrip(tables), [key]).map((row) => row.text))];
  const blocks = texts.map((text) => viewLines(text, has)).filter((lines) => lines.length);
  const file = writeLog("realize-view.txt", blocks.flat());
  console.log(blocks.slice(0, 10).map((lines) => shortLines(lines, Infinity)).join("\n"));
  const kept = has ? `, ${blocks.length} with a reading whose view has ${has}` : "";
  console.log(`\n${texts.length} text(s) for ${key}${kept}; ${Math.min(10, blocks.length)} shown, all in ${file}`);
} else {
  for (const text of items) console.log(viewLines(text).join("\n"));
}

/**
 * One text read as one turn: its morph gloss, each reading's meaning view and realization, and the trip. With `has`, only
 * the readings whose view JSON contains it, and no lines at all when none does.
 */
function viewLines(text: string, has?: string): string[] {
  const lines = [`== ${text}`];
  try {
    lines.push(`  parsed gloss: ${morphGlossLine(text, tables)}`);
  } catch (error) {
    lines.push(`  parsed gloss: (none: ${(error as Error).message.split("\n")[0]})`);
  }
  let readings;
  try {
    readings = readTurn(text, tables);
  } catch (error) {
    return has ? [] : [...lines, `  does not read: ${(error as Error).message}`];
  }
  const meanings = project(readings, tables);
  let kept = 0;
  meanings.forEach((view, i) => {
    const json = JSON.stringify(view);
    if (has && !json.includes(has)) return;
    kept++;
    lines.push(`  view ${i}: ${json}`);
    const out = realize(view, tables);
    lines.push("gap" in out ? `  realized ${i}: gap:${out.gap.kind} ${out.gap.key}: ${out.gap.detail}` : `  realized ${i}: ${out.gloss} → ${out.ageben}`);
  });
  if (has && !kept) return [];
  const trip = tripEntry({ ageben: text, source: "probe", readings, meanings }, tables);
  const extra = [trip.path && `path ${trip.path}`, trip.detail && `detail ${trip.detail}`].filter(Boolean).join("; ");
  lines.push(`  trip: ${trip.verdict} ${trip.key}${extra ? ` (${extra})` : ""}`);
  return lines;
}
