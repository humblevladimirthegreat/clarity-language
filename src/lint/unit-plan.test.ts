import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describePlan,
  membershipProblems,
  pageName,
  parseDeps,
  parseUnitTables,
  planUnits,
  suggestMoves,
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
