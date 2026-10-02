import type {
  AnaphorBind,
  AskKind,
  AskRecord,
  BodyClause,
  Clause,
  ContentMatch,
  CoordShared,
  IslandUnit,
  LexWord,
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
import { isDigitless, isRhetorical, KIND_SERIES, resumeCut, SCALE_SERIES } from "./series.js";
import { isGreeting, isSharedGPackage, SKIP_CONTENT, visitResult, type Visitor } from "./ast-walk.js";
import { CLOSED } from "../closed-roots.js";

const ROLE_FRAME_POS = new Set(["z", "d", "b", "v", "g", "h", "th"]);

type SpanType = "a" | "e" | "o" | "u";

type Antecedent =
  | { kind: "content"; word: LexWord; roots: string[] }
  | { kind: "span"; word: LexWord; typeVowel: SpanType }
  | { kind: "number"; word: LexWord; identity: string }
  | { kind: "roleFrame"; word: LexWord; roots: string[] };

/** A name in the conversation's introduction order (pronouns.md#ordinal-pronouns). */
type Introduced = { key: string; word: LexWord };

type Ctx = {
  antecedents: Antecedent[];
  /** Names in order of introduction; ordinal pronouns index into this list. */
  introduced: Introduced[];
  /** Names that have greeted; the same greeting again is goodbye. */
  greeted: Set<string>;
  /** After a goodbye: the next utterance that is not a goodbye starts a new conversation. */
  closing: boolean;
  /** This utterance is a goodbye, so its greeting introduces no one. */
  goodbye: boolean;
  anaphors: AnaphorBind[];
  asks: AskRecord[];
  shared: SharedRecord[];
  gaps: LexWord[];
  question: boolean;
};

/** Letter-pronoun stem: cut through the 2nd vowel ([pronouns.md](docs/grammar/pronouns.md)). */
export const letterPrefix = resumeCut;

/** Writing / speech number markers that share referential identity. */
export function numberMarkerIdentity(marker: NumberMarker): string {
  if (marker === "+" || marker === "ra") return "scalarPos";
  if (marker === "-" || marker === "ru") return "scalarNeg";
  if (marker === "#" || marker === "re") return "ordinalFwd";
  if (marker === "#-" || marker === "rue") return "ordinalEnd";
  if (marker === "#_" || marker === "ruo") return "negativeLabel";
  if (marker === "+-" || marker === "rua") return "errorBound";
  return "label";
}

export function writingSpanType(bracket: WritingBracket): SpanType {
  if (bracket === "[") return "a";
  if (bracket === "(") return "e";
  if (bracket === "{") return "o";
  return "u";
}

/** How a `-r` stem lines up with an antecedent root ([pronouns.md](docs/grammar/pronouns.md)). */
export function contentMatch(pronounRoot: string, antecedentRoot: string): ContentMatch | null {
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
  // Ability host (`vezehexal`): a resume keeps the *can* ([intention.md](docs/grammar/intention.md#incapability)).
  if (family.kind === "x" && family.xFamily === "ability") return family.leftRoots;
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
  if (!word || word.pos !== "y" || word.family.kind !== "joinMarker") return false;
  return word.family.series === "o";
}

function isJoinGap(word: LexWord): boolean {
  if (isDigitlessNumberBlank(word)) return true;
  if (word.ending !== "r" || word.family.kind !== "joinMarker") return false;
  return word.reading === "join" || word.reading === "restrictor";
}

function classifySharedRole(join: LexWord, shared: CoordShared): SharedRole {
  const series = join.family.kind === "joinMarker" ? join.family.series : "";
  if (SCALE_SERIES.has(series)) return "scale";
  if (series === "ae") return "equative";
  if (KIND_SERIES.has(series)) return "kind";
  if (series === "a") return isSharedGPackage(shared) && shared.word.plural ? "collective" : "distribute";
  return "ordinary";
}

function isSpanAnaphor(word: LexWord): boolean {
  const family = word.family;
  if (family.kind === "writingSpan") return family.anaphor;
  return family.kind === "x" && family.xFamily === "span" && word.ending === "r";
}

/** Digitless number **-r** (`g=+`): *some number*, or a fill-ask blank under question — not a resume (numbers.md#digitless). */
export function isDigitlessNumberBlank(word: LexWord): boolean {
  const family = word.family;
  return family.kind === "number" && word.ending === "r" && isDigitless(family.stem);
}

function isNumberAnaphor(word: LexWord): boolean {
  return word.family.kind === "number" && word.ending === "r" && !isDigitlessNumberBlank(word);
}

/** Special pronouns name conversation roles, not people, so they take no number. */
const ROLE_PRONOUN_ROOTS = new Set([CLOSED.microphone, CLOSED.headphones, CLOSED.handshake, CLOSED.neutral]);

/** Identity of a name (`-n`) for introduction order: its roots, plus `-x` for a group. */
function nameKey(word: LexWord): string | undefined {
  if (word.ending !== "n" || word.family.kind === "joinMarker") return undefined;
  const roots = contentRoots(word);
  if (roots.length === 0 || roots.some((root) => ROLE_PRONOUN_ROOTS.has(root))) return undefined;
  return `${roots.join("x")}${word.plural ? "+x" : ""}`;
}

/**
 * Ordinal pronoun: a rank **-r** with plain digits on `/z/` `/d/` `/b/` names a person by
 * order of introduction (pronouns.md#ordinal-pronouns). Returns the place, negative when
 * counted from the end (`z=#-1`), or `undefined` when the word is not an ordinal pronoun.
 */
export function ordinalPronounPlace(word: LexWord): number | undefined {
  const family = word.family;
  if (family.kind !== "number" || word.ending !== "r") return undefined;
  if (word.pos !== "z" && word.pos !== "d" && word.pos !== "b") return undefined;
  const { stem } = family;
  if ((stem.marker !== "#" && stem.marker !== "#-") || stem.calendarOrdinal || stem.digitlessExp) return undefined;
  const [group, ...rest] = stem.groups;
  if (!group?.mantissa || rest.length > 0 || group.decimal || group.exponentDigits || group.percent) return undefined;
  const place = Number(group.mantissa);
  return stem.marker === "#-" ? -place : place;
}

function isRoleAnaphor(word: LexWord): boolean {
  return word.family.kind === "x" && word.family.xFamily === "role" && word.ending === "r";
}

/** A holder's own **-r** resumes the person whose view it is (`thevemazawar`, knowing.md#holder). */
function holderRoots(word: LexWord): string[] {
  const family = word.family;
  return family.kind === "x" && family.xFamily === "holder" ? (family.rightRoots ?? []) : [];
}

function isContentAnaphor(word: LexWord): boolean {
  if (word.ending !== "r") return false;
  if (word.reading === "sake") return false;
  if (word.reading === "restrictor" || word.reading === "overlay") return false;
  if (word.family.kind === "joinMarker") return false;
  if (word.family.kind === "hook" || word.family.kind === "spanClose") return false;
  if (isSpanAnaphor(word) || isNumberAnaphor(word) || isRoleAnaphor(word)) return false;
  return contentRoots(word).length > 0 || holderRoots(word).length > 0;
}

function bindLatest(antecedents: Antecedent[], pred: (item: Antecedent) => boolean): LexWord | undefined {
  for (let i = antecedents.length - 1; i >= 0; i--) {
    const item = antecedents[i]!;
    if (pred(item)) return item.word;
  }
  return undefined;
}

function bindContent(ctx: Ctx, pronoun: LexWord): void {
  const holder = holderRoots(pronoun);
  const roots = holder.length > 0 ? holder : contentRoots(pronoun);
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

function bindOrdinal(ctx: Ctx, pronoun: LexWord, place: number): void {
  const index = place > 0 ? place - 1 : ctx.introduced.length + place;
  const antecedent = place !== 0 && index >= 0 ? ctx.introduced[index]?.word : undefined;
  ctx.anaphors.push({ pronoun, kind: "ordinal", antecedent });
}

function introduce(ctx: Ctx, word: LexWord): void {
  const key = nameKey(word);
  if (key && !ctx.introduced.some((item) => item.key === key)) ctx.introduced.push({ key, word });
}

/** The greeter's own name in a greeting sentence (`azawan.`, word-endings.md#greeting). */
function greetingName(body: BodyClause): string | undefined {
  if (!isGreeting(body.clause)) return undefined;
  const [unit] = body.clause.units;
  const [item] = unit?.kind === "np" ? unit.coord.parts[0]!.items : [];
  return item?.kind === "package" ? nameKey(item.package.head) : undefined;
}

/**
 * Conversation boundary (pronouns.md#ordinal-pronouns): a greeting from a name that already
 * greeted is goodbye. After a goodbye, the next move that is not one starts the count over.
 */
function enterMove(ctx: Ctx, greetings: string[]): void {
  const known = (key: string) => ctx.greeted.has(key) || (ctx.closing && ctx.introduced.some((item) => item.key === key));
  ctx.goodbye = greetings.length > 0 && greetings.every(known);
  if (ctx.goodbye) {
    ctx.closing = true;
    return;
  }
  if (ctx.closing) {
    ctx.introduced = [];
    ctx.greeted.clear();
    ctx.closing = false;
  }
  for (const key of greetings) ctx.greeted.add(key);
}

/** A turn cluster opens a move; a greeting there is the greeter's name with a length bid (`alahexon.`). */
function enterLeft(ctx: Ctx, utterance: Utterance): void {
  const { left } = utterance;
  const words = [...left.vocatives, ...left.interjections, ...left.polars, left.force, left.leadForce, left.hook].filter(Boolean);
  if (words.length === 0) return;
  const greetings = left.vocatives.filter((word) => !word.pos && word.reading === "greeting").flatMap((word) => nameKey(word) ?? []);
  enterMove(ctx, greetings);
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

  if (word.family.kind === "number" && ordinalPronounPlace(word) === undefined) {
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
  const place = ordinalPronounPlace(word);
  if (isSpanAnaphor(word)) bindSpan(ctx, word);
  else if (place !== undefined) bindOrdinal(ctx, word, place);
  else if (isNumberAnaphor(word)) bindNumber(ctx, word);
  else if (isRoleAnaphor(word)) bindRole(ctx, word);
  else if (isContentAnaphor(word)) bindContent(ctx, word);

  if (ctx.question && isJoinGap(word)) ctx.gaps.push(word);

  if (!ctx.goodbye) introduce(ctx, word);
  harvest(ctx, word);
}

/** Resolve as a handler set over the AST walk ([ast-walk.ts](./ast-walk.ts)). */
function resolveVisitor(ctx: Ctx): Visitor {
  // Inside an opaque `u` span nothing is read as a word (spans.md).
  let opaque = 0;
  return {
    word(word, slot) {
      if (opaque > 0 || slot === "boundJoinClose" || slot === "joinModifier" || slot === "factor") return;
      considerWord(ctx, word);
    },
    join(join, site) {
      if (opaque > 0) return;
      if (ctx.question && isJoinGap(join)) ctx.gaps.push(join);
    },
    enter(node) {
      if (node.kind === "body" && opaque === 0) enterMove(ctx, [greetingName(node.body) ?? []].flat());
      if (node.kind === "span" && spanTypeOf(node.span.open) === "u") {
        opaque += 1;
        return SKIP_CONTENT;
      }
      if (node.kind === "utterance") {
        enterLeft(ctx, node.utterance);
        ctx.question = isQuestionForce(node.utterance.left.force);
        ctx.gaps = [];
      }
    },
    exit(node) {
      if (node.kind === "span" && spanTypeOf(node.span.open) === "u") opaque -= 1;
      if (node.kind === "shared" && node.join && opaque === 0) {
        ctx.shared.push({ join: node.join, role: classifySharedRole(node.join, node.item), shared: node.item });
      }
      if (node.kind === "utterance") {
        const { left } = node.utterance;
        let kind: AskKind = "none";
        if (ctx.question) kind = isRhetorical(left.leadForce, left.force) ? "rhetorical" : ctx.gaps.length > 0 ? "fillAsk" : "yesNo";
        ctx.asks.push({ utteranceIndex: node.index, kind, gaps: ctx.gaps });
      }
    },
  };
}

function buildResolve(result: ParseResult): ResolveInfo {
  const ctx: Ctx = {
    antecedents: [],
    introduced: [],
    greeted: new Set(),
    closing: false,
    goodbye: false,
    anaphors: [],
    asks: [],
    shared: [],
    gaps: [],
    question: false,
  };
  visitResult(result, resolveVisitor(ctx));
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
    resolve: buildResolve(result),
  };
}
