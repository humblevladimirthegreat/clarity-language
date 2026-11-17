import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { formatReadings, readingsJson } from "./cli.js";
import { readText } from "./read.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const read = (gloss: string) => readText(glossToAgeben(gloss, tables, index), tables);

describe("reading CLI formatting", () => {
  const readings = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");

  it("prints id, frames, order, claim", () => {
    const text = formatReadings(readings).join("\n");
    assert.match(text, /^t:0\.0$/m);
    assert.match(text, /^ {2}frame \S+ \S+ "/m);
    assert.match(text, /^ {2}order \S+ > \S+ \(rule\)$/m);
    assert.match(text, /^ {2}claim verb /m);
  });

  it("JSON has no cycles and words are position and text", () => {
    const parsed = JSON.parse(readingsJson(readings));
    const word = parsed[0].frames[0].words[0];
    assert.deepEqual(Object.keys(word).sort(), ["at", "text"]);
    assert.equal(typeof word.text, "string");
  });
});
