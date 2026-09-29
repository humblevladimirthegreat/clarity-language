import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ConstructionEntry } from "../parse/constructions.js";
import { constructionCoverageGaps, constructionHomes, learningOrderFindings } from "./construction-order.js";
import type { ConstructionUse } from "./drill-coverage.js";
import { learningOrder, pageSections, resolveAnchor } from "./learning-order.js";

const A = `# Page A

## Beginner

### Basics

See [later](b.md#second).

## Intermediate

### More
`;

const B = `# Page B

## Beginner

### First

## Intermediate

### Second
`;

const pageMarkdown = new Map([
  ["a.md", A],
  ["b.md", B],
]);
const order = learningOrder(
  ["a.md", "b.md"],
  new Map([...pageMarkdown].map(([page, md]) => [page, pageSections(page, md)])),
);
const at = (anchor: string) => resolveAnchor(order, anchor)!;
const use = (id: string, anchor: string): ConstructionUse => ({ id, section: at(anchor) });
const registry = (entries: Record<string, string>): Map<string, ConstructionEntry> =>
  new Map(Object.entries(entries).map(([id, anchor]) => [id, { anchor, summary: `${id} summary` }]));

describe("constructionHomes", () => {
  it("resolves each anchor, leaving unknown anchors undefined", () => {
    const homes = constructionHomes(order, registry({ "value.x": "a.md#basics", "value.y": "a.md#missing" }));
    assert.equal(homes.get("value.x")?.slug, "basics");
    assert.ok(homes.has("value.y"));
    assert.equal(homes.get("value.y"), undefined);
  });
});

describe("constructionCoverageGaps", () => {
  const reg = registry({ "value.x": "a.md#basics", "value.y": "b.md#first", "value.z": "b.md#second" });

  it("passes a construction used anywhere on its anchor page", () => {
    const gaps = constructionCoverageGaps(reg, [use("value.x", "a.md#more"), use("value.y", "b.md#first"), use("value.z", "b.md#first")]);
    assert.deepEqual(gaps, []);
  });

  it("reports where an unexercised construction is used instead", () => {
    const gaps = constructionCoverageGaps(reg, [use("value.x", "a.md#basics"), use("value.y", "a.md#more"), use("value.y", "a.md#basics")]);
    assert.deepEqual(
      gaps.map((g) => [g.id, g.usedOn]),
      [
        ["value.y", ["a.md"]],
        ["value.z", []],
      ],
    );
    assert.equal(gaps[0]!.summary, "value.y summary");
  });
});

describe("learningOrderFindings", () => {
  it("passes uses at or after home, and counts a forward link as report-only", () => {
    const found = learningOrderFindings(order, registry({ "value.x": "a.md#basics" }), [use("value.x", "a.md#basics"), use("value.x", "a.md#more")], pageMarkdown);
    assert.equal(found.failures, 0);
    assert.deepEqual(found.links, ["a.md:7  a.md#basics  →  b.md#second"]);
  });

  it("fails a use before its home section", () => {
    const found = learningOrderFindings(order, registry({ "value.x": "b.md#second" }), [use("value.x", "a.md#basics"), use("value.x", "b.md#second")], pageMarkdown);
    assert.deepEqual([...found.forward.keys()], ["value.x"]);
    assert.deepEqual([...found.forward.get("value.x")!.sections], ["a.md#basics"]);
    assert.equal(found.failures, 1);
  });

  it("fails a family never traced in its home section", () => {
    const found = learningOrderFindings(order, registry({ "value.x": "a.md#basics", "value.y": "a.md#basics" }), [use("value.y", "a.md#more")], pageMarkdown);
    assert.deepEqual(
      found.notAtHome.map((f) => [f.ids, f.usedIn]),
      [[["value.x", "value.y"], ["a.md#more"]]],
    );
    assert.equal(found.failures, 1);
  });

  it("fails unresolved and unbanded home anchors", () => {
    // The page title sits above every band.
    const found = learningOrderFindings(order, registry({ "value.x": "a.md#missing", "value.y": "a.md#page-a" }), [], pageMarkdown);
    assert.deepEqual(found.unresolved, ["value.x  →  a.md#missing"]);
    assert.deepEqual(found.unbandedHomes, ["value.y  →  a.md#page-a"]);
    // value.y's family is also never taught at its (resolved) home.
    assert.equal(found.notAtHome.length, 1);
    assert.equal(found.failures, 3);
  });
});
