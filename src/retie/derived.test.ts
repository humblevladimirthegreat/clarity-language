import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { respellDerived, syllableHint, wordPairsOf } from "./derived.js";

const NAMES = new Map([
  ["a", "a"], ["e", "e"], ["o", "o"], ["u", "u"],
  ["g", "ga"], ["d", "da"], ["z", "ze"], ["w", "we"], ["l", "lo"], ["n", "nu"],
]);

describe("wordPairsOf", () => {
  it("pairs the words of each change, a cite's words included, and drops a word changed two ways", () => {
    const pairs = wordPairsOf([
      { from: "zazawan", to: "zuzazon", index: 0 },
      { from: "d[zalahen vezehel]", to: "d[zolozun vezeyol]", index: 9 },
      { from: "vowogal", to: "voworel", index: 20 },
      { from: "vowogal", to: "vowozul", index: 30 },
    ]);
    assert.deepEqual([...pairs], [["zazawan", "zuzazon"], ["zalahen", "zolozun"], ["vezehel", "vezeyol"]]);
  });
});

describe("syllableHint", () => {
  it("starts each syllable with its consonant and closes the last with a final one", () => {
    assert.equal(syllableHint("oworelul"), "o-wo-re-lul");
    assert.equal(syllableHint("uzazon"), "u-za-zon");
    assert.equal(syllableHint("zovayalal"), "zo-va-ya-lal");
    assert.equal(syllableHint("thahor"), "tha-hor");
  });
});

describe("respellDerived", () => {
  const pairs = new Map([["zazawan", "zuzazon"], ["gamadam", "gumahom"], ["owogalul", "oworelul"], ["zavahal", "zovayal"], ["agada", "egazo"]]);

  it("respells whole-line IPA, with or without stress marks, and leaves IPA inside prose", () => {
    const text = "`zuzazon gumahom.`\n\n/ zä.zä.wän ɡä.mä.däm /\n\n> / ˈzä.zä.wän ˈɡä.mä.däm. /\n\n| `a` | /ä/ zä.zä.wän |\n";
    const { text: out } = respellDerived(text, pairs);
    assert.equal(out, "`zuzazon gumahom.`\n\n/ zʉ.zä.zo̞n ɡʉ.mä.ɦo̞m /\n\n> / ˈzʉ.zä.zo̞n ˈɡʉ.mä.ɦo̞m. /\n\n| `a` | /ä/ zä.zä.wän |\n");
  });

  it("never matches a shorter word's IPA inside a longer one", () => {
    const { text } = respellDerived("/ zä.zä.wän.mʉm /\n", new Map([["zazawan", "zuzazon"]]));
    assert.equal(text, "/ zä.zä.wän.mʉm /\n");
  });

  it("respells syllable hints, across a word edge too, and leaves other italics", () => {
    const text = "`oworelul` is *o-wo-ga-lul*; `zovayal al` sounds like *za-va-ha-lal*; *well-known* stays.";
    const { text: out } = respellDerived(text, pairs);
    assert.equal(out, "`oworelul` is *o-wo-re-lul*; `zovayal al` sounds like *zo-va-ya-lal*; *well-known* stays.");
  });

  it("respells a word spelled aloud inline only when the names spell its old letters", () => {
    const text = "Pause: `egazo` is `a` `ga` `a` `da` `a`. And `egazo` is `e` `ga` `a` `ze` `o`.";
    const { text: out, fixes } = respellDerived(text, pairs, NAMES);
    assert.equal(out, "Pause: `egazo` is `e` `ga` `a` `ze` `o`. And `egazo` is `e` `ga` `a` `ze` `o`.");
    assert.equal(fixes.length, 1);
  });
});
