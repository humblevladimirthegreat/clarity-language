import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
import {
  classifyToTokenType,
  Force,
  H,
  JoinV,
  Odo,
  Polar,
  V,
} from "./tokens.js";
import { classify } from "./classify.js";
import { parseWord } from "./word.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function lex(text: string) {
  return classify(parseWord(text), tables);
}

describe("segmentUtterance", () => {
  it("peels trailing period from a word", () => {
    assert.deepEqual(segmentUtterance("gelulul."), [
      { kind: "word", text: "gelulul" },
      { kind: "punct", punct: "period" },
    ]);
  });

  it("splits caret islands", () => {
    assert.deepEqual(segmentUtterance("^ hal ^"), [
      { kind: "islandEdge" },
      { kind: "word", text: "hal" },
      { kind: "islandEdge" },
    ]);
  });
});

describe("classifyToTokenType", () => {
  it("maps join-act van to V", () => {
    assert.equal(classifyToTokenType(lex("van")).name, V.name);
  });

  it("maps fence-join val to JoinV", () => {
    assert.equal(classifyToTokenType(lex("val")).name, JoinV.name);
  });

  it("maps restrictor hal to H", () => {
    assert.equal(classifyToTokenType(lex("hal")).name, H.name);
  });

  it("maps yal to Force and yael to Polar", () => {
    assert.equal(classifyToTokenType(lex("yal")).name, Force.name);
    assert.equal(classifyToTokenType(lex("yael")).name, Polar.name);
  });

  it("maps darl to Odo", () => {
    assert.equal(classifyToTokenType(lex("darl")).name, Odo.name);
    assert.equal(classifyToTokenType(lex("barl")).name, Odo.name);
    assert.equal(classifyToTokenType(lex("dorl")).name, Odo.name);
  });
});

describe("tokenizeUtterance", () => {
  it("tokenizes gelulul. with period", () => {
    const tokens = tokenizeUtterance("gelulul.", tables);
    assert.equal(tokens.length, 2);
    assert.equal(tokens[1]!.image, ".");
  });
});

describe("tone marks", () => {
  it("emits attached and free-standing marks as tone segments", () => {
    assert.deepEqual(segmentUtterance("?! zazawan !!vejel ?^ hal ^."), [
      { kind: "tone", mark: "?!", attached: false },
      { kind: "word", text: "zazawan" },
      { kind: "tone", mark: "!!", attached: true },
      { kind: "word", text: "vejel" },
      { kind: "tone", mark: "?", attached: true },
      { kind: "islandEdge" },
      { kind: "word", text: "hal" },
      { kind: "islandEdge" },
      { kind: "punct", punct: "period" },
    ]);
  });

  it("reads a whole stack as one run", () => {
    assert.deepEqual(segmentUtterance("%!zazawan."), [
      { kind: "tone", mark: "%!", attached: true },
      { kind: "word", text: "zazawan" },
      { kind: "punct", punct: "period" },
    ]);
  });
});
