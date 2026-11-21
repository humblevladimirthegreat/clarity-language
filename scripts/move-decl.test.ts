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
