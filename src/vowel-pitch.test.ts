import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";

import { CONSONANT_LETTERS, vowelKey } from "./finger-code.ts";
import { letterNameTable } from "./retie/letter-names.ts";
import { drillPhrases, PITCH_ORDER, STACKS, VOWEL_PITCH, type DrillMode } from "./vowel-pitch.ts";

describe("vowel pitch", () => {
  it("sits on the finger code's piano keys", () => {
    for (const v of PITCH_ORDER) assert.equal(VOWEL_PITCH[v], vowelKey(v) - vowelKey("a"), v);
  });

  it("rises in pitch order", () => {
    const pitches = PITCH_ORDER.map((v) => VOWEL_PITCH[v]!);
    assert.deepEqual([...pitches].sort((a, b) => a - b), pitches);
    assert.equal(new Set(pitches).size, pitches.length);
  });

  it("lists the six stacks", () => {
    assert.deepEqual(STACKS, ["ua", "uo", "ue", "ao", "ae", "oe"]);
  });

  it("opens every contour with a", () => {
    for (const phrase of drillPhrases("contours")) assert.equal(phrase.steps[0]!.vowel, "a", phrase.caption);
  });

  it("plays each pair without a reference a", () => {
    assert.deepEqual(
      drillPhrases("pairs").map((p) => p.steps.map((s) => s.vowel).join("")),
      ["au", "oe", "uo"],
    );
  });

  it("reads each contour from its two vowels", () => {
    const contours = Object.fromEntries(drillPhrases("contours").map((p) => [p.word, p.caption]));
    assert.equal(contours.ua, "falls");
    assert.equal(contours.ao, "rises");
    assert.equal(contours.ae, "rises");
    assert.equal(contours.oe, "rises");
  });

  it("falls exactly on the u stacks (phonotactics.md#phonotactics)", () => {
    for (const { caption, word } of drillPhrases("contours")) assert.equal(caption, word!.startsWith("u") ? "falls" : "rises", word!);
  });

  it("runs the consonants in alphabet order: digit syllables up, every letter name down", () => {
    const syllables = (mode: DrillMode) =>
      drillPhrases(mode, true).map((p) => p.steps.map((s) => (s.onset ?? "") + s.vowel).join(" "));
    assert.deepEqual(syllables("up"), ["ba do ge hu", "za vo re lu", "na mo"]);
    assert.deepEqual(syllables("down"), ["bu de go ha", "zu ve ro la", "nu me tho wa", "yu xe"]);
    assert.deepEqual(syllables("pairs"), ["a u", "o e", "u o"]);
  });

  it("says the page's letter names on the scale down", () => {
    const names = letterNameTable(readFileSync(new URL("../docs/grammar/phonotactics.md", import.meta.url), "utf8"));
    const said = drillPhrases("down", true).flatMap((p) => p.steps.map((s) => s.onset! + s.vowel));
    assert.deepEqual(said, CONSONANT_LETTERS.map((l) => names.get(l)));
  });
});
