import fs from "node:fs";
import path from "node:path";
import { padExerciseSpoilerBlanks } from "../src/lint/pad-exercise-spoiler-blanks.ts";

const GRAMMAR_DIR = path.join(process.cwd(), "docs", "grammar");
const PRACTICE_H3_RE = /^### Translation practice\b/m;

let changedFiles = 0;
for (const name of fs.readdirSync(GRAMMAR_DIR)) {
  if (!name.endsWith(".md")) continue;
  const filePath = path.join(GRAMMAR_DIR, name);
  const before = fs.readFileSync(filePath, "utf8");
  if (!PRACTICE_H3_RE.test(before)) continue;
  const after = padExerciseSpoilerBlanks(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
    changedFiles += 1;
  }
}
if (changedFiles > 0) {
  console.log(`pad-exercise-spoiler-blanks: updated ${changedFiles} file(s)`);
}
