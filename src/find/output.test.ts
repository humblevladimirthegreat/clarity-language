import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countLine, FIND_SHOWN, formatCapped, spreadSample } from "./output.js";

type Hit = { file: string; line: number };
const hits = (file: string, n: number): Hit[] => Array.from({ length: n }, (_, i) => ({ file, line: i + 1 }));
const listing = (items: Hit[], all = false) =>
  formatCapped({
    items,
    render: (h) => [`${h.file}:${h.line}`],
    file: (h) => h.file,
    noun: ["example", "examples"],
    all,
  });

describe("formatCapped", () => {
  it("prints the count line and every hit when there are few", () => {
    assert.deepEqual(listing(hits("docs/a.md", 2)), ["2 examples in a.md", "docs/a.md:1", "docs/a.md:2"]);
    assert.deepEqual(listing(hits("docs/a.md", 1)).slice(0, 1), ["1 example in a.md"]);
    assert.deepEqual(listing([]), ["0 examples"]);
  });

  it("cuts a long listing at FIND_SHOWN with a footer naming --all and --count", () => {
    const lines = listing(hits("docs/a.md", 25));
    assert.equal(lines.length, 1 + FIND_SHOWN + 1);
    assert.equal(lines.at(-1), `… ${25 - FIND_SHOWN} more; --all lists every one, --count prints only the count`);
  });

  it("--all lists every hit with no footer", () => {
    const lines = listing(hits("docs/a.md", 25), true);
    assert.equal(lines.length, 26);
    assert.ok(!lines.some((l) => l.startsWith("…")));
  });

  it("renders several lines per item when asked", () => {
    const lines = formatCapped({
      items: hits("d/a.md", 12),
      render: (h) => [`${h.line}`, "  + pair"],
      file: (h) => h.file,
      noun: ["example", "examples"],
      all: false,
    });
    assert.equal(lines.length, 1 + 2 * FIND_SHOWN + 1);
  });
});

describe("countLine", () => {
  it("names the biggest files first, then how many more", () => {
    const items = [...hits("x/b.md", 2), ...hits("x/a.md", 3), ...hits("x/c.md", 1), ...hits("x/d.md", 1), ...hits("x/e.md", 1), ...hits("x/f.md", 1)];
    assert.equal(
      countLine(items, (h) => h.file, ["example", "examples"]),
      "9 examples in 6 files: a.md 3, b.md 2, c.md 1, d.md 1, e.md 1, … 1 more file",
    );
  });
});

describe("spreadSample", () => {
  it("takes each file's first hit before any file's second, in original order", () => {
    const items = [...hits("a", 20), ...hits("b", 2), ...hits("c", 1)];
    const sample = spreadSample(items, (h) => h.file);
    assert.equal(sample.length, FIND_SHOWN);
    assert.deepEqual(
      sample.filter((h) => h.file !== "a").map((h) => `${h.file}${h.line}`),
      ["b1", "b2", "c1"],
    );
    assert.deepEqual(sample.slice(0, 7).map((h) => h.line), [1, 2, 3, 4, 5, 6, 7]);
  });
});
