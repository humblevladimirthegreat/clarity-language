import { createToken, type IToken, Lexer } from "chevrotain";

import type { LexWord, MorphWord, PunctKind } from "./types.js";

/** Non-word surface atoms peeled before Peggy. */
export type SurfaceAtom =
  | { kind: "islandEdge" }
  | { kind: "punct"; punct: PunctKind };

export type TokenPayload = LexWord | SurfaceAtom;

export type AgelanTokenType = ReturnType<typeof createToken>;

function wordToken(name: string): AgelanTokenType {
  return createToken({ name, pattern: Lexer.NA });
}

export const IslandEdge = wordToken("IslandEdge");
export const Period = wordToken("Period");
export const QMark = wordToken("QMark");
export const Bang = wordToken("Bang");

export const JoinZ = wordToken("JoinZ");
export const JoinD = wordToken("JoinD");
export const JoinB = wordToken("JoinB");
export const JoinG = wordToken("JoinG");
export const JoinW = wordToken("JoinW");
export const JoinH = wordToken("JoinH");
export const JoinV = wordToken("JoinV");
export const JoinX = wordToken("JoinX");

export const Z = wordToken("Z");
export const D = wordToken("D");
export const B = wordToken("B");
export const V = wordToken("V");
export const G = wordToken("G");
export const W = wordToken("W");
export const H = wordToken("H");
export const Odo = wordToken("Odo");
export const Force = wordToken("Force");
export const Polar = wordToken("Polar");
export const Vocative = wordToken("Vocative");
export const Linker = wordToken("Linker");
export const Reviser = wordToken("Reviser");
export const SpanOpen = wordToken("SpanOpen");
export const SpanClose = wordToken("SpanClose");
export const WritingSpan = wordToken("WritingSpan");

export const allTokens = [
  IslandEdge,
  Period,
  QMark,
  Bang,
  JoinZ,
  JoinD,
  JoinB,
  JoinG,
  JoinW,
  JoinH,
  JoinV,
  JoinX,
  Z,
  D,
  B,
  V,
  G,
  W,
  H,
  Odo,
  Force,
  Polar,
  Vocative,
  Linker,
  Reviser,
  SpanOpen,
  SpanClose,
  WritingSpan,
];

const JOIN_BY_POS = {
  z: JoinZ,
  d: JoinD,
  b: JoinB,
  g: JoinG,
  w: JoinW,
  h: JoinH,
  v: JoinV,
  x: JoinX,
} as const;

const CONTENT_BY_POS = {
  z: Z,
  d: D,
  b: B,
  v: V,
  g: G,
  w: W,
  h: H,
} as const;

function isOdoWord(word: MorphWord): boolean {
  const { family } = word;
  if (family.kind === "content" && family.roots.length === 1) {
    return family.roots[0] === "orodo";
  }
  return false;
}

function isForceWord(word: LexWord): boolean {
  if (word.pos !== "j" || word.family.kind !== "joinMarker") return false;
  return word.family.series.length === 1;
}

function isPolarWord(word: LexWord): boolean {
  if (word.pos !== "j" || word.family.kind !== "joinMarker") return false;
  return word.family.series.length > 1;
}

function isLinkerWord(word: LexWord): boolean {
  return word.pos === "x" && word.family.kind === "content";
}

export function classifyToTokenType(word: LexWord): AgelanTokenType {
  const { family, pos, reading } = word;

  if (family.kind === "reviser") return Reviser;
  if (family.kind === "spanClose") return SpanClose;
  if (family.kind === "writingSpan") return WritingSpan;
  if (family.kind === "x" && family.xFamily === "span") return SpanOpen;

  if (family.kind === "joinMarker" && reading === "join" && pos && pos in JOIN_BY_POS) {
    return JOIN_BY_POS[pos as keyof typeof JOIN_BY_POS];
  }

  if (reading === "joinAct") return V;
  if (reading === "joinRelation") {
    if (pos === "g") return G;
    if (pos === "h") return H;
  }

  if (pos === "j") {
    if (isPolarWord(word)) return Polar;
    if (isForceWord(word)) return Force;
    return Vocative;
  }

  if (pos === "x" && isLinkerWord(word)) return Linker;

  if (isOdoWord(word)) return Odo;

  if (pos && pos in CONTENT_BY_POS) {
    return CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS];
  }

  // Citation / unknown without PoS — treat as generic noun slot for parsing.
  return Z;
}

export function surfaceAtomToToken(atom: SurfaceAtom, index: number): IToken {
  if (atom.kind === "islandEdge") {
    return {
      image: "^",
      startOffset: index,
      endOffset: index + 1,
      startLine: 1,
      endLine: 1,
      startColumn: index + 1,
      endColumn: index + 2,
      tokenType: IslandEdge,
      tokenTypeIdx: IslandEdge.tokenTypeIdx!,
      payload: atom,
    };
  }

  const image = atom.punct === "period" ? "." : atom.punct === "qmark" ? "?" : "!";
  return {
    image,
    startOffset: index,
    endOffset: index + 1,
    startLine: 1,
    endLine: 1,
    startColumn: index + 1,
    endColumn: index + 2,
    tokenType: atom.punct === "period" ? Period : atom.punct === "qmark" ? QMark : Bang,
    tokenTypeIdx:
      (atom.punct === "period" ? Period : atom.punct === "qmark" ? QMark : Bang).tokenTypeIdx!,
    payload: atom,
  };
}

export function lexWordToToken(word: LexWord, index: number): IToken {
  const tokenType = classifyToTokenType(word);
  return {
    image: word.raw,
    startOffset: index,
    endOffset: index + word.raw.length,
    startLine: 1,
    endLine: 1,
    startColumn: index + 1,
    endColumn: index + word.raw.length + 1,
    tokenType,
    tokenTypeIdx: tokenType.tokenTypeIdx!,
    payload: word,
  };
}

export function isLexWordPayload(payload: TokenPayload): payload is LexWord {
  return "raw" in payload && "reading" in payload;
}

export function lexWordFromToken(token: IToken): LexWord {
  const payload = token.payload as TokenPayload;
  if (!isLexWordPayload(payload)) {
    throw new Error(`Expected LexWord payload on token ${token.image}`);
  }
  return payload;
}
