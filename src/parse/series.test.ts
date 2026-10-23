import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BAR_SERIES, JOIN_SERIES, KIND_SERIES, RANK_SERIES, SCALE_SERIES, stackKind } from "./series.js";
import { parseWord } from "./word.js";
import type { LexWord } from "./types.js";

function act(raw: string): LexWord {
  return parseWord(raw) as LexWord;
}

describe("join series membership", () => {
  it("puts rank, sequence, invert-rank, and the equative on o / ao / uo / oe", () => {
    assert.deepEqual([...RANK_SERIES].sort(), ["ao", "o", "oe", "uo"]);
    assert.deepEqual([...BAR_SERIES].sort(), ["o", "oe", "uo"]);
    assert.deepEqual([...SCALE_SERIES].sort(), ["ao", "o", "uo"]);
  });

  it("puts kind / domain on ua and anything-but invert", () => {
    assert.deepEqual([...KIND_SERIES].sort(), ["ua", "ue"]);
  });

  it("names leftover-list jobs on each join letter", () => {
    assert.equal(JOIN_SERIES.a?.job, "and");
    assert.equal(JOIN_SERIES.o?.job, "rank/more");
    assert.equal(JOIN_SERIES.e?.job, "or-exactly-one");
    assert.equal(JOIN_SERIES.u?.job, "not");
    assert.equal(JOIN_SERIES.ao?.job, "in-order");
    assert.equal(JOIN_SERIES.ae?.job, "and/or");
    assert.equal(JOIN_SERIES.uo?.job, "rank/less");
    assert.equal(JOIN_SERIES.ue?.job, "anything-but");
    assert.equal(JOIN_SERIES.oe?.job, "equal-rank");
    assert.equal(JOIN_SERIES.ua?.job, "everything-but");
  });
});

describe("stackKind", () => {
  it("reads a statement over a question as rhetorical and a question over a statement as a quiz", () => {
    assert.equal(stackKind(act("yal"), act("yel")), "rhetorical");
    assert.equal(stackKind(act("yel"), act("yal")), "quiz");
    assert.equal(stackKind(act("yol"), act("yol")), "emphatic");
    assert.equal(stackKind(act("yol"), act("yel")), "stack");
  });
});
