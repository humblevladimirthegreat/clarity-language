import type { CstElement, CstNode, IToken } from "chevrotain";

import { classifyTokenBranch, isLexWordPayload, type TokenPayload } from "./tokens.js";
import { POLAR_GROUP, RESTRICTOR_GROUP, type JoinSeries } from "./constructions.js";
import { isDigitless, leadForceKind } from "./series.js";
import { isGreeting, isKindReference, isScaleShared, visitResult } from "./ast-walk.js";
import { numberMarkerIdentity } from "./resolve.js";
import type { Clause, LexWord, NumberStem, ParseResult, ResolveInfo } from "./types.js";

/** `overlay.<sense_form>.<pos>` for one lexicon-overlays.csv row. */
export function overlayConstructionId(overlay: { senseForm: string; pos: string }): string {
  return `overlay.${overlay.senseForm}.${overlay.pos}`;
}

function isCstNode(element: CstElement): element is CstNode {
  return "children" in element;
}

/** Construction IDs a word carries on its own (`word.*`), independent of its slot. */
export function wordConstructions(word: LexWord): string[] {
  // A closed overlay is its own construction (its home is the overlay row's anchor).
  // A role pointer is taught with the pronouns, long before the other mid-word `x` families.
  const pointer = word.family.kind === "x" && word.family.xFamily === "pointer";
  const ids = [
    pointer ? "word.xFamily.pointer" : `word.family.${word.family.kind}`,
    word.overlay ? overlayConstructionId(word.overlay) : `word.reading.${word.reading}`,
  ];
  if (word.family.kind === "x" && !pointer) ids.push(`word.xFamily.${word.family.xFamily}`);
  if (word.ending) ids.push(`word.ending.${word.ending}`);
  if (word.plural && word.pos) ids.push(`word.plural.${word.pos}`);
  if (word.gl) ids.push("word.gl");
  if (word.hostOverlay) ids.push(overlayConstructionId(word.hostOverlay));
  // Classify re-reads a fused hook compound as content; the fusion is still its own construction.
  if (word.hookCompound) ids.push("word.family.hookCompound");
  ids.push(...featureConstructions(word));
  return ids;
}

/** Digitless-exponent class: which lesson a shorthand like `e`, `0e`, `e3`, `1e` belongs to. */
function digitlessExpClass(stem: NumberStem, exp: string): string {
  const negative = stem.marker === "-" || stem.marker === "ru";
  if (exp.includes("-e-") || (negative && exp === "e-")) return "shortfall";
  if (/^[+±-]?0e/.test(exp)) return "zero";
  if (/^e\d/.test(exp)) return "bareOom";
  if (/^\d+e/.test(exp)) return "hyperbole";
  return "landmark";
}

/** `number.*` features of one stem (numbers.md lessons). */
function numberFeatures(stem: NumberStem): string[] {
  const ids = [`number.marker.${numberMarkerIdentity(stem.marker)}`];
  if (isDigitless(stem)) ids.push("number.digitless");
  if (stem.groups.length > 1) ids.push("number.groups");
  if (stem.calendarOrdinal) ids.push("number.calendar");
  if (stem.digitlessExp) ids.push(`number.exp.${digitlessExpClass(stem, stem.digitlessExp)}`);
  for (const group of stem.groups) {
    if (group.exponentDigits) ids.push("number.exponent");
    if (group.decimal) ids.push("number.decimal");
    if (group.percent) ids.push("number.percent");
  }
  return ids;
}

const NUMBER_POS = new Set(["v", "h", "th", "y", "x"]);

/** Per-form features of a family whose forms are taught in different sections. */
function featureConstructions(word: LexWord): string[] {
  const { family } = word;
  if (word.hookCompound) return [`hook.${word.hookCompound.hook}`];
  if (family.kind === "number") {
    const ids = numberFeatures(family.stem);
    if (family.writingEndingMark) ids.push(`number.writingMark.${family.writingEndingMark}`);
    if (word.pos && NUMBER_POS.has(word.pos)) ids.push(`number.pos.${word.pos}`);
    return ids;
  }
  if (family.kind === "x") {
    const ids: string[] = [];
    if (family.numberStem) ids.push(...numberFeatures(family.numberStem));
    if (family.xFamily === "sake" && family.stanceVowel) {
      ids.push(`sake.stance.${family.stanceVowel}`);
      const horizon = family.horizon ?? word.ending;
      if (horizon === "l" || horizon === "m" || horizon === "r") ids.push(`sake.ending.${family.stanceVowel}.${horizon}`);
      if (family.horizon) ids.push("sake.emotion");
    }
    if (family.xFamily === "scope" && family.stanceVowel) ids.push(`scope.vowel.${family.stanceVowel}`);
    if (family.xFamily === "role") {
      if (family.scopeVowel) ids.push(`scope.vowel.${family.scopeVowel}`);
      if (family.roleVowel) ids.push(`role.vowel.${family.roleVowel}`);
      if (word.ending === "r") ids.push("role.instance");
    }
    if (family.pointerVowel) {
      if (family.roleVowel) ids.push(`pointer.role.${family.roleVowel}`);
      ids.push(`pointer.vowel.${family.pointerVowel}`);
      if (family.xFamily === "pointer" && word.ending === "l") ids.push("pointer.new");
      if (family.xFamily === "pointer" && word.ending === "m") ids.push("pointer.part");
    }
    return ids;
  }
  if (family.kind === "writingSpan") {
    const ids = family.marks.map((mark) => `span.mark.${mark}`);
    // A written `<…>` is the opaque / loan fence (spans.md#loans), the same lesson as a nested `<…>` payload.
    if (family.bracket === "<") ids.push("word.family.foreign");
    return ids;
  }
  if (family.kind === "hook") return [`hook.${family.form}`];
  if (family.kind === "hookCompound") return [`hook.${family.hook}`];
  if (family.kind === "joinMarker" && !word.overlay) {
    const { series } = family;
    if (word.reading === "standIn") return [`standIn.${series}`];
    if (word.reading === "standInBack") return [`standInBack.${series}`];
    if (word.reading === "restrictor") return [`restrictor.${RESTRICTOR_GROUP[series as keyof typeof RESTRICTOR_GROUP]}`];
    if (word.pos === "y") {
      if (series.length > 1) return [`polar.${POLAR_GROUP[series as keyof typeof POLAR_GROUP]}`];
      return word.ending === "m" ? [`force.${series}`, "force.soft"] : [`force.${series}`];
    }
    if (word.reading === "join") return [`join.${series}`];
  }
  return [];
}

function addToken(token: IToken, out: Set<string>): void {
  const payload = token.payload as TokenPayload | undefined;
  if (!payload || !isLexWordPayload(payload)) return;
  out.add(`token.${classifyTokenBranch(payload).branch}`);
  for (const id of wordConstructions(payload)) out.add(id);
}

/**
 * Noun-phrase rules come one per slot. Lists and their parts keep the slot in their trace names (`zCoord.zCoordPart`),
 * because each slot is taught in its own section; a noun package and a join close are one lesson at every slot.
 */
function traceRule(name: string): string {
  if (/^[zdb](Package|Noun|NounTagged|StandIn|StandInTagged|Tag)$/.test(name) || name === "citation") return "npPackage";
  if (/^unit(After[A-Z])?(Open|Shared)?$/.test(name) || /^(hookChain|unitAfterCross|unitNoGlue|unitAfterTurn)$/.test(name)) return "unit";
  if (/^clause(AfterCross|NoGlue|AfterTurn)$/.test(name)) return "clause";
  if (/^hookUnit(Plain|Open|Closed)$/.test(name)) return "hookUnit";
  if (/^clauseItem(AfterCross|NoGlue|AfterTurn)$/.test(name)) return "clauseItem";
  if (/^bodyClause(NoGlue|AfterTurn)$/.test(name)) return "bodyClause";
  if (/^leftEdge(Force|Turn|Other|Tag)$/.test(name)) return "leftEdge";
  if (name === "vpVerb" || name === "vpCoordPartFirst") return "vpCoordPart";
  if (/^gSingle(Open|Closed)$/.test(name) || /^gCoordPart(Plain|Lead)$/.test(name)) return "gCoordPart";
  if (name === "gCoordLead" || name === "gCoordPlainLead") return "gCoord";
  if (name === "gJoinCloseRespectively") return "gJoinClose";
  if (/^(gPackage(Open|Closed)|gListItem|glPackage)$/.test(name)) return "gPackage";
  if (/^hSingle(Open|Closed)?$/.test(name) || name === "hGrounds") return "hCoordPart";
  if (/^hUnit(Open|Closed)$/.test(name) || /^(hStandIn|hScale(Open|Closed)?|frameUnit(Open|Closed)?|barUnit|fenceBarUnit|barStandIn|hSharedUnit)$/.test(name)) return "hUnitRule";
  if (/^(sharedAdj(Open|Closed)|sharedScale(Open)?|sharedAdverb)$/.test(name)) return "sharedAfterJoin";
  if (/^[zdb]Coord(Part)?(Open|Closed|Shared|Grounds)$/.test(name)) return name.replace(/(Open|Closed|Shared|Grounds)$/, "");
  if (/^[zdb]JoinClose(Open|Closed|Shared)?$/.test(name)) return "npJoinClose";
  return name;
}

/** Child keys of a noun list's part that are one lesson at every slot (`npCoordPart.itemHook`). */
const SLOTLESS_PART_KEYS = new Set(["itemHook", "itemHookBound", "groupTag"]);

/** The registry id of a CST child key under a rule. */
function traceId(rule: string, key: string): string {
  const name = traceRule(rule);
  return `sentence.${/^[zdb]CoordPart$/.test(name) && SLOTLESS_PART_KEYS.has(key) ? "npCoordPart" : name}.${key}`;
}

/** A leading act word is one grammar label for two lessons; its trace name carries the pair (`ForceEcho` / `ForceAnswer`). */
const LEAD_FORCE_NAMES = { emphatic: "ForceEcho", rhetorical: "ForceAnswer" } as const;

function leadForceName(token: CstElement): string | undefined {
  if (isCstNode(token)) return undefined;
  const payload = token.payload as TokenPayload | undefined;
  const kind = payload && isLexWordPayload(payload) ? leadForceKind(payload) : undefined;
  return kind && LEAD_FORCE_NAMES[kind];
}

/** Collect `sentence.*` / `token.*` / `word.*` IDs from one sentence CST. */
export function addCstConstructions(node: CstNode, out: Set<string>): void {
  for (const [key, elements] of Object.entries(node.children)) {
    if (traceRule(node.name) === "leftEdge" && key === "LeadForce") {
      for (const element of elements) {
        const name = leadForceName(element);
        if (name) out.add(`sentence.leftEdge.${name}`);
      }
    } else out.add(traceId(node.name, key));
    for (const element of elements) {
      if (isCstNode(element)) addCstConstructions(element, out);
      else addToken(element, out);
    }
  }
}

/** Collect `resolve.*` IDs from anaphor binds. */
export function addResolveConstructions(info: ResolveInfo | undefined, out: Set<string>): void {
  for (const bind of info?.anaphors ?? []) {
    out.add(`resolve.${bind.kind}.${bind.antecedent ? "bound" : "unbound"}`);
  }
}

type GastNode = { constructor: { name: string }; label?: string; nonTerminalName?: string; terminalType?: { name: string }; definition?: GastNode[] };

/** Every `sentence.rule.childKey` the grammar can produce (the sentence-layer inventory). */
export function sentenceGrammarKeys(grammar: Record<string, { definition: unknown[] }>): Set<string> {
  const keys = new Set<string>();
  const walk = (rule: string, defs: GastNode[]): void => {
    for (const def of defs) {
      const kind = def.constructor.name;
      const add = (key: string): void => {
        if (traceRule(rule) === "leftEdge" && key === "LeadForce") {
          for (const name of Object.values(LEAD_FORCE_NAMES)) keys.add(`sentence.leftEdge.${name}`);
        } else keys.add(traceId(rule, key));
      };
      if (kind === "NonTerminal") {
        add(def.label ?? def.nonTerminalName!);
        continue; // its definition is the referenced rule, walked on its own
      }
      if (kind === "Terminal") add(def.label ?? def.terminalType!.name);
      if (def.definition) walk(rule, def.definition);
    }
  };
  for (const [name, rule] of Object.entries(grammar)) walk(name, rule.definition as GastNode[]);
  return keys;
}

/** Existence: no `/v/`, a new `/z/` noun first , then only `/ɡ/`, hooks, or `/b/` (predication.md § existence). */
function isExistence(clause: Clause): boolean {
  const [first, ...rest] = clause.units;
  if (first?.kind !== "np" || first.coord.level !== "z") return false;
  const heads = first.coord.parts.flatMap((part) =>
    part.items.flatMap((item) => (item.kind === "package" ? [item.package] : [])),
  );
  // `zual` / `zuam` + kind (*every K*) and kind reference `zuan` + kind are known; the shared /ɡ/ is the kind, so a further /ɡ/ is the property (joins.md § universals).
  const universal = first.coord.parts.some(
    (part) =>
      (part.items.length === 0 &&
        part.join?.family.kind === "joinMarker" &&
        part.join.family.series === "ua" &&
        (part.join.ending === "l" || part.join.ending === "m")) ||
      isKindReference(part),
  );
  // A shared /ɡ/ after a join (`zazawan zalahen zal gamadam` *both are challenging*) describes every member.
  const sharedG =
    !universal && first.coord.parts.some((part) => part.join && part.shared.some((item) => item.word.pos === "g"));
  const described =
    sharedG ||
    rest.some((unit) => unit.kind === "predicate" || unit.kind === "gCoord") ||
    heads.some((pkg) => pkg.adjs.length > 0);
  // A name, a resume, or a noun anchored by used-by `em` + `/b/` is known, so a /ɡ/ word is a property claim.
  // The `em` pair anchors the first noun only when it sits right after it (past the noun's own adjectives).
  const afterAdjs = rest.find((unit) => unit.kind !== "predicate" && unit.kind !== "gCoord");
  const anchored = afterAdjs?.kind === "hook" && afterAdjs.job === "genitive";
  const known = universal || anchored || heads.some((pkg) => pkg.head.ending === "n" || pkg.head.ending === "r");
  if (described && known) return false;
  return rest.every(
    (unit) => unit.kind === "predicate" || unit.kind === "gCoord" || unit.kind === "hook" || (unit.kind === "np" && unit.coord.level === "b"),
  );
}

/** Collect `reading.*` IDs from utterance and clause shapes and shared scales. */
export function addReadingConstructions(result: ParseResult, out: Set<string>): void {
  for (const utterance of result.utterances) {
    const force = utterance.left.force?.raw;
    if (utterance.bodies.length === 0 && (force === "yol" || force === "yom")) out.add("reading.bareQuestion");
    for (const body of utterance.bodies) {
      if (isGreeting(body.clause)) out.add("reading.greeting");
      else if (isExistence(body.clause)) out.add("reading.existence");
    }
  }
  visitResult(result, {
    join(_join, site) {
      if (site.kind === "np" && isKindReference(site.coord.parts[site.index]!)) out.add("reading.kind");
    },
    // A `gral` / `hral` scale parses as an ordinary shared `/ɡ/` / `/h/`; `bral` has its own grammar label (`sharedAfterJoin.scale`).
    enter(node) {
      if (node.kind !== "shared" || !isScaleShared(node.item)) return;
      if (node.item.word.pos === "g") out.add("reading.amountScale");
      if (node.item.word.pos === "h") out.add("reading.frequencyScale");
    },
  });
}
