import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { buildGlossIndex, glossToAgeben } from "./gloss-inverse.js";
import { loadDefaultTables } from "./index.js";
import { morphGlossLine } from "./morph-gloss.js";

const tables = loadDefaultTables();

function docLines(dir: string, into: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) docLines(path, into);
    else if (path.endsWith(".md")) {
      for (const pair of extractMorphPairs(readFileSync(path, "utf8"))) into.push(pair.ageben);
    }
  }
  return into;
}

/** Whitespace-only differences (incl. padding inside written brackets) and a final period are not distinct forms. */
function canonical(ageben: string): string {
  return ageben
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([[({<]) /g, "$1")
    .replace(/ ([\])}>])/g, "$1")
    .replace(/\.$/, "");
}

const lines = [...new Set(docLines("docs/grammar"))];
const index = buildGlossIndex(tables, lines);

function roundTrip(ageben: string): string {
  return glossToAgeben(morphGlossLine(ageben, tables), tables, index);
}

describe("glossToAgeben", () => {
  it("rebuilds each spec example exactly", () => {
    for (const ageben of [
      "dedudal en dogudal.",
      "zodozel gorel blazozon gobulol.",
      "glorel blazozon zodozel gorel blalazun.",
      "zedudal zogudal zel zerulal zal vowurol.",
      "zazozon vuhuyol d[zazozon vowurol].",
      "zazozon vuhuyol d@[onuren alazun].",
      "zalazun dazozoln vayebel. zazozor gelazem.",
      "zalazun d^@<iPhone> vayebel.",
      "zalazun d^@[onuren alazun] vayebel.",
      "zahelan d~@[onuren alazun] vozuyel.",
      "zalazun d~^@<iPhone> vayebel.",
      "zedudal zogudal zol { hewem blazozon } vowurol.",
      "zazozon vowurol. zazozor vuhuyol.",
      "zazozon vowurol. zwuzer vuhuyol.",
      "zazozon vayebel dwuzor.",
      "zazozon dalazun vayebel. zwudarx veruvol.",
      "zazozon d[ayobam#|] vezuyol.",
      "glegol z<kimchi> gamezem.",
      "zogozelx gragel.",
      "zogozelx gragel.",
      "zuwenx vowurol.",
      "zazozon vuhuyol d[zazozor vowurol]. dedudal en dogudal.",
    ]) {
      assert.equal(canonical(roundTrip(ageben)), canonical(ageben), ageben);
    }
  });

  it("round-trips every morph-glossed example in docs/grammar", () => {
    const failures: string[] = [];
    for (const ageben of lines) {
      let gloss: string;
      try {
        gloss = morphGlossLine(ageben, tables);
      } catch {
        continue; // Unknown words are reported by lint:ageben, not here.
      }
      try {
        const back = glossToAgeben(gloss, tables, index);
        if (canonical(back) !== canonical(ageben)) failures.push(`${ageben} → ${gloss} → ${back}`);
      } catch (error) {
        failures.push(`${ageben} → ${gloss} → ${(error as Error).message}`);
      }
    }
    assert.deepEqual(failures, []);
  });

  it("spells a hosted bl- word with no doc line to copy it from", () => {
    const bare = buildGlossIndex(tables);
    for (const ageben of [
      "zexual blahaval vezuvel.",
      "zazozon vowurol halam blahaval.",
      "zodozel gaham blahaval vezuvel.",
      "zazozon vowurol halam blalazun.",
      "yel hewem blar zazozon vowurol.",
      "zazozon vehohel el bohehal. zexual blohehar vezuvel.",
    ]) {
      assert.equal(canonical(glossToAgeben(morphGlossLine(ageben, tables), tables, bare)), canonical(ageben), ageben);
    }
  });

  it("rejects a gloss no Ageben line produces", () => {
    assert.throws(() => glossToAgeben("z-dog | v-not-a-real-sense", tables, index));
  });
});
