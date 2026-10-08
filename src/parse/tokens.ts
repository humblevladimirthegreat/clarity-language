import { createToken, type IToken, Lexer } from "chevrotain";

import type { LexWord, PunctKind } from "./types.js";
import { isAsOfOverlay, isStandIn } from "./classify.js";
import { isTopicCompound } from "./linkers.js";

/** Non-word surface atoms peeled before Peggy. */
export type SurfaceAtom =
  | { kind: "islandEdge"; open: boolean }
  | { kind: "tone"; mark: string; attached: boolean }
  | { kind: "punct"; punct: PunctKind };

export type TokenPayload = LexWord | SurfaceAtom;

export type AgazanTokenType = ReturnType<typeof createToken>;

function wordToken(name: string, categories: AgazanTokenType[] = []): AgazanTokenType {
  return createToken({ name, pattern: Lexer.NA, categories });
}

/** Either edge of a scope island (`{` or `}`). */
export const IslandEdge = wordToken("IslandEdge");
export const IslandOpen = wordToken("IslandOpen", [IslandEdge]);
export const IslandClose = wordToken("IslandClose", [IslandEdge]);
export const Period = wordToken("Period");
export const QMark = wordToken("QMark");
export const Bang = wordToken("Bang");
/** Tone mark (prosody only); checked and removed before the sentence grammar runs. */
export const Tone = wordToken("Tone");

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
/** A `/w/` word. An as-of `/w/` opens a pair with the `/b/` after it (relations.md#as-of); every other `/w/` grades what follows. */
export const W = wordToken("W");
export const WPlain = wordToken("WPlain", [W]);
export const WAsOf = wordToken("WAsOf", [W]);
export const H = wordToken("H");
/**
 * A `/b/` right after an `/h/`, `/th/` or `/ɡ/` word: it completes that word (clause.md § extra nouns), so it is never a
 * `/b/` phrase of its own. Likewise a stand-in right after an `/h/` or `/th/` word. Set by `markContext`.
 */
export const HostedB = wordToken("HostedB");
export const HostedOdo = wordToken("HostedOdo");
/** A `/th/` stance word that is a rank fence's bar: it runs up to the list's rank join (comparatives.md#bars). Set by `markContext`. */
export const Bar = wordToken("Bar");
/** A bare tag **-l** (`zwal`): it names the phrase right before it, or a new referent (pronouns.md#tag-pronouns). */
export const TagZ = wordToken("TagZ");
export const TagD = wordToken("TagD");
export const TagB = wordToken("TagB");
/** A word with no role letter (a citation form, or a bare `/x/` number): it names, filling no slot (word-endings.md#citation-forms). */
export const Citation = wordToken("Citation");
/** A forward stand-in, by the slot it fills: a noun-phrase head (`zarl`, `darl`, `barl`) or another slot. */
export const Odo = wordToken("Odo");
export const OdoZ = wordToken("OdoZ", [Odo]);
export const OdoD = wordToken("OdoD", [Odo]);
export const OdoB = wordToken("OdoB", [Odo]);
export const OdoOther = wordToken("OdoOther", [Odo]);
export const Force = wordToken("Force");
export const Polar = wordToken("Polar");
export const Vocative = wordToken("Vocative");
export const Interjection = wordToken("Interjection");
export const Linker = wordToken("Linker");
export const Hook = wordToken("Hook");
/** A written span as a noun-phrase head, by slot. A span with no slot letter keeps the bare category, which no rule takes. */
export const WritingSpan = wordToken("WritingSpan");
export const WritingSpanZ = wordToken("WritingSpanZ", [WritingSpan]);
export const WritingSpanD = wordToken("WritingSpanD", [WritingSpan]);
export const WritingSpanB = wordToken("WritingSpanB", [WritingSpan]);

export const allTokens = [
  IslandEdge,
  IslandOpen,
  IslandClose,
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
  WPlain,
  WAsOf,
  H,
  HostedB,
  HostedOdo,
  Bar,
  Citation,
  TagZ,
  TagD,
  TagB,
  Odo,
  OdoZ,
  OdoD,
  OdoB,
  OdoOther,
  Force,
  Polar,
  Vocative,
  Interjection,
  Linker,
  Hook,
  WritingSpan,
  WritingSpanZ,
  WritingSpanD,
  WritingSpanB,
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
  w: WPlain,
  h: H,
  th: H,
} as const;

const TAG_BY_POS: Partial<Record<string, AgazanTokenType>> = { z: TagZ, d: TagD, b: TagB };
const ODO_BY_POS: Partial<Record<string, AgazanTokenType>> = { z: OdoZ, d: OdoD, b: OdoB };
const WRITING_SPAN_BY_POS: Partial<Record<string, AgazanTokenType>> = { z: WritingSpanZ, d: WritingSpanD, b: WritingSpanB };

function isForceWord(word: LexWord): boolean {
  if (word.pos !== "y" || word.family.kind !== "joinMarker") return false;
  return word.family.series.length === 1;
}

function isPolarWord(word: LexWord): boolean {
  if (word.pos !== "y" || word.family.kind !== "joinMarker") return false;
  return word.family.series.length > 1;
}

function isLinkerWord(word: LexWord): boolean {
  return word.pos === "x" && (word.family.kind === "content" || isTopicCompound(word));
}

/** Which `classifyTokenBranch` rule assigned a word its token class (construction registry key). */
export type TokenBranch =
  | "hook"
  | "writingSpanSlot"
  | "writingSpan"
  | "standIn"
  | "join"
  | "joinAct"
  | "joinRelationG"
  | "joinRelationH"
  | "greeting"
  | "polar"
  | "force"
  | "yVocative"
  | "yInterjection"
  | "linker"
  | "tagAssign"
  | "content"
  | "citationFallback";

export function classifyTokenBranch(word: LexWord): { type: AgazanTokenType; branch: TokenBranch } {
  const { family, pos, reading } = word;

  if (family.kind === "hook") return { type: Hook, branch: "hook" };
  // A written span fills its PoS slot: `d[…]` / `z[…]` / `b[…]` are NP heads; `v[…]`, `th(…)`, … take the V / H / … slot.
  if (family.kind === "writingSpan") {
    // Under `/y/`: a named span (`y@<Sam>`) calls someone; any other span is the reaction itself.
    if (pos === "y") {
      return family.marks.includes("@") ? { type: Vocative, branch: "yVocative" } : { type: Interjection, branch: "yInterjection" };
    }
    if (pos === "x") return { type: Linker, branch: "linker" };
    if (pos && pos !== "z" && pos !== "d" && pos !== "b" && pos in CONTENT_BY_POS) {
      return { type: CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS], branch: "writingSpanSlot" };
    }
    return { type: (pos && WRITING_SPAN_BY_POS[pos]) || WritingSpan, branch: "writingSpan" };
  }

  if (isStandIn(word)) return { type: (pos && ODO_BY_POS[pos]) || OdoOther, branch: "standIn" };

  if (family.kind === "joinMarker" && reading === "join" && pos && pos in JOIN_BY_POS) {
    return { type: JOIN_BY_POS[pos as keyof typeof JOIN_BY_POS], branch: "join" };
  }

  if (reading === "joinAct") return { type: V, branch: "joinAct" };
  if (reading === "joinRelation") {
    if (pos === "g") return { type: G, branch: "joinRelationG" };
    if (pos === "h" || pos === "th") return { type: H, branch: "joinRelationH" };
  }

  if (reading === "greeting") return { type: Vocative, branch: "greeting" };

  if (pos === "y") {
    if (isPolarWord(word)) return { type: Polar, branch: "polar" };
    if (isForceWord(word)) return { type: Force, branch: "force" };
    // -n (a name) and -r (a resume, read through its antecedent) call someone; -l / -m give the reaction itself.
    if (word.ending === "l" || word.ending === "m") return { type: Interjection, branch: "yInterjection" };
    return { type: Vocative, branch: "yVocative" };
  }

  if (pos === "x" && isLinkerWord(word)) return { type: Linker, branch: "linker" };

  if (pos === "w" && isAsOfOverlay(word)) return { type: WAsOf, branch: "content" };
  const tag = family.kind === "tag" && word.ending === "l" && !word.plural && pos ? TAG_BY_POS[pos] : undefined;
  if (tag) return { type: tag, branch: "tagAssign" };
  if (pos && pos in CONTENT_BY_POS) {
    return { type: CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS], branch: "content" };
  }

  // Citation / unknown without PoS: it names, and fills no slot.
  return { type: Citation, branch: "citationFallback" };
}

export function classifyToTokenType(word: LexWord): AgazanTokenType {
  return classifyTokenBranch(word).type;
}

export function surfaceAtomToToken(atom: SurfaceAtom, index: number): IToken {
  if (atom.kind === "islandEdge") {
    const type = atom.open ? IslandOpen : IslandClose;
    return {
      image: atom.open ? "{" : "}",
      startOffset: index,
      endOffset: index + 1,
      startLine: 1,
      endLine: 1,
      startColumn: index + 1,
      endColumn: index + 2,
      tokenType: type,
      tokenTypeIdx: type.tokenTypeIdx!,
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
