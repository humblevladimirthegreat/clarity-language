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
    assert.match(lint(PRACTICE.replace("`duzozen zuhelan vawebol.`, ", "`zuzozen duhelan vawebol.`, ")).join("\n"), /English → Egabon 1: variant `zuzozen duhelan vawebol\.` has a different morph reading/);
    assert.match(lint(PRACTICE.replace("`duzozen zuhelan vawebol.`, ", "`zuhelan duzozen vawebol.`, ")).join("\n"), /repeats the main answer/);
  });

  it("lets a level review **Rule:** line follow Also correct, and does not read it as a why line", () => {
    const rule = "\n\n**Rule:** [Role letters](clause.md#role-letters)";
    let md = PRACTICE.replace("`yal zuhelan duzozen vawebol.`", "`yal zuhelan duzozen vawebol.`" + rule);
    md = md.replace("The one who sees takes **z-**.", "The one who sees takes **z-**." + rule);
    assert.deepEqual(lint(md), []);
    assert.match(lint(md.replace("The one who sees takes **z-**.\n\n", "")).join("\n"), /Pick one 1: answer needs one line on why/);
  });

  it("flags Also correct outside English → Egabon", () => {
    const md = PRACTICE.replace("*Olazun sees Uhelan.*\n", "*Olazun sees Uhelan.*\n\n**Also correct:** `duhelan zolazun vawebol.`\n");
    assert.match(lint(md).join("\n"), /Egabon → English 1: \*\*Also correct:\*\* belongs only/);
  });

  it("flags a Pick one pair with one reading, or with other roots", () => {
    assert.match(lint(PRACTICE.replace("or `zolazun duzozen vawebol.`", "or `dolazun zuzozen vawebol.`")).join("\n"), /Pick one 1: the two forms have the same reading/);
    assert.match(lint(PRACTICE.replace("or `zolazun duzozen vawebol.`", "or `zolazun duhelan vawebol.`")).join("\n"), /Pick one 1: the two forms use different content roots/);
  });

  it("counts the host roots of an x-family word as content roots", () => {
    const md = PRACTICE.replace("`zuzozen dolazun vawebol.` or `zolazun duzozen vawebol.`", "`zaxewurel vawebol.` or `zewurel vawebol.`");
    assert.doesNotMatch(lint(md).join("\n"), /different content roots|same reading/);
  });

  it("flags a Pick one answer that is neither form, or has no why line", () => {
    const md = PRACTICE.replace("`zuzozen dolazun vawebol.`\n\nz-Uzozen | d-Olazun | v-see\n\nThe one who sees takes **z-**.\n", "`zuhelan vuhohol.`\n");
    const out = lint(md).join("\n");
    assert.match(out, /is neither prompt form/);
    assert.match(out, /needs a morph line/);
    assert.match(out, /needs one line on why/);
  });

  it("flags an unmarked Fix it form, and one with the correction's reading", () => {
    assert.match(lint(PRACTICE.replace("<!-- lint: error -->", "")).join("\n"), /Fix it 1: mark the wrong form/);
    assert.match(
      lint(PRACTICE.replace("<!-- lint: error -->`zuzozen dolazun vawebol.`", "<!-- lint: error -->`duzozen zolazun vawebol.`")).join("\n"),
      /Fix it 1: the wrong form has the same reading/,
    );
  });

  it("accepts a Fix it form the parser rejects", () => {
    assert.deepEqual(lint(PRACTICE.replace("<!-- lint: error -->`zuzozen dolazun vawebol.`", "<!-- lint: error -->`zolazun duzozen.`")), []);
  });

  it("flags a What changes pair that differs in more than one word, or lacks morph lines", () => {
    assert.match(lint(PRACTICE.replace("`zuzozen vuhohol.` / `zolazun vuhohol.`", "`zuzozen vuhohol.` / `zolazun vewurel.`")).join("\n"), /differ in exactly one word/);
    assert.match(lint(PRACTICE.replace("z-Olazun | v-sit\n\n", "")).join("\n"), /needs a morph line for each sentence/);
  });
});
