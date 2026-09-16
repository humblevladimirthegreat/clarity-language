import { parse as peggyParse, SyntaxError as PeggySyntaxError } from "../generated/word-parser.js";

import { scanWordTokens } from "./span-scan.js";
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

function opaqueBlob(raw: string): MorphWord {
  return { raw, family: { kind: "foreign", payload: raw, opaque: true } };
}

function isOpaqueSpanOpen(word: MorphWord): word is MorphWord & {
  family: Extract<MorphWord["family"], { kind: "x" }>;
} {
  return word.family.kind === "x" && word.family.xFamily === "span" && word.family.typeVowel === "u";
}

function isSpanCloseToken(text: string): boolean {
  try {
    return parseWord(text).family.kind === "spanClose";
  } catch {
    return false;
  }
}

/** Parse a pre-segmented word list (writing spans already one token). */
export function parseWordStream(tokens: string[]): MorphWord[] {
  const out: MorphWord[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;
    const word = parseWord(token);
    out.push(word);
    if (!isOpaqueSpanOpen(word)) continue;
    const edge = word.family.edgeVowel;
    if (edge === "o") {
      i += 1;
      const blob = tokens[i];
      if (blob === undefined) {
        throw new Error(`Opaque atomic span \`${token}\` needs an interior token`);
      }
      out.push(opaqueBlob(blob));
      continue;
    }
    if (edge === "a") {
      i += 1;
      while (i < tokens.length && !isSpanCloseToken(tokens[i]!)) {
        out.push(opaqueBlob(tokens[i]!));
        i += 1;
      }
      if (i < tokens.length) out.push(parseWord(tokens[i]!));
    }
  }
  return out;
}

/** Parse words in an utterance (writing spans may contain spaces). */
export function parseWords(input: string): MorphWord[] {
  return parseWordStream(scanWordTokens(input));
}

const TOP_PROBES = [
  "probe_spanClose",
  "probe_writingSpan",
  "probe_freeNumber",
  "probe_hook",
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
