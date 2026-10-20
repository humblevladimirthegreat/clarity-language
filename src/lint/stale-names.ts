import type { ClassifyTables } from "../parse/classify.js";

/**
 * Capitalised words shaped like a named root (root + **-n**) that are not names: the language's own
 * English name (renamed by hand, docs/meta/language-name.md) and English words.
 */
const NOT_NAMES = new Set(["Egabon", "Even"]);

/** A native root (vowel first, consonant + vowel pairs) + **-n**. */
const NAMED_RE = /^[aeou](?:(?:th|[bdghylmnrvwz])[aeou])+n$/;

/** Capitalised or shouted words, with an English plural (`Uzozens`, `UZOZEN`). */
const WORD_RE = /(?<![A-Za-z])[A-Z][A-Za-z]+(?![A-Za-z])/g;

/** Foreign text: opaque payloads in code (`<…>`, `&lt;…&gt;`) and in morph lines (`OPAQUE["…"]`). */
const FOREIGN_RE = /<[^<>\n]*>|&lt;[\s\S]*?&gt;|OPAQUE\["[^"\n]*"\]/g;

export type StaleNameIssue = { name: string; index: number };

function namedStem(word: string): string | undefined {
  const lower = word.toLowerCase();
  for (const suffix of ["", "s", "es"]) {
    const stem = suffix ? lower.slice(0, -suffix.length) : lower;
    if (lower.endsWith(suffix) && NAMED_RE.test(stem)) return stem;
  }
  return undefined;
}

/**
 * English names spelled like a named root whose root is not in the lexicon: a house or example name
 * a retie left behind (*Azawan* after its root moved). Prose, morph lines and code are all read;
 * foreign payloads are not.
 */
export function lintStaleNames(text: string, tables: ClassifyTables): StaleNameIssue[] {
  const blanked = text.replace(FOREIGN_RE, (payload) => " ".repeat(payload.length));
  const issues: StaleNameIssue[] = [];
  for (const match of blanked.matchAll(WORD_RE)) {
    const word = match[0];
    if (word !== word.toUpperCase() && !/^[A-Z][a-z]+$/.test(word)) continue;
    const stem = namedStem(word);
    if (!stem || NOT_NAMES.has(`${stem.charAt(0).toUpperCase()}${stem.slice(1)}`)) continue;
    const root = stem.slice(0, -1);
    if (tables.published.has(root) || tables.compounds.has(root)) continue;
    issues.push({ name: word, index: match.index! });
  }
  return issues;
}
