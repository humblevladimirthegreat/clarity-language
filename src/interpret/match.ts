/**
 * The matcher (docs/meta/interpreter.md, the matcher in the interpreter plan): does a query claim fit a target claim,
 * and under which frames does the target sit.
 *
 * It compares readings only; it never walks the parse tree, never decides that a framed claim holds (the host's verdict
 * does), and never picks an order for an unsettled pair (it travels with the match).
 *
 * - Verb by root; roles by letter, never by word order; a role the query leaves out matches anything.
 * - Terms by the host's referent when both resolve; otherwise by root, the query's details a subset of the target's. A
 *   pronoun matches through its antecedent. A literal matches by exact payload. Numbers stay stems (reader rule 7).
 * - A blank in the query binds to the target's term in that place.
 * - Widening and inference are switches, off by default ({@link Switch}); they land with values (unit M2).
 */
import type { LexWord } from "../parse/types.js";
import type { Claim, Detail, Frame, Link, Reading, StanceList, Term } from "./types.js";

// ── Switches ────────────────────────────────────────────────────────────────

/**
 * A way to match beyond the claim as said, off by default: `widen`, a compound to its head; `infer`, membership in a
 * stated list, and a universal to an instance (closed `zual` only). Every match found through one names it in
 * {@link Binding.switches}. Not implemented yet: turning one on throws.
 */
export type Switch = "widen" | "infer";

/** Where a term sits, for the host's referent: the reading it is in. */
export type TermSite = { reading?: Reading };

export type MatchOptions = {
  /** The host's referent for a term (a person, an object in its world); undefined when it cannot resolve the term. */
  referent?: (term: Term, side: "query" | "target", site: TermSite) => string | undefined;
  querySite?: TermSite;
  targetSite?: TermSite;
  /**
   * The pronoun terms of the readings, by word ({@link readingTree} fills it). The reader's antecedent of a pronoun that
   * resumes another pronoun is a term of that pronoun's word; this follows it on to its own antecedent.
   */
  pronouns?: ReadonlyMap<LexWord, Term>;
  switches?: Partial<Record<Switch, boolean>>;
};

/** One blank in the query and the target term it binds to. `at` names the place: `verb`, `z`, `d`, `b`, `predicate.<i>`, nested with `/`. */
export type BlankBinding = { at: string; blank: Term; term: Term };

export type Binding = {
  blanks: BlankBinding[];
  /** The switches the match went through; empty for a match on the claim as said. */
  switches: Switch[];
};

// ── Terms ───────────────────────────────────────────────────────────────────

/** Follow a pronoun to the term it resumes, through a chain of pronouns (reader rule 6: the resolver's binding, never re-derived). */
export function throughAntecedent(term: Term, pronouns?: ReadonlyMap<LexWord, Term>): Term {
  let out = term;
  for (let i = 0; i < 32; i++) {
    if (out.kind === "pronoun" && out.antecedent) out = out.antecedent;
    else if (out.kind === "thing" && pronouns?.get(out.head)?.kind === "pronoun") out = pronouns.get(out.head)!;
    else break;
  }
  return out;
}

type State = { options: MatchOptions; blanks: BlankBinding[] };

const raws = (words: readonly { raw: string }[]): string => words.map((w) => w.raw).join(" ");

function termDetails(term: Term): Detail[] {
  return "details" in term && term.details ? term.details : [];
}

function detailMatch(query: Detail, target: Detail, state: State, at: string): boolean {
  if (query.key !== target.key || raws(query.words) !== raws(target.words)) return false;
  if (query.hosted && !(target.hosted && termMatch(query.hosted, target.hosted, state, `${at}/hosted`))) return false;
  return detailsSubset(query.details ?? [], target.details ?? [], state, at);
}

/** Every query detail has a matching target detail. */
function detailsSubset(query: readonly Detail[], target: readonly Detail[], state: State, at: string): boolean {
  return query.every((q, i) => target.some((t) => tryIn(state, () => detailMatch(q, t, state, `${at}/detail.${i}`))));
}

/** Run a test; on failure, drop the blanks it bound. */
function tryIn(state: State, test: () => boolean): boolean {
  const mark = state.blanks.length;
  if (test()) return true;
  state.blanks.length = mark;
  return false;
}

function termMatch(queryTerm: Term, targetTerm: Term, state: State, at: string): boolean {
  if (queryTerm.kind === "blank") {
    state.blanks.push({ at, blank: queryTerm, term: targetTerm });
    return true;
  }
  const query = throughAntecedent(queryTerm, state.options.pronouns);
  const target = throughAntecedent(targetTerm, state.options.pronouns);
  const { referent, querySite = {}, targetSite = {} } = state.options;
  if (referent) {
    const q = referent(query, "query", querySite);
    const t = referent(target, "target", targetSite);
    if (q !== undefined && t !== undefined) return q === t && detailsSubset(termDetails(query), termDetails(target), state, at);
  }
  if (!structural(query, target, state, at)) return false;
  return detailsSubset(termDetails(query), termDetails(target), state, at);
}

function structural(query: Term, target: Term, state: State, at: string): boolean {
  switch (query.kind) {
    case "thing":
      return target.kind === "thing" && target.root === query.root && target.named === query.named;
    case "speaker":
    case "listener":
      return target.kind === query.kind;
    case "pronoun":
      // An unbound pronoun has no antecedent to match through.
      return false;
    case "literal":
      return target.kind === "literal" && target.payload === query.payload;
    case "number":
      // Numbers stay stems until phase 4 adds values (reader rule 7).
      return target.kind === "number" && target.word.raw === query.word.raw;
    case "list":
      return (
        target.kind === "list" &&
        target.values.series === query.values.series &&
        target.members.length === query.members.length &&
        query.members.every((m, i) => termMatch(m, target.members[i]!, state, `${at}/${i}`))
      );
    case "clause":
      return target.kind === "clause" && claimMatch(query.reading.claim, target.reading.claim, state, at);
    case "quote":
      return target.kind === "quote" && target.word.raw === query.word.raw;
    case "blank":
      return true;
  }
}

function claimMatch(query: Claim, target: Claim, state: State, at: string): boolean {
  const prefix = at ? `${at}/` : "";
  if (query.verb && !(target.verb && termMatch(query.verb, target.verb, state, `${prefix}verb`))) return false;
  for (const [letter, term] of Object.entries(query.roles) as [keyof Claim["roles"], Term][]) {
    const other = target.roles[letter];
    if (!other || !termMatch(term, other, state, `${prefix}${letter}`)) return false;
  }
  const predicateOk = query.predicate.every((term, i) =>
    target.predicate.some((other) => tryIn(state, () => termMatch(term, other, state, `${prefix}predicate.${i}`))),
  );
  if (!predicateOk) return false;
  if (query.clauses && !(target.clauses && termMatch(query.clauses, target.clauses, state, `${prefix}clauses`))) return false;
  return detailsSubset(query.details, target.details, state, `${prefix}claim`);
}

/** Does the query claim fit the target claim? The blanks it binds, or undefined. */
export function match(query: Claim, target: Claim, options: MatchOptions = {}): Binding | undefined {
  for (const [name, on] of Object.entries(options.switches ?? {})) {
    if (on) throw new Error(`match: the ${name} switch is not implemented yet (unit M2)`);
  }
  const state: State = { options, blanks: [] };
  return claimMatch(query, target, state, "") ? { blanks: state.blanks, switches: [] } : undefined;
}

// ── Where readings sit ──────────────────────────────────────────────────────

/** What holds a nested reading inside its parent: the frame, detail or term it hangs from. */
export type Via = { frame?: Frame; detail?: Detail; term?: Term };

export type Parent = { reading: Reading; via: Via };

/**
 * Every reading under the given ones, nested ones included, in text order (depth first), each with the reading that
 * contains it. Walks the readings, never the parse tree. `pronouns`, when given, collects every pronoun term by word.
 */
export function readingTree(readings: readonly Reading[], pronouns?: Map<LexWord, Term>): Map<Reading, Parent | undefined> {
  const out = new Map<Reading, Parent | undefined>();
  const visit = (reading: Reading, parent: Parent | undefined): void => {
    if (out.has(reading)) return;
    out.set(reading, parent);
    const inFrame = (frame: Frame, via: Via): void => {
      frame.content?.forEach((r) => visit(r, { reading, via }));
      if (frame.hosted) inTerm(frame.hosted, via);
      if (frame.party) inTerm(frame.party, via);
      frame.inner?.forEach((f) => inFrame(f, via));
      frame.details?.forEach((d) => inDetail(d, via));
    };
    const inDetail = (detail: Detail, via: Via): void => {
      detail.content?.forEach((r) => visit(r, { reading, via }));
      if (detail.hosted) inTerm(detail.hosted, via);
      detail.details?.forEach((d) => inDetail(d, via));
      detail.frames?.forEach((f) => inFrame(f, via));
    };
    const inTerm = (term: Term, via: Via): void => {
      if (term.kind === "clause") visit(term.reading, { reading, via });
      if (term.kind === "quote") term.readings.forEach((r) => visit(r, { reading, via }));
      if (term.kind === "pronoun") pronouns?.set(term.word, term); // its antecedent sits where it was said
      if (term.kind === "list") {
        term.members.forEach((m) => inTerm(m, via));
        term.sharedDetails?.forEach((d) => inDetail(d, via));
        if (term.bound) inDetail(term.bound, via);
      }
      termDetails(term).forEach((d) => inDetail(d, via));
      ("frames" in term ? (term.frames ?? []) : []).forEach((f) => inFrame(f, via));
    };
    for (const frame of reading.frames) inFrame(frame, { frame });
    for (const list of reading.stanceLists ?? []) list.inner?.forEach((f) => inFrame(f, { frame: f }));
    const claim = reading.claim;
    for (const term of [claim.verb, ...Object.values(claim.roles), ...claim.predicate, claim.clauses]) {
      if (term) inTerm(term, { term });
    }
    for (const detail of claim.details) inDetail(detail, { detail });
  };
  readings.forEach((r) => visit(r, undefined));
  return out;
}

// ── Frame paths ─────────────────────────────────────────────────────────────

/**
 * What a stance list says of one frame it holds (verb-and-stance-joins.md#stance-joins; set-joins.md and rank-joins.md
 * for what each series means):
 * - `denied`: a `u` join (*not because of the rain*); with `whole`, the frame sits in an inner list the join denies as a
 *   whole (*not both*, set-joins.md#exclusivity-and-denying-a-whole-list).
 * - `excluded`: `ua` *every ground but these*, `ue` *any ground but these* (rank-joins.md#invert-u-stacks).
 * - `ranked`: `o`, first is the main one; `uo`, last first (rank-joins.md#invert-u-stacks). `rank` 1 is the main one.
 * - `inOrder`: `ao`, in the order the grounds arose; `rank` is that order (rank-joins.md#route-ao).
 * - `equal`: `oe`, equal weight (rank-joins.md#rank-joins).
 * - `listed`: any other series (`a`, `ae`, `e`, …): one of the list, nothing more.
 */
export type ListStanding = {
  list: StanceList;
  series: string;
  standing: "denied" | "excluded" | "ranked" | "inOrder" | "equal" | "listed";
  rank?: number;
  /** The frame sits in an earlier list that this list holds as one member. */
  whole?: true;
};

/** One frame on a path. */
export type PathFrame = {
  frame: Frame;
  /** The reading it sits on (own) or is carried onto (carried). */
  reading: Reading;
  how: "own" | "carried";
  /** carried: the `carriedFrame` link. */
  link?: Link;
  /** carried: the reading's own frames that sit over it (the link's `coveredBy`, evidentiality.md#carry-forward). */
  coveredBy?: Frame[];
  /** The stance lists that hold it, innermost first. */
  lists: ListStanding[];
};

export type FramePath = {
  /** The matched reading and every reading that contains it, outermost first; the matched reading is last. */
  readings: Reading[];
  /** How each reading after the first hangs in the one before it. */
  via: Via[];
  /**
   * The frames, outermost reading first. Within one reading: its own frames that a carried frame sits under, then the
   * carried frames, then its other frames in text order. Text order is not scope: the scope is each reading's `order`.
   */
  frames: PathFrame[];
  /** The stance lists on those readings, in text order. */
  stanceLists: StanceList[];
  /** Pairs no rule orders, from every reading on the path; a match with any is not to be filed under an order. */
  unsettled: [Frame, Frame][];
};

function frameMembers(list: StanceList): Frame[] {
  return list.members.flatMap((m) => ("kind" in m && m.kind === "stanceList" ? frameMembers(m) : [m as Frame]));
}

function standingOf(series: string, index: number, size: number): Pick<ListStanding, "standing" | "rank"> {
  switch (series) {
    case "u":
      return { standing: "denied" };
    case "ua":
    case "ue":
      return { standing: "excluded" };
    case "o":
      return { standing: "ranked", rank: index + 1 };
    case "uo":
      return { standing: "ranked", rank: size - index };
    case "ao":
      return { standing: "inOrder", rank: index + 1 };
    case "oe":
      return { standing: "equal" };
    default:
      return { standing: "listed" };
  }
}

/** For each frame a reading's stance lists hold, what they say of it, innermost list first. */
export function listStandings(reading: Reading): Map<Frame, ListStanding[]> {
  const out = new Map<Frame, ListStanding[]>();
  for (const list of reading.stanceLists ?? []) {
    const series = list.values.series ?? "";
    list.members.forEach((member, index) => {
      const nested = "kind" in member && member.kind === "stanceList";
      const frames = nested ? frameMembers(member) : [member as Frame];
      const standing: ListStanding = { list, series, ...standingOf(series, index, list.members.length), ...(nested ? { whole: true as const } : {}) };
      for (const frame of frames) out.set(frame, [...(out.get(frame) ?? []), standing]);
    });
  }
  return out;
}

/** A frame a stance list denies or excludes, directly or as part of a list it denies: the target does not carry it. */
export function negated(frame: PathFrame): boolean {
  return frame.lists.some((l) => l.standing === "denied" || l.standing === "excluded");
}

function readingFrames(reading: Reading): PathFrame[] {
  const standings = listStandings(reading);
  const carried = reading.links.filter((l) => l.kind === "carriedFrame" && l.frame);
  const covering = new Set(carried.flatMap((l) => l.coveredBy ?? []));
  const own = (frame: Frame): PathFrame => ({ frame, reading, how: "own", lists: standings.get(frame) ?? [] });
  return [
    ...reading.frames.filter((f) => covering.has(f)).map(own),
    ...carried.map(
      (link): PathFrame => ({ frame: link.frame!, reading, how: "carried", link, ...(link.coveredBy ? { coveredBy: link.coveredBy } : {}), lists: [] }),
    ),
    ...reading.frames.filter((f) => !covering.has(f)).map(own),
  ];
}

/** The frame path of a reading: its frames and those of every reading that contains it (`tree` from {@link readingTree}). */
export function framePath(reading: Reading, tree: Map<Reading, Parent | undefined>): FramePath {
  const readings: Reading[] = [];
  const via: Via[] = [];
  for (let at: Reading | undefined = reading; at; ) {
    readings.unshift(at);
    const parent = tree.get(at);
    if (parent) via.unshift(parent.via);
    at = parent?.reading;
  }
  return {
    readings,
    via,
    frames: readings.flatMap(readingFrames),
    stanceLists: readings.flatMap((r) => r.stanceLists ?? []),
    unsettled: readings.flatMap((r) => r.unordered),
  };
}
