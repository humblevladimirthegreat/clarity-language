import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CompoundRow } from "../lexicon-compounds.js";
import { compoundPartDrift, retieSenseForm, rowMatchesOnly } from "./lexicon.js";

describe("retieSenseForm", () => {
  it("moves a plain root", () => {
    assert.equal(retieSenseForm("egega", "th", "egega", "ababa"), "ababa");
  });

  it("keeps the role vowel of an x-compound and moves only the root", () => {
    assert.equal(retieSenseForm("uxerenel", "th", "erene", "ababa"), "uxababal");
  });

  it("leaves the form alone when the root does not move", () => {
    assert.equal(retieSenseForm("egega", "th", "egega", "egega"), "egega");
    assert.equal(retieSenseForm("egega", "th", "", "ababa"), "egega");
  });

  it("returns null when the form does not spell the old root", () => {
    assert.equal(retieSenseForm("egega", "th", "ozozo", "ababa"), null);
  });
});

describe("rowMatchesOnly", () => {
  const row = { emoji: "👓", concrete: "glasses", root: "agaza" };

  it("matches every row when no filter is given", () => {
    assert.equal(rowMatchesOnly(row, []), true);
  });

  it("matches by concrete label, emoji or root", () => {
    assert.equal(rowMatchesOnly(row, ["glasses"]), true);
    assert.equal(rowMatchesOnly(row, ["👓"]), true);
    assert.equal(rowMatchesOnly(row, ["agaza"]), true);
    assert.equal(rowMatchesOnly(row, ["sunglasses", "ababa"]), false);
  });
});

describe("compoundPartDrift", () => {
  const compound = (left: string, right: string): CompoundRow =>
    ({ emoji: "🛏️", stem: `${left}l${right}`, left, join: "l", right, concrete: "bedroom", abstract: "", mnemonic: "" }) as CompoundRow;
  const published = [
    { emoji: "🛏", root: "ubudu" },
    { emoji: "🏠", root: "ahaza" },
  ];
  const emojiByOldRoot = new Map([
    ["ebeda", "🛏"],
    ["ahaza", "🏠"],
  ]);

  it("passes parts that follow their emoji's new root", () => {
    assert.deepEqual(compoundPartDrift([compound("ebeda", "ahaza")], [compound("ubudu", "ahaza")], emojiByOldRoot, published), []);
  });

  it("flags a part that moved to another row's root", () => {
    const errors = compoundPartDrift([compound("ebeda", "ahaza")], [compound("ebeda", "ahaza")], emojiByOldRoot, published);
    assert.deepEqual(
      errors.map((e) => [e.row, e.reason]),
      [[2, "left ebeda (🛏) became ebeda, expected ubudu"]],
    );
  });
});
