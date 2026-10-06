import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRACTICE } from "./practice-fixtures.js";
import { fixPromptRanges, practiceItems } from "./practice-items.js";

const details = (n: number) => Array.from({ length: n }, (_, i) => `**${i + 1}.** *x*\n\n::: details Show answer\n\`zazawan vehahel.\`\n:::\n`).join("\n");

describe("practiceItems", () => {
  it("types items by H4 and reads prompts and spoilers", () => {
    const { items, findings } = practiceItems(PRACTICE);
    assert.deepEqual(findings, []);
    assert.deepEqual(
      items.map((item) => `${item.type}${item.number}`),
      ["en-ag1", "en-ag2", "en-ag3", "ag-en1", "ag-en2", "ag-en3", "pick1", "fix1", "changes1"],
    );
    const [first] = items;
    assert.equal(first!.promptEnglish, "Ahaben sees Azawan.");
    assert.deepEqual(first!.spoiler.map((line) => line.kind), ["agazan", "text", "also"]);
    assert.deepEqual(first!.alsoCorrect.map((span) => span.text), ["dazawan zahaben vahahal.", "yal zahaben dazawan vahahal."]);
    const pick = items.find((item) => item.type === "pick")!;
    assert.equal(pick.promptSpans.length, 2);
    const fix = items.find((item) => item.type === "fix")!;
    assert.equal(fix.promptSpans[0]!.marker, "lint: error");
    assert.equal(PRACTICE.slice(fix.promptSpans[0]!.index, fix.promptSpans[0]!.index + fix.promptSpans[0]!.text.length), fix.promptSpans[0]!.text);
  });

  it("skips legacy checkpoints", () => {
    assert.deepEqual(practiceItems(PRACTICE.replace("### Practice", "### Translation practice")).items, []);
  });

  it("flags unknown and out-of-order H4s, numbering, missing spoilers, and counts", () => {
    const md = `### Practice

**1.** *stray*

#### Agazan → English

${details(3)}
#### English → Agazan

${details(2)}
#### Compare

#### Pick one

**2.** *x*
`;
    const details_ = practiceItems(md).findings.map((f) => f.detail);
    assert.ok(details_.some((d) => d === "checkpoint item outside a known H4"));
    assert.ok(details_.some((d) => d.startsWith('"English → Agazan" is out of template order')));
    assert.ok(details_.some((d) => d.startsWith('unknown checkpoint H4 "Compare"')));
    assert.ok(details_.some((d) => d.startsWith("item **2.** should be **1.**")));
    assert.ok(details_.some((d) => d === "checkpoint item has no ::: details spoiler"));
    assert.ok(details_.some((d) => d.startsWith("2 English → Agazan item(s)")));
    assert.ok(details_.some((d) => d.startsWith("1 decision item(s)")));
  });
});

describe("fixPromptRanges", () => {
  it("covers only Fix it prompt lines", () => {
    const ranges = fixPromptRanges(PRACTICE);
    assert.equal(ranges.length, 1);
    assert.match(PRACTICE.slice(ranges[0]!.start, ranges[0]!.end), /^\*\*1\.\*\* \*Alahen sees Azawan\.\* <!-- lint: error -->/);
  });
});
