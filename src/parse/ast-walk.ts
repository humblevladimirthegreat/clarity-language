/**
 * One walk over the sentence AST, in surface order. Resolve, enforce and inspect are
 * handler sets over it, so a new AST field is added here once (proposals: parser-rule-consolidation B2).
 *
 * `word` fires for every word a node holds, with the slot it fills. `join` fires where a
 * join word sits (before its shared items). `enter` / `exit` bracket every node; `enter` may
 * return {@link SKIP} to leave the node's children unvisited.
 */
import type {
  BodyClause,
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
  NpItem,
  NpPackage,
  ParseResult,
  ScaleShared,
  Unit,
  Utterance,
  VpCoord,
} from "./types.js";

export const SKIP = "skip";
type Skip = typeof SKIP;

export type WordSlot =
  | "vocative"
  | "interjection"
  | "polar"
  | "hook"
  | "hookModifier"
  | "force"
  | "leadForce"
  | "linker"
  | "modifier"
  | "asOf"
  | "asOfBound"
  | "head"
  | "bound"
  | "boundMember"
  | "boundJoinClose"
  | "boundAmount"
  | "boundGrounds"
  | "hostedBound"
  | "item"
  | "joinModifier"
  | "factor"
  | "orodo"
  | "tag"
  | "groupTag"
  | "unit";

export type CoordNode =
  | { kind: "np"; coord: NpCoord }
  | { kind: "g"; coord: GCoord }
  | { kind: "vp"; coord: VpCoord }
  | { kind: "clauseCoord"; coord: ClauseCoord };

/** Where a join word sits: its coord, part index, and (for a clause chain) the link. */
export type JoinSite =
  | { kind: "np"; coord: NpCoord; index: number }
  | { kind: "g"; coord: GCoord; index: number }
  | { kind: "vp"; coord: VpCoord; index: number }
  | { kind: "clauseCoord"; coord: ClauseCoord; index: number };

export type AstNode =
  | { kind: "utterance"; utterance: Utterance; index: number }
  | { kind: "body"; body: BodyClause }
  | { kind: "clause"; clause: Clause }
  | { kind: "np"; coord: NpCoord }
  | { kind: "g"; coord: GCoord }
  | { kind: "vp"; coord: VpCoord }
  | { kind: "clauseCoord"; coord: ClauseCoord }
  | { kind: "gPackage"; pkg: GPackage }
  | { kind: "hUnit"; unit: HUnit }
  | { kind: "npPackage"; pkg: NpPackage }
  | { kind: "shared"; join: LexWord | undefined; item: CoordShared }
  | { kind: "island"; island: IslandUnit };

export type Visitor = {
  word?(word: LexWord, slot: WordSlot): void;
  join?(join: LexWord, site: JoinSite): void;
  enter?(node: AstNode): Skip | void;
  exit?(node: AstNode): void;
};

export function isScaleShared(item: CoordShared): item is ScaleShared {
  return "kind" in item;
}

/** A shared `/ɡ/` package (adjective shared by every conjunct). */
export function isSharedGPackage(item: CoordShared): item is GPackage {
  return item.word.pos === "g";
}

/** Kind reference: standalone `zuan` + the kind on shared `/ɡ/` names the kind itself (joins.md § kind reference). */
export function isKindReference(part: NpCoord["parts"][number]): boolean {
  const join = part.join;
  return (
    part.items.length === 0 &&
    join?.family.kind === "joinMarker" &&
    join.family.series === "ua" &&
    join.ending === "n" &&
    part.shared.some(isSharedGPackage)
  );
}

/** Greeting: a prefix-less named citation said alone, with any family name (`azawan.`, word-endings.md § greeting). */
export function isGreeting(clause: Clause): boolean {
  const [only, ...rest] = clause.units;
  if (rest.length > 0 || only?.kind !== "np" || only.coord.parts.length !== 1) return false;
  const [part] = only.coord.parts;
  const [item, ...more] = part!.items;
  if (more.length > 0 || part!.join || item?.kind !== "package") return false;
  const { head, adjs, glAdj, adjCoord } = item.package;
  // A full name greets too (`SELFn galuden.`): only family-name `/ɡ/` words on **-n** (word-endings.md#multipart-names).
  const familyName = (adj: GPackage) => adj.word.ending === "n" && !adj.hosted && adj.modifiers.length === 0;
  return !head.pos && head.ending === "n" && !adjCoord && adjs.every(familyName) && (!glAdj || familyName(glAdj));
}

/** A shared `/h/` or `/th/` unit. */
export function isSharedHUnit(item: CoordShared): item is HUnit {
  return item.word.pos === "h" || item.word.pos === "th";
}

export function visitResult(result: ParseResult, v: Visitor): void {
  result.utterances.forEach((utterance, index) => visitUtterance(utterance, index, v));
}

export function visitUtterance(utterance: Utterance, index: number, v: Visitor): void {
  const node: AstNode = { kind: "utterance", utterance, index };
  if (v.enter?.(node) === SKIP) return;
  visitLeftEdge(utterance.left, v);
  for (const body of utterance.bodies) visitBody(body, v);
  v.exit?.(node);
}

function visitLeftEdge(left: LeftEdge, v: Visitor): void {
  const w = (words: LexWord[] | LexWord | undefined, slot: WordSlot) => words && [words].flat().forEach((x) => v.word?.(x, slot));
  left.vocatives.forEach((call, i) => {
    const adjs = left.vocativeAdjs?.[i];
    if (adjs?.glAdj) visitGPackage(adjs.glAdj, v);
    v.word?.(call, "vocative");
    for (const adj of adjs?.adjs ?? []) visitGPackage(adj, v);
  });
  w(left.interjections, "interjection");
  w(left.polars, "polar");
  w(left.hook, "hook");
  w(left.hookModifiers, "hookModifier");
  w(left.leadForce, "leadForce");
  w(left.force, "force");
}

function visitBody(body: BodyClause, v: Visitor): void {
  const node: AstNode = { kind: "body", body };
  if (v.enter?.(node) === SKIP) return;
  if (body.topicMarker) v.word?.(body.topicMarker, "unit");
  if (body.linker) v.word?.(body.linker, "linker");
  visitClause(body.clause, v);
  v.exit?.(node);
}

export function visitClause(clause: Clause, v: Visitor): void {
  const node: AstNode = { kind: "clause", clause };
  if (v.enter?.(node) === SKIP) return;
  for (const unit of clause.units) visitUnit(unit, v);
  if (clause.dependent) {
    v.word?.(clause.dependent.orodo, "orodo");
    visitClause(clause.dependent.clause, v);
  }
  v.exit?.(node);
}

function visitIsland(island: IslandUnit, v: Visitor): void {
  const node: AstNode = { kind: "island", island };
  if (v.enter?.(node) === SKIP) return;
  for (const unit of island.units) visitUnit(unit, v);
  v.exit?.(node);
}

export function visitUnit(unit: Unit, v: Visitor): void {
  switch (unit.kind) {
    case "np":
      visitNp(unit.coord, v);
      return;
    case "vp":
      visitVp(unit.coord, v);
      return;
    case "predicate":
      visitGPackage(unit.adj, v);
      return;
    case "gCoord":
      visitGCoord(unit.coord, v);
      return;
    case "h":
      visitHUnit(unit.unit, v);
      return;
    case "linker":
    case "writingSpan":
      v.word?.(unit.word, "unit");
      return;
    case "hook":
      for (const mod of unit.modifiers) v.word?.(mod, "hookModifier");
      v.word?.(unit.word, "hook");
      if (unit.frame) visitHUnit(unit.frame, v);
      return;
    case "island":
      visitIsland(unit.island, v);
      return;
    case "clauseCoord":
      visitClauseCoord(unit.coord, v);
      return;
  }
}

/** A host's hosted `/b/` slot: the `/b/`, a join filling it, a measure amount, then the landmark's adjectives. */
function visitHosted(hosted: Hosted | undefined, v: Visitor): void {
  if (!hosted) return;
  v.word?.(hosted.bound, "bound");
  for (const member of hosted.boundJoin?.members ?? []) v.word?.(member, "boundMember");
  if (hosted.boundJoin) v.word?.(hosted.boundJoin.join, "boundJoinClose");
  if (hosted.amount) v.word?.(hosted.amount, "boundAmount");
  if (hosted.grounds) v.word?.(hosted.grounds, "boundGrounds");
  for (const adj of hosted.adjs ?? []) visitGPackage(adj, v);
}

export function visitGPackage(pkg: GPackage, v: Visitor): void {
  const node: AstNode = { kind: "gPackage", pkg };
  if (v.enter?.(node) === SKIP) return;
  for (const mod of pkg.modifiers) v.word?.(mod, "modifier");
  if (pkg.asOf) {
    v.word?.(pkg.asOf.word, "asOf");
    if (pkg.asOf.bound) v.word?.(pkg.asOf.bound, "asOfBound");
  }
  v.word?.(pkg.word, "head");
  visitHosted(pkg.hosted, v);
  v.exit?.(node);
}

export function visitHUnit(unit: HUnit, v: Visitor): void {
  const node: AstNode = { kind: "hUnit", unit };
  if (v.enter?.(node) === SKIP) return;
  for (const mod of unit.modifiers) v.word?.(mod, "modifier");
  v.word?.(unit.word, "head");
  visitHosted(unit.hosted, v);
  v.exit?.(node);
}

function visitNpPackage(pkg: NpPackage, v: Visitor): void {
  const node: AstNode = { kind: "npPackage", pkg };
  if (v.enter?.(node) === SKIP) return;
  if (pkg.glAdj) visitGPackage(pkg.glAdj, v);
  v.word?.(pkg.head, "head");
  if (pkg.adjCoord) visitGCoord(pkg.adjCoord, v);
  else for (const adj of pkg.adjs) visitGPackage(adj, v);
  if (pkg.tag) v.word?.(pkg.tag, "tag");
  v.exit?.(node);
}

function visitNpItem(item: NpItem, v: Visitor): void {
  if (item.kind === "package") visitNpPackage(item.package, v);
  else if (item.kind === "bar") visitHUnit(item.bar, v);
  else visitIsland(item.island, v);
}

function visitShared(join: LexWord | undefined, shared: CoordShared[], v: Visitor): void {
  for (const item of shared) {
    const node: AstNode = { kind: "shared", join, item };
    if (v.enter?.(node) === SKIP) continue;
    if (item.word.pos === "g") visitGPackage(item as GPackage, v);
    else visitHUnit(item as HUnit, v);
    v.exit?.(node);
  }
}

function visitNp(coord: NpCoord, v: Visitor): void {
  const node: AstNode = { kind: "np", coord };
  if (v.enter?.(node) === SKIP) return;
  coord.parts.forEach((part, index) => {
    for (const item of part.items) visitNpItem(item, v);
    for (const mod of part.joinModifiers ?? []) v.word?.(mod, "joinModifier");
    if (part.join) v.join?.(part.join, { kind: "np", coord, index });
    visitShared(part.join, part.shared, v);
    if (part.factor) v.word?.(part.factor, "factor");
    if (part.tag) v.word?.(part.tag, "groupTag");
  });
  v.exit?.(node);
}

function visitGCoord(coord: GCoord, v: Visitor): void {
  const node: AstNode = { kind: "g", coord };
  if (v.enter?.(node) === SKIP) return;
  coord.parts.forEach((part, index) => {
    for (const item of part.items) {
      if (item.kind === "adj") visitGPackage(item.adj, v);
      else visitIsland(item.island, v);
    }
    for (const mod of part.joinModifiers ?? []) v.word?.(mod, "joinModifier");
    if (part.join) v.join?.(part.join, { kind: "g", coord, index });
    visitShared(part.join, part.shared, v);
  });
  v.exit?.(node);
}

function visitVp(coord: VpCoord, v: Visitor): void {
  const node: AstNode = { kind: "vp", coord };
  if (v.enter?.(node) === SKIP) return;
  coord.parts.forEach((part, index) => {
    for (const item of part.items) {
      for (const unit of part.itemUnits?.find((e) => e.verb === item)?.units ?? []) visitUnit(unit, v);
      v.word?.(item, "item");
    }
    for (const verb of part.hostedVerbs ?? []) v.word?.(verb.hosted.bound, "hostedBound");
    for (const mod of part.joinModifiers ?? []) v.word?.(mod, "joinModifier");
    if (part.join) v.join?.(part.join, { kind: "vp", coord, index });
    visitShared(part.join, part.shared, v);
  });
  v.exit?.(node);
}

function visitClauseCoord(coord: ClauseCoord, v: Visitor): void {
  const node: AstNode = { kind: "clauseCoord", coord };
  if (v.enter?.(node) === SKIP) return;
  if (coord.first) visitClause(coord.first, v);
  coord.links.forEach((link, index) => {
    v.join?.(link.join, { kind: "clauseCoord", coord, index });
    if (link.clause) visitClause(link.clause, v);
  });
  v.exit?.(node);
}
