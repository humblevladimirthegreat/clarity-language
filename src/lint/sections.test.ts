import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { changedSections, codeSpans, isMorphGloss, listDiff, pageSections, wordingProblems } from "./sections.js";

const PAGE = `---
band: beginner
---

# Title

Lead text.

### One {#one}

The suffix **-l** marks it. See [clause](/clause#one).

> \`zodozel vowurol.\`
>
> z-dog | v-walk
>
> "A dog walks."

#### Detail

More on \`zodozel\`.

### Two

Plain text with \`awan\` and \`uwen\`.

\`\`\`
raw block
\`\`\`

### Practice {#beginner-practice}

**1.** \`zodozel vowurol.\`
`;

function edit(from: string, to: string, md = PAGE): string {
  assert.ok(md.includes(from), `fixture lacks ${from}`);
  return md.replace(from, to);
}

describe("pageSections", () => {
  it("splits on H2/H3 and keeps H4 inside", () => {
    const { lead, sections } = pageSections(PAGE);
    assert.deepEqual(
      sections.map((s) => s.id),
      ["one", "two", "beginner-practice"],
    );
    assert.equal(lead.end, sections[0]!.line);
    assert.ok(sections[0]!.lines.some((l) => l.startsWith("#### Detail")));
  });
});

describe("listDiff", () => {
  it("finds an insertion without flagging the rest", () => {
    assert.deepEqual(listDiff(["a", "b", "c"], ["a", "x", "b", "c"]), { removed: [], added: [1] });
  });
});

describe("codeSpans", () => {
  it("reads single and double backtick spans", () => {
    const { spans, prose } = codeSpans(["a `x` b ``y ` z`` c"]);
    assert.deepEqual(
      spans.map((s) => s.text),
      ["x", "y ` z"],
    );
    assert.ok(!prose.includes("x"));
  });
});

describe("isMorphGloss", () => {
  it("accepts glosses and rejects English", () => {
    assert.ok(isMorphGloss("z-dog | v-walk"));
    assert.ok(isMorphGloss("[z-dog | g-angry] | v-walk"));
    assert.ok(isMorphGloss("z-Azozon | v-walk . z-←Azozon | v-sit"));
    assert.ok(!isMorphGloss('"A dog walks."'));
    assert.ok(!isMorphGloss("the doer"));
    assert.ok(!isMorphGloss("x-ray vision is fun"));
  });
});

describe("wordingProblems", () => {
  it("passes a pure wording edit", () => {
    const next = edit("Plain text with", "Ordinary words, with");
    assert.deepEqual(wordingProblems(PAGE, next), []);
  });

  it("passes bold -l moved into backticks", () => {
    const next = edit("**-l**", "`-l`");
    assert.deepEqual(wordingProblems(PAGE, next), []);
  });

  it("passes a code span reordered or dropped when repeated", () => {
    const next = edit("with `awan` and `uwen`.", "with `uwen`, then `awan`, and `awan` again.");
    assert.deepEqual(wordingProblems(PAGE, next), []);
  });

  const failures: [string, string, string, RegExp][] = [
    ["heading text", "### Two", "### Second", /heading/],
    ["anchor id", "{#one}", "{#first}", /anchor id/],
    ["fence", "raw block", "raw blocks", /code fence/],
    ["Practice", "**1.** `zodozel vowurol.`", "**1.** `zodozel vowurol.` (easy)", /Practice section/],
    ["removed span", "with `awan` and `uwen`.", "with `awan`.", /`uwen` removed/],
    ["added span", "with `awan` and `uwen`.", "with `awan`, `uwen` and `ayan`.", /`ayan` added/],
    ["link target", "(/clause#one)", "(/clause#two)", /link to \/clause#two added/],
    ["morph gloss", "> z-dog | v-walk", "> z-dog | v-run", /morph gloss/],
  ];
  for (const [name, from, to, re] of failures) {
    it(`fails on ${name}`, () => {
      const problems = wordingProblems(PAGE, edit(from, to));
      assert.ok(
        problems.some((p) => re.test(p.message)),
        JSON.stringify(problems),
      );
    });
  }

  it("fails on a changed generated block", () => {
    const old = `${PAGE}\n## Sheet\n\n<!-- generated: x -->\n| a |\n<!-- /generated -->\n`;
    const problems = wordingProblems(old, edit("| a |", "| b |", old));
    assert.ok(problems.some((p) => /generated block/.test(p.message)));
  });

  it("allows link text to change", () => {
    assert.deepEqual(wordingProblems(PAGE, edit("[clause](", "[the clause page](")), []);
  });
});

describe("changedSections", () => {
  it("lists a changed section and the one after it as context", () => {
    const next = edit("The suffix", "This suffix");
    assert.deepEqual(
      changedSections(PAGE, next).map((c) => `${c.id} ${c.reason}`),
      ["one changed", "two context"],
    );
  });

  it("lists the first section as context when the lead changes", () => {
    const next = edit("Lead text.", "Lead words.");
    assert.deepEqual(
      changedSections(PAGE, next).map((c) => `${c.id} ${c.reason}`),
      ["(lead) changed", "one context"],
    );
  });

  it("reports a section moved in from another page", () => {
    const next = edit("### Two\n", "### Three {#three}\n\nMoved here.\n\n### Two\n");
    const changes = changedSections(PAGE, next, (id) => (id === "three" ? "docs/grammar/beginner/other.md" : undefined));
    assert.deepEqual(
      changes.map((c) => `${c.id} ${c.reason}${c.from ? ` ${c.from}` : ""}`),
      ["three moved docs/grammar/beginner/other.md", "two context"],
    );
  });

  it("lists a section whose predecessor is a different section", () => {
    const cut = PAGE.slice(PAGE.indexOf("### One"), PAGE.indexOf("### Two"));
    const next = PAGE.replace(cut, "");
    assert.deepEqual(
      changedSections(PAGE, next).map((c) => `${c.id} ${c.reason}`),
      ["two context"],
    );
  });

  it("lists a new section and nothing on an unchanged page", () => {
    assert.deepEqual(changedSections(PAGE, PAGE), []);
    const next = edit("### Practice", "### Added\n\nNew.\n\n### Practice");
    assert.deepEqual(
      changedSections(PAGE, next).map((c) => `${c.id} ${c.reason}`),
      ["added new", "beginner-practice context"],
    );
  });
});
