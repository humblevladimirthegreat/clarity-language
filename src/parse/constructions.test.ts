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
      ["zudozor vowurel.", "resolve.content.unbound"],
      ["yolazun.", "token.yVocative"],
      ["yemol.", "token.yInterjection"],
      ["zuzozen vowurel.", "sentence.vpCoordPart.V"],
      ["zudozol gelazom.", "reading.existence"],
      ["zudozol om babohal.", "reading.existence"],
      ["zuan gagozol guzemol.", "reading.kind"],
      ["yol.", "reading.bareQuestion"],
      ["zuzozen vowurel thomam.", "overlay.omam.th"],
      // A sake or ability word uses the sake / hostless-ability row of its host.
      ["zuzozen vowurel thawothem.", "overlay.awom.th"],
      ["zuzozen hodaxel.", "overlay.odam.h"],
      // Per-form features of families taught across sections.
      ["zuzozen zolazun zal vowurel.", "join.a"],
      ["yol zuzozen vowurel.", "force.o"],
      ["zuzozen vowurel hual.", "restrictor.always"],
    ];
    for (const [input, expected] of cases) {
      const ids = parse(input, undefined, { constructions: true }).constructions ?? [];
      assert.ok(ids.includes(expected), `${input} → ${ids.join(" ")}`);
      for (const id of ids) assert.ok(CONSTRUCTIONS.has(id), `unregistered ${id} from ${input}`);
    }
  });

  it("reads a used-by noun, a join of names, or every + kind with /ɡ/ as a property, not existence", () => {
    for (const input of ["zagozol gubulol em buwon.", "zudozor gelazom."]) {
      const ids = parse(input, undefined, { constructions: true }).constructions ?? [];
      assert.ok(!ids.includes("reading.existence"), `${input} → ${ids.join(" ")}`);
    }
    for (const input of ["zual gohalaxowulal gozudal.", "zuam gagozol gozudal.", "zuan gagozol gozudal."]) {
      const every = parse(input, undefined, { constructions: true }).constructions ?? [];
      assert.ok(!every.includes("reading.existence"), `${input} → ${every.join(" ")}`);
    }
    const both = parse("zuzozen zolazun zal gamahum.", undefined, { constructions: true }).constructions ?? [];
    assert.ok(!both.includes("reading.existence"), both.join(" "));
    const ids = parse("zagozol em buwon.", undefined, { constructions: true }).constructions ?? [];
    assert.ok(ids.includes("reading.existence"), ids.join(" "));
  });

  it("reads a label after a hosted /b/ as an adjective on the landmark, not an offset amount", () => {
    const ids = parse("zuzozen vowurel herem bavuvam g_1962.", undefined, { constructions: true }).constructions ?? [];
    assert.ok(!ids.includes("sentence.hUnitRule.G"), ids.join(" "));
    assert.ok(ids.includes("sentence.gPackage.G"), ids.join(" "));
  });

  it("stays off by default", () => {
    assert.equal(parse("zuzozen vowurel.").constructions, undefined);
  });
});
