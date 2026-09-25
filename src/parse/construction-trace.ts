import type { CstElement, CstNode, IToken } from "chevrotain";

import { classifyTokenBranch, isLexWordPayload, type TokenPayload } from "./tokens.js";
import { POLAR_GROUP, RESTRICTOR_GROUP, type JoinSeries } from "./constructions.js";
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
  const ids = [`word.family.${word.family.kind}`, word.overlay ? overlayConstructionId(word.overlay) : `word.reading.${word.reading}`];
  if (word.family.kind === "x") ids.push(`word.xFamily.${word.family.xFamily}`);
  if (word.ending) ids.push(`word.ending.${word.ending}`);
  if (word.plural && word.pos) ids.push(`word.plural.${word.pos}`);
  if (word.gl) ids.push("word.gl");
  // Classify re-reads a fused hook compound as content; the fusion is still its own construction.
  if (word.hookCompound) ids.push("word.family.hookCompound");
  ids.push(...featureConstructions(word));
  return ids;
}

/** Digitless-exponent class: which lesson a shorthand like `e`, `0e`, `e3`, `1e` belongs to. */
function digitlessExpClass(stem: NumberStem, exp: string): string {
  const negative = stem.marker === "-" || stem.marker === "ru";
  if (exp.includes("-e-") || (negative && exp === "e-")) return "imaginary";
  if (/^[+±-]?0e/.test(exp)) return "zero";
  if (/^e\d/.test(exp)) return "bareOom";
  if (/^\d+e/.test(exp)) return "hyperbole";
  return "landmark";
}

/** `number.*` features of one stem (numbers.md lessons). */
function numberFeatures(stem: NumberStem): string[] {
  const ids = [`number.marker.${numberMarkerIdentity(stem.marker)}`];
  if (stem.groups.length === 0 && !stem.digitlessExp) ids.push("number.digitless");
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

const NUMBER_POS = new Set(["v", "h", "th", "j", "x"]);

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
    if (family.xFamily === "value" && family.stanceVowel) {
      ids.push(`value.stance.${family.stanceVowel}`);
      if (word.ending === "l" || word.ending === "m" || word.ending === "r") ids.push(`value.ending.${family.stanceVowel}.${word.ending}`);
    }
    if (family.xFamily === "span") {
      if (family.typeVowel) ids.push(`span.type.${family.typeVowel}`);
      if (family.edgeVowel) ids.push(`span.edge.${family.edgeVowel}`);
      if (word.ending === "l" || word.ending === "m" || word.ending === "n" || word.ending === "r") ids.push(`span.ending.${word.ending}`);
    }
    if (family.xFamily === "role") {
      if (family.roleVowel) ids.push(`role.vowel.${family.roleVowel}`);
      if (word.ending === "r") ids.push("role.instance");
    }
    return ids;
  }
  if (family.kind === "spanClose") return [`span.close.${family.flavor}`];
  if (family.kind === "writingSpan") return family.marks.map((mark) => `span.mark.${mark}`);
  if (family.kind === "hook") return [`hook.${family.form}`];
  if (family.kind === "hookCompound") return [`hook.${family.hook}`];
  if (family.kind === "joinMarker" && !word.overlay) {
    const { series } = family;
    if (word.reading === "standIn") return [`standIn.${series}`];
    if (word.reading === "restrictor") return [`restrictor.${RESTRICTOR_GROUP[series as JoinSeries]}`];
    if (word.pos === "j") {
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

/** Collect `sentence.*` / `token.*` / `word.*` IDs from one sentence CST. */
export function addCstConstructions(node: CstNode, out: Set<string>): void {
  for (const [key, elements] of Object.entries(node.children)) {
    out.add(`sentence.${node.name}.${key}`);
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
      if (kind === "NonTerminal") {
        keys.add(`sentence.${rule}.${def.label ?? def.nonTerminalName}`);
        continue; // its definition is the referenced rule, walked on its own
      }
      if (kind === "Terminal") keys.add(`sentence.${rule}.${def.label ?? def.terminalType!.name}`);
      if (def.definition) walk(rule, def.definition);
    }
  };
  for (const [name, rule] of Object.entries(grammar)) walk(name, rule.definition as GastNode[]);
  return keys;
}

/** Greeting: a prefix-less named citation said alone (`azawan.`, word-endings.md § greeting). */
function isGreeting(clause: Clause): boolean {
  const [only, ...rest] = clause.units;
  if (rest.length > 0 || only?.kind !== "np" || only.coord.parts.length !== 1) return false;
  const [part] = only.coord.parts;
  const [item, ...more] = part!.items;
  if (more.length > 0 || part!.join || item?.kind !== "package") return false;
  const { head, adjs, glAdj } = item.package;
  return !head.pos && head.ending === "n" && adjs.length === 0 && !glAdj;
}

/** Existence: no `/v/`, a new `/z/` noun first, then only `/ɡ/`, hooks, or `/b/` (predication.md § existence). */
function isExistence(clause: Clause): boolean {
  const [first, ...rest] = clause.units;
  if (first?.kind !== "np" || first.coord.level !== "z") return false;
  const heads = first.coord.parts.flatMap((part) =>
    part.items.flatMap((item) => (item.kind === "package" ? [item.package] : [])),
  );
  const described = rest.some((unit) => unit.kind === "predicate") || heads.some((pkg) => pkg.adjs.length > 0);
  // A name or resume with a /ɡ/ word is a property claim, not existence.
  const known = heads.some((pkg) => pkg.head.ending === "n" || pkg.head.ending === "r");
  if (described && known) return false;
  return rest.every(
    (unit) => unit.kind === "predicate" || unit.kind === "hook" || (unit.kind === "np" && unit.coord.level === "b"),
  );
}

/** Collect `reading.*` IDs from utterance and clause shapes. */
export function addReadingConstructions(result: ParseResult, out: Set<string>): void {
  for (const utterance of result.utterances) {
    const force = utterance.left.force?.raw;
    if (utterance.bodies.length === 0 && (force === "jol" || force === "jom")) out.add("reading.bareQuestion");
    for (const body of utterance.bodies) {
      if (isGreeting(body.clause)) out.add("reading.greeting");
      else if (isExistence(body.clause)) out.add("reading.existence");
    }
  }
}
