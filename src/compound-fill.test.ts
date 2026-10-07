import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  draftCompounds,
  headCounts,
  headReport,
  resolveCue,
  senseCoverage,
  type DraftRow,
  type Lexicon,
} from "./compound-fill.js";
import { parseCompoundCsv } from "./lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv } from "./lexicon-search.js";
import { readData } from "./repo-paths.js";

const lexicon: Lexicon = {
  published: parsePublishedCsv(readData("lexicon-published.csv")),
  compounds: parseCompoundCsv(readData("lexicon-compounds.csv")),
  overlays: parseOverlayCsv(readData("lexicon-overlays.csv")),
};
const bySeed = (seed: string) => lexicon.published.find((row) => row.emoji === seed)!;

const draft = (over: Partial<DraftRow>): DraftRow => ({
  english: "test-kind",
  left: "🍕",
  join: "l",
  head: "🌿",
  abstract: "",
  mnemonic: "pizza specifying herb is a test",
  ...over,
});

describe("resolveCue", () => {
  it("finds a root by seed, spelling, and concrete label", () => {
    const herb = bySeed("🌿");
    for (const cue of ["🌿", herb.root, herb.concrete]) {
      const hit = resolveCue(cue, lexicon.published);
      assert.ok(hit.ok, cue);
      assert.equal(hit.row.root, herb.root);
    }
  });

  it("ignores the emoji variation selector", () => {
    const row = lexicon.published.find((r) => r.emoji.includes("️"))!;
    const hit = resolveCue(row.emoji.replace(/️/g, ""), lexicon.published);
    assert.ok(hit.ok);
    assert.equal(hit.row.root, row.root);
  });

  it("reports an unknown cue", () => {
    assert.equal(resolveCue("no-such-word-anywhere", lexicon.published).ok, false);
  });
});

describe("senseCoverage", () => {
  it("finds root and compound senses", () => {
    const herb = bySeed("🌿");
    assert.ok(senseCoverage(herb.concrete, lexicon).some((h) => h.kind === "concrete" && h.form === herb.root));
    const compound = lexicon.compounds.find((c) => c.right !== "" && c.concrete)!;
    assert.ok(senseCoverage(compound.concrete, lexicon).some((h) => h.form === compound.stem));
  });

  it("finds aliases", () => {
    const row = lexicon.published.find((r) => r.englishAliases?.length)!;
    assert.ok(senseCoverage(row.englishAliases![0]!, lexicon).some((h) => h.kind === "alias"));
  });
});

describe("headReport / headCounts", () => {
  it("lists compounds headed by a root", () => {
    const [top] = headCounts(lexicon);
    const report = headReport(top!.row, lexicon.compounds);
    assert.equal(report.headed.length, top!.count);
    assert.ok(report.headed.every((c) => c.right === top!.row.root));
  });
});

describe("draftCompounds", () => {
  it("spells the stem from the published roots", () => {
    const [result] = draftCompounds([draft({})], lexicon);
    assert.deepEqual(result!.errors, []);
    assert.equal(result!.compound!.stem, `${bySeed("🍕").root}l${bySeed("🌿").root}`);
  });

  it("rejects a gloss that is already a compound sense", () => {
    const existing = lexicon.compounds.find((c) => c.concrete)!;
    const [result] = draftCompounds([draft({ english: existing.concrete })], lexicon);
    assert.ok(result!.errors.some((e) => e.includes("already the sense of")));
  });

  it("rejects two drafts with the same stem", () => {
    const results = draftCompounds([draft({}), draft({ english: "other-kind" })], lexicon);
    assert.deepEqual(results[0]!.errors, []);
    assert.ok(results[1]!.errors.some((e) => e.startsWith("duplicate stem")));
  });

  it("rejects -m on a left root with no abstract", () => {
    const [result] = draftCompounds([draft({ left: "🌿", head: "🍕", join: "m" })], lexicon);
    assert.ok(result!.errors.some((e) => e.includes("has none")));
  });

  it("warns on a generic head and an off-pattern mnemonic", () => {
    const [result] = draftCompounds([draft({ head: "𓄛", mnemonic: "made up" })], lexicon);
    assert.ok(result!.warnings.some((w) => w.startsWith("generic head")));
    assert.ok(result!.warnings.some((w) => w.startsWith("mnemonic does not open")));
  });

  it("reports an unresolved cue without a stem", () => {
    const [result] = draftCompounds([draft({ head: "no-such-word-anywhere" })], lexicon);
    assert.equal(result!.compound, undefined);
    assert.ok(result!.errors[0]!.startsWith("head:"));
  });
});
