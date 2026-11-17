/**
 * Memoized versions of the first-token computations the ALL(*) strategy runs for every OR and every optional
 * production (OPTION, MANY, AT_LEAST_ONE and their `_SEP` forms) while the parser builds. Upstream, each
 * decision walks its whole rule and enumerates the paths through the rest of it, and each follow check walks
 * most of the ATN; for the sentence grammar that was about 4 s of a 4.4 s build. Both results here are
 * identical to upstream's, decision by decision (`fast-first.test.ts` checks every decision of the sentence
 * grammar against chevrotain's `getLookaheadPaths` and the strategy's original `firstSet`).
 */
import {
  Alternation,
  Alternative,
  type IProduction,
  NonTerminal,
  Option,
  Repetition,
  RepetitionMandatory,
  RepetitionMandatoryWithSeparator,
  RepetitionWithSeparator,
  type Rule,
  Terminal,
  type TokenType,
} from "chevrotain";
import { ATN_RULE_STOP, type ATNState, AtomTransition } from "./atn.js";

/** One first token, or `undefined` for an empty path (the definition can end without consuming a token). */
type First = TokenType | undefined;

/** The production types the strategy builds optional lookahead for, as it names them. */
export type OptionalKind =
  | "Option"
  | "Repetition"
  | "RepetitionMandatory"
  | "RepetitionMandatoryWithSeparator"
  | "RepetitionWithSeparator";

/**
 * Append `t` unless an earlier entry already matches it, as chevrotain's `containsPath` decides: the same
 * token type, or a category the token belongs to. The empty path matches only itself.
 */
function pushNew(list: First[], t: First): void {
  for (const u of list) {
    if (u === undefined || t === undefined) {
      if (u === t) return;
    } else if (u === t || u.categoryMatchesMap![t.tokenTypeIdx!] !== undefined) {
      return;
    }
  }
  list.push(t);
}

/**
 * `list` followed by `rest`: chevrotain enumerates what follows a definition at the point its first empty path
 * ends, so `rest` takes the place of the first `undefined` and later ones repeat entries already listed.
 */
function continueWith(list: First[], rest: () => First[]): First[] {
  const end = list.indexOf(undefined);
  if (end < 0) return list;
  const out: First[] = [];
  list.forEach((t, i) => {
    if (i === end) for (const r of rest()) pushNew(out, r);
    else if (t !== undefined) pushNew(out, t);
  });
  return out;
}

const sequenceMemo = new WeakMap<IProduction[], First[][]>();

/** First tokens of `seq` from index `i`, in chevrotain's `possiblePathsFrom` order with `maxLength` 1. */
function firstOfSequence(seq: IProduction[], i = 0): First[] {
  let memo = sequenceMemo.get(seq);
  if (memo === undefined) sequenceMemo.set(seq, (memo = []));
  const known = memo[i];
  if (known !== undefined) return known;
  const result = i >= seq.length ? [undefined] : continueWith(firstOfProduction(seq[i]!), () => firstOfSequence(seq, i + 1));
  memo[i] = result;
  return result;
}

/** As {@link firstOfSequence}, for a sequence built for one lookup (not memoized). */
function firstOfFreshSequence(seq: IProduction[], i = 0): First[] {
  return i >= seq.length ? [undefined] : continueWith(firstOfProduction(seq[i]!), () => firstOfFreshSequence(seq, i + 1));
}

function nonEmptyBody(list: First[], dsl: string): First[] {
  if (list.includes(undefined)) throw new Error(`${dsl} body can be empty: chevrotain's path enumeration would not terminate`);
  return list;
}

function withEmpty(list: First[]): First[] {
  const out = [...list];
  pushNew(out, undefined);
  return out;
}

/** First tokens of one production, `undefined` meaning "whatever follows it". */
function firstOfProduction(prod: IProduction): First[] {
  if (prod instanceof Terminal) return [prod.terminalType];
  if (prod instanceof NonTerminal || prod instanceof Alternative) return firstOfSequence(prod.definition);
  if (prod instanceof Option) return withEmpty(firstOfSequence(prod.definition));
  if (prod instanceof RepetitionMandatory) return nonEmptyBody(firstOfSequence(prod.definition), "AT_LEAST_ONE");
  if (prod instanceof Repetition) return withEmpty(nonEmptyBody(firstOfSequence(prod.definition), "MANY"));
  if (prod instanceof RepetitionMandatoryWithSeparator) {
    return continueWith(firstOfSequence(prod.definition), () => [prod.separator, undefined]);
  }
  if (prod instanceof RepetitionWithSeparator) {
    return withEmpty(continueWith(firstOfSequence(prod.definition), () => [prod.separator, undefined]));
  }
  if (prod instanceof Alternation) {
    // chevrotain skips an alternative with an empty definition, so it adds no empty path.
    const out: First[] = [];
    for (const alt of prod.definition as Alternative[]) {
      if (alt.definition.length !== 0) for (const t of firstOfSequence(alt.definition)) pushNew(out, t);
    }
    return out;
  }
  throw new Error("non exhaustive match");
}

const OPTIONAL_KINDS: [new (...args: never[]) => IProduction, OptionalKind][] = [
  [Option, "Option"],
  [RepetitionMandatoryWithSeparator, "RepetitionMandatoryWithSeparator"],
  [RepetitionMandatory, "RepetitionMandatory"],
  [RepetitionWithSeparator, "RepetitionWithSeparator"],
  [Repetition, "Repetition"],
];

interface OptionalSite {
  inside: IProduction[];
  /** The rest of the rule after the production, as chevrotain's `RestDefinitionFinderWalker` builds it. */
  after: IProduction[];
}

interface RuleSites {
  optionals: Map<string, OptionalSite>;
  /** Each OR's alternatives, by occurrence. */
  alternations: Map<number, Alternative[]>;
}

const siteTables = new WeakMap<Rule, RuleSites>();

/** Every optional production and alternation of `rule`, found in one walk. */
export function ruleSites(rule: Rule): RuleSites {
  const known = siteTables.get(rule);
  if (known !== undefined) return known;
  const sites = new Map<string, OptionalSite>();
  const alternations = new Map<number, Alternative[]>();
  const walk = (prod: { definition: IProduction[] }, prevRest: IProduction[]): void => {
    prod.definition.forEach((sub, index) => {
      const fullRest = prod.definition.slice(index + 1).concat(prevRest);
      if (sub instanceof NonTerminal || sub instanceof Terminal) return;
      if (sub instanceof Alternative) return walk(sub, fullRest);
      if (sub instanceof Alternation) {
        if (alternations.has(sub.idx)) throw new Error(`duplicate Alternation${sub.idx} in rule ${rule.name}`);
        alternations.set(sub.idx, sub.definition as Alternative[]);
        for (const alt of sub.definition) walk(new Alternative({ definition: [alt] }), fullRest);
        return;
      }
      const kind = OPTIONAL_KINDS.find(([type]) => sub instanceof type)?.[1];
      if (kind === undefined) throw new Error("non exhaustive match");
      const key = kind + (sub as Option).idx;
      if (sites.has(key)) throw new Error(`duplicate ${key} in rule ${rule.name}`);
      sites.set(key, { inside: (sub as Option).definition, after: fullRest });
      walk(sub as Option, fullRest);
    });
  };
  walk(rule, []);
  const result = { optionals: sites, alternations };
  siteTables.set(rule, result);
  return result;
}

/**
 * The strategy's `alts` for an optional production: the first tokens of its body, then of what follows it
 * inside the rule, in the order chevrotain's `getLookaheadPaths` with `maxLookahead` 1 lists them.
 */
export function optionalFirstTokens(rule: Rule, occurrence: number, kind: OptionalKind): [First[], First[]] {
  const site = ruleSites(rule).optionals.get(kind + occurrence);
  if (site === undefined) throw new Error(`no ${kind}${occurrence} in rule ${rule.name}`);
  return [firstOfSequence(site.inside), firstOfFreshSequence(site.after)];
}

/** The strategy's `partialAlts` for an OR: each alternative's first tokens, as `getLookaheadPaths` with `maxLookahead` 1 lists them. */
export function alternationFirstTokens(rule: Rule, occurrence: number): First[][] {
  const alternatives = ruleSites(rule).alternations.get(occurrence);
  if (alternatives === undefined) throw new Error(`no Alternation${occurrence} in rule ${rule.name}`);
  return alternatives.map((alt) => firstOfSequence(alt.definition));
}

/**
 * The token indices reachable first from an ATN state, through epsilon and rule-entry edges, and with
 * `throughCallers` also from a rule's end into every place that calls it. Each is a fixed reachability
 * set, so it is computed once per state (strongly connected components share one set).
 */
export class ReachableTokens {
  private readonly memo = [new Map<ATNState, Set<number>>(), new Map<ATNState, Set<number>>()] as const;

  constructor(private readonly callers: Map<Rule, ATNState[]>) {}

  from(start: ATNState, throughCallers: boolean): Set<number> {
    return this.memo[throughCallers ? 1 : 0].get(start) ?? this.compute(start, throughCallers);
  }

  private next(state: ATNState, throughCallers: boolean): ATNState[] {
    if (state.type === ATN_RULE_STOP) return throughCallers ? (this.callers.get(state.rule) ?? []) : [];
    return state.transitions.filter((t) => !(t instanceof AtomTransition)).map((t) => t.target);
  }

  private static ownTokens(state: ATNState, into: Set<number>): void {
    if (state.type === ATN_RULE_STOP) return;
    for (const t of state.transitions) {
      if (t instanceof AtomTransition) {
        into.add(t.tokenType.tokenTypeIdx!);
        for (const category of t.tokenType.categoryMatches!) into.add(category);
      }
    }
  }

  /** Iterative Tarjan from `start`, filling the memo for every component it closes. */
  private compute(start: ATNState, throughCallers: boolean): Set<number> {
    const memo = this.memo[throughCallers ? 1 : 0];
    const index = new Map<ATNState, number>();
    const low = new Map<ATNState, number>();
    const stack: ATNState[] = [];
    const onStack = new Set<ATNState>();
    const frames: { state: ATNState; next: ATNState[]; i: number }[] = [];
    const enter = (state: ATNState): void => {
      index.set(state, index.size);
      low.set(state, index.size - 1);
      stack.push(state);
      onStack.add(state);
      frames.push({ state, next: this.next(state, throughCallers), i: 0 });
    };
    enter(start);
    while (frames.length > 0) {
      const frame = frames[frames.length - 1]!;
      if (frame.i < frame.next.length) {
        const w = frame.next[frame.i++]!;
        if (memo.has(w)) continue;
        if (!index.has(w)) enter(w);
        else if (onStack.has(w)) low.set(frame.state, Math.min(low.get(frame.state)!, index.get(w)!));
        continue;
      }
      frames.pop();
      const v = frame.state;
      const parent = frames[frames.length - 1];
      if (parent !== undefined) low.set(parent.state, Math.min(low.get(parent.state)!, low.get(v)!));
      if (low.get(v) !== index.get(v)) continue;
      const component: ATNState[] = [];
      let w: ATNState;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      const tokens = new Set<number>();
      for (const c of component) {
        ReachableTokens.ownTokens(c, tokens);
        for (const n of this.next(c, throughCallers)) for (const x of memo.get(n) ?? []) tokens.add(x);
      }
      for (const c of component) memo.set(c, tokens);
    }
    return memo.get(start)!;
  }
}
