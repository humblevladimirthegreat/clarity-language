import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { buildGlossIndex, glossToAgebon } from "./gloss-inverse.js";
import { loadDefaultTables } from "./index.js";
import { morphGlossLine } from "./morph-gloss.js";

const tables = loadDefaultTables();

function docLines(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docLines(path, into);
    else if (path.endsWith(".md")) {
      for (const pair of extractMorphPairs(readFileSync(path, "utf8"))) into.push(pair.agebon);
    }
  }
  return into;
}

/** Whitespace-only differences (incl. padding inside written brackets) and a final period are not distinct forms. */
function canonical(agebon: string): string {
  return agebon
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([[({<]) /g, "$1")
    .replace(/ ([\])}>])/g, "$1")
    .replace(/\.$/, "");
}

const lines = [...new Set(docLines("docs/grammar"))];
const index = buildGlossIndex(tables, lines);

function roundTrip(agebon: string): string {
  return glossToAgebon(morphGlossLine(agebon, tables), tables, index);
}

describe("glossToAgebon", () => {
  it("rebuilds each spec example exactly", () => {
    for (const agebon of [
      "dududal on dugudal.",
      "zudozol gugol buzozen gubulel.",
      "glugol buzozen zudozol gugol bolazun.",
      "zududal zugudal zol zerulal zal vewurel.",
      "zuzozen vuhuyel d[zuzozen vewurel].",
      "zuzozen vuhuyel d@[onuron olazun].",
      "zolazun duzozeln vawebol. zuzozer gelazom.",
      "zolazun d^@<iPhone> vawebol.",
      "zolazun d^@[onuron olazun] vawebol.",
      "zuhelan d~@[onuron olazun] vezuyol.",
      "zolazun d~^@<iPhone> vawebol.",
      "zududal zugudal zol { humum buzozen } vewurel.",
      "zuzozen vewurel. zuzozer vuhuyel.",
      "zuzozen vewurel. zaxar vuhuyel.",
      "zuzozen vawebol daxer.",
      "zuzozen dolazun vawebol. zuxorx varuvel.",
      "zuzozen d[amobam#|] vezuyel.",
      "glelel z<kimchi> gamezom.",
      "zagozolx grarel.",
      "zagozolx grarel.",
      "zamunx vewurel.",
      "zuzozen vuhuyel d[zuzozer vewurel]. dududal on dugudal.",
    ]) {
      assert.equal(canonical(roundTrip(agebon)), canonical(agebon), agebon);
    }
  });

  it("round-trips every morph-glossed example in docs/grammar", () => {
    const failures: string[] = [];
    for (const agebon of lines) {
      let gloss: string;
      try {
        gloss = morphGlossLine(agebon, tables);
      } catch {
        continue; // Unknown words are reported by lint:agebon, not here.
      }
      try {
        const back = glossToAgebon(gloss, tables, index);
        if (canonical(back) !== canonical(agebon)) failures.push(`${agebon} → ${gloss} → ${back}`);
      } catch (error) {
        failures.push(`${agebon} → ${gloss} → ${(error as Error).message}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("rejects a gloss no Agebon line produces", () => {
    assert.throws(() => glossToAgebon("z-dog | v-not-a-real-sense", tables, index));
  });
});
