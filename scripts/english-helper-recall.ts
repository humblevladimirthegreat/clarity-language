/**
 * Recall and self-containment of the English helper (free, deterministic). Runs the analyzer
 * and the `--llm-prompt` prompt on English with a reference translation, and checks how much of
 * the reference the helper suggests and how much of it the prompt actually shows.
 *
 * Run: npm run english-helper-recall
 *      npm run english-helper-recall -- --set doc|checkpoint|wild|all   (default all)
 *      npm run english-helper-recall -- --json
 *      npm run english-helper-recall -- --check            (fail when a headline metric fell past tolerance)
 *      npm run english-helper-recall -- --write-baseline   (save this run's headline metrics)
 *
 * Sets, scored apart:
 *   doc         doc example pairs the translation prompt can show (llm-examples.ts); in-sample,
 *               since the cue rows were written against them (the prompt never shows the pair itself)
 *   checkpoint  English → Agebon practice items, with their **Also correct** answers; held out
 *               of the example pool
 *   wild        plain English grouped by phenomenon and stage (src/english-helper/wild.tsv), with
 *               no reference Agebon: scored on gaps, noise and prompt size only
 *
 * Every set: gap rate (slots with no suggestion, of the slots not skipped, by word class),
 * noise (suggestions and grammar jobs per slot, and how often a guess, an alias, WordNet lead or
 * live compound, ranks above a grammar row in the same slot), and prompt size.
 *
 * Roots: a lexicon suggestion with the same form (WordNet leads included), at its rank among that
 * slot's lexicon suggestions (top-1, top-3, lower), or else a grammar, route or live suggestion
 * whose form or parts contain it. Found roots are also counted by the tier that found them.
 * A missed root whose sense matches a word of the sentence is a tagging miss (the word was
 * there but read as a function word or under another lemma); the rest are cue misses.
 * Constructions: a suggestion links the construction's home anchor, or at least its page.
 * Constructions in at least a fifth of a set's sentences (word shape, clause order, the period)
 * are structure every sentence has, and are counted apart.
 * Prompt: each reference word is in the prompt verbatim, a pattern the prompt shows, or missing
 * (coverage.ts). A sentence is self-contained when no word is missing. With several accepted
 * answers, the one with the fewest missing words is scored.
 *
 * Verify (checkpoint only): `--verify` on every accepted answer, where each *check* flag is a false
 * alarm (precision: the share of content words with no flag), and on drafts with one planted
 * error each (plant.ts: a word on the other side's ending, an alias on its other side, a grammar
 * row's word with the other ending), where each flag is a catch (recall: the share flagged).
 *
 * Baseline: src/generated/english-helper-baseline.json holds each set's headline metrics.
 * `--check` fails when one is worse than the baseline by more than its tolerance; it is not part
 * of `npm test`, since doc edits move the numbers. `--write-baseline` updates the sets it ran.
 *
 * Writes tmp/english-helper-recall.csv (one row per sentence), tmp/english-helper-worklist.csv
 * (one row per missing word, and for the wild set per gap and per guess ranked above a grammar
 * row, most frequent English first; NGSL ranks when
 * scripts/frequency-coverage.ts has downloaded the list), and tmp/english-helper-report.md.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv, serializeCsv } from "../src/csv.js";
import { analyzeEnglish, suggestionLinks, TIERS, type Analysis, type Slot, type Suggestion } from "../src/english-helper/analyze.js";
import { coverWord, familyRoots, promptShows, treeWords, type Coverage, type PromptShows, type TreeWord } from "../src/english-helper/coverage.js";
import { buildHelperPrompt } from "../src/english-helper/llm-prompt.js";
import { loadHelperData } from "../src/english-helper/load.js";
import { PLANT_KINDS, plantErrors, plantFlagged, type PlantKind } from "../src/english-helper/plant.js";
import { verifyDraft, type Verified } from "../src/english-helper/verify.js";
import { tagEnglish } from "../src/english-helper/tag.js";
import { fillSelf } from "../src/learner-name.js";
import { BANDS } from "../src/lint/learning-order.js";
import { practiceItems } from "../src/lint/practice-items.js";
import { docExamples, examplePair, loadPromptContext, tableExamples } from "../src/parse/llm-examples.js";
import { constructionRegistry } from "../src/parse/constructions.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { REPO_ROOT } from "../src/repo-paths.js";

const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");
const TMP = join(REPO_ROOT, "tmp");
const NGSL_STATS = join(TMP, "NGSL_12_stats.csv");
const BASELINE = join(REPO_ROOT, "src", "generated", "english-helper-baseline.json");
const SETS = ["doc", "checkpoint", "wild"] as const;
type SetName = (typeof SETS)[number];
/** Sets with reference Agebon, scored on roots, constructions and the prompt's words. */
const REFERENCE_SETS: readonly SetName[] = ["doc", "checkpoint"];
const WILD_TSV = join(REPO_ROOT, "src", "english-helper", "wild.tsv");

const args = process.argv.slice(2);
const json = args.includes("--json");
const check = args.includes("--check");
const writeBaseline = args.includes("--write-baseline");
const setArg = args.includes("--set") ? args[args.indexOf("--set") + 1] : "all";
if (setArg !== "all" && !SETS.includes(setArg as SetName)) {
  console.error(`--set needs one of ${[...SETS, "all"].join(", ")}`);
  process.exit(2);
}
const sets: readonly SetName[] = setArg === "all" ? SETS : [setArg as SetName];

const tables = loadDefaultTables();
const data = loadHelperData();
const context = loadPromptContext(tables);
const registry = constructionRegistry(tables.overlays.values());
const pages = readdirSync(GRAMMAR_DIR).filter((p) => p.endsWith(".md")).sort();
const markdownOf = new Map(pages.map((page) => [page, readFileSync(join(GRAMMAR_DIR, page), "utf8")]));

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

/** Live `x` compound stems (two roots, no lexicon row) the parse tree uses. */
function usedLiveStems(tree: unknown): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const family = (node as { family?: { kind: string; xFamily?: string; leftRoots?: string[]; rightRoots?: string[] } }).family;
    if (family?.kind === "x" && family.xFamily === "compound" && family.leftRoots?.length === 1 && family.rightRoots?.length === 1) {
      out.push(`${family.leftRoots[0]}x${family.rightRoots[0]}`);
    }
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value);
  };
  walk(tree);
  return [...new Set(out)];
}

/** Forms a non-lexicon suggestion spells or builds on. */
function forms(s: Suggestion): string[] {
  if (s.kind === "class") return [s.animal?.form, s.qualifier?.form].filter((f): f is string => !!f);
  if (s.kind === "live") return s.parts.map((p) => p.form);
  if (s.kind === "lexicon" || s.kind === "detector") return [];
  return [s.form];
}

type RootResult = "top1" | "top3" | "lower" | "grammar" | "tagging" | "missed";

/** The result, and the tier of the suggestion that found the root. */
function rootResult(analysis: Analysis, root: string, sentenceWords: Set<string>): { result: RootResult; tier?: string } {
  let best = Infinity;
  let bestTier: string | undefined;
  let other: string | undefined;
  for (const slot of analysis.clauses.flatMap((c) => c.slots)) {
    const lexical = slot.suggestions.filter((s) => s.kind === "lexicon");
    const rank = lexical.findIndex((s) => s.form === root);
    if (rank >= 0 && rank < best) [best, bestTier] = [rank, lexical[rank]!.tier];
    other ??= slot.suggestions.find((s) => forms(s).some((f) => f.includes(root)))?.tier;
  }
  if (best === 0) return { result: "top1", tier: bestTier };
  if (best < 3) return { result: "top3", tier: bestTier };
  if (best < Infinity) return { result: "lower", tier: bestTier };
  if (other) return { result: "grammar", tier: other };
  for (const word of sentenceWords) if ((data.lexicon.get(word) ?? []).some((s) => s.form === root)) return { result: "tagging" };
  return { result: "missed" };
}

/** One English sentence with its accepted Agebon answers (the first is the main one; none for the wild set). */
type Sentence = { set: SetName; source: string; english: string; answers: string[]; phenomenon?: string; stage?: string };

function docSentences(): Sentence[] {
  const out: Sentence[] = [];
  const seen = new Set<string>();
  for (const page of pages) {
    const markdown = markdownOf.get(page)!;
    for (const example of [...docExamples(markdown), ...tableExamples(markdown)]) {
      const pair = examplePair(example, `${page}:${example.line}`, tables);
      if (!pair || seen.has(pair.gloss)) continue;
      seen.add(pair.gloss);
      out.push({ set: "doc", source: pair.source, english: pair.sentence, answers: [pair.agebon] });
    }
  }
  return out;
}

function checkpointSentences(): Sentence[] {
  const out: Sentence[] = [];
  for (const page of pages) {
    const markdown = markdownOf.get(page)!;
    for (const item of practiceItems(markdown, { review: page === "review.md" }).items) {
      if (item.type !== "en-ag" || !item.promptEnglish) continue;
      const main = item.spoiler.find((line) => line.kind === "agebon");
      if (!main) continue;
      const line = markdown.slice(0, item.index).split("\n").length;
      out.push({ set: "checkpoint", source: `${page}:${line}`, english: item.promptEnglish, answers: [main.text, ...item.alsoCorrect.map((span) => span.text)].map((a) => fillSelf(a)) });
    }
  }
  return out;
}

function wildSentences(): Sentence[] {
  const out: Sentence[] = [];
  readFileSync(WILD_TSV, "utf8")
    .split("\n")
    .forEach((line, k) => {
      if (k === 0 || !line.trim() || line.startsWith("#")) return;
      const [phenomenon = "", stage = "", english = ""] = line.split("\t");
      out.push({ set: "wild", source: `wild.tsv:${k + 1}`, english, answers: [], phenomenon, stage });
    });
  return out;
}

const sentencesOf = (set: SetName) => (set === "doc" ? docSentences() : set === "checkpoint" ? checkpointSentences() : wildSentences());

type Kind = "missing cue" | "link without form" | "tagger" | "ranking" | "verify false alarm" | "verify blind spot";
const KINDS: readonly Kind[] = ["missing cue", "link without form", "tagger", "ranking", "verify false alarm", "verify blind spot"];
const ROUTE: Record<Kind, { owner: string; fix: string }> = {
  "missing cue": {
    owner: "say-*.md / english.md row, or the owning section's table",
    fix: "run find-english.mjs; if a page teaches the form, add an italic cue on its row; if none does, log a grammar gap with the phrases tried",
  },
  "link without form": { owner: "analyzer (describe.ts / analyze.ts)", fix: "the linked section spells this word: show it, or an e.g. sentence that uses it" },
  tagger: { owner: "tag.ts overrides, or a context rule in analyze.ts", fix: "the English word that names this root was read as a function word or under another lemma" },
  ranking: { owner: "analyzer: cue rank, tier order or slot order (analyze.ts)", fix: "a guess (alias, WordNet lead, live compound) ranks above a grammar row for this word" },
  "verify false alarm": {
    owner: "verify.ts, or the analyzer when the English never suggested the root",
    fix: "--verify puts this check (in parentheses) on a correct answer's word: alias or unmatched usually means a missing cue or sense for the English word, other-side or spelled a check that is too strict",
  },
  "verify blind spot": { owner: "verify.ts", fix: "a draft with this planted error (in parentheses) passes --verify" },
};

/** Tiers that guess at a word rather than read a row written for it. */
const GUESS_TIERS = new Set<string>(["alias", "synonym", "broader", "live"]);

/** A guess ranked above the slot's first grammar row. */
function guessAboveGrammar(slot: Slot): boolean | undefined {
  const grammar = slot.suggestions.findIndex((s) => s.tier === "grammar");
  const guess = slot.suggestions.findIndex((s) => GUESS_TIERS.has(s.tier));
  if (grammar < 0 || guess < 0) return undefined;
  return guess < grammar;
}

type Miss = { set: SetName; english: string; word: string; kind: Kind; lemma: string; link: string };
type Row = {
  set: SetName;
  source: string;
  group: string;
  english: string;
  agebon: string;
  roots: number;
  found: number;
  missed: string;
  constructions: number;
  anchor_hits: number;
  page_hits: number;
  missed_constructions: string;
  words: number;
  in_prompt: number;
  pattern: number;
  missing_words: string;
  slots: number;
  gaps: string;
  prompt_chars: number;
};

/** Whether a section page writes this word in a code span. */
function pageSpells(page: string, word: string): boolean {
  const markdown = markdownOf.get(page);
  return !!markdown && new RegExp(`\`[^\`\\n]*(?<![a-z])${word.replace(/[^a-z]/g, "\\$&")}(?![a-z])[^\`\\n]*\``).test(markdown);
}

/** The English lemma a missing word most likely came from. */
function lemmaFor(word: TreeWord, sentenceWords: Set<string>): string {
  const roots = familyRoots(word.family);
  for (const w of sentenceWords) if ((data.lexicon.get(w) ?? []).some((s) => roots.includes(s.form))) return w;
  const glosses = [word.rootGloss?.concrete, word.rootGloss?.abstract, word.overlay?.gloss].filter((g): g is string => !!g);
  for (const gloss of glosses) for (const g of gloss.toLowerCase().split(/[^a-z']+/)) if (sentenceWords.has(g)) return g;
  return "";
}

/** A root the prompt never shows, though a word of the sentence names it, is a tagger miss; a root it shows in the wrong shape is not. */
function classify(word: TreeWord, analysis: Analysis, shows: PromptShows, sentenceWords: Set<string>): { kind: Kind; link: string } {
  const suggested = analysis.clauses.flatMap((c) => [...c.detectors, ...c.slots.flatMap((s) => s.suggestions)]).flatMap(suggestionLinks);
  const roots = familyRoots(word.family);
  if (word.reading === "ordinary" && roots.some((r) => !shows.roots.has(r))) {
    if ([...sentenceWords].some((w) => (data.lexicon.get(w) ?? []).some((s) => roots.includes(s.form)))) return { kind: "tagger", link: "" };
  }
  const spelled = suggested.find((link) => pageSpells(link.split("#")[0]!, word.raw));
  if (spelled) return { kind: "link without form", link: spelled };
  if (word.family.kind === "number") {
    const numbers = suggested.find((link) => link.startsWith("numbers"));
    if (numbers) return { kind: "link without form", link: numbers };
  }
  return { kind: "missing cue", link: "" };
}

type Scored = { answer: string; tree: unknown; words: TreeWord[]; coverage: Coverage[] };

const rows: Row[] = [];
const misses: Miss[] = [];
type SetTally = {
  roots: Map<RootResult, number>;
  tiers: Map<string, number>;
  live: { uses: number; suggested: number; offered: number };
  missedRoots: Map<string, { count: number; result: RootResult }>;
  constructions: Map<string, { uses: number; anchor: number; page: number }>;
  coverage: Map<Coverage, number>;
  selfContained: number;
  promptChars: number[];
  /** Slots not skipped, slots with no suggestion by word class and lemma, suggestions and jobs in them. */
  slots: number;
  gaps: Map<string, Map<string, number>>;
  suggestions: number;
  jobs: number;
  /** Slots with both a guess and a grammar row, and those where the guess ranks first. */
  guessSlots: number;
  guessAbove: number;
  /** Wild set: sentences and gap slots by phenomenon and by stage. */
  groups: Map<string, { sentences: number; slots: number; gaps: number }>;
  verify?: VerifyTally;
};

type VerifyTally = {
  /** Accepted answers verified, and those with no flag and no unknown word. */
  answers: number;
  clean: number;
  /** Answers `--verify` fails to parse (a parser and checker mismatch). */
  errors: number;
  words: number;
  unknown: number;
  checks: Map<string, number>;
  plants: Map<PlantKind, { planted: number; flagged: number }>;
};

/** `--verify` on a sentence's accepted answers, and on drafts planted from its first verified answer. */
function scoreVerify(sentence: Sentence, analysis: Analysis, t: VerifyTally): void {
  let main: Verified | undefined;
  for (const answer of sentence.answers) {
    const v = verifyDraft(sentence.english, answer, tables, data, analysis);
    if (v.error) {
      t.errors++;
      continue;
    }
    main ??= v;
    t.answers++;
    t.words += v.words?.length ?? 0;
    t.unknown += v.unknown.length;
    const flags = (v.words ?? []).filter((w) => w.check);
    if (!flags.length && !v.unknown.length) t.clean++;
    for (const w of flags) {
      t.checks.set(w.check!, (t.checks.get(w.check!) ?? 0) + 1);
      misses.push({ set: sentence.set, english: sentence.english, word: w.raw, kind: "verify false alarm", lemma: w.english?.toLowerCase() ?? "", link: w.check! });
    }
  }
  if (!main) return;
  for (const plant of plantErrors(main.agebon, main.words ?? [])) {
    const flagged = plantFlagged(verifyDraft(sentence.english, plant.draft, tables, data, analysis), plant);
    if (flagged === undefined) continue;
    const p = t.plants.get(plant.kind) ?? { planted: 0, flagged: 0 };
    p.planted++;
    if (flagged) p.flagged++;
    else misses.push({ set: sentence.set, english: sentence.english, word: plant.to, kind: "verify blind spot", lemma: plant.english?.toLowerCase() ?? "", link: `${plant.kind}: ${plant.from} → ${plant.to}` });
    t.plants.set(plant.kind, p);
  }
}
const tallies = new Map<SetName, SetTally>();

for (const set of sets) {
  const tally: SetTally = {
    roots: new Map(),
    tiers: new Map(),
    live: { uses: 0, suggested: 0, offered: 0 },
    missedRoots: new Map(),
    constructions: new Map(),
    coverage: new Map(),
    selfContained: 0,
    promptChars: [],
    slots: 0,
    gaps: new Map(),
    suggestions: 0,
    jobs: 0,
    guessSlots: 0,
    guessAbove: 0,
    groups: new Map(),
    ...(set === "checkpoint" ? { verify: { answers: 0, clean: 0, errors: 0, words: 0, unknown: 0, checks: new Map(), plants: new Map() } } : {}),
  };
  tallies.set(set, tally);
  for (const sentence of sentencesOf(set)) {
    const analysis = analyzeEnglish(data, sentence.english);
    const prompt = buildHelperPrompt([{ english: sentence.english, analysis }], data, context);
    const shows = promptShows(prompt, [analysis]);
    let best: Scored | undefined;
    for (const answer of sentence.answers) {
      let tree: unknown;
      try {
        tree = parseWithTables(answer, tables, { constructions: true });
      } catch {
        continue;
      }
      const words = treeWords(tree);
      const coverage = words.map((w) => coverWord(w, shows));
      const missing = coverage.filter((c) => c === "missing").length;
      if (!best || missing < best.coverage.filter((c) => c === "missing").length) best = { answer, tree, words, coverage };
    }
    if (sentence.answers.length && !best) continue;

    const slots = analysis.clauses.flatMap((c) => c.slots).filter((slot) => !slot.skipped);
    const gapSlots = new Set(analysis.gaps.map((g) => g.word));
    tally.slots += slots.length;
    tally.promptChars.push(prompt.length);
    for (const slot of slots) {
      tally.suggestions += slot.suggestions.length;
      tally.jobs += slot.suggestions.filter((x) => x.kind === "job").length;
      const above = guessAboveGrammar(slot);
      if (above !== undefined) tally.guessSlots++;
      if (above) tally.guessAbove++;
      if (above && set === "wild") misses.push({ set, english: sentence.english, word: slot.text, kind: "ranking", lemma: slot.lemma, link: "" });
    }
    for (const gap of analysis.gaps) {
      const byLemma = tally.gaps.get(gap.cls) ?? new Map<string, number>();
      byLemma.set(gap.lemma, (byLemma.get(gap.lemma) ?? 0) + 1);
      tally.gaps.set(gap.cls, byLemma);
      if (set === "wild") misses.push({ set, english: sentence.english, word: gap.word, kind: "missing cue", lemma: gap.lemma, link: "" });
    }
    for (const group of [sentence.phenomenon, sentence.stage]) {
      if (!group) continue;
      const g = tally.groups.get(group) ?? { sentences: 0, slots: 0, gaps: 0 };
      g.sentences++;
      g.slots += slots.length;
      g.gaps += analysis.gaps.length;
      tally.groups.set(group, g);
    }
    const base = { set, source: sentence.source, group: [sentence.phenomenon, sentence.stage].filter(Boolean).join(" "), english: sentence.english, slots: slots.length, gaps: [...gapSlots].join(" "), prompt_chars: prompt.length };
    if (!best) {
      rows.push({ ...base, agebon: "", roots: 0, found: 0, missed: "", constructions: 0, anchor_hits: 0, page_hits: 0, missed_constructions: "", words: 0, in_prompt: 0, pattern: 0, missing_words: "" });
      continue;
    }
    const { tree } = best;
    if (tally.verify) scoreVerify(sentence, analysis, tally.verify);

    const sentenceWords = new Set(tagEnglish(sentence.english).flatMap((s) => s.clauses.flatMap((c) => c.terms.flatMap((t) => [t.normal, t.lemma]))));
    const roots = usedRoots(tree);
    const liveStems = usedLiveStems(tree);
    const results = roots.map((root) => ({ root, ...rootResult(analysis, root, sentenceWords) }));
    for (const { root, result, tier } of results) {
      tally.roots.set(result, (tally.roots.get(result) ?? 0) + 1);
      if (tier) tally.tiers.set(tier, (tally.tiers.get(tier) ?? 0) + 1);
      if (result === "missed" || result === "tagging") {
        const m = tally.missedRoots.get(root) ?? { count: 0, result };
        m.count++;
        tally.missedRoots.set(root, m);
      }
    }
    const builtStems = new Set(analysis.clauses.flatMap((c) => c.slots.flatMap((s) => s.suggestions.flatMap((x) => (x.kind === "live" ? [x.stem] : [])))));
    tally.live.uses += liveStems.length;
    tally.live.suggested += liveStems.filter((stem) => builtStems.has(stem)).length;
    tally.live.offered += builtStems.size;
    const suggested = analysis.clauses.flatMap((c) => [...c.detectors, ...c.slots.flatMap((s) => s.suggestions)]).flatMap(suggestionLinks);
    const suggestedPages = new Set(suggested.map((l) => l.split("#")[0]));
    const constructions = new Set((tree as { constructions?: string[] }).constructions ?? []);
    const missedConstructions: string[] = [];
    let anchorHits = 0;
    let pageHits = 0;
    for (const id of constructions) {
      const anchor = registry.get(id)?.anchor;
      if (!anchor) continue;
      const t = tally.constructions.get(id) ?? { uses: 0, anchor: 0, page: 0 };
      t.uses++;
      if (suggested.includes(anchor)) {
        t.anchor++;
        anchorHits++;
      }
      if (suggestedPages.has(anchor.split("#")[0])) {
        t.page++;
        pageHits++;
      } else missedConstructions.push(id);
      tally.constructions.set(id, t);
    }

    for (const c of best.coverage) tally.coverage.set(c, (tally.coverage.get(c) ?? 0) + 1);
    const missingWords = best.words.filter((_, k) => best.coverage[k] === "missing");
    if (missingWords.length === 0) tally.selfContained++;
    for (const word of missingWords) {
      const { kind, link } = classify(word, analysis, shows, sentenceWords);
      misses.push({ set, english: sentence.english, word: word.raw, kind, lemma: lemmaFor(word, sentenceWords), link });
    }

    rows.push({
      ...base,
      agebon: best.answer,
      roots: roots.length,
      found: results.filter((r) => r.result !== "missed" && r.result !== "tagging").length,
      missed: results.filter((r) => r.result === "missed" || r.result === "tagging").map((r) => `${r.root}${r.result === "tagging" ? "*" : ""}`).join(" "),
      constructions: constructions.size,
      anchor_hits: anchorHits,
      page_hits: pageHits,
      missed_constructions: missedConstructions.join(" "),
      words: best.words.length,
      in_prompt: best.coverage.filter((c) => c === "word").length,
      pattern: best.coverage.filter((c) => c === "pattern").length,
      missing_words: missingWords.map((w) => w.raw).join(" "),
    });
  }
}

/** NGSL rank by lemma, when the list is on disk (scripts/frequency-coverage.ts downloads it). */
const ngsl = new Map<string, number>();
if (existsSync(NGSL_STATS)) {
  for (const r of parseCsv(readFileSync(NGSL_STATS, "utf8").replace(/^﻿/, "").replace(/\r/g, "")).rows) ngsl.set(r["Lemma"]!.trim().toLowerCase(), Number(r["SFI Rank"]));
}
/** Unranked lemmas sort after every ranked one, in sentence order. */
const rankOf = (frequency: number | "") => (frequency === "" ? ngsl.size + 1 : frequency);
const shared = new Map<string, number>();
const missKey = (m: Miss) => `${m.set}\t${m.word}`;
for (const m of misses) shared.set(missKey(m), (shared.get(missKey(m)) ?? 0) + 1);
const worklist = misses
  .map((m) => ({
    set: m.set,
    english: m.english,
    word: m.word,
    kind: m.kind,
    lemma: m.lemma,
    frequency: ngsl.get(m.lemma) ?? ("" as const),
    sentences: shared.get(missKey(m))!,
    owner: ROUTE[m.kind].owner,
    suggested_fix: m.link ? `${ROUTE[m.kind].fix} (${m.link})` : ROUTE[m.kind].fix,
  }))
  .sort((a, b) => rankOf(a.frequency) - rankOf(b.frequency) || b.sentences - a.sentences || a.word.localeCompare(b.word));

mkdirSync(TMP, { recursive: true });
writeFileSync(join(TMP, "english-helper-recall.csv"), serializeCsv(Object.keys(rows[0] ?? {}), rows as unknown as Record<string, string>[]));
writeFileSync(join(TMP, "english-helper-worklist.csv"), serializeCsv(Object.keys(worklist[0] ?? { set: "" }), worklist));

const share = (n: number, d: number) => (d ? Math.round((1000 * n) / d) / 10 : 0);
const pct = (n: number, d: number) => (d ? `${share(n, d).toFixed(1)}%` : "-");
const STRUCTURE_SHARE = 0.2;
const senseOf = (root: string) => {
  for (const [sense, list] of data.lexicon) if (list.some((s) => s.tier === "root" && s.form === root)) return sense;
  return "";
};
const median = (xs: number[], q = 0.5) => {
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0;
};

/** Phenomena in file order, then the stages in band order. */
const bandOrder = (group: string) => (BANDS as readonly string[]).indexOf(group);
const sum = (m: Map<string, number>) => [...m.values()].reduce((a, b) => a + b, 0);

function summarize(set: SetName) {
  const t = tallies.get(set)!;
  const sentences = rows.filter((r) => r.set === set).length;
  const totalRoots = [...t.roots.values()].reduce((a, b) => a + b, 0);
  const structural = new Set([...t.constructions].filter(([, c]) => c.uses >= sentences * STRUCTURE_SHARE).map(([id]) => id));
  const taught = [...t.constructions].filter(([id]) => !structural.has(id)).map(([, c]) => c);
  const constructionUses = taught.reduce((a, c) => a + c.uses, 0);
  const totalWords = [...t.coverage.values()].reduce((a, b) => a + b, 0);
  const word = t.coverage.get("word") ?? 0;
  const pattern = t.coverage.get("pattern") ?? 0;
  const top1 = t.roots.get("top1") ?? 0;
  const missedRoots = (t.roots.get("missed") ?? 0) + (t.roots.get("tagging") ?? 0);
  const reference = REFERENCE_SETS.includes(set);
  const gapCount = [...t.gaps.values()].reduce((a, m) => a + [...m.values()].reduce((x, y) => x + y, 0), 0);
  const headline: Partial<Headline> = {
    ...(reference
      ? {
          selfContained: share(t.selfContained, sentences),
          wordInPrompt: share(word, totalWords),
          rootTop1: share(top1, totalRoots),
          rootAnywhere: share(totalRoots - missedRoots, totalRoots),
          constructionPage: share(
            taught.reduce((a, c) => a + c.page, 0),
            constructionUses,
          ),
        }
      : {}),
    gapRate: share(gapCount, t.slots),
    promptChars: median(t.promptChars),
  };
  const v = t.verify;
  const flaggedWords = v ? sum(v.checks) : 0;
  const plants = v ? [...v.plants.values()].reduce((a, p) => ({ planted: a.planted + p.planted, flagged: a.flagged + p.flagged }), { planted: 0, flagged: 0 }) : undefined;
  if (v && plants) Object.assign(headline, { verifyPrecision: share(v.words - flaggedWords, v.words), verifyRecall: share(plants.flagged, plants.planted) });
  const verify = v && plants && {
    answers: v.answers,
    errors: v.errors,
    words: v.words,
    precision: pct(v.words - flaggedWords, v.words),
    cleanAnswers: pct(v.clean, v.answers),
    unknown: v.unknown,
    falseAlarms: Object.fromEntries([...v.checks].sort((a, b) => b[1] - a[1])),
    recall: pct(plants.flagged, plants.planted),
    planted: plants.planted,
    byPlant: Object.fromEntries(PLANT_KINDS.filter((k) => v.plants.has(k)).map((k) => [k, `${pct(v.plants.get(k)!.flagged, v.plants.get(k)!.planted)} of ${v.plants.get(k)!.planted}`])),
  };
  const perSlot = (n: number) => (t.slots ? (n / t.slots).toFixed(2) : "-");
  return {
    sentences,
    reference,
    headline,
    gaps: {
      slots: t.slots,
      gaps: gapCount,
      rate: pct(gapCount, t.slots),
      byClass: Object.fromEntries(
        [...t.gaps]
          .sort((a, b) => sum(b[1]) - sum(a[1]))
          .map(([cls, byLemma]) => [cls, { gaps: sum(byLemma), top: [...byLemma].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([lemma, n]) => (n > 1 ? `${lemma} ×${n}` : lemma)) }]),
      ),
    },
    noise: { suggestionsPerSlot: perSlot(t.suggestions), jobsPerSlot: perSlot(t.jobs), guessAboveGrammar: pct(t.guessAbove, t.guessSlots), guessSlots: t.guessSlots },
    ...(verify ? { verify } : {}),
    groups: Object.fromEntries(
      [...t.groups]
        .sort((a, b) => bandOrder(a[0]) - bandOrder(b[0]))
        .map(([group, g]) => [group, { sentences: g.sentences, slots: g.slots, gapRate: pct(g.gaps, g.slots) }]),
    ),
    roots: Object.fromEntries(t.roots),
    liveCompounds: t.live,
    foundByTier: Object.fromEntries(TIERS.filter((tier) => t.tiers.has(tier)).map((tier) => [tier, t.tiers.get(tier)!])),
    rootRecall: { top1: pct(top1, totalRoots), top3: pct(top1 + (t.roots.get("top3") ?? 0), totalRoots), anywhere: pct(totalRoots - (t.roots.get("missed") ?? 0) - (t.roots.get("tagging") ?? 0), totalRoots), uses: totalRoots },
    constructions: {
      uses: constructionUses,
      anchor: pct(taught.reduce((a, c) => a + c.anchor, 0), constructionUses),
      page: pct(taught.reduce((a, c) => a + c.page, 0), constructionUses),
      structural: [...structural].sort(),
    },
    prompt: {
      words: totalWords,
      wordInPrompt: pct(word, totalWords),
      patternInPrompt: pct(pattern, totalWords - word),
      missing: pct(totalWords - word - pattern, totalWords),
      selfContained: pct(t.selfContained, sentences),
      chars: { median: median(t.promptChars), p90: median(t.promptChars, 0.9) },
    },
    missedRoots: [...t.missedRoots].sort((a, b) => b[1].count - a[1].count).slice(0, 30).map(([root, m]) => ({ root, sense: senseOf(root), ...m })),
    missedConstructions: [...t.constructions]
      .filter(([id, c]) => c.page < c.uses && !structural.has(id))
      .sort((a, b) => b[1].uses - b[1].page - (a[1].uses - a[1].page))
      .slice(0, 30)
      .map(([id, c]) => ({ id, anchor: registry.get(id)?.anchor, uses: c.uses, page: c.page, anchorHits: c.anchor })),
    missesByKind: Object.fromEntries(KINDS.map((k) => [k, misses.filter((m) => m.set === set && m.kind === k).length])),
  };
}

const summary = Object.fromEntries(sets.map((set) => [set, summarize(set)]));

type Headline = Record<(typeof HEADLINE)[number]["key"], number>;
type Baseline = { sets: Partial<Record<SetName, { sentences: number } & Partial<Headline>>> };

/**
 * The metrics `--check` guards, with the direction that is better and how far the other way a
 * run may move before it fails (percentage points; characters for the prompt size).
 */
const HEADLINE = [
  { key: "selfContained", label: "self-contained", better: "higher", tolerance: 0.5 },
  { key: "wordInPrompt", label: "word in prompt", better: "higher", tolerance: 0.5 },
  { key: "rootTop1", label: "root recall top-1", better: "higher", tolerance: 0.5 },
  { key: "rootAnywhere", label: "root recall anywhere", better: "higher", tolerance: 0.5 },
  { key: "constructionPage", label: "construction recall page", better: "higher", tolerance: 0.5 },
  { key: "gapRate", label: "gap rate", better: "lower", tolerance: 0.5 },
  { key: "verifyPrecision", label: "verify precision", better: "higher", tolerance: 0.5 },
  { key: "verifyRecall", label: "verify recall", better: "higher", tolerance: 0.5 },
  { key: "promptChars", label: "prompt chars median", better: "lower", tolerance: 500 },
] as const;

function readBaseline(): Baseline {
  return existsSync(BASELINE) ? (JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline) : { sets: {} };
}

/** One line per headline metric that moved; `worse` lines are past tolerance. */
function compareBaseline(baseline: Baseline): { worse: string[]; moved: string[] } {
  const worse: string[] = [];
  const moved: string[] = [];
  for (const set of sets) {
    const before = baseline.sets[set];
    if (!before) {
      worse.push(`${set}: no baseline (run with --write-baseline)`);
      continue;
    }
    for (const m of HEADLINE) {
      const was = before[m.key];
      const now = summary[set]!.headline[m.key];
      if (was === undefined || now === undefined || was === now) continue;
      const loss = m.better === "higher" ? was - now : now - was;
      const line = `${set} ${m.label}: ${was} → ${now}`;
      if (loss > m.tolerance) worse.push(line);
      else moved.push(line);
    }
  }
  return { worse, moved };
}

/** Most-missed words of a set: word, lemma, kind, sentence count. */
function topMisses(set: SetName, n: number) {
  const seen = new Set<string>();
  return worklist.filter((w) => w.set === set && !seen.has(w.word) && seen.add(w.word)).slice(0, n);
}

const report: string[] = ["# English helper report", "", "Free metrics from `npm run english-helper-recall`.", ""];
report.push("| Metric | " + sets.join(" | ") + " |", "|---|" + sets.map(() => "---").join("|") + "|");
type Summary = ReturnType<typeof summarize>;
const metric = (name: string, f: (s: Summary) => string | number) => report.push(`| ${name} | ${sets.map((set) => f(summary[set]!)).join(" | ")} |`);
/** A metric that needs reference Agebon: blank for the wild set. */
const refMetric = (name: string, f: (s: Summary) => string | number) => metric(name, (s) => (s.reference ? f(s) : "-"));
metric("sentences", (s) => s.sentences);
refMetric("**self-contained**", (s) => `**${s.prompt.selfContained}**`);
refMetric("word in prompt", (s) => s.prompt.wordInPrompt);
refMetric("pattern in prompt (of the rest)", (s) => s.prompt.patternInPrompt);
refMetric("words missing", (s) => s.prompt.missing);
refMetric("root recall top-1 / top-3 / anywhere", (s) => `${s.rootRecall.top1} / ${s.rootRecall.top3} / ${s.rootRecall.anywhere}`);
refMetric("construction recall anchor / page", (s) => `${s.constructions.anchor} / ${s.constructions.page}`);
metric("**gap rate** (slots with no suggestion)", (s) => `**${s.gaps.rate}** (${s.gaps.gaps} of ${s.gaps.slots})`);
metric("suggestions / jobs per slot", (s) => `${s.noise.suggestionsPerSlot} / ${s.noise.jobsPerSlot}`);
metric("guess above a grammar row", (s) => `${s.noise.guessAboveGrammar} of ${s.noise.guessSlots}`);
metric("prompt chars median / p90", (s) => `${s.prompt.chars.median} / ${s.prompt.chars.p90}`);
metric("**verify precision** (words with no check) / clean answers", (s) => (s.verify ? `**${s.verify.precision}** / ${s.verify.cleanAnswers}` : "-"));
metric("**verify recall** (planted errors flagged)", (s) => (s.verify ? `**${s.verify.recall}** of ${s.verify.planted}` : "-"));
metric(`misses: ${KINDS.join(" / ")}`, (s) => Object.values(s.missesByKind).join(" / "));
for (const set of sets) {
  const s = summary[set]!;
  if (s.verify) {
    report.push("", `## Verify: ${set}`, "", `${s.verify.answers} accepted answers (${s.verify.errors} that \`--verify\` cannot parse), ${s.verify.words} content words, ${s.verify.unknown} not in the lexicon.`, "");
    report.push("| False alarms by check | Words |", "|---|---|", ...Object.entries(s.verify.falseAlarms).map(([check, n]) => `| ${check} | ${n} |`));
    report.push("", "| Planted error | Flagged |", "|---|---|", ...Object.entries(s.verify.byPlant).map(([kind, r]) => `| ${kind} | ${r} |`));
  }
  report.push("", `## Gaps by word class: ${set}`, "", "| Class | Gaps | Top lemmas |", "|---|---|---|");
  for (const [cls, g] of Object.entries(s.gaps.byClass)) report.push(`| ${cls} | ${g.gaps} | ${g.top.map((l) => `*${l}*`).join(", ")} |`);
  if (Object.keys(s.groups).length) {
    report.push("", `## Gap rate by phenomenon and stage: ${set}`, "", "| Group | Sentences | Slots | Gap rate |", "|---|---|---|---|");
    for (const [group, g] of Object.entries(s.groups)) report.push(`| ${group} | ${g.sentences} | ${g.slots} | ${g.gapRate} |`);
  }
  report.push("", `## Most-missed words: ${set}`, "", "| Word | Lemma | NGSL | Sentences | Kind |", "|---|---|---|---|---|");
  for (const w of topMisses(set, 30)) report.push(`| \`${w.word}\` | ${w.lemma ? `*${w.lemma}*` : ""} | ${w.frequency} | ${w.sentences} | ${w.kind} |`);
}
if (ngsl.size === 0) report.push("", "NGSL ranks are blank: run `npx tsx scripts/frequency-coverage.ts` once to download the list.");
writeFileSync(join(TMP, "english-helper-report.md"), report.join("\n") + "\n");

if (json) console.log(JSON.stringify(summary, null, 2));
else {
  for (const set of sets) {
    const s = summary[set]!;
    console.log(`== ${set}: ${s.sentences} sentences`);
    console.log(`gap rate ${s.gaps.rate} (${s.gaps.gaps} of ${s.gaps.slots} slots); ${s.noise.suggestionsPerSlot} suggestions and ${s.noise.jobsPerSlot} jobs per slot; guess above a grammar row ${s.noise.guessAboveGrammar} of ${s.noise.guessSlots}`);
    for (const [cls, g] of Object.entries(s.gaps.byClass).slice(0, 4)) console.log(`  ${cls.padEnd(12)} ${String(g.gaps).padStart(4)}  ${g.top.slice(0, 8).join(", ")}`);
    if (!s.reference) {
      console.log(`prompt chars median ${s.prompt.chars.median}, p90 ${s.prompt.chars.p90}`);
      for (const [group, g] of Object.entries(s.groups)) console.log(`  ${group.padEnd(14)} gap rate ${g.gapRate.padStart(6)} (${g.slots} slots)`);
      console.log("\nmost-missed words (gaps, guesses ranked first):");
      for (const w of topMisses(set, 15)) console.log(`  ${String(w.sentences).padStart(4)}  ${w.word.padEnd(14)} ${(w.lemma || "-").padEnd(10)} ${w.kind}`);
      console.log();
      continue;
    }
    if (s.verify) {
      console.log(`verify: precision ${s.verify.precision} of ${s.verify.words} words (${s.verify.cleanAnswers} of ${s.verify.answers} answers clean; false alarms ${Object.entries(s.verify.falseAlarms).map(([k, n]) => `${k} ${n}`).join(", ")})`);
      console.log(`  recall ${s.verify.recall} of ${s.verify.planted} planted errors (${Object.entries(s.verify.byPlant).map(([k, r]) => `${k} ${r}`).join(", ")})`);
    }
    console.log(`self-contained ${s.prompt.selfContained} — of ${s.prompt.words} reference words, ${s.prompt.wordInPrompt} in the prompt, ${s.prompt.patternInPrompt} of the rest a shown pattern, ${s.prompt.missing} missing`);
    console.log(`  misses: ${Object.entries(s.missesByKind).map(([k, n]) => `${k} ${n}`).join(", ")}; prompt chars median ${s.prompt.chars.median}, p90 ${s.prompt.chars.p90}`);
    console.log(`roots: ${s.rootRecall.uses} uses — top-1 ${s.rootRecall.top1}, top-3 ${s.rootRecall.top3}, anywhere ${s.rootRecall.anywhere}`);
    for (const [k, v] of Object.entries(s.roots).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(8)} ${v}`);
    console.log(`live x compounds: ${s.liveCompounds.suggested} of ${s.liveCompounds.uses} two-root uses built (${s.liveCompounds.offered} offered in all)`);
    console.log(`found by tier: ${Object.entries(s.foundByTier).map(([t, n]) => `${t} ${n}`).join(", ")}`);
    console.log(`constructions: ${s.constructions.uses} uses — home anchor suggested ${s.constructions.anchor}, home page ${s.constructions.page}`);
    console.log(`  (${s.constructions.structural.length} structural constructions in ≥${STRUCTURE_SHARE * 100}% of sentences not counted)`);
    console.log("\nmost-missed roots (* = tagging miss: the word was in the sentence):");
    for (const m of s.missedRoots.slice(0, 15)) console.log(`  ${String(m.count).padStart(4)}  ${m.root}${m.result === "tagging" ? "*" : " "} ${m.sense}`);
    console.log("\nmost-missed constructions (home page never suggested):");
    for (const m of s.missedConstructions.slice(0, 15)) console.log(`  ${String(m.uses - m.page).padStart(4)}/${m.uses}  ${m.id}  ${m.anchor}`);
    console.log("\nmost-missed words (not in the prompt):");
    for (const w of topMisses(set, 15)) console.log(`  ${String(w.sentences).padStart(4)}  ${w.word.padEnd(14)} ${(w.lemma || "-").padEnd(10)} ${w.kind}`);
    console.log();
  }
  console.log("→ tmp/english-helper-recall.csv, tmp/english-helper-worklist.csv, tmp/english-helper-report.md");
}

if (check) {
  const { worse, moved } = compareBaseline(readBaseline());
  for (const line of moved) console.error(`  moved: ${line}`);
  for (const line of worse) console.error(`  WORSE: ${line}`);
  if (worse.length) {
    console.error(`baseline check failed: ${worse.length} metric${worse.length === 1 ? "" : "s"} past tolerance (src/generated/english-helper-baseline.json)`);
    process.exitCode = 1;
  } else console.error(`baseline check passed${moved.length ? "; --write-baseline to keep the new numbers" : ""}`);
}
if (writeBaseline) {
  const baseline = readBaseline();
  for (const set of sets) baseline.sets[set] = { sentences: summary[set]!.sentences, ...summary[set]!.headline };
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
  console.error(`→ src/generated/english-helper-baseline.json (${sets.join(", ")})`);
}
