import type {
  AnaphorBind,
  AskKind,
  AskRecord,
  BodyClause,
  Clause,
  ContentMatch,
  CoordShared,
  GPackage,
  HUnit,
  IslandUnit,
  LexWord,
  NpCoord,
  NpPackage,
  NumberMarker,
  ParseResult,
  ResolveInfo,
  SharedRecord,
  SharedRole,
  SpanUnit,
  Unit,
  Utterance,
  VpCoord,
  WritingBracket,
} from "./types.js";

const VOWELS = new Set(["a", "e", "o", "u"]);

const CONTINUUM_SERIES = new Set(["a", "e", "ue"]);
const SCALE_SERIES = new Set(["e", "oe", "ue"]);
const KIND_SERIES = new Set(["ua", "uo"]);
const ROLE_FRAME_POS = new Set(["z", "d", "b", "v", "g", "h"]);

type SpanType = "a" | "e" | "o" | "u";

type Antecedent =
  | { kind: "content"; word: LexWord; roots: string[] }
  | { kind: "span"; word: LexWord; typeVowel: SpanType }
  | { kind: "number"; word: LexWord; identity: string }
  | { kind: "roleFrame"; word: LexWord; roots: string[] };

type Ctx = {
  antecedents: Antecedent[];
  anaphors: AnaphorBind[];
  asks: AskRecord[];
  shared: SharedRecord[];
  gaps: LexWord[];
  question: boolean;
};

/** Letter-pronoun stem: cut through the 2nd vowel ([pronouns.md](docs/grammar/pronouns.md)). */
export function letterPrefix(root: string): string {
  let seen = 0;
  for (let i = 0; i < root.length; i++) {
    if (VOWELS.has(root[i]!)) {
      seen++;
      if (seen === 2) return root.slice(0, i + 1);
    }
  }
  return root;
}

/** Writing / speech number markers that share referential identity. */
export function numberMarkerIdentity(marker: NumberMarker): string {
  if (marker === "+" || marker === "ra") return "scalarPos";
  if (marker === "-" || marker === "ru") return "scalarNeg";
  if (marker === "#" || marker === "re") return "ordinalFwd";
  if (marker === "#-" || marker === "reu") return "ordinalEnd";
  return "label";
}

export function writingSpanType(bracket: WritingBracket): SpanType {
  if (bracket === "[") return "a";
  if (bracket === "(") return "e";
  if (bracket === "{") return "o";
  return "u";
}

function contentMatch(pronounRoot: string, antecedentRoot: string): ContentMatch | null {
  if (pronounRoot === antecedentRoot) return "fullRoot";
  if (pronounRoot === letterPrefix(antecedentRoot)) return "letter";
  return null;
}

function contentRoots(word: LexWord): string[] {
  const family = word.family;
  if (family.kind === "content") return family.roots;
  if (family.kind === "x" && family.xFamily === "compound") {
    return [...family.leftRoots, ...(family.rightRoots ?? [])];
  }
  if (family.kind === "x" && family.xFamily === "numeric") return family.leftRoots;
  return [];
}

function roleRoots(word: LexWord): string[] {
  const family = word.family;
  if (family.kind === "x" && family.xFamily === "role") return family.rightRoots ?? [];
  if (word.reading === "joinRelation") return contentRoots(word);
  if (family.kind === "content" && word.pos && ROLE_FRAME_POS.has(word.pos)) {
    return family.roots;
  }
  if (family.kind === "x" && family.xFamily === "compound" && word.pos && ROLE_FRAME_POS.has(word.pos)) {
    return [...family.leftRoots, ...(family.rightRoots ?? [])];
  }
  return [];
}

function spanTypeOf(word: LexWord): SpanType | undefined {
  const family = word.family;
  if (family.kind === "x" && family.xFamily === "span" && family.typeVowel) {
    return family.typeVowel;
  }
  if (family.kind === "writingSpan") return writingSpanType(family.bracket);
  return undefined;
}

function isQuestionForce(word: LexWord | undefined): boolean {
  if (!word || word.pos !== "j" || word.family.kind !== "joinMarker") return false;
  return word.family.series === "o";
}

function isJoinGap(word: LexWord): boolean {
  if (word.ending !== "r" || word.family.kind !== "joinMarker") return false;
  return word.reading === "ordinary" || word.reading === "restrictor";
}

function isGPackage(shared: CoordShared): shared is GPackage {
  return typeof shared === "object" && "modifiers" in shared && "word" in shared;
}

function isNumberHead(word: LexWord): boolean {
  return word.family.kind === "number" || word.reading === "number";
}

function numberConjunctCount(coord: NpCoord, partIndex: number): number {
  const part = coord.parts[partIndex];
  if (!part) return 0;
  return part.items.filter(
    (item) => item.kind === "package" && isNumberHead(item.package.head),
  ).length;
}

function classifySharedRole(join: LexWord, numberCount: number, shared: GPackage): SharedRole {
  const series = join.family.kind === "joinMarker" ? join.family.series : "";
  if (numberCount >= 2 && CONTINUUM_SERIES.has(series)) return "continuum";
  if (SCALE_SERIES.has(series)) return "scale";
  if (series === "ae") return "equative";
  if (KIND_SERIES.has(series)) return "kind";
  if (series === "a") return shared.word.plural ? "collective" : "distribute";
  return "ordinary";
}

function isSpanAnaphor(word: LexWord): boolean {
  const family = word.family;
  if (family.kind === "writingSpan") return family.anaphor;
  return family.kind === "x" && family.xFamily === "span" && word.ending === "r";
}

function isNumberAnaphor(word: LexWord): boolean {
  return word.family.kind === "number" && word.ending === "r";
}

function isRoleAnaphor(word: LexWord): boolean {
  return word.family.kind === "x" && word.family.xFamily === "role" && word.ending === "r";
}

function isContentAnaphor(word: LexWord): boolean {
  if (word.ending !== "r") return false;
  if (word.reading === "value" || word.reading === "ability") return false;
  if (word.reading === "restrictor" || word.reading === "mood") return false;
  if (word.family.kind === "joinMarker") return false;
  if (word.family.kind === "reviser" || word.family.kind === "spanClose") return false;
  if (isSpanAnaphor(word) || isNumberAnaphor(word) || isRoleAnaphor(word)) return false;
  return contentRoots(word).length > 0;
}

function bindLatest(antecedents: Antecedent[], pred: (item: Antecedent) => boolean): LexWord | undefined {
  for (let i = antecedents.length - 1; i >= 0; i--) {
    const item = antecedents[i]!;
    if (pred(item)) return item.word;
  }
  return undefined;
}

function bindContent(ctx: Ctx, pronoun: LexWord): void {
  const roots = contentRoots(pronoun);
  let match: ContentMatch | undefined;
  const antecedent = bindLatest(ctx.antecedents, (item) => {
    if (item.kind !== "content") return false;
    for (const pronounRoot of roots) {
      for (const antecedentRoot of item.roots) {
        const kind = contentMatch(pronounRoot, antecedentRoot);
        if (kind) {
          match = kind;
          return true;
        }
      }
    }
    return false;
  });
  ctx.anaphors.push({ pronoun, kind: "content", match, antecedent });
}

function bindSpan(ctx: Ctx, pronoun: LexWord): void {
  const typeVowel = spanTypeOf(pronoun);
  const antecedent = typeVowel
    ? bindLatest(ctx.antecedents, (item) => item.kind === "span" && item.typeVowel === typeVowel)
    : undefined;
  ctx.anaphors.push({ pronoun, kind: "span", typeVowel, antecedent });
}

function bindNumber(ctx: Ctx, pronoun: LexWord): void {
  const family = pronoun.family;
  if (family.kind !== "number") return;
  const identity = numberMarkerIdentity(family.stem.marker);
  const antecedent = bindLatest(
    ctx.antecedents,
    (item) => item.kind === "number" && item.identity === identity,
  );
  ctx.anaphors.push({ pronoun, kind: "number", antecedent });
}

function bindRole(ctx: Ctx, pronoun: LexWord): void {
  const family = pronoun.family;
  const roots = family.kind === "x" && family.xFamily === "role" ? (family.rightRoots ?? []) : [];
  const roleVowel = family.kind === "x" ? family.roleVowel : undefined;
  const antecedent = bindLatest(
    ctx.antecedents,
    (item) => item.kind === "roleFrame" && roots.some((root) => item.roots.includes(root)),
  );
  ctx.anaphors.push({ pronoun, kind: "role", roleVowel, antecedent });
}

function harvest(ctx: Ctx, word: LexWord): void {
  const family = word.family;
  if (family.kind === "writingSpan") {
    ctx.antecedents.push({
      kind: "span",
      word,
      typeVowel: writingSpanType(family.bracket),
    });
    return;
  }
  if (family.kind === "x" && family.xFamily === "span" && family.typeVowel && word.ending !== "r") {
    ctx.antecedents.push({ kind: "span", word, typeVowel: family.typeVowel });
  }

  if (word.family.kind === "number") {
    ctx.antecedents.push({
      kind: "number",
      word,
      identity: numberMarkerIdentity(word.family.stem.marker),
    });
  }

  const cRoots = contentRoots(word);
  if (cRoots.length > 0) {
    ctx.antecedents.push({ kind: "content", word, roots: cRoots });
  }

  const rRoots = roleRoots(word);
  if (rRoots.length > 0) {
    ctx.antecedents.push({ kind: "roleFrame", word, roots: rRoots });
  }
}

function considerWord(ctx: Ctx, word: LexWord): void {
  if (isSpanAnaphor(word)) bindSpan(ctx, word);
  else if (isNumberAnaphor(word)) bindNumber(ctx, word);
  else if (isRoleAnaphor(word)) bindRole(ctx, word);
  else if (isContentAnaphor(word)) bindContent(ctx, word);

  if (ctx.question && isJoinGap(word)) ctx.gaps.push(word);

  harvest(ctx, word);
}

function considerJoin(
  ctx: Ctx,
  join: LexWord,
  shared: CoordShared[],
  numberCount: number,
): void {
  if (ctx.question && isJoinGap(join)) ctx.gaps.push(join);
  for (const item of shared) {
    if (!isGPackage(item)) continue;
    considerGPackage(ctx, item);
    ctx.shared.push({
      join,
      role: classifySharedRole(join, numberCount, item),
      shared: item,
    });
  }
}

function considerGPackage(ctx: Ctx, pkg: GPackage): void {
  considerWord(ctx, pkg.word);
  if (pkg.bound) considerWord(ctx, pkg.bound);
  for (const mod of pkg.modifiers) considerWord(ctx, mod);
}

function considerHUnit(ctx: Ctx, unit: HUnit): void {
  considerWord(ctx, unit.word);
  if (unit.bound) considerWord(ctx, unit.bound);
}

function considerNpPackage(ctx: Ctx, pkg: NpPackage): void {
  if (pkg.glAdj) considerGPackage(ctx, pkg.glAdj);
  considerWord(ctx, pkg.head);
  for (const adj of pkg.adjs) considerGPackage(ctx, adj);
}

function considerIsland(ctx: Ctx, island: IslandUnit): void {
  for (const unit of island.units) considerUnit(ctx, unit);
}

function considerNpCoord(ctx: Ctx, coord: NpCoord): void {
  coord.parts.forEach((part, index) => {
    for (const item of part.items) {
      if (item.kind === "package") considerNpPackage(ctx, item.package);
      else considerIsland(ctx, item.island);
    }
    if (part.join) {
      considerJoin(ctx, part.join, part.shared, numberConjunctCount(coord, index));
    } else {
      for (const shared of part.shared) {
        if (isGPackage(shared)) considerGPackage(ctx, shared);
      }
    }
  });
}

function considerVpCoord(ctx: Ctx, coord: VpCoord): void {
  for (const part of coord.parts) {
    for (const item of part.items) considerWord(ctx, item);
    if (part.join) considerJoin(ctx, part.join, part.shared, 0);
    else {
      for (const shared of part.shared) {
        if (isGPackage(shared)) considerGPackage(ctx, shared);
      }
    }
  }
}

function considerSpan(ctx: Ctx, span: SpanUnit): void {
  const opaque = spanTypeOf(span.open) === "u";
  considerWord(ctx, span.open);
  if (!opaque) {
    for (const clause of span.content) considerClause(ctx, clause);
  }
}

function considerUnit(ctx: Ctx, unit: Unit): void {
  switch (unit.kind) {
    case "np":
      considerNpCoord(ctx, unit.coord);
      return;
    case "vp":
      considerVpCoord(ctx, unit.coord);
      return;
    case "predicate":
      considerGPackage(ctx, unit.adj);
      return;
    case "h":
      considerHUnit(ctx, unit.unit);
      return;
    case "linker":
    case "reviser":
    case "writingSpan":
      considerWord(ctx, unit.word);
      return;
    case "span":
      considerSpan(ctx, unit.span);
      return;
    case "island":
      considerIsland(ctx, unit.island);
      return;
    case "clauseCoord":
      for (const part of unit.coord.parts) {
        for (const clause of part.clauses) considerClause(ctx, clause);
        if (ctx.question && isJoinGap(part.join)) ctx.gaps.push(part.join);
      }
      return;
  }
}

function considerClause(ctx: Ctx, clause: Clause): void {
  for (const unit of clause.units) considerUnit(ctx, unit);
  if (clause.dependent) considerClause(ctx, clause.dependent.clause);
}

function considerBody(ctx: Ctx, body: BodyClause): void {
  if (body.linker) considerWord(ctx, body.linker);
  considerClause(ctx, body.clause);
}

function considerUtterance(ctx: Ctx, utterance: Utterance, utteranceIndex: number): void {
  ctx.question = isQuestionForce(utterance.left.force);
  ctx.gaps = [];

  for (const vocative of utterance.left.vocatives) considerWord(ctx, vocative);
  for (const polar of utterance.left.polars) considerWord(ctx, polar);
  if (utterance.left.reviser) considerWord(ctx, utterance.left.reviser);
  if (utterance.left.force) considerWord(ctx, utterance.left.force);

  for (const body of utterance.bodies) considerBody(ctx, body);

  let kind: AskKind = "none";
  if (ctx.question) kind = ctx.gaps.length > 0 ? "fillAsk" : "yesNo";
  ctx.asks.push({ utteranceIndex, kind, gaps: ctx.gaps });
}

function buildResolve(utterances: Utterance[]): ResolveInfo {
  const ctx: Ctx = {
    antecedents: [],
    anaphors: [],
    asks: [],
    shared: [],
    gaps: [],
    question: false,
  };
  utterances.forEach((utterance, index) => considerUtterance(ctx, utterance, index));
  return {
    anaphors: ctx.anaphors,
    asks: ctx.asks,
    shared: ctx.shared,
  };
}

/** Stage 4: annotate anaphor binds, fill-ask vs yes/no, and SHARED `/ɡ/` readings. */
export function resolve(result: ParseResult): ParseResult {
  return {
    utterances: result.utterances,
    resolve: buildResolve(result.utterances),
  };
}
