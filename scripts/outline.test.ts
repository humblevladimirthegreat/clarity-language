import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { outlineMarkdown } from "./outline.ts";

/** Outline lines without the token estimates. */
const lines = (opts: { depth: number; summaries?: boolean }) => outlineMarkdown("p.md", md, opts).slice(1).map((l) => l.replace(/  ~\d+t  /, "  "));

const md = ["# Page", "", "## Forms {#forms}", "<!-- Agent summary: `thomam` = could be. -->", "", "Text.", "## Practice", ""].join("\n");

describe("outlineMarkdown", () => {
  it("prints headings only without --summaries", () => {
    assert.deepEqual(lines({ depth: 6 }), ["  1-8  # Page", "    3-6  ## Forms", "    7-8  ## Practice"]);
  });
  it("prints each heading's summary indented under it with --summaries", () => {
    assert.deepEqual(lines({ depth: 6, summaries: true }), [
      "  1-8  # Page",
      "    3-6  ## Forms",
      "        `thomam` = could be.",
      "    7-8  ## Practice",
    ]);
  });
});
