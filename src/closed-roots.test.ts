import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { CLOSED, CLOSED_ENTRIES, closedDerived, namedEnglish, resyncClosedRootsSource, withLexiconClosedRoots } from "./closed-roots.js";
import { parsePublishedCsv } from "./lexicon-search.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = parsePublishedCsv(readFileSync(join(root, "data", "lexicon-published.csv"), "utf8"));
const rootByEmoji = new Map(rows.map((row) => [row.emoji, row.root]));

describe("closed roots", () => {
  it("spell each emoji's published root (run `npm run convert-word -- --lexicon` to resync)", () => {
    for (const entry of CLOSED_ENTRIES) {
      assert.equal(entry.root, rootByEmoji.get(entry.emoji), `${entry.name} ${entry.emoji}`);
    }
  });

  it("name each emoji once", () => {
    const emoji = CLOSED_ENTRIES.map((entry) => entry.emoji);
    assert.equal(new Set(emoji).size, emoji.length);
  });

  it("resync respells roots by emoji in one pass, never chaining", () => {
    const source = '  a: { emoji: "🦢", root: "aza" },\n  b: { emoji: "🦁", root: "ala" },\n  c: { emoji: "❓", root: "odo" },\n';
    // 🦢 takes 🦁's old spelling; a chained rewrite would move it on again.
    const result = resyncClosedRootsSource(source, new Map([["🦢", "ala"], ["🦁", "ebe"]]));
    assert.equal(result.text, '  a: { emoji: "🦢", root: "ala" },\n  b: { emoji: "🦁", root: "ebe" },\n  c: { emoji: "❓", root: "odo" },\n');
    assert.deepEqual(result.missing, ["❓"]);
    assert.equal(result.changes.length, 2);
  });

  it("names a root as its **-n** citation, capitalised", () => {
    assert.equal(namedEnglish("azawa"), "Azawan");
  });

  it("read as the lexicon in hand spells them, by emoji, and restore afterwards", () => {
    const swans = closedDerived(() => new Set([CLOSED.swan]));
    const before = CLOSED.swan;
    const other = new Map([["oxoxo", { emoji: "🦢", root: "oxoxo" }]]);
    withLexiconClosedRoots(other, () => {
      assert.equal(CLOSED.swan, "oxoxo");
      assert.ok(swans().has("oxoxo"));
      // An emoji the lexicon lacks keeps this file's spelling.
      assert.equal(CLOSED.lion, CLOSED_ENTRIES.find((entry) => entry.name === "lion")!.root);
    });
    assert.equal(CLOSED.swan, before);
    assert.ok(swans().has(before));
  });
});
