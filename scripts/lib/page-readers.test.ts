import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countPageLines } from "../../src/lint/page-lines.js";
import {
  countText,
  currentBlock,
  invertRegistries,
  placeBlock,
  READ_BY_HEADER,
  refreshPage,
  renderBlock,
  stripBlock,
  type Registry,
  type RegistryRef,
} from "./page-readers.ts";

const REGISTRIES: Registry[] = [
  { name: "constructions", kind: "section", singular: "construction home", plural: "construction homes" },
  { name: "interpreter", kind: "section", singular: "interpreter row", plural: "interpreter rows" },
  { name: "cues", kind: "page", singular: "cue (t.csv)", plural: "cues (t.csv)" },
];

const ref = (registry: string, page: string, id = ""): RegistryRef => ({ registry, page, id, where: "test" });

const REFS: RegistryRef[] = [
  ref("interpreter", "clause.md", "b"),
  ref("constructions", "clause.md", "b"),
  ref("constructions", "clause.md", "b"),
  ref("constructions", "clause.md", "a"),
  ref("cues", "claritish/x.md"),
  ref("cues", "claritish/x.md"),
];

const STAGE = "---\nband: beginner\n---\n\n# Clause\n\n## A {#a}\n\nText.\n\n## B {#b}\n";
const PLAIN = "# Index\n\nText.\n";

describe("invertRegistries", () => {
  it("counts section rows per id and page rows per page", () => {
    const counts = invertRegistries(REGISTRIES, REFS);
    assert.deepEqual([...counts.get("clause.md")!.sections.get("b")!], [
      ["interpreter", 1],
      ["constructions", 2],
    ]);
    assert.equal(counts.get("claritish/x.md")!.named.get("cues"), 2);
  });

  it("rejects a row of an unlisted registry", () => {
    assert.throws(() => invertRegistries(REGISTRIES, [ref("nope", "clause.md", "a")]), /unknown registry/);
  });
});

describe("renderBlock", () => {
  const counts = invertRegistries(REGISTRIES, REFS);

  it("writes sections in page order, registries in their fixed order, singular for one", () => {
    const block = renderBlock({ pageKey: "clause.md", shape: [], registries: REGISTRIES, counts: counts.get("clause.md"), idOrder: ["clause", "a", "b"] });
    assert.equal(
      block,
      [
        READ_BY_HEADER,
        "Sections named by data:",
        "- #a: 1 construction home",
        "- #b: 2 construction homes, 1 interpreter row",
        "Inbound links: npm run page-refs -- clause.md",
        "-->",
      ].join("\n"),
    );
  });

  it("writes shape lines and a Named by data line for a lesson", () => {
    const block = renderBlock({ pageKey: "claritish/x.md", shape: ["H1: a title (a.ts)"], registries: REGISTRIES, counts: counts.get("claritish/x.md"), idOrder: [] });
    assert.equal(
      block,
      [READ_BY_HEADER, "Page shape read by code:", "- H1: a title (a.ts)", "Named by data: 2 cues (t.csv).", "Inbound links: npm run page-refs -- claritish/x.md", "-->"].join("\n"),
    );
  });

  it("gives a page nothing names a header and the inbound line only", () => {
    const block = renderBlock({ pageKey: "index.md", shape: [], registries: REGISTRIES, counts: undefined, idOrder: [] });
    assert.equal(block, `${READ_BY_HEADER}\nInbound links: npm run page-refs -- index.md\n-->`);
  });

  it("leaves zero counts out", () => {
    assert.equal(countText(REGISTRIES, new Map([["interpreter", 3]])), "3 interpreter rows");
  });
});

describe("placement", () => {
  const block = `${READ_BY_HEADER}\nInbound links: npm run page-refs -- clause.md\n-->`;

  it("puts the block after the frontmatter, before the H1, and strips it back exactly", () => {
    const placed = placeBlock(STAGE, block);
    assert.equal(placed, `---\nband: beginner\n---\n\n${block}\n\n# Clause\n\n## A {#a}\n\nText.\n\n## B {#b}\n`);
    assert.equal(currentBlock(placed), block);
    assert.equal(stripBlock(placed), STAGE);
  });

  it("puts the block at the top of a page with no frontmatter", () => {
    const placed = placeBlock(PLAIN, block);
    assert.equal(placed, `${block}\n\n${PLAIN}`);
    assert.equal(stripBlock(placed), PLAIN);
  });

  it("replaces a block already in place", () => {
    const old = `${READ_BY_HEADER}\nold\n-->`;
    assert.equal(placeBlock(placeBlock(STAGE, old), block), placeBlock(STAGE, block));
  });
});

describe("refreshPage", () => {
  const block = `${READ_BY_HEADER}\nInbound links: npm run page-refs -- clause.md\n-->`;

  it("passes a page whose block is fresh", () => {
    const page = placeBlock(STAGE, block);
    assert.deepEqual(refreshPage(page, block), { next: page });
  });

  it("reports a missing block and offers the page with it", () => {
    assert.deepEqual(refreshPage(STAGE, block), { next: placeBlock(STAGE, block), problem: "missing" });
  });

  it("reports a stale block and offers the fresh one", () => {
    const page = placeBlock(STAGE, `${READ_BY_HEADER}\nold\n-->`);
    assert.deepEqual(refreshPage(page, block), { next: placeBlock(STAGE, block), problem: "stale" });
  });

  it("reports a block outside its place", () => {
    const page = STAGE.replace("Text.", `${block}\n\nText.`);
    assert.equal(refreshPage(page, block).problem, "misplaced");
  });
});

describe("page-lines skips the block", () => {
  it("counts the same lines with and without the block", () => {
    const block = `${READ_BY_HEADER}\nSections named by data:\n- #a: 1 construction home\nInbound links: npm run page-refs -- clause.md\n-->`;
    const bare = countPageLines(STAGE);
    const withBlock = countPageLines(placeBlock(STAGE, block));
    assert.equal(withBlock.lines, bare.lines);
    assert.equal(withBlock.teach, bare.teach);
  });
});
