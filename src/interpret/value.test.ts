import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "../parse/classify.js";
import { readText } from "./read.js";
import type { Term } from "./types.js";
import { compareValues, measureValue, numberValue, samePayload, termValue, type NumberValue } from "./value.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
/** The value of the one number in `zogozel <number>.` (a count on *cat*). */
const count = (number: string): NumberValue | undefined => {
  const term = readText(`zogozel ${number}.`, tables)[0]!.claim.predicate[0]!;
  return termValue(term);
};

describe("numberValue", () => {
  it("digitless-exponents.md#exponents: mantissa times ten to the exponent; a decimal point", () => {
    assert.deepEqual(count("g+27e12"), { kind: "scalar", value: 27e12 });
    assert.deepEqual(count("grawabadoyadorel"), { kind: "scalar", value: 27e12 });
    assert.deepEqual(count("g+5.2"), { kind: "scalar", value: 5.2 });
    assert.deepEqual(count("grudol"), { kind: "scalar", value: -2 });
  });

  it("digitless-exponents.md#group-separator: a scalar is the sum of its groups; a rank, ranks within ranks", () => {
    assert.deepEqual(count("g+5e3,860"), { kind: "scalar", value: 5860 });
    assert.deepEqual(count("grawageyazatheluvomol"), { kind: "scalar", value: 5860 });
    assert.deepEqual(count("g#2,3"), { kind: "rank", ranks: [2, 3] });
  });

  it("number-markers.md#marker-vowel-referential-identity: a rank, a rank from the end, a code, a percent", () => {
    assert.deepEqual(count("grodol"), { kind: "rank", ranks: [2] });
    assert.deepEqual(count("gruodol"), { kind: "rank", ranks: [2], fromEnd: true });
    assert.deepEqual(count("g_12"), { kind: "code", fields: ["12"] });
    assert.deepEqual(count("g+25%"), { kind: "scalar", value: 25, percent: "percent" });
  });

  it("a digitless word has no value", () => {
    assert.equal(numberValue({ marker: "+", groups: [] }), undefined);
  });

  it("compareValues orders scalars and ranks, never codes or mixed kinds", () => {
    assert.equal(compareValues(count("gragel")!, count("g+20")!), -1);
    assert.equal(compareValues(count("g#2")!, count("g#2")!), 0);
    assert.equal(compareValues(count("g_12")!, count("g_13")!), undefined);
    assert.equal(compareValues(count("g+25%")!, count("g+25")!), undefined);
  });
});

describe("measureValue", () => {
  it("measures-and-percent.md#measure-phrases: the unit's root and the amount", () => {
    const meter = readText("zazozon bozerom gradol vowurol.", tables)[0]!.claim.roles.b!;
    const measure = measureValue(meter)!;
    assert.deepEqual(measure.amount, { kind: "scalar", value: 2 });
    assert.equal(measure.unit, meter.kind === "thing" ? meter.root : "");
    assert.equal(measureValue(readText("zazozon bozerom vowurol.", tables)[0]!.claim.roles.b!), undefined);
  });
});

describe("samePayload", () => {
  it("a literal matches only its own payload", () => {
    const literal = (payload: string): Term => ({ kind: "literal", word: { raw: payload, family: { kind: "foreign", payload }, reading: "foreign" } as never, payload });
    assert.ok(samePayload(literal("Ana"), literal("Ana")));
    assert.ok(!samePayload(literal("Ana"), literal("ana")));
  });
});
