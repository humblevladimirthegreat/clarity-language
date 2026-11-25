/** Structure checks on the parsed tree: units in a clause, joins and lists, hosted words, offsets, channels and islands. */
import { CLOSED } from "../closed-roots.js";
import { joinParts, isSharedGPackage, isSharedHUnit, isScaleShared, visitUnit, type Visitor, vpUnitLists, type AstNode, visitResult } from "./ast-walk.js";
import { isStandIn, type ClassifyTables, isGroundsChannel, isAsOfOverlay, isBarStance, isZoneStance } from "./classify.js";
import { enforceAsOfWord } from "./enforce-binding.js";
import { enforceRetiredHUnit } from "./enforce-retired.js";
import { isRankMarker } from "./enforce-word.js";
import { ConstructionError } from "./enforce.js";
import { type HookJob, mixedSpanEnds } from "./hook-jobs.js";
import { rolePronounRoots, isTopicPronoun, isGenericPronoun } from "./resolve.js";
import { joinHook, KIND_SERIES, RANK_SERIES, actWord } from "./series.js";
import type { LexWord, Unit, CoordShared, HUnit, NpCoord, ParseResult, Clause, LeftEdge, IslandUnit } from "./types.js";
import { doubledVerbSlot } from "./verb-items.js";

/** A hooked join's landmark: the `bl-` word after hook **-l** or **-m**, and none after point-back **-r** (hooked-joins.md#hooked-joins). */
function enforceHookedJoinLandmark(join: LexWord, landmark: LexWord | undefined): void {
  const hook = joinHook(join);
  if (!hook) return;
  if (hook.endsWith("r")) {
    if (landmark) throw new ConstructionError("hookedJoinPointBackLandmark", `${join.raw} ${landmark.raw}`);
    return;
  }
  if (!landmark) throw new ConstructionError("hookedJoinLandmark", join.raw);
  // Only an `/h/` hooked join takes a clause (hooked-joins.md#hooked-joins-clause).
  if (join.pos !== "h" && isStandIn(landmark)) throw new ConstructionError("hookedJoinClause", `${join.raw} ${landmark.raw}`);
}

export function series(word: LexWord | undefined): string | undefined {
  return word?.family.kind === "joinMarker" ? word.family.series : undefined;
}

function isHinge(word: LexWord): boolean {
  return word.overlay?.kind === "clause_hinge";
}

/** Hook vowels with no reading in a placement: same-role `ae`, and discourse `oe` / `ua` / `uo` / `ue` (hooks.md). */
function enforceHookSlot(word: LexWord, job: HookJob | undefined): void {
  if (word.family.kind !== "hook") return;
  const vowels = word.family.form.slice(0, -1);
  if (job === "clause" && vowels === "ae") throw new ConstructionError("hookSameRoleStack", word.raw);
  if (job === "discourse" && word.ending === "r" && vowels.length > 1) throw new ConstructionError("hookDiscourseStack", word.raw);
  if (job === "discourse" && ["oe", "ua", "uo", "ue"].includes(vowels)) throw new ConstructionError("hookDiscourseStack", word.raw);
}

function isRespectively(word: LexWord): boolean {
  return word.overlay?.kind === "pairing";
}

/** A marked list is an and-list paired with another and-list of the same length (joins.md § Respectively). */
function enforceRespectively(units: Unit[]): void {
  const lists: { length: number; marker?: string; raw: string }[] = [];
  for (const part of joinParts(units)) {
    const joinModifiers = part.joinModifiers;
    for (const w of joinModifiers) {
      if (!isRespectively(w)) throw new ConstructionError("joinDetail", `${w.raw} ${part.join?.raw ?? ""}`.trim());
    }
    if (series(part.join) !== "a" || part.items < 2) {
      if (joinModifiers.length > 0) throw new ConstructionError("joinDetail", `${joinModifiers[0]!.raw} ${part.join?.raw ?? ""}`.trim());
      continue;
    }
    if (joinModifiers.length > 0 && part.join!.ending !== "l" && part.join!.ending !== "m") {
      throw new ConstructionError("joinDetail", `${joinModifiers[0]!.raw} ${part.join!.raw}`);
    }
    lists.push({ length: part.items, marker: joinModifiers[0]?.raw, raw: part.join!.raw });
  }
  lists.forEach((list, i) => {
    if (!list.marker) return;
    if (!lists.some((other, j) => j !== i && other.length === list.length)) {
      throw new ConstructionError("respectivePartner", `${list.marker} ${list.raw}`);
    }
  });
}

/** A `/w/` ordinal (`wrodol`) is a place on a scale: it needs the superlative shape, a single name before `zol` / `zuol` (comparatives.md § superlatives). */
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
    // Evidence clause (evidentiality.md#evidence-clause): `barl`, alone or after the offset; never a hinge stack.
    if (bound.pos !== "b" || s !== "a") throw new ConstructionError("standInHost", `${host.raw} ${bound.raw}`);
    const prev = units[index - 1];
    if (prev?.kind === "h" && !prev.unit.hosted && isHinge(prev.unit.word)) {
      throw new ConstructionError("hingeStack", `${prev.unit.word.raw} ${host.raw}`);
    }
    return;
  }
  // A likeness's model may be an event: `humum blarl` + the next sentence (relations.md#likeness). So may the time an
  // `/h/` hooked join bounds (`huxal blarl`, hooked-joins.md#hooked-joins-clause).
  if (!hosted.grounds && (host.overlay?.kind === "likeness" || joinHook(host)) && bound.pos === "b" && s === "a") return;
  if (hosted.grounds || !isHinge(host)) throw new ConstructionError("standInHost", `${host.raw} ${bound.raw}`);
  const undoHost = host.overlay!.gloss === "so-that" || host.overlay!.gloss === "if";
  if (bound.pos !== "b" || !(s === "a" || (s === "u" && undoHost))) {
    throw new ConstructionError(s === "u" ? "standInHostUndo" : "standInHost", `${host.raw} ${bound.raw}`);
  }
  const prev = units[index - 1];
  if (prev?.kind === "h" && !prev.unit.hosted && isHinge(prev.unit.word)) {
    const stack = `${prev.unit.word.overlay!.gloss} ${host.overlay!.gloss.replace(/^because\..*/, "because")}`;
    if (stack !== "only-if because" && stack !== "although if") {
      throw new ConstructionError("hingeStack", `${prev.unit.word.raw} ${host.raw}`);
    }
  }
}

/** `+` / `-` of a signed offset in a hosted `/b/` (digitless `brul`, or a measure amount); zero has no sign. */
export function offsetSign(bound: LexWord | undefined, amount?: LexWord): "+" | "-" | undefined {
  const number = [bound, amount].find((w) => w?.family.kind === "number");
  if (!number || number.family.kind !== "number") return undefined;
  const { marker, groups } = number.family.stem;
  if (groups.length > 0 && groups.every((g) => /^(0+|(ma)+)$/.test(g.mantissa ?? "") && !g.exponentDigits)) return undefined;
  if (marker === "+" || marker === "ra") return "+";
  if (marker === "-" || marker === "ru") return "-";
  return undefined;
}

const TIME_HINGES = new Set(["until", "by", "before", "after", "while"]);

function isTimeHinge(word: LexWord): boolean {
  return word.pos === "h" && word.overlay?.kind === "clause_hinge" && TIME_HINGES.has(word.overlay.gloss);
}

/** A `/th/` channel or PLAN: what licenses an offset from now (design-decisions D-10). */
function isWarrant(word: LexWord): boolean {
  return (word.pos === "th" && word.overlay?.kind === "evidential") || isPlan(word);
}

function isPlan(word: LexWord): boolean {
  return word.pos === "th" && word.overlay?.kind === "plan";
}

/** MEMORY takes only an earlier offset, LIVE none, and PLAN only a later one (dated-channel.md#counting-from-now). */
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

/** A first-hand channel: LIVE or MEMORY, which no hand count can follow (evidentiality.md#hand-depth). */
function isFirstHandChannel(word: LexWord): boolean {
  if (word.pos !== "th" || word.overlay?.kind !== "evidential") return false;
  const base = word.overlay.gloss.split(".")[0];
  return base === "LIVE" || base === "MEMORY";
}

/** `th#N` counts hands between the event and you, so a first-hand channel in the same clause contradicts it. */
export function enforceHandDepthChannel(units: Unit[]): void {
  const depth = units.find(
    (unit) => unit.kind === "h" && unit.unit.word.pos === "th" && unit.unit.word.family.kind === "number" && isRankMarker(unit.unit.word.family.stem.marker),
  );
  const first = units.find((unit) => unit.kind === "h" && isFirstHandChannel(unit.unit.word));
  if (depth?.kind === "h" && first?.kind === "h") {
    throw new ConstructionError("handDepthChannel", `${first.unit.word.raw} ${depth.unit.word.raw}`);
  }
}

/** Offsets from now (D-10): channel sign, stance-only as-of offsets, and time hinges that need a warrant. */
export function enforceOffsets(units: Unit[], directive: boolean): void {
  let warranted = directive;
  const hinges: HUnit[] = [];
  for (const unit of units) {
    if (unit.kind !== "h") continue;
    const { word, hosted } = unit.unit;
    const sign = offsetSign(hosted?.bound, hosted?.amount);
    if (isWarrant(word)) warranted = true;
    if (!sign) continue;
    const detail = `${word.raw} ${hosted!.bound.raw}${hosted!.amount ? ` ${hosted!.amount.raw}` : ""}`;
    if (isAsOfOverlay(word) && word.pos !== "th") throw new ConstructionError("asOfOffset", detail);
    enforceChannelSign(word, hosted);
    if (isTimeHinge(word)) hinges.push(unit.unit);
  }
  if (!warranted && hinges.length > 0) {
    const hinge = hinges[0]!;
    throw new ConstructionError("hingeOffsetWarrant", `${hinge.word.raw} ${hinge.hosted!.bound.raw}`);
  }
}

/** A rank fence's bar: one value-setting stance, ranked against one item (bars.md#bars). */
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

/** Whose say: a `bl-` word names someone over the act (`v`), or, under pair reach, the one party a participant's say is toward (permission-consent.md#say-words). */
function enforceSayHost(unit: HUnit): void {
  const family = unit.word.family;
  if (family.kind !== "say") return;
  const bound = unit.hosted?.bound;
  if (bound && family.part !== "v" && !family.reach.includes("e")) {
    throw new ConstructionError("sayHost", `${unit.word.raw} ${bound.raw}`);
  }
}

/**
 * A bare `v` on **-m** is the speaker saying so, so a statement has no reading for it when the speaker is a participant:
 * the speaker's say over their own act is their part (`hwazem`). Under a question it asks the listener (*May I sit?*).
 */
export function enforceSaySpeaker(result: ParseResult): void {
  for (const utterance of result.utterances) {
    const force = actWord(utterance.left)?.raw;
    if (force === "yel" || force === "yem") continue;
    for (const { clause } of utterance.bodies) {
      if (!clause.units.some(isSpeakerParticipant)) continue;
      for (const unit of clause.units) {
        if (unit.kind !== "h" || unit.unit.hosted) continue;
        const { word } = unit.unit;
        if (word.family.kind === "say" && word.family.part === "v" && word.ending === "m") throw new ConstructionError("saySpeaker", word.raw);
      }
    }
  }
}

/** A `/z/` `/d/` `/b/` phrase that holds the speaker (`uwen`, or `ayan` with the listener). */
function isSpeakerParticipant(unit: Unit): boolean {
  if (unit.kind !== "np") return false;
  return unit.coord.parts.some((part) =>
    part.items.some((item) => {
      if (item.kind !== "package") return false;
      const head = item.package.head;
      return head.ending === "n" && head.family.kind === "content" && (head.family.roots[0] === CLOSED.microphone || head.family.roots[0] === CLOSED.handshake);
    }),
  );
}

/**
 * WANT, PLAN and DECISION host no person: with no holder they are the speaker's own, and someone else's goes through a
 * holder seam, so a `/b/` cannot slip in another person's wish, plan or choice with no grounds (want-and-decide.md#whose-intention).
 * WANT and PLAN take a time offset; DECISION carries no time, so it takes no `/b/` at all.
 */
function enforceIntentionHost(unit: HUnit): void {
  const bound = unit.hosted?.bound;
  const kind = unit.word.overlay?.kind;
  if (unit.word.pos !== "th" || !bound || (kind !== "want" && kind !== "plan" && kind !== "decision")) return;
  const offset = bound.family.kind === "number" || unit.hosted?.amount?.family.kind === "number";
  if (kind !== "decision" && offset) return;
  throw new ConstructionError("intentionHost", `${unit.word.raw} ${bound.raw}`);
}

/** `uom` + a stance: the stance must say something the event can go against, and holds no stand-in (contrary-to.md#contrary-to-stance). */
function enforceZone(hook: LexWord, zone: HUnit, tables: ClassifyTables): void {
  if (!isZoneStance(zone.word, tables)) throw new ConstructionError("zoneKind", `${hook.raw} ${zone.word.raw}`);
  enforceChannelSign(zone.word, zone.hosted);
  const stand = zone.hosted && (zone.hosted.grounds ?? zone.hosted.bound);
  if (stand && isStandIn(stand)) throw new ConstructionError("standInHost", `${zone.word.raw} ${stand.raw}`);
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

/** The role a clause unit fills: a noun phrase's slot, a verb phrase, or its first word's letter; none for a hook or a clause. */
function unitRole(unit: Unit | undefined): string | undefined {
  if (!unit || unit.kind === "hook" || unit.kind === "clauseCoord" || unit.kind === "island" || unit.kind === "linker") return undefined;
  if (unit.kind === "np") return unit.coord.level;
  if (unit.kind === "vp") return "v";
  return edgeWord(unit, "first")?.pos;
}

/** A fill-ask blank as a whole phrase: one join word on **-r** with no items (`zar`, `dar`, `var`). */
function isBlankUnit(unit: Unit | undefined): boolean {
  const parts = unit?.kind === "np" || unit?.kind === "vp" ? unit.coord.parts : undefined;
  return parts?.length === 1 && parts[0]!.items.length === 0 && parts[0]!.join?.ending === "r";
}

/**
 * A same-role word relates B, the phrase right after it, to A, the nearest phrase of B's role before it (same-role-words.md):
 * `zazozon abam zahelan vowurol.` B keeps A's letter, and a `/b/` after the word is no extra noun. With no A before it, a
 * blank B (`yel abam zar zazozon vowurol.`) takes A from the nearest phrase of its role after the pair.
 */
function enforceSameRoleWord(units: Unit[], at: number): void {
  const unit = units[at] as Extract<Unit, { kind: "hook" }>;
  const next = units[at + 1];
  const role = unitRole(next);
  const run = [unit.word.raw, edgeWord(next, "first")?.raw].filter(Boolean).join(" ");
  if (unit.job === "extraNoun" || unit.job === "genitive" || unit.job === "stray" || role === "b") {
    throw new ConstructionError("sameRoleExtraNoun", run);
  }
  if (unit.job === "discourse" || !role) throw new ConstructionError("sameRoleSides", run);
  const before = units.slice(0, at).reverse().find((u) => unitRole(u) === role);
  const after = isBlankUnit(next) ? units.slice(at + 2).find((u) => unitRole(u) === role) : undefined;
  if (!before && !after) throw new ConstructionError("sameRoleSides", run);
}

/** Two number ends of a range share one line: an amount and a rank have no range (ranges.md#ranges). */
function enforceSpanEnds(hook: LexWord, prev: Unit | undefined, next: Unit | undefined): void {
  const a = edgeWord(prev, "last");
  const b = edgeWord(next, "first");
  if (mixedSpanEnds(a, b)) throw new ConstructionError("rangeEndpointKind", `${a!.raw} ${hook.raw} ${b!.raw}`);
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
 * sake word, which is a whole sentence about the speaker (dependents.md#dependent-clauses, how-you-feel.md#feeling-no-object).
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

/** Checks over one unit list (a clause body or an island): hosts, stand-ins, hooks, as-of counts. */
function enforceUnitList(units: Unit[], tables: ClassifyTables): void {
  const doubled = doubledVerbSlot(units);
  if (doubled) throw new ConstructionError("verbSharedOwn", doubled.slot === "d" ? "two objects for one verb" : "two recipients for one verb");
  enforceRespectively(units);
  let hAsOf = 0;
  let thAsOf = 0;
  units.forEach((unit, i) => {
    const hosted = unit.kind === "h" ? unit.unit.hosted : undefined;
    if (unit.kind === "h" && hosted && (isStandIn(hosted.bound) || (hosted.grounds && isStandIn(hosted.grounds)))) {
      enforceHostedStandIn(units, i, unit.unit, tables);
    }
    if (unit.kind === "h") enforceSayHost(unit.unit);
    if (unit.kind === "h" && isAsOfOverlay(unit.unit.word)) {
      if (unit.unit.word.pos === "th") thAsOf += 1;
      else hAsOf += 1;
    }
    if (unit.kind === "hook" && unit.word.reading === "sameRole") {
      enforceSameRoleWord(units, i);
      return;
    }
    if (unit.kind === "hook" && unit.job === "stray") throw new ConstructionError("genitiveHost", unit.word.raw);
    if (unit.kind === "hook" && unit.job === "clause") enforceSameRole(unit.word, units[i - 1], units[i + 1]);
    if (unit.kind === "hook" && unit.job === "span") enforceSpanEnds(unit.word, units[i - 1], units[i + 1]);
    if (unit.kind === "hook" && unit.zone) enforceZone(unit.word, unit.zone, tables);
    if (unit.kind === "hook" && !unit.zone) enforceHookStandIn(unit.word, units[i + 1]);
    if (unit.kind === "hook") enforceHookSlot(unit.word, unit.job);
    if (unit.kind === "hook" && unit.word.ending === "r" && unit.job === "resume") {
      const next = units[i + 1];
      if (next?.kind === "np") throw new ConstructionError("hookResumeNoun", unit.word.raw);
    }
  });
  if (hAsOf > 1 || thAsOf > 1) throw new ConstructionError("asOfPerHost", "two as-of pairs");
}

/** The AST checks as one handler set over the walk ([ast-walk.ts](./ast-walk.ts)). */
export function structureVisitor(tables: ClassifyTables, places: { seen: Set<LexWord>; shaped: Set<LexWord> }): Visitor {
  return {
    // *Respectively* (`wazem`) sits only right before a `/z/` `/d/` `/b/` join word (joins.md § Respectively).
    word(word, slot) {
      if (isRespectively(word) && slot !== "joinModifier") throw new ConstructionError("joinDetail", word.raw);
      // An `/h/` hooked join is checked with its hosted slot; anywhere else one has no landmark slot.
      if (joinHook(word) && slot !== "head") enforceHookedJoinLandmark(word, undefined);
      if (isRankPlace(word)) places.seen.add(word);
    },
    join(join, site) {
      if (site.kind === "np") enforceHookedJoinLandmark(join, site.coord.parts[site.index]!.landmark);
      if (site.kind === "np") enforceShared(join, site.coord.parts[site.index]!.shared);
      if (site.kind === "vp") enforceShared(join, site.coord.parts[site.index]!.shared);
      if (site.kind === "np") {
        const part = site.coord.parts[site.index]!;
        const lone = part.items.length === 1 && (series(join) === "o" || series(join) === "uo");
        for (const item of part.shared) {
          if (isScaleShared(item)) continue;
          if (lone) for (const mod of item.modifiers) places.shaped.add(mod);
        }
      }
    },
    enter(node) {
      switch (node.kind) {
        case "utterance":
          if (node.utterance.left.hook?.reading === "sameRole") throw new ConstructionError("sameRoleSides", node.utterance.left.hook.raw);
          if (node.utterance.left.hook) enforceHookSlot(node.utterance.left.hook, "discourse");
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
        case "vp":
          for (const units of vpUnitLists(node.coord)) enforceUnitList(units, tables);
          enforceLeadingFence(node.coord.parts as { items: unknown[]; join?: LexWord }[], (part) => part.items.length === 0);
          return;
        case "g":
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
          enforceHookedJoinLandmark(node.unit.word, node.unit.hosted?.bound);
          enforceAsOfWord(node.unit.word, node.unit.hosted?.bound);
          enforceIntentionHost(node.unit);
          enforceRetiredHUnit(node.unit);
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

export function enforceForcePair(left: LeftEdge): void {
  // A polar word is one answer or one tag: not two in a row, and not before an act word (questions.md § polar particle).
  // An act or polar series with **-n** names no one to call (speech-moves.md#vocative).
  const seriesCall = left.vocatives.find((call) => call.family.kind === "joinMarker");
  if (seriesCall) throw new ConstructionError("turnSeriesCall", seriesCall.raw);
  const act = actWord(left);
  if (left.polars.length > 1 || (act && left.polars.some((polar) => (polar.at ?? 0) < (act.at ?? 0)))) {
    throw new ConstructionError("polarOrder", left.polars.map((polar) => polar.raw).join(" "));
  }
}

/** A bare `/ɡ/` after the verb is not a depictive or resultative (predication.md § Property); a `/ɡ/` before the object noun or with a hosted `/b/` is a different shape. */
export function enforceVerbPredicate(units: Unit[]): void {
  units.forEach((unit, i) => {
    if (unit.kind !== "predicate" || units[i - 1]?.kind !== "vp" || unit.adj.hosted) return;
    if (units[i + 1]?.kind === "np") return;
    throw new ConstructionError("predicateAfterVerb", unit.adj.word.raw);
  });
}

/**
 * A tag right after a `zual` / `zuam` / `zul` fence binds each member in turn (universals-domains.md#bound-tags): a
 * pseudonym (**-n**) is a constant, so it cannot be bound; and on the `zul` that denies a `zual` fence (not every) the
 * denial leaves no member for the tag to name.
 */
export function enforceFenceTag(node: AstNode): void {
  if (node.kind !== "np") return;
  node.coord.parts.forEach((part, i) => {
    const join = part.join;
    if (!part.tag || join?.family.kind !== "joinMarker") return;
    const series = join.family.series;
    if (!((series === "ua" && join.ending !== "n") || series === "u")) return;
    if (part.tag.ending === "n") throw new ConstructionError("tagConstantBound", `${join.raw} ${part.tag.raw}`);
    const before = node.coord.parts[i - 1]?.join;
    if (series === "u" && part.items.length === 0 && before?.family.kind === "joinMarker" && before.family.series === "ua") {
      throw new ConstructionError("tagNegatedEvery", `${before.raw} ${join.raw} ${part.tag.raw}`);
    }
  });
}

/**
 * A tag names a phrase that is not already a pronoun with one fixed form (tag-pronouns.md#naming-with-a-tag): never a special,
 * generic, or topic pronoun, or another tag. A resume or role pointer may take one.
 */
export function enforceTagHost(node: AstNode): void {
  if (node.kind !== "npPackage" || !node.pkg.tag) return;
  const head = node.pkg.head;
  const root = head.family.kind === "content" && head.family.roots.length === 1 ? head.family.roots[0]! : undefined;
  const special = head.ending === "n" && root !== undefined && rolePronounRoots().has(root);
  if (special || isTopicPronoun(head) || isGenericPronoun(head) || head.family.kind === "tag") {
    throw new ConstructionError("tagPronoun", `${head.raw} ${node.pkg.tag.raw}`);
  }
}

/** A command, request or prohibition act word (`yol`, `yom`, `yor`, `yul`, `yum`), not an answer word such as `yuol`. */
export const DIRECTIVE_ACT = /^y[ou][lmr]$/;

/**
 * A command, request or prohibition is not a claim or news, so on its own clause MIRATIVE (mirative.md#mirative), MAY
 * (knowing.md#may) and every channel but REPORTED, a relayed order (evidentiality.md#carry-forward), have no reading.
 */
export function enforceDirectiveRemarks(result: ParseResult): void {
  for (const scope of result.resolve?.scope ?? []) {
    const utterance = result.utterances[scope.utteranceIndex];
    if (!utterance || !DIRECTIVE_ACT.test(actWord(utterance.left)?.raw ?? "")) continue;
    if (!utterance.bodies.some((body) => body.clause === scope.clause)) continue;
    // A holder's stance is someone else's word on the command (holder.md#what-the-holder-covers), not the speaker's remark.
    for (const { key, word, holderHost } of scope.frames) {
      if (holderHost) continue;
      if (key === "overlay:mirative:th") throw new ConstructionError("directiveMirative", word.raw);
      if (key === "overlay:may:th") throw new ConstructionError("directiveMay", word.raw);
      if (key === "overlay:evidential:th" && word.overlay?.gloss.split(".")[0] !== "REPORTED") {
        throw new ConstructionError("directiveChannel", word.raw);
      }
    }
  }
}

/**
 * `/w/` grades a reaction, never a call; a number cheer or a `/y/` span takes no describing words at all
 * (more-turn-words.md#describe-turn-word).
 */
export function enforceTurnWordMods(left: LeftEdge): void {
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

/** A `gl-` adjective leans on the next noun, call, or reaction (or a mention marker on its topic span); one with nothing after it is left over (left-bound-adjectives.md#left-bound-adjectives). */
export function enforceGlLeans(result: ParseResult): void {
  const leaning = new Set<LexWord>();
  // The mention marker before a topic span leans on that span (spans-as-words.md#mention).
  for (const { bodies } of result.utterances) for (const { topicMarker } of bodies) if (topicMarker) leaning.add(topicMarker);
  // A `gl-` adjective before a call or reaction leans on it (more-turn-words.md#describe-turn-word).
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

/** `zuam gagadul thobam zel …`: a closed `ua` fence is the one item ranked against the bar after it (stance-bars.md#ranking-a-kind). */
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

/** `zual gagadul zul`: a `ua` fence is the one item a `u` join denies, *not every cat* (universals-domains.md#not-every). */
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
