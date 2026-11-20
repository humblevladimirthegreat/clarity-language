/**
 * Dependency analysis for splitting large source files: edges between a file's banner groups,
 * references through the language service, importers, a proposed split's import graph and
 * load-time reads, a move check, and the size list the size lint reads.
 * CLI: scripts/deps.ts (`npm run deps`).
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

// ── Groups ──────────────────────────────────────────────────────────────────

/** A section banner, `// ── Title ──`; group 1 is the title. Also read by scripts/outline.ts. */
export const BANNER = /^\s*\/\/\s*[─=-]{2,}\s*(.*?)\s*[─=-]*\s*$/;

/** The banner title on a line, or null when the line is no banner. */
export function bannerTitle(line: string): string | null {
  const m = BANNER.exec(line);
  return m && m[1] ? m[1] : null;
}

export type Range = { start: number; end: number };
export type Group = { name: string; ranges: Range[] };

/** Line count as `wc -l` gives it: a final newline ends the last line rather than starting one. */
export function lineCount(text: string): number {
  if (text === "") return 0;
  const n = text.split("\n").length;
  return text.endsWith("\n") ? n - 1 : n;
}

/** Groups from a file's banners: each banner runs to the line before the next; lines before the first are `head`. */
export function bannerGroups(text: string): Group[] {
  const lines = text.split("\n");
  const total = lineCount(text);
  const starts: { name: string; line: number }[] = [];
  lines.forEach((line, i) => {
    const title = bannerTitle(line);
    if (title !== null) starts.push({ name: title, line: i + 1 });
  });
  const groups: Group[] = [];
  const firstLine = starts[0]?.line ?? total + 1;
  if (firstLine > 1) groups.push({ name: "head", ranges: [{ start: 1, end: firstLine - 1 }] });
  starts.forEach((s, k) => {
    const end = (starts[k + 1]?.line ?? total + 1) - 1;
    const same = groups.find((g) => g.name === s.name);
    if (same) same.ranges.push({ start: s.line, end });
    else groups.push({ name: s.name, ranges: [{ start: s.line, end }] });
  });
  return groups;
}

/**
 * Parse `name:a-b,c-d,other:e-f` (or with `;` between groups): a token with `name:` starts a group,
 * a bare `a-b` adds a range to the group before it. A repeated name adds to the same group.
 */
export function parseGroups(spec: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  for (const raw of spec.split(/[,;]/)) {
    const token = raw.trim();
    if (token === "") continue;
    const m = /^(?:(.+?):)?\s*(\d+)\s*-\s*(\d+)$/.exec(token);
    if (!m) throw new Error(`bad range "${token}": expected name:a-b or a-b`);
    if (m[1] !== undefined) {
      const name = m[1].trim();
      current = groups.find((g) => g.name === name) ?? null;
      if (!current) {
        current = { name, ranges: [] };
        groups.push(current);
      }
    }
    if (!current) throw new Error(`range "${token}" has no group name before it`);
    const start = Number(m[2]);
    const end = Number(m[3]);
    if (end < start) throw new Error(`range "${token}" ends before it starts`);
    current.ranges.push({ start, end });
  }
  return groups;
}

/** The group a line falls in, or `fallback`. */
export function groupOfLine(groups: Group[], line: number, fallback: string): string {
  return groups.find((g) => g.ranges.some((r) => line >= r.start && line <= r.end))?.name ?? fallback;
}

// ── Analysis ────────────────────────────────────────────────────────────────

type UnitKind = "function" | "class" | "member" | "type" | "value" | "statement";

/** One placeable piece of a file: a top-level statement, a class header, or one class member. */
export type Unit = {
  label: string;
  kind: UnitKind;
  /** Line of the code (after any doc comment). */
  line: number;
  endLine: number;
  /** The nodes walked for references. */
  nodes: ts.Node[];
  /** The class a member belongs to (its header unit), for members. */
  owner?: Unit;
  /** For a class header: the constructor and instance-field units, which run on `new`. */
  construct?: Unit[];
  /** Instance property: its initializer runs on `new`, not at load. */
  instanceField?: boolean;
};

export type Decl = {
  key: string;
  unit: Unit;
  /** A binding that is read in place at load: const, let, var, class, enum. Functions are hoisted. */
  binding: boolean;
  typeOnly: boolean;
  member: boolean;
};

export type Ref = { from: Unit; to: Decl; line: number; typeOnly: boolean; loadTime: boolean };

export type Analysis = { sf: ts.SourceFile; units: Unit[]; refs: Ref[]; lineOf: (pos: number) => number };

const FUNCTION_LIKE = new Set([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.SetAccessor,
]);

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((m) => m.kind === kind) ?? false);
}

/** True when an identifier sits where only a type can be: erased at run time. */
function inTypePosition(node: ts.Node): boolean {
  for (let p: ts.Node | undefined = node.parent; p; p = p.parent) {
    if (ts.isExpressionWithTypeArguments(p)) {
      const clause = p.parent;
      const isClassExtends = ts.isHeritageClause(clause) && clause.token === ts.SyntaxKind.ExtendsKeyword && ts.isClassLike(clause.parent);
      return !isClassExtends;
    }
    if (ts.isTypeNode(p)) return true;
    if (ts.isStatement(p) || ts.isClassElement(p) || FUNCTION_LIKE.has(p.kind)) return false;
  }
  return false;
}

/** True when the code at `node` runs while the module loads: not inside a function body or an instance field. */
function runsAtLoad(node: ts.Node, unit: Unit): boolean {
  if (unit.kind === "function" || unit.kind === "type" || unit.instanceField) return false;
  for (let p: ts.Node | undefined = node; p; p = p.parent) {
    if (FUNCTION_LIKE.has(p.kind)) return false;
    if (ts.isPropertyDeclaration(p) && !hasModifier(p, ts.SyntaxKind.StaticKeyword)) return false;
    if (unit.nodes.includes(p)) return true;
  }
  return true;
}

/** Bind each name in a binding pattern. */
function bindingNames(name: ts.BindingName): ts.Identifier[] {
  if (ts.isIdentifier(name)) return [name];
  const out: ts.Identifier[] = [];
  for (const el of name.elements) if (!ts.isOmittedExpression(el)) out.push(...bindingNames(el.name));
  return out;
}

function singleFileProgram(fileName: string, text: string): ts.Program {
  const options: ts.CompilerOptions = { noLib: true, noResolve: true, allowJs: true, target: ts.ScriptTarget.ES2022, types: [], strict: true };
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (name) => (name === fileName ? sf : undefined);
  host.fileExists = (name) => name === fileName;
  host.readFile = (name) => (name === fileName ? text : undefined);
  return ts.createProgram({ rootNames: [fileName], options, host });
}

/** Units, declarations and resolved references of one file, read on its own (imports stay unresolved). */
export function analyze(fileName: string, text: string): Analysis {
  const program = singleFileProgram(fileName, text);
  const sf = program.getSourceFile(fileName)!;
  const checker = program.getTypeChecker();
  const lineOf = (pos: number): number => sf.getLineAndCharacterOfPosition(pos).line + 1;
  const units: Unit[] = [];
  const decls = new Map<ts.Symbol, Decl>();
  const unitOf = (node: ts.Node, label: string, kind: UnitKind, nodes: ts.Node[] = [node]): Unit => {
    const unit: Unit = { label, kind, line: lineOf(node.getStart(sf)), endLine: lineOf(node.getEnd()), nodes };
    units.push(unit);
    return unit;
  };
  const declare = (name: ts.Node, unit: Unit, key: string, flags: Omit<Decl, "key" | "unit">): void => {
    const sym = checker.getSymbolAtLocation(name);
    if (sym && !decls.has(sym)) decls.set(sym, { key, unit, ...flags });
  };
  const top = { binding: false, typeOnly: false, member: false };
  for (const s of sf.statements) {
    if (ts.isImportDeclaration(s) || ts.isImportEqualsDeclaration(s) || ts.isExportDeclaration(s)) continue;
    if (ts.isClassDeclaration(s)) {
      const name = s.name?.text ?? "default";
      const headerNodes: ts.Node[] = [...(ts.getDecorators(s) ?? []), ...(s.typeParameters ?? []), ...(s.heritageClauses ?? [])];
      const header = unitOf(s, name, "class", headerNodes);
      header.construct = [];
      if (s.name) declare(s.name, header, name, { ...top, binding: true });
      for (const m of s.members) {
        const mName = ts.isConstructorDeclaration(m) ? "constructor" : (m.name?.getText(sf) ?? "");
        if (mName === "") continue;
        const unit = unitOf(m, `${name}.${mName}`, "member");
        unit.owner = header;
        if (ts.isPropertyDeclaration(m) && !hasModifier(m, ts.SyntaxKind.StaticKeyword)) unit.instanceField = true;
        if (ts.isConstructorDeclaration(m) || unit.instanceField) header.construct.push(unit);
        if (m.name) declare(m.name, unit, `${name}.${mName}`, { ...top, member: true });
      }
      continue;
    }
    if (ts.isFunctionDeclaration(s)) {
      const name = s.name?.text ?? "default";
      const unit = unitOf(s, name, "function");
      if (s.name) declare(s.name, unit, name, top);
      continue;
    }
    if (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) {
      declare(s.name, unitOf(s, s.name.text, "type"), s.name.text, { ...top, typeOnly: true });
      continue;
    }
    if (ts.isEnumDeclaration(s) || ts.isModuleDeclaration(s)) {
      const name = s.name.getText(sf);
      declare(s.name, unitOf(s, name, "value"), name, { ...top, binding: true });
      continue;
    }
    if (ts.isVariableStatement(s)) {
      const names = s.declarationList.declarations.flatMap((d) => bindingNames(d.name));
      const unit = unitOf(s, names.map((n) => n.text).join(", "), "value");
      for (const n of names) declare(n, unit, n.text, { ...top, binding: true });
      continue;
    }
    unitOf(s, `(line ${lineOf(s.getStart(sf))})`, "statement");
  }
  const refs: Ref[] = [];
  for (const unit of units) {
    const visit = (n: ts.Node): void => {
      if (ts.isIdentifier(n) || ts.isPrivateIdentifier(n)) {
        let sym = checker.getSymbolAtLocation(n);
        if (ts.isShorthandPropertyAssignment(n.parent) && n.parent.name === n) sym = checker.getShorthandAssignmentValueSymbol(n.parent);
        const to = sym ? decls.get(sym) : undefined;
        if (to && to.unit !== unit) {
          refs.push({ from: unit, to, line: lineOf(n.getStart(sf)), typeOnly: to.typeOnly || inTypePosition(n), loadTime: runsAtLoad(n, unit) });
        }
      }
      ts.forEachChild(n, visit);
    };
    for (const node of unit.nodes) visit(node);
  }
  return { sf, units, refs, lineOf };
}

// ── Group edges ─────────────────────────────────────────────────────────────

/** One edge between groups: each name `from` uses in `to`, with the units that use it. */
export type Edge = { from: string; to: string; names: Map<string, Set<string>> };

/** Edges between groups: which top-level names and class members each group uses from each other group. */
export function groupEdges(fileName: string, text: string, groups: Group[]): Edge[] {
  const { refs } = analyze(fileName, text);
  const edges = new Map<string, Edge>();
  for (const r of refs) {
    const from = groupOfLine(groups, r.from.line, "?");
    const to = groupOfLine(groups, r.to.unit.line, "?");
    if (from === to) continue;
    const k = `${from}\u0000${to}`;
    let edge = edges.get(k);
    if (!edge) edges.set(k, (edge = { from, to, names: new Map() }));
    let users = edge.names.get(r.to.key);
    if (!users) edge.names.set(r.to.key, (users = new Set()));
    users.add(r.from.label);
  }
  const order = (name: string): number => groups.findIndex((g) => g.name === name);
  return [...edges.values()].sort((a, b) => order(a.from) - order(b.from) || order(a.to) - order(b.to));
}

// ── Split ───────────────────────────────────────────────────────────────────

export type SplitReport = {
  /** Value imports each resulting file would need from each other one: names by `from\0to`. */
  imports: { from: string; to: string; names: string[]; typeNames: string[] }[];
  /** Strongly connected sets of two or more files over value imports. */
  cycles: string[][];
  /** Load-time reads of another resulting file's binding; `acrossCycle` ones fail. */
  loadReads: { file: string; root: string; line: number; chain: string[]; name: string; target: string; acrossCycle: boolean }[];
  /** Declarations whose lines fall in more than one resulting file. */
  straddles: { label: string; start: number; end: number }[];
  /** Class members placed apart from their class (they would become functions). */
  movedMembers: { file: string; label: string }[];
};

/** The import graph and load-time reads a split of FILE into `parts` (by line range) would give; unlisted lines stay in FILE. */
export function splitReport(fileName: string, text: string, parts: Group[]): SplitReport {
  const { refs, units } = analyze(fileName, text);
  const fileOf = (unit: Unit): string => groupOfLine(parts, unit.line, fileName);
  const straddles = units
    .filter((u) => u.kind !== "class" && fileOf(u) !== groupOfLine(parts, u.endLine, fileName))
    .map((u) => ({ label: u.label, start: u.line, end: u.endLine }));
  const movedMembers = units.filter((u) => u.owner && fileOf(u) !== fileOf(u.owner)).map((u) => ({ file: fileOf(u), label: u.label }));
  // Edges: value and type imports between resulting files.
  const value = new Map<string, Set<string>>();
  const typeOnly = new Map<string, Set<string>>();
  const add = (map: Map<string, Set<string>>, from: string, to: string, name: string): void => {
    if (from === to) return;
    const k = `${from}\u0000${to}`;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k)!.add(name);
  };
  for (const u of units) if (u.owner && fileOf(u) !== fileOf(u.owner)) add(typeOnly, fileOf(u), fileOf(u.owner), u.owner.label);
  for (const r of refs) {
    const from = fileOf(r.from);
    const toUnit = r.to.unit;
    if (r.to.member) {
      // A member that moved out becomes a function in its new file; one that stays is reached through the instance (a type import).
      const ownerFile = fileOf(toUnit.owner!);
      if (fileOf(toUnit) !== ownerFile) add(r.typeOnly ? typeOnly : value, from, fileOf(toUnit), toUnit.label.split(".").pop()!);
      else add(typeOnly, from, ownerFile, toUnit.owner!.label);
      continue;
    }
    add(r.typeOnly ? typeOnly : value, from, fileOf(toUnit), r.to.key);
  }
  const keys = new Set([...value.keys(), ...typeOnly.keys()]);
  const imports = [...keys].map((k) => {
    const [from, to] = k.split("\u0000") as [string, string];
    const v = value.get(k) ?? new Set<string>();
    const t = [...(typeOnly.get(k) ?? [])].filter((n) => !v.has(n));
    return { from, to, names: [...v].sort(), typeNames: t.sort() };
  });
  const files = [fileName, ...parts.map((p) => p.name)];
  const cycles = stronglyConnected(files, [...value.keys()].map((k) => k.split("\u0000") as [string, string])).filter((c) => c.length > 1);
  const cycleOf = new Map<string, number>();
  cycles.forEach((c, i) => c.forEach((f) => cycleOf.set(f, i)));
  // Load-time reads: from each load-time reference, follow calls into functions, methods and constructors.
  const refsFrom = new Map<Unit, Ref[]>();
  for (const r of refs) {
    if (!refsFrom.has(r.from)) refsFrom.set(r.from, []);
    refsFrom.get(r.from)!.push(r);
  }
  const loadReads: SplitReport["loadReads"] = [];
  const seenRead = new Set<string>();
  for (const root of refs.filter((r) => r.loadTime && !r.typeOnly)) {
    const rootFile = fileOf(root.from);
    const visited = new Set<Unit>();
    const walk = (r: Ref, chain: string[]): void => {
      if (r.typeOnly) return;
      const target = r.to.unit;
      const targetFile = fileOf(target);
      if (r.to.binding && targetFile !== rootFile) {
        const key = `${root.from.label}\u0000${r.to.key}\u0000${r.line}`;
        if (!seenRead.has(key)) {
          seenRead.add(key);
          const across = cycleOf.has(rootFile) && cycleOf.get(rootFile) === cycleOf.get(targetFile);
          loadReads.push({ file: rootFile, root: root.from.label, line: r.line, chain, name: r.to.key, target: targetFile, acrossCycle: across });
        }
      }
      const next: Unit[] = target.kind === "function" || target.kind === "member" ? [target] : target.kind === "class" ? (target.construct ?? []) : [];
      for (const u of next) {
        if (visited.has(u)) continue;
        visited.add(u);
        for (const inner of refsFrom.get(u) ?? []) walk(inner, [...chain, u.label]);
      }
    };
    walk(root, []);
  }
  return { imports, cycles, loadReads, straddles, movedMembers };
}

/** Tarjan's strongly connected components, each in `nodes` order. */
export function stronglyConnected(nodes: string[], edges: [string, string][]): string[][] {
  const out = new Map<string, string[]>(nodes.map((n) => [n, []]));
  for (const [a, b] of edges) out.get(a)?.push(b);
  let index = 0;
  const idx = new Map<string, number>();
  const low = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const result: string[][] = [];
  const connect = (v: string): void => {
    idx.set(v, index);
    low.set(v, index++);
    stack.push(v);
    onStack.add(v);
    for (const w of out.get(v) ?? []) {
      if (!idx.has(w)) {
        connect(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) low.set(v, Math.min(low.get(v)!, idx.get(w)!));
    }
    if (low.get(v) === idx.get(v)) {
      const comp: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        comp.push(w);
      } while (w !== v);
      result.push(comp.sort((a, b) => nodes.indexOf(a) - nodes.indexOf(b)));
    }
  };
  for (const n of nodes) if (!idx.has(n)) connect(n);
  return result;
}

// ── Move check ──────────────────────────────────────────────────────────────

export type MoveLine = { side: "-" | "+"; file: string; line: number; text: string };

/** Lines of import statements and export lists (`export { … }`, `export * from`), which a move rewrites. */
function importExportLines(fileName: string, text: string): Set<number> {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const skip = new Set<number>();
  for (const s of sf.statements) {
    if (!ts.isImportDeclaration(s) && !ts.isImportEqualsDeclaration(s) && !ts.isExportDeclaration(s)) continue;
    const a = sf.getLineAndCharacterOfPosition(s.getStart(sf)).line + 1;
    const b = sf.getLineAndCharacterOfPosition(s.getEnd()).line + 1;
    for (let l = a; l <= b; l++) skip.add(l);
  }
  return skip;
}

/** The file's header comment: comment lines from line 1 that end at a blank line. */
function headerLines(text: string): Set<number> {
  const lines = text.split("\n");
  const out = new Set<number>();
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i]!.trim();
    if (t === "") return out;
    const comment = inBlock || t.startsWith("//") || t.startsWith("/*") || t.startsWith("#!");
    if (!comment) return new Set();
    if (t.startsWith("/*")) inBlock = true;
    if (inBlock && t.includes("*/")) inBlock = false;
    out.add(i + 1);
  }
  return out;
}

/** Normalized lines that a move must keep: no imports or export lists, no blank lines, no leading `export `, trimmed. */
function movableLines(fileName: string, text: string, dropHeader: boolean): { line: number; key: string; text: string }[] {
  const skip = importExportLines(fileName, text);
  const header = dropHeader ? headerLines(text) : new Set<number>();
  const out: { line: number; key: string; text: string }[] = [];
  text.split("\n").forEach((raw, i) => {
    const line = i + 1;
    if (skip.has(line) || header.has(line)) return;
    const key = raw.trim().replace(/^export\s+(?!default\b)/, "");
    if (key === "") return;
    out.push({ line, key, text: raw });
  });
  return out;
}

/**
 * Compare an old file with the union of the files its code moved to. Each line found on only one side
 * (counted as a multiset, so order does not matter) comes back; a pure move gives none. Import lines,
 * export lists, blank lines, indentation and a leading `export ` are ignored, and so is the header
 * comment of each new file other than the old path (and of the old file when its path is gone).
 */
export function checkMove(oldFile: string, oldText: string, newFiles: { file: string; text: string }[]): MoveLine[] {
  const keepsPath = newFiles.some((f) => resolve(f.file) === resolve(oldFile));
  const old = movableLines(oldFile, oldText, !keepsPath).map((l) => ({ ...l, file: oldFile }));
  const added = newFiles.flatMap((f) => movableLines(f.file, f.text, resolve(f.file) !== resolve(oldFile)).map((l) => ({ ...l, file: f.file })));
  const count = new Map<string, number>();
  for (const l of old) count.set(l.key, (count.get(l.key) ?? 0) + 1);
  for (const l of added) count.set(l.key, (count.get(l.key) ?? 0) - 1);
  const out: MoveLine[] = [];
  const take = (side: "-" | "+", list: typeof old): void => {
    const left = new Map<string, number>();
    for (let i = list.length - 1; i >= 0; i--) {
      const l = list[i]!;
      const surplus = side === "-" ? (count.get(l.key) ?? 0) : -(count.get(l.key) ?? 0);
      const used = left.get(l.key) ?? 0;
      if (used >= surplus) continue;
      left.set(l.key, used + 1);
      out.push({ side, file: l.file, line: l.line, text: l.text });
    }
  };
  take("-", old);
  take("+", added);
  return out.sort((a, b) => (a.side === b.side ? a.file.localeCompare(b.file) || a.line - b.line : a.side === "-" ? -1 : 1));
}

/** `git show REV:FILE`. */
export function gitShow(revFile: string): string {
  return execFileSync("git", ["show", revFile], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

// ── Project ─────────────────────────────────────────────────────────────────

/** Compiler options and root files from tsconfig.json. */
export function readProject(configPath = "tsconfig.json"): ts.ParsedCommandLine {
  const config = ts.readConfigFile(configPath, (p) => ts.sys.readFile(p));
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  return ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(resolve(configPath)));
}

/** A language service over the given files: from disk, or from `memory` (file name → text) when given. */
export function languageService(fileNames: string[], options: ts.CompilerOptions, memory?: Map<string, string>): ts.LanguageService {
  const read = (p: string): string | undefined => (memory ? memory.get(p) : ts.sys.readFile(p));
  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => fileNames,
    getScriptVersion: () => "0",
    getScriptSnapshot: (p) => {
      const text = read(p);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
    fileExists: (p) => (memory ? memory.has(p) : ts.sys.fileExists(p)),
    readFile: read,
    readDirectory: memory ? () => [] : ts.sys.readDirectory,
    directoryExists: memory ? () => true : ts.sys.directoryExists,
    getDirectories: memory ? () => [] : ts.sys.getDirectories,
  };
  return ts.createLanguageService(host, ts.createDocumentRegistry());
}

export type Use = { file: string; line: number; text: string; definition: boolean; within: string };

/** The declaration name node of `name` (`Class.member` for a member) among a file's top-level statements. */
function findDeclName(sf: ts.SourceFile, name: string): ts.Node | null {
  const [head, member] = name.split(".") as [string, string | undefined];
  for (const s of sf.statements) {
    if (ts.isClassDeclaration(s) && s.name?.text === head) {
      if (member === undefined) return s.name;
      const m = s.members.find((x) => x.name?.getText(sf) === member);
      return m?.name ?? null;
    }
    if (member !== undefined) continue;
    if ((ts.isFunctionDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isEnumDeclaration(s)) && s.name?.text === head) return s.name;
    if (ts.isVariableStatement(s)) {
      for (const d of s.declarationList.declarations) for (const id of bindingNames(d.name)) if (id.text === head) return id;
    }
  }
  return null;
}

/** The top-level declaration or class member around a position, as a label. */
function enclosing(sf: ts.SourceFile, pos: number): string {
  for (const s of sf.statements) {
    if (pos < s.getStart(sf) || pos >= s.getEnd()) continue;
    if (ts.isClassDeclaration(s)) {
      const m = s.members.find((x) => pos >= x.getStart(sf) && pos < x.getEnd());
      const cls = s.name?.text ?? "default";
      return m ? `${cls}.${ts.isConstructorDeclaration(m) ? "constructor" : (m.name?.getText(sf) ?? "?")}` : cls;
    }
    if ((ts.isFunctionDeclaration(s) || ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s) || ts.isEnumDeclaration(s)) && s.name) return s.name.text;
    if (ts.isVariableStatement(s)) return s.declarationList.declarations.flatMap((d) => bindingNames(d.name)).map((n) => n.text).join(", ");
    if (ts.isImportDeclaration(s)) return "import";
    if (ts.isExportDeclaration(s)) return "export";
    return `(line ${sf.getLineAndCharacterOfPosition(s.getStart(sf)).line + 1})`;
  }
  return "?";
}

/**
 * Every reference to `name` (`Class.member` for a member) from find-references, so a local that shadows
 * the name is not counted. Searches `inFile` when given, else every source file, for the declaration.
 */
export function findUses(service: ts.LanguageService, name: string, inFile?: string): { declFile: string; uses: Use[] } | { error: string } {
  const program = service.getProgram()!;
  const files = program.getSourceFiles().filter((f) => !f.isDeclarationFile && !f.fileName.includes("/node_modules/"));
  const candidates = files.filter((f) => !inFile || resolve(f.fileName) === resolve(inFile));
  const found = candidates.map((sf) => ({ sf, node: findDeclName(sf, name) })).filter((x): x is { sf: ts.SourceFile; node: ts.Node } => x.node !== null);
  if (found.length === 0) return { error: `no top-level declaration of ${name}${inFile ? ` in ${inFile}` : ""}` };
  if (found.length > 1) return { error: `${name} is declared in ${found.length} files; name one: ${found.map((x) => x.sf.fileName).join(", ")}` };
  const { sf, node } = found[0]!;
  const uses: Use[] = [];
  for (const group of service.findReferences(sf.fileName, node.getStart(sf)) ?? []) {
    for (const ref of group.references) {
      const file = program.getSourceFile(ref.fileName);
      if (!file) continue;
      const lc = file.getLineAndCharacterOfPosition(ref.textSpan.start);
      const text = file.text.split("\n")[lc.line] ?? "";
      uses.push({ file: ref.fileName, line: lc.line + 1, text: text.trim(), definition: ref.isDefinition ?? false, within: enclosing(file, ref.textSpan.start) });
    }
  }
  uses.sort((a, b) => Number(a.file !== sf.fileName) - Number(b.file !== sf.fileName) || a.file.localeCompare(b.file) || a.line - b.line);
  return { declFile: sf.fileName, uses };
}

// ── Importers ───────────────────────────────────────────────────────────────

const SOURCE_FILE = /\.(?:[cm]?ts|[cm]?js|vue)$/;
const SKIP_DIR = /(?:^|\/)(?:node_modules|dist|cache|\.git|\.temp)(?:\/|$)/;

/** Source files that may import a module: under src/, scripts/ and the site's .vitepress folder. */
export function projectSourceFiles(root = process.cwd()): string[] {
  const out: string[] = [];
  for (const dir of ["src", "scripts", "docs/grammar/.vitepress"]) {
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(join(root, dir), { recursive: true, withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isFile() || !SOURCE_FILE.test(e.name) || e.name.endsWith(".d.ts")) continue;
      const path = join(e.parentPath, e.name);
      if (!SKIP_DIR.test(relative(root, path))) out.push(path);
    }
  }
  return out;
}

export type ImportUse = { file: string; names: string[]; typeOnly: boolean };

/** The import specifiers of one file's text, each with the names it imports (`*` for a namespace, re-export-all or dynamic import). */
export function importsOf(fileName: string, text: string): { spec: string; names: string[]; typeOnly: boolean }[] {
  const sources = fileName.endsWith(".vue") ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? "") : [text];
  const out: { spec: string; names: string[]; typeOnly: boolean }[] = [];
  for (const src of sources) {
    const sf = ts.createSourceFile(fileName.endsWith(".vue") ? `${fileName}.ts` : fileName, src, ts.ScriptTarget.Latest, true);
    const visit = (n: ts.Node): void => {
      if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
        const c = n.importClause;
        const names: string[] = [];
        if (c?.name) names.push("default");
        if (c?.namedBindings && ts.isNamespaceImport(c.namedBindings)) names.push("*");
        if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) for (const el of c.namedBindings.elements) names.push((el.propertyName ?? el.name).text);
        out.push({ spec: n.moduleSpecifier.text, names, typeOnly: c?.isTypeOnly ?? false });
      } else if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
        const names = n.exportClause && ts.isNamedExports(n.exportClause) ? n.exportClause.elements.map((el) => (el.propertyName ?? el.name).getText(sf)) : ["*"];
        out.push({ spec: n.moduleSpecifier.text, names, typeOnly: n.isTypeOnly });
      } else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteral(n.arguments[0])) {
        out.push({ spec: n.arguments[0].text, names: ["*"], typeOnly: false });
      }
      ts.forEachChild(n, visit);
    };
    visit(sf);
  }
  return out;
}

/** The names a file exports. */
export function exportsOf(fileName: string, text: string): string[] {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const out: string[] = [];
  for (const s of sf.statements) {
    if (ts.isExportDeclaration(s)) {
      if (s.exportClause && ts.isNamedExports(s.exportClause)) for (const el of s.exportClause.elements) out.push(el.name.text);
      else out.push("*");
      continue;
    }
    if (ts.isExportAssignment(s)) {
      out.push("default");
      continue;
    }
    if (!hasModifier(s, ts.SyntaxKind.ExportKeyword)) continue;
    if (hasModifier(s, ts.SyntaxKind.DefaultKeyword)) out.push("default");
    else if (ts.isVariableStatement(s)) out.push(...s.declarationList.declarations.flatMap((d) => bindingNames(d.name)).map((n) => n.text));
    else if ("name" in s && s.name && ts.isIdentifier(s.name as ts.Node)) out.push((s.name as ts.Identifier).text);
  }
  return out;
}

/** Each file that imports `target`, with the names it imports. */
export function importersOf(target: string, files: string[], options: ts.CompilerOptions): ImportUse[] {
  const want = resolve(target);
  const out: ImportUse[] = [];
  for (const file of files) {
    if (resolve(file) === want) continue;
    const text = readFileSync(file, "utf8");
    if (!text.includes("import") && !text.includes("export")) continue;
    const names = new Set<string>();
    let typeOnly = true;
    let hit = false;
    for (const imp of importsOf(file, text)) {
      if (!imp.spec.startsWith(".") && !imp.spec.startsWith("/")) continue;
      const resolved = ts.resolveModuleName(imp.spec, resolve(file), options, ts.sys).resolvedModule?.resolvedFileName;
      if (!resolved || resolve(resolved) !== want) continue;
      hit = true;
      imp.names.forEach((n) => names.add(n));
      if (!imp.typeOnly) typeOnly = false;
    }
    if (hit) out.push({ file, names: [...names].sort(), typeOnly });
  }
  return out.sort((a, b) => a.file.localeCompare(b.file));
}

// ── Size ────────────────────────────────────────────────────────────────────

const SIZED_FILE = /\.(?:ts|mjs)$/;

/**
 * Hand-written `.ts` / `.mjs` files over `n` lines under `paths` (default src/ and scripts/), largest first.
 * Skips `.d.ts`, `src/generated/` and node_modules. Paths in the result are relative to `root`.
 */
export function filesOver(n: number, paths: string[] = ["src", "scripts"], root = process.cwd()): { file: string; lines: number }[] {
  const out: { file: string; lines: number }[] = [];
  const consider = (abs: string): void => {
    const rel = relative(root, abs);
    if (!SIZED_FILE.test(rel) || rel.endsWith(".d.ts") || /(?:^|\/)node_modules\//.test(rel) || rel.startsWith("src/generated/")) return;
    const lines = lineCount(readFileSync(abs, "utf8"));
    if (lines > n) out.push({ file: rel, lines });
  };
  for (const p of paths) {
    const abs = resolve(root, p);
    let entries: import("node:fs").Dirent[] | null = null;
    try {
      entries = readdirSync(abs, { recursive: true, withFileTypes: true });
    } catch {
      consider(abs);
      continue;
    }
    for (const e of entries) if (e.isFile()) consider(join(e.parentPath, e.name));
  }
  return out.sort((a, b) => b.lines - a.lines || a.file.localeCompare(b.file));
}
