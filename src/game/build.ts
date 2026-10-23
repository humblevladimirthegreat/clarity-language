/**
 * The game's data from the docs, built in Node (the site's data loader, the content lint, and the tests):
 * gate data from the learning order and the construction registry, error-table rows from the grammar
 * pages' **Fix it** drills, and the fixed lines spelled from their glosses with the full gloss index.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { isLevelReview, pageRelPath, pathPages } from "../../docs/grammar/.vitepress/lib/reading-order.js";
import { NOT_CORE_ROOTS } from "../core-vocabulary.js";
import { listMarkdown } from "../markdown-files.js";
import { extractMorphPairs } from "../lint/morph-gloss-docs.js";
import { learningOrder, pageSections, resolveAnchor, sectionAt, type LearningOrder } from "../lint/learning-order.js";
import { practiceItems } from "../lint/practice-items.js";
import type { ClassifyTables } from "../parse/classify.js";
import { constructionRegistry } from "../parse/constructions.js";
import { ConstructionError } from "../parse/enforce.js";
import { buildGlossIndex, glossToAgebon, type GlossIndex } from "../parse/gloss-inverse.js";
import { loadDefaultTables } from "../parse/index.js";
import { looksLikeMorphLine } from "../parse/morph-gloss.js";
import { unknownWords } from "../parse/lexicon-check.js";
import { parseWithTables } from "../parse/parse-core.js";
import { parseWords, WordParseError } from "../parse/word.js";
import { REPO_ROOT } from "../repo-paths.js";
import type { EngineData } from "./engine.js";
import { FIXED } from "./generate.js";
import type { GateData } from "./gating.js";
import type { RecastRule } from "./recast.js";

const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");

export { pathPages };

function readPage(page: string): string | undefined {
  const path = join(GRAMMAR_DIR, pageRelPath(page));
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
}

let order: LearningOrder | undefined;

export function gameLearningOrder(): LearningOrder {
  if (order) return order;
  const pages = new Map<string, ReturnType<typeof pageSections>>();
  for (const page of pathPages()) {
    const markdown = readPage(page);
    if (markdown !== undefined) pages.set(page, pageSections(page, markdown));
  }
  order = learningOrder(pathPages(), pages);
  return order;
}

/** Construction homes and root introductions, as positions on the cross-doc path. */
export function buildGateData(tables: ClassifyTables): GateData {
  const learning = gameLearningOrder();
  const position = (anchor: string) => resolveAnchor(learning, anchor)?.position;
  const homes: Record<string, number> = {};
  for (const [id, entry] of constructionRegistry(tables.overlays.values())) {
    const at = position(entry.anchor);
    if (at !== undefined) homes[id] = at;
  }
  const coreRoots: Record<string, number> = {};
  for (const row of tables.published.values()) {
    const at = row.core ? position(row.core) : undefined;
    if (at !== undefined) coreRoots[row.root] = at;
  }
  for (const row of tables.compounds.values()) {
    const at = row.core ? position(row.core) : undefined;
    if (at !== undefined) coreRoots[row.stem] = at;
  }
  return {
    sections: learning.ordered.map((s) => ({ anchor: `${s.page}#${s.slug}`, title: s.title, band: s.band ?? "" })),
    homes,
    coreRoots,
    grammarRoots: [...NOT_CORE_ROOTS],
  };
}

/** The parser's error kind for a line: a rejection id, `word`, `sentence`, `unknown-root`, or `parses`. */
export function errorKindOf(text: string, tables: ClassifyTables): string {
  try {
    const result = parseWithTables(text, tables);
    return unknownWords(result).length ? "unknown-root" : "parses";
  } catch (error) {
    if (error instanceof ConstructionError) return error.rejection;
    return error instanceof WordParseError ? "word" : "sentence";
  }
}

function stripEnd(text: string): string[] {
  return text.trim().replace(/[.?!]$/, "").split(/\s+/);
}

/** The prefix, root and ending of a one-root content word, or undefined. */
function wordParts(word: string): { prefix: string; root: string; ending: string } | undefined {
  try {
    const words = parseWords(word);
    const only = words[0];
    if (words.length !== 1 || only?.family.kind !== "content" || only.family.roots.length !== 1) return undefined;
    const root = only.family.roots[0]!;
    const at = word.indexOf(root);
    return { prefix: word.slice(0, at), root, ending: word.slice(at + root.length) };
  } catch {
    return undefined;
  }
}

/** One error-table row from a **Fix it** drill: the slip as a role-letter swap, an ending swap, one word for another, or a word moved to the front. */
export function ruleFromFix(wrong: string, right: string, why: string, source: string, errorKind: string): RecastRule | undefined {
  const w = stripEnd(wrong);
  const r = stripEnd(right);
  const base = { errorKind, source, ...(why ? { why } : {}) };
  if (w.length === r.length) {
    const diff = w.flatMap((word, i) => (word !== r[i] ? [i] : []));
    if (diff.length === 1) {
      const a = wordParts(w[diff[0]!]!);
      const b = wordParts(r[diff[0]!]!);
      if (a && b && a.root === b.root) {
        if (a.ending === b.ending && a.prefix !== b.prefix) return { kind: "prefix", from: a.prefix, to: b.prefix, ...base };
        if (a.prefix === b.prefix && a.ending !== b.ending && a.ending.length === 1 && b.ending.length === 1) {
          return { kind: "ending", from: a.ending, to: b.ending, ...base };
        }
      }
    }
    if (diff.length === 1) return { kind: "word", from: w[diff[0]!]!, to: r[diff[0]!]!, ...base };
    const sorted = (xs: string[]) => [...xs].sort().join(" ");
    const first = r[0]!;
    if (sorted(w) === sorted(r) && w[0] !== first && first.startsWith("y")) return { kind: "front", from: "y", to: "", ...base };
  }
  return undefined;
}

/** Error-table rows from every **Fix it** drill on the path. */
export function fixItRules(tables: ClassifyTables): RecastRule[] {
  const rules: RecastRule[] = [];
  for (const page of pathPages()) {
    const markdown = readPage(page);
    if (markdown === undefined) continue;
    const { sections } = pageSections(page, markdown);
    for (const item of practiceItems(markdown, { review: isLevelReview(page) }).items) {
      if (item.type !== "fix") continue;
      const wrong = item.promptSpans.find((span) => span.marker?.includes("lint: error"))?.text;
      const right = item.spoiler.find((line) => line.kind === "agebon")?.text.replace(/^`|`$/g, "");
      if (!wrong || !right) continue;
      const why = item.spoiler
        .filter((line) => line.kind === "text" && !looksLikeMorphLine(line.text))
        .map((line) => line.text)
        .join(" ");
      const section = sectionAt(sections, item.index);
      const rule = ruleFromFix(wrong, right, why, `${page}#${section.slug}`, errorKindOf(wrong, tables));
      if (rule) rules.push(rule);
    }
  }
  return rules;
}

/** Agebon lines of every doc example: the forms a gloss index cannot list on its own (mid-word `x`, numbers). */
export function docLines(): string[] {
  const lines = new Set<string>();
  for (const file of listMarkdown(GRAMMAR_DIR)) {
    if (file.includes(".vitepress")) continue;
    for (const pair of extractMorphPairs(readFileSync(file, "utf8"))) lines.add(pair.agebon);
  }
  return [...lines];
}

let fullIndex: GlossIndex | undefined;

/** Every root and closed form, plus the docs' own words: spells any gloss a doc example could. */
export function fullGlossIndex(tables: ClassifyTables): GlossIndex {
  fullIndex ??= buildGlossIndex(tables, docLines());
  return fullIndex;
}

/** The fixed lines, spelled. Throws on one that does not spell: the content lint reports it. */
export function spellFixed(tables: ClassifyTables): Record<string, string> {
  const index = fullGlossIndex(tables);
  return Object.fromEntries(Object.values(FIXED).map(({ gloss }) => [gloss, glossToAgebon(gloss, tables, index)]));
}

let built: EngineData | undefined;

/** Everything the engine reads from the build. */
export function buildGameData(tables: ClassifyTables = loadDefaultTables()): EngineData {
  built ??= { gate: buildGateData(tables), rules: fixItRules(tables), spelled: spellFixed(tables) };
  return built;
}
