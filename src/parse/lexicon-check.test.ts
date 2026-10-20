import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse("zagulahazal voworel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zagulahazal");
    assert.deepEqual(words[0]!.maybeCompound, ["agu+l+ahaza"]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse("zebeholuruhal voworel.")), []);
  });

  it("does not report a role compound on a listed compound stem", () => {
    assert.deepEqual(unknownWords(parse("zaxugulanobol vuruyel.")), []);
  });

  it("does not report a role compound on an ordinary compound of listed roots", () => {
    assert.deepEqual(unknownWords(parse("zaxodozoxoworel vuruyel.")), []);
  });

  it("still reports a role compound on an unlisted compound stem", () => {
    const words = unknownWords(parse("zaxagulahazal vuruyel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zaxagulahazal");
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse("zabababal voworel."));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });

  it("skips an opaque span", () => {
    assert.deepEqual(unknownWords(parse("zuzazon d<kimchi> vanobol.")), []);
  });

  it("checks the words inside a cite, not the cite as a whole", () => {
    assert.deepEqual(unknownWords(parse("zuzazon d[zolozun vezeyol. zehalon voworel.] vezeyel.")), []);
    const words = unknownWords(parse("zuzazon d[zabababal voworel] vezeyel."));
    assert.deepEqual(words.map((word) => word.raw), ["zabababal"]);
  });
});
