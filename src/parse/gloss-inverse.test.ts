import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { buildGlossIndex, glossToEgabon } from "./gloss-inverse.js";
import { loadDefaultTables } from "./index.js";
import { morphGlossLine } from "./morph-gloss.js";

const tables = loadDefaultTables();

function docLines(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docLines(path, into);
    else if (path.endsWith(".md")) {
      for (const pair of extractMorphPairs(readFileSync(path, "utf8"))) into.push(pair.egabon);
    }
  }
  return into;
}

/** Whitespace-only differences (incl. padding inside written brackets) and a final period are not distinct forms. */
function canonical(egabon: string): string {
  return egabon
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([[({<]) /g, "$1")
    .replace(/ ([\])}>])/g, "$1")
    .replace(/\.$/, "");
}

const lines = [...new Set(docLines("docs/grammar"))];
const index = buildGlossIndex(tables, lines);

function roundTrip(egabon: string): string {
  return glossToEgabon(morphGlossLine(egabon, tables), tables, index);
}

describe("glossToEgabon", () => {
  it("rebuilds each spec example exactly", () => {
    for (const egabon of [
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
      assert.equal(canonical(roundTrip(egabon)), canonical(egabon), egabon);
    }
  });

  it("round-trips every morph-glossed example in docs/grammar", () => {
    const failures: string[] = [];
    for (const egabon of lines) {
      let gloss: string;
      try {
        gloss = morphGlossLine(egabon, tables);
      } catch {
        continue; // Unknown words are reported by lint:egabon, not here.
      }
      try {
        const back = glossToEgabon(gloss, tables, index);
        if (canonical(back) !== canonical(egabon)) failures.push(`${egabon} → ${gloss} → ${back}`);
      } catch (error) {
        failures.push(`${egabon} → ${gloss} → ${(error as Error).message}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("rejects a gloss no Egabon line produces", () => {
    assert.throws(() => glossToEgabon("z-dog | v-not-a-real-sense", tables, index));
  });
});
