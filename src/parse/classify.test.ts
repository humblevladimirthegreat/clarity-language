import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { classify, createClassifyTables } from "./classify.js";
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

  it("value on need host compounds and bare need topic", () => {
    expectReading("halodoxal", "value");
    expectReading("hawerol", "value");
  });

  it("hostless ability overlay", () => {
    const word = expectReading("hegeram", "ability");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, "egeram");
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
