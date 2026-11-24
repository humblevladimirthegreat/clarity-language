/** Before parsing: `markContext` retypes tokens by what comes after them, with the lookahead and word tests it uses. */

import type { IToken, TokenType } from "chevrotain";
import {
  B,
  D,
  G,
  GGl,
  GGlBefore,
  type GlTarget,
  GPlain,
  GAdj,
  GInList,
  GInRespList,
  H,
  HostedB,
  HostedBNoun,
  HostedBNumber,
  HostedBJoined,
  HostedOdo,
  HSharedV,
  LateOdo,
  HPlain,
  HTh,
  HList,
  HLone,
  HPlainList,
  HPlainLone,
  HThList,
  HThLone,
  Amount,
  Factor,
  HScale,
  HZone,
  HZoneHeld,
  BScale,
  Bar,
  BarPlain,
  FenceBar,
  Citation,
  TagB,
  TagD,
  JoinB,
  JoinD,
  JoinG,
  JoinH,
  JoinTh,
  JoinV,
  JoinZ,
  Linker,
  Odo,
  OdoB,
  OdoD,
  OdoZ,
  Hook,
  HookHosting,
  HookPlain,
  ItemHook,
  SameRolePair,
  V,
  VCont,
  VPlainEnd,
  VPlainMore,
  VContEnd,
  VContMore,
  JoinVEnd,
  JoinVMore,
  Vocative,
  Interjection,
  W,
  WAsOf,
  WPairing,
  WritingSpanB,
  WritingSpanD,
  WritingSpanZ,
  WLeaf,
  type WTarget,
  Z,
} from "./tokens.js";
import { BAR_SERIES, isScaleStem, RANK_SERIES } from "./series.js";
import type { LexWord, NumberMarker } from "./types.js";
import { NP_HEAD, NP_JOIN, NP_SLOTS, tokenIs, type NpSlot } from "./sentence-shapes.js";

/** A label-reach verb that names a pair or a situation hosts the `/b/` right after it (label-seams.md#reach-relative). */
function isScopeThoVerb(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  const v = family?.kind === "x" && family.xFamily === "scope" ? family.stanceVowel : undefined;
  return tokenIs(token, V) && (v === "e" || v === "ae" || v === "ue");
}

function joinSeries(token: IToken): string {
  const family = (token.payload as LexWord | undefined)?.family;
  return family?.kind === "joinMarker" ? family.series : "";
}

function isStanceWord(token: IToken): boolean {
  return tokenIs(token, HTh);
}

/** A holder seam word (`thunemazawan`): whose view it is (holder.md#naming-a-holder). */
function isHolderWord(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return family?.kind === "x" && family.xFamily === "holder";
}

/** A `/th/` WANT, PLAN or DECISION word (want-and-decide.md#whose-intention). */
function isIntentionStance(token: IToken): boolean {
  const word = token.payload as LexWord | undefined;
  const kind = word?.overlay?.kind;
  return tokenIs(token, HTh) && word?.pos === "th" && (kind === "want" || kind === "plan" || kind === "decision");
}

/** `uom` *contrary to*: a `/th/` stance right after it is its opposing zone (contrary-to.md#contrary-to-stance). */
function isZoneHook(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return tokenIs(token, Hook) && family?.kind === "hook" && family.form === "uom";
}


/**
 * A `/th/` stance word right before a closed or open rank join of a noun list (`zol` / `zuol` / `zoel`, -l or -m) is that
 * fence's bar (comparatives.md § bars), after the list's items. Its hosted tail (`/b/`, a `/b/` join, an offset amount,
 * `barl`) may sit between; so may a second stance word, which enforce rejects.
 */
function barTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  if (!isStanceWord(tokens[at]!)) return undefined;
  // The list the bar sits in: the item before it (past what describes the item, or an earlier bar), or a closed fence.
  let before = at - 1;
  let afterBar = false;
  for (; before >= 0; before -= 1) {
    const tok = tokens[before]!;
    // An item hook (`em bamun`) rides on the item before it.
    if (tok.tokenType === B && tokens[before - 1] && tokenIs(tokens[before - 1]!, Hook)) before -= 1;
    else if (isStanceWord(tok)) afterBar = true;
    else if (!tokenIs(tok, W, G, HostedB, HostedOdo)) break;
  }
  const prev = tokens[before];
  const level = prev && NP_SLOTS.find((slot) => tokenIs(prev, NP_JOIN[slot], ...Object.values(NP_HEAD[slot])));
  if (!level) return undefined;
  // After a closed fence, only a universal `ua` fence is ranked as one item (comparatives.md § every bar).
  const fence = prev.tokenType === NP_JOIN[level];
  if (fence && joinSeries(prev) !== "ua") return undefined;
  // After the bar's `/b/`, a plain adjective describes that noun (*than tired learners*, clause.md § complex chaining).
  let bound = false;
  for (let i = at; i < tokens.length; i++) {
    const tok = tokens[i]!;
    if (tok.tokenType === NP_JOIN[level]) {
      const ending = (tok.payload as LexWord | undefined)?.ending;
      if (!BAR_SERIES.has(joinSeries(tok)) || (ending !== "l" && ending !== "m")) return undefined;
      // The first bar after the fence; a later one follows a bar like any other.
      return fence && !afterBar ? FenceBar : BarPlain;
    }
    const payload = tok.payload as LexWord | undefined;
    const number = payload?.family?.kind === "number";
    const landmarkAdj = bound && tokenIs(tok, GPlain);
    if (!(isStanceWord(tok) || tokenIs(tok, W, B, HostedB, JoinB, Odo, HostedOdo, LateOdo, Amount) || (tokenIs(tok, G) && number) || landmarkAdj)) return undefined;
    if (tokenIs(tok, HostedB)) bound = true;
  }
  return undefined;
}

/** Hosted `/b/` continues as a join: zero or more further `/b/` words, then a `/b/` join word. */
/** A digit `/h/` number with a `+` / `-` marker: the ratio after an equative scale. */
/** A digitless `+` number token (`/ɡ/`, `/h/` or `/b/`): the scale after a rank join (comparatives.md § amount / frequency / time scale). */
function scaleNumberAhead(tok: IToken): boolean {
  if (!tokenIs(tok, G, H, B, HScale, BScale)) return false;
  const word = tok.payload as LexWord;
  if (word.family.kind !== "number") return false;
  return isScaleStem(word.family.stem);
}

function factorAhead(tok: IToken): boolean {
  if (!tokenIs(tok, H)) return false;
  const word = tok.payload as LexWord;
  if (word.family.kind !== "number") return false;
  const stem = word.family.stem;
  return (stem.marker === "+" || stem.marker === "-") && stem.groups.length > 0;
}

/** A place in a series (`#` from the start, `#-` from the end), including kin generations. */
function isOrdinalMarker(marker: NumberMarker): boolean {
  return marker === "#" || marker === "ro" || marker === "#-" || marker === "ruo";
}

function isLabelMarker(marker: NumberMarker): boolean {
  return marker === "_" || marker === "re" || marker === "#_" || marker === "roe";
}

/**
 * Give words the token their neighbors decide. A word that completes the word right before it (clause.md § extra
 * nouns): a `bl-` word after an `/h/`, `/th/` or `/ɡ/` word, a hooked join (hooked-joins.md#hooked-joins), or a label-reach
 * verb that names a pair (label-seams.md#reach-relative), becomes {@link HostedB}, and a `bl-` stand-in after an `/h/` or `/th/` word
 * {@link HostedOdo}. A plain `/b/` there stays the verb's recipient.
 * A cardinal `/ɡ/` right after a hosted `/b/` is that unit's {@link Amount}, and a signed `/h/` number after an
 * equative's shared scale its {@link Factor}. An `/h/` or digitless `/b/` number right after a rank noun join is its
 * shared scale ({@link HScale}, {@link BScale}), and a stance right after `uom` its zone ({@link HZone}). Neither has a `/b/` slot, so a `/b/` after one fails to parse (`slotlessHost`).
 * A stance word that is a rank fence's bar becomes {@link Bar}, or {@link FenceBar} as the first bar after a closed `ua` fence.
 */
export function markContext(tokens: IToken[]): IToken[] {
  return CONTEXT_PASSES.reduce((current, pass) => pass.run(current), tokens);
}

/** One step of {@link markContext}: a name for reports (`npm run context-report`) and the retyping it does. */
export type ContextPass = { name: string; run: (tokens: IToken[]) => IToken[] };

function retype(token: IToken, type: TokenType | undefined): IToken {
  return type ? { ...token, tokenType: type, tokenTypeIdx: type.tokenTypeIdx! } : token;
}

/** A pass that retypes each token from the whole list as the previous pass left it. */
function eachToken(typeAt: (tokens: IToken[], at: number) => TokenType | undefined): ContextPass["run"] {
  return (tokens) => tokens.map((token, i) => retype(token, typeAt(tokens, i)));
}

/** The passes of {@link markContext}, in order; each reads the tokens as the passes before it left them. */
export const CONTEXT_PASSES: readonly ContextPass[] = [
  { name: "sameRolePair", run: eachToken((tokens, i) => (isSameRolePairAt(tokens, i) ? SameRolePair : undefined)) },
  {
    // Left to right: a word sees the words before it as this pass already retyped them.
    name: "hosted",
    run: (tokens) => {
      const out: IToken[] = [];
      for (const [i, token] of tokens.entries()) out.push(retype(token, hostedType(token, out, tokens.slice(i + 1))));
      return out;
    },
  },
  { name: "bar", run: eachToken(barTypeAt) },
  { name: "itemHook", run: eachToken((tokens, i) => (isItemHookAt(tokens, i) ? ItemHook : undefined)) },
  { name: "verbList", run: eachToken((tokens, i) => (tokenIs(tokens[i]!, V) && isVerbListAt(tokens.slice(0, i)) ? VCont : undefined)) },
  { name: "verbEnd", run: eachToken(verbTypeAt) },
  { name: "hRun", run: eachToken(hListTypeAt) },
  { name: "gRun", run: eachToken(gListTypeAt) },
  { name: "glLean", run: eachToken(glTypeAt) },
  { name: "standIn", run: eachToken(odoTypeAt) },
  { name: "wLeaf", run: eachToken(wTypeAt) },
];

/** Past a host's hosted `/b/` (the list that fills it) and its amount, from `next`. */
function skipHosted(tokens: IToken[], next: number): number {
  if (tokens[next]?.tokenType === HostedBJoined) {
    next += 1;
    while (tokens[next]?.tokenType === B) next += 1;
    if (tokens[next]?.tokenType === JoinB) next += 1;
  } else if (tokens[next] && tokenIs(tokens[next]!, HostedB)) next += 1;
  if (tokens[next]?.tokenType === Amount) next += 1;
  return next;
}

/** Past a run of `/w/` words, each as-of one with its `/b/`, from `next`. */
function skipW(tokens: IToken[], next: number): number {
  while (tokens[next] && tokenIs(tokens[next]!, W)) {
    const asOf = tokenIs(tokens[next]!, WAsOf);
    next += 1;
    if (asOf && tokens[next]?.tokenType === B) next += 1;
  }
  return next;
}

/**
 * An `/h/` or `/th/` word by its run ({@link HList}): the adverbs after it, each with its hosted `/b/`, the plain
 * adjectives that describe that `/b/`, and the `/w/` words before it, up to the first word that is none of these. An
 * `/h/` join there closes the run as a list.
 */
function hListTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  const token = tokens[at]!;
  if (token.tokenType !== HPlain && token.tokenType !== HTh) return undefined;
  let next = at;
  while (true) {
    // A noun `/b/` takes the plain adjectives after it, each with its own hosted `/b/` (longer-chains.md#complex-chaining).
    const landmark = tokens[next + 1]?.tokenType === HostedBNoun;
    next = skipHosted(tokens, next + 1);
    if (landmark) {
      for (let adj = skipW(tokens, next); tokens[adj] && tokenIs(tokens[adj]!, GPlain); adj = skipW(tokens, next)) next = skipHosted(tokens, adj + 1);
    }
    const head = skipW(tokens, next);
    if (tokens[head] && (tokens[head]!.tokenType === HPlain || tokens[head]!.tokenType === HTh)) {
      next = head;
      continue;
    }
    const list = !!tokens[head] && tokenIs(tokens[head]!, JoinH);
    if (token.tokenType === HTh) return list ? HThList : HThLone;
    return list ? HPlainList : HPlainLone;
  }
}

/**
 * A plain adjective by its run ({@link GAdj}): the adjectives after it, each with its hosted `/b/` (and the list that
 * fills it, and its amount) and the `/w/` words before it, up to the first word that is none of these. A `/ɡ/` join
 * there closes the run as a list, and `wazem` right before that join makes it a respectively list.
 */
function gListTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  if (!tokenIs(tokens[at]!, GPlain)) return undefined;
  let next = at;
  while (true) {
    next += 1;
    if (tokens[next]?.tokenType === HostedBJoined) {
      next += 1;
      while (tokens[next]?.tokenType === B) next += 1;
      if (tokens[next]?.tokenType === JoinB) next += 1;
    } else if (tokens[next] && tokenIs(tokens[next]!, HostedB)) next += 1;
    if (tokens[next]?.tokenType === Amount) next += 1;
    let head = next;
    while (tokens[head] && tokenIs(tokens[head]!, W)) {
      const asOf = tokenIs(tokens[head]!, WAsOf);
      head += 1;
      if (asOf && tokens[head]?.tokenType === B) head += 1;
    }
    if (tokens[head] && tokenIs(tokens[head]!, GPlain)) {
      next = head;
      continue;
    }
    if (tokens[head]?.tokenType !== JoinG) return GAdj;
    return head > next && tokenIs(tokens[head - 1]!, WPairing) ? GInRespList : GInList;
  }
}

/** Past a noun's plain adjectives (each with its hosted `/b/`) and the tag that names it, from `next`. */
function skipNpTail(tokens: IToken[], next: number, level: NpSlot): number {
  for (let adj = skipW(tokens, next); tokens[adj] && tokenIs(tokens[adj]!, GPlain); adj = skipW(tokens, next)) next = skipHosted(tokens, adj + 1);
  return tokens[next]?.tokenType === NP_HEAD[level].tag ? next + 1 : next;
}

/** Past one noun package of a slot from `next` (a `gl-` adjective, the head, what describes it), or `undefined`. */
function skipNpPackage(tokens: IToken[], next: number, level: NpSlot): number | undefined {
  const gl = skipW(tokens, next);
  if (tokens[gl]?.tokenType === GL_OF_SLOT[level]) {
    next = skipHosted(tokens, gl + 1);
    for (let adj = skipW(tokens, next); tokens[adj] && tokenIs(tokens[adj]!, GPlain); adj = skipW(tokens, next)) next = skipHosted(tokens, adj + 1);
  }
  const { noun, standIn, span } = NP_HEAD[level];
  if (!tokens[next] || !tokenIs(tokens[next]!, noun, standIn, span)) return undefined;
  return skipNpTail(tokens, next + 1, level);
}

const GL_OF_SLOT = { z: GGlBefore.Z, d: GGlBefore.D, b: GGlBefore.B } as const;

/**
 * A noun-phrase stand-in is an item of a list when the items after it reach that list's item hook, bar, or join
 * ({@link OdoZList}): `zarl zodogal zam` is one list. Any other ends its phrase ({@link OdoZLone}).
 */
function odoTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  const token = tokens[at]!;
  const level = NP_SLOTS.find((slot) => token.tokenType === NP_HEAD[slot].standIn);
  if (!level) return undefined;
  let next = skipNpTail(tokens, at + 1, level);
  for (let after = skipNpPackage(tokens, next, level); after !== undefined; after = skipNpPackage(tokens, next, level)) next = after;
  const head = tokens[skipW(tokens, next)];
  const list = tokens[next]?.tokenType === ItemHook || (!!head && tokenIs(head, NP_JOIN[level], Bar));
  return list ? NP_HEAD[level].standInList : NP_HEAD[level].standInLone;
}

/** The word a `gl-` adjective leans on, by token type ({@link GGlBefore}). */
const GL_TARGET_HEADS: [GlTarget, TokenType[]][] = [
  ["Z", [Z, OdoZ, WritingSpanZ]],
  ["D", [D, OdoD, WritingSpanD]],
  ["B", [B, OdoB, WritingSpanB]],
  ["Turn", [Vocative, Interjection]],
  ["Citation", [Citation]],
  ["Linker", [Linker]],
];

/**
 * A `gl-` adjective leans on the word after it (left-bound-adjectives.md#left-bound-adjectives), past its own hosted `/b/` (with the
 * list that fills it and its amount) and the plain adjectives that describe that `/b/` (`glugol bazawan gugol zodogal`).
 */
function glTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  if (!tokenIs(tokens[at]!, GGl)) return undefined;
  let next = at + 1;
  while (tokens[next] && tokenIs(tokens[next]!, W, GPlain, HostedB, Amount)) {
    const joined = tokens[next]!.tokenType === HostedBJoined;
    next += 1;
    if (!joined) continue;
    while (tokens[next]?.tokenType === B) next += 1;
    if (tokens[next]?.tokenType === JoinB) next += 1;
  }
  const head = tokens[next];
  const target = (head && GL_TARGET_HEADS.find(([, types]) => tokenIs(head, ...types))?.[0]) ?? "Other";
  return GGlBefore[target];
}

/** The head each `/w/` target names: the word right after the `/w/` run. */
const W_TARGET_HEADS: [WTarget, TokenType[]][] = [
  ["Turn", [Vocative, Interjection]],
  ["HookPlain", [HookPlain]],
  ["HookHosting", [HookHosting]],
  ["JoinZ", [JoinZ]],
  ["JoinD", [JoinD]],
  ["JoinB", [JoinB]],
  ["JoinV", [JoinV]],
  ["JoinG", [JoinG]],
  ["HList", [HList]],
  ["HLone", [HLone]],
  ["Bar", [Bar]],
  ["HScale", [HScale]],
  ["HSharedV", [HSharedV]],
  ["GAdj", [GAdj]],
  ["GInList", [GInList]],
  ["GInRespList", [GInRespList]],
  ["GlZ", [GGlBefore.Z]],
  ["GlD", [GGlBefore.D]],
  ["GlB", [GGlBefore.B]],
  ["GlTurn", [GGlBefore.Turn]],
  ["GlCitation", [GGlBefore.Citation]],
];

/**
 * A `/w/` word grades the word after its run (past an as-of pair's `/b/`), so its type names that word ({@link WLeaf}):
 * the grammar then knows at the first `/w/` which word the run belongs to.
 */
function wTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  const token = tokens[at]!;
  if (!tokenIs(token, W)) return undefined;
  let next = at;
  while (tokens[next] && tokenIs(tokens[next]!, W)) {
    const asOf = tokenIs(tokens[next]!, WAsOf);
    next += 1;
    if (asOf && tokens[next]?.tokenType === B) next += 1;
  }
  const head = tokens[next];
  const target = (head && W_TARGET_HEADS.find(([, types]) => tokenIs(head, ...types))?.[0]) ?? "Other";
  const kind = tokenIs(token, WAsOf) ? "AsOf" : tokenIs(token, WPairing) ? "Pairing" : "Plain";
  return WLeaf[kind][target];
}

/** A fill-ask blank of a noun or verb: a `/z/`, `/d/` or `/v/` join word on **-r** (questions.md#fill-ask). */
const PAIR_BLANKS = [JoinZ, JoinD, JoinV];

/** A same-role word right before a blank ({@link SameRolePair}): `abam zar`. */
function isSameRolePairAt(tokens: IToken[], at: number): boolean {
  const word = tokens[at]?.payload as LexWord | undefined;
  if (word?.reading !== "sameRole" || !tokenIs(tokens[at]!, HookPlain)) return false;
  const next = tokens[at + 1];
  const blank = next?.payload as LexWord | undefined;
  return !!next && tokenIs(next, ...PAIR_BLANKS) && blank?.ending === "r";
}

/**
 * A hook and its `/b/` right before a noun list's join word, or before its bar, after a noun of that slot and what
 * describes it: the hook belongs to that last item (list-structure.md#shared-after-the-join), not to the clause.
 */
function isItemHookAt(tokens: IToken[], at: number): boolean {
  if (!tokenIs(tokens[at]!, Hook) || tokens[at + 1]?.tokenType !== B) return false;
  let item = at - 1;
  while (item >= 0 && tokenIs(tokens[item]!, GPlain, HostedB, Amount, W)) item -= 1;
  const head = tokens[item];
  const level = head && NP_SLOTS.find((slot) => tokenIs(head, ...Object.values(NP_HEAD[slot])));
  if (!level || tokenIs(tokens[at - 1]!, W)) return false;
  let next = at + 2;
  while (tokens[next] && tokenIs(tokens[next]!, W)) next += 1;
  return !!tokens[next] && tokenIs(tokens[next]!, NP_JOIN[level], Bar);
}

function hostedType(token: IToken, before: IToken[], after: IToken[]): TokenType | undefined {
  if (tokenIs(token, Hook)) return hostsAhead(token, after) ? HookHosting : undefined;
  const host = before.at(-1);
  if (!host) return undefined;
  if (isStanceWord(token) && isZoneHook(host)) return HZone;
  if (host.tokenType === HZone && isHolderWord(host) && isIntentionStance(token)) return HZoneHeld;
  if (tokenIs(token, H) && isRankNounJoin(before[skipWBack(before, before.length - 1)])) return HScale;
  if (token.tokenType === HPlain && before[skipWBack(before, before.length - 1)]?.tokenType === JoinV) return HSharedV;
  if (tokenIs(token, B) && isRankNounJoin(host) && scaleNumberAhead(token)) return BScale;
  const locked = !!(token.payload as LexWord | undefined)?.bl;
  // A hooked join's landmark: one `bl-` word, never a list (hooked-joins.md#hooked-joins). An `/h/` one hosts as any `/h/` word.
  if (locked && tokenIs(token, B, JoinB) && isHookedNounJoin(host)) {
    return (token.payload as LexWord | undefined)?.family.kind === "number" ? HostedBNumber : HostedBNoun;
  }
  // A `bl-` join blank (`hewom blar`, `thebam blar`) completes its host like a `bl-` noun.
  if (locked && tokenIs(token, B, JoinB) && (tokenIs(host, H, G, Amount, Factor, HScale, HSharedV, HZone) || isScopeThoVerb(host))) {
    if (!isScopeThoVerb(host) && joinClosesAhead(after)) return HostedBJoined;
    return (token.payload as LexWord | undefined)?.family.kind === "number" ? HostedBNumber : HostedBNoun;
  }
  // A `/z/` or `/d/` stand-in there is still read as hosted, so `standInHost` names the slip (`thahum blarl`).
  const lockable = locked || (token.payload as LexWord | undefined)?.pos !== "b";
  if (lockable && tokenIs(token, Odo) && tokenIs(host, H, Factor, HScale, HSharedV, HZone)) return HostedOdo;
  if (locked && token.tokenType === OdoB && isLateOdoAt(before)) return LateOdo;
  if (isAmountAt(token, before)) return Amount;
  if (isFactorAt(token, before)) return Factor;
  return undefined;
}

/**
 * The words a verb list's item may hold before its verb (verb-and-stance-joins.md#vp-clause-forms): its `/d/`, `/b/` and
 * `/h/` phrases and lists, with what describes them. A shared adverb after a `/v/` join is crossed too. A stand-in is
 * not: it ends the main clause, so a verb after it starts the next sentence (dependents.md#dependent-clauses).
 */
const VP_ITEM_MATERIAL = [
  D, B, WritingSpanD, WritingSpanB, TagD, TagB, JoinD, JoinB, ItemHook, HookHosting, Bar, HScale, BScale, Factor,
  H, JoinH, HSharedV, HostedB, Amount, G, W,
];

/** A verb or a `/v/` join before this point, past only item material: a verb here goes on that list ({@link VCont}). */
function isVerbListAt(before: IToken[]): boolean {
  let i = before.length - 1;
  while (before[i] && tokenIs(before[i]!, ...VP_ITEM_MATERIAL)) i -= 1;
  // A verb blank in a same-role pair (`abam var`) is a unit of its own, not a list's join.
  if (before[i - 1]?.tokenType === SameRolePair) return false;
  return !!before[i] && tokenIs(before[i]!, V, JoinV);
}

/** A verb or `/v/` join with another verb after it, past only item material, is `…More` ({@link VPlainMore}). */
function verbTypeAt(tokens: IToken[], at: number): TokenType | undefined {
  const token = tokens[at]!;
  if (!tokenIs(token, V, JoinV)) return undefined;
  let next = at + 1;
  while (tokens[next] && tokenIs(tokens[next]!, ...VP_ITEM_MATERIAL)) next += 1;
  const more = !!tokens[next] && tokenIs(tokens[next]!, V);
  if (tokenIs(token, JoinV)) return more ? JoinVMore : JoinVEnd;
  if (tokenIs(token, VCont)) return more ? VContMore : VContEnd;
  return more ? VPlainMore : VPlainEnd;
}

/** A `/b/` word right after the hook (an extra noun, hooks.md#extra-noun), or the stance `uom` holds as its zone. */
function hostsAhead(hook: IToken, after: IToken[]): boolean {
  const next = after[0];
  if (!next) return false;
  return tokenIs(next, B, JoinB, OdoB, TagB, WritingSpanB) || (isZoneHook(hook) && isStanceWord(next));
}

/** `/b/` words, then a `/b/` join: a list that takes the hosted `/b/` before it as its first item (joins.md#right-close). */
function joinClosesAhead(after: IToken[]): boolean {
  let i = 0;
  while (after[i]?.tokenType === B) i += 1;
  return after[i]?.tokenType === JoinB;
}

/**
 * `blarl` that fills a `/th/` host from further right: after a stance join that closes a hinge with no `/b/` yet
 * (verb-and-stance-joins.md#stance-join-before-barl), or after a channel's offset (evidentiality.md#evidence-clause).
 */
function isLateOdoAt(before: IToken[]): boolean {
  let i = before.length - 1;
  if (before[i]?.tokenType === JoinTh) return before[skipWBack(before, i - 1)]?.tokenType === HTh;
  if (before[i]?.tokenType === Amount) i -= 1;
  if (before[i]?.tokenType === JoinB) {
    i -= 1;
    while (before[i]?.tokenType === B) i -= 1;
  }
  const offset = before[i];
  const number = (offset?.payload as LexWord | undefined)?.family.kind === "number";
  return !!offset && tokenIs(offset, HostedBNumber, HostedBJoined) && number && !!before[i - 1] && tokenIs(before[i - 1]!, HTh, HZone);
}

/** A cardinal `/ɡ/` right after a hosted `/b/`, or after the join that fills that slot: the measure amount. */
function isAmountAt(token: IToken, before: IToken[]): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  if (!tokenIs(token, G) || family?.kind !== "number") return false;
  if (isOrdinalMarker(family.stem.marker) || isLabelMarker(family.stem.marker)) return false;
  let i = before.length - 1;
  if (before[i]?.tokenType === JoinB) {
    i -= 1;
    while (before[i]?.tokenType === B) i -= 1;
  }
  return !!before[i] && tokenIs(before[i]!, HostedB);
}

/** The index of the last token at or before `i` that is not a `/w/` word. */
function skipWBack(tokens: IToken[], i: number): number {
  while (i >= 0 && tokenIs(tokens[i]!, W)) i -= 1;
  return i;
}

/** A rank, equative or route join of a noun list: the word after it may be its shared scale (list-structure.md#shared-after-the-join). */
/** A `/z/`, `/d/` or `/b/` hooked join, which hosts its landmark (hooked-joins.md#hooked-joins). */
function isHookedNounJoin(token: IToken): boolean {
  const family = (token.payload as LexWord | undefined)?.family;
  return tokenIs(token, JoinZ, JoinD, JoinB) && family?.kind === "joinMarker" && !!family.hook;
}

function isRankNounJoin(token: IToken | undefined): boolean {
  return !!token && tokenIs(token, JoinZ, JoinD, JoinB) && RANK_SERIES.has(joinSeries(token));
}

/** A signed `/h/` number right after the scale an `oe` join shares (comparatives.md § factor). */
function isFactorAt(token: IToken, before: IToken[]): boolean {
  if (!factorAhead(token) || !before.at(-1) || !tokenIs(before.at(-1)!, G, H, B, HScale, BScale)) return false;
  let i = before.length - 2;
  while (i >= 0 && tokenIs(before[i]!, W)) i -= 1;
  const join = before[i];
  return !!join && tokenIs(join, JoinZ, JoinD, JoinB) && joinSeries(join) === "oe";
}
