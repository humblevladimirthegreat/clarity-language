/**
 * The reader (docs/meta/interpreter.md#reader-rules): a parse → one reading per clause.
 *
 * It copies the tree and the resolve stage's records. It never re-derives a reading, binds a pronoun, defaults a
 * missing field, or orders two frames itself: the order of whole-clause frames is copied from
 * `ParseResult.resolve.scope` (src/parse/scope.ts). A construction with no row in {@link CLASSES} becomes an `unknown`
 * frame and an `unread` entry.
 */
import { CLOSED } from "../closed-roots.js";
import { overlayKey, type ClassifyTables } from "../parse/classify.js";
import { overlayConstructionId } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import { newMemberHead, titledPhrases, type ClauseScope, type FrameReach, type ScopeFrame } from "../parse/scope.js";
import { isNoKindFence } from "../parse/ast-walk.js";
import type {
  AnaphorBind,
  BodyCarry,
  CarryKind,
  Clause,
  CoordShared,
  GCoord,
  GPackage,
  Hosted,
  HUnit,
  LeftEdge,
  LexWord,
  NpCoord,
  NpPackage,
  ParseResult,
  SharedRecord,
  TurnWordMods,
  Unit,
  VpCoord,
} from "../parse/types.js";
import { classOf, overlayClassKey } from "./classes.js";
import { placeTones, toneFrame } from "./tones.js";
import type { Detail, Frame, Link, LinkKind, Reading, ReadingId, StanceList, Term, Unread } from "./types.js";

export type ReadOptions = {
  /** Needed to read a quote's words (they are parsed as their own text). Without them a quote is an `unread` entry. */
  tables?: ClassifyTables;
  /** The text id that starts every {@link ReadingId}. */
  text?: string;
};

// ── Keys ────────────────────────────────────────────────────────────────────

/** The classification-table key one word reads by (interpreter.md#classification-table). */
export function wordKey(word: LexWord, closes?: number[]): string {
  const family = word.family;
  const pos = word.pos ?? "";
  switch (family.kind) {
    case "say":
      return "wordFamily:say";
    case "joinMarker":
      if (word.reading !== "join") break;
      if (pos === "th" && family.series === "u" && closes?.length === 0) return "joinSeries:u:standalone";
      return `joinSeries:${family.series}`;
    case "tag":
      return "wordFamily:tag";
    case "foreign":
      return "wordFamily:foreign";
    case "writingSpan":
      return "unit:writingSpan";
    case "hookCompound":
      return "wordFamily:hookCompound";
    case "hook":
      return "unit:hook";
    case "x":
      if (family.xFamily === "holder" || family.xFamily === "ability" || family.xFamily === "pointer") return `xFamily:${family.xFamily}`;
      break;
  }
  switch (word.reading) {
    case "overlay":
      return word.overlay ? overlayClassKey(word.overlay) : "lexReading:overlay";
    case "sake":
      return pos === "g" ? "lexReading:sake:g" : "lexReading:sake";
    case "restrictor":
      return pos === "w" ? "lexReading:restrictor:w" : "lexReading:restrictor";
    case "number":
      return pos === "th" ? "lexReading:number:th" : "lexReading:number";
    case "ordinary":
      if (pos === "th" && family.kind === "content") return "slot:th";
      if (pos === "h") return "unit:h";
      if (pos === "w") return "slot:w";
      if (pos === "g") return word.gl ? "slot:gl" : "slot:adj";
      return "lexReading:ordinary";
    default:
      return `lexReading:${word.reading}`;
  }
}

/** The construction id a word carries for one key, or the key when no id names it. */
export function constructionFor(key: string, word?: LexWord): string {
  const [type, name] = key.split(":");
  if (!word) return key;
  if (type === "overlay" && word.overlay) return overlayConstructionId(word.overlay);
  switch (type) {
    case "lexReading":
      return `word.reading.${name}`;
    case "wordFamily":
      return `word.family.${name}`;
    case "xFamily":
      return `word.xFamily.${name}`;
    case "joinSeries":
      return `join.${name}`;
    case "reading":
      return `reading.${name}`;
    case "unit":
      return name === "writingSpan" ? "word.family.writingSpan" : key;
    case "edge":
      return { force: "token.force", interjection: "token.yInterjection", vocative: "token.yVocative", polar: "token.polar" }[name!] ?? key;
    default:
      return key;
  }
}

const SAY_VALUES = (word: LexWord): Record<string, string> => {
  const family = word.family;
  if (family.kind !== "say") return {};
  return { reach: family.reach, part: family.part, answer: family.answer, ...(word.ending ? { ending: word.ending } : {}) };
};

function wordValues(word: LexWord): Record<string, string> {
  const family = word.family;
  const values: Record<string, string> = {};
  if (family.kind === "say") Object.assign(values, SAY_VALUES(word));
  if (family.kind === "joinMarker") {
    values.series = family.series;
    // A hooked join's or restrictor's hook: which relation to the landmark bounds it (hooked-joins.md#hooked-joins).
    if (family.hook) values.hook = family.hook;
  }
  // An ability word's vowel: can, or which kind of can't (can-and-cant.md#ability); a sake's or scope's vowel likewise.
  if (family.kind === "x" && family.stanceVowel) values.stanceVowel = family.stanceVowel;
  if (word.overlay) values.gloss = word.overlay.gloss;
  if (word.ending && family.kind !== "say") values.ending = word.ending;
  return values;
}

// ── Context ─────────────────────────────────────────────────────────────────

type Ctx = {
  result: ParseResult;
  options: ReadOptions;
  text: string;
  scopes: Map<Clause, ClauseScope>;
  /** The scope record of each turn with no body, by utterance (a bare question, a call). */
  bodiless: Map<number, ClauseScope>;
  anaphors: Map<LexWord, AnaphorBind>;
  /**
   * Each term read so far, by the word it was built from (a thing, number, pronoun, ...): a later pronoun that resumes
   * that word points at it (reader rule 6). A list is found by its join word in `lists`.
   */
  terms: Map<LexWord, Term>;
  blanks: Set<LexWord>;
  /** Phrases inside a title (proper-names.md#titled-phrases): a name's wording, no new member. */
  titled: Set<NpCoord>;
  shared: Map<LexWord, SharedRecord[]>;
  /** The resolve stage's record for each shared word, keyed by the tree's shared item. */
  sharedItems: Map<CoordShared, SharedRecord>;
  /** First reading id of each sentence, in text order: what a linker, grounds or answer points to. */
  sentences: { utterance: number; body: number; id: ReadingId }[];
  /** A dependent's reading, made once where its stand-in names it. */
  dependents: Map<Clause, Reading>;
  /** Each list term by the join words of its parts: where a *respectively* link finds its partner list. */
  lists: Map<LexWord, Term>;
  /** Each *respectively* link and its `/w/` word, filled once every list is read. */
  pairings: { link: Link; marker: LexWord }[];
};

type Here = {
  ctx: Ctx;
  reading: Reading;
  utterance: number;
  body: number;
  scoped: boolean;
  /** A hook detail waiting for the phrase right after it: its landmark, or the phrase it joins to (in-clause-hooks.md#in-clause). */
  pendingHook?: Detail;
};

function frameOf(key: string, word: LexWord | undefined, here: Here | undefined): Frame {
  const row = classOf(key);
  if (!row || !row.cls.startsWith("frame:")) {
    if (here) here.reading.unread.push({ construction: constructionFor(key, word), key, ...(word ? { word } : {}), reason: "noRow" });
    return { family: "unknown", construction: constructionFor(key, word), key, anchor: "", words: word ? [word] : [], values: {} };
  }
  const family = row.cls.slice("frame:".length) as Frame["family"];
  return { family, construction: constructionFor(key, word), key, anchor: row.anchor, words: word ? [word] : [], values: word ? wordValues(word) : {} };
}

/**
 * A holder seam's host stance: the channel, MAY or NOTIONAL its left root names (holder.md#naming-a-holder). The seam word has
 * no overlay of its own, so the host row's gloss is the stance word's own field, as a plain `/th/` overlay carries it.
 */
function holderHostValues(word: LexWord, tables: ClassifyTables | undefined): Record<string, string> {
  const family = word.family;
  if (family.kind !== "x" || !tables || !family.leftRoots[0]) return {};
  const row = tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade ?? ""}`));
  return row ? { gloss: row.gloss } : {};
}

function fromScope(frame: ScopeFrame, tables: ClassifyTables | undefined): Frame {
  // A tone mark has no word of its own (tone-marks.md#showing-your-tone).
  if (frame.tone) return toneFrame(frame.tone);
  const out = frameOf(frame.key, frame.word, undefined);
  if (frame.holderHost) out.values = { ...holderHostValues(frame.word, tables), ...out.values };
  return {
    ...out,
    family: frame.family,
    ...(frame.member ? { member: frame.member } : {}),
    ...(frame.holderHost ? { holderHost: true as const } : {}),
    // A restrictor's occasion list; each word's detail joins it as the reader meets the word (readH).
    ...(frame.occasions ? { occasions: [] } : {}),
    // A call names the addressee (speech-moves.md#vocative).
    ...(frame.key === "edge:vocative" ? { party: thing(frame.word) } : {}),
  };
}

/** Copy a scope record's frames, orders and unsettled pairs into a reading (reader rule 3). */
function copyScope(reading: Reading, scope: ClauseScope | undefined, tables: ClassifyTables | undefined): void {
  if (!scope) return;
  const byScope = new Map<ScopeFrame, Frame>();
  for (const frame of scope.frames) {
    const copy = fromScope(frame, tables);
    byScope.set(frame, copy);
    reading.frames.push(copy);
  }
  for (const o of scope.order) reading.order.push({ over: byScope.get(o.over)!, under: byScope.get(o.under)!, kind: o.kind, anchors: o.anchors });
  for (const u of scope.unordered) reading.unordered.push([byScope.get(u.frames[0])!, byScope.get(u.frames[1])!]);
}

/** Frames whose word heads the role phrase they reach over: a new member (joins.md#everything-ua) and a greeting's name. */
const PHRASE_FRAMES = new Set(["slot:newMember", "reading:greeting"]);

/** Such a frame keeps the head word and hosts the role's term, so the noun has one place (rule 5). */
function hostOnHead(term: Term, head: LexWord | undefined, here: Here): void {
  const frame = here.reading.frames.find((f) => PHRASE_FRAMES.has(f.key) && !f.hosted && f.words[0] === head);
  if (frame) frame.hosted = term;
}

/**
 * A role phrase or landmark that brings in a new member (joins.md#everything-ua): its frame hosts the phrase's term. A
 * scoped clause has the frame from its scope record; a reading with none (an island, a verb-list item) places it here,
 * as it does a stance word.
 */
function memberFrame(coord: NpCoord, term: Term, here: Here): void {
  const head = here.ctx.titled.has(coord) ? undefined : newMemberHead(coord, here.ctx.blanks);
  if (!head) return;
  if (!here.scoped) placeFrame("slot:newMember", head, "clause", here);
  hostOnHead(term, head, here);
}

/**
 * A hook's landmark after a frame word on the hook (`wal al bamahal`, *never in a house*): the resolve stage gives it
 * no whole-clause frame (`framedLandmarks` in the scope stage), and its binder sits under that frame, earlier over later
 * (clause.md#which-covers-which, joins.md#everything-ua).
 */
function framedMember(coord: NpCoord, term: Term, under: Frame, here: Here): void {
  const head = here.ctx.titled.has(coord) ? undefined : newMemberHead(coord, here.ctx.blanks);
  if (!head) return;
  nestFrame("slot:newMember", head, under, here).hosted = term;
}

function detailOf(key: string, word: LexWord, kind: string): Detail {
  const anchor = classOf(key)?.anchor ?? "";
  return { kind, construction: constructionFor(key, word), key, anchor, words: [word], values: wordValues(word) };
}

function link(kind: LinkKind, key: string, words: LexWord[], extra: Partial<Link> = {}): Link {
  return { kind, key, anchor: classOf(key)?.anchor ?? "", words, ...extra };
}

function unread(here: Here, reason: Unread["reason"], key: string, word?: LexWord): void {
  here.reading.unread.push({ construction: constructionFor(key, word), key, ...(word ? { word } : {}), reason });
}

/** The sentence after this one, if any (a `blarl` / `barl` grounds, sentence-linkers.md#past-a-period). */
function nextSentence(here: Here): ReadingId | undefined {
  const at = here.ctx.sentences.findIndex((s) => s.utterance === here.utterance && s.body === here.body);
  return at >= 0 ? here.ctx.sentences[at + 1]?.id : undefined;
}

function previousSentence(here: Here): ReadingId | undefined {
  const at = here.ctx.sentences.findIndex((s) => s.utterance === here.utterance && s.body === here.body);
  return at > 0 ? here.ctx.sentences[at - 1]?.id : undefined;
}

// ── Terms ───────────────────────────────────────────────────────────────────

function rootOf(word: LexWord): string {
  const family = word.family;
  if (family.kind === "content") return family.roots.join("");
  if (family.kind === "x") return [...family.leftRoots, ...(family.rightRoots ?? [])].join("x");
  return word.raw;
}

function thing(word: LexWord): Term {
  return { kind: "thing", head: word, root: rootOf(word), named: word.ending === "n" || word.ending === "ln", details: [] };
}

/**
 * A pronoun term. Its antecedent is the word the resolver's bind names: the term already read from that word, whatever
 * its kind (a pronoun holds its own antecedent, so a chain goes on; a join word names its list), else a term of that
 * word. Never bound here (reader rule 6).
 */
function pronoun(word: LexWord, here: Here): Term {
  const bind = here.ctx.anaphors.get(word);
  if (bind) here.reading.links.push(link("anaphor", `anaphor:${bind.kind}`, [word], { bind }));
  const at = bind?.antecedent;
  const antecedent = at ? (here.ctx.terms.get(at) ?? here.ctx.lists.get(at) ?? thing(at)) : undefined;
  const term: Term = { kind: "pronoun", word, ...(bind ? { bind } : {}), ...(antecedent ? { antecedent } : {}) };
  here.ctx.terms.set(word, term);
  return term;
}

/** A span's Ageben words, as the morph gloss strips them (spans.md#close). */
function spanText(payload: string): string {
  const trimmed = payload.trim();
  const close = trimmed.match(/(?:^|\s|(?<=[a-z]))(#?\|?)$/)?.[1] ?? "";
  return close ? trimmed.slice(0, -close.length).trim() : trimmed;
}

function quoteReadings(word: LexWord, here: Here): Reading[] {
  const family = word.family;
  if (family.kind !== "writingSpan") return [];
  const tables = here.ctx.options.tables;
  const text = spanText(family.payload);
  if (!tables || !text) {
    if (text) unread(here, "quoteParse", "unit:writingSpan", word);
    return [];
  }
  try {
    const sub = parseWithTables(text, tables);
    return readParse(sub, { ...here.ctx.options, text: `${here.reading.id}/q${word.at ?? 0}` });
  } catch {
    unread(here, "quoteParse", "unit:writingSpan", word);
    return [];
  }
}

/** A span: `<…>` a literal, `[…]` a cite (a quote frame with its own readings), `(…)` an aside (a nested comment). */
function spanTerm(word: LexWord, here: Here): Term {
  const family = word.family;
  if (family.kind !== "writingSpan") return thing(word);
  // An opaque span, an empty one, or a named span (a title, spans-as-words.md) is a literal term.
  if (family.bracket === "<" || !family.payload.trim() || family.marks.includes("@") || family.marks.includes("^@")) {
    return { kind: "literal", word, payload: family.payload };
  }
  const readings = quoteReadings(word, here);
  // The frame (or the aside's detail) keeps the word (rule 5) and hosts the quote term, so the term nests in it: one
  // place for the word wherever else the term sits (a role).
  const term: Term = { kind: "quote", word, readings };
  if (family.bracket === "(") {
    here.reading.claim.details.push({ ...detailOf("unit:writingSpan", word, "aside"), content: readings, hosted: term });
  } else {
    here.reading.frames.push({ ...frameOf("unit:writingSpan", word, here), content: readings, hosted: term });
  }
  return term;
}

/** The term a role phrase's head word builds, kept by its word so a later pronoun that resumes it points at it. */
function headTerm(word: LexWord, here: Here, clause: Clause): Term {
  const term = buildHeadTerm(word, here, clause);
  if (!here.ctx.terms.has(word)) here.ctx.terms.set(word, term);
  return term;
}

function buildHeadTerm(word: LexWord, here: Here, clause: Clause): Term {
  const family = word.family;
  const ctx = here.ctx;
  if (ctx.blanks.has(word)) return { kind: "blank", word };
  // A number resume (`drager`, number-markers.md#number-endings) is a pronoun on the number it resumes.
  if (family.kind === "number" && !ctx.anaphors.has(word)) return { kind: "number", word, stem: family.stem };
  if (family.kind === "foreign") return { kind: "literal", word, payload: family.payload };
  if (family.kind === "writingSpan") return spanTerm(word, here);
  if (family.kind === "content" && word.ending === "n" && family.roots.length === 1) {
    if (family.roots[0] === CLOSED.microphone) return { kind: "speaker", word };
    if (family.roots[0] === CLOSED.headphones) return { kind: "listener", word };
  }
  switch (word.reading) {
    case "standIn": {
      const dependent = clause.dependent ? readDependent(clause, here) : undefined;
      here.reading.links.push(link("standIn", "lexReading:standIn", [word], dependent ? { to: dependent.id } : {}));
      return dependent ? { kind: "clause", reading: dependent } : pronoun(word, here);
    }
    case "standInNamed":
      here.reading.links.push(link("standIn", "lexReading:standInNamed", [word]));
      return pronoun(word, here);
    case "standInBack":
      here.reading.links.push(link("standInBack", "lexReading:standInBack", [word], prevTo(here)));
      return pronoun(word, here);
    case "greeting":
      here.reading.frames.push(frameOf("lexReading:greeting", word, here));
      return thing(word);
    case "unknown":
      here.reading.frames.push(frameOf("lexReading:unknown", word, here));
      unread(here, "unknownWord", "lexReading:unknown", word);
      return thing(word);
  }
  if (ctx.anaphors.has(word) || family.kind === "tag" || (family.kind === "x" && family.xFamily === "pointer") || word.ending === "r") {
    return pronoun(word, here);
  }
  return thing(word);
}

function prevTo(here: Here): Partial<Link> {
  const to = previousSentence(here);
  return to ? { to } : {};
}

function addDetails(term: Term, details: Detail[]): void {
  if (details.length === 0 || term.kind === "clause" || term.kind === "list" || term.kind === "quote") return;
  term.details = [...(term.details ?? []), ...details];
}

/** A `/w/` word: a degree detail, or a frame with adjective reach (rule 2). */
function modifier(word: LexWord, here: Here, into: Detail): void {
  const key = wordKey(word);
  const row = classOf(key);
  if (row?.cls.startsWith("frame:")) {
    into.frames = [...(into.frames ?? []), frameOf(key, word, here)];
    return;
  }
  if (!row) unread(here, "noRow", key, word);
  into.details = [...(into.details ?? []), detailOf(key, word, row?.cls.startsWith("detail:") ? row.cls.slice(7) : "degree")];
}

function hostedTerm(hosted: Hosted | undefined, here: Here, clause: Clause, frame?: Frame): Term | undefined {
  if (!hosted) return undefined;
  if (hosted.grounds && frame) {
    const to = nextSentence(here);
    here.reading.links.push(link("grounds", "slot:grounds", [hosted.grounds], { frame, ...(to ? { to } : {}) }));
  }
  const bound = hosted.bound;
  if (frame && bound.ending === "rl" && !clause.dependent) {
    // `blarl`: the next sentence is the frame's content, through the grounds link (rule 2).
    const to = nextSentence(here);
    here.reading.links.push(link("grounds", "slot:grounds", [bound], { frame, ...(to ? { to } : {}) }));
  }
  const term: Term = hosted.boundJoin
    ? {
        kind: "list",
        join: hosted.boundJoin.join,
        members: [bound, ...hosted.boundJoin.members].map((w) => headTerm(w, here, clause)),
        shared: [],
        values: wordValues(hosted.boundJoin.join),
        parts: [],
      }
    : headTerm(bound, here, clause);
  const details: Detail[] = [];
  if (hosted.amount) details.push(detailOf("slot:hosted", hosted.amount, "amount"));
  for (const adj of hosted.adjs ?? []) details.push(adjDetail(adj, here, clause));
  addDetails(term, details);
  return term;
}

/** A `/ɡ/` on a noun or a clause-level adjective: a detail, or a frame nested under the adjective (rule 2). */
function adjDetail(pkg: GPackage, here: Here, clause: Clause): Detail {
  const word = pkg.word;
  const key = wordKey(word);
  const row = classOf(key);
  if (!row) unread(here, "noRow", key, word);
  const detail = detailOf(key, word, row?.cls.startsWith("detail:") ? row.cls.slice(7) : "adjective");
  if (row?.cls.startsWith("frame:")) detail.frames = [frameOf(key, word, here)];
  for (const w of pkg.modifiers) modifier(w, here, detail);
  if (pkg.asOf) {
    // The as-of pair: the `/w/` word and its bound, the time the adjective holds as of (as-of.md#as-of).
    const asOf = detailOf("slot:asOf", pkg.asOf.word, "time");
    if (pkg.asOf.bound) asOf.hosted = headTerm(pkg.asOf.bound, here, clause);
    detail.details = [...(detail.details ?? []), asOf];
  }
  // A digitless `-r` number under a question is the blank *how many? / how much?* (digitless-exponents.md#how-many): the detail
  // keeps the word and hosts the blank, so a blank on a count or a measure's amount binds like a role's.
  if (here.ctx.blanks.has(word) && word.family.kind === "number") detail.hosted = { kind: "blank", word };
  const hosted = hostedTerm(pkg.hosted, here, clause, detail.frames?.[0]);
  if (hosted) {
    if (row?.cls === "frame:sake" && detail.frames?.[0]) detail.frames[0].party = hosted;
    else detail.hosted = hosted;
  }
  return detail;
}

function itemTerm(pkg: NpPackage, here: Here, clause: Clause): Term {
  // A mention marker before a span: the span is a literal term (spans-as-words.md#mention).
  const mention = pkg.glAdj?.word.reading === "mention" && pkg.head.family.kind === "writingSpan";
  const term = mention && pkg.head.family.kind === "writingSpan" ? ({ kind: "literal", word: pkg.head, payload: pkg.head.family.payload } as Term) : headTerm(pkg.head, here, clause);
  // A joined adjective list (joins.md#right-close) is read as its list, joins and fences included; `adjs` repeats its
  // adjectives flat, so only the ones outside it are read one by one.
  const inList = pkg.adjCoord ? gPackagesOf(pkg.adjCoord) : new Set<GPackage>();
  // The parser's `predicateAdj`: the `/ɡ/` that says what a verbless clause's noun is (predication.md#classification-property).
  const predicate = clause.predicateAdj && pkg.adjs.includes(clause.predicateAdj) ? clause.predicateAdj : undefined;
  const own = pkg.adjs.filter((adj) => !inList.has(adj) && adj !== predicate);
  const details = [...(pkg.glAdj ? [pkg.glAdj] : []), ...own].map((adj) => adjDetail(adj, here, clause));
  if (predicate) {
    const claim = thing(predicate.word);
    addDetails(claim, [adjDetail(predicate, here, clause)]);
    here.reading.claim.predicate.push(claim);
  }
  if (pkg.adjCoord) {
    const anchor = classOf("unit:gCoord")?.anchor ?? "";
    details.push({ kind: "adjective", construction: "unit:gCoord", key: "unit:gCoord", anchor, words: [], values: {}, hosted: gTerm(pkg.adjCoord, here, clause) });
  }
  if (pkg.tag) here.reading.links.push(link("tag", "slot:tag", [pkg.tag]));
  addDetails(term, details);
  return term;
}

/** The adjectives a `/ɡ/` list holds, its islands' lists included. */
function gPackagesOf(coord: GCoord, out = new Set<GPackage>()): Set<GPackage> {
  const units = (list: Unit[]): void => {
    for (const unit of list) {
      if (unit.kind === "gCoord") gPackagesOf(unit.coord, out);
      else if (unit.kind === "predicate") out.add(unit.adj);
      else if (unit.kind === "island") units(unit.island.units);
    }
  };
  for (const part of coord.parts) {
    for (const item of part.items) {
      if (item.kind === "adj") out.add(item.adj);
      else units(item.island.units);
    }
  }
  return out;
}

/** An `/h/` word read as a detail of what holds it (a shared word, a bar): a frame-class word nests in `frames` (rule 2). */
function hDetail(unit: HUnit, here: Here, clause: Clause): Detail {
  const word = unit.word;
  const key = wordKey(word, unit.closes);
  const row = classOf(key);
  if (!row) unread(here, "noRow", key, word);
  const kind = row?.cls.startsWith("detail:") ? row.cls.slice(7) : row?.cls.startsWith("frame:") ? "frame" : "adverb";
  const detail = detailOf(key, word, kind);
  const frame = row?.cls.startsWith("frame:") ? frameOf(key, word, here) : undefined;
  if (frame) detail.frames = [frame];
  for (const w of unit.modifiers) modifier(w, here, detail);
  const hosted = hostedTerm(unit.hosted, here, clause, frame);
  if (hosted) {
    if (frame && (frame.family === "sake" || frame.family === "holder")) frame.party = hosted;
    else if (frame) frame.hosted = hosted;
    else detail.hosted = hosted;
  }
  return detail;
}

/** The shared words of one list part (list-structure.md#shared-after-the-join), each read by its class. */
function sharedDetails(shared: CoordShared[], here: Here, clause: Clause, factor?: LexWord, noKind = false): Detail[] {
  const out = shared.map((item) => {
    const detail = item.word.pos === "g" ? adjDetail(item as GPackage, here, clause) : hDetail(item as HUnit, here, clause);
    const record = here.ctx.sharedItems.get(item);
    if (record) detail.values.role = noKind ? "kind" : record.role;
    return detail;
  });
  if (factor) {
    // *Twice as … as*: the factor counts the shared scale (comparatives.md, `npJoinClose.factor`).
    const amount = detailOf(wordKey(factor), factor, "amount");
    const scale = out[out.length - 1];
    if (scale) scale.details = [...(scale.details ?? []), amount];
    else out.push(amount);
  }
  return out;
}

/** A whole-clause frame on a list's own join word (a binder, joins.md#everything-ua) keeps the word and hosts the list (rule 5). */
function hostOnJoin(term: Term, here: Here): void {
  if (term.kind !== "list") return;
  const joins = new Set([term.join, ...term.parts.map((p) => p.join)].filter((w): w is LexWord => !!w));
  for (const frame of here.reading.frames) {
    if (!frame.hosted && frame.words[0] && joins.has(frame.words[0])) frame.hosted = term;
  }
}

function sharedOf(joins: (LexWord | undefined)[], here: Here, noKind: ReadonlySet<LexWord> = new Set()): SharedRecord[] {
  const out: SharedRecord[] = [];
  // After a *no K* fence the shared word is the kind, as after `zual` (universals-domains.md#universals-domains-generics).
  for (const join of joins) if (join) out.push(...(here.ctx.shared.get(join) ?? []).map((r) => (noKind.has(join) ? { ...r, role: "kind" as const } : r)));
  for (const record of out) here.reading.links.push(link("shared", `shared:${record.role}`, [record.join], { shared: record }));
  return out;
}

/** A join's list-reach frame (`u`, `ue`): it denies only its items, so it nests in its list term (rule 2). */
function listFrames(joins: (LexWord | undefined)[], here: Here): Frame[] {
  const out: Frame[] = [];
  for (const join of joins) {
    if (!join) continue;
    const key = wordKey(join);
    if (classOf(key)?.reach === "list") out.push(frameOf(key, join, here));
  }
  return out;
}

/**
 * *No K* (`zul` + kind, universals-domains.md#universals-domains-generics): the fence is a binder, as `zual`'s is, and its
 * denial rides in it as `inner`, not on the list term. A scoped clause has the binder from its scope record; a reading with
 * none (an island, a verb-list item) places it here. `hostOnJoin` hosts the list (interpreter.md `joinSeries:u:kind`).
 */
function noKindBinder(join: LexWord, here: Here): void {
  const scoped = here.reading.frames.find((f) => f.key === "joinSeries:u:kind" && f.words[0] === join);
  const frame = scoped ?? (here.scoped ? undefined : placeFrame("joinSeries:u:kind", join, "clause", here));
  if (frame) frame.inner = [frameOf("joinSeries:u", join, here)];
}

type Part = { members: Term[]; join?: LexWord };

/**
 * A hooked join's bound (hooked-joins.md#hooked-joins): the hook says which members count, the ones in that relation
 * to the landmark, a `bl-` word after the join or, with `r`, the landmark the resolve stage binds.
 */
function boundOf(join: LexWord | undefined, landmark: LexWord | undefined, here: Here, clause: Clause): Detail | undefined {
  if (!join || join.family.kind !== "joinMarker" || !join.family.hook) return undefined;
  const hosted = landmark ? headTerm(landmark, here, clause) : here.ctx.anaphors.has(join) ? pronoun(join, here) : undefined;
  return { ...detailOf("word:hookedJoin", join, "bound"), construction: "word.hookedJoin", ...(landmark ? { words: [join, landmark] } : {}), ...(hosted ? { hosted } : {}) };
}

/** `/w/` words right before a join word (`joinModifiers`): *respectively* is a pairing link (list-structure.md#respectively). */
function joinModifiers(mods: LexWord[] | undefined, join: LexWord | undefined, here: Here): void {
  for (const w of mods ?? []) {
    const key = wordKey(w);
    const row = classOf(key);
    if (row?.cls === "link" && w.overlay?.kind === "pairing") {
      const pairing = link("pairing", key, join ? [w, join] : [w]);
      here.reading.links.push(pairing);
      here.ctx.pairings.push({ link: pairing, marker: w });
    } else unread(here, row ? "unplaced" : "noRow", key, w);
  }
}

function listTerm(parts: Part[], here: Here, bound?: Detail, shared: Detail[] = [], noKind: ReadonlySet<LexWord> = new Set()): Term {
  if (parts.length === 1 && parts[0]!.members.length === 1 && !parts[0]!.join && shared.length === 0) return parts[0]!.members[0]!;
  const joins = parts.map((p) => p.join);
  const join = [...joins].reverse().find((j) => j !== undefined);
  const members = parts.flatMap((p) => p.members);
  // A fill-ask join with no items is the blank itself (questions.md#fill-ask; interpreter.md `ask:fillAsk`).
  if (join && members.length === 0 && here.ctx.blanks.has(join)) return { kind: "blank", word: join, details: [...(bound ? [bound] : []), ...shared] };
  const frames = listFrames(joins.filter((j) => !j || !noKind.has(j)), here);
  for (const j of noKind) noKindBinder(j, here);
  const term: Term = {
    kind: "list",
    ...(join ? { join } : {}),
    members,
    shared: sharedOf(joins, here, noKind),
    values: join ? wordValues(join) : {},
    parts,
    ...(frames.length ? { frames } : {}),
    ...(bound ? { bound } : {}),
    ...(shared.length ? { sharedDetails: shared } : {}),
  };
  hostOnJoin(term, here);
  for (const j of joins) if (j) here.ctx.lists.set(j, term);
  return term;
}

/** A stance word as a rank fence's comparee (comparatives.md § bars): a bar frame, with its hosted `/b/` and modifiers. */
function barTerm(unit: HUnit, here: Here, clause: Clause): Term {
  const bar = thing(unit.word) as Extract<Term, { kind: "thing" }>;
  const frame = frameOf("slot:bar", unit.word, here);
  bar.frames = [frame];
  const box = detailOf("slot:bar", unit.word, "frame");
  for (const w of unit.modifiers) modifier(w, here, box);
  if (box.frames?.length) frame.inner = box.frames;
  if (box.details?.length) bar.details.push(...box.details);
  const hosted = hostedTerm(unit.hosted, here, clause, frame);
  if (hosted) frame.hosted = hosted;
  return bar;
}

function npTerm(coord: NpCoord, here: Here, clause: Clause): Term {
  let bound: Detail | undefined;
  const shared: Detail[] = [];
  const noKind = new Set(coord.parts.filter(isNoKindFence).map((part) => part.join!));
  const parts = coord.parts.map((part) => {
    const members = part.items.map((item): Term => {
      if (item.kind === "package") return itemTerm(item.package, here, clause);
      if (item.kind === "island") return { kind: "clause", reading: readIsland(item.island.units, here) };
      return barTerm(item.bar, here, clause);
    });
    if (part.tag) here.reading.links.push(link("tag", "slot:tag", [part.tag]));
    joinModifiers(part.joinModifiers, part.join, here);
    bound = boundOf(part.join, part.landmark, here, clause) ?? bound;
    shared.push(...sharedDetails(part.shared, here, clause, part.factor, !!part.join && noKind.has(part.join)));
    return { members, ...(part.join ? { join: part.join } : {}) };
  });
  return listTerm(parts, here, bound, shared, noKind);
}

function gTerm(coord: GCoord, here: Here, clause: Clause): Term {
  const shared: Detail[] = [];
  const parts = coord.parts.map((part) => {
    joinModifiers(part.joinModifiers, part.join, here);
    shared.push(...sharedDetails(part.shared, here, clause));
    return {
      members: part.items.map((item): Term => {
        if (item.kind === "island") return { kind: "clause", reading: readIsland(item.island.units, here) };
        const term = thing(item.adj.word);
        addDetails(term, [adjDetail(item.adj, here, clause)]);
        return term;
      }),
      ...(part.join ? { join: part.join } : {}),
    };
  });
  return listTerm(parts, here, undefined, shared);
}

function verbTerm(word: LexWord, here: Here): Term {
  const term = thing(word);
  const key = wordKey(word);
  if (term.kind === "thing" && classOf(key)?.cls.startsWith("frame:")) term.frames = [frameOf(key, word, here)];
  return term;
}

function vpTerm(coord: VpCoord, here: Here, clause: Clause): Term {
  const shared: Detail[] = [];
  const parts = coord.parts.map((part) => {
    shared.push(...sharedDetails(part.shared, here, clause));
    for (const unit of part.sharedUnits ?? []) {
      readUnit(unit, here, clause);
      if (unit.kind === "np") here.reading.links.push(link("verbShared", "reading:verbSharedNoun", []));
    }
    // A label-reach verb's hosted `/b/` (label-seams.md#reach-vowels) nests on that verb's term: one place for the verb.
    const labels = new Map<LexWord, Detail>();
    for (const hv of part.hostedVerbs ?? []) {
      const hosted = hostedTerm(hv.hosted, here, clause);
      if (hosted) labels.set(hv.verb, { ...detailOf("slot:hosted", hv.verb, "hosted"), hosted });
    }
    const verbOf = (w: LexWord, at: Here): Term => {
      const term = verbTerm(w, at);
      const label = labels.get(w);
      if (label) addDetails(term, [label]);
      return term;
    };
    joinModifiers(part.joinModifiers, part.join, here);
    // Each item is a verb plus the words before it (verb-and-stance-joins.md#vp-clause-forms): an item with words of
    // its own is a nested reading whose verb is that verb.
    const itemUnits = new Map((part.itemUnits ?? []).map((item) => [item.verb, item.units]));
    const members = part.items.map((w): Term => {
      const units = itemUnits.get(w);
      if (!units) return verbOf(w, here);
      const item = readIsland(units, here, `v${w.at ?? 0}`);
      item.claim.verb = verbOf(w, { ...here, reading: item });
      return { kind: "clause", reading: item };
    });
    return { members, ...(part.join ? { join: part.join } : {}) };
  });
  return listTerm(parts, here, undefined, shared);
}

// ── Units ───────────────────────────────────────────────────────────────────

/** A frame word met in the clause: the resolve stage's frame when it gave one, else a frame of its own. */
function placeFrame(key: string, word: LexWord, reach: FrameReach | undefined, here: Here): Frame {
  // The resolve stage may file the word under another key of the same family (`lexReading:ability` for an
  // `xFamily:ability` word): one word, one frame of that family.
  const family = classOf(key)?.cls.slice("frame:".length);
  const existing = here.reading.frames.find((f) => f.words[0] === word && (f.key === key || f.family === "holder" || f.family === family));
  if (existing) return existing;
  const frame = frameOf(key, word, here);
  here.reading.frames.push(frame);
  if (reach === "clause" && here.scoped) unread(here, "unscoped", key, word);
  return frame;
}

const STANCE_JOINS = "verb-and-stance-joins.md#stance-joins";

/** A frame on the reading, or held in one, whose own word is at `at`. */
function frameAt(frames: Frame[] | undefined, at: number): Frame | undefined {
  for (const f of frames ?? []) {
    if (f.words[0]?.at === at) return f;
    const inner = frameAt(f.inner, at);
    if (inner) return inner;
  }
  return undefined;
}

/**
 * A `/th/` join that closes stance words (`thahum blerulal thohem blalazun thul`, `thomam thul`, `thahum thul blarl`):
 * the stance words it closes are one list, whatever the series, and the join's frame, where its row is a frame, reaches
 * that list only, so it nests in the list (rule 2; verb-and-stance-joins.md#stance-joins,
 * verb-and-stance-joins.md#stance-join-reach, verb-and-stance-joins.md#stance-join-before-barl). The members stay
 * frames of the reading; the list points at them.
 */
function readStanceList(unit: HUnit, key: string, here: Here): void {
  const word = unit.word;
  const lists = (here.reading.stanceLists ??= []);
  const members: (Frame | StanceList)[] = [];
  for (const at of unit.closes ?? []) {
    const member = lists.find((l) => l.join.at === at) ?? frameAt(here.reading.frames, at);
    if (member) members.push(member);
    else unread(here, "unplaced", key, word);
  }
  const list: StanceList = { kind: "stanceList", key, construction: constructionFor(key, word), anchor: STANCE_JOINS, join: word, values: wordValues(word), members };
  if (classOf(key)?.cls.startsWith("frame:")) list.inner = [frameOf(key, word, here)];
  if (unit.modifiers.length) {
    const holder: Detail = detailOf(key, word, "frame");
    for (const w of unit.modifiers) modifier(w, here, holder);
    if (holder.frames?.length) list.inner = [...(list.inner ?? []), ...holder.frames];
    if (holder.details?.length) list.details = holder.details;
  }
  lists.push(list);
}

/** A frame held inside another (rule 2): it keeps its word and sits in the outer frame's `inner`. */
function nestFrame(key: string, word: LexWord, outer: Frame, here: Here): Frame {
  const frame = frameOf(key, word, here);
  outer.inner = [...(outer.inner ?? []), frame];
  return frame;
}

function readH(unit: HUnit, here: Here, clause: Clause): void {
  const word = unit.word;
  const key = wordKey(word, unit.closes);
  if (word.pos === "th" && word.family.kind === "joinMarker" && unit.closes?.length) {
    readStanceList(unit, key, here);
    return;
  }
  const restrictor = occasionOf(word, here, clause);
  if (restrictor) {
    // An occasion is a plain `/h/` word on its restrictor's list, whatever its own reading (restrictors.md#only-when-never-hal,
    // residue-and-former.md#former-climate): a detail of the claim the restrictor points at.
    const detail = detailOf("unit:h", word, "adverb");
    for (const w of unit.modifiers) modifier(w, here, detail);
    const hosted = hostedTerm(unit.hosted, here, clause);
    if (hosted) detail.hosted = hosted;
    here.reading.claim.details.push(detail);
    restrictor.occasions!.push(detail);
    return;
  }
  const row = classOf(key);
  if (!row) {
    here.reading.frames.push(frameOf(key, word, here));
    return;
  }
  if (row.cls.startsWith("frame:")) {
    const frame = placeFrame(key, word, row.reach, here);
    for (const w of unit.modifiers) {
      const holder: Detail = detailOf(key, word, "frame");
      modifier(w, here, holder);
      frame.inner = [...(frame.inner ?? []), ...(holder.frames ?? [])];
    }
    const hosted = hostedTerm(unit.hosted, here, clause, frame);
    if (hosted) {
      if (frame.family === "sake" || frame.family === "holder") frame.party = hosted;
      else frame.hosted = hosted;
    }
    if (frame.family === "holder" && !frame.party) {
      const party = holderParty(word, here);
      if (party) frame.party = party;
    }
    return;
  }
  if (row.cls === "link") {
    here.reading.links.push(link(key.startsWith("lexReading:standInBack") ? "standInBack" : "standIn", key, [word]));
    return;
  }
  const kind = row.cls.startsWith("detail:") ? row.cls.slice(7) : word.reading === "number" ? (word.pos === "w" ? "degree" : "adverb") : "adverb";
  const detail = detailOf(key, word, kind);
  for (const w of unit.modifiers) modifier(w, here, detail);
  const hosted = hostedTerm(unit.hosted, here, clause);
  if (hosted) detail.hosted = hosted;
  here.reading.claim.details.push(detail);
}

/**
 * Whose view a holder seam word gives (holder.md#naming-a-holder). The word ends the way a noun for that person would:
 * the topic pronoun is whoever the talk is about now, so it carries the topic it is bound to (topic.md#topic-pronoun);
 * the listener is the listener term, as `zawan` is in a role; `-n` is a name, marked named as the same name in a role
 * is; and `-r` is "someone already named", a pronoun with the resolver's antecedent (a name with none bound).
 */
function holderParty(word: LexWord, here: Here): Term | undefined {
  const family = word.family;
  if (family.kind !== "x" || !family.rightRoots?.length) return undefined;
  const bind = here.ctx.anaphors.get(word)?.kind;
  if (bind === "topic" || (word.ending === "r" && bind === "content")) return pronoun(word, here);
  if (word.ending === "n" && family.rightRoots.length === 1 && family.rightRoots[0] === CLOSED.headphones) return { kind: "listener", word };
  const named = word.ending === "n" || word.ending === "ln" || word.ending === "r";
  return { kind: "thing", head: word, root: family.rightRoots.join(""), named, details: [] };
}

/**
 * A holder seam word's frame where no scope record gave one (after `uom`, contrary-to.md#contrary-to-holder): the holder
 * with its party, and its host stance with the stance word's own gloss (holder.md#naming-a-holder). On a clause the two
 * are sibling frames the word-shape order puts the holder over; here no order is kept, so the host nests in the holder
 * (rule 2), one place for the word.
 */
function holderFrame(word: LexWord, here: Here): Frame {
  const holder = frameOf("xFamily:holder", word, here);
  const party = holderParty(word, here);
  if (party) holder.party = party;
  const family = word.family;
  const tables = here.ctx.options.tables;
  const row = family.kind === "x" && tables ? tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade ?? ""}`)) : undefined;
  if (!row) return holder;
  const host = frameOf(`overlay:${row.kind}:th`, word, here);
  host.values = { ...holderHostValues(word, tables), ...host.values };
  const member = row.kind === "evidential" ? "channel" : row.kind === "may" ? "may" : undefined;
  holder.inner = [{ ...host, ...(member ? { member } : {}), holderHost: true }];
  return holder;
}

/** The restrictor frame whose occasion list, in the resolve stage's scope record, holds `word`. */
function occasionOf(word: LexWord, here: Here, clause: Clause): Frame | undefined {
  const scoped = here.ctx.scopes.get(clause)?.frames.find((f) => f.occasions?.includes(word));
  return scoped ? here.reading.frames.find((f) => f.occasions && f.words[0] === scoped.word) : undefined;
}

function readHook(unit: Extract<Unit, { kind: "hook" }>, here: Here, clause: Clause): void {
  const word = unit.word;
  switch (unit.job) {
    case "discourse":
      here.reading.links.push(link("discourse", "hookJob:discourse", [word], word.ending === "r" ? prevTo(here) : {}));
      return;
    case "resume":
      here.reading.links.push(link("hookResume", "hookJob:resume", [word]));
      return;
    case "zone": {
      const frame = placeFrame("hookJob:zone", word, "clause", here);
      const inner: Frame[] = [];
      if (unit.zone) {
        const zone = unit.zone.word;
        // A holder on the stance names whose plan or view the event goes against (contrary-to.md#contrary-to-holder).
        if (zone.family.kind === "x" && zone.family.xFamily === "holder") inner.push(holderFrame(zone, here));
        else inner.push(frameOf(wordKey(zone, unit.zone.closes), zone, here));
      }
      if (unit.heldIntention) inner.push(frameOf(wordKey(unit.heldIntention), unit.heldIntention, here));
      if (inner.length) frame.inner = inner;
      return;
    }
    case "stray":
      return;
    case undefined:
      unread(here, "unplaced", "unit:hook", word);
      return;
    default: {
      const key = `hookJob:${unit.job}`;
      const row = classOf(key);
      const detail = detailOf(key, word, row?.cls.startsWith("detail:") ? row.cls.slice(7) : "hook");
      if (unit.onLeft) detail.values.onLeft = "true";
      if (unit.fromTo) detail.values.fromTo = "true";
      for (const w of unit.modifiers) modifier(w, here, detail);
      const list = unit.job === "span" ? undefined : sharedHookList(word, here);
      if (list) {
        detail.values.role = "distribute";
        list.sharedDetails = [...(list.sharedDetails ?? []), detail];
      } else here.reading.claim.details.push(detail);
      here.pendingHook = detail;
    }
  }
}

/**
 * The noun list a hook right after its join word belongs to (list-structure.md#shared-after-the-join): "A hook right
 * after the join word is SHARED, like an adjective there: it belongs to every item." The parser keeps it a clause unit,
 * so the reader puts its detail with the list's SHARED details, each item's (`distribute`).
 */
function sharedHookList(word: LexWord, here: Here): Extract<Term, { kind: "list" }> | undefined {
  if (word.at === undefined) return undefined;
  for (const term of Object.values(here.reading.claim.roles)) {
    if (term?.kind === "list" && term.join?.at !== undefined && term.join.at === word.at - 1) return term;
  }
  return undefined;
}

function setRole(level: "z" | "d" | "b", term: Term, here: Here, word?: LexWord): void {
  if (here.reading.claim.roles[level]) {
    unread(here, "unplaced", "unit:np", word);
    return;
  }
  here.reading.claim.roles[level] = term;
}

function firstWord(coord: NpCoord): LexWord | undefined {
  const item = coord.parts[0]?.items[0];
  return item?.kind === "package" ? item.package.head : undefined;
}

/** A counted noun's number: the noun phrase is one noun whose last `/ɡ/` is a number (numbers.md#counts). */
function countedNumber(unit: Unit | undefined): { level: "z" | "d" | "b"; number: GPackage } | undefined {
  if (unit?.kind !== "np" || unit.coord.parts.length !== 1) return undefined;
  const part = unit.coord.parts[0]!;
  const item = part.items[0];
  if (part.join || part.items.length !== 1 || item?.kind !== "package") return undefined;
  const number = item.package.adjs.at(-1);
  return number && isNumberAdj(number) ? { level: unit.coord.level, number } : undefined;
}

function isNumberAdj(pkg: GPackage): boolean {
  return pkg.word.pos === "g" && pkg.word.reading === "number" && pkg.word.family.kind === "number";
}

/**
 * A range on a counted noun (ranges.md#number-ranges, open-ranges.md#rays): `zodozel gragel oel grazal` puts both ends on
 * the noun. The span is a `detail:range` of the noun's number detail, the first end that detail's own word and the second
 * the range's hosted number term, as `zragel oel zrazal` hosts its second end (interpreter.md `hookJob:span`).
 */
function countedRange(units: Unit[], i: number, here: Here, clause: Clause): boolean {
  const hook = units[i];
  const end = units[i + 1];
  const counted = countedNumber(units[i - 1]);
  if (hook?.kind !== "hook" || hook.job !== "span" || end?.kind !== "predicate" || !isNumberAdj(end.adj) || !counted) return false;
  const noun = here.reading.claim.roles[counted.level];
  const number = noun?.kind === "thing" ? noun.details.find((d) => d.key === "lexReading:number" && d.words[0] === counted.number.word) : undefined;
  if (!number) return false;
  const range = detailOf("hookJob:span", hook.word, "range");
  for (const w of hook.modifiers) modifier(w, here, range);
  const second = headTerm(end.adj.word, here, clause);
  // A word after the second end describes that end alone (ranges.md#number-ranges).
  const own = adjDetail(end.adj, here, clause);
  addDetails(second, [...(own.details ?? [])]);
  range.hosted = second;
  number.details = [...(number.details ?? []), range];
  return true;
}

function readUnits(units: Unit[], here: Here, clause: Clause): void {
  for (let i = 0; i < units.length; i++) {
    if (countedRange(units, i, here, clause)) i++;
    else readUnit(units[i]!, here, clause);
  }
}

function readUnit(unit: Unit, here: Here, clause: Clause): void {
  const hook = here.pendingHook;
  here.pendingHook = undefined;
  if (hook && unit.kind === "np") {
    hook.hosted = npTerm(unit.coord, here, clause);
    const under = hook.frames?.filter((f) => f.words.length > 0).at(-1);
    if (under) framedMember(unit.coord, hook.hosted, under, here);
    else memberFrame(unit.coord, hook.hosted, here);
    return;
  }
  if (hook && unit.kind === "vp") {
    hook.hosted = vpTerm(unit.coord, here, clause);
    return;
  }
  switch (unit.kind) {
    case "np": {
      const term = npTerm(unit.coord, here, clause);
      memberFrame(unit.coord, term, here);
      hostOnHead(term, firstWord(unit.coord), here);
      setRole(unit.coord.level, term, here, firstWord(unit.coord));
      return;
    }
    case "vp":
      if (here.reading.claim.verb) unread(here, "unplaced", "unit:vp", unit.coord.parts[0]?.items[0]);
      else here.reading.claim.verb = vpTerm(unit.coord, here, clause);
      return;
    case "predicate": {
      const term = thing(unit.adj.word);
      addDetails(term, [adjDetail(unit.adj, here, clause)]);
      here.reading.claim.predicate.push(term);
      return;
    }
    case "gCoord":
      here.reading.claim.predicate.push(gTerm(unit.coord, here, clause));
      return;
    case "h":
      readH(unit.unit, here, clause);
      return;
    case "linker":
      here.reading.links.push(link("linker", "unit:linker", [unit.word], prevTo(here)));
      return;
    case "hook":
      readHook(unit, here, clause);
      return;
    case "writingSpan":
      spanTerm(unit.word, here);
      return;
    case "island":
      here.reading.claim.details.push({
        kind: "island",
        construction: "unit:island",
        key: "unit:island",
        anchor: classOf("unit:island")?.anchor ?? "",
        words: [],
        values: {},
        content: [readIsland(unit.island.units, here)],
      });
      return;
    case "clauseCoord": {
      const coord = unit.coord;
      const members: Clause[] = [coord.first, ...coord.links.map((l) => l.clause)].filter((c): c is Clause => c !== undefined);
      const readings = members.map((member, i) => readClause(member, here.utterance, here.body, `${here.reading.id}/m${i}`, here.ctx, here.scoped));
      const joins = coord.links.map((l) => l.join);
      const join = joins[joins.length - 1];
      const terms: Term[] = readings.map((reading) => ({ kind: "clause", reading }));
      // A standalone join (no first clause) is one part with the join and its members.
      if (!coord.first) {
        here.reading.claim.clauses = { kind: "list", ...(join ? { join } : {}), members: terms, shared: [], values: join ? wordValues(join) : {}, parts: [{ members: terms, ...(join ? { join } : {}) }] };
        return;
      }
      here.reading.claim.clauses = clauseGroups(terms[0]!, coord.links.map((l, i) => ({ join: l.join, member: l.clause ? terms[i + 1] : undefined })));
      return;
    }
  }
}

/**
 * A clause list grouped as the tree's joins group it (joins.md#clause-joins): a clause join stands between its
 * clauses, repeating the same join word keeps the list flat, and switching to a different one closes everything
 * before it as one group, so `A xel B xal C` is *(A or B) and C*. Each part is one member and the join after it.
 */
function clauseGroups(first: Term, links: { join: LexWord; member?: Term }[]): Term {
  type Group = { join: LexWord; parts: { members: Term[]; join?: LexWord }[] };
  const close = (group: Group): Term => {
    const members = group.parts.flatMap((p) => p.members);
    return { kind: "list", join: group.join, members, shared: [], values: wordValues(group.join), parts: group.parts };
  };
  let group: Group | undefined;
  let last: Term = first;
  for (const { join, member } of links) {
    if (group && group.join.raw !== join.raw) {
      group.parts.push({ members: [last] });
      last = close(group);
      group = undefined;
    }
    group ??= { join, parts: [] };
    group.parts.push({ members: [last], join });
    if (member) last = member;
  }
  if (!group) return first;
  group.parts.push({ members: [last] });
  return close(group);
}

// ── Readings ────────────────────────────────────────────────────────────────

/** The first word position in a unit list, for a nested reading's id. */
function firstAt(units: Unit[]): number {
  for (const unit of units) {
    const word = unit.kind === "h" ? unit.unit.word : unit.kind === "hook" || unit.kind === "linker" || unit.kind === "writingSpan" ? unit.word : undefined;
    if (word?.at !== undefined) return word.at;
  }
  return 0;
}

function emptyReading(id: ReadingId, utterance: number, body: number, clause: Clause): Reading {
  return { id, source: { utterance, body, clause }, frames: [], order: [], unordered: [], claim: { roles: {}, predicate: [], details: [] }, links: [], unread: [] };
}

/** A scope island: a nested reading of its chunk; a stance inside frames that chunk only (rule 2). */
function readIsland(units: Unit[], outer: Here, path = `i${firstAt(units)}`): Reading {
  const clause: Clause = { units };
  const reading = emptyReading(`${outer.reading.id}/${path}`, outer.utterance, outer.body, clause);
  const here: Here = { ...outer, reading, scoped: false };
  for (const coord of titledPhrases(units)) here.ctx.titled.add(coord);
  readUnits(units, here, clause);
  return reading;
}

function readDependent(clause: Clause, here: Here): Reading | undefined {
  const dependent = clause.dependent;
  if (!dependent) return undefined;
  let reading = here.ctx.dependents.get(dependent.clause);
  if (!reading) {
    reading = readClause(dependent.clause, here.utterance, here.body, `${here.reading.id}/d`, here.ctx, here.scoped);
    here.ctx.dependents.set(dependent.clause, reading);
  }
  return reading;
}

/**
 * *Only because* (because-and-iff.md#choosing-a-hinge): "*Only because* stacks two hinges: `thebem` (the outcome needs
 * it), then `thahum` with the condition (and it is a fact)." A `thebem` with no `/b/` of its own, right before a `thahum`
 * that has one, takes that condition: the same `hosted` term (one place, the first host's in coverage), and a `grounds`
 * link of its own where the condition is the next sentence (`blarl` before a period). The `/ɡ/` pair on a noun
 * (`gebem gahum`, *depends on*) stacks the same way: there the hinges are sibling details of the noun.
 */
function stackedHinge(reading: Reading): void {
  const KEY = "overlay:clause_hinge:th";
  for (const needs of reading.frames) {
    if (needs.key !== KEY || needs.values.gloss !== "only-if" || needs.hosted || needs.words[0]?.at === undefined) continue;
    const after = needs.words[0].at + 1;
    const fact = reading.frames.find((f) => f.key === KEY && f.values.gloss === "because" && f.words[0]?.at === after);
    if (!fact?.hosted) continue;
    needs.hosted = fact.hosted;
    for (const l of reading.links.filter((l) => l.kind === "grounds" && l.frame === fact)) reading.links.push({ ...l, frame: needs });
  }
  for (const details of detailLists(reading)) stackedNounHinge(details);
}

/** The `/ɡ/` stack among one term's details: `gebem` with no `/b/`, right before a `gahum` that has one (no `blarl` on `/ɡ/`). */
function stackedNounHinge(details: Detail[]): void {
  const KEY = "overlay:clause_hinge:g";
  for (const needs of details) {
    if (needs.key !== KEY || needs.values.gloss !== "only-if" || needs.hosted || needs.words[0]?.at === undefined) continue;
    const after = needs.words[0].at + 1;
    const fact = details.find((d) => d.key === KEY && d.values.gloss === "because" && d.words[0]?.at === after);
    if (fact?.hosted) needs.hosted = fact.hosted;
  }
}

/** Every detail list in one reading's own terms and frames, nested readings left to their own pass. */
function detailLists(reading: Reading): Detail[][] {
  const out: Detail[][] = [];
  const seen = new Set<object>();
  const details = (list: Detail[] | undefined): void => {
    if (!list?.length || seen.has(list)) return;
    seen.add(list);
    out.push(list);
    for (const d of list) {
      term(d.hosted);
      details(d.details);
      d.frames?.forEach(frame);
    }
  };
  const frame = (f: Frame): void => {
    term(f.hosted);
    term(f.party);
    details(f.details);
    f.inner?.forEach(frame);
  };
  const term = (t: Term | undefined): void => {
    if (!t || seen.has(t) || t.kind === "clause" || t.kind === "quote") return;
    seen.add(t);
    if (t.kind === "list") {
      t.members.forEach(term);
      details(t.sharedDetails);
      if (t.bound) details([t.bound]);
    }
    if ("details" in t) details(t.details);
    t.frames?.forEach(frame);
  };
  reading.frames.forEach(frame);
  const claim = reading.claim;
  [claim.verb, ...Object.values(claim.roles), ...claim.predicate].forEach(term);
  details(claim.details);
  return out;
}

function readClause(clause: Clause, utterance: number, body: number, id: ReadingId, ctx: Ctx, scoped: boolean): Reading {
  const reading = emptyReading(id, utterance, body, clause);
  copyScope(reading, ctx.scopes.get(clause), ctx.options.tables);
  const here: Here = { ctx, reading, utterance, body, scoped };
  for (const coord of titledPhrases(clause.units)) ctx.titled.add(coord);
  readUnits(clause.units, here, clause);
  stackedHinge(reading);
  if (clause.dependent && !ctx.dependents.has(clause.dependent.clause)) {
    // A dependent no stand-in names in a role: an `/h/` stand-in or `Odo` slot; kept as a detail with its reading.
    const dependent = readDependent(clause, here)!;
    const detail: Detail = {
      kind: "dependent",
      construction: "slot:dependent",
      key: "slot:dependent",
      anchor: classOf("slot:dependent")?.anchor ?? "",
      words: [clause.dependent.orodo],
      values: {},
      content: [dependent],
    };
    // A verb stand-in (`vaon`, stand-in-roles.md#speech-act-verbs) is the verb, and the next clause is its content: the
    // dependent nests on the verb's term, one place for the word.
    const verb = verbHeaded(reading.claim.verb, clause.dependent.orodo);
    if (verb) verb.details.push(detail);
    else reading.claim.details.push(detail);
    reading.links.push(link("standIn", "slot:dependent", [clause.dependent.orodo], { to: dependent.id }));
  }
  return reading;
}

/** The thing term headed by `word` among a clause's verb and its joined verbs. */
function verbHeaded(verb: Term | undefined, word: LexWord): Extract<Term, { kind: "thing" }> | undefined {
  if (!verb) return undefined;
  if (verb.kind === "thing") return verb.head === word ? verb : undefined;
  if (verb.kind === "list") {
    for (const member of verb.members) {
      const found = verbHeaded(member.kind === "clause" ? member.reading.claim.verb : member, word);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * The words on each call and reaction (`TurnWordMods`): details on that word's frame, one set in each sentence body the
 * frame sits in (speech-moves.md#vocative, more-turn-words.md#describe-turn-word).
 */
function edgeDetails(left: LeftEdge, here: Here, clause: Clause): void {
  const attach = (words: LexWord[], mods: (TurnWordMods | undefined)[] | undefined): void => {
    words.forEach((word, i) => {
      const mod = mods?.[i];
      const frame = here.reading.frames.find((f) => f.words[0] === word);
      if (!mod || !frame) return;
      const box = detailOf(wordKey(word), word, "frame");
      for (const w of mod.w ?? []) modifier(w, here, box);
      const details = [...(mod.glAdj ? [mod.glAdj] : []), ...mod.adjs].map((adj) => adjDetail(adj, here, clause));
      frame.details = [...(frame.details ?? []), ...details, ...(box.details ?? [])];
      if (box.frames?.length) frame.inner = [...(frame.inner ?? []), ...box.frames];
    });
  };
  attach(left.vocatives, left.vocativeAdjs);
  attach(left.interjections, left.interjectionMods);
}

function edgeLinks(left: LeftEdge, here: Here): void {
  for (const word of left.polars) here.reading.links.push(link("polar", "edge:polar", [word], prevTo(here)));
  if (left.hook) here.reading.links.push(link("discourse", "edge:hook", [left.hook], left.hook.ending === "r" ? prevTo(here) : {}));
}

/**
 * Read a parse: one reading per sentence body, in text order. A clause join's members, a dependent, an island and a
 * quote are nested readings inside it ({@link allReadings} lists them all).
 */
export function readParse(result: ParseResult, options: ReadOptions = {}): Reading[] {
  const info = result.resolve;
  const text = options.text ?? "t";
  const ctx: Ctx = {
    result,
    options,
    text,
    scopes: new Map((info?.scope ?? []).filter((s) => !s.bodiless).map((s) => [s.clause, s])),
    bodiless: new Map((info?.scope ?? []).filter((s) => s.bodiless).map((s) => [s.utteranceIndex, s])),
    anaphors: new Map((info?.anaphors ?? []).map((a) => [a.pronoun, a])),
    terms: new Map(),
    blanks: new Set((info?.asks ?? []).flatMap((a) => [...a.gaps, ...(a.inner ?? [])])),
    titled: new Set(),
    shared: new Map(),
    sharedItems: new Map((info?.shared ?? []).map((record) => [record.shared, record])),
    sentences: [],
    dependents: new Map(),
    lists: new Map(),
    pairings: [],
  };
  for (const record of info?.shared ?? []) ctx.shared.set(record.join, [...(ctx.shared.get(record.join) ?? []), record]);
  result.utterances.forEach((u, ui) => {
    const count = Math.max(u.bodies.length, 1);
    for (let bi = 0; bi < count; bi++) ctx.sentences.push({ utterance: ui, body: bi, id: `${text}:${ui}.${bi}` });
  });

  const out: Reading[] = [];
  const firstOf = new Map<number, Reading>();
  result.utterances.forEach((utterance, ui) => {
    const bodies = utterance.bodies.length ? utterance.bodies : [undefined];
    bodies.forEach((body, bi) => {
      const id = `${text}:${ui}.${bi}`;
      const reading = body ? readClause(body.clause, ui, bi, id, ctx, true) : emptyReading(id, ui, bi, { units: [] });
      const here: Here = { ctx, reading, utterance: ui, body: bi, scoped: true };
      if (!body) copyScope(reading, ctx.bodiless.get(ui), ctx.options.tables);
      edgeDetails(utterance.left, here, reading.source.clause);
      if (bi === 0) edgeLinks(utterance.left, here);
      if (body?.linker) reading.links.push(link("linker", "unit:linker", [body.linker], prevTo(here)));
      if (body?.topicMarker) reading.links.push(link("topic", "body:topicMarker", [body.topicMarker]));
      if (!firstOf.has(ui)) firstOf.set(ui, reading);
      out.push(reading);
    });
  });

  // A *respectively* link's other end: the partner lists the resolve stage names (list-structure.md#respectively).
  const records = new Map((info?.pairings ?? []).map((record) => [record.marker, record]));
  for (const { link: pairing, marker } of ctx.pairings) {
    const partners = (records.get(marker)?.partners ?? []).flatMap((join) => ctx.lists.get(join) ?? []);
    if (partners.length) pairing.partners = partners;
  }

  // Question type: a value of the act word's force frame (interpreter.md#classification-table, `ask`).
  for (const ask of info?.asks ?? []) {
    if (ask.kind === "none") continue;
    const reading = firstOf.get(ask.utteranceIndex);
    if (!reading) continue;
    // Every question has an act word (R6b), so its force frame carries the type.
    const act = reading.frames.find((f) => f.key === "edge:force");
    if (act) act.values.ask = ask.kind;
  }
  for (const answer of info?.answers ?? []) {
    const reading = firstOf.get(answer.utteranceIndex);
    const asked = info?.asks[answer.askIndex];
    const to = asked ? firstOf.get(asked.utteranceIndex)?.id : undefined;
    if (reading) reading.links.push(link("answer", "answer:answer", answer.blanks, { answer, ...(to ? { to } : {}) }));
  }
  carriedLinks(out, info?.carried ?? []);
  // A tone on a word, a span or an island sits on what it colors (tone-marks.md#showing-your-tone); a rest-of-sentence tone
  // came in with the scope frames.
  if (info?.tones) placeTones(out, allReadings(out), info.tones);
  return out;
}

/** The frame family each carried kind's frame is read as (interpreter.md#frame-families). */
const CARRY_FAMILY: Readonly<Record<CarryKind, Frame["family"]>> = { channel: "stance", holder: "holder", notional: "notional" };

/** The section that says each kind carries. */
export const CARRY_ANCHOR: Readonly<Record<CarryKind, string>> = {
  channel: "evidentiality.md#carry-forward",
  holder: "holder.md#naming-a-holder",
  notional: "notional.md#notional-as-if-framing",
};

/**
 * A `carriedFrame` link on each later bare statement, one per frame the resolve stage says it inherits, to the reading
 * that set it (evidentiality.md#carry-forward). The frame is never copied into the later reading's `frames`. The
 * reading's own attitudes and feeling words that the resolve stage says sit over it go in the link's `coveredBy`.
 */
function carriedLinks(sentences: Reading[], carried: readonly BodyCarry[]): void {
  const at = new Map(sentences.map((r) => [`${r.source.utterance}.${r.source.body}`, r]));
  for (const record of carried) {
    const reading = at.get(`${record.utteranceIndex}.${record.bodyIndex}`);
    if (!reading) continue;
    const coveredBy = (record.coveredBy ?? []).flatMap((word) => reading.frames.filter((f) => f.words.includes(word)));
    for (const carry of record.frames) {
      const source = at.get(`${carry.utteranceIndex}.${carry.bodyIndex}`);
      const frame = source?.frames.find((f) => f.family === CARRY_FAMILY[carry.kind] && f.words.includes(carry.word));
      const words = [carry.word, ...(carry.offset ? [carry.offset.bound, ...(carry.offset.amount ? [carry.offset.amount] : [])] : [])];
      reading.links.push(
        link("carriedFrame", `carry:${carry.kind}`, words, {
          anchor: carry.offset ? "dated-channel.md#counting-from-now" : CARRY_ANCHOR[carry.kind],
          ...(source ? { to: source.id } : {}),
          ...(frame ? { frame } : {}),
          ...(coveredBy.length > 0 ? { coveredBy } : {}),
        }),
      );
    }
  }
}

/** Parse and read one text. */
export function readText(text: string, tables: ClassifyTables, options: Omit<ReadOptions, "tables"> = {}): Reading[] {
  return readParse(parseWithTables(text, tables), { ...options, tables });
}

/** Every reading, nested ones included (clause-join members, dependents, islands, quotes), depth first in text order. */
export function allReadings(readings: Reading[]): Reading[] {
  const out: Reading[] = [];
  const seen = new Set<Reading>();
  const visitTerm = (term: Term | undefined): void => {
    if (!term) return;
    if (term.kind === "clause") visit(term.reading);
    if (term.kind === "list") {
      term.members.forEach(visitTerm);
      term.sharedDetails?.forEach(visitDetail);
    }
    if (term.kind === "quote") term.readings.forEach(visit);
    if ("details" in term && term.details) term.details.forEach(visitDetail);
  };
  const visitDetail = (detail: Detail): void => {
    detail.content?.forEach(visit);
    visitTerm(detail.hosted);
    detail.details?.forEach(visitDetail);
  };
  const visit = (reading: Reading): void => {
    if (seen.has(reading)) return;
    seen.add(reading);
    out.push(reading);
    for (const frame of reading.frames) frame.content?.forEach(visit);
    const claim = reading.claim;
    [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses].forEach(visitTerm);
    claim.details.forEach(visitDetail);
  };
  readings.forEach(visit);
  return out;
}
