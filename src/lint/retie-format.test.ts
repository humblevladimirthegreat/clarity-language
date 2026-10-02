import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";

import { lintRetieFormat } from "./retie-format.js";

function tablesOf(roots: string[]): ClassifyTables {
  return createClassifyTablesFromRows(
    roots.map((root) => ({
      emoji: "",
      concrete: "gloss",
      abstract: "",
      root,
      mnemonic: "",
      englishByPos: "",
      posEnglish: emptyPosEnglish(),
    })),
    [],
  );
}

const tables = tablesOf(["abaha", "adahe", "ezeba", "ezebo"]);

describe("lintRetieFormat", () => {
  it("requires an English id when a heading spells a published root", () => {
    const findings = lintRetieFormat("### Gravity (`abaha` / `adahe`)\n", tables);
    assert.equal(findings.length, 1);
    assert.match(findings[0]!.detail, /pin an English/);
  });

  it("leaves a pinned heading and a closed letter alone", () => {
    const markdown = "### Gravity (`abaha`) {#gravity}\n\n### Always (`hual`)\n";
    assert.deepEqual(lintRetieFormat(markdown, tables), []);
  });

  it("leaves italic prose alone, even a word that spells Agazan", () => {
    // Italics are English by policy; a root placement can make one spell Agazan (*buyer*: b + uye + r).
    assert.deepEqual(lintRetieFormat("A *buyer* pays; *abaha* is italic.\n", tablesOf(["uye", "abaha"])), []);
  });

  it("rejects retie: skip", () => {
    const markdown = "<!-- retie: skip -->\n\nSee `abaha`.\n";
    const details = lintRetieFormat(markdown, tables).map((finding) => finding.detail);
    assert.equal(details.length, 1);
    assert.match(details[0]!, /retie: skip/);
  });
});
