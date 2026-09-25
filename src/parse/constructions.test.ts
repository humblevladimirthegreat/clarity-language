import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { grammarHeadings } from "../lint/grammar-anchors.js";
import { sentenceGrammarKeys } from "./construction-trace.js";
import { constructionRegistry, REJECTIONS, SENTENCE_CONSTRUCTIONS } from "./constructions.js";
import { loadDefaultTables, parse } from "./index.js";

const CONSTRUCTIONS = constructionRegistry(loadDefaultTables().overlays.values());
import { sentenceGrammar } from "./sentence-parser.js";

const grammarDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "grammar");

describe("construction registry", () => {
  it("covers every sentence-grammar production, and only those", () => {
    const grammar = sentenceGrammarKeys(sentenceGrammar());
    const registered = new Set(Object.keys(SENTENCE_CONSTRUCTIONS).map((key) => `sentence.${key}`));
    assert.deepEqual([...grammar].filter((key) => !registered.has(key)).sort(), [], "grammar keys with no entry");
    assert.deepEqual([...registered].filter((key) => !grammar.has(key)).sort(), [], "entries with no grammar key");
  });

  it("gives every closed overlay row its own construction", () => {
    const overlays = [...loadDefaultTables().overlays.values()];
    assert.ok(overlays.length > 0);
    for (const o of overlays) assert.ok(CONSTRUCTIONS.has(`overlay.${o.senseForm}.${o.pos}`), `${o.senseForm} + ${o.pos}`);
  });

  // A registry anchor names its home section, so it must be that heading's own id
  // (docs/proposals/learning-order-check.md), not an <a id> inside the section.
  it("anchors resolve to a grammar page heading id", () => {
    const anchorsByPage = new Map<string, Set<string>>();
    const broken: string[] = [];
    const entries = [...CONSTRUCTIONS, ...Object.entries(REJECTIONS).map(([id, entry]) => [`reject.${id}`, entry] as const)];
    for (const [id, entry] of entries) {
      const [page, fragment] = entry.anchor.split("#");
      const path = join(grammarDir, page!);
      if (!fragment || !existsSync(path)) {
        broken.push(`${id}: ${entry.anchor}`);
        continue;
      }
      let anchors = anchorsByPage.get(page!);
      if (!anchors) {
        anchors = new Set(grammarHeadings(readFileSync(path, "utf8")).map((h) => h.id));
        anchorsByPage.set(page!, anchors);
      }
      if (!anchors.has(fragment)) broken.push(`${id}: ${entry.anchor}`);
    }
    assert.deepEqual(broken, []);
  });

  it("reports construction IDs, all registered", () => {
    const cases: [string, string][] = [
      ["zodogor vawalal.", "resolve.content.unbound"],
      ["jululon.", "token.jFallbackVocative"],
      ["zazawan vawalal.", "sentence.vpCoordPart.V"],
      ["zodogol gelem.", "reading.existence"],
      ["zodogol om banabal.", "reading.existence"],
      ["jol.", "reading.bareQuestion"],
      ["zazawan vawalal thodohom.", "overlay.odohom.th"],
      // A value or ability word uses the need / hostless-ability row of its host.
      ["zazawan vawalal thonogothem.", "overlay.onogom.th"],
      ["zazawan thegeraxel.", "overlay.egeram.th"],
      // Per-form features of families taught across sections.
      ["zazawan zululon zal vawalal.", "join.a"],
      ["jol zazawan vawalal.", "force.o"],
      ["zazawan vawalal hual.", "restrictor.always"],
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
