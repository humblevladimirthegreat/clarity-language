import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CONSONANT_LETTERS,
  DIGIT_LETTERS,
  fingerCodeScore,
  GUITAR_CONSONANTS,
  GUITAR_SPARE,
  GUITAR_VOWELS,
  guitarNotes,
  pianoForm,
  pianoNotes,
  shapeOf,
  VOWEL_LETTERS,
  vowelKey,
} from "./finger-code.ts";

const key = (fingers: number[]): string => [...fingers].sort().join("+");

describe("finger code", () => {
  it("counts the digit letters on the fingers", () => {
    const counts = Object.fromEntries(CONSONANT_LETTERS.map((l) => [l, key(shapeOf(l).fingers) + (shapeOf(l).hooked ? " hooked" : "")]));
    assert.deepEqual(counts, {
      b: "2",
      d: "2+3",
      g: "2+3+4",
      h: "2+3+4+5",
      z: "1",
      v: "1+2",
      r: "1+2+3",
      l: "1+2+3+4",
      n: "1+2+3+4+5",
      m: "2+5",
      th: "2 hooked",
      w: "2+3 hooked",
      y: "2+3+4 hooked",
      x: "2+3+4+5 hooked",
    });
  });

  it("counts the vowels up from the pinky, lowest pitch first", () => {
    assert.deepEqual(VOWEL_LETTERS, ["a", "o", "e", "u"]);
    assert.deepEqual(VOWEL_LETTERS.map((l) => key(shapeOf(l).fingers)), ["5", "4+5", "3+4+5", "2+3+4+5"]);
  });

  it("gives every letter a distinct shape on its hand", () => {
    const seen = new Set(CONSONANT_LETTERS.map((l) => key(shapeOf(l).fingers) + shapeOf(l).hooked));
    assert.equal(seen.size, CONSONANT_LETTERS.length);
  });

  it("strikes where the count ends on piano", () => {
    const forms = Object.fromEntries(CONSONANT_LETTERS.map((l) => [l, key(pianoForm(l).fingers) + (pianoForm(l).hook ? " hook" : "")]));
    assert.deepEqual(forms, {
      b: "2",
      d: "3",
      g: "4",
      h: "5",
      z: "1",
      v: "1 hook",
      r: "1+3",
      l: "1+4",
      n: "1+5",
      m: "2+5",
      th: "2 hook",
      w: "3 hook",
      y: "4 hook",
      x: "5 hook",
    });
  });

  it("plays the vowel pitches on piano and guitar, climbing with the count", () => {
    assert.deepEqual(VOWEL_LETTERS.map((l) => key(pianoForm(l).fingers)), ["5", "4", "3", "2"]);
    // 0 / 3 / 5 / 7 semitones above `a` (phonology.md#vowels).
    assert.deepEqual(VOWEL_LETTERS.map((l) => vowelKey(l) - vowelKey("a")), [0, 3, 5, 7]);
    const guitar = VOWEL_LETTERS.map((l) => GUITAR_VOWELS[l]!.midi);
    assert.deepEqual([...guitar].sort((a, b) => a - b), guitar);
  });

  it("never sounds a second or a ninth on piano", () => {
    // A second or a ninth; two octaves apart, a step blurs much less.
    const step = (a: number, b: number) => Math.abs(a - b) < 24 && [1, 2].includes(Math.abs(a - b) % 12);
    for (const c of [...CONSONANT_LETTERS, null]) {
      for (const v of [...VOWEL_LETTERS, null]) {
        const midi = [...(c ? pianoNotes(c) : []), ...(v ? pianoNotes(v) : [])].map((n) => n.midi);
        for (const a of midi) for (const b of midi) assert.ok(a === b || !step(a, b), `${c ?? ""}${v ?? ""}: ${midi.join(" ")}`);
      }
    }
  });

  it("never sounds a second or a ninth on guitar", () => {
    const step = (a: number, b: number) => Math.abs(a - b) < 24 && [1, 2].includes(Math.abs(a - b) % 12);
    for (const c of [...CONSONANT_LETTERS, null]) {
      for (const v of [...VOWEL_LETTERS, null]) {
        const midi = [...(c ? guitarNotes(c) : []), ...(v ? guitarNotes(v) : [])].map((n) => n.midi);
        for (const a of midi) for (const b of midi) assert.ok(a === b || !step(a, b), `${c ?? ""}${v ?? ""}: ${midi.join(" ")}`);
      }
    }
  });

  it("gives every consonant its own guitar strings", () => {
    const strings = new Set([...Object.values(GUITAR_CONSONANTS).map((c) => c.strings.join("+")), GUITAR_SPARE.join("+")]);
    assert.equal(strings.size, CONSONANT_LETTERS.length + 1);
    assert.deepEqual(Object.keys(GUITAR_CONSONANTS).sort(), [...CONSONANT_LETTERS].sort());
  });

  it("plays each digit letter's count on guitar", () => {
    DIGIT_LETTERS.forEach((letter, i) => assert.ok(GUITAR_CONSONANTS[letter]!.why.startsWith(`${(i + 1) % 10}:`), letter));
  });

  it("splits text into beats, codas, and rests", () => {
    const score = fingerCodeScore("gabun ue. ble");
    assert.deepEqual(
      score.beats.map((b) => [b.text, b.cons, b.vowel, b.grace.join(""), b.coda, b.held, b.stress]),
      [
        ["ga", "g", "a", "", false, false, true],
        ["bu", "b", "u", "", false, false, false],
        ["-n", "n", null, "", true, true, false],
        ["u", null, "u", "", false, false, true],
        ["e", null, "e", "", false, false, false],
        ["ble", "l", "e", "b", false, false, true],
      ],
    );
    // One beat each, a word rest after each word, and a period rest after the sentence.
    assert.deepEqual(score.beats.map((b) => b.at), [0.5, 1.5, 2.5, 4.5, 5.5, 9.5]);
    assert.deepEqual(score.words.map((w) => w.period), [false, true, false]);
  });

  it("skips words that are not plain native letters", () => {
    assert.deepEqual(fingerCodeScore("ga <Tokyo> 42").skipped, ["<Tokyo>", "42"]);
  });
});
