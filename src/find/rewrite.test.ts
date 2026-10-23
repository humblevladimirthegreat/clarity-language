import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { CLOSED } from "../closed-roots.js";
import { classify, loadDefaultTables, morphGlossLine } from "../parse/index.js";
import { parseWord } from "../parse/word.js";
import { collectPageSpans } from "./examples.js";
import { matchesTerm, parseTerm } from "./query.js";
import {
  parseMap,
  rewriteExample,
  rewriteMarkdownSpans,
  spliceWord,
  type FieldMaps,
} from "./rewrite.js";

const tables = loadDefaultTables();

function lex(raw: string) {
  return classify(parseWord(raw), tables);
}

function maps(...specs: string[]): FieldMaps {
  return specs.map(parseMap).reduce((into, add) => {
    for (const [field, table] of Object.entries(add)) {
      const slot = into[field as keyof FieldMaps] ?? new Map();
      for (const [from, to] of table!) slot.set(from, to);
      into[field as keyof FieldMaps] = slot;
    }
    return into;
  }, {} as FieldMaps);
}

function splice(raw: string, spec: string | FieldMaps) {
  return spliceWord(lex(raw), typeof spec === "string" ? parseMap(spec) : spec);
}

describe("parseMap", () => {
  it("reads one field and several pairs as a swap", () => {
    const { series } = parseMap("series=e:o,o:e");
    assert.deepEqual([...(series ?? [])], [
      ["e", "o"],
      ["o", "e"],
    ]);
  });
  it("reads several fields in one flag", () => {
    const parsed = parseMap("scope=a:u,u:a,answer=e:o");
    assert.equal(parsed.scope?.get("a"), "u");
    assert.equal(parsed.answer?.get("e"), "o");
  });
  it("rejects unknown fields and writing marker glyphs", () => {
    assert.throws(() => parseMap("xFamily=ability:sake"), /bad --map field/);
    assert.throws(() => parseMap("marker=#:_"), /writing glyphs/);
  });
});

describe("spliceWord", () => {
  it("swaps join series e and o on the original word", () => {
    const swap = maps("series=e:o,o:e");
    assert.deepEqual(splice("zol", swap), { kind: "changed", raw: "zel" });
    assert.deepEqual(splice("zel", swap), { kind: "changed", raw: "zol" });
  });
  it("splices stacked join series and a speech-act join", () => {
    assert.deepEqual(splice("yael", "series=ae:ao"), { kind: "changed", raw: "yaol" });
    assert.deepEqual(splice("yel", "series=e:o"), { kind: "changed", raw: "yol" });
  });
  it("splices a free hook form, not a join series", () => {
    assert.deepEqual(splice("ol", "form=ol:el"), { kind: "changed", raw: "el" });
    assert.deepEqual(splice("al", "series=a:o"), { kind: "same", raw: "al" });
    assert.deepEqual(splice("zol", "form=ol:el"), { kind: "same", raw: "zol" });
  });
  it("splices say scope and answer as two slots", () => {
    assert.deepEqual(splice("hwuvem", "answer=e:o"), { kind: "changed", raw: "hwuvom" });
    assert.deepEqual(splice("hwuvam", maps("scope=u:a", "answer=a:e")), { kind: "changed", raw: "hwavem" });
  });
  it("splices role scope, pointer vowels, and ability stance", () => {
    assert.deepEqual(splice("zwozeduyol", "scope=o:e"), { kind: "changed", raw: "zwezeduyol" });
    const pointer = maps("scope=a:u", "pointer=a:e,e:o,o:a");
    assert.deepEqual(splice("dwahar", pointer), { kind: "changed", raw: "dwuher" });
    assert.deepEqual(splice("vuzunoxel", "stance=e:o"), { kind: "changed", raw: "vuzunoxol" });
  });
  it("splices landmark facing pair scope", () => {
    assert.deepEqual(splice("gazuhothel", "scope=e:o"), { kind: "changed", raw: "gazuhothol" });
    assert.deepEqual(splice("gazuhothel", "stance=e:o"), { kind: "same", raw: "gazuhothel" });
  });
  it("splices speech number markers and leaves writing shorthand", () => {
    const swap = maps("marker=re:ro,ro:re");
    assert.deepEqual(splice("grodol", swap), { kind: "changed", raw: "gredol" });
    assert.deepEqual(splice("g#2", swap), { kind: "same", raw: "g#2" });
  });
  it("splices a numeric-prefix marker and not the host root", () => {
    assert.deepEqual(splice("zragexezuyol", "marker=ra:ru"), { kind: "changed", raw: "zrugexezuyol" });
  });
  it("splices a hook-prefix form's written vowels", () => {
    assert.deepEqual(splice("guoxuvuvul", "form=uol:ual"), { kind: "changed", raw: "guaxuvuvul" });
  });
  it("splices a hooked-join hook form, not the join series", () => {
    assert.deepEqual(splice("zexual", "form=el:ol"), { kind: "changed", raw: "zoxual" });
    assert.deepEqual(splice("zexual", "series=ua:ue"), { kind: "changed", raw: "zexuel" });
    assert.deepEqual(splice("zemxuam", "form=em:om"), { kind: "changed", raw: "zomxuam" });
    assert.deepEqual(splice("doxar", "form=ol:el"), { kind: "changed", raw: "dexar" });
  });
  it("splices a feeling locus and leaves sake stance", () => {
    assert.deepEqual(splice("wuwathuraer", "locus=ae:ao"), { kind: "changed", raw: "wuwathuraor" });
    assert.deepEqual(splice("wuwathuraer", "stance=u:a"), { kind: "changed", raw: "wuwatharaer" });
  });
  it("leaves a sake whose stance is not in the map", () => {
    const sake = `g${CLOSED.ballot}thal`;
    assert.deepEqual(splice(sake, "stance=e:o"), { kind: "same", raw: sake });
  });
});

const fixturePath = join(dirname(fileURLToPath(import.meta.url)), "fixtures/map-write.md");

describe("rewrite spans", () => {
  const joinMap = maps("series=e:o,o:e");
  const joinTerm = parseTerm("family=joinMarker,series=e|o");

  it("swaps join series in the fixture and does not rewrite a hook", () => {
    const page = readFileSync(fixturePath, "utf8");
    const { examples } = collectPageSpans(page, tables);
    const mixed = examples.find((e) => e.text.includes("el") && e.text.includes("zol"));
    assert.ok(mixed);
    const hits = mixed.words.flatMap((w, i) => (matchesTerm(w, joinTerm) ? [i] : []));
    const rewritten = rewriteExample(mixed, hits, joinMap);
    assert.deepEqual(
      rewritten.replacements.map((r) => [r.from, r.to]),
      [
        ["zol", "zel"],
        ["zel", "zol"],
      ],
    );
    assert.equal(rewritten.nextSource.includes(" ol "), true);
    assert.match(rewritten.nextSource, /zazozon zel vowurol ol buwen zol\./);
  });

  it("lists speech ordinals and not writing shorthand", () => {
    const page = readFileSync(fixturePath, "utf8");
    const { examples } = collectPageSpans(page, tables);
    const markerTerm = parseTerm("marker=re|ro");
    const markerMap = maps("marker=re:ro,ro:re");
    const listed: string[][] = [];
    for (const example of examples) {
      const hits = example.words.flatMap((w, i) => (matchesTerm(w, markerTerm) ? [i] : []));
      if (!hits.length) continue;
      listed.push(...rewriteExample(example, hits, markerMap).replacements.map((r) => [r.from, r.to]));
    }
    assert.deepEqual(listed, [["grodol", "gredol"]]);
  });

  it("writes the fixture, updates the morph line, and refuses an unparsable span", () => {
    const page = readFileSync(fixturePath, "utf8");
    const { examples } = collectPageSpans(page, tables);
    const patches = examples.flatMap((example) => {
      const hits = example.words.flatMap((w, i) => (matchesTerm(w, joinTerm) ? [i] : []));
      if (!hits.length) return [];
      const rewritten = rewriteExample(example, hits, joinMap);
      if (rewritten.nextSource === example.source) return [];
      return [{ example, nextSource: rewritten.nextSource }];
    });
    const out = rewriteMarkdownSpans(page, patches, tables);
    assert.equal(out.parseErrors.length, 0);
    assert.match(out.text, /zazozon zel vowurol ol buwen zol\./);
    assert.match(out.text, /zazozon zel vowurol\./);
    assert.equal(
      out.text.includes(morphGlossLine("zazozon zel vowurol.", tables)),
      true,
    );

    const bad = rewriteMarkdownSpans(
      page,
      patches.map((p) => ({ ...p, nextSource: "not-agebon %%%" })),
      tables,
    );
    assert.ok(bad.parseErrors.length > 0);
    assert.equal(bad.text, page);

    const mixed = rewriteMarkdownSpans(
      page,
      [
        patches[0]!,
        { example: patches[0]!.example, nextSource: "not-agebon %%%" },
      ],
      tables,
    );
    assert.ok(mixed.parseErrors.length > 0);
    assert.match(mixed.text, /zazozon zol vowurol/);
  });

  it("rewrites a teaching-stub hook and keeps the ellipsis", () => {
    const page = "Open with `el …` and `A ol B`.\n";
    const { examples } = collectPageSpans(page, tables);
    const dots = examples.find((e) => e.source.includes("…"));
    const shape = examples.find((e) => e.source.includes("A "));
    assert.ok(dots);
    assert.ok(shape);
    const formEl = parseTerm("family=hook,form=el");
    const formOl = parseTerm("family=hook,form=ol");
    const dotsHits = dots.words.flatMap((w, i) => (matchesTerm(w, formEl) ? [i] : []));
    const shapeHits = shape.words.flatMap((w, i) => (matchesTerm(w, formOl) ? [i] : []));
    assert.equal(rewriteExample(dots, dotsHits, maps("form=el:ol")).nextSource, "ol …");
    assert.equal(rewriteExample(shape, shapeHits, maps("form=ol:el")).nextSource, "A el B");
  });

  it("does not review a writing-marker stub when the map is speech-only", () => {
    const page = "`th#N` after a channel.\n";
    const { examples } = collectPageSpans(page, tables);
    const stub = examples.find((e) => e.source === "th#N");
    assert.ok(stub);
    const hits = stub.words.flatMap((w, i) => (matchesTerm(w, parseTerm("marker=re|ro")) ? [i] : []));
    const rewritten = rewriteExample(stub, hits, maps("marker=re:ro,ro:re"));
    assert.equal(rewritten.reviews.length, 0);
    assert.equal(rewritten.replacements.length, 0);
    assert.equal(rewritten.nextSource, "th#N");
  });

  it("rewrites a SELF conversation-length bid in the stored slot", () => {
    const page = "`SELFxen` a few minutes.\n";
    const { examples } = collectPageSpans(page, tables);
    const bid = examples.find((e) => e.source === "SELFxen");
    assert.ok(bid);
    const hits = bid.words.flatMap((w, i) => (matchesTerm(w, parseTerm("xFamily=ability")) ? [i] : []));
    const rewritten = rewriteExample(bid, hits, maps("stance=e:o"));
    assert.equal(rewritten.reviews.length, 0);
    assert.equal(rewritten.nextSource, "SELFxon");
    assert.deepEqual(
      rewritten.replacements.map((r) => [r.from, r.to]),
      [[`${CLOSED.microphone}xen`, `${CLOSED.microphone}xon`]],
    );
  });
});
