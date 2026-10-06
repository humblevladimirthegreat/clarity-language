// Keep the Claritish cheat sheet in step with the lessons: every drop-in in a
// lesson table appears on the sheet, and every drop-in on the sheet comes from a
// lesson (verbatim, or with its -l / -m / -r ending swapped).
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/grammar/claritish");
const SHEET = "cheat-sheet.md";
const NOT_LESSONS = new Set(["index.md", "learn-agazan.md", SHEET]);

function spans(text: string): string[] {
  return [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!);
}

function tableSpans(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .flatMap(spans);
}

const lessons = readdirSync(dir).filter((f) => f.endsWith(".md") && !NOT_LESSONS.has(f));
const sheetSpans = new Set(spans(readFileSync(join(dir, SHEET), "utf8")));

const lessonSpans = new Set<string>();
const problems: string[] = [];
for (const file of lessons) {
  const text = readFileSync(join(dir, file), "utf8");
  for (const span of spans(text)) lessonSpans.add(span);
  for (const span of tableSpans(text)) {
    if (!sheetSpans.has(span)) problems.push(`${file}: \`${span}\` is not on the cheat sheet`);
  }
}

const swapEnding = (span: string) =>
  /[lmr]$/.test(span) ? ["l", "m", "r"].map((e) => span.slice(0, -1) + e) : [span];

for (const span of sheetSpans) {
  if (!swapEnding(span).some((s) => lessonSpans.has(s))) {
    problems.push(`${SHEET}: \`${span}\` is not taught by any lesson`);
  }
}

if (problems.length) {
  console.error(`Claritish cheat sheet is out of step with the lessons (${problems.length}):`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log(`OK: cheat sheet matches ${lessons.length} Claritish lessons.`);
}
