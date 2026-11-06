import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { REPO_ROOT } from "../repo-paths.js";
import { anchorTags, grammarHeadings } from "./grammar-anchors.js";
import { LINT_HINTS, hintTargets } from "./hints.js";

describe("lint:ageben summary hints", () => {
  for (const [name, hint] of Object.entries(LINT_HINTS)) {
    it(`${name} names an existing editor-note section`, () => {
      const targets = hintTargets(hint);
      assert.ok(targets.length > 0, `${name}: no docs/meta/<file>.md#<anchor> in "${hint}"`);
      for (const { file, anchor } of targets) {
        assert.ok(file.startsWith("docs/meta/"), `${name}: ${file}#${anchor} points outside docs/meta/`);
        const markdown = readFileSync(join(REPO_ROOT, file), "utf8");
        const ids = new Set([...grammarHeadings(markdown).map((h) => h.id), ...anchorTags(markdown).map((a) => a.id)]);
        assert.ok(ids.has(anchor), `${name}: ${file} has no heading or <a id> "${anchor}"`);
      }
    });
  }

  it("finds proposal targets, so the outside-docs/meta check can fail", () => {
    assert.deepEqual(hintTargets("see docs/proposals/x.md#y"), [{ file: "docs/proposals/x.md", anchor: "y" }]);
  });
});
