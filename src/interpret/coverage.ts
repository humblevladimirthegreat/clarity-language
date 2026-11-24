/**
 * Word coverage (docs/meta/interpreter.md#reader-rules): every `LexWord` of a parsed sentence lands in exactly one
 * place in the readings: a frame's or detail's `words`, a term's word or head, a list's join, a link, or an `unread`
 * entry. {@link coverage} returns the words placed nowhere and the words placed more than once.
 *
 * Two kinds of place:
 * - **own places**: a frame, a detail, a term, a list's join. A word in two own places is `doubled`. A place inside
 *   another place that already holds the same word (a holder seam's `party` cut from its own word, a hooked join's
 *   `bound` detail on the join that closes its list) is the same place, not a second one. A term a frame or a
 *   detail hosts (a binder frame's list, a quote frame's quote) and that also fills a role is one place: it counts
 *   nested in the frame that keeps its word, and the role's copy of the same object is skipped.
 * - **pointer places**: a link and an `unread` entry. A link marks the word that carries it, and that word usually has
 *   an own place too (a pronoun's term and its `anaphor` link); an `unread` entry may annotate a frame (`unknown`).
 *   So a pointer place counts only for a word with no own place, and never doubles one.
 *
 * Words of a quote's own parse (a cite's or an aside's readings) are not words of this parse and are skipped.
 */
import type { LexWord, ParseResult } from "../parse/types.js";
import { classOf } from "./classes.js";
import { wordKey } from "./read-context.js";
import type { Detail, Frame, Reading, Term } from "./types.js";

/** Where a word sits in the parse tree: field names from the utterance down, indices dropped (`left.interjections`). */
export type WordSlot = { word: LexWord; slot: string; utterance: number };

/** `reading` is the reading the place sits in; `sentence` the top-level reading (one sentence body) it nests under. */
export type Placement = { reading: string; sentence: string; place: string; frame?: Frame };

export type Coverage = {
  /** Every word of the parse, in text order, with its tree slot. */
  words: WordSlot[];
  /** Words in no own place and no pointer place, less the exempt ones. */
  missing: WordSlot[];
  /** Words in more than one own place. */
  doubled: (WordSlot & { places: Placement[] })[];
  /** Words placed only by a pointer place (a link or `unread`): counted as placed. */
  pointerOnly: WordSlot[];
  /** Words with no place that {@link EXEMPT} lets go. */
  exempt: (WordSlot & { key: string })[];
};

/**
 * Classification keys whose word legitimately has no place of its own (`structure` rows whose meaning is carried
 * elsewhere). Exempt by key, never by spelling. Empty today: every `structure` word key the reader meets fills a term
 * or a list join, so it has a place (interpreter.md#classification-table).
 */
export const EXEMPT: ReadonlySet<string> = new Set<string>([]);

function isWord(value: unknown): value is LexWord {
  return typeof value === "object" && value !== null && typeof (value as LexWord).raw === "string" && "family" in value && "reading" in value;
}

/** Every `LexWord` in the utterances, once each, with the first tree slot it sits in. */
export function parseWords(result: ParseResult): WordSlot[] {
  const seen = new Map<LexWord, WordSlot>();
  const walk = (value: unknown, path: string, utterance: number): void => {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item, path, utterance);
      return;
    }
    if (isWord(value)) {
      if (!seen.has(value)) seen.set(value, { word: value, slot: path, utterance });
      return;
    }
    for (const [name, child] of Object.entries(value)) walk(child, path ? `${path}.${name}` : name, utterance);
  };
  result.utterances.forEach((utterance, i) => walk(utterance, "", i));
  return [...seen.values()].sort((a, b) => (a.word.at ?? 0) - (b.word.at ?? 0));
}

type Hit = { own: Placement[]; pointer: Placement[] };

/** Every place each word lands in the readings, and the frame pairs the readings order by word shape. */
export function placements(readings: Reading[]): { hits: Map<LexWord, Hit>; wordShape: Map<Frame, Set<Frame>> } {
  const hits = new Map<LexWord, Hit>();
  const wordShape = new Map<Frame, Set<Frame>>();
  let sentence = "";
  const hit = (word: LexWord | undefined, reading: Reading, place: string, held: Set<LexWord>, pointer = false, frame?: Frame): void => {
    if (!word || (!pointer && held.has(word))) return;
    const row = hits.get(word) ?? { own: [], pointer: [] };
    (pointer ? row.pointer : row.own).push({ reading: reading.id, sentence, place, ...(frame ? { frame } : {}) });
    hits.set(word, row);
  };
  const pair = (a: Frame, b: Frame): void => {
    wordShape.set(a, (wordShape.get(a) ?? new Set()).add(b));
    wordShape.set(b, (wordShape.get(b) ?? new Set()).add(a));
  };
  /** Words of an enclosing place, so a nested place on the same word is not a second place. */
  const within = (held: Set<LexWord>, words: (LexWord | undefined)[]): Set<LexWord> => new Set([...held, ...words.filter((w): w is LexWord => !!w)]);
  const path = new Set<Reading>();
  /** Terms a reading's frames or claim details host: met elsewhere (a role), the same object is not a second place. */
  let hostedHere = new Set<Term>();
  const hostedSeen = new Set<Term>();
  const hostedBy = (r: Reading): Set<Term> => {
    const out = new Set<Term>();
    const fromFrame = (f: Frame): void => {
      if (f.hosted) out.add(f.hosted);
      f.inner?.forEach(fromFrame);
    };
    r.frames.forEach(fromFrame);
    for (const d of r.claim.details) if (d.hosted) out.add(d.hosted);
    return out;
  };

  const frame = (f: Frame, r: Reading, held: Set<LexWord>): void => {
    for (const w of f.words) hit(w, r, `frame:${f.key}`, held, false, f);
    const inside = within(held, f.words);
    term(f.party, r, inside);
    term(f.hosted, r, inside, true);
    for (const i of f.inner ?? []) frame(i, r, inside);
    for (const d of f.details ?? []) detail(d, r, inside);
    for (const c of f.content ?? []) reading(c);
  };
  const detail = (d: Detail, r: Reading, held: Set<LexWord>): void => {
    for (const w of d.words) hit(w, r, `detail:${d.kind}`, held);
    const inside = within(held, d.words);
    // Frames first: a binder under the hook's frame word keeps the landmark's head and hosts its term, so it is the
    // first host and the detail's copy of the same term is skipped.
    for (const f of d.frames ?? []) frame(f, r, inside);
    term(d.hosted, r, inside, true);
    for (const x of d.details ?? []) detail(x, r, inside);
    for (const c of d.content ?? []) reading(c);
  };
  const term = (t: Term | undefined, r: Reading, held: Set<LexWord>, hosted = false): void => {
    if (!t || (!hosted && hostedHere.has(t))) return;
    // Two hosts of one term (a binder frame and the hook whose landmark the list is): the first host holds it.
    if (hosted) {
      if (hostedSeen.has(t)) return;
      hostedSeen.add(t);
    }
    switch (t.kind) {
      case "thing": {
        hit(t.head, r, "term:thing", held);
        const inside = within(held, [t.head]);
        for (const d of t.details) detail(d, r, inside);
        for (const f of t.frames ?? []) frame(f, r, inside);
        return;
      }
      case "clause":
        reading(t.reading);
        return;
      case "list": {
        // The closing join and each part's join are one list's joins: one place each.
        const joins = [...new Set([t.join, ...t.parts.map((p) => p.join)].filter((w): w is LexWord => !!w))];
        for (const j of joins) hit(j, r, "list:join", held);
        const inside = within(held, joins);
        for (const m of t.members) term(m, r, inside);
        for (const f of t.frames ?? []) frame(f, r, inside);
        if (t.bound) detail(t.bound, r, inside);
        for (const d of t.sharedDetails ?? []) detail(d, r, inside);
        return;
      }
      case "quote":
        // The readings belong to the quote's own parse.
        hit(t.word, r, "term:quote", held);
        for (const f of t.frames ?? []) frame(f, r, within(held, [t.word]));
        return;
      default: {
        // A pronoun's antecedent is a pointer into another place, never a place of its own.
        hit(t.word, r, `term:${t.kind}`, held);
        const inside = within(held, [t.word]);
        for (const d of t.details ?? []) detail(d, r, inside);
        for (const f of t.frames ?? []) frame(f, r, inside);
      }
    }
  };
  const reading = (r: Reading): void => {
    if (path.has(r)) return;
    path.add(r);
    const outer = hostedHere;
    hostedHere = hostedBy(r);
    const none = new Set<LexWord>();
    for (const o of r.order) if (o.kind === "wordShape") pair(o.over, o.under);
    for (const f of r.frames) frame(f, r, none);
    // A stance list's members are pointers to frames above (or to an earlier list); its own place is the join word.
    for (const l of r.stanceLists ?? []) {
      hit(l.join, r, "stanceList:join", none);
      const inside = within(none, [l.join]);
      for (const f of l.inner ?? []) frame(f, r, inside);
      for (const d of l.details ?? []) detail(d, r, inside);
    }
    const claim = r.claim;
    term(claim.verb, r, none);
    for (const role of ["z", "d", "b"] as const) term(claim.roles[role], r, none);
    for (const p of claim.predicate) term(p, r, none);
    for (const d of claim.details) detail(d, r, none);
    term(claim.clauses, r, none);
    for (const l of r.links) for (const w of l.words) hit(w, r, `link:${l.kind}`, none, true);
    for (const u of r.unread) hit(u.word, r, `unread:${u.reason}`, none, true);
    path.delete(r);
    hostedHere = outer;
  };
  for (const r of readings) {
    sentence = r.id;
    reading(r);
  }
  return { hits, wordShape };
}

/**
 * The own places of one word that are distinct places in one sentence. Two frames the reading orders by word shape
 * (a holder seam and the stance it sits on, interpreter.md#pair-table) are one word's fixed slots: one place.
 */
function distinct(places: Placement[], wordShape: Map<Frame, Set<Frame>>): Placement[] {
  const out: Placement[] = [];
  for (const place of places) {
    const same = out.some((o) => place.frame && o.frame && wordShape.get(o.frame)?.has(place.frame));
    if (!same) out.push(place);
  }
  return out;
}

/** Words placed nowhere and words placed more than once (see the module comment). */
export function coverage(result: ParseResult, readings: Reading[]): Coverage {
  const words = parseWords(result);
  const { hits, wordShape } = placements(readings);
  const out: Coverage = { words, missing: [], doubled: [], pointerOnly: [], exempt: [] };
  for (const entry of words) {
    const row = hits.get(entry.word);
    // Per sentence: a turn's left-edge word frames each sentence body of its turn, once in each.
    const bySentence = new Map<string, Placement[]>();
    for (const place of row?.own ?? []) bySentence.set(place.sentence, [...(bySentence.get(place.sentence) ?? []), place]);
    const doubled = [...bySentence.values()].map((places) => distinct(places, wordShape)).filter((places) => places.length > 1);
    if (doubled.length) out.doubled.push({ ...entry, places: doubled.flat() });
    if (row?.own.length) continue;
    if (row?.pointer.length) {
      out.pointerOnly.push(entry);
      continue;
    }
    const key = wordKey(entry.word);
    if (EXEMPT.has(key) && classOf(key)?.cls === "structure") out.exempt.push({ ...entry, key });
    else out.missing.push(entry);
  }
  return out;
}
