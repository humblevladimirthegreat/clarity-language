import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { grammarAnchors } from "../lint/grammar-anchors.js";
import { sentenceGrammarKeys } from "./construction-trace.js";
import { CONSTRUCTIONS, SENTENCE_CONSTRUCTIONS } from "./constructions.js";
import { parse } from "./index.js";
import { sentenceGrammar } from "./sentence-parser.js";

const grammarDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "grammar");

describe("construction registry", () => {
  it("covers every sentence-grammar production, and only those", () => {
    const grammar = sentenceGrammarKeys(sentenceGrammar());
    const registered = new Set(Object.keys(SENTENCE_CONSTRUCTIONS).map((key) => `sentence.${key}`));
    assert.deepEqual([...grammar].filter((key) => !registered.has(key)).sort(), [], "grammar keys with no entry");
    assert.deepEqual([...registered].filter((key) => !grammar.has(key)).sort(), [], "entries with no grammar key");
  });

  it("anchors resolve to a grammar page heading or <a id>", () => {
    const anchorsByPage = new Map<string, Set<string>>();
    const broken: string[] = [];
    for (const [id, entry] of CONSTRUCTIONS) {
      const [page, fragment] = entry.anchor.split("#");
      const path = join(grammarDir, page!);
      if (!fragment || !existsSync(path)) {
        broken.push(`${id}: ${entry.anchor}`);
        continue;
      }
      let anchors = anchorsByPage.get(page!);
      if (!anchors) {
        anchors = grammarAnchors(readFileSync(path, "utf8"));
        anchorsByPage.set(page!, anchors);
      }
      if (!anchors.has(fragment)) broken.push(`${id}: ${entry.anchor}`);
    }
    assert.deepEqual(broken, []);
  });

  it("reports construction IDs, all registered", () => {
    const cases: [string, string][] = [
      ["zazawan vawalal hogobor.", "resolve.content.unbound"],
      ["jelel.", "token.jFallbackVocative"],
      ["zazawan vawalal.", "sentence.vpCoordPart.V"],
    ];
    for (const [input, expected] of cases) {
      const ids = parse(input, undefined, { constructions: true }).constructions ?? [];
      assert.ok(ids.includes(expected), `${input} → ${ids.join(" ")}`);
      for (const id of ids) assert.ok(CONSTRUCTIONS.has(id), `unregistered ${id} from ${input}`);
    }
  });

  it("stays off by default", () => {
    assert.equal(parse("zazawan vawalal.").constructions, undefined);
  });
});
