/**
 * The boundary table: every cell is stated with an anchor or `unstated` with today's behavior, and the cells the code
 * consults give today's behavior (interpreter.md#boundaries).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BOUNDARIES, BOUNDARY_COLUMNS, boundaryCells, cellLabel, crosses, NESTED_KINDS } from "./boundaries.js";

describe("boundary table", () => {
  it("has one row per nested kind and one cell per column", () => {
    assert.deepEqual(
      BOUNDARIES.map((row) => row.kind),
      NESTED_KINDS,
    );
    for (const row of BOUNDARIES) assert.deepEqual(Object.keys(row.cells).sort(), Object.keys(BOUNDARY_COLUMNS).sort(), row.kind);
  });

  it("cites a section for every stated cell, and none for an unstated one", () => {
    for (const { kind, column, cell } of boundaryCells()) {
      if (cell.verdict === "unstated") assert.equal(cell.anchor, "", `${kind} ${column}`);
      else assert.match(cell.anchor, /^[a-z-]+\.md#[a-z0-9-]+$/, `${kind} ${column}`);
    }
  });

  it("keeps today's behavior where the code consults it", () => {
    // Scope records: a clause-join member holds the turn's edge frames and the rest-of-sentence tones; a dependent neither.
    assert.equal(crosses("member", "outerFrames", "copy"), true);
    assert.equal(crosses("member", "tone", "copy"), true);
    for (const kind of ["standInDependent", "slotDependent"] as const) {
      assert.equal(crosses(kind, "outerFrames", "copy"), false);
      assert.equal(crosses(kind, "tone", "copy"), false);
    }
    // A binder reaches the `blarl` grounds by link (joins.md#everything-ua); a later clause-join member, not yet.
    assert.equal(crosses("member", "binder", "copy"), false);
    assert.equal(crosses("grounds", "binder", "link"), true);
    // A bound tag's reach runs on into the sentence a final stand-in points to (universals-domains.md#bound-tags).
    assert.equal(crosses("grounds", "boundTag", "resolve"), true);
    // An aside's words see the tags as they are once the reach ends (spans.md#asides-th).
    assert.equal(crosses("aside", "boundTag", "resolve"), false);
    // Carried frames: only the main clause starts or ends one, and no nested reading takes a link of its own.
    for (const kind of NESTED_KINDS) {
      for (const column of ["carryStart", "carryEnd", "carried"] as const) assert.equal(crosses(kind, column, "link"), false, `${kind} ${column}`);
    }
    for (const kind of ["member", "standInDependent", "slotDependent"] as const) {
      assert.equal(cellLabel(BOUNDARIES.find((r) => r.kind === kind)!.cells.carryStart), "blocks");
      assert.equal(cellLabel(BOUNDARIES.find((r) => r.kind === kind)!.cells.carryEnd), "blocks");
    }
  });

  it("lists the unstated cells and the stated cells the code does not follow yet", () => {
    const open = boundaryCells()
      .filter(({ cell }) => cell.verdict === "unstated" || cell.today !== undefined)
      .map(({ kind, column, cell }) => `${kind} ${column}: ${cellLabel(cell)}`);
    assert.deepEqual(open, [
      "member outerFrames: unstated (today: passes)",
      "member holder: unstated (today: blocks)",
      "member carried: unstated (today: passes)",
      "member binder: passes (today: blocks)",
      "standInDependent outerFrames: unstated (today: blocks)",
      "standInDependent carried: unstated (today: passes)",
      "slotDependent outerFrames: unstated (today: blocks)",
      "slotDependent carried: unstated (today: passes)",
      "slotDependent binder: unstated (today: passes)",
      "slotDependent boundTag: unstated (today: passes)",
      "grounds outerFrames: unstated (today: blocks)",
      "grounds carryStart: unstated (today: passes)",
      "grounds carryEnd: unstated (today: passes)",
      "grounds carried: unstated (today: passes)",
      "grounds tone: unstated (today: blocks)",
      "island carried: unstated (today: passes)",
      "quote outerFrames: unstated (today: blocks)",
      "quote holder: unstated (today: blocks)",
      "quote binder: unstated (today: blocks)",
    ]);
  });
});
