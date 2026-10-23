import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse("zezelahezal vowurol."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zezelahezal");
    assert.deepEqual(words[0]!.maybeCompound, ["eze+l+aheza"]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse("zoyahehal vowurol.")), []);
  });

  it("does not report a role compound on a listed compound stem", () => {
    assert.deepEqual(unknownWords(parse("zwuzanalayebel varuyol.")), []);
  });

  it("does not report a role compound on an ordinary compound of listed roots", () => {
    assert.deepEqual(unknownWords(parse("zwuzodozexowurol varuyol.")), []);
  });

  it("still reports a role compound on an unlisted compound stem", () => {
    const words = unknownWords(parse("zwuzezelahezal varuyol."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zwuzezelahezal");
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse("zabababal vowurol."));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });

  it("skips an opaque span", () => {
    assert.deepEqual(unknownWords(parse("zazozon d<kimchi> vowurol.")), []);
  });

  it("checks the words inside a cite, not the cite as a whole", () => {
    assert.deepEqual(unknownWords(parse("zazozon d[zalazun vozuyel. zahelan vowurol.] vezuyol.")), []);
    const words = unknownWords(parse("zazozon d[zabababal vowurol] vezuyol."));
    assert.deepEqual(words.map((word) => word.raw), ["zabababal"]);
  });
});
