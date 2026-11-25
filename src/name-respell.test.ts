import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCmuDict } from "./cmu-dict.ts";
import { parsePublishedCsv } from "./lexicon-search.ts";
import { matchNamedRow, respellEnglishName } from "./name-respell.ts";
import { readFileSync } from "node:fs";
import { dataPath } from "./repo-paths.ts";

/** The pinned CMU dictionary's lines for the words these tests read, so they need no download. */
const cmu = parseCmuDict([
  "alan AE1 L AH0 N",
  "japan JH AH0 P AE1 N",
  "new N UW1",
  "new(2) N Y UW1",
  "owen OW1 AH0 N",
  "sam S AE1 M",
  "zealand Z IY1 L AH0 N D",
].join("\n"));
const rows = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));

describe("respellEnglishName", () => {
  it("matches convert-word --kind named for a country already in the lexicon", () => {
    const result = respellEnglishName("Japan", cmu, rows);
    assert.equal(result.whole.root, "azabana");
    assert.equal(result.whole.via, "cmu");
    assert.equal(result.published?.root, "azabana");
    assert.equal(result.fullName, undefined);
  });

  it("respells a person name that is not in the lexicon", () => {
    const result = respellEnglishName("Sam", cmu, rows);
    assert.equal(result.whole.root, "azamana");
    assert.equal(result.whole.citation, "azamanan");
    assert.equal(result.published, null);
  });

  it("offers given + family when the input is two words and not a published place", () => {
    const result = respellEnglishName("Alan Owen", cmu, rows);
    assert.equal(result.whole.root, "alanowana");
    assert.equal(result.fullName?.given.citation, "alananan");
    assert.equal(result.fullName?.family[0]?.citation, "owananan");
  });

  it("joins New Zealand as one published place, not a full name", () => {
    const result = respellEnglishName("New Zealand", cmu, rows);
    assert.equal(result.whole.root, "unuzelanda");
    assert.equal(result.published?.root, "unuzelanda");
    assert.equal(result.fullName, undefined);
  });

  it("falls back to letters when CMU is missing", () => {
    const result = respellEnglishName("Sam", null, rows);
    assert.equal(result.whole.via, "letters");
    assert.equal(result.whole.root, "azamana");
  });
});

describe("matchNamedRow", () => {
  it("finds a flag row from the place label", () => {
    const row = matchNamedRow("france", rows);
    assert.equal(row?.root, "avranza");
  });
});
