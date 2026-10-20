import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cueWords, doerVerb, tagEnglish } from "./tag.js";

function terms(text: string) {
  return tagEnglish(text).flatMap((s) => s.clauses.flatMap((c) => c.terms));
}

function clause(text: string) {
  return tagEnglish(text)[0]!.clauses[0]!;
}

describe("tagEnglish", () => {
  it("reads a word's class from context", () => {
    const [, saw, , tool] = terms("He saw a saw.");
    assert.deepEqual([saw!.cls, saw!.lemma], ["verb", "see"]);
    assert.deepEqual([tool!.cls, tool!.lemma], ["noun", "saw"]);
  });

  it("lemmatizes irregular forms", () => {
    const t = terms("The children went home.");
    assert.equal(t.find((x) => x.normal === "children")!.lemma, "child");
    assert.equal(t.find((x) => x.normal === "went")!.lemma, "go");
    assert.equal(terms("Cats sleep.")[0]!.lemma, "cat");
  });

  it("reads a preposition the library tags as an adjective", () => {
    for (const word of ["aboard", "underneath", "beneath"]) {
      assert.equal(terms(`We sat ${word} the train.`).find((x) => x.normal === word)!.cls, "preposition");
    }
  });

  it("expands contractions into a negative word", () => {
    const t = terms("My sister couldn't come.");
    assert.deepEqual(t.map((x) => x.normal), ["my", "sister", "could", "not", "come"]);
    assert.equal(t[3]!.cls, "negative");
    assert.equal(t[0]!.cls, "pronoun");
  });

  it("applies a forced reading", () => {
    const [, saw] = terms("He saw/n it.");
    assert.deepEqual([saw!.cls, saw!.lemma, saw!.forced], ["noun", "saw", true]);
  });

  it("records clause features", () => {
    assert.deepEqual(clause("Uzazon will have been walking.").features, { modals: ["will"], negated: false, question: false, tense: "future", perfect: true, progressive: true });
    assert.equal(clause("Where did you go?").features.question, true);
    assert.equal(clause("Where did you go?").features.tense, "past");
    assert.equal(clause("I used to walk.").features.usedTo, true);
    assert.equal(clause("Olozun had seen it.").features.perfect, true);
  });

  it("marks names, plurals and possessives", () => {
    const t = terms("The dogs like Olozun's house.");
    assert.equal(t.find((x) => x.normal === "dogs")!.plural, true);
    const alahen = t.find((x) => x.normal === "olozun")!;
    assert.equal(alahen.proper, true);
    assert.equal(alahen.possessive, true);
    assert.equal(terms("The walker sits.")[1]!.proper, undefined);
  });
});

describe("doerVerb", () => {
  it("finds the verb under an -er noun", () => {
    assert.equal(doerVerb("teacher"), "teach");
    assert.equal(doerVerb("walker"), "walk");
    assert.equal(doerVerb("writer"), "write");
    assert.equal(doerVerb("runner"), "run");
    assert.equal(doerVerb("actor"), "act");
    assert.equal(doerVerb("sister"), undefined);
    assert.equal(doerVerb("mother"), undefined);
  });
});

describe("cueWords", () => {
  it("splits a cue the way the tagger splits a sentence", () => {
    assert.deepEqual(cueWords("can't"), ["can", "not"]);
    assert.deepEqual(cueWords("so that"), ["so", "that"]);
  });
});
