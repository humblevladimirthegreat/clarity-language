#!/usr/bin/env tsx
/**
 * Review lists for the free English pass ([llm-gloss-prompt.md](../docs/proposals/llm-gloss-prompt.md),
 * phase 1 step 3): one JSON per top-level grammar page listing every free English line with its
 * section, Ageben, parser morph, and lint findings, so a page review cannot skip an example.
 * Output goes to `tmp/free-english-review/` (gitignored), plus an `index.json` of counts per page.
 *
 * Run: npm run free-english-review
 *      npm run free-english-review -- [docs/grammar/<page>.md ...]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

import { extractFreeEnglish, lintFreeEnglish, type FreeEnglishFinding } from "../src/lint/free-english.js";
import { pageSections, sectionAt } from "../src/lint/learning-order.js";
import { fillSelf } from "../src/learner-name.js";
import { listMarkdown } from "../src/markdown-files.js";
import { loadDefaultTables } from "../src/parse/index.js";
import { morphGlossLine } from "../src/parse/morph-gloss.js";
import { REPO_ROOT } from "../src/repo-paths.js";
import { lineNumberAt } from "../src/retie/tokens.js";

const grammarDir = join(REPO_ROOT, "docs", "grammar");
const outDir = join(REPO_ROOT, "tmp", "free-english-review");

const args = process.argv.slice(2);
const sittingDir = (file: string) => {
  const dir = dirname(relative(grammarDir, file)).replaceAll("\\", "/");
  return dir === "." || dir === "beginner" || dir === "intermediate" || dir === "advanced";
};
const files = (args.length === 0 ? listMarkdown(grammarDir) : args.flatMap((arg) => listMarkdown(resolve(arg)))).filter(
  sittingDir,
);
const tables = loadDefaultTables();
mkdirSync(outDir, { recursive: true });

type PageCount = { page: string; items: number; notes: number; withFindings: number; parseErrors: number };
const index: PageCount[] = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  // `SELF` slots are parsed as the unset default; filling changes no newlines, so line numbers agree.
  const filled = fillSelf(source);
  const raw = extractFreeEnglish(source);
  const parsed = extractFreeEnglish(filled);
  if (raw.length === 0) continue;
  if (raw.length !== parsed.length) throw new Error(`${file}: SELF filling changed the free English line count`);

  const page = basename(file, ".md");
  const sections = pageSections(basename(file), source).sections;
  const findingsByLine = new Map<number, Pick<FreeEnglishFinding, "kind" | "detail">[]>();
  for (const { index: at, kind, detail } of lintFreeEnglish(filled, tables)) {
    const line = lineNumberAt(filled, at);
    findingsByLine.set(line, [...(findingsByLine.get(line) ?? []), { kind, detail }]);
  }

  const count: PageCount = { page, items: raw.length, notes: 0, withFindings: 0, parseErrors: 0 };
  const items = raw.map((free, i) => {
    const line = lineNumberAt(source, free.index);
    const section = sectionAt(sections, free.index);
    const ageben = parsed[i]!.ageben;
    let parserMorph: string | null = null;
    let parseError: string | undefined;
    if (ageben != null) {
      try {
        parserMorph = morphGlossLine(ageben, tables, { strict: true });
      } catch (err) {
        parseError = err instanceof Error ? err.message : String(err);
        count.parseErrors += 1;
      }
    }
    const findings = findingsByLine.get(line) ?? [];
    if (free.split?.note) count.notes += 1;
    if (findings.length > 0) count.withFindings += 1;
    return {
      id: i + 1,
      line,
      kind: free.kind,
      section: { title: section.title, slug: section.slug, band: section.band ?? null },
      ageben: free.ageben,
      docMorph: free.morph,
      parserMorph,
      ...(parseError ? { parseError } : {}),
      english: free.text,
      sentence: free.split?.sentence ?? null,
      note: free.split?.note ?? null,
      findings,
    };
  });

  writeFileSync(join(outDir, `${page}.json`), `${JSON.stringify({ page: relative(REPO_ROOT, file), items }, null, 2)}\n`);
  index.push(count);
  console.log(
    `${page.padEnd(24)} ${String(count.items).padStart(4)} lines  ${String(count.notes).padStart(3)} notes  ${String(count.withFindings).padStart(3)} with findings${count.parseErrors ? `  ${count.parseErrors} parse errors` : ""}`,
  );
}

writeFileSync(join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
const total = (key: keyof Omit<PageCount, "page">) => index.reduce((sum, c) => sum + c[key], 0);
console.log(
  `\n${index.length} pages, ${total("items")} lines, ${total("notes")} notes, ${total("withFindings")} with findings, ${total("parseErrors")} parse errors → ${relative(REPO_ROOT, outDir)}/`,
);
