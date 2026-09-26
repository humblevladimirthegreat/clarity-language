import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  DEFAULT_SELF_ROOT,
  eligibleNames,
  nameBanReason,
  SUGGESTED_ROOTS,
  suggestedNames,
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
  it("allows ordinary roots, including unflattering ones and rows without an abstract", () => {
    for (const root of ["uguru", "uzulu", "obobo", "arada"]) assert.equal(eligibleRoots.has(root), true, root);
  });

  it("bans only confusing names, with a reason", () => {
    const reason = (root: string) => nameBanReason(rows.find((row) => row.clarity === root)!, overlays);
    for (const root of ["ugobo", "edone", "aha", "enenu", "azawa", "ululo", "uhubu", "agala", "ehege", "odoho"]) {
      assert.equal(eligibleRoots.has(root), false, root);
      assert.ok(reason(root), root);
    }
    assert.match(reason("ululo")!, /Ululon/);
    const flag = rows.find((row) => /[\u{1F1E6}-\u{1F1FF}]/u.test(row.emoji))!;
    assert.match(nameBanReason(flag, overlays)!, /country/);
  });
});

describe("suggestedNames", () => {
  it("offers all hand-picked names, each allowed and with both senses", () => {
    const suggested = suggestedNames(rows);
    assert.equal(suggested.length, SUGGESTED_ROOTS.length);
    for (const option of suggested) {
      assert.ok(eligibleRoots.has(option.root), option.root);
      assert.ok(option.concrete && option.abstract, option.root);
    }
    assert.equal(suggested[0]!.name, "ugurun");
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
