import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { vowelKey } from "./finger-code.ts";
import { drillPhrases, PITCH_ORDER, STACKS, VOWEL_PITCH } from "./vowel-pitch.ts";

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
    assert.deepEqual(STACKS, ["uo", "ua", "ue", "oa", "oe", "ae"]);
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
    assert.equal(contours.oa, "falls");
    assert.equal(contours.ae, "rises");
    assert.equal(contours.oe, "rises");
  });
});
