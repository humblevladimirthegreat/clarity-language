// Fails on any link in a stage page that points at material the learner meets later on the
// reading path: the Beginner sidebar group, then Intermediate, then Advanced, and earlier
// lines first within a page ("Teach now; don't preview later" in grammar-docs.md).
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isLevelReview, lessonPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { pageSections, sectionAt, type Band, type PageSections } from "../src/lint/learning-order.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const grammarDir = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/grammar");
const orientation = new Set(["index.md", "introduction.md"]);
const stages = lessonPages()
  .map((item) => item.page)
  .filter((page) => !orientation.has(page) && !isLevelReview(page));

const levelRank: Record<Band, number> = { beginner: 0, intermediate: 1, advanced: 2 };

type Page = { markdown: string; sections: PageSections };

const pages = new Map<string, Page>();
for (const name of stages) {
  const markdown = readFileSync(resolve(grammarDir, name), "utf8");
  pages.set(name, { markdown, sections: pageSections(name, markdown) });
}

const position = (name: string, sectionBand: Band | undefined, offset: number): [number, number, number] => [
  levelRank[sectionBand ?? "beginner"],
  stages.indexOf(name),
  offset,
];
const isAfter = (a: number[], b: number[]) => (a[0]! - b[0]! || a[1]! - b[1]! || a[2]! - b[2]!) > 0;

function targetPage(href: string, current: string): string | undefined {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return;
  const path = href.replace(/^\.\//, "").replace(/^\//, "");
  if (path.includes("/")) return;
  const stem = path.replace(/\.(?:md|html)$/, "");
  return `${stem || current.replace(/\.md$/, "")}.md`;
}

const problems: string[] = [];
for (const name of stages) {
  const { markdown, sections } = pages.get(name)!;
  const blanked = markdown
    .replace(/^\s*```[\s\S]*?^\s*```/gm, (m) => " ".repeat(m.length))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
  for (const m of blanked.matchAll(/\]\(([^)\s]*)\)/g)) {
    const [file = "", anchor] = m[1]!.split("#");
    const target = targetPage(file, name);
    if (!target) continue;
    const targetParsed = pages.get(target);
    if (!targetParsed) continue;
    const from = sectionAt(sections.sections, m.index!);
    if (from.ignored) continue;
    let targetSection = targetParsed.sections.sections[0]!;
    if (anchor) {
      const found = targetParsed.sections.anchors.get(anchor);
      if (found === undefined) {
        problems.push(`${name}:${lineNumberAt(markdown, m.index!)}: no anchor #${anchor} in ${target}`);
        continue;
      }
      targetSection = found;
    }
    if (isAfter(position(target, targetSection.band, targetSection.offset), position(name, from.band, from.offset))) {
      problems.push(`${name}:${lineNumberAt(markdown, m.index!)}: forward link to ${target}${anchor ? `#${anchor}` : ""}`);
    }
  }
}

if (problems.length) {
  console.error(`Forward links in stage pages (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exitCode = 1;
} else {
  console.log("OK: no forward links in stage pages.");
}
