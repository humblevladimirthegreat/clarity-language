/**
 * Files find can rewrite: Markdown spans, source string literals, and TSV cells.
 * Same skip set as retie for `src/retie/` (its fixtures keep their own maps).
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { classify, type ClassifyTables } from "../parse/classify.js";
import { peelWordChunk } from "../parse/peel.js";
import { parseWord } from "../parse/word.js";
import { REPO_ROOT } from "../repo-paths.js";
import { sourceLiterals, vueLiterals } from "../retie/source.js";
import {
  collectBodySpan,
  collectPageSpans,
  type Example,
  type PageSpans,
  type UnparsedSpan,
} from "./examples.js";
import { matchesTerm, type Term } from "./query.js";
import { spliceWord, type FieldMaps } from "./rewrite.js";

const SOURCE_FILE = /\.(?:ts|mts|mjs|vue)$/;
const SKIP_DIR_NAMES = new Set(["node_modules", "cache", "dist"]);
/** Path prefixes under the repo that a directory walk never enters. */
const SKIP_WALK_PREFIXES = ["src/retie", "src/generated", "src/find/fixtures"];

export type FindQuery =
  | { kind: "word"; term: Term }
  | { kind: "seq"; terms: Term[] }
  | { kind: "construction"; test: (id: string) => boolean };

function posixRel(file: string): string {
  return relative(REPO_ROOT, file).split(sep).join("/");
}

function skippedWalkPath(file: string): boolean {
  const rel = posixRel(file);
  return SKIP_WALK_PREFIXES.some((prefix) => rel === prefix || rel.startsWith(`${prefix}/`));
}

/** Markdown, TypeScript/Vue, and TSV under `path`. A file path is returned as is. */
export function listFindFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  const out: string[] = [];
  for (const name of readdirSync(path)) {
    if (name.startsWith(".") || SKIP_DIR_NAMES.has(name)) continue;
    const full = join(path, name);
    if (skippedWalkPath(full)) continue;
    if (statSync(full).isDirectory()) {
      out.push(...listFindFiles(full));
    } else if (name.endsWith(".md") || name.endsWith(".tsv") || SOURCE_FILE.test(name)) {
      if (!name.endsWith(".d.ts")) out.push(full);
    }
  }
  return out.sort();
}

function isExample(span: Example | UnparsedSpan): span is Example {
  return "words" in span;
}

function collectLiteralSpans(source: string, fileName: string, tables: ClassifyTables): PageSpans {
  const examples: Example[] = [];
  const unparsed: UnparsedSpan[] = [];
  const literals = fileName.endsWith(".vue") ? vueLiterals(source) : sourceLiterals(source, fileName);
  for (const literal of literals) {
    if (literal.escaped || literal.regex) continue;
    const span = collectBodySpan(literal.body, literal.index, tables);
    if (isExample(span)) examples.push(span);
    else unparsed.push(span);
  }
  return { examples, unparsed };
}

function collectTsvSpans(text: string, tables: ClassifyTables): PageSpans {
  const examples: Example[] = [];
  const unparsed: UnparsedSpan[] = [];
  let offset = 0;
  for (const line of text.split("\n")) {
    let colAt = offset;
    for (const cell of line.split("\t")) {
      if (cell && !cell.startsWith("#")) {
        const span = collectBodySpan(cell, colAt, tables);
        if (isExample(span)) examples.push(span);
        else unparsed.push(span);
      }
      colAt += cell.length + 1;
    }
    offset += line.length + 1;
  }
  return { examples, unparsed };
}

/** Parsed Agebon bodies in a Markdown page, a source file, or a TSV. */
export function collectFileSpans(file: string, text: string, tables: ClassifyTables): PageSpans {
  if (file.endsWith(".md")) return collectPageSpans(text, tables);
  if (file.endsWith(".tsv")) return collectTsvSpans(text, tables);
  if (SOURCE_FILE.test(file)) return collectLiteralSpans(text, file, tables);
  return { examples: [], unparsed: [] };
}

function chunkMightHit(core: string, queries: FindQuery[], maps: FieldMaps | undefined, tables: ClassifyTables): boolean {
  try {
    const word = classify(parseWord(core), tables);
    const item = { word, unit: "", position: 0 };
    for (const query of queries) {
      if (query.kind === "word" && matchesTerm(item, query.term)) return true;
    }
    if (maps && spliceWord(word, maps).kind === "changed") return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * Whether an unparsed span is worth listing: some chunk parses as a word the
 * query or map would have rewritten. Lone letters and English stay quiet.
 */
export function skipWorthListing(
  span: UnparsedSpan,
  queries: FindQuery[],
  maps: FieldMaps | undefined,
  tables: ClassifyTables,
): boolean {
  if (!maps) return false;
  for (const chunk of span.text.split(/\s+/)) {
    const { core } = peelWordChunk(chunk);
    if (core && chunkMightHit(core, queries, maps, tables)) return true;
  }
  return false;
}
