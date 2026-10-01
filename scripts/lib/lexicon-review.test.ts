import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { OverlayRow, PublishedRow } from "../../src/lexicon-search.js";
import { CHECKS, getCheck, parseVerdict } from "./lexicon-review-checks.js";
import { scoreCalibration, sampleForGold } from "./lexicon-review-calibrate.js";
import {
  clusterPairs,
  cosine,
  embeddingPairs,
  exactPairs,
  topPairs,
  parseClusterResponse,
} from "./lexicon-review-pairs.js";
import {
  buildTriage,
  evaluate,
  rankFindings,
  serializeTriage,
  withBiasTags,
} from "./lexicon-review-report.js";
import { runCheck, selectSubjects } from "./lexicon-review-runner.js";
import { aggregate, cacheKeyFor, ReviewStore } from "./lexicon-review-store.js";
import { isCountryRow, loadLexiconData, rowSubjects, type LexiconData } from "./lexicon-review-subjects.js";
import type { ReviewRecord, Subject } from "./lexicon-review-types.js";

function published(emoji: string, root: string, concrete: string, abstract = "", aliases: string[] = []): PublishedRow {
  return {
    emoji,
    concrete,
    root,
    abstract,
    mnemonic: abstract ? `${concrete} shows ${abstract}` : "",
    englishByPos: "",
    posEnglish: { concrete: {}, abstract: {} },
    englishAliases: aliases,
  };
}

function overlay(senseForm: string, gloss: string): OverlayRow {
  return { senseForm, pos: "th", emoji: "", kind: "sake", gloss, definition: "", mnemonic: "", anchor: "x.md#y" };
}

const data: LexiconData = {
  published: [
    published("A", "aba", "smile", "goodwill"),
    published("B", "abe", "handshake", "goodwill"),
    published("C", "abi", "frown", "displeasure", ["anger"]),
    published("D", "abo", "rage", "anger"),
    published("E", "abu", "toolbox", "readiness"),
  ],
  overlays: [overlay("abum", "readiness"), overlay("abxm", "autonomy")],
  compounds: [],
};

const subjects = rowSubjects(data);
const leap = getCheck("leap");

test("parseVerdict accepts 1-5 integers and rejects the rest", () => {
  assert.deepEqual(parseVerdict({ score: 4, reason: " fine " }), { score: 4, reason: "fine" });
  assert.equal(parseVerdict({ score: 2, reason: "x", tag: "anchoring" }).tag, "anchoring");
  assert.throws(() => parseVerdict({ score: 7, reason: "x" }));
  assert.throws(() => parseVerdict({ score: 2.5, reason: "x" }));
  assert.throws(() => parseVerdict("no"));
});

test("every check has a unique id and deterministic, different-variant prompts", () => {
  assert.equal(new Set(CHECKS.map((c) => c.id)).size, CHECKS.length);
  const s = subjects[0]!;
  assert.deepEqual(leap.prompt(s, 0), leap.prompt(s, 0));
  assert.notDeepEqual(leap.prompt(s, 0), leap.prompt(s, 1));
});

test("prompts never contain the Agazan root", () => {
  for (const s of subjects) {
    for (const v of [0, 1] as const) {
      const text = JSON.stringify(leap.prompt(s, v));
      assert.ok(!text.includes(`"${s.label}"`), `root ${s.label} leaked`);
    }
  }
});

test("overlay-hosted roots are protected", () => {
  const byKey = new Map(subjects.map((s) => [s.key, s]));
  assert.equal(byKey.get("E")!.protected, true);
  assert.equal(byKey.get("A")!.protected, false);
});

test("aggregate: flagged needs both passes; unstable on a 2-point gap", () => {
  const rec = (variant: 0 | 1, score: number): ReviewRecord => ({
    check: "leap", key: "A", variant, model: "m", cacheKey: `${variant}`, score, reason: "r", ts: "t",
  });
  assert.equal(aggregate(leap, [rec(0, 1), rec(1, 2)]).status, "flagged");
  assert.equal(aggregate(leap, [rec(0, 1), rec(1, 4)]).status, "unstable");
  assert.equal(aggregate(leap, [rec(0, 2), rec(1, 3)]).status, "ok");
  assert.equal(aggregate(leap, [rec(0, 1), undefined]).status, "missing");
  assert.equal(aggregate(leap, [undefined, undefined]).status, "missing");
  const bias = getCheck("bias-prone");
  assert.equal(aggregate(bias, [rec(0, 5), rec(1, 4)]).status, "flagged");
});

test("runner caches: second run asks nothing; changed row re-asks only that row", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lexrev-"));
  try {
    let calls = 0;
    const ask = async () => {
      calls++;
      return { score: 1, reason: "weak" };
    };
    const store = new ReviewStore("leap", dir);
    const first = await runCheck({ check: leap, subjects, model: "m", store, ask });
    assert.equal(first.asked, 10);
    assert.equal(calls, 10);

    const again = await runCheck({ check: leap, subjects, model: "m", store: new ReviewStore("leap", dir), ask });
    assert.equal(again.asked, 0);
    assert.equal(again.cached, 10);

    const edited = subjects.map((s) => (s.key === "A" ? { ...s, data: { ...s.data, concrete: "grin" } } : s));
    const third = await runCheck({ check: leap, subjects: edited, model: "m", store: new ReviewStore("leap", dir), ask });
    assert.equal(third.asked, 2);

    const findings = evaluate(leap, edited, "m", new ReviewStore("leap", dir));
    assert.ok(findings.every((f) => f.result.status === "flagged"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("runner records an error, retries it next run, and keeps going", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lexrev-"));
  try {
    let fail = true;
    const ask = async () => {
      if (fail) throw new Error("boom");
      return { score: 5, reason: "ok" };
    };
    const one = subjects.slice(0, 2);
    const store = new ReviewStore("leap", dir);
    const first = await runCheck({ check: leap, subjects: one, model: "m", store, ask });
    assert.equal(first.errors, 4);
    fail = false;
    const second = await runCheck({ check: leap, subjects: one, model: "m", store: new ReviewStore("leap", dir), ask });
    assert.equal(second.asked, 4);
    assert.equal(second.errors, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("selectSubjects honors kind, select, only and limit", () => {
  assert.equal(selectSubjects({ check: leap, subjects }).length, 5);
  assert.equal(selectSubjects({ check: leap, subjects, only: new Set(["aba", "B"]) }).length, 2);
  assert.equal(selectSubjects({ check: leap, subjects, limit: 3 }).length, 3);
  assert.equal(selectSubjects({ check: getCheck("pair-synonym"), subjects }).length, 0);
});

test("cacheKeyFor depends on model and messages", () => {
  const m = [{ role: "user" as const, content: "hi" }];
  assert.notEqual(cacheKeyFor("a", m), cacheKeyFor("b", m));
  assert.notEqual(cacheKeyFor("a", m), cacheKeyFor("a", [{ role: "user", content: "ho" }]));
});

test("scoreCalibration gates on accuracy and recall, ignoring borderline", () => {
  const items = [
    ...Array.from({ length: 8 }, (_, i) => ({ key: `g${i}`, label: "good" as const, flagged: false })),
    ...Array.from({ length: 4 }, (_, i) => ({ key: `b${i}`, label: "bad" as const, flagged: true })),
    { key: "x", label: "borderline" as const, flagged: true },
  ];
  const ok = scoreCalibration(items);
  assert.equal(ok.verdict, "KEEP");
  assert.equal(ok.n, 12);
  assert.equal(ok.recall, 1);

  const weak = scoreCalibration(items.map((i) => (i.label === "bad" ? { ...i, flagged: false } : i)));
  assert.equal(weak.verdict, "REWORK");
  assert.deepEqual(weak.misses, ["b0", "b1", "b2", "b3"]);

  assert.equal(scoreCalibration(items.slice(0, 3)).verdict, "TOO-FEW");
});

test("sampleForGold is seeded, takes suspects first, and labels start empty", () => {
  const pool = selectSubjects({ check: leap, subjects });
  const suspect = (s: Subject) => s.key === "E";
  const a = sampleForGold(pool, ["leap"], 3, 1, suspect);
  assert.deepEqual(a, sampleForGold(pool, ["leap"], 3, 1, suspect));
  assert.equal(a.length, 3);
  assert.ok(a.some((e) => e.key === "E"));
  assert.ok(a.every((e) => e.label === ""));
});

test("exactPairs finds same-abstract, alias and overlay collisions", () => {
  const pairs = exactPairs(data);
  const kinds = new Map([...pairs].map(([k, s]) => [k, s.data.pairKind]));
  assert.equal(kinds.get("A|B"), "same-abstract");
  assert.equal(kinds.get("C|D"), "alias");
  // E hosts the overlay glossed "readiness", so its own pair is skipped
  assert.ok(![...kinds.keys()].some((k) => k.includes("overlay:abum")));
  assert.equal(pairs.get("A|B")!.protected, false);
});

test("overlay pair is found when a non-host row matches the gloss", () => {
  const extra: LexiconData = {
    ...data,
    published: [...data.published, published("F", "abz", "gear", "readiness")],
  };
  const pairs = exactPairs(extra);
  const overlayPair = [...pairs.values()].find((p) => p.data.pairKind === "overlay");
  assert.ok(overlayPair);
  assert.ok(overlayPair!.key.includes("F"));
});

test("cosine and topPairs", () => {
  assert.equal(cosine([1, 0], [1, 0]), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  const vectors = [[1, 0], [0.99, 0.1], [0, 1], [0.05, 1]];
  assert.deepEqual(topPairs(vectors, 10, 0.9).map((n) => [n.i, n.j]), [[2, 3], [0, 1]]);
  assert.deepEqual(topPairs(vectors, 1, 0.9).map((n) => [n.i, n.j]), [[2, 3]]);
});

test("embeddingPairs uses the injected embedder", async () => {
  const vectors: Record<string, number[]> = {
    "clustering: goodwill": [1, 0],
    "clustering: displeasure": [0, 1],
    "clustering: anger": [0.05, 1],
    "clustering: readiness": [1, 1],
    "clustering: autonomy": [-1, 0.2],
  };
  const embed = async (texts: string[]) => texts.map((t) => vectors[t] ?? [0, 0]);
  const map = await embeddingPairs(data, embed, { maxRowPairs: 2, maxOverlayPairs: 0, minSim: 0.95 });
  assert.ok([...map.values()].some((s) => s.data.pairKind === "embedding" && s.key === "C|D"));
});

test("clusterPairs links rows whose abstracts share a group", () => {
  const groups = parseClusterResponse({ groups: [["displeasure", "anger", "nonsense"], ["solo"]] }, new Set(["displeasure", "anger"]));
  assert.deepEqual(groups, [["displeasure", "anger"]]);
  const map = clusterPairs(data, groups);
  assert.deepEqual([...map.keys()], ["C|D"]);
  assert.throws(() => parseClusterResponse({}, new Set()));
});

test("withBiasTags feeds bias-image only for flagged rows", () => {
  const bias = getCheck("bias-prone");
  const image = getCheck("bias-image");
  const findings = subjects.map((subject) => ({
    subject,
    result: subject.key === "D"
      ? { status: "flagged" as const, meanScore: 5, scores: [5, 5], reasons: ["r"], tag: "anger bias" }
      : { status: "ok" as const, meanScore: 1, scores: [1, 1], reasons: ["r"] },
  }));
  assert.equal(bias.kind, "row");
  const tagged = withBiasTags(subjects, findings);
  assert.deepEqual(selectSubjects({ check: image, subjects }).map((s) => s.key), []);
  assert.deepEqual(selectSubjects({ check: image, subjects: tagged }).map((s) => s.key), ["D"]);
  assert.match(JSON.stringify(image.prompt(tagged.find((s) => s.key === "D")!, 0)), /anger bias/);
});

test("rankFindings orders flagged before unstable, worst score first", () => {
  const mk = (key: string, status: "flagged" | "unstable" | "ok", scores: number[]) => ({
    subject: subjects.find((s) => s.key === key)!,
    result: { status, meanScore: scores.reduce((a, b) => a + b, 0) / scores.length, scores, reasons: [""] },
  });
  const ranked = rankFindings(leap, [mk("A", "unstable", [1, 4]), mk("B", "flagged", [2, 2]), mk("C", "flagged", [1, 1]), mk("D", "ok", [5, 5])]);
  assert.deepEqual(ranked.map((f) => f.subject.key), ["C", "B", "A", "D"]);
});

test("buildTriage groups by subject, sorts by checks failed, and keeps human decisions", () => {
  const flagged = (key: string, score: number) => ({
    subject: subjects.find((s) => s.key === key)!,
    result: { status: "flagged" as const, meanScore: score, scores: [score, score], reasons: ["weak"] },
  });
  const perCheck = [
    { check: leap, findings: [flagged("A", 1), flagged("B", 2)] },
    { check: getCheck("mnemonic-sound"), findings: [flagged("B", 1)] },
  ];
  const existing = [{
    key: "B", root: "abe", checks_failed: "", check: "leap", status: "flagged", score: "", what: "", reason: "",
    protected: "", human_decision: "rename", notes: "see TODO",
  }];
  const rows = buildTriage(perCheck, existing);
  assert.deepEqual(rows.map((r) => `${r.key}:${r.check}`), ["B:leap", "B:mnemonic-sound", "A:leap"]);
  assert.equal(rows[0]!.checks_failed, "2");
  assert.equal(rows[0]!.human_decision, "rename");
  assert.match(serializeTriage(rows), /^key,root,checks_failed/);
});

test("adaptive run asks pass 2 only near the flag boundary", async () => {
  const dir = mkdtempSync(join(tmpdir(), "lexrev-"));
  try {
    const scores: Record<string, number> = { A: 5, B: 3, C: 2, D: 1, E: 4 };
    let calls = 0;
    const ask = async (messages: { content: string }[]) => {
      calls++;
      const key = subjects.find((s) => messages[1]!.content.includes(`"${s.data.concrete}"`))!.key;
      return { score: scores[key]!, reason: "r" };
    };
    const store = new ReviewStore("leap", dir);
    const summary = await runCheck({ check: leap, subjects, model: "m", store, ask, adaptive: true });
    // pass 0 for 5 rows; pass 1 for scores 3, 2, 1 (flagged(score±1) holds), not 5 or 4
    assert.equal(summary.asked, 8);
    assert.equal(calls, 8);
    const findings = new Map(evaluate(leap, subjects, "m", store).map((f) => [f.subject.key, f.result.status]));
    assert.equal(findings.get("A"), "ok");
    assert.equal(findings.get("E"), "ok");
    assert.equal(findings.get("D"), "flagged");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a lone pass near the boundary stays missing; modelTag separates reasoning settings", async () => {
  const { modelTag } = await import("./lexicon-review-runner.js");
  const rec = (score: number): ReviewRecord => ({ check: "leap", key: "A", variant: 0, model: "m", cacheKey: "k", score, reason: "", ts: "" });
  assert.equal(aggregate(leap, [rec(3), undefined]).status, "missing");
  assert.equal(aggregate(leap, [rec(5), undefined]).status, "ok");
  assert.equal(modelTag("q", "none"), "q@none");
  assert.equal(modelTag("q", "default"), "q");
});

test("country and territory flag rows are excluded from loaded lexicon data", () => {
  assert.equal(isCountryRow({ emoji: "🇦🇲" }), true);
  assert.equal(isCountryRow({ emoji: "⚙️" }), false);
  assert.ok(!loadLexiconData().published.some(isCountryRow));
});
