import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { createClassifyTablesFromRows, type ClassifyTables } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";
import { forEachMarkdownCodeToken } from "../retie/tokens.js";

import {
  classifyAgebonSpan,
  emptySpanStats,
  isAgebonLintCandidate,
  lintAgebonSpans,
  lintAgebonMarkdown,
  lintAgebonToken,
  peelLintChunk,
  unhostedJoins,
} from "./agebon-docs.js";
import { loadDefaultTables } from "../parse/index.js";
import { parseWithTables } from "../parse/parse-core.js";

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

describe("isAgebonLintCandidate", () => {
  it("skips fragments, slash PoS, teaching glosses, and placeholders", () => {
    assert.equal(isAgebonLintCandidate("/y/"), false);
    assert.equal(isAgebonLintCandidate("-r"), false);
    assert.equal(isAgebonLintCandidate("gl-"), false);
    assert.equal(isAgebonLintCandidate("e"), true);
    assert.equal(isAgebonLintCandidate("z-dog"), false);
    assert.equal(isAgebonLintCandidate("z-Azawan"), false);
    assert.equal(isAgebonLintCandidate("-e-xROOT"), false);
    assert.equal(isAgebonLintCandidate("…axul"), false);
    assert.equal(isAgebonLintCandidate("level"), false);
    assert.equal(isAgebonLintCandidate("x"), false);
    assert.equal(isAgebonLintCandidate("xa"), false);
    assert.equal(isAgebonLintCandidate("ax"), false);
    assert.equal(isAgebonLintCandidate("are"), false);
  });

  it("keeps full words, citations, numbers, and foreign payloads", () => {
    assert.equal(isAgebonLintCandidate("zazawan"), true);
    assert.equal(isAgebonLintCandidate("azawa"), true);
    assert.equal(isAgebonLintCandidate("g+3"), true);
    assert.equal(isAgebonLintCandidate("d<sushi>"), true);
    assert.equal(isAgebonLintCandidate("z<Sam>n"), true);
    assert.equal(isAgebonLintCandidate("x#e-"), true);
  });
});

describe("peelLintChunk", () => {
  it("peels sentence punct and wrapping parens, not writing-span brackets", () => {
    assert.deepEqual(peelLintChunk("zazawan."), { prefix: "", core: "zazawan", suffix: "." });
    assert.deepEqual(peelLintChunk("(hugem)"), { prefix: "(", core: "hugem", suffix: ")" });
    assert.deepEqual(peelLintChunk("d[hi]"), { prefix: "", core: "d[hi]", suffix: "" });
    assert.deepEqual(peelLintChunk("d<sushi>"), { prefix: "", core: "d<sushi>", suffix: "" });
  });
});

describe("lintAgebonToken", () => {
  const tables = tablesOf({
    published: [
      { root: "azawa", concrete: "dog" },
      { root: "uzumu", concrete: "quiet", abstract: "volume" },
      { root: "egera", concrete: "ability" },
      { root: "ululo", concrete: "courage" },
    ],
  });

  it("accepts known content, numbers, revisers, joins, and foreign spans", () => {
    assert.equal(lintAgebonToken("zazawan", tables), null);
    assert.equal(lintAgebonToken("uzumum", tables), null);
    assert.equal(lintAgebonToken("azawa", tables), null);
    assert.equal(lintAgebonToken("g+3", tables), null);
    assert.equal(lintAgebonToken("al", tables), null);
    assert.equal(lintAgebonToken("yal", tables), null);
    assert.equal(lintAgebonToken("d<jam>", tables), null);
    assert.equal(lintAgebonToken("just", tables), null);
    assert.equal(lintAgebonToken("jal", tables)?.detail, "`j` is not a letter; write `y`");
    assert.equal(lintAgebonToken("d<sushi>", tables), null);
    assert.equal(lintAgebonToken("d[hi]", tables), null);
    assert.equal(lintAgebonToken("thegera", tables), null);
  });

  it("skips English in backticks and flags illegal Agebon shapes", () => {
    assert.equal(lintAgebonToken("e", tables), null);
    assert.equal(lintAgebonToken("ae", tables), null);
    assert.equal(lintAgebonToken("g+", tables), null);
    assert.equal(lintAgebonToken("and", tables), null);
    assert.equal(lintAgebonToken("would", tables), null);
    assert.equal(lintAgebonToken("dog", tables), null);
    assert.equal(lintAgebonToken("when", tables), null);
    const illegal = lintAgebonToken("zolovexrabal", tables);
    assert.equal(illegal?.kind, "parse");
  });

  it("flags unknown content roots and unknown bare roots", () => {
    const word = lintAgebonToken("zububul", tables);
    assert.equal(word?.kind, "unknown-root");
    const bare = lintAgebonToken("ububu", tables);
    assert.equal(bare?.kind, "unknown-root");
    const named = lintAgebonToken("zububun", tables);
    assert.equal(named?.kind, "unknown-root");
    assert.equal(lintAgebonToken("zazawaxululon", tables), null);
    const title = lintAgebonToken("zazawaxububun", tables);
    assert.equal(title?.kind, "unknown-root");
  });
});

describe("lintAgebonMarkdown", () => {
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
    const issues = lintAgebonMarkdown(text, tables);
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
    const issues = lintAgebonMarkdown(text, tables);
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

describe("lintAgebonSpans", () => {
  const tables = tablesOf();

  it("parses whole sentences: a join before its conjuncts fails", () => {
    const text = "> `yol zazawan vul vazawal. yael.`\n>\n> y-question | z-Azawan | v-not | v-swan . y-yes\n";
    const issues = lintAgebonSpans(text, tables);
    assert.equal(issues.length, 1);
    assert.equal(issues[0]!.kind, "sentence");
    assert.match(issues[0]!.detail, /closes its conjuncts/);
    assert.deepEqual(lintAgebonSpans("`yol zazawan vazawal vul. yael.`", tables), []);
  });

  it("parses multi-word phrases unless marked a fragment", () => {
    assert.equal(lintAgebonSpans("`vowurol glorel`", tables)[0]?.kind, "phrase");
    assert.deepEqual(lintAgebonSpans("<!-- lint: fragment -->`vowurol glorel`", tables), []);
    assert.equal(lintAgebonSpans("<!-- lint: skip -->`wo zo yo`", tables)[0]?.kind, "bad-marker");
  });

  it("traces fragments with context supplied around them", () => {
    const used = new Set<string>();
    assert.deepEqual(lintAgebonSpans("<!-- lint: fragment -->`zam zal`", tables, undefined, (id) => used.add(id)), []);
    assert.ok(used.has("join.a"));
    assert.equal(lintAgebonSpans("<!-- lint: fragment -->`zul zul zo`", tables)[0]?.kind, "fragment");
  });

  it("traces templates by filling their slots", () => {
    const trace = (span: string): Set<string> => {
      const used = new Set<string>();
      assert.deepEqual(lintAgebonSpans(span, tables, undefined, (id) => used.add(id)), []);
      return used;
    };
    const hook = trace("`A am B`");
    assert.ok(hook.has("hook.am"));
    assert.ok(![...hook].some((id) => id.startsWith("hook.") && id !== "hook.am"));
    assert.ok(trace("`#Nx…`").has("word.xFamily.numeric"));
    assert.ok(trace("`+e-mx…`").has("word.xFamily.numeric"));
    assert.equal(lintAgebonSpans("`d[…`", tables)[0]?.kind, "template");
    assert.equal(lintAgebonSpans("`zo zo …`", tables)[0]?.kind, "template");
    assert.equal(classifyAgebonSpan("ROOT"), "english");
  });

  it("fails spans that mix Agebon and other words without a class", () => {
    assert.equal(classifyAgebonSpan("zazawan runs fast"), "unclassified");
    assert.equal(lintAgebonSpans("`zazawan runs fast`", tables)[0]?.kind, "unclassified");
    assert.equal(classifyAgebonSpan("A am B"), "template");
    assert.equal(classifyAgebonSpan("zazawan …"), "template");
    assert.equal(classifyAgebonSpan("fast"), "english");
  });

  it("requires an info string on fenced blocks and checks agebon fences", () => {
    assert.equal(lintAgebonSpans("```\nA HOOK B\n```\n", tables)[0]?.kind, "unmarked-fence");
    assert.deepEqual(lintAgebonSpans("```text\nA HOOK B\n```\n", tables), []);
    assert.equal(lintAgebonSpans("```text\nzazawan vowurol\n```\n", tables)[0]?.kind, "agebon-in-text-fence");
    assert.equal(lintAgebonSpans("```agebon\nzul zazawan vazawal.\n```\n", tables)[0]?.kind, "sentence");
  });

  it("checks HTML <code> spans and rejects unknown markers", () => {
    assert.equal(lintAgebonSpans("<code>zul zazawan vazawal.</code>", tables)[0]?.kind, "sentence");
    assert.equal(lintAgebonSpans("<!-- lint: nope -->`zazawan`", tables)[0]?.kind, "bad-marker");
  });

  it("traces a written <…> fence in <code> as a loan", () => {
    const ids: string[] = [];
    lintAgebonSpans("<code>zazawan d&lt;kimchi&gt; veyol.</code>", tables, emptySpanStats(), (id) => ids.push(id));
    assert.ok(ids.includes("word.family.foreign"));
  });

  it("lets a Fix it wrong form fail to parse, and uses none of its constructions", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    const md = PRACTICE.replace("<!-- lint: error -->`zazawan dalazun vayebel.`", "<!-- lint: error -->`zalazun dazawan.`");
    const fix = md.indexOf("`zalazun dazawan.`") + 1;
    const stats = emptySpanStats();
    const used: number[] = [];
    assert.deepEqual(lintAgebonSpans(md, houseTables(), stats, (_id, index) => used.push(index)), []);
    assert.equal(stats["marked-error"], 1);
    assert.ok(!used.includes(fix));
  });

  it("rejects the error marker outside a Fix it prompt", async () => {
    const { houseTables, PRACTICE } = await import("./practice-fixtures.js");
    assert.equal(lintAgebonSpans("<!-- lint: error -->`zazawan`", tables)[0]?.kind, "bad-marker");
    const md = PRACTICE.replace("**1.** `zalazun dahelan vayebel.`", "**1.** <!-- lint: error -->`zalazun dahelan vayebel.`");
    assert.equal(lintAgebonSpans(md, houseTables())[0]?.kind, "bad-marker");
    assert.equal(lintAgebonSpans(md.replace("### Practice", "### Translation practice"), houseTables())[0]?.kind, "bad-marker");
  });

  it("counts every span in exactly one class", () => {
    const stats = emptySpanStats();
    lintAgebonSpans("`zazawan vazawal.` `zazawan` `fast` `A am B` <!-- lint: fragment -->`zul zazawan`", tables, stats);
    assert.deepEqual(
      [stats.sentence, stats.word, stats.english, stats.template, stats["marked-fragment"]],
      [1, 1, 1, 1, 1],
    );
  });
});

describe("lintBareRoots", () => {
  it("flags a bare root missing from the lexicon, not a published one or a th seam", async () => {
    const { loadDefaultTables } = await import("../parse/index.js");
    const { lintBareRoots } = await import("./agebon-docs.js");
    const tables = loadDefaultTables();
    // Spellings from the live lexicon, so a retie can't publish the unknown one.
    const known = CLOSED.swan;
    const unknown = ["ezuzo", "ububu", "ededu", "ogogo"].find((root) => !tables.published.has(root))!;
    const found = lintBareRoots(`Use \`${known}\`, \`tha\`, \`thoge\`, and \`${unknown}\` or \`th${unknown}\`.`, tables).map((i) => i.text);
    assert.deepEqual(found, [unknown, `th${unknown}`]);
  });
});

describe("unhostedJoins", () => {
  const tables = loadDefaultTables();
  const found = (text: string) => unhostedJoins(parseWithTables(text, tables)).map(({ host, join }) => `${host.raw} ${join.raw}`);

  it("flags a plain /b/ join with no items right after a host word", () => {
    assert.deepEqual(found("yel hewem bar zazozon vowurol."), ["hewem bar"]);
    assert.deepEqual(found("zazozon vowurol huan bur."), ["huan bur"]);
    assert.deepEqual(found("yel hadurom bar zazozon varal."), ["hadurom bar"]);
  });

  it("leaves hosted blanks, hooks, plain nouns, and joins that close items", () => {
    assert.deepEqual(found("yel hewem blar zazozon vowurol."), []);
    assert.deepEqual(found("yel ol bar zazozon vowurol."), []);
    assert.deepEqual(found("zazozon hadurom balazun varal."), []);
    assert.deepEqual(found("zazozon vezuyol balazun thagom bol hral."), []);
    assert.deepEqual(found("yel bar zazozon hadurom varal."), []);
  });
});
