/**
 * English lemma → lexicon suggestions: the lookup ladder shared by the English helper and
 * scripts/frequency-coverage.ts. Pure data in, suggestions out (no file access), so the same
 * index can run in the browser.
 *
 * Tiers, best first: `root` (published concrete / abstract / english_by_pos sense), `alias`
 * (published english_aliases, a search cue only), `compound` (lexicon-compounds.csv sense),
 * `overlay` (lexicon-overlays.csv gloss).
 */
import type { CompoundRow } from "../lexicon-compounds.js";
import type { OverlayRow, PublishedRow, RoleLetter } from "../lexicon-search.js";

export const LEXICON_TIERS = ["root", "alias", "compound", "overlay"] as const;
export type LexiconTier = (typeof LEXICON_TIERS)[number];

export type LexiconSuggestion = {
  tier: LexiconTier;
  /** Root, compound stem, or overlay sense form. */
  form: string;
  emoji: string;
  /** The sense cell that matched, as the CSV writes it. */
  sense: string;
  /** `concrete` takes **-l**, `abstract` **-m**; absent for aliases and overlays. */
  side?: "concrete" | "abstract";
  /** Role letters english_by_pos lists for this English word, when the row lists it. */
  roles?: RoleLetter[];
  /** Overlays: the role letter the overlay lives on, and the section that teaches it. */
  pos?: string;
  anchor?: string;
};

export type LexiconIndex = Map<string, LexiconSuggestion[]>;

/** One sense cell split into single senses (`dog; hound`, `on / onto`, `talk or speech`), lowercased. */
export function splitSenses(cell: string): string[] {
  return cell
    .toLowerCase()
    .split(/[;,/]|\bor\b/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function add(index: LexiconIndex, cell: string, suggestion: Omit<LexiconSuggestion, "sense">): void {
  for (const sense of splitSenses(cell)) {
    const list = index.get(sense) ?? [];
    if (!list.some((s) => s.tier === suggestion.tier && s.form === suggestion.form && s.pos === suggestion.pos)) {
      list.push({ ...suggestion, sense: cell });
    }
    index.set(sense, list);
  }
}

/** english_by_pos role letters for one English word on one side of a row. */
function rolesFor(map: Partial<Record<RoleLetter, string>>, english: string): RoleLetter[] {
  return (Object.entries(map) as [RoleLetter, string][]).filter(([, lemma]) => lemma === english).map(([role]) => role);
}

/** Every English sense in the lexicon CSVs → its suggestions, in tier order. */
export function buildLexiconIndex(published: readonly PublishedRow[], compounds: readonly CompoundRow[], overlays: readonly OverlayRow[]): LexiconIndex {
  const index: LexiconIndex = new Map();
  for (const r of published) {
    for (const side of ["concrete", "abstract"] as const) {
      if (!r[side]) continue;
      const roles = splitSenses(r[side]).flatMap((s) => rolesFor(r.posEnglish[side], s));
      add(index, r[side], { tier: "root", form: r.root, emoji: r.emoji, side, ...(roles.length ? { roles } : {}) });
    }
    for (const side of ["concrete", "abstract"] as const) {
      for (const lemma of new Set(Object.values(r.posEnglish[side]))) {
        if (!lemma) continue;
        add(index, lemma.replace(/-/g, " "), { tier: "root", form: r.root, emoji: r.emoji, side, roles: rolesFor(r.posEnglish[side], lemma) });
      }
    }
  }
  for (const r of published) {
    for (const alias of r.englishAliases ?? []) add(index, alias, { tier: "alias", form: r.root, emoji: r.emoji });
  }
  for (const r of compounds) {
    if (r.concrete) add(index, r.concrete, { tier: "compound", form: r.stem, emoji: "", side: "concrete" });
    if (r.abstract) add(index, r.abstract, { tier: "compound", form: r.stem, emoji: "", side: "abstract" });
  }
  for (const r of overlays) add(index, r.gloss, { tier: "overlay", form: r.senseForm, emoji: r.emoji, pos: r.pos, anchor: r.anchor });
  for (const list of index.values()) list.sort((a, b) => LEXICON_TIERS.indexOf(a.tier) - LEXICON_TIERS.indexOf(b.tier));
  return index;
}

/**
 * Suggestions for `words` (a lemma, then its inflected forms), tier first: a root sense of any
 * form beats an alias of the lemma. Within a tier, earlier words come first.
 */
export function lookupLexicon(index: LexiconIndex, words: readonly string[]): LexiconSuggestion[] {
  const out: LexiconSuggestion[] = [];
  for (const tier of LEXICON_TIERS) {
    for (const word of words) {
      for (const s of index.get(word.toLowerCase()) ?? []) {
        if (s.tier === tier && !out.some((o) => o.tier === s.tier && o.form === s.form && o.pos === s.pos)) out.push(s);
      }
    }
  }
  return out;
}

/** The ending a sense side takes: **-l** for the concrete sense, **-m** for the abstract one. */
export function sideEnding(side: LexiconSuggestion["side"]): "l" | "m" | undefined {
  return side === "concrete" ? "l" : side === "abstract" ? "m" : undefined;
}

/** Root tier suggestions by root form: the published row a house-cast name is built on (*Azawan* → `azawa`). */
export function rootsByForm(index: LexiconIndex): Map<string, LexiconSuggestion> {
  const out = new Map<string, LexiconSuggestion>();
  for (const list of index.values()) {
    for (const s of list) if (s.tier === "root" && s.side === "concrete" && !out.has(s.form)) out.set(s.form, s);
  }
  return out;
}
