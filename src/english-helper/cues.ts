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
  /** The cue's place among its row's cues: 0 when the row is mainly for this word. */
  rank: number;
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
export function resolveLink(page: string, link: string): string {
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

/** A form that is only a vowel series (`a`, `ua`): a recap row, not a word to say. */
const BARE_VOWELS = /^[aeiou]{1,3}$/;

/**
 * The section on `page` named for the cue (`### Including (`am` / `al`)` for *including*), and
 * the forms its heading names. A recap table under one section (*including* … *except* under
 * `### Except`) then links each cue where it is taught. An `<a id>` beats the heading's own id.
 */
function namedSection(sections: ReadonlyMap<string, { title: string }>, page: string, cue: string): { link: string; forms: string[] } | undefined {
  let best: { link: string; title: string } | undefined;
  for (const [link, { title }] of sections) {
    if (!link.startsWith(`${page}#`) || title.replace(/\s*\(.*\)\s*$/, "").replace(/[`*]/g, "").toLowerCase() !== cue.toLowerCase()) continue;
    if (!best || link.length < best.link.length) best = { link, title };
  }
  const forms = best?.title.match(/\(([^)]*)\)\s*$/)?.[1]!.replace(/[`*]/g, "").split("/").map((f) => f.trim()) ?? [];
  return best && { link: best.link, forms: forms.filter((f) => /^[a-z]+$/.test(f)) };
}

/**
 * The cue index. `words` splits a cue the way the tagger splits input
 * (tag.ts `cueWords`), so `can't` in a table matches *can not* in a sentence. With `sections`
 * (`page.md#id` → title), a row is relinked to a same-page section named for its cue. A row whose
 * first cue is the word (*you*) comes before one that lists it later (*one*, generic *you*).
 */
export function buildCueIndex(entries: readonly EnglishEntry[], words: (cue: string) => string[], sections?: ReadonlyMap<string, { title: string }>): CueIndex {
  const index: CueIndex = new Map();
  for (const entry of entries) {
    if (entry.kind !== "table" || !entry.cues?.length || !teachingEntry(entry)) continue;
    const page = grammarPath(entry.page);
    const rowLink = entry.teach ? resolveLink(entry.page, entry.teach) : `${page}#${entry.slug}`;
    for (const [rank, cue] of entry.cues.entries()) {
      if (!usableCue(cue)) continue;
      const key = words(cue).join(" ");
      if (!key || key.split(" ").length > MAX_CUE_WORDS) continue;
      const named = !entry.teach && sections ? namedSection(sections, page, cue) : undefined;
      const link = named?.link ?? rowLink;
      const form = named?.forms.length && BARE_VOWELS.test(entry.form) ? named.forms.join(" / ") : entry.form;
      const list = index.get(key) ?? [];
      // The same row, or the same form again from one page (a beginner row and its intermediate grid) or for one section.
      if (list.some((j) => j.source === `${page}:${entry.line}` || (j.form === form && (j.source.startsWith(`${page}:`) || j.link === link)))) continue;
      list.push({ cue, itch: plainText(entry.english), form, link, source: `${page}:${entry.line}`, rank, ...(entry.band ? { band: entry.band } : {}) });
      index.set(key, list);
    }
  }
  for (const list of index.values()) list.sort((a, b) => a.rank - b.rank);
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
