import { parse as peggyParse, SyntaxError as PeggySyntaxError } from "../generated/word-parser.js";

import type { MorphWord } from "./types.js";

export class WordParseError extends Error {
  readonly peggyError: PeggySyntaxError;

  constructor(peggyError: PeggySyntaxError) {
    super(peggyError.message);
    this.name = "WordParseError";
    this.peggyError = peggyError;
  }
}

/** Parse one Agelan word from surface text (Stage 1 Peggy grammar). */
export function parseWord(input: string): MorphWord {
  try {
    return peggyParse(input.trim()) as MorphWord;
  } catch (error) {
    if (error instanceof PeggySyntaxError) {
      throw new WordParseError(error);
    }
    throw error;
  }
}

/** Parse whitespace-separated words. */
export function parseWords(input: string): MorphWord[] {
  const trimmed = input.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/).map((token) => parseWord(token));
}

const TOP_PROBES = [
  "probe_spanClose",
  "probe_writingSpan",
  "probe_freeNumber",
  "probe_reviser",
  "probe_prefixedWord",
  "probe_citation",
] as const;

const BODY_PROBES = ["probe_prefixedX", "probe_prefixedPlain", "probe_prefixedJoin"] as const;

function tryStartRule(input: string, startRule: string): MorphWord | undefined {
  try {
    return peggyParse(input, { startRule: startRule as "start" }) as MorphWord;
  } catch {
    return undefined;
  }
}

function morphKey(word: MorphWord): string {
  return JSON.stringify({
    pos: word.pos,
    gl: word.gl,
    ending: word.ending,
    plural: word.plural,
    family: word.family,
  });
}

/** Full-word morph matches if each Peggy alternative is tried on its own (no ordered choice). */
export function probeMorphWord(input: string): { source: string; word: MorphWord }[] {
  const text = input.trim();
  if (!text) return [];

  const hits: { source: string; word: MorphWord }[] = [];
  const seen = new Set<string>();

  const add = (source: string, word: MorphWord | undefined) => {
    if (!word) return;
    const key = `${source}:${morphKey(word)}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ source, word });
  };

  for (const rule of TOP_PROBES) {
    add(rule.replace(/^probe_/, ""), tryStartRule(text, rule));
  }

  const prefixed = hits.find((h) => h.source === "prefixedWord");
  if (prefixed) {
    for (const rule of BODY_PROBES) {
      add(rule.replace(/^probe_prefixed/, "body"), tryStartRule(text, rule));
    }
  }

  return hits;
}
