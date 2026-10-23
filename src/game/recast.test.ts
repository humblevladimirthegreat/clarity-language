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
    assert.equal(orthographyFix("Z-udozol tevemol"), "zudozol thevemel");
  });

  it("leaves a foreign span's capitals alone", () => {
    assert.equal(orthographyFix("zalazun d<iPhone> vayebel"), "zalazun d<iPhone> vayebel");
  });
});

describe("typedGloss", () => {
  it("joins gloss tokens the way a morph line does", () => {
    assert.equal(typedGloss("z-dog v-chase"), "z-dog | v-chase");
    assert.equal(typedGloss("z-←dog | v-sleep."), "z-←dog | v-sleep");
  });

  it("is not a gloss without a role-lettered token", () => {
    assert.equal(typedGloss("zudozol vowurol"), undefined);
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
    const misses = nearMisses("Zudozol vowurol.", "word", options());
    assert.equal(misses[0]?.ageben, "zudozol vowurol.");
    assert.equal(misses[0]?.tier, 0);
  });

  it("swaps an ending, a role letter, or a root one edit away", () => {
    const misses = nearMisses("zudozal dagozol bohol vayebel.", "unknown-root", options()).map((m) => m.ageben);
    assert.ok(misses.includes("zudozol dagozol bohol vayebel."));
    assert.ok(misses.includes("zudozal dagozol dohol vayebel."));
  });

  it("ranks this error kind's rows above the rest", () => {
    const rule: RecastRule = { kind: "word", from: "yel", to: "yol", errorKind: "special", source: "x.md#y" };
    const misses = nearMisses("yel vowurol.", "special", options({ rules: [...SEED_RULES, rule] }));
    assert.equal(misses.find((m) => m.ageben === "yol vowurol.")?.tier, 1);
  });

  it("moves a turn word to the front", () => {
    const misses = nearMisses("zazozon varal yel.", "turnMidSentence", options()).map((m) => m.ageben);
    assert.ok(misses.includes("yel zazozon varal."));
  });
});
