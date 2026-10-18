import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import { loadHelperData, loadWordnetIndex } from "./load.js";
import { WORDNET_INDEX_VERSION, wordnetInputs } from "./wordnet-index.js";

describe("generated WordNet index", () => {
  it("is current for the lexicon CSVs", () => {
    const index = loadWordnetIndex();
    assert.ok(index, "src/generated/english-wordnet.json is missing: run npm run english-helper-wordnet");
    const inputs = createHash("sha256").update(wordnetInputs(loadHelperData().lexicon)).digest("hex");
    const stale = index.version !== WORDNET_INDEX_VERSION || index.inputs !== inputs;
    assert.ok(!stale, "src/generated/english-wordnet.json is stale for the lexicon CSVs: run npm run english-helper-wordnet");
  });

  it("stores English sense words that the lexicon still has", () => {
    const { lexicon } = loadHelperData();
    const index = loadWordnetIndex()!;
    const senses = new Set([...Object.values(index.entries).flatMap((list) => list.map((e) => e.sense)), ...Object.values(index.routes).flatMap((r) => r.sense ?? [])]);
    assert.deepEqual([...senses].filter((s) => !lexicon.has(s)), []);
  });
});
