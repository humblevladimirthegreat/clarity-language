/**
 * Translator (clingo-solver proposal, Sketch): a log's readings to a Clingo program, from the confirmed group (a) and (b) rows
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
import { CLOSED, namedEnglish } from "../closed-roots.js";
import { isGenericPronoun, isTopicPronoun } from "../parse/resolve.js";
import type { LexWord } from "../parse/types.js";
import type { Log, LogEntry } from "./log.js";
import { match } from "./match.js";
import { asMember, claimMemberLists, collective, compoundHeads, throughAntecedent, universalInstance, type ListTerm, type StepLexicon } from "./steps.js";
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

/**
 * What a group (b) reading's claim is wrapped in (clingo-solver R2-1): a holder's view, `view(H, T)`, or a say word,
 * `say(Who, Part, Reach, Answer, Ending, T)` with `to(X)` as a seventh argument for pair reach `e` on `z` / `d` / `b`.
 */
export type Wrap =
  | { kind: "view"; holder: string }
  | { kind: "say"; who: string; part: string; reach: string; answer: string; ending: string; to?: string };

/** A claim term inside its wrap, as the program writes it. */
export function wrapText(wrap: Wrap | undefined, inner: string): string {
  if (!wrap) return inner;
  if (wrap.kind === "view") return `view(${wrap.holder},${inner})`;
  return `say(${wrap.who},${wrap.part},${wrap.reach},${wrap.answer},${wrap.ending},${inner}${wrap.to ? `,${wrap.to}` : ""})`;
}

/** The claim term inside an atom with this wrap, or undefined when the atom has another wrap or none. */
export function unwrapText(wrap: Wrap, atom: string): string | undefined {
  const [before, after] = wrapText(wrap, "\u0000").split("\u0000") as [string, string];
  return atom.length > before.length + after.length && atom.startsWith(before) && atom.endsWith(after) ? atom.slice(before.length, atom.length - after.length) : undefined;
}

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
  /** Each wrapped reading's wrap (a holder's view, a say word), so a question with the same wrap is matched inside it. */
  wraps: Map<ReadingId, Wrap>;
  /** Each holder term and its English possessive (*Azozon's*), for a reply that names whose view clashes. */
  holders: Map<string, string>;
};

// ── Atoms ───────────────────────────────────────────────────────────────────

/** Function names the encoding uses; a root with one of these names is written through `act/N`. */
const RESERVED = new Set([
  "holds", "neg", "isa", "be", "on", "fired", "used", "fits", "clash", "member", "head", "switch", "candidate", "nm", "ls",
  "z", "d", "b", "g", "w", "dt", "v", "pct", "pts", "rk", "rke", "cd", "inf", "ninf", "rng", "count", "detail", "within",
  "less", "same", "always", "never", "notall", "none", "more", "c", "o", "i", "act", "lit", "pro", "cl", "quote", "speaker",
  "listener", "blank", "not", "view", "say", "via", "to", "grp", "sp", "rules", "unsaid", "interlocutors", "generic", "against",
  "requires",
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
type Ctx = { reading: Reading; id: string; subst: Subst; asserted: boolean; out: string[]; wrap?: Wrap };

const GENERIC = [
  "% Generic rules (clingo-solver E1).",
  "clash(P) :- holds(P), holds(neg(P)).",
  "clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).",
  "holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "holds(neg(P)) :- candidate(P), not holds(P), switch(closed).",
  "% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.",
  "clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).",
  "clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).",
  "% Say words (R2-7): the same party, part, reach and ending, allow or require against forbid; e clashes with nothing.",
  ...["", ", X"].flatMap((x) => [
    `clash(say(W, P, R, u, E, T${x})) :- holds(say(W, P, R, a, E, T${x})), holds(say(W, P, R, u, E, T${x})).`,
    `clash(say(W, P, R, u, E, T${x})) :- holds(say(W, P, R, o, E, T${x})), holds(say(W, P, R, u, E, T${x})).`,
    `clash(say(W, P, R, u, E, Q${x})) :- holds(say(W, P, R, a, E, T${x})), holds(say(W, P, R, u, E, Q${x})), fits(Q, T).`,
    `clash(say(W, P, R, u, E, Q${x})) :- holds(say(W, P, R, o, E, T${x})), holds(say(W, P, R, u, E, Q${x})), fits(Q, T).`,
  ]),
  "% A requirement gives permission (R2-8).",
  ...["", ", X"].flatMap((x) => {
    const body = `holds(say(W, P, R, o, E, T${x}))`;
    const head = `say(W, P, R, a, E, T${x})`;
    return [`holds(${head}) :- ${body}.`, `fired(requires, ${head}) :- ${body}.`, `used(requires, ${head}, say(W, P, R, o, E, T${x})) :- ${body}.`];
  }),
  "% An act against a stated ban (R2-9): data, never a clash.",
  ...["", ", X"].flatMap((x) =>
    [["T", ""], ["Q", ", fits(Q, T)"]].flatMap(([q, fit]) => {
      const head = `against(T, say(W, P, R, u, E${x}))`;
      const body = `holds(T), holds(say(W, P, R, u, E, ${q}${x}))${fit}`;
      return [`holds(${head}) :- ${body}.`, `fired(against, ${head}) :- ${body}.`, `used(against, ${head}, T) :- ${body}.`, `used(against, ${head}, say(W, P, R, u, E, ${q}${x})) :- ${body}.`];
    }),
  ),
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
  readonly wraps = new Map<ReadingId, Wrap>();
  readonly holders = new Map<string, string>();
  /** Each reading's turn speaker, when the log's entries are given. */
  readonly speakers = new Map<ReadingId, string>();

  constructor(readonly options: TranslateOptions) {}

  /** The speaker of a reading's turn as a term (`sp("a")`), or the constant `speaker` when the turn is not known. */
  speaker(reading: Reading): string {
    const who = this.speakers.get(reading.id.split("/")[0]!);
    return who === undefined ? "speaker" : `sp(${str(who)})`;
  }

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
        return this.speaker(ctx.reading);
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
  rule(ctx: Ctx, head: string, body: Literal[], pred: "holds" | "choice" | "clash" | "count" | "detail" | "via" | "always" | "never" = "holds", conclusion?: string): void {
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

  readingFrames(reading: Reading): { hinge?: Frame; universal?: Frame; restrictor?: Frame; holder?: Frame; channel?: Frame; say?: Frame; standalone: Frame[]; other?: Frame } {
    const out: ReturnType<Translator["readingFrames"]> = { standalone: [] };
    const holder = reading.frames.some((f) => f.key === "xFamily:holder");
    for (const f of reading.frames) {
      if (f.key === "slot:newMember") continue;
      // R2-1 row 1: a holder on a channel; a holder on MAY waits for MAY's row.
      if (f.key === "xFamily:holder" && !out.holder) out.holder = f;
      else if (holder && f.holderHost && f.key === "overlay:evidential:th" && !out.channel) out.channel = f;
      else if (f.key === "wordFamily:say" && !out.say) out.say = f;
      else
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
    const wrapped = this.wrap(reading, frames, ctx);
    if (wrapped && "reason" in wrapped) return this.leave(reading, wrapped);
    if (wrapped) {
      ctx.wrap = wrapped;
      ctx.asserted = false;
      if (frames.restrictor || (frames.say && (frames.hinge || frames.universal))) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    }
    const done = this.body(reading, frames, ctx);
    if (done !== true) return this.leave(reading, done);
    if (wrapped) this.wraps.set(reading.id, wrapped);
    frames.standalone.forEach((frame) => this.notes.push({ reading: reading.id, frame }));
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
  }

  /**
   * R2-1 rows 1 to 4: the wrap a holder, a carried holder, or a say word puts on the reading's claim, with its facts
   * (the channel as `via(Id, Channel)`, a first-mention holder's kind) into `ctx.out`. Undefined when it has none.
   */
  wrap(reading: Reading, frames: ReturnType<Translator["readingFrames"]>, ctx: Ctx): Wrap | { construction: string; key?: string; reason: string } | undefined {
    const say = frames.say;
    if (say && frames.holder) return { construction: "frameCombination", reason: "noRow" };
    if (say) {
      // Row 4 (permission-consent.md#say-words, #permission, #consent, #say-reach).
      const { reach = "", part = "", answer = "", ending = "" } = say.values;
      const v = { reach, part, answer, ending };
      const bad = { construction: say.construction, key: say.key, reason: "noRow" };
      if (![v.reach, v.part, v.answer, v.ending].every((x) => x && /^[a-z]+$/.test(x))) return bad;
      const hosted = say.hosted ? this.term(say.hosted, "bl", { ...ctx, asserted: false }) : undefined;
      let who: string | undefined;
      let to: string | undefined;
      if (v.part === "v") who = hosted ?? (v.ending === "m" ? this.speaker(reading) : v.ending === "l" ? "rules" : v.ending === "r" ? "unsaid" : undefined);
      else if (v.part === "z" || v.part === "d" || v.part === "b") {
        const filler = reading.claim.roles[v.part];
        who = filler ? this.term(filler, v.part, { ...ctx, asserted: false }) : undefined;
        if (hosted) to = v.reach.includes("e") ? `to(${hosted})` : undefined;
        if (hosted && !to) return bad;
      }
      if (!who) return bad;
      return { kind: "say", who, part: v.part, reach: v.reach, answer: v.answer, ending: v.ending, to };
    }
    let holder: string | undefined;
    let channel: Frame | undefined;
    if (frames.holder) {
      if (!frames.channel) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
      holder = this.holder(frames.holder, ctx);
      if (!holder) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
      channel = frames.channel;
    } else {
      // Row 2: a carried holder takes the holder of the reading it links to.
      const carried = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:holder");
      if (!carried) return undefined;
      const from = carried.to ? this.wraps.get(carried.to) : undefined;
      if (from?.kind !== "view") return { construction: carried.key, key: carried.key, reason: "noRow" };
      holder = from.holder;
      channel = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:channel")?.frame;
    }
    const gloss = channel?.values.gloss;
    if (gloss) this.rule(ctx, `via(${ctx.id},${name(gloss.toLowerCase())})`, [], "via");
    return { kind: "view", holder };
  }

  /**
   * Row 3, who the holder is (holder.md#naming-a-holder): a name is its root id, `-r` its antecedent's; a kind of person
   * is a first-mention noun, `nm(Id, h)` with its kind; R2-4: `-x` is `grp(H)`, the interlocutors and the generic
   * pronoun are their own holders. Undefined for a holder with no row: the topic pronoun (the reader gives it no
   * antecedent), the speaker and the listener.
   */
  holder(frame: Frame, ctx: Ctx): string | undefined {
    const party = frame.party ? throughAntecedent(frame.party) : undefined;
    if (party?.kind !== "thing") return undefined;
    const word = party.head;
    if (isTopicPronoun(word) || party.root === CLOSED.microphone || party.root === CLOSED.headphones) return undefined;
    let text: string;
    let english: string;
    if (isGenericPronoun(word)) [text, english] = ["generic", "the generic"];
    else if (party.root === CLOSED.handshake && party.named) [text, english] = ["interlocutors", "our"];
    else if (party.named) [text, english] = [name(party.root), `${namedEnglish(party.root)}'s`];
    else {
      text = `nm(${ctx.id},h)`;
      english = word.plural ? "some people's" : "someone's";
      this.kinds.set(name(party.root), party);
      this.rule(ctx, `isa(${text},${name(party.root)})`, []);
      this.holders.set(text, english);
      return text;
    }
    if (word.plural) [text, english] = [`grp(${text})`, english.replace(/'s$/, " and co.'s")];
    this.holders.set(text, english);
    return text;
  }

  /** A term inside the reading's wrap. */
  w(ctx: Ctx, inner: string): string {
    return wrapText(ctx.wrap, inner);
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
      // A collective verb (`-x`) says something of the group, not of each member: no per-member rule.
      if (collective(claim)) return { construction: f.construction, key: f.key, reason: "noRow" };
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
      // R2-5: inside a view, the kind is the holder's too.
      body.push({ atom: `holds(${this.w(ctx, `isa(X,${k})`)})`, premise: this.w(ctx, `isa(X,${k})`) });
      if (!claim.verb && !claim.predicate.length && Object.keys(claim.roles).length === 1) {
        if (!none || frames.hinge || ctx.wrap) return { construction: f.construction, key: f.key, reason: "noRow" };
        this.rule(ctx, `none(${ctx.id})`, body, "clash");
        return true;
      }
    }

    // Whole-list denial (row 4): the items cannot all hold.
    if (whole) {
      if (frames.hinge || frames.restrictor || ctx.wrap) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
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

    // R2-7, R2-9: a ban's act is matched against the acts it may meet, as a denied term is.
    const ban = ctx.wrap?.kind === "say" && ctx.wrap.answer === "u";
    for (const h of heads) {
      if (open) this.open(ctx, h.text, body);
      else this.rule(ctx, this.w(ctx, lit(h)), body);
      if (list) this.templates.push({ ctx, list, claim: h.claim, sign: ban ? -1 : h.sign });
      else this.pool(reading, h.text, h.claim, ban ? -1 : h.sign);
    }

    // Membership (row 10): the claim keeps its list term, and each member (or each paired place) holds; R2-5, inside a
    // view too. A say word's content stays one wrapped term.
    if (!denial && !frames.universal && ctx.wrap?.kind !== "say") this.members(reading, claim, ctx);
    return true;
  }

  /** Row 9: an open generalization gives only *could be*; with everyday defaults switched on it holds until denied. */
  open(ctx: Ctx, head: string, body: Literal[]): void {
    const exception: Literal = { atom: `not holds(${this.w(ctx, `neg(${head})`)})` };
    this.rule(ctx, this.w(ctx, head), [...body, exception], "choice");
    this.rule(ctx, this.w(ctx, head), [...body, exception, { atom: "switch(defaults)" }]);
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
      this.rule(ctx, this.w(ctx, this.claim(claim, { ...ctx, subst })), body);
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
    // R2-5: inside a view, the holder's own rule runs on the holder's views.
    const w = (t: string): string => this.w(ctx, t);
    const truth = (slot: string, n: string): Literal[] => [{ atom: `fits(${slot},${n})` }, { atom: `holds(${w(n)})`, premise: w(n) }];
    const falsity = (slot: string, n: string): Literal[] => [{ atom: `fits(${n},${slot})` }, { atom: `holds(${w(`neg(${n})`)})`, premise: w(`neg(${n})`) }];
    const out = w(h.sign < 0 ? `neg(${h.text})` : h.text);
    const notOut = w(h.sign < 0 ? h.text : `neg(${h.text})`);
    const outTrue = (n: string): Literal[] => (h.sign < 0 ? falsity(o, n) : truth(o, n));
    const outFalse = (n: string): Literal[] => (h.sign < 0 ? truth(o, n) : falsity(o, n));
    const universal = body.length > 0;
    if (!universal) {
      this.slots.set(o, { reading: reading.id, claim: h.claim });
      this.pool(reading, h.text, h.claim, 1);
    }
    if (gloss === "if" || gloss === "iff") {
      this.rule(ctx, out, [...body, ...truth(c, "P")]);
      if (!universal) this.rule(ctx, w(`neg(${condText})`), outFalse("P"));
    }
    if (gloss === "only-if" || gloss === "iff") {
      this.rule(ctx, notOut, [...body, ...falsity(c, "P")]);
      if (!universal) this.rule(ctx, w(condText), outTrue("P"));
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
export function translate(log: Pick<Log, "readings"> & { entries?: readonly LogEntry[] }, options: TranslateOptions = {}): Translation {
  const t = new Translator(options);
  // The turn's speaker (a say word's `-m` on `v`, `uwen` in a role), from the log's entries when given.
  for (const entry of log.entries ?? []) for (const r of entry.readings) t.speakers.set(r.id, entry.speaker);
  for (const reading of log.readings) t.reading(reading);
  const program = t.finish();
  return { program, readings: t.readings, terms: t.terms, slots: t.slots, left: t.left, notes: t.notes, wraps: t.wraps, holders: t.holders };
}
