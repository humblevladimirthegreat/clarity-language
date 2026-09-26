import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { constructionFamilies, drillCoverage, drillSkips, duplicateDrills } from "./drill-coverage.js";
import { learningOrder, pageSections, resolveAnchor, sectionAt, type Section } from "./learning-order.js";

const A = `# Page A

## Beginner

### Basics

### Translation practice {#beginner-translation-practice}

#### English → Agalan

## Intermediate

### More
`;

const B = `# Page B

## Beginner

### Other
`;

describe("drillSkips", () => {
  it("reads skip rows from both allowlist tables", () => {
    const md = `### Beginner path

| Path | File | Status | Introduces |
|------|------|--------|------------|
| — | \`intro.md\` | skip | — |
| 4 | \`a.md\` | **exists** | x |

### Later

| Path | File | Band | Status | Notes |
|------|------|------|--------|-------|
| 4 | \`a.md\` | Advanced | skip | — |
| 4 | \`a.md\` | Intermediate | **generate** | — |
`;
    assert.deepEqual([...drillSkips(md)].sort(), ["a.md|advanced", "intro.md|beginner"]);
  });
});

describe("drillCoverage", () => {
  const pages = new Map([
    ["a.md", pageSections("a.md", A)],
    ["b.md", pageSections("b.md", B)],
  ]);
  const order = learningOrder(["a.md", "b.md"], pages);
  const at = (page: string, text: string): Section =>
    sectionAt(pages.get(page)!.sections, (page === "a.md" ? A : B).indexOf(text));
  const homes = new Map<string, Section | undefined>([
    ["span.x", resolveAnchor(order, "a.md#basics")],
    ["span.y", resolveAnchor(order, "a.md#basics")],
    ["value.z", resolveAnchor(order, "a.md#basics")],
    ["token.t", resolveAnchor(order, "a.md#more")],
    ["span.m", resolveAnchor(order, "a.md#more")],
    ["span.o", resolveAnchor(order, "b.md#other")],
  ]);
  const families = constructionFamilies(homes);
  const uses = [
    { id: "span.y", section: at("a.md", "#### English") },
    { id: "value.z", section: at("a.md", "### Basics") },
  ];

  it("covers a family by any member, reports uncovered, flags missing sections", () => {
    const r = drillCoverage(order, families, uses, new Set());
    assert.equal(r.covered, 1);
    assert.deepEqual(r.uncovered.map((u) => u.family.ids), [["value.z"]]);
    assert.deepEqual(r.missing.sort(), ["a.md|intermediate", "b.md|beginner"]);
  });

  it("exempts skipped page bands and parser families", () => {
    const r = drillCoverage(order, families, uses, new Set(["a.md|intermediate", "b.md|beginner"]));
    assert.deepEqual(r.missing, []);
  });
});

describe("duplicateDrills", () => {
  it("flags a band with two translation practice sections", () => {
    const md = `# C

## Advanced

### Translation practice {#advanced-translation-practice}

### Other

### Translation practice {#other-translation-practice}
`;
    const order = learningOrder(["c.md"], new Map([["c.md", pageSections("c.md", md)]]));
    assert.deepEqual(duplicateDrills(order).map((d) => d.key), ["c.md|advanced"]);
  });
});
