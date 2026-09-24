import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";

import {
  isAgalanLintCandidate,
  lintAgalanMarkdown,
  lintAgalanToken,
  peelLintChunk,
} from "./agalan-docs.js";

function tablesOf(opts?: {
  published?: Array<{ clarity: string; concrete?: string }>;
}): ClassifyTables {
  return createClassifyTablesFromRows(
    (opts?.published ?? [{ clarity: "azawa", concrete: "dog" }]).map((row) => ({
      emoji: "",
      concrete: row.concrete ?? row.clarity,
      abstract: "",
      clarity: row.clarity,
      mnemonic: "",
      englishByPos: "",
      posEnglish: emptyPosEnglish(),
    })),
    [],
  );
}

describe("isAgalanLintCandidate", () => {
  it("skips fragments, slash PoS, teaching glosses, and placeholders", () => {
    assert.equal(isAgalanLintCandidate("/j/"), false);
    assert.equal(isAgalanLintCandidate("-r"), false);
    assert.equal(isAgalanLintCandidate("gl-"), false);
    assert.equal(isAgalanLintCandidate("e"), true);
    assert.equal(isAgalanLintCandidate("z-dog"), false);
    assert.equal(isAgalanLintCandidate("z-Azawan"), false);
    assert.equal(isAgalanLintCandidate("ROOTl-e-"), false);
    assert.equal(isAgalanLintCandidate("…axul"), false);
    assert.equal(isAgalanLintCandidate("level"), false);
    assert.equal(isAgalanLintCandidate("x"), false);
    assert.equal(isAgalanLintCandidate("xa"), false);
    assert.equal(isAgalanLintCandidate("ax"), false);
    assert.equal(isAgalanLintCandidate("are"), false);
  });

  it("keeps full words, citations, numbers, and foreign payloads", () => {
    assert.equal(isAgalanLintCandidate("zazawan"), true);
    assert.equal(isAgalanLintCandidate("azawa"), true);
    assert.equal(isAgalanLintCandidate("g+3"), true);
    assert.equal(isAgalanLintCandidate("d<sushi>"), true);
    assert.equal(isAgalanLintCandidate("z<Sam>n"), true);
    assert.equal(isAgalanLintCandidate("x#e-"), true);
  });
});

describe("peelLintChunk", () => {
  it("peels sentence punct and wrapping parens, not writing-span brackets", () => {
    assert.deepEqual(peelLintChunk("zazawan."), { prefix: "", core: "zazawan", suffix: "." });
    assert.deepEqual(peelLintChunk("(hodom)"), { prefix: "(", core: "hodom", suffix: ")" });
    assert.deepEqual(peelLintChunk("d[hi]"), { prefix: "", core: "d[hi]", suffix: "" });
    assert.deepEqual(peelLintChunk("d<sushi>"), { prefix: "", core: "d<sushi>", suffix: "" });
  });
});

describe("lintAgalanToken", () => {
  const tables = tablesOf({
    published: [
      { clarity: "azawa", concrete: "dog" },
      { clarity: "uzumu", concrete: "happy" },
      { clarity: "egera", concrete: "ability" },
      { clarity: "ululo", concrete: "courage" },
    ],
  });

  it("accepts known content, numbers, revisers, joins, and foreign spans", () => {
    assert.equal(lintAgalanToken("zazawan", tables), null);
    assert.equal(lintAgalanToken("uzumum", tables), null);
    assert.equal(lintAgalanToken("azawa", tables), null);
    assert.equal(lintAgalanToken("g+3", tables), null);
    assert.equal(lintAgalanToken("al", tables), null);
    assert.equal(lintAgalanToken("jal", tables), null);
    assert.equal(lintAgalanToken("d<sushi>", tables), null);
    assert.equal(lintAgalanToken("d[hi]", tables), null);
    assert.equal(lintAgalanToken("daxal", tables), null);
    assert.equal(lintAgalanToken("xuxul", tables), null);
    assert.equal(lintAgalanToken("xuxun", tables), null);
    assert.equal(lintAgalanToken("thegera", tables), null);
  });

  it("skips English in backticks and flags illegal Agalan shapes", () => {
    assert.equal(lintAgalanToken("e", tables), null);
    assert.equal(lintAgalanToken("ae", tables), null);
    assert.equal(lintAgalanToken("g+", tables), null);
    assert.equal(lintAgalanToken("and", tables), null);
    assert.equal(lintAgalanToken("would", tables), null);
    assert.equal(lintAgalanToken("dog", tables), null);
    assert.equal(lintAgalanToken("when", tables), null);
    const illegal = lintAgalanToken("zolovexrabal", tables);
    assert.equal(illegal?.kind, "parse");
  });

  it("flags unknown content roots and unknown bare roots", () => {
    const word = lintAgalanToken("zububul", tables);
    assert.equal(word?.kind, "unknown-root");
    const bare = lintAgalanToken("ububu", tables);
    assert.equal(bare?.kind, "unknown-root");
    const named = lintAgalanToken("zububun", tables);
    assert.equal(named?.kind, "unknown-root");
    assert.equal(lintAgalanToken("zazawaxululon", tables), null);
    const title = lintAgalanToken("zazawaxububun", tables);
    assert.equal(title?.kind, "unknown-root");
  });
});

describe("lintAgalanMarkdown", () => {
  const tables = tablesOf({
    published: [{ clarity: "azawa", concrete: "dog" }],
  });

  it("checks backticks and fences, not prose", () => {
    const text = [
      "human sees `zazawan` and `zububul`.",
      "",
      "```",
      "zolovexrabal",
      "```",
      "",
      "<!-- `zububun` -->",
      "see [x](zububun.md)",
    ].join("\n");
    const issues = lintAgalanMarkdown(text, tables);
    assert.deepEqual(
      issues.map((i) => `${i.kind}:${i.token}`),
      ["unknown-root:zububul", "parse:zolovexrabal"],
    );
  });
});

describe("forEachMarkdownCodeToken", () => {
  it("visits inline and fenced tokens only", () => {
    const hits: string[] = [];
    forEachMarkdownCodeToken("prose zazawan then `ululon`.\n```\ng+3\n```\n", (t) => {
      hits.push(t.chunk);
    });
    assert.deepEqual(hits, ["ululon", "g+3"]);
  });
});
