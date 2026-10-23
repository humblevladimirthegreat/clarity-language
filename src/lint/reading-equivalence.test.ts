import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { houseTables } from "./practice-fixtures.js";
import { compareReadings, sameReading } from "./reading-equivalence.js";

describe("sameReading", () => {
  const tables = houseTables();

  it("matches a legal reordering", () => {
    assert.equal(sameReading("zahelan duzozen vawebol.", "duzozen vawebol zahelan.", tables), true);
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(sameReading("zahelan duzozen vawebol.", "yal zahelan duzozen vawebol.", tables), true);
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(sameReading("zuzozen vowurel. zwazar vuhohol.", "zuzozen vowurel. zuzozer vuhohol.", tables), true);
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(sameReading("zuzozen vowurel ol bolazun.", "ol bolazun zuzozen vowurel.", tables), true);
    assert.equal(sameReading("zuzozen huhohol hawebol vowurel.", "huhohol zuzozen hawebol vowurel.", tables), true);
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(sameReading("zuzozen vuhohol. zuzozen vawebol.", "zuzozen vuhohol. zuzozer vawebol.", tables), false);
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(sameReading("zuzozen dolazun vawebol. zahelan dwadal vawebol.", "zuzozen dolazun vawebol. zahelan dwadar vawebol.", tables), false);
    assert.equal(sameReading("zuzozen dolazun vawebol. zahelan dwazam vawebol.", "zuzozen dolazun vawebol. zahelan dwazar vawebol.", tables), false);
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(sameReading("zuzozen vuhohol. zwazuhohor vowurel.", "zuzozen vuhohol. zuhohor vowurel.", tables), false);
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(sameReading("zuzozen ol zolazun vawebol.", "zolazun ol zuzozen vawebol.", tables), false);
    assert.equal(sameReading("ul bolazun zuzozen el bahelan vowurel.", "el bolazun zuzozen ul bahelan vowurel.", tables), false);
  });

  it("does not match reordered /h/ words", () => {
    assert.equal(sameReading("zuzozen huhohol hawebol huol vowurel.", "zuzozen hawebol huhohol huol vowurel.", tables), false);
  });

  it("does not match swapped role letters", () => {
    assert.equal(sameReading("zahelan duzozen vawebol.", "zuzozen dahelan vawebol.", tables), false);
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(sameReading("zuzozen vuhohol. duzozen vawebol.", "zuzozen vuhohol. zuzozer vawebol.", tables), false);
    assert.equal(sameReading("zahelan duzozen vawebol.", "zahelan dolazun vawebol.", tables), false);
  });

  it("does not match another speech act", () => {
    assert.equal(sameReading("zahelan duzozen vawebol.", "yam zahelan duzozen vawebol.", tables), false);
  });

  it("reports which side does not parse", () => {
    const compare = compareReadings("zahelan duzozen vawebol.", "zahelan duzozen.", tables);
    assert.equal(compare.same, false);
    assert.match(compare.error ?? "", /^zahelan duzozen\.:/);
  });
});
