/**
 * Builds the English helper's data in Node: the lexicon index from the CSVs, the grammar-page
 * English entries (the shared cache in src/find/entries-cache.ts), the cue index, section bands,
 * and the committed WordNet reverse index.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { loadGrammarEntries } from "../find/entries-cache.js";
import { parseCompoundCsv, parseOverlayCsv, parsePublishedCsv } from "../lexicon-search.js";
import { pageSections } from "../lint/learning-order.js";
import { listMarkdown } from "../markdown-files.js";
import { loadDefaultTables } from "../parse/index.js";
import { classifyAll } from "../parse/classify.js";
import { parseWords } from "../parse/word.js";
import { dataPath, REPO_ROOT } from "../repo-paths.js";
import type { HelperData, SectionInfo } from "./analyze.js";
import { buildCueIndex, grammarPath, teachingEntry } from "./cues.js";
import { buildLexiconIndex } from "./lexicon.js";
import { cueWords } from "./tag.js";
import type { WordnetIndex } from "./wordnet-index.js";

const GRAMMAR_DIR = join(REPO_ROOT, "docs", "grammar");
export const WORDNET_INDEX_PATH = join(REPO_ROOT, "src", "generated", "english-wordnet.json");

function grammarFiles(): string[] {
  return listMarkdown(GRAMMAR_DIR);
}

/** `page.md#id` → title and band, for every heading and `<a id>` on the grammar pages. */
export function loadSections(): Map<string, SectionInfo> {
  const out = new Map<string, SectionInfo>();
  for (const file of grammarFiles()) {
    const page = grammarPath(relative(REPO_ROOT, file));
    const { anchors } = pageSections(page, readFileSync(file, "utf8"));
    for (const [id, section] of anchors) out.set(`${page}#${id}`, { title: section.title, ...(section.band ? { band: section.band } : {}) });
  }
  return out;
}

/** The committed WordNet reverse index (scripts/english-helper-wordnet.ts), when it exists. */
export function loadWordnetIndex(): WordnetIndex | undefined {
  return existsSync(WORDNET_INDEX_PATH) ? (JSON.parse(readFileSync(WORDNET_INDEX_PATH, "utf8")) as WordnetIndex) : undefined;
}

export function loadHelperData(): HelperData {
  const published = parsePublishedCsv(readFileSync(dataPath("lexicon-published.csv"), "utf8"));
  const compounds = parseCompoundCsv(readFileSync(dataPath("lexicon-compounds.csv"), "utf8"));
  const overlays = parseOverlayCsv(readFileSync(dataPath("lexicon-overlays.csv"), "utf8"));
  const entries = loadGrammarEntries();
  const tables = loadDefaultTables();
  const wordnet = loadWordnetIndex();
  return {
    lexicon: buildLexiconIndex(published, compounds, overlays),
    cues: buildCueIndex(entries, cueWords),
    entries: entries.filter(teachingEntry),
    sections: loadSections(),
    ...(wordnet ? { wordnet } : {}),
    compoundParts: new Map(compounds.map((r) => [`${r.left}+${r.right}`, r])),
    // Word shape and lexicon only: the sentence parser takes seconds to build, and one word needs no clause.
    wordParses: (word) => {
      try {
        return classifyAll(parseWords(word), tables).every((w) => w.reading !== "unknown");
      } catch {
        return false;
      }
    },
  };
}
