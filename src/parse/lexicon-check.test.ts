import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse("zezolahezal vowurel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zezolahezal");
    assert.deepEqual(words[0]!.maybeCompound, ["ezo+l+aheza"]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse("zobahohal vowurel.")), []);
  });

  it("does not report a role compound on a listed compound stem", () => {
    assert.deepEqual(unknownWords(parse("zaxegalawebol varayel.")), []);
  });

  it("does not report a role compound on an ordinary compound of listed roots", () => {
    assert.deepEqual(unknownWords(parse("zaxudozoxowurel varayel.")), []);
  });

  it("still reports a role compound on an unlisted compound stem", () => {
    const words = unknownWords(parse("zaxezolahezal varayel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zaxezolahezal");
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse("zabababal vowurel."));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });

  it("skips an opaque span", () => {
    assert.deepEqual(unknownWords(parse("zuzozen d<kimchi> vawebol.")), []);
  });

  it("checks the words inside a cite, not the cite as a whole", () => {
    assert.deepEqual(unknownWords(parse("zuzozen d[zolazun vezuyol. zahelan vowurel.] vezuyel.")), []);
    const words = unknownWords(parse("zuzozen d[zabababal vowurel] vezuyel."));
    assert.deepEqual(words.map((word) => word.raw), ["zabababal"]);
  });
});
