import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { vowelKey } from "./finger-code.ts";
import { DRILL_MODES, drillPhrases, PITCH_ORDER, STACKS, VOWEL_PITCH, withSingTurns } from "./vowel-pitch.ts";

describe("vowel pitch", () => {
  it("sits on the finger code's piano keys", () => {
    for (const v of PITCH_ORDER) assert.equal(VOWEL_PITCH.full[v], vowelKey(v) - vowelKey("a"), v);
  });

  it("keeps the order in every range", () => {
    for (const steps of Object.values(VOWEL_PITCH)) {
      const pitches = PITCH_ORDER.map((v) => steps[v]!);
      assert.deepEqual([...pitches].sort((a, b) => a - b), pitches);
      assert.equal(new Set(pitches).size, pitches.length);
    }
  });

  it("lists the six stacks", () => {
    assert.deepEqual(STACKS, ["uo", "ua", "ue", "oa", "oe", "ae"]);
  });

  it("opens every pattern after the scales with a", () => {
    for (const { id } of DRILL_MODES) {
      for (const phrase of drillPhrases(id, () => 0)) {
        if (id !== "up" && id !== "down") assert.equal(phrase.steps[0]!.vowel, "a", `${id}: ${phrase.caption}`);
      }
    }
  });

  it("reads each contour from its two vowels", () => {
    const contours = Object.fromEntries(drillPhrases("contours").map((p) => [p.word, p.caption]));
    assert.equal(contours.yael, "rises");
    assert.equal(contours.yuel, "falls");
    assert.equal(contours.ua, "falls");
    assert.equal(contours.oa, "falls");
    assert.equal(contours.ae, "rises");
    assert.equal(contours.oe, "rises");
  });

  it("asks for the random vowel before playing it", () => {
    assert.deepEqual(
      drillPhrases("random", () => 2)[0]!.steps.map((s) => `${s.kind} ${s.vowel}`),
      ["ref a", "sing u", "note u"],
    );
  });

  it("adds a turn to sing back each note, unless the phrase already has one", () => {
    const steps = (mode: Parameters<typeof drillPhrases>[0]) =>
      withSingTurns(drillPhrases(mode, () => 2)).map((p) => p.steps.map((s) => `${s.kind} ${s.vowel}`));
    assert.deepEqual(steps("up"), [["note a", "sing a", "note o", "sing o", "note e", "sing e", "note u", "sing u"]]);
    assert.deepEqual(steps("random"), [["ref a", "sing u", "note u"]]);
    assert.deepEqual(steps("pairs")[1], ["ref a", "sing a", "note o", "sing o", "note e", "sing e"]);
  });
});
