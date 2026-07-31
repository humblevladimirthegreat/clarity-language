import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  createLexiconIndex,
  parsePublishedCsv,
  searchLexicon,
  tokenizeLiteral,
} from "./lexicon-search.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");

describe("tokenizeLiteral", () => {
  it("expands hyphenated literals into searchable tokens", () => {
    const tokens = tokenizeLiteral("nervous-laugh");
    assert.match(tokens, /nervous/);
    assert.match(tokens, /laugh/);
    assert.match(tokens, /nervous-laugh/);
  });
});

describe("searchLexicon", () => {
  const rows = parsePublishedCsv(readFileSync(publishedPath, "utf8"));
  const index = createLexiconIndex(rows);

  it('finds "laugh" via literal and hyphen tokenization', () => {
    const results = searchLexicon(index, rows, "laugh", { limit: 50 });
    const literals = results.map((r) => r.literal);
    assert.ok(literals.includes("laugh"));
    assert.ok(literals.includes("nervous-laugh"));
  });

  it('finds metaphorical "happy" on smile / uze', () => {
    const results = searchLexicon(index, rows, "happy", { limit: 20 });
    const hit = results.find((r) => r.clarity === "uze");
    assert.ok(hit, "expected smile/uze among happy results");
    assert.equal(hit.literal, "smile");
    assert.ok(hit.matchFields.includes("metaphorical"));
  });

  it('finds clarity root "uze"', () => {
    const results = searchLexicon(index, rows, "uze", { limit: 10 });
    assert.ok(results.some((r) => r.clarity === "uze"));
    const top = results[0];
    assert.equal(top?.clarity, "uze");
    assert.ok(top?.matchFields.includes("clarity"));
  });
});
