import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { houseTables } from "./practice-fixtures.js";
import { compareReadings, sameReading } from "./reading-equivalence.js";

describe("sameReading", () => {
  const tables = houseTables();

  it("matches a legal reordering", () => {
    assert.equal(sameReading("zahaben dazawan vahahal.", "dazawan vahahal zahaben.", tables), true);
  });

  it("matches an explicit yal against the omitted one", () => {
    assert.equal(sameReading("zahaben dazawan vahahal.", "yal zahaben dazawan vahahal.", tables), true);
  });

  it("matches a role pointer against a resume of the same one", () => {
    assert.equal(sameReading("zazawan vowogal. zaxar vehahel.", "zazawan vowogal. zazawar vehahel.", tables), true);
  });

  it("matches a hook phrase or an adverb moved as a whole", () => {
    assert.equal(sameReading("zazawan vowogal ol balahen.", "ol balahen zazawan vowogal.", tables), true);
    assert.equal(sameReading("zazawan hehahel hahahal vowogal.", "hehahel zazawan hahahal vowogal.", tables), true);
  });

  it("does not match a resume against a new noun of the same kind", () => {
    assert.equal(sameReading("zazawan vehahel. zazawan vahahal.", "zazawan vehahel. zazawar vahahal.", tables), false);
  });

  it("does not match a pointer in -l or -m against one in -r", () => {
    assert.equal(sameReading("zazawan dalahen vahahal. zahaben duxal vahahal.", "zazawan dalahen vahahal. zahaben duxar vahahal.", tables), false);
    assert.equal(sameReading("zazawan dalahen vahahal. zahaben daxam vahahal.", "zazawan dalahen vahahal. zahaben daxar vahahal.", tables), false);
  });

  it("does not match a role compound against the event's own resume", () => {
    assert.equal(sameReading("zazawan vehahel. zaxehaher vowogal.", "zazawan vehahel. zehaher vowogal.", tables), false);
  });

  it("does not match swapped hook sides or swapped hooks", () => {
    assert.equal(sameReading("zazawan ol zalahen vahahal.", "zalahen ol zazawan vahahal.", tables), false);
    assert.equal(sameReading("ul balahen zazawan el bahaben vowogal.", "el balahen zazawan ul bahaben vowogal.", tables), false);
  });

  it("does not match reordered /h/ words", () => {
    assert.equal(sameReading("zazawan hehahel hahahal huel vowogal.", "zazawan hahahal hehahel huel vowogal.", tables), false);
  });

  it("does not match swapped role letters", () => {
    assert.equal(sameReading("zahaben dazawan vahahal.", "zazawan dahaben vahahal.", tables), false);
  });

  it("does not match a resume in another slot, or a different root", () => {
    assert.equal(sameReading("zazawan vehahel. dazawan vahahal.", "zazawan vehahel. zazawar vahahal.", tables), false);
    assert.equal(sameReading("zahaben dazawan vahahal.", "zahaben dalahen vahahal.", tables), false);
  });

  it("does not match another speech act", () => {
    assert.equal(sameReading("zahaben dazawan vahahal.", "yam zahaben dazawan vahahal.", tables), false);
  });

  it("reports which side does not parse", () => {
    const compare = compareReadings("zahaben dazawan vahahal.", "zahaben dazawan.", tables);
    assert.equal(compare.same, false);
    assert.match(compare.error ?? "", /^zahaben dazawan\.:/);
  });
});
