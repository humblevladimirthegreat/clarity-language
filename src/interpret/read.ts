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
import { parseWithTables } from "../parse/parse-core.js";
import { crosses, type NestedKind } from "../parse/boundaries.js";
import { endsAt, eventSentenceReads, perSpeaker, reachesQuote, type SlotId } from "../parse/discourse-slots.js";
import { titledPhrases } from "../parse/scope.js";
import { isNoKindFence } from "../parse/ast-walk.js";
import { isGenericPronoun, isTopicPronoun } from "../parse/resolve.js";
import type {
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
import { classOf } from "./classes.js";
import { constructionFor, copyScope, detailOf, frameOf, framedMember, holderHostValues, hostOnHead, link, memberFrame, nestedKinds, nextSentence, placeFrame, previousSentence, thing, unread, wordKey, wordValues, type Ctx, type Here, type ReadOptions } from "./read-context.js";
import { throughAntecedent } from "./steps.js";
import { placeTones } from "./tones.js";
import type { Detail, Frame, Link, Reading, ReadingId, StanceList, Term } from "./types.js";


// ── Terms ───────────────────────────────────────────────────────────────────


/**
 * A pronoun term. Its antecedent is the word the resolver's bind names: the term already read from that word, whatever
 * its kind (a pronoun holds its own antecedent, so a chain goes on; a join word names its list), else a term of that
 * word. Never bound here (reader rule 6). The topic and the generic pronoun carry their `sort`, as the resolve stage tells
 * them apart (topic.md#topic-pronoun, pronouns.md#generic-pronoun).
 */
function pronoun(word: LexWord, here: Here): Term {
  const bind = here.ctx.anaphors.get(word);
  if (bind) here.reading.links.push(link("anaphor", `anaphor:${bind.kind}`, [word], { bind }));
  const at = bind?.antecedent;
  const outer = here.ctx.options.outerTerm;
  const antecedent = at ? (here.ctx.terms.get(at) ?? here.ctx.lists.get(at) ?? (outer ? outerAntecedent(outer(at), at) : thing(at))) : undefined;
  const sort = isTopicPronoun(word) ? "topic" : isGenericPronoun(word) ? "generic" : undefined;
  // A bound pronoun's ending and pinned sense say which one it names (pronouns.md#a-new-one, resume-sense.md).
  const values: Record<string, string> | undefined =
    bind && word.ending ? { ending: word.ending, ...(word.resumeSense ? { sense: word.resumeSense } : {}) } : undefined;
  const term: Term = { kind: "pronoun", word, ...(sort ? { sort } : {}), ...(bind ? { bind } : {}), ...(antecedent ? { antecedent } : {}), ...(values ? { values } : {}) };
  here.ctx.terms.set(word, term);
  return term;
}

/**
 * The antecedent an aside's pronoun holds for a word outside the aside (spans.md#asides-th): an outer pronoun keeps its
 * chain, without its details and frames, and any other outer word is a plain term of that word. So the aside never holds
 * the term that hosts it.
 */
function outerAntecedent(term: Term | undefined, at: LexWord): Term {
  if (term?.kind !== "pronoun") return thing(at);
  const { details: _details, frames: _frames, antecedent, ...bare } = term;
  const next = term.bind?.antecedent;
  return { ...bare, ...(antecedent && next ? { antecedent: outerAntecedent(antecedent, next) } : {}) };
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
    // A cite's words start with nothing from outside; an aside's back references point out of it (spans.md#asides-th),
    // to the terms already read there.
    const aside = family.bracket === "(";
    const passing = aside ? here.ctx.result.resolve?.asides?.get(word) : undefined;
    const sub = parseWithTables(text, tables, passing ? { aside: passing } : {});
    const { outerTerm: _, ...options } = here.ctx.options;
    const outerTerm = (at: LexWord): Term | undefined => here.ctx.terms.get(at) ?? here.ctx.options.outerTerm?.(at);
    // An aside's readings sit at `/a<at>`, a cite's at `/q<at>`: the step names the boundary (nestedKinds).
    const step = aside ? "a" : "q";
    return readParse(sub, { ...options, ...(aside ? { outerTerm } : {}), text: `${here.reading.id}/${step}${word.at ?? 0}` });
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
  const aside = asideDetail(word, here);
  if (aside) {
    here.reading.claim.details.push(aside);
    return aside.hosted!;
  }
  // The frame keeps the word (rule 5) and hosts the quote term, so the term nests in it: one place for the word
  // wherever else the term sits (a role).
  const readings = quoteReadings(word, here);
  const term: Term = { kind: "quote", word, readings };
  here.reading.frames.push({ ...frameOf("unit:writingSpan", word, here), content: readings, hosted: term });
  return term;
}

/** An aside (`th(…)`, `ɡ(…)`, `w(…)`, `h(…)`): a detail whose content is the aside's own readings (spans.md#asides-th). */
function asideDetail(word: LexWord, here: Here): Detail | undefined {
  const family = word.family;
  if (family.kind !== "writingSpan" || family.bracket !== "(") return undefined;
  const readings = quoteReadings(word, here);
  return { ...detailOf("unit:writingSpan", word, "aside"), content: readings, hosted: { kind: "quote", word, readings } };
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
    // `zayan`, the turn's *we* (R4a-7); `zayanx` stays a group thing.
    if (family.roots[0] === CLOSED.handshake && !word.plural) return { kind: "we", word };
  }
  // The generic pronoun (`zeyen`, pronouns.md#generic-pronoun) is a pronoun of its sort, as it is as a holder.
  if (isGenericPronoun(word)) return pronoun(word, here);
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

/**
 * The discourse hooks that point to the claim before them: any `-r` hook (an earlier stretch), and `el` / `em`
 * (*instead*, *never mind*: this claim replaces the last one) and `ul` / `um` (*except*: an exception to what was
 * just said), hooks.md#discourse-hooks.
 */
const PRIOR_CLAIM_HOOKS = new Set(["el", "em", "ul", "um"]);

function discourseTo(word: LexWord, here: Here): Partial<Link> {
  const form = word.family.kind === "hook" ? word.family.form : "";
  return word.ending === "r" || PRIOR_CLAIM_HOOKS.has(form) ? prevTo(here) : {};
}

function addDetails(term: Term, details: Detail[]): void {
  if (details.length === 0 || term.kind === "clause" || term.kind === "list" || term.kind === "quote") return;
  term.details = [...(term.details ?? []), ...details];
}

/** A `/w/` word: a degree detail, or a frame with adjective reach (rule 2). */
function modifier(word: LexWord, here: Here, into: Detail): void {
  const aside = asideDetail(word, here);
  if (aside) {
    into.details = [...(into.details ?? []), aside];
    return;
  }
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
  const aside = asideDetail(word, here);
  const row = aside ? undefined : classOf(key);
  if (!row && !aside) unread(here, "noRow", key, word);
  const detail = aside ?? detailOf(key, word, row?.cls.startsWith("detail:") ? row.cls.slice(7) : "adjective");
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
 * denial rides in it as `inner`, not on the list term. The reading has the binder from its scope record. `hostOnJoin`
 * hosts the list (interpreter.md `joinSeries:u:kind`).
 */
function noKindBinder(join: LexWord, here: Here): void {
  const frame = here.reading.frames.find((f) => f.key === "joinSeries:u:kind" && f.words[0] === join);
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
      if (item.kind === "island") return { kind: "clause", reading: readIsland(item.island, here) };
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
        if (item.kind === "island") return { kind: "clause", reading: readIsland(item.island, here) };
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
    const itemUnits = new Map((part.itemUnits ?? []).map((item) => [item.verb, item]));
    const members = part.items.map((w): Term => {
      const own = itemUnits.get(w);
      if (!own) return verbOf(w, here);
      const item = readIsland(own, here, `v${w.at ?? 0}`);
      item.claim.verb = verbOf(w, { ...here, reading: item });
      return { kind: "clause", reading: item };
    });
    return { members, ...(part.join ? { join: part.join } : {}) };
  });
  return listTerm(parts, here, undefined, shared);
}

// ── Units ───────────────────────────────────────────────────────────────────


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


function readH(unit: HUnit, here: Here, clause: Clause): void {
  const word = unit.word;
  const key = wordKey(word, unit.closes);
  const aside = asideDetail(word, here);
  if (aside) {
    // A `th(…)` or `h(…)` aside comments on the sentence or the action: a detail of the claim, no frame (spans.md#asides-th).
    for (const w of unit.modifiers) modifier(w, here, aside);
    here.reading.claim.details.push(aside);
    return;
  }
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
    const frame = placeFrame(key, word, here);
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
    sayParty(frame, word);
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
 * the generic pronoun is a pronoun of its sort (pronouns.md#generic-pronoun); the microphone is the speaker term, the
 * headphones on `-n` the listener term, as `zuwen` and `zawan` are in a role, and the handshake named the turn's *we*;
 * `-n` is a name, marked named as the same name in a role is; and `-r` is "someone already named", a pronoun with the
 * resolver's antecedent, or, with none at the end of its chain, the name it spells.
 */
function holderParty(word: LexWord, here: Here): Term | undefined {
  const family = word.family;
  if (family.kind !== "x" || !family.rightRoots?.length) return undefined;
  const bind = here.ctx.anaphors.get(word)?.kind;
  if (bind === "topic" || isGenericPronoun(word)) return pronoun(word, here);
  // A `-r` whose bind reaches no antecedent is the name it spells; its anaphor link stays the resolver's. One that
  // resumes the group `zayanx` (a group thing in a role) is the turn's *we* as a group, as the named handshake is.
  if (word.ending === "r" && bind === "content") {
    const term = pronoun(word, here);
    const end = throughAntecedent(term);
    if (end.kind === "thing" && end.named && end.root === CLOSED.handshake) return { kind: "we", word: end.head };
    if (end.kind !== "pronoun" || end.sort === "generic") return term;
  }
  const root = family.rightRoots.length === 1 ? family.rightRoots[0] : undefined;
  if (root === CLOSED.microphone) return { kind: "speaker", word };
  if (root === CLOSED.headphones) return word.ending === "n" ? { kind: "listener", word } : undefined;
  const named = word.ending === "n" || word.ending === "ln" || word.ending === "r";
  if (root === CLOSED.handshake && named) return { kind: "we", word };
  return { kind: "thing", head: word, root: family.rightRoots.join(""), named, details: [] };
}

/**
 * Who says a say word on `v` (permission-consent.md#say-words): its hosted `bl-` word, else by its ending the speaker
 * (`-m`), or `values.source`: the rules (`-l`) or no one yet (`-r`). On `z` `d` `b` the hosted word is whom it
 * is said to, and stays `hosted`.
 */
function sayParty(frame: Frame, word: LexWord): void {
  if (frame.key !== "wordFamily:say" || frame.values.part !== "v") return;
  if (frame.hosted) {
    frame.party = frame.hosted;
    delete frame.hosted;
  } else if (word.ending === "m") frame.party = { kind: "speaker", word };
  else if (word.ending === "l") frame.values.source = "rules";
  else if (word.ending === "r") frame.values.source = "unsaid";
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
      here.reading.links.push(link("discourse", "hookJob:discourse", [word], discourseTo(word, here)));
      return;
    case "resume":
      here.reading.links.push(link("hookResume", "hookJob:resume", [word]));
      return;
    case "zone": {
      const frame = placeFrame("hookJob:zone", word, here);
      const inner: Frame[] = [];
      if (unit.zone) {
        const zone = unit.zone.word;
        // A holder on the stance names whose plan or view the event goes against (contrary-to.md#contrary-to-holder).
        if (zone.family.kind === "x" && zone.family.xFamily === "holder") inner.push(holderFrame(zone, here));
        else {
          const said = frameOf(wordKey(zone, unit.zone.closes), zone, here);
          sayParty(said, zone);
          inner.push(said);
        }
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
        content: [readIsland(unit.island, here)],
      });
      return;
    case "clauseCoord": {
      const coord = unit.coord;
      const members: Clause[] = [coord.first, ...coord.links.map((l) => l.clause)].filter((c): c is Clause => c !== undefined);
      const readings = members.map((member, i) => readClause(member, here.utterance, here.body, `${here.reading.id}/m${i}`, here.ctx));
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

/**
 * A scope island or a verb-list item: a nested reading of its chunk, with the frames of its own scope record; a stance
 * inside frames that chunk only (rule 2).
 */
function readIsland(clause: Clause, outer: Here, path = `i${firstAt(clause.units)}`): Reading {
  const reading = emptyReading(`${outer.reading.id}/${path}`, outer.utterance, outer.body, clause);
  copyScope(reading, outer.ctx.scopes.get(clause), outer.ctx.options.tables);
  const here: Here = { ...outer, reading };
  for (const coord of titledPhrases(clause.units)) here.ctx.titled.add(coord);
  readUnits(clause.units, here, clause);
  return reading;
}

function readDependent(clause: Clause, here: Here): Reading | undefined {
  const dependent = clause.dependent;
  if (!dependent) return undefined;
  let reading = here.ctx.dependents.get(dependent.clause);
  if (!reading) {
    reading = readClause(dependent.clause, here.utterance, here.body, `${here.reading.id}/d`, here.ctx);
    here.ctx.dependents.set(dependent.clause, reading);
  }
  return reading;
}

/** The `/th/` hinge-family keys a stack may join (`scope.ts`): the clause hinges and CAUSE. */
const STACK_TH = new Set(["overlay:clause_hinge:th", "overlay:cause:th"]);
/** The `/ɡ/` hinge-family keys a stack may join among a noun's details. */
const STACK_G = new Set(["overlay:clause_hinge:g"]);

/**
 * A stacked hinge, one word-shape rule: a `/th/` hinge-family word with no `/b/` of its own, right before a `/th/` hinge
 * that has one, shares that hinge's `/b/`: the same `hosted` term (one place, the first host's in coverage), and a
 * `grounds` link of its own where the `/b/` is the next sentence (`blarl` before a period). The pages state three
 * stacks: *only because* (because-and-iff.md#choosing-a-hinge, "`thebem` (the outcome needs it), then `thahum` with the
 * condition"), *even if* (because-and-iff.md#unless-and-even-if, "put the *although* hinge `thezem` right before
 * `thohem`"), and CAUSE with a hinge (cause.md#mechanism, "`thewom` right before the hinge, and the trigger in the
 * hinge's `/b/`"). The `/ɡ/` pair on a noun (`gebem gahum`, *depends on*) stacks the same way among the noun's details.
 */
function stackedHinge(reading: Reading): void {
  for (const lead of reading.frames) {
    if (!STACK_TH.has(lead.key) || lead.hosted || lead.words[0]?.at === undefined) continue;
    const after = lead.words[0].at + 1;
    const hinge = reading.frames.find((f) => STACK_TH.has(f.key) && f.words[0]?.at === after);
    if (!hinge?.hosted) continue;
    lead.hosted = hinge.hosted;
    for (const l of reading.links.filter((l) => l.kind === "grounds" && l.frame === hinge)) reading.links.push({ ...l, frame: lead });
  }
  for (const details of detailLists(reading)) stackedNounHinge(details);
}

/**
 * A binder reaches the sentence a stand-in in its reach points to (joins.md#everything-ua): each binder before a `blarl`
 * takes a `grounds` link of its own to that next sentence, where there is one, by the `grounds` row's `binder` cell
 * (interpreter.md#boundaries).
 */
function groundsBinders(reading: Reading): void {
  if (!crosses("grounds", "binder", "link")) return;
  const grounds = new Map(reading.links.filter((l) => l.kind === "grounds" && l.to).map((l) => [l.words[0], l]));
  for (const [word, l] of grounds) {
    for (const binder of reading.frames) {
      if (binder.family !== "binder" || (binder.words[0]?.at ?? Infinity) >= (word?.at ?? -Infinity)) continue;
      reading.links.push({ ...l, frame: binder });
    }
  }
}

/** The `/ɡ/` stack among one term's details: a hinge detail with no `/b/`, right before one that has one (no `blarl` on `/ɡ/`). */
function stackedNounHinge(details: Detail[]): void {
  for (const lead of details) {
    if (!STACK_G.has(lead.key) || lead.hosted || lead.words[0]?.at === undefined) continue;
    const after = lead.words[0].at + 1;
    const hinge = details.find((d) => STACK_G.has(d.key) && d.words[0]?.at === after);
    if (hinge?.hosted) lead.hosted = hinge.hosted;
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

function readClause(clause: Clause, utterance: number, body: number, id: ReadingId, ctx: Ctx): Reading {
  const reading = emptyReading(id, utterance, body, clause);
  copyScope(reading, ctx.scopes.get(clause), ctx.options.tables);
  const here: Here = { ctx, reading, utterance, body };
  for (const coord of titledPhrases(clause.units)) ctx.titled.add(coord);
  readUnits(clause.units, here, clause);
  stackedHinge(reading);
  groundsBinders(reading);
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
  if (left.hook) here.reading.links.push(link("discourse", "edge:hook", [left.hook], discourseTo(left.hook, here)));
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
  const goodbyeAt = new Set((info?.goodbyes ?? []).map((g) => `${g.utteranceIndex}.${g.bodyIndex}`));
  result.utterances.forEach((u, ui) => {
    const count = Math.max(u.bodies.length, 1);
    for (let bi = 0; bi < count; bi++) {
      ctx.sentences.push({ utterance: ui, body: bi, id: `${text}:${ui}.${bi}`, ...(goodbyeAt.has(`${ui}.${bi}`) ? { goodbye: true as const } : {}) });
    }
  });

  const out: Reading[] = [];
  const firstOf = new Map<number, Reading>();
  result.utterances.forEach((utterance, ui) => {
    const bodies = utterance.bodies.length ? utterance.bodies : [undefined];
    bodies.forEach((body, bi) => {
      const id = `${text}:${ui}.${bi}`;
      const reading = body ? readClause(body.clause, ui, bi, id, ctx) : emptyReading(id, ui, bi, { units: [] });
      const here: Here = { ctx, reading, utterance: ui, body: bi };
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
  pointBackLinks(out, info?.speakers, new Set(ctx.sentences.filter((s) => s.goodbye).map((s) => s.id)));
  // A tone on a word, a span or an island sits on what it colors (tone-marks.md#showing-your-tone); a rest-of-sentence tone
  // came in with the scope frames.
  if (info?.tones) placeTones(out, allReadings(out), info.tones);
  return out;
}

/** The vowel of a join word (an act word, a stand-in), or `a` for none: a turn with no act word states. */
function seriesOf(word: LexWord | undefined): string {
  return word?.family.kind === "joinMarker" ? word.family.series : "a";
}

/** An extra-noun hook's vowels, without its ending (`aol` → `ao`). */
function hookVowels(word: LexWord | undefined): string {
  return word?.family.kind === "hook" ? word.family.form.slice(0, -1) : "";
}

/**
 * The `to` of each link that points back past a period, once every sentence is read:
 *
 * - A stand-in on `-rth` stands for the most recent content of its vowel's kind (stand-in-vowels.md#stand-in-back:
 *   "the word stands for the most recent content of that kind"). The kinds are the act vowels: `a` a statement, `e` a
 *   question, `o` an instruction, `u` *not* / *lest* content. A content is an earlier sentence, by its act word (none
 *   states), or a dependent a stand-in of that vowel fills in it (`durl …`); the sentence ends after its dependents, so it
 *   is the more recent. With none, the link has no `to`.
 * - A point-back hook (`er`, `aor`) takes the landmark already in play (in-clause-hooks.md#hook-resume): the latest
 *   extra-noun hook in an earlier sentence, and for stacked vowels the latest with the same vowels ("the vowels keep the
 *   extra they named"). `to` is its sentence and `resumed` its detail, whose `hosted` is the landmark.
 * - Inside a quote, either one looks only within the quote (stand-in-vowels.md#stand-in-back,
 *   in-clause-hooks.md#hook-resume): the quote's own reading resolved it, and the outer sentences leave it as it is.
 * - A goodbye ends the conversation: either one after a goodbye never looks at the goodbye or anything before it, while
 *   one in the goodbye sentence still looks back (`goodbyes`, the sentences `ResolveInfo.goodbyes` names).
 * - A greeting claims nothing, so a sentence that only greets is no content for `-rth`, unless it answers a question
 *   (a bare name answering *who* also reads as a greeting) (stand-in-vowels.md#stand-in-back).
 */
function pointBackLinks(sentences: Reading[], speakers: readonly string[] = [], goodbyes: ReadonlySet<ReadingId> = new Set()): void {
  const byId = new Map(allReadings(sentences).map((r) => [r.id, r]));
  const contents = (sentence: Reading): { vowel: string; id: ReadingId }[] => {
    const act = sentence.frames.find((f) => f.key === "edge:force");
    const dependents = sentence.links
      .filter((l) => l.kind === "standIn" && l.to && byId.has(l.to))
      .sort((a, b) => (b.words[0]?.at ?? 0) - (a.words[0]?.at ?? 0))
      .map((l) => ({ vowel: seriesOf(l.words[0]), id: l.to! }));
    const greetsOnly = sentence.frames.some((f) => f.key === "reading:greeting") && !sentence.links.some((l) => l.kind === "answer");
    return [...(greetsOnly ? [] : [{ vowel: seriesOf(act?.words[0]), id: sentence.id }]), ...dependents];
  };
  const hooks = (sentence: Reading): Detail[] =>
    sentence.claim.details.filter((d) => d.key === "hookJob:extraNoun" && d.hosted).reverse();
  // Whether a slot looks past a speaker change is its discourse slot row (interpreter.md#discourse-slots). Who says each
  // sentence is the parse's `ResolveInfo.speakers`, one per top-level reading; with none, one speaker says them all.
  const speakerById = new Map(sentences.map((s, i) => [s.id, speakers[i] ?? ""]));
  const speakerOf = (sentence: Reading): string => speakerById.get(sentence.id) ?? "";
  // Where the slot's goodbye cell ends it, a point-back looks only at the sentences after the latest goodbye; one in the
  // goodbye sentence looks back as far as the goodbye before it, where its event-sentence cell keeps the value.
  // `earlier` runs latest first.
  const sinceGoodbye = (slot: SlotId, sentence: Reading, earlier: Reading[]): Reading[] => {
    if (!endsAt(slot, "goodbye")) return earlier;
    if (goodbyes.has(sentence.id) && !eventSentenceReads(slot, "goodbye")) return [];
    const at = earlier.findIndex((s) => goodbyes.has(s.id));
    return at < 0 ? earlier : earlier.slice(0, at);
  };
  const earlierFor = (slot: SlotId, sentence: Reading, earlier: Reading[]): Reading[] => {
    const open = sinceGoodbye(slot, sentence, earlier);
    return perSpeaker(slot) ? open.filter((s) => speakerOf(s) === speakerOf(sentence)) : open;
  };
  // A quote's words were read as their own text, which resolved its point-backs within the quote; where the slot's quote
  // cell blocks, the outer sentences do not resolve them again (interpreter.md#discourse-slots).
  const outside = (slot: SlotId, kinds: readonly NestedKind[]): boolean => reachesQuote(slot) || !kinds.includes("quote");
  sentences.forEach((sentence, i) => {
    const before = sentences.slice(0, i).reverse();
    const links = [{ reading: sentence, kinds: [] as NestedKind[] }, ...nestedOf(sentence)].flatMap(({ reading, kinds }) => reading.links.map((l) => ({ l, kinds })));
    for (const { l, kinds } of links) {
      if (l.kind === "standInBack" && outside("standInBack", kinds)) {
        const vowel = seriesOf(l.words[0]);
        const found = earlierFor("standInBack", sentence, before).flatMap(contents).find((c) => c.vowel === vowel);
        if (found) l.to = found.id;
        else delete l.to;
      }
      if (l.kind === "hookResume" && outside("hookResume", kinds)) {
        const vowels = hookVowels(l.words[0]);
        const all = earlierFor("hookResume", sentence, before).flatMap((s) => hooks(s).map((d) => ({ s, d })));
        const found = (vowels.length > 1 ? all.find(({ d }) => hookVowels(d.words[0]) === vowels) : undefined) ?? all[0];
        if (found) {
          l.to = found.s.id;
          l.resumed = found.d;
        }
      }
    }
  });
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
      const carried = link("carriedFrame", `carry:${carry.kind}`, words, {
        anchor: carry.offset ? "dated-channel.md#counting-from-now" : CARRY_ANCHOR[carry.kind],
        ...(source ? { to: source.id } : {}),
        ...(frame ? { frame } : {}),
        ...(coveredBy.length > 0 ? { coveredBy } : {}),
      });
      reading.links.push(carried);
      // A nested reading takes a link of its own only where every boundary it sits behind passes the carried frame by
      // link (interpreter.md#boundaries); otherwise the sentence's link covers it through the tree, or nothing does.
      for (const nested of nestedOf(reading)) if (nested.kinds.every((kind) => crosses(kind, "carried", "link"))) nested.reading.links.push({ ...carried });
    }
  }
}

/** A sentence's nested readings, each with the boundary kinds it sits behind (interpreter.md#boundaries). */
function nestedOf(sentence: Reading): { reading: Reading; kinds: NestedKind[] }[] {
  const all = allReadings([sentence]);
  const byId = new Map(all.map((r) => [r.id, r]));
  return all.slice(1).map((reading) => ({ reading, kinds: nestedKinds(reading, byId) }));
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
