/**
 * Near misses: candidate fixes for a sentence that did not parse or used a root the lexicon lacks. Two
 * layers: an error table (seed rows below, plus the **Fix it** drills of the grammar pages, extracted at
 * build time) and token edit distance over the player's unlocked roots. This file only proposes; the
 * engine keeps a candidate only if it parses to one tree and its nouns resolve in the scene.
 */
import { parseWords } from "../parse/word.js";

/**
 * One row of the error table. `prefix` swaps a word's role letter, `ending` its ending, `word` one whole
 * word for another, `front` moves a word of that role letter to the start of the turn. `errorKind` is the parser's error for the slip (a
 * rejection id, `word`, `sentence`, `unknown-root`) or `*` for any.
 */
export type RecastRule = {
  kind: "prefix" | "ending" | "word" | "front";
  from: string;
  to: string;
  errorKind: string;
  why?: string;
  /** `page.md#id` of the drill or section the row comes from. */
  source: string;
};

/** `tier` 0: the whole input read another way (a typed gloss, the orthography fix); 1: a row for this error kind; 2: any other single edit. */
export type NearMiss = { agebon: string; rule: string; tier: number; why?: string; source?: string };

/** Seed rows from the orthography and the word shape: swapped endings, `/b/` for `/d/`. */
export const SEED_RULES: RecastRule[] = [
  ...(["l", "m", "n", "r"] as const).flatMap((from) =>
    (["l", "m", "n", "r"] as const)
      .filter((to) => to !== from)
      .map((to): RecastRule => ({ kind: "ending", from, to, errorKind: "*", source: "word-endings.md#the-three-endings" })),
  ),
  { kind: "prefix", from: "b", to: "d", errorKind: "*", source: "clause.md#role-letters" },
  { kind: "prefix", from: "d", to: "b", errorKind: "*", source: "clause.md#role-letters" },
  { kind: "prefix", from: "bl", to: "b", errorKind: "*", source: "clause.md#extra-nouns" },
  { kind: "front", from: "y", to: "", errorKind: "turnMidSentence", source: "speech-moves.md#turn-y" },
];

/** Role letters a bare word may have lost. */
const ROLE_LETTERS = ["z", "d", "v", "b", "g", "h"];
const VOWELS = /^[aeiou]/;

/** Orthography slips (phonology.md): capitals, `t` for `th`, a hyphen after the role letter. */
export function orthographyFix(text: string): string {
  return text
    .replace(/<[^>]*>|[^<]+/g, (chunk) => (chunk.startsWith("<") ? chunk : chunk.toLowerCase()))
    .replace(/<[^>]*>|[^<]+/g, (chunk) => (chunk.startsWith("<") ? chunk : chunk.replace(/t(?!h)/g, "th")))
    .replace(/(^|[\s{(\[])(th|gl|bl|[zdbvgwhxy])-(?=[aeiou])/g, "$1$2");
}

/** Gloss tokens typed as a sentence (`z-dog v-chase`, or with ` | `), joined the way a morph gloss line writes them. */
export function typedGloss(text: string): string | undefined {
  const tokens = text.trim().replace(/[.!?]$/, "").replace(/\s*\|\s*/g, " ").split(/\s+/);
  if (tokens.length === 0) return undefined;
  const leaf = /^(?:(?:th|gl|[zdbvgwhxy])-)?←?[A-Za-z][\w.-]*$/;
  if (!tokens.every((t) => leaf.test(t)) || !tokens.some((t) => /^(?:th|gl|[zdbvgwhxy])-/.test(t))) return undefined;
  return tokens.join(" | ");
}

export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cur = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length]!;
}

type Tok = { word: string; tail: string };

function tokens(text: string): Tok[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^(.*?)([.?!]*)$/)!;
      return { word: m[1]!, tail: m[2]! };
    });
}

const render = (toks: Tok[]) => toks.map((t) => t.word + t.tail).join(" ");

/** The content root of one word, if it reads as a content word. */
function contentRoot(word: string): string | undefined {
  try {
    const words = parseWords(word);
    const only = words[0];
    if (words.length !== 1 || only?.family.kind !== "content" || only.family.roots.length !== 1) return undefined;
    return only.family.roots[0];
  } catch {
    return undefined;
  }
}

export type RecastOptions = {
  rules: readonly RecastRule[];
  /** Roots the player has unlocked (edit distance looks only here). */
  roots: readonly string[];
  /** Roots the lexicon knows. */
  known: (root: string) => boolean;
  /** Spell a typed gloss, when it spells. */
  spellGloss?: (gloss: string) => string | undefined;
  limit?: number;
};

/** Candidate rewrites of `input`, rules for this error kind first, each one edit away (after the orthography fix). */
export function nearMisses(input: string, errorKind: string, options: RecastOptions): NearMiss[] {
  const out = new Map<string, NearMiss>();
  const limit = options.limit ?? 200;
  const add = (agebon: string, rule: string, tier: number, extra: Partial<NearMiss> = {}) => {
    if (agebon !== input && !out.has(agebon) && out.size < limit) out.set(agebon, { agebon, rule, tier, ...extra });
  };

  const gloss = typedGloss(input);
  const spelled = gloss ? options.spellGloss?.(gloss) : undefined;
  if (spelled) add(spelled, "typed gloss", 0, { why: "That is a morph gloss; here it is in Agebon.", source: "inspect.md" });

  const base = orthographyFix(input);
  if (base !== input) add(base, "orthography", 0, { why: "Agebon is written in lowercase, with `th` for one letter and no hyphen after the role letter.", source: "phonology.md#vowels" });

  const toks = tokens(base);
  const rules = [...options.rules].sort((a, b) => Number(b.errorKind === errorKind) - Number(a.errorKind === errorKind));
  const replace = (i: number, word: string) => render(toks.map((t, j) => (j === i ? { ...t, word } : t)));

  for (const rule of rules) {
    const from = { why: rule.why, source: rule.source };
    const tier = rule.errorKind === errorKind ? 1 : 2;
    toks.forEach((tok, i) => {
      const { word } = tok;
      if (rule.kind === "ending" && word.length > 3 && word.endsWith(rule.from) && !word.endsWith(`r${rule.from}`)) {
        add(replace(i, word.slice(0, -1) + rule.to), `ending -${rule.from} → -${rule.to}`, tier, from);
      }
      if (rule.kind === "prefix" && word.startsWith(rule.from) && VOWELS.test(word.slice(rule.from.length))) {
        add(replace(i, rule.to + word.slice(rule.from.length)), `role letter ${rule.from} → ${rule.to}`, tier, from);
      }
      if (rule.kind === "word" && word === rule.from) add(replace(i, rule.to), `${rule.from} → ${rule.to}`, tier, from);
      if (rule.kind === "front" && i > 0 && word.startsWith(rule.from)) {
        const rest = toks.filter((_, j) => j !== i);
        const last = rest[rest.length - 1];
        const moved = [{ word, tail: "" }, ...rest.slice(0, -1), ...(last ? [{ ...last, tail: last.tail || tok.tail }] : [])];
        add(render(moved), `move ${word} to the start`, tier, from);
      }
    });
  }

  // A bare word in a sentence lost its role letter.
  if (toks.length > 1) {
    toks.forEach((tok, i) => {
      if (!VOWELS.test(tok.word)) return;
      for (const letter of ROLE_LETTERS) {
        add(replace(i, letter + tok.word), "missing role letter", 2, { why: "In a sentence, every word starts with its role letter.", source: "clause.md#role-letters" });
      }
    });
  }

  // Edit distance on roots the lexicon does not know, within the unlocked set.
  toks.forEach((tok, i) => {
    const root = contentRoot(tok.word);
    if (!root || options.known(root)) return;
    const max = root.length <= 3 ? 1 : 2;
    const near = options.roots
      .map((r) => ({ r, d: editDistance(root, r) }))
      .filter(({ d }) => d <= max)
      .sort((a, b) => a.d - b.d)
      .slice(0, 8);
    const at = tok.word.indexOf(root);
    for (const { r } of near) {
      add(replace(i, tok.word.slice(0, at) + r + tok.word.slice(at + root.length)), `root ${root} → ${r}`, 2, { why: `The lexicon has no root ${root}; ${r} is close.` });
    }
  });

  return [...out.values()];
}
