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
  it("emotion tail on a sake root; same shape on another root is a viewpoint lateral", () => {
    const fused = classifyText("guduthamol");
    assert.equal(fused.family.kind === "x" && fused.family.xFamily, "sake");
    const lateral = classifyText("gewezethamol");
    assert.deepEqual(lateral.family, { kind: "x", xFamily: "lateral", leftRoots: ["eweze"], rightRoots: ["amo"] });
  });

  it("overlay mood on published-shaped live evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /live evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectReading(`th${sense.senseForm}`, "mood");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /live/i);
  });

  it("overlay mood on published-shaped evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /witnessed evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectReading(`th${sense.senseForm}`, "mood");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /witnessed/i);
  });

  it("published ordinary on literal fishing manner", () => {
    const fishing = [...tables.published.values()].find((r) => r.concrete === "fishing");
    assert.ok(fishing);
    const word = expectReading(`h${fishing.clarity}l`, "ordinary");
    assert.ok(word.rootGloss?.concrete);
    assert.equal(word.overlay, undefined);
  });

  it("overlay mood on residue and former-climate", () => {
    const residue = expectReading("thamom", "mood");
    assert.equal(residue.overlay?.kind, "residue");
    assert.equal(residue.overlay?.gloss, "RESIDUE");
    const former = expectReading("thunem", "mood");
    assert.equal(former.overlay?.kind, "former_climate");
    assert.equal(former.overlay?.gloss, "FORMER");
  });

  it("join-act and join-relation overlays", () => {
    expectReading("van", "joinAct");
    expectReading("gan", "joinRelation");
  });

  it("fence join marker is a join reading with series gloss", () => {
    const word = expectReading("zam", "join");
    assert.equal(word.family.kind, "joinMarker");
    assert.equal(word.rootGloss?.concrete, "and (open)");
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

  it("ability on non-sake host compound", () => {
    expectReading("vahawaxel", "ability");
  });

  it("greeting bid on citation or /y/ vocative, not ability", () => {
    expectReading("azawaxan", "greeting");
    expectReading("yazawaxan", "greeting");
    expectReading("yalahexen", "greeting");
    expectReading("ahabexun", "greeting");
  });

  it("sake on sake host compounds; bare sake root is ordinary", () => {
    expectReading("thabathal", "sake");
    expectReading("gonathal", "sake");
    expectReading("hozul", "ordinary");
  });

  it("hostless ability overlay", () => {
    const word = expectReading("thezem", "ability");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, "ezem");
  });

  it("between locative overlay remains; other place talk is ordinary on those roots", () => {
    const between = expectReading("gozam", "locative");
    assert.equal(between.overlay!.gloss, "between");
    const pin = expectReading("zubuhul", "ordinary");
    assert.equal(pin.overlay, undefined);
    expectReading("hegegam", "ordinary");
  });

  it("of-relation overlays on /h/ /ɡ/ and ordinary pictures on other letters", () => {
    const part = expectReading("gabom", "ofRelation");
    assert.ok(part.overlay);
    assert.equal(part.overlay!.kind, "of_relation");
    assert.equal(part.overlay!.gloss, "part-of");
    const contents = expectReading("haham", "ofRelation");
    assert.equal(contents.overlay!.gloss, "contents");
    const material = expectReading("guwam", "ofRelation");
    assert.equal(material.overlay!.gloss, "material");
    const origin = expectReading("gagum", "ofRelation");
    assert.equal(origin.overlay!.gloss, "origin");
    const bone = expectReading("zabol", "ordinary");
    assert.equal(bone.overlay, undefined);
  });

  it("similative overlay on /h/ /ɡ/ and ordinary mirror on other letters", () => {
    const like = expectReading("homem", "similative");
    assert.ok(like.overlay);
    assert.equal(like.overlay!.kind, "similative");
    assert.equal(like.overlay!.gloss, "like");
    const adj = expectReading("gomem", "similative");
    assert.equal(adj.overlay!.gloss, "like");
    const mirror = expectReading("zomel", "ordinary");
    assert.equal(mirror.overlay, undefined);
    const mine = expectReading("zomen", "mood");
    assert.equal(mine.overlay!.kind, "benchmark");
  });

  it("hand root is ordinary without a means overlay", () => {
    const hand = expectReading("zahadal", "ordinary");
    assert.equal(hand.overlay, undefined);
  });

  it("-m on a root with no abstract sense is an unknown word", () => {
    expectReading("hahadam", "unknown");
  });

  it("exchange overlay on /h/ /ɡ/ and ordinary booth on other letters", () => {
    const forPrice = expectReading("hogem", "exchange");
    assert.ok(forPrice.overlay);
    assert.equal(forPrice.overlay!.kind, "exchange");
    assert.equal(forPrice.overlay!.gloss, "in-exchange-for");
    const adj = expectReading("gogem", "exchange");
    assert.equal(adj.overlay!.gloss, "in-exchange-for");
    const booth = expectReading("zogel", "ordinary");
    assert.equal(booth.overlay, undefined);
    const verb = expectReading("vogem", "ordinary");
    assert.equal(verb.overlay, undefined);
  });

  it("proxy overlay on /h/ /ɡ/ and ordinary id on other letters", () => {
    const behalf = expectReading("hadem", "proxy");
    assert.ok(behalf.overlay);
    assert.equal(behalf.overlay!.kind, "proxy");
    assert.equal(behalf.overlay!.gloss, "on-behalf-of");
    const adj = expectReading("gadem", "proxy");
    assert.equal(adj.overlay!.gloss, "on-behalf-of");
    const card = expectReading("zadel", "ordinary");
    assert.equal(card.overlay, undefined);
  });

  it("stimulus overlay on /ɡ/; ordinary point on other letters", () => {
    const stim = expectReading("gobom", "stimulus");
    assert.ok(stim.overlay);
    assert.equal(stim.overlay!.kind, "stimulus");
    assert.equal(stim.overlay!.gloss, "stimulus");
    const emphasis = expectReading("zobol", "ordinary");
    assert.equal(emphasis.overlay, undefined);
  });

  it("hosted judgment bars Mine and Everyone", () => {
    const mine = expectReading("zomen", "mood");
    assert.ok(mine.overlay);
    assert.equal(mine.overlay!.kind, "benchmark");
    assert.equal(mine.overlay!.gloss, "my-standard");
    const everyone = expectReading("zolon", "mood");
    assert.ok(everyone.overlay);
    assert.equal(everyone.overlay!.senseForm, "olon");
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
    const word = expectReading("zamun", "ordinary");
    assert.ok(word.rootGloss);
  });

  it("lexical compound lemma glosses as one kind", () => {
    const word = expectReading("zebedalahazal", "ordinary");
    assert.equal(word.family.kind, "content");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "bedroom");
    assert.equal(word.rootGloss?.abstract, "sanctum");
  });

  it("lexical compound beats accidental published substring match", () => {
    const word = expectReading("zonalebezan", "ordinary");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "friend");
  });

  it("listed three-letter hook compound parses as a fused citation", () => {
    const word = expectReading("vowogalual", "ordinary");
    assert.equal(word.hookCompound?.hook, "ual");
    assert.equal(word.rootGloss?.concrete, "exit");
  });

  it("listed hook compound uses citation stem and fused gloss", () => {
    const word = expectReading("vowogalul", "ordinary");
    assert.equal(word.hookCompound?.stem, "owogalul");
    assert.equal(word.hookCompound?.hook, "ul");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "leave");
    if (word.family.kind === "content") {
      assert.equal(word.family.roots[0], "owoga");
    }
  });

  it("citation hook compound has no role letter", () => {
    const word = expectReading("owogalul", "ordinary");
    assert.equal(word.pos, undefined);
    assert.equal(word.hookCompound?.stem, "owogalul");
    assert.equal(word.rootGloss?.concrete, "leave");
  });

  it("ordinary walk is not a hook compound", () => {
    const word = expectReading("vowogal", "ordinary");
    assert.equal(word.hookCompound, undefined);
    assert.equal(word.rootGloss?.concrete, "walk");
  });

  it("unlisted left root still fuses a productive hook compound", () => {
    const word = expectReading("varahalul", "ordinary");
    assert.equal(word.hookCompound?.stem, "arahalul");
    assert.equal(word.lexicalCompound, false);
    assert.match(word.rootGloss?.concrete ?? "", /leave/);
  });

  it("ordinary compound glosses both roots", () => {
    const sushi = tables.published.get(
      [...tables.published.values()].find((r) => r.concrete === "sushi")?.clarity ?? "",
    );
    const coffee = tables.published.get(
      [...tables.published.values()].find((r) => r.concrete === "coffee")?.clarity ?? "",
    );
    assert.ok(sushi && coffee);
    const word = expectReading(`z${sushi.clarity}x${coffee.clarity}n`, "ordinary");
    assert.equal(word.family.kind, "x");
    if (word.family.kind !== "x") return;
    assert.equal(word.family.xFamily, "compound");
    assert.equal(word.rootGloss?.concrete, "sushi · coffee");
  });

  it("ordinary hook without overlay", () => {
    const word = expectReading("al", "ordinary");
    assert.equal(word.family.kind, "hook");
    assert.equal(word.overlay, undefined);
  });

  it("as-of ledger and bookmark overlays on /h/ /ɡ/ /w/ /th/, including resume", () => {
    for (const form of ["henem", "genem", "wenem", "thenem", "hener", "gener", "wener", "thener"]) {
      const word = expectReading(form, "mood");
      assert.equal(word.overlay?.kind, "clause_pole");
      assert.equal(word.overlay?.gloss, "as-of.ledger");
    }
    for (const form of ["humem", "gumem", "wumem", "thumem", "humer", "gumer", "wumer", "thumer"]) {
      const word = expectReading(form, "mood");
      assert.equal(word.overlay?.kind, "clause_pole");
      assert.equal(word.overlay?.gloss, "as-of.bookmark");
    }
  });

  it("because pole fault scale on /th/", () => {
    assert.equal(expectReading("theral", "mood").overlay?.gloss, "because.fault");
    assert.equal(expectReading("theram", "mood").overlay?.gloss, "because");
    assert.equal(expectReading("therar", "mood").overlay?.gloss, "because.share");
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
    assert.deepEqual(lexiconContentRoots(parseWord("yal")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("xuxun")), []);
    assert.equal(unknownLexiconContentRoots(parseWord("zazawan"), knownLexiconRoots(tables)).length, 0);
  });
});
