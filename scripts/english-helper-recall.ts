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
 *   checkpoint  English → Ageben practice items, with their **Also correct** answers; held out
 *               of the example pool
 *   wild        plain English grouped by phenomenon and stage (src/english-helper/wild.tsv), with
 *               no reference Ageben: scored on gaps, noise and prompt size only
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
 * Top-1 is split by root class so a change in the item mix does not read as a ranking loss:
 * open-class top-1 counts roots the reference reads as ordinary content words (and compound
 * parts) found as their slot's first lexicon suggestion; closed row first counts roots it reads
 * only as a closed row (overlay, stand-in, join, sake…) that some slot's first grammar or overlay
 * row spells. The all-roots top-1 stays in the report.
 *
 * Checkpoint items are also scored on the prompt for their own band (`--stage`, from the page's
 * folder): staged self-contained, guarded on the checkpoint set beside the full-prompt score.
 *
 * Worklist classes found mechanically: missing cue, link without form, pattern read as spelling
 * (the linking row's form is only notation), joined prose cell (a table cell joins two code spans
 * with prose, so the helper offers them as alternatives), wrong side (the helper offers the root
 * only on its other -l / -m side), tagger, ranking, and the two verify classes.
 *
 * Baseline: src/generated/english-helper-baseline.json holds each set's headline metrics, and
 * src/generated/english-helper-baseline-items.json each sentence's share of them, keyed by its
 * English. `--check` compares the sentences both runs have, so a new, moved or deleted item never
 * moves a guarded number, and fails when a metric is worse on those sentences by more than its
 * tolerance; each metric names the sets it guards (the in-sample doc set guards only root recall
 * anywhere, gap rate and prompt size). Under each metric that moved it lists the sentences that
 * moved it: for *self-contained*, the words now missing, their worklist class, and whether the
 * item's answers were edited since the baseline. Prompt size is a median, compared over all
 * sentences. The check is not part of `npm test`, since doc edits move the numbers.
 * `--write-baseline` updates both files for the sets it ran.
 *
 * Writes tmp/english-helper-recall.csv (one row per sentence), tmp/english-helper-worklist.csv
 * (one row per missing word, and for the wild set per gap and per guess ranked above a grammar
 * row, most frequent English first; NGSL ranks when
 * scripts/frequency-coverage.ts has downloaded the list), and tmp/english-helper-report.md.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

import { parseCsv, serializeCsv } from "../src/csv.js";
import { analyzeEnglish, patternForm, suggestionLinks, TIERS, type Analysis, type Slot, type Suggestion } from "../src/english-helper/analyze.js";
import { coverWord, familyRoots, promptShows, treeWords, type Coverage, type PromptShows, type TreeWord } from "../src/english-helper/coverage.js";
import { buildHelperPrompt, promptLinks } from "../src/english-helper/llm-prompt.js";
import { loadCanonicalAnchors, loadHelperData, loadParadigmBlocks } from "../src/english-helper/load.js";
import { paradigmLines, REACHES, type CapFill, type Reach } from "../src/english-helper/paradigms.js";
import { PLANT_KINDS, plantErrors, plantFlagged, type PlantKind } from "../src/english-helper/plant.js";
import { verifyDraft, type Verified } from "../src/english-helper/verify.js";
import { tagEnglish } from "../src/english-helper/tag.js";
import { fillSelf } from "../src/learner-name.js";
import { BANDS, pageSections, type Band } from "../src/lint/learning-order.js";
import { grammarPath } from "../src/english-helper/cues.js";
import { practiceItems } from "../src/lint/practice-items.js";
import { docExamples, examplePair, loadPromptContext, tableExamples } from "../src/parse/llm-examples.js";
import { constructionRegistry } from "../src/parse/constructions.js";
import { loadDefaultTables, parseWithTables } from "../src/parse/index.js";
import { listMarkdown } from "../src/markdown-files.js";
import { REPO_ROOT } from "../src/repo-paths.js";

const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");
const TMP = join(REPO_ROOT, "tmp");
const NGSL_STATS = join(TMP, "NGSL_12_stats.csv");
const BASELINE = join(REPO_ROOT, "src", "generated", "english-helper-baseline.json");
const BASELINE_ITEMS = join(REPO_ROOT, "src", "generated", "english-helper-baseline-items.json");
const SETS = ["doc", "checkpoint", "wild"] as const;
type SetName = (typeof SETS)[number];
/** Sets with reference Ageben, scored on roots, constructions and the prompt's words. */
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
const pages = listMarkdown(GRAMMAR_DIR).map((file) => basename(file)).sort();
const markdownOf = new Map(listMarkdown(GRAMMAR_DIR).map((file) => [basename(file), readFileSync(file, "utf8")]));
/** A stage page's band, from its folder (`beginner/`, `intermediate/`, `advanced/`); none for top-level pages. */
const bandOfPage = new Map(
  listMarkdown(GRAMMAR_DIR).flatMap((file) => {
    const folder = basename(dirname(file));
    return (BANDS as readonly string[]).includes(folder) ? [[basename(file), folder as Band] as const] : [];
  }),
);

/**
 * Content roots, live-compound parts, and role-compound stems the parse tree uses. A root is
 * open-class when some word reads it as an ordinary content word (or a compound part); a root
 * the tree only reads as a closed row (an overlay, stand-in, join, sake…) is closed, and the
 * helper reaches it through a grammar row, not a lexicon suggestion.
 */
function usedRoots(tree: unknown): { root: string; open: boolean }[] {
  const out = new Map<string, boolean>();
  const add = (root: string, open: boolean) => out.set(root, (out.get(root) ?? false) || open);
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const { family, reading } = node as { reading?: string; family?: { kind: string; roots?: string[]; xFamily?: string; leftRoots?: string[]; rightRoots?: string[] } };
    if (family?.kind === "content") for (const root of family.roots ?? []) add(root, reading === "ordinary");
    if (family?.kind === "x" && (family.xFamily === "compound" || family.xFamily === "role")) for (const root of [...(family.leftRoots ?? []), ...(family.rightRoots ?? [])]) add(root, true);
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value);
  };
  walk(tree);
  return [...out].map(([root, open]) => ({ root, open }));
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

/** The rows a closed root is reached through: grammar jobs, entries and detectors, and overlay rows. */
const isRow = (s: Suggestion) => s.tier === "grammar" || s.tier === "overlay";
const rowSpells = (s: Suggestion, root: string) => (s.kind === "lexicon" ? s.form === root : forms(s).some((f) => f.includes(root)));

/** A closed root that some slot's first row spells (or builds on). */
function rowFirst(analysis: Analysis, root: string): boolean {
  return analysis.clauses.some((c) =>
    c.slots.some((slot) => {
      const first = slot.suggestions.find(isRow);
      return !!first && rowSpells(first, root);
    }),
  );
}

/** One English sentence with its accepted Ageben answers (the first is the main one; none for the wild set). */
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
      out.push({ set: "doc", source: pair.source, english: pair.sentence, answers: [pair.ageben] });
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
      const main = item.spoiler.find((line) => line.kind === "ageben");
      if (!main) continue;
      const line = markdown.slice(0, item.index).split("\n").length;
      const stage = bandOfPage.get(page);
      out.push({ set: "checkpoint", source: `${page}:${line}`, english: item.promptEnglish, answers: [main.text, ...item.alsoCorrect.map((span) => span.text)].map((a) => fillSelf(a)), ...(stage ? { stage } : {}) });
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

type Kind = "missing cue" | "link without form" | "pattern read as spelling" | "joined prose cell" | "wrong side" | "tagger" | "ranking" | "verify false alarm" | "verify blind spot";
const KINDS: readonly Kind[] = ["missing cue", "link without form", "pattern read as spelling", "joined prose cell", "wrong side", "tagger", "ranking", "verify false alarm", "verify blind spot"];
const ROUTE: Record<Kind, { owner: string; fix: string }> = {
  "missing cue": {
    owner: "say-*.md / english.md row, or the owning section's table",
    fix: "run find-english.mjs; if a page teaches the form, add an italic cue on its row; if none does, log a grammar gap with the phrases tried",
  },
  "link without form": { owner: "analyzer (describe.ts / analyze.ts)", fix: "the linked section spells this word: show it, or an e.g. sentence that uses it" },
  "pattern read as spelling": {
    owner: "the row's doc cell, or the analyzer's example pick (analyze.ts addExamples)",
    fix: "the row that links the section writes its form only as notation (`/b/`, `+`, a sound): spell the word in the cell, or pick an example that uses it",
  },
  "joined prose cell": {
    owner: "the recipe or section table cell (say-*.md, english.md, or the owning page)",
    fix: "the cell joins two code spans with prose (and, then, +), so the helper offers them as alternatives: make the phrase one code span, or split the row",
  },
  "wrong side": {
    owner: "the row's english_by_pos or sense cell (data/lexicon-published.csv), or a cue that names the side",
    fix: "the helper offers this root only on its other side (-l concrete vs -m abstract) for the English word: add the English to the side the reference uses",
  },
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
  ageben: string;
  roots: number;
  found: number;
  missed: string;
  /** Roots found, but not as the slot's first lexicon suggestion: `root:result` (`ahu:grammar`, `alo:top3`). */
  not_top1: string;
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

/** Every suggestion in an analysis's slots. */
const rowsOf = (analysis: Analysis) => analysis.clauses.flatMap((c) => c.slots.flatMap((s) => s.suggestions));

/** Prose between two code spans of a table cell (`a` and `b`): the helper reads the spans as alternatives. A `+` keeps them one form. */
const JOINED_PROSE = /`[^`|]+`\**\s+(?:and|then|plus|with|before|after)\s+\**`/;

/** The source rows (`page.md:line`) whose form cell joins code spans with prose. */
function joinedProseRow(source: string): boolean {
  const [page, line] = source.split(":");
  const text = markdownOf.get(page!)?.split("\n")[Number(line) - 1] ?? "";
  return JOINED_PROSE.test(text);
}

/** A reference word on `-l` / `-m` whose root the lexicon suggestions offer only on the other side. */
function wrongSide(word: TreeWord, analysis: Analysis): boolean {
  if (word.reading !== "ordinary" || word.family.kind !== "content" || (word.ending !== "l" && word.ending !== "m")) return false;
  const side = word.ending === "l" ? "concrete" : "abstract";
  const offered = rowsOf(analysis).filter((s) => s.kind === "lexicon" && word.family.kind === "content" && word.family.roots.includes(s.form));
  return offered.length > 0 && offered.every((s) => s.kind === "lexicon" && s.side !== undefined && s.side !== side && !s.sideWords?.length);
}

/** A root the prompt never shows, though a word of the sentence names it, is a tagger miss; a root it shows in the wrong shape is not. */
function classify(word: TreeWord, analysis: Analysis, shows: PromptShows, sentenceWords: Set<string>): { kind: Kind; link: string } {
  const suggested = analysis.clauses.flatMap((c) => [...c.detectors, ...c.slots.flatMap((s) => s.suggestions)]).flatMap(suggestionLinks);
  const roots = familyRoots(word.family);
  if (word.reading === "ordinary" && roots.some((r) => !shows.roots.has(r))) {
    if ([...sentenceWords].some((w) => (data.lexicon.get(w) ?? []).some((s) => roots.includes(s.form)))) return { kind: "tagger", link: "" };
  }
  const spelled = suggested.find((link) => pageSpells(link.split("#")[0]!, word.raw));
  if (spelled) {
    const notation = rowsOf(analysis).find((s) => (s.kind === "job" || s.kind === "entry") && suggestionLinks(s).includes(spelled) && patternForm(data, s.form));
    return { kind: notation ? "pattern read as spelling" : "link without form", link: spelled };
  }
  if (word.family.kind === "number") {
    const numbers = suggested.find((link) => link.startsWith("numbers"));
    if (numbers) return { kind: "link without form", link: numbers };
  }
  return { kind: "missing cue", link: "" };
}

type Scored = { answer: string; tree: unknown; words: TreeWord[]; coverage: Coverage[] };

const rows: Row[] = [];
const misses: Miss[] = [];

/** A sentence's share of one metric: [counted, of]. */
type Pair = [number, number];
/**
 * One sentence's share of each guarded metric. The baseline keeps these, so `--check` compares
 * the same sentences in both runs. The reference fields are absent on the wild set.
 */
type ItemRecord = {
  /** A short hash of the accepted answers: a flip beside a changed hash follows a doc edit. */
  answers?: string;
  /** The closest answer's words the prompt does not show, space-separated; empty when self-contained. */
  missing?: string;
  /** The same on the prompt for the item's own band (checkpoint). */
  staged?: string;
  word?: Pair;
  open?: Pair;
  closed?: Pair;
  anywhere?: Pair;
  page?: Pair;
  gap: Pair;
  verifyClean?: Pair;
  verifyCaught?: Pair;
  /** Non-structural constructions of the closest answer that some example in the prompt uses. */
  frame?: Pair;
};
const items = new Map<SetName, Map<string, ItemRecord>>();
/** Each item's constructions and whether their page was suggested, until the set's structural ones are known. */
const itemConstructions = new Map<ItemRecord, { id: string; page: boolean }[]>();
/** A sentence's key in its set: its English, numbered when the set repeats it. */
function itemKey(records: Map<string, ItemRecord>, english: string): string {
  let key = english;
  for (let n = 2; records.has(key); n++) key = `${english} #${n}`;
  return key;
}
/** Joined prose rows already listed, by set and source row. */
const joinedSeen = new Set<string>();
type SetTally = {
  roots: Map<RootResult, number>;
  /** Open-class root uses and those found as the slot's first lexicon suggestion. */
  open: { uses: number; top1: number };
  /** Closed root uses and those the slot's first row spells. */
  closed: { uses: number; rowFirst: number };
  tiers: Map<string, number>;
  live: { uses: number; suggested: number; offered: number };
  missedRoots: Map<string, { count: number; result: RootResult }>;
  constructions: Map<string, { uses: number; anchor: number; page: number }>;
  coverage: Map<Coverage, number>;
  selfContained: number;
  /** Checkpoint items scored on their own band's prompt (`--stage`), and those self-contained there. */
  staged: { sentences: number; selfContained: number };
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
  for (const plant of plantErrors(main.ageben, main.words ?? [])) {
    const flagged = plantFlagged(verifyDraft(sentence.english, plant.draft, tables, data, analysis), plant);
    if (flagged === undefined) continue;
    const p = t.plants.get(plant.kind) ?? { planted: 0, flagged: 0 };
    p.planted++;
    if (flagged) p.flagged++;
    else misses.push({ set: sentence.set, english: sentence.english, word: plant.to, kind: "verify blind spot", lemma: plant.english?.toLowerCase() ?? "", link: `${plant.kind}: ${plant.from} → ${plant.to}` });
    t.plants.set(plant.kind, p);
  }
}
/** The verify counts so far, to read one sentence's share as a difference. */
function verifyCounts(v: VerifyTally) {
  const plants = [...v.plants.values()];
  return { words: v.words, flagged: [...v.checks.values()].reduce((a, b) => a + b, 0), planted: plants.reduce((a, p) => a + p.planted, 0), caught: plants.reduce((a, p) => a + p.flagged, 0) };
}
const tallies = new Map<SetName, SetTally>();

/**
 * Dry measure for paradigm blocks (checkpoint only): would the item be self-contained if the
 * cheat sheet blocks its linked sections reach were shown? Nothing is added to the prompt.
 */
const paradigmBlocks = loadParadigmBlocks();
const canonicalAnchors = loadCanonicalAnchors();
type ReachTally = { selfContained: number; chars: number[]; leanChars: number[]; recovered: number; closedRecovered: number };
const reachTallies = new Map<Reach, ReachTally>(REACHES.map((r) => [r, { selfContained: 0, chars: [], leanChars: [], recovered: 0, closedRecovered: 0 }]));
/** Checkpoint words missing from the prompt: closed or not, and the narrowest reach that recovers each (none when no reach does). */
const reachMisses: { english: string; word: string; closed: boolean; reach: Reach | ""; kind: string }[] = [];
const reachBaseline = { sentences: 0, selfContained: 0, missing: 0, closedMissing: 0, promptChars: 0 };
const blockShows = new Map<string, PromptShows>();
/** Lean renderings under a character cap (the largest block dropped first), measured beside the uncapped reaches. */
const CAPPED: { reach: Reach; cap: number; fill: CapFill }[] = [
  { reach: "table", cap: 3000, fill: "drop-largest" },
  { reach: "page", cap: 6000, fill: "drop-largest" },
  { reach: "sheet", cap: 6000, fill: "drop-largest" },
  { reach: "sheet", cap: 3000, fill: "nearest" },
  { reach: "sheet", cap: 6000, fill: "nearest" },
  { reach: "sheet", cap: 12000, fill: "nearest" },
];
const cappedTallies = CAPPED.map((c) => ({ ...c, selfContained: 0, chars: [] as number[] }));
/** What a prompt shows with some block lines added: the prompt's own words, and the blocks' (cached by text). */
function withBlocks(shows: PromptShows, lines: readonly string[]): PromptShows {
  if (!lines.length) return shows;
  const text = lines.join("\n");
  let extra = blockShows.get(text);
  if (!extra) {
    extra = promptShows(text, []);
    if (blockShows.size < 2000) blockShows.set(text, extra);
  }
  const families = new Map([...shows.families].map(([k, v]) => [k, new Set(v)]));
  for (const [k, v] of extra.families) families.set(k, new Set([...(families.get(k) ?? []), ...v]));
  return { words: new Set([...shows.words, ...extra.words]), roots: new Set([...shows.roots, ...extra.roots]), families, xFamilies: new Set([...shows.xFamilies, ...extra.xFamilies]) };
}
/** A word the reference reads as something other than an ordinary content word: a closed row, hook, number, stand-in… */
const closedWord = (w: TreeWord) => !(w.reading === "ordinary" && w.family.kind === "content");

/** Each item's non-structural constructions and whether an example in its prompt uses them, until the set's structural ones are known. */
const itemFrames = new Map<ItemRecord, { id: string; shown: boolean; wanted: boolean; exists: boolean; canonical: boolean; page: boolean; block: boolean; taught: boolean; taughtBlock: boolean }[]>();
/** The sections the rows of the shown blocks link (sheet reach, lean, ≤ 6000, nearest first). */
function shownBlockLinks(links: Set<string>): string[] {
  const lines = new Set(paradigmLines(paradigmBlocks, links, "sheet", "lean", 6000, "nearest"));
  return paradigmBlocks.flatMap((b) => b.rows.filter((r) => lines.has(r.lean)).flatMap((r) => r.links));
}
/** Section (`page.md#slug`, and each enclosing section) → the constructions its own doc examples use. */
const sectionConstructions = new Map<string, Set<string>>();
{
  const byPage = new Map(listMarkdown(GRAMMAR_DIR).map((file) => [grammarPath(file), readFileSync(file, "utf8")]));
  const sectionsOf = new Map<string, ReturnType<typeof pageSections>["sections"]>();
  for (const pair of context.index) {
    const [page, line] = pair.source.split(":");
    const markdown = byPage.get(page!);
    if (!markdown) continue;
    if (!sectionsOf.has(page!)) sectionsOf.set(page!, pageSections(page!, markdown).sections);
    const offset = markdown.split("\n").slice(0, Number(line) - 1).join("\n").length;
    for (const sec of sectionsOf.get(page!)!) {
      if (!sec.slug || offset < sec.offset || offset >= sec.end) continue;
      const key = `${page}#${sec.slug}`;
      const set = sectionConstructions.get(key) ?? new Set<string>();
      for (const id of pair.constructions) set.add(id);
      sectionConstructions.set(key, set);
    }
  }
}
/** Constructions some example in the index uses. */
const exampleIds = new Set(context.index.flatMap((pair) => pair.constructions));
/** Frames not shown: the selection wanted them (the analysis links their home), or did not. */
/** Frames neither wanted nor reached by a shown block row, by construction id, per set. */
const frameUnreached = new Map<SetName, Map<string, number>>();
const frameMisses = new Map<SetName, { wanted: number; unwanted: number; noExample: number; canonical: number; page: number; block: number; taught: number; taughtBlock: number }>();
const indexConstructions = new Map<string, Set<string>>();
for (const pair of context.index) {
  const set = indexConstructions.get(pair.ageben) ?? new Set<string>();
  for (const id of pair.constructions) set.add(id);
  indexConstructions.set(pair.ageben, set);
}
/** The constructions the prompt's examples use (its `AGEBEN:` lines, looked up in the example index). */
function exampleConstructions(prompt: string): Set<string> {
  const out = new Set<string>();
  for (const m of prompt.matchAll(/^AGEBEN: (.+)$/gm)) for (const id of indexConstructions.get(m[1]!) ?? []) out.add(id);
  return out;
}

for (const set of sets) {
  const tally: SetTally = {
    roots: new Map(),
    open: { uses: 0, top1: 0 },
    closed: { uses: 0, rowFirst: 0 },
    tiers: new Map(),
    live: { uses: 0, suggested: 0, offered: 0 },
    missedRoots: new Map(),
    constructions: new Map(),
    coverage: new Map(),
    selfContained: 0,
    staged: { sentences: 0, selfContained: 0 },
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
  const records = new Map<string, ItemRecord>();
  items.set(set, records);
  for (const sentence of sentencesOf(set)) {
    const analysis = analyzeEnglish(data, sentence.english);
    const prompt = buildHelperPrompt([{ english: sentence.english, analysis }], data, context);
    const shows = promptShows(prompt, [analysis]);
    let best: Scored | undefined;
    const parsed: TreeWord[][] = [];
    for (const answer of sentence.answers) {
      let tree: unknown;
      try {
        tree = parseWithTables(answer, tables, { constructions: true });
      } catch {
        continue;
      }
      const words = treeWords(tree);
      parsed.push(words);
      const coverage = words.map((w) => coverWord(w, shows));
      const missing = coverage.filter((c) => c === "missing").length;
      if (!best || missing < best.coverage.filter((c) => c === "missing").length) best = { answer, tree, words, coverage };
    }
    if (sentence.answers.length && !best) continue;
    // Staged: the same item on the prompt a learner at the item's own band sees.
    let stagedMissing: string | undefined;
    if (set === "checkpoint" && sentence.stage && parsed.length) {
      const stage = sentence.stage as Band;
      const stagedAnalysis = analyzeEnglish(data, sentence.english, { stage });
      const stagedShows = promptShows(buildHelperPrompt([{ english: sentence.english, analysis: stagedAnalysis }], data, context), [stagedAnalysis]);
      const missingOf = parsed.map((words) => words.filter((w) => coverWord(w, stagedShows) === "missing").map((w) => w.raw));
      stagedMissing = missingOf.sort((a, b) => a.length - b.length)[0]!.join(" ");
      tally.staged.sentences++;
      if (stagedMissing === "") tally.staged.selfContained++;
    }

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
      for (const s of slot.suggestions) {
        if (s.kind !== "job" || !s.form.includes(" / ") || joinedSeen.has(`${set} ${s.source}`) || !joinedProseRow(s.source)) continue;
        joinedSeen.add(`${set} ${s.source}`);
        misses.push({ set, english: sentence.english, word: slot.text, kind: "joined prose cell", lemma: slot.lemma, link: `${s.source}: ${s.form}` });
      }
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
      records.set(itemKey(records, sentence.english), { gap: [analysis.gaps.length, slots.length] });
      rows.push({ ...base, ageben: "", roots: 0, found: 0, missed: "", not_top1: "", constructions: 0, anchor_hits: 0, page_hits: 0, missed_constructions: "", words: 0, in_prompt: 0, pattern: 0, missing_words: "" });
      continue;
    }
    const { tree } = best;
    const verifyBefore = tally.verify && verifyCounts(tally.verify);
    if (tally.verify) scoreVerify(sentence, analysis, tally.verify);

    const sentenceWords = new Set(tagEnglish(sentence.english).flatMap((s) => s.clauses.flatMap((c) => c.terms.flatMap((t) => [t.normal, t.lemma]))));
    const roots = usedRoots(tree);
    const liveStems = usedLiveStems(tree);
    const results = roots.map(({ root, open }) => ({ root, open, first: !open && rowFirst(analysis, root), ...rootResult(analysis, root, sentenceWords) }));
    for (const { root, open, first, result, tier } of results) {
      tally.roots.set(result, (tally.roots.get(result) ?? 0) + 1);
      if (open) {
        tally.open.uses++;
        if (result === "top1") tally.open.top1++;
      } else {
        tally.closed.uses++;
        if (first) tally.closed.rowFirst++;
      }
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
    const pageByConstruction: { id: string; page: boolean }[] = [];
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
      pageByConstruction.push({ id, page: suggestedPages.has(anchor.split("#")[0]) });
      if (suggestedPages.has(anchor.split("#")[0])) {
        t.page++;
        pageHits++;
      } else missedConstructions.push(id);
      tally.constructions.set(id, t);
    }

    for (const c of best.coverage) tally.coverage.set(c, (tally.coverage.get(c) ?? 0) + 1);
    const missingWords = best.words.filter((_, k) => best.coverage[k] === "missing");
    if (missingWords.length === 0) tally.selfContained++;
    if (set === "checkpoint") {
      const links = [...promptLinks([{ english: sentence.english, analysis }])].map((l) => canonicalAnchors.get(l) ?? l);
      reachBaseline.sentences++;
      reachBaseline.promptChars += prompt.length;
      if (!missingWords.length) reachBaseline.selfContained++;
      reachBaseline.missing += missingWords.length;
      reachBaseline.closedMissing += missingWords.filter(closedWord).length;
      const firstReach = new Map<TreeWord, Reach>();
      for (const reach of REACHES) {
        const lines = paradigmLines(paradigmBlocks, links, reach);
        const reachShows = withBlocks(shows, lines);
        const r = reachTallies.get(reach)!;
        r.chars.push(lines.reduce((a, l) => a + l.length + 1, 0));
        r.leanChars.push(paradigmLines(paradigmBlocks, links, reach, "lean").reduce((a, l) => a + l.length + 1, 0));
        if (parsed.some((words) => words.every((w) => coverWord(w, reachShows) !== "missing"))) r.selfContained++;
        for (const w of missingWords) {
          if (coverWord(w, reachShows) === "missing") continue;
          r.recovered++;
          if (closedWord(w)) r.closedRecovered++;
          if (!firstReach.has(w)) firstReach.set(w, reach);
        }
      }
      for (const c of cappedTallies) {
        const lines = paradigmLines(paradigmBlocks, links, c.reach, "lean", c.cap, c.fill);
        const reachShows = withBlocks(shows, lines);
        c.chars.push(lines.reduce((a, l) => a + l.length + 1, 0));
        if (parsed.some((words) => words.every((w) => coverWord(w, reachShows) !== "missing"))) c.selfContained++;
      }
      for (const w of missingWords) {
        reachMisses.push({ english: sentence.english, word: w.raw, closed: closedWord(w), reach: firstReach.get(w) ?? "", kind: classify(w, analysis, shows, sentenceWords).kind });
      }
    }
    for (const word of missingWords) {
      const { kind, link } = classify(word, analysis, shows, sentenceWords);
      misses.push({ set, english: sentence.english, word: word.raw, kind, lemma: lemmaFor(word, sentenceWords), link });
    }
    for (const word of best.words) {
      if (wrongSide(word, analysis)) misses.push({ set, english: sentence.english, word: word.raw, kind: "wrong side", lemma: lemmaFor(word, sentenceWords), link: "" });
    }

    const record: ItemRecord = {
      answers: createHash("sha256").update(sentence.answers.join("\n")).digest("hex").slice(0, 8),
      missing: missingWords.map((w) => w.raw).join(" "),
      ...(stagedMissing === undefined ? {} : { staged: stagedMissing }),
      word: [best.coverage.filter((c) => c === "word").length, best.words.length],
      open: [results.filter((r) => r.open && r.result === "top1").length, results.filter((r) => r.open).length],
      closed: [results.filter((r) => r.first).length, results.filter((r) => !r.open).length],
      anywhere: [results.filter((r) => r.result !== "missed" && r.result !== "tagging").length, results.length],
      gap: [analysis.gaps.length, slots.length],
    };
    if (verifyBefore) {
      const after = verifyCounts(tally.verify!);
      const words = after.words - verifyBefore.words;
      record.verifyClean = [words - (after.flagged - verifyBefore.flagged), words];
      record.verifyCaught = [after.caught - verifyBefore.caught, after.planted - verifyBefore.planted];
    }
    itemConstructions.set(record, pageByConstruction);
    const shownConstructions = exampleConstructions(prompt);
    const promptAnchors = promptLinks([{ english: sentence.english, analysis }]);
    const canon = (l: string) => canonicalAnchors.get(l) ?? l;
    const canonLinks = new Set([...promptAnchors].map(canon));
    const linkedPages = new Set([...promptAnchors].map((l) => l.split("#")[0]));
    const blockLinks = new Set(paradigmLines(paradigmBlocks, canonLinks, "sheet", "lean", 6000, "nearest").length ? shownBlockLinks(canonLinks) : []);
    itemFrames.set(
      record,
      [...constructions].map((id) => {
        const home = context.anchors?.get(id) ?? "";
        const taughtBy = (links: Iterable<string>) => [...links].some((l) => sectionConstructions.get(l)?.has(id));
        return { id, shown: shownConstructions.has(id), wanted: promptAnchors.has(home), exists: exampleIds.has(id), canonical: canonLinks.has(canon(home)), page: linkedPages.has(home.split("#")[0]), block: blockLinks.has(canon(home)), taught: taughtBy(canonLinks), taughtBlock: taughtBy(canonLinks) || taughtBy(blockLinks) };
      }),
    );
    records.set(itemKey(records, sentence.english), record);

    rows.push({
      ...base,
      ageben: best.answer,
      roots: roots.length,
      found: results.filter((r) => r.result !== "missed" && r.result !== "tagging").length,
      missed: results.filter((r) => r.result === "missed" || r.result === "tagging").map((r) => `${r.root}${r.result === "tagging" ? "*" : ""}`).join(" "),
      not_top1: results.filter((r) => r.result === "top3" || r.result === "lower" || r.result === "grammar").map((r) => `${r.root}:${r.result}`).join(" "),
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

/** Constructions in at least a fifth of a set's sentences: structure every sentence has, counted apart. */
function structuralOf(set: SetName): Set<string> {
  const sentences = rows.filter((r) => r.set === set).length;
  return new Set([...tallies.get(set)!.constructions].filter(([, c]) => c.uses >= sentences * STRUCTURE_SHARE).map(([id]) => id));
}
for (const set of sets) {
  const structural = structuralOf(set);
  for (const record of items.get(set)!.values()) {
    const taught = itemConstructions.get(record)?.filter((c) => !structural.has(c.id));
    if (taught) record.page = [taught.filter((c) => c.page).length, taught.length];
    const frames = itemFrames.get(record)?.filter((c) => !structural.has(c.id));
    if (frames) record.frame = [frames.filter((c) => c.shown).length, frames.length];
    const fm = frameMisses.get(set) ?? { wanted: 0, unwanted: 0, noExample: 0, canonical: 0, page: 0, block: 0, taught: 0, taughtBlock: 0 };
    for (const c of frames ?? []) {
      if (c.shown) continue;
      if (!c.exists) fm.noExample++;
      else if (c.wanted) fm.wanted++;
      else {
        fm.unwanted++;
        if (c.canonical) fm.canonical++;
        if (c.page) fm.page++;
        if (c.taught) fm.taught++;
        if (c.taughtBlock) fm.taughtBlock++;
        if (c.block) fm.block++;
        else {
          const m = frameUnreached.get(set) ?? new Map<string, number>();
          m.set(c.id, (m.get(c.id) ?? 0) + 1);
          frameUnreached.set(set, m);
        }
      }
    }
    frameMisses.set(set, fm);
  }
}

function summarize(set: SetName) {
  const t = tallies.get(set)!;
  const sentences = rows.filter((r) => r.set === set).length;
  const totalRoots = [...t.roots.values()].reduce((a, b) => a + b, 0);
  const structural = structuralOf(set);
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
          rootTop1Open: share(t.open.top1, t.open.uses),
          closedRowFirst: share(t.closed.rowFirst, t.closed.uses),
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
  if (t.staged.sentences) Object.assign(headline, { stagedSelfContained: share(t.staged.selfContained, t.staged.sentences) });
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
    rootRecall: { open: `${pct(t.open.top1, t.open.uses)} of ${t.open.uses}`, closedRowFirst: `${pct(t.closed.rowFirst, t.closed.uses)} of ${t.closed.uses}`, top1: pct(top1, totalRoots), top3: pct(top1 + (t.roots.get("top3") ?? 0), totalRoots), anywhere: pct(totalRoots - (t.roots.get("missed") ?? 0) - (t.roots.get("tagging") ?? 0), totalRoots), uses: totalRoots },
    constructions: {
      frameShown: (() => {
        let n = 0;
        let d = 0;
        for (const r of items.get(set)!.values()) if (r.frame) [n, d] = [n + r.frame[0], d + r.frame[1]];
        return pct(n, d);
      })(),
      frameMisses: frameMisses.get(set),
      frameUnreached: [...(frameUnreached.get(set) ?? [])].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([id, n]) => `${id} ×${n} (${registry.get(id)?.anchor ?? "-"})`),
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
      stagedSelfContained: t.staged.sentences ? `${pct(t.staged.selfContained, t.staged.sentences)} of ${t.staged.sentences}` : "-",
      chars: { median: median(t.promptChars), p90: median(t.promptChars, 0.9) },
      /** Prompt characters spent per self-contained sentence: growth is worth it only when this holds or falls. */
      charsPerSelfContained: t.selfContained ? Math.round(t.promptChars.reduce((a, b) => a + b, 0) / t.selfContained) : 0,
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
type BaselineItems = Partial<Record<SetName, Record<string, ItemRecord>>>;

/**
 * The metrics `--check` guards, with the direction that is better, how far the other way a run
 * may move before it fails (percentage points; characters for the prompt size), the sets it
 * guards, and a sentence's share of it (none for the prompt size, a median). The doc set is
 * in-sample and doc edits move its scores for reasons unrelated to the helper, so it guards only
 * breakage: roots found at all, gaps, and prompt size.
 */
const HELD_OUT: readonly SetName[] = ["checkpoint", "wild"];
const passed = (missing: string | undefined): Pair | undefined => (missing === undefined ? undefined : [missing === "" ? 1 : 0, 1]);
type Metric = {
  key: string;
  label: string;
  better: "higher" | "lower";
  tolerance: number;
  sets: readonly SetName[];
  /** The record field the metric reads: the baseline keeps a field only for the sets its metric guards. */
  field?: Exclude<keyof ItemRecord, "answers">;
  pair?: (r: ItemRecord) => Pair | undefined;
  missing?: (r: ItemRecord) => string | undefined;
};
const HEADLINE = [
  { key: "selfContained", label: "self-contained", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "missing", pair: (r) => passed(r.missing), missing: (r) => r.missing },
  { key: "stagedSelfContained", label: "staged self-contained", better: "higher", tolerance: 0.5, sets: ["checkpoint"], field: "staged", pair: (r) => passed(r.staged), missing: (r) => r.staged },
  { key: "wordInPrompt", label: "word in prompt", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "word", pair: (r) => r.word },
  { key: "rootTop1Open", label: "open-class root top-1", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "open", pair: (r) => r.open },
  { key: "closedRowFirst", label: "closed root row first", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "closed", pair: (r) => r.closed },
  { key: "rootAnywhere", label: "root recall anywhere", better: "higher", tolerance: 0.5, sets: SETS, field: "anywhere", pair: (r) => r.anywhere },
  { key: "constructionPage", label: "construction recall page", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "page", pair: (r) => r.page },
  { key: "gapRate", label: "gap rate", better: "lower", tolerance: 0.5, sets: SETS, field: "gap", pair: (r) => r.gap },
  { key: "verifyPrecision", label: "verify precision", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "verifyClean", pair: (r) => r.verifyClean },
  { key: "verifyRecall", label: "verify recall", better: "higher", tolerance: 0.5, sets: HELD_OUT, field: "verifyCaught", pair: (r) => r.verifyCaught },
  { key: "promptChars", label: "prompt chars median", better: "lower", tolerance: 500, sets: SETS },
] as const satisfies readonly Metric[];

/** A metric over some sentences, from their shares; none when no sentence carries it. */
function shareOver(records: readonly ItemRecord[], pair: (r: ItemRecord) => Pair | undefined): number | undefined {
  let n = 0;
  let d = 0;
  for (const r of records) {
    const p = pair(r);
    if (!p) continue;
    n += p[0];
    d += p[1];
  }
  return d ? share(n, d) : undefined;
}

// The per-sentence shares must add up to the headline, or the check would guard another number.
for (const set of sets) {
  for (const m of HEADLINE as readonly Metric[]) {
    const headline = summary[set]!.headline[m.key as keyof Headline];
    if (!m.pair || headline === undefined) continue;
    const fromItems = shareOver([...items.get(set)!.values()], m.pair);
    if (fromItems !== headline) throw new Error(`${set} ${m.label}: the item records give ${fromItems}, the tally ${headline}`);
  }
}

function readBaseline(): Baseline {
  return existsSync(BASELINE) ? (JSON.parse(readFileSync(BASELINE, "utf8")) as Baseline) : { sets: {} };
}
function readBaselineItems(): BaselineItems {
  return existsSync(BASELINE_ITEMS) ? (JSON.parse(readFileSync(BASELINE_ITEMS, "utf8")) as BaselineItems) : {};
}
/** One line per sentence, sorted, so a rewrite's diff shows only the sentences that changed. */
function serializeBaselineItems(all: BaselineItems): string {
  const blocks = SETS.filter((set) => all[set]).map((set) => {
    const lines = Object.entries(all[set]!)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([english, record]) => `    ${JSON.stringify(english)}: ${JSON.stringify(record)}`);
    return `  ${JSON.stringify(set)}: {\n${lines.join(",\n")}\n  }`;
  });
  return `{\n${blocks.join(",\n")}\n}\n`;
}

/** The worklist class of each word missing from a sentence's prompt. */
const missKind = new Map(misses.map((m) => [`${m.set}\t${m.english}\t${m.word}`, m.kind]));
const FLIPS_SHOWN = 20;

/**
 * The sentences that moved a metric, worst first. For a pass / fail metric (self-contained),
 * each one that stopped passing with the words now missing, and each that started; for the
 * others, when the metric is past tolerance, the sentences whose share fell furthest.
 */
function movers(set: SetName, m: Metric, keys: readonly string[], was: Record<string, ItemRecord>, worse: boolean): string[] {
  const now = items.get(set)!;
  const out: string[] = [];
  const cap = (lines: string[]) => (lines.length > FLIPS_SHOWN ? [...lines.slice(0, FLIPS_SHOWN), `      … and ${lines.length - FLIPS_SHOWN} more`] : lines);
  const edited = (key: string) => (was[key]!.answers !== now.get(key)!.answers ? " (answers edited since the baseline)" : "");
  if (m.missing) {
    const lost = keys.filter((k) => m.missing!(was[k]!) === "" && m.missing!(now.get(k)!) !== "");
    const gained = keys.filter((k) => m.missing!(was[k]!) !== "" && m.missing!(now.get(k)!) === "");
    if (lost.length) out.push(`    stopped passing (${lost.length}):`);
    out.push(
      ...cap(
        lost.map((k) => {
          const english = k.replace(/ #\d+$/, "");
          const words = m.missing!(now.get(k)!)!.split(" ").map((word) => {
            const kind = missKind.get(`${set}\t${english}\t${word}`);
            return `\`${word}\`${kind ? ` (${kind})` : ""}`;
          });
          return `      "${k}": now missing ${words.join(", ")}${edited(k)}`;
        }),
      ),
    );
    if (gained.length) out.push(`    started passing (${gained.length}):`);
    out.push(...cap(gained.map((k) => `      "${k}": had missed ${m.missing!(was[k]!)!.split(" ").map((word) => `\`${word}\``).join(", ")}${edited(k)}`)));
    return out;
  }
  if (!worse || !m.pair) return out;
  const ratio = (p: Pair) => (p[1] ? p[0] / p[1] : 0);
  const fell = keys
    .map((k) => ({ k, a: m.pair!(was[k]!)!, b: m.pair!(now.get(k)!)! }))
    .map((x) => ({ ...x, loss: m.better === "higher" ? ratio(x.a) - ratio(x.b) : ratio(x.b) - ratio(x.a) }))
    .filter((x) => x.loss > 0)
    .sort((x, y) => y.loss - x.loss);
  if (fell.length) out.push(`    worse on ${fell.length} sentence${fell.length === 1 ? "" : "s"}:`);
  out.push(...cap(fell.map((x) => `      "${x.k}": ${x.a[0]} of ${x.a[1]} → ${x.b[0]} of ${x.b[1]}${edited(x.k)}`)));
  return out;
}

/**
 * The check's lines, and how many metrics are past tolerance. A set with per-sentence records in
 * the baseline is compared on the sentences both runs have; one without them (an older baseline),
 * and the prompt size, on all sentences.
 */
function compareBaseline(baseline: Baseline, baselineItems: BaselineItems): { failed: number; moved: number; lines: string[] } {
  const lines: string[] = [];
  let failed = 0;
  let moved = 0;
  for (const set of sets) {
    const before = baseline.sets[set];
    if (!before) {
      failed++;
      lines.push(`  WORSE: ${set}: no baseline (run with --write-baseline)`);
      continue;
    }
    const was = baselineItems[set];
    const now = items.get(set)!;
    if (!was) lines.push(`  ${set}: the baseline has no per-sentence records, so all sentences are compared (--write-baseline adds them)`);
    else {
      const fresh = [...now.keys()].filter((k) => !Object.hasOwn(was, k)).length;
      const gone = Object.keys(was).filter((k) => !now.has(k)).length;
      lines.push(`  ${set}: ${now.size - fresh} sentences in both runs${fresh || gone ? `; ${fresh} new and ${gone} gone, left out` : ""}`);
    }
    for (const m of HEADLINE as readonly Metric[]) {
      if (!m.sets.includes(set)) continue;
      const key = m.key as keyof Headline;
      const allWas = before[key];
      const allNow = summary[set]!.headline[key];
      const pair = was && m.pair;
      // A sentence counts when both runs carry the metric for it.
      const keys = pair ? [...now.keys()].filter((k) => Object.hasOwn(was, k) && pair(was[k]!) && pair(now.get(k)!)) : [];
      const a = pair ? shareOver(keys.map((k) => was[k]!), pair) : allWas;
      const b = pair ? shareOver(keys.map((k) => now.get(k)!), pair) : allNow;
      if (a === undefined || b === undefined) continue;
      const all = pair && (a !== allWas || b !== allNow) ? ` (all sentences: ${allWas ?? "-"} → ${allNow ?? "-"})` : "";
      const loss = m.better === "higher" ? a - b : b - a;
      const worse = loss > m.tolerance;
      if (worse) failed++;
      else if (a !== b) moved++;
      const flips = pair ? movers(set, m, keys, was, worse) : [];
      if (a === b && !flips.length) {
        if (all && allWas !== allNow) lines.push(`  item mix: ${set} ${m.label}: ${a} on the same sentences${all}`);
        continue;
      }
      lines.push(`  ${worse ? "WORSE" : a === b ? "even" : "moved"}: ${set} ${m.label}: ${a} → ${b}${pair ? " on the same sentences" : ""}${all}`, ...flips);
    }
  }
  return { failed, moved, lines };
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
/** A metric that needs reference Ageben: blank for the wild set. */
const refMetric = (name: string, f: (s: Summary) => string | number) => metric(name, (s) => (s.reference ? f(s) : "-"));
metric("sentences", (s) => s.sentences);
refMetric("**self-contained**", (s) => `**${s.prompt.selfContained}**`);
refMetric("word in prompt", (s) => s.prompt.wordInPrompt);
refMetric("pattern in prompt (of the rest)", (s) => s.prompt.patternInPrompt);
refMetric("words missing", (s) => s.prompt.missing);
refMetric("staged self-contained (checkpoint at its own band)", (s) => s.prompt.stagedSelfContained);
refMetric("prompt chars per self-contained sentence", (s) => s.prompt.charsPerSelfContained);
refMetric("**open-class root top-1**", (s) => `**${s.rootRecall.open}**`);
refMetric("**closed root row first**", (s) => `**${s.rootRecall.closedRowFirst}**`);
refMetric("root recall top-1 (all) / top-3 / anywhere", (s) => `${s.rootRecall.top1} / ${s.rootRecall.top3} / ${s.rootRecall.anywhere}`);
refMetric("construction recall anchor / page", (s) => `${s.constructions.anchor} / ${s.constructions.page}`);
refMetric("frame shown (constructions an example uses)", (s) => s.constructions.frameShown);
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
if (reachBaseline.sentences) {
  const b = reachBaseline;
  report.push("", "## Paradigm blocks: dry measure (checkpoint)", "", `Would each item be self-contained if the cheat sheet blocks its linked sections reach were shown? Now: ${pct(b.selfContained, b.sentences)} of ${b.sentences}; ${b.missing} words missing, ${b.closedMissing} of them closed.`, "");
  const perSc = (added: number[], sc: number) => (sc ? Math.round((b.promptChars + added.reduce((x, y) => x + y, 0)) / sc) : 0);
  report.push(`Prompt characters per self-contained sentence now: ${perSc([], b.selfContained)}. Lean renders each row as its forms and English only.`, "");
  report.push("| Reach | Self-contained | Missing words recovered | Closed recovered | Chars added median / p90 | Lean median / p90 | Chars per self-contained, full / lean |", "|---|---|---|---|---|---|---|");
  for (const reach of REACHES) {
    const r = reachTallies.get(reach)!;
    report.push(`| ${reach} | ${pct(r.selfContained, b.sentences)} | ${r.recovered} of ${b.missing} | ${r.closedRecovered} of ${b.closedMissing} | ${median(r.chars)} / ${median(r.chars, 0.9)} | ${median(r.leanChars)} / ${median(r.leanChars, 0.9)} | ${perSc(r.chars, r.selfContained)} / ${perSc(r.leanChars, r.selfContained)} |`);
  }
  report.push("", "| Lean, capped | Self-contained | Chars added median / p90 | Chars per self-contained |", "|---|---|---|---|");
  for (const c of cappedTallies) report.push(`| ${c.reach} ≤ ${c.cap}, ${c.fill} | ${pct(c.selfContained, b.sentences)} | ${median(c.chars)} / ${median(c.chars, 0.9)} | ${perSc(c.chars, c.selfContained)} |`);
  const unreached = reachMisses.filter((m) => m.closed && m.reach === "all");
  const absent = reachMisses.filter((m) => m.closed && m.reach === "");
  const byWord = (list: typeof reachMisses) => [...list.reduce((m, x) => m.set(x.word, (m.get(x.word) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]).map(([w, n]) => (n > 1 ? `\`${w}\` ×${n}` : `\`${w}\``));
  report.push("", `Closed words on some sheet, but on none the analysis links (${unreached.length}): ${byWord(unreached).join(", ")}`);
  report.push("", `Closed words on no sheet (${absent.length}): ${byWord(absent).join(", ")}`);
  writeFileSync(join(TMP, "english-helper-paradigm-reach.csv"), serializeCsv(["english", "word", "closed", "reach", "kind"], reachMisses.map((m) => ({ ...m, closed: m.closed ? "yes" : "" }))));
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
    if (s.prompt.stagedSelfContained !== "-") console.log(`  staged self-contained ${s.prompt.stagedSelfContained}; prompt chars per self-contained sentence ${s.prompt.charsPerSelfContained}`);
    console.log(`roots: ${s.rootRecall.uses} uses — top-1 ${s.rootRecall.top1}, top-3 ${s.rootRecall.top3}, anywhere ${s.rootRecall.anywhere}`);
    console.log(`  open-class top-1 ${s.rootRecall.open}; closed root row first ${s.rootRecall.closedRowFirst}`);
    for (const [k, v] of Object.entries(s.roots).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(8)} ${v}`);
    console.log(`live x compounds: ${s.liveCompounds.suggested} of ${s.liveCompounds.uses} two-root uses built (${s.liveCompounds.offered} offered in all)`);
    console.log(`found by tier: ${Object.entries(s.foundByTier).map(([t, n]) => `${t} ${n}`).join(", ")}`);
    console.log(`constructions: ${s.constructions.uses} uses — home anchor suggested ${s.constructions.anchor}, home page ${s.constructions.page}`);
    console.log(`  frame shown ${s.constructions.frameShown} (non-structural constructions some example in the prompt uses); not shown: ${s.constructions.frameMisses?.wanted} wanted, ${s.constructions.frameMisses?.unwanted} not wanted (home linked once canonical ${s.constructions.frameMisses?.canonical}, home page linked ${s.constructions.frameMisses?.page}, home linked by a shown block row ${s.constructions.frameMisses?.block}; used by an example in a linked section ${s.constructions.frameMisses?.taught}, or in a linked or shown-block section ${s.constructions.frameMisses?.taughtBlock}), ${s.constructions.frameMisses?.noExample} with no example`);
    console.log(`  frames neither wanted nor on a shown block: ${s.constructions.frameUnreached.join(", ")}`);
    console.log(`  (${s.constructions.structural.length} structural constructions in ≥${STRUCTURE_SHARE * 100}% of sentences not counted)`);
    console.log("\nmost-missed roots (* = tagging miss: the word was in the sentence):");
    for (const m of s.missedRoots.slice(0, 15)) console.log(`  ${String(m.count).padStart(4)}  ${m.root}${m.result === "tagging" ? "*" : " "} ${m.sense}`);
    console.log("\nmost-missed constructions (home page never suggested):");
    for (const m of s.missedConstructions.slice(0, 15)) console.log(`  ${String(m.uses - m.page).padStart(4)}/${m.uses}  ${m.id}  ${m.anchor}`);
    console.log("\nmost-missed words (not in the prompt):");
    for (const w of topMisses(set, 15)) console.log(`  ${String(w.sentences).padStart(4)}  ${w.word.padEnd(14)} ${(w.lemma || "-").padEnd(10)} ${w.kind}`);
    console.log();
  }
  if (reachBaseline.sentences) {
    console.log(`paradigm blocks, dry (checkpoint, now ${pct(reachBaseline.selfContained, reachBaseline.sentences)} self-contained; ${reachBaseline.closedMissing} of ${reachBaseline.missing} missing words closed):`);
    for (const reach of REACHES) {
      const r = reachTallies.get(reach)!;
      console.log(`  ${reach.padEnd(6)} self-contained ${pct(r.selfContained, reachBaseline.sentences).padStart(6)}; recovers ${r.recovered} words (${r.closedRecovered} closed); adds ${median(r.chars)} / ${median(r.chars, 0.9)} chars median / p90 (lean ${median(r.leanChars)} / ${median(r.leanChars, 0.9)})`);
    }
    for (const c of cappedTallies) console.log(`  lean ${c.reach} ≤ ${c.cap} ${c.fill}: self-contained ${pct(c.selfContained, reachBaseline.sentences)}; adds ${median(c.chars)} / ${median(c.chars, 0.9)}`);
    console.log();
  }
  console.log("→ tmp/english-helper-recall.csv, tmp/english-helper-worklist.csv, tmp/english-helper-report.md");
}

if (check) {
  const { failed, moved, lines } = compareBaseline(readBaseline(), readBaselineItems());
  for (const line of lines) console.error(line);
  if (failed) {
    console.error(`baseline check failed: ${failed} metric${failed === 1 ? "" : "s"} past tolerance (src/generated/english-helper-baseline.json)`);
    process.exitCode = 1;
  } else console.error(`baseline check passed${moved ? "; --write-baseline to keep the new numbers" : ""}`);
}
if (writeBaseline) {
  const baseline = readBaseline();
  const baselineItems = readBaselineItems();
  for (const set of sets) {
    baseline.sets[set] = { sentences: summary[set]!.sentences, ...summary[set]!.headline };
    const kept = new Set<string>(["answers", ...(HEADLINE as readonly Metric[]).flatMap((m) => (m.field && m.sets.includes(set) ? [m.field] : []))]);
    baselineItems[set] = Object.fromEntries([...items.get(set)!].map(([key, record]) => [key, Object.fromEntries(Object.entries(record).filter(([field]) => kept.has(field))) as ItemRecord]));
  }
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
  writeFileSync(BASELINE_ITEMS, serializeBaselineItems(baselineItems));
  console.error(`→ src/generated/english-helper-baseline.json, english-helper-baseline-items.json (${sets.join(", ")})`);
}
