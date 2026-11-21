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
 *   move-decl FROM [NAME[,NAME…]] --method Class.name[,…] TO
 *
 * `--method` also moves methods of a top-level class in FROM (docs/meta/code-layout.md#methods-to-functions):
 * each becomes `function name(tr: Class, …)`, `this` becomes `tr` inside it, and each `this.name(…)` call
 * becomes `name(this, …)`. The parameter is `tr` unless a moved body already uses that name, then `tr2`,
 * `tr3`, … A name taken in TO renames the function to `classMethod`; a name taken only in FROM aliases
 * FROM's import of it; each prints a line. It refuses a class with private or protected members, a generic
 * class, a static, abstract, overloaded or decorated method, a body using `super` or `arguments`, and any use
 * of the method other than a `this.name(…)` call in FROM.
 *
 * `--dry-run` writes nothing and prints the files it would write; with `--method`, also the lines that
 * differ from FROM as `deps --check-move` sees them (the signatures, call sites and `this` lines).
 *
 * Run: npm run -s move-decl -- src/interpret/read.ts readUnit,UnitKind src/interpret/read-units.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

import { BANNER, bindingNames, checkMove, headerLines, importsOf, projectSourceFiles, readProject, splitReport, type MoveLine } from "./lib/deps.ts";

/** `methods` are `Class.name` specs for --method. */
export type MoveOptions = { from: string; names: string[]; to: string; root?: string; methods?: string[] };
/** `notes` are the renames and aliases --method made; `changed` the lines that differ from FROM under --method. */
export type MoveResult =
  | { ok: true; files: { file: string; text: string }[]; notes: string[]; changed: MoveLine[] }
  | { ok: false; refused: string[]; moveLines?: MoveLine[] };

/** One moved unit: a top-level statement (or an overload run), with the comment lines directly above it. */
type Piece = { names: string[]; stmts: ts.Statement[]; start: number; end: number; startLine: number; endLine: number; text: string };

const TS_FILE = /\.[cm]?ts$/;
const FORMAT: ts.FormatCodeSettings = { ...ts.getDefaultFormatCodeSettings(), indentSize: 2, tabSize: 2, convertTabsToSpaces: true };
const PREFERENCES: ts.UserPreferences = { allowTextChangesInNewFiles: true, preferTypeOnlyAutoImports: true, importModuleSpecifierEnding: "auto", quotePreference: "double" };

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
function pieceStart(sf: ts.SourceFile, s: ts.Node): number {
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
function cutPieces(text: string, pieces: { startLine: number; endLine: number }[]): string {
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

/**
 * Give each relative import or export specifier the refactor wrote the file's ending: added where it has
 * none, swapped where it has the other one (`.ts` for `.js`). Specifiers already in `before` stay as they are.
 */
function fixSpecifiers(file: string, text: string, ending: string, before: string): string {
  const sf = parse(file, text);
  const had = new Set(before ? importsOf(file, before).map((i) => i.spec) : []);
  let out = text;
  for (const s of [...sf.statements].reverse()) {
    if (!(ts.isImportDeclaration(s) || ts.isExportDeclaration(s)) || !s.moduleSpecifier || !ts.isStringLiteral(s.moduleSpecifier)) continue;
    const spec = s.moduleSpecifier.text;
    if (!spec.startsWith(".") || had.has(spec) || spec.endsWith(ending)) continue;
    if (/\.(json|vue|css|[cm][jt]s)$/.test(spec)) continue;
    const bare = /\.[jt]s$/.test(spec) ? spec.slice(0, -3) : spec;
    const lit = s.moduleSpecifier;
    out = `${out.slice(0, lit.getStart(sf) + 1)}${bare}${ending}${out.slice(lit.getEnd() - 1)}`;
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

// ── Methods to functions ──

function walk(node: ts.Node, visit: (n: ts.Node) => void): void {
  visit(node);
  node.forEachChild((c) => walk(c, visit));
}

/** What `this` inside a node binds to: the nearest enclosing function, class member or class, arrows skipped. */
function thisOwner(node: ts.Node): ts.Node | undefined {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isArrowFunction(n)) continue;
    if (ts.isFunctionLike(n) || ts.isClassStaticBlockDeclaration(n) || ts.isPropertyDeclaration(n) || ts.isClassLike(n) || ts.isSourceFile(n)) return n;
  }
  return undefined;
}

/** The identifier that starts at `pos`. */
function identifierAt(sf: ts.SourceFile, pos: number): ts.Identifier | undefined {
  let hit: ts.Identifier | undefined;
  const go = (n: ts.Node): void => {
    if (hit || pos < n.pos || pos >= n.end) return;
    if (ts.isIdentifier(n) && n.getStart(sf) === pos) hit = n;
    else n.forEachChild(go);
  };
  go(sf);
  return hit;
}

/** The top-level class member (or top-level statement) that holds a node. */
function memberOf(node: ts.Node): ts.Node {
  let n = node;
  while (n.parent && !ts.isSourceFile(n.parent) && !(ts.isClassDeclaration(n.parent) && ts.isSourceFile(n.parent.parent))) n = n.parent;
  return n;
}

/** Names a file declares or imports at top level. */
function topNames(sf: ts.SourceFile): Set<string> {
  const out = new Set(sf.statements.flatMap(declaredNames));
  for (const s of sf.statements) {
    const c = ts.isImportDeclaration(s) ? s.importClause : undefined;
    if (c?.name) out.add(c.name.text);
    const b = c?.namedBindings;
    if (b && ts.isNamespaceImport(b)) out.add(b.name.text);
    else if (b) for (const e of b.elements) out.add(e.name.text);
  }
  return out;
}

/** Names declared anywhere inside a node: variables, parameters, functions, classes. */
function declaredIn(node: ts.Node): Set<string> {
  const out = new Set<string>();
  walk(node, (n) => {
    if (ts.isVariableDeclaration(n) || ts.isParameter(n) || ts.isBindingElement(n)) for (const id of bindingNames(n.name)) out.add(id.text);
    else if ((ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isClassDeclaration(n) || ts.isClassExpression(n)) && n.name) out.add(n.name.text);
  });
  return out;
}

/** Identifiers inside a node that name a binding, not a property. */
function referencedIn(node: ts.Node): Set<string> {
  const out = new Set<string>();
  walk(node, (n) => {
    if (!ts.isIdentifier(n)) return;
    const p = n.parent;
    const property =
      (ts.isPropertyAccessExpression(p) && p.name === n) ||
      ((ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p) || ts.isPropertyDeclaration(p) || ts.isPropertySignature(p) || ts.isMethodSignature(p)) && p.name === n) ||
      (ts.isQualifiedName(p) && p.right === n) ||
      (ts.isBindingElement(p) && p.propertyName === n);
    if (!property) out.add(n.text);
  });
  return out;
}

type MovedMethod = { spec: string; cls: string; name: string; node: ts.MethodDeclaration; start: number; startLine: number; endLine: number; calls: ts.CallExpression[] };
/** FROM with the methods turned into functions at its end; `aliases` maps a function's name in FROM to its name in TO. */
type MethodPlan = { ok: true; text: string; names: string[]; notes: string[]; aliases: Map<string, string> } | { ok: false; refused: string[] };

/** Find each `Class.name` method, or the reasons to refuse it. */
function findMethods(sf: ts.SourceFile, specs: string[], rel: string): { moved: MovedMethod[]; refused: string[] } {
  const text = sf.text;
  const refused: string[] = [];
  const moved: MovedMethod[] = [];
  const checked = new Set<string>();
  for (const spec of specs) {
    const [cName, mName, ...extra] = spec.split(".");
    if (!cName || !mName || extra.length) {
      refused.push(`${spec}: not Class.method`);
      continue;
    }
    const cls = sf.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && s.name?.text === cName);
    if (!cls) {
      refused.push(`${cName}: no top-level class in ${rel}`);
      continue;
    }
    if (!checked.has(cName)) {
      checked.add(cName);
      if (cls.typeParameters) refused.push(`${cName}: a generic class`);
      const hidden = cls.members.filter((m) => (m.name && ts.isPrivateIdentifier(m.name)) || hasModifier(m, ts.SyntaxKind.PrivateKeyword) || hasModifier(m, ts.SyntaxKind.ProtectedKeyword));
      if (hidden.length) refused.push(`${cName}: has private or protected members (${hidden.map((m) => m.name?.getText(sf) ?? "constructor").join(", ")}), which a function cannot reach`);
    }
    const members = cls.members.filter((m) => m.name?.getText(sf) === mName);
    const node = members[0];
    if (!node) {
      refused.push(`${spec}: no member ${mName} in ${cName}`);
      continue;
    }
    if (members.length > 1 || !ts.isMethodDeclaration(node) || !node.body || !ts.isIdentifier(node.name)) {
      refused.push(`${spec}: not one method with a body (an overload, a field, an accessor)`);
      continue;
    }
    const bad = (ts.getModifiers(node) ?? []).filter((m) => m.kind !== ts.SyntaxKind.PublicKeyword && m.kind !== ts.SyntaxKind.AsyncKeyword);
    if (bad.length || ts.getDecorators(node)?.length || node.questionToken) {
      refused.push(`${spec}: ${bad.length ? `a ${bad.map((m) => m.getText(sf)).join(" ")}` : "a decorated or optional"} method`);
      continue;
    }
    const first = node.parameters[0];
    if (first && ts.isIdentifier(first.name) && first.name.text === "this") refused.push(`${spec}: declares a this parameter`);
    walk(node, (n) => {
      const what = n.kind === ts.SyntaxKind.SuperKeyword ? "super" : ts.isIdentifier(n) && n.text === "arguments" && thisOwner(n) === node ? "arguments" : "";
      if (what) refused.push(`${spec}: uses ${what} at ${rel}:${lineOf(sf, n.getStart(sf))}`);
    });
    const begin = node.getStart(sf);
    const lineEnd = text.indexOf("\n", node.end);
    if (text.slice(lineStart(text, begin), begin).trim() !== "" || text.slice(node.end, lineEnd < 0 ? text.length : lineEnd).trim() !== "") {
      refused.push(`${spec}: shares a line with other code`);
      continue;
    }
    const start = pieceStart(sf, node);
    moved.push({ spec, cls: cName, name: mName, node, start, startLine: lineOf(sf, start), endLine: lineOf(sf, node.end), calls: [] });
  }
  return { moved, refused };
}

/** Rewrite a call `this.name(…)` (or `tr.name(…)`) as `fn(recv, …)`. */
function callChanges(sf: ts.SourceFile, call: ts.CallExpression, fn: string, recv: string, shift = 0): ts.TextChange[] {
  const pa = call.expression as ts.PropertyAccessExpression;
  const open = sf.text.indexOf("(", call.typeArguments ? call.typeArguments.end : pa.end);
  const arg = call.arguments[0];
  const sep = !arg ? "" : sf.text.slice(open + 1, arg.getStart(sf)).includes("\n") ? "," : ", ";
  const start = pa.getStart(sf);
  return [
    { span: { start: start - shift, length: pa.end - start }, newText: fn },
    { span: { start: open + 1 - shift, length: 0 }, newText: `${recv}${sep}` },
  ];
}

/**
 * Turn the methods into functions at the end of FROM, so the top-level move can take them: each signature
 * gains the class parameter, `this` becomes that parameter, and each `this.name(…)` call becomes `name(this, …)`.
 */
function methodsToFunctions(sf: ts.SourceFile, specs: string[], service: ts.LanguageService, toSf: ts.SourceFile | undefined, root: string): MethodPlan {
  const text = sf.text;
  const from = resolve(sf.fileName);
  const rel = relative(root, from);
  const { moved, refused } = findMethods(sf, specs, rel);
  if (refused.length) return { ok: false, refused };
  const program = service.getProgram();
  for (const m of moved) {
    const at = m.node.name.getStart(sf);
    for (const sym of service.findReferences(from, at) ?? []) {
      for (const ref of sym.references) {
        const here = resolve(ref.fileName) === from;
        if (here && ref.textSpan.start === at) continue;
        const id = here ? identifierAt(sf, ref.textSpan.start) : undefined;
        const pa = id?.parent;
        const call = pa?.parent;
        if (!pa || !call || !ts.isPropertyAccessExpression(pa) || pa.name !== id || pa.expression.kind !== ts.SyntaxKind.ThisKeyword || pa.questionDotToken || !ts.isCallExpression(call) || call.expression !== pa || call.questionDotToken) {
          const refSf = program?.getSourceFile(ref.fileName);
          const line = refSf ? lineOf(refSf, ref.textSpan.start) : 0;
          refused.push(`${m.spec}: used at ${relative(root, ref.fileName)}:${line} other than as a this.${m.name}(…) call in ${rel}`);
          continue;
        }
        m.calls.push(call);
      }
    }
  }
  if (refused.length) return { ok: false, refused };
  const idents = new Set<string>();
  for (const m of moved) walk(m.node, (n) => ts.isIdentifier(n) && idents.add(n.text));
  let param = "tr";
  for (let i = 2; idents.has(param); i++) param = `tr${i}`;
  // Names: a clash in TO renames the function; a clash only in FROM aliases FROM's import of it.
  const fromTop = topNames(sf);
  const toTop = toSf ? topNames(toSf) : new Set<string>();
  const usedInMoved = new Set(moved.flatMap((m) => [...referencedIn(m.node)]));
  const movedNodes = new Set<ts.Node>(moved.map((m) => m.node));
  const taken = new Set([...referencedIn(sf), ...declaredIn(sf), ...fromTop, ...toTop, ...(toSf ? referencedIn(toSf) : [])]);
  const fnName = new Map<MovedMethod, string>();
  const notes: string[] = [];
  const aliases = new Map<string, string>();
  for (const m of moved) {
    const callers = (inMoved: boolean): ts.Node[] => m.calls.map(memberOf).filter((c) => movedNodes.has(c) === inMoved);
    const localIn = (members: ts.Node[]): boolean => members.some((c) => declaredIn(c).has(m.name));
    const toClash = toTop.has(m.name) || (fromTop.has(m.name) && usedInMoved.has(m.name)) || localIn(callers(true));
    const fromClash = fromTop.has(m.name) || localIn(callers(false));
    if (!toClash && !fromClash) {
      fnName.set(m, m.name);
      continue;
    }
    const base = `${m.cls[0]!.toLowerCase()}${m.cls.slice(1)}${m.name[0]!.toUpperCase()}${m.name.slice(1)}`;
    let alias = base;
    for (let i = 2; taken.has(alias); i++) alias = `${base}${i}`;
    taken.add(alias);
    fnName.set(m, alias);
    if (toClash) notes.push(`renamed ${m.spec} to ${alias}: ${m.name} is taken where it moves`);
    else {
      aliases.set(alias, m.name);
      notes.push(`${rel} imports ${m.name} as ${alias}: ${m.name} is taken there`);
    }
  }
  // Calls in code that stays.
  const changes = moved.flatMap((m) => m.calls.filter((c) => !movedNodes.has(memberOf(c))).flatMap((c) => callChanges(sf, c, fnName.get(m)!, "this")));
  const functions = moved.map((m) => {
    const node = m.node;
    const local: ts.TextChange[] = [];
    const open = text.indexOf("(", node.typeParameters ? node.typeParameters.end : node.name.end);
    const first = node.parameters[0];
    const sep = !first ? "" : text.slice(open + 1, first.getStart(sf)).includes("\n") ? "," : ", ";
    const begin = node.getStart(sf);
    const head = `${hasModifier(node, ts.SyntaxKind.AsyncKeyword) ? "async " : ""}function${node.asteriskToken ? "*" : ""} ${fnName.get(m)}${text.slice(node.name.end, open)}(${param}: ${m.cls}${sep}`;
    local.push({ span: { start: begin - m.start, length: open + 1 - begin }, newText: head });
    const covered = new Set<ts.Node>();
    for (const o of moved) {
      for (const c of o.calls) {
        if (memberOf(c) !== node) continue;
        covered.add((c.expression as ts.PropertyAccessExpression).expression);
        local.push(...callChanges(sf, c, fnName.get(o)!, param, m.start));
      }
    }
    walk(node, (n) => {
      if (n.kind === ts.SyntaxKind.ThisKeyword && !covered.has(n) && thisOwner(n) === node) local.push({ span: { start: n.getStart(sf) - m.start, length: n.end - n.getStart(sf) }, newText: param });
    });
    // Drop the member's indent, except on lines that start inside a template literal, where it is content.
    const indent = text.slice(lineStart(text, begin), begin);
    const inTemplate = new Set<number>();
    walk(node, (n) => {
      if (ts.isTemplateExpression(n) || ts.isNoSubstitutionTemplateLiteral(n)) for (let l = lineOf(sf, n.getStart(sf)) + 1; l <= lineOf(sf, n.end); l++) inTemplate.add(l);
    });
    const seg = applyChanges(text.slice(m.start, node.end), local);
    return seg
      .split("\n")
      .map((line, i) => (inTemplate.has(m.startLine + i) || !line.startsWith(indent) ? line : line.slice(indent.length)))
      .join("\n");
  });
  const kept = cutPieces(applyChanges(text, changes), moved);
  return { ok: true, text: `${kept.trimEnd()}\n\n${functions.join("\n\n")}\n`, names: moved.map((m) => fnName.get(m)!), notes, aliases };
}

/** Give each aliased function its own name in TO, and import it under the alias in FROM. */
function restoreAliases(next: Map<string, string>, from: string, to: string, aliases: Map<string, string>): void {
  if (!aliases.size) return;
  const toText = next.get(to)!;
  const toSf = parse(to, toText);
  const toChanges: ts.TextChange[] = [];
  walk(toSf, (n) => {
    if (ts.isIdentifier(n) && aliases.has(n.text)) toChanges.push({ span: { start: n.getStart(toSf), length: n.end - n.getStart(toSf) }, newText: aliases.get(n.text)! });
  });
  next.set(to, applyChanges(toText, toChanges));
  const fromText = next.get(from)!;
  const fromSf = parse(from, fromText);
  const fromChanges: ts.TextChange[] = [];
  walk(fromSf, (n) => {
    if (ts.isImportSpecifier(n) && !n.propertyName && aliases.has(n.name.text)) {
      fromChanges.push({ span: { start: n.name.getStart(fromSf), length: n.name.end - n.name.getStart(fromSf) }, newText: `${aliases.get(n.name.text)!} as ${n.name.text}` });
    }
  });
  next.set(from, applyChanges(fromText, fromChanges));
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
  const diskText = readFileSync(from, "utf8");
  const toExists = existsSync(to);
  const toText = toExists ? readFileSync(to, "utf8") : "";
  const sources = projectSourceFiles(root);
  const roots = new Set([...project.fileNames.map((f) => resolve(f)), ...sources.filter((f) => TS_FILE.test(f) && !f.endsWith(".d.ts")).map((f) => resolve(f))]);
  const fileNames = [...roots, ...(roots.has(to) ? [] : [to])];
  const { service, set, read } = overlayService(fileNames, options, root);
  if (!toExists) set(to, "");
  // --method: the methods become functions at the end of FROM first; the move below takes them from there.
  let fromText = diskText;
  let names = opts.names;
  let method: Extract<MethodPlan, { ok: true }> | undefined;
  if (opts.methods?.length) {
    const plan = methodsToFunctions(parse(from, diskText), opts.methods, service, toExists ? parse(to, toText) : undefined, root);
    if (!plan.ok) return { ok: false, refused: plan.refused };
    method = plan;
    fromText = plan.text;
    names = [...names, ...plan.names];
  }
  const fromSf = parse(from, fromText);
  const { pieces, refused } = findPieces(fromSf, names);
  const moved = new Set(pieces.flatMap((p) => p.names));
  // A file the language service does not see may call a moved method through its class.
  const watched = new Set([...moved, ...(opts.methods ?? []).map((s) => s.split(".")[0]!)]);
  if (toExists) {
    const clash = parse(to, toText).statements.flatMap(declaredNames).filter((n) => moved.has(n));
    for (const n of new Set(clash)) refused.push(`${n}: already declared in ${relTo}`);
  }
  // Importers the language service does not see.
  for (const file of sources) {
    if (roots.has(resolve(file)) || resolve(file) === from) continue;
    const text = readFileSync(file, "utf8");
    if (!text.includes(relFrom.split("/").pop()!.replace(TS_FILE, ""))) continue;
    for (const imp of importsOf(file, text)) {
      if (!imp.spec.startsWith(".")) continue;
      const hit = ts.resolveModuleName(imp.spec, resolve(file), options, ts.sys).resolvedModule?.resolvedFileName;
      if (!hit || resolve(hit) !== from) continue;
      const names = imp.names.filter((n) => n === "*" || watched.has(n));
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
  for (const [file, text] of next) next.set(file, fixSpecifiers(file, text, file === to && !toExists ? fromEnding : specifierEnding(read(file) ?? text, file), file === to && !toExists ? "" : (read(file) ?? "")));
  // Checks: no line on only one side, no new type error in an edited file.
  const oldTo = toExists ? toText.split("\n").filter((_, i) => !headerLines(toText).has(i + 1)).join("\n") : "";
  const moveLines = checkMove(from, toExists ? `${fromText}\n${oldTo}` : fromText, [
    { file: from, text: next.get(from)! },
    { file: to, text: next.get(to)! },
  ]);
  if (moveLines.length) return { ok: false, refused: ["the move check found lines on only one side"], moveLines };
  if (method) restoreAliases(next, from, to, method.aliases);
  const changed = method ? checkMove(from, toExists ? `${diskText}\n${oldTo}` : diskText, [...next].filter(([f]) => f === from || f === to).map(([file, text]) => ({ file, text }))) : [];
  set(from, diskText);
  if (toExists) set(to, toText);
  const before = new Map([...next.keys()].map((f) => [f, f === to && !toExists ? new Map<string, number>() : diagnosticKeys(service, f)]));
  for (const [file, text] of next) set(file, text);
  for (const [file] of next) {
    const was = before.get(file)!;
    for (const [key, n] of diagnosticKeys(service, file)) if (n > (was.get(key) ?? 0)) refused.push(`${relative(root, file)}: new type error: ${key}`);
  }
  if (refused.length) return { ok: false, refused };
  return { ok: true, files: [...next].map(([file, text]) => ({ file, text })), notes: method?.notes ?? [], changed };
}

function main(): void {
  const args = process.argv.slice(2);
  const methods: string[] = [];
  const positional: string[] = [];
  let dryRun = false;
  let bad = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--method" && args[i + 1]) methods.push(...args[++i]!.split(",").filter(Boolean));
    else if (a.startsWith("-")) bad = true;
    else positional.push(a);
  }
  if (bad || !(positional.length === 3 || (positional.length === 2 && methods.length))) {
    console.error("Usage: npm run -s move-decl -- [--dry-run] FROM [NAME[,NAME…]] [--method Class.name[,…]] TO");
    process.exit(2);
  }
  const [from, names, to] = (positional.length === 3 ? positional : [positional[0], "", positional[1]]) as [string, string, string];
  const result = planMove({ from, names: names.split(",").filter(Boolean), to, methods });
  if (!result.ok) {
    for (const r of result.refused) console.error(`move-decl: refused: ${r}`);
    for (const d of result.moveLines ?? []) console.error(`${d.side} ${relative(process.cwd(), d.file)}:${d.line}  ${d.text.trim()}`);
    process.exit(1);
  }
  for (const n of result.notes) console.log(`move-decl: ${n}`);
  if (dryRun) {
    for (const f of result.files) console.log(`would write ${relative(process.cwd(), f.file)}`);
    for (const d of result.changed) console.log(`${d.side} ${relative(process.cwd(), d.file)}:${d.line}  ${d.text.trim()}`);
    return;
  }
  for (const f of result.files) {
    mkdirSync(dirname(f.file), { recursive: true });
    writeFileSync(f.file, f.text);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
