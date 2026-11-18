import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { glossToAgeben } from "../parse/gloss-inverse.js";
import { loadDefaultTables } from "../parse/index.js";
import { fullGlossIndex } from "../game/build.js";
import { checkLine, closed, fillFragmentDrafts, listGroup, spell, whatIsItLikeDraft } from "./reply.js";

const tables = loadDefaultTables();
const index = fullGlossIndex(tables);
const ageben = (gloss: string) => closed(glossToAgeben(gloss, tables, index));

describe("checkLine", () => {
  it("passes a line that reads as one tree, with its constructions", () => {
    const check = checkLine(ageben("z-speaker | d-door | v-see"), tables);
    assert.ok(check.ok);
    assert.ok(Array.isArray(check.result.constructions));
  });

  it("says why a line does not parse", () => {
    const check = checkLine("qqq zzz.", tables);
    assert.equal(check.ok, false);
    assert.match(check.ok ? "" : check.why, /does not parse/);
  });
});

describe("shared shapes", () => {
  it("a list is one leaf alone, else an and-list in the first leaf's role", () => {
    assert.equal(listGroup(["d-dog"]), "d-dog");
    assert.equal(listGroup(["d-dog", "d-door"]), "[d-dog | d-door | d-and]");
    assert.equal(fillFragmentDrafts([{ leaf: "z-dog", english: "a dog" }, { leaf: "z-cat", english: "a cat" }])[0]?.gloss, "[z-dog | z-cat | z-and]");
  });

  it("which one? asks what the noun is like, the noun as subject, and spells", () => {
    const draft = whatIsItLikeDraft({ leaf: "d-←dog", english: "dog" });
    assert.equal(draft.gloss, "y-question | g-wh | z-←dog");
    assert.equal(draft.english, "Which dog?");
    assert.ok(spell(draft, tables), draft.gloss);
    assert.ok(spell(listDraft(), tables));
  });
});

function listDraft() {
  return { gloss: `z-speaker | ${listGroup(["d-dog", "d-door"])} | v-see`, english: "I see a dog and a door." };
}
