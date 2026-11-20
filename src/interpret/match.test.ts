import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { framePath, match, readingTree } from "./match.js";
import { readText } from "./read.js";
import type { Claim, Reading } from "./types.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const read = (gloss: string): Reading[] => readText(glossToAgeben(gloss, tables, index) + ".", tables);
const claim = (gloss: string): Claim => read(gloss)[0]!.claim;

describe("match", () => {
  it("roles match by letter, never by word order", () => {
    assert.ok(match(claim("z-Azozon | b-Alazun | v-pay"), claim("b-Alazun | z-Azozon | v-pay")));
    assert.equal(match(claim("z-Azozon | b-Alazun | v-pay"), claim("z-Alazun | b-Azozon | v-pay")), undefined);
  });

  it("a role the query leaves out matches anything; the verb matches by root", () => {
    assert.ok(match(claim("z-Azozon | v-pay"), claim("z-Azozon | b-Alazun | v-pay")));
    assert.equal(match(claim("z-Azozon | v-walk"), claim("z-Azozon | v-pay")), undefined);
  });

  it("a blank binds to the target's term in that role", () => {
    const binding = match(claim("y-question | z-wh | b-Alazun | v-pay"), claim("z-Azozon | b-Alazun | v-pay"));
    assert.equal(binding?.blanks.length, 1);
    assert.equal(binding!.blanks[0]!.at, "z");
    assert.ok(binding!.blanks[0]!.term.kind === "thing" && binding!.blanks[0]!.term.root === "azozo");
    assert.deepEqual(binding!.switches, []);
  });

  it("the query's details are a subset of the target's", () => {
    assert.ok(match(claim("z-Azozon | v-walk"), claim("z-Azozon | v-walk | h-two")));
    assert.equal(match(claim("z-Azozon | v-walk | h-two"), claim("z-Azozon | v-walk")), undefined);
  });

  it("a nested reading's path holds the frames of the reading that contains it", () => {
    const readings = read("z-Azozon | v-departure | [th-if | bl-that-clause] | z-Alazun | v-pay");
    const tree = readingTree(readings);
    const inner = [...tree.keys()].find((r) => tree.get(r))!;
    const path = framePath(inner, tree);
    assert.deepEqual(
      path.frames.map((f) => f.frame.family),
      ["hinge"],
    );
    assert.equal(path.readings[1], inner);
  });
});

describe("match: switches", () => {
  const readRaw = (text: string): Reading => readText(text, tables)[0]!;
  const via = (query: string, target: Reading, infer = true): string[] | undefined =>
    match(claim(query), target.claim, { switches: { infer }, targetSite: { reading: target } })?.switches;

  it("universals-domains.md#universals-domains-generics: closed zual + kind holds of an instance; open, denied, or collective does not", () => {
    const every = read("[z-everything | g-cat] | v-sleep")[0]!;
    assert.equal(via("z-cat | v-sleep", every, false), undefined);
    assert.deepEqual(via("z-cat | v-sleep", every), ["infer"]);
    assert.equal(via("z-dog | v-sleep", every), undefined);
    assert.equal(via("z-cat | v-sleep", readRaw("zuam gogozel vezuvel.")), undefined);
    assert.equal(via("z-cat | v-sleep", readRaw("zual gogozel zul vezuvel.")), undefined);
    assert.equal(via("z-cat | v-sleep", readRaw("zual gogozel vezuvelx.")), undefined);
  });

  it("numbers match by value: the written and the spoken count are one number", () => {
    const spoken = readRaw("zogozel gragel.");
    assert.deepEqual(match(readRaw("zogozel g+3.").claim, spoken.claim)?.switches, []);
    assert.equal(match(readRaw("zogozel gradol.").claim, spoken.claim), undefined);
    // An *about* amount is not the exact one.
    assert.equal(match(readRaw("zogozel gragem.").claim, spoken.claim), undefined);
  });

  it("measures match by unit and amount", () => {
    const walked = readRaw("zazozon bozerom gradol vowurol.");
    assert.ok(match(readRaw("zazozon bozerom g+2 vowurol.").claim, walked.claim));
    assert.equal(match(readRaw("zazozon bozerom gragel vowurol.").claim, walked.claim), undefined);
  });

  it("a speaker or listener term fits only the same turn's person, when both sites name one", () => {
    const i = claim("z-speaker | v-walk");
    const you = claim("z-listener | v-walk");
    assert.ok(match(i, i, { querySite: { speaker: "sp(a)" }, targetSite: { speaker: "sp(a)" } }));
    assert.equal(match(i, i, { querySite: { speaker: "sp(a)" }, targetSite: { speaker: "sp(b)" } }), undefined);
    assert.equal(match(you, you, { querySite: { listener: "listener(0)" }, targetSite: { listener: "listener(1)" } }), undefined);
    // R4a-8: a listener its site names as another speaker is that speaker; R4a-7: `zaya` is its site's `we` term.
    assert.ok(match(i, you, { querySite: { speaker: "sp(a)" }, targetSite: { listener: "sp(a)" } }));
    assert.equal(match(i, you, { querySite: { speaker: "sp(a)" }, targetSite: { listener: "sp(b)" } }), undefined);
    // A caller that does not know the turns (ask with no persons on its sites) fits any term of the kind.
    assert.ok(match(i, i));
    assert.ok(match(i, i, { querySite: {}, targetSite: { speaker: "sp(b)" } }));
  });
});
