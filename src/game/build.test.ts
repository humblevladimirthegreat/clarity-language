import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ruleFromFix } from "./build.js";

// Made-up roots: only the word shape matters here.
const fix = (wrong: string, right: string) => ruleFromFix(wrong, right, "why", "page.md#fix", "kind");

describe("ruleFromFix", () => {
  it("reads a role-letter slip", () => {
    assert.deepEqual(fix("zababal vowowol el dababal.", "zababal vowowol el bababal."), {
      kind: "prefix",
      from: "d",
      to: "b",
      errorKind: "kind",
      source: "page.md#fix",
      why: "why",
    });
  });

  it("reads an ending slip", () => {
    assert.equal(fix("ababal", "ababam")?.kind, "ending");
  });

  it("reads one word for another", () => {
    assert.deepEqual(
      [fix("zababal yel vowowol.", "zababal yul vowowol.")?.kind, fix("zababal yel vowowol.", "zababal yul vowowol.")?.from],
      ["word", "yel"],
    );
  });

  it("reads a turn word moved to the front", () => {
    assert.equal(fix("zababal vowowol yol.", "yol zababal vowowol.")?.kind, "front");
  });

  it("skips a slip that is not one edit", () => {
    assert.equal(fix("zababal vowowol.", "zababal dububul vowowol."), undefined);
  });
});
