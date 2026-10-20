/**
 * English that copies an Egabon spelling follows the retie of that spelling:
 * a named **-n** word's English name (`zululon` → *Ululon*) and a quoted payload
 * (`d["odoga"]` → *“odoga”*, `d-CITE["odoga"]`). Only prose is touched;
 * code was already retied.
 */
import { ENGLISH_IN_CODE } from "../lint/egabon-docs.js";
import type { ClassifyTables } from "../parse/classify.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWord } from "../parse/word.js";

import { asRetieTables, type RetieTables } from "./tables.js";
import type { RetieChange } from "./tokens.js";

export type FollowPairs = {
  /** Capitalised English name → new name (`Ululon` → `Alahen`). */
  names: Map<string, string>;
  /** Lowercase Egabon word → new spelling, for quoted payloads. */
  words: Map<string, string>;
  /**
   * House-cast names (`Uzazon` → `Uzozen`), from the closed roots rather than a page's code. They also follow
   * inside code (a morph example in backticks, `` `*Uzazon*` ``): native code is lowercase, so a capitalised
   * house name there is English.
   */
  house?: Map<string, string>;
};

const NAME_RE = /(?<![A-Za-z])[A-Z][a-z]+(?![A-Za-z])/g;

function gloss(text: string, tables: ClassifyTables): string | null {
  try {
    return morphGlossLine(text, tables);
  } catch {
    return null;
  }
}

/** Pairs implied by a page's code changes (old spellings gloss against `old`, new against `current`). */
export function followPairs(changes: readonly RetieChange[], tables: ClassifyTables | RetieTables): FollowPairs {
  const { old, current } = asRetieTables(tables);
  const names = new Map<string, string>();
  const words = new Map<string, string>();
  const conflicts = new Set<string>();
  const add = (into: Map<string, string>, from: string, to: string) => {
    if (from === to || conflicts.has(from)) return;
    const had = into.get(from);
    if (had !== undefined && had !== to) {
      into.delete(from);
      conflicts.add(from);
      return;
    }
    into.set(from, to);
  };
  for (const change of changes) {
    const a = change.from.match(/[a-z]+/g) ?? [];
    const b = change.to.match(/[a-z]+/g) ?? [];
    if (a.length === b.length) {
      a.forEach((word, i) => {
        if (word.length > 2 && !ENGLISH_IN_CODE.has(word)) add(words, word, b[i]!);
      });
    }
    // Named words gloss as their own capitalised spelling; pair the names in the two glosses.
    if (!/n\b|n[x\]})>]/.test(change.from)) continue;
    let before: string[] = gloss(change.from, old)?.match(NAME_RE) ?? [];
    let after: string[] = gloss(change.to, current)?.match(NAME_RE) ?? [];
    if (before.length === 0 || before.length !== after.length) {
      // No lexicon for one side: a one-root named word's name is its capitalised spelling.
      before = plainName(change.from);
      after = plainName(change.to);
    }
    if (before.length !== after.length) continue;
    before.forEach((name, i) => add(names, name, after[i]!));
  }
  return { names, words };
}

function plainName(word: string): string[] {
  try {
    const parsed = parseWord(word);
    if (parsed.ending !== "n" || parsed.plural) return [];
    if (parsed.family.kind === "content" && parsed.family.roots.length === 1) {
      const stem = `${parsed.family.roots[0]!}n`;
      return [stem.charAt(0).toUpperCase() + stem.slice(1)];
    }
    // An x-compound name is one name in English, spelled as the word without its role letter (`zohuxaluden` → *Ohuxaluden*).
    if (parsed.family.kind === "x" && parsed.family.xFamily === "compound") {
      const stem = word.slice(parsed.pos?.length ?? 0);
      return /^[a-z]+$/.test(stem) ? [stem.charAt(0).toUpperCase() + stem.slice(1)] : [];
    }
    return [];
  } catch {
    return [];
  }
}

export function mergeFollowPairs(...all: FollowPairs[]): FollowPairs {
  const out: FollowPairs = { names: new Map(), words: new Map() };
  for (const pairs of all) {
    for (const [k, v] of pairs.names) if (!out.names.has(k)) out.names.set(k, v);
    for (const [k, v] of pairs.words) if (!out.words.has(k)) out.words.set(k, v);
    for (const [k, v] of pairs.house ?? []) {
      out.house ??= new Map();
      if (!out.house.has(k)) out.house.set(k, v);
    }
  }
  return out;
}

/** A capitalised or shouted word, with an English plural ending (`Uzozens`, `UZOZEN`). */
const NAME_WORD_RE = /(?<![A-Za-z])[A-Z][A-Za-z]*(?![A-Za-z])/g;

/** The new spelling of a name as written: `Name`, `NAME`, or either with an English `s` / `es` plural. */
function nextName(word: string, names: ReadonlyMap<string, string>): string | undefined {
  for (const suffix of ["", "s", "es"]) {
    const upper = suffix.toUpperCase();
    if (word.endsWith(suffix) && word.length > suffix.length) {
      const next = names.get(word.slice(0, word.length - suffix.length));
      if (next !== undefined) return next + suffix;
    }
    if (word.length > 3 && word === word.toUpperCase() && word.endsWith(upper)) {
      const stem = word.slice(0, word.length - upper.length);
      const next = names.get(stem.charAt(0) + stem.slice(1).toLowerCase());
      if (next !== undefined) return next.toUpperCase() + upper;
    }
  }
  return undefined;
}

function replaceNames(text: string, names: ReadonlyMap<string, string>, base: number, changes: RetieChange[]): string {
  if (names.size === 0) return text;
  return text.replace(NAME_WORD_RE, (word, offset: number) => {
    const next = nextName(word, names);
    if (next === undefined) return word;
    changes.push({ from: word, to: next, index: base + offset });
    return next;
  });
}

/** House names inside code; an opaque payload (`<…>`, `&lt;…&gt;`) is foreign text and stays. */
function houseInCode(span: string, base: number, pairs: FollowPairs, changes: RetieChange[]): string {
  if (!pairs.house || pairs.house.size === 0 || /^\]\(|^\{#/.test(span)) return span;
  let out = "";
  let at = 0;
  for (const match of span.matchAll(/<[^<>\n]*>|&lt;[\s\S]*?&gt;/g)) {
    out += replaceNames(span.slice(at, match.index!), pairs.house, base + at, changes) + match[0];
    at = match.index! + match[0].length;
  }
  return out + replaceNames(span.slice(at), pairs.house, base + at, changes);
}

function replaceWords(text: string, re: RegExp, pairs: ReadonlyMap<string, string>, base: number, changes: RetieChange[]): string {
  return text.replace(re, (word, offset: number) => {
    const next = pairs.get(word);
    if (next === undefined) return word;
    changes.push({ from: word, to: next, index: base + offset });
    return next;
  });
}

/** Quoted payloads: curly “…” in English, `["…"]` in morph lines. */
const QUOTED_RE = /“([^”\n]*)”|\["([^"\n]*)"\]/g;

function followText(text: string, base: number, pairs: FollowPairs, changes: RetieChange[]): string {
  // A name shouted in English (`AZAWAN`) or made plural (*some Azawans*) follows like the name.
  let out = replaceNames(text, pairs.names, base, changes);
  out = out.replace(QUOTED_RE, (whole, curly: string | undefined, bracket: string | undefined, offset: number, all: string) => {
    // An opaque payload is foreign text and is never retied (`z-OPAQUE["…"]`).
    if (bracket !== undefined && /OPAQUE$/.test(all.slice(0, offset))) {
      return whole;
    }
    const inner = curly ?? bracket!;
    const innerAt = whole.indexOf(inner);
    const next = replaceWords(inner, /(?<![A-Za-z])[a-z]+(?![A-Za-z])/g, pairs.words, base + offset + innerAt, changes);
    return whole.slice(0, innerAt) + next + whole.slice(innerAt + inner.length);
  });
  return out;
}

/** Code, link targets and non-gloss HTML comments: text the follow pass must not touch. */
const PROTECTED_RE =
  /^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$|`[^`\n]*`|<code>[\s\S]*?<\/code>|\]\([^)\n]*\)|<!--(?!\s*gloss:)[\s\S]*?-->|\{#[^}\n]*\}/gm;

/** A ` ```markdown ` fence is an example page (glosses.md): its prose follows like the page's own. */
function markdownFence(block: string, base: number, pairs: FollowPairs, changes: RetieChange[]): string | undefined {
  const fence = /^(```|~~~)(markdown|md)[ \t]*\n([\s\S]*\n)(\1[^\n]*)$/.exec(block);
  if (!fence) return undefined;
  const bodyAt = fence[1]!.length + fence[2]!.length + block.slice(fence[1]!.length + fence[2]!.length).indexOf("\n") + 1;
  const inner = followProse(fence[3]!, pairs);
  for (const change of inner.changes) changes.push({ ...change, index: change.index + base + bodyAt });
  return block.slice(0, bodyAt) + inner.text + fence[4]!;
}

/** Inline code that shows a free-English line as written (`` `"Azawan walks."` ``, glosses.md): its names follow. */
function englishCode(span: string, base: number, pairs: FollowPairs, changes: RetieChange[]): string | undefined {
  if (!/^`"[^"`\n]*"`$/.test(span)) return undefined;
  return `\`${followText(span.slice(1, -1), base + 1, pairs, changes)}\``;
}

/**
 * Rewrite names and quoted payloads in prose, morph lines and `<!-- gloss: … -->` comments.
 * In code, only house names follow; link targets and pinned heading ids are left as they are.
 */
export function followProse(markdown: string, pairs: FollowPairs): { text: string; changes: RetieChange[] } {
  const changes: RetieChange[] = [];
  if (pairs.names.size === 0 && pairs.words.size === 0 && !pairs.house?.size) return { text: markdown, changes };
  let text = "";
  let at = 0;
  for (const match of markdown.matchAll(PROTECTED_RE)) {
    text += followText(markdown.slice(at, match.index!), at, pairs, changes);
    text +=
      markdownFence(match[0], match.index!, pairs, changes) ??
      englishCode(match[0], match.index!, pairs, changes) ??
      houseInCode(match[0], match.index!, pairs, changes);
    at = match.index! + match[0].length;
  }
  text += followText(markdown.slice(at), at, pairs, changes);
  return { text, changes };
}
