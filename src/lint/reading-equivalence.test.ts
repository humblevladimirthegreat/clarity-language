import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { houseTables } from "./practice-fixtures.js";
import { compareReadings, sameReading } from "./reading-equivalence.js";

describe("sameReading", () => {
  const tables = houseTables();

  it("matches a legal reordering", () => {
    assert.equal(sameReading("zehalon duzazon vanobol.", "duzazon vanobol zehalon.", tables), true);
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(sameReading("zehalon duzazon vanobol.", "yal zehalon duzazon vanobol.", tables), true);
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(sameReading("zuzazon voworel. zaxar vehuhol.", "zuzazon voworel. zuzazor vehuhol.", tables), true);
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(sameReading("zuzazon voworel ol bolozun.", "ol bolozun zuzazon voworel.", tables), true);
    assert.equal(sameReading("zuzazon hehuhol hanobol voworel.", "hehuhol zuzazon hanobol voworel.", tables), true);
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(sameReading("zuzazon vehuhol. zuzazon vanobol.", "zuzazon vehuhol. zuzazor vanobol.", tables), false);
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(sameReading("zuzazon dolozun vanobol. zehalon duxal vanobol.", "zuzazon dolozun vanobol. zehalon duxar vanobol.", tables), false);
    assert.equal(sameReading("zuzazon dolozun vanobol. zehalon daxam vanobol.", "zuzazon dolozun vanobol. zehalon daxar vanobol.", tables), false);
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(sameReading("zuzazon vehuhol. zaxehuhor voworel.", "zuzazon vehuhol. zehuhor voworel.", tables), false);
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(sameReading("zuzazon ol zolozun vanobol.", "zolozun ol zuzazon vanobol.", tables), false);
    assert.equal(sameReading("ul bolozun zuzazon el behalon voworel.", "el bolozun zuzazon ul behalon voworel.", tables), false);
  });

  it("does not match reordered /h/ words", () => {
    assert.equal(sameReading("zuzazon hehuhol hanobol huel voworel.", "zuzazon hanobol hehuhol huel voworel.", tables), false);
  });

  it("does not match swapped role letters", () => {
    assert.equal(sameReading("zehalon duzazon vanobol.", "zuzazon dehalon vanobol.", tables), false);
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(sameReading("zuzazon vehuhol. duzazon vanobol.", "zuzazon vehuhol. zuzazor vanobol.", tables), false);
    assert.equal(sameReading("zehalon duzazon vanobol.", "zehalon dolozun vanobol.", tables), false);
  });

  it("does not match another speech act", () => {
    assert.equal(sameReading("zehalon duzazon vanobol.", "yam zehalon duzazon vanobol.", tables), false);
  });

  it("reports which side does not parse", () => {
    const compare = compareReadings("zehalon duzazon vanobol.", "zehalon duzazon.", tables);
    assert.equal(compare.same, false);
    assert.match(compare.error ?? "", /^zehalon duzazon\.:/);
  });
});
