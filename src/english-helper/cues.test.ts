import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { collectEnglishEntries } from "../find/english.js";
import { loadDefaultTables } from "../parse/index.js";
import { buildCueIndex, matchCues } from "./cues.js";
import { cueWords } from "./tag.js";

const page = `# Saying it

## One English word, many jobs {#many-jobs}

### *by*

| English itch | Egabon job | Teach |
|--------------|------------|-------|
| tool (*writes by a hammer*) | hook **\`ael\`** + \`/b/\` | [Hooks](hooks.md#extra-noun) |
| place (*by the station*) | hook **\`om\`** + \`/b/\` | [Hooks](hooks.md#extra-noun) |

## Everyday words {#everyday-words}

### Place {#place}

| English itch | Egabon job | Teach |
|--------------|------------|-------|
| *next to* / *beside* (*sits beside me*) | hook **\`om\`** + \`/b/\` | [Here](hooks.md#deixis) |
| *X and Y, respectively* | **\`wazem\`** | [Respectively](joins.md#respectively) |

### Practice {#practice}

| English | Egabon | Cue |
|---------|--------|-----|
| *dog* | \`udozol\` | 🐕 |
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

describe("buildCueIndex with section titles", () => {
  const hooks = `# Hooks

### Including (\`am\` / \`al\`)
<a id="including"></a>

### Except (\`ul\`)
<a id="except"></a>

| Egabon | Use | English | Cue |
|--------|-----|---------|-----|
| **a** | add a member | *including*: A, including B | **a** ≈ add |
| **u** | subtract | *except*: A except B | **u** ≈ undo |
`;
  const sections = new Map([
    ["hooks.md#including-am--al", { title: "Including (am / al)" }],
    ["hooks.md#including", { title: "Including (am / al)" }],
    ["hooks.md#except", { title: "Except (ul)" }],
  ]);
  const named = buildCueIndex(collectEnglishEntries(hooks, "docs/grammar/hooks.md", loadDefaultTables()), cueWords, sections);

  it("links a recap row to the same-page section named for its cue, with that section's forms", () => {
    assert.deepEqual([named.get("including")![0]!.link, named.get("including")![0]!.form], ["hooks.md#including", "am / al"]);
    assert.deepEqual([named.get("except")![0]!.link, named.get("except")![0]!.form], ["hooks.md#except", "ul"]);
  });
});

describe("matchCues", () => {
  it("takes the longest run first and lets a one-word cue match a lemma", () => {
    const normals = ["sits", "next", "to", "it", "by", "cars"];
    const lemmas = ["sit", "next", "to", "it", "by", "car"];
    assert.deepEqual(matchCues(index, normals, lemmas).map((m) => [m.start, m.end, m.key]), [[1, 3, "next to"], [4, 5, "by"]]);
  });
});
