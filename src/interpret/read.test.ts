import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { parse } from "../parse/index.js";
import { PAIR_ROWS } from "../parse/scope.js";
import { allReadings, readParse, readText } from "./read.js";
import type { Frame, Reading, Term } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** Readings of a sentence written as morph gloss. */
function read(gloss: string): Reading[] {
  return readText(glossToAgeben(gloss, tables, index), tables);
}

const families = (reading: Reading): string[] => reading.frames.map((f) => f.family);
const orders = (reading: Reading): string[] => reading.order.map((o) => `${o.over.family}>${o.under.family} ${o.kind}`);
const frame = (reading: Reading, family: string): Frame => reading.frames.find((f) => f.family === family)!;

describe("reader: one fixture per frame family", () => {
  it("force and attitude: the act word's frame, the attitude outside the question", () => {
    const [reading] = read("y-question | th-hope | z-Azozon | v-walk");
    assert.deepEqual(families(reading!), ["force", "attitude"]);
    assert.equal(frame(reading!, "force").values.ask, "yesNo");
    assert.equal(frame(reading!, "attitude").anchor, "feelings.md#speaker-attitude");
  });

  it("polarity: a standalone /th/ join pairs by text order", () => {
    const [reading] = read("th-not | z-Azozon | v-walk | th-MAY");
    assert.deepEqual(families(reading!), ["polarity", "stance"]);
    assert.equal(frame(reading!, "polarity").key, "joinSeries:u:standalone");
  });

  it("say and binder: the say word's own fields are values", () => {
    const [reading] = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");
    assert.deepEqual(families(reading!), ["say", "binder", "polarity"]);
    const say = frame(reading!, "say").values;
    assert.ok(say.reach && say.part && say.answer, JSON.stringify(say));
  });

  it("stance and mirative: a channel and MIRATIVE commute, so no order is recorded", () => {
    const [reading] = read("th-CLUES | z-Azozon | v-walk | th-MIRATIVE");
    assert.deepEqual(families(reading!), ["stance", "mirative"]);
    assert.deepEqual(reading!.order, []);
  });

  it("holder: the holder seam over its stance, by word shape; the holder is the party", () => {
    const [reading] = read("z-Azozon | v-walk | th-not | th-MEMORY-Azozon");
    assert.deepEqual(families(reading!), ["polarity", "holder", "stance"]);
    assert.ok(orders(reading!).includes("holder>stance wordShape"));
    assert.equal(frame(reading!, "holder").party?.kind, "thing");
  });

  it("hinge: a `blarl` condition is the next sentence, through a grounds link", () => {
    const [reading, next] = read("y-question | th-MAY | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell");
    assert.deepEqual(families(reading!), ["force", "stance", "hinge"]);
    const grounds = reading!.links.find((l) => l.kind === "grounds");
    assert.equal(grounds?.to, next!.id);
    assert.equal(grounds?.frame, frame(reading!, "hinge"));
  });

  it("intention: WANT and ATTEMPT", () => {
    assert.deepEqual(families(read("th-WANT-unstated | z-Azozon | v-walk")[0]!), ["intention"]);
    assert.deepEqual(families(read("z-Azozon | h-ATTEMPT-trial | v-walk")[0]!), ["intention"]);
  });

  it("ability, phase, notional", () => {
    assert.deepEqual(families(read("z-Azozon | h-ABIL | v-walk")[0]!), ["ability"]);
    assert.deepEqual(families(read("z-Azozon | h-still | v-walk")[0]!), ["phase"]);
    assert.deepEqual(families(read("th-NOTIONAL | z-Azozon | v-walk")[0]!), ["notional"]);
  });

  it("residue and occasion: FORMER covers a restrictor wherever it sits (a rule)", () => {
    const [reading] = read("z-Azozon | h-always | v-sing | h-FORMER");
    assert.deepEqual(families(reading!), ["occasion", "residue"]);
    assert.deepEqual(orders(reading!), ["residue>occasion rule"]);
  });

  it("contrary: the zone's stance is held inside the frame, not a frame on the claim", () => {
    const [reading] = read("z-Azozon | v-walk | [contrary-to | th-plan-itinerary]");
    assert.deepEqual(families(reading!), ["contrary"]);
    assert.deepEqual(frame(reading!, "contrary").inner?.map((f) => f.family), ["intention"]);
  });

  it("sake: stays outside the question", () => {
    const [reading] = read("y-question | z-Azozon | v-walk | th-physical-met-any-term");
    assert.deepEqual(orders(reading!), ["sake>force rule"]);
  });

  it("bar: nests in its rank fence and never pairs", () => {
    const [reading] = read("[z-Azozon | th-PATTERN | z-rank/more | g-sleepy]");
    assert.deepEqual(reading!.order, []);
    const list = reading!.claim.roles.z as Extract<Term, { kind: "list" }>;
    assert.equal(list.kind, "list");
    const bar = list.members.find((m) => m.kind === "thing" && m.frames?.some((f) => f.family === "bar"));
    assert.ok(bar, "a bar frame on a member of the fence");
  });

  it("quote: a cite is a nested reading with its own claim", () => {
    const [reading] = read("z-Azozon | v-tell | d-CITE[z-Alazun | v-walk]");
    const quote = frame(reading!, "quote");
    assert.equal(quote.content?.length, 1);
    assert.equal(quote.content![0]!.claim.roles.z?.kind, "thing");
    assert.equal(reading!.claim.roles.d?.kind, "quote");
  });

  it("unknown: a word with no lexicon row is an unknown frame and an unread entry", () => {
    // Not a root: a string the lexicon does not hold.
    const [reading] = readText("zoyel.", tables);
    assert.deepEqual(families(reading!), ["unknown"]);
    assert.equal(reading!.unread[0]?.reason, "unknownWord");
  });
});

describe("reader: pair kinds copied from the resolve stage", () => {
  it("rule: text order, the earlier over the later", () => {
    const [reading] = read("h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk | th-not");
    assert.deepEqual(orders(reading!), ["say>binder rule", "say>polarity rule", "binder>polarity rule"]);
    assert.ok(reading!.order.every((o) => reading!.frames.includes(o.over) && reading!.frames.includes(o.under)));
  });

  it("word shape: the holder over its host", () => {
    const [reading] = read("z-Alazun | th-REPORTED-Azozon | v-departure | th-not");
    assert.ok(orders(reading!).includes("holder>stance wordShape"));
  });

  it("commutes: nothing recorded (see the stance fixture); unsettled: no row is unsettled today", () => {
    assert.deepEqual(PAIR_ROWS.filter((row) => row.kind === "unsettled"), []);
    for (const gloss of ["th-CLUES | z-Azozon | v-walk | th-MIRATIVE", "th-not | z-Azozon | v-walk | th-MAY"]) {
      assert.deepEqual(read(gloss)[0]!.unordered, []);
    }
  });
});

describe("reader: claim, links and nesting", () => {
  it("points into the parse tree, never a copy", () => {
    const result = parse(glossToAgeben("z-Azozon | v-walk", tables, index), tables);
    const [reading] = readParse(result, { tables });
    assert.equal(reading!.source.clause, result.utterances[0]!.bodies[0]!.clause);
    const z = reading!.claim.roles.z;
    assert.ok(z?.kind === "thing" && z.named);
    assert.equal(reading!.claim.verb?.kind, "thing");
  });

  it("a joined role is a list term", () => {
    const [reading] = read("[z-Azozon | z-Alazun | z-and] | v-walk");
    const z = reading!.claim.roles.z;
    assert.ok(z?.kind === "list" && z.members.length === 2);
  });

  it("lists nested readings with allReadings", () => {
    const readings = allReadings(read("z-Azozon | v-tell | d-CITE[z-Alazun | v-walk]"));
    assert.equal(readings.length, 2);
  });
});
