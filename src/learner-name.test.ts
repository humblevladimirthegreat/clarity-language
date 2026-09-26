import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  DEFAULT_SELF_ROOT,
  eligibleNames,
  fillSelf,
  hasSelfSlot,
  selfGlossEnglish,
} from "./learner-name.js";
import { parseOverlayCsv, parsePublishedCsv } from "./lexicon-search.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = parsePublishedCsv(readFileSync(join(root, "data", "lexicon-published.csv"), "utf8"));
const overlays = parseOverlayCsv(readFileSync(join(root, "data", "lexicon-overlays.csv"), "utf8"));
const eligible = eligibleNames(rows, overlays);
const eligibleRoots = new Set(eligible.map((option) => option.root));

describe("eligibleNames", () => {
  it("offers ordinary published roots with both senses", () => {
    const grin = eligible.find((option) => option.root === "uguru");
    assert.deepEqual(
      { name: grin?.name, concrete: grin?.concrete, abstract: grin?.abstract },
      { name: "ugurun", concrete: "grin", abstract: "delight" },
    );
  });

  it("excludes specials, house cast, the language root, and denied roots", () => {
    for (const excluded of ["ugobo", "edone", "aha", "enenu", "azawa", "ululo", "uhubu", "agala", "uzulu"]) {
      assert.equal(eligibleRoots.has(excluded), false, excluded);
    }
  });

  it("excludes roots whose -n citation is a closed overlay", () => {
    assert.equal(eligibleRoots.has("ehege"), false);
    assert.equal(eligibleRoots.has("odoho"), false);
  });

  it("excludes rows missing an abstract sense", () => {
    assert.ok(eligible.every((option) => option.concrete && option.abstract));
  });
});

describe("fillSelf", () => {
  it("fills words with the default speaker root", () => {
    assert.equal(fillSelf("zSELFn vawalal."), "zugobon vawalal.");
    assert.equal(fillSelf("SELFn."), "ugobon.");
    assert.equal(DEFAULT_SELF_ROOT, "ugobo");
  });

  it("fills gloss slots with the gloss English", () => {
    assert.equal(fillSelf("z-SELF | v-walk"), "z-speaker | v-walk");
    assert.equal(fillSelf("z-SELF | v-walk", "uguru"), "z-Ugurun | v-walk");
    assert.equal(selfGlossEnglish("uguru"), "Ugurun");
  });

  it("fills a free-standing SELF as gloss English", () => {
    assert.equal(fillSelf("SELF"), "speaker");
    assert.equal(fillSelf("SELFISH"), "SELFISH");
    assert.equal(hasSelfSlot("SELFISH"), false);
    assert.equal(hasSelfSlot("`zSELFn`"), true);
  });
});
