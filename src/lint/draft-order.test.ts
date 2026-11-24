import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { ConstructionEntry } from "../parse/constructions.js";
import { formatLater, laterConstructions, orderPoint } from "./draft-order.js";
import { learningOrder, pageSections } from "./learning-order.js";

const A = `---
band: beginner
---
# Page A

### Basics

### More
`;

const B = `---
band: beginner
---
# Page B

### First

<a id="mid"></a>

### Second
`;

const order = learningOrder(
  ["a.md", "b.md"],
  new Map([
    ["a.md", pageSections("a.md", A)],
    ["b.md", pageSections("b.md", B)],
  ]),
);
const registry = new Map<string, ConstructionEntry>([
  ["basic", { anchor: "a.md#basics", summary: "" }],
  ["more", { anchor: "a.md#more", summary: "" }],
  ["second", { anchor: "b.md#second", summary: "" }],
]);
const later = (spec: string, ids: string[]) =>
  laterConstructions(order, registry, orderPoint(order, spec), ids).map((l) => formatLater(l, orderPoint(order, spec)));

describe("--at draft order", () => {
  it("passes a draft whose constructions are all taught by the point", () => {
    assert.deepEqual(later("a.md#more", ["basic", "more", "basic"]), []);
  });

  it("reports a construction taught later, in the lint's wording", () => {
    assert.deepEqual(later("a#basics", ["basic", "second"]), [
      "learning-order  second  →  b.md#second  (taught after a.md#basics: rewrite with forms taught by here)",
    ]);
  });

  it("compares by section with #id, and passes anything homed on the page without one", () => {
    assert.deepEqual(later("a.md#basics", ["more"]).length, 1);
    assert.deepEqual(later("a.md", ["more"]), []);
    assert.deepEqual(later("b#mid", ["second"]).length, 1);
    assert.deepEqual(later("docs/grammar/b.md", ["second"]), []);
  });

  it("rejects a page off the reading order and an id the page lacks", () => {
    assert.throws(() => orderPoint(order, "say-amounts"), /say-amounts\.md is not on the reading order.*\*\*Needs:\*\* line/);
    assert.throws(() => orderPoint(order, "cheat-sheets/a.md"), /not on the reading order/);
    assert.throws(() => orderPoint(order, "a#nope"), /a\.md has no heading or <a id> "nope"/);
  });
});
