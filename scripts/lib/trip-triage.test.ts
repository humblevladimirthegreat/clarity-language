import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatTally, pickTrips, tallyTrips, tripReason } from "./trip-triage.ts";

const trip = (verdict: string, key: string, detail?: string, ageben = "t.", source = "f.md:1") => ({ verdict, key, detail, ageben, source });

describe("round-trip triage", () => {
  it("reads the reason after the key, or after a gloss with the gloss as …", () => {
    assert.equal(tripReason(trip("gap:noRule", "edge:force", "edge:force: frame lexReading:restrictor")), "frame lexReading:restrictor");
    assert.equal(tripReason(trip("gap:noRule", "lexReading:restrictor", "lexReading:restrictor: frame lexReading:restrictor")), "frame lexReading:restrictor");
    assert.equal(tripReason(trip("gap:noSpell", "anaphor:content", "z-←swan | v-sit: gloss does not round-trip: z-←swan | v-sit")), "gloss does not round-trip: …");
    assert.equal(tripReason(trip("gap:noSpell", "claim", "z-a | [v-b | v-c]: gloss does not round-trip: z-a | [v-b | v-c]")), "gloss does not round-trip: …");
    assert.equal(tripReason(trip("gap:noSpell", "claim", "z-dog | g-big-able: no Ageben form glosses as g-big-able")), "no Ageben form glosses as …");
    assert.equal(tripReason(trip("gap:noParse", "claim", "z-←tag.A | g-x → zwar guzemel: does not parse (zwar: a tag needs")), "does not parse (…: a tag needs");
    assert.equal(tripReason(trip("ok", "edge:force")), "(ok)");
  });

  it("tallies each key's trips by reason, the commonest first, with the first sample", () => {
    const trips = [trip("gap:noRule", "edge:force", "edge:force: a linker link", "a.", "a.md:1"), trip("gap:noRule", "edge:force", "edge:force: a number blank", "b.", "b.md:2"), trip("gap:noRule", "edge:force", "edge:force: a number blank", "c.", "c.md:3"), trip("ok", "claim")];
    const [edge, none] = tallyTrips(trips, ["edge", "nosuch"]);
    assert.equal(edge!.trips, 3);
    assert.deepEqual(edge!.reasons.map((r) => `${r.count} ${r.reason} ${r.text} ${r.source}`), ["2 a number blank b. b.md:2", "1 a linker link a. a.md:1"]);
    assert.equal(none!.trips, 0);
    const lines = formatTally([edge!], 1);
    assert.equal(lines[0], "edge  3 trip(s), 2 reason(s)");
    assert.match(lines[1]!, /^ {5}2 {2}a number blank {2}b\. {2}b\.md:2$/);
    assert.equal(lines[2], "  … 1 more reason(s)");
  });

  it("picks at most N trips per key, each once, in order", () => {
    const trips = [trip("ok", "edge:force"), trip("gap:noRule", "edge:force"), trip("gap:noRule", "unit:linker"), trip("gap:noRule", "unit:linker")];
    assert.equal(pickTrips(trips, ["edge", "unit"]).length, 4);
    assert.deepEqual(pickTrips(trips, ["edge:force", "gap:noRule", "unit"], 1), [trips[0], trips[1], trips[2]]);
  });
});
