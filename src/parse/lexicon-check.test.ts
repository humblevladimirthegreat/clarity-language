import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables, parse } from "./index.js";
import { unknownWords } from "./lexicon-check.js";

// Roots are picked from the lexicon, so a retie that respells them leaves these cases standing.
const tables = loadDefaultTables();
const FIVE = /^[aeou][^aeou][aeou][^aeou][aeou]$/;
const fives = [...tables.published.keys()].filter((root) => FIVE.test(root));
/** A stem `left + l + right` that is no lexicon word and has only that split: no other join letter follows a published prefix. */
function unlistedStem(): { left: string; right: string; stem: string } {
  for (const left of fives) {
    for (const right of fives) {
      const stem = `${left}l${right}`;
      if (tables.published.has(stem) || tables.compounds.has(stem)) continue;
      const otherSplit = [...stem].some((letter, i) => i !== left.length && "lmnr".includes(letter) && tables.published.has(stem.slice(0, i)));
      if (!otherSplit) return { left, right, stem };
    }
  }
  throw new Error("no unlisted two-root stem in the lexicon");
}
const unlisted = unlistedStem();
const listedStem = [...tables.compounds.keys()][0]!;
/** A root-shaped spelling with no join letter (so no split) that the lexicon does not publish. */
const nonsense = ["ababa", "ebebe", "ododo", "ugugu"].find((root) => !tables.published.has(root))!;

describe("unknownWords", () => {
  it("reports a stem that parses but is not a lexicon word, with its compound split", () => {
    const words = unknownWords(parse(`z${unlisted.stem}l vowurol.`));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, `z${unlisted.stem}l`);
    assert.deepEqual(words[0]!.maybeCompound, [`${unlisted.left}+l+${unlisted.right}`]);
  });

  it("does not report a listed compound stem or a published root", () => {
    assert.deepEqual(unknownWords(parse(`z${listedStem}l vowurol.`)), []);
  });

  it("does not report a role compound on a listed compound stem", () => {
    assert.deepEqual(unknownWords(parse(`zwuz${listedStem}l varuyol.`)), []);
  });

  it("does not report a role compound on an ordinary compound of listed roots", () => {
    assert.deepEqual(unknownWords(parse(`zwuz${fives[0]}x${fives[1]}l varuyol.`)), []);
  });

  it("still reports a role compound on an unlisted compound stem", () => {
    const words = unknownWords(parse(`zwuz${unlisted.stem}l varuyol.`));
    assert.equal(words.length, 1);
    assert.equal(words[0]!.raw, `zwuz${unlisted.stem}l`);
  });

  it("reports a nonsense root with no split", () => {
    const words = unknownWords(parse(`z${nonsense}l vowurol.`));
    assert.equal(words.length, 1);
    assert.deepEqual(words[0]!.maybeCompound, []);
  });

  it("skips an opaque span", () => {
    assert.deepEqual(unknownWords(parse("zazozon d<kimchi> vowurol.")), []);
  });

  it("checks the words inside a cite, not the cite as a whole", () => {
    assert.deepEqual(unknownWords(parse("zazozon d[zalazun vozuyel. zahelan vowurol.] vezuyol.")), []);
    const words = unknownWords(parse(`zazozon d[z${nonsense}l vowurol] vezuyol.`));
    assert.deepEqual(words.map((word) => word.raw), [`z${nonsense}l`]);
  });
});
