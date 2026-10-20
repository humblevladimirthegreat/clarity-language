import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRACTICE } from "./practice-fixtures.js";
import { fixPromptRanges, practiceItems } from "./practice-items.js";

const details = (n: number) => Array.from({ length: n }, (_, i) => `**${i + 1}.** *x*\n\n::: details Show answer\n\`zuzozen vuhohol.\`\n:::\n`).join("\n");

describe("practiceItems", () => {
  it("types items by H4 and reads prompts and spoilers", () => {
    const { items, findings } = practiceItems(PRACTICE);
    assert.deepEqual(findings, []);
    assert.deepEqual(
      items.map((item) => `${item.type}${item.number}`),
      ["en-ag1", "en-ag2", "en-ag3", "ag-en1", "ag-en2", "ag-en3", "pick1", "fix1", "changes1"],
    );
    const [first] = items;
    assert.equal(first!.promptEnglish, "Ahelan sees Uzozen.");
    assert.deepEqual(first!.spoiler.map((line) => line.kind), ["agebon", "text", "also"]);
    assert.deepEqual(first!.alsoCorrect.map((span) => span.text), ["duzozen zahelan vawebol.", "yal zahelan duzozen vawebol."]);
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

#### Agebon → English

${details(3)}
#### English → Agebon

${details(2)}
#### Compare

#### Pick one

**2.** *x*
`;
    const details_ = practiceItems(md).findings.map((f) => f.detail);
    assert.ok(details_.some((d) => d === "checkpoint item outside a known H4"));
    assert.ok(details_.some((d) => d.startsWith('"English → Agebon" is out of template order')));
    assert.ok(details_.some((d) => d.startsWith('unknown checkpoint H4 "Compare"')));
    assert.ok(details_.some((d) => d.startsWith("item **2.** should be **1.**")));
    assert.ok(details_.some((d) => d === "checkpoint item has no ::: details spoiler"));
    assert.ok(details_.some((d) => d.startsWith("2 English → Agebon item(s)")));
    assert.ok(details_.some((d) => d.startsWith("1 decision item(s)")));
  });
});

describe("practiceItems, level review", () => {
  it("reads a **Rule:** line and skips the checkpoint counts", () => {
    const md = PRACTICE.replace(
      "**Also correct:** \`duzozen zahelan vawebol.\`, \`yal zahelan duzozen vawebol.\`",
      "**Also correct:** \`duzozen zahelan vawebol.\`\n\n**Rule:** [Role letters](clause.md#role-letters)",
    ).replace(/#### Pick one[\s\S]*$/, "");
    const { items, findings } = practiceItems(md, { review: true });
    assert.deepEqual(items[0]!.spoiler.map((line) => line.kind), ["agebon", "text", "also", "rule"]);
    assert.deepEqual(findings, []);
    assert.ok(practiceItems(md).findings.some((f) => f.detail.startsWith("0 decision item(s)")));
  });
});

describe("fixPromptRanges", () => {
  it("covers only Fix it prompt lines", () => {
    const ranges = fixPromptRanges(PRACTICE);
    assert.equal(ranges.length, 1);
    assert.match(PRACTICE.slice(ranges[0]!.start, ranges[0]!.end), /^\*\*1\.\*\* \*Olazun sees Uzozen\.\* <!-- lint: error -->/);
  });
});
