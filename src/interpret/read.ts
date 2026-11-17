/**
 * The reader (docs/meta/interpreter.md#reader-rules): a parse → one reading per clause.
 *
 * It copies the tree and the resolve stage's records. It never re-derives a reading, binds a pronoun, defaults a
 * missing field, or orders two frames itself: the order of whole-clause frames is copied from
 * `ParseResult.resolve.scope` (src/parse/scope.ts). A construction with no row in {@link CLASSES} becomes an `unknown`
 * frame and an `unread` entry.
 */
import { CLOSED } from "../closed-roots.js";
import type { ClassifyTables } from "../parse/classify.js";
import { overlayConstructionId } from "../parse/construction-trace.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { ClauseScope, FrameReach, ScopeFrame } from "../parse/scope.js";
import type {
  AnaphorBind,
  Clause,
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
  Unit,
  VpCoord,
} from "../parse/types.js";
import { classOf, overlayClassKey } from "./classes.js";
import type { Detail, Frame, Link, LinkKind, Reading, ReadingId, Term, Unread } from "./types.js";

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
  anaphors: Map<LexWord, AnaphorBind>;
  blanks: Set<LexWord>;
  shared: Map<LexWord, SharedRecord[]>;
  /** First reading id of each sentence, in text order: what a linker, grounds or answer points to. */
  sentences: { utterance: number; body: number; id: ReadingId }[];
  /** A dependent's reading, made once where its stand-in names it. */
  dependents: Map<Clause, Reading>;
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

function fromScope(frame: ScopeFrame): Frame {
  const out = frameOf(frame.key, frame.word, undefined);
  return { ...out, family: frame.family, ...(frame.member ? { member: frame.member } : {}), ...(frame.holderHost ? { holderHost: true as const } : {}) };
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

function pronoun(word: LexWord, here: Here): Term {
  const bind = here.ctx.anaphors.get(word);
  if (bind) here.reading.links.push(link("anaphor", `anaphor:${bind.kind}`, [word], { bind }));
  return { kind: "pronoun", word, ...(bind ? { bind } : {}), ...(bind?.antecedent ? { antecedent: thing(bind.antecedent) } : {}) };
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
  if (family.bracket === "(") {
    here.reading.claim.details.push({ ...detailOf("unit:writingSpan", word, "aside"), content: readings });
  } else {
    here.reading.frames.push({ ...frameOf("unit:writingSpan", word, here), content: readings });
  }
  return { kind: "quote", word, readings };
}

function headTerm(word: LexWord, here: Here, clause: Clause): Term {
  const family = word.family;
  const ctx = here.ctx;
  if (ctx.blanks.has(word)) return { kind: "blank", word };
  if (family.kind === "number") return { kind: "number", word, stem: family.stem };
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
  if (pkg.asOf) detail.details = [...(detail.details ?? []), detailOf("slot:asOf", pkg.asOf.word, "time")];
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
  const details = [...(pkg.glAdj ? [pkg.glAdj] : []), ...pkg.adjs].map((adj) => adjDetail(adj, here, clause));
  if (pkg.tag) here.reading.links.push(link("tag", "slot:tag", [pkg.tag]));
  addDetails(term, details);
  return term;
}

function sharedOf(joins: (LexWord | undefined)[], here: Here): SharedRecord[] {
  const out: SharedRecord[] = [];
  for (const join of joins) if (join) out.push(...(here.ctx.shared.get(join) ?? []));
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
    if (row?.cls === "link" && w.overlay?.kind === "pairing") here.reading.links.push(link("pairing", key, join ? [w, join] : [w]));
    else unread(here, row ? "unplaced" : "noRow", key, w);
  }
}

function listTerm(parts: Part[], here: Here, bound?: Detail): Term {
  if (parts.length === 1 && parts[0]!.members.length === 1 && !parts[0]!.join) return parts[0]!.members[0]!;
  const joins = parts.map((p) => p.join);
  const join = [...joins].reverse().find((j) => j !== undefined);
  const members = parts.flatMap((p) => p.members);
  // A fill-ask join with no items is the blank itself (questions.md#fill-ask; interpreter.md `ask:fillAsk`).
  if (join && members.length === 0 && here.ctx.blanks.has(join)) return { kind: "blank", word: join, details: bound ? [bound] : [] };
  const frames = listFrames(joins, here);
  return {
    kind: "list",
    ...(join ? { join } : {}),
    members,
    shared: sharedOf(joins, here),
    values: join ? wordValues(join) : {},
    parts,
    ...(frames.length ? { frames } : {}),
    ...(bound ? { bound } : {}),
  };
}

function npTerm(coord: NpCoord, here: Here, clause: Clause): Term {
  let bound: Detail | undefined;
  const parts = coord.parts.map((part) => {
    const members = part.items.map((item): Term => {
      if (item.kind === "package") return itemTerm(item.package, here, clause);
      if (item.kind === "island") return { kind: "clause", reading: readIsland(item.island.units, here) };
      const bar = thing(item.bar.word);
      if (bar.kind === "thing") bar.frames = [frameOf("slot:bar", item.bar.word, here)];
      return bar;
    });
    if (part.tag) here.reading.links.push(link("tag", "slot:tag", [part.tag]));
    joinModifiers(part.joinModifiers, part.join, here);
    bound = boundOf(part.join, part.landmark, here, clause) ?? bound;
    return { members, ...(part.join ? { join: part.join } : {}) };
  });
  return listTerm(parts, here, bound);
}

function gTerm(coord: GCoord, here: Here, clause: Clause): Term {
  const parts = coord.parts.map((part) => {
    joinModifiers(part.joinModifiers, part.join, here);
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
  return listTerm(parts, here);
}

function verbTerm(word: LexWord, here: Here): Term {
  const term = thing(word);
  const key = wordKey(word);
  if (term.kind === "thing" && classOf(key)?.cls.startsWith("frame:")) term.frames = [frameOf(key, word, here)];
  return term;
}

function vpTerm(coord: VpCoord, here: Here, clause: Clause): Term {
  const parts = coord.parts.map((part) => {
    for (const unit of part.sharedUnits ?? []) {
      readUnit(unit, here, clause);
      if (unit.kind === "np") here.reading.links.push(link("verbShared", "reading:verbSharedNoun", []));
    }
    for (const hv of part.hostedVerbs ?? []) {
      const hosted = hostedTerm(hv.hosted, here, clause);
      if (hosted) here.reading.claim.details.push({ ...detailOf("slot:hosted", hv.verb, "hosted"), hosted });
    }
    joinModifiers(part.joinModifiers, part.join, here);
    // Each item is a verb plus the words before it (verb-and-stance-joins.md#vp-clause-forms): an item with words of
    // its own is a nested reading whose verb is that verb.
    const itemUnits = new Map((part.itemUnits ?? []).map((item) => [item.verb, item.units]));
    const members = part.items.map((w): Term => {
      const units = itemUnits.get(w);
      if (!units) return verbTerm(w, here);
      const item = readIsland(units, here, `v${w.at ?? 0}`);
      item.claim.verb = verbTerm(w, { ...here, reading: item });
      return { kind: "clause", reading: item };
    });
    return { members, ...(part.join ? { join: part.join } : {}) };
  });
  return listTerm(parts, here);
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

function readH(unit: HUnit, here: Here, clause: Clause): void {
  const word = unit.word;
  const key = wordKey(word, unit.closes);
  const row = classOf(key);
  if (!row) {
    here.reading.frames.push(frameOf(key, word, here));
    return;
  }
  if (row.cls.startsWith("frame:")) {
    const frame = placeFrame(key, word, row.reach, here);
    if (unit.closes?.length) frame.values.closes = unit.closes.join(",");
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
    if (frame.family === "holder" && !frame.party && word.family.kind === "x" && word.family.rightRoots?.length) {
      frame.party = { kind: "thing", head: word, root: word.family.rightRoots.join(""), named: false, details: [] };
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
      if (unit.zone) inner.push(frameOf(wordKey(unit.zone.word, unit.zone.closes), unit.zone.word, here));
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
      here.reading.claim.details.push(detail);
      here.pendingHook = detail;
    }
  }
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

function readUnit(unit: Unit, here: Here, clause: Clause): void {
  const hook = here.pendingHook;
  here.pendingHook = undefined;
  if (hook && unit.kind === "np") {
    hook.hosted = npTerm(unit.coord, here, clause);
    return;
  }
  if (hook && unit.kind === "vp") {
    hook.hosted = vpTerm(unit.coord, here, clause);
    return;
  }
  switch (unit.kind) {
    case "np":
      setRole(unit.coord.level, npTerm(unit.coord, here, clause), here, firstWord(unit.coord));
      return;
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
      here.reading.claim.clauses = {
        kind: "list",
        ...(join ? { join } : {}),
        members: readings.map((reading) => ({ kind: "clause", reading })),
        shared: [],
        values: join ? wordValues(join) : {},
        parts: [{ members: readings.map((reading) => ({ kind: "clause", reading })), ...(join ? { join } : {}) }],
      };
      return;
    }
  }
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
  for (const unit of units) readUnit(unit, here, clause);
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

function readClause(clause: Clause, utterance: number, body: number, id: ReadingId, ctx: Ctx, scoped: boolean): Reading {
  const reading = emptyReading(id, utterance, body, clause);
  const scope = ctx.scopes.get(clause);
  if (scope) {
    const byScope = new Map<ScopeFrame, Frame>();
    for (const frame of scope.frames) {
      const copy = fromScope(frame);
      byScope.set(frame, copy);
      reading.frames.push(copy);
    }
    for (const o of scope.order) reading.order.push({ over: byScope.get(o.over)!, under: byScope.get(o.under)!, kind: o.kind, anchors: o.anchors });
    for (const u of scope.unordered) reading.unordered.push([byScope.get(u.frames[0])!, byScope.get(u.frames[1])!]);
  }
  const here: Here = { ctx, reading, utterance, body, scoped };
  for (const unit of clause.units) readUnit(unit, here, clause);
  if (clause.dependent && !ctx.dependents.has(clause.dependent.clause)) {
    // A dependent no stand-in names in a role: an `/h/` stand-in or `Odo` slot; kept as a detail with its reading.
    const dependent = readDependent(clause, here)!;
    reading.claim.details.push({
      kind: "dependent",
      construction: "slot:dependent",
      key: "slot:dependent",
      anchor: classOf("slot:dependent")?.anchor ?? "",
      words: [clause.dependent.orodo],
      values: {},
      content: [dependent],
    });
    reading.links.push(link("standIn", "slot:dependent", [clause.dependent.orodo], { to: dependent.id }));
  }
  return reading;
}

/** Edge frames the resolve stage does not pair: the addressee. The act word and reactions come from the scope record. */
function vocativeFrames(left: LeftEdge): Frame[] {
  return left.vocatives.map((word) => ({ ...frameOf("edge:vocative", word, undefined), party: thing(word) }));
}

/** The act word and reactions of a turn with no body (a bare question, a call), which the scope record does not hold. */
function bareEdgeFrames(left: LeftEdge): Frame[] {
  const frames: Frame[] = [];
  const act = left.leadForce ?? left.force;
  if (act) frames.push(frameOf("edge:force", act, undefined));
  for (const word of left.interjections) frames.push(frameOf("edge:interjection", word, undefined));
  return frames;
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
    scopes: new Map((info?.scope ?? []).map((s) => [s.clause, s])),
    anaphors: new Map((info?.anaphors ?? []).map((a) => [a.pronoun, a])),
    blanks: new Set((info?.asks ?? []).flatMap((a) => [...a.gaps, ...(a.inner ?? [])])),
    shared: new Map(),
    sentences: [],
    dependents: new Map(),
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
      if (!body) reading.frames.push(...bareEdgeFrames(utterance.left));
      reading.frames.push(...vocativeFrames(utterance.left));
      if (bi === 0) edgeLinks(utterance.left, here);
      if (body?.linker) reading.links.push(link("linker", "unit:linker", [body.linker], prevTo(here)));
      if (body?.topicMarker) reading.links.push(link("topic", "body:topicMarker", [body.topicMarker]));
      if (!firstOf.has(ui)) firstOf.set(ui, reading);
      out.push(reading);
    });
  });

  // Question type: a value of the act word's force frame (interpreter.md#classification-table, `ask`).
  for (const ask of info?.asks ?? []) {
    if (ask.kind === "none") continue;
    const reading = firstOf.get(ask.utteranceIndex);
    if (!reading) continue;
    const act = reading.frames.find((f) => f.key === "edge:force");
    if (act) act.values.ask = ask.kind;
    else reading.frames.push({ ...frameOf(`ask:${ask.kind}`, undefined, undefined), values: { ask: ask.kind } });
  }
  for (const answer of info?.answers ?? []) {
    const reading = firstOf.get(answer.utteranceIndex);
    const asked = info?.asks[answer.askIndex];
    const to = asked ? firstOf.get(asked.utteranceIndex)?.id : undefined;
    if (reading) reading.links.push(link("answer", "answer:answer", answer.blanks, { answer, ...(to ? { to } : {}) }));
  }
  return out;
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
    if (term.kind === "list") term.members.forEach(visitTerm);
    if (term.kind === "quote") term.readings.forEach(visit);
    if ("details" in term && term.details) term.details.forEach(visitDetail);
  };
  const visitDetail = (detail: Detail): void => {
    detail.content?.forEach(visit);
    visitTerm(detail.hosted);
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
