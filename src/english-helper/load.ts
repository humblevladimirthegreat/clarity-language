/**
 * Builds the English helper's data in Node: the grammar-page English entries (the shared cache in
 * src/find/entries-cache.ts), the cue index, section bands, and the committed WordNet reverse
 * index, assembled with the lexicon CSVs by browser.ts `createHelperData`.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { loadGrammarEntries } from "../find/entries-cache.js";
import { pageSections } from "../lint/learning-order.js";
import { listMarkdown } from "../markdown-files.js";
import { loadDefaultTables } from "../parse/index.js";
import { dataPath, REPO_ROOT } from "../repo-paths.js";
import type { HelperData, SectionInfo } from "./analyze.js";
import { createHelperData, type HelperPayload } from "./browser.js";
import { buildCueIndex, grammarPath, teachingEntry } from "./cues.js";
import { parseParadigmBlocks, type ParadigmBlock } from "./paradigms.js";
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

/** `page.md#id` → `page.md#slug` of the section the id lands in, for every heading and `<a id>` on the grammar pages. */
export function loadCanonicalAnchors(): Map<string, string> {
  const out = new Map<string, string>();
  for (const file of grammarFiles()) {
    const page = grammarPath(relative(REPO_ROOT, file));
    const { anchors } = pageSections(page, readFileSync(file, "utf8"));
    for (const [id, section] of anchors) out.set(`${page}#${id}`, section.slug ? `${page}#${section.slug}` : page);
  }
  return out;
}

/** Every cheat sheet table as a paradigm block, its row links resolved to their sections (paradigms.ts). */
export function loadParadigmBlocks(): ParadigmBlock[] {
  const canonical = loadCanonicalAnchors();
  return grammarFiles()
    .map((file) => grammarPath(relative(REPO_ROOT, file)))
    .filter((page) => page.startsWith("cheat-sheets/"))
    .sort()
    .flatMap((page) => parseParadigmBlocks(page, readFileSync(join(GRAMMAR_DIR, page), "utf8"), (link) => canonical.get(link) ?? link));
}

/** The committed WordNet reverse index (scripts/english-helper-wordnet.ts), when it exists. */
export function loadWordnetIndex(): WordnetIndex | undefined {
  return existsSync(WORDNET_INDEX_PATH) ? (JSON.parse(readFileSync(WORDNET_INDEX_PATH, "utf8")) as WordnetIndex) : undefined;
}

/** The grammar-page data the analyzer needs, JSON-safe (the Inspect page reads it at site build). */
export function helperPayload(): HelperPayload {
  const entries = loadGrammarEntries();
  const wordnet = loadWordnetIndex();
  const sections = loadSections();
  return {
    // The cue index has already read `cues`; the entries answer one-word lookups, and `teach` leads a recipe row to its examples.
    entries: entries.filter(teachingEntry).map(({ cues: _cues, ...entry }) => entry),
    cues: [...buildCueIndex(entries, cueWords, sections)],
    sections: [...sections],
    ...(wordnet ? { wordnet } : {}),
  };
}

export function loadHelperData(): HelperData {
  const csv = (name: string) => readFileSync(dataPath(name), "utf8");
  return createHelperData(
    helperPayload(),
    { published: csv("lexicon-published.csv"), overlays: csv("lexicon-overlays.csv"), compounds: csv("lexicon-compounds.csv") },
    loadDefaultTables(),
  );
}
