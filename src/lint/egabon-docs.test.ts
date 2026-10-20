import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";

import {
  classifyEgabonSpan,
  emptySpanStats,
  isEgabonLintCandidate,
  lintEgabonSpans,
  lintEgabonMarkdown,
  lintEgabonToken,
  peelLintChunk,
} from "./egabon-docs.js";

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

describe("isEgabonLintCandidate", () => {
  it("skips fragments, slash PoS, teaching glosses, and placeholders", () => {
    assert.equal(isEgabonLintCandidate("/y/"), false);
    assert.equal(isEgabonLintCandidate("-r"), false);
    assert.equal(isEgabonLintCandidate("gl-"), false);
    assert.equal(isEgabonLintCandidate("e"), true);
    assert.equal(isEgabonLintCandidate("z-dog"), false);
    assert.equal(isEgabonLintCandidate("z-Azawan"), false);
    assert.equal(isEgabonLintCandidate("ROOTl-e-"), false);
    assert.equal(isEgabonLintCandidate("…axul"), false);
    assert.equal(isEgabonLintCandidate("level"), false);
    assert.equal(isEgabonLintCandidate("x"), false);
    assert.equal(isEgabonLintCandidate("xa"), false);
    assert.equal(isEgabonLintCandidate("ax"), false);
    assert.equal(isEgabonLintCandidate("are"), false);
  });

  it("keeps full words, citations, numbers, and foreign payloads", () => {
    assert.equal(isEgabonLintCandidate("zazawan"), true);
    assert.equal(isEgabonLintCandidate("azawa"), true);
    assert.equal(isEgabonLintCandidate("g+3"), true);
    assert.equal(isEgabonLintCandidate("d<sushi>"), true);
    assert.equal(isEgabonLintCandidate("z<Sam>n"), true);
    assert.equal(isEgabonLintCandidate("x#e-"), true);
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

describe("lintEgabonToken", () => {
  const tables = tablesOf({
    published: [
      { root: "azawa", concrete: "dog" },
      { root: "uzumu", concrete: "quiet", abstract: "volume" },
      { root: "egera", concrete: "ability" },
      { root: "ululo", concrete: "courage" },
    ],
  });

  it("accepts known content, numbers, revisers, joins, and foreign spans", () => {
    assert.equal(lintEgabonToken("zazawan", tables), null);
    assert.equal(lintEgabonToken("uzumum", tables), null);
    assert.equal(lintEgabonToken("azawa", tables), null);
    assert.equal(lintEgabonToken("g+3", tables), null);
    assert.equal(lintEgabonToken("al", tables), null);
    assert.equal(lintEgabonToken("yal", tables), null);
    assert.equal(lintEgabonToken("d<jam>", tables), null);
    assert.equal(lintEgabonToken("just", tables), null);
    assert.equal(lintEgabonToken("jal", tables)?.detail, "`j` is not a letter; write `y`");
    assert.equal(lintEgabonToken("d<sushi>", tables), null);
    assert.equal(lintEgabonToken("d[hi]", tables), null);
    assert.equal(lintEgabonToken("xuxun", tables), null);
    assert.equal(lintEgabonToken("thegera", tables), null);
  });

  it("skips English in backticks and flags illegal Egabon shapes", () => {
    assert.equal(lintEgabonToken("e", tables), null);
    assert.equal(lintEgabonToken("ae", tables), null);
    assert.equal(lintEgabonToken("g+", tables), null);
    assert.equal(lintEgabonToken("and", tables), null);
    assert.equal(lintEgabonToken("would", tables), null);
    assert.equal(lintEgabonToken("dog", tables), null);
    assert.equal(lintEgabonToken("when", tables), null);
    const illegal = lintEgabonToken("zolovexrabal", tables);
    assert.equal(illegal?.kind, "parse");
  });

  it("flags unknown content roots and unknown bare roots", () => {
    const word = lintEgabonToken("zububul", tables);
    assert.equal(word?.kind, "unknown-root");
    const bare = lintEgabonToken("ububu", tables);
    assert.equal(bare?.kind, "unknown-root");
    const named = lintEgabonToken("zububun", tables);
    assert.equal(named?.kind, "unknown-root");
    assert.equal(lintEgabonToken("zazawaxululon", tables), null);
    const title = lintEgabonToken("zazawaxububun", tables);
    assert.equal(title?.kind, "unknown-root");
  });
});

describe("lintEgabonMarkdown", () => {
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
    const issues = lintEgabonMarkdown(text, tables);
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
    const issues = lintEgabonMarkdown(text, tables);
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

describe("lintEgabonSpans", () => {
  const tables = tablesOf();

  it("parses whole sentences: a join before its conjuncts fails", () => {
    const text = "> `yol zazawan vul vazawal. yael.`\n>\n> y-question | z-Azawan | v-not | v-swan . y-yes\n";
    const issues = lintEgabonSpans(text, tables);
    assert.equal(issues.length, 1);
    assert.equal(issues[0]!.kind, "sentence");
    assert.match(issues[0]!.detail, /closes its conjuncts/);
    assert.deepEqual(lintEgabonSpans("`yol zazawan vazawal vul. yael.`", tables), []);
  });

  it("parses multi-word phrases unless marked a fragment", () => {
    assert.equal(lintEgabonSpans("`vewurel glugol`", tables)[0]?.kind, "phrase");
    assert.deepEqual(lintEgabonSpans("<!-- lint: fragment -->`vewurel glugol`", tables), []);
    assert.equal(lintEgabonSpans("<!-- lint: skip -->`wo zo yo`", tables)[0]?.kind, "bad-marker");
  });

  it("traces fragments with context supplied around them", () => {
    const used = new Set<string>();
    assert.deepEqual(lintEgabonSpans("<!-- lint: fragment -->`zam zal`", tables, undefined, (id) => used.add(id)), []);
    assert.ok(used.has("join.a"));
    assert.equal(lintEgabonSpans("<!-- lint: fragment -->`zul zul zo`", tables)[0]?.kind, "fragment");
  });

  it("traces templates by filling their slots", () => {
    const trace = (span: string): Set<string> => {
      const used = new Set<string>();
      assert.deepEqual(lintEgabonSpans(span, tables, undefined, (id) => used.add(id)), []);
      return used;
    };
    const hook = trace("`A am B`");
    assert.ok(hook.has("hook.am"));
    assert.ok(![...hook].some((id) => id.startsWith("hook.") && id !== "hook.am"));
    assert.ok(trace("`…l#N`").has("word.xFamily.numeric"));
    assert.equal(lintEgabonSpans("`d[…`", tables)[0]?.kind, "template");
    assert.equal(lintEgabonSpans("`zo zo …`", tables)[0]?.kind, "template");
    assert.equal(classifyEgabonSpan("ROOT"), "english");
  });

  it("fails spans that mix Egabon and other words without a class", () => {
    assert.equal(classifyEgabonSpan("zazawan runs fast"), "unclassified");
    assert.equal(lintEgabonSpans("`zazawan runs fast`", tables)[0]?.kind, "unclassified");
    assert.equal(classifyEgabonSpan("A am B"), "template");
    assert.equal(classifyEgabonSpan("zazawan …"), "template");
    assert.equal(classifyEgabonSpan("fast"), "english");
  });

  it("requires an info string on fenced blocks and checks egabon fences", () => {
    assert.equal(lintEgabonSpans("```\nA HOOK B\n```\n", tables)[0]?.kind, "unmarked-fence");
    assert.deepEqual(lintEgabonSpans("```text\nA HOOK B\n```\n", tables), []);
    assert.equal(lintEgabonSpans("```text\nzazawan vewurel\n```\n", tables)[0]?.kind, "egabon-in-text-fence");
    assert.equal(lintEgabonSpans("```egabon\nzul zazawan vazawal.\n```\n", tables)[0]?.kind, "sentence");
  });

  it("checks HTML <code> spans and rejects unknown markers", () => {
    assert.equal(lintEgabonSpans("<code>zul zazawan vazawal.</code>", tables)[0]?.kind, "sentence");
    assert.equal(lintEgabonSpans("<!-- lint: nope -->`zazawan`", tables)[0]?.kind, "bad-marker");
  });

  it("traces a written <…> fence in <code> as a loan", () => {
    const ids: string[] = [];
    lintEgabonSpans("<code>zazawan d&lt;kimchi&gt; veyel.</code>", tables, emptySpanStats(), (id) => ids.push(id));
    assert.ok(ids.includes("word.family.foreign"));
  });

  it("lets a Fix it wrong form fail to parse, and uses none of its constructions", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    const md = PRACTICE.replace("<!-- lint: error -->`zazawan dolazun vawebol.`", "<!-- lint: error -->`zolazun dazawan.`");
    const fix = md.indexOf("`zolazun dazawan.`") + 1;
    const stats = emptySpanStats();
    const used: number[] = [];
    assert.deepEqual(lintEgabonSpans(md, houseTables(), stats, (_id, index) => used.push(index)), []);
    assert.equal(stats["marked-error"], 1);
    assert.ok(!used.includes(fix));
  });

  it("rejects the error marker outside a Fix it prompt", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    assert.equal(lintEgabonSpans("<!-- lint: error -->`zazawan`", tables)[0]?.kind, "bad-marker");
    const md = PRACTICE.replace("**1.** `zolazun duhelan vawebol.`", "**1.** <!-- lint: error -->`zolazun duhelan vawebol.`");
    assert.equal(lintEgabonSpans(md, houseTables())[0]?.kind, "bad-marker");
    assert.equal(lintEgabonSpans(md.replace("### Practice", "### Translation practice"), houseTables())[0]?.kind, "bad-marker");
  });

  it("counts every span in exactly one class", () => {
    const stats = emptySpanStats();
    lintEgabonSpans("`zazawan vazawal.` `zazawan` `fast` `A am B` <!-- lint: fragment -->`zul zazawan`", tables, stats);
    assert.deepEqual(
      [stats.sentence, stats.word, stats.english, stats.template, stats["marked-fragment"]],
      [1, 1, 1, 1, 1],
    );
  });
});

describe("lintBareRoots", () => {
  it("flags a bare root missing from the lexicon, not a published one or a th seam", async () => {
    const { loadDefaultTables } = await import("../parse/index.js");
    const { lintBareRoots } = await import("./egabon-docs.js");
    const tables = loadDefaultTables();
    // Spellings from the live lexicon, so a retie can't publish the unknown one.
    const known = CLOSED.swan;
    const unknown = ["ezuzo", "ububu", "ededu", "ogogo"].find((root) => !tables.published.has(root))!;
    const found = lintBareRoots(`Use \`${known}\`, \`tha\`, \`thehu\`, and \`${unknown}\` or \`th${unknown}\`.`, tables).map((i) => i.text);
    assert.deepEqual(found, [unknown, `th${unknown}`]);
  });
});
