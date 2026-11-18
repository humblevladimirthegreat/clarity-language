/**
 * The matcher (docs/meta/interpreter.md, the matcher in the interpreter plan): does a query claim fit a target claim,
 * and under which frames does the target sit.
 *
 * It compares readings only; it never walks the parse tree, never decides that a framed claim holds (the host's verdict
 * does), and never picks an order for an unsettled pair (it travels with the match).
 *
 * - Verb by root; roles by letter, never by word order; a role the query leaves out matches anything.
 * - Terms by the host's referent when both resolve; otherwise by root, the query's details a subset of the target's. A
 *   pronoun matches through its antecedent. A literal matches by exact payload. A number matches by its value
 *   (`value.ts`), so the written and the spoken form of one number match.
 * - A blank in the query binds to the target's term in that place.
 * - Widening and inference are switches, off by default ({@link Switch}); every match found through one names it.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { Claim, Detail, Frame, Link, Reading, StanceList, Term } from "./types.js";
import { detailNumber, sameNumberWord, samePayload, termNumber } from "./value.js";

// ── Switches ────────────────────────────────────────────────────────────────

/**
 * A way to match beyond the claim as said, off by default. Every match found through one names it in
 * {@link Binding.switches}.
 * - `widen`: a compound in the target matches on its head, the last root (compounds.md#two-roots-one-word): a query
 *   about a bell finds a doorbell. Dictionary compounds take their head from the lexicon's compound rows
 *   ({@link MatchOptions.lexicon}); a compound whose right part is a tail suffix or a hook has no root head.
 * - `infer`: membership in a stated list, and a universal to an instance.
 *   - Membership: a query term matches one member of a target `a` (*and*) list (joins.md, set-joins.md). Only where the
 *     claim says who goes with what: the target claim has that one list, or its lists are paired by *respectively*
 *     (list-structure.md#respectively), and then every paired list gives the member at the same place. Two unpaired
 *     lists do not say who goes with what (list-structure.md#respectively), so they infer nothing.
 *   - Universal to instance, closed `zual` + kind only: *every K* with no exceptions holds of each K in the situation
 *     (universals-domains.md#universals-domains-generics). Open `zuam` leaves exceptions open, and `zual` without a
 *     kind or with leftovers is not *every K*, so neither infers.
 *   Neither holds with a collective verb (`-x`): the members act together, not one by one
 *   (universals-domains.md#universals-domains-generics), nor with a list frame (a `u` join denies its items).
 */
export type Switch = "widen" | "infer";

const SWITCH_ORDER: Switch[] = ["widen", "infer"];

/** Where a term sits, for the host's referent: the reading it is in. */
export type TermSite = { reading?: Reading };

export type MatchOptions = {
  /** The host's referent for a term (a person, an object in its world); undefined when it cannot resolve the term. */
  referent?: (term: Term, side: "query" | "target", site: TermSite) => string | undefined;
  querySite?: TermSite;
  targetSite?: TermSite;
  switches?: Partial<Record<Switch, boolean>>;
  /** The parser's lexicon tables: `widen` reads dictionary compound heads from them. Required when `widen` is on. */
  lexicon?: Pick<ClassifyTables, "compounds" | "published">;
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
export function throughAntecedent(term: Term): Term {
  let out = term;
  for (let i = 0; i < 32 && out.kind === "pronoun" && out.antecedent; i++) out = out.antecedent;
  return out;
}

type ListTerm = Extract<Term, { kind: "list" }>;

type State = {
  options: MatchOptions;
  blanks: BlankBinding[];
  switches: Switch[];
  /** Target lists whose members a query term may match (`infer`), each with its pairing group, if any. */
  memberLists: Map<Term, object | undefined>;
  /** Pairing group → the member place chosen in it. */
  pairChoice: Map<object, number>;
  undo: (() => void)[];
  /** The target claim's verb is not collective: a closed `zual` + kind may stand for an instance. */
  inUniversal: boolean;
};

const raws = (words: readonly { raw: string }[]): string => words.map((w) => w.raw).join(" ");

function termDetails(term: Term): Detail[] {
  return "details" in term && term.details ? term.details : [];
}

function sameDetailWords(query: Detail, target: Detail): boolean {
  const q = detailNumber(query);
  const t = detailNumber(target);
  if (q && t) return sameNumberWord(q, t);
  return raws(query.words) === raws(target.words);
}

function detailMatch(query: Detail, target: Detail, state: State, at: string): boolean {
  if (query.key !== target.key || !sameDetailWords(query, target)) return false;
  if (query.hosted && !(target.hosted && termMatch(query.hosted, target.hosted, state, `${at}/hosted`))) return false;
  return detailsSubset(query.details ?? [], target.details ?? [], state, at);
}

/** Every query detail has a matching target detail. */
function detailsSubset(query: readonly Detail[], target: readonly Detail[], state: State, at: string): boolean {
  return query.every((q, i) => target.some((t) => tryIn(state, () => detailMatch(q, t, state, `${at}/detail.${i}`))));
}

/** Run a test; on failure, drop the blanks it bound, the switches it went through, and the choices it made. */
function tryIn(state: State, test: () => boolean): boolean {
  const marks = [state.blanks.length, state.switches.length, state.undo.length] as const;
  if (test()) return true;
  state.blanks.length = marks[0];
  state.switches.length = marks[1];
  while (state.undo.length > marks[2]) state.undo.pop()!();
  return false;
}

function switchOn(state: State, name: Switch): boolean {
  return state.options.switches?.[name] === true;
}

function termMatch(queryTerm: Term, targetTerm: Term, state: State, at: string): boolean {
  if (queryTerm.kind === "blank") {
    state.blanks.push({ at, blank: queryTerm, term: targetTerm });
    return true;
  }
  const query = throughAntecedent(queryTerm);
  const target = throughAntecedent(targetTerm);
  const { referent, querySite = {}, targetSite = {} } = state.options;
  if (referent) {
    const q = referent(query, "query", querySite);
    const t = referent(target, "target", targetSite);
    if (q !== undefined && t !== undefined) return q === t && detailsSubset(termDetails(query), termDetails(target), state, at);
  }
  if (tryIn(state, () => structural(query, target, state, at) && detailsSubset(termDetails(query), termDetails(target), state, at))) return true;
  if (switchOn(state, "widen") && tryIn(state, () => widened(query, target, state, at))) return true;
  if (switchOn(state, "infer") && tryIn(state, () => inferred(query, target, state, at))) return true;
  return false;
}

function structural(query: Term, target: Term, state: State, at: string): boolean {
  switch (query.kind) {
    case "thing": {
      const q = termNumber(query);
      const t = termNumber(target);
      if (q || t) return q !== undefined && t !== undefined && sameNumberWord(q, t);
      return target.kind === "thing" && target.root === query.root && target.named === query.named;
    }
    case "speaker":
    case "listener":
      return target.kind === query.kind;
    case "pronoun":
      // An unbound pronoun has no antecedent to match through.
      return false;
    case "literal":
      return samePayload(query, target);
    case "number": {
      const t = termNumber(target);
      return t !== undefined && sameNumberWord(query.word, t);
    }
    case "list":
      return (
        target.kind === "list" &&
        target.values.series === query.values.series &&
        target.members.length === query.members.length &&
        query.members.every((m, i) => termMatch(m, target.members[i]!, state, `${at}/${i}`))
      );
    case "clause":
      return target.kind === "clause" && claimMatch(query.reading.claim, target.reading.claim, state, at, target.reading);
    case "quote":
      return target.kind === "quote" && target.word.raw === query.word.raw;
    case "blank":
      return true;
  }
}

// ── Widening ────────────────────────────────────────────────────────────────

/** The heads of a compound term, nearest first: an `x` compound's last root, then a dictionary compound's right root, in turn. */
function compoundHeads(term: Term, lexicon: NonNullable<MatchOptions["lexicon"]>): string[] {
  if (term.kind !== "thing" || term.named) return [];
  const out: string[] = [];
  const family = term.head.family;
  let root: string | undefined = family.kind === "x" && family.xFamily === "compound" ? family.rightRoots?.at(-1) : term.root;
  if (root !== undefined && root !== term.root) out.push(root);
  for (let i = 0; root !== undefined && i < 8; i++) {
    const row = lexicon.compounds.get(root);
    // Only a root on the right is a head: a tail suffix (empty join) or a hook is not a thing of its own.
    root = row && row.join !== "" && lexicon.published.has(row.right) ? row.right : undefined;
    if (root !== undefined) out.push(root);
  }
  return out;
}

function widened(query: Term, target: Term, state: State, at: string): boolean {
  const lexicon = state.options.lexicon;
  if (!lexicon) throw new Error("match: the widen switch needs options.lexicon (the parser's tables)");
  if (target.kind !== "thing") return false;
  return compoundHeads(target, lexicon).some((root) =>
    tryIn(state, () => {
      if (!(structural(query, { ...target, root }, state, at) && detailsSubset(termDetails(query), target.details, state, at))) return false;
      state.switches.push("widen");
      return true;
    }),
  );
}

// ── Inference ───────────────────────────────────────────────────────────────

/** A list a member may stand for: an `a` (*and*) list, flat, with members, no list frame and no bound. */
function memberList(term: Term): term is ListTerm {
  return term.kind === "list" && term.values.series === "a" && term.members.length > 0 && term.parts.length === 1 && !term.frames?.length && !term.bound;
}

/** A collective verb (`-x`): the members act together (universals-domains.md#universals-domains-generics, collectives.md). */
function collective(claim: Claim): boolean {
  return claim.verb?.kind === "thing" && claim.verb.head.plural === true;
}

/**
 * The target lists whose members a query term may match in this claim (see {@link Switch}): the one list of the claim,
 * or the lists a *respectively* link pairs, each with its pairing group.
 */
function claimMemberLists(target: Claim, reading: Reading | undefined): Map<Term, object | undefined> {
  const out = new Map<Term, object | undefined>();
  if (collective(target)) return out;
  const terms = [...Object.values(target.roles), ...target.predicate].filter((t): t is Term => t !== undefined);
  const lists = terms.filter((t): t is ListTerm => t.kind === "list");
  for (const link of reading?.links ?? []) {
    if (link.kind !== "pairing" || !link.partners?.length) continue;
    const own = lists.find((l) => l.join !== undefined && link.words.includes(l.join));
    const group = [own, ...link.partners].filter((t): t is ListTerm => t !== undefined && lists.includes(t as ListTerm));
    const size = group[0]?.members.length ?? 0;
    if (group.length < 2 || !group.every((l) => memberList(l) && l.members.length === size)) continue;
    const id = {};
    for (const l of group) out.set(l, id);
  }
  if (out.size === 0 && lists.length === 1 && memberList(lists[0]!)) out.set(lists[0]!, undefined);
  return out;
}

/** A list member as it stands in the claim: its own details and the SHARED ones after the join (list-structure.md#shared-after-the-join). */
function asMember(member: Term, list: ListTerm): Term {
  const shared = list.sharedDetails ?? [];
  if (!shared.length || !("details" in member)) return member;
  return { ...member, details: [...(member.details ?? []), ...shared] } as Term;
}

/** Closed `zual` + kind, no leftovers (universals-domains.md#universals-domains-generics): the instance it stands for. */
function universalInstance(target: Term): Term | undefined {
  if (target.kind !== "list" || target.values.series !== "ua" || target.values.ending !== "l") return undefined;
  if (target.members.length || target.frames?.length || target.bound) return undefined;
  const shared = target.sharedDetails ?? [];
  const kinds = shared.filter((d) => d.values.role === "kind");
  if (kinds.length !== 1 || kinds[0]!.words.length !== 1) return undefined;
  const word = kinds[0]!.words[0]!;
  if (word.family.kind !== "content" || word.family.roots.length !== 1) return undefined;
  return { kind: "thing", head: word, root: word.family.roots[0]!, named: false, details: shared.filter((d) => d !== kinds[0]) };
}

function inferred(query: Term, target: Term, state: State, at: string): boolean {
  if (query.kind === "list") return false;
  if (state.memberLists.has(target) && target.kind === "list") {
    const group = state.memberLists.get(target);
    return target.members.some((member, i) =>
      tryIn(state, () => {
        if (group) {
          const chosen = state.pairChoice.get(group);
          if (chosen !== undefined && chosen !== i) return false;
          if (chosen === undefined) {
            state.pairChoice.set(group, i);
            state.undo.push(() => state.pairChoice.delete(group));
          }
        }
        if (!termMatch(query, asMember(member, target), state, `${at}/${i}`)) return false;
        state.switches.push("infer");
        return true;
      }),
    );
  }
  const instance = state.inUniversal ? universalInstance(target) : undefined;
  if (!instance) return false;
  if (!(structural(query, instance, state, at) && detailsSubset(termDetails(query), termDetails(instance), state, at))) return false;
  state.switches.push("infer");
  return true;
}

function claimMatch(query: Claim, target: Claim, state: State, at: string, targetReading?: Reading): boolean {
  const prefix = at ? `${at}/` : "";
  if (switchOn(state, "infer")) {
    for (const [list, group] of claimMemberLists(target, targetReading)) state.memberLists.set(list, group);
  }
  const outerUniversal = state.inUniversal;
  state.inUniversal = !collective(target);
  try {
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
  } finally {
    state.inUniversal = outerUniversal;
  }
}

/** Does the query claim fit the target claim? The blanks it binds and the switches it went through, or undefined. */
export function match(query: Claim, target: Claim, options: MatchOptions = {}): Binding | undefined {
  const state: State = { options, blanks: [], switches: [], memberLists: new Map(), pairChoice: new Map(), undo: [], inUniversal: false };
  if (!claimMatch(query, target, state, "", options.targetSite?.reading)) return undefined;
  const used = new Set(state.switches);
  return { blanks: state.blanks, switches: SWITCH_ORDER.filter((s) => used.has(s)) };
}

// ── Where readings sit ──────────────────────────────────────────────────────

/** What holds a nested reading inside its parent: the frame, detail or term it hangs from. */
export type Via = { frame?: Frame; detail?: Detail; term?: Term };

export type Parent = { reading: Reading; via: Via };

/**
 * Every reading under the given ones, nested ones included, in text order (depth first), each with the reading that
 * contains it. Walks the readings, never the parse tree.
 */
export function readingTree(readings: readonly Reading[]): Map<Reading, Parent | undefined> {
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
