import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { formatRow, parseClassTable, rowsFor } from "./class-row.ts";

const TABLE = `intro

## Classification table

Key types: text.

| Key type | Key | Class | Anchor | Note |
|----------|-----|-------|--------|------|
| unit | \`np\` | structure | \`clause.md#who-acts\` | A role phrase |
| joinSeries | \`ue\` | frame:polarity | \`joins.md#negation-u\` |  |
| joinSeries | \`u:kind\` | frame:binder | \`joins.md#kind\` | No K |
| overlay | \`clause_hinge:th\` | frame:hinge | \`causation.md#if\` | a hinge |

## Links
`;

describe("class-row", () => {
  const rows = parseClassTable(TABLE);

  it("reads each row with its line, class, anchor and note", () => {
    assert.equal(rows.length, 4);
    assert.deepEqual(rows[1], { line: 10, keyType: "joinSeries", key: "ue", cls: "frame:polarity", anchor: "joins.md#negation-u", note: "" });
    assert.equal(formatRow(rows[1]!, "i.md"), "i.md:10  joinSeries:ue  frame:polarity  joins.md#negation-u  (no note)");
    assert.equal(formatRow(rows[0]!, "i.md"), "i.md:9  unit:np  structure  clause.md#who-acts  A role phrase");
  });

  it("finds an exact key, else every row under a type or partial key", () => {
    assert.deepEqual(rowsFor(rows, "joinSeries:u:kind").map((r) => r.note), ["No K"]);
    assert.equal(rowsFor(rows, "joinSeries").length, 2);
    assert.equal(rowsFor(rows, "overlay:clause_hinge").length, 1);
    assert.deepEqual(rowsFor(rows, "edge:force"), []);
  });

  it("parses the real table", () => {
    const real = parseClassTable(readFileSync(join(REPO_ROOT, "docs", "meta", "interpreter.md"), "utf8"));
    assert.ok(real.length > 170, `parsed ${real.length} rows`);
    assert.ok(rowsFor(real, "joinSeries:ue").length === 1);
  });
});
