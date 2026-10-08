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
/** An `/h/` or `/th/` join word. Only a stance `/th/` join stands alone (`thul`); a bare `/h/` join only closes a list. */
export const JoinH = wordToken("JoinH");
export const JoinHPlain = wordToken("JoinHPlain", [JoinH]);
export const JoinTh = wordToken("JoinTh", [JoinH]);
export const JoinV = wordToken("JoinV");
export const JoinX = wordToken("JoinX");

export const Z = wordToken("Z");
export const D = wordToken("D");
export const B = wordToken("B");
export const V = wordToken("V");
export const VPlain = wordToken("VPlain", [V]);
/**
 * A verb right after another verb or a `/v/` join, past only the `/h/`, `/d/` and `/b/` words of its own item: it goes on
 * a verb list, so it never starts one (join-across-roles.md#vp-clause-forms). Set by `markContext`.
 */
export const VCont = wordToken("VCont", [V]);
/**
 * A verb (`VPlain` or `VCont`) or a `/v/` join word by what comes after it, past the item words of a verb list's item:
 * another verb (`…More`: the verb list goes on, so those words are that verb's item), or anything else (`…End`). Every
 * verb and `/v/` join gets one of these leaf types. Set by `markContext`.
 */
export const VPlainEnd = wordToken("VPlainEnd", [VPlain]);
export const VPlainMore = wordToken("VPlainMore", [VPlain]);
export const VContEnd = wordToken("VContEnd", [VCont]);
export const VContMore = wordToken("VContMore", [VCont]);
export const JoinVEnd = wordToken("JoinVEnd", [JoinV]);
export const JoinVMore = wordToken("JoinVMore", [JoinV]);
/** A `/ɡ/` word: a plain adjective describes what is before it; a `gl-` adjective leans on the noun or call after it (clause.md#left-bound-adjectives). */
export const G = wordToken("G");
export const GPlain = wordToken("GPlain", [G]);
/** A plain adjective a noun list's join may share (joins.md#shared-after-the-join): not one that starts a respectively list. */
export const GShareable = wordToken("GShareable");
/**
 * A plain adjective by the run it sits in (set by `markContext`): one that a `/ɡ/` join closes (`GInList`), one that
 * `wazem` and a `/ɡ/` join close (`GInRespList`, joins.md#respectively), or any other (`GAdj`). Where a plain adjective
 * describes the word before it, it does so whatever its run.
 */
export const GAdj = wordToken("GAdj", [GPlain, GShareable]);
export const GInList = wordToken("GInList", [GPlain, GShareable]);
export const GInRespList = wordToken("GInRespList", [GPlain]);
export const GGl = wordToken("GGl", [G]);
/**
 * A `gl-` adjective by what it leans on: the noun (by slot), call or reaction, citation, or topic word after it, past its
 * own hosted `/b/` and what describes that `/b/`. Set by `markContext`.
 */
export const GL_TARGETS = ["Z", "D", "B", "Turn", "Citation", "Linker", "Other"] as const;
export type GlTarget = (typeof GL_TARGETS)[number];
export const GGlBefore = Object.fromEntries(GL_TARGETS.map((target) => [target, wordToken(`GGl${target}`, [GGl])])) as Record<GlTarget, AgazanTokenType>;
/** A `/w/` word. An as-of `/w/` opens a pair with the `/b/` after it (relations.md#as-of); every other `/w/` grades what follows. */
export const W = wordToken("W");
export const WPlain = wordToken("WPlain", [W]);
export const WAsOf = wordToken("WAsOf", [W]);
/** Respectively `wazem`: right before a join word, it pairs the list item by item with an earlier one (joins.md#respectively). */
export const WPairing = wordToken("WPairing", [W]);
/**
 * What a `/w/` word grades: the word after its `/w/` run (past an as-of pair's `/b/`). Each `/w/` gets one leaf type
 * per kind and target (`WPlainH`, a plain `/w/` before an adverb), a member of its kind (`WPlain`) and of its target
 * (`WBefore.H`), so a rule takes exactly the `/w/` words that grade its head. A rule whose head is one of several
 * targets takes a group (`WBefore.G`: any plain adjective; `WGroup.Plain.G`: a plain `/w/` before one). Set by `markContext`.
 */
export const W_TARGETS = [
  "Turn",
  "HookPlain",
  "HookHosting",
  "JoinZ",
  "JoinD",
  "JoinB",
  "JoinV",
  "JoinG",
  "HList",
  "HLone",
  "Bar",
  "HScale",
  "HSharedV",
  "GAdj",
  "GInList",
  "GInRespList",
  "GlZ",
  "GlD",
  "GlB",
  "GlTurn",
  "GlCitation",
  "Other",
] as const;
export type WTarget = (typeof W_TARGETS)[number];
/** Targets a rule takes together: any plain adjective, one a noun join may share, or any hook. */
export const W_GROUPS = {
  G: ["GAdj", "GInList", "GInRespList"],
  Shareable: ["GAdj", "GInList"],
  Hook: ["HookPlain", "HookHosting"],
} as const satisfies Record<string, readonly WTarget[]>;
export type WGroupName = keyof typeof W_GROUPS;
const W_KINDS = { Plain: WPlain, AsOf: WAsOf, Pairing: WPairing } as const;
export type WKind = keyof typeof W_KINDS;
const wGroupsOf = (target: WTarget) => (Object.keys(W_GROUPS) as WGroupName[]).filter((group) => (W_GROUPS[group] as readonly WTarget[]).includes(target));
export const WBefore = {
  ...Object.fromEntries((Object.keys(W_GROUPS) as WGroupName[]).map((group) => [group, wordToken(`WBefore${group}`)])),
  ...Object.fromEntries(W_TARGETS.map((target) => [target, wordToken(`WBefore${target}`)])),
} as Record<WTarget | WGroupName, AgazanTokenType>;
for (const target of W_TARGETS) for (const group of wGroupsOf(target)) WBefore[target]!.CATEGORIES!.push(WBefore[group]!);
/** A kind's `/w/` words before any target of a group (`WGroup.Plain.G`). */
export const WGroup = Object.fromEntries(
  Object.keys(W_KINDS).map((kind) => [
    kind,
    Object.fromEntries((Object.keys(W_GROUPS) as WGroupName[]).map((group) => [group, wordToken(`W${kind}${group}`)])),
  ]),
) as Record<WKind, Record<WGroupName, AgazanTokenType>>;
export const WLeaf = Object.fromEntries(
  (Object.entries(W_KINDS) as [WKind, AgazanTokenType][]).map(([kind, category]) => [
    kind,
    Object.fromEntries(
      W_TARGETS.map((target) => [
        target,
        wordToken(`W${kind}${target}`, [category, WBefore[target]!, ...wGroupsOf(target).map((group) => WGroup[kind][group])]),
      ]),
    ),
  ]),
) as Record<WKind, Record<WTarget, AgazanTokenType>>;
/** An `/h/` adverb or a `/th/` stance word. A plain adjective after either host's `/b/` describes that noun (clause.md#complex-chaining). */
export const H = wordToken("H");
export const HPlain = wordToken("HPlain", [H]);
export const HTh = wordToken("HTh", [H]);
/**
 * An `/h/` or `/th/` word by its run (set by `markContext`): one that an `/h/` join closes, past the adverbs after it
 * (`HList`: an item of that list), or any other (`HLone`: a unit of its own). A list takes every adverb right before
 * its join (joins.md#right-close).
 */
export const HList = wordToken("HList");
export const HLone = wordToken("HLone");
export const HPlainList = wordToken("HPlainList", [HPlain, HList]);
export const HPlainLone = wordToken("HPlainLone", [HPlain, HLone]);
export const HThList = wordToken("HThList", [HTh, HList]);
export const HThLone = wordToken("HThLone", [HTh, HLone]);
/**
 * A `/b/` right after an `/h/`, `/th/` or `/ɡ/` word: it completes that word (clause.md § extra nouns), so it is never a
 * `/b/` phrase of its own. Likewise a stand-in right after an `/h/` or `/th/` word. Set by `markContext`.
 */
export const HostedB = wordToken("HostedB");
/** A hosted `/b/` number: an offset or amount, which no adjective describes. */
export const HostedBNumber = wordToken("HostedBNumber", [HostedB]);
export const HostedBNoun = wordToken("HostedBNoun", [HostedB]);
/** A hosted `/b/` whose `/b/` words run on to a `/b/` join: the list fills the hosted slot (joins.md#right-close). */
export const HostedBJoined = wordToken("HostedBJoined", [HostedB]);
export const HostedOdo = wordToken("HostedOdo");
/** An `/h/` adverb right after a `/v/` join (past any `/w/`): SHARED, it covers every verb (join-across-roles.md#vp-clause-forms). Set by `markContext`. */
export const HSharedV = wordToken("HSharedV");
/**
 * `barl` that fills a `/th/` host from further right, so it is never a `/b/` stand-in of its own: after a stance join
 * that closes a pole with no `/b/` (join-across-roles.md#stance-join-before-barl), or after a channel's offset
 * (knowing.md#evidence-clause). Set by `markContext`.
 */
export const LateOdo = wordToken("LateOdo");
/** A cardinal `/ɡ/` number right after a hosted `/b/`: that unit's amount (numbers-applied.md#measure-phrases). Set by `markContext`. */
export const Amount = wordToken("Amount");
/** A signed `/h/` number right after an equative's shared scale: the factor (comparatives.md#factor). Set by `markContext`. */
export const Factor = wordToken("Factor");
/**
 * The scale a rank, equative or sequence noun join shares (comparatives.md#manner-scale): an `/h/` or `/th/` word right
 * after the join (past any `/w/`), or a digitless `/b/` number right after it. Set by `markContext`; neither is an
 * adverb or a noun of its own there.
 */
export const HScale = wordToken("HScale");
/** A `/th/` stance right after *contrary to* `uem`: the hook's frame, not a stance on the claim (sakes.md#contrary-to-stance). Set by `markContext`. */
export const HFrame = wordToken("HFrame");
export const BScale = wordToken("BScale");
/** A `/th/` stance word that is a rank fence's bar: it runs up to the list's rank join (comparatives.md#bars). Set by `markContext`. */
export const Bar = wordToken("Bar");
export const BarPlain = wordToken("BarPlain", [Bar]);
/** The first bar right after a closed `ua` fence: the whole fence is its ranked item (comparatives.md § every bar). Set by `markContext`. */
export const FenceBar = wordToken("FenceBar", [Bar]);
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
/**
 * A noun-phrase stand-in by its run (set by `markContext`): an item of a list when the items after it reach that list's
 * join (`zarl zodogal zam`), or a phrase of its own, which ends the main clause (`zarl vowogal.`).
 */
export const OdoZList = wordToken("OdoZList", [OdoZ]);
export const OdoZLone = wordToken("OdoZLone", [OdoZ]);
export const OdoDList = wordToken("OdoDList", [OdoD]);
export const OdoDLone = wordToken("OdoDLone", [OdoD]);
export const OdoBList = wordToken("OdoBList", [OdoB]);
export const OdoBLone = wordToken("OdoBLone", [OdoB]);
export const OdoOther = wordToken("OdoOther", [Odo]);
export const Force = wordToken("Force");
export const Polar = wordToken("Polar");
export const Vocative = wordToken("Vocative");
export const Interjection = wordToken("Interjection");
export const Linker = wordToken("Linker");
export const Hook = wordToken("Hook");
/** A hook with no `/b/` word (or frame) right after it: at the front of a sentence, glue (hooks.md#discourse-hooks). */
export const HookPlain = wordToken("HookPlain", [Hook]);
/** A hook with a `/b/` word right after it (an extra noun, hooks.md#extra-noun), or `uem` with its frame. Set by `markContext`. */
export const HookHosting = wordToken("HookHosting", [Hook]);
/**
 * A hook and its `/b/` right before a noun list's join word (or its bar), after a noun of that list's slot: it belongs
 * to that last item (joins.md#shared-after-the-join), so no hook unit takes it. Set by `markContext`.
 */
export const ItemHook = wordToken("ItemHook", [Hook]);
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
  JoinHPlain,
  JoinTh,
  JoinV,
  JoinX,
  Z,
  D,
  B,
  V,
  VPlain,
  VCont,
  VPlainEnd,
  VPlainMore,
  VContEnd,
  VContMore,
  JoinVEnd,
  JoinVMore,
  G,
  GPlain,
  GShareable,
  GAdj,
  GInList,
  GInRespList,
  GGl,
  ...Object.values(GGlBefore),
  W,
  WPlain,
  WAsOf,
  WPairing,
  ...Object.values(WBefore),
  ...Object.values(WGroup).flatMap((byGroup) => Object.values(byGroup)),
  ...Object.values(WLeaf).flatMap((byTarget) => Object.values(byTarget)),
  H,
  HPlain,
  HTh,
  HList,
  HLone,
  HPlainList,
  HPlainLone,
  HThList,
  HThLone,
  HostedB,
  HostedBNumber,
  HostedBNoun,
  HostedBJoined,
  HostedOdo,
  HSharedV,
  LateOdo,
  Amount,
  Factor,
  HScale,
  HFrame,
  BScale,
  Bar,
  BarPlain,
  FenceBar,
  Citation,
  TagZ,
  TagD,
  TagB,
  Odo,
  OdoZ,
  OdoD,
  OdoB,
  OdoZList,
  OdoZLone,
  OdoDList,
  OdoDLone,
  OdoBList,
  OdoBLone,
  OdoOther,
  Force,
  Polar,
  Vocative,
  Interjection,
  Linker,
  Hook,
  HookPlain,
  HookHosting,
  ItemHook,
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
  h: JoinHPlain,
  th: JoinTh,
  v: JoinV,
  x: JoinX,
} as const;

const CONTENT_BY_POS = {
  z: Z,
  d: D,
  b: B,
  v: VPlain,
  g: GPlain,
  w: WPlain,
  h: HPlain,
  th: HTh,
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

  if (family.kind === "hook") return { type: HookPlain, branch: "hook" };
  // A written span fills its PoS slot: `d[…]` / `z[…]` / `b[…]` are NP heads; `v[…]`, `th(…)`, … take the V / H / … slot.
  if (family.kind === "writingSpan") {
    // Under `/y/`: a named span (`y@<Sam>`) calls someone; any other span is the reaction itself.
    if (pos === "y") {
      return family.marks.includes("@") ? { type: Vocative, branch: "yVocative" } : { type: Interjection, branch: "yInterjection" };
    }
    if (pos === "x") return { type: Linker, branch: "linker" };
    if (pos === "g" && word.gl) return { type: GGl, branch: "writingSpanSlot" };
    if (pos && pos !== "z" && pos !== "d" && pos !== "b" && pos in CONTENT_BY_POS) {
      return { type: CONTENT_BY_POS[pos as keyof typeof CONTENT_BY_POS], branch: "writingSpanSlot" };
    }
    return { type: (pos && WRITING_SPAN_BY_POS[pos]) || WritingSpan, branch: "writingSpan" };
  }

  if (isStandIn(word)) return { type: (pos && ODO_BY_POS[pos]) || OdoOther, branch: "standIn" };

  if (family.kind === "joinMarker" && reading === "join" && pos && pos in JOIN_BY_POS) {
    return { type: JOIN_BY_POS[pos as keyof typeof JOIN_BY_POS], branch: "join" };
  }

  if (reading === "joinAct") return { type: VPlain, branch: "joinAct" };
  if (reading === "joinRelation") {
    if (pos === "g") return { type: word.gl ? GGl : GPlain, branch: "joinRelationG" };
    if (pos === "h" || pos === "th") return { type: pos === "th" ? HTh : HPlain, branch: "joinRelationH" };
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
  if (pos === "w" && word.overlay?.kind === "pairing") return { type: WPairing, branch: "content" };
  const tag = family.kind === "tag" && word.ending === "l" && !word.plural && pos ? TAG_BY_POS[pos] : undefined;
  if (tag) return { type: tag, branch: "tagAssign" };
  if (pos === "g" && word.gl) return { type: GGl, branch: "content" };
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
