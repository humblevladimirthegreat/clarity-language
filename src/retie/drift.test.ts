import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { applyResumeKeeps, bareResumeDrift, lintPage, newLintFindings, rootsInUse } from "./drift.js";
import { retieTables } from "./tables.js";

const tables = loadDefaultTables();
const CLEAN = "Say `zazawan vowogal.` here.\n";
const BROKEN = "Say `zazawan vozqzqol.` here.\n";

describe("rootsInUse", () => {
  it("collects content roots of non-resume words in code spans", () => {
    const roots = rootsInUse(["Say `zazawan vowogal.` and `zazawar`.", "`thagazam`"]);
    assert.ok(roots.has("azawa"));
    assert.ok(roots.has("agaza"));
    assert.ok(!roots.has("zazawar"));
  });

  it("skips English in code spans", () => {
    assert.deepEqual([...rootsInUse(["Run `npm test` first."])], []);
  });
});

describe("lintPage", () => {
  it("passes a page whose Agazan parses against the lexicon", () => {
    assert.deepEqual(lintPage("p.md", CLEAN, tables), []);
  });

  it("reports findings with the page path and line", () => {
    const findings = lintPage("p.md", `Intro.\n\n${BROKEN}`, tables);
    assert.ok(findings.length > 0);
    assert.ok(findings.every((f) => f.startsWith("p.md:3  ")));
  });
});

describe("newLintFindings", () => {
  it("ignores findings the page already had, even when their line moves", () => {
    assert.deepEqual(newLintFindings("p.md", BROKEN, `Intro.\n\n${BROKEN}`, tables, tables), []);
  });

  it("returns only the findings the edit added", () => {
    const added = newLintFindings("p.md", CLEAN, `${CLEAN}\n${BROKEN}`, tables, tables);
    assert.deepEqual(added, lintPage("p.md", `${CLEAN}\n${BROKEN}`, tables));
  });
});

describe("bareResumeDrift", () => {
  it("finds nothing when the page is unchanged", () => {
    const rt = retieTables(new Map());
    assert.deepEqual(bareResumeDrift("See `zazawar`.", "See `zazawar`.", new Map(), rt, new Set()), []);
  });
});

describe("applyResumeKeeps", () => {
  it("respells a bare resume the retie left unchanged, and leaves one it respelled for review", () => {
    const after = "`bodor` binds the door; `zabur` names it.\n";
    const left = { index: after.indexOf("zabur"), from: "zaber", to: "zabur", was: "z-←paw-prints", reads: 'z-←"abu"', keep: "zobar" };
    const unchanged = { index: after.indexOf("bodor"), from: "bodor", to: "bodor", was: "b-←door", reads: "b-←attest", keep: "boyer" };
    const result = applyResumeKeeps(after, [left, unchanged]);
    assert.equal(result.text, "`boyer` binds the door; `zabur` names it.\n");
    assert.deepEqual(result.applied, [unchanged]);
    assert.deepEqual(result.left, [left]);
  });
});
