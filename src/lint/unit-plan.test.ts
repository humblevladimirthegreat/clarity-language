import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  better,
  breakLines,
  describePlan,
  membershipProblems,
  pageName,
  parseDeps,
  parseUnitTables,
  planReport,
  planUnits,
  suggestMoves,
  tableOrderPlan,
  withReviewWords,
  type DepRow,
  type Unit,
} from "./unit-plan.js";

const dep = (from: string, to: string, uses: number, links = 0): DepRow => ({
  from: `${from}.md`,
  to: `${to}.md`,
  uses,
  links,
  constructions: "",
  linkLines: "",
});
/** A dependency of `from` on `to` by Review words alone. */
const review = (from: string, to: string, ...words: string[]): DepRow => ({ ...dep(from, to, 0), reviewWords: words });
const unit = (name: string, ...pages: string[]): Unit => ({ name, pages: pages.map((p) => `${p}.md`) });
const current = ["a", "b", "c", "d", "e", "f"].map((p) => `${p}.md`);

describe("pageName", () => {
  it("normalizes links, paths, and bare names", () => {
    assert.equal(pageName("/clause"), "clause.md");
    assert.equal(pageName("beginner/clause.md"), "clause.md");
    assert.equal(pageName(" clause "), "clause.md");
  });
});

describe("parseDeps", () => {
  it("reads lint:ageben --deps rows and skips the header", () => {
    const rows = parseDeps("from\tto\tuses\tlinks\tconstructions\tlink_lines\nb.md\ta.md\t3\t1\tx×3\tb.md:4\n");
    assert.deepEqual(rows, [{ from: "b.md", to: "a.md", uses: 3, links: 1, constructions: "x×3", linkLines: "b.md:4" }]);
  });
});

describe("parseUnitTables", () => {
  it("reads Unit and Sittings columns under band headings only", () => {
    const md = `### Beginner

| # | Unit | Sittings | Size |
|---|------|----------|------|
| 1 | First | a, b | 10k |
| 2 | Second | c | 5k |

## Design

| Unit | Sittings |
|------|----------|
| Ignored | z |

### Advanced

| Unit | Sittings |
|------|----------|
| Last | f |
`;
    const tables = parseUnitTables(md);
    assert.deepEqual([...tables.keys()], ["beginner", "advanced"]);
    assert.deepEqual(tables.get("beginner"), [unit("First", "a", "b"), unit("Second", "c")]);
    assert.deepEqual(tables.get("advanced"), [unit("Last", "f")]);
  });
});

describe("membershipProblems", () => {
  it("reports missing, unknown, and doubled pages", () => {
    const problems = membershipProblems([unit("U", "a", "x"), unit("V", "a")], ["a.md", "b.md"]);
    assert.deepEqual(problems, [
      "x.md (in U) is not a sitting of this band",
      "a.md is in both U and V",
      "b.md is in no unit",
    ]);
  });
});

describe("planUnits", () => {
  it("keeps the table order when nothing breaks", () => {
    const plan = planUnits([unit("U", "a", "b"), unit("V", "c")], [dep("c", "a", 2)], current);
    assert.deepEqual(plan.order, [0, 1]);
    assert.deepEqual(plan.pages, ["a.md", "b.md", "c.md"]);
    assert.equal(plan.breaks.length, 0);
  });

  it("reorders units to satisfy dependencies, and sorts pages inside a unit by current order", () => {
    const plan = planUnits([unit("U", "d", "c"), unit("V", "a", "b")], [dep("c", "a", 5)], current);
    assert.deepEqual(plan.order, [1, 0]);
    assert.deepEqual(plan.pages, ["a.md", "b.md", "c.md", "d.md"]);
  });

  it("breaks links before uses when a cycle forces a break", () => {
    // U needs V by one use; V needs U by five links. Putting V first breaks only the links.
    const plan = planUnits([unit("U", "a"), unit("V", "b")], [dep("a", "b", 1), dep("b", "a", 0, 5)], current);
    assert.deepEqual(plan.order, [1, 0]);
    assert.equal(plan.uses, 0);
    assert.equal(plan.links, 5);
    assert.deepEqual(plan.breaks.map((b) => [b.from, b.to]), [["b.md", "a.md"]]);
  });

  it("finds the best order over several units", () => {
    // Chain e → d → c → b → a across five units in reverse table order.
    const units = ["e", "d", "c", "b", "a"].map((p) => unit(p.toUpperCase(), p));
    const deps = [dep("e", "d", 1), dep("d", "c", 1), dep("c", "b", 1), dep("b", "a", 1)];
    const plan = planUnits(units, deps, current);
    assert.deepEqual(plan.order, [4, 3, 2, 1, 0]);
    assert.equal(plan.uses, 0);
  });

  it("counts breaks inside a unit too", () => {
    const plan = describePlan([unit("U", "a", "b")], [0], [dep("a", "b", 2)], current);
    assert.equal(plan.uses, 2);
  });
});

describe("suggestMoves", () => {
  it("suggests moving a sitting that ties two units into a cycle", () => {
    // U = {a, c}, V = {b}: c needs b and b needs a, so no unit order works; moving c to V does.
    const units = [unit("U", "a", "c"), unit("V", "b")];
    const deps = [dep("c", "b", 3), dep("b", "a", 3)];
    const plan = planUnits(units, deps, current);
    assert.equal(plan.uses, 3);
    const moves = suggestMoves(units, deps, current, plan);
    assert.deepEqual(moves.map((m) => [m.page, m.fromUnit, m.toUnit, m.plan.uses]), [["c.md", 0, 1, 0]]);
  });

  it("respects the allowed filter", () => {
    const units = [unit("U", "a", "c"), unit("V", "b")];
    const deps = [dep("c", "b", 3), dep("b", "a", 3)];
    const plan = planUnits(units, deps, current);
    assert.deepEqual(suggestMoves(units, deps, current, plan, (moved) => moved[1]!.pages.length < 2), []);
  });
});

describe("withReviewWords", () => {
  const core = new Map([
    ["ball", "a.md#practice"],
    ["tree", "intermediate/b.md#practice"],
    ["home", "c.md#practice"],
  ]);

  it("adds one edge per Review root, from the checkpoint's page to the page of its core cell", () => {
    const rows = withReviewWords([], [{ page: "c.md", words: [{ root: "ball", english: "ball" }, { root: "tree" }] }], core);
    assert.deepEqual(rows, [review("c", "a", "ball (ball)"), review("c", "b", "tree")]);
  });

  it("joins the row of the same page pair and leaves the input rows alone", () => {
    const deps = [dep("c", "a", 2, 1)];
    const rows = withReviewWords(deps, [{ page: "c.md", words: [{ root: "ball", english: "ball" }] }], core);
    assert.deepEqual(rows, [{ ...dep("c", "a", 2, 1), reviewWords: ["ball (ball)"] }]);
    assert.equal(deps[0]!.reviewWords, undefined);
  });

  it("skips a root with no core cell, a root introduced on the same page, and a repeat", () => {
    const banks = [
      { page: "c.md", words: [{ root: "moon" }, { root: "home" }, { root: "ball" }] },
      { page: "c.md", words: [{ root: "ball" }] },
    ];
    assert.deepEqual(withReviewWords([], banks, core), [review("c", "a", "ball")]);
  });

  it("breaks when the introducing checkpoint comes later", () => {
    const units = [unit("U", "c"), unit("V", "a")];
    const deps = withReviewWords([], [{ page: "c.md", words: [{ root: "ball", english: "ball" }] }], core);
    const table = tableOrderPlan(units, deps, current);
    assert.equal(table.reviewWords, 1);
    assert.deepEqual(breakLines(table), ["c → a: 0 uses, 1 Review word, 0 links  Review ball (ball)"]);
    const best = planUnits(units, deps, current);
    assert.deepEqual(best.order, [1, 0]);
    assert.equal(best.reviewWords, 0);
  });
});

describe("three-way ranking", () => {
  it("breaks any number of Review words before one use", () => {
    const plan = planUnits([unit("U", "a"), unit("V", "b")], [dep("a", "b", 1), review("b", "a", "w1", "w2", "w3")], current);
    assert.deepEqual(plan.order, [1, 0]);
    assert.deepEqual([plan.uses, plan.reviewWords, plan.links], [0, 3, 0]);
  });

  it("breaks any number of links before one Review word", () => {
    const plan = planUnits([unit("U", "a"), unit("V", "b")], [review("a", "b", "w1"), dep("b", "a", 0, 7)], current);
    assert.deepEqual(plan.order, [1, 0]);
    assert.deepEqual([plan.uses, plan.reviewWords, plan.links], [0, 0, 7]);
  });

  it("ranks plans by uses, then Review words, then links", () => {
    const counts = (uses: number, reviewWords: number, links: number) => ({ uses, reviewWords, links });
    assert.ok(better(counts(0, 9, 9), counts(1, 0, 0)));
    assert.ok(better(counts(1, 0, 9), counts(1, 1, 0)));
    assert.ok(better(counts(1, 1, 0), counts(1, 1, 1)));
    assert.ok(!better(counts(1, 1, 1), counts(1, 1, 1)));
  });

  it("suggests a move that saves only a Review word", () => {
    // U = {a, c}, V = {b}: c reviews a word b introduces, and b reviews one a introduces.
    const units = [unit("U", "a", "c"), unit("V", "b")];
    const deps = [review("c", "b", "w1"), review("b", "a", "w2")];
    const plan = planUnits(units, deps, current);
    assert.equal(plan.reviewWords, 1);
    const moves = suggestMoves(units, deps, current, plan);
    assert.deepEqual(moves.map((m) => [m.page, m.toUnit, m.plan.reviewWords]), [["c.md", 1, 0]]);
  });
});

describe("planReport", () => {
  it("prints only the best order when the table already keeps it", () => {
    const units = [unit("U", "a"), unit("V", "b")];
    const deps = [dep("b", "a", 1)];
    const lines = planReport(units, planUnits(units, deps, current), tableOrderPlan(units, deps, current));
    assert.deepEqual(lines, ["Best order breaks 0 uses, 0 Review words, and 0 links (the table order):", "  1. U: a", "  2. V: b"]);
  });

  it("prints the table order's counts and breaks as well when another order is best", () => {
    const units = [unit("U", "b"), unit("V", "a")];
    const deps = [review("b", "a", "ball (ball)"), dep("a", "b", 0, 2)];
    const lines = planReport(units, planUnits(units, deps, current), tableOrderPlan(units, deps, current));
    assert.deepEqual(lines, [
      "Table order breaks 0 uses, 1 Review word, and 0 links:",
      "  1. U: b",
      "  2. V: a",
      "  Still broken (page → page it needs, later in this order):",
      "    b → a: 0 uses, 1 Review word, 0 links  Review ball (ball)",
      "Best order breaks 0 uses, 0 Review words, and 2 links (differs from the table):",
      "  1. V: a",
      "  2. U: b",
      "  Still broken (page → page it needs, later in this order):",
      "    a → b: 0 uses, 0 Review words, 2 links",
    ]);
  });
});
