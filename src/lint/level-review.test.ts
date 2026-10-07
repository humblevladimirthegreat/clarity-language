import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lintLevelReview } from "./level-review.js";
import { learningOrder, pageSections } from "./learning-order.js";

const stage = (name: string) => `# Page ${name}

## Beginner

### Basics

### Practice {#beginner-practice}

#### English → Agazan

## Intermediate

### More
`;

const item = (n: number, rule: string | null) => `**${n}.** *x*

::: details Show answer
\`zazawan vehahel.\`

z-Azawan | v-sit
${rule === null ? "" : `\n${rule}\n`}:::
`;

const review = (items: string) => `# Level reviews

## Beginner

### Practice {#beginner-practice}

#### English → Agazan

${items}
`;

function findings(md: string): string[] {
  const pages = new Map([
    ["a.md", pageSections("a.md", stage("A"))],
    ["b.md", pageSections("b.md", stage("B"))],
    ["review.md", pageSections("review.md", md)],
  ]);
  return lintLevelReview(learningOrder(["a.md", "b.md", "review.md"], pages), "review.md", md).map((f) => f.detail);
}

const counts = (d: string) => /item\(s\)/.test(d);

describe("lintLevelReview", () => {
  it("accepts a Rule link per item that covers every stage checkpoint of the band", () => {
    const md = review([item(1, "**Rule:** [Basics](a.md#basics)"), item(2, "**Rule:** [Basics](b.md#basics)")].join("\n"));
    assert.deepEqual(findings(md).filter((d) => !counts(d)), []);
  });

  it("flags missing, misplaced, and wrong Rule links, and uncovered pages", () => {
    const md = review(
      [
        item(1, null),
        item(2, "**Rule:** [More](a.md#more)"),
        item(3, "**Rule:** [Practice](a.md#beginner-practice)"),
        item(4, "**Rule:** [Gone](a.md#gone)"),
        item(5, "**Rule:** see a.md"),
        `**6.** *x*\n\n::: details Show answer\n\`zazawan vehahel.\`\n\n**Rule:** [Basics](a.md#basics)\n\nz-Azawan | v-sit\n:::\n`,
      ].join("\n"),
    );
    const out = findings(md).filter((d) => !counts(d));
    assert.ok(out.includes("English → Agazan 1: answer needs a **Rule:** link to the section it tests"));
    assert.ok(out.includes("English → Agazan 2: **Rule:** link a.md#more is not in a.md beginner"));
    assert.ok(out.includes("English → Agazan 3: **Rule:** link a.md#beginner-practice is a checkpoint; link the section that teaches the rule"));
    assert.ok(out.includes("English → Agazan 4: **Rule:** link a.md#gone names no section"));
    assert.ok(out.includes("English → Agazan 5: write the rule as **Rule:** [Section title](page.md#id)"));
    assert.ok(out.includes("English → Agazan 6: **Rule:** must be the last line of the answer"));
    assert.ok(out.some((d) => d.startsWith("no item has a **Rule:** link to b.md beginner")));
  });

  it("checks the review mix: one item per checkpoint, translation minimum, Pick one share", () => {
    const md = review([item(1, "**Rule:** [Basics](a.md#basics)"), item(2, "**Rule:** [Basics](b.md#basics)")].join("\n"));
    assert.deepEqual(findings(md).filter(counts), [
      "2 English → Agazan item(s); use at least 3",
      "0 Agazan → English item(s); use at least 3",
      "0 Pick one item(s); use at least 1 (a third of the review)",
    ]);
  });
});
