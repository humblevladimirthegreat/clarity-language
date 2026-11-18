import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { applyHashMoves } from "./hash-rows.ts";
import { findReferences, parseExceptions, retargetText } from "./retarget-id.ts";

const PAGE = "thanks-and-sorry.md";
const ON_PAGE = join(REPO_ROOT, "docs", "grammar", "beginner", PAGE);
const OTHER = join(REPO_ROOT, "docs", "grammar", "beginner", "feelings.md");
const CODE = join(REPO_ROOT, "src", "game", "x.ts");
const PROPOSAL = join(REPO_ROOT, "docs", "proposals", "ideas", "x.md");

const OTHER_TEXT = [
  "See [thanks](/thanks-and-sorry#thanks-sorry).",
  "And [sorry](thanks-and-sorry.md#thanks-sorry), [also](./thanks-and-sorry.html#thanks-sorry).",
  "Not [this](/thanks-and-sorry#thanks-sorry-detail) or [that](/feelings#thanks-sorry).",
].join("\n");

describe("findReferences", () => {
  it("finds /page, .md and .html links, one entry per line, and skips longer ids and other pages", () => {
    const refs = findReferences(OTHER_TEXT, OTHER, PAGE, "thanks-sorry");
    assert.deepEqual(
      refs.map((r) => [r.line, r.count, r.linkTexts]),
      [
        [1, 1, ["thanks"]],
        [2, 2, ["sorry", "also"]],
      ],
    );
    assert.match(refs[0]!.context, /thanks-and-sorry#thanks-sorry/);
  });

  it("finds same-page links only on the page itself", () => {
    const text = "Back to [it](#thanks-sorry).";
    assert.equal(findReferences(text, ON_PAGE, PAGE, "thanks-sorry").length, 1);
    assert.equal(findReferences(text, OTHER, PAGE, "thanks-sorry").length, 0);
  });

  it("finds bare page.md#id refs in code, but not in proposals", () => {
    const text = 'source: "thanks-and-sorry.md#thanks-sorry",';
    assert.equal(findReferences(text, CODE, PAGE, "thanks-sorry")[0]!.linkTexts.length, 0);
    assert.equal(findReferences(text, PROPOSAL, PAGE, "thanks-sorry").length, 0);
  });
});

describe("retargetText", () => {
  it("sends each line to the default, or to its exception, keeping the href form", () => {
    const { text, edits } = retargetText(OTHER_TEXT, OTHER, PAGE, "thanks-sorry", (line) =>
      line === 2 ? "sorry" : "thanks",
    );
    const lines = text.split("\n");
    assert.equal(lines[0], "See [thanks](/thanks-and-sorry#thanks).");
    assert.equal(lines[1], "And [sorry](thanks-and-sorry.md#sorry), [also](./thanks-and-sorry.html#sorry).");
    assert.equal(lines[2], OTHER_TEXT.split("\n")[2]);
    assert.deepEqual(edits, [
      { line: 1, count: 1, to: "thanks" },
      { line: 2, count: 2, to: "sorry" },
    ]);
  });

  it("keeps same-page links same-page", () => {
    const { text } = retargetText("Back to [it](#thanks-sorry).", ON_PAGE, PAGE, "thanks-sorry", () => "sorry");
    assert.equal(text, "Back to [it](#sorry).");
  });
});

describe("parseExceptions", () => {
  it("keys by file:line", () => {
    const map = parseExceptions("docs/grammar/beginner/feelings.md:88=sorry, ./src/game/x.ts:12=#sorry");
    assert.deepEqual([...map], [
      ["docs/grammar/beginner/feelings.md:88", "sorry"],
      ["src/game/x.ts:12", "sorry"],
    ]);
  });

  it("rejects a malformed or repeated entry", () => {
    assert.throws(() => parseExceptions("feelings.md=sorry"), /file:line=id/);
    assert.throws(() => parseExceptions("a.md:1=x,a.md:1=y"), /twice/);
  });
});

describe("hash row for a split", () => {
  it("adds one same-page row from the old id to the default target", () => {
    const { rows } = applyHashMoves([], [{ from: PAGE, id: "thanks-sorry", into: PAGE, toId: "thanks" }]);
    assert.deepEqual(rows, [{ page: PAGE, hash: "thanks-sorry", to: PAGE, toHash: "thanks" }]);
  });
});
