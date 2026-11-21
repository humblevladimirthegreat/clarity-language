import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { after, describe, it } from "node:test";

import { planMove } from "./move-decl.ts";

const TSCONFIG = JSON.stringify({
  compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", lib: ["ES2022"], types: [], noEmit: true, strict: true, allowImportingTsExtensions: true },
  include: ["src/**/*.ts"],
});

const dirs: string[] = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** A temp project with the given files under it; returns its root. */
function project(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "move-decl-"));
  dirs.push(root);
  writeFileSync(join(root, "tsconfig.json"), TSCONFIG);
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), text);
  }
  return root;
}

/** The planned texts by path relative to the root, or the refusals. */
function move(root: string, from: string, names: string, to: string): Record<string, string> | string[] {
  const result = planMove({ root, from, names: names.split(","), to });
  if (!result.ok) return [...result.refused, ...(result.moveLines ?? []).map((l) => `${l.side} ${l.text}`)];
  return Object.fromEntries(result.files.map((f) => [relative(root, f.file), f.text]));
}

const lines = (...l: string[]): string => `${l.join("\n")}\n`;

const A = lines(
  "/** Header of a. */",
  'import { x } from "./x.js";',
  "",
  "// ── Alpha ──",
  "/** Doc of helper. */",
  "function helper(n: number): number {",
  "  return n + x;",
  "}",
  "",
  "/** Doc of moved. */",
  "export function moved(): string {",
  "  return `${helper(1)}",
  "    kept indent`;",
  "}",
  "",
  "export type Shape = { a: number };",
  "",
  "export function stays(): number {",
  "  return moved().length;",
  "}",
);

const X = lines("export const x = 1;");
const C = lines('import { moved, stays, type Shape } from "./a.js";', "", "export const s: Shape = { a: moved().length + stays() };");

describe("move-decl", () => {
  it("moves to a new file, copying the text verbatim, and repoints importers", () => {
    const root = project({ "src/a.ts": A, "src/x.ts": X, "src/c.ts": C });
    const out = move(root, "src/a.ts", "moved,Shape", "src/b.ts");
    assert.ok(!Array.isArray(out), String(out));
    assert.equal(
      out["src/b.ts"],
      lines(
        'import { helper } from "./a.js";',
        "",
        "/** Doc of moved. */",
        "export function moved(): string {",
        "  return `${helper(1)}",
        "    kept indent`;",
        "}",
        "",
        "export type Shape = { a: number };",
      ),
    );
    assert.equal(
      out["src/a.ts"],
      lines(
        "/** Header of a. */",
        'import { moved } from "./b.js";',
        'import { x } from "./x.js";',
        "",
        "// ── Alpha ──",
        "/** Doc of helper. */",
        "export function helper(n: number): number {",
        "  return n + x;",
        "}",
        "",
        "export function stays(): number {",
        "  return moved().length;",
        "}",
      ),
    );
    assert.match(out["src/c.ts"]!, /import \{ moved, type Shape \} from "\.\/b\.js";/);
    assert.match(out["src/c.ts"]!, /import \{ stays \} from "\.\/a\.js";/);
  });

  it("moves to an existing file, after its code", () => {
    const B = lines("/** Header of b. */", 'import { x } from "./x.js";', "", "export const y = x + 1;");
    const root = project({ "src/a.ts": A, "src/x.ts": X, "src/b.ts": B });
    const out = move(root, "src/a.ts", "helper", "src/b.ts");
    assert.ok(!Array.isArray(out), String(out));
    assert.equal(
      out["src/b.ts"],
      lines(
        "/** Header of b. */",
        'import { x } from "./x.js";',
        "",
        "export const y = x + 1;",
        "",
        "/** Doc of helper. */",
        "export function helper(n: number): number {",
        "  return n + x;",
        "}",
      ),
    );
    assert.match(out["src/a.ts"]!, /import \{ helper \} from "\.\/b\.js";/);
    assert.ok(!out["src/a.ts"]!.includes("function helper"));
  });

  it("refuses a name not found or declared twice", () => {
    const root = project({ "src/a.ts": lines(A, "function helper(n: string): string {", "  return n;", "}"), "src/x.ts": X });
    const out = move(root, "src/a.ts", "nothing,helper", "src/b.ts");
    assert.deepEqual(out, ["nothing: no top-level declaration in " + join(root, "src/a.ts"), `helper: declared 2 times in ${join(root, "src/a.ts")}`]);
  });

  it("refuses a load-time read across a cycle", () => {
    const D = lines("export const BASE = 2;", "", "export const DOUBLE = BASE * 2;", "", "export function use(): number {", "  return DOUBLE;", "}");
    const root = project({ "src/d.ts": D });
    const out = move(root, "src/d.ts", "DOUBLE", "src/e.ts");
    assert.ok(Array.isArray(out));
    assert.match(out[0]!, /^load-time read across a cycle: src\/e\.ts DOUBLE reads BASE from src\/d\.ts/);
  });
});

const T = lines(
  "/** Header of t. */",
  'import { x } from "./x.js";',
  "",
  "function helper(n: number): number {",
  "  return n + x;",
  "}",
  "",
  "export class Tr {",
  "  count = 0;",
  "",
  "  /** Doc of bump. */",
  "  bump(by: number): number {",
  "    this.count += helper(by);",
  "    return this.twice(this.count);",
  "  }",
  "",
  "  twice(n: number): number {",
  "    const list = [n, n].map(() => this.count);",
  "    return list.length + `${n}",
  "  kept`.length;",
  "  }",
  "",
  "  run(): number {",
  "    const twice = 1;",
  "    return this.bump(twice) + this.twice(2);",
  "  }",
  "}",
);

/** planMove with --method: the texts and notes, or the refusals. */
function moveMethods(root: string, to: string, methods: string): { files: Record<string, string>; notes: string[] } | string[] {
  const result = planMove({ root, from: "src/t.ts", names: [], to, methods: methods.split(",") });
  if (!result.ok) return [...result.refused, ...(result.moveLines ?? []).map((l) => `${l.side} ${l.text}`)];
  return { files: Object.fromEntries(result.files.map((f) => [relative(root, f.file), f.text])), notes: result.notes };
}

describe("move-decl --method", () => {
  it("turns methods into functions and rewrites this-calls, aliasing a name taken at a call site", () => {
    const root = project({ "src/t.ts": T, "src/x.ts": X });
    const out = moveMethods(root, "src/u.ts", "Tr.bump,Tr.twice");
    assert.ok(!Array.isArray(out), String(out));
    const u = out.files["src/u.ts"]!;
    assert.match(u, /^import \{ type Tr, helper \} from "\.\/t\.js";\n/);
    assert.ok(
      u.endsWith(
        lines(
          "/** Doc of bump. */",
          "export function bump(tr: Tr, by: number): number {",
          "  tr.count += helper(by);",
          "  return twice(tr, tr.count);",
          "}",
          "",
          "export function twice(tr: Tr, n: number): number {",
          "  const list = [n, n].map(() => tr.count);",
          "  return list.length + `${n}",
          "  kept`.length;",
          "}",
        ),
      ),
      u,
    );
    const t = out.files["src/t.ts"]!;
    assert.match(t, /import \{ bump, twice as trTwice \} from "\.\/u\.js";/);
    assert.ok(t.includes("    return bump(this, twice) + trTwice(this, 2);\n"), t);
    assert.ok(!t.includes("bump(by"), t);
    assert.deepEqual(out.notes, ["src/t.ts imports twice as trTwice: twice is taken there"]);
  });

  it("picks a free parameter name and renames a function whose name TO already takes", () => {
    const tWithTr = T.replace("const list = [n, n]", "const tr = n;\n    const list = [tr, n]");
    const root = project({ "src/t.ts": tWithTr, "src/x.ts": X, "src/u.ts": lines("export const twice = 2;") });
    const out = moveMethods(root, "src/u.ts", "Tr.twice");
    assert.ok(!Array.isArray(out), String(out));
    assert.match(out.files["src/u.ts"]!, /export function trTwice\(tr2: Tr, n: number\): number \{\n {2}const tr = n;\n {2}const list = \[tr, n\]\.map\(\(\) => tr2\.count\);/);
    const t = out.files["src/t.ts"]!;
    assert.ok(t.includes("return trTwice(this, this.count);"), t);
    assert.deepEqual(out.notes, ["renamed Tr.twice to trTwice: twice is taken where it moves"]);
  });

  it("refuses private members and a use other than a this-call", () => {
    const priv = project({ "src/t.ts": T.replace("  count = 0;", "  private count = 0;"), "src/x.ts": X });
    assert.deepEqual(moveMethods(priv, "src/u.ts", "Tr.bump"), ["Tr: has private or protected members (count), which a function cannot reach"]);
    const C2 = lines('import { Tr } from "./t.js";', "", "export const n = new Tr().bump(1);");
    const used = project({ "src/t.ts": T, "src/x.ts": X, "src/c.ts": C2 });
    assert.deepEqual(moveMethods(used, "src/u.ts", "Tr.bump"), ["Tr.bump: used at src/c.ts:3 other than as a this.bump(…) call in src/t.ts"]);
  });
});
