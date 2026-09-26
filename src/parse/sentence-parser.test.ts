import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parseSentenceTokens, SentenceParseError } from "./sentence-parser.js";
import { tokenizeUtterance, tokensFromLexWords, punctToken } from "./tokenize.js";
import { classify } from "./classify.js";
import { parseWord } from "./word.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function tokens(text: string) {
  return tokenizeUtterance(text, tables);
}

describe("sentence-parser synthetic", () => {
  it("parses a lone subject-verb from classified words plus period", () => {
    const words = ["zazawan", "vawalal"].map((w) => classify(parseWord(w), tables));
    const stream = [...tokensFromLexWords(words), punctToken("period")];
    const result = parseSentenceTokens(stream);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });

  it("parses polar-only turn yael.", () => {
    const result = parseSentenceTokens(tokens("yael."));
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "yael");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses emphatic yul yul as one prohibition", () => {
    const result = parseSentenceTokens(tokens("yul yul vazanal."));
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.left.forceEcho?.raw, "yul");
    assert.equal(result.utterances[0]!.left.force?.raw, "yul");
    assert.equal(result.utterances[0]!.bodies.length, 1);
  });

  it("does not fold other repeated act words", () => {
    // A second turn starts only after a period; `yol` is not an echo like `yul yul`.
    const result = parseSentenceTokens(tokens("yol. yol vazanal."));
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[0]!.left.forceEcho, undefined);
    assert.throws(() => parseSentenceTokens(tokens("yol yol vazanal.")));
  });

  it("keeps a stance join fence after /th/ words", () => {
    const units = parseSentenceTokens(tokens("zazawan vawalal thuvuvum thul.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thuvuvum", "thul"]);
  });

  it("parses a standalone stance join with no /th/ words before it", () => {
    const units = parseSentenceTokens(tokens("yol zazawan vawalal thar.")).utterances[0]!.bodies[0]!.clause.units;
    const raws = units.flatMap((u) => (u.kind === "h" ? [u.unit.word.raw] : []));
    assert.deepEqual(raws, ["thar"]);
  });

  it("rejects leftover tokens after a complete clause", () => {
    assert.throws(() => parseSentenceTokens(tokens("zazawan vawalal xuxul.")), SentenceParseError);
  });
});
