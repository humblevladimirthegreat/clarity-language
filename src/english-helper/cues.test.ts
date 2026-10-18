import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { collectEnglishEntries } from "../find/english.js";
import { loadDefaultTables } from "../parse/index.js";
import { buildCueIndex, matchCues } from "./cues.js";
import { cueWords } from "./tag.js";

const page = `# Saying it

## One English word, many jobs {#many-jobs}

### *by*

| English itch | Agazan job | Teach |
|--------------|------------|-------|
| tool (*writes by a hammer*) | hook **\`ael\`** + \`/b/\` | [Hooks](hooks.md#extra-noun) |
| place (*by the station*) | hook **\`om\`** + \`/b/\` | [Hooks](hooks.md#extra-noun) |

## Everyday words {#everyday-words}

### Place {#place}

| English itch | Agazan job | Teach |
|--------------|------------|-------|
| *next to* / *beside* (*sits beside me*) | hook **\`om\`** + \`/b/\` | [Here](hooks.md#deixis) |
| *X and Y, respectively* | **\`wazem\`** | [Respectively](joins.md#respectively) |

### Practice {#practice}

| English | Agazan | Cue |
|---------|--------|-----|
| *dog* | \`odogal\` | 🐕 |
`;

const entries = collectEnglishEntries(page, "docs/grammar/english.md", loadDefaultTables());
const index = buildCueIndex(entries, cueWords);

describe("buildCueIndex", () => {
  it("lists a heading cue's jobs in table order, linked to Teach", () => {
    const by = index.get("by")!;
    assert.deepEqual(by.map((j) => [j.form, j.link]), [["ael / /b/", "hooks.md#extra-noun"], ["om / /b/", "hooks.md#extra-noun"]]);
    assert.equal(by[0]!.itch, "tool (writes by a hammer)");
  });

  it("reads cues from an English cell's italics before its parenthesis", () => {
    assert.equal(index.get("next to")![0]!.link, "hooks.md#deixis");
    assert.ok(index.has("beside"));
    assert.ok(!index.has("sits beside me"));
  });

  it("skips placeholder cues and practice word banks", () => {
    assert.ok(![...index.keys()].some((k) => k.includes("respectively")));
    assert.ok(!index.has("dog"));
  });
});

describe("matchCues", () => {
  it("takes the longest run first and lets a one-word cue match a lemma", () => {
    const normals = ["sits", "next", "to", "it", "by", "cars"];
    const lemmas = ["sit", "next", "to", "it", "by", "car"];
    assert.deepEqual(matchCues(index, normals, lemmas).map((m) => [m.start, m.end, m.key]), [[1, 3, "next to"], [4, 5, "by"]]);
  });
});
