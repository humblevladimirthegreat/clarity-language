import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import { expandWritingSpan } from "./spans.js";
import { expandWordToTokens } from "./plan.js";

const spoken = (text: string): string[] =>
  expandWritingSpan(parseWord(text), expandWordToTokens)
    .filter((t) => t.kind === "word")
    .map((t) => (t.kind === "word" ? t.raw : ""));

describe("expandWritingSpan", () => {
  it("speaks a cite's words and nothing for the brackets", () => {
    assert.deepEqual(spoken("d[zadagal zagadul]"), ["zadagal", "zagadul"]);
  });

  it("skips a foreign interior as foreign", () => {
    const tokens = expandWritingSpan(parseWord("d[hi]"), expandWordToTokens);
    assert.deepEqual(spoken("d[hi]"), []);
    assert.ok(tokens.some((t) => t.kind === "skip" && t.raw === "hi"));
  });

  it("gives marks no spoken word", () => {
    assert.deepEqual(spoken("d@[zadagal zagadul]"), ["zadagal", "zagadul"]);
    assert.deepEqual(spoken("d~[zadagal]"), ["zadagal"]);
  });

  it("skips an opaque <…> interior", () => {
    const tokens = expandWritingSpan(parseWord("d<sushi>"), expandWordToTokens);
    assert.deepEqual(spoken("d<sushi>"), []);
    assert.ok(tokens.some((t) => t.kind === "skip" && t.raw === "sushi"));
  });
});
