/**
 * Self-containment of an English helper prompt against a reference translation: whether each
 * word of the reference is in the prompt verbatim (`word`), can be built from what the prompt
 * shows (`pattern`), or is missing. Pure, for the recall script (scripts/english-helper-recall.ts).
 *
 * `pattern`: an ordinary content word on `-l` or `-m` whose roots the prompt shows (a root line, a
 * spelled suggestion, or a word in an example), since the writing rules teach the role letter and
 * those two endings; an `x` word also needs a shown word of the same `x` family. Any other word
 * (a closed row, a name, a hook, a number) needs a shown word of the same family and ending, so
 * only its role letter differs.
 */
import type { MorphWordFamily } from "../parse/types.js";
import { parseWord } from "../parse/word.js";
import type { Analysis, Suggestion } from "./analyze.js";

export type Coverage = "word" | "pattern" | "missing";

/** A word of a parse tree: its spelling, ending, family, and the lexicon's reading. */
export type TreeWord = { raw: string; pos?: string; ending?: string; family: MorphWordFamily; reading?: string; rootGloss?: { concrete?: string; abstract?: string }; overlay?: { gloss?: string } };

/** Every word of a parse tree, in written order. */
export function treeWords(tree: unknown): TreeWord[] {
  const out = new Map<number | string, TreeWord>();
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const word = node as TreeWord & { at?: number };
    if (typeof word.raw === "string" && word.family && typeof word.family === "object") out.set(word.at ?? word.raw, word);
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value);
  };
  walk(tree);
  return [...out.entries()].sort((a, b) => (typeof a[0] === "number" && typeof b[0] === "number" ? a[0] - b[0] : 0)).map(([, w]) => w);
}

/** The roots a word builds on. */
export function familyRoots(family: MorphWordFamily): string[] {
  if (family.kind === "content") return family.roots;
  if (family.kind === "x") return [...family.leftRoots, ...(family.rightRoots ?? [])];
  if (family.kind === "hookCompound") return [family.leftRoot];
  return [];
}

const TRIM = /^[^a-z0-9θɡ+#_~@=^-]+|[^a-z0-9θɡ+#_~@=^-]+$/g;

/** What a prompt shows: the Agebon words it spells, and the roots those words and its root lines carry. */
export type PromptShows = { words: Set<string>; roots: Set<string>; families: Map<string, Set<string>>; xFamilies: Set<string> };

const familyKey = (family: MorphWordFamily) => JSON.stringify(family);

/**
 * Agebon words in a prompt: every backtick span and every `AGEBON:` line, split on spaces.
 * Roots also come from the analysis's own suggestions, since a root line names its root bare.
 */
export function promptShows(prompt: string, analyses: readonly Analysis[]): PromptShows {
  const words = new Set<string>();
  for (const m of prompt.matchAll(/`([^`\n]+)`/g)) for (const w of m[1]!.split(/\s+/)) words.add(w.replace(TRIM, ""));
  for (const m of prompt.matchAll(/^AGEBON: (.+)$/gm)) for (const w of m[1]!.split(/\s+/)) words.add(w.replace(TRIM, ""));
  words.delete("");
  const roots = new Set<string>();
  const families = new Map<string, Set<string>>();
  const xFamilies = new Set<string>();
  for (const w of words) {
    let parsed;
    try {
      parsed = parseWord(w);
    } catch {
      continue;
    }
    for (const r of familyRoots(parsed.family)) roots.add(r);
    if (parsed.family.kind === "x") xFamilies.add(parsed.family.xFamily);
    const key = familyKey(parsed.family);
    if (!families.has(key)) families.set(key, new Set());
    families.get(key)!.add(parsed.ending ?? "");
  }
  for (const analysis of analyses) {
    for (const s of analysis.clauses.flatMap((c) => c.slots.flatMap((slot) => slot.suggestions))) for (const r of suggestionRoots(s)) roots.add(r);
  }
  return { words, roots, families, xFamilies };
}

function suggestionRoots(s: Suggestion): string[] {
  switch (s.kind) {
    case "lexicon":
      return [s.form];
    case "role":
      return [s.root, ...(s.modifier ? [s.modifier.root] : [])];
    case "live":
      return s.parts.map((p) => p.form);
    case "class":
      return [s.animal?.form, s.qualifier?.form].filter((f): f is string => !!f);
    default:
      return [];
  }
}

export function coverWord(word: TreeWord, shows: PromptShows): Coverage {
  if (shows.words.has(word.raw)) return "word";
  const roots = familyRoots(word.family);
  const ordinary = word.reading === "ordinary" && (word.ending === "l" || word.ending === "m");
  if (ordinary && roots.length > 0 && roots.every((r) => shows.roots.has(r))) {
    if (word.family.kind !== "x" || shows.xFamilies.has(word.family.xFamily)) return "pattern";
  }
  if (shows.families.get(familyKey(word.family))?.has(word.ending ?? "")) return "pattern";
  return "missing";
}
