/**
 * English cue → grammar jobs, built from the tables the docs already have (src/find/english.ts
 * harvests them). A row's cues are the italic words of its English cell, or of the `###` heading
 * under `#many-jobs`; its link is the `Teach` cell when there is one, else the row's own section.
 * Rows sharing a cue are kept in page order, so a multi-job word lists its jobs as the table does.
 */
import type { EnglishEntry } from "../find/english.js";
import { plainText } from "../find/english.js";
import type { Band } from "../lint/learning-order.js";

export type GrammarJob = {
  /** The cue as the table writes it (`could`, `so that`). */
  cue: string;
  /** The row's English cell: what the job is for. */
  itch: string;
  /** The row's Agazan cell, forms joined with ` / `. */
  form: string;
  /** The section that teaches the job, `page.md#id` relative to docs/grammar. */
  link: string;
  /** Where the row is, `page.md:line`. */
  source: string;
  band?: Band;
};

export type CueIndex = Map<string, GrammarJob[]>;

/** Longest cue matched, in words; longer table cues are examples, not cues. */
export const MAX_CUE_WORDS = 5;

/** Pages that only repeat an owning page (cheat sheets, level reviews), or are not grammar. */
const SKIP_PAGES = /(^|\/)((cheat-sheets|claritish)\/|review\.md$)/;

/**
 * An entry from a teaching section: not on a repeating page, and not a checkpoint's word bank
 * or drill (a `### Practice` section), whose rows repeat the lexicon.
 */
export function teachingEntry(entry: EnglishEntry): boolean {
  return !SKIP_PAGES.test(entry.page) && !/practice$/.test(entry.slug);
}

/** `docs/grammar/english.md` → `english.md`; `cheat-sheets/x.md` stays nested. */
export function grammarPath(page: string): string {
  return page.replace(/^.*?docs\/grammar\//, "");
}

/** A `Teach` link relative to its page, as a docs/grammar path (`hooks.md#extra-noun`). */
function resolveLink(page: string, link: string): string {
  if (link.startsWith("#")) return `${grammarPath(page)}${link}`;
  const dir = grammarPath(page).split("/").slice(0, -1);
  const parts = [...dir];
  for (const piece of link.split("/")) {
    if (piece === "..") parts.pop();
    else if (piece !== ".") parts.push(piece);
  }
  return parts.join("/");
}

/**
 * A cue the helper can match: no placeholder (`…`, `X`; *I* is a word), and not a noun phrase
 * led by an article (*a dog walker* is an example of a job, which the words themselves reach).
 */
function usableCue(cue: string): boolean {
  return !/…|\.\.\.|\b(?!I\b)[A-Z]\b/.test(cue) && !/^(a|an|the) \S/i.test(cue);
}

/**
 * The cue index. `words` splits a cue the way the tagger splits input
 * (tag.ts `cueWords`), so `can't` in a table matches *can not* in a sentence.
 */
export function buildCueIndex(entries: readonly EnglishEntry[], words: (cue: string) => string[]): CueIndex {
  const index: CueIndex = new Map();
  for (const entry of entries) {
    if (entry.kind !== "table" || !entry.cues?.length || !teachingEntry(entry)) continue;
    const link = entry.teach ? resolveLink(entry.page, entry.teach) : `${grammarPath(entry.page)}#${entry.slug}`;
    for (const cue of entry.cues) {
      if (!usableCue(cue)) continue;
      const key = words(cue).join(" ");
      if (!key || key.split(" ").length > MAX_CUE_WORDS) continue;
      const list = index.get(key) ?? [];
      if (list.some((j) => j.source === `${grammarPath(entry.page)}:${entry.line}`)) continue;
      list.push({ cue, itch: plainText(entry.english), form: entry.form, link, source: `${grammarPath(entry.page)}:${entry.line}`, ...(entry.band ? { band: entry.band } : {}) });
      index.set(key, list);
    }
  }
  return index;
}

export type CueMatch = { start: number; end: number; key: string; jobs: GrammarJob[] };

/**
 * Cue runs in a clause, longest first, without overlap. `normals` are the words as written;
 * `lemmas` let a one-word cue match an inflected form (*dogs* → *dog*).
 */
export function matchCues(index: CueIndex, normals: readonly string[], lemmas: readonly string[]): CueMatch[] {
  const taken = new Array<boolean>(normals.length).fill(false);
  const out: CueMatch[] = [];
  for (let len = Math.min(MAX_CUE_WORDS, normals.length); len >= 1; len--) {
    for (let i = 0; i + len <= normals.length; i++) {
      if (taken.slice(i, i + len).some(Boolean)) continue;
      const keys = [normals.slice(i, i + len).join(" "), ...(len === 1 ? [lemmas[i]!] : [])];
      const key = keys.find((k) => index.has(k));
      if (!key) continue;
      out.push({ start: i, end: i + len, key, jobs: index.get(key)! });
      for (let j = i; j < i + len; j++) taken[j] = true;
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
