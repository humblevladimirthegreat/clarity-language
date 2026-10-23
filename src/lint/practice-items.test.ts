import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRACTICE } from "./practice-fixtures.js";
import { fixPromptRanges, itemLimits, practiceBandStats, practiceItems } from "./practice-items.js";

const details = (n: number) => Array.from({ length: n }, (_, i) => `**${i + 1}.** *x*\n\n::: details Show answer\n\`zazozon vehohel.\`\n:::\n`).join("\n");

describe("practiceItems", () => {
  it("types items by H4 and reads prompts and spoilers", () => {
    const { items, findings } = practiceItems(PRACTICE);
    assert.deepEqual(findings, []);
    assert.deepEqual(
      items.map((item) => `${item.type}${item.number}`),
      ["en-ag1", "en-ag2", "en-ag3", "ag-en1", "ag-en2", "ag-en3", "pick1", "fix1", "changes1"],
    );
    const [first] = items;
    assert.equal(first!.promptEnglish, "Ahelan sees Azozon.");
    assert.deepEqual(first!.spoiler.map((line) => line.kind), ["ageben", "text", "also"]);
    assert.deepEqual(first!.alsoCorrect.map((span) => span.text), ["dazozon zahelan vayebel.", "yal zahelan dazozon vayebel."]);
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

#### Ageben → English

${details(3)}
#### English → Ageben

${details(2)}
#### Compare

#### Pick one

**2.** *x*
`;
    const details_ = practiceItems(md).findings.map((f) => f.detail);
    assert.ok(details_.some((d) => d === "checkpoint item outside a known H4"));
    assert.ok(details_.some((d) => d.startsWith('"English → Ageben" is out of template order')));
    assert.ok(details_.some((d) => d.startsWith('unknown checkpoint H4 "Compare"')));
    assert.ok(details_.some((d) => d.startsWith("item **2.** should be **1.**")));
    assert.ok(details_.some((d) => d === "checkpoint item has no ::: details spoiler"));
    assert.ok(details_.some((d) => d.startsWith("2 English → Ageben item(s)")));
    assert.ok(details_.some((d) => d.startsWith("1 decision item(s)")));
  });
});

describe("practiceItems, level review", () => {
  it("reads a **Rule:** line and skips the checkpoint counts", () => {
    const md = PRACTICE.replace(
      "**Also correct:** \`dazozon zahelan vayebel.\`, \`yal zahelan dazozon vayebel.\`",
      "**Also correct:** \`dazozon zahelan vayebel.\`\n\n**Rule:** [Role letters](clause.md#role-letters)",
    ).replace(/#### Pick one[\s\S]*$/, "");
    const { items, findings } = practiceItems(md, { review: true });
    assert.deepEqual(items[0]!.spoiler.map((line) => line.kind), ["ageben", "text", "also", "rule"]);
    assert.deepEqual(findings, []);
    assert.ok(practiceItems(md).findings.some((f) => f.detail.startsWith("0 decision item(s)")));
  });
});

describe("itemLimits", () => {
  it("keeps small Beginner / Intermediate bands at 3–6 / 2–3", () => {
    assert.deepEqual(itemLimits("beginner", 0).translation, { min: 3, max: 6 });
    assert.deepEqual(itemLimits("intermediate", 5).translation, { min: 3, max: 6 });
    assert.deepEqual(itemLimits("intermediate", 8).decision, { min: 2, max: 3 });
  });

  it("raises the cap with S, then stops at 10 / 5", () => {
    assert.deepEqual(itemLimits("intermediate", 15).translation, { min: 3, max: 10 });
    assert.deepEqual(itemLimits("intermediate", 15).decision, { min: 2, max: 4 });
    assert.deepEqual(itemLimits("beginner", 17).translation, { min: 3, max: 10 });
    assert.deepEqual(itemLimits("beginner", 17).decision, { min: 2, max: 5 });
  });

  it("uses the Advanced formula", () => {
    assert.deepEqual(itemLimits("advanced", 2).translation, { min: 3, max: 4 });
    assert.deepEqual(itemLimits("advanced", 2).decision, { min: 2, max: 2 });
    assert.deepEqual(itemLimits("advanced", 12).translation, { min: 3, max: 7 });
    assert.deepEqual(itemLimits("advanced", 12).decision, { min: 2, max: 3 });
  });
});

describe("practiceBandStats", () => {
  it("counts ### headings above Practice in the current band", () => {
    const md = `## Beginner

### One

### Two

### Practice

## Intermediate

### Three

### Four

### Five

### Practice
`;
    const lines = md.split("\n");
    const beginner = lines.findIndex((line) => line.startsWith("### Practice"));
    const intermediate = lines.findIndex((line, i) => i > beginner && line.startsWith("### Practice"));
    assert.deepEqual(practiceBandStats(lines, beginner), { band: "beginner", S: 2 });
    assert.deepEqual(practiceBandStats(lines, intermediate), { band: "intermediate", S: 3 });
  });

  it("uses front matter band for a whole-file sitting", () => {
    const md = `---
band: intermediate
---

# Role pointers

### One

### Two

### Practice
`;
    const lines = md.split("\n");
    const practice = lines.findIndex((line) => line.startsWith("### Practice"));
    assert.deepEqual(practiceBandStats(lines, practice), { band: "intermediate", S: 2 });
  });
});

describe("practiceItems, scaled counts", () => {
  it("names S in the error and allows more than 6 items on a large band", () => {
    const taught = Array.from({ length: 10 }, (_, i) => `### Section ${i + 1}\n`).join("\n");
    const md = `## Intermediate

${taught}
### Practice

#### English → Ageben

${details(7)}
#### Ageben → English

${details(7)}
#### Pick one

${details(2)}
`;
    const details_ = practiceItems(md).findings.map((f) => f.detail);
    assert.deepEqual(details_, []);
    const over = practiceItems(md.replace(details(7), details(11))).findings.map((f) => f.detail);
    assert.ok(over.some((d) => d === "11 English → Ageben item(s); this band teaches 10 sections, use 3–7"));
  });

  it("fails when S is past 10, naming the page, the band, and S", () => {
    const band = (n: number) => {
      const taught = Array.from({ length: n }, (_, i) => `### Section ${i + 1}\n`).join("\n");
      return `## Intermediate

${taught}
### Practice

#### English → Ageben

${details(6)}
#### Ageben → English

${details(6)}
#### Pick one

${details(2)}
`;
    };
    const details_ = practiceItems(band(12), { page: "sakes.md" }).findings.map((f) => f.detail);
    assert.ok(details_.some((d) => d === "sakes.md Intermediate teaches 12 sections; a band past 10 splits into a sibling page"));
    const atTen = practiceItems(band(10)).findings.map((f) => f.detail);
    assert.equal(atTen.some((d) => d.includes("splits into a sibling page")), false);
  });
});

describe("fixPromptRanges", () => {
  it("covers only Fix it prompt lines", () => {
    const ranges = fixPromptRanges(PRACTICE);
    assert.equal(ranges.length, 1);
    assert.match(PRACTICE.slice(ranges[0]!.start, ranges[0]!.end), /^\*\*1\.\*\* \*Alazun sees Azozon\.\* <!-- lint: error -->/);
  });
});
