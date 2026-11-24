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
 *   (`value.ts`), so the written and the spoken form of one number match. A speaker or listener term matches only the
 *   same turn's person, when the sites name it ({@link TermSite}).
 * - A blank in the query binds to the target's term in that place.
 * - Widening and inference are switches, off by default ({@link Switch}); every match found through one names it.
 */
import type { Claim, Detail, Frame, Link, Reading, StanceList, Term } from "./types.js";
import type { LexWord } from "../parse/types.js";
import { detailNumber, sameNumberKind, sameNumberWord, samePayload, termNumber, wordValue } from "./value.js";
import { asMember, claimMemberLists, collective, compoundHeads, throughAntecedent, universalInstance, type StepLexicon } from "./steps.js";

export { throughAntecedent };

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
 * The conditions for each step live in `steps.ts`, shared with any engine that chains them; this file only applies them.
 */
export type Switch = "widen" | "infer";

const SWITCH_ORDER: Switch[] = ["widen", "infer"];

/**
 * Where a term sits: the reading it is in, for the host's referent; and the person who speaks and the person addressed in
 * that reading's turn, as one name each (a turn's speaker, the solver's `sp("…")`). A speaker or listener term fits only
 * the same turn's person: when both sides name one, they must be the same; when either side names none, the term fits
 * any term of its kind, as a caller that does not know the turns needs.
 */
export type TermSite = { reading?: Reading; speaker?: string; listener?: string; we?: string };

export type MatchOptions = {
  /** The host's referent for a term (a person, an object in its world); undefined when it cannot resolve the term. */
  referent?: (term: Term, side: "query" | "target", site: TermSite) => string | undefined;
  querySite?: TermSite;
  targetSite?: TermSite;
  switches?: Partial<Record<Switch, boolean>>;
  /** The parser's lexicon tables: `widen` reads dictionary compound heads from them. Required when `widen` is on. */
  lexicon?: StepLexicon;
};

/** One blank in the query and the target term it binds to. `at` names the place: `verb`, `z`, `d`, `b`, `predicate.<i>`, nested with `/`. */
export type BlankBinding = { at: string; blank: Term; term: Term };

export type Binding = {
  blanks: BlankBinding[];
  /** The switches the match went through; empty for a match on the claim as said. */
  switches: Switch[];
  /**
   * The scope islands whose roles the match used, where the target claim lacks the role (scope-islands.md#scope-islands):
   * their readings go on the frame path, so a stance inside the island stays with the match. Absent when none.
   */
  islands?: Reading[];
  /**
   * The list-reach frames of the target lists the match went into: a `u` list (*not X*, *neither A nor B*,
   * joins.md#negation-u) denies its items, so a query term that matches one of them comes back with the denial, to go on
   * the frame path ({@link withListFrames}). Absent when none.
   */
  listFrames?: { frame: Frame; term: Term }[];
};

// ── Terms ───────────────────────────────────────────────────────────────────

type State = {
  options: MatchOptions;
  blanks: BlankBinding[];
  switches: Switch[];
  /** Target lists whose members a query term may match (`infer`), each with its pairing group, if any. */
  memberLists: Map<Term, object | undefined>;
  /** Pairing group → the member place chosen in it. */
  pairChoice: Map<object, number>;
  undo: (() => void)[];
  /** The island readings whose roles the match used ({@link Binding.islands}). */
  islands: Reading[];
  /** The denied target lists the match went into ({@link Binding.listFrames}). */
  listFrames: { frame: Frame; term: Term }[];
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
  if (query.hosted?.kind === "blank" && detailNumber(query)) return numberBlank(query, target, state, at);
  if (query.key !== target.key || !sameDetailWords(query, target)) return false;
  if (query.hosted && !(target.hosted && termMatch(query.hosted, target.hosted, state, `${at}/hosted`))) return false;
  return detailsSubset(query.details ?? [], target.details ?? [], state, at);
}

/**
 * A number blank in a detail (`grar`, *how many? / how much?*, digitless-exponents.md#how-many): it binds to the target's number
 * detail of the same key and the same kind of number, as a number term. The unit is the term the detail sits on, which
 * the enclosing term match has already matched (a measure phrase, measures-and-percent.md#measure-phrases).
 */
function numberBlank(query: Detail, target: Detail, state: State, at: string): boolean {
  const q = detailNumber(query)!;
  const t = detailNumber(target);
  if (query.key !== target.key || !t || !sameNumberKind(q, t) || t.family.kind !== "number") return false;
  if (!detailsSubset(query.details ?? [], target.details ?? [], state, at)) return false;
  state.blanks.push({ at: `${at}/number`, blank: query.hosted!, term: { kind: "number", word: t, stem: t.family.stem } });
  return true;
}

/** Every query detail has a matching target detail. */
function detailsSubset(query: readonly Detail[], target: readonly Detail[], state: State, at: string): boolean {
  return query.every((q, i) => target.some((t) => tryIn(state, () => detailMatch(q, t, state, `${at}/detail.${i}`))));
}

/**
 * D21: a list's SHARED words (list-structure.md#shared-after-the-join). Each query word fits a target word as a detail
 * does, so a rank or tie on one scale never fits one on another; a number under it (a factor, comparative-arity.md#factor,
 * or a place, comparative-arity.md#place-on-a-scale) is compared both ways, so a plain rank or tie never fits a ratio or
 * a place, nor the other way round.
 */
function sharedMatch(query: readonly Detail[], target: readonly Detail[], state: State, at: string): boolean {
  const numbers = (d: Detail): number => (d.details ?? []).filter((x) => detailNumber(x)).length;
  return query.every((q, i) => target.some((t) => numbers(q) === numbers(t) && tryIn(state, () => detailMatch(q, t, state, `${at}.${i}`))));
}

/** A ratio list (comparative-arity.md#factor): two members, `zoel`, and one SHARED equative word with a factor under it. */
function ratioFactor(list: Extract<Term, { kind: "list" }>): { scale: Detail; factor: LexWord } | undefined {
  const shared = list.sharedDetails ?? [];
  const scale = shared[0];
  if (list.members.length !== 2 || list.values.series !== "oe" || shared.length !== 1 || scale?.values.role !== "equative") return undefined;
  const inner = scale.details ?? [];
  const factor = inner.length === 1 && inner[0]!.kind === "amount" ? detailNumber(inner[0]!) : undefined;
  return factor && { scale, factor };
}

/**
 * A ratio fits its inverse (comparative-arity.md#factor): *A is twice as big as B* fits *B is half as big as A*, the
 * two members swapped and the factor's value negated, since `ru` divides. The scale and the ending still match as
 * said; the translator writes both wordings as one `ratio(S, A, B, V)` atom.
 */
function inverseRatio(query: Extract<Term, { kind: "list" }>, target: Term, state: State, at: string): boolean {
  if (target.kind !== "list" || target.values.series !== query.values.series || !sameRank(query, target)) return false;
  const q = ratioFactor(query);
  const t = ratioFactor(target);
  if (!q || !t || q.factor.ending !== t.factor.ending) return false;
  const qv = wordValue(q.factor);
  const tv = wordValue(t.factor);
  if (qv?.kind !== "scalar" || tv?.kind !== "scalar" || qv.percent !== tv.percent || qv.value !== -tv.value) return false;
  return (
    detailMatch({ ...q.scale, details: undefined }, { ...t.scale, details: undefined }, state, `${at}/shared.0`) &&
    termMatch(query.members[0]!, target.members[1]!, state, `${at}/1`) &&
    termMatch(query.members[1]!, target.members[0]!, state, `${at}/0`)
  );
}

/** D21: a rank or tie list (a SHARED scale or equative word) fits only one with the same ending, `-l` or `-m`. */
function sameRank(query: Extract<Term, { kind: "list" }>, target: Extract<Term, { kind: "list" }>): boolean {
  const ranks = (l: Extract<Term, { kind: "list" }>): boolean => (l.sharedDetails ?? []).some((d) => d.values.role === "scale" || d.values.role === "equative");
  return !(ranks(query) || ranks(target)) || query.values.ending === target.values.ending;
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
  if (tryIn(state, () => deniedMember(query, target, state, at))) return true;
  if (switchOn(state, "widen") && tryIn(state, () => widened(query, target, state, at))) return true;
  if (switchOn(state, "infer") && tryIn(state, () => inferred(query, target, state, at))) return true;
  return false;
}

/**
 * A turn person as its site names it: a speaker, listener or `we` term (R4a-7), or a name (its root, as a call's party
 * is written). Undefined for any other term, or when the site names no one.
 */
function personText(term: Term, site: TermSite | undefined): string | undefined {
  if (term.kind === "speaker" || term.kind === "listener" || term.kind === "we") return site?.[term.kind];
  if (term.kind !== "thing" || !term.named || termNumber(term)) return undefined;
  return /^[a-z][a-z0-9_]*$/.test(term.root) ? term.root : JSON.stringify(term.root);
}

const isTurnPerson = (t: Term): boolean => t.kind === "speaker" || t.kind === "listener" || t.kind === "we";

function structural(query: Term, target: Term, state: State, at: string): boolean {
  // R4a-7, R4a-8: a turn person fits whatever its site names it as (`zawan` after a call to Azozon is Azozon), and a
  // name fits a turn person the site names with that name; two turn terms with no site fall back to their kind.
  if ((isTurnPerson(query) || isTurnPerson(target)) && !(query.kind === target.kind && isTurnPerson(query))) {
    const q = personText(query, state.options.querySite);
    const t = personText(target, state.options.targetSite);
    if (q !== undefined && t !== undefined) return q === t;
    if (isTurnPerson(query) !== isTurnPerson(target)) return false;
  }
  switch (query.kind) {
    case "thing": {
      const q = termNumber(query);
      const t = termNumber(target);
      if (q || t) return q !== undefined && t !== undefined && sameNumberWord(q, t);
      return target.kind === "thing" && target.root === query.root && target.named === query.named;
    }
    case "speaker":
    case "listener":
    case "we": {
      if (target.kind !== query.kind) return false;
      const q = state.options.querySite?.[query.kind];
      const t = state.options.targetSite?.[query.kind];
      return q === undefined || t === undefined || q === t;
    }
    case "pronoun":
      // The generic pronoun fits the generic pronoun (pronouns.md#generic-pronoun); another unbound pronoun has no
      // antecedent to match through.
      return query.sort === "generic" && target.kind === "pronoun" && target.sort === "generic";
    case "literal":
      return samePayload(query, target);
    case "number": {
      const t = termNumber(target);
      return t !== undefined && sameNumberWord(query.word, t);
    }
    case "list":
      return (
        tryIn(
          state,
          () =>
            target.kind === "list" &&
            target.values.series === query.values.series &&
            target.members.length === query.members.length &&
            sameRank(query, target) &&
            query.members.every((m, i) => termMatch(m, target.members[i]!, state, `${at}/${i}`)) &&
            sharedMatch(query.sharedDetails ?? [], target.sharedDetails ?? [], state, `${at}/shared`),
        ) || tryIn(state, () => inverseRatio(query, target, state, at))
      );
    case "clause":
      return target.kind === "clause" && claimMatch(query.reading.claim, target.reading.claim, state, at, target.reading);
    case "quote":
      return target.kind === "quote" && target.word.raw === query.word.raw;
    case "blank":
      return true;
  }
}

/**
 * A `u` list in the target (*not X*, *neither A nor B*, joins.md#negation-u): the denial reaches only its items, so the
 * claim still stands about each item, denied. A query term that is not a list matches an item as said, and the list's
 * frames go with the match ({@link Binding.listFrames}), as *never paid* answers *did Lee pay?* with the denial on the
 * path. Not a switch: nothing is widened or inferred, and the matcher never decides the claim holds.
 */
function deniedMember(query: Term, target: Term, state: State, at: string): boolean {
  if (query.kind === "list" || target.kind !== "list" || target.values.series !== "u" || target.bound) return false;
  return target.members.some((member, i) =>
    tryIn(state, () => {
      if (!termMatch(query, asMember(member, target), state, `${at}/${i}`)) return false;
      for (const frame of target.frames ?? []) state.listFrames.push({ frame, term: target });
      const added = target.frames?.length ?? 0;
      state.undo.push(() => void (state.listFrames.length -= added));
      return true;
    }),
  );
}

// ── Widening ────────────────────────────────────────────────────────────────

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

/**
 * A genitive the reader puts on the clause (`zogozel om bahelan vowurol.`, social-ties.md#genitive) as a detail of the
 * `/z/` noun, so it fits a claim whose noun carries it, as a SHARED genitive on each member of a list does
 * (list-structure.md#shared-after-the-join). Only when `/z/` is a noun and the clause has no `/d/` or `/b/`: `om` sits
 * on the noun to its left, which with another role there may be that role's.
 */
function genitiveOnZ(claim: Claim): Claim {
  const z = claim.roles.z;
  const genitives = claim.details.filter((d) => d.key === "hookJob:genitive");
  if (!genitives.length || z?.kind !== "thing" || claim.roles.d || claim.roles.b) return claim;
  return { ...claim, roles: { ...claim.roles, z: { ...z, details: [...z.details, ...genitives] } }, details: claim.details.filter((d) => !genitives.includes(d)) };
}

function claimMatch(queryClaim: Claim, targetClaim: Claim, state: State, at: string, targetReading?: Reading): boolean {
  const query = genitiveOnZ(queryClaim);
  const target = genitiveOnZ(targetClaim);
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
      if (other ? !termMatch(term, other, state, `${prefix}${letter}`) : !islandRole(letter, term, target, state, prefix)) return false;
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

/**
 * A role the target claim lacks, found in one of its scope islands (scope-islands.md#scope-islands): the island holds a
 * chunk of the clause, so its `/b/` is still the clause's recipient. The reader keeps the phrase in the island's
 * reading (rule 2); the match records the island, so its frames go on the path.
 */
function islandRole(letter: keyof Claim["roles"], query: Term, target: Claim, state: State, prefix: string): boolean {
  for (const detail of target.details) {
    if (detail.kind !== "island") continue;
    for (const island of detail.content ?? []) {
      const other = island.claim.roles[letter];
      if (!other) continue;
      const ok = tryIn(state, () => {
        if (!termMatch(query, other, state, `${prefix}${letter}`)) return false;
        state.islands.push(island);
        state.undo.push(() => state.islands.pop());
        return true;
      });
      if (ok) return true;
    }
  }
  return false;
}

/** Does the query claim fit the target claim? The blanks it binds and the switches it went through, or undefined. */
export function match(query: Claim, target: Claim, options: MatchOptions = {}): Binding | undefined {
  const state: State = { options, blanks: [], switches: [], memberLists: new Map(), pairChoice: new Map(), undo: [], islands: [], listFrames: [], inUniversal: false };
  if (!claimMatch(query, target, state, "", options.targetSite?.reading)) return undefined;
  const used = new Set(state.switches);
  return { blanks: state.blanks, switches: SWITCH_ORDER.filter((s) => used.has(s)), ...(state.islands.length ? { islands: [...new Set(state.islands)] } : {}),
    ...(state.listFrames.length ? { listFrames: [...state.listFrames] } : {}),
  };
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
  /** A list-reach frame: the target list it sits on, which the match went into ({@link Binding.listFrames}). */
  term?: Term;
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
  /**
   * The scope islands of the matched reading the match looked into ({@link Binding.islands}): each island's frames
   * follow the matched reading's in `frames`, and its pairs are in `unsettled`. Absent when none.
   */
  islands?: Reading[];
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

/**
 * A path with the list-reach frames a match went through ({@link Binding.listFrames}): they sit on terms of the matched
 * reading, so they follow its frames.
 */
export function withListFrames(path: FramePath, listFrames: Binding["listFrames"], reading: Reading): FramePath {
  if (!listFrames?.length) return path;
  return { ...path, frames: [...path.frames, ...listFrames.map(({ frame, term }): PathFrame => ({ frame, reading, how: "own", lists: [], term }))] };
}

/** A path with the islands a match looked into: their frames and unsettled pairs join the matched reading's. */
export function withIslands(path: FramePath, islands: readonly Reading[] | undefined): FramePath {
  if (!islands?.length) return path;
  return {
    ...path,
    frames: [...path.frames, ...islands.flatMap(readingFrames)],
    stanceLists: [...path.stanceLists, ...islands.flatMap((r) => r.stanceLists ?? [])],
    unsettled: [...path.unsettled, ...islands.flatMap((r) => r.unordered)],
    islands: [...islands],
  };
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
