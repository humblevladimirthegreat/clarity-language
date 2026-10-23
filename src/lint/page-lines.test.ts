import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countPageLines, fileLines } from "./page-lines.js";

describe("fileLines", () => {
  it("matches wc -l for a trailing newline", () => {
    assert.deepEqual(fileLines("a\nb\n"), ["a", "b"]);
    assert.equal(fileLines("a\nb\n").length, 2);
  });

  it("keeps a last line that has no newline", () => {
    assert.deepEqual(fileLines("a\nb"), ["a", "b"]);
  });

  it("counts an empty file as zero lines", () => {
    assert.deepEqual(fileLines(""), []);
  });
});

describe("countPageLines", () => {
  it("splits teach, Practice, and See also, and counts taught H3s", () => {
    const md = `---
band: beginner
---

# Title

### One

text

### Two

more

### Practice {#beginner-practice}

drill

## See also

[x](/x)
`;
    const count = countPageLines(md);
    assert.equal(count.band, "beginner");
    assert.equal(count.S, 2);
    assert.equal(count.lines, fileLines(md).length);
    assert.equal(count.practice, 4);
    assert.equal(count.seeAlso, 3);
    assert.equal(count.teach, count.lines - count.practice - count.seeAlso);
    assert.deepEqual(
      count.headings.map((h) => `${h.id}:${h.lines}`),
      ["one:4", "two:4"],
    );
  });

  it("does not count a fenced ### or Practice as taught", () => {
    const md = `---
band: intermediate
---

# Title

### Real

\`\`\`
### Fake
\`\`\`

### Practice {#intermediate-practice}

x
`;
    const count = countPageLines(md);
    assert.equal(count.S, 1);
    assert.deepEqual(
      count.headings.map((h) => h.id),
      ["real"],
    );
  });
});
