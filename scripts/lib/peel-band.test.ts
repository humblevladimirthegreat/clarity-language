import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  appendObjectToExportedArray,
  peelBand,
  rewriteAnchorRefs,
  rewriteMarkdownLinks,
  setBandFrontMatter,
} from "./peel-band.ts";

const PARENT = `# Word endings

Lead.

## Beginner {#beginner}

### Citation {#citation-forms}

Cite [names](#proper-names).

### Practice {#beginner-practice}

Drill.

## Intermediate {#intermediate}

### Proper names {#proper-names}

Names of [citation](#citation-forms).

### Practice {#intermediate-practice}

Drill.

## See also

### More
`;

describe("peelBand, last remaining sitting", () => {
  const result = peelBand({
    parentPage: "word-endings.md",
    parentMarkdown: PARENT,
    band: "intermediate",
    newPage: "proper-names.md",
    title: "Proper names and titled phrases",
  });

  it("copies the slice into a banded sitting and drops both band H2s", () => {
    assert.match(result.sitting, /^---\nband: intermediate\n---\n/);
    assert.match(result.sitting, /# Proper names and titled phrases \{#proper-names-and-titled-phrases\}/);
    assert.match(result.sitting, /### Proper names \{#proper-names\}/);
    assert.match(result.sitting, /### Practice \{#intermediate-practice\}/);
    assert.doesNotMatch(result.sitting, /## Intermediate/);
    assert.match(result.parent, /^---\nband: beginner\n---\n/);
    assert.doesNotMatch(result.parent, /## Beginner/);
    assert.doesNotMatch(result.parent, /## Intermediate/);
    assert.match(result.parent, /### Citation \{#citation-forms\}/);
    assert.match(result.parent, /## See also/);
  });

  it("rewrites same-page links that now cross files", () => {
    assert.match(result.parent, /Cite \[names\]\(proper-names.md#proper-names\)/);
    assert.match(result.sitting, /Names of \[citation\]\(word-endings.md#citation-forms\)/);
  });

  it("maps hashes and construction homes", () => {
    assert.deepEqual(result.hashRedirects, [
      { page: "word-endings.md", hash: "intermediate", to: "proper-names.md" },
      { page: "word-endings.md", hash: "beginner", to: "word-endings.md" },
    ]);
    assert.equal(result.linkMap.get("word-endings.md#proper-names"), "proper-names.md#proper-names");
    assert.equal(result.linkMap.get("word-endings.md#intermediate"), "proper-names.md");
    assert.equal(result.linkMap.get("word-endings.md#beginner"), "word-endings.md");
    assert.equal(result.homeMap.get("word-endings.md#intermediate"), "proper-names.md#proper-names");
    assert.equal(result.homeMap.get("word-endings.md#beginner"), "word-endings.md#citation-forms");
    assert.deepEqual(result.holding, {
      parent: "word-endings.md",
      page: "proper-names.md",
      band: "intermediate",
      title: "Proper names and titled phrases",
    });
  });
});

describe("peelBand, middle band on a three-band page", () => {
  const md = `# Clause

## Beginner {#beginner}

### Roles {#role-letters}

## Intermediate {#intermediate}

### Left-bound {#left-bound-adjectives}

## Advanced {#advanced}

### Emphasis {#emphasis}
`;
  const result = peelBand({
    parentPage: "clause.md",
    parentMarkdown: md,
    band: "intermediate",
    newPage: "left-bound.md",
    title: "Left-bound adjectives",
  });

  it("leaves the parent unsplit and only maps the peeled band", () => {
    assert.doesNotMatch(result.parent, /^---/);
    assert.match(result.parent, /## Beginner \{#beginner\}/);
    assert.match(result.parent, /## Advanced \{#advanced\}/);
    assert.doesNotMatch(result.parent, /## Intermediate/);
    assert.deepEqual(result.hashRedirects, [{ page: "clause.md", hash: "intermediate", to: "left-bound.md" }]);
    assert.equal(result.linkMap.get("clause.md#beginner"), undefined);
    assert.equal(result.homeMap.get("clause.md#intermediate"), "left-bound.md#left-bound-adjectives");
  });
});

describe("rewriteAnchorRefs", () => {
  it("keeps directory prefixes and drops a retired band hash", () => {
    const map = new Map([
      ["joins.md#intermediate", "rank-joins.md"],
      ["joins.md#clause-joins", "rank-joins.md#clause-joins"],
    ]);
    const { text } = rewriteAnchorRefs(
      "See [x](../grammar/joins.md#intermediate) and joins.md#clause-joins.",
      map,
    );
    assert.equal(text, "See [x](../grammar/rank-joins.md) and rank-joins.md#clause-joins.");
  });
});

describe("rewriteMarkdownLinks", () => {
  it("retargets extensionless and html hrefs", () => {
    const map = new Map([["joins.md#intermediate", "rank-joins.md"]]);
    assert.equal(
      rewriteMarkdownLinks("See [x](./joins#intermediate) and [y](joins.html#intermediate).", "other.md", map),
      "See [x](./rank-joins) and [y](rank-joins.html).",
    );
  });
});

describe("setBandFrontMatter", () => {
  it("inserts or replaces band", () => {
    assert.equal(setBandFrontMatter("# Title\n", "beginner"), "---\nband: beginner\n---\n\n# Title\n");
    assert.match(setBandFrontMatter("---\noutline: false\n---\n\n# T\n", "advanced"), /band: advanced/);
  });
});

describe("appendObjectToExportedArray", () => {
  it("inserts the first item and later items", () => {
    const empty = "export const holdingList: HoldingSitting[] = []\n";
    const one = appendObjectToExportedArray(empty, "holdingList", {
      parent: "joins.md",
      page: "rank-joins.md",
      band: "intermediate",
      title: "Rank joins",
    });
    assert.match(one, /parent: "joins.md"/);
    const two = appendObjectToExportedArray(one, "holdingList", {
      parent: "joins.md",
      page: "join-islands.md",
      band: "advanced",
      title: "Join islands",
    });
    assert.match(two, /join-islands.md/);
    assert.match(two, /Rank joins/);
  });
});
