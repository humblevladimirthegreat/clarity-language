// Reading back what the writer wrote: the drop-ins already in the text (for hover glosses and
// the practice check) and words that look like a drop-in but are not one (near misses). Matching
// is against the forms the editor's flows produce, never against the parser. Pure and browser-safe.
import type { Span } from "./match.js";

export type FoundDropIn = Span & {
  /** The form as the glossary keys it: `thovum`, `-xo` (from `sing-xo`), or a run of tone marks (`?!`). */
  form: string;
  /** Tone mark runs: each mark, once (`!!` → `!`). */
  marks?: string[];
};

export type NearMiss = Span & {
  text: string;
  /** Replacements for the whole word, closest first. */
  suggestions: string[];
  /** `ending`: a suffix with an ending (`sing-xol`); `no-t`: a `t` that should be `th`; `spelling`: one or two letters off. */
  reason: "ending" | "no-t" | "spelling";
};

/** A tone mark run before a word, after a space or opening punctuation (`?!She's`, `&Tuesday`). */
const MARKS_RE = /(?<=^|[\s"“‘(\[])[%;&?!]+(?=[\p{L}\p{N}])/gu;
/** A word, with apostrophes and hyphens inside it (`sing-xo`, `I'm`). */
const CHUNK_RE = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

function isMarkForm(form: string): boolean {
  return !/[\p{L}\p{N}]/u.test(form);
}

/** Drop-ins in `text`, in text order. `known` holds every form (`thovum`, `-xo`, `%`, `thanathum blehon`). */
export function findDropIns(text: string, known: ReadonlySet<string>): FoundDropIn[] {
  const out: FoundDropIn[] = [];
  for (const m of text.matchAll(MARKS_RE)) {
    const marks = [...new Set(m[0])];
    if (marks.every((mark) => known.has(mark))) out.push({ from: m.index!, to: m.index! + m[0].length, form: m[0], marks });
  }
  const chunks = [...text.matchAll(CHUNK_RE)];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const from = chunk.index!;
    const word = chunk[0].toLowerCase();
    const hyphen = word.lastIndexOf("-");
    if (hyphen > 0 && known.has(word.slice(hyphen))) {
      out.push({ from, to: from + word.length, form: word.slice(hyphen) });
      continue;
    }
    const next = chunks[i + 1];
    const pair = next && /^\s+$/.test(text.slice(from + word.length, next.index!)) ? `${word} ${next[0].toLowerCase()}` : undefined;
    if (pair && known.has(pair)) {
      out.push({ from, to: next!.index! + next![0].length, form: pair });
      i++;
    } else if (known.has(word)) {
      out.push({ from, to: from + word.length, form: word });
    }
  }
  return out.sort((a, b) => a.from - b.from);
}

/** Levenshtein distance, stopping early once it passes `max`. */
export function distance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, row[j]!);
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length]!;
}

/** How far a word may be from a form and still be a near miss: one letter, two for long forms. */
function allowed(form: string): number {
  return form.length >= 8 ? 2 : 1;
}

function sharedStart(a: string, b: string): number {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
}

/** Forms in a trie: the feelings forms share long starts, so a search drops whole branches at once. */
type Trie = { children: Map<string, Trie>; form?: string };

/** One trie per letter that must match: the first, or the one after the hyphen for a suffix. */
type FormIndex = Map<string, Trie>;

function indexByLead(forms: readonly string[]): FormIndex {
  const out: FormIndex = new Map();
  for (const f of forms) {
    const lead = f[0] === "-" ? f[1]! : f[0]!;
    let node: Trie = out.get(lead) ?? { children: new Map() };
    out.set(lead, node);
    for (const ch of f) {
      const next: Trie = node.children.get(ch) ?? { children: new Map() };
      node.children.set(ch, next);
      node = next;
    }
    node.form = f;
  }
  return out;
}

/** The most a long form allows (`allowed`). */
const MAX_ALLOWED = 2;

/** Forms in `trie` within `max` edits of `word`, with their distance: Levenshtein rows down the trie. */
function within(word: string, trie: Trie, max: number): { f: string; d: number }[] {
  const out: { f: string; d: number }[] = [];
  const walk = (node: Trie, prev: number[]) => {
    if (node.form !== undefined && prev[word.length]! <= max) out.push({ f: node.form, d: prev[word.length]! });
    for (const [ch, child] of node.children) {
      const row = [prev[0]! + 1];
      let best = row[0]!;
      for (let j = 1; j <= word.length; j++) {
        row[j] = Math.min(prev[j]! + 1, row[j - 1]! + 1, prev[j - 1]! + (word[j - 1] === ch ? 0 : 1));
        best = Math.min(best, row[j]!);
      }
      if (best <= max) walk(child, row);
    }
  };
  walk(trie, Array.from({ length: word.length + 1 }, (_, j) => j));
  return out;
}

/** Forms `word` is a near miss of, closest first (then the longest shared start: `thovom` → `thovum`); each shares its first letter (after the hyphen, for a suffix). */
function closest(word: string, forms: FormIndex): string[] {
  const trie = forms.get(word[0] === "-" ? word[1]! : word[0]!);
  if (!trie) return [];
  return within(word, trie, MAX_ALLOWED)
    .filter(({ f, d }) => d > 0 && d <= allowed(f))
    .map(({ f, d }) => ({ f, d, p: sharedStart(word, f) }))
    .sort((a, b) => a.d - b.d || b.p - a.p || a.f.localeCompare(b.f))
    .map(({ f }) => f);
}

/**
 * Words that look like a drop-in but are not one: `thovom` (did you mean `thovum`?), `tovum`
 * (no `t`: `thovum`), `sing-xol` (suffixes take no ending: `sing-xo`). Drop-ins are lowercase, so
 * a capitalized word (a name, a sentence start) is never a near miss, and neither is a word in
 * `english`: the English words the build found within reach of a form (*thunder*, `thuner`), alone
 * or after a hyphen (*twenty-two*, `-tho`).
 */
export function findNearMisses(
  text: string,
  known: ReadonlySet<string>,
  options: { found?: readonly FoundDropIn[]; english?: ReadonlySet<string> } = {},
): NearMiss[] {
  const found = options.found ?? findDropIns(text, known);
  const words = [...known].filter((f) => /^\p{Ll}+$/u.test(f));
  const suffixes = [...known].filter((f) => /^-\p{Ll}+$/u.test(f));
  const wordsByLead = indexByLead(words);
  const suffixesByLead = indexByLead(suffixes);
  const out: NearMiss[] = [];
  for (const chunk of text.matchAll(CHUNK_RE)) {
    const from = chunk.index!;
    const raw = chunk[0];
    const to = from + raw.length;
    if (found.some((d) => d.from < to && from < d.to)) continue;
    const word = raw.toLowerCase();
    const hyphen = word.lastIndexOf("-");
    if (hyphen > 0) {
      const host = raw.slice(0, hyphen);
      const suffix = word.slice(hyphen);
      if (options.english?.has(suffix.slice(1))) continue;
      if (/[lmr]$/.test(suffix) && suffixes.includes(suffix.slice(0, -1))) {
        out.push({ from, to, text: raw, suggestions: [host + suffix.slice(0, -1)], reason: "ending" });
      } else if (/t(?!h)/.test(suffix) && suffixes.includes(suffix.replace(/t(?!h)/g, "th"))) {
        out.push({ from, to, text: raw, suggestions: [host + suffix.replace(/t(?!h)/g, "th")], reason: "no-t" });
      } else {
        const near = closest(suffix, suffixesByLead);
        if (near.length) out.push({ from, to, text: raw, suggestions: near.map((s) => host + s), reason: "spelling" });
      }
      continue;
    }
    if (word.length < 4 || !/^\p{Ll}+$/u.test(raw) || options.english?.has(word)) continue;
    const withTh = word.replace(/t(?!h)/g, "th");
    if (withTh !== word && known.has(withTh)) {
      out.push({ from, to, text: raw, suggestions: [withTh], reason: "no-t" });
      continue;
    }
    const near = closest(word, wordsByLead);
    if (near.length) out.push({ from, to, text: raw, suggestions: near.slice(0, 3), reason: "spelling" });
  }
  return out;
}

/** Tone marks in a run, sorted, so `!?` and `?!` compare equal (stacks go in any order). */
function canonical(form: string): string {
  return isMarkForm(form) ? [...form].sort().join("") : form;
}

/** Whether two lists of drop-ins say the same, in any order. */
export function sameDropIns(a: readonly string[], b: readonly string[]): boolean {
  const key = (list: readonly string[]) => list.map(canonical).sort().join("\u0000");
  return key(a) === key(b);
}
