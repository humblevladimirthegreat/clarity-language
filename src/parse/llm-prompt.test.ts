import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { glossLabels as printableLabels } from "../lint/terminology-docs.js";
import { loadDefaultTables } from "./index.js";
import {
  buildExampleIndex,
  constructionReaders,
  docExamples,
  examplePair,
  terminologyLabelGlosses,
} from "./llm-examples.js";
import {
  buildPrompt,
  EMITTED_ROLES,
  EMITTED_SUFFIXES,
  GLOSS_READER,
  glossLabels,
  selectExamples,
  type ExamplePair,
  type PromptContext,
} from "./llm-prompt.js";

const tables = loadDefaultTables();
const grammarDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "grammar");
const terminology = terminologyLabelGlosses(readFileSync(join(grammarDir, "terminology.md"), "utf8"));
const index = buildExampleIndex(grammarDir, tables);

describe("translation prompt core", () => {
  it("explains every prefix the morph line prints", () => {
    for (const prefix of ["y", "z", "d", "b", "v", "g", "gl", "w", "h", "th", "x", ""]) {
      assert.ok(GLOSS_READER.prefixes[prefix], `no core line for prefix "${prefix}"`);
    }
    const seen = new Set<string>();
    for (const pair of index) {
      const flat = pair.gloss.replace(/"(?:[^"]|"")*"/g, '""');
      for (const m of flat.matchAll(/(?:^|[\s[|!?%&;])([a-z]{1,2})-(?=[A-Za-z←_0-9"[])/g)) seen.add(m[1]!);
    }
    assert.deepEqual([...seen].filter((prefix) => !GLOSS_READER.prefixes[prefix]).sort(), []);
  });

  it("explains every role and form suffix the emitter appends", () => {
    assert.deepEqual(EMITTED_ROLES.filter((role) => !GLOSS_READER.roles[role]), []);
    assert.deepEqual(EMITTED_SUFFIXES.filter((suffix) => !GLOSS_READER.suffixes[suffix]), []);
  });

  it("explains every variant tail on a closed overlay label", () => {
    const missing = new Set<string>();
    for (const row of tables.overlays.values()) {
      for (const tail of row.gloss.match(/\.[a-z][a-z-]*/g) ?? []) {
        if (!GLOSS_READER.suffixes[tail] && !GLOSS_READER.tails[tail]) missing.add(`${tail} (${row.gloss})`);
      }
    }
    assert.deepEqual([...missing].sort(), []);
  });

  it("has a legend line for every capital label a doc gloss uses", () => {
    const labels = new Set([...printableLabels(tables.overlays.values()), ...index.flatMap((pair) => pair.labels)]);
    const known = (label: string) => terminology.has(label) || !!GLOSS_READER.labels[label];
    // A joined run (`CLUES-TOPIC`) is covered by its pieces.
    const missing = [...labels].filter((label) => !known(label) && !(label.includes("-") && label.split("-").every(known)));
    assert.deepEqual(missing.filter((label) => !["CITE", "ASIDE", "SCOPE", "NAME", "OPAQUE"].includes(label)).sort(), []);
  });

  it("writes reader notes in gloss notation, not maintainer slash notation", () => {
    const readers = constructionReaders(tables);
    for (const id of ["word.xFamily.holder", "number.calendar", "join.e", "sentence.zCoordPart.bar"]) {
      assert.ok(readers.has(id), `${id} has a reader note`);
    }
    for (const [id, text] of readers) assert.doesNotMatch(text, /\/[a-zɡ]{1,2}\//, id);
  });
});

describe("doc examples", () => {
  it("joins a dialogue block's Agazan lines and skips spoken lines", () => {
    const md = [
      "> `zazawan vedehol.`",
      "> `zaxedehor vezebal.`",
      ">",
      "> 🔊 `zazawan vedehol.`",
      ">",
      '> "Azawan teaches. The one teaching sleeps."',
      "",
      "> `zodogal vowogal.`",
      ">",
      '> "A dog walks."',
      '> "Dogs walk."',
    ].join("\n");
    assert.deepEqual(docExamples(md), [
      { agazan: "zazawan vedehol. zaxedehor vezebal.", free: '"Azawan teaches. The one teaching sleeps."', line: 1 },
    ]);
  });

  it("keeps parentheses inside the quotes only for an aside span", () => {
    const plain = examplePair({ agazan: "zazawan vowogal.", free: '"Azawan walks (quietly)."', line: 1 }, "x.md:1", tables);
    assert.equal(plain, null);
    const aside = examplePair({ agazan: "zazawan vowogal th(hagawal).", free: '"Azawan walks (quietly)."', line: 1 }, "x.md:1", tables);
    assert.ok(aside?.gloss.includes("ASIDE["));
  });

  it("indexes doc examples with their constructions and labels", () => {
    assert.ok(index.length > 500, `index has ${index.length} examples`);
    const pattern = index.find((pair) => pair.labels.includes("PATTERN"));
    assert.ok(pattern?.constructions.some((id) => id.startsWith("overlay.")));
    assert.ok(index.some((pair) => pair.note != null));
  });
});

function pair(gloss: string, constructions: string[], note: string | null = null): ExamplePair {
  return { gloss, sentence: gloss, note, constructions, labels: glossLabels(gloss), source: "x.md:1" };
}

describe("selectExamples", () => {
  const common = ["sentence.unit.zCoord", "sentence.unit.vpCoord"];
  const pool = [
    pair("z-dog | v-walk", common),
    pair("z-cat | v-walk", common),
    pair("z-Azawan | th-CLUES-Alahen | v-walk", [...common, "word.xFamily.holder"], "the clue is Alahen's"),
    pair("[z-A | z-B | z-rank/more | g-big]", ["join.e", "sentence.unit.zCoord"]),
    pair("z-A | th-PATTERN | v-walk", [...common, "overlay.obam.th"]),
  ];

  it("prefers rare shared features and covers new ones first", () => {
    const picked = selectExamples({ constructions: [...common, "word.xFamily.holder", "join.e"], labels: ["CLUES"] }, pool, { count: 2 });
    assert.deepEqual(picked.map((p) => p.gloss).sort(), ["[z-A | z-B | z-rank/more | g-big]", "z-Azawan | th-CLUES-Alahen | v-walk"]);
  });

  it("never picks the input's own gloss", () => {
    const picked = selectExamples({ constructions: common, labels: [] }, pool, { count: 5, exclude: ["z-dog  |  v-walk"] });
    assert.ok(!picked.some((p) => p.gloss === "z-dog | v-walk"));
  });

  it("shows at least one example with a note and one without", () => {
    const picked = selectExamples({ constructions: common, labels: [] }, pool, { count: 2 });
    assert.ok(picked.some((p) => p.note != null));
    assert.ok(picked.some((p) => p.note == null));
  });

  it("picks none for count 0", () => {
    assert.deepEqual(selectExamples({ constructions: common, labels: [] }, pool, { count: 0 }), []);
  });
});

describe("buildPrompt", () => {
  const context: PromptContext = {
    index: [pair("z-dog | v-walk", ["sentence.unit.zCoord"]), pair("z-A | th-CLUES-B | v-walk", ["word.xFamily.holder"], "the clue is B's")],
    labelGlosses: new Map([["CLUES", "Evidential: reasoned from clues about this case"]]),
    readers: new Map([["word.xFamily.holder", "HOLDER NOTE"]]),
  };

  it("has the core, the legend for this input, examples, task, and the gloss last", () => {
    const prompt = buildPrompt(["z-Azawan | th-CLUES-Alahen | v-walk"], ["word.xFamily.holder"], context);
    assert.match(prompt, /## How to read the gloss/);
    assert.match(prompt, /- `CLUES`: Evidential/);
    assert.match(prompt, /- HOLDER NOTE/);
    assert.match(prompt, /ENGLISH: "z-A \| th-CLUES-B \| v-walk" \(the clue is B's\)/);
    assert.match(prompt, /add one short plain-English note/);
    assert.ok(prompt.trimEnd().endsWith("## Gloss\n\nz-Azawan | th-CLUES-Alahen | v-walk"));
  });

  it("numbers several inputs as one passage", () => {
    const prompt = buildPrompt(["z-Azawan | v-walk", "z-←Azawan | v-sleep"], [], context);
    assert.match(prompt, /## Gloss lines\n\n1 z-Azawan \| v-walk\n2 z-←Azawan \| v-sleep\n$/);
    assert.match(prompt, /`1 ENGLISH:/);
  });

  it("asks for no note and shows none with loose", () => {
    const prompt = buildPrompt(["z-Azawan | th-CLUES-Alahen | v-walk"], ["word.xFamily.holder"], context, { loose: true });
    assert.doesNotMatch(prompt, /the clue is B's/);
    assert.match(prompt, /Give the sentence only, with no note/);
  });

  it("explains a variant tail only when a gloss uses it", () => {
    assert.doesNotMatch(buildPrompt(["z-Azawan | v-walk"], [], context, { examples: 0 }), /`\.strong`/);
    assert.match(buildPrompt(["z-Azawan | th-CLUES.strong | v-walk"], [], context, { examples: 0 }), /`\.strong` after a word: strong evidence/);
  });
});
