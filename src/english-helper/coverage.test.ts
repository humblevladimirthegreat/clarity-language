import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CLOSED } from "../closed-roots.js";
import { loadDefaultTables, parseWithTables } from "../parse/index.js";
import { loadPromptContext } from "../parse/llm-examples.js";
import { parseWord } from "../parse/word.js";
import { analyzeEnglish } from "./analyze.js";
import { coverWord, promptShows, treeWords, type TreeWord } from "./coverage.js";
import { buildHelperPrompt } from "./llm-prompt.js";
import { loadHelperData } from "./load.js";

const tables = loadDefaultTables();
const data = loadHelperData();
const context = loadPromptContext(tables);

const english = "A very angry Olazun finds money.";
const analysis = analyzeEnglish(data, english);
const prompt = buildHelperPrompt([{ english, analysis }], data, context);
const shows = promptShows(prompt, [analysis]);
const spelled = analysis.clauses.flatMap((c) => c.slots.flatMap((s) => s.suggestions)).flatMap((s) => (s.kind === "lexicon" && s.word ? [s.word] : []));
const ordinary = (raw: string): TreeWord => ({ ...parseWord(raw), reading: "ordinary" });

describe("prompt coverage", () => {
  it("finds the words the analysis spells", () => {
    assert.ok(spelled.length >= 4);
    const words = treeWords(parseWithTables(`${spelled.join(" ")}.`, tables));
    assert.deepEqual(
      words.map((w) => w.raw),
      spelled,
    );
    for (const word of words) assert.equal(coverWord(word, shows), "word", word.raw);
  });

  it("builds a shown root on the other ending, but not a closed row", () => {
    const concrete = spelled.find((w) => w.endsWith("l") && !w.startsWith("w"))!;
    const abstract = concrete.slice(0, -1) + "m";
    assert.ok(!shows.words.has(abstract));
    assert.equal(coverWord(ordinary(abstract), shows), "pattern");
    const speaker = `b${CLOSED.microphone}n`;
    assert.ok(!shows.words.has(speaker));
    assert.equal(coverWord(ordinary(speaker), shows), "missing");
  });
});
