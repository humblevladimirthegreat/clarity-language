import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { houseTables } from "./practice-fixtures.js";
import { compareReadings, sameReading } from "./reading-equivalence.js";

describe("sameReading", () => {
  const tables = houseTables();

  it("matches a legal reordering", () => {
    assert.equal(sameReading("zuhelan duzozen vawebol.", "duzozen vawebol zuhelan.", tables), true);
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(sameReading("zuhelan duzozen vawebol.", "yal zuhelan duzozen vawebol.", tables), true);
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(sameReading("zuzozen vewurel. zaxar vuhohol.", "zuzozen vewurel. zuzozer vuhohol.", tables), true);
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(sameReading("zuzozen vewurel ol bolazun.", "ol bolazun zuzozen vewurel.", tables), true);
    assert.equal(sameReading("zuzozen huhohol hawebol vewurel.", "huhohol zuzozen hawebol vewurel.", tables), true);
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(sameReading("zuzozen vuhohol. zuzozen vawebol.", "zuzozen vuhohol. zuzozer vawebol.", tables), false);
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(sameReading("zuzozen dolazun vawebol. zuhelan duxal vawebol.", "zuzozen dolazun vawebol. zuhelan duxar vawebol.", tables), false);
    assert.equal(sameReading("zuzozen dolazun vawebol. zuhelan daxam vawebol.", "zuzozen dolazun vawebol. zuhelan daxar vawebol.", tables), false);
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(sameReading("zuzozen vuhohol. zaxuhohor vewurel.", "zuzozen vuhohol. zuhohor vewurel.", tables), false);
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(sameReading("zuzozen ol zolazun vawebol.", "zolazun ol zuzozen vawebol.", tables), false);
    assert.equal(sameReading("ul bolazun zuzozen el buhelan vewurel.", "el bolazun zuzozen ul buhelan vewurel.", tables), false);
  });

  it("does not match reordered /h/ words", () => {
    assert.equal(sameReading("zuzozen huhohol hawebol huel vewurel.", "zuzozen hawebol huhohol huel vewurel.", tables), false);
  });

  it("does not match swapped role letters", () => {
    assert.equal(sameReading("zuhelan duzozen vawebol.", "zuzozen duhelan vawebol.", tables), false);
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(sameReading("zuzozen vuhohol. duzozen vawebol.", "zuzozen vuhohol. zuzozer vawebol.", tables), false);
    assert.equal(sameReading("zuhelan duzozen vawebol.", "zuhelan dolazun vawebol.", tables), false);
  });

  it("does not match another speech act", () => {
    assert.equal(sameReading("zuhelan duzozen vawebol.", "yam zuhelan duzozen vawebol.", tables), false);
  });

  it("reports which side does not parse", () => {
    const compare = compareReadings("zuhelan duzozen vawebol.", "zuhelan duzozen.", tables);
    assert.equal(compare.same, false);
    assert.match(compare.error ?? "", /^zuhelan duzozen\.:/);
  });
});
