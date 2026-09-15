import type { MorphWord } from "./types.js";
import { classifyAll, type ClassifyTables } from "./classify.js";
import { writingSpanEnd } from "./span-scan.js";
import {
  lexWordToToken,
  surfaceAtomToToken,
  type SurfaceAtom,
  type TokenPayload,
} from "./tokens.js";
import type { IToken } from "chevrotain";
import type { LexWord, PunctKind } from "./types.js";
import { parseWordStream } from "./word.js";

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
  let i = 0;
  while (i < trimmed.length) {
    while (i < trimmed.length && /\s/.test(trimmed[i]!)) i += 1;
    if (i >= trimmed.length) break;

    if (trimmed[i] === "^") {
      segments.push({ kind: "islandEdge" });
      i += 1;
      continue;
    }

    const spanEnd = writingSpanEnd(trimmed, i);
    if (spanEnd !== undefined) {
      segments.push({ kind: "word", text: trimmed.slice(i, spanEnd) });
      i = spanEnd;
      continue;
    }

    let j = i;
    while (j < trimmed.length && !/\s/.test(trimmed[j]!) && trimmed[j] !== "^") {
      j += 1;
    }
    const { word, punct } = peelTrailingPunct(trimmed.slice(i, j));
    if (word) segments.push({ kind: "word", text: word });
    if (punct) segments.push({ kind: "punct", punct });
    i = j;
  }

  return segments;
}

function parseMorphWords(segments: TokenizeSegment[]): MorphWord[] {
  const wordTexts = segments
    .filter((s): s is { kind: "word"; text: string } => s.kind === "word")
    .map((s) => s.text);
  return parseWordStream(wordTexts);
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
