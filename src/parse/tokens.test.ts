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

  it("maps jal to Force and jael to Polar", () => {
    assert.equal(classifyToTokenType(lex("jal")).name, Force.name);
    assert.equal(classifyToTokenType(lex("jael")).name, Polar.name);
  });

  it("maps dorodol to Odo", () => {
    assert.equal(classifyToTokenType(lex("dorodol")).name, Odo.name);
  });
});

describe("tokenizeUtterance", () => {
  it("tokenizes gelulul. with period", () => {
    const tokens = tokenizeUtterance("gelulul.", tables);
    assert.equal(tokens.length, 2);
    assert.equal(tokens[1]!.image, ".");
  });
});
