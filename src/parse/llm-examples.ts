/**
 * Inputs to the translation prompt (llm-prompt.ts) that come from the docs: every grammar-page
 * example block with free English, the closed-label glosses from terminology.md, and the
 * construction `reader` notes. The example index parses about a thousand sentences, so it is
 * cached next to the parse CLI bundle and rebuilt when docs/grammar, src, or data change.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type { ClassifyTables } from "./classify.js";
import { constructionRegistry } from "./constructions.js";
import { glossLabels, type ExamplePair, type PromptContext } from "./llm-prompt.js";
import { morphGlossLine } from "./morph-gloss.js";
import { parseWithTables } from "./parse-core.js";
import { REPO_ROOT } from "../repo-paths.js";

/** One example block: its Agazan lines joined, and its one free English line. */
export type DocExample = { agazan: string; free: string; line: number };

/** Agazan in a backtick span, or in `<code>` with entities. */
function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`$/);
  if (m) return m[1]!;
  const html = text.match(/^<code>([^<]+)<\/code>$/);
  return html ? html[1]!.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : null;
}

/**
 * Example blocks with exactly one free English line: one or more Agazan lines first (a dialogue
 * block has several), then a morph line or not, then the quoted English. Spoken (🔊) lines are skipped.
 */
export function docExamples(markdown: string): DocExample[] {
  const out: DocExample[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!/^[ \t]*>/.test(lines[i]!)) {
      i += 1;
      continue;
    }
    const start = i;
    const block: string[] = [];
    while (i < lines.length && /^[ \t]*>/.test(lines[i]!)) {
      block.push(lines[i]!.replace(/^[ \t]*>[ \t]?/, "").trim());
      i += 1;
    }
    const rows = block.filter((row) => row && !row.startsWith("🔊"));
    const agazan: string[] = [];
    for (const row of rows) {
      const code = unwrapCode(row);
      if (code == null) break;
      agazan.push(code);
    }
    if (agazan.length === 0) continue;
    const free = rows.filter((row) => row.startsWith('"'));
    if (free.length !== 1) continue;
    out.push({ agazan: agazan.join(" "), free: free[0]!, line: start + 1 });
  }
  return out;
}

function balanced(text: string): boolean {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(") depth += 1;
    else if (ch === ")" && --depth < 0) return false;
  }
  return depth === 0;
}

/**
 * Split a free English line into its sentence and its note
 * ([glosses.md](../../docs/meta/glosses.md#free-english-sentence-and-note)): `"<sentence>" (<note>)`.
 * Returns null when the line has any other shape.
 */
export function splitFreeEnglish(line: string): { sentence: string; note: string | null } | null {
  const t = line.trim();
  if (!t.startsWith('"')) return null;
  const close = t.indexOf('"', 1);
  if (close < 0) return null;
  const sentence = t.slice(1, close).trim();
  const rest = t.slice(close + 1).trim();
  if (!sentence) return null;
  if (!rest) return { sentence, note: null };
  const m = /^\((.*)\)\.?$/.exec(rest);
  if (!m || !balanced(m[1]!) || !m[1]!.trim()) return null;
  return { sentence, note: m[1]!.trim() };
}

const stripEmphasis = (text: string) => text.replace(/\*+([^*]+)\*+/g, "$1");

/**
 * The example a prompt may show for one doc block, or null when the block does not fit the
 * convention yet: an unsplittable line, markup in the English, parentheses inside the quotes
 * beyond the aside spans, or a gloss that does not parse cleanly.
 */
export function examplePair(example: DocExample, source: string, tables: ClassifyTables): ExamplePair | null {
  const split = splitFreeEnglish(example.free);
  if (!split) return null;
  const { sentence, note } = split;
  if (/`|\]\(/.test(sentence + (note ?? ""))) return null;
  let gloss: string;
  let constructions: string[];
  try {
    gloss = morphGlossLine(example.agazan, tables, { strict: true });
    constructions = parseWithTables(example.agazan, tables, { constructions: true }).constructions ?? [];
  } catch {
    return null;
  }
  if (gloss.includes('←"')) return null;
  const asides = gloss.split("ASIDE[").length - 1;
  if (sentence.split("(").length - 1 > asides) return null;
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

/** Every usable example on the top-level grammar pages, one per distinct gloss. */
export function buildExampleIndex(grammarDir: string, tables: ClassifyTables): ExamplePair[] {
  const seen = new Set<string>();
  const out: ExamplePair[] = [];
  for (const page of grammarPages(grammarDir)) {
    const markdown = readFileSync(join(grammarDir, page), "utf8");
    for (const example of docExamples(markdown)) {
      const pair = examplePair(example, `${page}:${example.line}`, tables);
      if (!pair || seen.has(pair.gloss)) continue;
      seen.add(pair.gloss);
      out.push(pair);
    }
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
