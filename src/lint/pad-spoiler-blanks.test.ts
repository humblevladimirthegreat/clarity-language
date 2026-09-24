import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { padExerciseSpoilerBlanks } from "./pad-exercise-spoiler-blanks.js";

describe("padExerciseSpoilerBlanks", () => {
  it("inserts blank between morph and loose English in details", () => {
    const md = `### Translation practice

**1.** \`zazawan vajul.\`

::: details Show answer
z-Azawan | v-sit
*Azawan sits.*
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /z-Azawan \| v-sit\n\n\*Azawan sits\.\*/);
  });

  it("inserts blank between Agalan and morph in details", () => {
    const md = `### Translation practice

::: details Show answer
\`zazawan vajul.\`
z-Azawan | v-sit
:::
`;
    const out = padExerciseSpoilerBlanks(md);
    assert.match(out, /`zazawan vajul\.`\n\nz-Azawan \| v-sit/);
  });

  it("pads comparatives beginner block", () => {
    const md = readFileSync("docs/grammar/comparatives.md", "utf8");
    const start = md.indexOf("### Translation practice");
    const end = md.indexOf("## Intermediate", start);
    const slice = md.slice(start, end);
    const out = padExerciseSpoilerBlanks(slice);
    assert.match(out, /`zuhubun zazawan zael ganalam\.`\n\n\[z-Uhubun/);
    assert.match(out, /\[z-Uhubun \| z-rank\/more \| g-agility\]\n\n\*Uhubun is the most agile\.\*/);
  });
});
