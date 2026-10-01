import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  DEFAULT_SELF_ROOT,
  eligibleNames,
  nameBanReason,
  SUGGESTED_EMOJI,
  suggestedNames,
  fillSelf,
  hasSelfSlot,
  selfGlossEnglish,
} from "./learner-name.js";
import { CLOSED } from "./closed-roots.js";
import { parseOverlayCsv, parsePublishedCsv } from "./lexicon-search.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rows = parsePublishedCsv(readFileSync(join(root, "data", "lexicon-published.csv"), "utf8"));
const overlays = parseOverlayCsv(readFileSync(join(root, "data", "lexicon-overlays.csv"), "utf8"));
const eligible = eligibleNames(rows, overlays);
const eligibleRoots = new Set(eligible.map((option) => option.root));
/** Current root of an emoji row, so these tests follow a lexicon retie. */
const rootOf = (emoji: string) => rows.find((row) => row.emoji === emoji)!.root;

describe("eligibleNames", () => {
  it("allows ordinary roots, including unflattering ones and rows without an abstract", () => {
    for (const root of ["😀", "💀", "💩", "🐀"].map(rootOf)) assert.equal(eligibleRoots.has(root), true, root);
  });

  it("bans only confusing names, with a reason", () => {
    const reason = (root: string) => nameBanReason(rows.find((row) => row.root === root)!, overlays);
    const roles = [CLOSED.microphone, CLOSED.headphones, CLOSED.handshake, CLOSED.neutral];
    const cast = [CLOSED.swan, CLOSED.lion, CLOSED.hibiscus];
    // DECISION (✅) and MAY (💭) + **-n** are grammar words.
    for (const root of [...roles, ...cast, CLOSED.glasses, rootOf("✅"), rootOf("💭")]) {
      assert.equal(eligibleRoots.has(root), false, root);
      assert.ok(reason(root), root);
    }
    assert.match(reason(CLOSED.lion)!, /Alahen/);
    const flag = rows.find((row) => /[\u{1F1E6}-\u{1F1FF}]/u.test(row.emoji))!;
    assert.match(nameBanReason(flag, overlays)!, /country/);
  });
});

describe("suggestedNames", () => {
  it("offers all hand-picked names, each allowed and with both senses", () => {
    const suggested = suggestedNames(rows);
    assert.equal(suggested.length, SUGGESTED_EMOJI.length);
    for (const option of suggested) {
      assert.ok(eligibleRoots.has(option.root), option.root);
      assert.ok(option.concrete && option.abstract, option.root);
    }
    assert.equal(suggested[0]!.name, `${rootOf("😀")}n`);
  });
});

describe("fillSelf", () => {
  it("fills words with the default speaker root", () => {
    assert.equal(DEFAULT_SELF_ROOT, CLOSED.microphone);
    assert.equal(fillSelf("zSELFn vowogal."), `z${CLOSED.microphone}n vowogal.`);
    assert.equal(fillSelf("SELFn."), `${CLOSED.microphone}n.`);
  });

  it("fills gloss slots with the gloss English", () => {
    assert.equal(fillSelf("z-SELF | v-walk"), "z-speaker | v-walk");
    assert.equal(fillSelf("z-SELF | v-walk", "egeva"), "z-Egevan | v-walk");
    assert.equal(selfGlossEnglish("egeva"), "Egevan");
  });

  it("fills a free-standing SELF as gloss English", () => {
    assert.equal(fillSelf("SELF"), "speaker");
    assert.equal(fillSelf("SELFISH"), "SELFISH");
    assert.equal(hasSelfSlot("SELFISH"), false);
    assert.equal(hasSelfSlot("`zSELFn`"), true);
  });
});
