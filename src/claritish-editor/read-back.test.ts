import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildEditorData } from "./data.js";
import { distance, findDropIns, findNearMisses, sameDropIns } from "./read-back.js";
import { answerPaths, indexForms, outcomeFor } from "./types.js";

const { data } = buildEditorData();
const { glossary } = indexForms(data.flows);
const known = new Set(Object.keys(glossary));
const english = new Set(data.english);
/** Real forms, read from the data rather than spelled here. */
const could = outcomeFor(data.flows.guess!, { plan: "-m" })!.form;
const sorry = outcomeFor(data.flows.sorry!, answerPaths(data.flows.sorry!.questions)[0]!)!.form;
const episode = outcomeFor(data.flows.scope!, { scope: "this episode" })!.form;

describe("drop-ins in the text", () => {
  it("finds words, suffixes, set phrases, and tone marks", () => {
    const text = `It rained ${could}. I sing-xo. ?!She left. I cancelled. ${sorry}.`;
    assert.deepEqual(findDropIns(text, known).map((d) => d.form), [could, "-xo", "?!", sorry]);
  });

  it("reads English punctuation as English", () => {
    assert.deepEqual(findDropIns("Really? Yes! 50% off; it's fine.", known), []);
  });

  it("lists each mark of a stack once", () => {
    assert.deepEqual(findDropIns("!!Done.", known)[0]!.marks, ["!"]);
  });
});

describe("near misses", () => {
  /** `could` with one vowel changed, so the test needs no spelling of its own. */
  const typo = could.replace(/[aeou](?=[^aeou]*$)/, (v) => (v === "o" ? "a" : "o"));

  it("suggests the form one letter away", () => {
    const [miss] = findNearMisses(`It rained ${typo}.`, known);
    assert.equal(miss?.reason, "spelling");
    assert.equal(miss!.suggestions[0], could, miss!.suggestions.join());
  });

  it("explains a `t` that should be `th`", () => {
    const [miss] = findNearMisses(`It rained ${could.replace(/^th/, "t")}.`, known);
    assert.deepEqual([miss?.reason, miss?.suggestions], ["no-t", [could]]);
  });

  it("explains an ending on a suffix", () => {
    const [miss] = findNearMisses("I sing-xol.", known);
    assert.deepEqual([miss?.reason, miss?.suggestions], ["ending", ["sing-xo"]]);
  });

  it("explains a `t` and an ending on a label suffix", () => {
    const [noT] = findNearMisses(`He lied${episode.replace("th", "t")}.`, known, { english });
    assert.deepEqual([noT?.reason, noT?.suggestions], ["no-t", [`lied${episode}`]]);
    const [ending] = findNearMisses(`He lied${episode}l.`, known, { english });
    assert.deepEqual([ending?.reason, ending?.suggestions], ["ending", [`lied${episode}`]]);
  });

  it("suggests the feeling word two letters away", () => {
    const feeling = outcomeFor(data.flows.feeling!, { sake: "competence", stance: "unmet", ending: "-r", locus: "the atmosphere", motion: "-r" })!.form;
    const typo = `${feeling.slice(0, -3)}x${feeling.slice(-2)}`;
    const [miss] = findNearMisses(`The review is tomorrow ${typo}.`, known, { english });
    assert.ok(miss?.suggestions.includes(feeling), miss?.suggestions.join() ?? "no near miss");
    assert.deepEqual(findDropIns(`The review is tomorrow ${feeling}.`, known).map((d) => d.form), [feeling]);
    assert.deepEqual(glossary[feeling]?.lesson, "feelings");
  });

  it("offers every suffix one letter away", () => {
    const [miss] = findNearMisses("I sing-xi.", known);
    assert.deepEqual(miss?.suggestions, ["sing-xa", "sing-xe", "sing-xo", "sing-xu"]);
  });

  it("leaves ordinary English alone", () => {
    const text =
      "The thunder woke me, so I read until dawn. Trevor said the theater was closed and the tuner was broken. " +
      "We re-do the kitchen in May; my well-known aunt helped. Thank you, theme park, for the rides. Those were good times.";
    assert.deepEqual(findNearMisses(text, known, { english }).map((m) => m.text), []);
  });

  it("measures edit distance", () => {
    assert.equal(distance("kitten", "sitting"), 3);
    assert.equal(distance("abc", "abc"), 0);
    assert.ok(distance("abcdef", "uvwxyz", 1) > 1);
  });
});

describe("comparing drop-ins", () => {
  it("treats a stack of marks in any order as the same", () => {
    assert.ok(sameDropIns(["?!"], ["!?"]));
    assert.ok(!sameDropIns(["?!"], ["?"]));
    assert.ok(sameDropIns([could, "-xo"], ["-xo", could]));
  });
});
