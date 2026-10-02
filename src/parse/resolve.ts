import type {
  AnaphorBind,
  AskKind,
  AskRecord,
  BodyClause,
  Clause,
  CoordShared,
  Hosted,
  IslandUnit,
  LexWord,
  MorphWord,
  NpPackage,
  NpCoord,
  NumberMarker,
  ParseResult,
  PointerVowel,
  ResolveInfo,
  RoleVowel,
  SharedRecord,
  SharedRole,
  SpanUnit,
  Unit,
  Utterance,
  VpCoord,
  WritingBracket,
} from "./types.js";
import { isDigitless, isRhetorical, KIND_SERIES, SCALE_SERIES } from "./series.js";
import { isGreeting, isScaleShared, isSharedGPackage, SKIP_CONTENT, visitResult, type Visitor } from "./ast-walk.js";
import { CLOSED } from "../closed-roots.js";

const ROLE_FRAME_POS = new Set(["z", "d", "b", "v", "g", "h", "th"]);

type SpanType = "a" | "e" | "o" | "u";

type Antecedent =
  | { kind: "content"; word: LexWord; stem: string }
  | { kind: "span"; word: LexWord; typeVowel: SpanType }
  | { kind: "number"; word: LexWord; identity: string }
  | { kind: "roleFrame"; word: LexWord; stem: string };

/** A slot's filler: one word, or a joined group closed by its join word (pronouns.md#role-pointers). */
type Filler = { words: LexWord[]; join?: LexWord };

/** One predicate and the participants a role pointer can read from its clause (pronouns.md#role-pointers). */
type Anchor = { predicate: LexWord; fillers: Partial<Record<RoleVowel, Filler>> };

/** An open clause: its own anchor (absent with no predicate) and how many anchors came before it. */
type OpenClause = { anchor?: Anchor; before: number };

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
  /** Predicates in order, one per clause body outside spans; role pointers pick from these. */
  anchors: Anchor[];
  clauses: OpenClause[];
  /** Referent identity of each word a pointer resolved to (a group has one key). */
  referents: Map<LexWord, string>;
  asks: AskRecord[];
  shared: SharedRecord[];
  gaps: LexWord[];
  question: boolean;
};

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

/**
 * The whole stem of a word: its letters between the role letter and the ending (`odoga` of
 * `zodogal`, `owogala` of *enter* `vowogalal`, `owogaxa` of *can walk* `vowogaxal`). A content
 * **-r** resumes only a word with the identical stem ([pronouns.md](docs/grammar/pronouns.md#resume-r)).
 */
export function wholeStem(word: MorphWord): string {
  let body = word.raw;
  const prefix = word.gl ? "gl" : (word.pos ?? "");
  if (body.startsWith(prefix)) body = body.slice(prefix.length);
  if (word.plural && body.endsWith("x")) body = body.slice(0, -1);
  if (word.ending && body.endsWith(word.ending)) body = body.slice(0, -word.ending.length);
  return body;
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

/** The event stem a role compound names, or that a later role compound **-r** can name (roles.md#role-compounds). */
function roleStem(word: LexWord): string | undefined {
  const family = word.family;
  if (family.kind === "x" && family.xFamily === "role") return family.rightRoots?.join("x");
  if (word.reading === "joinRelation") return contentRoots(word).length > 0 ? wholeStem(word) : undefined;
  if (family.kind === "content" && word.pos && ROLE_FRAME_POS.has(word.pos)) return wholeStem(word);
  if (family.kind === "x" && family.xFamily === "compound" && word.pos && ROLE_FRAME_POS.has(word.pos)) {
    return wholeStem(word);
  }
  return undefined;
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

/** A role pointer, on its own or in a holder seam's holder slot (`thunemaxar`). */
function isPointer(word: LexWord): boolean {
  const family = word.family;
  return family.kind === "x" && (family.xFamily === "pointer" || (family.xFamily === "holder" && family.pointerVowel !== undefined));
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
  if (isSpanAnaphor(word) || isNumberAnaphor(word) || isRoleAnaphor(word) || isPointer(word)) return false;
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
  const stem = holder.length > 0 ? holder.join("x") : wholeStem(pronoun);
  const antecedent = bindLatest(ctx.antecedents, (item) => item.kind === "content" && item.stem === stem);
  ctx.anaphors.push({ pronoun, kind: "content", antecedent });
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
  const stem = roleStem(pronoun);
  const roleVowel = family.kind === "x" ? family.roleVowel : undefined;
  const antecedent = bindLatest(ctx.antecedents, (item) => item.kind === "roleFrame" && item.stem === stem);
  ctx.anaphors.push({ pronoun, kind: "role", roleVowel, antecedent });
}

// ── Role pointers (pronouns.md#role-pointers) ──────────────────────────────

/** Doer, undergoer, and extra party: the pointer follows whoever last filled that slot. */
const CORE_ROLES = new Set<RoleVowel>(["a", "u", "o"]);

/** Place hooks whose `/b/` is the scene (hooks.md#extra-noun). */
const PLACE_HOOKS = new Set(["al", "am", "aol", "aom", "ol", "om"]);

/** Extra-noun hooks paired with a stacked role vowel (`ael` → instrument `ae`). */
const STACKED_HOOK_ROLE: Record<string, RoleVowel> = { ael: "ae", oel: "oe", ual: "ua", uol: "uo", uel: "ue" };

function npFiller(coord: NpCoord): Filler | undefined {
  const words = coord.parts.flatMap((part) => part.items.flatMap((item) => (item.kind === "package" ? [item.package.head] : [])));
  if (words.length === 0) return undefined;
  return { words, join: [...coord.parts].reverse().find((part) => part.join)?.join };
}

function hostedFiller(hosted: Hosted | undefined): Filler | undefined {
  if (!hosted) return undefined;
  return { words: [hosted.bound, ...(hosted.boundJoin?.members ?? [])], join: hosted.boundJoin?.join };
}

/** *During* (`huwem`): its `/b/` is the scene's time when the clause has no place hook. */
function isDuring(word: LexWord): boolean {
  return word.pos === "h" && word.ending === "m" && word.family.kind === "content" && word.family.roots[0] === CLOSED.gemini;
}

/**
 * The anchor of a clause: its verb (or its `/ɡ/` word with no verb) and the overt filler of each
 * role. Doer `/z/`, undergoer `/d/`; the extra party is the verb's unhosted `/b/` or the `/b/` a
 * `/ɡ/` predicate hosts; the scene is the first place hook's `/b/`, else *during*'s; the stacked
 * roles read their paired hook's `/b/`.
 */
function anchorOf(clause: Clause): Anchor | undefined {
  let verb: LexWord | undefined;
  let gPredicate: { word: LexWord; hosted?: Hosted } | undefined;
  let sharedPredicate: { word: LexWord; hosted?: Hosted } | undefined;
  const fillers: Anchor["fillers"] = {};
  let unhosted: Filler | undefined;
  let place: Filler | undefined;
  let time: Filler | undefined;
  clause.units.forEach((unit, index) => {
    switch (unit.kind) {
      case "vp":
        verb ??= unit.coord.parts[0]?.items[0];
        return;
      case "predicate":
        gPredicate ??= { word: unit.adj.word, hosted: unit.adj.hosted };
        return;
      case "gCoord": {
        const adj = unit.coord.parts[0]?.items.find((item) => item.kind === "adj");
        if (adj?.kind === "adj") gPredicate ??= { word: adj.adj.word, hosted: adj.adj.hosted };
        return;
      }
      case "h":
        if (isDuring(unit.unit.word)) time ??= hostedFiller(unit.unit.hosted);
        return;
      case "np": {
        const filler = npFiller(unit.coord);
        if (!filler) return;
        if (unit.coord.level === "z") {
          fillers.a ??= filler;
          // A join with a shared `/ɡ/` and no verb (`zazawan zalahen zel gamadam`): the `/ɡ/` is the predicate.
          const shared = unit.coord.parts.flatMap((part) => part.shared).find(isSharedGPackage);
          if (shared && !isScaleShared(shared)) sharedPredicate ??= { word: shared.word, hosted: shared.hosted };
        }
        else if (unit.coord.level === "d") fillers.u ??= filler;
        else {
          const prev = clause.units[index - 1];
          const hook = prev?.kind === "hook" ? prev : undefined;
          if (!hook) unhosted ??= filler;
          else if (hook.job === "extraNoun" && !hook.onLeft) {
            const form = hook.word.raw;
            if (PLACE_HOOKS.has(form)) place ??= filler;
            const stacked = STACKED_HOOK_ROLE[form];
            if (stacked) fillers[stacked] ??= filler;
          }
        }
        return;
      }
    }
  });
  gPredicate ??= sharedPredicate;
  const predicate = verb ?? gPredicate?.word;
  if (!predicate) return undefined;
  const extra = verb ? unhosted : hostedFiller(gPredicate?.hosted);
  if (extra) fillers.o = extra;
  const scene = place ?? time;
  if (scene) fillers.e = scene;
  return { predicate, fillers };
}

/** Who a word refers to: a resume or pointer is its antecedent's referent; a name is the same person each time. */
function referentKey(ctx: Ctx, word: LexWord, seen = new Set<LexWord>()): string {
  const known = ctx.referents.get(word);
  if (known) return known;
  const bind = ctx.anaphors.find((item) => item.pronoun === word);
  if (bind?.antecedent && !seen.has(word)) {
    seen.add(word);
    return referentKey(ctx, bind.antecedent, seen);
  }
  const family = word.family;
  if (word.ending === "n" || (word.ending === "r" && family.kind === "content")) {
    return `${word.ending === "n" ? "name" : "the"}:${wholeStem(word)}${word.plural ? "+x" : ""}`;
  }
  return `at:${word.at ?? -1}`;
}

function fillerKey(ctx: Ctx, filler: Filler): string {
  return filler.words.map((word) => referentKey(ctx, word)).sort().join("&");
}

/** The word a pointer binds: the one filler, or the join that closes a group. */
function fillerWord(filler: Filler): LexWord {
  return filler.words.length === 1 ? filler.words[0]! : (filler.join ?? filler.words[0]!);
}

function bindPointer(ctx: Ctx, pronoun: LexWord): void {
  const family = pronoun.family;
  if (family.kind !== "x") return;
  const roleVowel = family.roleVowel!;
  const pointerVowel: PointerVowel = family.pointerVowel!;
  const bind: AnaphorBind = { pronoun, kind: "pointer", roleVowel, pointerVowel };
  ctx.anaphors.push(bind);
  const open = ctx.clauses.at(-1);
  const earlier = ctx.anchors.slice(0, open?.before ?? ctx.anchors.length).reverse();
  const core = CORE_ROLES.has(roleVowel);
  let anchor: Anchor | undefined;
  let filler: Filler | undefined;
  if (pointerVowel === "e") {
    anchor = open?.anchor;
    filler = anchor?.fillers[roleVowel];
    if (filler?.words.includes(pronoun)) {
      bind.ownSlot = true;
      return;
    }
  } else if (!core) {
    if (pointerVowel === "a") anchor = earlier[0];
    filler = anchor?.fillers[roleVowel];
  } else {
    const filled = earlier.filter((item) => item.fillers[roleVowel]);
    anchor = filled[0];
    if (pointerVowel === "o" && anchor) {
      const same = fillerKey(ctx, anchor.fillers[roleVowel]!);
      anchor = filled.find((item) => fillerKey(ctx, item.fillers[roleVowel]!) !== same);
    }
    filler = anchor?.fillers[roleVowel];
  }
  if (!anchor) return;
  if (core && !filler) return;
  bind.antecedent = filler ? fillerWord(filler) : anchor.predicate;
  ctx.referents.set(pronoun, filler ? fillerKey(ctx, filler) : `${roleVowel}@${anchor.predicate.at ?? -1}`);
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

  if (contentRoots(word).length > 0) {
    ctx.antecedents.push({ kind: "content", word, stem: wholeStem(word) });
  }

  const rStem = roleStem(word);
  if (rStem) {
    ctx.antecedents.push({ kind: "roleFrame", word, stem: rStem });
  }
}

function considerWord(ctx: Ctx, word: LexWord): void {
  const place = ordinalPronounPlace(word);
  if (isSpanAnaphor(word)) bindSpan(ctx, word);
  else if (place !== undefined) bindOrdinal(ctx, word, place);
  else if (isNumberAnaphor(word)) bindNumber(ctx, word);
  else if (isRoleAnaphor(word)) bindRole(ctx, word);
  else if (isPointer(word)) bindPointer(ctx, word);
  else if (isContentAnaphor(word)) bindContent(ctx, word);

  if (ctx.question && isJoinGap(word)) ctx.gaps.push(word);

  if (!ctx.goodbye) introduce(ctx, word);
  harvest(ctx, word);
}

/** Resolve as a handler set over the AST walk ([ast-walk.ts](./ast-walk.ts)). */
function resolveVisitor(ctx: Ctx): Visitor {
  // Inside an opaque `u` span nothing is read as a word (spans.md).
  let opaque = 0;
  // Span interiors (quotes, asides) add no anchors for role pointers.
  let spans = 0;
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
      if (node.kind === "clause") {
        const anchor = anchorOf(node.clause);
        ctx.clauses.push({ anchor, before: ctx.anchors.length });
        if (anchor && spans === 0) ctx.anchors.push(anchor);
      }
      if (node.kind === "span") spans += 1;
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
      if (node.kind === "clause") ctx.clauses.pop();
      if (node.kind === "span") spans -= 1;
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
    anchors: [],
    clauses: [],
    referents: new Map(),
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
