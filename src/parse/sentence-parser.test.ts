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

  it("parses polar-only turn jael.", () => {
    const result = parseSentenceTokens(tokens("jael."));
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "jael");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("rejects leftover tokens after a complete clause", () => {
    assert.throws(() => parseSentenceTokens(tokens("zazawan vawalal xuxul.")), SentenceParseError);
  });
});
