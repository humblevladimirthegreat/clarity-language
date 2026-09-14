import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import {
  compareMorphGloss,
  extractExampleBlocks,
  morphGlossLine,
  normalizeMorphLine,
} from "./morph-gloss.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function expectLine(agalan: string, morph: string): void {
  assert.equal(morphGlossLine(agalan, tables), normalizeMorphLine(morph), agalan);
}

describe("morphGlossLine — glosses.md single words", () => {
  it("senses-are-separate-roots table", () => {
    expectLine("zugobol", "z-microphone");
    expectLine("zugobom", "z-speaker");
    expectLine("zugobon", "z-speaker");
    expectLine("guzumul", "g-smile");
    expectLine("guzumum", "g-happy");
    expectLine("huvuvul", "h-fishing");
    expectLine("huvuvum", "h-WITNESSED");
    expectLine("gohohum", "g-home");
  });

  it("house-cast names and resumes", () => {
    expectLine("zazawan", "z-Azawan");
    expectLine("zululon", "z-Ululon");
    expectLine("zuhubun", "z-Uhubun");
    expectLine("zazawan. zazar", "z-Azawan | z-←Azawan");
    expectLine("zululon. zulur", "z-Ululon | z-←Ululon");
    expectLine("zuhubun. zuhur", "z-Uhubun | z-←Uhubun");
  });

  it("mid-word x families", () => {
    expectLine("odunaxalanen", "wish-x-guidance");
    expectLine("jubunexunowen", "j-Ubune-x-Unowen");
    expectLine("zuzuzuxogovexadedan", "z-Uzuzu-x-Ogove-x-Adedan");
    expectLine("vawalaxel", "v-walking-unable-temporary");
    expectLine("holozoxem", "h-competence-x-motive");
    expectLine("zaxezeher", "z-agent-x-dialogue");
    expectLine("hexal", "h-aside-x-multi");
    expectLine("xuxul", "x-span-close");
    expectLine("x#e-", "x-starting-with");
  });

  it("joins, revisers, numbers", () => {
    expectLine("zam", "z-and.open");
    expectLine("zal", "z-and");
    expectLine("vam", "v-and.open");
    expectLine("dol", "d-or-exactly-one");
    expectLine("zol", "z-or-exactly-one");
    expectLine("zel", "z-rank/more");
    expectLine("zael", "z-as…as");
    expectLine("zaem", "z-as…as.open");
    expectLine("zar", "z-something");
    expectLine("zul", "z-not");
    expectLine("gul", "g-not");
    expectLine("zual", "z-everything-but");
    expectLine("xan", "x-and-then");
    expectLine("ol", "instead");
    expectLine("am", "including.open");
    expectLine("al", "additionally");
    expectLine("el", "rather");
    expectLine("ul", "except");
    expectLine("hal", "h-never");
    expectLine("zazawan vawalal hanunul hal", "z-Azawan | v-walking | h-rain | h-only-when");
    expectLine("hual", "h-always");
    expectLine("von", "v-choose");
    expectLine("g+3", "g-three");
    expectLine("g#2", "g-second");
    expectLine("g+", "g-more-than-one");
  });

  it("scientific and percent number writing", () => {
    expectLine("g+27e12", "g-27e12");
    expectLine("g+25%", "g-25jo");
    expectLine("g+3", "g-three");
  });

  it("worked single-words table", () => {
    expectLine("jawavel", "j-greeting");
    expectLine("azawan.", "Azawan");
    expectLine("jululoxen", "j-Ululon-queue");
    expectLine("jael", "j-yes");
    expectLine("jol", "j-question");
    expectLine("zedonen", "z-listener");
    expectLine("zahan", "z-interlocutors");
    expectLine("zugobonx", "z-speaker-x");
    expectLine("zedonenx", "z-listener-x");
    expectLine("hadezem", "h-LIVE");
    expectLine("howoram", "h-plan-sketch");
    expectLine("gonunul", "g-SAME");
  });

  it("fill-ask zar is z-who", () => {
    expectLine("jol zar vawalal", "j-question | z-who | v-walking");
  });

  it("next-clause adoro and hostless ABIL", () => {
    expectLine("dadorol", "d-next-clause");
    expectLine("hegeraxel", "h-ABIL-unable-temporary");
  });
});

describe("morphGlossLine — glosses.md dialogue turns", () => {
  it("inclusive census turn", () => {
    expectLine(
      "jael zugobon zam zedonen zal guzumum.",
      "j-yes | z-speaker | z-and.open | z-listener | z-and | g-happy",
    );
  });

  it("ability + value motive", () => {
    expectLine(
      "juel zugobon vawalaxel holozoxem.",
      "j-no | z-speaker | v-walking-unable-temporary | h-competence-x-motive",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "x#e- zuzebul g#1 zugobonx haweroxur.",
      "x-starting-with | z-problem | g-first | z-speaker-x | h-pleasure-x-unmet",
    );
  });

  it("inclusive we", () => {
    expectLine(
      "jael xezazal zahan howoram vawalal vul.",
      "j-yes | x-therefore | z-interlocutors | h-plan-sketch | v-walking | v-not",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "jubunexunowen. xezebal zubur huvuvum zanunul.",
      "j-Ubune-x-Unowen | x-however | z-←Ubune-x-Unowen | h-WITNESSED | z-rain",
    );
  });
});

describe("compareMorphGloss", () => {
  it("passes an equal pair", () => {
    const result = compareMorphGloss("zazawan godogol.", "z-Azawan | g-dog", tables);
    assert.equal(result.ok, true);
    assert.equal(result.expected, "z-Azawan | g-dog");
    assert.equal(result.actual, "z-Azawan | g-dog");
  });

  it("fails a sense mismatch with expected/actual", () => {
    const result = compareMorphGloss("zugobon", "z-microphone", tables);
    assert.equal(result.ok, false);
    assert.equal(result.expected, "z-microphone");
    assert.equal(result.actual, "z-speaker");
    assert.equal(result.parseError, undefined);
  });

  it("fails unparseable Agalan as parse, not gloss mismatch", () => {
    const result = compareMorphGloss("z!!!", "z-nope", tables);
    assert.equal(result.ok, false);
    assert.ok(result.parseError);
  });

  it("round-trips the jael census example block", () => {
    const md = `> \`jael zugobon zam zedonen zal guzumum.\`
>
> j-yes | z-speaker | z-and.open | z-listener | z-and | g-happy
>
> "Yes — you and I are happy."
`;
    const [pair] = extractExampleBlocks(md);
    assert.ok(pair);
    const result = compareMorphGloss(pair!.agalan, pair!.morph, tables);
    assert.equal(result.ok, true, `${result.expected} vs ${result.actual}`);
  });

  it("round-trips glosses.md example blocks that include their antecedents", () => {
    const glosses = readFileSync(join(rootDir, "docs", "meta", "glosses.md"), "utf8");
    const pairs = extractExampleBlocks(glosses);
    assert.ok(pairs.length >= 6);
    for (const pair of pairs) {
      if (pair.morph.includes("←")) continue;
      const result = compareMorphGloss(pair.agalan, pair.morph, tables);
      assert.equal(
        result.ok,
        true,
        `${pair.agalan} → documented ${pair.morph} vs parser ${result.actual}${result.parseError ? ` (${result.parseError})` : ""}`,
      );
    }
  });
});
