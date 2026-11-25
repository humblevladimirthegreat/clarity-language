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
      "zazozon d[oyobam#|] vezuyol.",
      "glegol z<kimchi> gamezem.",
      "zogozelx gragel.",
      "zogozelx gragel.",
      "zuwenx vowurol.",
      "zazozon vuhuyol d[zazozor vowurol]. dedudal en dogudal.",
      "zazozon abam zahelan vowurol.",
      "zazozon vowurol erol vazuvol.",
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
      "zazozon vehohel el bohahal. zexual blohahar vezuvel.",
    ]) {
      assert.equal(canonical(glossToAgeben(morphGlossLine(ageben, tables), tables, bare)), canonical(ageben), ageben);
    }
  });

  it("spells a number word with no doc line to copy it from, in the writing its gloss names", () => {
    const bare = buildGlossIndex(tables);
    const cases: [string, string][] = [
      ["z-three | v-sleep", "zragel vezuvel"],
      ["z-book | g-2nd", "zanal grodol"],
      ["z-cat | g-twelve", "zogozel g+12"],
      ["z-cat | g-eleven.spelled", "zogozel grababal"],
      ["z-cat | g-three.short", "zogozel g+3"],
      ["z-cat | g-three.about", "zogozel gragem"],
      ["z-cat | g-twelve.about", "zogozel g~+12"],
      ["z-book | g-2nd.named", "zanal grodon"],
      ["z-minus-three | v-sleep", "zrugel vezuvel"],
      ["z-Alazun | d-three | v-see . z-Azozon | d-←three | v-see", "zalazun dragel vayebel. zazozon drager vayebel"],
    ];
    for (const [gloss, ageben] of cases) assert.equal(glossToAgeben(gloss, tables, bare), ageben, gloss);
  });

  it("spells a digitless scale word and a mid-word x compound with no doc line to copy them from", () => {
    const bare = buildGlossIndex(tables);
    const cases: [string, string][] = [
      ["[z-Azozon | z-Alazun | z-rank/more | g-amount] | v-walk", "zazozon zalazun zol gral vowurol"],
      ["[z-Azozon | z-Alazun | z-rank/more | g-amount.about] | v-walk", "zazozon zalazun zol gram vowurol"],
      ["[z-Azozon | z-Alazun | z-rank/more | h-how-often] | v-walk", "zazozon zalazun zol hral vowurol"],
      ["[z-Azozon | th-plan-itinerary | z-rank/more | b-later] | v-arrival", "zazozon thagom zol bral vavurol"],
      ["z-peanut-x-butter", "zuwedaxubudal"],
      ["d-peanut-x-butter", "duwedaxubudal"],
      ["z-triviality-x-compliment", "zuwedaxubudam"],
      ["[z-tea | g-third-of] | v-sit", "zedudal grugel vehohel"],
      ["[z-tea | g-half-of] | v-sit", "zedudal grudol vehohel"],
      ["[z-tea | g-two | g-third-of] | v-sit", "zedudal gradol grugel vehohel"],
      ["[z-tea | g-one-12th-of] | v-sit", "zedudal g-12 vehohel"],
    ];
    for (const [gloss, ageben] of cases) {
      const spelled = glossToAgeben(gloss, tables, bare);
      assert.equal(spelled, ageben, gloss);
      assert.equal(morphGlossLine(spelled, tables), gloss, ageben);
    }
  });

  it("rejects a gloss no Ageben line produces", () => {
    assert.throws(() => glossToAgeben("z-dog | v-not-a-real-sense", tables, index));
  });

  it("rejects a stray bracket instead of looping (a role letter on a bracket)", () => {
    assert.throws(() => glossToAgeben("y-command | d-[red | dog] | v-construct", tables, index), /unbalanced bracket/);
  });
});
