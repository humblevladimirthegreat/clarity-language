import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { FIXED, NOUN_ENGLISH } from "./generate.js";
import { gameLexicon } from "./lexicon.js";
import { OVERRIDES, traitsOf } from "./objects.js";
import { QUESTS } from "./quests.js";
import { SANDBOX } from "./scene.js";
import { HANDLERS } from "./verbs.js";

const lex = gameLexicon(loadDefaultTables());
const traits = (concrete: string) => traitsOf(lex.root(concrete), lex);

describe("tail defaults", () => {
  it("creatures move, people talk, food is eaten, small tools are carried", () => {
    assert.ok(traits("dog").animate && !traits("dog").person);
    assert.ok(traits("guard").person);
    assert.ok(traits("cookie").edible);
    assert.ok(traits("magnify").portable);
  });

  it("big things block and are not carried; places that hold are entered", () => {
    assert.ok(traits("tree").blocks && !traits("tree").portable);
    assert.ok(traits("school").enterable);
  });

  it("a feeling has no body", () => {
    assert.ok(!traits("think").physical);
  });

  it("overrides fix rows that are odd in play", () => {
    assert.ok(!traits("cutlery").edible);
    assert.ok(traits("door").openable);
    assert.ok(traits("book").portable);
    assert.deepEqual(traits("dog").chases, ["cat"]);
  });
});

describe("game data names published rows", () => {
  it("every handler, override, and scene thing", () => {
    const concretes = [
      ...Object.keys(HANDLERS),
      ...Object.keys(OVERRIDES),
      ...Object.keys(NOUN_ENGLISH),
      ...Object.values(OVERRIDES).flatMap((o) => o.chases ?? []),
      ...SANDBOX.rooms.map((r) => r.thing),
      ...SANDBOX.things.flatMap((t) => [t.thing, ...(t.name ? [t.name] : []), ...(t.props ?? [])]),
    ];
    for (const concrete of concretes) assert.doesNotThrow(() => lex.root(concrete), concrete);
  });

  it("every quest and every fixed line has a gloss", () => {
    for (const quest of QUESTS) assert.ok(quest.walkthroughs.length > 0 && quest.walkthroughs.every((s) => s.length > 0), quest.id);
    for (const line of Object.values(FIXED)) assert.ok(line.gloss && line.english);
  });
});
