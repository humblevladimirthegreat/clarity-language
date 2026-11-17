import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { fullGlossIndex } from "../game/build.js";
import { glossToAgeben } from "./gloss-inverse.js";
import { parse } from "./index.js";
import { FRAME_KEYS, PAIR_ROWS, pairRow, type ClauseScope } from "./scope.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
/** Every root and closed form, plus the grammar docs' own words (numbers, sake words, holders). */
const index = fullGlossIndex(tables);

/** Scope records of a sentence written as morph gloss. */
function scopeOf(gloss: string): ClauseScope[] {
  const text = glossToAgeben(gloss, tables, index);
  return parse(text, tables).resolve?.scope ?? [];
}

/** `over>under` per order, with the first anchor. */
function orders(scope: ClauseScope): string[] {
  return scope.order.map((o) => `${o.over.family}>${o.under.family} ${o.anchors[0]}`);
}

describe("scope tables (interpreter.md#pair-table)", () => {
  it("has one row per pair: 137 table rows plus the binder and intention same-family statements", () => {
    assert.equal(PAIR_ROWS.length, 139);
    const keys = new Set(PAIR_ROWS.map((row) => [...row.pair].sort().join("|")));
    assert.equal(keys.size, PAIR_ROWS.length);
  });

  it("keeps the table's one unsettled pair, polarity × holder", () => {
    assert.equal(pairRow("holder", "polarity")?.kind, "unsettled");
  });

  it("marks adjective-reach and list-reach forms as not pairing", () => {
    assert.equal(FRAME_KEYS["overlay:may:w"]?.reach, "adjective");
    assert.equal(FRAME_KEYS["joinSeries:u"]?.reach, "list");
    assert.equal(FRAME_KEYS["joinSeries:u:standalone"]?.reach, "clause");
  });
});

describe("scope order (clause.md#which-covers-which)", () => {
  it("text order: the earlier of two whole-clause frames covers the later", () => {
    const [scope] = scopeOf("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");
    assert.deepEqual(scope!.frames.map((f) => f.family), ["say", "binder", "polarity"]);
    assert.deepEqual(orders(scope!), [
      "say>binder clause.md#which-covers-which",
      "say>polarity clause.md#which-covers-which",
      "binder>polarity clause.md#which-covers-which",
    ]);
  });

  it("text order the other way round", () => {
    const [scope] = scopeOf("th-not | z-Azozon | h-always | v-walk");
    assert.deepEqual(orders(scope!), ["polarity>occasion clause.md#which-covers-which"]);
  });

  it("a sake word and an attitude stay outside the question (for-a-sake.md#whose-stake, feelings.md#speaker-attitude)", () => {
    const [sake] = scopeOf("y-question | z-Azozon | v-walk | th-physical-met-any-term");
    assert.deepEqual(orders(sake!), ["sake>force for-a-sake.md#whose-stake"]);
    const [attitude] = scopeOf("y-question | th-hope | z-Azozon | v-walk");
    assert.deepEqual(orders(attitude!), ["attitude>force feelings.md#speaker-attitude"]);
  });

  it("force covers a stance; MAY covers the hinge kept last", () => {
    const [scope] = scopeOf("y-question | th-MAY | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell");
    assert.deepEqual(orders(scope!), [
      "force>stance want-and-decide.md#whose-intention",
      "force>hinge causation.md#if",
      "stance>hinge clause.md#which-covers-which",
    ]);
  });

  it("a channel covers a binder wherever it sits; MAY follows text order", () => {
    const [channel] = scopeOf("[z-everything | g-dog] | v-walk | th-CLUES");
    assert.deepEqual(orders(channel!), ["stance>binder usually-vs-must.md#generalization"]);
    const [may] = scopeOf("[z-everything | g-dog] | v-walk | th-MAY");
    assert.deepEqual(orders(may!), ["binder>stance clause.md#which-covers-which"]);
  });

  it("FORMER covers a restrictor wherever it sits; RESIDUE follows text order", () => {
    const [former] = scopeOf("z-Azozon | h-always | v-sing | h-FORMER");
    assert.deepEqual(orders(former!), ["residue>occasion residue-and-former.md#residue-and-former-climate"]);
    const [residue] = scopeOf("h-RESIDUE | z-Azozon | v-walk | h-always");
    assert.deepEqual(orders(residue!), ["residue>occasion clause.md#which-covers-which"]);
  });

  it("MAY right before a /th/ word cites the phasal rule", () => {
    const [scope] = scopeOf("z-Alazun | th-MAY | th-not-yet | v-departure");
    assert.deepEqual(scope!.order[0]!.anchors, ["clause.md#which-covers-which", "already-still-yet.md#phasal"]);
  });

  it("a channel and MIRATIVE commute: no order recorded", () => {
    const [scope] = scopeOf("th-CLUES | z-Azozon | v-walk | th-MIRATIVE");
    assert.equal(scope!.frames.length, 2);
    assert.deepEqual(scope!.order, []);
    assert.deepEqual(scope!.unordered, []);
  });

  it("a holder covers its own stance by word shape; holder × polarity stays unordered", () => {
    const [scope] = scopeOf("z-Alazun | th-REPORTED-Azozon | v-departure | th-not");
    assert.deepEqual(scope!.frames.map((f) => f.family), ["holder", "stance", "polarity"]);
    assert.deepEqual(
      scope!.order.map((o) => `${o.over.family}>${o.under.family} ${o.kind}`),
      ["holder>stance wordShape", "stance>polarity rule"],
    );
    assert.deepEqual(scope!.unordered.map((u) => u.frames.map((f) => f.family)), [["holder", "polarity"]]);
  });
});
