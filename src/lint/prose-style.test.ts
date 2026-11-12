import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareWarningBaseline,
  formatWarningBaseline,
  proseStyleIssues,
  sentenceCount,
  updatedWarningBaseline,
} from "./prose-style.js";

const rules = (markdown: string, page = "beginner/x.md") => proseStyleIssues(page, markdown).map((i) => `${i.severity}:${i.rule}`);
const stage = (body: string) => `---\nband: beginner\n---\n\n# Page\n\n${body}\n`;

test("link text that is a filename fails; a title passes", () => {
  assert.deepEqual(rules("- Endings: [word-endings.md](word-endings.md)"), ["error:link-filename"]);
  assert.deepEqual(rules("- Endings: [x.md#a](x.md#a)"), ["error:link-filename"]);
  assert.deepEqual(rules("- Endings: [Word endings](word-endings.md)"), []);
});

test("throat-clearing fails in the page's own words only", () => {
  assert.deepEqual(rules("In this section the verb moves."), ["error:throat-clearing"]);
  assert.deepEqual(rules("Note that the verb moves."), ["error:throat-clearing"]);
  assert.deepEqual(rules("Pick a note that sits low."), []);
  assert.deepEqual(rules("> \"We now walk.\""), []);
  assert.deepEqual(rules("English says *we now walk*."), []);
});

test("empty reassurance and prose exclamation marks fail", () => {
  assert.deepEqual(rules("Don't worry about the ending."), ["error:empty-warmth"]);
  assert.deepEqual(rules("It is easy to mistake one for the other."), []);
  assert.deepEqual(rules("The verb moves!"), ["error:exclamation"]);
  assert.deepEqual(rules("English says *Stop!* here."), []);
  assert.deepEqual(rules("| `!` | *Stop!* |"), []);
});

test("a cue in a section's first sentence fails on stage pages", () => {
  assert.deepEqual(rules(stage("### Objects\n\nThe `d` word is acted on (cue: done to). More.")), ["error:cue-first"]);
  assert.deepEqual(rules(stage("### Objects\n\nThe `d` word is acted on. It follows the verb (cue: done to).")), []);
  assert.deepEqual(rules("### Objects\n\nThe `d` word is acted on (cue: done to).", "terminology.md"), []);
});

test("editor paths and the legacy name fail; comments and fences are skipped", () => {
  assert.deepEqual(rules("See docs/meta/doc-style.md."), ["error:editor-path"]);
  assert.deepEqual(rules("Clarity has four vowels."), ["error:legacy-name"]);
  assert.deepEqual(rules("<!-- see docs/meta/doc-style.md -->"), []);
  assert.deepEqual(rules("```text\nClarity docs/meta/ Note that!\n```"), []);
  assert.deepEqual(rules("[Reddit](https://www.reddit.com/r/ClarityLanguage)"), []);
});

test("heuristics warn: jargon, long paragraphs, bold density, Beginner lead length", () => {
  assert.deepEqual(rules("The adjunct follows the verb."), ["warning:jargon"]);
  assert.deepEqual(rules("The adjunct follows the verb.", "terminology.md"), []);
  assert.deepEqual(rules("### Here {#deixis}"), []);
  assert.deepEqual(rules("One. Two. Three. Four. Five. Six."), ["warning:long-paragraph"]);
  assert.deepEqual(rules("One. Two. Three. Four. Five."), []);
  assert.deepEqual(rules("**a** **b** **c** **d** **e** here."), ["warning:bold-density"]);
  assert.deepEqual(rules(stage("### Objects\n\nOne.\n\n> example")), ["warning:beginner-lead"]);
  assert.deepEqual(rules(stage("### Objects\n\nOne. Two.\n\n> example")), []);
  assert.deepEqual(rules(stage("### Practice\n\nOne.\n\n> example")), []);
});

test("sentenceCount ignores code, link targets, parentheses and abbreviations", () => {
  assert.equal(sentenceCount("Use `a.b` here (see below. really). It works, e.g. now."), 2);
  assert.equal(sentenceCount("See [the page. yes](x.md). Done?"), 3);
});

test("voice fails on maintainer we and author I in the page's own words", () => {
  assert.deepEqual(rules("Here we write the verb first."), ["error:voice"]);
  assert.deepEqual(rules("This suits our purposes."), ["error:voice"]);
  assert.deepEqual(rules("Let us look at endings."), ["error:voice"]);
  assert.deepEqual(rules("I think the ending helps."), ["error:voice"]);
  assert.deepEqual(rules("I'm adding a table."), ["error:voice"]);
  assert.deepEqual(rules("Ask me about it."), ["error:voice"]);
  assert.deepEqual(rules("### What we mean"), ["error:voice"]);
});

test("voice skips examples, code, comments, link targets, glosses and lookalikes", () => {
  assert.deepEqual(rules("English *we* can mean two groups."), []);
  assert.deepEqual(rules("English says \"I am here\" or “we left.”"), []);
  assert.deepEqual(rules("> I see you."), []);
  assert.deepEqual(rules("```text\nwe I me\n```"), []);
  assert.deepEqual(rules("The form `we` is not a word."), []);
  assert.deepEqual(rules("<!-- we fix this later -->"), []);
  assert.deepEqual(rules("See [the page](/we/our-page)."), []);
  assert.deepEqual(rules("**1.** *The luggage is here.* (near me)"), []);
  assert.deepEqual(rules("*Here.* (the hurt is hers; the feeling is mine, and I know it)"), []);
  assert.deepEqual(rules("Inclusive *we* (you and I) uses this."), []);
  assert.deepEqual(rules("Choose **Check me** to hear it."), []);
  assert.deepEqual(rules("**For *I'm anxious*, use:** a reach vowel."), []);
  assert.deepEqual(rules("Stage: **B** Beginner, **I** Intermediate."), []);
  assert.deepEqual(rules("| *I am here.* | I | we |"), []);
  assert.deepEqual(rules("The US has fifty states. Use Henry I. and World War I. as names."), []);
  assert.deepEqual(rules("::: details Show answer\nI ran `zuol`.\n:::"), []);
  assert.deepEqual(rules("::: details Show answer\nWe ran.\n:::", "claritish/x.md"), []);
  assert.deepEqual(rules("::: details Show answer\nThis is fine for our purposes.\n:::"), ["error:voice"]);
});

test("voice allows author I only in the signed sections", () => {
  const signed = "## Acknowledgments\n\nI would like to thank them.\n\n## Next\n\nI teach.";
  assert.deepEqual(rules(signed, "introduction.md"), ["error:voice"]);
  assert.deepEqual(rules("## Criticisms {#criticisms}\n\n### Ethics\n\nI think so.", "purpose.md"), []);
  assert.deepEqual(rules("## Criticisms {#criticisms}\n\nWe think so.", "purpose.md"), ["error:voice"]);
  assert.deepEqual(rules("## Limits\n\nI think so.", "purpose.md"), ["error:voice"]);
  assert.deepEqual(rules("## Acknowledgments\n\nI would like to thank them."), ["error:voice"]);
});

test("warning ratchet: rises fail, falls are reported, missing pages and rules count as 0", () => {
  const baseline = { "a.md": { jargon: 2, "bold-density": 1 }, "gone.md": { jargon: 1 } };
  const counts = { "a.md": { jargon: 3 }, "b.md": { "long-paragraph": 1 }, "c.md": {} };
  assert.deepEqual(compareWarningBaseline(counts, baseline), {
    rises: [
      { page: "a.md", rule: "jargon", baseline: 2, current: 3 },
      { page: "b.md", rule: "long-paragraph", baseline: 0, current: 1 },
    ],
    falls: [{ page: "a.md", rule: "bold-density", baseline: 1, current: 0 }],
  });
  assert.deepEqual(compareWarningBaseline(counts, baseline, [...Object.keys(counts), "gone.md"]).falls.length, 2);
  assert.deepEqual(compareWarningBaseline({ "a.md": { jargon: 2, "bold-density": 1 } }, baseline), { rises: [], falls: [] });
});

test("warning baseline update: full replaces, per-page keeps the rest, output is sorted", () => {
  const baseline = { "a.md": { jargon: 2 }, "gone.md": { jargon: 1 } };
  const counts = { "b.md": { "bold-density": 1, jargon: 0 }, "a.md": {} };
  assert.deepEqual(updatedWarningBaseline(counts, baseline), { "b.md": { "bold-density": 1 } });
  assert.deepEqual(updatedWarningBaseline({ "a.md": { "bold-density": 1 } }, baseline, ["a.md"]), {
    "a.md": { "bold-density": 1 },
    "gone.md": { jargon: 1 },
  });
  assert.equal(
    formatWarningBaseline({ "b.md": { voice: 1, jargon: 2 }, "a.md": { jargon: 1 } }),
    '{\n  "a.md": {\n    "jargon": 1\n  },\n  "b.md": {\n    "jargon": 2,\n    "voice": 1\n  }\n}\n',
  );
});
