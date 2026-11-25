import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  letterDistribution,
  mappedSourceLetters,
  shortRootCandidates,
} from "./word-converter.js";

describe("spelling map", () => {
  it("maps coffee letters in order", () => {
    assert.deepEqual(mappedSourceLetters("coffee"), ["g", "o", "v", "e"]);
  });
});

describe("pronunciation conversion", () => {
  // toAgebenWord("coffee") is this on the CMU entry; the phones are inline so the test needs no download.
  it("returns a three-letter root that echoes the word", () => {
    const root = shortRootCandidates("K AA1 F IY0")[0]!;
    assert.equal(root.length, 3);
    assert.equal(root[1], "g");
  });
});

describe("letterDistribution", () => {
  it("counts every vowel and consonant token in V(CV)+ roots", () => {
    const dist = letterDistribution(["ogove", "ededa"]);
    assert.equal(dist.skipped, 0);
    assert.equal(dist.vowelTokens, 6);
    assert.equal(dist.consonantTokens, 4);
    assert.equal(dist.letters, 10);
    assert.deepEqual(dist.vowels, { a: 1, e: 3, o: 2, u: 0 });
    assert.equal(dist.consonants.d, 2);
    assert.equal(dist.consonants.g, 1);
    assert.equal(dist.consonants.v, 1);
    assert.equal(dist.consonants.b, 0);
  });

  it("skips malformed strings", () => {
    const dist = letterDistribution(["ogove", "xyz", ""]);
    assert.equal(dist.skipped, 2);
    assert.equal(dist.letters, 5);
  });
});
