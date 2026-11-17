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
import { addReadingConstructions } from "./construction-trace.js";

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
  it("has one row per pair: 137 table rows, the binder, intention and force same-family statements, and 18 call rows", () => {
    assert.equal(PAIR_ROWS.length, 158);
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
    assert.deepEqual(scope!.frames.filter((f) => f.family === "force").map((f) => `${f.key} ${f.word.raw}`), ["edge:force yol", "edge:force yel"]);
    const acts = scope!.order.filter((o) => o.under.family === "force");
    assert.deepEqual(acts.map((o) => `${o.over.word.raw}>${o.under.word.raw} ${o.anchors[0]}`), ["yol>yel more-turn-words.md#stacked-acts"]);
  });

  it("a doubled act word is two frames that commute (more-turn-words.md#doubled-act)", () => {
    const [scope] = scopeOf("y-question | y-question | z-Azozon | v-walk | th-hope");
    assert.deepEqual(scope!.frames.map((f) => `${f.family} ${f.member ?? ""}`), ["force repeat", "force repeat", "attitude "]);
    assert.deepEqual(orders(scope!), ["attitude>force feelings.md#speaker-attitude", "attitude>force feelings.md#speaker-attitude"]);
    assert.deepEqual(scope!.unordered, []);
  });

  it("a phrase that brings in a new member orders by text against a binder (joins.md#everything-ua)", () => {
    const [each] = scopeOf("[[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O] | v-see");
    assert.deepEqual(each!.frames.map((f) => f.key), ["joinSeries:ua", "slot:newMember"]);
    assert.deepEqual(orders(each!), ["binder>binder clause.md#which-covers-which"]);
    assert.equal(each!.order[0]!.over.key, "joinSeries:ua");
    const [one] = scopeOf("[d-cat | d-tag.O] | [[z-everything | g-dog] | z-tag.A] | v-see");
    assert.equal(one!.order[0]!.over.key, "slot:newMember");
  });

  it("a named head brings in no new member; a plain `/b/` receiver and a hook's landmark do", () => {
    assert.deepEqual(scopeOf("z-Azozon | v-walk"), []);
    assert.deepEqual(scopeOf("[z-Azozon | z-dog | z-and] | v-walk"), []);
    const [receiver] = scopeOf("z-Azozon | v-tell | b-dog");
    assert.deepEqual(receiver!.frames.map((f) => f.key), ["slot:newMember"]);
    const [landmark] = scopeOf("z-Azozon | v-sleep | [in | b-house] | th-MAY");
    assert.deepEqual(landmark!.frames.map((f) => f.key), ["slot:newMember", "overlay:may:th"]);
    assert.deepEqual(orders(landmark!), ["binder>stance clause.md#which-covers-which"]);
  });

  it("a fill-ask blank asks and brings in no new member; two blanks make no pair (questions.md#fill-ask)", () => {
    const [both] = scopeOf("y-question | z-wh | d-wh | v-see");
    assert.deepEqual(both!.frames.map((f) => f.key), ["edge:force"]);
    assert.deepEqual(both!.unordered, []);
    const [landmark] = scopeOf("y-question | [in | b-wh] | z-dog | v-sleep");
    assert.deepEqual(landmark!.frames.map((f) => `${f.key} ${f.word.raw}`), ["edge:force yel", "slot:newMember zodozel"]);
  });

  it("a measure phrase gives an amount and brings in no new member; a counted noun does (measures-and-percent.md#units)", () => {
    // Only the subject *the cost* brings in a member; the unit with its amount does not.
    const [measure] = scopeOf("z-cost | [b-percentage-point | g-two] | v-rise");
    assert.deepEqual(measure!.frames.map((f) => `${f.key} ${f.word.pos}`), ["slot:newMember z"]);
    const [counted] = scopeOf("z-Azozon | v-tell | [b-dog | g-two]");
    assert.deepEqual(counted!.frames.map((f) => f.key), ["slot:newMember"]);
  });

  it("the words inside a title are a name's wording and bring in no new member (proper-names.md#titled-phrases)", () => {
    assert.deepEqual(scopeOf("NAME[d-tea | instead | d-coffee]"), []);
  });

  it("each phrase that brings in a new member has one frame on its first word (joins.md#everything-ua)", () => {
    const glosses = [
      "z-something | v-walk",
      "[z-person | z-something] | v-walk",
      "[z-Azozon | z-Alazun | z-something] | v-walk",
      "[z-dog | z-cat | z-and] | v-walk",
      "z-grace | v-walk",
      "z-peanut-x-butter | v-walk",
      "[z-cat-x | g-three] | v-walk",
      "z-Azozon | [v-see | v-eat | v-and | d-bird]",
    ];
    for (const gloss of glosses) {
      const [scope] = scopeOf(gloss);
      assert.deepEqual(scope?.frames.map((f) => f.key), ["slot:newMember"], gloss);
    }
  });

  it("a call commutes with every frame in its clause (speech-moves.md#vocative)", () => {
    const [scope] = scopeOf("y-Azozon | y-question | z-Azozon | v-walk | th-MAY");
    assert.deepEqual(scope!.frames.map((f) => f.family), ["call", "force", "stance"]);
    assert.deepEqual(orders(scope!), ["force>stance want-and-decide.md#whose-intention"]);
    assert.equal(pairRow("call", "holder")?.kind, "commutes");
    assert.equal(pairRow("call", "call")?.kind, "commutes");
  });

  it("a greeting has a greeting frame; a one-name answer after `yal` has none (word-endings.md#greeting)", () => {
    const [greeting] = scopeOf("Azozon");
    assert.deepEqual(greeting!.frames.map((f) => f.key), ["reading:greeting"]);
    const scopes = scopeOf("y-question | z-wh | v-walk . y-statement | Azozon");
    assert.ok(scopes.every((s) => s.frames.every((f) => f.key !== "reading:greeting")));
  });

  it("a bid on one's own name greets; under `/y/` it calls (conversation-length.md#conversation-length)", () => {
    const [bid] = scopeOf("Alazun-ask");
    assert.deepEqual(bid!.frames.map((f) => f.key), ["reading:greeting"]);
    const [call] = scopeOf("y-Alazun-minutes");
    assert.deepEqual(call!.frames.map((f) => f.key), ["edge:vocative"]);
  });

  it("the construction trace tags a greeting, not a one-name answer after an act word (questions.md#fill-ask)", () => {
    const tagged = (gloss: string): boolean => {
      const out = new Set<string>();
      addReadingConstructions(parse(glossToAgeben(gloss, tables, index), tables), out);
      return out.has("reading.greeting");
    };
    assert.equal(tagged("Azozon"), true);
    assert.equal(tagged("y-statement | Azozon"), false);
  });

  it("a turn with no body has its own record, by utterance", () => {
    const [scope] = scopeOf("y-Azozon | y-question");
    assert.equal(scope!.bodiless, true);
    assert.equal(scope!.utteranceIndex, 0);
    assert.deepEqual(scope!.frames.map((f) => f.family), ["call", "force"]);
    assert.deepEqual(scope!.order, []);
  });
});
