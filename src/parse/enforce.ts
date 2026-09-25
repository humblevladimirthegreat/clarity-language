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
import { isAsOfOverlay, isStandIn } from "./classify.js";
import { letterPrefix } from "./resolve.js";
import { REJECTIONS, type RejectionId } from "./constructions.js";
import { SentenceParseError } from "./sentence-parser.js";
import { Bang, classifyTokenBranch, isLexWordPayload, Linker, QMark, type TokenPayload } from "./tokens.js";
import type {
  Clause,
  CoordShared,
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
const VALUE_POS = new Set(["g", "th", "w"]);
const RANK_SERIES = new Set(["e", "oe", "ue", "ae"]);
const KIND_SERIES = new Set(["ua", "uo"]);

function series(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.series : undefined;
}

function isPole(word: LexWord): boolean {
  return word.overlay?.kind === "clause_pole";
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
        branch === "jFallbackVocative" ||
        branch === "greeting" ||
        branch === "hook";
      if (!opensBody) throw new ConstructionError("linkerMidSentence", token.image);
    }
    const payload = token.payload as TokenPayload | undefined;
    if (!payload || !isLexWordPayload(payload)) return;
    enforceWord(payload, tables);
  });
}

function enforceWord(word: LexWord, tables: ClassifyTables): void {
  if (word.plural && word.pos && NO_PLURAL_POS.has(word.pos)) {
    throw new ConstructionError("pluralOnPos", word.raw);
  }
  const family = word.family;
  if (family.kind === "x" && family.xFamily === "value") {
    if (word.pos && !VALUE_POS.has(word.pos)) throw new ConstructionError("valueSlot", word.raw);
    if (!family.leftRoots.every((root) => tables.needRoots.has(root))) {
      throw new ConstructionError("valueRoot", word.raw);
    }
  }
}

function isGPackage(item: CoordShared): item is GPackage {
  return "word" in item && (item as GPackage).word.pos === "g";
}

function isHUnit(item: CoordShared): item is HUnit {
  return "word" in item && ((item as HUnit).word.pos === "h" || (item as HUnit).word.pos === "th");
}

function enforceShared(join: LexWord | undefined, shared: CoordShared[]): void {
  const s = series(join);
  if (!s) return;
  for (const item of shared) {
    if (KIND_SERIES.has(s) && isGPackage(item) && item.word.plural) {
      throw new ConstructionError("pluralKindAfterUniversal", `${join!.raw} ${item.word.raw}`);
    }
    if (RANK_SERIES.has(s) && isHUnit(item) && item.word.family.kind === "number") {
      throw new ConstructionError("rankJoinNumberManner", `${join!.raw} ${item.word.raw}`);
    }
  }
}

function enforceHostedStandIn(units: Unit[], index: number, unit: HUnit): void {
  const bound = unit.bound!;
  const host = unit.word;
  if (!isPole(host)) throw new ConstructionError("standInHost", `${host.raw} ${bound.raw}`);
  const s = series(bound);
  const soThat = host.overlay!.gloss === "so-that";
  if (bound.pos !== "b" || !(s === "a" || (s === "u" && soThat))) {
    throw new ConstructionError(s === "u" ? "standInHostUndo" : "standInHost", `${host.raw} ${bound.raw}`);
  }
  const prev = units[index - 1];
  if (prev?.kind === "h" && !prev.unit.bound && isPole(prev.unit.word)) {
    const stack = `${prev.unit.word.overlay!.gloss} ${host.overlay!.gloss}`;
    if (stack !== "only-if because") {
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

function enforceClause(clause: Clause): void {
  const { units } = clause;
  units.forEach((unit, i) => {
    if (unit.kind === "h" && unit.unit.bound && isStandIn(unit.unit.bound)) enforceHostedStandIn(units, i, unit.unit);
    if (unit.kind === "np" || unit.kind === "vp") {
      for (const part of unit.coord.parts) enforceShared(part.join, part.shared);
    }
    if (unit.kind === "island") enforceClause({ units: unit.island.units });
    if (unit.kind === "span") unit.span.content.forEach(enforceClause);
    if (unit.kind === "clauseCoord") unit.coord.parts.forEach((part) => part.clauses.forEach(enforceClause));
  });
  if (clause.dependent) enforceClause(clause.dependent.clause);
}

/** Clause- and discourse-level checks on a parsed and resolved result. */
export function enforceResult(result: ParseResult, tables: ClassifyTables): void {
  for (const utterance of result.utterances) {
    for (const body of utterance.bodies) {
      enforceStructure(body.clause.units);
      if (body.clause.dependent) enforceStructure(body.clause.dependent.clause.units);
      enforceClause(body.clause);
      enforceVerbless(body.clause.units);
    }
  }
  for (const bind of result.resolve?.anaphors ?? []) {
    if (bind.antecedent) continue;
    if (bind.kind === "number") throw new ConstructionError("numberResumeUnbound", bind.pronoun.raw);
    if (bind.kind === "content" && !isFullRootResume(bind.pronoun, tables)) {
      throw new ConstructionError("shortResumeUnbound", bind.pronoun.raw);
    }
  }
}

/**
 * A full-root resume is a published root longer than its short cut. A root that
 * ends at its 2nd vowel is spelled the same as a short resume, so it reads short.
 */
function isFullRootResume(word: LexWord, tables: ClassifyTables): boolean {
  if (word.family.kind !== "content") return true;
  return word.family.roots.every((root) => tables.published.has(root) && letterPrefix(root) !== root);
}

function islandHasBinder(island: IslandUnit): boolean {
  const walk = (units: Unit[]): boolean =>
    units.some((unit) => {
      if (unit.kind === "h" || unit.kind === "clauseCoord") return true;
      if (unit.kind === "island") return walk(unit.island.units);
      if (unit.kind === "vp") return unit.coord.parts.some((p) => p.join);
      if (unit.kind !== "np") return false;
      return unit.coord.parts.some(
        (p) => p.join || p.items.some((item) => item.kind === "island" && walk(item.island.units)),
      );
    });
  return walk(island.units);
}

function enforceIsland(island: IslandUnit): void {
  if (island.units.length === 0) throw new ConstructionError("emptyIsland", "^ ^");
  if (!islandHasBinder(island)) throw new ConstructionError("islandBinder", "^ … ^");
  enforceStructure(island.units);
}

/** `A zam B zal` is legal nesting (`[[A zam] B zal]`); a join before any conjunct is a left fence (joins.md § Right-close fence). */
function enforceLeadingFence<T extends { join?: LexWord }>(parts: T[], isEmpty: (part: T) => boolean): void {
  const first = parts[0];
  if (parts.length >= 2 && first && isEmpty(first) && first.join) {
    throw new ConstructionError("leftFence", first.join.raw);
  }
}

function enforceAsOfWord(word: LexWord, bound: LexWord | undefined): void {
  if (!isAsOfOverlay(word)) return;
  if (word.ending === "r" && bound) throw new ConstructionError("asOfResumeBound", `${word.raw} ${bound.raw}`);
  if (word.ending !== "r" && !bound) throw new ConstructionError("asOfIntroduceBound", word.raw);
}

function enforceGPackageAsOf(pkg: GPackage): void {
  enforceAsOfWord(pkg.word, pkg.bound);
  if (pkg.asOf) enforceAsOfWord(pkg.asOf.word, pkg.asOf.bound);
  for (const adj of pkg.boundAdjs ?? []) enforceGPackageAsOf(adj);
}

function enforceSharedAsOf(shared: CoordShared[]): void {
  for (const item of shared) {
    if ("modifiers" in item && "word" in item && !("unit" in item)) {
      enforceGPackageAsOf(item as GPackage);
    } else if ("word" in item && "modifiers" in item) {
      const h = item as HUnit;
      enforceAsOfWord(h.word, h.bound);
    }
  }
}

function enforceNp(coord: NpCoord): void {
  enforceLeadingFence(coord.parts, (part) => part.items.length === 0);
  for (const part of coord.parts) {
    for (const item of part.items) {
      if (item.kind === "package") {
        if (item.package.glAdj) enforceGPackageAsOf(item.package.glAdj);
        for (const adj of item.package.adjs) enforceGPackageAsOf(adj);
      }
      if (item.kind === "island") enforceIsland(item.island);
    }
    enforceSharedAsOf(part.shared);
  }
}

function enforceVp(coord: VpCoord): void {
  enforceLeadingFence(coord.parts, (part) => part.items.length === 0);
  for (const part of coord.parts) enforceSharedAsOf(part.shared);
}

/** Fences, scope islands, and as-of pairs (formerly the parser's post-build `validate*` pass). */
function enforceStructure(units: Unit[]): void {
  let hAsOf = 0;
  for (const unit of units) {
    if (unit.kind === "h") {
      enforceAsOfWord(unit.unit.word, unit.unit.bound);
      if (isAsOfOverlay(unit.unit.word)) hAsOf += 1;
    }
    if (unit.kind === "predicate") enforceGPackageAsOf(unit.adj);
    if (unit.kind === "np") enforceNp(unit.coord);
    if (unit.kind === "vp") enforceVp(unit.coord);
    if (unit.kind === "island") enforceIsland(unit.island);
    if (unit.kind === "span") unit.span.content.forEach((clause) => enforceStructure(clause.units));
    if (unit.kind === "clauseCoord") {
      enforceLeadingFence(unit.coord.parts, (part) => part.clauses.length === 0);
      unit.coord.parts.forEach((part) => part.clauses.forEach((clause) => enforceStructure(clause.units)));
    }
  }
  if (hAsOf > 1) throw new ConstructionError("asOfPerHost", "two as-of pairs");
}
