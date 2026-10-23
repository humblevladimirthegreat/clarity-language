import fs from "node:fs";
import path from "node:path";
import { padExerciseSpoilerBlanks } from "../src/lint/pad-exercise-spoiler-blanks.ts";
import { PRACTICE_H3_RE } from "../src/lint/practice-sections.ts";
import { listMarkdown } from "../src/markdown-files.ts";

const GRAMMAR_DIR = path.join(process.cwd(), "docs", "grammar");

let changedFiles = 0;
for (const filePath of listMarkdown(GRAMMAR_DIR)) {
  const before = fs.readFileSync(filePath, "utf8");
  if (!before.split(/\r?\n/).some((line) => PRACTICE_H3_RE.test(line))) continue;
  const after = padExerciseSpoilerBlanks(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
    changedFiles += 1;
  }
}
if (changedFiles > 0) {
  console.log(`pad-exercise-spoiler-blanks: updated ${changedFiles} file(s)`);
}
