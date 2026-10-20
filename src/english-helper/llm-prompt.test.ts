import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { loadPromptContext } from "../parse/llm-examples.js";
import type { ExamplePair } from "../parse/llm-prompt.js";
import { analyzeEnglish, type RootSuggestion } from "./analyze.js";
import { buildHelperPrompt, promptForEnglish, selectHelperExamples } from "./llm-prompt.js";
import { loadHelperData } from "./load.js";
import { verifyDraft } from "./verify.js";

const tables = loadDefaultTables();
const data = loadHelperData();
const context = loadPromptContext(tables);

function examplesIn(prompt: string): string[] {
  return [...prompt.matchAll(/^AGAZAN: (.+)$/gm)].map((m) => m[1]!).filter((line) => !line.startsWith("<"));
}

describe("English helper prompt", () => {
  it("carries the skeleton, the rules, doc examples, and the English", () => {
    const english = "My sister could not come.";
    const prompt = promptForEnglish([english], data, context);
    for (const heading of ["## How to write Agazan", "## How to read the gloss", "## Analysis", "## Examples", "## Task", "## English"]) {
      assert.ok(prompt.includes(heading), heading);
    }
    assert.ok(prompt.trimEnd().endsWith(english));
    assert.ok(prompt.includes('clause 1  "My sister could not come."'));
    const examples = examplesIn(prompt);
    const inline = analyzeEnglish(data, english)
      .clauses.flatMap((c) => [...c.detectors, ...c.slots.flatMap((s) => s.suggestions)])
      .flatMap((s) => ((s.kind === "detector" || s.kind === "job" || s.kind === "entry") && s.example ? [s.example.form] : []));
    assert.ok(inline.length > 0);
    assert.ok(examples.length >= 2 && examples.length <= 6 + new Set(inline).size, `${examples.length} examples`);
    for (const agazan of inline) assert.ok(examples.includes(agazan), agazan);
    for (const agazan of examples) assert.ok(context.index.some((pair) => pair.agazan === agazan), agazan);
  });

  it("explains only the constructions its examples use", () => {
    const prompt = promptForEnglish(["The cat sleeps on the green book."], data, context);
    const shown = new Set(context.index.filter((pair) => examplesIn(prompt).includes(pair.agazan)).flatMap((pair) => pair.constructions));
    for (const [id, reader] of context.readers) {
      if (prompt.includes(`- ${reader}`)) assert.ok(shown.has(id), id);
    }
  });

  it("picks examples that cover the input's roots", () => {
    const english = "A dog walks.";
    const analysis = analyzeEnglish(data, english);
    const roots = analysis.clauses
      .flatMap((c) => c.slots.flatMap((s) => s.suggestions))
      .filter((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === "root")
      .map((s) => s.form);
    assert.ok(roots.length >= 2);
    const examples = examplesIn(buildHelperPrompt([{ english, analysis }], data, context));
    for (const root of roots) assert.ok(examples.some((agazan) => agazan.includes(root)), `${root}:\n${examples.join("\n")}`);
  });

  it("numbers several inputs and never shows an input's own doc pair", () => {
    const pair = context.index.find((p) => p.note == null && p.sentence.split(" ").length >= 3)!;
    const prompt = promptForEnglish([pair.sentence, "Uzazon walks."], data, context);
    assert.ok(prompt.includes(`1 ${pair.sentence}\n2 Uzazon walks.`));
    assert.ok(!examplesIn(prompt).includes(pair.agazan));
  });

  it("builds the same prompt from the page's JSON context", () => {
    // The Inspect page gets the context through a VitePress data loader, Maps as entry arrays.
    const json = JSON.parse(JSON.stringify({ ...context, labelGlosses: [...context.labelGlosses], readers: [...context.readers], anchors: [...context.anchors!] }));
    const page = { index: json.index, labelGlosses: new Map(json.labelGlosses), readers: new Map(json.readers), anchors: new Map(json.anchors) } as typeof context;
    const text = ["The teacher gave Olozun a book.", "We drink tea instead of coffee."];
    assert.equal(promptForEnglish(text, data, page), promptForEnglish(text, data, context));
  });

  it("takes the illustration from the input's own spelled word", () => {
    const analysis = analyzeEnglish(data, "A dog walks.");
    const dog = analysis.clauses[0]!.slots.find((s) => s.text === "dog")!.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon")!;
    const prompt = buildHelperPrompt([{ english: "A dog walks.", analysis }], data, context, { examples: 0 });
    assert.ok(prompt.includes(`\`${dog.word}\` = role letter \`${dog.role}\` + root \`${dog.form}\``));
    assert.equal(examplesIn(prompt).length, 0);
  });
});

function pair(agazan: string, sentence: string, constructions: string[] = []): ExamplePair {
  return { agazan, gloss: agazan, sentence, note: null, constructions, labels: [], source: "x.md:1" };
}

describe("selectHelperExamples", () => {
  const pool = [
    pair("zaaaal vbbbbl.", "One walks."),
    pair("zaaaal vcccl.", "One runs."),
    pair("zddddl vbbbbl.", "Two walk."),
    pair("zeeeel veeeel.", "Three rest.", ["rare.construction"]),
    pair("zffffl vffffl.", "Four rest."),
  ];

  it("covers rare features first and stops when nothing new is covered", () => {
    const wanted = new Map([
      ["root:aaaa", 1],
      ["root:bbbb", 1],
      ["c:rare.construction", 1],
    ]);
    const picked = selectHelperExamples(wanted, pool, 6).map((p) => p.agazan);
    assert.equal(picked.length, 2);
    assert.ok(picked.includes("zeeeel veeeel."));
    assert.ok(picked.some((a) => a.includes("aaaa") || a.includes("bbbb")));
  });

  it("shows a fragment only for a feature no sentence has", () => {
    const withFragments = [...pool, pair("hgggm baaaal", "until one"), pair("hhhhhm bkkkkl", "before rain")];
    const picked = selectHelperExamples(new Map([["root:aaaa", 1], ["root:kkkk", 1]]), withFragments, 6).map((p) => p.agazan);
    assert.ok(!picked.includes("hgggm baaaal"));
    assert.ok(picked.includes("hhhhhm bkkkkl"));
    assert.ok(picked.some((a) => a.includes("aaaa") && a.endsWith(".")));
  });

  it("matches an English lemma against its inflections", () => {
    const picked = selectHelperExamples(new Map([["en:walk", 1]]), pool, 6).map((p) => p.sentence);
    assert.ok(picked.includes("One walks."));
  });
});

describe("verifyDraft", () => {
  it("passes a doc sentence and reports a broken one", () => {
    const doc = context.index.find((p) => p.note == null && !p.agazan.includes("<"))!;
    const ok = verifyDraft(doc.sentence, doc.agazan, tables);
    assert.equal(ok.error, undefined);
    assert.equal(ok.gloss, doc.gloss);
    const broken = verifyDraft(doc.sentence, `${doc.agazan.replace(/\.$/, "")}q.`, tables);
    assert.ok(broken.error);
  });

  it("lines up each word's sense with the English word that suggested its root", () => {
    const rootOf = (english: string, word: string, tier: string) =>
      analyzeEnglish(data, english)
        .clauses.flatMap((c) => c.slots)
        .find((s) => s.text === word)!
        .suggestions.find((s): s is RootSuggestion => s.kind === "lexicon" && s.tier === tier)!.form;
    const cat = rootOf("The cat sleeps.", "cat", "root");
    const sleep = rootOf("The cat sleeps.", "sleeps", "root");
    const right = verifyDraft("The cat sleeps.", `z${cat}l v${sleep}l.`, tables, data);
    assert.deepEqual(right.words!.map((w) => [w.side, w.english, w.check]), [
      ["concrete", "cat", undefined],
      ["concrete", "sleeps", undefined],
    ]);
    const abstract = verifyDraft("The cat sleeps.", `z${cat}m v${sleep}l.`, tables, data);
    assert.equal(abstract.words![0]!.check, "other-side");
    const grateful = rootOf("I am grateful.", "grateful", "alias");
    const alias = verifyDraft("I am grateful.", `g${grateful}l.`, tables, data);
    assert.equal(alias.words![0]!.check, "alias");
  });
});
