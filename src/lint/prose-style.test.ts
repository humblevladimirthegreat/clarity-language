import assert from "node:assert/strict";
import { test } from "node:test";
import { proseStyleIssues, sentenceCount } from "./prose-style.js";

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
