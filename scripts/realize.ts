/**
 * Probes for realizer work (docs/meta/realizer.md#probes): one text's round trip, or one gloss spelled.
 *
 *   view TEXT …   each text read as one turn: the parser's own morph gloss, each reading's meaning view (one JSON line per
 *                 reading), what the realizer writes for it (gloss and spelling, or its gap), and the trip's verdict with
 *                 its key, path and detail, as the round trip would judge it
 *   spell GLOSS … each morph gloss spelled as the realizer spells it (`spellGloss`): the Ageben line, or the
 *                 `noSpell` / `noParse` gap with its detail
 *
 * Run: npm run realize -- view 'zazozon gadamul.' 'herulor.'
 *      npm run realize -- spell 'g-episode-agent-authorship-able' 'bl-role-agent-learn-x'
 */
import { morphGlossLine } from "../src/parse/morph-gloss.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { project } from "../src/realize/meaning.js";
import { realize, spellGloss } from "../src/realize/realize.js";
import { readTurn } from "../src/round-trip/corpus.js";
import { tripEntry } from "../src/round-trip/round-trip.js";

const USAGE = "Usage: npm run realize -- view TEXT … | spell GLOSS …";
const [mode, ...items] = process.argv.slice(2);
if ((mode !== "view" && mode !== "spell") || items.length === 0) {
  console.error(USAGE);
  process.exit(1);
}
const tables = loadDefaultTables();

if (mode === "spell") {
  for (const gloss of items) {
    const out = spellGloss(gloss, "probe", tables);
    console.log("gap" in out ? `${gloss}\n  gap:${out.gap.kind} ${out.gap.detail}` : `${gloss}\n  → ${out.ageben}`);
  }
  process.exit(0);
}

for (const text of items) {
  console.log(`== ${text}`);
  try {
    console.log(`  parsed gloss: ${morphGlossLine(text, tables)}`);
  } catch (error) {
    console.log(`  parsed gloss: (none: ${(error as Error).message.split("\n")[0]})`);
  }
  let readings;
  try {
    readings = readTurn(text, tables);
  } catch (error) {
    console.log(`  does not read: ${(error as Error).message}`);
    continue;
  }
  const meanings = project(readings, tables);
  meanings.forEach((view, i) => {
    console.log(`  view ${i}: ${JSON.stringify(view)}`);
    const out = realize(view, tables);
    console.log("gap" in out ? `  realized ${i}: gap:${out.gap.kind} ${out.gap.key}: ${out.gap.detail}` : `  realized ${i}: ${out.gloss} → ${out.ageben}`);
  });
  const trip = tripEntry({ ageben: text, source: "probe", readings, meanings }, tables);
  const extra = [trip.path && `path ${trip.path}`, trip.detail && `detail ${trip.detail}`].filter(Boolean).join("; ");
  console.log(`  trip: ${trip.verdict} ${trip.key}${extra ? ` (${extra})` : ""}`);
}
