import type {
  AnaphorBind,
  AskKind,
  AskRecord,
  BodyClause,
  Clause,
  CoordShared,
  Hosted,
  HUnit,
  IslandUnit,
  LexWord,
  MorphWord,
  NpPackage,
  NpCoord,
  NumberMarker,
  ParseResult,
  PointerVowel,
  ResolveInfo,
  RolePart,
  SharedRecord,
  SharedRole,
  TagVowel,
  Unit,
  Utterance,
  VpCoord,
  WritingBracket,
} from "./types.js";
import { actWord, isDigitless, joinHook, KIND_SERIES, SCALE_SERIES } from "./series.js";
import { isGreeting, isScaleShared, isSharedGPackage, isSharedHUnit, visitResult, vpUnitLists, type Visitor, type WordSlot } from "./ast-walk.js";
import { CLOSED, closedDerived } from "../closed-roots.js";
import { isClauseAdverb } from "./classify.js";
import { linkerEnglish, topicEffect } from "./linkers.js";

const ROLE_FRAME_POS = new Set(["z", "d", "b", "v", "g", "h", "th"]);

type Antecedent =
  | { kind: "content"; word: LexWord; stem: string; sense?: "l" | "m" }
  | { kind: "number"; word: LexWord; identity: string }
  | { kind: "roleFrame"; word: LexWord; stem: string };

/** A slot's filler: one word, or a joined group closed by its join word (pronouns.md#role-pointers). */
type Filler = { words: LexWord[]; join?: LexWord };

/** One predicate and the participants a role pointer can read from its clause (pronouns.md#role-pointers). */
type Anchor = { predicate: LexWord; fillers: Partial<Record<RolePart, Filler>> };

/** An open clause: its own anchor (absent with no predicate) and how many anchors came before it. */
type OpenClause = { anchor?: Anchor; before: number };

/** What a tag names: the phrase it was assigned to (or the tag word itself for a new referent), its referent key, and whether the phrase is a name (**-n**), which a tag **-n** needs. */
type TagBinding = { word: LexWord; key: string; named: boolean };

/** What the talk is about now: the `/x/` word that set it, and the referent it names (topic.md#topic). */
type Topic = { word: LexWord; key: string };

/** A landmark in play (hooks.md#hooked-joins-point-back): a hook's `/b/`, a hosted `bl-` word, or a hooked join's. */
type Landmark = { word: LexWord; time: boolean };

type Ctx = {
  antecedents: Antecedent[];
  /** Landmarks in surface order; a hooked join's point-back takes the latest (on `/h/`, the latest time one). */
  landmarks: Landmark[];
  /** The last head word, whose hosted `/b/` comes next. */
  host?: LexWord;
  /** The `/b/` heads that extra-noun hooks take as their landmarks. */
  hookLandmarks: Set<LexWord>;
  /** Names said in this conversation; a greeting from one of them while closing is goodbye too. */
  named: Set<string>;
  /** Tags assigned in this conversation (pronouns.md#tag-pronouns); a topic change leaves them alone. */
  tags: Map<TagVowel, TagBinding>;
  /** Head of the noun package the walk is in: a tag **-l** riding on the package names it. */
  packageHead?: LexWord;
  /** A tag after a closed fence, and the group it names. */
  groupTags: Map<LexWord, GroupTag>;
  /** The current topic: set only by an `/x/` topic word, cleared by *next*, *by the way*, and goodbye. */
  topic?: Topic;
  /** Names that have greeted; the same greeting again is goodbye. */
  greeted: Set<string>;
  /** After a goodbye: the next utterance that is not a goodbye starts a new conversation. */
  closing: boolean;
  /** This utterance is a goodbye, so its greeting introduces no one. */
  goodbye: boolean;
  anaphors: AnaphorBind[];
  /** Predicates in order, one per clause body; role pointers pick from these. */
  anchors: Anchor[];
  clauses: OpenClause[];
  /** Completed turns, in order; a `y` pointer reads these (roles.md#content-of-the-event). */
  turns: { head: LexWord }[];
  /** The utterance the walk is in, until it closes. */
  currentTurn?: { head?: LexWord };
  /** The next clause opened with *therefore* / *it follows that*; its event is the previous event's outcome. */
  pendingConsequence: boolean;
  /** This utterance opened with a consequence linker. */
  consequenceHere: boolean;
  /** Referent identity of each word a pointer resolved to (a group has one key). */
  referents: Map<LexWord, string>;
  asks: AskRecord[];
  shared: SharedRecord[];
  gaps: LexWord[];
  /** Blanks owned by a `dorl` dependent (the rest of the sentence after it). */
  innerGaps: LexWord[];
  /** The stand-in of the dependent the walk is inside, if any. */
  standIn?: LexWord;
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

/**
 * The whole stem of a word: its letters between the role letter and the ending (`odoga` of
 * `zodogal`, `owogala` of *enter* `vowogalal`, `owogaxa` of *can walk* `vowogaxal`). A content
 * **-r** resumes only a word with the identical stem ([pronouns.md](docs/grammar/pronouns.md#resume-r)).
 */
export function wholeStem(word: MorphWord): string {
  let body = word.raw;
  const prefix = word.gl ? "gl" : word.bl ? "bl" : (word.pos ?? "");
  if (body.startsWith(prefix)) body = body.slice(prefix.length);
  if (word.plural && body.endsWith("x")) body = body.slice(0, -1);
  const ending = `${word.ending ?? ""}${word.resumeSense ?? ""}`;
  if (ending && body.endsWith(ending)) body = body.slice(0, -ending.length);
  return body;
}

function contentRoots(word: LexWord): string[] {
  const family = word.family;
  if (family.kind === "content") return family.roots;
  if (family.kind === "x" && family.xFamily === "compound") {
    return [...family.leftRoots, ...(family.rightRoots ?? [])];
  }
  // A hook or numeric prefix's **-r** resumes the whole word, prefix and stem (`zuexavuvur`, hooks.md#hook-prefixes).
  if (family.kind === "x" && (family.xFamily === "hookPrefix" || family.xFamily === "numeric")) return family.rightRoots ?? [];
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
  if (series === "oe") return "equative";
  if (KIND_SERIES.has(series)) return "kind";
  if (series === "a") return isSharedGPackage(shared) && shared.word.plural ? "collective" : "distribute";
  return "ordinary";
}

/** Digitless number **-r** (`g=+`): *some number*, or a fill-ask blank under question — not a resume (digitless-exponents.md#digitless). */
export function isDigitlessNumberBlank(word: LexWord): boolean {
  const family = word.family;
  return family.kind === "number" && word.ending === "r" && isDigitless(family.stem);
}

function isNumberAnaphor(word: LexWord): boolean {
  return word.family.kind === "number" && word.ending === "r" && !isDigitlessNumberBlank(word);
}

/** Special pronouns name conversation roles, not people, so they take no number. */
export const rolePronounRoots = closedDerived(() => new Set([CLOSED.microphone, CLOSED.headphones, CLOSED.handshake, CLOSED.neutral]));

function isNounSlot(word: LexWord): boolean {
  return word.pos === "z" || word.pos === "d" || word.pos === "b";
}

function singleRoot(word: LexWord): string | undefined {
  return word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
}

/** The root a pronoun is built on: the noun's own, or the one a holder seam names (`thunemozan`, knowing.md#holder). */
function pronounRoot(word: LexWord): string | undefined {
  if (word.ending !== "n") return undefined;
  if (isNounSlot(word)) return singleRoot(word);
  const { family } = word;
  return family.kind === "x" && family.xFamily === "holder" && family.rightRoots?.length === 1 ? family.rightRoots[0] : undefined;
}

/** The topic pronoun: the star root + **-n** on `/z/` `/d/` `/b/`, or as a holder (`zozan`, topic.md#topic-pronoun). */
export function isTopicPronoun(word: LexWord): boolean {
  return pronounRoot(word) === CLOSED.star;
}

/** The generic pronoun: the person root + **-n** on `/z/` `/d/` `/b/`, or as a holder (`zoben`, pronouns.md#generic-pronoun). */
export function isGenericPronoun(word: LexWord): boolean {
  return pronounRoot(word) === CLOSED.person;
}

/** Who a topic word or a name picks out: its whole stem, plus `-x` for a group. */
function topicKeyOf(word: LexWord): string {
  const family = word.family;
  if (family.kind === "writingSpan") return `span:${family.bracket}:${family.payload}${word.plural ? "+x" : ""}`;
  return `${wholeStem(word)}${word.plural ? "+x" : ""}`;
}

/** Identity of a name (`-n`): its roots, plus `-x` for a group. */
function nameKey(word: LexWord): string | undefined {
  if (word.ending !== "n" || word.family.kind === "joinMarker") return undefined;
  const roots = contentRoots(word);
  if (roots.length === 0 || roots.some((root) => rolePronounRoots().has(root))) return undefined;
  if (isTopicPronoun(word) || isGenericPronoun(word)) return undefined;
  return `${roots.join("x")}${word.plural ? "+x" : ""}`;
}

function isRoleAnaphor(word: LexWord): boolean {
  return word.family.kind === "x" && word.family.xFamily === "role" && word.ending === "r";
}

function isPointer(word: LexWord): boolean {
  return word.family.kind === "x" && word.family.xFamily === "pointer";
}

/**
 * The person a seam's own **-r** resumes: a holder's (`thevemazawar`, knowing.md#holder) or a viewpoint lateral's facing
 * anchor (`howuhethuzozer`, roles.md#viewpoint-laterals).
 */
function holderRoots(word: LexWord): string[] {
  const family = word.family;
  if (family.kind !== "x") return [];
  if (family.xFamily === "holder" || (family.xFamily === "lateral" && !family.landmark)) return family.rightRoots ?? [];
  return [];
}

function isContentAnaphor(word: LexWord): boolean {
  if (word.ending !== "r") return false;
  if (word.reading === "sake") return false;
  if (word.reading === "restrictor" || word.reading === "overlay") return false;
  if (word.family.kind === "joinMarker") return false;
  if (word.family.kind === "hook") return false;
  if (isNumberAnaphor(word) || isRoleAnaphor(word) || isPointer(word)) return false;
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
  const sense = pronoun.resumeSense;
  const antecedent = bindLatest(
    ctx.antecedents,
    (item) => item.kind === "content" && item.stem === stem && (!sense || item.sense === sense),
  );
  ctx.anaphors.push({ pronoun, kind: "content", antecedent });
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

/** A new topic stretch: the role-pointer anchors start over; tags stay (topic.md#topic-resets). */
function resetStretch(ctx: Ctx): void {
  ctx.anchors.length = 0;
}

function bindTopic(ctx: Ctx, pronoun: LexWord): void {
  ctx.anaphors.push({ pronoun, kind: "topic", antecedent: ctx.topic?.word });
}

/**
 * Whether an earlier word is a noun a return can make the topic again: a `/z/` `/d/` `/b/` noun or an earlier topic
 * word. A verb, property, scale, or linker resumed on `/x/` only points back at it (say-people-places.md#resume-x).
 */
function namesTopicReferent(word: LexWord): boolean {
  if (word.pos === "x") return topicEffect(word) === "introduce" || topicEffect(word) === "return";
  return isNounSlot(word);
}

/**
 * A body's opening `/x/` word. Introduce and return set the topic, *next* and *by the way* clear it, and each
 * starts a new stretch (topic.md#topic). A return that resumes a published linker (`xodur` after `xodum`) is
 * only that linker again.
 */
function considerLinker(ctx: Ctx, word: LexWord): void {
  const effect = topicEffect(word);
  if (effect === "none") {
    considerWord(ctx, word);
    return;
  }
  if (effect === "return") {
    bindContent(ctx, word);
    const antecedent = ctx.anaphors.at(-1)?.antecedent;
    if (antecedent && !namesTopicReferent(antecedent)) {
      harvest(ctx, word);
      return;
    }
  }
  resetStretch(ctx);
  ctx.topic = effect === "clear" ? undefined : { word, key: topicKeyOf(word) };
  harvest(ctx, word);
}

/** The greeter's own name in a greeting sentence (`azawan.`, word-endings.md#greeting). */
function greetingName(body: BodyClause): string | undefined {
  if (!isGreeting(body.clause)) return undefined;
  const [unit] = body.clause.units;
  const [item] = unit?.kind === "np" ? unit.coord.parts[0]!.items : [];
  return item?.kind === "package" ? nameKey(item.package.head) : undefined;
}

/**
 * Conversation boundary (word-endings.md#greeting): a greeting from a name that already greeted is goodbye.
 * After a goodbye, the next move that is not one starts a new conversation, with no tags (pronouns.md#tag-lifetime).
 */
function enterMove(ctx: Ctx, greetings: string[]): void {
  const known = (key: string) => ctx.greeted.has(key) || (ctx.closing && ctx.named.has(key));
  ctx.goodbye = greetings.length > 0 && greetings.every(known);
  if (ctx.goodbye) {
    ctx.closing = true;
    ctx.topic = undefined;
    return;
  }
  if (ctx.closing) {
    ctx.topic = undefined;
    ctx.named.clear();
    ctx.tags.clear();
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
  const part = family.kind === "x" ? family.part : undefined;
  const antecedent = bindLatest(ctx.antecedents, (item) => item.kind === "roleFrame" && item.stem === stem);
  ctx.anaphors.push({ pronoun, kind: "role", part, antecedent });
}

// ── Role pointers (pronouns.md#role-pointers) ──────────────────────────────

function npFiller(coord: NpCoord): Filler | undefined {
  const words = coord.parts.flatMap((part) => part.items.flatMap((item) => (item.kind === "package" ? [item.package.head] : [])));
  if (words.length === 0) return undefined;
  return { words, join: [...coord.parts].reverse().find((part) => part.join)?.join };
}

function hostedFiller(hosted: Hosted | undefined): Filler | undefined {
  if (!hosted) return undefined;
  return { words: [hosted.bound, ...(hosted.boundJoin?.members ?? [])], join: hosted.boundJoin?.join };
}

const TIME_POLES = new Set(["until", "by", "before", "after", "while"]);
const STANCE_SKIP = new Set(["evidential", "may", "notional", "mirative"]);
const SLOT_PARTS = new Set<RolePart>(["z", "d", "b"]);

function isMannerWord(word: LexWord): boolean {
  if (word.pos !== "h") return false;
  if (word.family.kind === "say") return false;
  if (word.family.kind === "x" && word.family.xFamily === "pointer") return false;
  if (word.reading === "restrictor" || word.reading === "joinRelation") return false;
  if (word.family.kind === "number") return false;
  if (isClauseAdverb(word)) return false;
  if (word.overlay?.kind === "clause_pole" && TIME_POLES.has(word.overlay.gloss)) return false;
  return word.family.kind === "content" || word.family.kind === "x";
}

function isStanceWord(word: LexWord): boolean {
  if (word.pos !== "th") return false;
  if (word.family.kind === "x" && word.family.xFamily === "holder") return false;
  if (word.overlay && STANCE_SKIP.has(word.overlay.kind)) return false;
  if (word.reading === "sake") return true;
  if (word.overlay?.kind === "cause" || word.overlay?.kind === "clause_pole") return true;
  if (word.overlay?.kind === "plan" || word.overlay?.kind === "want" || word.overlay?.kind === "decision") return true;
  return word.family.kind === "content";
}

function takeHUnit(unit: HUnit, pred: (word: LexWord) => boolean, words: LexWord[]): void {
  if (pred(unit.word)) words.push(unit.word);
}

function collectHWords(units: Unit[], pred: (word: LexWord) => boolean, words: LexWord[]): void {
  for (const unit of units) {
    if (unit.kind === "h") takeHUnit(unit.unit, pred, words);
    else if (unit.kind === "vp") {
      for (const part of unit.coord.parts) {
        for (const item of part.shared) if (isSharedHUnit(item)) takeHUnit(item, pred, words);
        for (const nested of part.itemUnits ?? []) collectHWords(nested.units, pred, words);
        collectHWords(part.sharedUnits ?? [], pred, words);
      }
    } else if (unit.kind === "np") {
      for (const part of unit.coord.parts) {
        for (const item of part.shared) if (isSharedHUnit(item)) takeHUnit(item, pred, words);
      }
    } else if (unit.kind === "island") collectHWords(unit.island.units, pred, words);
    else if (unit.kind === "hook" && unit.frame) takeHUnit(unit.frame, pred, words);
  }
}

function contentFiller(clause: Clause, pred: (word: LexWord) => boolean): Filler | undefined {
  const words: LexWord[] = [];
  collectHWords(clause.units, pred, words);
  return words.length > 0 ? { words } : undefined;
}

function isConsequenceLinker(word: LexWord): boolean {
  const tag = linkerEnglish(word);
  return tag === "therefore" || tag === "it-follows";
}

/**
 * The anchor of a clause: its verb (or its `/ɡ/` word with no verb) and the overt filler of each
 * role. Doer `/z/`, undergoer `/d/`; the extra party is the verb's unhosted `/b/` or the `/b/` a
 * `/ɡ/` predicate hosts. Content-rule parts harvest manner `/h/` and stance `/th/` words here
 * (roles.md#content-of-the-event).
 */
function anchorOf(clause: Clause): Anchor | undefined {
  let verb: LexWord | undefined;
  let gPredicate: { word: LexWord; hosted?: Hosted } | undefined;
  let sharedPredicate: { word: LexWord; hosted?: Hosted } | undefined;
  const fillers: Anchor["fillers"] = {};
  let unhosted: Filler | undefined;
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
      case "np": {
        const filler = npFiller(unit.coord);
        if (!filler) return;
        if (unit.coord.level === "z") {
          fillers.z ??= filler;
          // A join with a shared `/ɡ/` and no verb (`zazawan zalahen zel gamadam`): the `/ɡ/` is the predicate.
          const shared = unit.coord.parts.flatMap((part) => part.shared).find(isSharedGPackage);
          if (shared && !isScaleShared(shared)) sharedPredicate ??= { word: shared.word, hosted: shared.hosted };
        }
        else if (unit.coord.level === "d") fillers.d ??= filler;
        else if (clause.units[index - 1]?.kind !== "hook") unhosted ??= filler;
        return;
      }
    }
  });
  gPredicate ??= sharedPredicate;
  const predicate = verb ?? gPredicate?.word;
  if (!predicate) return undefined;
  const extra = verb ? unhosted : hostedFiller(gPredicate?.hosted);
  if (extra) fillers.b = extra;
  const manner = contentFiller(clause, isMannerWord);
  if (manner) fillers.h = manner;
  const stance = contentFiller(clause, isStanceWord);
  if (stance) fillers.th = stance;
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

function pinPointer(ctx: Ctx, bind: AnaphorBind, pronoun: LexWord, part: RolePart, filler: Filler | undefined, host: LexWord): void {
  bind.antecedent = filler ? fillerWord(filler) : host;
  if (pronoun.ending !== "r") ctx.referents.set(pronoun, `${pronoun.ending}:${pronoun.at ?? -1}`);
  else ctx.referents.set(pronoun, filler ? fillerKey(ctx, filler) : `${part}@${host.at ?? -1}`);
}

function resultingState(anchor: Anchor): Filler | undefined {
  return anchor.fillers.d ?? anchor.fillers.z;
}

/**
 * Content-rule pointers (roles.md#content-of-the-event): manner, state, stance, extent, speech move,
 * outcome, and the event itself. Structure decides which words count; the resolver uses no word meanings.
 */
function bindContentPointer(ctx: Ctx, bind: AnaphorBind, pronoun: LexWord, part: RolePart, pointerVowel: PointerVowel): void {
  const open = ctx.clauses.at(-1);
  const earlier = ctx.anchors.slice(0, open?.before ?? ctx.anchors.length).reverse();

  if (part === "y") {
    if (pointerVowel === "e") {
      const head = ctx.currentTurn?.head;
      if (head) pinPointer(ctx, bind, pronoun, part, undefined, head);
      return;
    }
    const latest = ctx.turns.at(-1);
    if (pointerVowel === "o") {
      const other = ctx.turns.at(-2);
      if (other) pinPointer(ctx, bind, pronoun, part, undefined, other.head);
      return;
    }
    if (latest) pinPointer(ctx, bind, pronoun, part, undefined, latest.head);
    return;
  }

  if ((part === "g" || part === "w") && pointerVowel === "o") return;

  if (part === "h" || part === "th") {
    const slot = part;
    let anchor: Anchor | undefined;
    let filler: Filler | undefined;
    if (pointerVowel === "e") {
      anchor = open?.anchor;
      filler = anchor?.fillers[slot];
    } else if (pointerVowel === "u") {
      anchor = earlier.find((item) => !item.fillers[slot]);
    } else {
      const filled = earlier.filter((item) => item.fillers[slot]);
      anchor = filled[0];
      if (pointerVowel === "o" && anchor) {
        const same = fillerKey(ctx, anchor.fillers[slot]!);
        anchor = filled.find((item) => fillerKey(ctx, item.fillers[slot]!) !== same);
        filler = anchor?.fillers[slot];
      } else if (pointerVowel === "a") {
        filler = anchor?.fillers[slot];
        if (!anchor) anchor = earlier[0];
      }
    }
    if (!anchor) return;
    if (pointerVowel !== "u" && pointerVowel !== "a" && pointerVowel !== "e" && !filler) return;
    pinPointer(ctx, bind, pronoun, part, filler, anchor.predicate);
    return;
  }

  if (part === "g") {
    let anchor: Anchor | undefined;
    let filler: Filler | undefined;
    if (pointerVowel === "e") {
      anchor = open?.anchor;
      filler = anchor ? resultingState(anchor) : undefined;
    } else if (pointerVowel === "u") {
      anchor = earlier.find((item) => !resultingState(item)) ?? earlier[0];
      filler = anchor ? resultingState(anchor) : undefined;
    } else {
      anchor = earlier.find((item) => resultingState(item)) ?? earlier[0];
      filler = anchor ? resultingState(anchor) : undefined;
    }
    if (!anchor) return;
    pinPointer(ctx, bind, pronoun, part, filler, anchor.predicate);
    return;
  }

  if (part === "w" || part === "v") {
    let anchor: Anchor | undefined;
    if (pointerVowel === "e") anchor = open?.anchor;
    else if (pointerVowel === "o") anchor = earlier[1];
    else anchor = earlier[0];
    if (!anchor) return;
    pinPointer(ctx, bind, pronoun, part, undefined, anchor.predicate);
    return;
  }

  if (part === "x") {
    let anchor: Anchor | undefined;
    let filler: Filler | undefined;
    if (pointerVowel === "e") {
      if (ctx.consequenceHere && open?.anchor) {
        pinPointer(ctx, bind, pronoun, part, undefined, open.anchor.predicate);
        return;
      }
      anchor = open?.anchor;
      filler = anchor?.fillers.x;
    } else if (pointerVowel === "u") {
      anchor = earlier.find((item) => !item.fillers.x);
    } else {
      const filled = earlier.filter((item) => item.fillers.x);
      anchor = filled[0];
      if (pointerVowel === "o" && anchor) {
        const same = fillerKey(ctx, anchor.fillers.x!);
        anchor = filled.find((item) => fillerKey(ctx, item.fillers.x!) !== same);
      }
      filler = anchor?.fillers.x;
    }
    if (!anchor) return;
    if (pointerVowel !== "u" && !filler) return;
    pinPointer(ctx, bind, pronoun, part, filler, anchor.predicate);
  }
}

function bindPointer(ctx: Ctx, pronoun: LexWord): void {
  const family = pronoun.family;
  if (family.kind !== "x") return;
  const part = family.part!;
  const pointerVowel: PointerVowel = family.pointerVowel!;
  const bind: AnaphorBind = { pronoun, kind: "pointer", part, pointerVowel };
  ctx.anaphors.push(bind);
  if (!SLOT_PARTS.has(part)) {
    bindContentPointer(ctx, bind, pronoun, part, pointerVowel);
    return;
  }
  const open = ctx.clauses.at(-1);
  const earlier = ctx.anchors.slice(0, open?.before ?? ctx.anchors.length).reverse();
  // The pointer follows whoever last filled that slot.
  let anchor: Anchor | undefined;
  let filler: Filler | undefined;
  if (pointerVowel === "e") {
    anchor = open?.anchor;
    filler = anchor?.fillers[part];
    if (filler?.words.includes(pronoun)) {
      bind.ownSlot = true;
      return;
    }
  } else if (pointerVowel === "u") {
    anchor = earlier.find((item) => !item.fillers[part]);
  } else {
    const filled = earlier.filter((item) => item.fillers[part]);
    anchor = filled[0];
    if (pointerVowel === "o" && anchor) {
      const same = fillerKey(ctx, anchor.fillers[part]!);
      anchor = filled.find((item) => fillerKey(ctx, item.fillers[part]!) !== same);
    }
    filler = anchor?.fillers[part];
  }
  if (!anchor) return;
  if (pointerVowel !== "u" && !filler) return;
  pinPointer(ctx, bind, pronoun, part, filler, anchor.predicate);
}

// ── Tag pronouns (pronouns.md#tag-pronouns) ────────────────────────────────

type TagWord = LexWord & { family: { kind: "tag"; vowels: TagVowel[] } };

function isTag(word: LexWord): word is TagWord {
  return word.family.kind === "tag";
}

/** A tag after a closed fence names the group: the join word, and the members' referents. */
type GroupTag = { join: LexWord; words: LexWord[] };

/**
 * Assign: on a package (`zodogal zwal`) a tag names that phrase, after a fence (`… zam zwal`) the whole group, and
 * alone (`zwal`) a new referent; a newer assignment takes the tag over.
 */
function assignTag(ctx: Ctx, word: TagWord, slot: WordSlot | undefined): void {
  const vowel = word.family.vowels[0]!;
  const group = slot === "groupTag" ? ctx.groupTags.get(word) : undefined;
  const named = slot === "tag" ? ctx.packageHead : group?.join;
  const key = group ? fillerKey(ctx, { words: group.words }) : referentKey(ctx, named ?? word);
  ctx.referents.set(word, key);
  if (named) ctx.referents.set(named, key);
  const isName = group ? group.words.every((item) => item.ending === "n") : named?.ending === "n";
  ctx.tags.set(vowel, { word: named ?? word, key, named: isName });
  if (named) ctx.anaphors.push({ pronoun: word, kind: "tag", antecedent: named });
}

/** Whether a slot's filler is that referent: one of its words, or the whole joined group. */
function fillerHas(ctx: Ctx, filler: Filler, key: string): LexWord | undefined {
  if (fillerKey(ctx, filler) === key) return fillerWord(filler);
  return filler.words.find((item) => referentKey(ctx, item) === key);
}

/**
 * **-r** is the tagged referent, and **-n** the same when it was assigned to a name; **-m** its part in the latest earlier event it filled a part of. A pair (`zwaer`) is
 * both at once: together on **-r**, and their parts in the latest earlier event both took part in on **-m**.
 * A recall or share with a tag not assigned (or, for **-n**, not assigned to a name) stays unbound (enforce rejects it).
 */
function recallTag(ctx: Ctx, word: TagWord): void {
  const bind: AnaphorBind = { pronoun: word, kind: "tag" };
  ctx.anaphors.push(bind);
  const bindings = word.family.vowels.map((vowel) => ctx.tags.get(vowel));
  if (bindings.some((binding) => !binding)) return;
  const tagged = bindings as TagBinding[];
  const pair = tagged.length > 1;
  if (word.ending === "n" && tagged.some((binding) => !binding.named)) return;
  if (word.ending === "r" || word.ending === "n") {
    bind.antecedent = tagged[0]!.word;
    if (pair) bind.antecedents = tagged.map((binding) => binding.word);
    ctx.referents.set(word, tagged.map((binding) => binding.key).sort().join("&"));
    return;
  }
  if (word.ending !== "m") return;
  const open = ctx.clauses.at(-1);
  const earlier = ctx.anchors.slice(0, open?.before ?? ctx.anchors.length).reverse();
  for (const anchor of earlier) {
    const fillers = Object.entries(anchor.fillers) as [RolePart, Filler][];
    const found = tagged.map((binding) => {
      for (const [role, filler] of fillers) {
        const hit = fillerHas(ctx, filler, binding.key);
        if (hit) return { role, word: hit };
      }
      return undefined;
    });
    if (found.some((item) => !item)) continue;
    const parts = found as { role: RolePart; word: LexWord }[];
    bind.antecedent = parts[0]!.word;
    if (pair) bind.antecedents = parts.map((part) => part.word);
    else bind.part = parts[0]!.role;
    // A share is the part in that event, its own referent (pronouns.md#share).
    ctx.referents.set(word, `m:${word.at ?? -1}`);
    return;
  }
}

function considerTag(ctx: Ctx, word: TagWord, slot: WordSlot | undefined): void {
  if (word.ending === "l") assignTag(ctx, word, slot);
  else recallTag(ctx, word);
}

/** Which sense of its stem a word carries: **-l** / **-m**, or a resume's own pin or its antecedent's (pronouns.md#resume-sense). */
function sensePinned(ctx: Ctx, word: LexWord): "l" | "m" | undefined {
  if (word.ending === "l" || word.ending === "m") return word.ending;
  if (word.ending !== "r") return undefined;
  if (word.resumeSense) return word.resumeSense;
  const bound = ctx.anaphors.find((item) => item.pronoun === word)?.antecedent;
  if (!bound) return undefined;
  for (let i = ctx.antecedents.length - 1; i >= 0; i--) {
    const item = ctx.antecedents[i]!;
    if (item.kind === "content" && item.word === bound) return item.sense;
  }
  return undefined;
}

function harvest(ctx: Ctx, word: LexWord): void {
  if (word.family.kind === "number") {
    ctx.antecedents.push({
      kind: "number",
      word,
      identity: numberMarkerIdentity(word.family.stem.marker),
    });
  }

  if (contentRoots(word).length > 0) {
    ctx.antecedents.push({ kind: "content", word, stem: wholeStem(word), sense: sensePinned(ctx, word) });
  }

  const rStem = roleStem(word);
  if (rStem) {
    ctx.antecedents.push({ kind: "roleFrame", word, stem: rStem });
  }
}

// ── Hooked-join point-back (hooks.md#hooked-joins-point-back) ──────────────

/** A time pole (`halam`, `harum`, …) or an `/h/` hooked join: its landmark is a time. */
function hostsTime(host: LexWord | undefined): boolean {
  if (!host || host.pos !== "h") return false;
  if (joinHook(host)) return true;
  return host.overlay?.kind === "clause_pole" && TIME_POLES.has(host.overlay.gloss);
}

/** The `/b/` heads right after extra-noun hooks in one unit list: those hooks' landmarks. */
function noteHookLandmarks(ctx: Ctx, units: Unit[]): void {
  units.forEach((unit, i) => {
    const next = units[i + 1];
    if (unit.kind !== "hook" || unit.job !== "extraNoun" || next?.kind !== "np" || next.coord.level !== "b") return;
    for (const item of next.coord.parts[0]?.items ?? []) if (item.kind === "package") ctx.hookLandmarks.add(item.package.head);
  });
}

/** Note a landmark this word puts in play, by the slot it fills. */
function noteLandmark(ctx: Ctx, word: LexWord, slot: WordSlot | undefined): void {
  if (slot === "joinLandmark") ctx.landmarks.push({ word, time: false });
  else if (slot === "bound") ctx.landmarks.push({ word, time: hostsTime(ctx.host) });
  else if (ctx.hookLandmarks.has(word)) ctx.landmarks.push({ word, time: false });
  if (slot === "head") ctx.host = word;
}

/** A hooked join's **-r** hook points back to the latest landmark; on `/h/`, to the latest time landmark. */
function bindLandmark(ctx: Ctx, word: LexWord): void {
  const hook = joinHook(word);
  if (!hook?.endsWith("r")) return;
  const time = word.pos === "h";
  const found = [...ctx.landmarks].reverse().find((landmark) => !time || landmark.time);
  ctx.anaphors.push({ pronoun: word, kind: "landmark", ...(found ? { antecedent: found.word } : {}) });
}

function considerWord(ctx: Ctx, word: LexWord, slot?: WordSlot): void {
  if (isTopicPronoun(word)) bindTopic(ctx, word);
  else if (isTag(word)) considerTag(ctx, word, slot);
  else if (isNumberAnaphor(word)) bindNumber(ctx, word);
  else if (isRoleAnaphor(word)) bindRole(ctx, word);
  else if (isPointer(word)) bindPointer(ctx, word);
  else if (isContentAnaphor(word)) bindContent(ctx, word);
  else bindLandmark(ctx, word);
  noteLandmark(ctx, word, slot);

  if (ctx.question && isJoinGap(word)) ctx.gaps.push(word);

  const name = ctx.goodbye ? undefined : nameKey(word);
  if (name) ctx.named.add(name);
  harvest(ctx, word);
}

/** Resolve as a handler set over the AST walk ([ast-walk.ts](./ast-walk.ts)). */
function resolveVisitor(ctx: Ctx): Visitor {
  return {
    word(word, slot) {
      if (slot === "boundJoinClose" || slot === "joinModifier" || slot === "factor") return;
      if (slot === "orodo") ctx.standIn = word;
      if (slot === "linker") {
        if (isConsequenceLinker(word)) {
          ctx.pendingConsequence = true;
          ctx.consequenceHere = true;
        }
        considerLinker(ctx, word);
        return;
      }
      if (ctx.currentTurn && !ctx.currentTurn.head) ctx.currentTurn.head = word;
      considerWord(ctx, word, slot);
    },
    join(join, site) {
      bindLandmark(ctx, join);
      if (!ctx.question || !isJoinGap(join)) return;
      // In a `dorl` (question-like) dependent the blank is the dependent's own; in `darl` it is the outer ask's (questions.md#embedded-whether).
      if (ctx.standIn?.raw[1] === "o") ctx.innerGaps.push(join);
      else ctx.gaps.push(join);
    },
    enter(node) {
      if (node.kind === "npPackage") ctx.packageHead = node.pkg.head;
      if (node.kind === "np") {
        const heads: LexWord[] = [];
        for (const part of node.coord.parts) {
          for (const item of part.items) if (item.kind === "package") heads.push(item.package.head);
          if (part.tag && part.join) ctx.groupTags.set(part.tag, { join: part.join, words: [...heads] });
        }
      }
      if (node.kind === "body") enterMove(ctx, [greetingName(node.body) ?? []].flat());
      if (node.kind === "clause") noteHookLandmarks(ctx, node.clause.units);
      if (node.kind === "island") noteHookLandmarks(ctx, node.island.units);
      if (node.kind === "vp") for (const units of vpUnitLists(node.coord)) noteHookLandmarks(ctx, units);
      if (node.kind === "clause") {
        const anchor = anchorOf(node.clause);
        if (anchor && ctx.pendingConsequence) {
          const prev = ctx.anchors.at(-1);
          if (prev) prev.fillers.x = { words: [anchor.predicate] };
          ctx.pendingConsequence = false;
        }
        ctx.clauses.push({ anchor, before: ctx.anchors.length });
        if (anchor) ctx.anchors.push(anchor);
      }
      if (node.kind === "utterance") {
        const { left } = node.utterance;
        ctx.consequenceHere = false;
        ctx.currentTurn = {
          head: actWord(left) ?? left.interjections[0] ?? left.vocatives[0] ?? left.polars[0],
        };
        enterLeft(ctx, node.utterance);
        ctx.question = isQuestionForce(node.utterance.left.leadForce) || isQuestionForce(node.utterance.left.force);
        ctx.gaps = [];
        ctx.innerGaps = [];
        ctx.standIn = undefined;
      }
    },
    exit(node) {
      if (node.kind === "clause") ctx.clauses.pop();
      if (node.kind === "shared" && node.join) {
        ctx.shared.push({ join: node.join, role: classifySharedRole(node.join, node.item), shared: node.item });
      }
      if (node.kind === "utterance") {
        const { left } = node.utterance;
        let kind: AskKind = "none";
        // A question word only as the inner of a stack sounds like a question but asks nothing (speech-moves.md#stacked-acts).
        if (ctx.question) kind = !isQuestionForce(actWord(left)) ? "rhetorical" : ctx.gaps.length > 0 ? "fillAsk" : "yesNo";
        ctx.asks.push({ utteranceIndex: node.index, kind, gaps: ctx.gaps, ...(ctx.innerGaps.length > 0 ? { inner: ctx.innerGaps } : {}) });
        if (ctx.currentTurn?.head) ctx.turns.push({ head: ctx.currentTurn.head });
        ctx.currentTurn = undefined;
      }
    },
  };
}

function buildResolve(result: ParseResult): ResolveInfo {
  const ctx: Ctx = {
    antecedents: [],
    landmarks: [],
    hookLandmarks: new Set(),
    named: new Set(),
    tags: new Map(),
    groupTags: new Map(),
    greeted: new Set(),
    closing: false,
    goodbye: false,
    anaphors: [],
    anchors: [],
    clauses: [],
    turns: [],
    pendingConsequence: false,
    consequenceHere: false,
    referents: new Map(),
    asks: [],
    shared: [],
    gaps: [],
    innerGaps: [],
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
