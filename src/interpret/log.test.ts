import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { appendTurn, buildLog, readQuestion, sentenceSpeakers, type Log } from "./log.js";

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

describe("readQuestion: a NOTIONAL question's supposition link (reader-solver boundary B5)", () => {
  const supposition = (texts: string[], question: string) => {
    const log = buildLog(texts.map((text, at) => ({ speaker: "A", at, text })), tables);
    const links = readQuestion(log, question, tables)[0]!.links.filter((l) => l.kind === "supposition");
    return links.map((l) => [l.key, l.to, l.frame?.family]);
  };
  it("links to the latest stated NOTIONAL reading in the log", () => {
    const texts = ["zazozon theyum vowurol.", "zazozon vehohel.", "zazozon theyum vowurol vul.", "zazozon vehohel."];
    const log = buildLog(texts.map((text, at) => ({ speaker: "A", at, text })), tables);
    assert.deepEqual(supposition(texts, "yel zazozon theyum vowurol."), [["link:supposition", log.readings[2]!.id, "notional"]]);
  });
  it("has no link with no NOTIONAL reading in the log, or no NOTIONAL frame on the question", () => {
    assert.deepEqual(supposition(["zazozon vowurol."], "yel zazozon theyum vowurol."), []);
    assert.deepEqual(supposition(["zazozon theyum vowurol."], "yel zazozon vowurol."), []);
  });

  // The supposition ends with its owner's NOTIONAL frame, and stays shared (notional.md#notional-as-if-framing, the
  // `supposition` row of interpreter.md#discourse-slots).
  const SUPPOSE = "z-Azozon | th-NOTIONAL-suppose | g-role-agent-teach";
  const ASK = spell("y-question | z-Azozon | th-NOTIONAL-suppose | v-teach");
  /** The reading index the question's supposition link points to, or undefined with no link. */
  const linkedTo = (turns: [string, string][], asker = "B"): number | undefined => {
    const log = buildLog(turns.map(([speaker, gloss], at) => ({ speaker, at, text: spell(gloss) })), tables);
    const links = readQuestion(log, ASK, tables, { speaker: asker })[0]!.links.filter((l) => l.kind === "supposition");
    assert.ok(links.length <= 1);
    return links[0] && log.readings.findIndex((r) => r.id === links[0]!.to);
  };
  it("links to another speaker's supposition, and to the owner's after another speaker's statement word", () => {
    assert.equal(linkedTo([["A", SUPPOSE]]), 0);
    assert.equal(linkedTo([["A", SUPPOSE]], "A"), 0);
    assert.equal(linkedTo([["A", SUPPOSE], ["B", "y-statement | z-Azozon | v-teach"]]), 0);
    assert.equal(linkedTo([["A", SUPPOSE], ["B", "z-Alazun | th-REPORTED | v-departure"]]), 0);
    assert.equal(linkedTo([["A", SUPPOSE], ["B", "x-by-the-way | z-Alazun | v-sleep"]]), 0);
  });
  it("links to the latest supposition still in force, by either speaker", () => {
    assert.equal(linkedTo([["A", SUPPOSE], ["B", "z-Alazun | th-NOTIONAL-suppose | v-teach"]]), 1);
    assert.equal(linkedTo([["A", SUPPOSE], ["A", "z-Alazun | th-NOTIONAL-suppose | v-teach"]]), 1);
    assert.equal(linkedTo([["A", SUPPOSE], ["B", "z-Alazun | th-NOTIONAL-suppose | v-teach"], ["B", "y-statement | z-Alazun | v-teach"]]), 0);
  });
  it("has no link once the owner's frame ends: a new channel, a written statement word, by the way, anyone's goodbye", () => {
    assert.equal(linkedTo([["A", SUPPOSE], ["A", "z-Alazun | th-REPORTED | v-departure"]]), undefined);
    for (const act of ["y-statement", "y-soft-statement", "y-provisional-statement"])
      assert.equal(linkedTo([["A", SUPPOSE], ["A", `${act} | z-Azozon | v-teach`]]), undefined, act);
    assert.equal(linkedTo([["A", SUPPOSE], ["A", "x-by-the-way | z-Alazun | v-sleep"]]), undefined);
    assert.equal(linkedTo([["A", "Alazun"], ["A", SUPPOSE]]), 1);
    assert.equal(linkedTo([["A", "Alazun"], ["A", SUPPOSE], ["B", "Alazun"]]), undefined);
    assert.equal(linkedTo([["A", "Alazun"], ["A", SUPPOSE], ["A", "Alazun"]]), undefined);
  });
});
