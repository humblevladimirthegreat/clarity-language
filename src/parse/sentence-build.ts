/** After parsing: post-parse fixes and the CST-to-AST builders. */

import type { CstNode, IToken } from "chevrotain";
import {
  lexWordFromToken,
  Period,
  QMark,
  Hook,
} from "./tokens.js";
import { isNamedStandIn, isStandIn } from "./classify.js";
import { scopeClause, scopeIsland } from "./verb-items.js";
import { actWord, isScaleStem, RANK_SERIES } from "./series.js";
import type {
  BodyClause,
  Clause,
  CoordShared,
  GCoord,
  GItem,
  GPackage,
  TurnWordMods,
  Hosted,
  HUnit,
  ImpliedForce,
  IslandUnit,
  LeftEdge,
  NpCoord,
  NpItem,
  NpPackage,
  OdoDependent,
  PunctKind,
  Unit,
  Utterance,
  VpCoord,
  BoundJoin,
} from "./types.js";
import type { LexWord } from "./types.js";
import { SentenceParseError, tokenIs } from "./sentence-shapes.js";

function punctFromToken(token: IToken): PunctKind {
  if (token.tokenType === Period) return "period";
  if (token.tokenType === QMark) return "qmark";
  return "bang";
}

function npPackages(coord: NpCoord): NpPackage[] {
  return coord.parts.flatMap((part) =>
    part.items.filter((item): item is { kind: "package"; package: NpPackage } => item.kind === "package").map((item) => item.package),
  );
}

/** The stand-in a host's hosted slot holds: its `/b/`, or the grounds `barl` after an offset. */
function hostedStandIn(hosted: Hosted): LexWord | undefined {
  const stand = hosted.grounds ?? hosted.bound;
  return isStandIn(stand) ? stand : undefined;
}

/** The forward stand-in a unit holds (a noun's head, or an `/h/` host's or a bar's hosted `/b/`): the slot the next sentence fills. */
function standInIn(unit: Unit): LexWord | undefined {
  if (unit.kind === "np") {
    const head = npPackages(unit.coord).find((pkg) => isStandIn(pkg.head))?.head;
    if (head) return head;
    for (const part of unit.coord.parts) {
      for (const item of part.items) if (item.kind === "bar" && item.bar.hosted) return hostedStandIn(item.bar.hosted);
    }
    return undefined;
  }
  if (unit.kind === "h" && unit.unit.hosted) return hostedStandIn(unit.unit.hosted);
  return undefined;
}

/**
 * Split a clause after unit `index`, whose stand-in `orodo` is filled by the units that follow. A stand-in inside that
 * sentence opens its own dependent, nested in it: each new dependent belongs to the clause just before it
 * (nested-dependents.md#nested-dependents).
 */
function splitAtStandIn(units: Unit[], index: number, orodo: LexWord): Clause {
  const rest = units.slice(index + 1);
  return { units: units.slice(0, index + 1), dependent: rest.length > 0 ? { orodo, clause: splitResolved(rest) } : undefined };
}

const IMPLIED_SUBJECT_SERIES = new Set(["o", "u", "ae", "ue", "ua"]);

function verbalDependentIn(unit: Unit): { word: LexWord; coord: VpCoord; stacked: boolean } | undefined {
  if (unit.kind !== "vp" || unit.coord.parts.length === 0) return undefined;
  const lastPart = unit.coord.parts.at(-1)!;
  const lastItem = lastPart.items.at(-1);
  if (!lastPart.join && lastItem?.pos === "v" && isNamedStandIn(lastItem)) {
    return { word: lastItem, coord: unit.coord, stacked: false };
  }
  const join = lastPart.join;
  if (
    lastPart.items.length === 0 &&
    join?.pos === "v" &&
    isNamedStandIn(join)
  ) {
    return { word: join, coord: unit.coord, stacked: true };
  }
  return undefined;
}

function hasSubjectStart(unit: Unit | undefined): boolean {
  return unit?.kind === "np" && unit.coord.level === "z";
}

function allowsImpliedSubject(word: LexWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  return IMPLIED_SUBJECT_SERIES.has(word.family.series);
}

function disambiguateClause(units: Unit[]): Unit[] {
  // Verbless `zazawan godogol gul` / `zazawan garedel gumuzem gal`: the joined list is the predicate.
  if (units.length === 1 && units[0]!.kind === "np") {
    const coord = units[0].coord;
    const part = coord.parts[0];
    const item = coord.parts.length === 1 && part && !part.join && part.items.length === 1 ? part.items[0] : undefined;
    if (item?.kind === "package" && item.package.adjCoord) {
      const { adjCoord, ...pkg } = item.package;
      return [
        { kind: "np", coord: { level: coord.level, parts: [{ items: [{ kind: "package", package: { ...pkg, adjs: [] } }], shared: [] }] } },
        { kind: "gCoord", coord: adjCoord },
      ];
    }
  }
  // A trailing `/ɡ/` join fence (`zazawan godogol gul`) closes the predicate, not a second clause part.
  const rest = units.slice(1);
  const onlyGFences = rest.every((u) => u.kind === "predicate" && u.adj.word.family.kind === "joinMarker");
  if (units[0]?.kind !== "np" || !onlyGFences) return units;

  const coord = units[0].coord;
  const part = coord.parts[0];
  if (!part || part.items.length !== 1 || part.join) return units;

  const item = part.items[0]!;
  if (item.kind !== "package") return units;
  const pkg = item.package;
  if (pkg.adjs.length !== 1) return units;
  // A named citation keeps its `/ɡ/` words: `ohun galuden` is a full name, not *Ohu is an Aluden* (proper-names.md#multipart-names).
  if (rest.length === 0 && !pkg.head.pos && pkg.head.ending === "n") return units;

  const adj = pkg.adjs[0]!;
  return [
    {
      kind: "np",
      coord: {
        level: coord.level,
        parts: [{ items: [{ kind: "package", package: { ...pkg, adjs: [] } }], shared: [] }],
      },
    },
    { kind: "predicate", adj },
    ...rest,
  ];
}

function mergeIslandJoins(units: Unit[]): Unit[] {
  const out: Unit[] = [];
  for (let i = 0; i < units.length; i++) {
    const current = units[i]!;
    const island = units[i + 1];
    const closer = units[i + 2];
    const currentIsOpenNp =
      current.kind === "np" && current.coord.parts.every((part) => !part.join);
    const closerIsJoinNp =
      closer?.kind === "np" && closer.coord.parts.some((part) => part.join);
    // Only same-role material merges around an island (`zazawan ^ zunudel zal ^ zam`).
    const sameRole = current.kind === "np" && closer?.kind === "np" && current.coord.level === closer.coord.level;
    if (currentIsOpenNp && island?.kind === "island" && closerIsJoinNp && closer.kind === "np" && sameRole) {
      const leading = current.coord.parts.flatMap((part) => part.items);
      const firstClose = closer.coord.parts[0]!;
      out.push({
        kind: "np",
        coord: {
          level: closer.coord.level,
          parts: [
            {
              items: [...leading, { kind: "island", island: island.island }, ...firstClose.items],
              join: firstClose.join,
              shared: firstClose.shared,
            },
            ...closer.coord.parts.slice(1),
          ],
        },
      });
      i += 2;
      continue;
    }
    out.push(current);
  }
  return out;
}

function finalizeClause(units: Unit[]): Clause {
  return scopeClause(splitClause(units));
}

function splitClause(units: Unit[]): Clause {
  return splitResolved(disambiguateClause(mergeAdjLists(mergeIslandJoins(units))));
}

/** Split resolved units at the first forward stand-in ({@link splitAtStandIn}). */
function splitResolved(resolved: Unit[]): Clause {
  return markPredicateAdj(splitUnits(resolved));
}

/**
 * A verbless clause of one noun with one `/ɡ/`, then only `/h/` words: the `/ɡ/` is the clause's predicate, as in the
 * bare `zazozon gamahum.` ({@link disambiguateClause}), which splits it off only when nothing follows
 * (predication.md#classification-property). A dependent's clause is not disambiguated, so a bare one is marked here too.
 */
function markPredicateAdj(clause: Clause): Clause {
  const [first, ...rest] = clause.units;
  if (first?.kind !== "np" || !rest.every((unit) => unit.kind === "h")) return clause;
  const part = first.coord.parts[0];
  if (first.coord.parts.length !== 1 || !part || part.join || part.items.length !== 1) return clause;
  const item = part.items[0]!;
  if (item.kind !== "package" || item.package.adjCoord || item.package.adjs.length !== 1) return clause;
  // A named citation keeps its `/ɡ/` words (proper-names.md#multipart-names), as in disambiguateClause.
  if (rest.length === 0 && !item.package.head.pos && item.package.head.ending === "n") return clause;
  clause.predicateAdj = item.package.adjs[0]!;
  return clause;
}

function splitUnits(resolved: Unit[]): Clause {
  for (let i = 0; i < resolved.length - 1; i++) {
    const host = verbalDependentIn(resolved[i]!);
    const next = resolved[i + 1];
    if (!host || (!hasSubjectStart(next) && !(next?.kind === "vp" && allowsImpliedSubject(host.word)))) continue;
    const dependentWord = { ...host.word, reading: "standIn" as const };
    if (host.stacked) {
      const lastPart = host.coord.parts.at(-1)!;
      lastPart.items.push(dependentWord);
      lastPart.join = undefined;
    } else {
      const lastPart = host.coord.parts.at(-1)!;
      lastPart.items[lastPart.items.length - 1] = dependentWord;
    }
    return splitAtStandIn(resolved, i, dependentWord);
  }

  const orodoIdx = resolved.findIndex((unit) => standInIn(unit));
  if (orodoIdx < 0) return { units: resolved };
  const host = resolved[orodoIdx]!;
  // The stance join between a host and its `barl` stays in the main sentence.
  const splitAt = host.kind === "h" && host.unit.hosted?.afterJoin ? orodoIdx + 1 : orodoIdx;
  return splitAtStandIn(resolved, splitAt, standInIn(host)!);
}

function childNodes(parent: CstNode, key: string): CstNode[] {
  return (parent.children[key] ?? []) as CstNode[];
}

/** The adjective packages under `gPackage`, in order, with a trailing run ({@link AgebenSentenceParser.trailingAdjRun}) flattened. */
function adjNodes(parent: CstNode): CstNode[] {
  return childNodes(parent, "gPackage").flatMap((node) => (node.name === "trailingAdjRun" ? adjNodes(node) : [node]));
}
function buildBoundJoin(parent: CstNode): BoundJoin | undefined {
  const tail = childNodes(parent, "boundJoinTail")[0];
  if (!tail) return undefined;
  return { members: childTokens(tail, "B").map(lexWordFromToken), join: lexWordFromToken(childToken(tail, "JoinB")!) };
}

function childToken(parent: CstNode, key: string, index = 0): IToken | undefined {
  const tok = parent.children[key]?.[index];
  return tok ? (tok as IToken) : undefined;
}

function childTokens(parent: CstNode, key: string): IToken[] {
  return (parent.children[key] ?? []) as IToken[];
}

function buildAsOfPair(cst: CstNode): { word: LexWord; bound?: LexWord } {
  const wTok = childToken(cst, "W")!;
  const boundTok = childToken(cst, "B") ?? childToken(cst, "Odo");
  return {
    word: lexWordFromToken(wTok),
    bound: boundTok ? lexWordFromToken(boundTok) : undefined,
  };
}

/** The hosted `/b/` slot a host rule parsed (its `/b/`, join, amount and landmark adjectives), or `undefined` with no `/b/`. */
function buildHosted(cst: CstNode, bound: IToken | undefined, amount: IToken | undefined, grounds?: IToken): Hosted | undefined {
  if (!bound) return undefined;
  const adjs = adjNodes(cst).map(buildGPackage);
  const boundJoin = buildBoundJoin(cst);
  return {
    bound: lexWordFromToken(bound),
    ...(boundJoin ? { boundJoin } : {}),
    ...(amount ? { amount: lexWordFromToken(amount) } : {}),
    ...(adjs.length > 0 ? { adjs } : {}),
    ...(grounds ? { grounds: lexWordFromToken(grounds) } : {}),
  };
}

function buildGPackage(cst: CstNode): GPackage {
  const gTok = childToken(cst, "G")!;
  const asOfCst = childNodes(cst, "asOfWPair")[0];
  const hosted = buildHosted(cst, childToken(cst, "B"), childToken(cst, "G", 1));
  return {
    word: lexWordFromToken(gTok),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(hosted ? { hosted } : {}),
    asOf: asOfCst ? buildAsOfPair(asOfCst) : undefined,
  };
}

function buildNpPackage(cst: CstNode): NpPackage {
  const gPackages = adjNodes(cst);
  const firstG = gPackages[0];
  const glAdj =
    firstG && (childToken(firstG, "G")?.payload as LexWord | undefined)?.gl
      ? buildGPackage(firstG)
      : undefined;
  const trailingAdjs = (glAdj ? gPackages.slice(1) : gPackages).map(buildGPackage);
  const headTok =
    childToken(cst, "Z") ??
    childToken(cst, "D") ??
    childToken(cst, "B") ??
    childToken(cst, "Odo") ??
    childToken(cst, "WritingSpan") ??
    childToken(cst, "Citation")!;
  const tag = childToken(cst, "tag");
  return {
    glAdj,
    head: lexWordFromToken(headTok),
    adjs: trailingAdjs,
    ...(tag ? { tag: lexWordFromToken(tag) } : {}),
  };
}

/** Tag a shared `/ɡ/` / `/h/` digitless `+` right after a rank join as the scale. */
function tagScale(join: LexWord | undefined, item: GPackage | HUnit): CoordShared {
  const series = join?.family.kind === "joinMarker" ? join.family.series : "";
  const { family } = item.word;
  return RANK_SERIES.has(series) && family.kind === "number" && isScaleStem(family.stem) ? { ...item, kind: "scale" } : item;
}

function buildShared(cst: CstNode | undefined, join: LexWord | undefined): CoordShared[] {
  if (!cst) return [];
  const scale = childToken(cst, "scale");
  if (scale) return [{ kind: "scale", word: lexWordFromToken(scale), modifiers: [] }];
  const g = childNodes(cst, "gPackage");
  if (g.length > 0) return g.map(buildGPackage).map((item) => tagScale(join, item));
  const h = childNodes(cst, "hUnitRule")[0];
  if (h) return [tagScale(join, buildHUnit(h))];
  return [];
}

/** A part's join close: after its conjuncts, or standing alone (labeled `standaloneJoin`). */
function partJoinClose(part: CstNode, rule: string): CstNode | undefined {
  return childNodes(part, rule)[0] ?? childNodes(part, "standaloneJoin")[0];
}

function joinFromClose(close: CstNode | undefined): {
  join?: LexWord;
  landmark?: LexWord;
  shared: CoordShared[];
  joinModifiers?: LexWord[];
  factor?: LexWord;
} {
  if (!close) return { shared: [] };
  const joinTok =
    childToken(close, "JoinZ") ??
    childToken(close, "JoinD") ??
    childToken(close, "JoinB") ??
    childToken(close, "JoinV") ??
    childToken(close, "JoinG") ??
    childToken(close, "JoinH") ??
    childToken(close, "JoinX");
  const sharedCst = childNodes(close, "sharedAfterJoin")[0];
  const modifiers = childTokens(close, "W").map(lexWordFromToken);
  const factorTok = childToken(close, "factor");
  const landmarkTok = childToken(close, "joinLandmark");
  const join = joinTok ? lexWordFromToken(joinTok) : undefined;
  return {
    join,
    ...(landmarkTok ? { landmark: lexWordFromToken(landmarkTok) } : {}),
    shared: buildShared(sharedCst, join),
    ...(factorTok ? { factor: lexWordFromToken(factorTok) } : {}),
    ...(modifiers.length > 0 ? { joinModifiers: modifiers } : {}),
  };
}

function buildIsland(cst: CstNode): IslandUnit {
  return scopeIsland({ units: chainUnits(cst).flatMap(expandUnits) });
}

/** The unit nodes of a clause or island, in order: each `unit` rule holds one unit and the rest of the chain. */
function chainUnits(parent: CstNode): CstNode[] {
  const units: CstNode[] = [];
  for (let unit = childNodes(parent, "unit")[0]; unit; unit = childNodes(unit, "unit")[0]) units.push(unit);
  return units;
}

/**
 * A list's parts, each closed by its join; a unit with no join (a lone noun, verb, adjective or adverb) is its own
 * single part.
 */
function coordParts(cst: CstNode, coordRule: string, partRule: string): CstNode[] {
  return isCoordRule(cst.name, coordRule) ? childNodes(cst, partRule) : [cst];
}

/** A list rule in any of its forms (`zCoord`, `zCoordOpen`, `gCoordLead`, …). */
function isCoordRule(name: string, coordRule: string): boolean {
  return new RegExp(`^${coordRule}(Open|Closed|Shared|Bare|Grounds|Lead|PlainLead|JoinLead)?$`).test(name);
}

function npCoordCst(parent: CstNode): CstNode | undefined {
  return childNodes(parent, "zCoord")[0] ?? childNodes(parent, "dCoord")[0] ?? childNodes(parent, "bCoord")[0];
}

/** A noun list rule, or the rest of a list (`zCoordClosed`, `zCoordRestBare`, …). */
const NP_LIST_RULE = /^[zdb]Coord(Rest|Free)?(Grounds)?(Bare|Open|Shared|Closed)$/;

/** A noun list's parts, in order, with its right-recursive rest ({@link AgebenSentenceParser.npRules}) flattened. */
function npPartNodes(parent: CstNode): CstNode[] {
  return childNodes(parent, `${parent.name[0]}CoordPart`).flatMap((node) => (NP_LIST_RULE.test(node.name) ? npPartNodes(node) : [node]));
}

function npCoordParts(cst: CstNode): CstNode[] {
  return NP_LIST_RULE.test(cst.name) ? npPartNodes(cst) : [cst];
}

/** A part's bars, in order, with the run before `barl` ({@link AgebenSentenceParser.barsGrounds}) flattened. */
function barNodes(parent: CstNode): CstNode[] {
  return childNodes(parent, "bar").flatMap((node) => (node.name === "barsGrounds" ? barNodes(node) : [node]));
}

function buildNpCoord(cst: CstNode): NpCoord {
  const parts = npCoordParts(cst);
  const built: NpCoord["parts"] = parts.map((part) => {
    if (part === cst && !NP_LIST_RULE.test(cst.name)) return { items: [{ kind: "package", package: buildNpPackage(part) }], shared: [] };
    const close = partJoinClose(part, "npJoinClose");
    const { join, landmark, shared, joinModifiers, factor } = joinFromClose(close);
    const packages = childNodes(part, "npConjunct").map(buildNpPackage);
    // A hook + `/b/` before the join word rides on the last item as a hosted pair, like a `/ɡ/` with its own `/b/`.
    const itemHook = childToken(part, "itemHook");
    const itemHookBound = childToken(part, "itemHookBound");
    if (itemHook && itemHookBound) {
      packages.at(-1)!.adjs.push({ word: lexWordFromToken(itemHook), modifiers: [], hosted: { bound: lexWordFromToken(itemHookBound) } });
    }
    const items: NpItem[] = [
      ...packages.map((pkg): NpItem => ({ kind: "package", package: pkg })),
      ...barNodes(part).map((bar): NpItem => ({ kind: "bar", bar: buildHUnit(bar) })),
    ];
    const tag = childToken(part, "groupTag");
    return {
      items,
      join,
      ...(landmark ? { landmark } : {}),
      shared,
      ...(joinModifiers ? { joinModifiers } : {}),
      ...(factor ? { factor } : {}),
      ...(tag ? { tag: lexWordFromToken(tag) } : {}),
    };
  });
  const joinTok = built.find((part) => part.join)?.join;
  let level: NpCoord["level"] = "z";
  if (joinTok) {
    const pos = joinTok.pos;
    if (pos === "d" || pos === "b") level = pos;
  } else {
    const firstPkg = built.flatMap((p) => p.items).find((i) => i.kind === "package");
    if (firstPkg && firstPkg.kind === "package") {
      const pos = firstPkg.package.head.pos;
      if (pos === "d" || pos === "b" || pos === "z") level = pos;
    }
  }
  return { level, parts: built };
}

/** A verb list's parts, in order, with the right-recursive tail ({@link AgebenSentenceParser.vpCoord}) flattened. */
function vpPartNodes(parent: CstNode): CstNode[] {
  return childNodes(parent, "vpCoordPart").flatMap((node) => (node.name.startsWith("vpTail") ? vpPartNodes(node) : [node]));
}

/** A verb part's item units, in order, with their chain ({@link AgebenSentenceParser.vpItemsStart}) flattened. */
function vpItemNodes(parent: CstNode): CstNode[] {
  return childNodes(parent, "vpItemUnit").flatMap((node) => (node.name.startsWith("vpItems") ? vpItemNodes(node) : [node]));
}

function buildVpCoord(cst: CstNode): VpCoord {
  const parts = cst.name === "vpCoord" || cst.name === "vpCoordOpen" ? vpPartNodes(cst) : [cst];
  return {
    parts: parts.map((part) => {
      const close = partJoinClose(part, "vJoinClose");
      const { join, shared, joinModifiers } = joinFromClose(close);
      const verbs = childTokens(part, "V");
      const hostedVerbs = childTokens(part, "B").map((b) => {
        const verb = verbs.filter((v) => v.startOffset < b.startOffset).at(-1)!;
        return { verb: lexWordFromToken(verb), hosted: { bound: lexWordFromToken(b) } };
      });
      const items = verbs.map(lexWordFromToken);
      const itemUnits = groupItemUnits(vpItemNodes(part), verbs, items);
      const built = {
        items,
        join,
        shared,
        ...(joinModifiers ? { joinModifiers } : {}),
        ...(itemUnits.length > 0 ? { itemUnits } : {}),
      };
      return hostedVerbs.length > 0 ? { ...built, hostedVerbs } : built;
    }),
  };
}

function firstOffset(cst: CstNode): number {
  let min = Infinity;
  for (const kids of Object.values(cst.children)) {
    for (const kid of kids) {
      const offset = "image" in kid ? kid.startOffset : firstOffset(kid);
      if (offset < min) min = offset;
    }
  }
  return min;
}

/** Each item unit goes with the first verb after it, in spoken order. */
function groupItemUnits(cstUnits: CstNode[], verbs: IToken[], items: LexWord[]): { verb: LexWord; units: Unit[] }[] {
  const out: { verb: LexWord; units: Unit[] }[] = [];
  for (const cst of [...cstUnits].sort((a, b) => firstOffset(a) - firstOffset(b))) {
    const index = verbs.findIndex((v) => v.startOffset > firstOffset(cst));
    const verb = items[index]!;
    let entry = out.find((e) => e.verb === verb);
    if (!entry) out.push((entry = { verb, units: [] }));
    entry.units.push(...expandUnits(cst));
  }
  return out;
}

function buildHUnit(cst: CstNode): HUnit {
  const h = childToken(cst, "H")!;
  const boundTok = childToken(cst, "B");
  const hosted = buildHosted(cst, boundTok ?? childToken(cst, "Odo"), childToken(cst, "G"), boundTok ? childToken(cst, "Odo") : undefined);
  return {
    word: lexWordFromToken(h),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(hosted ? { hosted } : {}),
  };
}

function buildHookUnit(cst: CstNode): Extract<Unit, { kind: "hook" }> {
  const zone = childNodes(cst, "zone")[0];
  return {
    kind: "hook",
    word: lexWordFromToken(childToken(cst, "Hook")!),
    modifiers: childTokens(cst, "W").map(lexWordFromToken),
    ...(zone ? { zone: buildHUnit(zone) } : {}),
    ...(zone && childToken(zone, "Held") ? { heldIntention: lexWordFromToken(childToken(zone, "Held")!) } : {}),
  };
}

/** A same-role pair as the two units it stands for: the word, as an in-clause hook, then its blank's phrase. */
function buildSameRolePair(cst: CstNode): Unit[] {
  const hook: Unit = { kind: "hook", word: lexWordFromToken(childToken(cst, "Hook")!), modifiers: [] };
  const blank = lexWordFromToken(childToken(cst, "Blank")!);
  if (blank.pos === "v") return [hook, { kind: "vp", coord: { parts: [{ items: [], join: blank, shared: [] }] } }];
  return [hook, { kind: "np", coord: { level: blank.pos === "d" ? "d" : "z", parts: [{ items: [], join: blank, shared: [] }] } }];
}

function flattenHUnits(cst: CstNode): Unit[] {
  const parts = coordParts(cst, "hCoord", "hCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    const hUnits = childNodes(part, "hUnitRule").map(buildHUnit);
    const close = partJoinClose(part, "hJoinClose");
    const { join } = joinFromClose(close);
    const lateBound = childToken(part, "lateBound");
    const last = hUnits.at(-1);
    if (lateBound && last) last.hosted = { bound: lexWordFromToken(lateBound), afterJoin: true };
    for (const unit of hUnits) units.push({ kind: "h", unit });
    // Keep the fence (`/h/` or stance `thul` / `thol` / …) so it is not silently dropped.
    if (join) units.push({ kind: "h", unit: { word: join, modifiers: [] } });
  }
  return units;
}

function buildGCoord(cst: CstNode): GCoord {
  return {
    parts: coordParts(cst, "gCoord", "gCoordPart").map((part) => {
      const { join, shared, joinModifiers } = joinFromClose(partJoinClose(part, "gJoinClose"));
      const items: GItem[] = childNodes(part, "gPackage").map((g) => ({ kind: "adj", adj: buildGPackage(g) }));
      return { items, join, shared, ...(joinModifiers ? { joinModifiers } : {}) };
    }),
  };
}

/** `/ɡ/` material that can continue an adjective list: an adjective, a `/ɡ/` coord, or an island of those. */
function isGMaterial(unit: Unit | undefined): boolean {
  if (unit?.kind === "predicate" || unit?.kind === "gCoord") return true;
  return unit?.kind === "island" && unit.island.units.length > 0 && unit.island.units.every(isGMaterial);
}

function hasGJoin(unit: Unit): boolean {
  if (unit.kind === "gCoord") return true;
  if (unit.kind === "predicate") return unit.adj.word.family.kind === "joinMarker";
  return unit.kind === "island" && unit.island.units.some(hasGJoin);
}

type GToken = GItem | { kind: "join"; join: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[] };

function gTokens(unit: Unit): GToken[] {
  if (unit.kind === "island") return [{ kind: "island", island: unit.island }];
  if (unit.kind === "predicate") {
    return unit.adj.word.family.kind === "joinMarker"
      ? [{ kind: "join", join: unit.adj.word, shared: [] }]
      : [{ kind: "adj", adj: unit.adj }];
  }
  if (unit.kind === "gCoord") {
    return unit.coord.parts.flatMap((part): GToken[] => [
      ...part.items,
      ...(part.join
        ? [{ kind: "join" as const, join: part.join, shared: part.shared, ...(part.joinModifiers ? { joinModifiers: part.joinModifiers } : {}) }]
        : []),
    ]);
  }
  return [];
}

/** Right-close parts from a flat run: each join closes the items since the previous join. */
function gCoordFromTokens(tokens: GToken[]): GCoord {
  const parts: GCoord["parts"] = [];
  let items: GItem[] = [];
  for (const token of tokens) {
    if (token.kind === "join") {
      parts.push({ items, join: token.join, shared: token.shared, ...(token.joinModifiers ? { joinModifiers: token.joinModifiers } : {}) });
      items = [];
    } else items.push(token);
  }
  if (items.length > 0) parts.push({ items, shared: [] });
  return { parts };
}

function gCoordAdjs(coord: GCoord): GPackage[] {
  return coord.parts.flatMap((part) =>
    part.items.flatMap((item) =>
      item.kind === "adj"
        ? [item.adj]
        : item.island.units.flatMap((u) => (u.kind === "predicate" || u.kind === "gCoord" ? gTokens(u) : []))
            .flatMap((t) => (t.kind === "adj" ? [t.adj] : [])),
    ),
  );
}

/**
 * Gather a joined `/ɡ/` list into one structure (joins.md § right-close). After a noun whose package already
 * has adjectives, the list is attributive on that package; elsewhere it is one predicate `gCoord` unit.
 */
function mergeAdjLists(units: Unit[]): Unit[] {
  const out: Unit[] = [];
  let i = 0;
  while (i < units.length) {
    const unit = units[i]!;
    let j = i;
    while (j < units.length && isGMaterial(units[j])) j += 1;
    if (j === i) {
      out.push(unit);
      i += 1;
      continue;
    }
    const run = units.slice(i, j);
    if (!run.some(hasGJoin)) {
      out.push(...run);
      i = j;
      continue;
    }
    const prev = out.at(-1);
    const lastPart = prev?.kind === "np" ? prev.coord.parts.at(-1) : undefined;
    const lastItem = lastPart && !lastPart.join ? lastPart.items.at(-1) : undefined;
    // `/ɡ/` right after a noun describes it (as `npPackage` does); a bare leading join (`zodogol gal`) stays apart.
    const first = run[0]!;
    const leadingJoin = first.kind === "gCoord" && first.coord.parts[0]!.items.length === 0;
    const attributive =
      lastItem?.kind === "package" &&
      !lastItem.package.adjCoord &&
      (lastItem.package.adjs.length > 0 || !leadingJoin);
    if (!attributive && run.length === 1 && run[0]!.kind === "gCoord") {
      out.push(run[0]!);
      i = j;
      continue;
    }
    if (attributive && lastItem.kind === "package") {
      const pkg = lastItem.package;
      const tokens: GToken[] = [...pkg.adjs.map((adj): GItem => ({ kind: "adj", adj })), ...run.flatMap(gTokens)];
      const adjCoord = gCoordFromTokens(tokens);
      lastItem.package = { ...pkg, adjs: gCoordAdjs(adjCoord), adjCoord };
    } else {
      out.push({ kind: "gCoord", coord: gCoordFromTokens(run.flatMap(gTokens)) });
    }
    i = j;
  }
  return out;
}

function flattenGCoord(cst: CstNode): Unit[] {
  const parts = coordParts(cst, "gCoord", "gCoordPart");
  const units: Unit[] = [];
  for (const part of parts) {
    for (const g of childNodes(part, "gPackage")) {
      units.push({ kind: "predicate", adj: buildGPackage(g) });
    }
    // Keep the fence (`gul`, `gel`, …) and its shared word so neither is silently dropped.
    const { join, shared } = joinFromClose(partJoinClose(part, "gJoinClose"));
    if (join) units.push({ kind: "predicate", adj: { word: join, modifiers: [] } });
    for (const item of shared) {
      if (item.word.pos === "g") units.push({ kind: "predicate", adj: item as GPackage });
      else if (item.word.pos === "h") units.push({ kind: "h", unit: item as HUnit });
    }
  }
  return units;
}

function buildUnit(cst: CstNode): Unit {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return { kind: "island", island: buildIsland(island) };
  const np = npCoordCst(cst);
  if (np) return { kind: "np", coord: buildNpCoord(np) };
  const vp = childNodes(cst, "vpCoord")[0];
  if (vp) return { kind: "vp", coord: buildVpCoord(vp) };
  const g = childNodes(cst, "gCoord")[0];
  if (g) {
    const preds = flattenGCoord(g);
    return preds[0] ?? { kind: "predicate", adj: { word: lexWordFromToken(childToken(g, "G")!), modifiers: [] } };
  }
  const h = childNodes(cst, "hCoord")[0];
  if (h) {
    const hs = flattenHUnits(h);
    return hs[0] ?? { kind: "h", unit: { word: lexWordFromToken(childToken(h, "H")!), modifiers: [] } };
  }
  const hook = childNodes(cst, "hookUnit")[0];
  if (hook) return buildHookUnit(hook);
  const pair = childNodes(cst, "sameRolePair")[0];
  if (pair) return buildSameRolePair(pair)[0]!;
  throw new SentenceParseError(`Unhandled unit: ${Object.keys(cst.children).join(",")}`);
}

function expandUnits(cst: CstNode): Unit[] {
  const island = childNodes(cst, "islandUnit")[0];
  if (island) return [{ kind: "island", island: buildIsland(island) }];
  const np = npCoordCst(cst);
  if (np) return [{ kind: "np", coord: buildNpCoord(np) }];
  const vp = childNodes(cst, "vpCoord")[0];
  if (vp) return [{ kind: "vp", coord: buildVpCoord(vp) }];
  const g = childNodes(cst, "gCoord")[0];
  if (g) {
    const coord = buildGCoord(g);
    return coord.parts.some((part) => part.join) ? [{ kind: "gCoord", coord }] : flattenGCoord(g);
  }
  const h = childNodes(cst, "hCoord")[0];
  if (h) return flattenHUnits(h);
  const hook = childNodes(cst, "hookUnit")[0];
  if (hook) return [buildHookUnit(hook)];
  const pair = childNodes(cst, "sameRolePair")[0];
  if (pair) return buildSameRolePair(pair);
  return [buildUnit(cst)];
}

function buildClauseItem(cst: CstNode): Clause {
  const standInTok = childToken(cst, "standIn");
  const units = chainUnits(cst).flatMap(expandUnits);
  if (!standInTok) return finalizeClause(units);
  const standIn: Unit = { kind: "clauseCoord", coord: { links: [{ join: lexWordFromToken(standInTok) }] } };
  if (units.length === 0) return { units: [standIn] };
  const rest = finalizeClause(units);
  return { ...rest, units: [standIn, ...rest.units] };
}

/** The innermost forward dependent a clause opens: its stand-in's sentence, or that sentence's own. */
function innermostDependent(clause: Clause | undefined): OdoDependent | undefined {
  let dep = clause?.dependent;
  while (dep?.clause.dependent) dep = dep.clause.dependent;
  return dep;
}

/**
 * Join clause items. The sentence after a forward stand-in runs to the end of the written sentence,
 * so clause joins after it stay inside that dependent (dependents.md#dependent-clauses).
 */
function joinClauseItems(items: (Clause | undefined)[], joins: LexWord[]): Clause {
  if (joins.length === 0) return items[0]!;
  const at = items.findIndex((item, i) => i < joins.length && innermostDependent(item));
  if (at >= 0) {
    const dep = innermostDependent(items[at])!;
    dep.clause = joinClauseItems([dep.clause, ...items.slice(at + 1)], joins.slice(at));
    return joinClauseItems(items.slice(0, at + 1), joins.slice(0, at));
  }
  return {
    units: [
      {
        kind: "clauseCoord",
        coord: { first: items[0], links: joins.map((join, i) => ({ join, clause: items[i + 1] })) },
      },
    ],
  };
}

function buildClause(cst: CstNode): Clause {
  const items: CstNode[] = [];
  const joins: IToken[] = [];
  for (let node: CstNode | undefined = cst; node; node = childNodes(node, "clauseRest")[0]) {
    items.push(...childNodes(node, "clauseItem"));
    joins.push(...childTokens(node, "midJoin"));
  }
  return joinClauseItems(items.map(buildClauseItem), joins.map(lexWordFromToken));
}

function impliedForceFromPolars(polars: LexWord[]): ImpliedForce | undefined {
  if (polars.length === 0) return undefined;
  const last = polars[polars.length - 1]!;
  return last.ending === "m" ? "yam" : "yal";
}

/** One left-edge node with its right-recursive rest ({@link AgebenSentenceParser.leftEdgeForce}) merged in, in order. */
function flattenEdge(cst: CstNode): CstNode {
  const rest = childNodes(cst, "leftEdgeRest")[0];
  if (!rest) return cst;
  const inner = flattenEdge(rest);
  const children: CstNode["children"] = {};
  for (const [key, kids] of [...Object.entries(cst.children), ...Object.entries(inner.children)]) {
    if (key !== "leftEdgeRest") children[key] = [...(children[key] ?? []), ...kids] as CstNode["children"][string];
  }
  return { ...cst, children };
}

function buildLeftEdge(edge: CstNode | undefined): LeftEdge {
  if (!edge) {
    return { vocatives: [], interjections: [], polars: [], impliedForce: "yal" };
  }
  const cst = flattenEdge(edge);

  const words = childNodes(cst, "turnWord");
  const mods = (word: CstNode): TurnWordMods => {
    const glCst = childNodes(word, "glAdj")[0];
    const w = childTokens(word, "W").map(lexWordFromToken);
    return { ...(glCst ? { glAdj: buildGPackage(glCst) } : {}), ...(w.length > 0 ? { w } : {}), adjs: adjNodes(word).map(buildGPackage) };
  };
  const described = (list: TurnWordMods[]) => list.some((m) => m.glAdj || m.w || m.adjs.length > 0);
  const calls = words.filter((word) => childToken(word, "Vocative"));
  const reactions = words.filter((word) => childToken(word, "Interjection"));
  const vocatives = calls.map((call) => lexWordFromToken(childToken(call, "Vocative")!));
  const vocativeAdjs = calls.map(mods);
  const interjections = reactions.map((reaction) => lexWordFromToken(childToken(reaction, "Interjection")!));
  const interjectionMods = reactions.map(mods);
  const polars = childTokens(cst, "Polar").map(lexWordFromToken);
  const hookTok = childToken(cst, "Hook");
  const forceTok = childToken(cst, "Force");
  const force = forceTok ? lexWordFromToken(forceTok) : undefined;
  const leadTok = childToken(cst, "LeadForce");
  const impliedForce = force ? undefined : impliedForceFromPolars(polars) ?? "yal";
  const hookModifiers = childTokens(cst, "W").map(lexWordFromToken);

  return {
    vocatives,
    ...(described(vocativeAdjs) ? { vocativeAdjs } : {}),
    interjections,
    ...(described(interjectionMods) ? { interjectionMods } : {}),
    polars,
    hook: hookTok ? lexWordFromToken(hookTok) : undefined,
    hookModifiers: hookModifiers.length > 0 ? hookModifiers : undefined,
    leadForce: leadTok ? lexWordFromToken(leadTok) : undefined,
    force,
    impliedForce,
  };
}

function buildBodyClause(cst: CstNode, trailingPunct?: IToken): BodyClause {
  const linkerTok = childToken(cst, "Linker") ?? childToken(cst, "crossJoin");
  const clauseCst = childNodes(cst, "clause")[0];
  const marker = childToken(cst, "topicMarker");
  return {
    ...(marker ? { topicMarker: lexWordFromToken(marker) } : {}),
    linker: linkerTok ? lexWordFromToken(linkerTok) : undefined,
    clause: clauseCst ? buildClause(clauseCst) : { units: [] },
    punct: trailingPunct ? punctFromToken(trailingPunct) : undefined,
  };
}

/** A one-citation sentence: its phrase is the body's only unit, a noun list with no join ({@link BodyClause.fragment}). */
function buildFragment(cst: CstNode, trailingPunct?: IToken): BodyClause {
  return {
    fragment: true,
    clause: { units: [{ kind: "np", coord: buildNpCoord(cst) }] },
    punct: trailingPunct ? punctFromToken(trailingPunct) : undefined,
  };
}

/** The tokens under a CST node, in no particular order. */
function cstTokens(cst: CstNode): IToken[] {
  return Object.values(cst.children).flatMap((kids) => kids.flatMap((kid) => ("image" in kid ? [kid] : cstTokens(kid))));
}

/**
 * Group the document's sentences into utterances. A sentence with a left edge opens a new utterance, and so does one
 * that starts with a hook (an extra-noun hook after a sentence end starts a new turn). A bare body (no `/x/` word in
 * front) after a question, command, request or prohibition opens one too: it is a statement, implied `yal`; only a
 * sentence linker keeps the prior act (sentence-linkers.md#past-a-period). So does any sentence after a bodiless turn of a
 * call, *yes* / *no*, or an interjection ({@link afterTurnWord}). Any other sentence continues the utterance
 * before it. Each body takes the period right after its sentence.
 */
export function buildUtterances(cst: CstNode, tokens: IToken[]): Utterance[] {
  const position = new Map(tokens.map((token, i) => [token, i]));
  const sentences = childNodes(cst, "sentence").map((sentence) => {
    const at = cstTokens(sentence).map((token) => position.get(token)!);
    return { cst: sentence, start: Math.min(...at), end: Math.max(...at) };
  });
  const utterances: Utterance[] = [];
  for (const sentence of sentences) {
    const edge = childNodes(sentence.cst, "leftEdge")[0];
    const body = childNodes(sentence.cst, "edgeBody")[0] ?? childNodes(sentence.cst, "bodyClause")[0];
    const fragment = childNodes(sentence.cst, "fragment")[0];
    const prior = utterances.at(-1);
    if (!prior || edge || tokenIs(tokens[sentence.start]!, Hook) || afterNonStatement(prior, body) || afterTurnWord(prior, body)) {
      utterances.push({ left: buildLeftEdge(edge), bodies: [] });
    }
    const next = tokens[sentence.end + 1];
    const punct = next && tokenIs(next, Period) ? next : undefined;
    if (body) utterances.at(-1)!.bodies.push(buildBodyClause(body, punct));
    if (fragment) utterances.at(-1)!.bodies.push(buildFragment(fragment, punct));
  }
  return utterances;
}

/**
 * A bare body after an utterance whose real act is not a statement: no sentence linker, topic word or cross-period join
 * in front, so it starts its own implied statement (sentence-linkers.md#past-a-period).
 */
function afterNonStatement(prior: Utterance, body: CstNode | undefined): boolean {
  const act = actWord(prior.left);
  if (!act || (act.family.kind === "joinMarker" && act.family.series === "a")) return false;
  return !body || !(childToken(body, "Linker") ?? childToken(body, "crossJoin") ?? childToken(body, "topicMarker"));
}

/**
 * A sentence after a turn word closed by a period with no body: a call, *yes* / *no*, or an interjection is a whole move
 * of its own, so the next sentence starts its own utterance; it is not said to that person by the call and carries no
 * polar link or interjection frame (sentence-linkers.md#past-a-period). When the turn also wrote an act word, only a bare
 * body leaves it; a sentence linker keeps that act ({@link afterNonStatement}).
 */
function afterTurnWord(prior: Utterance, body: CstNode | undefined): boolean {
  const { vocatives, polars, interjections } = prior.left;
  if (prior.bodies.length > 0 || vocatives.length + polars.length + interjections.length === 0) return false;
  if (!actWord(prior.left)) return true;
  return !body || !(childToken(body, "Linker") ?? childToken(body, "crossJoin") ?? childToken(body, "topicMarker"));
}
