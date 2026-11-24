import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { parse } from "../parse/index.js";
import type { ParseResult } from "../parse/types.js";
import { coverage } from "./coverage.js";
import { allReadings, readParse } from "./read.js";
import type { Reading } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** A sentence written as morph gloss: its parse and its readings. */
function read(gloss: string): { result: ParseResult; readings: Reading[] } {
  const result = parse(glossToAgeben(gloss, tables, index), tables);
  return { result, readings: readParse(result, { tables }) };
}

const raws = (entries: { word: { raw: string } }[]): string[] => entries.map((e) => e.word.raw);

describe("coverage: every word lands in exactly one place", () => {
  it("a plain clause: every word is placed once", () => {
    const { result, readings } = read("z-Azozon | v-walk");
    const cover = coverage(result, readings);
    assert.equal(cover.words.length, 2);
    assert.deepEqual(raws(cover.missing), []);
    assert.deepEqual(raws(cover.doubled), []);
  });

  it("a dropped word is missing", () => {
    const { result, readings } = read("z-Azozon | v-walk");
    const subject = readings[0]!.claim.roles.z;
    assert.equal(subject?.kind, "thing");
    delete readings[0]!.claim.roles.z;
    const cover = coverage(result, readings);
    assert.deepEqual(raws(cover.missing), [subject.kind === "thing" ? subject.head.raw : ""]);
  });

  it("a word placed twice is doubled, with both places", () => {
    const { result, readings } = read("z-Azozon | v-walk");
    const claim = readings[0]!.claim;
    claim.predicate.push(claim.verb!);
    const cover = coverage(result, readings);
    assert.equal(cover.doubled.length, 1);
    assert.deepEqual(
      cover.doubled[0]!.places.map((p) => p.place),
      ["term:thing", "term:thing"],
    );
  });

  it("a frame copied into a later clause-join member is its word's earlier place: the act word, a binder", () => {
    const result = parse("yel zual gwozeduyol veduyol xam zazozon gwozeduyol xan zalazun vudurul.", tables);
    const readings = readParse(result, { tables });
    const keys = (id: string): string[] => allReadings(readings).find((r) => r.id === id)!.frames.map((f) => f.key);
    assert.deepEqual(keys("t:0.0/m2"), ["edge:force", "joinSeries:ua"], "the act word and the first member's binder reach the last member");
    const cover = coverage(result, readings);
    assert.deepEqual(raws(cover.missing), []);
    assert.deepEqual(raws(cover.doubled), []);
  });

  it("a second frame of the same word in one member is still doubled", () => {
    const result = parse("zual gwozeduyol veduyol xam zazozon gwozeduyol.", tables);
    const readings = readParse(result, { tables });
    const last = allReadings(readings).find((r) => r.id === "t:0.0/m1")!;
    last.frames.push({ ...last.frames.find((f) => f.key === "joinSeries:ua")! });
    const cover = coverage(result, readings);
    assert.deepEqual(raws(cover.doubled), ["zual"]);
  });

  it("a holder seam on its stance is one word in two fixed slots: one place", () => {
    const { result, readings } = read("z-Azozon | v-walk | th-not | th-MEMORY-Azozon");
    const reading = readings[0]!;
    assert.ok(reading.order.some((o) => o.kind === "wordShape"), "the holder over its stance by word shape");
    const cover = coverage(result, readings);
    assert.deepEqual(raws(cover.missing), []);
    assert.deepEqual(raws(cover.doubled), []);
  });
});
