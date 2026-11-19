import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { rewriteMarkdown } from "./markdown.js";
import { rewriteSourceLiterals } from "./source.js";
import { unreadableOldRoot } from "./unreadable.js";

const map = new Map([["aheha", "awaha"]]);

describe("unreadableOldRoot", () => {
  it("names the old root in a form the word grammar rejects", () => {
    assert.equal(unreadableOldRoot("gorxahehal", map), "aheha");
  });

  it("leaves words the retie can rewrite, bare stems and English", () => {
    assert.equal(unreadableOldRoot("aheha", map), undefined);
    assert.equal(unreadableOldRoot("bahehal", map), undefined);
    assert.equal(unreadableOldRoot("ebaheha", map), undefined);
    assert.equal(unreadableOldRoot("theahehas", map), undefined);
  });
});

describe("retie review for forms that do not parse", () => {
  it("lists a code span that spells an old root and rewrites nothing", () => {
    const page = "A hook prefix takes no `r` before its seam (`gorxahehal`).\n";
    const result = rewriteMarkdown(page, map, loadDefaultTables());
    assert.equal(result.text, page);
    assert.deepEqual(
      result.reviews.map((review) => [review.text, review.reason]),
      [["gorxahehal", "spells old root aheha (now awaha) in a form that does not parse"]],
    );
  });

  it("lists a string literal that spells an old root in a form that does not parse", () => {
    const ctx = {
      map,
      tables: loadDefaultTables(),
      follow: { names: new Map(), words: new Map() },
      english: new Set<string>(),
      currentRoots: new Set(["awaha"]),
    };
    const source = 'const rejected = "gorxahehal";\n';
    const { text, reviews } = rewriteSourceLiterals(source, "x.ts", ctx);
    assert.equal(text, source);
    assert.equal(reviews.length, 1);
    assert.match(reviews[0]!.reason, /spells old root aheha \(now awaha\) in a form that does not parse/);
  });
});

describe("solver encoding atoms", () => {
  it("rewrites a token that is exactly an old root, not one inside a longer token", () => {
    const page = "A kind is `holds(isa(X, aheha))`; `isa(X, ahehax)` stays.\n";
    const result = rewriteMarkdown(page, map, loadDefaultTables());
    assert.equal(result.text, "A kind is `holds(isa(X, awaha))`; `isa(X, ahehax)` stays.\n");
    assert.deepEqual(result.changes.map((change) => [change.from, change.to]), [["aheha", "awaha"]]);
  });
});
