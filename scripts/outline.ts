/**
 * Print a file's outline in document order, each entry with its line range
 * and a rough token count, so a reader can pick the ranges to read instead of
 * opening the whole file.
 *
 * Markdown: the headings. TypeScript / JavaScript (.ts .tsx .mts .js .mjs):
 * the top-level functions, classes, interfaces, types, enums and consts, each
 * class's members indented under it, and `// ── Title ──` banner comments as
 * section lines. A range starts at the declaration's doc comment, so ranges do
 * not overlap. Three or more short entries in a row (two lines or fewer, such
 * as one-line parser rules) print as one line naming the first and last.
 * A directory: its Markdown and code files, largest first.
 *
 * Options: --depth N     Markdown heading depth; on code, 1 hides class members
 *          --min-tokens N  hide declarations and runs smaller than N tokens
 *          --no-collapse   print every short entry on its own line
 *          --top N         directory listing length (default 25)
 *          --summaries     Markdown: each heading's agent summary, indented under it
 *                          (docs/meta/grammar-docs.md#agent-summaries)
 *          --exports       code map: for a code file, or each code file under a directory
 *                          (tests only with --tests), the first sentence of its header
 *                          comment, then one line per export: kind, name, line range and
 *                          the first sentence of its doc comment (`—` if none)
 *
 * Run: npm run outline -- docs/grammar/beginner/clause.md
 *      npm run outline -- --depth 2 AGENTS.md docs/meta/doc-style.md
 *      npm run outline -- docs/grammar/beginner/clause.md --summaries
 *      npm run outline -- src/interpret/read.ts
 *      npm run outline -- --min-tokens 200 src/interpret/translate.ts
 *      npm run outline -- src/parse
 *      npm run outline -- src/realize --exports
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { clip } from "./lib/build-output.ts";
import { BANNER } from "./lib/deps.ts";
import { headingSummaries } from "../src/lint/agent-summaries.ts";

type Options = { depth: number; minTokens: number; collapse: boolean; top: number; summaries?: boolean; exports?: boolean; tests?: boolean };

const USAGE = "Usage: npm run outline -- [--depth N] [--min-tokens N] [--no-collapse] [--top N] [--summaries] [--exports [--tests]] FILE|DIR …";

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

const CODE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const OUTLINE_FILE = /\.(?:md|[cm]?[jt]s|[jt]sx)$/;
/** A run of this many short entries in a row prints as one line. */
const RUN_MIN = 3;
/** An entry this many lines long or shorter counts as short. */
const SHORT_LINES = 2;

const tokensOf = (s: string): number => Math.round(s.length / 4);

function isExported(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false);
}

/** One label per top-level declaration, e.g. `export function readText`. */
function describe(node: ts.Statement, sf: ts.SourceFile): string | null {
  const prefix = isExported(node) ? "export " : "";
  if (ts.isFunctionDeclaration(node)) return `${prefix}function ${node.name?.text ?? "default"}`;
  if (ts.isClassDeclaration(node)) return `${prefix}class ${node.name?.text ?? "default"}`;
  if (ts.isInterfaceDeclaration(node)) return `${prefix}interface ${node.name.text}`;
  if (ts.isTypeAliasDeclaration(node)) return `${prefix}type ${node.name.text}`;
  if (ts.isEnumDeclaration(node)) return `${prefix}enum ${node.name.text}`;
  if (ts.isModuleDeclaration(node)) return `${prefix}namespace ${node.name.getText(sf)}`;
  if (ts.isVariableStatement(node)) {
    const kind = node.declarationList.flags & ts.NodeFlags.Const ? "const" : "let";
    const names = node.declarationList.declarations.map((d) => d.name.getText(sf)).join(", ");
    return `${prefix}${kind} ${names}`;
  }
  if (ts.isExportAssignment(node)) return "export default";
  return null; // imports, re-exports, bare expressions
}

/** One label per class member, e.g. `method reading`, `static property byId`. */
function describeMember(member: ts.ClassElement, sf: ts.SourceFile): string | null {
  const mods = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
  const prefix = mods
    .filter((m) => m.kind === ts.SyntaxKind.StaticKeyword || m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)
    .map((m) => `${m.getText(sf)} `)
    .join("");
  const name = member.name?.getText(sf) ?? "";
  if (ts.isConstructorDeclaration(member)) return "constructor";
  if (ts.isMethodDeclaration(member)) return `${prefix}method ${name}`;
  if (ts.isPropertyDeclaration(member)) return `${prefix}property ${name}`;
  if (ts.isGetAccessorDeclaration(member)) return `${prefix}get ${name}`;
  if (ts.isSetAccessorDeclaration(member)) return `${prefix}set ${name}`;
  if (ts.isClassStaticBlockDeclaration(member)) return "static block";
  return null; // index signatures, stray semicolons
}

type Entry = { start: number; end: number; label: string; depth: number; banner: boolean; tokens: number };

/** Top-level declarations, class members under their class, and banner comments, in line order. */
function codeEntries(file: string, text: string, maxDepth: number): { entries: Entry[]; declarations: number } {
  const lines = text.split("\n");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const lineOf = (pos: number): number => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const entries: Entry[] = [];
  // getStart(sf, true) begins at the leading JSDoc, so the doc comment travels with its declaration.
  const push = (node: ts.Node, label: string, depth: number): void => {
    const start = node.getStart(sf, true);
    entries.push({ start: lineOf(start), end: lineOf(node.getEnd()), label, depth, banner: false, tokens: tokensOf(text.slice(start, node.getEnd())) });
  };
  const classes: { start: number; end: number }[] = [];
  let declarations = 0;
  for (const node of sf.statements) {
    const label = describe(node, sf);
    if (label === null) continue;
    declarations++;
    push(node, label, 1);
    if (!ts.isClassDeclaration(node)) continue;
    classes.push({ start: lineOf(node.getStart(sf)), end: lineOf(node.getEnd()) });
    if (maxDepth < 2) continue;
    for (const member of node.members) {
      const memberLabel = describeMember(member, sf);
      if (memberLabel !== null) push(member, memberLabel, 2);
    }
  }
  lines.forEach((line, i) => {
    const m = BANNER.exec(line);
    if (!m || !m[1]) return;
    const inClass = classes.some((c) => i + 1 > c.start && i + 1 < c.end);
    if (inClass && maxDepth < 2) return;
    entries.push({ start: i + 1, end: i + 1, label: m[1], depth: inClass ? 2 : 1, banner: true, tokens: 0 });
  });
  entries.sort((a, b) => a.start - b.start || Number(b.banner) - Number(a.banner) || a.depth - b.depth);
  return { entries, declarations };
}

/** Fold each run of RUN_MIN or more short entries at one depth, with nothing between them, into one entry. */
function collapseRuns(entries: Entry[]): Entry[] {
  const isShort = (e: Entry): boolean => !e.banner && e.label !== "constructor" && !e.label.includes("class ") && e.end - e.start < SHORT_LINES;
  const out: Entry[] = [];
  for (let i = 0; i < entries.length; ) {
    let j = i;
    while (j < entries.length && isShort(entries[j]!) && entries[j]!.depth === entries[i]!.depth) j++;
    if (j - i >= RUN_MIN) {
      const run = entries.slice(i, j);
      const name = (e: Entry): string => e.label.replace(/^export /, "");
      out.push({
        start: run[0]!.start,
        end: run[run.length - 1]!.end,
        label: `${run.length} short: ${name(run[0]!)} … ${name(run[run.length - 1]!)}`,
        depth: run[0]!.depth,
        banner: false,
        tokens: run.reduce((n, e) => n + e.tokens, 0),
      });
      i = j;
    } else {
      out.push(entries[i]!);
      i++;
    }
  }
  return out;
}

function outlineCode(file: string, text: string, opts: Options): void {
  const lines = text.split("\n");
  const { entries: raw, declarations } = codeEntries(file, text, opts.depth);
  const entries = (opts.collapse ? collapseRuns(raw) : raw).filter((e) => e.banner || e.tokens >= opts.minTokens);
  console.log(`${file}: ${lines.length} lines, ~${tokensOf(text)} tokens, ${declarations} top-level declarations`);
  const first = raw[0];
  if (first && first.start > 1) console.log(`  1-${first.start - 1}  ~${tokensOf(lines.slice(0, first.start - 1).join("\n"))}t  (imports and header)`);
  for (const e of entries) {
    const indent = "  ".repeat(e.depth);
    if (e.banner) console.log(`${indent}${e.start}  ── ${e.label}`);
    else console.log(`${indent}  ${e.start}-${e.end}  ~${e.tokens}t  ${e.label}`);
  }
}

/** Every Markdown and code file under a directory, largest first. */
function outlineDir(dir: string, opts: Options): void {
  const rows: { path: string; lines: number; tokens: number }[] = [];
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !OUTLINE_FILE.test(entry.name)) continue;
    const path = join(entry.parentPath, entry.name);
    if (/(?:^|\/)(?:node_modules|dist|\.[^/]+)\//.test(path)) continue;
    const text = readFileSync(path, "utf8");
    rows.push({ path, lines: text.split("\n").length, tokens: tokensOf(text) });
  }
  rows.sort((a, b) => b.lines - a.lines);
  const shown = rows.slice(0, opts.top);
  console.log(`${dir}: ${rows.length} files, ~${rows.reduce((n, r) => n + r.tokens, 0)} tokens${rows.length > shown.length ? `, largest ${shown.length} shown (--top N)` : ""}`);
  for (const r of shown) console.log(`  ${String(r.lines).padStart(6)}  ~${String(r.tokens).padStart(6)}t  ${r.path}`);
}

// ── Code map (--exports) ──

/** A comment's prose: the comment markers and each line's leading `*` dropped, the lines joined by spaces. */
function commentProse(comment: string): string {
  return comment
    .replace(/^\/\*\*?|\*\/$/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*(?:\/\/+|\*(?!\/))?\s?/, "").trim())
    .filter((line) => line !== "")
    .join(" ")
    .replace(/\{@link\s+([^}|\s]+)[^}]*\}/g, "$1")
    .replace(/ \((?:[\w./-]+\.md(?:#[\w-]+)?(?:, )?)+\)/g, ""); // a bare doc reference costs map tokens and names no job
}

/** The first sentence of a comment's prose: up to the first `.`, `!` or `?` before a space, `e.g.`, `i.e.` and `vs.` excepted. */
function firstSentence(comment: string): string {
  const prose = commentProse(comment);
  const end = /(?<!\b(?:e\.g|i\.e|vs))[.!?](?=\s|$)/.exec(prose);
  return end ? prose.slice(0, end.index + 1) : prose;
}

/** The doc comment directly above a node (a `/** … *\/` with no blank line between), or undefined. */
function docComment(node: ts.Node, text: string): string | undefined {
  const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [];
  const last = ranges[ranges.length - 1];
  if (!last || !text.startsWith("/**", last.pos)) return undefined;
  const gap = text.slice(last.end, node.getStart());
  return /^[ \t]*\r?\n?[ \t]*$/.test(gap) ? text.slice(last.pos, last.end) : undefined;
}

/** The file's header: its first comment, when a blank line or an import separates it from the code below. */
function headerComment(sf: ts.SourceFile, text: string): string | undefined {
  const first = (ts.getLeadingCommentRanges(text, 0) ?? [])[0] ?? (text.startsWith("#!") ? (ts.getLeadingCommentRanges(text, text.indexOf("\n") + 1) ?? [])[0] : undefined);
  if (!first) return undefined;
  const comment = text.slice(first.pos, first.end);
  const statement = sf.statements[0];
  if (statement && !ts.isImportDeclaration(statement) && docComment(statement, text) === comment) return undefined;
  return comment;
}

/** One map line per exported declaration (`export { … }` lists included): kind, name, line range, doc's first sentence. */
function exportLines(file: string, text: string): string[] {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const lineOf = (pos: number): number => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const header = headerComment(sf, text);
  const out = [clip(`${file} — ${header ? firstSentence(header) : "(no header comment)"}`)];
  for (const node of sf.statements) {
    let label: string | null = null;
    if (ts.isExportDeclaration(node)) label = `${node.isTypeOnly ? "type " : ""}re-export ${node.exportClause?.getText(sf).replace(/\s+/g, " ") ?? "*"}`;
    else if (isExported(node)) label = describe(node, sf)?.replace(/^export /, "") ?? null;
    if (label === null) continue;
    const doc = docComment(node, text);
    const range = `${lineOf(node.getStart(sf, true))}-${lineOf(node.getEnd())}`;
    out.push(clip(`  ${range} ${label} — ${doc ? firstSentence(doc) : "—"}`));
  }
  return out;
}

/** The code map of a file, or of every code file under a directory in path order (tests only with `tests`). */
function outlineExports(path: string, opts: Options): void {
  if (!statSync(path).isDirectory()) {
    for (const line of exportLines(path, readFileSync(path, "utf8"))) console.log(line);
    return;
  }
  const files = readdirSync(path, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && CODE_FILE.test(e.name) && !e.name.endsWith(".d.ts") && (opts.tests || !/\.test\.[cm]?[jt]sx?$/.test(e.name)))
    .map((e) => join(e.parentPath, e.name))
    .filter((p) => !/(?:^|\/)(?:node_modules|dist|\.[^/]+)\//.test(p))
    .sort();
  for (const file of files) for (const line of exportLines(file, readFileSync(file, "utf8"))) console.log(line);
}

function main(): void {
  const args = process.argv.slice(2);
  const opts: Options = { depth: 6, minTokens: 0, collapse: true, top: 25 };
  const files: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--depth") opts.depth = Number(args[++i]);
    else if (args[i] === "--min-tokens") opts.minTokens = Number(args[++i]);
    else if (args[i] === "--top") opts.top = Number(args[++i]);
    else if (args[i] === "--no-collapse") opts.collapse = false;
    else if (args[i] === "--summaries") opts.summaries = true;
    else if (args[i] === "--exports") opts.exports = true;
    else if (args[i] === "--tests") opts.tests = true;
    else if (args[i] === "--help" || args[i] === "-h") {
      console.log(USAGE);
      return;
    } else if (args[i]!.startsWith("-")) {
      console.error(`Unknown option ${args[i]}\n${USAGE}`);
      process.exit(1);
    } else files.push(args[i]!);
  }
  const counts = [opts.depth, opts.minTokens, opts.top];
  if (files.length === 0 || counts.some((n) => !Number.isInteger(n) || n < 0) || opts.depth < 1) {
    console.error(USAGE);
    process.exit(1);
  }
  const missing = files.filter((file) => !existsSync(file));
  if (missing.length > 0) {
    console.error(`No such file or directory: ${missing.join(", ")}`);
    process.exit(1);
  }
  for (const file of files) {
    if (opts.exports) {
      outlineExports(file, opts);
      continue;
    }
    if (statSync(file).isDirectory()) {
      outlineDir(file, opts);
      continue;
    }
    const text = readFileSync(file, "utf8");
    if (CODE_FILE.test(file)) {
      outlineCode(file, text, opts);
      continue;
    }
    for (const line of outlineMarkdown(file, text, opts)) console.log(line);
  }
}

/** The outline of a Markdown file, one line per heading; with `summaries`, each heading's agent summary under it. */
export function outlineMarkdown(file: string, text: string, opts: Pick<Options, "depth" | "summaries">): string[] {
  const out: string[] = [];
  const total = text.split("\n").length;
  out.push(`${file}: ${total} lines, ~${Math.round(text.length / 4)} tokens`);
  const sections = outline(text, opts.depth);
  if (sections.length > 0 && sections[0]!.start > 1) {
    const head = text.split("\n").slice(0, sections[0]!.start - 1).join("\n");
    out.push(`  1-${sections[0]!.start - 1}  ~${Math.round(head.length / 4)}t  (before first heading)`);
  }
  const summaryAt = new Map<number, string>();
  if (opts.summaries) for (const a of headingSummaries(text)) if (a.text) summaryAt.set(a.heading.line + 1, a.text);
  for (const s of sections) {
    const indent = "  ".repeat(s.level);
    out.push(`${indent}${s.start}-${s.end}  ~${s.tokens}t  ${"#".repeat(s.level)} ${s.title}`);
    const summary = summaryAt.get(s.start);
    if (summary) out.push(`${indent}    ${summary}`);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
