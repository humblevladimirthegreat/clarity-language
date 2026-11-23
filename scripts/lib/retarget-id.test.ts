import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { applyHashMoves } from "./hash-rows.ts";
import { findPageReferences, findReferences, parseExceptions, retargetText } from "./retarget-id.ts";

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

describe("pages resolved by folder", () => {
  const GRAMMAR = join(REPO_ROOT, "docs", "grammar");
  const IN_LESSONS = join(GRAMMAR, "claritish", "labels.md");
  const STAGE = join(GRAMMAR, "beginner", "how-you-feel.md");
  const PURPOSE = join(GRAMMAR, "purpose.md");
  const META = join(REPO_ROOT, "docs", "meta", "x.md");
  const count = (text: string, file: string, page: string) => findReferences(text, file, page, "x").length;

  for (const name of ["can-and-cant", "feelings", "thanks-and-sorry", "tone-marks"]) {
    const stage = `${name}.md`;
    const lesson = `claritish/${name}.md`;

    it(`${name}: a bare link in a lesson is the lesson's, elsewhere the stage page's`, () => {
      const text = `See [a](${name}.md#x), [b](./${name}#x) and [c](${name}.html#x).`;
      assert.equal(count(text, IN_LESSONS, lesson), 1);
      assert.equal(findReferences(text, IN_LESSONS, lesson, "x")[0]!.count, 3);
      assert.equal(count(text, IN_LESSONS, stage), 0);
      assert.equal(count(text, STAGE, stage), 1);
      assert.equal(count(text, STAGE, lesson), 0);
    });

    it(`${name}: a claritish/ path is the lesson's from any folder`, () => {
      const text = `[a](../claritish/${name}.md#x) [b](claritish/${name}.md#x) [c](/claritish/${name}#x)`;
      assert.equal(findReferences(text, PURPOSE, lesson, "x")[0]!.count, 3);
      assert.equal(count(text, PURPOSE, stage), 0);
      const meta = `[a](../grammar/claritish/${name}.md#x)`;
      assert.equal(count(meta, META, lesson), 1);
      assert.equal(count(meta, META, stage), 0);
    });

    it(`${name}: a lesson's ../ link and bare Source ref are the stage page's`, () => {
      const text = `[a](../${name}.md#x) [b](/${name}#x) <!-- Source (editors): ${name}.md#x. -->`;
      assert.equal(findReferences(text, IN_LESSONS, stage, "x")[0]!.count, 3);
      assert.equal(count(text, IN_LESSONS, lesson), 0);
      assert.equal(count(`"claritish/${name}.md#x"`, CODE, lesson), 1);
      assert.equal(count(`"claritish/${name}.md#x"`, CODE, stage), 0);
    });
  }

  it("retargets a lesson's links in their own form", () => {
    const page = "claritish/feelings.md";
    const lesson = "[a](feelings.md#x) [b](../feelings.md#x)";
    assert.equal(retargetText(lesson, IN_LESSONS, page, "x", () => "y").text, "[a](feelings.md#y) [b](../feelings.md#x)");
    const purpose = "[a](claritish/feelings.md#x) [b](feelings.md#x)";
    assert.equal(retargetText(purpose, PURPOSE, page, "x", () => "y").text, "[a](claritish/feelings.md#y) [b](feelings.md#x)");
    const code = '"claritish/feelings.md#x", "feelings.md#x"';
    assert.equal(retargetText(code, CODE, page, "x", () => "y").text, '"claritish/feelings.md#y", "feelings.md#x"');
  });
});

describe("findPageReferences", () => {
  const LESSON = join(REPO_ROOT, "docs", "grammar", "claritish", "index.md");
  it("finds anchored and unanchored links and bare refs to the page, in line order", () => {
    const text = [
      "- [Feelings](feelings.md): more. See [it](feelings.md#urge) and [stage](../feelings.md#urge).",
      "<!-- Source (editors): feelings.md#urge, claritish/feelings.md#urge. -->",
    ].join("\n");
    const refs = findPageReferences(text, LESSON, "claritish/feelings.md");
    assert.deepEqual(
      refs.map((r) => [r.line, r.id, r.linkText]),
      [
        [1, undefined, "Feelings"],
        [1, "urge", "it"],
        [2, "urge", undefined],
      ],
    );
    assert.deepEqual(
      findPageReferences(text, LESSON, "feelings.md").map((r) => [r.line, r.id, r.linkText]),
      [
        [1, "urge", "stage"],
        [2, "urge", undefined],
      ],
    );
  });

  it("skips bare refs in proposals and longer names", () => {
    assert.equal(findPageReferences("feelings.md#urge", PROPOSAL, "feelings.md").length, 0);
    assert.equal(findPageReferences("how-you-feelings.md#urge", CODE, "feelings.md").length, 0);
    assert.equal(findPageReferences("[x](../grammar/feelings.md)", PROPOSAL, "feelings.md").length, 1);
  });
});
