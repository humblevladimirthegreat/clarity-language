/**
 * English that copies an Agalan spelling follows the retie of that spelling:
 * a named **-n** word's English name (`zululon` → *Ululon*) and a quoted payload
 * (`z{odoga}` → *the word “odoga”*, `z-MENTION["odoga"]`). Only prose is touched;
 * code was already retied.
 */
import { ENGLISH_IN_CODE } from "../lint/agalan-docs.js";
import type { ClassifyTables } from "../parse/classify.js";
import { morphGlossLine } from "../parse/morph-gloss.js";
import { parseWord } from "../parse/word.js";

import type { RetieChange } from "./tokens.js";

export type FollowPairs = {
  /** Capitalised English name → new name (`Ululon` → `Alahen`). */
  names: Map<string, string>;
  /** Lowercase Agalan word → new spelling, for quoted payloads. */
  words: Map<string, string>;
};

const NAME_RE = /(?<![A-Za-z])[A-Z][a-z]+(?![A-Za-z])/g;

function gloss(text: string, tables: ClassifyTables): string | null {
  try {
    return morphGlossLine(text, tables);
  } catch {
    return null;
  }
}

/** Pairs implied by a page's code changes. `tables` must know the old and new spellings. */
export function followPairs(changes: readonly RetieChange[], tables: ClassifyTables): FollowPairs {
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
    let before: string[] = gloss(change.from, tables)?.match(NAME_RE) ?? [];
    let after: string[] = gloss(change.to, tables)?.match(NAME_RE) ?? [];
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
    if (parsed.ending !== "n" || parsed.family.kind !== "content" || parsed.family.roots.length !== 1) return [];
    const stem = `${parsed.family.roots[0]!}n`;
    return [stem.charAt(0).toUpperCase() + stem.slice(1)];
  } catch {
    return [];
  }
}

export function mergeFollowPairs(...all: FollowPairs[]): FollowPairs {
  const out: FollowPairs = { names: new Map(), words: new Map() };
  for (const pairs of all) {
    for (const [k, v] of pairs.names) if (!out.names.has(k)) out.names.set(k, v);
    for (const [k, v] of pairs.words) if (!out.words.has(k)) out.words.set(k, v);
  }
  return out;
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
  let out = replaceWords(text, NAME_RE, pairs.names, base, changes);
  out = out.replace(QUOTED_RE, (whole, curly: string | undefined, bracket: string | undefined, offset: number) => {
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

/**
 * Rewrite names and quoted payloads in prose, morph lines and `<!-- gloss: … -->` comments.
 * Code spans, link targets and pinned heading ids are left as they are.
 */
export function followProse(markdown: string, pairs: FollowPairs): { text: string; changes: RetieChange[] } {
  const changes: RetieChange[] = [];
  if (pairs.names.size === 0 && pairs.words.size === 0) return { text: markdown, changes };
  let text = "";
  let at = 0;
  for (const match of markdown.matchAll(PROTECTED_RE)) {
    text += followText(markdown.slice(at, match.index!), at, pairs, changes) + match[0];
    at = match.index! + match[0].length;
  }
  text += followText(markdown.slice(at), at, pairs, changes);
  return { text, changes };
}
