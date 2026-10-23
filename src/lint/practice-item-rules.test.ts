import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lintPracticeItems } from "./practice-item-rules.js";
import { houseTables, PRACTICE } from "./practice-fixtures.js";

const tables = houseTables();
const lint = (md: string) => lintPracticeItems(md, tables).map((f) => f.detail);

describe("lintPracticeItems", () => {
  it("passes the fixture checkpoint", () => {
    assert.deepEqual(lint(PRACTICE), []);
  });

  it("flags an Also correct variant with another reading, or one that repeats the answer", () => {
    assert.match(lint(PRACTICE.replace("`dazozon zahelan vayebel.`, ", "`zazozon dahelan vayebel.`, ")).join("\n"), /English → Agebon 1: variant `zazozon dahelan vayebel\.` has a different morph reading/);
    assert.match(lint(PRACTICE.replace("`dazozon zahelan vayebel.`, ", "`zahelan dazozon vayebel.`, ")).join("\n"), /repeats the main answer/);
  });

  it("lets a level review **Rule:** line follow Also correct, and does not read it as a why line", () => {
    const rule = "\n\n**Rule:** [Role letters](clause.md#role-letters)";
    let md = PRACTICE.replace("`yal zahelan dazozon vayebel.`", "`yal zahelan dazozon vayebel.`" + rule);
    md = md.replace("The one who sees takes **z-**.", "The one who sees takes **z-**." + rule);
    assert.deepEqual(lint(md), []);
    assert.match(lint(md.replace("The one who sees takes **z-**.\n\n", "")).join("\n"), /Pick one 1: answer needs one line on why/);
  });

  it("flags Also correct outside English → Agebon", () => {
    const md = PRACTICE.replace("*Alazun sees Ahelan.*\n", "*Alazun sees Ahelan.*\n\n**Also correct:** `dahelan zalazun vayebel.`\n");
    assert.match(lint(md).join("\n"), /Agebon → English 1: \*\*Also correct:\*\* belongs only/);
  });

  it("flags a Pick one pair with one reading, or with other roots", () => {
    assert.match(lint(PRACTICE.replace("or `zalazun dazozon vayebel.`", "or `dalazun zazozon vayebel.`")).join("\n"), /Pick one 1: the two forms have the same reading/);
    assert.match(lint(PRACTICE.replace("or `zalazun dazozon vayebel.`", "or `zalazun dahelan vayebel.`")).join("\n"), /Pick one 1: the two forms use different content roots/);
  });

  it("counts the host roots of an x-family word as content roots", () => {
    const md = PRACTICE.replace("`zazozon dalazun vayebel.` or `zalazun dazozon vayebel.`", "`zwazowurol vayebel.` or `zowurol vayebel.`");
    assert.doesNotMatch(lint(md).join("\n"), /different content roots|same reading/);
  });

  it("flags a Pick one answer that is neither form, or has no why line", () => {
    const md = PRACTICE.replace("`zazozon dalazun vayebel.`\n\nz-Azozon | d-Alazun | v-see\n\nThe one who sees takes **z-**.\n", "`zahelan vehohel.`\n");
    const out = lint(md).join("\n");
    assert.match(out, /is neither prompt form/);
    assert.match(out, /needs a morph line/);
    assert.match(out, /needs one line on why/);
  });

  it("flags an unmarked Fix it form, and one with the correction's reading", () => {
    assert.match(lint(PRACTICE.replace("<!-- lint: error -->", "")).join("\n"), /Fix it 1: mark the wrong form/);
    assert.match(
      lint(PRACTICE.replace("<!-- lint: error -->`zazozon dalazun vayebel.`", "<!-- lint: error -->`dazozon zalazun vayebel.`")).join("\n"),
      /Fix it 1: the wrong form has the same reading/,
    );
  });

  it("accepts a Fix it form the parser rejects", () => {
    assert.deepEqual(lint(PRACTICE.replace("<!-- lint: error -->`zazozon dalazun vayebel.`", "<!-- lint: error -->`zalazun dazozon.`")), []);
  });

  it("flags a What changes pair that differs in more than one word, or lacks morph lines", () => {
    assert.match(lint(PRACTICE.replace("`zazozon vehohel.` / `zalazun vehohel.`", "`zazozon vehohel.` / `zalazun vowurol.`")).join("\n"), /differ in exactly one word/);
    assert.match(lint(PRACTICE.replace("z-Alazun | v-sit\n\n", "")).join("\n"), /needs a morph line for each sentence/);
  });
});
