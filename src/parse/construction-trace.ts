import type { CstElement, CstNode, IToken } from "chevrotain";

import { classifyTokenBranch, isLexWordPayload, type TokenPayload } from "./tokens.js";
import type { Clause, LexWord, ParseResult, ResolveInfo } from "./types.js";

function isCstNode(element: CstElement): element is CstNode {
  return "children" in element;
}

/** Construction IDs a word carries on its own (`word.*`), independent of its slot. */
export function wordConstructions(word: LexWord): string[] {
  const ids = [`word.family.${word.family.kind}`, `word.reading.${word.reading}`];
  if (word.family.kind === "x") ids.push(`word.xFamily.${word.family.xFamily}`);
  if (word.ending) ids.push(`word.ending.${word.ending}`);
  if (word.plural && word.pos) ids.push(`word.plural.${word.pos}`);
  if (word.gl) ids.push("word.gl");
  // Classify re-reads a fused hook compound as content; the fusion is still its own construction.
  if (word.hookCompound) ids.push("word.family.hookCompound");
  return ids;
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
    for (const body of utterance.bodies) if (isExistence(body.clause)) out.add("reading.existence");
  }
}
