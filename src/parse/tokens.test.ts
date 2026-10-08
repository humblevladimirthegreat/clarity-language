import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { scanChunks } from "./span-scan.js";
import { createClassifyTables } from "./classify.js";
import { segmentUtterance, tokenizeUtterance } from "./tokenize.js";
import {
  classifyToTokenType,
  Force,
  H,
  JoinV,
  OdoB,
  OdoD,
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

  it("splits brace islands", () => {
    assert.deepEqual(segmentUtterance("{ hal }"), [
      { kind: "islandEdge", open: true },
      { kind: "word", text: "hal" },
      { kind: "islandEdge", open: false },
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

  it("maps darl to the stand-in token of its slot", () => {
    assert.equal(classifyToTokenType(lex("darl")).name, OdoD.name);
    assert.equal(classifyToTokenType(lex("barl")).name, OdoB.name);
    assert.equal(classifyToTokenType(lex("dorl")).name, OdoD.name);
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
    assert.deepEqual(segmentUtterance("?! zazawan !!veyel ?{ hal }."), [
      { kind: "tone", mark: "?!", attached: false },
      { kind: "word", text: "zazawan" },
      { kind: "tone", mark: "!!", attached: true },
      { kind: "word", text: "veyel" },
      { kind: "tone", mark: "?", attached: true },
      { kind: "islandEdge", open: true },
      { kind: "word", text: "hal" },
      { kind: "islandEdge", open: false },
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

describe("scanChunks", () => {
  it("keeps a written span whole, with its tone mark and sentence mark", () => {
    assert.deepEqual(
      scanChunks("zazawan !d[zazawar vowogal]. dedehel").map((chunk) => chunk.text),
      ["zazawan", "!d[zazawar vowogal].", "dedehel"],
    );
  });

  it("splits island braces as their own chunks", () => {
    assert.deepEqual(
      scanChunks("zazawan { hegewem zodogal } vahahal").map((chunk) => chunk.text),
      ["zazawan", "{", "hegewem", "zodogal", "}", "vahahal"],
    );
  });
});
