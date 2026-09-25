import { createToken, type IToken, Lexer } from "chevrotain";

import type { LexWord, PunctKind } from "./types.js";
import { isStandIn } from "./classify.js";

/** Non-word surface atoms peeled before Peggy. */
export type SurfaceAtom =
  | { kind: "islandEdge" }
  | { kind: "tone"; mark: string; attached: boolean }
  | { kind: "punct"; punct: PunctKind };

export type TokenPayload = LexWord | SurfaceAtom;

export type AgelanTokenType = ReturnType<typeof createToken>;

/** Category matched by every token an atomic span may hold (all but island edges and sentence ends). */
export const SpanAtom = createToken({ name: "SpanAtom", pattern: Lexer.NA });

function wordToken(name: string, spanAtom = true): AgelanTokenType {
  return createToken({ name, pattern: Lexer.NA, categories: spanAtom ? [SpanAtom] : [] });
}

export const IslandEdge = wordToken("IslandEdge", false);
export const Period = wordToken("Period", false);
export const QMark = wordToken("QMark", false);
export const Bang = wordToken("Bang", false);
/** Tone mark (prosody only); checked and removed before the sentence grammar runs. */
export const Tone = wordToken("Tone", false);

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
export const Hook = wordToken("Hook");
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
  Hook,
  SpanOpen,
  SpanClose,
  WritingSpan,
  SpanAtom,
];

const JOIN_BY_POS = {
  z: JoinZ,
  d: JoinD,
  b: JoinB,
  g: JoinG,
  w: JoinW,
  h: JoinH,
  th: JoinH,
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
  th: H,
} as const;

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

/** Which `classifyTokenBranch` rule assigned a word its token class (construction registry key). */
export type TokenBranch =
  | "hook"
  | "spanClose"
  | "writingSpanSlot"
  | "writingSpan"
  | "spanOpen"
  | "standIn"
  | "join"
  | "joinAct"
  | "joinRelationG"
  | "joinRelationH"
  | "greeting"
  | "polar"
  | "force"
  | "jFallbackVocative"
  | "linker"
  | "content"
  | "citationFallback";

export function classifyTokenBranch(word: LexWord): { type: AgelanTokenType; branch: TokenBranch } {
  const { family, pos, reading } = word;

  if (family.kind === "hook") return { type: Hook, branch: "hook" };
  if (family.kind === "spanClose") return { type: SpanClose, branch: "spanClose" };
  // A written span fills its PoS slot: `d[…]` / `z[…]` / `b[…]` are NP heads; `v[…]`, `th(…)`, … take the V / H / … slot.
  if (family.kind === "writingSpan") {
    if (pos && pos !== "z" && pos !== "d" && pos !== "b" && pos in CONTENT_BY_POS) {
      return { type: CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS], branch: "writingSpanSlot" };
    }
    return { type: WritingSpan, branch: "writingSpan" };
  }
  if (family.kind === "x" && family.xFamily === "span") return { type: SpanOpen, branch: "spanOpen" };

  if (isStandIn(word)) return { type: Odo, branch: "standIn" };

  if (family.kind === "joinMarker" && reading === "join" && pos && pos in JOIN_BY_POS) {
    return { type: JOIN_BY_POS[pos as keyof typeof JOIN_BY_POS], branch: "join" };
  }

  if (reading === "joinAct") return { type: V, branch: "joinAct" };
  if (reading === "joinRelation") {
    if (pos === "g") return { type: G, branch: "joinRelationG" };
    if (pos === "h" || pos === "th") return { type: H, branch: "joinRelationH" };
  }

  if (reading === "greeting") return { type: Vocative, branch: "greeting" };

  if (pos === "j") {
    if (isPolarWord(word)) return { type: Polar, branch: "polar" };
    if (isForceWord(word)) return { type: Force, branch: "force" };
    return { type: Vocative, branch: "jFallbackVocative" };
  }

  if (pos === "x" && isLinkerWord(word)) return { type: Linker, branch: "linker" };

  if (pos && pos in CONTENT_BY_POS) {
    return { type: CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS], branch: "content" };
  }

  // Citation / unknown without PoS — treat as generic noun slot for parsing.
  return { type: Z, branch: "citationFallback" };
}

export function classifyToTokenType(word: LexWord): AgelanTokenType {
  return classifyTokenBranch(word).type;
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

  if (atom.kind === "tone") {
    return {
      image: atom.mark,
      startOffset: index,
      endOffset: index + atom.mark.length,
      startLine: 1,
      endLine: 1,
      startColumn: index + 1,
      endColumn: index + atom.mark.length + 1,
      tokenType: Tone,
      tokenTypeIdx: Tone.tokenTypeIdx!,
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
