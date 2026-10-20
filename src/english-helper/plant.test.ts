import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { analyzeEnglish, type RootSuggestion } from "./analyze.js";
import { loadHelperData } from "./load.js";
import { plantErrors, plantFlagged } from "./plant.js";
import { verifyDraft } from "./verify.js";

const tables = loadDefaultTables();
const data = loadHelperData();

const rootOf = (english: string, word: string, tier: string) =>
  analyzeEnglish(data, english)
    .clauses.flatMap((c) => c.slots)
    .find((s) => s.text === word)!
    .suggestions.find((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === tier)!.form;

describe("plantErrors", () => {
  it("flips each passing word to the other side, and verify flags it", () => {
    const cat = rootOf("The cat sleeps.", "cat", "root");
    const sleep = rootOf("The cat sleeps.", "sleeps", "root");
    const answer = `z${cat}l v${sleep}l.`;
    const plants = plantErrors(answer, verifyDraft("The cat sleeps.", answer, tables, data).words!);
    assert.deepEqual(
      plants.map((p) => [p.kind, p.draft]),
      [
        ["side", `z${cat}m v${sleep}l.`],
        ["side", `z${cat}l v${sleep}m.`],
      ],
    );
    for (const plant of plants) assert.equal(plantFlagged(verifyDraft("The cat sleeps.", plant.draft, tables, data), plant), true, plant.draft);
  });

  it("plants an alias on its other side", () => {
    const grateful = rootOf("I am grateful.", "grateful", "alias");
    const answer = `g${grateful}m.`;
    const [plant] = plantErrors(answer, verifyDraft("I am grateful.", answer, tables, data).words!);
    assert.deepEqual([plant?.kind, plant?.draft], ["alias-side", `g${grateful}l.`]);
  });

  it("says nothing about a draft that does not parse", () => {
    const cat = rootOf("The cat sleeps.", "cat", "root");
    const plant = { kind: "side" as const, draft: `z${cat}m q.`, from: `z${cat}l`, to: `z${cat}m`, side: "concrete" as const };
    assert.equal(plantFlagged(verifyDraft("The cat sleeps.", plant.draft, tables, data), plant), undefined);
  });
});
