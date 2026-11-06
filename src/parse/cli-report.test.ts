import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { reportInput } from "./cli-report.js";
import { loadDefaultTables } from "./index.js";

const plain = { checkAmbiguity: false, constructions: false, checkLexicon: false };

describe("reportInput", () => {
  const tables = loadDefaultTables();

  it("prints the input, then its morph gloss", () => {
    const report = reportInput("zahelan howar voguvol.", tables, plain);
    assert.deepEqual(report.lines, ["zahelan howar voguvol.", "  z-Ahelan | h-ATTEMPT-trial | v-climb"]);
    assert.equal(report.failed, false);
  });

  it("names the word a word-level error comes from, on one line", () => {
    const report = reportInput("zahelan howr voguvol.", tables, plain);
    assert.equal(report.lines.length, 2);
    assert.match(report.lines[1]!, /^ {2}ERROR word "howr": /);
    assert.equal(report.failed, true);
  });

  it("lists an unlisted stem, and fails on it only with checkLexicon", () => {
    const loose = reportInput("zahelan vayebel dugugul.", tables, plain);
    assert.deepEqual(loose.lines.slice(1), ["  not in the lexicon: dugugul"]);
    assert.equal(loose.failed, false);
    assert.equal(reportInput("zahelan vayebel dugugul.", tables, { ...plain, checkLexicon: true }).failed, true);
  });

  it("adds a constructions line when asked", () => {
    const report = reportInput("zahelan howar voguvol.", tables, { ...plain, constructions: true });
    assert.match(report.lines.at(-1)!, /^ {2}constructions: .*overlay\.owar\.h/);
  });
});
