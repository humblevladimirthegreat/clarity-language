import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";

import {
  classifyAgazanSpan,
  emptySpanStats,
  isAgazanLintCandidate,
  lintAgazanSpans,
  lintAgazanMarkdown,
  lintAgazanToken,
  peelLintChunk,
} from "./agazan-docs.js";

function tablesOf(opts?: {
  published?: Array<{ root: string; concrete?: string; abstract?: string }>;
}): ClassifyTables {
  return createClassifyTablesFromRows(
    (opts?.published ?? [{ root: "azawa", concrete: "dog" }]).map((row) => ({
      emoji: "",
      concrete: row.concrete ?? row.root,
      abstract: row.abstract ?? "",
      root: row.root,
      mnemonic: "",
      englishByPos: "",
      posEnglish: emptyPosEnglish(),
    })),
    [],
  );
}

describe("isAgazanLintCandidate", () => {
  it("skips fragments, slash PoS, teaching glosses, and placeholders", () => {
    assert.equal(isAgazanLintCandidate("/y/"), false);
    assert.equal(isAgazanLintCandidate("-r"), false);
    assert.equal(isAgazanLintCandidate("gl-"), false);
    assert.equal(isAgazanLintCandidate("e"), true);
    assert.equal(isAgazanLintCandidate("z-dog"), false);
    assert.equal(isAgazanLintCandidate("z-Azawan"), false);
    assert.equal(isAgazanLintCandidate("ROOTl-e-"), false);
    assert.equal(isAgazanLintCandidate("…axul"), false);
    assert.equal(isAgazanLintCandidate("level"), false);
    assert.equal(isAgazanLintCandidate("x"), false);
    assert.equal(isAgazanLintCandidate("xa"), false);
    assert.equal(isAgazanLintCandidate("ax"), false);
    assert.equal(isAgazanLintCandidate("are"), false);
  });

  it("keeps full words, citations, numbers, and foreign payloads", () => {
    assert.equal(isAgazanLintCandidate("zazawan"), true);
    assert.equal(isAgazanLintCandidate("azawa"), true);
    assert.equal(isAgazanLintCandidate("g+3"), true);
    assert.equal(isAgazanLintCandidate("d<sushi>"), true);
    assert.equal(isAgazanLintCandidate("z<Sam>n"), true);
    assert.equal(isAgazanLintCandidate("x#e-"), true);
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

describe("lintAgazanToken", () => {
  const tables = tablesOf({
    published: [
      { root: "azawa", concrete: "dog" },
      { root: "uzumu", concrete: "quiet", abstract: "volume" },
      { root: "egera", concrete: "ability" },
      { root: "ululo", concrete: "courage" },
    ],
  });

  it("accepts known content, numbers, revisers, joins, and foreign spans", () => {
    assert.equal(lintAgazanToken("zazawan", tables), null);
    assert.equal(lintAgazanToken("uzumum", tables), null);
    assert.equal(lintAgazanToken("azawa", tables), null);
    assert.equal(lintAgazanToken("g+3", tables), null);
    assert.equal(lintAgazanToken("al", tables), null);
    assert.equal(lintAgazanToken("yal", tables), null);
    assert.equal(lintAgazanToken("d<jam>", tables), null);
    assert.equal(lintAgazanToken("just", tables), null);
    assert.equal(lintAgazanToken("jal", tables)?.detail, "`j` is not a letter; write `y`");
    assert.equal(lintAgazanToken("d<sushi>", tables), null);
    assert.equal(lintAgazanToken("d[hi]", tables), null);
    assert.equal(lintAgazanToken("xuxun", tables), null);
    assert.equal(lintAgazanToken("thegera", tables), null);
  });

  it("skips English in backticks and flags illegal Agazan shapes", () => {
    assert.equal(lintAgazanToken("e", tables), null);
    assert.equal(lintAgazanToken("ae", tables), null);
    assert.equal(lintAgazanToken("g+", tables), null);
    assert.equal(lintAgazanToken("and", tables), null);
    assert.equal(lintAgazanToken("would", tables), null);
    assert.equal(lintAgazanToken("dog", tables), null);
    assert.equal(lintAgazanToken("when", tables), null);
    const illegal = lintAgazanToken("zolovexrabal", tables);
    assert.equal(illegal?.kind, "parse");
  });

  it("flags unknown content roots and unknown bare roots", () => {
    const word = lintAgazanToken("zububul", tables);
    assert.equal(word?.kind, "unknown-root");
    const bare = lintAgazanToken("ububu", tables);
    assert.equal(bare?.kind, "unknown-root");
    const named = lintAgazanToken("zububun", tables);
    assert.equal(named?.kind, "unknown-root");
    assert.equal(lintAgazanToken("zazawaxululon", tables), null);
    const title = lintAgazanToken("zazawaxububun", tables);
    assert.equal(title?.kind, "unknown-root");
  });
});

describe("lintAgazanMarkdown", () => {
  const tables = tablesOf({
    published: [{ root: "azawa", concrete: "dog" }],
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
    const issues = lintAgazanMarkdown(text, tables);
    assert.deepEqual(
      issues.map((i) => `${i.kind}:${i.token}`),
      ["unknown-root:zububul", "parse:zolovexrabal"],
    );
  });

  it("accepts a resume of a stem outside the lexicon only after its antecedent in the same block", () => {
    const tables = tablesOf({ published: [
        { root: "orugu", concrete: "pour" },
        { root: "azawa", concrete: "grace" },
        { root: "ululo", concrete: "wave" },
      ], });
    const text = "`zazawan vorugulal. zululon vorugular.` then `vorugular`";
    const issues = lintAgazanMarkdown(text, tables);
    assert.deepEqual(
      issues.map((i) => `${i.kind}:${i.token}`),
      ["unknown-root:vorugular"],
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

describe("lintAgazanSpans", () => {
  const tables = tablesOf();

  it("parses whole sentences: a join before its conjuncts fails", () => {
    const text = "> `yol zazawan vul vazawal. yael.`\n>\n> y-question | z-Azawan | v-not | v-swan . y-yes\n";
    const issues = lintAgazanSpans(text, tables);
    assert.equal(issues.length, 1);
    assert.equal(issues[0]!.kind, "sentence");
    assert.match(issues[0]!.detail, /closes its conjuncts/);
    assert.deepEqual(lintAgazanSpans("`yol zazawan vazawal vul. yael.`", tables), []);
  });

  it("parses multi-word phrases unless marked a fragment", () => {
    assert.equal(lintAgazanSpans("`vowogal glugol`", tables)[0]?.kind, "phrase");
    assert.deepEqual(lintAgazanSpans("<!-- lint: fragment -->`vowogal glugol`", tables), []);
    assert.equal(lintAgazanSpans("<!-- lint: skip -->`wo zo yo`", tables)[0]?.kind, "bad-marker");
  });

  it("traces fragments with context supplied around them", () => {
    const used = new Set<string>();
    assert.deepEqual(lintAgazanSpans("<!-- lint: fragment -->`zam zal`", tables, undefined, (id) => used.add(id)), []);
    assert.ok(used.has("join.a"));
    assert.equal(lintAgazanSpans("<!-- lint: fragment -->`zul zul zo`", tables)[0]?.kind, "fragment");
  });

  it("traces templates by filling their slots", () => {
    const trace = (span: string): Set<string> => {
      const used = new Set<string>();
      assert.deepEqual(lintAgazanSpans(span, tables, undefined, (id) => used.add(id)), []);
      return used;
    };
    const hook = trace("`A am B`");
    assert.ok(hook.has("hook.am"));
    assert.ok(![...hook].some((id) => id.startsWith("hook.") && id !== "hook.am"));
    assert.ok(trace("`…l#N`").has("word.xFamily.numeric"));
    assert.equal(lintAgazanSpans("`d[…`", tables)[0]?.kind, "template");
    assert.equal(lintAgazanSpans("`zo zo …`", tables)[0]?.kind, "template");
    assert.equal(classifyAgazanSpan("ROOT"), "english");
  });

  it("fails spans that mix Agazan and other words without a class", () => {
    assert.equal(classifyAgazanSpan("zazawan runs fast"), "unclassified");
    assert.equal(lintAgazanSpans("`zazawan runs fast`", tables)[0]?.kind, "unclassified");
    assert.equal(classifyAgazanSpan("A am B"), "template");
    assert.equal(classifyAgazanSpan("zazawan …"), "template");
    assert.equal(classifyAgazanSpan("fast"), "english");
  });

  it("requires an info string on fenced blocks and checks agazan fences", () => {
    assert.equal(lintAgazanSpans("```\nA HOOK B\n```\n", tables)[0]?.kind, "unmarked-fence");
    assert.deepEqual(lintAgazanSpans("```text\nA HOOK B\n```\n", tables), []);
    assert.equal(lintAgazanSpans("```text\nzazawan vowogal\n```\n", tables)[0]?.kind, "agazan-in-text-fence");
    assert.equal(lintAgazanSpans("```agazan\nzul zazawan vazawal.\n```\n", tables)[0]?.kind, "sentence");
  });

  it("checks HTML <code> spans and rejects unknown markers", () => {
    assert.equal(lintAgazanSpans("<code>zul zazawan vazawal.</code>", tables)[0]?.kind, "sentence");
    assert.equal(lintAgazanSpans("<!-- lint: nope -->`zazawan`", tables)[0]?.kind, "bad-marker");
  });

  it("traces a written <…> fence in <code> as a loan", () => {
    const ids: string[] = [];
    lintAgazanSpans("<code>zazawan d&lt;kimchi&gt; veyel.</code>", tables, emptySpanStats(), (id) => ids.push(id));
    assert.ok(ids.includes("word.family.foreign"));
  });

  it("lets a Fix it wrong form fail to parse, and uses none of its constructions", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    const md = PRACTICE.replace("<!-- lint: error -->`zazawan dalahen vahahal.`", "<!-- lint: error -->`zalahen dazawan.`");
    const fix = md.indexOf("`zalahen dazawan.`") + 1;
    const stats = emptySpanStats();
    const used: number[] = [];
    assert.deepEqual(lintAgazanSpans(md, houseTables(), stats, (_id, index) => used.push(index)), []);
    assert.equal(stats["marked-error"], 1);
    assert.ok(!used.includes(fix));
  });

  it("rejects the error marker outside a Fix it prompt", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    assert.equal(lintAgazanSpans("<!-- lint: error -->`zazawan`", tables)[0]?.kind, "bad-marker");
    const md = PRACTICE.replace("**1.** `zalahen dahaben vahahal.`", "**1.** <!-- lint: error -->`zalahen dahaben vahahal.`");
    assert.equal(lintAgazanSpans(md, houseTables())[0]?.kind, "bad-marker");
    assert.equal(lintAgazanSpans(md.replace("### Practice", "### Translation practice"), houseTables())[0]?.kind, "bad-marker");
  });

  it("counts every span in exactly one class", () => {
    const stats = emptySpanStats();
    lintAgazanSpans("`zazawan vazawal.` `zazawan` `fast` `A am B` <!-- lint: fragment -->`zul zazawan`", tables, stats);
    assert.deepEqual(
      [stats.sentence, stats.word, stats.english, stats.template, stats["marked-fragment"]],
      [1, 1, 1, 1, 1],
    );
  });
});

describe("lintBareRoots", () => {
  it("flags a bare root missing from the lexicon, not a published one or a th seam", async () => {
    const { loadDefaultTables } = await import("../parse/index.js");
    const { lintBareRoots } = await import("./agazan-docs.js");
    const tables = loadDefaultTables();
    const found = lintBareRoots("Use `azawa`, `tha`, `thehu`, and `ezuzo` or `thezuzo`.", tables).map((i) => i.text);
    assert.deepEqual(found, ["ezuzo", "thezuzo"]);
  });
});
