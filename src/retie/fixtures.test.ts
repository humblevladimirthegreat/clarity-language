import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fixtureFromMarkdown, fixtureToMarkdown, goldenOf } from "./fixtures.js";
import { rewriteMarkdown } from "./markdown.js";

const FIXTURE = [
  "# Names: Azozon stands for Pingu. \"Fly\" is v-wing (`vewobol`).",
  "",
  "@ s2",
  "zul gawozal vewobol.",
  "= Penguins never fly.",
  "",
  "Sam: zalazun bazozon varal.",
  "",
].join("\n");

describe("solver fixtures as Markdown", () => {
  it("wraps Ageben lines in code spans, escapes comments, and round-trips", () => {
    const md = fixtureToMarkdown(FIXTURE);
    assert.equal(md.split("\n")[0], "\\# Names: Azozon stands for Pingu. \"Fly\" is v-wing (`vewobol`).");
    assert.equal(md.split("\n")[3], "`zul gawozal vewobol.`");
    assert.equal(md.split("\n")[6], "Sam: `zalazun bazozon varal.`");
    assert.equal(fixtureFromMarkdown(md, FIXTURE), FIXTURE);
  });

  it("reties the Ageben lines and the comment's code, never the labels or English", () => {
    const map = new Map([["awoza", "oboza"], ["ewobo", "ezebo"]]);
    const { text } = rewriteMarkdown(fixtureToMarkdown(FIXTURE), map);
    const out = fixtureFromMarkdown(text, FIXTURE);
    assert.match(out, /^zul gobozal vezebol\.$/m);
    assert.match(out, /\(`vezebol`\)/);
    assert.match(out, /^@ s2$/m);
    assert.match(out, /^= Penguins never fly\.$/m);
  });

  it("names the golden only for solve-* fixtures", () => {
    assert.equal(goldenOf("src/interpret/fixtures/solve-clash.txt"), "src/interpret/fixtures/solve-clash.lp");
    assert.equal(goldenOf("src/interpret/fixtures/draft-or.txt"), null);
  });
});
