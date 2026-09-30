import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse("zagulahazal vowogal."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zagulahazal");
    assert.deepEqual(words[0]!.maybeCompound, ["agu+l+ahaza"]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse("zebedalahazal vowogal.")), []);
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse("zabababal vowogal."));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });
});
