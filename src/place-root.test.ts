import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "./parse/word.ts";
import { finishPlaceLetters, isPlaceRootShape, placeRoot } from "./place-root.ts";
import { isAgebonRootShape } from "./root-shape.ts";

describe("placeRoot", () => {
  it("keeps a cluster and ends in a vowel", () => {
    assert.equal(placeRoot("B R AH0 Z IH1 L"), "abrazele");
    assert.equal(placeRoot("F R AE1 N S"), "avranza");
  });

  it("gives a name with no cluster the place tail", () => {
    assert.equal(placeRoot("JH AH0 P AE1 N"), "azabana");
    assert.equal(placeRoot("K AE1 N AH0 D AH0"), "aganadana");
    assert.equal(placeRoot("P ER0 UW1"), "oborunu");
  });

  it("glides between vowels and splits -l / -m + r", () => {
    assert.equal(placeRoot("T OW1 K IY0 OW2"), "odogewono");
    assert.ok(!/[lm]r/.test(placeRoot("EH0 L M AY1 R AH0")));
  });

  it("runs the words of a name together", () => {
    assert.equal(placeRoot("N UW1 | Z IY1 L AH0 N D"), "unuzelanda");
  });

  it("shapes letter fallback the same way as a matching pronunciation", () => {
    assert.equal(finishPlaceLetters("zam"), "azamana");
  });
});

describe("isPlaceRootShape", () => {
  it("takes a clustered root, or a long one ending in n + a vowel", () => {
    assert.ok(isPlaceRootShape("abrazele"));
    assert.ok(isPlaceRootShape("azabana"));
  });

  it("refuses a short native-looking root, a seam letter, a vowel run, and l / m + r", () => {
    assert.ok(!isPlaceRootShape("agane"));
    assert.ok(!isPlaceRootShape("abazela"));
    assert.ok(!isPlaceRootShape("axbana"));
    assert.ok(!isPlaceRootShape("abraela"));
    assert.ok(!isPlaceRootShape("abelra"));
  });

  it("never matches an ordinary three- or five-letter root", () => {
    for (const root of ["aba", "ubezo", "ezana"]) {
      assert.ok(isAgebonRootShape(root));
      assert.ok(!isPlaceRootShape(root), root);
    }
  });
});

describe("place-name words", () => {
  it("parse as one content root before the ending", () => {
    const word = parseWord("dabrazelen");
    assert.equal(word.pos, "d");
    assert.equal(word.ending, "n");
    assert.deepEqual(word.family, { kind: "content", roots: ["abrazele"] });
    assert.deepEqual(parseWord("abrazelen").family, { kind: "content", roots: ["abrazele"] });
  });
});
