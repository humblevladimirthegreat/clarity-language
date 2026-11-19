import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { appendTurn, buildLog, sentenceSpeakers, type Log } from "./log.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);
const spell = (...glosses: string[]): string => glosses.map((g) => glossToAgeben(g, tables, index) + ".").join(" ");

const TURNS = [
  { speaker: "A", at: 0, text: spell("z-Azozon | v-walk", "z-Alazun | v-run") },
  { speaker: "B", at: 1, text: spell("z-←Azozon | v-sleep") },
];

const summary = (log: Log): unknown =>
  log.entries.map((e) => ({ speaker: e.speaker, sentences: e.sentences, ids: e.readings.map((r) => r.id) }));

describe("log", () => {
  it("holds each turn's readings with its speaker; a turn's range counts sentences", () => {
    const log = buildLog(TURNS, tables);
    assert.deepEqual(summary(log), [
      { speaker: "A", sentences: { first: 0, count: 2 }, ids: ["t:0.0", "t:0.1"] },
      { speaker: "B", sentences: { first: 2, count: 1 }, ids: ["t:0.2"] },
    ]);
    assert.deepEqual(
      sentenceSpeakers(log).map((s) => s.speaker),
      ["A", "A", "B"],
    );
  });

  it("reads each turn with the transcript before it, so a pronoun binds across turns", () => {
    const log = buildLog(TURNS, tables);
    const who = log.entries[1]!.readings[0]!.claim.roles.z!;
    assert.ok(who.kind === "pronoun" && who.antecedent?.kind === "thing" && who.antecedent.root === "azozo");
  });

  it("the same turns give the same log", () => {
    assert.deepEqual(summary(buildLog(TURNS, tables)), summary(buildLog(TURNS, tables)));
  });

  it("a turn that does not parse adds nothing and is reported", () => {
    const log = buildLog(TURNS, tables);
    const after = appendTurn(log, { speaker: "A", at: 2, text: "zzz qq." }, tables);
    assert.equal(after.entries.length, 2);
    assert.equal(after.readings, log.readings);
    assert.equal(after.rejected.length, 1);
    assert.equal(after.rejected[0]!.at, 2);
    assert.equal(appendTurn(log, { speaker: "A", at: 3, text: "  " }, tables).rejected.length, 1);
  });

  it("a host window reads only the last turns; earlier turns keep their text", () => {
    const log = buildLog([...TURNS, { speaker: "A", at: 2, text: spell("z-Ahelan | v-sing") }], tables, { window: 1 });
    assert.deepEqual(
      log.entries.map((e) => e.readings.length),
      [0, 1, 1],
    );
    assert.equal(log.entries[0]!.text, TURNS[0]!.text);
  });

  // evidentiality.md#carry-forward: the frame is yours; another speaker's reply neither takes nor ends it.
  it("a reply between a hearsay statement and a bare one neither takes nor ends the frame", () => {
    const log = buildLog(
      [
        { speaker: "A", at: 0, text: spell("z-Alazun | th-REPORTED | v-departure") },
        { speaker: "B", at: 1, text: spell("z-Azozon | v-sleep") },
        { speaker: "A", at: 2, text: spell("z-Alazun | v-run") },
      ],
      tables,
    );
    const carried = (entry: number): string[] =>
      log.entries[entry]!.readings[0]!.links.filter((l) => l.kind === "carriedFrame").map((l) => `${l.to}`);
    assert.deepEqual(carried(1), []);
    assert.deepEqual(carried(2), [log.entries[0]!.readings[0]!.id]);
  });

  it("the replier's own frame stays theirs", () => {
    const log = buildLog(
      [
        { speaker: "A", at: 0, text: spell("z-Alazun | th-REPORTED | v-departure") },
        { speaker: "B", at: 1, text: spell("z-Azozon | th-REPORTED | v-sleep") },
        { speaker: "A", at: 2, text: spell("z-Alazun | v-run") },
      ],
      tables,
    );
    const to = log.entries[2]!.readings[0]!.links.filter((l) => l.kind === "carriedFrame").map((l) => l.to);
    assert.deepEqual(to, [log.entries[0]!.readings[0]!.id]);
  });

  // D16 of `solver-coverage.md`: a turn is for its calls; else its speaker's last call; else, with two speakers, the other.
  it("a turn carries its addressees from its calls, carried forward", () => {
    const who = (log: Log): string[] =>
      log.entries.map((e) =>
        e.addressees
          ? `${e.addressees.by} ${e.addressees.to.map((a) => (a.kind === "speaker" ? a.speaker : `${a.party.kind === "thing" ? a.party.root : a.party.kind}@${a.turn}`)).join(",")}`
          : "-",
      );
    const three = buildLog(
      [
        { speaker: "A", at: 0, text: "yalazun zawan vowurol." },
        { speaker: "A", at: 1, text: "zawan vezuvel." },
        { speaker: "B", at: 2, text: "zawan vowurol." },
        { speaker: "C", at: 3, text: "zawan vowurol." },
        { speaker: "B", at: 4, text: "yazozon. zawan vezuvel." },
        { speaker: "A", at: 5, text: "zawan vowurol." },
      ],
      tables,
    );
    assert.deepEqual(who(three), ["call alazu@0", "lastCall alazu@0", "otherSpeaker A", "-", "call azozo@4", "lastCall alazu@0"]);
    // The addressees stay with a turn that leaves the window.
    const windowed = buildLog(
      [
        { speaker: "A", at: 0, text: "yalazun zawan vowurol." },
        { speaker: "B", at: 1, text: "zawan vowurol." },
        { speaker: "A", at: 2, text: "zawan vezuvel." },
      ],
      tables,
      { window: 1 },
    );
    assert.deepEqual(who(windowed), ["call alazu@0", "otherSpeaker A", "lastCall alazu@0"]);
  });
});
