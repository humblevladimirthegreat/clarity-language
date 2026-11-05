import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { HashRedirect } from "../../docs/grammar/.vitepress/lib/hash-redirect.js";
import { applyHashMoves, writeHashRedirects } from "./hash-rows.ts";
import { applyMaps } from "./link-rewrite.ts";
import { moveHeadings } from "./move-heading.ts";

const FROM = `---
band: intermediate
---

# Rank joins {#rank-joins}

### Rank joins {#rank}

See [respectively](#respectively).

### Respectively {#respectively}

<a id="respectively-table"></a>

Back to [rank](#rank).

#### Nested {#resp-nested}

Detail.

### Fence nesting {#fence-nesting}

Fences.

### Practice {#intermediate-practice}

Drill.
`;

const INTO = `---
band: intermediate
---

# List structure {#list-structure}

### Shared after the join {#shared}

Shared. See [respectively](rank-joins.md#respectively).

### Practice {#intermediate-practice}

Drill.
`;

const base = { fromPage: "rank-joins.md", fromMarkdown: FROM, intoPage: "list-structure.md", intoMarkdown: INTO };

describe("moveHeadings", () => {
  const result = moveHeadings({ ...base, ids: ["respectively"], placement: { end: true } });

  it("cuts the H3 with its H4s and <a id>s, and lands it before Practice", () => {
    assert.doesNotMatch(result.from, /### Respectively/);
    assert.match(result.from, /### Fence nesting \{#fence-nesting\}/);
    assert.match(result.from, /### Practice \{#intermediate-practice\}/);
    const at = result.into.indexOf("### Respectively {#respectively}");
    assert.ok(at > result.into.indexOf("### Shared after the join"));
    assert.ok(at < result.into.indexOf("### Practice"));
    assert.match(result.into, /<a id="respectively-table"><\/a>/);
    assert.match(result.into, /#### Nested \{#resp-nested\}/);
    assert.deepEqual(result.movedIds, ["respectively", "resp-nested", "respectively-table"]);
  });

  it("rewrites same-page links on both sides", () => {
    assert.match(result.from, /See \[respectively\]\(list-structure\.md#respectively\)/);
    assert.match(result.into, /Back to \[rank\]\(rank-joins\.md#rank\)/);
    assert.match(result.into, /See \[respectively\]\(#respectively\)/);
  });

  it("maps every moved id for the repo-wide rewrite", () => {
    assert.equal(result.linkMap.get("rank-joins.md#respectively"), "list-structure.md#respectively");
    assert.equal(result.linkMap.get("rank-joins.md#resp-nested"), "list-structure.md#resp-nested");
    assert.equal(result.linkMap.get("rank-joins.md#fence-nesting"), undefined);
  });

  it("places clusters with --after and --before, in source order", () => {
    const after = moveHeadings({ ...base, ids: ["fence-nesting", "respectively"], placement: { after: "shared" } });
    const resp = after.into.indexOf("### Respectively");
    const fence = after.into.indexOf("### Fence nesting");
    assert.ok(after.into.indexOf("### Shared") < resp && resp < fence && fence < after.into.indexOf("### Practice"));
    const before = moveHeadings({ ...base, ids: ["fence-nesting"], placement: { before: "shared" } });
    assert.ok(before.into.indexOf("### Fence nesting") < before.into.indexOf("### Shared"));
  });

  it("refuses headings without {#id}, and prints the slug to add", () => {
    const bare = FROM.replace("### Fence nesting {#fence-nesting}", "### Fence nesting");
    assert.throws(
      () => moveHeadings({ ...base, fromMarkdown: bare, ids: ["fence-nesting"], placement: { end: true } }),
      /"Fence nesting" needs \{#fence-nesting\}/,
    );
  });

  it("refuses Practice, H4s, id clashes, and emptying the source", () => {
    const one = { ...base, placement: { end: true } as const };
    assert.throws(() => moveHeadings({ ...one, ids: ["intermediate-practice"] }), /Practice heading/);
    assert.throws(() => moveHeadings({ ...one, ids: ["resp-nested"] }), /is H4/);
    assert.throws(
      () => moveHeadings({ ...one, intoMarkdown: INTO.replace("{#shared}", "{#respectively}"), ids: ["respectively"] }),
      /already has #respectively/,
    );
    assert.throws(() => moveHeadings({ ...one, ids: ["rank", "respectively", "fence-nesting"] }), /no taught H3 left/);
    assert.throws(() => moveHeadings({ ...base, ids: ["rank"], placement: { after: "intermediate-practice" } }), /not a taught H3/);
  });
});

describe("applyHashMoves", () => {
  const rows: HashRedirect[] = [
    { page: "joins.md", hash: "intermediate", to: "rank-joins.md" },
    { page: "old.md", hash: "respectively", to: "rank-joins.md" },
    { page: "other.md", hash: "x", to: "rank-joins.md", toHash: "respectively" },
    { page: "list-structure.md", hash: "fence-nesting", to: "rank-joins.md", toHash: "fence-nesting" },
  ];

  it("adds a hash-keeping row and repoints rows that land on the moved id", () => {
    const { rows: out } = applyHashMoves(rows, [
      { from: "rank-joins.md", id: "respectively", into: "list-structure.md", toId: "respectively" },
    ]);
    assert.deepEqual(out, [
      { page: "joins.md", hash: "intermediate", to: "rank-joins.md" },
      { page: "old.md", hash: "respectively", to: "list-structure.md", toHash: "respectively" },
      { page: "other.md", hash: "x", to: "list-structure.md", toHash: "respectively" },
      { page: "list-structure.md", hash: "fence-nesting", to: "rank-joins.md", toHash: "fence-nesting" },
      { page: "rank-joins.md", hash: "respectively", to: "list-structure.md", toHash: "respectively" },
    ]);
  });

  it("drops a row whose old fragment is live again, and never duplicates a row", () => {
    const { rows: out } = applyHashMoves(rows, [
      { from: "rank-joins.md", id: "fence-nesting", into: "list-structure.md", toId: "fence-nesting" },
    ]);
    assert.equal(out.filter((r) => r.page === "list-structure.md").length, 0);
    const again = applyHashMoves(out, [
      { from: "rank-joins.md", id: "fence-nesting", into: "set-joins.md", toId: "fence-nesting" },
    ]).rows;
    assert.deepEqual(
      again.filter((r) => r.page === "rank-joins.md"),
      [{ page: "rank-joins.md", hash: "fence-nesting", to: "set-joins.md", toHash: "fence-nesting" }],
    );
  });

  it("records a renamed id on the same page", () => {
    const { rows: out } = applyHashMoves([], [
      { from: "sentence-linkers.md", id: "old-periods", into: "sentence-linkers.md", toId: "past-a-period" },
    ]);
    assert.deepEqual(out, [{ page: "sentence-linkers.md", hash: "old-periods", to: "sentence-linkers.md", toHash: "past-a-period" }]);
    assert.throws(() => applyHashMoves([], [{ from: "a.md", id: "x", into: "a.md", toId: "x" }]), /onto itself/);
  });
});

describe("writeHashRedirects", () => {
  it("rewrites the array body one row per line, keeping the rest of the file", () => {
    const source = `export type X = 1\n\nexport const hashRedirects: HashRedirect[] = [\n  { page: "a.md", hash: "b", to: "c.md" },\n]\n\nexport function f() {}\n`;
    const out = writeHashRedirects(source, [
      { page: "a.md", hash: "b", to: "c.md" },
      { page: "a.md", hash: "x", to: "d.md", toHash: "x" },
    ]);
    assert.equal(
      out,
      `export type X = 1\n\nexport const hashRedirects: HashRedirect[] = [\n  { page: "a.md", hash: "b", to: "c.md" },\n  { page: "a.md", hash: "x", to: "d.md", toHash: "x" },\n]\n\nexport function f() {}\n`,
    );
  });
});

describe("applyMaps (repo link rewrite)", () => {
  const map = new Map([["rank-joins.md#respectively", "list-structure.md#respectively"]]);

  it("rewrites relative, rooted and bare refs", () => {
    const md = "[a](rank-joins.md#respectively) [b](/rank-joins#respectively) [c](./rank-joins.html#respectively) `rank-joins.md#respectively`";
    const { text, changes } = applyMaps(md, "/repo/docs/grammar/beginner/x.md", map);
    assert.equal(
      text,
      "[a](list-structure.md#respectively) [b](/list-structure#respectively) [c](./list-structure.html#respectively) `list-structure.md#respectively`",
    );
    assert.equal(changes.length, 4);
    const csv = applyMaps('row,"rank-joins.md#respectively"', "/repo/data/lexicon-overlays.csv", map);
    assert.equal(csv.text, 'row,"list-structure.md#respectively"');
  });
});
