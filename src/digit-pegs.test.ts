import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { chunkDigits, emptyCells, isDigitInput, pegBank, rootPayload, suggestPegs, wordDigits, type WordDigits } from "./digit-pegs.ts";
import { parsePublishedCsv } from "./lexicon-search.ts";
import { classifyAll, loadDefaultTables, parseWords } from "./parse/index.js";
import { readData } from "./repo-paths.ts";

const bank = pegBank(parsePublishedCsv(readData("lexicon-published.csv")));

function digitsOf(text: string): WordDigits[] {
  return classifyAll(parseWords(text), loadDefaultTables()).map(wordDigits);
}

describe("digit pegs", () => {
  it("fills every 0–9 and 00–99 cell from published roots", () => {
    assert.deepEqual(emptyCells(bank), []);
  });

  it("reads onsets as digits and skips vowels and fillers", () => {
    assert.equal(rootPayload("abedo"), "12");
    assert.equal(rootPayload("erowo"), "7");
    assert.equal(rootPayload("oholebora"), "4817");
    assert.equal(rootPayload("oyayu"), "");
  });

  it("keeps place-name roots and wrong-length roots out of the bank", () => {
    for (const cell of bank.values()) for (const peg of cell) assert.ok(peg.root.length === 3 || peg.root.length === 5, peg.root);
  });

  it("ranks core, then five-letter, then three-letter roots", () => {
    for (const cell of bank.values()) {
      const ranks = cell.map((peg) => (peg.core ? 0 : peg.root.length === 5 ? 1 : 2));
      assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
    }
  });

  it("chunks each digit group into twos", () => {
    assert.deepEqual(chunkDigits("2381"), ["23", "81"]);
    assert.deepEqual(chunkDigits("555,123,4567"), ["55", "5", "12", "3", "45", "67"]);
    assert.ok(isDigitInput("555-1234"));
    assert.ok(!isDigitInput("zudozol"));
    assert.ok(suggestPegs("71", bank)[0]!.pegs.some((peg) => peg.root === "orebo"));
  });

  it("reads a word's root whatever its role letter, ending or coda", () => {
    for (const word of ["zudozol", "zudozom", "dudozol", "zudozolx", "zudozorl", "gludozol"]) {
      assert.deepEqual(digitsOf(word), [{ raw: word, roots: ["udozo"], digits: "25" }]);
    }
    assert.deepEqual(
      digitsOf("zudozol dabedol varuvel").map((word) => ("digits" in word ? word.digits : "")),
      ["25", "12", "76"],
    );
  });

  it("counts a dictionary compound's join letter and reads x compounds left to right", () => {
    assert.equal((digitsOf("zoholeboral")[0] as { digits: string }).digits, "4817");
    assert.equal((digitsOf("zudozoxagebol")[0] as { digits: string }).digits, "2531");
  });

  it("refuses number words, grammar words and digitless roots", () => {
    for (const word of ["gragel", "zem", "zoyayul"]) assert.ok("notPeg" in digitsOf(word)[0]!, word);
  });
});
