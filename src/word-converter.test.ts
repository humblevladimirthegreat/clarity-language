import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  letterDistribution,
  mappedSourceLetters,
  toClarityWord,
  toUniqueClarityWord,
} from "./word-converter.js";

describe("spelling map", () => {
  it("maps coffee letters in order", () => {
    assert.deepEqual(mappedSourceLetters("coffee"), ["g", "o", "v", "e"]);
  });
});

describe("pronunciation conversion", () => {
  it("builds knife from its consonants, skipping the silent k", () => {
    const root = toClarityWord("knife", 3);
    assert.equal(root.length, 5);
    assert.equal(root[1], "n");
    assert.equal(root[3], "v");
    assert.equal(root.includes("g"), false);
  });

  it("maps coffee (K AA1 F IY0) to agave", () => {
    assert.equal(toClarityWord("coffee", 3), "agave");
  });

  it("returns a three-letter root for two syllables", () => {
    const root = toClarityWord("coffee", 2);
    assert.equal(root.length, 3);
    assert.equal(root[1], "g");
  });

  it("assigns the next free candidate when the best root is taken", () => {
    const used = new Set<string>();
    const first = toUniqueClarityWord("coffee", used);
    assert.equal(first, toClarityWord("coffee", 3));
    assert.notEqual(toUniqueClarityWord("coffee", used), first);
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
