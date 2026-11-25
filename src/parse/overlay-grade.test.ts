import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classify } from "./classify.js";
import { loadDefaultTables } from "./index.js";
import type { StanceGrade } from "./overlay-grade.js";
import { parseWord } from "./word.js";

const tables = loadDefaultTables();

function overlayOf(text: string) {
  const word = classify(parseWord(text), tables);
  assert.ok(word.overlay, `${text} expected an overlay`);
  return word.overlay;
}

const GRADED: [kind: string, l: string, m: string, r: string][] = [
  ["evidential", "thevul", "thevum", "thevur"],
  ["mirative", "themel", "themem", "themer"],
  ["phasal", "thelol", "thelom", "thelor"],
  ["want", "thalol", "thalom", "thalor"],
  ["plan", "thagol", "thagom", "thagor"],
  ["may", "thomal", "thomam", "thomar"],
  ["notional", "theyul", "theyum", "theyur"],
];

describe("stance grade", () => {
  for (const [kind, l, m, r] of GRADED) {
    it(`grades ${kind} -l / -m / -r as settled / default / passing`, () => {
      const expected: [string, StanceGrade][] = [
        [l, "settled"],
        [m, "default"],
        [r, "passing"],
      ];
      for (const [text, grade] of expected) {
        const overlay = overlayOf(text);
        assert.equal(overlay.kind, kind, `${text} kind`);
        assert.equal(overlay.grade, grade, `${text} grade`);
      }
    });
  }

  it("grades DECISION ogel / oger, not ogem (modifiable is a claim)", () => {
    assert.equal(overlayOf("thogel").grade, "settled");
    assert.equal(overlayOf("thoger").grade, "passing");
    const ogem = overlayOf("thogem");
    assert.equal(ogem.kind, "decision");
    assert.equal(ogem.grade, undefined);
    assert.ok(!("grade" in ogem), "ogem carries no grade field");
  });

  it("leaves BECAUSE fault / share, sakes, as-of and /h/ phasals ungraded", () => {
    for (const text of ["thahul", "thahur", "thahum", "thenam", "thunor", "havel", "havem", "haver"]) {
      const overlay = overlayOf(text);
      assert.equal(overlay.grade, undefined, `${text} (${overlay.kind}) expected no grade`);
    }
    const sake = classify(parseWord("thunathem"), tables).hostOverlay;
    assert.equal(sake?.kind, "sake");
    assert.equal(sake?.grade, undefined, "unam sake host expected no grade");
  });

  it("keeps each kind's own gloss", () => {
    assert.equal(overlayOf("thalor").gloss, "WANT-passing");
    assert.equal(overlayOf("thelor").gloss, "not-yet.maybe-never");
  });
});
