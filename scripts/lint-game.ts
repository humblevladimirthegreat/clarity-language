/**
 * Content lint for the wizard sandbox (src/game/lint.ts): authored lines spell, parse one way, use lexicon
 * roots and no grammar past their quest's area; quests have no dead ends; named rows exist.
 */
import { buildGateData } from "../src/game/build.js";
import { lintGame } from "../src/game/lint.js";
import { loadDefaultTables } from "../src/parse/index.js";

const tables = loadDefaultTables();
const findings = lintGame(tables, buildGateData(tables));
for (const finding of findings) console.error(`src/game/${finding.where}  ${finding.detail}`);
if (findings.length) {
  console.error(`\n${findings.length} game content finding(s).`);
  process.exitCode = 1;
} else {
  console.log("OK: game content spells, parses, and stays within each quest's area.");
}
