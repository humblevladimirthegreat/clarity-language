import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { editDistance, nearMisses, orthographyFix, SEED_RULES, typedGloss, type RecastRule } from "./recast.js";

const options = (extra: Partial<Parameters<typeof nearMisses>[2]> = {}) => ({
  rules: SEED_RULES,
  roots: ["udozo", "agozo", "oho"],
  known: (root: string) => ["udozo", "agozo", "oho"].includes(root),
  ...extra,
});

describe("orthographyFix", () => {
  it("lowercases, writes th for t, and drops a hyphen after the role letter", () => {
    assert.equal(orthographyFix("Z-udozol tevemol"), "zudozol thevemol");
  });

  it("leaves a foreign span's capitals alone", () => {
    assert.equal(orthographyFix("zolazun d<iPhone> vawebol"), "zolazun d<iPhone> vawebol");
  });
});

describe("typedGloss", () => {
  it("joins gloss tokens the way a morph line does", () => {
    assert.equal(typedGloss("z-dog v-chase"), "z-dog | v-chase");
    assert.equal(typedGloss("z-←dog | v-sleep."), "z-←dog | v-sleep");
  });

  it("is not a gloss without a role-lettered token", () => {
    assert.equal(typedGloss("zudozol vowurel"), undefined);
  });
});

describe("editDistance", () => {
  it("counts single-letter edits", () => {
    assert.equal(editDistance("udoza", "udozo"), 1);
    assert.equal(editDistance("oho", "eho"), 1);
    assert.equal(editDistance("abc", "abc"), 0);
  });
});

describe("nearMisses", () => {
  it("puts the whole-input readings in tier 0", () => {
    const misses = nearMisses("Zudozol vowurel.", "word", options());
    assert.equal(misses[0]?.agebon, "zudozol vowurel.");
    assert.equal(misses[0]?.tier, 0);
  });

  it("swaps an ending, a role letter, or a root one edit away", () => {
    const misses = nearMisses("zudozal dagozol bohol vawebol.", "unknown-root", options()).map((m) => m.agebon);
    assert.ok(misses.includes("zudozol dagozol bohol vawebol."));
    assert.ok(misses.includes("zudozal dagozol dohol vawebol."));
  });

  it("ranks this error kind's rows above the rest", () => {
    const rule: RecastRule = { kind: "word", from: "yol", to: "yel", errorKind: "special", source: "x.md#y" };
    const misses = nearMisses("yol vowurel.", "special", options({ rules: [...SEED_RULES, rule] }));
    assert.equal(misses.find((m) => m.agebon === "yel vowurel.")?.tier, 1);
  });

  it("moves a turn word to the front", () => {
    const misses = nearMisses("zuzozen varal yol.", "turnMidSentence", options()).map((m) => m.agebon);
    assert.ok(misses.includes("yol zuzozen varal."));
  });
});
