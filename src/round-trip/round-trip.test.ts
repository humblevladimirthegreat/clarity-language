/**
 * The round trip over the doc examples (docs/meta/realizer.md#round-trip) and its ratchet (`round-trip-ratchet.json`):
 * the `ok` count does not fall, and a key with no failures does not gain one. When the counts improve, lower the file
 * to the new counts (`npm run round-trip` prints them).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { realize, spellGloss } from "../realize/realize.js";
import { corpus } from "./corpus.js";
import { firstDifference, ratchetOf, roundTrip, type Ratchet } from "./round-trip.js";

const here = dirname(fileURLToPath(import.meta.url));
const ratchetPath = join(here, "round-trip-ratchet.json");
const tables = loadDefaultTables();

describe("round trip", () => {
  it("files a reading the realizer has no rule for as a noRule gap under its first key", () => {
    const entry = corpus(tables).entries.find((e) => e.meanings.length === 1 && e.meanings[0]!.frames.length > 0);
    assert.ok(entry, "no doc example with a frame");
    const out = realize(entry.meanings[0]!, tables);
    assert.ok("gap" in out && out.gap.kind === "noRule" && out.gap.key === entry.meanings[0]!.frames[0]!.key);
  });

  it("spells a gloss, and files one that does not spell as a gap", () => {
    const yes = spellGloss("y-yes", "claim", tables);
    assert.ok("ageben" in yes && yes.gloss === "y-yes", JSON.stringify(yes));
    const bad = spellGloss("NOSUCH-gloss", "claim", tables);
    assert.ok("gap" in bad && (bad.gap.kind === "noSpell" || bad.gap.kind === "noParse"), JSON.stringify(bad));
  });

  it("finds the first differing path of two canonical forms", () => {
    assert.equal(firstDifference(['{"a":1}', '{"b":{"c":[1,2]}}'], ['{"a":1}', '{"b":{"c":[1,3]}}']), "1.b.c.1");
    assert.equal(firstDifference(['{"a":1}'], ['{"a":1}', '{"a":2}']), "sentences");
    assert.equal(firstDifference(['{"a":1}'], ['{"a":1}']), "");
  });

  it("ratchet: the ok count does not fall, and a key with no failures does not gain one", () => {
    const now = ratchetOf(roundTrip(tables));
    const stored = JSON.parse(readFileSync(ratchetPath, "utf8")) as Ratchet;
    const gained = Object.keys(now.keys).filter((key) => !(key in stored.keys));
    assert.deepEqual(gained, [], "keys with no round-trip failures before now have some (npm run round-trip -- --texts KEY)");
    assert.ok(now.ok >= stored.ok, `round-trip ok fell: ${stored.ok} → ${now.ok} (npm run round-trip)`);
  });
});
