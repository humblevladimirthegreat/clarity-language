import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { padExerciseSpoilerBlanks } from "./pad-exercise-spoiler-blanks.js";

describe("padExerciseSpoilerBlanks", () => {
  it("inserts blank between morph and loose English in details", () => {
    const md = `### Translation practice

**1.** \`zuzazon vehuhol.\`

::: details Show answer
z-Uzazon | v-sit
*Uzazon sits.*
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /z-Uzazon \| v-sit\n\n\*Uzazon sits\.\*/);
  });

  it("pads a converted Practice checkpoint", () => {
    const md = `### Practice

::: details Show answer
\`zuzazon vehuhol.\`
z-Uzazon | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zuzazon vehuhol\.`\n\nz-Uzazon \| v-sit/);
  });

  it("gives every spoiler line its own paragraph in a converted checkpoint", () => {
    const md = `### Practice

#### Pick one

**1.** *Uzazon sees Olozun.* \`zuzazon dolozun vanobol.\` or \`zolozun duzazon vanobol.\`

::: details Show answer
\`zuzazon dolozun vanobol.\`
z-Uzazon | d-Olozun | v-see
The one who sees takes **z-**.
:::
`;
    assert.match(padExerciseSpoilerBlanks(md), /vanobol\.`\n\nz-Uzazon \| d-Olozun \| v-see\n\nThe one who sees takes \*\*z-\*\*\.\n:::/);
  });

  it("leaves legacy spoiler prose lines joined", () => {
    const md = `### Translation practice

::: details Show answer
*Uzazon sits,*
*and waits.*
:::
`;
    assert.equal(padExerciseSpoilerBlanks(md), md);
  });

  it("inserts blank between Egabon and morph in details", () => {
    const md = `### Translation practice

::: details Show answer
\`zuzazon vehuhol.\`
z-Uzazon | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zuzazon vehuhol\.`\n\nz-Uzazon \| v-sit/);
  });

  it("pads comparatives beginner block", () => {
    const md = readFileSync("docs/grammar/comparatives.md", "utf8");
    const start = md.indexOf("### Practice {#beginner-practice}");
    const end = md.indexOf("## Intermediate", start);
    const slice = md.slice(start, end);
    const out = padExerciseSpoilerBlanks(slice);
    assert.match(out, /`zehalon zuzazon zoel gazuzom\.`\n\n\[z-Ehalon/);
    assert.match(out, /\[z-Ehalon \| z-rank\/more \| g-agility\]\n\n\*Ehalon is the most agile\.\*/);
  });
});
