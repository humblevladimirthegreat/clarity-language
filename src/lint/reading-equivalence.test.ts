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

  it("matches a resume form against its antecedent", () => {
    assert.equal(sameReading("zazawan vehahel. zazawan vahahal.", "zazawan vehahel. zazawar vahahal.", tables), true);
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
