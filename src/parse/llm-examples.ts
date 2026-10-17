/**
 * Inputs to the translation prompt (llm-prompt.ts) that come from the docs: every grammar-page
 * example block with free English, the closed-label glosses from terminology.md, and the
 * construction `reader` notes. The example index parses about a thousand sentences, so it is
 * cached next to the parse CLI bundle and rebuilt when docs/grammar, src, or data change.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { exampleBlocks, extraParens, splitFreeEnglish, tableEnglish } from "../lint/free-english.js";
import { fillSelf } from "../learner-name.js";
import type { ClassifyTables } from "./classify.js";
import { constructionRegistry } from "./constructions.js";
import { glossLabels, type ExamplePair, type PromptContext } from "./llm-prompt.js";
import { morphGlossLine } from "./morph-gloss.js";
import { parseWithTables } from "./parse-core.js";
import { REPO_ROOT } from "../repo-paths.js";

/**
 * One example: an example block's Agazan lines joined and its one free English line, or a table
 * row's Agazan and its italic English cell (`delimiter` `*`).
 */
export type DocExample = { agazan: string; free: string; line: number; delimiter?: "*" };

/** Example blocks with exactly one free English line ([free-english.ts](../lint/free-english.ts) reads the blocks). */
export function docExamples(markdown: string): DocExample[] {
  return exampleBlocks(markdown)
    .filter((block) => block.free.length === 1)
    .map((block) => ({ agazan: block.agazan, free: block.free[0]!.text, line: block.line + 1 }));
}

/** Table rows that translate an Agazan phrase or sentence, one per English piece. */
export function tableExamples(markdown: string): DocExample[] {
  return tableEnglish(markdown).flatMap((cell) =>
    cell.agazan == null
      ? []
      : [{ agazan: cell.agazan, free: cell.text, line: markdown.slice(0, cell.index).split("\n").length, delimiter: "*" as const }],
  );
}

export { splitFreeEnglish };

const stripEmphasis = (text: string) => text.replace(/\*+([^*]+)\*+/g, "$1");

/**
 * The example a prompt may show for one doc block, or null when the block does not fit the
 * convention yet: an unsplittable line, markup in the English, parentheses inside the quotes
 * beyond the aside spans, or a gloss that does not parse cleanly. A `SELF` slot is the speaker.
 */
export function examplePair(example: DocExample, source: string, tables: ClassifyTables): ExamplePair | null {
  const split = splitFreeEnglish(example.free, example.delimiter);
  if (!split) return null;
  const { sentence, note } = split;
  if (/`|\]\(/.test(sentence + (note ?? ""))) return null;
  const agazan = fillSelf(example.agazan);
  let gloss: string;
  let constructions: string[];
  try {
    gloss = morphGlossLine(agazan, tables, { strict: true });
    constructions = parseWithTables(agazan, tables, { constructions: true }).constructions ?? [];
  } catch {
    return null;
  }
  if (gloss.includes('←"')) return null;
  if (extraParens(split.parts.join(" "), gloss) > 0) return null;
  return {
    gloss,
    sentence: stripEmphasis(sentence),
    note: note == null ? null : stripEmphasis(note),
    constructions,
    labels: glossLabels(gloss),
    source,
  };
}

function grammarPages(dir: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

/** Every usable example on the top-level grammar pages, one per distinct gloss; a block wins over a table row. */
export function buildExampleIndex(grammarDir: string, tables: ClassifyTables): ExamplePair[] {
  const seen = new Set<string>();
  const out: ExamplePair[] = [];
  const pages = grammarPages(grammarDir).map((page) => ({ page, markdown: readFileSync(join(grammarDir, page), "utf8") }));
  const examples = [
    ...pages.flatMap(({ page, markdown }) => docExamples(markdown).map((example) => ({ page, example }))),
    ...pages.flatMap(({ page, markdown }) => tableExamples(markdown).map((example) => ({ page, example }))),
  ];
  for (const { page, example } of examples) {
    const pair = examplePair(example, `${page}:${example.line}`, tables);
    if (!pair || seen.has(pair.gloss)) continue;
    seen.add(pair.gloss);
    out.push(pair);
  }
  return out;
}

/** SMALLCAPS label → Gloss cell of the terminology.md closed-label table, as plain text. */
export function terminologyLabelGlosses(markdown: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of markdown.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    const label = /^\*\*([A-Z][A-Z-]*)\*\*$/.exec(cells[0] ?? "")?.[1];
    if (label && cells.length === 4) out.set(label, cells[1]!.replace(/\*/g, ""));
  }
  return out;
}

/** Construction ID → reader note, for every construction that has one. */
export function constructionReaders(tables: ClassifyTables): Map<string, string> {
  const out = new Map<string, string>();
  for (const [id, entry] of constructionRegistry(tables.overlays.values())) {
    if (entry.reader) out.set(id, entry.reader);
  }
  return out;
}

function newestMtime(path: string): number {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;
  let newest = stat.mtimeMs;
  for (const entry of readdirSync(path)) newest = Math.max(newest, newestMtime(join(path, entry)));
  return newest;
}

const CACHE = join(REPO_ROOT, "dist", "parse", "llm-examples.json");
const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");

/** The prompt's doc inputs, from the cache when it is newer than the docs, src, and data. */
export function loadPromptContext(tables: ClassifyTables): PromptContext {
  const sources = [
    ...grammarPages(GRAMMAR_DIR).map((page) => join(GRAMMAR_DIR, page)),
    join(REPO_ROOT, "src"),
    join(REPO_ROOT, "data"),
  ];
  const fresh = existsSync(CACHE) && statSync(CACHE).mtimeMs >= Math.max(...sources.map(newestMtime));
  let index: ExamplePair[];
  if (fresh) {
    index = JSON.parse(readFileSync(CACHE, "utf8")) as ExamplePair[];
  } else {
    index = buildExampleIndex(GRAMMAR_DIR, tables);
    mkdirSync(dirname(CACHE), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(index));
  }
  return {
    index,
    labelGlosses: terminologyLabelGlosses(readFileSync(join(GRAMMAR_DIR, "terminology.md"), "utf8")),
    readers: constructionReaders(tables),
  };
}
