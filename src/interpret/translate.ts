/**
 * Translator (clingo-solver proposal, Sketch): a log's readings to a Clingo program, from the confirmed group (a) rows
 * only. Claims become terms, frames wrap them, every reading is switched by `on(Id)`, and every rule carries its reading
 * id and derives `fired(Id, C)`, with `used(Id, C, Premise)` for each premise in its body.
 *
 * Fitting stays the matcher's: whether a claim fits a condition or a denial is decided by {@link match} here, before
 * solving, and written as `fits(Query, Target)` facts. Step conditions come from `steps.ts`, number order from
 * {@link compareValues}. A reading with a frame that has no row is left out whole and reported in
 * {@link Translation.left}, as `unread` is.
 *
 * Encoding (E1, with one change): a denial is `holds(neg(T))`, not `-holds(T)`. Clingo's classical negation adds
 * `:- holds(T), -holds(T)` to every program, so a clash would end the world instead of deriving `clash(T)`.
 *
 * The program keeps to the Clingo 5 / 6 common ground: no conditional literals in rule bodies, no `_` inside `not`, no
 * integer division.
 */
import type { LexWord } from "../parse/types.js";
import type { Log } from "./log.js";
import { match } from "./match.js";
import { asMember, claimMemberLists, compoundHeads, throughAntecedent, universalInstance, type ListTerm, type StepLexicon } from "./steps.js";
import type { Claim, Detail, Frame, Reading, ReadingId, Term } from "./types.js";
import { compareValues, detailNumber, wordStem, wordValue, type NumberValue } from "./value.js";

export type TranslateOptions = {
  /** The parser's lexicon tables: compound heads (`head/2` facts) come from them. Without them no `head` facts. */
  lexicon?: StepLexicon;
  /** Host switches written as `switch(Name).` facts: `widen` (compound to head), `defaults` (everyday defaults), `closed` (closed world). */
  switches?: Partial<Record<"widen" | "defaults" | "closed", boolean>>;
};

/** A reading left out of the program, as an `unread` part is: the turn is `beyond` for a solver job. */
export type LeftOut = { reading: ReadingId; construction: string; key?: string; reason: string };

/** A frame the program does not encode but a reply may mention (R1-9: standalone `thul` leaves the claim untouched). */
export type Note = { reading: ReadingId; frame: Frame };

/** A term in the program and the claim it stands for: the matcher's input for a question asked of the answer set. */
export type TermSource = { reading: ReadingId; claim: Claim };

export type Translation = {
  program: string;
  /** The readings switched by `on(Id)`, in log order. `Id` is the reading id as a Clingo string. */
  readings: ReadingId[];
  /** Ground claim terms (stated, derived through a list or a universal, and nested) and their claims. */
  terms: Map<string, TermSource>;
  /** `c(Id)` (a hinge's condition), `o(Id)` (its outcome), `i(Id, K)` (an item of a whole-list denial) and their claims. */
  slots: Map<string, TermSource>;
  left: LeftOut[];
  notes: Note[];
};

// ── Atoms ───────────────────────────────────────────────────────────────────

/** Function names the encoding uses; a root with one of these names is written through `act/N`. */
const RESERVED = new Set([
  "holds", "neg", "isa", "be", "on", "fired", "used", "fits", "clash", "member", "head", "switch", "candidate", "nm", "ls",
  "z", "d", "b", "g", "w", "dt", "v", "pct", "pts", "rk", "rke", "cd", "inf", "ninf", "rng", "count", "detail", "within",
  "less", "same", "always", "never", "notall", "none", "more", "c", "o", "i", "act", "lit", "pro", "cl", "quote", "speaker",
  "listener", "blank", "not",
]);

const str = (s: string): string => JSON.stringify(s);
const name = (s: string): string => (/^[a-z][a-z0-9_]*$/.test(s) && !RESERVED.has(s) ? s : str(s));
const raws = (words: readonly { raw: string }[]): string => words.map((w) => w.raw).join(" ");

function numberText(n: number): string {
  return Number.isInteger(n) && Math.abs(n) < 2 ** 30 ? String(n) : str(String(n));
}

/** A number word: its value as a term, `inf` / `ninf` for a ray's end, or the word itself when it has no value. */
export function valueTerm(word: LexWord): string {
  const value = wordValue(word);
  if (value) return valueText(value);
  const end = infinity(word);
  if (end) return end > 0 ? "inf" : "ninf";
  return `w(${str(word.raw)})`;
}

function valueText(value: NumberValue): string {
  if (value.kind === "scalar") return `${value.percent === "percent" ? "pct" : value.percent === "points" ? "pts" : "v"}(${numberText(value.value)})`;
  if (value.kind === "rank") return `${value.fromEnd ? "rke" : "rk"}(${value.ranks.map(numberText).join(",")})`;
  return `cd(${value.fields.map(str).join(",")})`;
}

/** ±∞, a ray's open end (open-ranges.md#rays): a digitless `e` on an amount marker. */
function infinity(word: LexWord): 1 | -1 | undefined {
  const stem = wordStem(word);
  if (!stem || stem.groups.length || stem.digitlessExp !== "e") return undefined;
  if (stem.marker === "+" || stem.marker === "ra") return 1;
  if (stem.marker === "-" || stem.marker === "ru") return -1;
  return undefined;
}

// ── Ranges ──────────────────────────────────────────────────────────────────

/** A stated range on a counted noun (ranges.md#number-ranges, open-ranges.md#rays): its ends in the order said, and its hook. */
export type Range = { first: End; second: End; hook: string };
type End = { value?: NumberValue; infinite?: 1 | -1 };

/** The range a number detail carries in its nested `range` detail (R1-7): the ends as said, the range, and its term. */
export function detailRange(detail: Detail): { ends: [LexWord, LexWord]; range: Range; text: string } | undefined {
  const first = detailNumber(detail);
  const span = detail.details?.find((d) => d.kind === "range");
  const second = span?.hosted?.kind === "number" ? span.hosted.word : undefined;
  if (!first || !span || !second || span.words.length !== 1) return undefined;
  const hook = span.words[0]!.raw;
  const end = (w: LexWord): End => ({ value: wordValue(w), infinite: infinity(w) });
  return { ends: [first, second], range: { first: end(first), second: end(second), hook }, text: `rng(${valueTerm(first)},${valueTerm(second)},${name(hook)})` };
}

/** Where a value sits against one end: negative below, zero at, positive above; undefined when they do not order. */
function against(value: NumberValue, end: End): number | undefined {
  if (end.infinite) return -end.infinite;
  return end.value ? compareValues(value, end.value) : undefined;
}

/**
 * Whether a value lies in a range (ranges.md#ranges): `oel` / `aol` keep both ends, `uel` leaves out the end said second,
 * `uol` both ends, `ual` keeps only what lies outside. A fuzzy or question ending reads as its hook. Undefined when an end
 * has no value or the kinds do not order. A question's fit to a `within` fact is decided here too.
 */
export function inRange(value: NumberValue, range: Range): boolean | undefined {
  const hook = range.hook.replace(/[lmr]$/, "");
  if (!["oe", "ao", "ue", "uo", "ua"].includes(hook)) return undefined;
  const { first, second } = range;
  const ends = first.infinite ? first.infinite : second.infinite ? -second.infinite : compareValues(first.value!, second.value!);
  const a = against(value, first);
  const b = against(value, second);
  if (ends === undefined || a === undefined || b === undefined) return undefined;
  const firstIn = hook !== "uo";
  const secondIn = hook === "oe" || hook === "ao" || hook === "ua";
  const [lo, loIn, hi, hiIn] = ends <= 0 ? [a, firstIn, b, secondIn] : [b, secondIn, a, firstIn];
  const between = (lo > 0 || (lo === 0 && loIn)) && (hi < 0 || (hi === 0 && hiIn));
  return hook === "ua" ? !between : between;
}

// ── The program ─────────────────────────────────────────────────────────────

type Literal = { atom: string; premise?: string };
type Subst = Map<Term, { text: string; term?: Term }>;
type Ctx = { reading: Reading; id: string; subst: Subst; asserted: boolean; out: string[] };

const GENERIC = [
  "% Generic rules (clingo-solver E1).",
  "clash(P) :- holds(P), holds(neg(P)).",
  "clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).",
  "holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "holds(neg(P)) :- candidate(P), not holds(P), switch(closed).",
];

const HINGE_KEYS = new Set(["overlay:clause_hinge:th", "overlay:clause_hinge:g"]);

class Translator {
  readonly lines: string[] = [];
  readonly readings: ReadingId[] = [];
  readonly terms = new Map<string, TermSource>();
  readonly slots = new Map<string, TermSource>();
  readonly left: LeftOut[] = [];
  readonly notes: Note[] = [];
  /** Terms the log gives a constant (first-mention nouns, lists), by object, so a pronoun resumes the same one. */
  readonly consts = new Map<Term, string>();
  /** Individuals a closed or open universal may stand for: named things and first-mention nouns. */
  readonly individuals = new Map<string, Term>();
  readonly denied = new Set<string>();
  readonly templates: { ctx: Ctx; list: Term; claim: Claim; sign: 1 | -1 }[] = [];
  readonly facts = new Set<string>();
  readonly values = new Map<string, NumberValue>();
  readonly ranges = new Map<string, Range>();
  readonly kinds = new Map<string, Term>();
  newMembers = new Set<Term>();

  constructor(readonly options: TranslateOptions) {}

  // ── Terms ──

  term(term: Term, place: string, ctx: Ctx): string {
    const own = ctx.subst.get(term);
    if (own) return own.text;
    const t = throughAntecedent(term);
    const sub = ctx.subst.get(t);
    if (sub) return sub.text;
    const known = this.consts.get(t);
    if (known) return known;
    switch (t.kind) {
      case "thing": {
        if (t.named) {
          const text = name(t.root);
          this.individuals.set(text, t);
          return text;
        }
        if (ctx.asserted && this.newMembers.has(t)) return this.firstMention(t, place, ctx);
        this.kinds.set(name(t.root), t);
        return name(t.root);
      }
      case "list": {
        const text = `ls(${ctx.id},${place})`;
        this.consts.set(t, text);
        return text;
      }
      case "number":
        return this.value(t.word);
      case "speaker":
      case "listener":
        return t.kind;
      case "pronoun":
        return `pro(${ctx.id},${str(t.word.raw)})`;
      case "blank":
        return "blank";
      case "literal":
        return `lit(${str(t.payload)})`;
      case "clause":
        return `cl(${this.claim(t.reading.claim, { ...ctx, asserted: false })})`;
      case "quote":
        return `quote(${ctx.id},${str(t.word.raw)})`;
    }
  }

  value(word: LexWord): string {
    const text = valueTerm(word);
    const value = wordValue(word);
    if (value) this.values.set(text, value);
    return text;
  }

  /** R1-3: a fresh constant per reading and place, its kind and details as facts. */
  firstMention(t: Extract<Term, { kind: "thing" }>, place: string, ctx: Ctx): string {
    const text = `nm(${ctx.id},${place})`;
    this.consts.set(t, text);
    this.individuals.set(text, t);
    this.kinds.set(name(t.root), t);
    this.rule(ctx, `isa(${text},${name(t.root)})`, []);
    for (const detail of t.details) {
      const number = detailNumber(detail);
      if (number) {
        const range = detailRange(detail);
        if (range) {
          this.ranges.set(range.text, range.range);
          range.ends.forEach((end) => this.value(end));
          this.rule(ctx, `count(${text},${range.text})`, [], "count");
        } else if (wordValue(number)) this.rule(ctx, `count(${text},${this.value(number)})`, [], "count");
        continue;
      }
      this.rule(ctx, `detail(${text},${this.detail(detail, ctx)})`, [], "detail");
    }
    return text;
  }

  detail(detail: Detail, ctx: Ctx): string {
    const number = detailNumber(detail);
    const words = number ? this.value(number) : str(raws(detail.words));
    const hosted = detail.hosted ? this.term(detail.hosted, `${detail.kind}`, { ...ctx, asserted: false }) : undefined;
    const nested = detail.details?.length ? `w(${detail.details.map((d) => this.detail(d, ctx)).join(",")})` : undefined;
    const rest = hosted || nested ? `,${hosted ?? "none"},${nested ?? "w"}` : "";
    return `dt(${str(detail.key)},${words}${rest})`;
  }

  kind(term: Term, place: string, ctx: Ctx): string {
    const own = ctx.subst.get(term);
    if (own) return own.text;
    const t = throughAntecedent(term);
    if (t.kind === "thing") {
      this.kinds.set(name(t.root), t);
      return name(t.root);
    }
    return this.term(t, place, { ...ctx, asserted: false });
  }

  /** A claim as one term: `isa(Z, K)` for a classification, `<verb root>(z(..), d(..), b(..), g(..), w(..))` otherwise. */
  claim(claim: Claim, ctx: Ctx): string {
    const roles = (["z", "d", "b"] as const).filter((r) => claim.roles[r]).map((r) => `${r}(${this.term(claim.roles[r]!, r, ctx)})`);
    const kinds = claim.predicate.map((p, i) => this.kind(p, claim.predicate.length > 1 ? `g${i + 1}` : "g", ctx));
    const details = claim.details.length ? [`w(${claim.details.map((d) => this.detail(d, ctx)).join(",")})`] : [];
    if (!claim.verb && kinds.length === 1 && roles.length === 1 && claim.roles.z && !details.length) {
      return `isa(${this.term(claim.roles.z, "z", ctx)},${kinds[0]})`;
    }
    const args = [...roles, ...kinds.map((k) => `g(${k})`), ...details];
    let functor = "be";
    if (claim.verb) {
      const verb = ctx.subst.get(claim.verb)?.text ?? (throughAntecedent(claim.verb).kind === "thing" ? name((throughAntecedent(claim.verb) as { root: string }).root) : undefined);
      if (verb && /^[a-z]/.test(verb)) functor = verb;
      else args.unshift(verb ?? this.term(claim.verb, "v", { ...ctx, asserted: false }));
      if (functor === "be") functor = "act";
    }
    return args.length ? `${functor}(${args.join(",")})` : functor;
  }

  // ── Rules ──

  /**
   * One rule with its `fired` twin and a `used` line per premise. `head` is the `holds` argument (or the whole atom when
   * `pred` is not `holds`); `C`, the conclusion `fired` names, is the `holds` argument or the atom.
   */
  rule(ctx: Ctx, head: string, body: Literal[], pred: "holds" | "choice" | "clash" | "count" | "detail" | "always" | "never" = "holds", conclusion?: string): void {
    const on = `on(${ctx.id})`;
    const atoms = [...body.map((l) => l.atom), on].join(", ");
    const marker = pred === "always" || pred === "never";
    const c = conclusion ?? (marker ? `${pred}(${head})` : head);
    const atom = pred === "holds" ? `holds(${head})` : pred === "choice" ? `{ holds(${head}) }` : pred === "clash" || marker ? `${pred}(${head})` : head;
    ctx.out.push(`${atom} :- ${atoms}.`);
    const firedBody = pred === "choice" ? [`holds(${head})`, ...body.map((l) => l.atom), on].join(", ") : atoms;
    ctx.out.push(`fired(${ctx.id},${c}) :- ${firedBody}.`);
    for (const l of body) if (l.premise) ctx.out.push(`used(${ctx.id},${c},${l.premise}) :- ${firedBody}.`);
  }

  // ── Readings ──

  /** Why a reading has no row, or undefined when every frame on it has one. */
  unrowed(reading: Reading): { construction: string; key?: string; reason: string } | undefined {
    if (reading.unread.length) {
      const u = reading.unread[0]!;
      return { construction: u.construction, key: u.key, reason: u.reason };
    }
    if (reading.claim.clauses) return { construction: "clauseJoin", reason: "noRow" };
    if (reading.stanceLists?.length) return { construction: reading.stanceLists[0]!.construction, key: reading.stanceLists[0]!.key, reason: "noRow" };
    const terms = claimTerms(reading.claim);
    for (const t of terms) {
      for (const f of termFrames(t)) if (!(t.kind === "list" && f.key === "joinSeries:u")) return { construction: f.construction, key: f.key, reason: "noRow" };
      for (const d of termDetails(t)) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    }
    for (const d of reading.claim.details) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    return undefined;
  }

  readingFrames(reading: Reading): { hinge?: Frame; universal?: Frame; restrictor?: Frame; standalone: Frame[]; other?: Frame } {
    const out: ReturnType<Translator["readingFrames"]> = { standalone: [] };
    for (const f of reading.frames) {
      if (f.key === "slot:newMember") continue;
      if (HINGE_KEYS.has(f.key) && ["if", "only-if", "iff"].includes(f.values.gloss ?? "") && !out.hinge) out.hinge = f;
      else if ((f.key === "joinSeries:ua" || f.key === "joinSeries:u:kind") && !out.universal) out.universal = f;
      else if (f.key === "lexReading:restrictor" && !out.restrictor) out.restrictor = f;
      else if (f.key === "joinSeries:u:standalone") out.standalone.push(f);
      else out.other ??= f;
    }
    return out;
  }

  leave(reading: Reading, why: { construction: string; key?: string; reason: string }): void {
    this.left.push({ reading: reading.id, ...why });
  }

  reading(reading: Reading): void {
    const why = this.unrowed(reading);
    if (why) return this.leave(reading, why);
    const frames = this.readingFrames(reading);
    if (frames.other) return this.leave(reading, { construction: frames.other.construction, key: frames.other.key, reason: "noRow" });
    const kinds = [frames.hinge, frames.universal, frames.restrictor].filter(Boolean).length;
    if (kinds > 1 && !(frames.hinge && frames.universal)) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    for (const f of reading.frames) {
      if (f.key !== "slot:newMember") continue;
      if (f.hosted) this.newMembers.add(f.hosted);
      if (f.hosted?.kind === "list") f.hosted.members.forEach((m) => this.newMembers.add(m));
    }
    const out: string[] = [];
    const ctx: Ctx = { reading, id: str(reading.id), subst: new Map(), asserted: !frames.hinge && !frames.universal, out };
    const done = this.body(reading, frames, ctx);
    if (done !== true) return this.leave(reading, done);
    frames.standalone.forEach((frame) => this.notes.push({ reading: reading.id, frame }));
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
  }

  /** The reading's rules into `ctx.out`; true, or why it is left out. */
  body(reading: Reading, frames: ReturnType<Translator["readingFrames"]>, ctx: Ctx): true | { construction: string; key?: string; reason: string } {
    const claim = reading.claim;
    const denials = claimTerms(claim, false).filter((t): t is ListTerm => t.kind === "list" && !!t.frames?.some((f) => f.key === "joinSeries:u"));
    if (denials.length > 1) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
    const denial = denials[0];
    const whole = denial && denial.parts.length > 1 && denial.parts.at(-1)!.members.length === 0;

    // Universal: the list term becomes X, its kind the body (rows 8, 9, R1-2).
    let sign: 1 | -1 = 1;
    let open = false;
    const body: Literal[] = [];
    let list: Term | undefined;
    if (frames.universal) {
      const f = frames.universal;
      list = f.hosted;
      const none = f.key === "joinSeries:u:kind";
      const closed = list && universalInstance(list, none ? "u" : "ua");
      // Open `zuam` + kind: the same kind, read through the closed condition (the step itself never runs on it).
      const instance = closed ?? (list?.kind === "list" && !none && list.values.ending === "m" ? universalInstance({ ...list, values: { ...list.values, ending: "l" } }) : undefined);
      if (!list || !instance || instance.kind !== "thing" || instance.details.length) return { construction: f.construction, key: f.key, reason: "noRow" };
      open = !closed;
      if (none) sign = -1;
      if (denial && (none || whole)) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
      const k = name(instance.root);
      this.kinds.set(k, instance);
      ctx.subst.set(list, { text: "X" });
      body.push({ atom: `holds(isa(X,${k}))`, premise: `isa(X,${k})` });
      if (!claim.verb && !claim.predicate.length && Object.keys(claim.roles).length === 1) {
        if (!none || frames.hinge) return { construction: f.construction, key: f.key, reason: "noRow" };
        this.rule(ctx, `none(${ctx.id})`, body, "clash");
        return true;
      }
    }

    // Whole-list denial (row 4): the items cannot all hold.
    if (whole) {
      if (frames.hinge || frames.restrictor) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
      const lits: Literal[] = [];
      denial.members.forEach((m, i) => {
        const item = this.substituted(claim, denial, m, { ...ctx, asserted: false });
        const slot = `i(${ctx.id},${i + 1})`;
        this.slots.set(slot, { reading: reading.id, claim: item.claim });
        lits.push({ atom: `fits(${slot},P${i + 1})` }, { atom: `holds(P${i + 1})`, premise: `P${i + 1}` });
      });
      this.rule(ctx, `notall(${ctx.id})`, lits, "clash");
      return true;
    }

    // The heads: the claim, or each denied item (row 2).
    const heads: { text: string; claim: Claim; sign: 1 | -1 }[] = denial
      ? denial.members.map((m) => ({ ...this.substituted(claim, denial, m, { ...ctx, asserted: false }), sign: -1 as const }))
      : [{ text: this.rank(claim, ctx) ?? this.claim(claim, ctx), claim, sign }];
    if (frames.universal && denial) heads.forEach((h) => (h.sign = -1));
    const lit = (h: { text: string; sign: number }): string => (h.sign < 0 ? `neg(${h.text})` : h.text);

    if (frames.hinge) return this.hinge(reading, frames.hinge, heads, body, ctx);

    if (frames.restrictor) {
      const v = frames.restrictor.values;
      const listed = claim.details.some((d) => d.key === "unit:h");
      const always = v.series === "ua" && v.ending === "l";
      const never = v.series === "a" && v.ending === "l";
      const usually = v.series === "ua" && v.ending === "m";
      if (denial || !(always || never || usually) || (usually && listed)) return { construction: frames.restrictor.construction, key: frames.restrictor.key, reason: "noRow" };
      const h = heads[0]!;
      if (usually) {
        this.open(ctx, h.text, []);
      } else {
        if (!listed) this.rule(ctx, always ? h.text : `neg(${h.text})`, []);
        this.rule(ctx, h.text, [], always ? "always" : "never");
      }
      this.pool(reading, h.text, h.claim, never && !listed ? -1 : 1);
      return true;
    }

    for (const h of heads) {
      if (open) this.open(ctx, h.text, body);
      else this.rule(ctx, lit(h), body);
      if (list) this.templates.push({ ctx, list, claim: h.claim, sign: h.sign });
      else this.pool(reading, h.text, h.claim, h.sign);
    }

    // Membership (row 10): the claim keeps its list term, and each member (or each paired place) holds.
    if (!denial && !frames.universal) this.members(reading, claim, ctx);
    return true;
  }

  /** Row 9: an open generalization gives only *could be*; with everyday defaults switched on it holds until denied. */
  open(ctx: Ctx, head: string, body: Literal[]): void {
    const exception: Literal = { atom: `not holds(neg(${head}))` };
    this.rule(ctx, head, [...body, exception], "choice");
    this.rule(ctx, head, [...body, exception, { atom: "switch(defaults)" }]);
  }

  /** R1-8: a rank list of two with a shared scale and nothing else is data, `more(Scale, A, B)` (comparative-arity.md#amount-scale). */
  rank(claim: Claim, ctx: Ctx): string | undefined {
    const z = claim.roles.z;
    if (claim.verb || claim.predicate.length || claim.roles.d || claim.roles.b || claim.details.length) return undefined;
    if (z?.kind !== "list" || z.values.series !== "o" || z.members.length !== 2 || z.parts.length !== 1 || z.frames?.length || z.bound) return undefined;
    const scale = (z.sharedDetails ?? []).filter((d) => d.values.role === "scale");
    if (scale.length !== 1 || z.sharedDetails!.length !== 1) return undefined;
    return `more(${this.detail(scale[0]!, ctx)},${this.kind(z.members[0]!, "z1", ctx)},${this.kind(z.members[1]!, "z2", ctx)})`;
  }

  /** The claim with one list term replaced by one of its items. */
  substituted(claim: Claim, list: Term, item: Term, ctx: Ctx): { text: string; claim: Claim } {
    const enc = list === claim.verb && item.kind === "thing" ? name(item.root) : claim.predicate.includes(list) ? this.kind(item, "g", ctx) : this.term(item, placeOf(claim, list), ctx);
    const subst: Subst = new Map(ctx.subst);
    subst.set(list, { text: enc, term: item });
    const text = this.claim(claim, { ...ctx, subst });
    return { text, claim: replaceTerm(claim, list, item) };
  }

  members(reading: Reading, claim: Claim, ctx: Ctx): void {
    const lists = claimMemberLists(claim, reading);
    if (!lists.size) return;
    const groups = new Map<object | Term, ListTerm[]>();
    const order = (l: Term): number => ["z", "d", "b", "g"].indexOf(placeOf(claim, l)[0]!);
    for (const [l, g] of [...lists].sort((a, b) => order(a[0]) - order(b[0]))) {
      const key = g ?? l;
      groups.set(key, [...(groups.get(key) ?? []), l as ListTerm]);
    }
    for (const group of groups.values()) {
      const subst: Subst = new Map(ctx.subst);
      const body: Literal[] = [];
      group.forEach((l, i) => {
        const place = placeOf(claim, l);
        const ls = this.term(l, place, ctx);
        const v = group.length > 1 ? `X${i + 1}` : "X";
        subst.set(l, { text: v });
        body.push({ atom: `member(${ls},${v},G)` });
        l.members.forEach((m, j) => {
          const enc = claim.predicate.includes(l) ? this.kind(m, `${place}${j + 1}`, ctx) : this.term(m, `${place}${j + 1}`, ctx);
          this.facts.add(`member(${ls},${enc},${j + 1}).`);
        });
      });
      this.rule(ctx, this.claim(claim, { ...ctx, subst }), body);
      // Each member place as a ground term, for fits.
      const size = group[0]!.members.length;
      for (let j = 0; j < size; j++) {
        let c = claim;
        const s: Subst = new Map(ctx.subst);
        for (const l of group) {
          const m = asMember(l.members[j]!, l);
          const place = placeOf(claim, l);
          s.set(l, { text: claim.predicate.includes(l) ? this.kind(l.members[j]!, `${place}${j + 1}`, ctx) : this.term(l.members[j]!, `${place}${j + 1}`, ctx) });
          c = replaceTerm(c, l, m);
        }
        this.pool(reading, this.claim(claim, { ...ctx, subst: s }), c, 1);
      }
    }
  }

  /** Rows 5–7 and R1-5: a condition hinge; neither its condition nor its outcome is claimed. */
  hinge(reading: Reading, frame: Frame, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx): true | { construction: string; key?: string; reason: string } {
    const cond = frame.hosted?.kind === "clause" ? frame.hosted.reading : frame.content?.[0];
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    if (!cond || heads.length !== 1 || cond.frames.length || this.unrowed(cond) || claimTerms(cond.claim).some((t) => termFrames(t).length)) return bad;
    const condText = this.claim(cond.claim, { ...ctx, reading: cond, asserted: false });
    if (/\bX\b/.test(condText)) return bad;
    const gloss = frame.values.gloss;
    const h = heads[0]!;
    const c = `c(${ctx.id})`;
    const o = `o(${ctx.id})`;
    this.slots.set(c, { reading: cond.id, claim: cond.claim });
    this.pool(cond, condText, cond.claim, 1);
    const truth = (slot: string, n: string): Literal[] => [{ atom: `fits(${slot},${n})` }, { atom: `holds(${n})`, premise: n }];
    const falsity = (slot: string, n: string): Literal[] => [{ atom: `fits(${n},${slot})` }, { atom: `holds(neg(${n}))`, premise: `neg(${n})` }];
    const out = h.sign < 0 ? `neg(${h.text})` : h.text;
    const notOut = h.sign < 0 ? h.text : `neg(${h.text})`;
    const outTrue = (n: string): Literal[] => (h.sign < 0 ? falsity(o, n) : truth(o, n));
    const outFalse = (n: string): Literal[] => (h.sign < 0 ? truth(o, n) : falsity(o, n));
    const universal = body.length > 0;
    if (!universal) {
      this.slots.set(o, { reading: reading.id, claim: h.claim });
      this.pool(reading, h.text, h.claim, 1);
    }
    if (gloss === "if" || gloss === "iff") {
      this.rule(ctx, out, [...body, ...truth(c, "P")]);
      if (!universal) this.rule(ctx, `neg(${condText})`, outFalse("P"));
    }
    if (gloss === "only-if" || gloss === "iff") {
      this.rule(ctx, notOut, [...body, ...falsity(c, "P")]);
      if (!universal) this.rule(ctx, condText, outTrue("P"));
    }
    return true;
  }

  pool(reading: Reading, text: string, claim: Claim, sign: number): void {
    if (/\bX\d*\b/.test(text)) return;
    if (!this.terms.has(text)) this.terms.set(text, { reading: reading.id, claim });
    if (sign < 0) this.denied.add(text);
  }

  // ── After the readings ──

  finish(): string {
    // Universal templates with each individual, for fits.
    for (const t of this.templates) {
      for (const [text, term] of this.individuals) {
        const subst: Subst = new Map(t.ctx.subst);
        subst.set(t.list, { text, term });
        this.pool(t.ctx.reading, this.claim(t.claim, { ...t.ctx, subst, out: [] }), replaceTerm(t.claim, t.list, term), t.sign);
      }
    }
    const fits: string[] = [];
    const pool = [...this.terms];
    for (const [slot, s] of this.slots) {
      for (const [text, p] of pool) {
        if (match(s.claim, p.claim)) fits.push(`fits(${slot},${text}).`);
        if (match(p.claim, s.claim)) fits.push(`fits(${text},${slot}).`);
      }
    }
    for (const q of this.denied) {
      for (const [text, p] of pool) if (text !== q && match(this.terms.get(q)!.claim, p.claim)) fits.push(`fits(${q},${text}).`);
    }
    const heads: string[] = [];
    if (this.options.lexicon) {
      for (const [k, term] of this.kinds) {
        let from = k;
        for (const h of compoundHeads(term, this.options.lexicon)) {
          heads.push(`head(${from},${name(h)}).`);
          from = name(h);
        }
      }
    }
    const numbers: string[] = [];
    const values = [...this.values];
    for (const [a, va] of values) {
      for (const [b, vb] of values) {
        const order = a === b ? undefined : compareValues(va, vb);
        if (order !== undefined && order < 0) numbers.push(`less(${a},${b}).`);
        if (order === 0 && a < b) numbers.push(`same(${a},${b}).`);
      }
      for (const [r, range] of this.ranges) if (inRange(va, range)) numbers.push(`within(${a},${r}).`);
    }
    const switches = Object.entries(this.options.switches ?? {})
      .filter(([, on]) => on)
      .map(([s]) => `switch(${s}).`);
    const candidates = this.options.switches?.closed ? [...this.terms.keys()].map((t) => `candidate(${t}).`) : [];
    const section = (title: string, lines: string[]): string[] => (lines.length ? ["", `% ${title}`, ...lines] : []);
    return [
      ...GENERIC,
      ...section("Switches.", switches),
      "",
      ...this.lines,
      ...section("Fits, from match().", [...new Set(fits)]),
      ...section("Members, from claimMemberLists().", [...this.facts]),
      ...section("Compound heads, from compoundHeads().", [...new Set(heads)]),
      ...section("Number order, from compareValues().", numbers),
      ...section("Closed world.", candidates),
      "",
    ].join("\n");
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function termFrames(term: Term): Frame[] {
  return "frames" in term && term.frames ? term.frames : [];
}

function termDetails(term: Term): Detail[] {
  return "details" in term && term.details ? term.details : [];
}

/** The claim's own terms: verb, roles, predicate, and (with `deep`) list members. */
function claimTerms(claim: Claim, deep = true): Term[] {
  const top = [claim.verb, claim.roles.z, claim.roles.d, claim.roles.b, ...claim.predicate].filter((t): t is Term => t !== undefined);
  if (!deep) return top;
  const out: Term[] = [];
  const visit = (t: Term): void => {
    out.push(t);
    if (t.kind === "list") t.members.forEach(visit);
  };
  top.forEach(visit);
  return out;
}

function placeOf(claim: Claim, term: Term): string {
  if (claim.verb === term) return "v";
  for (const r of ["z", "d", "b"] as const) if (claim.roles[r] === term) return r;
  const i = claim.predicate.indexOf(term);
  return claim.predicate.length > 1 ? `g${i + 1}` : "g";
}

function replaceTerm(claim: Claim, from: Term, to: Term): Claim {
  const swap = (t: Term | undefined): Term | undefined => (t === from ? to : t);
  const roles: Claim["roles"] = {};
  for (const r of ["z", "d", "b"] as const) if (claim.roles[r]) roles[r] = swap(claim.roles[r]);
  return { ...claim, verb: swap(claim.verb), roles, predicate: claim.predicate.map((p) => swap(p)!) };
}

/** Translate a log's readings (top level; nested readings are reached through their frames) to a Clingo program. */
export function translate(log: Pick<Log, "readings">, options: TranslateOptions = {}): Translation {
  const t = new Translator(options);
  for (const reading of log.readings) t.reading(reading);
  const program = t.finish();
  return { program, readings: t.readings, terms: t.terms, slots: t.slots, left: t.left, notes: t.notes };
}
