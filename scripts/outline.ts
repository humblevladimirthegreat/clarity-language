/**
 * Print a Markdown file's headings in document order, each with its line
 * range and a rough token count, so a reader can pick the ranges to read
 * instead of opening the whole file.
 *
 * Run: npm run outline -- docs/grammar/beginner/clause.md
 *      npm run outline -- --depth 2 AGENTS.md docs/meta/doc-style.md
 */
import { readFileSync } from "node:fs";

type Section = { level: number; title: string; start: number; end: number; tokens: number };

function outline(text: string, maxDepth: number): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1]!;
      else if (fenceMatch[1] === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const heading = /^(#{1,6})\s+(.*?)\s*(\{#[^}]*\})?\s*$/.exec(line);
    if (!heading) continue;
    const level = heading[1]!.length;
    if (level > maxDepth) continue;
    sections.push({ level, title: heading[2]!, start: i + 1, end: lines.length, tokens: 0 });
  }
  for (let k = 0; k < sections.length; k++) {
    const next = sections.slice(k + 1).find((s) => s.level <= sections[k]!.level);
    sections[k]!.end = next ? next.start - 1 : lines.length;
    const body = lines.slice(sections[k]!.start - 1, sections[k]!.end).join("\n");
    sections[k]!.tokens = Math.round(body.length / 4);
  }
  return sections;
}

function main(): void {
  const args = process.argv.slice(2);
  let depth = 6;
  const files: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--depth") depth = Number(args[++i]);
    else files.push(args[i]!);
  }
  if (files.length === 0 || !Number.isInteger(depth) || depth < 1) {
    console.error("Usage: npm run outline -- [--depth N] FILE.md [FILE.md …]");
    process.exit(1);
  }
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const total = text.split("\n").length;
    console.log(`${file}: ${total} lines, ~${Math.round(text.length / 4)} tokens`);
    const sections = outline(text, depth);
    if (sections.length > 0 && sections[0]!.start > 1) {
      const head = text.split("\n").slice(0, sections[0]!.start - 1).join("\n");
      console.log(`  1-${sections[0]!.start - 1}  ~${Math.round(head.length / 4)}t  (before first heading)`);
    }
    for (const s of sections) {
      const indent = "  ".repeat(s.level);
      console.log(`${indent}${s.start}-${s.end}  ~${s.tokens}t  ${"#".repeat(s.level)} ${s.title}`);
    }
  }
}

main();
