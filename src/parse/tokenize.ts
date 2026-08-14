import { parse as peggyParse } from "../generated/word-parser.js";
import type { MorphWord } from "./types.js";
import { classifyAll, type ClassifyTables } from "./classify.js";
import {
  lexWordToToken,
  surfaceAtomToToken,
  type SurfaceAtom,
  type TokenPayload,
} from "./tokens.js";
import type { IToken } from "chevrotain";
import type { LexWord, PunctKind } from "./types.js";

export type TokenizeSegment =
  | { kind: "word"; text: string }
  | { kind: "islandEdge" }
  | { kind: "punct"; punct: PunctKind };

function peelTrailingPunct(raw: string): { word: string; punct?: PunctKind } {
  const last = raw.slice(-1);
  if (last === "." || last === "?" || last === "!") {
    const word = raw.slice(0, -1);
    if (!word) {
      return {
        word: "",
        punct: last === "." ? "period" : last === "?" ? "qmark" : "bang",
      };
    }
    return {
      word,
      punct: last === "." ? "period" : last === "?" ? "qmark" : "bang",
    };
  }
  return { word: raw };
}

/** Split utterance text into Peggy words and peeled surface atoms. */
export function segmentUtterance(text: string): TokenizeSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const segments: TokenizeSegment[] = [];
  const chunks = trimmed.split(/\s+/);

  for (const chunk of chunks) {
    if (chunk === "^") {
      segments.push({ kind: "islandEdge" });
      continue;
    }

    const { word, punct } = peelTrailingPunct(chunk);
    if (word) segments.push({ kind: "word", text: word });
    if (punct) segments.push({ kind: "punct", punct });
  }

  return segments;
}

function parseMorphWords(segments: TokenizeSegment[]): MorphWord[] {
  const words: MorphWord[] = [];
  const wordTexts = segments
    .filter((s): s is { kind: "word"; text: string } => s.kind === "word")
    .map((s) => s.text);

  if (wordTexts.length === 0) return words;

  const joined = wordTexts.join(" ");
  const parsed = peggyParse(joined, { startRule: "words" }) as MorphWord[];
  return parsed;
}

export function tokenizeUtterance(text: string, tables: ClassifyTables): IToken[] {
  const segments = segmentUtterance(text);
  const morphWords = parseMorphWords(segments);
  const classified = classifyAll(morphWords, tables);

  const tokens: IToken[] = [];
  let morphIndex = 0;
  let offset = 0;

  for (const segment of segments) {
    if (segment.kind === "word") {
      const word = classified[morphIndex++];
      if (!word) throw new Error(`Missing classified word for ${segment.text}`);
      tokens.push(lexWordToToken(word, offset));
      offset += word.raw.length;
      continue;
    }

    if (segment.kind === "islandEdge") {
      const atom: SurfaceAtom = { kind: "islandEdge" };
      tokens.push(surfaceAtomToToken(atom, offset));
      offset += 1;
      continue;
    }

    const atom: SurfaceAtom = { kind: "punct", punct: segment.punct };
    tokens.push(surfaceAtomToToken(atom, offset));
    offset += 1;
  }

  return tokens;
}

export function tokensFromLexWords(words: LexWord[]): IToken[] {
  let offset = 0;
  return words.map((word) => {
    const token = lexWordToToken(word, offset);
    offset += word.raw.length + 1;
    return token;
  });
}

export function punctToken(punct: PunctKind, offset = 0): IToken {
  const atom: SurfaceAtom = { kind: "punct", punct };
  return surfaceAtomToToken(atom, offset);
}

export function islandEdgeToken(offset = 0): IToken {
  const atom: SurfaceAtom = { kind: "islandEdge" };
  return surfaceAtomToToken(atom, offset);
}

export type { TokenPayload };
