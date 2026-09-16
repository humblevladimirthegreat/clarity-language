import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import {
  compareMorphGloss,
  extractExampleBlocks,
  extractTeachBlocks,
  morphGlossLine,
  morphRedundantWithLoose,
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
    expectLine("vawalaxel", "v-walk-unable-temporary");
    expectLine("holozoxem", "h-competence-ought-endorse");
    expectLine("zaxezeher", "z-agent-x-speech");
    expectLine("zaxuvugul", "z-agent-x-fight");
    expectLine("zaxuvugum", "z-agent-x-struggle");
    expectLine("zexahamel", "z-instrument-x-hammer");
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
    expectLine("zael", "z-equal-rank");
    expectLine("zaem", "z-equal-rank.open");
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
    expectLine("zazawan velebel al bohohul.", "z-Azawan | v-sleep | in | b-house");
    expectLine("zodogolx al zagadal.", "z-dog-x | including | z-cat");
    expectLine("zazawan ul bazadol vawalal oel badadul.", "z-Azawan | from | b-station | v-walk | toward | b-train");
    expectLine("zazawan velebel al bohohul.", "z-Azawan | v-sleep | in | b-house");
    expectLine("zodogolx al zagadal.", "z-dog-x | including | z-cat");
    expectLine("zazawan ul bazadol vawalal oel badadul.", "z-Azawan | from | b-station | v-walk | toward | b-train");
    expectLine("hal", "h-never");
    expectLine("har", "h-sometimes");
    expectLine("jol zuhubun vawalal har?", "j-question | z-Uhubun | v-walk | h-when");
    expectLine("zazawan vawalal hanunul hal", "z-Azawan | v-walk | h-rain | h-only-when");
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
    expectLine("honenom", "h-RESIDUE");
    expectLine("hemebem", "h-FORMER");
    expectLine("hemabam", "h-plan-sketch");
    expectLine("gonunul", "g-SAME");
  });

  it("fill-ask zar is z-who", () => {
    expectLine("jol zar vawalal", "j-question | z-who | v-walk");
  });

  it("stand-in glosses and hostless ABIL", () => {
    expectLine("darl", "d-that-clause");
    expectLine("dorl", "d-whether-clause");
    expectLine("derl", "d-to-clause");
    expectLine("durl", "d-lest-clause");
    expectLine("darm", "d-that-clause.open");
    expectLine("hegeraxel", "h-ABIL-unable-temporary");
  });

  it("lexicon senses use packed role English when present", () => {
    expectLine("vajul", "v-sit");
    expectLine("vejel", "v-see");
    expectLine("vezehel", "v-tell");
    expectLine("vebarul", "v-departure");
    expectLine("welem", "w-very");
    expectLine("gelem", "g-big");
    expectLine("al bohohul", "in | b-house");
    expectLine("ael bahamel", "using | b-hammer");
    expectLine("hurorom", "h-like");
    expectLine("gurorom", "g-like");
    expectLine("gobonem", "g-part-of");
    expectLine("gajaram", "g-contents");
    expectLine("gowodom", "g-material");
    expectLine("gugunom", "g-origin");
    expectLine("hazanum", "h-between");
    expectLine("zejel", "z-eye");
    expectLine("hozal", "h-hash");
    expectLine("jam", "j-soft-statement");
    expectLine("jem", "j-request");
    expectLine("jum", "j-soft-prohibition");
    expectLine("jal", "j-statement");
    expectLine("jel", "j-command");
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
      "juel zugobon vawalaxel holozoxom.",
      "j-no | z-speaker | v-walk-unable-temporary | h-competence-motive-internal",
    );
  });

  it("numbered alternative + unmet pleasure", () => {
    expectLine(
      "x#e- zuzebum g#1 zugobonx haweroxur.",
      "x-starting-with | z-problem | g-first | z-speaker-x | h-pleasure-unmet-temporary",
    );
  });

  it("literal key is not ideation solution", () => {
    expectLine("zagegol wegeraxel.", "z-key | w-ABIL-unable-temporary");
  });

  it("inclusive we", () => {
    expectLine(
      "jael xezazal zahan hemabam vawalal vul.",
      "j-yes | x-therefore | z-interlocutors | h-plan-sketch | v-walk | v-not",
    );
  });

  it("resume with in-text antecedent", () => {
    expectLine(
      "jubunexunowen. xezebal zubur huvuvum zanunul.",
      "j-Ubune-x-Unowen | x-however | z-←Ubune-x-Unowen | h-WITNESSED | z-rain",
    );
  });
});

describe("morphGlossLine — restrictor -r vs -l", () => {
  it("har is sometimes / when, not never", () => {
    expectLine("hal", "h-never");
    expectLine("zululon vawalal hal.", "z-Ululon | v-walk | h-never");
    expectLine("har", "h-sometimes");
    expectLine("zululon vurunul har.", "z-Ululon | v-run | h-sometimes");
    expectLine("jol zuhubun vawalal har?", "j-question | z-Uhubun | v-walk | h-when");
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

  it("emits scope island edges in morph gloss", () => {
    expectLine(
      "zazawan ^ huzurem zodogol garedel ^ vejel",
      "z-Azawan | ^-start | h-possibility | z-dog | g-red | ^-end | v-see",
    );
  });

  it("mentions pass through the form, not the English lemma", () => {
    expectLine("z{odogo} gumuzem", "z-odogo | g-small");
    expectLine("zoxol odogol gumuzem", "z-mention-x-atomic | odogol | g-small");
    expectLine(
      "z{zazawan vuzunul} gumuzem",
      "z-mention | zazawan | vuzunul | g-small",
    );
    expectLine(
      "zazawan d@[uzugon ululon] vogozom",
      "z-Azawan | d-cite | Uzugon | Ululon | v-rejection",
    );
    expectLine(
      "zazawan d@{uzugon} vogozom",
      "z-Azawan | d-uzugon | v-rejection",
    );
  });

  it("ordinary -l on a need host root uses literal sense, not need overlay", () => {
    expectLine("zazawan gonogol bululon", "z-Azawan | g-knot | b-Ululon");
  });

  it("morphRedundantWithLoose allows single-word citation skips", () => {
    assert.equal(morphRedundantWithLoose("azawal", "swan", tables), true);
    assert.equal(morphRedundantWithLoose("azawan.", '"Azawan."', tables), true);
    assert.equal(morphRedundantWithLoose("zazawan vajul.", "Azawan sits.", tables), false);
    assert.equal(morphRedundantWithLoose("z!!!", "nope", tables), false);
  });

  it("extractTeachBlocks finds morph after a name line and loose quotes", () => {
    const md = `> \`azawan.\`
>
> Azawan
>
> "Azawan." (hello — the speaker is Azawan)
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.agalan, "azawan.");
    assert.equal(block!.morph, "Azawan");
    assert.equal(block!.loose, "Azawan.");
  });

  it("extractTeachBlocks allows omitted morph when only loose follows", () => {
    const md = `> \`azawal\`
>
> "swan"
`;
    const [block] = extractTeachBlocks(md);
    assert.ok(block);
    assert.equal(block!.morph, null);
    assert.equal(block!.loose, "swan");
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

  it("values bake stance and ending grain", () => {
    expectLine("zawaral gonogoxal", "z-wrapped-gift | g-relatedness-met-physical");
    expectLine("heregem hanedem", "h-HIGH | h-CIRCUM");
  });

  it("span interiors: cite and aside gloss English; mention passes through", () => {
    expectLine("zazawan vawalal h(huzumum)", "z-Azawan | v-walk | h-happy");
    expectLine("jul zululon v[vozodol]", "j-prohibition | z-Ululon | v-stop");
    expectLine(
      "zazawan vawalal h(zululon velebel)",
      "z-Azawan | v-walk | h- | z-Ululon | v-sleep",
    );
    expectLine("zululon daxol ujudul vezehel", "z-Ululon | d-cite-x-atomic | judge | v-tell");
  });

  it("viewpoint laterals keep compass on DIR", () => {
    expectLine("jel vawalal hewezexazawan", "j-command | v-walk | h-west-x-Azawan");
  });

  it("house-cast resume without a same-line antecedent", () => {
    expectLine("zazawarx vajul", "z-←Azawan-x | v-sit");
  });

  it("quasi numeric derivation is English", () => {
    expectLine("zuhubun geberelonogoxrubul", "z-Uhubun | g-friend-x-quasi");
  });
});

describe("morphGlossLine — extra fixtures", () => {
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
