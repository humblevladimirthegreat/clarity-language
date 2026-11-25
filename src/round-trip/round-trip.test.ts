/**
 * The round trip over the doc examples (docs/meta/realizer.md#round-trip) and its ratchet (`round-trip-ratchet.json`):
 * the `ok` count does not fall, and a key with no failures does not gain one. A failed trip counts under the key of every
 * part of every reading (`ratchetOf`), so its keys do not move as the realizer improves. When the counts improve, lower
 * the file to the new counts (`npm run round-trip -- --ratchet` prints them).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { realize, spellGloss } from "../realize/realize.js";
import { sameReadings } from "../interpret/equal.js";
import { project } from "../realize/meaning.js";
import { corpus, readTurn } from "./corpus.js";
import { firstDifference, ratchetOf, roundTrip, tripEntry, type Ratchet } from "./round-trip.js";

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

  it("realizes the bare clause in the default order, keeping the order new members cover each other in", () => {
    const cases: [string, string][] = [
      ["zodozel vowurol.", "zodozel vowurol."],
      ["zodozel gonumul dogozel vayebel.", "zodozel gonumul dogozel vayebel."],
      ["dogozel zodozel vayebel.", "dogozel zodozel vayebel."],
      ["balazun zazozon daral varal.", "zazozon daral varal balazun."],
      ["zodozel vowurol hadurom.", "zodozel hadurom vowurol."],
      ["zodozel welazem gonumul vowurol.", "zodozel welazem gonumul vowurol."],
      ["zazozon gonumul hadurom.", "zazozon hadurom gonumul."],
      ["zawan dayan vayebel.", "zawan dayan vayebel."],
      ["dazozon vayebel.", "dazozon vayebel."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
  });

  it("realizes pronouns: generic, a resume or role pointer as the resume, a new one as the noun it copies", () => {
    const cases: [string, string[]][] = [
      ["zeyen vezuvel.", ["zeyen vezuvel."]],
      ["zazozon vowurol. zazozor vehohel.", ["zazozon vowurol.", "zazozor vehohel."]],
      ["zazozon dalazun vayebel. zwuder veruvol.", ["zazozon dalazun vayebel.", "zalazur veruvol."]],
      ["zazozon dugedel vayebel. zalazun dwudel vayebel.", ["zazozon dugedel vayebel.", "zalazun dugedel vayebel."]],
      ["zayan dayar vebal.", ["zayan dayar vebal."]],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), want, text);
      assert.equal(sameReadings(text, want.join(" "), tables).verdict, "same", text);
    }
  });

  it("realizes numbers: in a role, as the predicate, and on a noun, each in its preferred writing", () => {
    const cases: [string, string][] = [
      ["zragel vezuvel.", "zragel vezuvel."],
      ["zazozon d+12 vayebel.", "zazozon d+12 vayebel."],
      ["zrugel vezuvel.", "zrugel vezuvel."],
      ["zanal grodol.", "zanal grodol."],
      ["zanal g+3.", "zanal gragel."],
      ["zalazun danal grogel varuyol.", "zalazun danal grogel varuyol."],
      ["zodozel grababal vezuvel.", "zodozel g+11 vezuvel."],
      ["zodozel gonumul g~+3 vezuvel.", "zodozel gonumul gragem vezuvel."],
      ["zanal grodon.", "zanal grodon."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
  });

  it("files a part the bare clause has no rule for under the reading's first key", () => {
    const out = project(readTurn("zazozon dahobal wabem gerulol vayebel.", tables), tables).map((view) => realize(view, tables));
    assert.ok("gap" in out[0]! && out[0].gap.kind === "noRule" && out[0].gap.key === "slot:newMember", JSON.stringify(out));
  });

  it("counts a failed trip in the ratchet under the keys of every reading, not only the one that failed", () => {
    const text = "dazozon vayebel. zazozon dahobal wabem gerulol vayebel.";
    const readings = readTurn(text, tables);
    const trip = tripEntry({ ageben: text, source: "test", readings, meanings: project(readings, tables) }, tables);
    assert.equal(trip.verdict, "gap:noRule");
    assert.equal(trip.key, "slot:newMember", "the display key is the first gap's");
    assert.deepEqual(ratchetOf([trip]).keys, { claim: 1, "slot:newMember": 1 });
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
