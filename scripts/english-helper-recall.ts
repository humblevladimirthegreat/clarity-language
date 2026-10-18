/**
 * Recall of the English helper on doc example pairs (free, deterministic). Runs the analyzer
 * on the English side of every example the translation prompt can show (llm-examples.ts) and
 * checks how many of the roots and constructions the reference Agazan uses it suggests.
 *
 * Run: npm run english-helper-recall
 *      npm run english-helper-recall -- --json
 *
 * Roots: a lexicon suggestion with the same form, at its rank among that slot's lexicon
 * suggestions (top-1, top-3, lower), or else a grammar suggestion whose form contains it.
 * A missed root whose sense matches a word of the sentence is a tagging miss (the word was
 * there but read as a function word or under another lemma); the rest are cue misses.
 * Constructions: a suggestion links the construction's home anchor, or at least its page.
 * Constructions in at least a fifth of the examples (word shape, clause order, the period) are
 * structure every sentence has, and are counted apart.
 * Writes tmp/english-helper-recall.csv, one row per example.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { serializeCsv } from "../src/csv.js";
import { analyzeEnglish, type Analysis, type Suggestion } from "../src/english-helper/analyze.js";
import { loadHelperData } from "../src/english-helper/load.js";
import { tagEnglish } from "../src/english-helper/tag.js";
import { fillSelf } from "../src/learner-name.js";
import { docExamples, examplePair, tableExamples } from "../src/parse/llm-examples.js";
import { constructionRegistry } from "../src/parse/constructions.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { REPO_ROOT } from "../src/repo-paths.js";

const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");
const OUT = join(REPO_ROOT, "tmp", "english-helper-recall.csv");
const json = process.argv.includes("--json");

const tables = loadDefaultTables();
const data = loadHelperData();
const registry = constructionRegistry(tables.overlays.values());

/** Content roots, live-compound parts, and role-compound stems the parse tree uses. */
function usedRoots(tree: unknown): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const family = (node as { family?: { kind: string; roots?: string[]; xFamily?: string; leftRoots?: string[]; rightRoots?: string[] } }).family;
    if (family?.kind === "content") out.push(...(family.roots ?? []));
    if (family?.kind === "x" && (family.xFamily === "compound" || family.xFamily === "role")) out.push(...(family.leftRoots ?? []), ...(family.rightRoots ?? []));
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value);
  };
  walk(tree);
  return [...new Set(out)];
}

function links(s: Suggestion): string[] {
  if (s.kind === "job" || s.kind === "entry" || s.kind === "role") return [s.link];
  if (s.kind === "detector") return s.links;
  return [s.anchor, s.roleLink].filter((l): l is string => !!l);
}

type RootResult = "top1" | "top3" | "lower" | "grammar" | "tagging" | "missed";

function rootResult(analysis: Analysis, root: string, sentenceWords: Set<string>): RootResult {
  let best = Infinity;
  let grammar = false;
  for (const slot of analysis.clauses.flatMap((c) => c.slots)) {
    const lexical = slot.suggestions.filter((s) => s.kind === "lexicon");
    const rank = lexical.findIndex((s) => s.form === root);
    if (rank >= 0) best = Math.min(best, rank);
    if (slot.suggestions.some((s) => s.kind !== "lexicon" && s.kind !== "detector" && s.form.includes(root))) grammar = true;
  }
  if (best === 0) return "top1";
  if (best < 3) return "top3";
  if (best < Infinity) return "lower";
  if (grammar) return "grammar";
  for (const word of sentenceWords) if ((data.lexicon.get(word) ?? []).some((s) => s.form === root)) return "tagging";
  return "missed";
}

type Row = { source: string; english: string; agazan: string; roots: number; found: number; missed: string; constructions: number; anchor_hits: number; page_hits: number; missed_constructions: string };
const rows: Row[] = [];
const rootTally = new Map<RootResult, number>();
const missedRoots = new Map<string, { count: number; result: RootResult }>();
const constructionTally = new Map<string, { uses: number; anchor: number; page: number }>();

const pages = readdirSync(GRAMMAR_DIR).filter((p) => p.endsWith(".md")).sort();
const seen = new Set<string>();
for (const page of pages) {
  const markdown = readFileSync(join(GRAMMAR_DIR, page), "utf8");
  for (const example of [...docExamples(markdown), ...tableExamples(markdown)]) {
    const pair = examplePair(example, `${page}:${example.line}`, tables);
    if (!pair || seen.has(pair.gloss)) continue;
    seen.add(pair.gloss);
    const agazan = fillSelf(example.agazan);
    let roots: string[];
    try {
      roots = usedRoots(parseWithTables(agazan, tables));
    } catch {
      continue;
    }
    const analysis = analyzeEnglish(data, pair.sentence);
    const words = new Set(tagEnglish(pair.sentence).flatMap((s) => s.clauses.flatMap((c) => c.terms.flatMap((t) => [t.normal, t.lemma]))));
    const results = roots.map((root) => ({ root, result: rootResult(analysis, root, words) }));
    for (const { root, result } of results) {
      rootTally.set(result, (rootTally.get(result) ?? 0) + 1);
      if (result === "missed" || result === "tagging") {
        const m = missedRoots.get(root) ?? { count: 0, result };
        m.count++;
        missedRoots.set(root, m);
      }
    }
    const suggested = analysis.clauses.flatMap((c) => [...c.detectors, ...c.slots.flatMap((s) => s.suggestions)]).flatMap(links);
    const suggestedPages = new Set(suggested.map((l) => l.split("#")[0]));
    const missedConstructions: string[] = [];
    let anchorHits = 0;
    let pageHits = 0;
    for (const id of new Set(pair.constructions)) {
      const anchor = registry.get(id)?.anchor;
      if (!anchor) continue;
      const tally = constructionTally.get(id) ?? { uses: 0, anchor: 0, page: 0 };
      tally.uses++;
      if (suggested.includes(anchor)) {
        tally.anchor++;
        anchorHits++;
      }
      if (suggestedPages.has(anchor.split("#")[0])) {
        tally.page++;
        pageHits++;
      } else missedConstructions.push(id);
      constructionTally.set(id, tally);
    }
    const found = results.filter((r) => r.result !== "missed" && r.result !== "tagging").length;
    rows.push({
      source: pair.source,
      english: pair.sentence,
      agazan,
      roots: roots.length,
      found,
      missed: results.filter((r) => r.result === "missed" || r.result === "tagging").map((r) => `${r.root}${r.result === "tagging" ? "*" : ""}`).join(" "),
      constructions: new Set(pair.constructions).size,
      anchor_hits: anchorHits,
      page_hits: pageHits,
      missed_constructions: missedConstructions.join(" "),
    });
  }
}

mkdirSync(join(REPO_ROOT, "tmp"), { recursive: true });
writeFileSync(OUT, serializeCsv(Object.keys(rows[0] ?? {}), rows as unknown as Record<string, string>[]));

const totalRoots = [...rootTally.values()].reduce((a, b) => a + b, 0);
const pct = (n: number, d: number) => (d ? `${((100 * n) / d).toFixed(1)}%` : "-");
const STRUCTURE_SHARE = 0.2;
const structural = new Set([...constructionTally].filter(([, t]) => t.uses >= rows.length * STRUCTURE_SHARE).map(([id]) => id));
const taught = [...constructionTally].filter(([id]) => !structural.has(id)).map(([, t]) => t);
const constructionUses = taught.reduce((a, t) => a + t.uses, 0);
const anchorUses = taught.reduce((a, t) => a + t.anchor, 0);
const pageUses = taught.reduce((a, t) => a + t.page, 0);
const senseOf = (root: string) => {
  for (const [sense, list] of data.lexicon) if (list.some((s) => s.tier === "root" && s.form === root)) return sense;
  return "";
};
const summary = {
  examples: rows.length,
  roots: Object.fromEntries([...rootTally].map(([k, v]) => [k, v])),
  rootRecall: { top1: pct(rootTally.get("top1") ?? 0, totalRoots), top3: pct((rootTally.get("top1") ?? 0) + (rootTally.get("top3") ?? 0), totalRoots), anywhere: pct(totalRoots - (rootTally.get("missed") ?? 0) - (rootTally.get("tagging") ?? 0), totalRoots) },
  constructions: { uses: constructionUses, anchor: pct(anchorUses, constructionUses), page: pct(pageUses, constructionUses), structural: [...structural].sort() },
  missedRoots: [...missedRoots].sort((a, b) => b[1].count - a[1].count).slice(0, 30).map(([root, m]) => ({ root, sense: senseOf(root), ...m })),
  missedConstructions: [...constructionTally]
    .filter(([id, t]) => t.page < t.uses && !structural.has(id))
    .sort((a, b) => b[1].uses - b[1].page - (a[1].uses - a[1].page))
    .slice(0, 30)
    .map(([id, t]) => ({ id, anchor: registry.get(id)?.anchor, uses: t.uses, page: t.page, anchorHits: t.anchor })),
};

if (json) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`${rows.length} doc example pairs → tmp/english-helper-recall.csv`);
  console.log(`roots: ${totalRoots} uses — top-1 ${summary.rootRecall.top1}, top-3 ${summary.rootRecall.top3}, anywhere ${summary.rootRecall.anywhere}`);
  for (const [k, v] of [...rootTally].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(8)} ${v}`);
  console.log(`constructions: ${constructionUses} uses — home anchor suggested ${summary.constructions.anchor}, home page ${summary.constructions.page}`);
  console.log(`  (${structural.size} structural constructions in ≥${STRUCTURE_SHARE * 100}% of examples not counted)`);
  console.log("\nmost-missed roots (* = tagging miss: the word was in the sentence):");
  for (const m of summary.missedRoots) console.log(`  ${String(m.count).padStart(4)}  ${m.root}${m.result === "tagging" ? "*" : " "} ${m.sense}`);
  console.log("\nmost-missed constructions (home page never suggested):");
  for (const m of summary.missedConstructions) console.log(`  ${String(m.uses - m.page).padStart(4)}/${m.uses}  ${m.id}  ${m.anchor}`);
}
