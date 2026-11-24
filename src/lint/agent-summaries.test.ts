import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { lintAgebenMarkdown } from "./ageben-docs.js";
import { headingSummaries, lintAgentSummaries, summaryBodiesOnly, summaryPageKind, teachingHeadings } from "./agent-summaries.js";
import { grammarHeadings } from "./grammar-anchors.js";
import { loadDefaultTables } from "../parse/index.js";
import { GRAMMAR_DIR } from "../repo-paths.js";

const S = (text: string) => `<!-- Agent summary: ${text} -->`;

const stagePage = [
  "# Can {#can}",
  "",
  "### Ability {#ability}",
  S("`xa` = can."),
  "",
  "#### Can be",
  "",
  "### Fallback {#fallback}",
  '<a id="old-fallback"></a>',
  "",
  S("`oda` when there is no verb."),
  "",
  "### Practice {#practice}",
  "",
  "#### Fix it",
  "",
].join("\n");

describe("summaryPageKind", () => {
  it("sorts grammar pages", () => {
    assert.equal(summaryPageKind("beginner/clause.md"), "stage");
    assert.equal(summaryPageKind("say-tense.md"), "recipe");
    assert.equal(summaryPageKind("english.md"), "recipe");
    assert.equal(summaryPageKind("claritish/could-be.md"), "lesson");
    assert.equal(summaryPageKind("claritish/index.md"), undefined);
    assert.equal(summaryPageKind("claritish/cheat-sheet.md"), undefined);
    assert.equal(summaryPageKind("terminology.md"), undefined);
  });
});

describe("headingSummaries", () => {
  it("finds a summary directly under a heading, past blank and <a id> lines", () => {
    const got = headingSummaries(stagePage).map((a) => [a.heading.title, a.text]);
    assert.deepEqual(got, [
      ["Can", undefined],
      ["Ability", "`xa` = can."],
      ["Can be", undefined],
      ["Fallback", "`oda` when there is no verb."],
      ["Practice", undefined],
      ["Fix it", undefined],
    ]);
  });
});

describe("teachingHeadings", () => {
  it("stage: H3s outside Practice and See also", () => {
    assert.deepEqual(teachingHeadings("stage", grammarHeadings(stagePage)).map((h) => h.title), ["Ability", "Fallback"]);
  });
  it("recipe: H3s, and H2s with no H3 under them, outside Practice", () => {
    const md = ["# R", "## Area", "### Job", "#### Detail", "## Lone area", "#### Note", "## Practice", "### Block"].join("\n");
    assert.deepEqual(teachingHeadings("recipe", grammarHeadings(md)).map((h) => h.title), ["Job", "Lone area"]);
  });
  it("lesson: H2s except The gap, Examples and Practice", () => {
    const md = ["# L", "## The gap", "## The forms", "### Table", "## Examples", "## Practice"].join("\n");
    assert.deepEqual(teachingHeadings("lesson", grammarHeadings(md)).map((h) => h.title), ["The forms"]);
  });
});

describe("lintAgentSummaries", () => {
  it("passes a covered stage page", () => {
    assert.deepEqual(lintAgentSummaries("beginner/can.md", stagePage), []);
  });
  it("needs every teaching heading once the page has one summary", () => {
    const md = stagePage.replace(S("`oda` when there is no verb."), "");
    assert.deepEqual(
      lintAgentSummaries("beginner/can.md", md).map((f) => [f.line + 1, f.kind]),
      [[8, "coverage"]],
    );
  });
  it("passes a page with no summary unless its kind is required", () => {
    const md = "# P\n\n### A\n\ntext\n";
    assert.deepEqual(lintAgentSummaries("beginner/p.md", md), []);
    assert.deepEqual(
      lintAgentSummaries("beginner/p.md", md, new Set(["stage"])).map((f) => f.kind),
      ["coverage"],
    );
  });
  it("rejects a summary under Practice or a heading inside it", () => {
    const md = ["# P", "### Practice", S("drill."), "#### Fix it", S("fix.")].join("\n");
    assert.deepEqual(
      lintAgentSummaries("terminology.md", md).map((f) => [f.line + 1, f.kind]),
      [
        [3, "placement"],
        [5, "placement"],
      ],
    );
  });
  it("rejects a second summary, one not under a heading, and a malformed one", () => {
    const md = ["<!-- read-by", "x -->", S("before the H1."), "# P", S("one."), S("two."), "", "text", "<!-- agent summary: loose -->"].join("\n");
    assert.deepEqual(
      lintAgentSummaries("terminology.md", md).map((f) => [f.line + 1, f.kind]),
      [
        [3, "placement"],
        [6, "placement"],
        [9, "format"],
      ],
    );
  });
  it("ignores fenced examples", () => {
    const md = ["# P", "", "```md", "### MAY", S("x."), "```"].join("\n");
    assert.deepEqual(lintAgentSummaries("terminology.md", md), []);
  });
  it("covers every Claritish lesson today", () => {
    const md = readFileSync(join(GRAMMAR_DIR, "claritish", "could-be.md"), "utf8");
    assert.deepEqual(lintAgentSummaries("claritish/could-be.md", md), []);
    assert.ok(headingSummaries(md).filter((a) => a.text).length >= 3);
  });
});

describe("summaryBodiesOnly", () => {
  it("keeps only summary bodies, at their offsets, so the Ageben checks see their spans", () => {
    const md = ["# P", "### A", S("`xa` and `abababa`."), "Prose `zzzq`."].join("\n");
    const bodies = summaryBodiesOnly(md);
    assert.equal(bodies.length, md.length);
    assert.equal(bodies.split("\n")[3]!.trim(), "");
    assert.match(bodies, /`xa` and `abababa`\./);
    const tokens = lintAgebenMarkdown(bodies, loadDefaultTables()).map((i) => i.token);
    assert.deepEqual(tokens, ["abababa"]);
  });
});
