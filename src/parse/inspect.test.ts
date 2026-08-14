import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { inspectText } from "./inspect.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
);

describe("inspectText", () => {
  it("tokenizes zazawan with PoS, named ending, and published gloss", () => {
    const result = inspectText("zazawan vawul.", tables);
    const first = result.tokens[0];
    assert.equal(first?.kind, "word");
    if (first?.kind !== "word") return;
    assert.equal(first.raw, "zazawan");
    assert.equal(first.word.pos, "z");
    assert.equal(first.word.ending, "n");
    assert.ok(first.gloss.length > 0);
    assert.ok(first.chips.some((chip) => chip.startsWith("/z/")));
    assert.ok(first.chips.some((chip) => chip.includes("-n")));
    assert.equal(result.sentenceWarning, undefined);

    const punct = result.tokens.at(-1);
    assert.equal(punct?.kind, "punct");
    if (punct?.kind === "punct") assert.equal(punct.punct, "period");
  });

  it("uses overlay definition for closed mood", () => {
    const result = inspectText("huhunum", tables);
    const token = result.tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.word.reading, "mood");
    assert.match(token.gloss, /witnessed/i);
  });

  it("marks unknown foreign payloads", () => {
    const result = inspectText("d<english>l", tables);
    const token = result.tokens[0];
    assert.equal(token?.kind, "word");
    if (token?.kind !== "word") return;
    assert.equal(token.word.reading, "unknown");
    assert.equal(token.gloss, "unknown root");
  });

  it("keeps a Peggy failure as an error token beside valid words", () => {
    const result = inspectText("zazawan zolex1l vawul.", tables);
    const kinds = result.tokens.map((token) => token.kind);
    assert.deepEqual(kinds, ["word", "error", "word", "punct"]);
    const err = result.tokens[1];
    assert.equal(err?.kind, "error");
    if (err?.kind !== "error") return;
    assert.equal(err.raw, "zolex1l");
    assert.ok(err.error.message.length > 0);
    assert.equal(result.sentenceWarning, undefined);
  });

  it("surfaces a sentence warning when words parse but the clause does not", () => {
    const result = inspectText("zazawan vawul xuxul.", tables);
    assert.ok(result.tokens.some((token) => token.kind === "word"));
    assert.ok(result.sentenceWarning);
  });
});
