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
import { ARROW_ROOTS, isAsOfOverlay, isGroundsChannel, isStandIn } from "./classify.js";
import { REJECTIONS, type RejectionId } from "./constructions.js";
import { SentenceParseError } from "./sentence-parser.js";
import {
  Bang,
  classifyTokenBranch,
  IslandEdge,
  isLexWordPayload,
  Linker,
  Period,
  QMark,
  SpanAtom,
  SpanOpen,
  Tone,
  type TokenPayload,
} from "./tokens.js";
import { tokenMatcher } from "chevrotain";
import { isScaleShared, isSharedGPackage, isSharedHUnit, visitResult, type Visitor } from "./ast-walk.js";
import { forcePairKind, KIND_SERIES, RANK_SERIES } from "./series.js";
import type {
  Clause,
  ClauseCoord,
  CoordShared,
  GCoord,
  GPackage,
  HUnit,
  IslandUnit,
  LexWord,
  NpCoord,
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

function series(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.series : undefined;
}

function isPole(word: LexWord): boolean {
  return word.overlay?.kind === "clause_pole";
}

const TONE_MARKS: Record<string, string> = {
  "!": "strong",
  "!!": "stronger",
  "?": "unsure",
  "?!": "surprised",
  "%": "joking",
  "&": "contrast",
  ";": "warm",
};

/**
 * Tone-mark placement (speech-moves.md § tone marks). A mark is a valid mark
 * attached to a word, an island's opening `^`, or a span, or free-standing
 * before words of the same sentence. Returns the tokens without tone marks and
 * the `tone.*` constructions they used.
 */
export function enforceTones(tokens: IToken[]): { tokens: IToken[]; constructions: string[] } {
  const kept: IToken[] = [];
  const constructions = new Set<string>();
  let islandOpen = false;
  tokens.forEach((token, i) => {
    if (token.tokenType === IslandEdge) islandOpen = !islandOpen;
    if (token.tokenType !== Tone) {
      kept.push(token);
      return;
    }
    const { mark, attached } = token.payload as { mark: string; attached: boolean };
    const name = TONE_MARKS[mark];
    if (!name) throw new ConstructionError("toneStack", `"${mark}"`);
    const next = tokens[i + 1];
    let scope: string;
    if (!next || next.tokenType === Period || next.tokenType === QMark || next.tokenType === Bang) {
      throw new ConstructionError("toneTarget", `"${mark}" before ${next ? `"${next.image}"` : "the end"}`);
    } else if (!attached) {
      // Marks in a row are a stack even when spaced (`! ! zazawan`, `! !zazawan`).
      if (next.tokenType === Tone) throw new ConstructionError("toneStack", `"${mark} ${next.image}"`);
      scope = "rest";
    } else if (next.tokenType === IslandEdge) {
      if (islandOpen) throw new ConstructionError("toneTarget", `"${mark}" on a closing ^`);
      scope = "island";
    } else if (next.tokenType === SpanOpen || (tokenMatcher(next, SpanAtom) && isWritingSpan(next))) {
      scope = "span";
    } else if (next.tokenType === Tone) {
      throw new ConstructionError("toneStack", `"${mark}${next.image}"`);
    } else {
      scope = "word";
    }
    constructions.add(`tone.mark.${name}`);
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
        branch === "hook";
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

/** Stacked hook **-r** (`oer` / `uar` / `uer`) is only a span member between same-role words (hooks.md § Spans). */
function enforceStackedHookR(word: LexWord, tokens: IToken[], i: number): void {
  if (word.family.kind !== "hook" || word.ending !== "r" || word.family.form.length < 3) return;
  let j = i - 1;
  while (tokenWord(tokens[j])?.pos === "w") j -= 1;
  const prev = tokenWord(tokens[j]);
  const next = tokenWord(tokens[i + 1]);
  if (!prev?.pos || prev.pos !== next?.pos) throw new ConstructionError("stackedHookResume", word.raw);
}

function isRespectively(word: LexWord): boolean {
  return word.overlay?.kind === "pairing";
}

/** A marked list is an and-list paired with another and-list of the same length (joins.md § Respectively). */
function enforceRespectively(units: Unit[]): void {
  const lists: { length: number; marker?: string; raw: string }[] = [];
  for (const unit of units) {
    if (unit.kind !== "np" && unit.kind !== "vp") continue;
    for (const part of unit.coord.parts) {
      const joinModifiers = "joinModifiers" in part ? (part.joinModifiers ?? []) : [];
      for (const w of joinModifiers) {
        if (!isRespectively(w)) throw new ConstructionError("joinDetail", `${w.raw} ${part.join?.raw ?? ""}`.trim());
      }
      if (series(part.join) !== "a" || part.items.length < 2) {
        if (joinModifiers.length > 0) throw new ConstructionError("joinDetail", `${joinModifiers[0]!.raw} ${part.join?.raw ?? ""}`.trim());
        continue;
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
  if (word.plural && word.pos && NO_PLURAL_POS.has(word.pos) && !holder) {
    throw new ConstructionError("pluralOnPos", word.raw);
  }
  if (word.plural && word.pos === "y" && classifyTokenBranch(word).branch === "yInterjection") {
    throw new ConstructionError("pluralInterjection", word.raw);
  }
  const family = word.family;
  if (family.kind === "x" && family.xFamily === "sake") {
    if (word.pos && !SAKE_POS.has(word.pos)) throw new ConstructionError("sakeSlot", word.raw);
    if (family.horizon && (family.stanceVowel === "e" || word.ending === "n")) {
      throw new ConstructionError("emotionTail", word.raw);
    }
  }
  if (family.kind === "x" && family.xFamily === "scope") {
    if (word.pos && !SCOPE_POS.has(word.pos)) throw new ConstructionError("labelScopeSlot", word.raw);
    if (family.leftRoots.some((root) => ARROW_ROOTS.has(root))) throw new ConstructionError("labelScopeArrow", word.raw);
  }
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
    if (word.pos === "th" && word.overlay) {
      const base = word.overlay.gloss.split(".")[0];
      const wrong =
        (word.overlay.kind === "evidential" && base === "WITNESSED" && sign !== "-") ||
        (word.overlay.kind === "evidential" && base === "LIVE") ||
        (word.overlay.kind === "plan" && sign !== "+");
      if (wrong) throw new ConstructionError("channelOffsetSign", detail);
    }
    if (isTimePole(word)) poles.push(unit.unit);
  }
  if (!warranted && poles.length > 0) {
    const pole = poles[0]!;
    throw new ConstructionError("poleOffsetWarrant", `${pole.word.raw} ${pole.hosted!.bound.raw}`);
  }
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
    if (unit.kind === "hook" && unit.word.ending === "r") {
      const next = units[i + 1];
      if (next?.kind === "np" && next.coord.level === "b") throw new ConstructionError("hookResumeNoun", unit.word.raw);
    }
  });
  if (hAsOf > 1 || thAsOf > 1) throw new ConstructionError("asOfPerHost", "two as-of pairs");
}

/** The AST checks as one handler set over the walk ([ast-walk.ts](./ast-walk.ts)). */
function structureVisitor(tables: ClassifyTables): Visitor {
  return {
    // *Respectively* (`wazem`) sits only right before a `/z/` `/d/` `/b/` join word (joins.md § Respectively).
    word(word, slot) {
      if (isRespectively(word) && slot !== "joinModifier") throw new ConstructionError("joinDetail", word.raw);
    },
    join(join, site) {
      if (site.kind === "np") enforceShared(join, site.coord.parts[site.index]!.shared);
      if (site.kind === "vp") enforceShared(join, site.coord.parts[site.index]!.shared);
    },
    enter(node) {
      switch (node.kind) {
        case "body":
          enforceVerbless(node.body.clause.units);
          return;
        case "clause":
          enforceUnitList(node.clause.units, tables);
          return;
        case "island":
          enforceIsland(node.island, tables);
          return;
        case "np":
        case "g":
        case "vp":
          enforceLeadingFence(node.coord.parts as { items: unknown[]; join?: LexWord }[], (part) => part.items.length === 0);
          return;
        case "gPackage":
          enforceAsOfWord(node.pkg.word, node.pkg.hosted?.bound);
          if (node.pkg.asOf) {
            enforceAsOfWord(node.pkg.asOf.word, node.pkg.asOf.bound);
            if (offsetSign(node.pkg.asOf.bound)) throw new ConstructionError("asOfOffset", `${node.pkg.asOf.word.raw} ${node.pkg.asOf.bound!.raw}`);
          }
          return;
        case "hUnit":
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

/** Clause- and discourse-level checks on a parsed and resolved result. */
export function enforceResult(result: ParseResult, tables: ClassifyTables): void {
  for (const { left, bodies } of result.utterances) {
    // Command / request (e) and prohibition (u) act words may name a time without a channel.
    const directive = /^y[eu]/.test(left.force?.raw ?? "");
    for (const body of bodies) enforceOffsets(body.clause.units, directive);
    if (left.leadForce && !forcePairKind(left.leadForce, left.force)) {
      throw new ConstructionError("forcePair", `${left.leadForce.raw} ${left.force?.raw ?? ""}`.trim());
    }
  }
  visitResult(result, structureVisitor(tables));
  for (const bind of result.resolve?.anaphors ?? []) {
    if (bind.antecedent) continue;
    if (bind.kind === "number") throw new ConstructionError("numberResumeUnbound", bind.pronoun.raw);
    if (bind.kind === "content" && !isFullRootResume(bind.pronoun, tables)) {
      throw new ConstructionError("shortResumeUnbound", bind.pronoun.raw);
    }
  }
}

/**
 * With no antecedent, a published root is a full-root resume, including a root that ends at its
 * 2nd vowel (`azo`, `ogo`). An unbound short resume is never a sentence, so the readings never compete.
 */
function isFullRootResume(word: LexWord, tables: ClassifyTables): boolean {
  if (word.family.kind !== "content") return true;
  return word.family.roots.every((root) => tables.published.has(root));
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
  if (unit.kind === "span") return "span";
  return undefined;
}

function enforceIsland(island: IslandUnit, tables: ClassifyTables): void {
  if (island.units.length === 0) throw new ConstructionError("emptyIsland", "^ ^");
  if (!islandHasBinder(island)) throw new ConstructionError("islandBinder", "^ … ^");
  const slots = new Set(island.units.map(islandSlot).filter((slot) => slot !== undefined));
  if (slots.size === 0) throw new ConstructionError("islandSlotRole", "^ … ^");
  if (slots.size > 1) throw new ConstructionError("islandOneSlot", `^ … ^ (${[...slots].join(" + ")})`);
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
    if (isOpenHost(units[i - 1]) && isBPhrase(inner[0])) throw new ConstructionError("islandSlotRole", "host ^ /b/");
    if (isOpenHost(inner.at(-1)) && isBPhrase(units[i + 1])) throw new ConstructionError("islandSlotRole", "host ^ /b/");
  });
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
