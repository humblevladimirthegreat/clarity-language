/**
 * The discourse slot table: every cell is stated with an anchor or `unstated` with today's behavior, and the cells the
 * code consults give today's behavior (interpreter.md#discourse-slots).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISCOURSE_SLOTS, endsAt, goodbyeEndsEveryone, perSpeaker, reachesQuote, SLOT_IDS, slotCellLabel, slotCells, slotOfLink } from "./discourse-slots.js";

describe("discourse slot table", () => {
  it("has one row per slot", () => {
    assert.deepEqual(
      DISCOURSE_SLOTS.map((row) => row.id),
      SLOT_IDS,
    );
  });

  it("cites a section for every stated cell and row, and none for an unstated cell", () => {
    const anchor = /^[a-z-]+\.md#[a-z0-9-]+$/;
    for (const { id, column, cell } of slotCells()) {
      if (cell.verdict === "unstated") assert.equal(cell.anchor, "", `${id} ${column}`);
      else assert.match(cell.anchor, anchor, `${id} ${column}`);
    }
    for (const row of DISCOURSE_SLOTS) {
      assert.ok(row.anchors.length > 0, row.id);
      for (const a of row.anchors) assert.match(a, anchor, row.id);
    }
  });

  it("keeps today's behavior where the code consults it", () => {
    // Carried frames: each speaker keeps their own; a statement word, by the way and a goodbye end it, a goodbye everyone's.
    assert.equal(perSpeaker("carriedFrame"), true);
    for (const event of ["newValue", "statementWord", "byTheWay", "goodbye"] as const) assert.equal(endsAt("carriedFrame", event), true, event);
    assert.equal(goodbyeEndsEveryone("carriedFrame"), true);
    // Point-backs look past a speaker change.
    assert.equal(perSpeaker("standInBack"), false);
    assert.equal(perSpeaker("hookResume"), false);
  });

  it("ends a supposition with its owner's NOTIONAL frame, and shares it", () => {
    // The supposition is its owner's carried NOTIONAL frame (carriedFrames' `suppositions`), so its end events are the
    // carried frame's; another speaker can still ask inside it.
    for (const event of ["newValue", "statementWord", "byTheWay", "goodbye"] as const) assert.equal(endsAt("supposition", event), endsAt("carriedFrame", event), event);
    assert.equal(goodbyeEndsEveryone("supposition"), true);
    assert.equal(perSpeaker("supposition"), false);
  });

  it("names the slot each reading link reads", () => {
    assert.equal(slotOfLink("carriedFrame carry:channel"), "carriedFrame");
    assert.equal(slotOfLink("standInBack lexReading:standInBack"), "standInBack");
    assert.equal(slotOfLink("polar edge:polar"), "sentenceBefore");
    assert.equal(slotOfLink("standIn lexReading:standIn"), undefined);
  });

  it("lets nothing from outside into a quote", () => {
    for (const row of DISCOURSE_SLOTS) assert.equal(reachesQuote(row.id), false, row.id);
    assert.equal(slotCellLabel(DISCOURSE_SLOTS.find((row) => row.id === "standInBack")!.quote), "blocks");
    assert.equal(slotCellLabel(DISCOURSE_SLOTS.find((row) => row.id === "hookResume")!.quote), "blocks");
  });

  it("lets only point-backs and the topic into an aside", () => {
    const aside = DISCOURSE_SLOTS.map((row) => `${row.id}: ${slotCellLabel(row.aside)}`);
    assert.deepEqual(aside, [
      "carriedFrame: blocks",
      "topic: passes",
      "standInBack: passes",
      "hookResume: passes",
      "supposition: blocks",
      "sentenceBefore: blocks",
      "answer: blocks",
    ]);
  });

  it("lists the unstated cells", () => {
    const open = slotCells()
      .filter(({ cell }) => cell.verdict === "unstated")
      .map(({ id, column, cell }) => `${id} ${column}: ${slotCellLabel(cell)}`);
    assert.deepEqual(open, [
      "standInBack statementWord: unstated (today: keeps)",
      "standInBack byTheWay: unstated (today: keeps)",
      "standInBack goodbye: unstated (today: keeps)",
      "standInBack kept: unstated (today: shared)",
      "hookResume newValue: unstated (today: ends)",
      "hookResume statementWord: unstated (today: keeps)",
      "hookResume byTheWay: unstated (today: keeps)",
      "hookResume goodbye: unstated (today: keeps)",
      "hookResume kept: unstated (today: shared)",
      "supposition quote: unstated (today: blocks)",
      "sentenceBefore statementWord: unstated (today: ends)",
      "sentenceBefore byTheWay: unstated (today: ends)",
      "sentenceBefore goodbye: unstated (today: ends)",
      "sentenceBefore kept: unstated (today: shared)",
      "sentenceBefore quote: unstated (today: blocks)",
      "answer newValue: unstated (today: ends)",
      "answer statementWord: unstated (today: ends)",
      "answer byTheWay: unstated (today: ends)",
      "answer goodbye: unstated (today: ends)",
      "answer kept: unstated (today: shared)",
      "answer quote: unstated (today: blocks)",
    ]);
  });
});
