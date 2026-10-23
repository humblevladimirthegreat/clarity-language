import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { loadDefaultTables } from "../parse/index.js";
import { parseTerm } from "./query.js";
import { parseMap, rewriteExample, rewritePlainSpans } from "./rewrite.js";
import { collectFileSpans, listFindFiles, skipWorthListing } from "./walk.js";

const tables = loadDefaultTables();
const here = dirname(fileURLToPath(import.meta.url));
const fixtureTs = join(here, "fixtures/map-write.ts");
const fixtureTsv = join(here, "fixtures/map-write.tsv");

describe("listFindFiles", () => {
  it("skips src/retie and find fixtures on a directory walk", () => {
    const listed = listFindFiles("src").map((f) => f.replace(/\\/g, "/"));
    assert.ok(listed.some((f) => f.endsWith("src/parse/word.test.ts")));
    assert.ok(!listed.some((f) => f.includes("src/retie/")));
    assert.ok(!listed.some((f) => f.includes("src/find/fixtures/")));
  });

  it("still opens an explicit fixture path", () => {
    assert.deepEqual(listFindFiles(fixtureTs), [fixtureTs]);
  });
});

describe("source and TSV spans", () => {
  it("rewrites a parse-test literal the same way as a docs span", () => {
    const source = readFileSync(fixtureTs, "utf8");
    const { examples } = collectFileSpans(fixtureTs, source, tables);
    const sentence = examples.find((e) => e.text.includes("zol"));
    assert.ok(sentence);
    const hits = sentence.words.flatMap((w, i) => (w.word.raw === "zol" ? [i] : []));
    assert.ok(hits.length);
    const rewritten = rewriteExample(sentence, hits, parseMap("series=e:o,o:e"));
    assert.deepEqual(
      rewritten.replacements.map((r) => [r.from, r.to]),
      [["zol", "zel"]],
    );
    const out = rewritePlainSpans(source, [{ example: sentence, nextSource: rewritten.nextSource }], tables);
    assert.equal(out.parseErrors.length, 0);
    assert.match(out.text, /zuzozen zel vowurel\./);
    assert.equal(out.text.includes(sentence.source), false);
  });

  it("rewrites a TSV cell", () => {
    const text = readFileSync(fixtureTsv, "utf8");
    const { examples } = collectFileSpans(fixtureTsv, text, tables);
    const cell = examples.find((e) => e.text.includes("zol"));
    assert.ok(cell);
    const hits = cell.words.flatMap((w, i) => (w.word.raw === "zol" ? [i] : []));
    const rewritten = rewriteExample(cell, hits, parseMap("series=e:o"));
    const out = rewritePlainSpans(text, [{ example: cell, nextSource: rewritten.nextSource }], tables);
    assert.match(out.text, /zuzozen zol vowurel\./);
  });

  it("does not list a lone letter as a skip for a hook form map", () => {
    const skip = skipWorthListing(
      { text: "z", index: 0, cls: "word" },
      [{ kind: "word", term: parseTerm("family=hook,form=ol") }],
      parseMap("form=ol:el"),
      tables,
    );
    assert.equal(skip, false);
  });

  it("lists an unparsed span that holds a mapped hook", () => {
    const skip = skipWorthListing(
      { text: "ol ???", index: 0, cls: "phrase" },
      [{ kind: "word", term: parseTerm("family=hook,form=ol") }],
      parseMap("form=ol:el"),
      tables,
    );
    assert.equal(skip, true);
  });
});
