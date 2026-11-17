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
  it("has one row per pair: 137 table rows plus the binder, intention and force same-family statements", () => {
    assert.equal(PAIR_ROWS.length, 140);
    const keys = new Set(PAIR_ROWS.map((row) => [...row.pair].sort().join("|")));
    assert.equal(keys.size, PAIR_ROWS.length);
  });

  it("has no unsettled pair; polarity × holder is fixed by a rule, holder over", () => {
    assert.deepEqual(PAIR_ROWS.filter((row) => row.kind === "unsettled"), []);
    assert.equal(pairRow("holder", "polarity")?.kind, "rule");
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

  it("a standalone join and a stance frame pair by text order, both ways (verb-and-stance-joins.md#stance-join-reach)", () => {
    const [before] = scopeOf("th-MAY | z-Azozon | v-walk | th-not");
    assert.deepEqual(orders(before!), ["stance>polarity clause.md#which-covers-which"]);
    const [after] = scopeOf("th-not | z-Azozon | v-walk | th-MAY");
    assert.deepEqual(orders(after!), ["polarity>stance clause.md#which-covers-which"]);
  });

  it("a join right after a stance word is that word's list, not a frame", () => {
    const [scope] = scopeOf("z-Azozon | v-walk | [th-MAY | th-not]");
    assert.deepEqual(scope!.frames.map((f) => f.family), ["stance"]);
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

  it("a channel and a binder follow text order: first the whole generalization, after it each case", () => {
    const [whole] = scopeOf("th-PATTERN.strong | [z-everything | g-cat] | v-sleep");
    assert.deepEqual(orders(whole!), ["stance>binder clause.md#which-covers-which"]);
    assert.deepEqual(whole!.order[0]!.anchors, ["clause.md#which-covers-which", "usually-vs-must.md#generalization"]);
    const [each] = scopeOf("[z-everything | g-cat] | v-sleep | th-LIVE.strong");
    assert.deepEqual(orders(each!), ["binder>stance clause.md#which-covers-which"]);
    const [may] = scopeOf("[z-everything | g-dog] | v-walk | th-MAY");
    assert.deepEqual(orders(may!), ["binder>stance clause.md#which-covers-which"]);
  });

  it("a channel and a restrictor follow text order", () => {
    const [whole] = scopeOf("th-PATTERN.weak | z-Azozon | h-always | v-walk");
    assert.deepEqual(orders(whole!), ["stance>occasion clause.md#which-covers-which"]);
    const [each] = scopeOf("z-Azozon | h-always | v-walk | th-PATTERN.weak");
    assert.deepEqual(orders(each!), ["occasion>stance clause.md#which-covers-which"]);
  });

  it("MAY and a binder follow text order", () => {
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

  it("a holder covers its own stance by word shape and a standalone join by rule", () => {
    const [scope] = scopeOf("z-Alazun | th-REPORTED-Azozon | v-departure | th-not");
    assert.deepEqual(scope!.frames.map((f) => f.family), ["holder", "stance", "polarity"]);
    assert.deepEqual(
      scope!.order.map((o) => `${o.over.family}>${o.under.family} ${o.kind}`),
      ["holder>stance wordShape", "holder>polarity rule", "stance>polarity rule"],
    );
    assert.deepEqual(scope!.unordered, []);
  });

  it("a standalone join before the holder's stance is still the holder's (holder.md#holder)", () => {
    const [scope] = scopeOf("z-Azozon | v-walk | th-not | th-MEMORY-Azozon");
    assert.ok(orders(scope!).includes("holder>polarity holder.md#holder"));
    assert.deepEqual(scope!.unordered, []);
  });

  it("each of two stacked act words is a frame; the first, the real act, covers the second (more-turn-words.md#stacked-acts)", () => {
    const [scope] = scopeOf("y-command | y-question | v-punch | d-box | z-listener");
    assert.deepEqual(scope!.frames.map((f) => `${f.key} ${f.word.raw}`), ["edge:force yol", "edge:force yel"]);
    assert.deepEqual(scope!.order.map((o) => `${o.over.word.raw}>${o.under.word.raw} ${o.anchors[0]}`), ["yol>yel more-turn-words.md#stacked-acts"]);
  });

  it("a doubled act word is two frames that commute (more-turn-words.md#doubled-act)", () => {
    const [scope] = scopeOf("y-question | y-question | z-Azozon | v-walk | th-hope");
    assert.deepEqual(scope!.frames.map((f) => `${f.family} ${f.member ?? ""}`), ["force repeat", "force repeat", "attitude "]);
    assert.deepEqual(orders(scope!), ["attitude>force feelings.md#speaker-attitude", "attitude>force feelings.md#speaker-attitude"]);
    assert.deepEqual(scope!.unordered, []);
  });
});
