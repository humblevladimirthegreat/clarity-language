import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { padExerciseSpoilerBlanks } from "./pad-exercise-spoiler-blanks.js";
import { grammarFile } from "../repo-paths.js";

describe("padExerciseSpoilerBlanks", () => {
  it("inserts blank between morph and loose English in details", () => {
    const md = `### Translation practice

**1.** \`zazozon vehohel.\`

::: details Show answer
z-Azozon | v-sit
*Azozon sits.*
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /z-Azozon \| v-sit\n\n\*Azozon sits\.\*/);
  });

  it("pads a converted Practice checkpoint", () => {
    const md = `### Practice

::: details Show answer
\`zazozon vehohel.\`
z-Azozon | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zazozon vehohel\.`\n\nz-Azozon \| v-sit/);
  });

  it("gives every spoiler line its own paragraph in a converted checkpoint", () => {
    const md = `### Practice

#### Pick one

**1.** *Azozon sees Alazun.* \`zazozon dalazun vayebel.\` or \`zalazun dazozon vayebel.\`

::: details Show answer
\`zazozon dalazun vayebel.\`
z-Azozon | d-Alazun | v-see
The one who sees takes **z-**.
:::
`;
    assert.match(padExerciseSpoilerBlanks(md), /vayebel\.`\n\nz-Azozon \| d-Alazun \| v-see\n\nThe one who sees takes \*\*z-\*\*\.\n:::/);
  });

  it("leaves legacy spoiler prose lines joined", () => {
    const md = `### Translation practice

::: details Show answer
*Azozon sits,*
*and waits.*
:::
`;
    assert.equal(padExerciseSpoilerBlanks(md), md);
  });

  it("inserts blank between Agebon and morph in details", () => {
    const md = `### Translation practice

::: details Show answer
\`zazozon vehohel.\`
z-Azozon | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zazozon vehohel\.`\n\nz-Azozon \| v-sit/);
  });

  it("pads comparatives beginner block", () => {
    const md = readFileSync(grammarFile("comparatives.md"), "utf8");
    const start = md.indexOf("### Practice {#beginner-practice}");
    const end = md.indexOf("## Intermediate", start);
    const slice = md.slice(start, end);
    const out = padExerciseSpoilerBlanks(slice);
    assert.match(out, /`zahelan zazozon zoel guzezam\.`\n\n\[z-Ahelan/);
    assert.match(out, /\[z-Ahelan \| z-rank\/more \| g-agility\]\n\n\*Ahelan is the most agile\.\*/);
  });
});
