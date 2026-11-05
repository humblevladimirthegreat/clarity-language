import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { compare, jobKeys, onGenerateRow, splitJobs } from "./verify.ts";

const BUILD = `✓ tsc (1.2s)
docs/grammar/intermediate/try.md: 12 checked, 0 redundant-omitted / 12 with loose English; 14 morph gloss(es) compared to parser
docs/grammar/intermediate/try.md:76  practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)
docs/grammar/review-intermediate.md:9  level-review  (no item has a **Rule:** link to try.md intermediate; give each intermediate page at least one item)
docs/meta/drill-generation.md:360  checkpoint-inventory  (\`try.md\` is **generate**: write its ### Practice checkpoint (then mark it **exists**), or mark it **skip** with a reason)

3 construction(s) not exercised by their anchor page. Add a teach example on that page:
  sentence.npCoordPart.itemHook  →  joins.md#right-close  (used on list-structure.md)

Page bands with taught families but no translation practice:
  set-joins.md  intermediate  (expected ### Practice {#intermediate-practice})

13 translation word-bank issue(s).
✗ lint ageben (26.4s)
▶ peel
  ✖ cuts the cluster (1.2ms)
  ✔ keeps ids (0.3ms)
✖ failing tests:
✖ cuts the cluster (1.2ms)
✗ shard 2/4: 10/11 passed (0.2s)
✗ test (29.7s)
src/a.ts(12,5): error TS2345: bad
✗ tsc vitepress (2.5s)

build FAILED in 42.8s
failed: lint ageben, test
`;

describe("splitJobs and jobKeys", () => {
  const jobs = splitJobs(BUILD);

  it("splits on job status lines, not on test shard lines", () => {
    assert.deepEqual(
      jobs.map((j) => [j.label, j.ok]),
      [
        ["tsc", true],
        ["lint ageben", false],
        ["test", false],
        ["tsc vitepress", false],
      ],
    );
  });

  it("keys lint lines without line numbers, progress lines, or header counts", () => {
    const keys = jobKeys(jobs[1]!);
    assert.ok(keys.includes("lint ageben | docs/grammar/intermediate/try.md | practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)"));
    assert.ok(keys.includes("lint ageben | N construction(s) not exercised by their anchor page"));
    assert.ok(
      keys.includes(
        "lint ageben | N construction(s) not exercised by their anchor page | sentence.npCoordPart.itemHook  →  joins.md#right-close  (used on list-structure.md)",
      ),
    );
    assert.ok(keys.includes("lint ageben | N translation word-bank issue(s)"));
    assert.ok(!keys.some((k) => /checked, /.test(k)));
    assert.ok(!keys.some((k) => /:76|:9\b|:360/.test(k)));
  });

  it("keys failing tests by name, once", () => {
    assert.deepEqual(jobKeys(jobs[2]!), ["test | cuts the cluster"]);
  });

  it("strips tsc positions", () => {
    assert.deepEqual(jobKeys(jobs[3]!), ["tsc vitepress | src/a.ts | error TS2345: bad"]);
  });

  it("gives a failed job with no recognizable line one fallback key", () => {
    assert.deepEqual(jobKeys({ label: "lint game", ok: false, lines: ["", "boom at step 3"] }), ["lint game | boom at step N"]);
  });
});

describe("onGenerateRow", () => {
  const generate = new Set(["try.md", "set-joins.md"]);
  const keys = jobKeys(splitJobs(BUILD)[1]!);
  const on = keys.filter((k) => onGenerateRow(k, generate));

  it("counts checkpoint errors whose subject page is a generate row", () => {
    assert.ok(on.some((k) => k.includes("try.md | practice-item")));
    assert.ok(on.some((k) => k.includes("checkpoint-inventory")));
    assert.ok(on.some((k) => k.includes("set-joins.md  intermediate")));
  });

  it("leaves level reviews, construction coverage, and summaries alone", () => {
    assert.ok(!on.some((k) => k.includes("level-review")));
    assert.ok(!on.some((k) => k.includes("itemHook")));
    assert.ok(!on.some((k) => k.endsWith("word-bank issue(s)")));
  });
});

describe("compare", () => {
  it("reports new keys, resolved keys from jobs that ran, and unchecked ones", () => {
    const result = compare(
      ["lint ageben | a", "lint ageben | new"],
      ["lint ageben | a", "lint ageben | gone", "test | skipped"],
      new Set(["lint ageben"]),
      undefined,
    );
    assert.deepEqual(result.fresh, ["lint ageben | new"]);
    assert.deepEqual(result.resolved, ["lint ageben | gone"]);
    assert.equal(result.unchecked, 1);
  });

  it("with generate pages, never lists a generate-row key as new", () => {
    const key = "lint ageben | docs/grammar/set-joins.md | practice-item  (no Practice)";
    const result = compare([key], [], new Set(["lint ageben"]), new Set(["set-joins.md"]));
    assert.deepEqual(result.fresh, []);
    assert.equal(result.generate, 1);
  });
});
