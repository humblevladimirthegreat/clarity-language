/**
 * Dependencies inside and between source files, for splitting large files. Logic in scripts/lib/deps.ts.
 *
 *   deps FILE [--groups "name:a-b,c-d,other:e-f"]
 *       Edges between groups of one file: which top-level names and class members (`Class.member`)
 *       each group uses from each other group. Groups default to the file's `// ── Title ──` banners,
 *       with the lines before the first banner as `head`; a class member belongs to the group its line
 *       falls in.
 *   deps --uses NAME [FILE]
 *       Every reference to a top-level NAME (`Class.member` for a member), in its own file and others,
 *       from the language service over tsconfig.json: a local that shadows the name is not counted.
 *   deps --importers FILE
 *       Each export of FILE and the files (src/, scripts/, the site's .vitepress) that import it.
 *   deps --split FILE "new-a.ts:a-b,c-d;new-b.ts:e-f"
 *       The import graph the split would give (unlisted lines stay in FILE): imports between the
 *       resulting files, each cycle, and each load-time read (a top-level initializer, static field or
 *       top-level call that reads another resulting file's const, let, class or enum while loading,
 *       through any functions it calls). Function-only cycles are allowed; a load-time read across a
 *       cycle fails (exit 1).
 *   deps --check-move REV:FILE FILE…
 *       Lines found on only one side between the old file at REV and the union of the new files,
 *       ignoring imports, export lists, blank lines, indentation, a leading `export ` and new files'
 *       header comments. A pure move prints nothing; any line fails (exit 1).
 *   deps --over N [PATH…]
 *       Hand-written .ts / .mjs files over N lines (default under src/ and scripts/), largest first.
 *
 * Run: npm run -s deps -- src/interpret/read.ts
 *      npm run -s deps -- --uses Ctx src/interpret/read.ts
 *      npm run -s deps -- --split src/interpret/read.ts "src/interpret/read-units.ts:747-1123"
 *      npm run -s deps -- --check-move HEAD:src/interpret/read.ts src/interpret/read.ts src/interpret/read-units.ts
 */
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import {
  bannerGroups,
  checkMove,
  exportsOf,
  filesOver,
  findUses,
  gitShow,
  groupEdges,
  importersOf,
  languageService,
  parseGroups,
  projectSourceFiles,
  readProject,
  splitReport,
  type Group,
} from "./lib/deps.ts";

const USAGE = `Usage: npm run -s deps -- FILE [--groups SPEC]
       npm run -s deps -- --uses NAME [FILE]
       npm run -s deps -- --importers FILE
       npm run -s deps -- --split FILE "new-a.ts:a-b,c-d;new-b.ts:e-f"
       npm run -s deps -- --check-move REV:FILE FILE…
       npm run -s deps -- --over N [PATH…]`;

const rel = (p: string): string => relative(process.cwd(), p) || p;
const ranges = (g: Group): string => g.ranges.map((r) => `${r.start}-${r.end}`).join(",");
const MAX_USERS = 6;

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function edgesMode(file: string, spec: string | undefined): void {
  const text = readFileSync(file, "utf8");
  const groups = spec ? parseGroups(spec) : bannerGroups(text);
  console.log(`${file}: ${groups.length} groups (${spec ? "--groups" : "banners"})`);
  console.log(`  ${groups.map((g) => `${g.name} ${ranges(g)}`).join(" · ")}`);
  const edges = groupEdges(file, text, groups);
  if (edges.length === 0) console.log("No edges between groups.");
  for (const e of edges) {
    console.log(`${e.from} -> ${e.to}  (${e.names.size} name${e.names.size === 1 ? "" : "s"})`);
    for (const [name, users] of e.names) {
      const list = [...users];
      const more = list.length > MAX_USERS ? ` +${list.length - MAX_USERS}` : "";
      console.log(`    ${name}  <- ${list.slice(0, MAX_USERS).join(", ")}${more}`);
    }
  }
}

function usesMode(name: string, file: string | undefined): void {
  const project = readProject();
  const service = languageService(project.fileNames, project.options);
  const result = findUses(service, name, file);
  if ("error" in result) fail(result.error);
  const others = new Set(result.uses.filter((u) => !u.definition).map((u) => u.file));
  console.log(`${name} (${rel(result.declFile)}): ${result.uses.filter((u) => !u.definition).length} references in ${others.size} files`);
  let banners: Group[] | null = null;
  let current = "";
  for (const u of result.uses) {
    if (u.file !== current) {
      current = u.file;
      console.log(rel(u.file));
    }
    let where = u.within;
    if (u.file === result.declFile) {
      banners ??= bannerGroups(readFileSync(u.file, "utf8"));
      if (banners.length > 1) where = `${where} [${banners.find((g) => g.ranges.some((r) => u.line >= r.start && u.line <= r.end))?.name ?? "?"}]`;
    }
    console.log(`  ${String(u.line).padStart(5)}${u.definition ? " def" : "    "}  ${where}  ${u.text.length > 100 ? `${u.text.slice(0, 97)}…` : u.text}`);
  }
}

function importersMode(file: string): void {
  const project = readProject();
  const importers = importersOf(file, projectSourceFiles(), project.options);
  const exports = exportsOf(file, readFileSync(file, "utf8"));
  console.log(`${file}: ${exports.length} exports, ${importers.length} importing files`);
  const byName = new Map<string, string[]>();
  for (const imp of importers) {
    for (const n of imp.names) {
      if (!byName.has(n)) byName.set(n, []);
      byName.get(n)!.push(`${rel(imp.file)}${imp.typeOnly ? " (type)" : ""}`);
    }
  }
  for (const name of exports) {
    const users = byName.get(name) ?? [];
    console.log(`  ${name}  (${users.length})${users.length ? `  ${users.join(", ")}` : ""}`);
  }
  for (const [name, users] of byName) {
    if (exports.includes(name)) continue;
    console.log(`  ${name === "*" ? "* (namespace, re-export or dynamic)" : `${name} (not exported)`}  (${users.length})  ${users.join(", ")}`);
  }
  const unused = exports.filter((n) => !byName.has(n));
  if (unused.length) console.log(`Not imported anywhere: ${unused.join(", ")}`);
}

function splitMode(file: string, spec: string): void {
  const text = readFileSync(file, "utf8");
  const parts = parseGroups(spec);
  const report = splitReport(file, text, parts);
  console.log(`Split of ${file}: ${parts.map((p) => `${p.name} ${ranges(p)}`).join(" · ")}; the rest stays`);
  for (const s of report.straddles) console.log(`WARN ${s.label} (${s.start}-${s.end}) falls in more than one file`);
  if (report.movedMembers.length) {
    const byFile = new Map<string, string[]>();
    for (const m of report.movedMembers) byFile.set(m.file, [...(byFile.get(m.file) ?? []), m.label]);
    for (const [f, labels] of byFile) console.log(`Members moved out of their class into ${f} (they become functions): ${labels.join(", ")}`);
  }
  console.log("Imports between the resulting files:");
  if (report.imports.length === 0) console.log("  none");
  for (const imp of report.imports) {
    const parts2 = [imp.names.join(", "), imp.typeNames.length ? `type ${imp.typeNames.join(", ")}` : ""].filter(Boolean);
    console.log(`  ${imp.from} -> ${imp.to}: ${parts2.join("; ")}`);
  }
  if (report.cycles.length === 0) console.log("Cycles: none");
  for (const c of report.cycles) console.log(`Cycle: ${c.join(" <-> ")}`);
  const bad = report.loadReads.filter((r) => r.acrossCycle);
  if (report.loadReads.length === 0) console.log("Load-time reads across files: none");
  for (const r of report.loadReads) {
    const via = r.chain.length ? ` via ${r.chain.join(" -> ")}` : "";
    console.log(`${r.acrossCycle ? "FAIL" : "ok  "} load-time read: ${r.file} ${r.root}${via} reads ${r.name} from ${r.target} (line ${r.line})${r.acrossCycle ? ", across a cycle" : ""}`);
  }
  if (bad.length) {
    console.log(`${bad.length} load-time read${bad.length === 1 ? "" : "s"} across a cycle: move each const with what it reads.`);
    process.exit(1);
  }
}

function checkMoveMode(revFile: string, files: string[]): void {
  const colon = revFile.indexOf(":");
  if (colon < 1) fail(`--check-move wants REV:FILE, got "${revFile}"`);
  const oldPath = revFile.slice(colon + 1);
  const diff = checkMove(oldPath, gitShow(revFile), files.map((f) => ({ file: f, text: readFileSync(f, "utf8") })));
  for (const d of diff) console.log(`${d.side} ${d.side === "-" ? revFile : d.file}:${d.line}  ${d.text.trim()}`);
  if (diff.length) process.exit(1);
}

function overMode(n: number, paths: string[]): void {
  const rows = filesOver(n, paths.length ? paths : undefined);
  console.log(`${rows.length} file${rows.length === 1 ? "" : "s"} over ${n} lines`);
  for (const r of rows) console.log(`  ${String(r.lines).padStart(6)}  ${r.file}`);
}

function main(): void {
  const args = process.argv.slice(2);
  const flag = (name: string): number => args.indexOf(name);
  if (args.length === 0 || flag("--help") >= 0) fail(USAGE);
  if (flag("--uses") >= 0) {
    const i = flag("--uses");
    const name = args[i + 1] ?? fail(USAGE);
    return usesMode(name, args.filter((_, k) => k !== i && k !== i + 1)[0]);
  }
  if (flag("--importers") >= 0) return importersMode(args[flag("--importers") + 1] ?? fail(USAGE));
  if (flag("--split") >= 0) {
    const i = flag("--split");
    return splitMode(args[i + 1] ?? fail(USAGE), args[i + 2] ?? fail(USAGE));
  }
  if (flag("--check-move") >= 0) {
    const i = flag("--check-move");
    const files = args.slice(i + 2);
    if (files.length === 0) fail(USAGE);
    return checkMoveMode(args[i + 1] ?? fail(USAGE), files);
  }
  if (flag("--over") >= 0) {
    const i = flag("--over");
    const n = Number(args[i + 1]);
    if (!Number.isInteger(n) || n < 0) fail(USAGE);
    return overMode(n, args.slice(i + 2));
  }
  const g = flag("--groups");
  const spec = g >= 0 ? (args[g + 1] ?? fail(USAGE)) : undefined;
  const files = args.filter((_, k) => g < 0 || (k !== g && k !== g + 1));
  if (files.length !== 1) fail(USAGE);
  edgesMode(files[0]!, spec);
}

main();
