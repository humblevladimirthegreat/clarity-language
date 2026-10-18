/**
 * The English helper's WordNet reverse index (src/generated/english-wordnet.json, written by
 * scripts/english-helper-wordnet.ts): English words with no lexicon sense of their own → the
 * lexicon senses WordNet relates them to. Pure data in, suggestions out (no file access), so the
 * same index can run in the browser.
 *
 * The file stores English sense words, never root spellings: a sense resolves to its roots
 * through the lexicon index at run time, so respelling a root never makes the file stale.
 *
 * Tiers: `synonym` (shares a synset with a sense, is WordNet-similar to it, or is derived from
 * it), `broader` (a sense is a hypernym one or two levels up). Routes name a class the lexicon
 * leaves out on purpose: kin terms, and young or sexed animals.
 */
import { lookupLexicon, type LexiconIndex, type LexiconSuggestion } from "./lexicon.js";

export const WORDNET_INDEX_VERSION = 1;

export type WordnetPos = "n" | "v" | "a" | "r";
export type WordnetTier = "synonym" | "broader";
export type WordnetEntry = {
  /** A lexicon sense word (a key of the lexicon index). */
  sense: string;
  tier: WordnetTier;
  /** The English word's part of speech in this link, so a tagged noun skips verb leads. */
  pos: WordnetPos;
  /** How WordNet links them: the hypernym under the sense (`broader`), or `similar` / `derived`. */
  via?: string;
};

export const ROUTE_CLASSES = ["kin", "young", "female", "male"] as const;
export type RouteClass = (typeof ROUTE_CLASSES)[number];
export type WordnetRoute = {
  class: RouteClass;
  /** Young and sexed animals: the nearest lexicon sense above (*puppy* → *dog*). */
  sense?: string;
};

export type WordnetIndex = {
  version: number;
  /** Hash of `wordnetInputs` for the lexicon the file was built from. */
  inputs: string;
  entries: Record<string, WordnetEntry[]>;
  routes: Record<string, WordnetRoute>;
};

/** Lexicon tiers a WordNet lead can resolve to. Aliases are search cues, not senses. */
const SENSE_TIERS = new Set<LexiconSuggestion["tier"]>(["root", "compound", "overlay"]);

/**
 * What the generated file depends on: every lexicon key with its tiers and english_by_pos role
 * letters. Hash it to check the committed file is current (no WordNet needed).
 */
export function wordnetInputs(lexicon: LexiconIndex): string {
  return JSON.stringify(
    [...lexicon]
      .map(([key, list]) => [key, [...new Set(list.map((s) => `${s.tier}:${(s.roles ?? []).join("")}`))].sort()] as const)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)),
  );
}

/** The lexicon senses an index entry resolves to, best first. */
export function senseSuggestions(lexicon: LexiconIndex, sense: string): LexiconSuggestion[] {
  return lookupLexicon(lexicon, [sense]).filter((s) => SENSE_TIERS.has(s.tier));
}

/**
 * WordNet leads for `words` (a lemma, then its inflected forms), as lexicon suggestions in their
 * own tier, synonyms first. `pos` keeps only links where the word is that part of speech.
 */
export function lookupWordnet(index: WordnetIndex, lexicon: LexiconIndex, words: readonly string[], pos?: WordnetPos): LexiconSuggestion[] {
  const out: LexiconSuggestion[] = [];
  for (const word of words) {
    for (const entry of index.entries[word.toLowerCase()] ?? []) {
      if (pos && entry.pos !== pos) continue;
      for (const s of senseSuggestions(lexicon, entry.sense)) {
        if (out.some((o) => o.form === s.form && o.pos === s.pos)) continue;
        out.push({ ...s, tier: entry.tier, ...(entry.via ? { via: entry.via } : {}), lead: entry.sense });
      }
    }
  }
  return out.sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "synonym" ? -1 : 1));
}

export function lookupRoute(index: WordnetIndex, words: readonly string[]): WordnetRoute | undefined {
  for (const word of words) {
    const route = index.routes[word.toLowerCase()];
    if (route) return route;
  }
  return undefined;
}
