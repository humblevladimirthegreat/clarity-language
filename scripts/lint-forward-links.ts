// Fails on any link in a stage page that points at material the learner meets later on the
// reading path: all Beginner bands in sidebar order, then Intermediate, then Advanced, and
// earlier lines first within a page ("Teach now; don't preview later" in grammar-docs.md).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readingOrder } from "../docs/grammar/.vitepress/lib/reading-order.js";

const grammarDir = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/grammar");
// Orientation pages tour the whole language, so they are not stages.
const orientation = new Set(["", "introduction"]);
const stages = readingOrder
  .map((item) => item.link.replace(/^\//, ""))
  .filter((page) => !orientation.has(page));

const levelRank: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const slug = (heading: string) =>
  heading
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");

type Page = { lines: string[]; level: (string | undefined)[]; anchors: Map<string, number> };

const pages = new Map<string, Page>();
for (const name of stages) {
  const lines = readFileSync(resolve(grammarDir, `${name}.md`), "utf8").split("\n");
  const level: (string | undefined)[] = [];
  const anchors = new Map<string, number>();
  let current: string | undefined;
  lines.forEach((line, i) => {
    const band = line.match(/^## (Beginner|Intermediate|Advanced)\b/);
    if (band) current = band[1]!.toLowerCase();
    level[i] = current;
    const heading = line.match(/^#{1,6} (.*?)(?:\s*\{#([^}]+)\})?\s*$/);
    if (heading) {
      if (heading[2]) anchors.set(heading[2], i);
      if (!anchors.has(slug(heading[1]!))) anchors.set(slug(heading[1]!), i);
    }
    for (const m of line.matchAll(/<a id="([^"]+)"/g)) anchors.set(m[1]!, i);
  });
  pages.set(name, { lines, level, anchors });
}

const position = (name: string, line: number): [number, number, number] => [
  levelRank[pages.get(name)!.level[line] ?? "beginner"]!,
  stages.indexOf(name),
  line,
];
const isAfter = (a: number[], b: number[]) => (a[0]! - b[0]! || a[1]! - b[1]! || a[2]! - b[2]!) > 0;

const problems: string[] = [];
for (const name of stages) {
  const { lines } = pages.get(name)!;
  let fenced = false;
  lines.forEach((line, i) => {
    if (/^```/.test(line)) fenced = !fenced;
    if (fenced) return;
    for (const m of line.matchAll(/\]\(([^)\s]*)\)/g)) {
      const [file = "", anchor] = m[1]!.split("#");
      if (/^[a-z]+:/.test(file)) continue;
      const target = file ? file.replace(/^\.\//, "").replace(/\.md$/, "") : name;
      const targetPage = pages.get(target);
      if (!targetPage) continue;
      let targetLine = 0;
      if (anchor) {
        const found = targetPage.anchors.get(anchor);
        if (found === undefined) {
          problems.push(`${name}.md:${i + 1}: no anchor #${anchor} in ${target}.md`);
          continue;
        }
        targetLine = found;
      }
      if (isAfter(position(target, targetLine), position(name, i))) {
        problems.push(`${name}.md:${i + 1}: forward link to ${target}.md${anchor ? `#${anchor}` : ""}`);
      }
    }
  });
}

if (problems.length) {
  console.error(`Forward links in stage pages (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log("OK: no forward links in stage pages.");
}
