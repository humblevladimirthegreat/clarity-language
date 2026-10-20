import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { padExerciseSpoilerBlanks } from "./pad-exercise-spoiler-blanks.js";

describe("padExerciseSpoilerBlanks", () => {
  it("inserts blank between morph and loose English in details", () => {
    const md = `### Translation practice

**1.** \`zuzozen vuhohol.\`

::: details Show answer
z-Uzozen | v-sit
*Uzozen sits.*
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /z-Uzozen \| v-sit\n\n\*Uzozen sits\.\*/);
  });

  it("pads a converted Practice checkpoint", () => {
    const md = `### Practice

::: details Show answer
\`zuzozen vuhohol.\`
z-Uzozen | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zuzozen vuhohol\.`\n\nz-Uzozen \| v-sit/);
  });

  it("gives every spoiler line its own paragraph in a converted checkpoint", () => {
    const md = `### Practice

#### Pick one

**1.** *Uzozen sees Olazun.* \`zuzozen dolazun vawebol.\` or \`zolazun duzozen vawebol.\`

::: details Show answer
\`zuzozen dolazun vawebol.\`
z-Uzozen | d-Olazun | v-see
The one who sees takes **z-**.
:::
`;
    assert.match(padExerciseSpoilerBlanks(md), /vawebol\.`\n\nz-Uzozen \| d-Olazun \| v-see\n\nThe one who sees takes \*\*z-\*\*\.\n:::/);
  });

  it("leaves legacy spoiler prose lines joined", () => {
    const md = `### Translation practice

::: details Show answer
*Uzozen sits,*
*and waits.*
:::
`;
    assert.equal(padExerciseSpoilerBlanks(md), md);
  });

  it("inserts blank between Egabon and morph in details", () => {
    const md = `### Translation practice

::: details Show answer
\`zuzozen vuhohol.\`
z-Uzozen | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zuzozen vuhohol\.`\n\nz-Uzozen \| v-sit/);
  });

  it("pads comparatives beginner block", () => {
    const md = readFileSync("docs/grammar/comparatives.md", "utf8");
    const start = md.indexOf("### Practice {#beginner-practice}");
    const end = md.indexOf("## Intermediate", start);
    const slice = md.slice(start, end);
    const out = padExerciseSpoilerBlanks(slice);
    assert.match(out, /`zuhelan zuzozen zoel guzezam\.`\n\n\[z-Uhelan/);
    assert.match(out, /\[z-Uhelan \| z-rank\/more \| g-agility\]\n\n\*Uhelan is the most agile\.\*/);
  });
});
