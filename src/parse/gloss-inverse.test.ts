import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { buildGlossIndex, glossToAgazan } from "./gloss-inverse.js";
import { loadDefaultTables } from "./index.js";
import { morphGlossLine } from "./morph-gloss.js";

const tables = loadDefaultTables();

function docLines(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docLines(path, into);
    else if (path.endsWith(".md")) {
      for (const pair of extractMorphPairs(readFileSync(path, "utf8"))) into.push(pair.agazan);
    }
  }
  return into;
}

/** Whitespace-only differences (incl. padding inside written brackets) and a final period are not distinct forms. */
function canonical(agazan: string): string {
  return agazan
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([[({<]) /g, "$1")
    .replace(/ ([\])}>])/g, "$1")
    .replace(/\.$/, "");
}

const lines = [...new Set(docLines("docs/grammar"))];
const index = buildGlossIndex(tables, lines);

function roundTrip(agazan: string): string {
  return glossToAgazan(morphGlossLine(agazan, tables), tables, index);
}

describe("glossToAgazan", () => {
  it("rebuilds each spec example exactly", () => {
    for (const agazan of [
      "dedadal on dogadal.",
      "zodozol gugol buzazon gubulol.",
      "glugol buzazon zodozol gugol bolozun.",
      "zedadal zogadal zol zurelal zal voworel.",
      "zuzazon vahayel d[zuzazon voworel].",
      "zuzazon vahayel d@[onoron olozun].",
      "zolozun duzazoln vanobol. zuzazor geluzom.",
      "zolozun d^@<iPhone> vanobol.",
      "zolozun d^@[onoron olozun] vanobol.",
      "zehalon d~@[onoron olozun] vezeyol.",
      "zolozun d~^@<iPhone> vanobol.",
      "zedadal zogadal zol { humum buzazon } voworel.",
      "zuzazon voworel. zuzazor vahayel.",
      "zuzazon voworel. zaxar vahayel.",
      "zuzazon vanobol daxer.",
      "zuzazon dolozun vanobol. zuxorx varuvel.",
      "zuzazon d[ayubam#|] vezeyel.",
      "glelel z<odozo> gumazom.",
      "zegazolx grarel.",
      "zegazolx grarel.",
      "zamunx voworel.",
      "zuzazon vahayel d[zuzazor voworel]. dedadal on dogadal.",
    ]) {
      assert.equal(canonical(roundTrip(agazan)), canonical(agazan), agazan);
    }
  });

  it("round-trips every morph-glossed example in docs/grammar", () => {
    const failures: string[] = [];
    for (const agazan of lines) {
      let gloss: string;
      try {
        gloss = morphGlossLine(agazan, tables);
      } catch {
        continue; // Unknown words are reported by lint:agazan, not here.
      }
      try {
        const back = glossToAgazan(gloss, tables, index);
        if (canonical(back) !== canonical(agazan)) failures.push(`${agazan} → ${gloss} → ${back}`);
      } catch (error) {
        failures.push(`${agazan} → ${gloss} → ${(error as Error).message}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("rejects a gloss no Agazan line produces", () => {
    assert.throws(() => glossToAgazan("z-dog | v-not-a-real-sense", tables, index));
  });
});
