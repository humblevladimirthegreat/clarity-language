import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  letterDistribution,
  mappedSourceLetters,
  toClarityWord,
  toUniqueClarityWord,
} from "./word-converter.js";

describe("order-preserving conversion", () => {
  it("maps coffee to ogove (C-O-F-E order, leading echo o)", () => {
    assert.deepEqual(mappedSourceLetters("coffee"), ["g", "o", "v", "e"]);
    assert.equal(toClarityWord("coffee", 3), "ogove");
  });

  it("maps tea to ededa", () => {
    assert.equal(toClarityWord("tea", 3), "ededa");
  });

  it("maps dog to odogo", () => {
    assert.equal(toClarityWord("dog", 3), "odogo");
  });

  it("maps apple to abele (V between b/l echoes closer e)", () => {
    assert.equal(toClarityWord("apple", 3), "abele");
  });

  it("maps water by dropping the right edge to fit five letters", () => {
    assert.equal(toClarityWord("water", 3), "awade");
  });

  it("compresses coffee to two syllables by dropping from the right", () => {
    assert.equal(toClarityWord("coffee", 2), "ogo");
  });

  it("assigns unique roots without reordering the first pick", () => {
    const used = new Set<string>();
    assert.equal(toUniqueClarityWord("coffee", used), "ogove");
    assert.notEqual(toUniqueClarityWord("coffee", used), "ogove");
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
