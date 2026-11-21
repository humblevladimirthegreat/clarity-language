/**
 * Move top-level declarations (functions, types, interfaces, consts, classes) from one source file to
 * another, new or existing, and fix the imports on both sides and in every importer. TypeScript's
 * *Move to file* refactor writes the imports; the moved text itself is copied verbatim from FROM.
 *
 *   move-decl FROM NAME[,NAME…] TO
 *
 * It refuses, writing nothing, when a name is not a top-level declaration of FROM, is declared twice
 * (function overloads count once), shares its statement or its line with code that stays, is already
 * declared in TO, or is imported by a file the language service does not see (a .vue or .mjs file);
 * when the move would add a load-time read across a cycle (as `deps --split` finds it); when it would
 * add a type error to a file it edits; and when `deps --check-move` finds a line on only one side.
 * A pure move prints nothing.
 *
 * Run: npm run -s move-decl -- src/interpret/read.ts readUnit,UnitKind src/interpret/read-units.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

import { BANNER, bindingNames, checkMove, headerLines, importsOf, projectSourceFiles, readProject, splitReport, type MoveLine } from "./lib/deps.ts";

export type MoveOptions = { from: string; names: string[]; to: string; root?: string };
export type MoveResult = { ok: true; files: { file: string; text: string }[] } | { ok: false; refused: string[]; moveLines?: MoveLine[] };

/** One moved unit: a top-level statement (or an overload run), with the comment lines directly above it. */
type Piece = { names: string[]; stmts: ts.Statement[]; start: number; end: number; startLine: number; endLine: number; text: string };

const TS_FILE = /\.[cm]?ts$/;
const FORMAT: ts.FormatCodeSettings = { ...ts.getDefaultFormatCodeSettings(), indentSize: 2, tabSize: 2, convertTabsToSpaces: true };
const PREFERENCES: ts.UserPreferences = { allowTextChangesInNewFiles: true, importModuleSpecifierEnding: "auto", quotePreference: "double" };

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((m) => m.kind === kind) ?? false);
}

/** The names a top-level statement declares. */
function declaredNames(s: ts.Statement): string[] {
  if (ts.isFunctionDeclaration(s) || ts.isClassDeclaration(s)) return s.name ? [s.name.text] : [];
  if (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isEnumDeclaration(s) || ts.isModuleDeclaration(s)) return [s.name.getText()];
  if (ts.isVariableStatement(s)) return s.declarationList.declarations.flatMap((d) => bindingNames(d.name)).map((n) => n.text);
  return [];
}

const parse = (file: string, text: string): ts.SourceFile => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
const lineOf = (sf: ts.SourceFile, pos: number): number => sf.getLineAndCharacterOfPosition(pos).line + 1;
const lineStart = (text: string, pos: number): number => text.lastIndexOf("\n", pos - 1) + 1;

/** Start of the comment lines directly above a statement (no blank line between, no banner), else the statement's own line start. */
function pieceStart(sf: ts.SourceFile, s: ts.Statement): number {
  const text = sf.text;
  let start = s.getStart(sf);
  const comments = ts.getLeadingCommentRanges(text, s.pos) ?? [];
  for (let i = comments.length - 1; i >= 0; i--) {
    const c = comments[i]!;
    const gap = text.slice(c.end, start);
    if (gap.trim() !== "" || (gap.match(/\n/g)?.length ?? 0) > 1) break;
    if (text.slice(lineStart(text, c.pos), c.pos).trim() !== "") break;
    if (BANNER.test(text.slice(c.pos, c.end))) break;
    start = c.pos;
  }
  return lineStart(text, start);
}

/** Find the pieces for `names` in FROM, or the reasons to refuse. */
function findPieces(sf: ts.SourceFile, names: string[]): { pieces: Piece[]; refused: string[] } {
  const refused: string[] = [];
  const byName = new Map<string, number[]>();
  sf.statements.forEach((s, i) => {
    for (const n of declaredNames(s)) byName.set(n, [...(byName.get(n) ?? []), i]);
  });
  const chosen = new Map<number, Piece>();
  for (const name of names) {
    const idx = byName.get(name) ?? [];
    if (idx.length === 0) {
      refused.push(`${name}: no top-level declaration in ${sf.fileName}`);
      continue;
    }
    const stmts = idx.map((i) => sf.statements[i]!);
    const overloads = stmts.every(ts.isFunctionDeclaration) && idx.every((v, k) => k === 0 || v === idx[k - 1]! + 1);
    if (idx.length > 1 && !overloads) {
      refused.push(`${name}: declared ${idx.length} times in ${sf.fileName}`);
      continue;
    }
    const first = stmts[0]!;
    const last = stmts[stmts.length - 1]!;
    if (hasModifier(first, ts.SyntaxKind.DefaultKeyword)) {
      refused.push(`${name}: a default export`);
      continue;
    }
    const others = declaredNames(first).filter((n) => !names.includes(n));
    if (others.length) {
      refused.push(`${name}: its statement also declares ${others.join(", ")}; list those too`);
      continue;
    }
    const start = pieceStart(sf, first);
    const lineEnd = sf.text.indexOf("\n", last.end);
    const rest = sf.text.slice(last.end, lineEnd < 0 ? sf.text.length : lineEnd);
    const prev = sf.statements[idx[0]! - 1];
    if (rest.trim() !== "" || sf.text.slice(lineStart(sf.text, first.getStart(sf)), first.getStart(sf)).trim() !== "" || (prev && prev.end > start)) {
      refused.push(`${name}: shares a line with other code`);
      continue;
    }
    if (chosen.has(idx[0]!)) continue;
    const text = sf.text.slice(start, last.end);
    chosen.set(idx[0]!, { names: declaredNames(first), stmts, start, end: last.end, startLine: lineOf(sf, start), endLine: lineOf(sf, last.end), text });
  }
  return { pieces: [...chosen.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p), refused };
}

/** FROM with the pieces' lines removed, each with one blank line after it. */
function cutPieces(text: string, pieces: Piece[]): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let justCut = false;
  for (let i = 0; i < lines.length; i++) {
    const line = i + 1;
    if (pieces.some((p) => line >= p.startLine && line <= p.endLine)) {
      justCut = true;
      continue;
    }
    if (justCut && lines[i]!.trim() === "") {
      justCut = false;
      continue;
    }
    justCut = false;
    out.push(lines[i]!);
  }
  return out.join("\n");
}

/** Replace the import declarations of `text` whose specifier resolves to `target` by blank lines, so line numbers hold. */
function maskImportsOf(file: string, text: string, target: string, options: ts.CompilerOptions): string {
  const sf = parse(file, text);
  let out = text;
  for (const s of [...sf.statements].reverse()) {
    if (!ts.isImportDeclaration(s) || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    const hit = ts.resolveModuleName(s.moduleSpecifier.text, file, options, ts.sys).resolvedModule?.resolvedFileName;
    if (!hit || resolve(hit) !== target) continue;
    const a = s.getStart(sf);
    out = out.slice(0, a) + out.slice(a, s.end).replace(/[^\n]/g, "") + out.slice(s.end);
  }
  return out;
}

/** The relative-specifier ending a file uses most: `.js` or `.ts`. */
function specifierEnding(text: string, file: string): string {
  let js = 0;
  let tsCount = 0;
  for (const imp of importsOf(file, text)) {
    if (!imp.spec.startsWith(".")) continue;
    if (imp.spec.endsWith(".js")) js++;
    else if (imp.spec.endsWith(".ts")) tsCount++;
  }
  return js > tsCount ? ".js" : ".ts";
}

/** Give each relative import or export specifier without an extension the file's ending. */
function fixSpecifiers(file: string, text: string, ending: string): string {
  const sf = parse(file, text);
  let out = text;
  for (const s of [...sf.statements].reverse()) {
    if (!(ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    const spec = s.moduleSpecifier.text;
    if (!spec.startsWith(".") || /\.[cm]?[jt]s$/.test(spec)) continue;
    const at = s.moduleSpecifier.getEnd() - 1;
    out = out.slice(0, at) + ending + out.slice(at);
  }
  return out;
}

function applyChanges(text: string, changes: readonly ts.TextChange[]): string {
  let out = text;
  // Sorted by start, stable, then applied last first: an insertion and a replacement at one point keep their order.
  const sorted = [...changes].sort((a, b) => a.span.start - b.span.start);
  for (const c of sorted.reverse()) out = out.slice(0, c.span.start) + c.newText + out.slice(c.span.start + c.span.length);
  return out;
}

/** A language service over the project files, with some files' text held in memory. */
function overlayService(fileNames: string[], options: ts.CompilerOptions, root: string) {
  const texts = new Map<string, string>();
  const versions = new Map<string, number>();
  const read = (p: string): string | undefined => texts.get(p) ?? ts.sys.readFile(p);
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => fileNames,
    getScriptVersion: (p) => String(versions.get(p) ?? 0),
    getScriptSnapshot: (p) => {
      const text = read(p);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => root,
    getCompilationSettings: () => options,
    getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
    fileExists: (p) => texts.has(p) || ts.sys.fileExists(p),
    readFile: read,
    readDirectory: ts.sys.readDirectory,
    directoryExists: (p) => [...texts.keys()].some((f) => f.startsWith(`${p}/`)) || ts.sys.directoryExists(p),
    getDirectories: ts.sys.getDirectories,
  };
  const service = ts.createLanguageService(host, ts.createDocumentRegistry());
  const set = (p: string, text: string): void => {
    texts.set(p, text);
    versions.set(p, (versions.get(p) ?? 0) + 1);
  };
  return { service, set, read };
}

/** Diagnostic messages of a file, position-free, so a move can be compared before and after. */
function diagnosticKeys(service: ts.LanguageService, file: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const d of [...service.getSyntacticDiagnostics(file), ...service.getSemanticDiagnostics(file)]) {
    if (d.category !== ts.DiagnosticCategory.Error) continue;
    const key = ts.flattenDiagnosticMessageText(d.messageText, " ");
    out.set(key, (out.get(key) ?? 0) + 1);
  }
  return out;
}

/** Work out the move without writing: the new text of every file it changes, or why it refuses. */
export function planMove(opts: MoveOptions): MoveResult {
  const root = resolve(opts.root ?? process.cwd());
  const from = resolve(root, opts.from);
  const to = resolve(root, opts.to);
  const relFrom = relative(root, from);
  const relTo = relative(root, to);
  if (from === to) return { ok: false, refused: ["FROM and TO are the same file"] };
  if (!existsSync(from)) return { ok: false, refused: [`${relFrom}: no such file`] };
  const project = readProject(resolve(root, "tsconfig.json"));
  const options = project.options;
  const fromText = readFileSync(from, "utf8");
  const toExists = existsSync(to);
  const toText = toExists ? readFileSync(to, "utf8") : "";
  const fromSf = parse(from, fromText);
  const { pieces, refused } = findPieces(fromSf, opts.names);
  const moved = new Set(pieces.flatMap((p) => p.names));
  if (toExists) {
    const clash = parse(to, toText).statements.flatMap(declaredNames).filter((n) => moved.has(n));
    for (const n of new Set(clash)) refused.push(`${n}: already declared in ${relTo}`);
  }
  // Importers the language service does not see.
  const sources = projectSourceFiles(root);
  const roots = new Set([...project.fileNames.map((f) => resolve(f)), ...sources.filter((f) => TS_FILE.test(f) && !f.endsWith(".d.ts")).map((f) => resolve(f))]);
  for (const file of sources) {
    if (roots.has(resolve(file)) || resolve(file) === from) continue;
    const text = readFileSync(file, "utf8");
    if (!text.includes(relFrom.split("/").pop()!.replace(TS_FILE, ""))) continue;
    for (const imp of importsOf(file, text)) {
      if (!imp.spec.startsWith(".")) continue;
      const hit = ts.resolveModuleName(imp.spec, resolve(file), options, ts.sys).resolvedModule?.resolvedFileName;
      if (!hit || resolve(hit) !== from) continue;
      const names = imp.names.filter((n) => n === "*" || moved.has(n));
      if (names.length) refused.push(`${relative(root, file)} imports ${names.join(", ")} from ${relFrom}, and the language service does not see it`);
    }
  }
  if (refused.length) return { ok: false, refused };
  // Load-time reads across a cycle, as deps --split finds them: FROM and TO read as one file.
  const fromLines = fromText.split("\n").length;
  const masked = toExists ? `${maskImportsOf(from, fromText, to, options)}\n${maskImportsOf(to, toText, from, options)}` : fromText;
  const ranges = pieces.map((p) => ({ start: p.startLine, end: p.endLine }));
  if (toExists) ranges.push({ start: fromLines + 1, end: fromLines + toText.split("\n").length });
  const report = splitReport(relFrom, masked, [{ name: relTo, ranges }]);
  for (const r of report.loadReads.filter((x) => x.acrossCycle)) {
    const via = r.chain.length ? ` via ${r.chain.join(" -> ")}` : "";
    refused.push(`load-time read across a cycle: ${r.file} ${r.root}${via} reads ${r.name} from ${r.target}; move the const with what reads it`);
  }
  if (refused.length) return { ok: false, refused };
  // The refactor runs on FROM with the pieces gathered at its end, so one range covers them all.
  const cut = cutPieces(fromText, pieces);
  const gathered = `${cut.trimEnd()}\n\n`;
  const block = pieces.map((p) => p.text).join("\n\n");
  const fileNames = [...roots, ...(roots.has(to) ? [] : [to])];
  const { service, set, read } = overlayService(fileNames, options, root);
  if (!toExists) set(to, "");
  set(from, `${gathered}${block}\n`);
  const edits = service.getEditsForRefactor(from, FORMAT, { pos: gathered.length, end: gathered.length + block.length }, "Move to file", "Move to file", PREFERENCES, { targetFile: to });
  if (!edits || edits.edits.length === 0) return { ok: false, refused: ["TypeScript's Move to file refactor does not apply here"] };
  // Every change to one file is against its text before the refactor, even across entries.
  const changes = new Map<string, ts.TextChange[]>();
  for (const fe of edits.edits) {
    const file = resolve(fe.fileName);
    changes.set(file, [...(changes.get(file) ?? []), ...fe.textChanges]);
  }
  // FROM keeps only the changes before the gathered block: the refactor's removal of the block would
  // also take a comment (a banner) left just above it. TO gets the moved statements back verbatim below.
  const cutEnd = cut.trimEnd().length;
  const fromChanges = (changes.get(from) ?? []).filter((c) => c.span.start + c.span.length <= cutEnd);
  changes.set(from, fromChanges);
  const next = new Map([...changes].map(([file, list]) => [file, applyChanges(file === from ? gathered : (read(file) ?? ""), list)]));
  next.set(from, `${next.get(from)!.trimEnd()}\n`);
  const toNext = next.get(to) ?? toText;
  const toSf = parse(to, toNext);
  const movedStmts = toSf.statements.filter((s) => declaredNames(s).some((n) => moved.has(n)));
  const firstMoved = movedStmts[0];
  if (!firstMoved || toSf.statements.slice(toSf.statements.indexOf(firstMoved)).some((s) => !declaredNames(s).some((n) => moved.has(n)))) {
    return { ok: false, refused: [`the refactor did not leave the moved declarations at the end of ${relTo}`] };
  }
  const texts = pieces.map((p) => {
    const stmt = movedStmts.find((s) => declaredNames(s).includes(p.names[0]!));
    const exportIt = stmt && hasModifier(stmt, ts.SyntaxKind.ExportKeyword) && !hasModifier(p.stmts[0]!, ts.SyntaxKind.ExportKeyword);
    if (!exportIt) return p.text;
    return p.stmts.map((s) => s.getStart(fromSf) - p.start).reduceRight((t, at) => `${t.slice(0, at)}export ${t.slice(at)}`, p.text);
  });
  const head = toNext.slice(0, firstMoved.getFullStart()).trimEnd();
  next.set(to, `${head ? `${head}\n\n` : ""}${texts.join("\n\n")}\n`);
  const fromEnding = specifierEnding(fromText, from);
  for (const [file, text] of next) next.set(file, fixSpecifiers(file, text, file === to && !toExists ? fromEnding : specifierEnding(read(file) ?? text, file)));
  // Checks: no line on only one side, no new type error in an edited file.
  const oldTo = toExists ? toText.split("\n").filter((_, i) => !headerLines(toText).has(i + 1)).join("\n") : "";
  const moveLines = checkMove(from, toExists ? `${fromText}\n${oldTo}` : fromText, [
    { file: from, text: next.get(from)! },
    { file: to, text: next.get(to)! },
  ]);
  if (moveLines.length) return { ok: false, refused: ["the move check found lines on only one side"], moveLines };
  set(from, fromText);
  if (toExists) set(to, toText);
  const before = new Map([...next.keys()].map((f) => [f, f === to && !toExists ? new Map<string, number>() : diagnosticKeys(service, f)]));
  for (const [file, text] of next) set(file, text);
  for (const [file] of next) {
    const was = before.get(file)!;
    for (const [key, n] of diagnosticKeys(service, file)) if (n > (was.get(key) ?? 0)) refused.push(`${relative(root, file)}: new type error: ${key}`);
  }
  if (refused.length) return { ok: false, refused };
  return { ok: true, files: [...next].map(([file, text]) => ({ file, text })) };
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length !== 3 || args.some((a) => a.startsWith("-"))) {
    console.error("Usage: npm run -s move-decl -- FROM NAME[,NAME…] TO");
    process.exit(2);
  }
  const [from, names, to] = args as [string, string, string];
  const result = planMove({ from, names: names.split(",").filter(Boolean), to });
  if (!result.ok) {
    for (const r of result.refused) console.error(`move-decl: refused: ${r}`);
    for (const d of result.moveLines ?? []) console.error(`${d.side} ${relative(process.cwd(), d.file)}:${d.line}  ${d.text.trim()}`);
    process.exit(1);
  }
  for (const f of result.files) {
    mkdirSync(dirname(f.file), { recursive: true });
    writeFileSync(f.file, f.text);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
