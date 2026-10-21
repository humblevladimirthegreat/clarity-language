import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { checkpointStops, EVERYTHING, gate, neededPosition, type GateData } from "./gating.js";

const data: GateData = {
  sections: [
    { anchor: "a.md#beginner", title: "Beginner", band: "beginner" },
    { anchor: "a.md#beginner-practice", title: "Practice", band: "beginner" },
    { anchor: "b.md#beginner", title: "Beginner", band: "beginner" },
    { anchor: "b.md#beginner-practice", title: "Practice", band: "beginner" },
  ],
  homes: { early: 0, late: 2 },
  coreRoots: { udozo: 1, agozo: 3 },
  grammarRoots: ["uwo"],
};

describe("gate", () => {
  it("passes what is taught by the position, and names what is not", () => {
    assert.deepEqual(gate(data, { position: 1 }, ["early"], ["udozo", "uwo"]), { ok: true, constructions: [], roots: [] });
    assert.deepEqual(gate(data, { position: 1 }, ["late", "unknown"], ["agozo"]), { ok: false, constructions: ["late", "unknown"], roots: ["agozo"] });
  });

  it("lets the scene's one new root through", () => {
    assert.ok(gate(data, { position: 1 }, [], ["agozo"], "agozo").ok);
  });

  it("opens everything in the sandbox", () => {
    assert.ok(gate(data, EVERYTHING, ["unknown"], ["nothing"]).ok);
  });
});

describe("neededPosition", () => {
  it("is the furthest home", () => {
    assert.equal(neededPosition(data, ["early", "late"]), 2);
  });
});

describe("checkpointStops", () => {
  it("lists the Practice sections in order", () => {
    assert.deepEqual(checkpointStops(data).map((s) => s.position), [1, 3]);
  });
});
