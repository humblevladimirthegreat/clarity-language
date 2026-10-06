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
    assert.match(lint(PRACTICE.replace("`dazawan zahaben vahahal.`, ", "`zazawan dahaben vahahal.`, ")).join("\n"), /English → Agazan 1: variant `zazawan dahaben vahahal\.` has a different morph reading/);
    assert.match(lint(PRACTICE.replace("`dazawan zahaben vahahal.`, ", "`zahaben dazawan vahahal.`, ")).join("\n"), /repeats the main answer/);
  });

  it("flags Also correct outside English → Agazan", () => {
    const md = PRACTICE.replace("*Alahen sees Ahaben.*\n", "*Alahen sees Ahaben.*\n\n**Also correct:** `dahaben zalahen vahahal.`\n");
    assert.match(lint(md).join("\n"), /Agazan → English 1: \*\*Also correct:\*\* belongs only/);
  });

  it("flags a Pick one pair with one reading, or with other roots", () => {
    assert.match(lint(PRACTICE.replace("or `zalahen dazawan vahahal.`", "or `dalahen zazawan vahahal.`")).join("\n"), /Pick one 1: the two forms have the same reading/);
    assert.match(lint(PRACTICE.replace("or `zalahen dazawan vahahal.`", "or `zalahen dahaben vahahal.`")).join("\n"), /Pick one 1: the two forms use different content roots/);
  });

  it("flags a Pick one answer that is neither form, or has no why line", () => {
    const md = PRACTICE.replace("`zazawan dalahen vahahal.`\n\nz-Azawan | d-Alahen | v-see\n\nThe one who sees takes **z-**.\n", "`zahaben vehahel.`\n");
    const out = lint(md).join("\n");
    assert.match(out, /is neither prompt form/);
    assert.match(out, /needs a morph line/);
    assert.match(out, /needs one line on why/);
  });

  it("flags an unmarked Fix it form, and one with the correction's reading", () => {
    assert.match(lint(PRACTICE.replace("<!-- lint: error -->", "")).join("\n"), /Fix it 1: mark the wrong form/);
    assert.match(
      lint(PRACTICE.replace("<!-- lint: error -->`zazawan dalahen vahahal.`", "<!-- lint: error -->`dazawan zalahen vahahal.`")).join("\n"),
      /Fix it 1: the wrong form has the same reading/,
    );
  });

  it("accepts a Fix it form the parser rejects", () => {
    assert.deepEqual(lint(PRACTICE.replace("<!-- lint: error -->`zazawan dalahen vahahal.`", "<!-- lint: error -->`zalahen dazawan.`")), []);
  });

  it("flags a What changes pair that differs in more than one word, or lacks morph lines", () => {
    assert.match(lint(PRACTICE.replace("`zazawan vehahel.` / `zalahen vehahel.`", "`zazawan vehahel.` / `zalahen vowogal.`")).join("\n"), /differ in exactly one word/);
    assert.match(lint(PRACTICE.replace("z-Alahen | v-sit\n\n", "")).join("\n"), /needs a morph line for each sentence/);
  });
});
