/**
 * The scope report (`npm run scope-report`) on two texts: one with frame order, one with a nested reading and a link to
 * it, so the record's sections, its relative targets, the counts and the diff are each checked once.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CURRENT_PARSER } from "../find/examples.js";
import { loadDefaultTables } from "../parse/index.js";
import { countReport, diffReports, formatReport, scopeReport } from "./scope-report.js";

const tables = loadDefaultTables();
const example = (text: string) => {
  const readings = CURRENT_PARSER.read(CURRENT_PARSER.parse(text, tables, { constructions: true }), tables);
  return { file: "fixture.md", text, allReadings: CURRENT_PARSER.all(readings) };
};
const ORDER = "yol yel vabuvul dubogal zawan.";
const NESTED = "henam blarl zalazun vezuyol";

describe("scope report", () => {
  const report = scopeReport([example(ORDER), example(NESTED)]);
  const readingsOf = (text: string) => report[`fixture.md: ${text}`]?.readings ?? [];

  it("records frame families and frame order", () => {
    const [r] = readingsOf(ORDER);
    assert.ok(r);
    assert.deepEqual(r.families, ["force", "force", "binder"]);
    assert.ok(r.order.includes("force > force rule more-turn-words.md#stacked-acts"), r.order.join("; "));
  });

  it("records a nested reading's kind and a link's target as a sentence offset", () => {
    const [top, dependent] = readingsOf(NESTED);
    assert.ok(top && dependent);
    assert.deepEqual(top.links, ["standIn lexReading:standIn -> 0/d"]);
    assert.equal(dependent.at, "s0/d");
    assert.equal(dependent.nested, "dependent");
  });

  it("counts examples per key with a sample text, and writes a full report", () => {
    const counts = countReport(report);
    assert.deepEqual(counts["order"]?.["force > force rule"], { examples: 1, sample: ORDER });
    assert.deepEqual(counts["nested readings"]?.["dependent"], { examples: 1, sample: NESTED });
    assert.ok(formatReport(report, counts).includes(`### fixture.md: ${NESTED}`));
  });

  it("diffs only the examples whose record changed", () => {
    assert.deepEqual(diffReports(report, scopeReport([example(ORDER), example(NESTED)])), []);
    const changed = scopeReport([example(ORDER)]);
    const first = changed[`fixture.md: ${ORDER}`]?.readings[0];
    assert.ok(first);
    first.families = [];
    assert.deepEqual(
      diffReports(report, changed).filter((l) => !l.startsWith("    ")),
      [`~ fixture.md: ${ORDER}`, `- fixture.md: ${NESTED}`],
    );
  });
});
