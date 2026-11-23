import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { GRAMMAR_DIR, REPO_ROOT } from "../src/repo-paths.ts";
import { anchorLinks, deadAnchors, githubSlug, linkTargetFile, pageIds } from "./lint-anchors.ts";
import { pageKeyFile } from "./lib/link-rewrite.ts";

describe("anchorLinks", () => {
  it("skips links in fenced code and inline code spans", () => {
    const md = ["[a](x.md#one)", "```", "[b](x.md#two)", "```", "see `[c](x.md#three)` and [d](#four)"].join("\n");
    assert.deepEqual(
      anchorLinks(md).map((l) => [l.line, l.href, l.id]),
      [
        [1, "x.md", "one"],
        [5, "", "four"],
      ],
    );
  });
});

describe("pageIds", () => {
  it("publishes heading slugs, custom ids and <a id> tags", () => {
    const ids = pageIds('## Rather (`ol`)\n### Two {#custom}\n<a id="tag"></a>');
    assert.deepEqual([...ids].sort(), ["custom", "rather-ol", "tag"]);
  });
  it("adds GitHub slugs for pages outside the site", () => {
    assert.equal(githubSlug("Stage 4 — resolve (AST → discourse sidecar)"), "stage-4--resolve-ast--discourse-sidecar");
    const ids = pageIds("### 6. Self-check, then lint\n## Same\n## Same", true);
    assert.ok(ids.has("6-self-check-then-lint") && ids.has("_6-self-check-then-lint"));
    assert.ok(ids.has("same") && ids.has("same-1"));
  });
});

describe("linkTargetFile", () => {
  const lesson = join(GRAMMAR_DIR, "claritish", "feelings.md");
  const meta = join(REPO_ROOT, "docs", "meta", "a.md");
  it("resolves grammar links the way the site does", () => {
    assert.equal(linkTargetFile(join(GRAMMAR_DIR, "say-amounts.md"), "/joins"), pageKeyFile("joins.md"));
    assert.equal(linkTargetFile(lesson, "other.md"), join(GRAMMAR_DIR, "claritish", "other.md"));
    assert.equal(linkTargetFile(meta, "../grammar/joins.md"), pageKeyFile("joins.md"));
  });
  it("resolves other pages by path and skips external or non-page targets", () => {
    assert.equal(linkTargetFile(meta, "b.md"), join(REPO_ROOT, "docs", "meta", "b.md"));
    assert.equal(linkTargetFile(meta, ""), meta);
    assert.equal(linkTargetFile(meta, "https://example.com/x.md"), undefined);
    assert.equal(linkTargetFile(meta, "../../src/x.ts"), undefined);
  });
});

describe("deadAnchors", () => {
  it("reports ids the target page lacks, unless a hash-redirect row covers them", () => {
    const from = join(REPO_ROOT, "docs", "meta", "a.md");
    const joins = pageKeyFile("joins.md");
    const files: Record<string, string> = {
      [from]: "[ok](../grammar/joins.md#here) [gone](../grammar/joins.md#gone) [band](../grammar/joins.md#intermediate) [self](#top)\n# Top",
      [joins]: "## Here",
    };
    const dead = deadAnchors([from], (file) => files[file]);
    assert.deepEqual(
      dead.map((d) => [d.line, d.target, d.id]),
      [[1, joins, "gone"]],
    );
  });
});
