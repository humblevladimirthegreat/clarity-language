import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
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

function expectOverlay(text: string, kind?: string) {
  const word = expectReading(text, "overlay");
  if (kind) assert.equal(word.overlay?.kind, kind, `${text} expected overlay kind ${kind}`);
  return word;
}

describe("classify", () => {
  it("emotion tail on a sake root; same shape on another root is a viewpoint lateral", () => {
    const fused = classifyText("guwathamol");
    assert.equal(fused.family.kind === "x" && fused.family.xFamily, "sake");
    const lateral = classifyText("gewezethamol");
    assert.deepEqual(lateral.family, { kind: "x", xFamily: "lateral", leftRoots: ["eweze"], rightRoots: ["amo"] });
  });

  it("reads DIR th o on an arrow root as landmark facing with pair scope", () => {
    const word = classifyText("gazuhethol");
    assert.deepEqual(word.family, {
      kind: "x",
      xFamily: "lateral",
      leftRoots: ["azuhe"],
      rightRoots: [],
      landmark: true,
      scopeVowel: "o",
    });
  });

  it("overlay mood on published-shaped live evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /live evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectOverlay(`th${sense.senseForm}`);
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /live/i);
  });

  it("overlay mood on published-shaped evidential", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /memory evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const word = expectOverlay(`th${sense.senseForm}`);
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, sense.senseForm);
    assert.match(word.overlay!.definition, /memory/i);
  });

  it("published ordinary on literal fishing manner", () => {
    const fishing = [...tables.published.values()].find((r) => r.concrete === "fishing");
    assert.ok(fishing);
    const word = expectReading(`h${fishing.root}l`, "ordinary");
    assert.ok(word.rootGloss?.concrete);
    assert.equal(word.overlay, undefined);
  });

  it("overlay mood on residue and former-climate", () => {
    const residue = expectOverlay("haram");
    assert.equal(residue.overlay?.kind, "residue");
    assert.equal(residue.overlay?.gloss, "RESIDUE");
    const former = expectOverlay("helam");
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

  it("restrictor on last-first rank huel, hem, and /w/ wuel", () => {
    expectReading("huel", "restrictor");
    expectReading("huem", "restrictor");
    expectReading("wuel", "restrictor");
  });

  it("join-relation overlay beats restrictor shape for han", () => {
    expectReading("han", "joinRelation");
  });

  it("number on free number word", () => {
    expectReading("g+3", "number");
  });

  it("ability on non-sake host compound", () => {
    expectReading("vuhahaxel", "ability");
  });

  it("greeting bid on citation or /y/ vocative, not ability", () => {
    expectReading("uzozexan", "greeting");
    expectReading("yuzozexan", "greeting");
    expectReading("yolazuxen", "greeting");
    expectReading("ahelaxun", "greeting");
  });

  it("sake on sake host compounds; bare sake root is ordinary", () => {
    expectReading("thunathal", "sake");
    expectReading("gawothal", "sake");
    expectReading("hodol", "ordinary");
  });

  it("hostless ability overlay", () => {
    const word = expectReading("hodam", "ability");
    assert.ok(word.overlay);
    assert.equal(word.overlay!.senseForm, "odam");
  });

  it("between locative overlay remains; other place talk is ordinary on those roots", () => {
    const between = expectOverlay("gedam", "locative");
    assert.equal(between.overlay!.gloss, "between");
    const pin = expectReading("zabewul", "ordinary");
    assert.equal(pin.overlay, undefined);
    expectReading("hogugom", "ordinary");
  });

  it("of-relation overlays on /h/ /ɡ/ and ordinary pictures on other letters", () => {
    const part = expectOverlay("gobem", "of_relation");
    assert.ok(part.overlay);
    assert.equal(part.overlay!.kind, "of_relation");
    assert.equal(part.overlay!.gloss, "part-of");
    const contents = expectOverlay("hadam", "of_relation");
    assert.equal(contents.overlay!.gloss, "contents");
    const material = expectOverlay("gulem", "of_relation");
    assert.equal(material.overlay!.gloss, "material");
    const origin = expectOverlay("gaham", "of_relation");
    assert.equal(origin.overlay!.gloss, "origin");
    const bone = expectReading("zobel", "ordinary");
    assert.equal(bone.overlay, undefined);
  });

  it("similative overlay on /h/ /ɡ/ and ordinary mirror on other letters", () => {
    const like = expectOverlay("hewom", "similative");
    assert.ok(like.overlay);
    assert.equal(like.overlay!.kind, "similative");
    assert.equal(like.overlay!.gloss, "like");
    const adj = expectOverlay("gewom", "similative");
    assert.equal(adj.overlay!.gloss, "like");
    const mirror = expectReading("zewol", "ordinary");
    assert.equal(mirror.overlay, undefined);
  });

  it("hand root is ordinary without a means overlay", () => {
    const hand = expectReading("zahebal", "ordinary");
    assert.equal(hand.overlay, undefined);
  });

  it("-m on a root with no abstract sense is an unknown word", () => {
    expectReading("hahebam", "unknown");
  });

  it("exchange overlay on /h/ /ɡ/ and ordinary booth on other letters", () => {
    const forPrice = expectOverlay("heham", "exchange");
    assert.ok(forPrice.overlay);
    assert.equal(forPrice.overlay!.kind, "exchange");
    assert.equal(forPrice.overlay!.gloss, "in-exchange-for");
    const adj = expectOverlay("geham", "exchange");
    assert.equal(adj.overlay!.gloss, "in-exchange-for");
    const booth = expectReading("zehal", "ordinary");
    assert.equal(booth.overlay, undefined);
    const verb = expectReading("veham", "ordinary");
    assert.equal(verb.overlay, undefined);
  });

  it("proxy overlay on /h/ /ɡ/ and ordinary id on other letters", () => {
    const behalf = expectOverlay("hanom", "proxy");
    assert.ok(behalf.overlay);
    assert.equal(behalf.overlay!.kind, "proxy");
    assert.equal(behalf.overlay!.gloss, "on-behalf-of");
    const adj = expectOverlay("ganom", "proxy");
    assert.equal(adj.overlay!.gloss, "on-behalf-of");
    const card = expectReading("zanol", "ordinary");
    assert.equal(card.overlay, undefined);
  });

  it("stimulus overlay on /ɡ/; ordinary point on other letters", () => {
    const stim = expectOverlay("goyem", "stimulus");
    assert.ok(stim.overlay);
    assert.equal(stim.overlay!.kind, "stimulus");
    assert.equal(stim.overlay!.gloss, "stimulus");
    const emphasis = expectReading("zoyel", "ordinary");
    assert.equal(emphasis.overlay, undefined);
  });

  it("a root plus -n under /z/ is an ordinary name, not a named bar", () => {
    for (const raw of ["zewon", "zogugan", "zahezan"]) {
      const word = expectReading(raw, "ordinary");
      assert.equal(word.overlay, undefined);
    }
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
    const word = expectReading("zuwon", "ordinary");
    assert.ok(word.rootGloss);
  });

  it("lexical compound lemma glosses as one kind", () => {
    const word = expectReading("zobahohal", "ordinary");
    assert.equal(word.family.kind, "content");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "bedroom");
    assert.equal(word.rootGloss?.abstract, "sanctum");
  });

  it("lexical compound beats accidental published substring match", () => {
    const word = expectReading("zahuyayon", "ordinary");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "friend");
  });

  it("listed three-letter hook compound parses as a fused citation", () => {
    const word = expectReading("vowurelual", "ordinary");
    assert.equal(word.hookCompound?.hook, "ual");
    assert.equal(word.rootGloss?.concrete, "exit");
  });

  it("listed hook compound uses citation stem and fused gloss", () => {
    const word = expectReading("vowurelul", "ordinary");
    assert.equal(word.hookCompound?.stem, "owurelul");
    assert.equal(word.hookCompound?.hook, "ul");
    assert.equal(word.lexicalCompound, true);
    assert.equal(word.rootGloss?.concrete, "leave");
    if (word.family.kind === "content") {
      assert.equal(word.family.roots[0], CLOSED.walk);
    }
  });

  it("citation hook compound has no role letter", () => {
    const word = expectReading("owurelul", "ordinary");
    assert.equal(word.pos, undefined);
    assert.equal(word.hookCompound?.stem, "owurelul");
    assert.equal(word.rootGloss?.concrete, "leave");
  });

  it("ordinary walk is not a hook compound", () => {
    const word = expectReading("vowurel", "ordinary");
    assert.equal(word.hookCompound, undefined);
    assert.equal(word.rootGloss?.concrete, "walk");
  });

  it("a three-letter root + ending + hook is not a hook compound", () => {
    // Only a five-letter root fuses (hook-compounds.md#hook-compounds): `map` + l + `ul` stays unread.
    const word = classifyText(`v${CLOSED.map}lul`);
    assert.equal(word.hookCompound, undefined);
  });

  it("a five-letter root with l second takes its ending, not a hook", () => {
    // `ehalo` + -l spells `eha` + l + hook `ol`; only the five-letter root is in the lexicon.
    const word = expectReading(`z${CLOSED.hibiscus}l`, "ordinary");
    assert.equal(CLOSED.hibiscus[3], "l");
    assert.equal(word.hookCompound, undefined);
    assert.equal(word.rootGloss?.concrete, "hibiscus");
  });

  it("reads no hook compound on a left piece that is not a dictionary root", () => {
    const vcv = ["aba", "ebe", "obo", "ubu", "ada", "ede"].find((root) => !tables.published.has(root))!;
    const word = classifyText(`z${vcv}lol`);
    assert.equal(word.hookCompound, undefined);
  });

  it("unlisted left root still fuses a productive hook compound", () => {
    const word = expectReading("varuvelul", "ordinary");
    assert.equal(word.hookCompound?.stem, "aruvelul");
    assert.equal(word.lexicalCompound, false);
    assert.match(word.rootGloss?.concrete ?? "", /leave/);
  });

  it("ordinary compound glosses both roots", () => {
    const sushi = tables.published.get(
      [...tables.published.values()].find((r) => r.concrete === "sushi")?.root ?? "",
    );
    const coffee = tables.published.get(
      [...tables.published.values()].find((r) => r.concrete === "coffee")?.root ?? "",
    );
    assert.ok(sushi && coffee);
    const word = expectReading(`z${sushi.root}x${coffee.root}n`, "ordinary");
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
    for (const form of ["henam", "genam", "wenam", "thenam", "henar", "genar", "wenar", "thenar"]) {
      const word = expectOverlay(form);
      assert.equal(word.overlay?.kind, "clause_pole");
      assert.equal(word.overlay?.gloss, "as-of.ledger");
    }
    for (const form of ["hunem", "gunem", "wunem", "thunem", "huner", "guner", "wuner", "thuner"]) {
      const word = expectOverlay(form);
      assert.equal(word.overlay?.kind, "clause_pole");
      assert.equal(word.overlay?.gloss, "as-of.bookmark");
    }
  });

  it("because pole fault scale on /th/", () => {
    assert.equal(expectOverlay("thahul").overlay?.gloss, "because.fault");
    assert.equal(expectOverlay("thahum").overlay?.gloss, "because");
    assert.equal(expectOverlay("thahur").overlay?.gloss, "because.share");
  });
});

describe("lexiconContentRoots", () => {
  it("collects content and compound hosts; skips spans, numbers, foreign", () => {
    const emptyKnown = knownLexiconRoots(createClassifyTablesFromRows([], []));
    assert.deepEqual(lexiconContentRoots(parseWord("zuzozen")), [CLOSED.swan]);
    assert.deepEqual(unknownLexiconContentRoots(parseWord("zuzozen"), emptyKnown), [CLOSED.swan]);
    assert.deepEqual(lexiconContentRoots(parseWord("g+3")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("d<sushi>")), []);
    assert.deepEqual(lexiconContentRoots(parseWord("yal")), []);
    assert.equal(unknownLexiconContentRoots(parseWord("zuzozen"), knownLexiconRoots(tables)).length, 0);
  });
});
