import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildFooter, jobFooter, parseTestFailures, testFailureLines } from "./build-output.ts";
import { jobKeys, splitJobs } from "./verify.ts";

const LOG = "tmp/build-last.log";

const LINT = `docs/grammar/intermediate/try.md: 12 checked, 0 redundant-omitted / 12 with loose English; 14 morph gloss(es) compared to parser
docs/grammar/intermediate/try.md:76  practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)
docs/grammar/review-intermediate.md:9  level-review  (no item has a **Rule:** link to try.md intermediate)
warning: docs/grammar/a.md:3  word-order  \`x\` moved

Learning order: 0 construction(s) used before their home section (0 section use(s)); 0 forward link(s).

Families not practiced in their band's drill:
  number.code  →  number-markers.md#intermediate-practice  (taught at number-markers.md#letter-codes)

13 translation word-bank issue(s).

1 level-review issue(s). One item per stage checkpoint (docs/meta/translation-exercises.md#level-reviews).
`;

const ROOT = "/repo";
const TEST_OUT = `▶ demo
  ✖ fails deep (1.778791ms)
  ✔ passes (0.065175ms)
✖ demo (2.547233ms)
ℹ tests 3
ℹ fail 2

✖ failing tests:

test at scripts/lib/demo.test.ts:1:96
✖ fails deep (1.778791ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected

    {
  +   a: 1,
  -   a: 2,
    }

      at TestContext.<anonymous> (/repo/scripts/lib/demo.test.ts:4:35)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1402:25) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
  }

test at scripts/lib/demo.test.ts:1:187
✖ top-level fail (0.216058ms)
  AssertionError [ERR_ASSERTION]: one is not two

  1 !== 2

      at TestContext.<anonymous> (/repo/scripts/lib/demo.test.ts:7:37)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:387:3) {
    generatedMessage: false,
  }
`;

describe("jobFooter for a lint job", () => {
  const footer = jobFooter("lint ageben", LINT, LOG);

  it("keeps every issue line with its file:line", () => {
    assert.ok(footer.includes("docs/grammar/intermediate/try.md:76  practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)"));
    assert.ok(footer.some((l) => l.startsWith("docs/grammar/review-intermediate.md:9  level-review")));
    assert.ok(footer.includes("Families not practiced in their band's drill:"));
    assert.ok(footer.includes("  number.code  →  number-markers.md#intermediate-practice  (taught at number-markers.md#letter-codes)"));
  });

  it("leaves out count, OK, and warning lines", () => {
    assert.ok(!footer.some((l) => /checked, |^Learning order:|^warning:/.test(l)));
  });

  it("ends with the summary lines, which name the fix", () => {
    assert.deepEqual(footer.slice(-2), [
      "13 translation word-bank issue(s).",
      "1 level-review issue(s). One item per stage checkpoint (docs/meta/translation-exercises.md#level-reviews).",
    ]);
  });

  it("caps issue lines and points at the log for the rest, keeping the summaries", () => {
    const capped = jobFooter("lint ageben", LINT, LOG, 2);
    assert.equal(capped[2], `… 2 more in ${LOG}`);
    assert.equal(capped.at(-1), "1 level-review issue(s). One item per stage checkpoint (docs/meta/translation-exercises.md#level-reviews).");
  });

  it("falls back to the last lines when nothing classifies", () => {
    assert.deepEqual(jobFooter("eslint", "OK: nothing\n", LOG), ["OK: nothing"]);
  });
});

describe("test failures", () => {
  const failures = parseTestFailures(TEST_OUT, ROOT);

  it("reads each failing test once, from the failing-tests list", () => {
    assert.deepEqual(
      failures.map((f) => [f.name, f.location, f.file]),
      [
        ["fails deep", "scripts/lib/demo.test.ts:4", "scripts/lib/demo.test.ts"],
        ["top-level fail", "scripts/lib/demo.test.ts:7", "scripts/lib/demo.test.ts"],
      ],
    );
  });

  it("keeps the assertion and diff, without stack frames or blank lines", () => {
    assert.deepEqual(failures[0]!.message, [
      "AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:",
      "+ actual - expected",
      "  {",
      "+   a: 1,",
      "-   a: 2,",
      "  }",
    ]);
    assert.deepEqual(failures[1]!.message, ["AssertionError [ERR_ASSERTION]: one is not two", "1 !== 2"]);
  });

  it("prints the rerun command for each file", () => {
    const lines = testFailureLines(TEST_OUT, ROOT);
    assert.equal(lines[0], "✖ fails deep");
    assert.equal(lines[1], "  scripts/lib/demo.test.ts:4");
    assert.equal(lines.at(-1), "  rerun: npm test -- scripts/lib/demo.test.ts");
    assert.ok(!lines.some((l) => /\bat (Test|TestContext)\b/.test(l)));
  });
});

describe("buildFooter", () => {
  const failed = [
    { label: "lint ageben", out: LINT },
    { label: "test", out: TEST_OUT },
  ];
  const footer = buildFooter(failed, LOG);

  it("holds every issue of every failed job and ends with the failed list", () => {
    assert.match(footer[0]!, /tmp\/build-last\.log/);
    assert.ok(footer.includes("✗ lint ageben"));
    assert.ok(footer.includes("✗ test"));
    assert.ok(footer.includes("  docs/grammar/intermediate/try.md:76  practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)"));
    assert.ok(footer.includes("  ✖ top-level fail"));
    assert.equal(footer.at(-1), "failed: lint ageben, test");
  });

  it("leaves verify keys unchanged: they still come from the full log", () => {
    const logText = `${LINT}✗ lint ageben (1.0s)\n${TEST_OUT}✗ test (2.0s)\n`;
    const keys = splitJobs(logText).flatMap(jobKeys);
    assert.ok(keys.includes("lint ageben | docs/grammar/intermediate/try.md | practice-item  (1 English → Ageben item(s); this band teaches 1 sections, use 3–6)"));
    assert.ok(keys.includes("test | fails deep"));
    assert.ok(keys.includes("test | demo"));
  });
});
