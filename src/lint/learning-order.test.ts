import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  anchorLinks,
  learningOrder,
  pageSections,
  resolveAnchor,
  sectionAt,
  sidebarPage,
  withinSection,
} from "./learning-order.js";

const A = `# Page A

Intro.

## Beginner

### Basics
<a id="basics-anchor"></a>

#### Detail

## Intermediate

### More {#more}

## Advanced

### Deep
`;

const B = `# Page B

## Beginner

### First

## Intermediate

### Second
`;

describe("learningOrder", () => {
  const pages = new Map([
    ["a.md", pageSections("a.md", A)],
    ["b.md", pageSections("b.md", B)],
  ]);
  const order = learningOrder(["a.md", "b.md"], pages);
  const pos = (anchor: string) => resolveAnchor(order, anchor)?.position;

  it("orders every Beginner band before any Intermediate band", () => {
    assert.deepEqual(
      order.ordered.map((s) => `${s.page}#${s.slug}`),
      [
        "a.md#beginner", "a.md#basics", "a.md#detail", "b.md#beginner", "b.md#first",
        "a.md#intermediate", "a.md#more", "b.md#intermediate", "b.md#second",
        "a.md#advanced", "a.md#deep",
      ],
    );
    assert.ok(pos("b.md#first")! < pos("a.md#more")!);
  });

  it("leaves the page intro outside every band", () => {
    assert.equal(sectionAt(pages.get("a.md")!.sections, A.indexOf("Intro")).position, undefined);
  });

  it("resolves <a id> and {#custom} anchors", () => {
    assert.equal(resolveAnchor(order, "a.md#basics-anchor")?.slug, "basics");
    assert.equal(resolveAnchor(order, "a.md#more")?.title, "More");
    assert.equal(resolveAnchor(order, "a.md#missing"), undefined);
  });

  it("treats a heading's subsections as inside it", () => {
    const basics = resolveAnchor(order, "a.md#basics")!;
    const beginner = resolveAnchor(order, "a.md#beginner")!;
    assert.ok(withinSection(basics, resolveAnchor(order, "a.md#detail")!));
    assert.ok(withinSection(beginner, basics));
    assert.ok(!withinSection(basics, resolveAnchor(order, "a.md#more")!));
  });
});

describe("sidebarPage", () => {
  it("maps sidebar links to page files", () => {
    assert.equal(sidebarPage("/"), "index.md");
    assert.equal(sidebarPage("/clause"), "clause.md");
  });
});

describe("anchorLinks", () => {
  it("finds anchored links outside code", () => {
    const md = "See [x](clause.md#role-letters), [y](#here), [z](./joins#a), `[no](a.md#b)`, [w](https://e.com/#q).";
    assert.deepEqual(
      anchorLinks("p.md", md).map((l) => `${l.page}#${l.anchor}`),
      ["clause.md#role-letters", "p.md#here", "joins.md#a"],
    );
  });
});
