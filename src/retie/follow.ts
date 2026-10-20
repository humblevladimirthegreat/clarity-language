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

/** A name shouted in English (`AZAWAN`) follows like its capitalised form. */
const CAPS_RE = /(?<![A-Za-z])[A-Z]{3,}(?![A-Za-z])/g;

function followText(text: string, base: number, pairs: FollowPairs, changes: RetieChange[]): string {
  let out = replaceWords(text, NAME_RE, pairs.names, base, changes);
  out = out.replace(CAPS_RE, (word, offset: number) => {
    const next = pairs.names.get(word.charAt(0) + word.slice(1).toLowerCase());
    if (next === undefined) return word;
    changes.push({ from: word, to: next.toUpperCase(), index: base + offset });
    return next.toUpperCase();
  });
  out = out.replace(QUOTED_RE, (whole, curly: string | undefined, bracket: string | undefined, offset: number, all: string) => {
    // An opaque loan's payload is not Egabon and is never retied; a mention's is (`[gl-MENTION | z-OPAQUE["…"]]`).
    if (bracket !== undefined && /OPAQUE$/.test(all.slice(0, offset)) && !/MENTION \| [^\]|]*$/.test(all.slice(0, offset))) {
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
 * Code spans, link targets and pinned heading ids are left as they are.
 */
export function followProse(markdown: string, pairs: FollowPairs): { text: string; changes: RetieChange[] } {
  const changes: RetieChange[] = [];
  if (pairs.names.size === 0 && pairs.words.size === 0) return { text: markdown, changes };
  let text = "";
  let at = 0;
  for (const match of markdown.matchAll(PROTECTED_RE)) {
    text += followText(markdown.slice(at, match.index!), at, pairs, changes);
    text += markdownFence(match[0], match.index!, pairs, changes) ?? englishCode(match[0], match.index!, pairs, changes) ?? match[0];
    at = match.index! + match[0].length;
  }
  text += followText(markdown.slice(at), at, pairs, changes);
  return { text, changes };
}
