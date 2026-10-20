import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse("zagulahezal vewurel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zagulahezal");
    assert.deepEqual(words[0]!.maybeCompound, ["agu+l+aheza"]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse("zobaholurahal vewurel.")), []);
  });

  it("does not report a role compound on a listed compound stem", () => {
    assert.deepEqual(unknownWords(parse("zaxugulawebol varayel.")), []);
  });

  it("does not report a role compound on an ordinary compound of listed roots", () => {
    assert.deepEqual(unknownWords(parse("zaxudozoxewurel varayel.")), []);
  });

  it("still reports a role compound on an unlisted compound stem", () => {
    const words = unknownWords(parse("zaxagulahezal varayel."));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, "zaxagulahezal");
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse("zabababal vewurel."));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });

  it("skips an opaque span", () => {
    assert.deepEqual(unknownWords(parse("zuzozen d<kimchi> vawebol.")), []);
  });

  it("checks the words inside a cite, not the cite as a whole", () => {
    assert.deepEqual(unknownWords(parse("zuzozen d[zolazun vezuyol. zuhelan vewurel.] vezuyel.")), []);
    const words = unknownWords(parse("zuzozen d[zabababal vewurel] vezuyel."));
    assert.deepEqual(words.map((word) => word.raw), ["zabababal"]);
  });
});
