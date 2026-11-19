import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { headingSlug } from "../lint/grammar-anchors.js";
import { inspectText } from "../parse/inspect.js";
import { loadDefaultTables } from "../parse/index.js";
import { FAMILY_TERMS, inspectNotes, notesForToken } from "./inspect-notes.js";

const tables = loadDefaultTables();

function notes(text: string) {
  const result = inspectText(text, tables);
  assert.ok(result.parsed, `${text} parses`);
  return inspectNotes(result.parsed, result.tokens, { tables });
}

describe("inspectNotes", () => {
  it("every family term is a heading on terminology.md", () => {
    const page = readFileSync("docs/grammar/terminology.md", "utf8");
    const slugs = new Set(
      [...page.matchAll(/^#{2,3} (.+?)(?: \{#([\w-]+)\})?$/gm)].map((m) => m[2] ?? headingSlug(m[1]!)),
    );
    for (const [family, { anchor }] of Object.entries(FAMILY_TERMS)) {
      const [file, slug] = anchor!.split("#");
      assert.equal(file, "terminology.md", family);
      assert.ok(slugs.has(slug!), `${family}: terminology.md#${slug}`);
    }
  });

  it("inspectText returns the parse it made, and none when the text does not parse", () => {
    assert.ok(inspectText("thomam zazozon vowurol.", tables).parsed);
    assert.equal(inspectText("zzz", tables).parsed, undefined);
  });

  it("knowing.md#may: one whole-clause frame gets a hover note and no sentence list", () => {
    const n = notes("thomam zazozon vowurol.");
    assert.equal(n.frames.length, 1);
    const may = n.frames[0]!;
    assert.equal(may.tokenIndex, 0);
    assert.equal(may.family, "stance");
    assert.equal(may.term, "Stance");
    assert.equal(may.termAnchor, "terminology.md#stance");
    assert.equal(may.anchor, "knowing.md#may");
    assert.equal(may.reach, "clause");
    assert.deepEqual(may.covers, []);
    assert.deepEqual(n.sentences, []);
  });

  it("universality.md#mood-on-one-adjective: an adjective-reach frame reaches only its adjective", () => {
    const n = notes("zazozon womam gerulol vowurol.");
    const may = notesForToken(n, 1);
    assert.equal(may.length, 1);
    assert.equal(may[0]!.reach, "adjective");
    assert.equal(may[0]!.reachLine, "only the adjective right after it");
    assert.deepEqual(n.sentences, []);
  });

  it("two whole-clause frames: the list says what covers what, copied from the reading's order", () => {
    const n = notes("thomam thalom zodozel gerulol.");
    const want = notesForToken(n, 1)[0]!;
    assert.equal(want.family, "intention");
    assert.deepEqual(notesForToken(n, 0)[0]!.covers, [1, 2]);
    assert.deepEqual(want.coveredBy, [0]);
    assert.equal(n.sentences.length, 1);
    const s = n.sentences[0]!;
    assert.deepEqual(s.frames, [0, 1, 2]);
    assert.deepEqual(
      s.covers.map((c) => [c.over, c.under]),
      [
        [0, 1],
        [0, 2],
        [1, 2],
      ],
    );
    assert.deepEqual(s.unsettled, []);
    assert.deepEqual(s.carried, []);
  });

  it("evidentiality.md#carry-forward: a carried channel is listed on the later sentence", () => {
    const n = notes("thugem zodozel gerulol. zodozel gerulol.");
    const later = n.sentences.find((s) => s.reading === "t:0.1");
    assert.ok(later);
    assert.equal(later.carried.length, 1);
    const carried = later.carried[0]!;
    assert.equal(carried.tokenIndex, 0);
    assert.equal(carried.family, "stance");
    assert.equal(carried.term, "Stance");
    assert.equal(carried.from, "t:0.0");
    assert.equal(carried.anchor, "evidentiality.md#carry-forward");
  });

  it("an unsettled pair is listed as not settled and never ordered", () => {
    const result = inspectText("thomam thalom zodozel gerulol.", tables);
    // No pair is unsettled in the pair table today, so the order is moved to `unordered` by hand, as equal.test.ts does.
    const parsed = result.parsed!;
    const order = parsed.resolve!.scope!;
    for (const clause of order) {
      clause.unordered = clause.order.map((o) => ({ frames: [o.under, o.over], anchors: o.anchors }));
      clause.order = [];
    }
    const n = inspectNotes(parsed, result.tokens, { tables });
    const s = n.sentences[0]!;
    assert.deepEqual(s.covers, []);
    assert.deepEqual(s.unsettled, [
      [1, 0],
      [2, 0],
      [2, 1],
    ]);
    assert.deepEqual(notesForToken(n, 0)[0]!.covers, []);
  });
});
