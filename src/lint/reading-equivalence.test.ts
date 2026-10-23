import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { houseTables } from "./practice-fixtures.js";
import { compareReadings, sameReading } from "./reading-equivalence.js";

describe("sameReading", () => {
  const tables = houseTables();

  it("matches a legal reordering", () => {
    assert.equal(sameReading("zahelan dazozon vayebel.", "dazozon vayebel zahelan.", tables), true);
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(sameReading("zahelan dazozon vayebel.", "yal zahelan dazozon vayebel.", tables), true);
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(sameReading("zazozon vowurol. zwuzer vehohel.", "zazozon vowurol. zazozor vehohel.", tables), true);
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(sameReading("zazozon vowurol el balazun.", "el balazun zazozon vowurol.", tables), true);
    assert.equal(sameReading("zazozon hehohel hayebel vowurol.", "hehohel zazozon hayebel vowurol.", tables), true);
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(sameReading("zazozon vehohel. zazozon vayebel.", "zazozon vehohel. zazozor vayebel.", tables), false);
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(sameReading("zazozon dalazun vayebel. zahelan dwudel vayebel.", "zazozon dalazun vayebel. zahelan dwuder vayebel.", tables), false);
    assert.equal(sameReading("zazozon dalazun vayebel. zahelan dwuzem vayebel.", "zazozon dalazun vayebel. zahelan dwuzer vayebel.", tables), false);
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(sameReading("zazozon vehohel. zwuzehoher vowurol.", "zazozon vehohel. zehoher vowurol.", tables), false);
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(sameReading("zazozon el zalazun vayebel.", "zalazun el zazozon vayebel.", tables), false);
    assert.equal(sameReading("ul balazun zazozon ol bahelan vowurol.", "ol balazun zazozon ul bahelan vowurol.", tables), false);
  });

  it("does not match reordered /h/ words", () => {
    assert.equal(sameReading("zazozon hehohel hayebel huol vowurol.", "zazozon hayebel hehohel huol vowurol.", tables), false);
  });

  it("does not match swapped role letters", () => {
    assert.equal(sameReading("zahelan dazozon vayebel.", "zazozon dahelan vayebel.", tables), false);
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(sameReading("zazozon vehohel. dazozon vayebel.", "zazozon vehohel. zazozor vayebel.", tables), false);
    assert.equal(sameReading("zahelan dazozon vayebel.", "zahelan dalazun vayebel.", tables), false);
  });

  it("does not match another speech act", () => {
    assert.equal(sameReading("zahelan dazozon vayebel.", "yam zahelan dazozon vayebel.", tables), false);
  });

  it("reports which side does not parse", () => {
    const compare = compareReadings("zahelan dazozon vayebel.", "zahelan dazozon.", tables);
    assert.equal(compare.same, false);
    assert.match(compare.error ?? "", /^zahelan dazozon\.:/);
  });
});
