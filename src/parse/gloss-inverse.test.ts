import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { buildGlossIndex, glossToAgalan } from "./gloss-inverse.js";
import { loadDefaultTables } from "./index.js";
import { morphGlossLine } from "./morph-gloss.js";

const tables = loadDefaultTables();

function docLines(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docLines(path, into);
    else if (path.endsWith(".md")) {
      for (const pair of extractMorphPairs(readFileSync(path, "utf8"))) into.push(pair.agalan);
    }
  }
  return into;
}

/** Whitespace-only differences (incl. padding inside written brackets) and a final period are not distinct forms. */
function canonical(agalan: string): string {
  return agalan
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([[({<]) /g, "$1")
    .replace(/ ([\])}>])/g, "$1")
    .replace(/\.$/, "");
}

const lines = [...new Set(docLines("docs/grammar"))];
const index = buildGlossIndex(tables, lines);

function roundTrip(agalan: string): string {
  return glossToAgalan(morphGlossLine(agalan, tables), tables, index);
}

describe("glossToAgalan", () => {
  it("rebuilds each spec example exactly", () => {
    for (const agalan of [
      "dadedal on dogovel.",
      "zodogol gonunul bazawan gelulul.",
      "glonunul bazawan zodogol gonunul bululon.",
      "zadedal zogovel zol zanunul zal vawalal.",
      "zazawan vujudul daxal zazawan vawalal xuxul.",
      "zazawan vujudul d@[uzugon ululon].",
      "zadedal zogovel zol ^ hurorom bazawan ^ vawalal.",
      "zazawan vawalal. zazawar vujudul?",
      "zazawan vawalal. zazar vujudul.",
      "zazawan d[abugum#|] vezehel.",
      "zazawan daxur vezehel.",
      "zazawan d[=] vezehel.",
      "z{odogo} gumuzem.",
      "zagadalx grarel.",
      "zagadalx g+3.",
      "zugobonx vawalal.",
    ]) {
      assert.equal(canonical(roundTrip(agalan)), canonical(agalan), agalan);
    }
  });

  it("round-trips every morph-glossed example in docs/grammar", () => {
    const failures: string[] = [];
    for (const agalan of lines) {
      let gloss: string;
      try {
        gloss = morphGlossLine(agalan, tables);
      } catch {
        continue; // Unknown words are reported by lint:agalan, not here.
      }
      try {
        const back = glossToAgalan(gloss, tables, index);
        if (canonical(back) !== canonical(agalan)) failures.push(`${agalan} → ${gloss} → ${back}`);
      } catch (error) {
        failures.push(`${agalan} → ${gloss} → ${(error as Error).message}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("rejects a gloss no Agalan line produces", () => {
    assert.throws(() => glossToAgalan("z-dog | v-not-a-real-sense", tables, index));
  });
});
