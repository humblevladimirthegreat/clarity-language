import assert from "node:assert/strict";
import { describe, it } from "node:test";

import ts from "typescript";

import { bannerGroups, checkMove, findUses, groupEdges, languageService, parseGroups, splitReport, stronglyConnected } from "./deps.ts";

const names = (edges: ReturnType<typeof groupEdges>, from: string, to: string): string[] =>
  [...(edges.find((e) => e.from === from && e.to === to)?.names.keys() ?? [])].sort();

const BANNERED = [
  'import { x } from "./x.ts";', // 1
  "", // 2
  "// ── Alpha ──────", // 3
  "export function a(): number {", // 4
  "  return b() + x;", // 5
  "}", // 6
  "// ── Beta ──", // 7
  "function b(): number {", // 8
  "  return 1;", // 9
  "}", // 10
  "const TABLE = [a];", // 11
].join("\n");

describe("groups", () => {
  it("reads banners, with the lines before the first as head", () => {
    assert.deepEqual(bannerGroups(BANNERED), [
      { name: "head", ranges: [{ start: 1, end: 2 }] },
      { name: "Alpha", ranges: [{ start: 3, end: 6 }] },
      { name: "Beta", ranges: [{ start: 7, end: 11 }] },
    ]);
  });

  it("finds edges between banner groups, both ways", () => {
    const edges = groupEdges("a.ts", BANNERED, bannerGroups(BANNERED));
    assert.deepEqual(names(edges, "Alpha", "Beta"), ["b"]);
    assert.deepEqual(names(edges, "Beta", "Alpha"), ["a"]);
    assert.equal(edges.length, 2, "the import of x is no group's declaration");
  });

  it("takes --groups ranges, several per group", () => {
    const groups = parseGroups("one:4-6,11-11,two:7-10");
    assert.deepEqual(groups[0], { name: "one", ranges: [{ start: 4, end: 6 }, { start: 11, end: 11 }] });
    const edges = groupEdges("a.ts", BANNERED, groups);
    assert.deepEqual(names(edges, "one", "two"), ["b"]);
    assert.deepEqual(names(edges, "two", "one"), []);
  });

  it("places class members by line and follows this. members across groups", () => {
    const src = [
      "class Parser {", // 1
      "  run(): number {", // 2
      "    return this.step() + helper();", // 3
      "  }", // 4
      "  // ── Steps ──", // 5
      "  step(): number {", // 6
      "    return 2;", // 7
      "  }", // 8
      "}", // 9
      "function helper(): number {", // 10
      "  return 3;", // 11
      "}", // 12
    ].join("\n");
    const edges = groupEdges("p.ts", src, bannerGroups(src));
    assert.deepEqual(names(edges, "head", "Steps"), ["Parser.step", "helper"]);
    assert.deepEqual([...edges[0]!.names.get("Parser.step")!], ["Parser.run"]);
  });

  it("does not count a local, a parameter or a property key that shares a top-level name", () => {
    const src = ["function thing(): number { return 1; }", "// ── B ──", "function f(thing: number) { const o = { thing: 2 }; return thing + o.thing; }"].join("\n");
    assert.deepEqual(groupEdges("s.ts", src, bannerGroups(src)), []);
  });
});

describe("--uses", () => {
  it("counts references through the language service, not a shadowing local", () => {
    const memory = new Map([
      ["/mem/a.ts", "export function thing(): number { return 1; }\nfunction f() { const thing = 2; return thing; }\nexport function g() { return thing(); }\n"],
      ["/mem/b.ts", 'import { thing } from "./a.ts";\nexport const v = thing();\n'],
    ]);
    const options: ts.CompilerOptions = { noLib: true, module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext, allowImportingTsExtensions: true, noEmit: true };
    const result = findUses(languageService([...memory.keys()], options, memory), "thing");
    assert.ok(!("error" in result), JSON.stringify(result));
    const uses = result.uses.filter((u) => !u.definition).map((u) => `${u.file}:${u.line} ${u.within}`);
    assert.deepEqual(uses, ["/mem/a.ts:3 g", "/mem/b.ts:1 import", "/mem/b.ts:2 v"]);
  });
});

describe("--split", () => {
  const src = [
    "export function readA(): number {", // 1
    "  return readB();", // 2
    "}", // 3
    "export const LIMIT = 3;", // 4
    "function readB(): number {", // 5
    "  return readA() + LIMIT;", // 6
    "}", // 7
    "const TABLE = { size: readB() };", // 8
  ].join("\n");

  it("allows a cycle between function-only code", () => {
    const report = splitReport("old.ts", src, parseGroups("b.ts:4-7"));
    assert.deepEqual(report.cycles, [["old.ts", "b.ts"]]);
    const reads = report.loadReads.filter((r) => r.acrossCycle);
    assert.equal(reads.length, 1, "TABLE calls readB, which reads LIMIT in its own file while old.ts loads");
    assert.equal(reads[0]!.root, "TABLE");
    assert.equal(reads[0]!.name, "LIMIT");
    assert.deepEqual(reads[0]!.chain, ["readB"]);
  });

  it("has no load-time read when the const moves with what reads it", () => {
    const report = splitReport("old.ts", src, parseGroups("b.ts:1-3"));
    assert.deepEqual(report.cycles, [["old.ts", "b.ts"]]);
    assert.deepEqual(report.loadReads, []);
  });

  it("finds a top-level read of an imported const across a cycle", () => {
    const loads = ["function f(): number { return K + g(); }", "const K = 1;", "const COPY = K;", "function g(): number { return 0; }"].join("\n");
    const report = splitReport("old.ts", loads, parseGroups("k.ts:1-2"));
    assert.deepEqual(report.cycles, [["old.ts", "k.ts"]]);
    assert.deepEqual(
      report.loadReads.map((r) => [r.root, r.name, r.acrossCycle]),
      [["COPY", "K", true]],
    );
  });

  it("reports members moved out of their class and declarations split across files", () => {
    const cls = ["class C {", "  a() { return this.b(); }", "  b() { return 1; }", "}"].join("\n");
    const report = splitReport("c.ts", cls, parseGroups("c-b.ts:3-3"));
    assert.deepEqual(report.movedMembers, [{ file: "c-b.ts", label: "C.b" }]);
    assert.deepEqual(report.straddles, []);
    assert.deepEqual(splitReport("c.ts", cls, parseGroups("x.ts:2-2;y.ts:3-4")).straddles, []);
    assert.equal(stronglyConnected(["a", "b", "c"], [["a", "b"], ["b", "a"], ["b", "c"]]).length, 2);
  });
});

describe("--check-move", () => {
  const old = ['import { x } from "./x.ts";', "", "export function a() {", "  return x;", "}", "", "function b() {", "  return 2;", "}"].join("\n");

  it("prints nothing for a pure move", () => {
    const kept = ['import { x } from "./x.ts";', 'import { b } from "./b.ts";', "", "export function a() {", "  return x;", "}"].join("\n");
    const moved = ["/** b, moved out. */", "", "export function b() {", "  return 2;", "}"].join("\n");
    assert.deepEqual(checkMove("old.ts", old, [{ file: "old.ts", text: kept }, { file: "b.ts", text: moved }]), []);
  });

  it("prints a changed line on both sides", () => {
    const kept = ['import { x } from "./x.ts";', "export function a() {", "  return x;", "}"].join("\n");
    const moved = ["export function b() {", "  return 3;", "}"].join("\n");
    assert.deepEqual(checkMove("old.ts", old, [{ file: "old.ts", text: kept }, { file: "b.ts", text: moved }]), [
      { side: "-", file: "old.ts", line: 8, text: "  return 2;" },
      { side: "+", file: "b.ts", line: 2, text: "  return 3;" },
    ]);
  });
});
