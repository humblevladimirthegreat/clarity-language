/**
 * Phrase-bracket structure for morph glosses —
 * [docs/meta/glosses.md § Phrase brackets](../../docs/meta/glosses.md#phrase-brackets).
 *
 * Builds a tree over the flat word list of one Agazan line from the stage-3 AST.
 * Leaves are word indexes; groups are `[ … ]` units, optionally labeled
 * (`NAME`, `CITE.multi`, `SCOPE`, …). Words the AST does not place in a unit
 * (vocatives, force, linkers, …) stay flat at clause level.
 */

import type {
  Clause,
  CoordShared,
  GCoord,
  GPackage,
  HUnit,
  IslandUnit,
  LexWord,
  NpCoord,
  NpItem,
  NpPackage,
  ParseResult,
  SpanUnit,
  Unit,
  Utterance,
  BoundJoin,
} from "./types.js";

export type GlossNode =
  /** `named`: the word's own `.named` is carried by an enclosing `NAME[…]`. */
  | { t: "leaf"; i: number; named?: boolean }
  /** `from` / `to`: word indexes a spoken span's open / close words add beyond its kids. */
  /** `tone`: a tone mark on the whole group (an island's `!^`). */
  | { t: "group"; label?: string; close?: string; kids: GlossNode[]; from?: number; to?: number; tone?: string }
  /** Top-level sentence punctuation boundary (kept so groups never straddle it). */
  | { t: "raw"; text: string; at: number };

const SPAN_TYPE: Record<string, string> = { a: "CITE", e: "ASIDE", o: "MENTION", u: "OPAQUE" };
const SPAN_EDGE: Record<string, string> = { a: "multi", e: "clause", o: "atomic", u: "empty" };
const CLOSE_SUFFIX: Record<string, string> = { complete: "", editorial: "#", closeAll: "|" };

/** Label for a spoken span open (`daxal` → `d-CITE.multi`, `daxan` → `d-NAME.CITE.multi`). */
export function spokenSpanLabel(open: LexWord): string {
  const family = open.family;
  if (family.kind !== "x" || family.xFamily !== "span") return "SPAN";
  const type = SPAN_TYPE[family.typeVowel ?? ""] ?? "SPAN";
  const edge = SPAN_EDGE[family.edgeVowel ?? ""];
  const named = open.ending === "n" ? "NAME." : "";
  const about = open.ending === "m" ? ".about" : "";
  const body = `${named}${type}${edge ? `.${edge}` : ""}${about}`;
  return open.pos ? `${open.pos}-${body}` : body;
}

export function closeSuffix(close: LexWord | undefined): string {
  if (!close || close.family.kind !== "spanClose") return "";
  return CLOSE_SUFFIX[close.family.flavor] ?? "";
}

class Cursor {
  used: boolean[];
  constructor(words: LexWord[]) {
    this.used = words.map(() => false);
  }
  /** Leaf for a word the AST places, keyed by its word position. */
  take(word: LexWord | undefined): GlossNode | undefined {
    const i = word?.at;
    if (i === undefined || i >= this.used.length || this.used[i]) return undefined;
    this.used[i] = true;
    return { t: "leaf", i };
  }
}

function group(kids: (GlossNode | undefined)[], label?: string, close?: string): GlossNode | undefined {
  const present = kids.filter((k): k is GlossNode => k !== undefined);
  if (present.length === 0) return label ? { t: "group", label, close, kids: [] } : undefined;
  if (present.length === 1 && !label) return present[0];
  return { t: "group", label, close, kids: present };
}

/** `/w/` + host + hosted `/b/`: `[[w | g] | b]`; as-of pair `[[w | b] | g]`; adjectives on `/b/` nest with it. */
function gPackage(cur: Cursor, pack: GPackage): GlossNode | undefined {
  const mods = pack.modifiers.map((m) => cur.take(m));
  const asOf = pack.asOf ? group([cur.take(pack.asOf.word), cur.take(pack.asOf.bound)]) : undefined;
  const host = group([...mods, asOf, cur.take(pack.word)]);
  if (!pack.hosted) return host;
  const bound = boundSlot(cur, pack.hosted.bound, pack.hosted.boundJoin);
  return group([host, group([bound, cur.take(pack.hosted.amount), ...(pack.hosted.adjs ?? []).map((adj) => gPackage(cur, adj))])]);
}

function hUnit(cur: Cursor, unit: HUnit): GlossNode | undefined {
  const host = group([...unit.modifiers.map((m) => cur.take(m)), cur.take(unit.word)]);
  const bound = boundSlot(cur, unit.hosted?.bound, unit.hosted?.boundJoin);
  const adjs = (unit.hosted?.adjs ?? []).map((adj) => gPackage(cur, adj));
  if (!unit.hosted?.amount && !unit.hosted?.grounds && adjs.length === 0) return group([host, bound]);
  return group([host, group([bound, cur.take(unit.hosted?.amount), cur.take(unit.hosted?.grounds), ...adjs])]);
}

/** One hosted `/b/` slot: a single noun, or a join's members plus its join word. */
function boundSlot(cur: Cursor, bound: LexWord | undefined, join: BoundJoin | undefined): GlossNode | undefined {
  const first = cur.take(bound);
  if (!join) return first;
  return group([first, ...join.members.map((m) => cur.take(m)), cur.take(join.join)]);
}

function shared(cur: Cursor, item: CoordShared): GlossNode | undefined {
  return item.word.pos === "g" ? gPackage(cur, item as GPackage) : hUnit(cur, item as HUnit);
}

function npPackage(cur: Cursor, pack: NpPackage): GlossNode | undefined {
  const gl = pack.glAdj ? gPackage(cur, pack.glAdj) : undefined;
  const head = cur.take(pack.head);
  if (pack.adjCoord) return group([gl, head, ...gCoordNodes(cur, pack.adjCoord)]);
  return group([gl, head, ...pack.adjs.map((adj) => gPackage(cur, adj))]);
}

function npItem(cur: Cursor, item: NpItem): GlossNode | undefined {
  if (item.kind === "package") return npPackage(cur, item.package);
  return island(cur, item.island);
}

/** Right-close fences nest: each later part wraps the fence before it. Joinless items stay flat. */
function fences<T>(
  cur: Cursor,
  parts: { items: T[]; join?: LexWord; shared: CoordShared[]; joinModifiers?: LexWord[]; factor?: LexWord }[],
  item: (x: T) => GlossNode | undefined,
): GlossNode[] {
  let acc: GlossNode[] = [];
  for (const part of parts) {
    const items = part.items.map(item);
    const sharedNodes = part.shared.map((s) => shared(cur, s));
    if (!part.join) {
      acc = [...acc, ...items, ...sharedNodes].filter((n): n is GlossNode => n !== undefined);
      continue;
    }
    const joinModifiers = (part.joinModifiers ?? []).map((w) => cur.take(w));
    const join = cur.take(part.join);
    const named = part.join.ending === "n" && join?.t === "leaf";
    if (named) join.named = true;
    const factor = cur.take(part.factor);
    const node = group([...acc, ...items, ...joinModifiers, join, ...sharedNodes, factor], named ? "NAME" : undefined);
    acc = node ? [node] : [];
  }
  return acc;
}

function gCoordNodes(cur: Cursor, coord: GCoord): GlossNode[] {
  return fences(cur, coord.parts, (item) => (item.kind === "adj" ? gPackage(cur, item.adj) : island(cur, item.island)));
}

function np(cur: Cursor, coord: NpCoord): GlossNode[] {
  return fences(cur, coord.parts, (item) => npItem(cur, item));
}

function span(cur: Cursor, s: SpanUnit): GlossNode | undefined {
  const open = cur.take(s.open);
  // Resume opens (EDGE **u** + -r) are pronoun-like: gloss as the word itself.
  if (!s.atom && !s.close && s.content.length === 0 && s.open.ending === "r") return open;
  const kids = s.content.flatMap((clause) => clauseNodes(cur, clause));
  if (s.atom) {
    const atom = cur.take(s.atom);
    if (atom) kids.push(atom);
  }
  const close = s.close ? cur.take(s.close) : undefined;
  return {
    t: "group",
    label: spokenSpanLabel(s.open),
    close: closeSuffix(s.close),
    kids,
    from: open?.t === "leaf" ? open.i : undefined,
    to: close?.t === "leaf" ? close.i : undefined,
  };
}

function island(cur: Cursor, isl: IslandUnit): GlossNode {
  const kids = isl.units.flatMap((u) => unitNodes(cur, u));
  return { t: "group", label: "SCOPE", kids };
}

function unitNodes(cur: Cursor, unit: Unit): GlossNode[] {
  const one = (n: GlossNode | undefined) => (n ? [n] : []);
  switch (unit.kind) {
    case "np":
      return np(cur, unit.coord);
    case "vp":
      return fences(cur, unit.coord.parts, (w) => {
        const hosted = unit.coord.parts.flatMap((p) => p.hostedVerbs ?? []).find((h) => h.verb.raw === w.raw);
        return hosted ? group([cur.take(w), cur.take(hosted.hosted.bound)]) : cur.take(w);
      });
    case "gCoord":
      return gCoordNodes(cur, unit.coord);
    case "predicate":
      return one(gPackage(cur, unit.adj));
    case "h":
      return one(hUnit(cur, unit.unit));
    case "linker":
    case "writingSpan":
      return one(cur.take(unit.word));
    case "hook":
      return one(group([...unit.modifiers.map((m) => cur.take(m)), cur.take(unit.word)]));
    case "span":
      return one(span(cur, unit.span));
    case "island":
      return [island(cur, unit.island)];
    case "clauseCoord": {
      // Mid joins: a repeated join word extends the flat list; a new join word closes it as one group.
      const { first, links } = unit.coord;
      let kids: (GlossNode | undefined)[] = first ? clauseNodes(cur, first) : [];
      let prev: string | undefined;
      for (const link of links) {
        if (prev !== undefined && link.join.raw !== prev) kids = [group(kids)];
        kids.push(cur.take(link.join));
        if (link.clause) kids.push(...clauseNodes(cur, link.clause));
        prev = link.join.raw;
      }
      return one(group(kids));
    }
    default:
      return [];
  }
}

function isHookUnit(unit: Unit | undefined): unit is Extract<Unit, { kind: "hook" }> {
  return unit?.kind === "hook";
}

/** What the last emitted node stands for, so a following pair on its left lands inside the right bracket. */
type NodeKind = "plain" | "landmark";

/**
 * A hook + `/b/` pair that describes what is on its left goes inside that bracket: a noun's own (`[z-dog | g-big | [used-by | b-speaker]]`),
 * or, after a landmark (a hook pair or a hosted host), inside the landmark's `/b/` (`[in | [b-village | [near | b-speaker]]]`).
 */
function attachLeft(out: GlossNode[], kinds: NodeKind[], pair: GlossNode): void {
  const last = out.pop()!;
  const kind = kinds.pop()!;
  const within = (node: GlossNode): GlossNode =>
    node.t === "group" && !node.label ? { ...node, kids: [...node.kids, pair] } : { t: "group", kids: [node, pair] };
  if (kind === "landmark" && last.t === "group" && !last.label && last.kids.length > 1) {
    const landmark = last.kids[last.kids.length - 1]!;
    out.push({ ...last, kids: [...last.kids.slice(0, -1), within(landmark)] });
  } else {
    out.push(within(last));
  }
  kinds.push(kind);
}

/** Clause units, with hook packages: extra noun `[in | b-house]`, named hook `NAME[a | on | b]`. */
function clauseNodes(cur: Cursor, clause: Clause): GlossNode[] {
  const units = clause.units;
  const nodes = units.map((u) => unitNodes(cur, u));
  const out: GlossNode[] = [];
  const kinds: NodeKind[] = [];
  const push = (node: GlossNode, kind: NodeKind = "plain"): void => {
    out.push(node);
    kinds.push(kind);
  };
  for (let k = 0; k < units.length; k++) {
    const unit = units[k]!;
    const here = nodes[k]!;
    if (isHookUnit(unit) && unit.word.ending === "n" && out.length > 0 && nodes[k + 1]?.length) {
      const prev = out.pop()!;
      kinds.pop();
      for (const n of here) if (n.t === "leaf") n.named = true;
      push({ t: "group", label: "NAME", kids: [prev, ...here, ...nodes[k + 1]!] });
      k += 1;
      continue;
    }
    const next = units[k + 1];
    const pairs = unit.kind === "hook" && (unit.job === "extraNoun" || unit.job === "genitive" || unit.job === "resume");
    if (isHookUnit(unit) && pairs && next?.kind === "np" && next.coord.level === "b") {
      const node = group([...here, ...nodes[k + 1]!]);
      if (node) {
        if (unit.onLeft && out.length > 0) attachLeft(out, kinds, node);
        else push(node, "landmark");
      }
      k += 1;
      continue;
    }
    // An `/h/` or `/ɡ/` host with its hosted `/b/` is a landmark for a pair that follows.
    const hosted = (unit.kind === "h" && unit.unit.hosted) || (unit.kind === "predicate" && unit.adj.hosted);
    here.forEach((node, i) => push(node, hosted && i === here.length - 1 ? "landmark" : "plain"));
  }
  if (clause.dependent) {
    const orodo = cur.take(clause.dependent.orodo);
    if (orodo) push(orodo);
    out.push(...clauseNodes(cur, clause.dependent.clause));
  }
  return out;
}

function utteranceNodes(cur: Cursor, utt: Utterance): GlossNode[] {
  const out: GlossNode[] = [];
  const left = utt.left;
  for (const w of [...left.vocatives, ...left.polars]) {
    const n = cur.take(w);
    if (n) out.push(n);
  }
  const hook = group([...(left.hookModifiers ?? []).map((m) => cur.take(m)), cur.take(left.hook)]);
  if (hook) out.push(hook);
  for (const w of [left.leadForce, left.force]) {
    const n = cur.take(w);
    if (n) out.push(n);
  }
  for (const body of utt.bodies) {
    const linker = cur.take(body.linker);
    if (linker) out.push(linker);
    out.push(...clauseNodes(cur, body.clause));
  }
  return out;
}

function minIndex(node: GlossNode): number {
  if (node.t === "leaf") return node.i;
  if (node.t === "raw") return node.at;
  let min = node.from ?? Number.POSITIVE_INFINITY;
  for (const kid of node.kids) min = Math.min(min, minIndex(kid));
  return min;
}

function leaves(node: GlossNode, into: number[] = []): number[] {
  if (node.t === "leaf") into.push(node.i);
  else if (node.t === "group") node.kids.forEach((k) => leaves(k, into));
  return into;
}

/** Every group covers a contiguous run of word indexes, in order. */
function wellFormed(nodes: GlossNode[]): boolean {
  const order = nodes.flatMap((n) => leaves(n));
  for (let k = 1; k < order.length; k++) if (order[k]! <= order[k - 1]!) return false;
  const check = (node: GlossNode): boolean => {
    if (node.t !== "group") return true;
    const idx = leaves(node);
    if (idx.length && idx[idx.length - 1]! - idx[0]! !== idx.length - 1) return false;
    return node.kids.every(check);
  };
  return nodes.every(check);
}

/**
 * Tree for one line, or `undefined` when the AST does not cover the words
 * cleanly (caller falls back to token-level structure).
 */
export function buildGlossTree(parsed: ParseResult, words: LexWord[]): GlossNode[] | undefined {
  const cur = new Cursor(words);
  const nodes = parsed.utterances.flatMap((utt) => utteranceNodes(cur, utt));
  // Words the AST did not place (should be rare) stay flat at their index.
  words.forEach((_, i) => {
    if (!cur.used[i]) nodes.push({ t: "leaf", i });
  });
  // Spoken span open / close words are folded into group labels, not leaves.
  nodes.sort((a, b) => minIndex(a) - minIndex(b));
  return wellFormed(nodes) ? nodes : undefined;
}

/**
 * Token-level fallback when the sentence does not parse: spoken spans
 * (`daxal … xuxul`, atomic `daxol w`, empty `daxul`) and scope islands still
 * bracket; everything else stays flat.
 */
export function tokenGlossTree(words: LexWord[], carets: number[]): GlossNode[] {
  type Frame = { label: string; kids: GlossNode[]; atomic: boolean; from?: number };
  const root: GlossNode[] = [];
  const stack: Frame[] = [];
  const sink = () => (stack.length ? stack[stack.length - 1]!.kids : root);
  const pop = (close?: string, to?: number) => {
    const frame = stack.pop()!;
    sink().push({ t: "group", label: frame.label, close, kids: frame.kids, from: frame.from, to });
  };
  const caretSet = new Map<number, number>();
  carets.forEach((c) => caretSet.set(c, (caretSet.get(c) ?? 0) + 1));
  let islandOpen = false;
  for (let i = 0; i <= words.length; i++) {
    for (let c = 0; c < (caretSet.get(i) ?? 0); c++) {
      if (!islandOpen) stack.push({ label: "SCOPE", kids: [], atomic: false });
      else pop();
      islandOpen = !islandOpen;
    }
    if (i === words.length) break;
    const word = words[i]!;
    const family = word.family;
    if (family.kind === "spanClose") {
      if (stack.length) pop(CLOSE_SUFFIX[family.flavor], i);
      else sink().push({ t: "leaf", i });
      continue;
    }
    if (family.kind === "x" && family.xFamily === "span" && word.ending !== "r") {
      const label = spokenSpanLabel(word);
      if (family.edgeVowel === "u") {
        sink().push({ t: "group", label, kids: [], from: i, to: i });
        continue;
      }
      stack.push({ label, kids: [], atomic: family.edgeVowel === "o", from: i });
      continue;
    }
    sink().push({ t: "leaf", i });
    while (stack.length && stack[stack.length - 1]!.atomic && stack[stack.length - 1]!.kids.length === 1) {
      pop();
    }
  }
  while (stack.length) pop();
  return root;
}

export type RenderLeaf = (node: Extract<GlossNode, { t: "leaf" }>) => string;

export function renderGlossNodes(nodes: GlossNode[], leaf: RenderLeaf): string {
  return nodes.map((n) => renderNode(n, leaf)).join(" | ");
}

function renderNode(node: GlossNode, leaf: RenderLeaf): string {
  if (node.t === "leaf") return leaf(node);
  if (node.t === "raw") return node.text;
  // A package label on a lone unlabeled unit wraps that unit's words directly.
  const only = node.kids.length === 1 ? node.kids[0]! : undefined;
  const kids = node.label && only?.t === "group" && !only.label ? only.kids : node.kids;
  const inner = renderGlossNodes(kids, leaf);
  return `${node.tone ?? ""}${node.label ?? ""}[${inner}]${node.close ?? ""}`;
}

/** Strip one outer `[ … ]` when it spans the whole string (a lone unlabeled unit). */
export function unwrapLoneBracket(line: string): string {
  if (!line.startsWith("[") || !line.endsWith("]")) return line;
  let depth = 0;
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') quoted = !quoted;
    if (quoted) continue;
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0 && i !== line.length - 1) return line;
    }
  }
  return line.slice(1, -1);
}

export type WordBrackets = { open: string[]; close: string[] };

/**
 * Per-word bracket marks for display: `open` labels (`[`, `NAME[`, `d-CITE.multi[`)
 * before a word and `close` marks (`]`, `]#`) after it, outermost first / innermost first.
 */
export function bracketsByWord(nodes: GlossNode[], wordCount: number): WordBrackets[] {
  const out: WordBrackets[] = Array.from({ length: wordCount }, () => ({ open: [], close: [] }));
  const extent = (node: GlossNode): [number, number] | undefined => {
    if (node.t === "leaf") return [node.i, node.i];
    if (node.t === "raw") return undefined;
    let lo = node.from ?? Number.POSITIVE_INFINITY;
    let hi = node.to ?? node.from ?? Number.NEGATIVE_INFINITY;
    for (const kid of node.kids) {
      const e = extent(kid);
      if (!e) continue;
      lo = Math.min(lo, e[0]);
      hi = Math.max(hi, e[1]);
    }
    return Number.isFinite(lo) && Number.isFinite(hi) ? [lo, hi] : undefined;
  };
  const visit = (node: GlossNode, hoisted = false) => {
    if (node.t !== "group") return;
    const e = extent(node);
    if (e && !hoisted) {
      out[e[0]]!.open.push(`${node.label ?? ""}[`);
      out[e[1]]!.close.unshift(`]${node.close ?? ""}`);
    }
    // Same hoist as the rendered line: a label on a lone unlabeled unit draws one bracket.
    const only = node.kids.length === 1 ? node.kids[0]! : undefined;
    const hoist = Boolean(node.label) && only?.t === "group" && !only.label;
    node.kids.forEach((kid) => visit(kid, hoist));
  };
  nodes.forEach((node) => visit(node));
  return out;
}
