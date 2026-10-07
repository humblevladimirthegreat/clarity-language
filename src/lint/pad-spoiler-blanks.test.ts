import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { padExerciseSpoilerBlanks } from "./pad-exercise-spoiler-blanks.js";

describe("padExerciseSpoilerBlanks", () => {
  it("inserts blank between morph and loose English in details", () => {
    const md = `### Translation practice

**1.** \`zazawan vehahel.\`

::: details Show answer
z-Azawan | v-sit
*Azawan sits.*
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /z-Azawan \| v-sit\n\n\*Azawan sits\.\*/);
  });

  it("pads a converted Practice checkpoint", () => {
    const md = `### Practice

::: details Show answer
\`zazawan vehahel.\`
z-Azawan | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zazawan vehahel\.`\n\nz-Azawan \| v-sit/);
  });

  it("gives every spoiler line its own paragraph in a converted checkpoint", () => {
    const md = `### Practice

#### Pick one

**1.** *Azawan sees Alahen.* \`zazawan dalahen vahahal.\` or \`zalahen dazawan vahahal.\`

::: details Show answer
\`zazawan dalahen vahahal.\`
z-Azawan | d-Alahen | v-see
The one who sees takes **z-**.
:::
`;
    assert.match(padExerciseSpoilerBlanks(md), /vahahal\.`\n\nz-Azawan \| d-Alahen \| v-see\n\nThe one who sees takes \*\*z-\*\*\.\n:::/);
  });

  it("leaves legacy spoiler prose lines joined", () => {
    const md = `### Translation practice

::: details Show answer
*Azawan sits,*
*and waits.*
:::
`;
    assert.equal(padExerciseSpoilerBlanks(md), md);
  });

  it("inserts blank between Agazan and morph in details", () => {
    const md = `### Translation practice

::: details Show answer
\`zazawan vehahel.\`
z-Azawan | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zazawan vehahel\.`\n\nz-Azawan \| v-sit/);
  });

  it("pads comparatives beginner block", () => {
    const md = readFileSync("docs/grammar/comparatives.md", "utf8");
    const start = md.indexOf("### Practice {#beginner-practice}");
    const end = md.indexOf("## Intermediate", start);
    const slice = md.slice(start, end);
    const out = padExerciseSpoilerBlanks(slice);
    assert.match(out, /`zahaben zazawan zeol gezehom\.`\n\n\[z-Ahaben/);
    assert.match(out, /\[z-Ahaben \| z-rank\/more \| g-agility\]\n\n\*Ahaben is the most agile\.\*/);
  });
});
