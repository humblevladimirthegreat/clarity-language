import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";

import {
  classifyAgalanSpan,
  emptySpanStats,
  isAgalanLintCandidate,
  lintAgalanSpans,
  lintAgalanMarkdown,
  lintAgalanToken,
  peelLintChunk,
} from "./agalan-docs.js";

function tablesOf(opts?: {
  published?: Array<{ clarity: string; concrete?: string; abstract?: string }>;
}): ClassifyTables {
  return createClassifyTablesFromRows(
    (opts?.published ?? [{ clarity: "azawa", concrete: "dog" }]).map((row) => ({
      emoji: "",
      concrete: row.concrete ?? row.clarity,
      abstract: row.abstract ?? "",
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
      { clarity: "uzumu", concrete: "smile", abstract: "happy" },
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

  it("accepts a short resume only after its antecedent in the same block", () => {
    const tables = tablesOf({ published: [
        { clarity: "orugu", concrete: "pour" },
        { clarity: "azawa", concrete: "grace" },
        { clarity: "ululo", concrete: "wave" },
      ], });
    const text = "`zazawan vorugul. zululon vorur.` then `vorur`";
    const issues = lintAgalanMarkdown(text, tables);
    assert.deepEqual(
      issues.map((i) => `${i.kind}:${i.token}`),
      ["unknown-root:vorur"],
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

describe("lintAgalanSpans", () => {
  const tables = tablesOf();

  it("parses whole sentences: a join before its conjuncts fails", () => {
    const text = "> `jol zazawan vul vazawal. jael.`\n>\n> j-question | z-Azawan | v-not | v-swan . j-yes\n";
    const issues = lintAgalanSpans(text, tables);
    assert.equal(issues.length, 1);
    assert.equal(issues[0]!.kind, "sentence");
    assert.match(issues[0]!.detail, /closes its conjuncts/);
    assert.deepEqual(lintAgalanSpans("`jol zazawan vazawal vul. jael.`", tables), []);
  });

  it("parses multi-word phrases unless marked a fragment", () => {
    assert.equal(lintAgalanSpans("`zul zazawan`", tables)[0]?.kind, "phrase");
    assert.deepEqual(lintAgalanSpans("<!-- lint: fragment -->`zul zazawan`", tables), []);
    assert.equal(lintAgalanSpans("<!-- lint: skip -->`wo zo jo`", tables)[0]?.kind, "bad-marker");
  });

  it("traces fragments with context supplied around them", () => {
    const used = new Set<string>();
    assert.deepEqual(lintAgalanSpans("<!-- lint: fragment -->`xuxur xuxum`", tables, undefined, (id) => used.add(id)), []);
    assert.ok(used.has("span.close.editorial") && used.has("span.close.closeAll"));
    assert.equal(lintAgalanSpans("<!-- lint: fragment -->`xuxur xuxur zo`", tables)[0]?.kind, "fragment");
  });

  it("traces templates by filling their slots", () => {
    const trace = (span: string): Set<string> => {
      const used = new Set<string>();
      assert.deepEqual(lintAgalanSpans(span, tables, undefined, (id) => used.add(id)), []);
      return used;
    };
    const hook = trace("`A am B`");
    assert.ok(hook.has("hook.am"));
    assert.ok(![...hook].some((id) => id.startsWith("hook.") && id !== "hook.am"));
    const open = trace("`…axal`");
    assert.ok(open.has("span.type.a") && open.has("span.edge.a"));
    assert.ok(trace("`…l#N`").has("word.xFamily.numeric"));
    assert.ok(trace("`d[…`").has("span.edge.e"));
    assert.equal(lintAgalanSpans("`zo zo …`", tables)[0]?.kind, "template");
    assert.equal(classifyAgalanSpan("ROOT"), "english");
  });

  it("fails spans that mix Agalan and other words without a class", () => {
    assert.equal(classifyAgalanSpan("zazawan runs fast"), "unclassified");
    assert.equal(lintAgalanSpans("`zazawan runs fast`", tables)[0]?.kind, "unclassified");
    assert.equal(classifyAgalanSpan("A am B"), "template");
    assert.equal(classifyAgalanSpan("zazawan …"), "template");
    assert.equal(classifyAgalanSpan("fast"), "english");
  });

  it("requires an info string on fenced blocks and checks agalan fences", () => {
    assert.equal(lintAgalanSpans("```\nA HOOK B\n```\n", tables)[0]?.kind, "unmarked-fence");
    assert.deepEqual(lintAgalanSpans("```text\nA HOOK B\n```\n", tables), []);
    assert.equal(lintAgalanSpans("```text\ndaxal zazawan xuxul\n```\n", tables)[0]?.kind, "agalan-in-text-fence");
    assert.equal(lintAgalanSpans("```agalan\nzul zazawan vazawal.\n```\n", tables)[0]?.kind, "sentence");
  });

  it("checks HTML <code> spans and rejects unknown markers", () => {
    assert.equal(lintAgalanSpans("<code>zul zazawan vazawal.</code>", tables)[0]?.kind, "sentence");
    assert.equal(lintAgalanSpans("<!-- lint: nope -->`zazawan`", tables)[0]?.kind, "bad-marker");
  });

  it("traces a written <…> fence in <code> as a loan", () => {
    const ids: string[] = [];
    lintAgalanSpans("<code>zazawan d&lt;kimchi&gt; vejel.</code>", tables, emptySpanStats(), (id) => ids.push(id));
    assert.ok(ids.includes("word.family.foreign"));
  });

  it("counts every span in exactly one class", () => {
    const stats = emptySpanStats();
    lintAgalanSpans("`zazawan vazawal.` `zazawan` `fast` `A am B` <!-- lint: fragment -->`zul zazawan`", tables, stats);
    assert.deepEqual(
      [stats.sentence, stats.word, stats.english, stats.template, stats["marked-fragment"]],
      [1, 1, 1, 1, 1],
    );
  });
});
