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

  it("realizes lists: members then one join, a standalone join, a u denial, an everything join with its kind", () => {
    const cases: [string, string][] = [
      ["zazozon zalazun zal vowurol.", "zazozon zalazun zal vowurol."],
      ["zazozon dal vayebel.", "zazozon dal vayebel."],
      ["zual.", "zual."],
      ["zual godozel dogozel vayebel.", "zual godozel dogozel vayebel."],
      ["dogozel zual godozel vayebel.", "dogozel zual godozel vayebel."],
      ["zuam gogozel guzemel.", "zuam gogozel guzemel."],
      ["zazozon zol.", "zazozon zol."],
      ["vowurol veruvol vam.", "vowurol veruvol vam."],
      ["zazozon gamahum gul.", "zazozon gamahum gul."],
      // A later unnamed member on its own ending, which the reader keeps in the term's values.
      ["zodozel zogozel zal.", "zodozel zogozel zal."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
  });

  it("realizes a hooked join's bound, a SHARED word for each member, and respectively before the later join", () => {
    const cases: [string, string][] = [
      ["zemxual bluwen vezuvel.", "zemxual bluwen vezuvel."],
      ["zumxual blayan vezuvel.", "zumxual blayan vezuvel."],
      ["zalazun zexal blazozon vowurol.", "zalazun zexal blazozon vowurol."],
      ["zazozon zalazun zal gamahum.", "zazozon zalazun zal gamahum."],
      ["zazozon vowurol veruvol val hahunom.", "zazozon vowurol veruvol val hahunom."],
      ["zazozon zalazun zal gelazem gamezem wubam gal.", "zazozon zalazun zal gelazem gamezem wubam gal."],
      ["zazozon zalazun zal vowurol veruvol wubam val.", "zazozon zalazun zal vowurol veruvol wubam val."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
    // A built word has no plain root in the view (logged for the reader-gap unit).
    const [built] = project(readTurn("zual gwuzowurol vozuyel.", tables), tables).map((view) => realize(view, tables));
    assert.ok(built && "gap" in built && built.gap.kind === "missingValue", JSON.stringify(built));
  });

  it("realizes hooks and relations: ranges, in-clause and extra-noun hooks, point-back and discourse hooks, relations, zones", () => {
    const cases: [string, string[]][] = [
      ["zalazun varal bazozon oel bahelan.", ["zalazun varal bazozon oel bahelan."]],
      ["zragel oel zrazal.", ["zragel oel zrazal."]],
      ["zalazun wemem al zazozon vowurol.", ["zalazun wemem al zazozon vowurol."]],
      ["zazozon veruvol el vowurol.", ["zazozon veruvol el vowurol."]],
      ["zazozon abal zahelan vowurol.", ["zazozon abal zahelan vowurol."]],
      ["zazozon vavobol al bohahal.", ["zazozon vavobol al bohahal."]],
      ["zalazun ual bohahal veruvol al bedavol.", ["zalazun ual bohahal veruvol al bedavol."]],
      ["zazozon vehohel el bohahal. zalazun vehohel er.", ["zazozon vehohel el bohahal.", "zalazun vehohel er."]],
      ["zazozon vowurol. al zalazun vowurol.", ["zazozon vowurol.", "al zalazun vowurol."]],
      ["zazozon hanem blalazun vezuyol.", ["zazozon hanem blalazun vezuyol."]],
      ["zazozon vowurol uom thagom.", ["zazozon vowurol uom thagom."]],
      // An unnamed relation landmark on its own ending.
      ["zazozon vowurol hohom blezahol.", ["zazozon hohom blezahol vowurol."]],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), want, text);
      assert.equal(sameReadings(text, want.join(" "), tables).verdict, "same", text);
    }
  });

  it("realizes a term's own ending, plural and citation: later list members, landmarks, -m and -r verbs, -ln, -x", () => {
    const cases: [string, string][] = [
      ["zazozon bozerom gradol vowurol.", "zazozon vowurol bozerom gradol."],
      ["zaxual bluzahal vezuvel el bohahal.", "zaxual bluzahal vezuvel el bohahal."],
      ["zazozoln vowurol.", "zazozoln vowurol."],
      ["zodozer vowurol.", "zodozer vowurol."],
      ["zazozonx vowurol.", "zazozonx vowurol."],
      ["zawanx vowurol.", "zawanx vowurol."],
      ["zazozon vozuyelx", "zazozon vozuyelx."],
      ["azozol", "azozol."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
  });

  it("realizes lists of several fences, no K, a standalone join as a landmark, and assigning tags and tag pronouns", () => {
    const cases: [string, string][] = [
      ["zual gogozel zul vezuvel.", "zual gogozel zul vezuvel."],
      ["zedudal zogudal zel zowulal zal vozedal.", "zedudal zogudal zel zowulal zal vozedal."],
      ["zul godozel vezuvel.", "zul godozel vezuvel."],
      ["zazozon vowurol el bual.", "zazozon vowurol el bual."],
      ["zexual blual vezuvel.", "zexual blual vezuvel."],
      ["zodozel zwal vowurol.", "zodozel zwal vowurol."],
      ["zodozel zwal zogozel zwol zam vowurol.", "zodozel zwal zogozel zwol zam vowurol."],
      ["zodozel zogozel zam zwal vowurol.", "zodozel zogozel zam zwal vowurol."],
      ["zual gogozel zwal vezuvel.", "zual gogozel zwal vezuvel."],
      ["zeyel zwan vowurol.", "zeyel zwan vowurol."],
      ["zwal vezuyol bwol.", "zwal vezuyol bwol."],
      ["zwanx vowurol.", "zwanx vowurol."],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), [want], text);
      assert.equal(sameReadings(text, want, tables).verdict, "same", text);
    }
  });

  it("realizes comparatives: shared scale and equative words, bars, factors, number adverbs", () => {
    const cases: [string, string[]][] = [
      ["zazozon zalazun zol gamahum.", ["zazozon zalazun zol gamahum."]],
      ["zahelan zol guzemel.", ["zahelan zol guzemel."]],
      ["zazozon zalazun zol wohalal gamahum.", ["zazozon zalazun zol wohalal gamahum."]],
      ["zazozon zalazun zoem gobulel.", ["zazozon zalazun zoem gobulel."]],
      ["zalazun zazozon zoel hahunom vowurol.", ["zalazun zazozon zoel hahunom vowurol."]],
      ["zazozon thubom zol guzemel.", ["zazozon thubom zol guzemel."]],
      ["zazozon helam zol guzemel.", ["zazozon helam zol guzemel."]],
      ["zazozon zalazun zoel gelazem hradol.", ["zazozon zalazun zoel gelazem hradol."]],
      ["zalazun zazozon zoel gelazem hrudol.", ["zalazun zazozon zoel gelazem hrudol."]],
      ["zalazun vowurol hragel.", ["zalazun hragel vowurol."]],
      // A digitless scale word, from `values.scale`; a mid-word x compound; a fraction after a plain noun or a count.
      ["zazozon zalazun zol hral vowurol.", ["zazozon zalazun zol hral vowurol."]],
      ["zazozon thagom zol bral vavurol.", ["zazozon thagom zol bral vavurol."]],
      ["zuwedaxubudal.", ["zuwedaxubudal."]],
      ["zedudal grugel vehohel.", ["zedudal grugel vehohel."]],
      ["zedudal gradol grugel vehohel.", ["zedudal gradol grugel vehohel."]],
    ];
    for (const [text, want] of cases) {
      const out = project(readTurn(text, tables), tables).map((view) => realize(view, tables));
      assert.deepEqual(out.map((o) => ("ageben" in o ? o.ageben : o.gap.detail)), want, text);
      assert.equal(sameReadings(text, want.join(" "), tables).verdict, "same", text);
    }
    // A role compound on -r resumes its event: it spells only after the verb it names.
    const role = project(readTurn("zazozon veduyol. zwuzeduyor vezuvel.", tables), tables).map((view) => realize(view, tables))[1];
    assert.ok(role && "gap" in role && role.gap.kind === "noSpell" && role.gap.detail.includes("z-←episode-agent-teach"), JSON.stringify(role));
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
