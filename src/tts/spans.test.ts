import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseWord } from "../parse/word.js";
import { expandOpaqueSpan, expandWritingSpan } from "./spans.js";
import { expandWordToTokens } from "./plan.js";

describe("expandWritingSpan", () => {
  it("maps atomic cite d[hi] to daxol", () => {
    const word = parseWord("d[hi]");
    const tokens = expandWritingSpan(word, expandWordToTokens);
    assert.deepEqual(
      tokens.filter((t) => t.kind === "word").map((t) => (t.kind === "word" ? t.raw : "")),
      ["daxol"],
    );
    assert.ok(tokens.some((t) => t.kind === "skip" && t.raw === "hi"));
  });

  it("maps anaphor d[=] to daxur", () => {
    const tokens = expandWritingSpan(parseWord("d[=]"), expandWordToTokens);
    assert.deepEqual(tokens, [{ kind: "word", raw: "daxur" }]);
  });

  it("maps empty d[] to daxul", () => {
    const tokens = expandWritingSpan(parseWord("d[]"), expandWordToTokens);
    assert.deepEqual(tokens, [{ kind: "word", raw: "daxul" }]);
  });

  it("maps proper atomic cite d@[Hamlet] to daxon", () => {
    const tokens = expandWritingSpan(parseWord("d@[Hamlet]"), expandWordToTokens);
    assert.deepEqual(
      tokens.filter((t) => t.kind === "word").map((t) => (t.kind === "word" ? t.raw : "")),
      ["daxon"],
    );
  });

  it("maps multi-token cite with xuxul close", () => {
    const tokens = expandWritingSpan(parseWord("d[zadagal zagadal]"), expandWordToTokens);
    assert.deepEqual(
      tokens.filter((t) => t.kind === "word").map((t) => (t.kind === "word" ? t.raw : "")),
      ["daxal", "zadagal", "zagadal", "xuxul"],
    );
  });
});

describe("expandOpaqueSpan", () => {
  it("maps d<sushi> to duxol with foreign skip", () => {
    const tokens = expandOpaqueSpan(parseWord("d<sushi>"));
    assert.deepEqual(
      tokens.filter((t) => t.kind === "word").map((t) => (t.kind === "word" ? t.raw : "")),
      ["duxol"],
    );
    assert.ok(tokens.some((t) => t.kind === "skip" && t.raw === "sushi"));
  });
});
