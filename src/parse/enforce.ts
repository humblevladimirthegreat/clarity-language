/**
 * Rejections the grammar docs decide (docs/proposals/parser-strictness.md, phase 2).
 *
 * The grammar productions already refuse shapes no rule licenses; these checks
 * narrow the productions that do license a shape, where the condition depends on
 * the lexicon (poles, needs), on the clause as a whole, or on resolve. Each one
 * throws a {@link ConstructionError} that names the rule and the page teaching it.
 */
import type { IToken } from "chevrotain";

import type { ClassifyTables } from "./classify.js";
import { ARROW_ROOTS, isAsOfOverlay, isBarStance, isFrameStance, isGroundsChannel, isStandIn } from "./classify.js";
import { REJECTIONS, type RejectionId } from "./constructions.js";
import { isTopicCompound, isTopicSpan, linkerEnglish } from "./linkers.js";
import { CLOSED } from "../closed-roots.js";
import { isGenericPronoun, isTopicPronoun, ROLE_PRONOUN_ROOTS } from "./resolve.js";
import { parseHookCompoundCite } from "./hook-compounds.js";
import type { HookJob } from "./hook-jobs.js";
import { SentenceParseError } from "./sentence-parser.js";
import {
  Bang,
  classifyTokenBranch,
  IslandClose,
  IslandOpen,
  isLexWordPayload,
  Linker,
  Period,
  QMark,
  Tone,
  type TokenPayload,
} from "./tokens.js";
import { isScaleShared, isSharedGPackage, isSharedHUnit, visitResult, visitUnit, type AstNode, type Visitor } from "./ast-walk.js";
import { forcePairKind, KIND_SERIES, RANK_SERIES } from "./series.js";
import type {
  AnaphorBind,
  Clause,
  ClauseCoord,
  CoordShared,
  GCoord,
  GPackage,
  Hosted,
  HUnit,
  IslandUnit,
  LeftEdge,
  LexWord,
  NpCoord,
  NumberMarker,
  NumberStem,
  ParseResult,
  Unit,
  VpCoord,
} from "./types.js";

export class ConstructionError extends SentenceParseError {
  readonly rejection: RejectionId;
  readonly anchor: string;

  constructor(rejection: RejectionId, detail: string) {
    const entry = REJECTIONS[rejection];
    super(`${detail}: ${entry.summary} — ${entry.anchor}`);
    this.name = "ConstructionError";
    this.rejection = rejection;
    this.anchor = entry.anchor;
  }
}

const NO_PLURAL_POS = new Set(["w", "h", "th", "x"]);
const SAKE_POS = new Set(["g", "th", "w"]);
/** Label scope goes on content slots (predication.md#label-scope). */
const SCOPE_POS = new Set(["g", "z", "d", "b", "v", "h"]);
/** A role compound names a participant (roles.md#role-compounds); `/y/` takes it only as a call (-n / -r). */
const ROLE_COMPOUND_POS = new Set(["z", "d", "b", "g", "x", "y"]);
/** Ability goes on a verb or a property (intention.md#ability). */
const ABILITY_POS = new Set(["g", "v"]);

function series(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.series : undefined;
}

function isPole(word: LexWord): boolean {
  return word.overlay?.kind === "clause_pole";
}

const TONE_MARKS: Record<string, string> = {
  "!": "strong",
  "?": "unsure",
  "%": "joking",
  "&": "contrast",
  ";": "warm",
};

/** A stack is `! ? % & ;` in any order, each at most twice. Returns the mark names, or undefined. */
function toneStackNames(mark: string): string[] | undefined {
  const counts = new Map<string, number>();
  for (const char of mark) counts.set(char, (counts.get(char) ?? 0) + 1);
  const names: string[] = [];
  for (const [char, count] of counts) {
    const name = TONE_MARKS[char];
    if (!name || count > 2) return undefined;
    names.push(count === 2 ? `${name}2` : name);
  }
  return names;
}

/**
 * Tone-mark placement (speech-moves.md § tone marks). A mark is a valid mark
 * attached to a word, an island's opening `{`, or a span, or free-standing
 * before words of the same sentence. Returns the tokens without tone marks and
 * the `tone.*` constructions they used.
 */
export function enforceTones(tokens: IToken[]): { tokens: IToken[]; constructions: string[] } {
  const kept: IToken[] = [];
  const constructions = new Set<string>();
  tokens.forEach((token, i) => {
    if (token.tokenType !== Tone) {
      kept.push(token);
      return;
    }
    const { mark, attached } = token.payload as { mark: string; attached: boolean };
    const names = toneStackNames(mark);
    if (!names) throw new ConstructionError("toneStack", `"${mark}"`);
    const next = tokens[i + 1];
    let scope: string;
    if (!next || next.tokenType === Period || next.tokenType === QMark || next.tokenType === Bang) {
      throw new ConstructionError("toneTarget", `"${mark}" before ${next ? `"${next.image}"` : "the end"}`);
    } else if (!attached) {
      // Marks in a row are a stack even when spaced (`! ! zazawan`, `! !zazawan`).
      if (next.tokenType === Tone) throw new ConstructionError("toneStack", `"${mark} ${next.image}"`);
      scope = "rest";
    } else if (next.tokenType === IslandOpen) {
      scope = "island";
    } else if (next.tokenType === IslandClose) {
      throw new ConstructionError("toneTarget", `"${mark}" on a closing }`);
    } else if (isWritingSpan(next)) {
      scope = "span";
    } else if (next.tokenType === Tone) {
      throw new ConstructionError("toneStack", `"${mark}${next.image}"`);
    } else {
      scope = "word";
    }
    for (const name of names) constructions.add(`tone.mark.${name}`);
    if (names.length > 1) constructions.add("tone.mark.stack");
    constructions.add(`tone.scope.${scope}`);
  });
  return { tokens: kept, constructions: [...constructions] };
}

/** A written span fence (`d[…]`, `th(…)`, `@<Sam>`), one token. */
function isWritingSpan(token: IToken): boolean {
  return /[[({<]/.test(token.image);
}

/** Word- and slot-level checks over the token stream, before the sentence grammar runs. */
export function enforceTokens(tokens: IToken[], tables: ClassifyTables): void {
  tokens.forEach((token, i) => {
    if (token.tokenType === QMark || token.tokenType === Bang) {
      throw new ConstructionError("sentenceEndMark", `"${token.image}"`);
    }
    if (token.tokenType === Linker && i > 0 && tokens[i - 1]!.tokenType !== Linker) {
      const prev = tokens[i - 1]!;
      const prevWord = prev.payload as TokenPayload | undefined;
      // A linker opens a body: after a sentence end, or right after the turn cluster.
      const branch = prevWord && isLexWordPayload(prevWord) ? classifyTokenBranch(prevWord).branch : undefined;
      const opensBody =
        prev.image === "." ||
        branch === "force" ||
        branch === "polar" ||
        branch === "yVocative" ||
        branch === "yInterjection" ||
        branch === "greeting" ||
        branch === "hook" ||
        (prevWord && isLexWordPayload(prevWord) && prevWord.reading === "mention");
      if (!opensBody) throw new ConstructionError("linkerMidSentence", token.image);
    }
    const payload = token.payload as TokenPayload | undefined;
    if (!payload || !isLexWordPayload(payload)) return;
    enforceWord(payload, tables);
    enforceStackedHookR(payload, tokens, i);
  });
}

function tokenWord(token: IToken | undefined): LexWord | undefined {
  const payload = token?.payload as TokenPayload | undefined;
  return payload && isLexWordPayload(payload) ? payload : undefined;
}

/**
 * Which slots a span fence fills (spans.md § Outer slot): an aside only under `/th/`, a cite, mention or
 * opaque in a content slot (never `/th/`) or as an `/x/` topic word, and no span under `/w/`. An aside resume (`dexur`) may recast the aside into another slot.
 */
function enforceSpanSlot(word: LexWord): void {
  const family = word.family;
  if (family.kind !== "writingSpan" || word.pos === "y" || !word.pos) return;
  if (word.pos === "w") throw new ConstructionError("spanSlot", word.raw);
  if (word.pos === "x") {
    if (!isTopicSpan(word)) throw new ConstructionError("spanSlot", word.raw);
    return;
  }
  if ((family.bracket === "(") !== (word.pos === "th")) throw new ConstructionError("spanSlot", word.raw);
}

/** **-ln** and span `^@` name one thing a name applies to: a noun slot or a citation only (word-endings.md#name-instance--ln). */
function enforceNameInstance(word: LexWord): void {
  if (word.ending !== "ln") return;
  if (word.gl || (word.pos && !["z", "d", "b"].includes(word.pos))) throw new ConstructionError("nameInstanceSlot", word.raw);
  const roots = word.family.kind === "content" ? word.family.roots : [];
  if (roots.some((root) => ROLE_PRONOUN_ROOTS.has(root) || root === CLOSED.star || root === CLOSED.person)) {
    throw new ConstructionError("nameInstanceSlot", word.raw);
  }
}

/** Stacked join **-r** (`zuar` / `vaor` / `xuar` / `gaor`) has no reading outside the `/th/` fill-ask (join-across-roles.md § Standalone stance joins). */
function enforceStackedJoinR(word: LexWord): void {
  const family = word.family;
  if (family.kind !== "joinMarker" || word.ending !== "r" || family.series.length < 2) return;
  if (["z", "d", "b", "v", "x", "g"].includes(word.pos ?? "")) throw new ConstructionError("stackedJoinResume", word.raw);
}

/** A stand-in fills a `/z/` `/d/` `/b/` slot; `/v/` has the verbal dependents (dependents.md § Stand-in vowels). */
function enforceStandInRole(word: LexWord): void {
  const family = word.family;
  if (family.kind !== "joinMarker" || family.series.length !== 1 || !"aoeu".includes(family.series)) return;
  if (!["rl", "rm", "rth", "rn"].includes(word.ending ?? "")) return;
  if (["g", "h", "w", "th"].includes(word.pos ?? "")) throw new ConstructionError("standInRole", word.raw);
}

/** Stacked range hook **-r** (`oer` / `uar` / `uer`) is only a range member between same-role words (hooks.md § Ranges). Extra-noun `aor` / `aer` / `uor` point back. */
function enforceStackedHookR(word: LexWord, tokens: IToken[], i: number): void {
  if (word.family.kind !== "hook" || word.ending !== "r" || word.family.form.length < 3) return;
  if (["ao", "ae", "uo"].includes(word.family.form.slice(0, -1))) return;
  let j = i - 1;
  while (tokenWord(tokens[j])?.pos === "w") j -= 1;
  const prev = tokenWord(tokens[j]);
  const next = tokenWord(tokens[i + 1]);
  if (!prev?.pos || prev.pos !== next?.pos) throw new ConstructionError("stackedHookResume", word.raw);
}

/** Hook vowels with no reading in a placement: same-role `ao` / `ae` / `uo`, and discourse `oe` / `ua` / `uo` / `ue` (hooks.md). */
function enforceHookSlot(word: LexWord, job: HookJob | undefined): void {
  if (word.family.kind !== "hook") return;
  const vowels = word.family.form.slice(0, -1);
  if (job === "clause" && (vowels === "ao" || vowels === "ae" || vowels === "uo")) throw new ConstructionError("hookSameRoleStack", word.raw);
  if (job === "discourse" && word.ending === "r" && vowels.length > 1) throw new ConstructionError("hookDiscourseStack", word.raw);
  if (job === "discourse" && ["oe", "ua", "uo", "ue"].includes(vowels)) throw new ConstructionError("hookDiscourseStack", word.raw);
}

function isRespectively(word: LexWord): boolean {
  return word.overlay?.kind === "pairing";
}

/** A marked list is an and-list paired with another and-list of the same length (joins.md § Respectively). */
function enforceRespectively(units: Unit[]): void {
  const lists: { length: number; marker?: string; raw: string }[] = [];
  const coords: { parts: { items: unknown[]; join?: LexWord; joinModifiers?: LexWord[] }[] }[] = [];
  for (const unit of units) {
    if (unit.kind === "np") {
      coords.push(unit.coord);
      for (const part of unit.coord.parts) {
        for (const item of part.items) if (item.kind === "package" && item.package.adjCoord) coords.push(item.package.adjCoord);
      }
    } else if (unit.kind === "vp" || unit.kind === "gCoord") coords.push(unit.coord);
  }
  for (const coord of coords) {
    for (const part of coord.parts) {
      const joinModifiers = "joinModifiers" in part ? (part.joinModifiers ?? []) : [];
      for (const w of joinModifiers) {
        if (!isRespectively(w)) throw new ConstructionError("joinDetail", `${w.raw} ${part.join?.raw ?? ""}`.trim());
      }
      if (series(part.join) !== "a" || part.items.length < 2) {
        if (joinModifiers.length > 0) throw new ConstructionError("joinDetail", `${joinModifiers[0]!.raw} ${part.join?.raw ?? ""}`.trim());
        continue;
      }
      if (joinModifiers.length > 0 && part.join!.ending !== "l" && part.join!.ending !== "m") {
        throw new ConstructionError("joinDetail", `${joinModifiers[0]!.raw} ${part.join!.raw}`);
      }
      lists.push({ length: part.items.length, marker: joinModifiers[0]?.raw, raw: part.join!.raw });
    }
  }
  lists.forEach((list, i) => {
    if (!list.marker) return;
    if (!lists.some((other, j) => j !== i && other.length === list.length)) {
      throw new ConstructionError("respectivePartner", `${list.marker} ${list.raw}`);
    }
  });
}

function enforceWord(word: LexWord, tables: ClassifyTables): void {
  // A holder names people, so it takes -x like any noun (`thodumazawanx`, knowing.md#holder).
  const holder = word.family.kind === "x" && word.family.xFamily === "holder";
  // A topic word is a noun, so it takes -x like one (`xazawanx`, pronouns.md#topic-groups); a published linker does not.
  const topic = word.pos === "x" && (word.family.kind === "content" || isTopicCompound(word)) && !linkerEnglish(word);
  if (word.plural && word.pos && NO_PLURAL_POS.has(word.pos) && !holder && !topic) {
    throw new ConstructionError("pluralOnPos", word.raw);
  }
  const stemRoot = word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
  const nounish = word.pos === "z" || word.pos === "d" || word.pos === "b" || word.pos === "x";
  if (nounish && stemRoot === CLOSED.neutral && word.ending === "n") {
    if (word.plural) throw new ConstructionError("nonspecificPlural", word.raw);
    if (word.pos === "x") throw new ConstructionError("topicNonspecific", word.raw);
  }
  if (nounish && stemRoot === CLOSED.star && (word.ending === "r" || (word.ending === "n" && word.pos === "x"))) {
    throw new ConstructionError("topicOfTopic", word.raw);
  }
  if (word.family.kind === "tag") enforceTag(word);
  // The record and scroll roots are no channel: a record is REPORTED, a tale NOTIONAL (knowing.md#evidentiality).
  if (word.pos === "th" && (stemRoot === CLOSED.record || stemRoot === CLOSED.scroll) && word.ending !== "n") {
    throw new ConstructionError("retiredChannelRoot", word.raw);
  }
  if (word.pos === "th" && word.family.kind === "number") enforceStanceNumber(word, word.family.stem);
  if (word.pos === "w" && word.family.kind === "number") enforceDegreeNumber(word, word.family.stem);
  if (word.plural && isGenericPronoun(word)) throw new ConstructionError("genericPlural", word.raw);
  if (word.plural && word.family.kind === "number" && !isPluralLabel(word)) {
    throw new ConstructionError("numberPlural", word.raw);
  }
  if (word.plural && word.pos === "y" && classifyTokenBranch(word).branch === "yInterjection") {
    throw new ConstructionError("pluralInterjection", word.raw);
  }
  const family = word.family;
  // Under `/y/` only an opaque or cite span calls or reacts (spans.md#y-spans).
  if (word.pos === "y") {
    if (family.kind === "writingSpan" && family.bracket === "(") throw new ConstructionError("ySpanType", word.raw);
  }
  enforceSpanSlot(word);
  enforceNameInstance(word);
  enforceStackedJoinR(word);
  enforceStandInRole(word);
  if (family.kind === "x" && family.xFamily === "sake") {
    if (word.pos && !SAKE_POS.has(word.pos)) throw new ConstructionError("sakeSlot", word.raw);
    if (family.stanceVowel && family.stanceVowel.length > 1) throw new ConstructionError("sakeStackedVowel", word.raw);
    if (family.horizon && (family.stanceVowel === "e" || word.ending === "n")) {
      throw new ConstructionError("emotionTail", word.raw);
    }
    if (family.stanceVowel === "e" && word.pos && word.pos !== "th") throw new ConstructionError("prescriptionSlot", word.raw);
    if (word.ending === "n") throw new ConstructionError("sakeEnding", word.raw);
  }
  // A sake root + `th` + vowel + **-n** + tail is not a lateral; a sake word never takes **-n** (sakes.md#word-shape).
  if (family.kind === "x" && family.xFamily === "lateral" && family.leftRoots.some((root) => tables.sakeRoots.has(root))) {
    throw new ConstructionError("sakeEnding", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "scope") {
    if (word.pos && !SCOPE_POS.has(word.pos)) throw new ConstructionError("labelScopeSlot", word.raw);
    if (family.leftRoots.some((root) => ARROW_ROOTS.has(root))) throw new ConstructionError("labelScopeArrow", word.raw);
    if (word.ending === "n" && family.leftRoots.some((root) => ROLE_PRONOUN_ROOTS.has(root))) throw new ConstructionError("labelScopeStem", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "role" && !word.overlay) {
    const callEnding = word.ending === "n" || word.ending === "r";
    if (word.pos && (!ROLE_COMPOUND_POS.has(word.pos) || (word.pos === "y" && !callEnding))) {
      throw new ConstructionError("roleCompoundSlot", word.raw);
    }
    if (word.ending === "n" && (family.rightRoots ?? []).some((root) => ROLE_PRONOUN_ROOTS.has(root))) {
      throw new ConstructionError("roleCompoundStem", word.raw);
    }
    if (family.scopeVowel && word.pos && !SCOPE_POS.has(word.pos)) throw new ConstructionError("labelScopeSlot", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "ability" && word.reading === "ability" && word.pos) {
    const hostless = tables.hostlessAbilityRoot !== null && family.leftRoots[0] === tables.hostlessAbilityRoot;
    if (!ABILITY_POS.has(word.pos) && !hostless) throw new ConstructionError("abilitySlot", word.raw);
  }
}

/** The one plain-digit group of a stem (`#2`), else undefined: no exponent, decimal, percent or digitless exponent. */
function plainDigits(stem: NumberStem): number | undefined {
  const only = stem.groups[0];
  if (stem.groups.length !== 1 || stem.digitlessExp || !only || only.exponentDigits || only.exponentSign || only.decimal || only.percent) {
    return undefined;
  }
  return /^\d+$/.test(only.mantissa ?? "") ? Number(only.mantissa) : undefined;
}

const isMinus = (m: NumberMarker) => m === "-" || m === "ru";
const isRankMarker = (m: NumberMarker) => m === "#" || m === "re";

/** `/th/` + number (numbers.md § Number as stance): `+` likelihood, `_` source, `#N` Nth-hand from 2. */
function enforceStanceNumber(word: LexWord, stem: NumberStem): void {
  const { marker, groups } = stem;
  if (marker === "#-" || marker === "rue" || (isMinus(marker) && groups.length > 0)) {
    throw new ConstructionError("stanceNumber", word.raw);
  }
  if (!isRankMarker(marker)) return;
  const blank = word.ending === "r" && groups.length === 0 && !stem.digitlessExp;
  const depth = plainDigits(stem);
  if (!blank && (depth === undefined || depth < 2)) throw new ConstructionError("handDepth", word.raw);
}

/** `/w/` + number: the *how much?* blank, *barely* / *almost*, or an ordinal place on a scale (checked in a rank frame). */
function enforceDegreeNumber(word: LexWord, stem: NumberStem): void {
  const { marker, groups } = stem;
  const blank = word.ending === "r" && groups.length === 0 && !stem.digitlessExp;
  const hairs = groups.length === 0 && stem.digitlessExp === "e-" && (marker === "+" || marker === "ra" || isMinus(marker));
  if (blank || hairs) return;
  const place = isRankMarker(marker) ? plainDigits(stem) : undefined;
  if (place === undefined || place < 2) throw new ConstructionError("degreeNumber", word.raw);
}

/** A `/w/` ordinal (`wredul`) is a place on a scale: it needs a single-name `zel` / `zuel` frame (comparatives.md § superlatives). */
function isRankPlace(word: LexWord): boolean {
  return word.pos === "w" && word.family.kind === "number" && isRankMarker(word.family.stem.marker);
}

function enforceShared(join: LexWord | undefined, shared: CoordShared[]): void {
  const s = series(join);
  if (!s) return;
  for (const item of shared) {
    if (KIND_SERIES.has(s) && isSharedGPackage(item) && item.word.plural) {
      throw new ConstructionError("pluralKindAfterUniversal", `${join!.raw} ${item.word.raw}`);
    }
    if (RANK_SERIES.has(s) && isSharedHUnit(item) && !isScaleShared(item) && item.word.family.kind === "number") {
      throw new ConstructionError("rankJoinNumberManner", `${join!.raw} ${item.word.raw}`);
    }
  }
}

function enforceHostedStandIn(units: Unit[], index: number, unit: HUnit, tables: ClassifyTables): void {
  const hosted = unit.hosted!;
  const host = unit.word;
  const bound = hosted.grounds ?? hosted.bound;
  const s = series(bound);
  if (isGroundsChannel(host, tables)) {
    // Evidence clause (knowing.md#evidence-clause): `barl`, alone or after the offset; never a pole stack.
    if (bound.pos !== "b" || s !== "a") throw new ConstructionError("standInHost", `${host.raw} ${bound.raw}`);
    const prev = units[index - 1];
    if (prev?.kind === "h" && !prev.unit.hosted && isPole(prev.unit.word)) {
      throw new ConstructionError("poleStack", `${prev.unit.word.raw} ${host.raw}`);
    }
    return;
  }
  // A simile's model may be an event: `humum barl` + the next sentence (relations.md#similative).
  if (!hosted.grounds && host.overlay?.kind === "similative" && bound.pos === "b" && s === "a") return;
  if (hosted.grounds || !isPole(host)) throw new ConstructionError("standInHost", `${host.raw} ${bound.raw}`);
  const undoHost = host.overlay!.gloss === "so-that" || host.overlay!.gloss === "if";
  if (bound.pos !== "b" || !(s === "a" || (s === "u" && undoHost))) {
    throw new ConstructionError(s === "u" ? "standInHostUndo" : "standInHost", `${host.raw} ${bound.raw}`);
  }
  const prev = units[index - 1];
  if (prev?.kind === "h" && !prev.unit.hosted && isPole(prev.unit.word)) {
    const stack = `${prev.unit.word.overlay!.gloss} ${host.overlay!.gloss.replace(/^because\..*/, "because")}`;
    if (stack !== "only-if because" && stack !== "although if") {
      throw new ConstructionError("poleStack", `${prev.unit.word.raw} ${host.raw}`);
    }
  }
}

function hasVerb(units: Unit[]): boolean {
  return units.some((unit) => unit.kind === "vp" || (unit.kind === "island" && hasVerb(unit.island.units)));
}

/** `/z/` + `/d/` with no `/v/` (predication.md § existence); verbless fragments without a subject stay valid. */
function enforceVerbless(units: Unit[]): void {
  const has = (level: "z" | "d") => units.some((unit) => unit.kind === "np" && unit.coord.level === level);
  if (has("z") && has("d") && !hasVerb(units)) throw new ConstructionError("objectNeedsVerb", "/z/ and /d/ with no /v/");
}

/** `+` / `-` of a signed offset in a hosted `/b/` (digitless `brul`, or a measure amount); zero has no sign. */
function offsetSign(bound: LexWord | undefined, amount?: LexWord): "+" | "-" | undefined {
  const number = [bound, amount].find((w) => w?.family.kind === "number");
  if (!number || number.family.kind !== "number") return undefined;
  const { marker, groups } = number.family.stem;
  if (groups.length > 0 && groups.every((g) => /^(0+|(zo)+)$/.test(g.mantissa ?? "") && !g.exponentDigits)) return undefined;
  if (marker === "+" || marker === "ra") return "+";
  if (marker === "-" || marker === "ru") return "-";
  return undefined;
}

const TIME_POLES = new Set(["until", "by", "before", "after", "while"]);

function isTimePole(word: LexWord): boolean {
  return word.pos === "h" && word.overlay?.kind === "clause_pole" && TIME_POLES.has(word.overlay.gloss);
}

/** A `/th/` channel or PLAN: what licenses an offset from now (design-decisions D-10). */
function isWarrant(word: LexWord): boolean {
  return word.pos === "th" && (word.overlay?.kind === "evidential" || word.overlay?.kind === "plan");
}

/** MEMORY takes only an earlier offset, LIVE none, and PLAN only a later one (knowing.md#dated-channel). */
function enforceChannelSign(word: LexWord, hosted: HUnit["hosted"]): void {
  const sign = offsetSign(hosted?.bound, hosted?.amount);
  if (!sign || word.pos !== "th" || !word.overlay) return;
  const base = word.overlay.gloss.split(".")[0];
  const wrong =
    (word.overlay.kind === "evidential" && base === "MEMORY" && sign !== "-") ||
    (word.overlay.kind === "evidential" && base === "LIVE") ||
    (word.overlay.kind === "plan" && sign !== "+");
  if (wrong) throw new ConstructionError("channelOffsetSign", `${word.raw} ${hosted!.bound.raw}${hosted!.amount ? ` ${hosted!.amount.raw}` : ""}`);
}

/** A first-hand channel: LIVE or MEMORY, which no hand count can follow (knowing.md#hand-depth). */
function isFirstHandChannel(word: LexWord): boolean {
  if (word.pos !== "th" || word.overlay?.kind !== "evidential") return false;
  const base = word.overlay.gloss.split(".")[0];
  return base === "LIVE" || base === "MEMORY";
}

/** `th#N` counts hands between the event and you, so a first-hand channel in the same clause contradicts it. */
function enforceHandDepthChannel(units: Unit[]): void {
  const depth = units.find(
    (unit) => unit.kind === "h" && unit.unit.word.pos === "th" && unit.unit.word.family.kind === "number" && isRankMarker(unit.unit.word.family.stem.marker),
  );
  const first = units.find((unit) => unit.kind === "h" && isFirstHandChannel(unit.unit.word));
  if (depth?.kind === "h" && first?.kind === "h") {
    throw new ConstructionError("handDepthChannel", `${first.unit.word.raw} ${depth.unit.word.raw}`);
  }
}

/** Offsets from now (D-10): channel sign, stance-only as-of offsets, and time poles that need a warrant. */
function enforceOffsets(units: Unit[], directive: boolean): void {
  let warranted = directive;
  const poles: HUnit[] = [];
  for (const unit of units) {
    if (unit.kind !== "h") continue;
    const { word, hosted } = unit.unit;
    const sign = offsetSign(hosted?.bound, hosted?.amount);
    if (isWarrant(word)) warranted = true;
    if (!sign) continue;
    const detail = `${word.raw} ${hosted!.bound.raw}${hosted!.amount ? ` ${hosted!.amount.raw}` : ""}`;
    if (isAsOfOverlay(word) && word.pos !== "th") throw new ConstructionError("asOfOffset", detail);
    enforceChannelSign(word, hosted);
    if (isTimePole(word)) poles.push(unit.unit);
  }
  if (!warranted && poles.length > 0) {
    const pole = poles[0]!;
    throw new ConstructionError("poleOffsetWarrant", `${pole.word.raw} ${pole.hosted!.bound.raw}`);
  }
}

/** A rank fence's bar: one value-setting stance, ranked against one item (comparatives.md#bars). */
function enforceBars(coord: NpCoord, tables: ClassifyTables): void {
  for (const part of coord.parts) {
    const bars = part.items.flatMap((item) => (item.kind === "bar" ? [item.bar] : []));
    if (bars.length === 0) continue;
    for (const bar of bars) {
      if (!isBarStance(bar.word, tables)) throw new ConstructionError("barKind", `${bar.word.raw} ${part.join?.raw ?? ""}`.trim());
      enforceChannelSign(bar.word, bar.hosted);
      if (bar.hosted && (isStandIn(bar.hosted.bound) || (bar.hosted.grounds && isStandIn(bar.hosted.grounds)))) {
        enforceHostedStandIn([], 0, bar, tables);
      }
    }
    if (bars.length > 1 || part.items.length - bars.length > 1) {
      throw new ConstructionError("barCount", `${bars.map((bar) => bar.word.raw).join(" ")} ${part.join?.raw ?? ""}`.trim());
    }
  }
}

/** A placement locus (INTERNAL `a`, UNPLACED `uo`) has no landmark, so its feeling takes no hosted `/b/` (sakes.md#emotion-compose). */
function enforceFeelingLandmark(words: LexWord[], hosted: Hosted | undefined): void {
  if (!hosted) return;
  for (const word of words) {
    const family = word.family;
    if (family.kind === "x" && family.xFamily === "sake" && (family.locus === "a" || family.locus === "uo")) {
      throw new ConstructionError("feelingLandmark", `${word.raw} ${hosted.bound.raw}`);
    }
  }
}

/** `uem` + a stance: the stance must say something the event can go against, and holds no stand-in (sakes.md#contrary-to-stance). */
function enforceFrame(hook: LexWord, frame: HUnit, tables: ClassifyTables): void {
  if (!isFrameStance(frame.word, tables)) throw new ConstructionError("frameKind", `${hook.raw} ${frame.word.raw}`);
  enforceChannelSign(frame.word, frame.hosted);
  const stand = frame.hosted && (frame.hosted.grounds ?? frame.hosted.bound);
  if (stand && isStandIn(stand)) throw new ConstructionError("standInHost", `${frame.word.raw} ${stand.raw}`);
}

/** The words on each side of a unit, skipping `/w/` detail. */
function edgeWord(unit: Unit | undefined, edge: "first" | "last"): LexWord | undefined {
  const words: LexWord[] = [];
  if (unit) visitUnit(unit, { word: (w) => words.push(w) });
  const content = words.filter((w) => w.pos !== "w");
  return edge === "first" ? content[0] : content.at(-1);
}

/** An in-clause hook pairs two phrases in the same clause role: `A HOOK B` (hooks.md#including-am-al). */
function enforceSameRole(hook: LexWord, prev: Unit | undefined, next: Unit | undefined): void {
  // A stand-in clause `xual ul …` hooks the clause after it (joins.md#clause-joins).
  if (!prev || !next || prev.kind === "clauseCoord") return;
  const a = edgeWord(prev, "last")?.pos;
  const b = edgeWord(next, "first")?.pos;
  if (a && b && a !== b) throw new ConstructionError("hookSameRole", `${edgeWord(prev, "last")!.raw} ${hook.raw} ${edgeWord(next, "first")!.raw}`);
}

/** A hook + stand-in `/b/`: only `ul barl`, *since* + the next sentence (hooks.md#since). */
function enforceHookStandIn(hook: LexWord, next: Unit | undefined): void {
  if (next?.kind !== "np" || next.coord.level !== "b") return;
  const first = next.coord.parts[0]?.items[0];
  const head = first?.kind === "package" ? first.package.head : undefined;
  if (!head || !isStandIn(head)) return;
  const since = hook.family.kind === "hook" && hook.family.form === "ul" && series(head) === "a";
  if (!since) throw new ConstructionError("hookStandIn", `${hook.raw} ${head.raw}`);
}

/**
 * The sentence after a stand-in names an event or a thing: stance words alone fill no slot, except a lone
 * sake word, which is a whole sentence about the speaker (dependents.md#dependent-clauses, sakes.md#feeling-no-object).
 */
function enforceDependentContent(clause: Clause): void {
  const dependent = clause.dependent;
  if (!dependent) return;
  // A noun stand-in (`zarl`) runs on into same-role nouns after it, which belong to the next sentence.
  const host = clause.units.at(-1);
  if (host?.kind === "np" && host.coord.parts.some((part) => part.items.length > 1)) return;
  const units = dependent.clause.units;
  if (!units.every((unit) => unit.kind === "h")) return;
  const loneSake = units.length === 1 && units[0]!.kind === "h" && units[0]!.unit.word.reading === "sake";
  if (loneSake) return;
  const words = units.map((unit) => (unit.kind === "h" ? unit.unit.word.raw : "")).join(" ");
  throw new ConstructionError("dependentStanceOnly", `${dependent.orodo.raw} ${words}`);
}

/** Checks over one unit list (a clause body or an island): hosts, stand-ins, hooks, as-of counts, edges. */
function enforceUnitList(units: Unit[], tables: ClassifyTables): void {
  enforceIslandEdges(units);
  enforceRespectively(units);
  let hAsOf = 0;
  let thAsOf = 0;
  units.forEach((unit, i) => {
    const hosted = unit.kind === "h" ? unit.unit.hosted : undefined;
    if (unit.kind === "h" && hosted && (isStandIn(hosted.bound) || (hosted.grounds && isStandIn(hosted.grounds)))) {
      enforceHostedStandIn(units, i, unit.unit, tables);
    }
    if (unit.kind === "h" && isAsOfOverlay(unit.unit.word)) {
      if (unit.unit.word.pos === "th") thAsOf += 1;
      else hAsOf += 1;
    }
    if (unit.kind === "hook" && unit.job === "stray") throw new ConstructionError("genitiveHost", unit.word.raw);
    if (unit.kind === "hook" && unit.job === "clause") enforceSameRole(unit.word, units[i - 1], units[i + 1]);
    if (unit.kind === "hook" && unit.frame) enforceFrame(unit.word, unit.frame, tables);
    if (unit.kind === "hook" && !unit.frame) enforceHookStandIn(unit.word, units[i + 1]);
    if (unit.kind === "hook") enforceHookSlot(unit.word, unit.job);
    if (unit.kind === "hook" && unit.word.ending === "r" && unit.job === "resume") {
      const next = units[i + 1];
      if (next?.kind === "np") throw new ConstructionError("hookResumeNoun", unit.word.raw);
    }
  });
  if (hAsOf > 1 || thAsOf > 1) throw new ConstructionError("asOfPerHost", "two as-of pairs");
}

/** The AST checks as one handler set over the walk ([ast-walk.ts](./ast-walk.ts)). */
function structureVisitor(tables: ClassifyTables, places: { seen: Set<LexWord>; framed: Set<LexWord> }): Visitor {
  return {
    // *Respectively* (`wazem`) sits only right before a `/z/` `/d/` `/b/` join word (joins.md § Respectively).
    word(word, slot) {
      if (isRespectively(word) && slot !== "joinModifier") throw new ConstructionError("joinDetail", word.raw);
      if (isRankPlace(word)) places.seen.add(word);
    },
    join(join, site) {
      if (site.kind === "np") enforceShared(join, site.coord.parts[site.index]!.shared);
      if (site.kind === "vp") enforceShared(join, site.coord.parts[site.index]!.shared);
      if (site.kind === "np") {
        const part = site.coord.parts[site.index]!;
        const lone = part.items.length === 1 && (series(join) === "e" || series(join) === "ue");
        for (const item of part.shared) {
          if (isScaleShared(item)) continue;
          if (lone) for (const mod of item.modifiers) places.framed.add(mod);
        }
      }
    },
    enter(node) {
      switch (node.kind) {
        case "utterance":
          if (node.utterance.left.hook) enforceHookSlot(node.utterance.left.hook, "discourse");
          return;
        case "body":
          enforceVerbless(node.body.clause.units);
          return;
        case "clause":
          enforceUnitList(node.clause.units, tables);
          enforceDependentContent(node.clause);
          return;
        case "island":
          enforceIsland(node.island, tables);
          return;
        case "np":
          enforceBars(node.coord, tables);
          if (!rankedUniversalFence(node.coord) && !deniedUniversalFence(node.coord)) {
            enforceLeadingFence(node.coord.parts as { items: unknown[]; join?: LexWord }[], (part) => part.items.length === 0);
          }
          return;
        case "g":
        case "vp":
          enforceLeadingFence(node.coord.parts as { items: unknown[]; join?: LexWord }[], (part) => part.items.length === 0);
          return;
        case "gPackage":
          enforceFeelingLandmark([node.pkg.word, ...node.pkg.modifiers], node.pkg.hosted);
          enforceAsOfWord(node.pkg.word, node.pkg.hosted?.bound);
          if (node.pkg.asOf) {
            enforceAsOfWord(node.pkg.asOf.word, node.pkg.asOf.bound);
            if (offsetSign(node.pkg.asOf.bound)) throw new ConstructionError("asOfOffset", `${node.pkg.asOf.word.raw} ${node.pkg.asOf.bound!.raw}`);
          }
          return;
        case "hUnit":
          enforceFeelingLandmark([node.unit.word], node.unit.hosted);
          enforceAsOfWord(node.unit.word, node.unit.hosted?.bound);
          return;
        case "clauseCoord": {
          const last = node.coord.links.at(-1);
          if (node.coord.first && last && !last.clause) throw new ConstructionError("clauseSingleItem", last.join.raw);
          return;
        }
      }
    },
  };
}

function enforceForcePair(left: LeftEdge): void {
  // A polar word is one answer or one tag: not two in a row, and not before an act word (questions.md § polar stance).
  const act = left.leadForce ?? left.force;
  if (left.polars.length > 1 || (act && left.polars.some((polar) => (polar.at ?? 0) < (act.at ?? 0)))) {
    throw new ConstructionError("polarOrder", left.polars.map((polar) => polar.raw).join(" "));
  }
  if (left.leadForce && !forcePairKind(left.leadForce, left.force)) {
    throw new ConstructionError("forcePair", `${left.leadForce.raw} ${left.force?.raw ?? ""}`.trim());
  }
}

/** A bare `/ɡ/` after the verb is not a depictive or resultative (predication.md § Property); a `/ɡ/` before the object noun or with a hosted `/b/` is a different shape. */
function enforceVerbPredicate(units: Unit[]): void {
  units.forEach((unit, i) => {
    if (unit.kind !== "predicate" || units[i - 1]?.kind !== "vp" || unit.adj.hosted) return;
    if (units[i + 1]?.kind === "np") return;
    throw new ConstructionError("predicateAfterVerb", unit.adj.word.raw);
  });
}

/**
 * Tag pronouns (pronouns.md#tag-pronouns): `/z/` `/d/` `/b/` only (`/y/` `/x/` closed by D-24, the rest open),
 * gl- never; **-l** / **-r** / **-m** / **-n**; **-x** only on **-r** / **-n** (*A and associates*); a pair (`zwaer`) recalls or shares only.
 */
function enforceTag(word: LexWord): void {
  if (word.gl || !(word.pos === "z" || word.pos === "d" || word.pos === "b")) throw new ConstructionError("tagSlot", word.raw);
  if (word.ending !== "l" && word.ending !== "r" && word.ending !== "m" && word.ending !== "n") throw new ConstructionError("tagEnding", word.raw);
  if (word.ending === "l" && word.family.kind === "tag" && word.family.vowels.length > 1) throw new ConstructionError("tagPairAssign", word.raw);
  if (word.plural && word.ending !== "r" && word.ending !== "n") throw new ConstructionError("tagPlural", word.raw);
}

/**
 * A tag names a phrase that is not already a pronoun with one fixed form (pronouns.md#tag-pronouns): never a special,
 * generic, or topic pronoun, or another tag. A resume or role pointer may take one.
 */
function enforceTagHost(node: AstNode): void {
  if (node.kind !== "npPackage" || !node.pkg.tag) return;
  const head = node.pkg.head;
  const root = head.family.kind === "content" && head.family.roots.length === 1 ? head.family.roots[0]! : undefined;
  const special = head.ending === "n" && root !== undefined && ROLE_PRONOUN_ROOTS.has(root);
  if (special || isTopicPronoun(head) || isGenericPronoun(head) || head.family.kind === "tag") {
    throw new ConstructionError("tagPronoun", `${head.raw} ${node.pkg.tag.raw}`);
  }
}

/** A digit-string label with digits takes **-x** for the group English pluralizes: `z_90x` *the ’90s* (numbers-applied.md#plural-labels). */
function isPluralLabel(word: LexWord): boolean {
  if (word.family.kind !== "number" || !(word.pos === "z" || word.pos === "d" || word.pos === "b")) return false;
  const stem = word.family.stem;
  return stem.marker === "_" && stem.groups.some((group) => group.mantissa !== undefined);
}

/** Clause- and discourse-level checks on a parsed and resolved result. */
export function enforceResult(result: ParseResult, tables: ClassifyTables): void {
  for (const { left, bodies } of result.utterances) {
    // Command / request (e) and prohibition (u) act words may name a time without a channel.
    const directive = /^y[eu]/.test(left.force?.raw ?? "");
    for (const body of bodies) {
      enforceOffsets(body.clause.units, directive);
      enforceHandDepthChannel(body.clause.units);
    }
    enforceForcePair(left);
    enforceTurnWordMods(left);
  }
  const places = { seen: new Set<LexWord>(), framed: new Set<LexWord>() };
  visitResult(result, structureVisitor(tables, places));
  visitResult(result, { enter: enforceTagHost });
  enforceGlLeans(result);
  for (const word of places.seen) if (!places.framed.has(word)) throw new ConstructionError("degreePlaceFrame", word.raw);
  for (const { bodies } of result.utterances) for (const body of bodies) enforceVerbPredicate(body.clause.units);
  for (const bind of result.resolve?.anaphors ?? []) {
    if (bind.kind === "pointer") enforcePointer(bind);
    if (bind.antecedent) continue;
    if (bind.kind === "number") throw new ConstructionError("numberResumeUnbound", bind.pronoun.raw);
    if (bind.kind === "tag" && bind.pronoun.ending === "n") throw new ConstructionError("tagNameUnbound", bind.pronoun.raw);
    if (bind.kind === "tag" && bind.pronoun.ending !== "l") throw new ConstructionError("tagUnbound", bind.pronoun.raw);
    if (bind.kind === "topic") throw new ConstructionError("topicUnbound", bind.pronoun.raw);
    if (bind.kind === "content" && !isLexiconStemResume(bind.pronoun, tables)) {
      throw new ConstructionError("resumeUnbound", bind.pronoun.raw);
    }
  }
}

/**
 * `/w/` grades a reaction, never a call; a number cheer or a `/y/` span takes no describing words at all
 * (speech-moves.md#describe-turn-word).
 */
function enforceTurnWordMods(left: LeftEdge): void {
  left.vocativeAdjs?.forEach((mods, i) => {
    if (mods.w) throw new ConstructionError("turnWordModifier", left.vocatives[i]!.raw);
  });
  left.interjectionMods?.forEach((mods, i) => {
    const word = left.interjections[i]!;
    const described = mods.glAdj || mods.w || mods.adjs.length > 0;
    if (described && (word.family.kind === "number" || word.family.kind === "writingSpan")) {
      throw new ConstructionError("turnWordModifier", word.raw);
    }
  });
}

/** A `gl-` adjective leans on the next noun, call, or reaction (or a mention marker on its topic span); one with nothing after it is left over (clause.md#left-bound-adjectives). */
function enforceGlLeans(result: ParseResult): void {
  const leaning = new Set<LexWord>();
  // The mention marker before a topic span leans on that span (spans.md#mention).
  for (const { bodies } of result.utterances) for (const { topicMarker } of bodies) if (topicMarker) leaning.add(topicMarker);
  // A `gl-` adjective before a call or reaction leans on it (speech-moves.md#describe-turn-word).
  for (const { left } of result.utterances) {
    for (const mods of [...(left.vocativeAdjs ?? []), ...(left.interjectionMods ?? [])]) if (mods.glAdj) leaning.add(mods.glAdj.word);
  }
  const gl: LexWord[] = [];
  visitResult(result, {
    enter: (node) => {
      if (node.kind === "npPackage" && node.pkg.glAdj) leaning.add(node.pkg.glAdj.word);
    },
    word: (word) => {
      if (word.gl) gl.push(word);
    },
  });
  for (const word of gl) if (!leaning.has(word)) throw new ConstructionError("glNoNoun", word.raw);
}

/**
 * Role pointers (pronouns.md#role-pointers): nouns, holders, or a lateral's facing anchor only, never their own slot,
 * never unbound; the new-one and share endings have their own limits.
 */
function enforcePointer(bind: AnaphorBind): void {
  const word = bind.pronoun;
  const family = word.family;
  // In a `th` seam: the holder slot (`thunemaxar`) or the facing anchor of a viewpoint lateral (`hewezathaxar`).
  const seam = family.kind === "x" && (family.xFamily === "holder" || family.xFamily === "lateral");
  const bare = family.kind === "x" && family.xFamily === "pointer" && family.leftRoots.length === 0;
  if (!seam && !(bare && (word.pos === "z" || word.pos === "d" || word.pos === "b"))) {
    throw new ConstructionError("pointerSlot", word.raw);
  }
  // The other one (`o`) compares fillers, and the scene's overt filler is not settled for comparison (unassigned-reserved § Role pointers).
  if (bind.pointerVowel === "o" && bind.roleVowel === "e") throw new ConstructionError("pointerOtherRole", word.raw);
  if (word.ending === "m" && bind.pointerVowel === "e") throw new ConstructionError("pointerShareSelf", word.raw);
  if (word.ending === "m" && word.plural) throw new ConstructionError("pointerSharePlural", word.raw);
  if (word.ending === "l" && bind.pointerVowel === "u") throw new ConstructionError("pointerNewUnsaid", word.raw);
  if (bind.ownSlot) throw new ConstructionError("pointerOwnSlot", word.raw);
  if (!bind.antecedent) throw new ConstructionError("pointerUnbound", word.raw);
  if (word.ending === "l" && bind.antecedent.family.kind === "content") {
    const special = bind.antecedent.family.roots.some((root) => ROLE_PRONOUN_ROOTS.has(root)) || isGenericPronoun(bind.antecedent);
    if (special) throw new ConstructionError("pointerNewSpecial", word.raw);
  }
}

/**
 * With no antecedent, **-r** on a lexicon stem is the one you both already know: a published root,
 * a listed compound, or a hook compound on a published root (`vowogalar`). Any other stem needs an
 * earlier word with that whole stem, so the readings never compete.
 */
function isLexiconStemResume(word: LexWord, tables: ClassifyTables): boolean {
  if (word.family.kind !== "content") return true;
  const stem = word.family.roots.join("");
  if (tables.published.has(stem) || tables.compounds.has(stem)) return true;
  return ["l", "m"].some((ending) => {
    const parts = parseHookCompoundCite(stem + ending);
    return Boolean(parts && tables.published.has(parts.leftRoot) && parts.stem === stem + ending);
  });
}

function islandHasBinder(island: IslandUnit): boolean {
  const walk = (units: Unit[]): boolean =>
    units.some((unit) => {
      if (unit.kind === "h" || unit.kind === "clauseCoord") return true;
      if (unit.kind === "island") return walk(unit.island.units);
      if (unit.kind === "vp") return unit.coord.parts.some((p) => p.join);
      if (unit.kind === "predicate") return unit.adj.word.family.kind === "joinMarker";
      if (unit.kind === "gCoord") return true;
      if (unit.kind !== "np") return false;
      return unit.coord.parts.some(
        (p) => p.join || p.items.some((item) => item.kind === "island" && walk(item.island.units)),
      );
    });
  return walk(island.units);
}

/** The phrase role a unit fills inside an island; binders (`/h/`, `/th/`) and hooks fill none. */
function islandSlot(unit: Unit): string | undefined {
  if (unit.kind === "np") return unit.coord.level;
  if (unit.kind === "vp") return "v";
  if (unit.kind === "predicate" || unit.kind === "gCoord") return "g";
  return undefined;
}

function enforceIsland(island: IslandUnit, tables: ClassifyTables): void {
  if (island.units.length === 0) throw new ConstructionError("emptyIsland", "{ }");
  if (!islandHasBinder(island)) throw new ConstructionError("islandBinder", "{ … }");
  const slots = new Set(island.units.map(islandSlot).filter((slot) => slot !== undefined));
  if (slots.size === 0) throw new ConstructionError("islandSlotRole", "{ … }");
  if (slots.size > 1) throw new ConstructionError("islandOneSlot", `{ … } (${[...slots].join(" + ")})`);
  enforceUnitList(island.units, tables);
}

/** A host with no `/b/` of its own, cut off by an island edge from the `/b/` on the other side. */
function isOpenHost(unit: Unit | undefined): boolean {
  if (unit?.kind === "predicate") return !unit.adj.hosted && unit.adj.word.family.kind !== "joinMarker";
  if (unit?.kind === "h") return !unit.unit.hosted && unit.unit.word.family.kind !== "joinMarker";
  // A noun's trailing adjective hosts a following `/b/` too (`zululon gonunul bazawan`).
  if (unit?.kind === "np") {
    const last = unit.coord.parts.at(-1);
    const item = last && !last.join ? last.items.at(-1) : undefined;
    const adj = item?.kind === "package" ? item.package.adjs.at(-1) : undefined;
    return Boolean(adj && !adj.hosted && adj.word.family.kind !== "joinMarker");
  }
  return false;
}

function isBPhrase(unit: Unit | undefined): boolean {
  return unit?.kind === "np" && unit.coord.level === "b";
}

/** An island edge never splits a host from its hosted `/b/` (spans.md § Scope islands). */
function enforceIslandEdges(units: Unit[]): void {
  units.forEach((unit, i) => {
    if (unit.kind !== "island") return;
    const inner = unit.island.units;
    if (isOpenHost(units[i - 1]) && isBPhrase(inner[0])) throw new ConstructionError("islandSlotRole", "host { /b/");
    if (isOpenHost(inner.at(-1)) && isBPhrase(units[i + 1])) throw new ConstructionError("islandSlotRole", "host { /b/");
  });
}

/** `zuam gagadul thobam zel …`: a closed `ua` fence is the one item ranked against the bar after it (comparatives.md#stance-bars). */
function rankedUniversalFence(coord: NpCoord): boolean {
  const [fence, bar] = coord.parts;
  return (
    coord.parts.length === 2 &&
    fence!.items.length === 0 &&
    fence!.join?.family.kind === "joinMarker" &&
    fence!.join.family.series === "ua" &&
    bar!.items.length > 0 &&
    bar!.items.every((item) => item.kind === "bar")
  );
}

/** `zual gagadul zul`: a `ua` fence is the one item a `u` join denies, *not every cat* (joins.md#not-every). */
function deniedUniversalFence(coord: NpCoord): boolean {
  const [fence, denial] = coord.parts;
  return (
    coord.parts.length === 2 &&
    fence!.items.length === 0 &&
    fence!.join?.family.kind === "joinMarker" &&
    fence!.join.family.series === "ua" &&
    denial!.items.length === 0 &&
    denial!.shared.length === 0 &&
    denial!.join?.family.kind === "joinMarker" &&
    denial!.join.family.series === "u" &&
    denial!.join.ending !== "r"
  );
}

function enforceLeadingFence<T extends { join?: LexWord }>(parts: T[], isEmpty: (part: T) => boolean): void {
  const first = parts[0];
  if (parts.length >= 2 && first && isEmpty(first) && first.join) {
    throw new ConstructionError("leftFence", first.join.raw);
  }
}

function enforceAsOfWord(word: LexWord, bound: LexWord | undefined): void {
  if (word.family.kind === "x" && word.family.landmark && !bound) throw new ConstructionError("landmarkLateralBound", word.raw);
  if (!isAsOfOverlay(word)) return;
  if (word.ending === "r" && bound) throw new ConstructionError("asOfResumeBound", `${word.raw} ${bound.raw}`);
  if (word.ending !== "r" && !bound) throw new ConstructionError("asOfIntroduceBound", word.raw);
}
