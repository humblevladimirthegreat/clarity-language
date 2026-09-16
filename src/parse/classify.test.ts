import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  classify,
  createClassifyTables,
  createClassifyTablesFromRows,
  knownLexiconRoots,
  lexiconContentRoots,
  unknownLexiconContentRoots,
} from "./classify.js";
import type { LexReading } from "./types.js";
import { parseWord } from "./word.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const overlayPath = join(rootDir, "data", "lexicon-overlays.csv");
const compoundsPath = join(rootDir, "data", "lexicon-compounds.csv");

const tables = createClassifyTables(
  readFileSync(publishedPath, "utf8"),
  readFileSync(overlayPath, "utf8"),
  readFileSync(compoundsPath, "utf8"),
);

function classifyText(text: string) {
  return classify(parseWord(text), tables);
}

function expectReading(text: string, reading: LexReading) {
  const word = classifyText(text);
  assert.equal(word.reading, reading, `${text} expected reading ${reading}, got ${word.reading}`);
  return word;
}

describe("classify", () => {
  it("overlay mood on published-shaped live evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "h" && /live evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectReading(`h${sense.senseForm}`, "mood");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /live/i);
  });

  it("overlay mood on published-shaped evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "h" && /witnessed evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectReading(`h${sense.senseForm}`, "mood");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /witnessed/i);
  });

  it("published ordinary on literal fishing manner", () => {
    const fishing = [...tables.published.values()].find((r) => r.literal === "fishing");
    assert.ok(fishing);
    const word = expectReading(`h${fishing.clarity}l`, "ordinary");
    assert.ok(word.rootGloss?.literal);
    assert.equal(word.overlay, undefined);
  });

  it("join-act and join-relation overlays", () => {
    expectReading("van", "joinAct");
    expectReading("gan", "joinRelation");
  });

  it("fence join marker is a join reading with series gloss", () => {
    const word = expectReading("zam", "join");
    assert.equal(word.family.kind, "joinMarker");
    assert.equal(word.rootGloss?.literal, "and (open)");
  });

  it("darl is a stand-in, not a fence join", () => {
    const word = expectReading("darl", "standIn");
    assert.equal(word.family.kind, "joinMarker");
    assert.equal(word.ending, "rl");
  });

  it("restrictor on defined core hal", () => {
    expectReading("hal", "restrictor");
  });

  it("join-relation overlay beats restrictor shape for han", () => {
    expectReading("han", "joinRelation");
  });

  it("number on free number word", () => {
    expectReading("g+3", "number");
  });

  it("ability on non-need host compound", () => {
    expectReading("vuzunexel", "ability");
  });

  it("greeting bid on citation or /j/ vocative, not ability", () => {
    expectReading("azawaxan", "greeting");
    expectReading("jazawaxan", "greeting");
    expectReading("jululoxen", "greeting");
    expectReading("uhubuxun", "greeting");
  });

  it("value on need host compounds; bare need root is ordinary", () => {
    expectReading("halodoxal", "value");
    expectReading("gonogoxal", "value");
    expectReading("hawerol", "ordinary");
  });

  it("hostless ability overlay", () => {
    const word = expectReading("hegeram", "ability");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, "egeram");
  });

  it("locative overlays on /h/ and ordinary picture on other letters", () => {
    const inside = expectReading("hogorem", "locative");
    assert.ok(inside.overlay);
    assert.equal(inside.overlay!.kind, "locative");
    assert.equal(inside.overlay!.gloss, "inside");
    const at = expectReading("hubuhum", "locative");
    assert.equal(at.overlay!.gloss, "at");
    const toward = expectReading("hobowam", "locative");
    assert.equal(toward.overlay!.gloss, "toward");
    const between = expectReading("gazadum", "locative");
    assert.equal(between.overlay!.gloss, "between");
    const pin = expectReading("zubuhul", "ordinary");
    assert.equal(pin.overlay, undefined);
  });

  it("of-relation overlays on /h/ /ɡ/ and ordinary pictures on other letters", () => {
    const part = expectReading("gobonem", "ofRelation");
    assert.ok(part.overlay);
    assert.equal(part.overlay!.kind, "of_relation");
    assert.equal(part.overlay!.gloss, "part-of");
    const contents = expectReading("hajaram", "ofRelation");
    assert.equal(contents.overlay!.gloss, "contents");
    const material = expectReading("gowodom", "ofRelation");
    assert.equal(material.overlay!.gloss, "material");
    const origin = expectReading("gajabam", "ofRelation");
    assert.equal(origin.overlay!.gloss, "origin");
    const bone = expectReading("zobonel", "ordinary");
    assert.equal(bone.overlay, undefined);
  });

  it("similative overlay on /h/ /ɡ/ and ordinary mirror on other letters", () => {
    const like = expectReading("hurorom", "similative");
    assert.ok(like.overlay);
    assert.equal(like.overlay!.kind, "similative");
    assert.equal(like.overlay!.gloss, "like");
    const adj = expectReading("gurorom", "similative");
    assert.equal(adj.overlay!.gloss, "like");
    const mirror = expectReading("zurorol", "ordinary");
    assert.equal(mirror.overlay, undefined);
    const mine = expectReading("zuroron", "mood");
    assert.equal(mine.overlay!.kind, "benchmark");
  });

  it("means overlay on /h/ /ɡ/ and ordinary hand on other letters", () => {
    const using = expectReading("hahanam", "means");
    assert.ok(using.overlay);
    assert.equal(using.overlay!.kind, "means");
    assert.equal(using.overlay!.gloss, "using");
    const adj = expectReading("gahanam", "means");
    assert.equal(adj.overlay!.gloss, "using");
    const hand = expectReading("zahanal", "ordinary");
    assert.equal(hand.overlay, undefined);
  });

  it("exchange overlay on /h/ /ɡ/ and ordinary booth on other letters", () => {
    const forPrice = expectReading("huhanem", "exchange");
    assert.ok(forPrice.overlay);
    assert.equal(forPrice.overlay!.kind, "exchange");
    assert.equal(forPrice.overlay!.gloss, "in-exchange-for");
    const adj = expectReading("guhanem", "exchange");
    assert.equal(adj.overlay!.gloss, "in-exchange-for");
    const booth = expectReading("zuhanel", "ordinary");
    assert.equal(booth.overlay, undefined);
    const verb = expectReading("vuhanem", "ordinary");
    assert.equal(verb.overlay, undefined);
  });

  it("proxy overlay on /h/ /ɡ/ and ordinary id-card on other letters", () => {
    const behalf = expectReading("hudagam", "proxy");
    assert.ok(behalf.overlay);
    assert.equal(behalf.overlay!.kind, "proxy");
    assert.equal(behalf.overlay!.gloss, "on-behalf-of");
    const adj = expectReading("gudagam", "proxy");
    assert.equal(adj.overlay!.gloss, "on-behalf-of");
    const card = expectReading("zudagal", "ordinary");
    assert.equal(card.overlay, undefined);
  });

  it("hosted judgment bars Mine and Everyone", () => {
    const mine = expectReading("zuroron", "mood");
    assert.ok(mine.overlay);
    assert.equal(mine.overlay!.kind, "benchmark");
    assert.equal(mine.overlay!.gloss, "Mine");
    const everyone = expectReading("zoloben", "mood");
    assert.ok(everyone.overlay);
    assert.equal(everyone.overlay!.senseForm, "oloben");
  });

  it("stock join zuan is a join, not Everyone", () => {
    const word = expectReading("zuan", "join");
    assert.equal(word.family.kind, "joinMarker");
    assert.equal(word.overlay, undefined);
  });

  it("unknown on foreign payload", () => {
    expectReading("d<english>l", "unknown");
  });

  it("published ordinary on speaker pronoun", () => {
    const word = expectReading("zugobon", "ordinary");
    assert.ok(word.rootGloss);
  });

  it("lexical compound lemma glosses as one kind", () => {
    const word = expectReading("zohohulabedel", "ordinary");
    assert.equal(word.family.kind, "content");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.literal, "bedroom");
    assert.equal(word.rootGloss?.metaphorical, "sanctum");
  });

  it("lexical compound beats accidental published substring match", () => {
    const word = expectReading("zeberelonogon", "ordinary");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.literal, "friend");
  });

  it("ordinary compound glosses both roots", () => {
    const sushi = tables.published.get(
      [...tables.published.values()].find((r) => r.literal === "sushi")?.clarity ?? "",
    );
    const coffee = tables.published.get(
      [...tables.published.values()].find((r) => r.literal === "coffee")?.clarity ?? "",
    );
    assert.ok(sushi && coffee);
    const word = expectReading(`z${sushi.clarity}x${coffee.clarity}n`, "ordinary");
    assert.equal(word.family.kind, "x");
    if (word.family.kind !== "x") return;
    assert.equal(word.family.xFamily, "compound");
    assert.equal(word.rootGloss?.literal, "sushi · coffee");
  });

  it("ordinary reviser without overlay", () => {
    const word = expectReading("al", "ordinary");
    assert.equal(word.family.kind, "reviser");
    assert.equal(word.overlay, undefined);
  });
});

describe("lexiconContentRoots", () => {
  it("collects content and compound hosts; skips spans, numbers, foreign", () => {
    const emptyKnown = knownLexiconRoots(createClassifyTablesFromRows([], []));
    assert.deepEqual(lexiconContentRoots(parseWord("zazawan")), ["azawa"]);
    assert.deepEqual(unknownLexiconContentRoots(parseWord("zazawan"), emptyKnown), ["azawa"]);
    assert.deepEqual(lexiconContentRoots(parseWord("daxal")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("g+3")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("d<sushi>")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("jal")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("xuxun")), []);
    assert.equal(unknownLexiconContentRoots(parseWord("zazawan"), knownLexiconRoots(tables)).length, 0);
  });
});
