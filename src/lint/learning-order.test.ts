import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { duplicateIds } from "./grammar-anchors.js";
import {
  anchorLinks,
  learningOrder,
  pageBand,
  pageSections,
  parseFrontMatter,
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

## See also

### Links
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

  it("ignores See also sections and keeps them out of every band", () => {
    const links = resolveAnchor(order, "a.md#links")!;
    assert.equal(links.ignored, true);
    assert.equal(links.position, undefined);
    assert.equal(resolveAnchor(order, "a.md#deep")!.ignored, undefined);
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

const BANDED = `---
band: intermediate
---

# Topic {#discourse-topic}

Lead.

### Topic {#topic}

Body.

## See also

### Links
`;

describe("pageBand", () => {
  it("reads front matter band and ignores other keys", () => {
    assert.equal(pageBand(BANDED), "intermediate");
    assert.deepEqual(parseFrontMatter(BANDED), { band: "intermediate" });
    assert.equal(pageBand(A), undefined);
    assert.equal(pageBand("---\npageClass: cheat-sheet\n---\n\n# Sheet\n"), undefined);
  });
});

describe("pageSections, front matter band", () => {
  const { sections, anchors } = pageSections("topic.md", BANDED);

  it("marks every section on the page as that band except See also", () => {
    assert.equal(sectionAt(sections, BANDED.indexOf("Lead")).band, "intermediate");
    assert.equal(anchors.get("discourse-topic")?.band, "intermediate");
    assert.equal(anchors.get("topic")?.band, "intermediate");
    assert.equal(anchors.get("links")?.band, undefined);
    assert.equal(anchors.get("links")?.ignored, true);
    assert.equal(anchors.get("see-also")?.ignored, true);
  });

  it("does not let a leftover band H2 switch the sitting", () => {
    const md = `---
band: beginner
---

# Parent

## Intermediate

### Still beginner
`;
    const { anchors } = pageSections("parent.md", md);
    assert.equal(anchors.get("intermediate")?.band, "beginner");
    assert.equal(anchors.get("still-beginner")?.band, "beginner");
  });
});

describe("learningOrder, mixed H2 and band pages", () => {
  it("walks Beginner H2s then a front-matter Intermediate sitting", () => {
    const sitting = `---
band: intermediate
---

# Role pointers {#role-pointers}

### Tags {#tags}
`;
    const pages = new Map([
      ["a.md", pageSections("a.md", A)],
      ["tags.md", pageSections("tags.md", sitting)],
    ]);
    const order = learningOrder(["a.md", "tags.md"], pages);
    assert.deepEqual(
      order.ordered.map((s) => `${s.page}#${s.slug}`),
      [
        "a.md#beginner", "a.md#basics", "a.md#detail",
        "a.md#intermediate", "a.md#more",
        "tags.md#", "tags.md#role-pointers", "tags.md#tags",
        "a.md#advanced", "a.md#deep",
      ],
    );
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

describe("duplicateIds", () => {
  it("bans repeated heading slugs and <a id> that repeat a heading id", () => {
    assert.deepEqual(duplicateIds("## Practice\n\n## Practice\n"), ["practice"]);
    assert.deepEqual(duplicateIds('## Beginner\n<a id="beginner"></a>\n'), ["beginner"]);
    assert.deepEqual(duplicateIds("## Practice {#beginner-practice}\n\n## Practice {#intermediate-practice}\n"), []);
  });
});
