/**
 * Translator (docs/meta/solver.md): a log's readings to a Clingo program, from the confirmed group (a) and (b) rows
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
import type { Addressed, Addressee, Log, LogEntry } from "./log.js";
import { match, type TermSite } from "./match.js";
import { asMember, claimMemberLists, collective, compoundHeads, throughAntecedent, universalInstance, type ListTerm, type StepLexicon } from "./steps.js";
import type { Claim, Detail, Frame, Reading, ReadingId, Term } from "./types.js";
import { compareValues, detailNumber, wordStem, wordValue, type NumberValue } from "./value.js";

export type TranslateOptions = {
  /** The parser's lexicon tables: compound heads (`head/2` facts) come from them. Without them no `head` facts. */
  lexicon?: StepLexicon;
  /** Host switches written as `switch(Name).` facts: `widen` (compound to head), `defaults` (everyday defaults), `closed` (closed world). */
  switches?: Partial<Record<"widen" | "defaults" | "closed", boolean>>;
};

/**
 * A reading left out of the program, as an `unread` part is: the turn is `beyond` for a solver job. Reason `noRow`: a
 * frame or combination with no row; `unused`: every frame has a row, but the rows that ran left a part of the reading
 * unused (the accounting guard), listed in `unused`.
 */
export type LeftOut = { reading: ReadingId; construction: string; key?: string; reason: string; unused?: string[] };

/**
 * A part of a reading a row must use, or the reading is left out (the accounting guard): a frame (with the frames held
 * inside it), a link, a SHARED detail after a join, a blank, and a list the matcher reads members of (`claimMemberLists`).
 */
export type Part = { kind: "frame" | "link" | "shared" | "blank" | "list"; of: object; reading: ReadingId; key: string; text: string };

/** A frame the program does not encode but a reply may mention (R1-9: standalone `thul` leaves the claim untouched). */
export type Note = { reading: ReadingId; frame: Frame };

/** A term in the program and the claim it stands for: the matcher's input for a question asked of the answer set. */
export type TermSource = { reading: ReadingId; claim: Claim };

/**
 * What a group (b) reading's claim is wrapped in (docs/meta/solver.md): a holder's view, `view(H, T)`, or a say word,
 * `say(Who, Part, Reach, Answer, Ending, T)` with `to(X)` as a seventh argument for pair reach `e` on `z` / `d` / `b`.
 */
export type Wrap =
  | { kind: "view"; holder: string; may?: boolean; say?: SayWrap }
  | SayWrap;

/** A say word's wrap. */
export type SayWrap = { kind: "say"; who: string; part: string; reach: string; answer: string; ending: string; to?: string };

/** The say word in a wrap: the wrap itself, or one a holder's view holds (R4a-13). */
export function sayOf(wrap: Wrap | undefined): SayWrap | undefined {
  return wrap?.kind === "say" ? wrap : wrap?.say;
}

/** A claim term inside its wrap, as the program writes it. */
export function wrapText(wrap: Wrap | undefined, inner: string): string {
  if (!wrap) return inner;
  // R3-6: the holder's own MAY is a term inside the view.
  if (wrap.kind === "view") return `view(${wrap.holder},${wrap.may ? `may(${inner})` : wrapText(wrap.say, inner)})`;
  return `say(${wrap.who},${wrap.part},${wrap.reach},${wrap.answer},${wrap.ending},${inner}${wrap.to ? `,${wrap.to}` : ""})`;
}

/** The claim term inside an atom with this wrap, or undefined when the atom has another wrap or none. */
export function unwrapText(wrap: Wrap, atom: string): string | undefined {
  const [before, after] = wrapText(wrap, "\u0000").split("\u0000") as [string, string];
  return atom.length > before.length + after.length && atom.startsWith(before) && atom.endsWith(after) ? atom.slice(before.length, atom.length - after.length) : undefined;
}

/**
 * R4e-1: a conditional term, `if(c(Id), o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), keyed by
 * its bare text. `denied`: the reading claims `neg(T)` (R4e-3).
 */
export type Conditional = { reading: ReadingId; name: "if" | "onlyif" | "iff"; id: string; negOut: boolean; denied: boolean };

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
  /**
   * Each reading's witness lines: the facts its first-mention nouns bring (kind, count, details) and a first-mention
   * holder's kind, never its claim. A question keeps only these on (solver.md#jobs).
   */
  witnesses: Map<ReadingId, Set<string>>;
  /** Each holder term and its English possessive (*Azozon's*), for a reply that names whose view clashes. */
  holders: Map<string, string>;
  /** Each reading in the program: its parts and the ones its rows used (all of them, or it would be in `left`). */
  accounting: Map<ReadingId, { parts: Part[]; used: ReadonlySet<object> }>;
  /** A reading's turn persons as the program writes them (`sp("a")`, `listener(0)`), for {@link match}'s sites. */
  site: (reading: ReadingId) => TermSite;
  /** R4e-1: each conditional term, bare, with its reading. */
  conditionals: Map<string, Conditional>;
  /** R4e-2: for each conditional term B, the conditional terms A that say at least B (`fits(B, A)`). */
  conditionalFits: Map<string, Set<string>>;
};

// ── Atoms ───────────────────────────────────────────────────────────────────

/** Function names the encoding uses; a root with one of these names is written through `act/N`. */
const RESERVED = new Set([
  "holds", "neg", "isa", "be", "on", "fired", "used", "fits", "clash", "member", "head", "switch", "candidate", "nm", "ls",
  "z", "d", "b", "g", "w", "dt", "v", "pct", "pts", "rk", "rke", "cd", "inf", "ninf", "rng", "count", "detail", "within",
  "less", "same", "always", "never", "notall", "none", "more", "c", "o", "i", "act", "lit", "pro", "cl", "quote", "speaker",
  "listener", "blank", "not", "view", "say", "via", "to", "grp", "sp", "rules", "unsaid", "interlocutors", "generic", "against",
  "requires", "may", "maybe", "some", "noneof", "notone", "likely", "bans", "cause", "fault", "share", "plan", "channel",
  "if", "onlyif", "iff", "we", "every", "because",
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
/**
 * `choice`: each `holds` rule is a choice (R3-1 rows 1, 4, 6, 8; R3-7). `gate`: a literal every rule of the content takes
 * beside `on(Id)` (R3-1 row 5, `maybe(Id)`). `deny`: the claim is denied (R3-7, no chance).
 */
type Ctx = { reading: Reading; id: string; subst: Subst; asserted: boolean; out: string[]; wrap?: Wrap; choice?: boolean; gate?: string; deny?: boolean };
type Why = { construction: string; key?: string; reason: string };
/** Where MAY sits against a hinge: over it (a gate), under it (the outcome), or right before *because* (only the link). */
type MayOver = "gate" | "outcome" | "link";
type Frames = { hinge?: Frame; universal?: Frame; restrictor?: Frame; holder?: Frame; channel?: Frame; say?: Frame; may?: Frame; mayHost?: Frame; likely?: Frame; because?: Frame; zone?: Frame; standalone: Frame[]; other?: Frame };

/**
 * Say rows 6 to 8 (R2-7, R2-8): which say words clash, a requirement's permission, a ban's denial. `w` wraps each
 * term: plain in every program; R4a-13 runs them inside a holder's view, `view(V, say(..))`, where one is held.
 */
function sayRules(w: (t: string) => string): string[] {
  return [
    "% Say words (R2-7): the same party, part, reach and ending, allow or require against forbid; e clashes with nothing.",
    ...["", ", X"].flatMap((x) => [
      `clash(${w(`say(W, P, R, u, E, T${x})`)}) :- holds(${w(`say(W, P, R, a, E, T${x})`)}), holds(${w(`say(W, P, R, u, E, T${x})`)}).`,
      `clash(${w(`say(W, P, R, u, E, T${x})`)}) :- holds(${w(`say(W, P, R, o, E, T${x})`)}), holds(${w(`say(W, P, R, u, E, T${x})`)}).`,
      `clash(${w(`say(W, P, R, u, E, Q${x})`)}) :- holds(${w(`say(W, P, R, a, E, T${x})`)}), holds(${w(`say(W, P, R, u, E, Q${x})`)}), fits(Q, T).`,
      `clash(${w(`say(W, P, R, u, E, Q${x})`)}) :- holds(${w(`say(W, P, R, o, E, T${x})`)}), holds(${w(`say(W, P, R, u, E, Q${x})`)}), fits(Q, T).`,
    ]),
    "% A requirement gives permission (R2-8).",
    ...["", ", X"].flatMap((x) => {
      const body = `holds(${w(`say(W, P, R, o, E, T${x})`)})`;
      const head = w(`say(W, P, R, a, E, T${x})`);
      return [`holds(${head}) :- ${body}.`, `fired(requires, ${head}) :- ${body}.`, `used(requires, ${head}, ${w(`say(W, P, R, o, E, T${x})`)}) :- ${body}.`];
    }),
    "% A ban denies the matching permission (permission-consent.md#requirement).",
    ...["", ", X"].flatMap((x) =>
      [["T", ""], ["Q", ", fits(T, Q)"]].flatMap(([q, fit]) => {
        const body = `holds(${w(`say(W, P, R, u, E, T${x})`)})${fit}`;
        const head = w(`neg(say(W, P, R, a, E, ${q}${x}))`);
        return [`holds(${head}) :- ${body}.`, `fired(bans, ${head}) :- ${body}.`, `used(bans, ${head}, ${w(`say(W, P, R, u, E, T${x})`)}) :- ${body}.`];
      }),
    ),
  ];
}

/** R4a-13: say rows 6 to 8 inside a holder's view, written only when a reading holds a say word in a view. */
const VIEW_SAY = sayRules((t) => `view(V, ${t})`).filter((l) => !l.startsWith("%"));

const GENERIC = [
  "% Generic rules (docs/meta/solver.md).",
  "clash(P) :- holds(P), holds(neg(P)).",
  "clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).",
  "holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "fired(widen, isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "used(widen, isa(X, H), isa(X, C)) :- holds(isa(X, C)), head(C, H), switch(widen).",
  "holds(neg(P)) :- candidate(P), not holds(P), switch(closed).",
  "% A holder's view (R2-1 row 1, R2-2): one holder's views clash; two holders' never do, nor a view and your claim.",
  "clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).",
  "clash(view(H, Q)) :- holds(view(H, neg(Q))), holds(view(H, P)), fits(Q, P).",
  ...sayRules((t) => t),
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
/** R4e-1: a condition hinge's gloss and its conditional term's name. */
const CONDITIONAL: Record<string, Conditional["name"]> = { if: "if", "only-if": "onlyif", iff: "iff" };

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
  readonly witnesses = new Map<ReadingId, Set<string>>();
  /** Each reading's turn speaker, when the log's entries are given. */
  readonly speakers = new Map<ReadingId, string>();
  /** Each reading's turn, by its place in the log's entries, when they are given. */
  readonly turns = new Map<ReadingId, number>();
  /** Each reading's turn addressees (`LogEntry.addressees`, D16), when the turn has any. */
  readonly addressees = new Map<ReadingId, Addressed>();
  /** The log's readings by id, for a link that names one (a backward stand-in's sentence). */
  readonly byId = new Map<ReadingId, Reading>();
  /** The accounting guard: the parts the current reading's rows used, and the readings whose claims they wrote. */
  used = new Set<object>();
  visited: Reading[] = [];
  /** The kind word of the current reading's universal: a pronoun that resumes it is bound by the universal (no row yet). */
  bound = new Set<LexWord>();
  readonly accounting = new Map<ReadingId, { parts: Part[]; used: ReadonlySet<object> }>();
  readonly conditionals = new Map<string, Conditional>();
  readonly conditionalFits = new Map<string, Set<string>>();

  constructor(readonly options: TranslateOptions) {}

  /** The speaker of a reading's turn as a term (`sp("a")`), or the constant `speaker` when the turn is not known. */
  speaker(reading: Reading): string {
    const who = this.speakers.get(reading.id.split("/")[0]!);
    return who === undefined ? "speaker" : `sp(${str(who)})`;
  }

  /**
   * R4a-8 (D16): the one addressed in a reading's turn, from `LogEntry.addressees` (never the call frames on a reading):
   * with exactly one addressee, that addressee's term (a call's party as a term in a role, another speaker `sp("…")`);
   * with none or several (R4a decision 1), `listener(N)`, N the turn's place in the log, which fits no other turn's.
   * The constant `listener` when the turn is not known (a question).
   */
  listener(reading: Reading | ReadingId): string {
    const id = (typeof reading === "string" ? reading : reading.id).split("/")[0]!;
    const turn = this.turns.get(id);
    if (turn === undefined) return "listener";
    const to = this.addressees.get(id)?.to ?? [];
    return (to.length === 1 ? this.person(to[0]!) : undefined) ?? `listener(${turn})`;
  }

  /** An addressee as a term: another speaker `sp("…")`; a call's party as in a role (a name, through `-r`'s antecedent). */
  person(a: Addressee): string | undefined {
    if (a.kind === "speaker") return `sp(${str(a.speaker)})`;
    const t = throughAntecedent(a.party);
    if (t.kind !== "thing") return undefined;
    return this.consts.get(t) ?? name(t.root);
  }

  /**
   * R4a-7: `zaya` in a reading's turn, `we(S, A1, …, Ak)`: the turn speaker and the turn's addressees, sorted by text so
   * one pair of people is one term whoever speaks. `we(N)` when the turn has no addressees, fitting no other turn's; the
   * constant `we` when the turn is not known (a question).
   */
  we(reading: Reading | ReadingId): string {
    const id = (typeof reading === "string" ? reading : reading.id).split("/")[0]!;
    const turn = this.turns.get(id);
    if (turn === undefined) return "we";
    const to = this.addressees.get(id)?.to ?? [];
    if (!to.length) return `we(${turn})`;
    const who = this.speakers.get(id);
    const members = [...new Set([who === undefined ? "speaker" : `sp(${str(who)})`, ...to.map((a) => this.person(a) ?? `listener(${turn})`)])].sort();
    return `we(${members.join(",")})`;
  }

  /** A reading's turn persons as the program writes them, so a speaker, listener or `zaya` term fits only its own turn's. */
  site(id: ReadingId): TermSite {
    const who = this.speakers.get(id.split("/")[0]!);
    return { speaker: who === undefined ? "speaker" : `sp(${str(who)})`, listener: this.listener(id), we: this.we(id) };
  }

  // ── Terms ──

  /**
   * A pronoun written uses its anaphor link: through its antecedent, or as its own constant when the resolver found
   * none. Not when a universal binds the antecedent: the pronoun would be written as the kind (no row yet).
   */
  resume(term: Term, ctx: Ctx): void {
    if (term.kind !== "pronoun") return;
    const t = throughAntecedent(term);
    if (t.kind === "thing" && this.bound.has(t.head)) return;
    for (const l of ctx.reading.links) if (l.kind === "anaphor" && l.words.includes(term.word)) this.used.add(l);
  }

  term(term: Term, place: string, ctx: Ctx): string {
    const own = ctx.subst.get(term);
    if (own) return own.text;
    this.resume(term, ctx);
    const t = throughAntecedent(term);
    const sub = ctx.subst.get(t);
    if (sub) return sub.text;
    const known = this.consts.get(t);
    if (known) return known;
    switch (t.kind) {
      case "thing": {
        if (t.named && t.root === CLOSED.handshake && !t.head.plural) return this.we(ctx.reading);
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
        return this.listener(ctx.reading);
      case "pronoun":
        return `pro(${ctx.id},${str(t.word.raw)})`;
      case "blank":
        return "blank";
      case "literal":
        return `lit(${str(t.payload)})`;
      case "clause":
        // A content clause is one term; the stand-in that names it is written with it.
        if (!this.visited.includes(t.reading)) this.visited.push(t.reading);
        for (const l of ctx.reading.links) if (l.kind === "standIn" && l.to === t.reading.id) this.use(l);
        return `cl(${this.claim(t.reading.claim, { ...ctx, reading: t.reading, asserted: false })})`;
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
    this.witness(ctx, `isa(${text},${name(t.root)})`);
    for (const detail of t.details) {
      const number = detailNumber(detail);
      if (number) {
        const range = detailRange(detail);
        if (range) {
          this.ranges.set(range.text, range.range);
          range.ends.forEach((end) => this.value(end));
          this.witness(ctx, `count(${text},${range.text})`, "count");
        } else if (wordValue(number)) this.witness(ctx, `count(${text},${this.value(number)})`, "count");
        continue;
      }
      this.witness(ctx, `detail(${text},${this.detail(detail, ctx)})`, "detail");
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
    this.resume(term, ctx);
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
  rule(ctx: Ctx, head: string, body: Literal[], kind: "holds" | "choice" | "clash" | "count" | "detail" | "via" | "always" | "never" | "likely" | "some" | "gate" = "holds", conclusion?: string): void {
    const on = `on(${ctx.id})`;
    const pred = kind === "holds" && ctx.choice ? "choice" : kind;
    if (ctx.gate && pred !== "gate") body = [...body, { atom: ctx.gate }];
    const atoms = [...body.map((l) => l.atom), on].join(", ");
    const marker = pred === "always" || pred === "never";
    const c = conclusion ?? (marker ? `${pred}(${head})` : head);
    const atom = pred === "holds" ? `holds(${head})` : pred === "choice" ? `{ holds(${head}) }` : pred === "gate" ? `{ ${head} }` : pred === "clash" || marker ? `${pred}(${head})` : head;
    ctx.out.push(`${atom} :- ${atoms}.`);
    const firedBody = pred === "choice" ? [`holds(${head})`, ...body.map((l) => l.atom), on].join(", ") : pred === "gate" ? [head, ...body.map((l) => l.atom), on].join(", ") : atoms;
    ctx.out.push(`fired(${ctx.id},${c}) :- ${firedBody}.`);
    for (const l of body) if (l.premise) ctx.out.push(`used(${ctx.id},${c},${l.premise}) :- ${firedBody}.`);
  }

  /**
   * A first-mention noun's fact as {@link rule} writes it, its lines kept as the reading's witness. Not under MAY's
   * choice: a question there keeps no witness.
   */
  witness(ctx: Ctx, head: string, kind: "holds" | "count" | "detail" = "holds"): void {
    const from = ctx.out.length;
    this.rule(ctx, head, [], kind);
    if (ctx.choice) return;
    const lines = this.witnesses.get(ctx.reading.id) ?? new Set<string>();
    ctx.out.slice(from).forEach((l) => lines.add(l));
    this.witnesses.set(ctx.reading.id, lines);
  }

  // ── Readings ──

  /** Why a reading has no row, or undefined when every frame on it has one. */
  unrowed(reading: Reading): { construction: string; key?: string; reason: string } | undefined {
    if (reading.unread.length) {
      const u = reading.unread[0]!;
      return { construction: u.construction, key: u.key, reason: u.reason };
    }
    if (reading.claim.clauses) return { construction: "clauseJoin", reason: "noRow" };
    if (reading.stanceLists?.length && !mayDenied(reading) && !becauseDenied(reading) && !hingeDenied(reading)) return { construction: reading.stanceLists[0]!.construction, key: reading.stanceLists[0]!.key, reason: "noRow" };
    const terms = claimTerms(reading.claim);
    for (const t of terms) {
      for (const f of termFrames(t)) if (!(t.kind === "list" && f.key === "joinSeries:u")) return { construction: f.construction, key: f.key, reason: "noRow" };
      for (const d of termDetails(t)) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    }
    for (const d of reading.claim.details) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    return undefined;
  }

  readingFrames(reading: Reading): Frames {
    const out: Frames = { standalone: [] };
    const holder = reading.frames.some((f) => f.key === "xFamily:holder");
    const denied = mayDenied(reading);
    for (const f of reading.frames) {
      if (f.key === "slot:newMember" || f.key === "edge:vocative") continue;
      // R3-1 row 3: MAY denied (`thomam thul`) is a plain claim; the frame goes to the notes.
      if (f === denied) continue;
      // R2-1 row 1: a holder on a channel; R3-1 row 4: a holder on MAY.
      if (f.key === "xFamily:holder" && !out.holder) out.holder = f;
      else if (holder && f.holderHost && f.key === "overlay:evidential:th" && !out.channel) out.channel = f;
      else if (holder && f.holderHost && f.key === "overlay:may:th" && !out.mayHost) out.mayHost = f;
      else if (f.key === "overlay:may:th" && !f.holderHost && !out.may) out.may = f;
      else if (f.key === "lexReading:number:th" && !out.likely) out.likely = f;
      else if (f.key === "wordFamily:say" && !out.say) out.say = f;
      // R2-1 rows 5 to 8: *because* and its fault and share endings; row 9: contrary to.
      else if (HINGE_KEYS.has(f.key) && /^because(\.|$)/.test(f.values.gloss ?? "") && !out.because) out.because = f;
      else if (f.key === "hookJob:zone" && !out.zone) out.zone = f;
      else
      if (HINGE_KEYS.has(f.key) && ["if", "only-if", "iff"].includes(f.values.gloss ?? "") && !out.hinge) out.hinge = f;
      else if ((f.key === "joinSeries:ua" || f.key === "joinSeries:u:kind") && !out.universal) out.universal = f;
      else if (f.key === "lexReading:restrictor" && !out.restrictor) out.restrictor = f;
      else if (f.key === "joinSeries:u:standalone") out.standalone.push(f);
      else out.other ??= f;
    }
    return out;
  }

  leave(reading: Reading, why: { construction: string; key?: string; reason: string; unused?: string[] }): void {
    this.left.push({ reading: reading.id, ...why });
  }

  /** Mark parts used; undefined ones are skipped. */
  use(...parts: (object | undefined)[]): void {
    for (const p of parts) if (p) this.used.add(p);
  }

  /** A frame and the stance list that denies it (`thul`): the list's own polarity frames are used with it. */
  useDenied(reading: Reading, frame: Frame): void {
    this.use(frame);
    for (const list of reading.stanceLists ?? []) if (list.members.includes(frame)) this.use(...(list.inner ?? []));
  }

  /** A SHARED link is used when every SHARED detail of the list its join closes is. */
  useSharedLinks(): void {
    for (const v of this.visited) {
      const lists = claimTerms(v.claim).filter((t): t is ListTerm => t.kind === "list");
      for (const l of v.links) {
        if (l.kind !== "shared" && l.kind !== "verbShared") continue;
        const own = lists.filter((t) => t.join && l.words.includes(t.join));
        if (own.length && own.every((t) => (t.sharedDetails ?? []).every((d) => this.used.has(d)))) this.use(l);
      }
    }
  }

  reading(reading: Reading): void {
    this.used = new Set();
    this.visited = [reading];
    this.bound = new Set();
    const g = nounHinge(reading);
    if (g) return this.nounHinge(reading, g);
    const why = this.unrowed(reading);
    if (why) return this.leave(reading, why);
    // R4a-8: a call is read through `LogEntry.addressees`, so its frame is used; a reading with only a call claims nothing.
    this.use(...reading.frames.filter((f) => f.key === "edge:vocative"));
    if (reading.frames.length && reading.frames.every((f) => f.key === "edge:vocative") && isEmptyClaim(reading.claim)) {
      this.accounting.set(reading.id, { parts: readingParts(reading), used: this.used });
      this.readings.push(reading.id);
      this.lines.push(`% ${reading.id}`, `on(${str(reading.id)}).`);
      return;
    }
    const frames = this.readingFrames(reading);
    if (frames.other) return this.leave(reading, { construction: frames.other.construction, key: frames.other.key, reason: "noRow" });
    // R4a-12 (D1): a say word over a hinge, *because*, MAY or a contrary zone keeps the wrap as data.
    const sayOver = frames.say ? [frames.hinge, frames.because, frames.may, frames.zone].filter((f): f is Frame => !!f) : [];
    if (frames.say && sayOver.length === 1 && over(reading, frames.say, sayOver[0]!)) return this.sayData(reading, frames, sayOver[0]!);
    const kinds = [frames.hinge, frames.universal, frames.restrictor].filter(Boolean).length;
    if (kinds > 1 && !(frames.hinge && frames.universal)) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    // R2-1 row 8: a hinge beside *because* only as *only because*, `thebem` over `thahum`; contrary to only on a plain claim.
    const lone = !(frames.may || frames.mayHost || frames.likely || frames.holder || frames.say || frames.restrictor);
    const onlyBecause = !frames.hinge || (frames.because && frames.hinge.values.gloss === "only-if" && over(reading, frames.hinge, frames.because) && !becauseDenied(reading));
    // R4b-2: *because* inside a holder's view; R4b-5, R4b-6 (D3, D11): MAY right before or after it; R4b-7 (D12): under
    // `hual` / `huam`, the restrictor over the hinge.
    const becauseOk =
      !(frames.mayHost || frames.likely || frames.say || frames.zone) &&
      onlyBecause &&
      (!frames.may || !(frames.holder || frames.hinge || frames.restrictor)) &&
      (!frames.restrictor || (!frames.holder && !frames.hinge && !!frames.because && over(reading, frames.restrictor, frames.because)));
    if (frames.because && !becauseOk) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    if (frames.zone && !(lone && !frames.hinge && !frames.universal)) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    for (const f of reading.frames) {
      if (f.key !== "slot:newMember") continue;
      this.use(f);
      if (f.hosted) this.newMembers.add(f.hosted);
      if (f.hosted?.kind === "list") f.hosted.members.forEach((m) => this.newMembers.add(m));
    }
    const out: string[] = [];
    const ctx: Ctx = { reading, id: str(reading.id), subst: new Map(), asserted: (!frames.hinge || !!frames.because) && !frames.universal, out };
    const combination = { construction: "frameCombination", reason: "noRow" };
    const may = frames.may ?? frames.mayHost;
    // R3-1 rows 4 to 6, R3-6: which MAY rows combine with the reading's other frames.
    if (frames.may && (frames.mayHost || frames.say || frames.universal || frames.restrictor || frames.likely)) return this.leave(reading, combination);
    if (frames.may && frames.holder && (frames.hinge || !over(reading, frames.holder, frames.may))) return this.leave(reading, combination);
    if (frames.mayHost && (frames.hinge || frames.universal || frames.restrictor || frames.likely)) return this.leave(reading, combination);
    if (frames.likely && (frames.hinge || frames.universal || frames.restrictor || frames.holder || frames.say)) return this.leave(reading, combination);
    let mayOver: MayOver | undefined;
    if (frames.may && frames.because) {
      // R4b-5 (D3): MAY right before *because* hedges only the link; R4b-6 (D11): *because* over MAY makes the outcome possible.
      if (over(reading, frames.may, frames.because)) mayOver = "link";
      else if (over(reading, frames.because, frames.may)) mayOver = "outcome";
      else return this.leave(reading, combination);
    } else if (frames.may && frames.hinge) {
      if (over(reading, frames.may, frames.hinge)) mayOver = "gate";
      else if (over(reading, frames.hinge, frames.may)) mayOver = "outcome";
      else return this.leave(reading, combination);
    }
    const wrapped = this.wrap(reading, frames, ctx);
    if (wrapped && "reason" in wrapped) return this.leave(reading, wrapped);
    // R4b-2: *because* runs inside a holder's own view, never under a say word.
    if (wrapped && (frames.zone || (frames.because && (wrapped.kind !== "view" || wrapped.say)))) return this.leave(reading, combination);
    if (wrapped) {
      // R3-6: the holder covers its own MAY. A carried holder on a MAY sentence has no row.
      if (frames.may && !frames.holder) return this.leave(reading, combination);
      if (frames.may && wrapped.kind === "view") wrapped.may = true;
      ctx.wrap = wrapped;
      ctx.asserted = false;
      // R4a-1: a restrictor runs inside a holder's view; a say word keeps no restrictor.
      // R4a-9: a hinge over a say word; R4a-10, R4a-11: a universal with a plain say word, either order.
      const hingeOverSay = !!frames.hinge && wrapped.kind === "say" && !!frames.say && over(reading, frames.hinge, frames.say) && !frames.universal;
      const sayUniversal = !!frames.universal && wrapped.kind === "say" && !frames.hinge;
      if ((frames.restrictor && wrapped.kind !== "view") || frames.likely || (frames.say && (frames.restrictor || (frames.hinge && !hingeOverSay) || (frames.universal && !sayUniversal)))) return this.leave(reading, combination);
    }
    if (frames.mayHost || (frames.may && !frames.holder && !mayOver)) ctx.choice = true;
    if (frames.likely) {
      const likely = this.likely(frames.likely, ctx);
      if (likely !== true) return this.leave(reading, likely);
    }
    const done = this.body(reading, frames, ctx, mayOver);
    if (done !== true) return this.leave(reading, done);
    const denied = mayDenied(reading);
    this.use(frames.may, frames.mayHost, frames.likely, ...frames.standalone);
    if (denied) this.useDenied(reading, denied);
    this.useSharedLinks();
    // R1-3: a first mention in a nested reading is written as its kind, as one under a hinge is.
    for (const v of this.visited) this.use(...v.frames.filter((f) => f.key === "slot:newMember"));
    const parts = this.visited.flatMap((v) => readingParts(v, v === reading));
    const unused = parts.filter((p) => !this.used.has(p.of));
    if (unused.length) {
      const first = unused[0]!;
      return this.leave(reading, { construction: first.key, key: first.key, reason: "unused", unused: unused.map((p) => p.text) });
    }
    this.accounting.set(reading.id, { parts, used: this.used });
    if (wrapped) this.wraps.set(reading.id, wrapped);
    if (may) this.notes.push({ reading: reading.id, frame: may });
    if (denied) this.notes.push({ reading: reading.id, frame: reading.stanceLists![0]!.inner?.[0] ?? denied });
    frames.standalone.forEach((frame) => this.notes.push({ reading: reading.id, frame }));
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
  }

  /**
   * R4a-12 (D1): a say word over a hinge, *because*, MAY or a contrary zone: `holds(say(W, P, R, A, E, D)) :- on(Id).` with
   * `D` the wrapped content as one term, `if(C, O)`, `onlyif(C, O)`, `iff(C, O)`, `because(C, O)`, `may(T)` or
   * `against(T, Z)`. Nothing else: no part holds, no MAY choice, no hinge rule.
   */
  sayData(reading: Reading, frames: Frames, inner: Frame): void {
    const combination = { construction: "frameCombination", reason: "noRow" };
    if (frames.holder || frames.mayHost || frames.likely || frames.restrictor || frames.universal || reading.stanceLists?.length) return this.leave(reading, combination);
    if (reading.links.some((l) => l.kind === "carriedFrame" && l.key === "carry:holder")) return this.leave(reading, combination);
    if (claimTerms(reading.claim).some((t) => t.kind === "list" || termFrames(t).length)) return this.leave(reading, combination);
    const out: string[] = [];
    const ctx: Ctx = { reading, id: str(reading.id), subst: new Map(), asserted: false, out };
    const say = this.sayWrap(reading, frames.say!, ctx);
    if ("reason" in say) return this.leave(reading, say);
    const bad = { construction: inner.construction, key: inner.key, reason: "noRow" };
    const t = this.claim(reading.claim, ctx);
    let d: string;
    if (inner === frames.hinge || inner === frames.because) {
      const gloss = inner.values.gloss ?? "";
      const fn = inner === frames.because ? (gloss === "because" ? "because" : undefined) : CONDITIONAL[gloss];
      const noun = this.nounCondition(inner);
      const cond = noun ? undefined : this.condition(reading, inner);
      if (!fn || (!noun && (!cond || cond.frames.some((f) => f.key !== "slot:newMember") || this.unrowed(cond) || claimTerms(cond.claim).some((x) => termFrames(x).length || isOrList(x))))) return this.leave(reading, bad);
      d = `${fn}(${noun?.text ?? this.claim(cond!.claim, { ...ctx, reading: cond! })},${t})`;
      this.use(inner);
    } else if (inner === frames.may) {
      d = `may(${t})`;
      this.use(inner);
    } else {
      const zone = this.zone(reading, inner, ctx);
      if ("reason" in zone) return this.leave(reading, zone);
      d = `against(${t},${zone.term})`;
    }
    this.rule(ctx, wrapText(say, d), []);
    for (const v of this.visited) this.use(...v.frames.filter((f) => f.key === "slot:newMember"));
    const parts = this.visited.flatMap((v) => readingParts(v, v === reading));
    const unused = parts.filter((p) => !this.used.has(p.of));
    if (unused.length) return this.leave(reading, { construction: unused[0]!.key, key: unused[0]!.key, reason: "unused", unused: unused.map((p) => p.text) });
    this.accounting.set(reading.id, { parts, used: this.used });
    this.wraps.set(reading.id, say);
    if (inner === frames.may) this.notes.push({ reading: reading.id, frame: inner });
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
  }

  /**
   * R2-1 rows 1 to 4: the wrap a holder, a carried holder, or a say word puts on the reading's claim, with its facts
   * (the channel as `via(Id, Channel)`, a first-mention holder's kind) into `ctx.out`. Undefined when it has none.
   */
  wrap(reading: Reading, frames: Frames, ctx: Ctx): Wrap | Why | undefined {
    // R4a-13: a holder over a say word, stated or carried, nests both wraps, `view(H, say(..))`.
    const inner = frames.say ? this.sayWrap(reading, frames.say, ctx) : undefined;
    if (inner && "reason" in inner) return inner;
    let holder: string | undefined;
    let channel: Frame | undefined;
    if (frames.holder) {
      if (!frames.channel && !frames.mayHost) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
      holder = this.holder(frames.holder, ctx);
      if (!holder) return { construction: frames.holder.construction, key: frames.holder.key, reason: "noRow" };
      this.use(frames.holder);
      channel = frames.channel;
    } else {
      // Row 2: a carried holder takes the holder of the reading it links to.
      const carried = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:holder");
      if (!carried) return inner;
      const from = carried.to ? this.wraps.get(carried.to) : undefined;
      if (from?.kind !== "view") return { construction: carried.key, key: carried.key, reason: "noRow" };
      holder = from.holder;
      this.use(carried);
      const link = reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:channel");
      channel = link?.frame;
      if (channel?.values.gloss) this.use(link);
    }
    const gloss = channel?.values.gloss;
    if (gloss) {
      this.rule(ctx, `via(${ctx.id},${name(gloss.toLowerCase())})`, [], "via");
      this.use(channel);
    }
    return { kind: "view", holder, ...(inner?.kind === "say" ? { say: inner } : {}) };
  }

  /** Row 4 (permission-consent.md#say-words, #permission, #consent, #say-reach): a say word's wrap, or why it has none. */
  sayWrap(reading: Reading, say: Frame, ctx: Ctx): Wrap | Why {
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
      const fence = reading.frames.find((f) => f.key === "joinSeries:ua" || f.key === "joinSeries:u:kind")?.hosted;
      who = filler && filler === fence ? "X" : filler ? this.term(filler, v.part, { ...ctx, asserted: false }) : undefined;
      if (hosted) to = v.reach.includes("e") ? `to(${hosted})` : undefined;
      if (hosted && !to) return bad;
    }
    if (!who) return bad;
    this.use(say);
    return { kind: "say", who, part: v.part, reach: v.reach, answer: v.answer, ending: v.ending, to };
  }

  /**
   * R2-1 row 9, R2-11 (contrary-to.md#contrary-to-stance): the zone after `uom`, `plan(H)` or `say(Who, Part, Reach,
   * Answer, Ending[, to(X)])` with the say word's wrap. A plan with no holder is the turn speaker's. A channel or a
   * holder after `uom` has no row: the reader gives the zone's holder frame no party and no channel gloss.
   */
  zone(reading: Reading, frame: Frame, ctx: Ctx): { term: string; say?: Extract<Wrap, { kind: "say" }> } | Why {
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    const inner = frame.inner ?? [];
    if (inner.length !== 1) return bad;
    const f = inner[0]!;
    if (f.key === "overlay:plan:th") {
      this.use(frame, f);
      return { term: `plan(${this.speaker(reading)})` };
    }
    if (f.key !== "wordFamily:say") return bad;
    const say = this.sayWrap(reading, f, ctx);
    if ("reason" in say || say.kind !== "say") return bad;
    this.use(frame);
    return { term: `say(${say.who},${say.part},${say.reach},${say.answer},${say.ending}${say.to ? `,${say.to}` : ""})`, say };
  }

  /**
   * Row 3, who the holder is (holder.md#naming-a-holder): a name is its root id, `-r` its antecedent's; a kind of person
   * is a first-mention noun, `nm(Id, h)` with its kind; R2-4: `-x` is `grp(H)`; R4a-7: the interlocutors are the turn's `we(..)` term; the generic
   * pronoun is its own holder. R4a-4: the topic pronoun and a `-r` holder resume their antecedent through the
   * anaphor link, which the holder uses, as {@link resume} does in a role (a first mention keeps its constant; a `-r`
   * holder with no antecedent is the name it spells). R4a-5: the listener is the listener term, as `zawan` is in a role.
   * Undefined for a holder with no row: a topic pronoun with no topic, and the speaker.
   */
  holder(frame: Frame, ctx: Ctx): string | undefined {
    if (!frame.party) return undefined;
    this.resume(frame.party, ctx);
    const through = throughAntecedent(frame.party);
    const own = frame.party.kind === "pronoun" && through.kind === "pronoun" ? frame.party.word : undefined;
    const party: Term = own && own.ending === "r" && own.family.kind === "x" ? { kind: "thing", head: own, root: own.family.rightRoots!.join(""), named: true, details: [] } : through;
    if (party.kind === "listener") {
      const text = this.term(party, "h", ctx);
      this.holders.set(text, "your");
      return text;
    }
    if (party.kind !== "thing") return undefined;
    const known = this.consts.get(party);
    if (known) {
      this.holders.set(known, "someone's");
      return known;
    }
    const word = party.head;
    if (isTopicPronoun(word) || party.root === CLOSED.microphone || party.root === CLOSED.headphones) return undefined;
    let text: string;
    let english: string;
    if (isGenericPronoun(word)) [text, english] = ["generic", "the generic"];
    else if (party.root === CLOSED.handshake && party.named) [text, english] = [this.we(ctx.reading), "our"];
    else if (party.named) [text, english] = [name(party.root), `${namedEnglish(party.root)}'s`];
    else {
      text = `nm(${ctx.id},h)`;
      english = word.plural ? "some people's" : "someone's";
      this.kinds.set(name(party.root), party);
      this.witness(ctx, `isa(${text},${name(party.root)})`);
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
  body(reading: Reading, frames: Frames, ctx: Ctx, mayOver?: MayOver): true | Why {
    const claim = this.sharedPredicate(reading.claim) ?? reading.claim;
    const denials = claimTerms(claim, false).filter((t): t is ListTerm => t.kind === "list" && !!t.frames?.some((f) => f.key === "joinSeries:u"));
    if (denials.length > 1) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
    const denial = denials[0];
    // R3-1 row 7: the list a whole-list denial denies; `vael vul` denies each item, as a plain denial does.
    const inner = denial && denial.parts.length > 1 && denial.parts.at(-1)!.members.length === 0 ? joinOf(denial.parts[0]!.join) : undefined;
    const whole = !!inner && !(inner.series === "ae" && inner.ending === "l");
    const ors = claimTerms(claim, false).filter(isOrList);
    const noRow = (key: string): Why => ({ construction: key.replace("joinSeries:", "join."), key, reason: "noRow" });
    // R4b-7 (D12): *because* with an *or* list in its outcome, alone.
    const becauseOr = !!frames.because && !(frames.may || frames.restrictor || frames.hinge || becauseDenied(reading));
    if (ors.length > 1 || (ors.length && (denial || frames.universal || frames.restrictor || frames.hinge || (frames.because && !becauseOr) || frames.zone || ctx.wrap || ctx.deny || frames.likely))) return noRow(`joinSeries:${ors[0]!.values.series}`);
    if (ctx.deny && denial) return noRow("joinSeries:u");
    // R3-1 row 5: MAY over an or list gates it, as over a hinge.
    if (ors.length && frames.may) [ctx.choice, mayOver] = [false, "gate"];
    // A choice or a gate over a whole-list denial or over members has no row.
    if ((ctx.choice || mayOver) && (whole || claimMemberLists(claim, reading).size)) return { construction: "frameCombination", reason: "noRow" };
    if (mayOver === "gate") {
      this.rule(ctx, `maybe(${ctx.id})`, [], "gate");
      ctx.gate = `maybe(${ctx.id})`;
    }
    if (ors.length && !frames.because) return this.orList(reading, claim, ors[0]!, ctx);

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
      this.use(f, ...(f.inner ?? []), ...(list.kind === "list" ? (list.sharedDetails ?? []) : []));
      this.bound.add(instance.head);
      // R2-5: inside a view, the kind is the holder's too; a say word's kind is your own claim (R4a-10).
      const isa = ctx.wrap?.kind === "say" ? `isa(X,${k})` : this.w(ctx, `isa(X,${k})`);
      body.push({ atom: `holds(${isa})`, premise: isa });
      const say = ctx.wrap?.kind === "say" ? ctx.wrap : undefined;
      if (say && frames.say && over(reading, frames.say, f)) {
        // R4a-11 (D1): over a universal the whole stays one wrapped term, `T[every(K)]`; allow and require reach each one.
        if (none || open || denial || claim.verb === list) return { construction: "frameCombination", reason: "noRow" };
        const whole = new Map(ctx.subst).set(list, { text: `every(${k})` });
        this.rule(ctx, this.w(ctx, this.claim(claim, { ...ctx, subst: whole })), []);
        if (say.answer !== "a" && say.answer !== "o") return true;
      }
      if (!claim.verb && !claim.predicate.length && Object.keys(claim.roles).length === 1) {
        // R4a-3: inside a holder's view, *no K* clashes with the holder's own `isa` views.
        if (!none || frames.hinge || frames.because || (ctx.wrap && !plainView(ctx.wrap))) return { construction: f.construction, key: f.key, reason: "noRow" };
        this.rule(ctx, this.w(ctx, `none(${ctx.id})`), body, "clash");
        return true;
      }
    }

    // Whole-list denial (row 4): the items cannot all hold.
    if (whole && denial && inner) {
      // R4a-2: inside a holder's view, the items are the holder's views.
      if (frames.hinge || frames.because || frames.zone || frames.restrictor || (ctx.wrap && !plainView(ctx.wrap))) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
      if (inner.series === "e" && (inner.ending === "l" || inner.ending === "m")) return this.notOne(reading, claim, denial, ctx, inner.ending === "m");
      if (inner.series === "e" || inner.series === "ae") return noRow("joinSeries:u");
      const lits: Literal[] = [];
      denial.members.forEach((m, i) => {
        const item = this.substituted(claim, denial, m, { ...ctx, asserted: false });
        const slot = `i(${ctx.id},${i + 1})`;
        this.slots.set(slot, { reading: reading.id, claim: item.claim });
        lits.push({ atom: `fits(${slot},P${i + 1})` }, { atom: `holds(${this.w(ctx, `P${i + 1}`)})`, premise: this.w(ctx, `P${i + 1}`) });
      });
      this.rule(ctx, this.w(ctx, `notall(${ctx.id})`), lits, "clash");
      return true;
    }

    // The heads: the claim, or each denied item (row 2).
    const heads: { text: string; claim: Claim; sign: 1 | -1 }[] = denial
      ? denial.members.map((m) => ({ ...this.substituted(claim, denial, m, { ...ctx, asserted: false }), sign: -1 as const }))
      : [{ text: this.rank(claim, ctx) ?? this.claim(claim, ctx), claim, sign: ctx.deny ? -1 : sign }];
    if (frames.universal && denial) heads.forEach((h) => (h.sign = -1));
    const lit = (h: { text: string; sign: number }): string => (h.sign < 0 ? `neg(${h.text})` : h.text);

    if (frames.because) return this.because(reading, frames, claim, heads, body, ctx, mayOver);
    if (frames.hinge) return this.hinge(reading, frames.hinge, heads, body, ctx, mayOver === "outcome");

    if (frames.restrictor) {
      const v = frames.restrictor.values;
      const listed = claim.details.some((d) => d.key === "unit:h");
      const always = v.series === "ua" && v.ending === "l";
      const never = v.series === "a" && v.ending === "l";
      const usually = v.series === "ua" && v.ending === "m";
      if (denial || !(always || never || usually) || (usually && listed)) return { construction: frames.restrictor.construction, key: frames.restrictor.key, reason: "noRow" };
      this.use(frames.restrictor);
      const h = heads[0]!;
      // R4a-1: inside a holder's view each term is wrapped, the marker too (`always(view(H, T))`).
      if (usually) {
        this.open(ctx, h.text, []);
      } else {
        if (!listed) this.rule(ctx, this.w(ctx, always ? h.text : `neg(${h.text})`), []);
        this.rule(ctx, this.w(ctx, h.text), [], always ? "always" : "never");
      }
      this.pool(reading, h.text, h.claim, never && !listed ? -1 : 1);
      return true;
    }

    // R2-7, R2-9: a ban's act is matched against the acts it may meet, as a denied term is.
    const ban = sayOf(ctx.wrap)?.answer === "u";
    const zone = frames.zone ? this.zone(reading, frames.zone, ctx) : undefined;
    if (zone && "reason" in zone) return zone;
    for (const h of heads) {
      if (open) this.open(ctx, h.text, body);
      else this.rule(ctx, this.w(ctx, lit(h)), body);
      if (zone) {
        // R2-1 row 9, R2-11: the act is still your claim, marked against its zone; a say-word zone claims its say word.
        this.rule(ctx, `against(${lit(h)},${zone.term})`, []);
        if (zone.say) this.rule(ctx, wrapText(zone.say, lit(h)), []);
        if (zone.say?.answer === "u") this.pool(reading, h.text, h.claim, -1);
      }
      if (list) this.templates.push({ ctx, list, claim: h.claim, sign: ban ? -1 : h.sign });
      else this.pool(reading, h.text, h.claim, ban ? -1 : h.sign);
      // R3-5: every MAY reading gives `may(T)`, which a hinge on a MAY condition reads; the holder's own MAY (R3-6) is
      // already a term inside the view.
      if ((frames.may && !ctx.wrap) || frames.mayHost) this.rule({ ...ctx, choice: false }, `may(${this.w(ctx, lit(h))})`, []);
    }

    // Membership (row 10): the claim keeps its list term, and each member (or each paired place) holds; R2-5, inside a
    // view too. R4a-11 (D1): under a plain say word the content stays one wrapped term, and `a` and `o` reach each member.
    if (!denial && !frames.universal && (!sayOf(ctx.wrap) || ctx.wrap?.kind === "say")) this.members(reading, claim, ctx);
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
    this.use(z, scale[0]);
    return `more(${this.detail(scale[0]!, ctx)},${this.kind(z.members[0]!, "z1", ctx)},${this.kind(z.members[1]!, "z2", ctx)})`;
  }

  /** The claim with one list term replaced by one of its items. */
  substituted(claim: Claim, list: Term, item: Term, ctx: Ctx): { text: string; claim: Claim } {
    const enc = list === claim.verb && item.kind === "thing" ? name(item.root) : claim.predicate.includes(list) ? this.kind(item, "g", ctx) : this.term(item, placeOf(claim, list), ctx);
    const subst: Subst = new Map(ctx.subst);
    subst.set(list, { text: enc, term: item });
    this.use(list);
    const text = this.claim(claim, { ...ctx, subst });
    return { text, claim: replaceTerm(claim, list, item) };
  }

  /**
   * Row 1 over row 11: named members with a SHARED `/ɡ/` adjective and no verb (`zazozon zalazun zal gamayam.`) are
   * each of its kind, `isa(X, K)`, as one name with the word is (`zazozon gamayam.`). The claim with the word as its
   * predicate, carrying the word as its detail as the reader gives a lone `/ɡ/` word; undefined for any other shape.
   */
  sharedPredicate(claim: Claim): Claim | undefined {
    const z = claim.roles.z;
    if (claim.verb || claim.predicate.length || claim.roles.d || claim.roles.b || claim.details.length) return undefined;
    if (z?.kind !== "list" || z.values.series !== "a" || z.parts.length !== 1 || z.frames?.length || z.bound) return undefined;
    const shared = sharedAdjectives(z);
    if (shared?.length !== 1 || !z.members.every((m) => m.kind === "thing" && m.named)) return undefined;
    const word = shared[0]!.words[0]!;
    if (shared[0]!.words.length !== 1 || word.family.kind !== "content") return undefined;
    this.use(shared[0]!);
    return { ...claim, predicate: [{ kind: "thing", head: word, root: word.family.roots.join(""), named: false, details: [shared[0]!] }] };
  }

  /**
   * Row 14 over row 11: a SHARED `/ɡ/` adjective on a list of first-mention nouns is a detail of each, `detail(nm(..),
   * dt(..))`, as the word on one noun is. The details, when every member is a first-mention noun of an asserted claim.
   */
  sharedDetails(list: ListTerm, ctx: Ctx): Detail[] | undefined {
    const shared = sharedAdjectives(list);
    return shared && ctx.asserted && list.members.every((m) => this.newMembers.has(m)) ? shared : undefined;
  }

  members(reading: Reading, claim: Claim, ctx: Ctx): void {
    const lists = claimMemberLists(claim, reading);
    if (!lists.size) return;
    const say = ctx.wrap?.kind === "say" ? ctx.wrap : undefined;
    if (say && say.answer !== "a" && say.answer !== "o") {
      // A ban or *their call* over a list is the whole term only (D1): the list is used, no member rule.
      for (const l of lists.keys()) this.use(l);
      for (const link of reading.links) if (link.kind === "pairing") this.use(link);
      return;
    }
    const groups = new Map<object | Term, ListTerm[]>();
    const order = (l: Term): number => ["z", "d", "b", "g"].indexOf(placeOf(claim, l)[0]!);
    for (const [l, g] of [...lists].sort((a, b) => order(a[0]) - order(b[0]))) {
      const key = g ?? l;
      groups.set(key, [...(groups.get(key) ?? []), l as ListTerm]);
    }
    for (const group of groups.values()) {
      const subst: Subst = new Map(ctx.subst);
      const body: Literal[] = [];
      for (const link of reading.links) if (link.kind === "pairing" && group.some((l) => l.join && link.words.includes(l.join))) this.use(link);
      group.forEach((l, i) => {
        this.use(l);
        const place = placeOf(claim, l);
        const ls = this.term(l, place, ctx);
        const v = group.length > 1 ? `X${i + 1}` : "X";
        subst.set(l, { text: v });
        body.push({ atom: `member(${ls},${v},G)` });
        const shared = claim.predicate.includes(l) ? undefined : this.sharedDetails(l, ctx);
        l.members.forEach((m, j) => {
          const enc = claim.predicate.includes(l) ? this.kind(m, `${place}${j + 1}`, ctx) : this.term(m, `${place}${j + 1}`, ctx);
          this.facts.add(`member(${ls},${enc},${j + 1}).`);
          for (const d of shared ?? []) this.witness(ctx, `detail(${enc},${this.detail(d, ctx)})`, "detail");
        });
        if (shared) this.use(...shared);
      });
      // R4a-11: a list in the say word's own part is its `Who` too.
      const own = say && (["z", "d", "b"] as const).find((r) => r === say.part && group.includes(claim.roles[r] as ListTerm));
      const wrap = own ? { ...say, who: subst.get(claim.roles[own]!)!.text } : ctx.wrap;
      this.rule(ctx, wrapText(wrap, this.claim(claim, { ...ctx, subst })), body);
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

  /**
   * A hinge's condition: its hosted clause, the sentence a backward stand-in (`blarth`, stand-in-vowels.md#stand-in-back)
   * resumes, or the next sentence (`grounds`). A noun condition (`gahum blugalal`) has none, so it has no row here yet.
   */
  condition(reading: Reading, frame: Frame): Reading | undefined {
    const hosted = frame.hosted && throughAntecedent(frame.hosted);
    const back = hosted?.kind === "pronoun" ? reading.links.find((l) => l.kind === "standInBack" && l.words.includes(hosted.word))?.to : undefined;
    const cond = hosted?.kind === "clause" ? hosted.reading : back ? this.byId.get(back) : frame.content?.[0];
    if (cond) {
      for (const l of reading.links) if ((l.kind === "standIn" || l.kind === "standInBack" || l.kind === "grounds") && (l.to === cond.id || l.frame === frame)) this.use(l);
      if (!this.visited.includes(cond)) this.visited.push(cond);
    }
    return cond;
  }

  /**
   * R2-1 rows 5 to 8, R2-10 (because-and-iff.md#choosing-a-hinge, fault.md#fault, verb-and-stance-joins.md#stance-joins):
   * *because* claims its outcome, its condition, and the link `cause(C, O)`; `-l` adds `fault(C, O)` and `-r`
   * `share(C, O)`. *Not because* (`thul` on the hinge) claims the outcome and denies the link, leaving the condition
   * unstated. *Only because* (`thebem` over `thahum`) adds row 6 on the same condition. On a closed universal each rule
   * takes row 8's body, as a hinge does.
   *
   * R4b-2: inside a holder's view each term is wrapped. R4b-4 (D2): a condition with its own MAY, holder or say word is
   * that clause's own term, `may(T)` (with row 15's choice on T), `view(H, T)` or `say(.., T)`. R4b-5 (D3): MAY right
   * before the hinge gates only the link and its marker, and claims `may(cause(C, O))`. R4b-6 (D11): the hinge over MAY
   * makes the outcome a choice, `may(O)`, and links `cause(C, may(O))`. R4b-7 (D12): under `hual` every atom also takes
   * the marker `always(..)`; under `huam` one gate covers all three (held with `switch(defaults)`); an *or* list in the
   * condition or the outcome is row 20's choice per item, each item linked in the worlds where it holds.
   */
  because(reading: Reading, frames: Frames, claim: Claim, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx, mayOver?: MayOver): true | Why {
    const frame = frames.because!;
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    const gloss = frame.values.gloss;
    if (gloss !== "because" && gloss !== "because.fault" && gloss !== "because.share") return bad;
    const denied = !!becauseDenied(reading);
    const noun = this.nounCondition(frame);
    // The hinge's hosted list keeps no parts of its own.
    const hosted = frame.hosted;
    const orCond = !noun && hosted?.kind === "list" && hosted.parts.length <= 1 && isOrList({ ...hosted, parts: [hosted.parts[0] ?? { members: hosted.members }] as ListTerm["parts"] }) ? hosted : undefined;
    const cond = noun || orCond ? undefined : this.condition(reading, frame);
    const condFrames = cond?.frames.filter((f) => f.key !== "slot:newMember") ?? [];
    if (heads.length !== 1 || (!noun && !orCond && (!cond || this.unrowed(cond) || claimTerms(cond.claim).some((t) => termFrames(t).length || isOrList(t))))) return bad;
    const orOut = claimTerms(heads[0]!.claim, false).find(isOrList);
    const restrictor = frames.restrictor?.values;
    const always = restrictor?.series === "ua" && restrictor.ending === "l";
    const often = restrictor?.series === "ua" && restrictor.ending === "m";
    if (frames.restrictor && (!(always || often) || claim.details.some((d) => d.key === "unit:h") || denied)) return bad;
    if ((orCond || orOut) && (!orRow((orCond ?? orOut)!) || denied || frames.hinge || frames.restrictor || mayOver || ctx.wrap || body.length)) return bad;
    if (mayOver && (denied || frames.hinge || body.length)) return bad;
    // R4b-4 (D2): the condition's own frame makes it that clause's own term.
    let condText: string;
    let condInner: string | undefined;
    if (condFrames.length) {
      if (denied || mayOver || frames.restrictor || frames.hinge || ctx.wrap || body.length || cond!.stanceLists?.length) return bad;
      const cf = this.readingFrames(cond!);
      const own = [cf.may, cf.holder, cf.say].filter(Boolean).length;
      if (own !== 1 || cf.other || cf.hinge || cf.because || cf.universal || cf.restrictor || cf.zone || cf.likely || cf.mayHost || cf.standalone.length) return bad;
      condInner = this.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false });
      if (cf.may) {
        condText = `may(${condInner})`;
        this.rule({ ...ctx, choice: true }, condInner, []);
      } else {
        const wrap = this.wrap(cond!, cf, { ...ctx, reading: cond! });
        if (!wrap || "reason" in wrap) return bad;
        condText = wrapText(wrap, condInner);
      }
      this.use(...condFrames);
    } else {
      condText = noun?.text ?? (orCond ? "" : this.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false }));
    }
    if (/\bX\b/.test(condText)) return bad;
    const h = heads[0]!;
    const out = h.sign < 0 ? `neg(${h.text})` : h.text;
    const w = (t: string): string => this.w(ctx, t);
    const marker = (c: string, o: string): string | undefined => (gloss === "because.fault" ? `fault(${c},${o})` : gloss === "because.share" ? `share(${c},${o})` : undefined);
    this.use(frame, frames.restrictor);
    if (denied) this.useDenied(reading, becauseDenied(reading)!);

    // R4b-7: an *or* list in the condition or the outcome: row 20 on the list, the link per item where it holds.
    if (orCond || orOut) {
      const list = (orCond ?? orOut)!;
      const items = orCond
        ? orCond.members.map((m, i) => {
            if (m.kind !== "thing" || m.named || m.details.length) return undefined;
            const text = name(m.root);
            const slot = `i(${ctx.id},${i + 1})`;
            const mClaim: Claim = { roles: { z: m }, predicate: [], details: [] };
            this.kinds.set(text, m);
            this.slots.set(slot, { reading: reading.id, claim: mClaim });
            this.pool(reading, text, mClaim, 1);
            return { text, slot };
          })
        : this.items(reading, h.claim, list, ctx);
      if (items.some((it) => !it)) return bad;
      const its = items as { text: string; slot: string }[];
      this.orBounds(list, its, ctx);
      this.use(list);
      if (orCond) {
        this.pool(reading, h.text, h.claim, h.sign);
        this.rule(ctx, out, []);
      } else {
        this.pool(cond ?? reading, condText, noun?.claim ?? cond!.claim, 1);
        this.rule(ctx, condText, []);
      }
      for (const it of its) {
        const [c, o] = orCond ? [it.text, out] : [condText, it.text];
        const lit: Literal[] = [{ atom: `holds(${it.text})`, premise: it.text }];
        this.rule(ctx, `cause(${c},${o})`, lit);
        const m = marker(c, o);
        if (m) this.rule(ctx, m, lit);
      }
      return true;
    }

    this.pool(cond ?? reading, condInner ?? condText, noun?.claim ?? cond!.claim, 1);
    if (!body.length) this.pool(reading, h.text, h.claim, h.sign);
    if (mayOver === "outcome") {
      // R4b-6 (D11): a world cause of a possible outcome.
      const may = `may(${out})`;
      this.rule(ctx, condText, []);
      this.rule({ ...ctx, choice: true }, out, []);
      this.rule(ctx, may, []);
      this.rule(ctx, `cause(${condText},${may})`, []);
      const m = marker(condText, may);
      if (m) this.rule(ctx, m, []);
      return true;
    }
    if (often) {
      // R4b-7 (D12): under `huam` the outcome, the condition and the link are one choice together.
      this.rule(ctx, `maybe(${ctx.id})`, [], "gate");
      this.rule(ctx, `maybe(${ctx.id})`, [{ atom: "switch(defaults)" }], "some");
      ctx.gate = `maybe(${ctx.id})`;
    }
    const link = `cause(${condText},${out})`;
    const atoms: string[] = [out];
    this.rule(ctx, w(out), body);
    if (!denied) {
      this.rule(ctx, w(condText), body);
      atoms.push(condText);
    }
    if (mayOver === "link") {
      // R4b-5 (D3): MAY right before the hinge hedges only the link; the outcome and the condition stay claimed.
      this.rule(ctx, `may(${link})`, []);
      this.rule(ctx, `maybe(${ctx.id})`, [], "gate");
      ctx.gate = `maybe(${ctx.id})`;
    }
    this.rule(ctx, w(denied ? `neg(${link})` : link), body);
    if (!denied) atoms.push(link);
    const m = marker(condText, out);
    if (m) this.rule(ctx, w(m), body);
    // R4b-7 (D12): under `hual` each atom also takes the marker `always(..)`.
    if (always) for (const a of atoms) this.rule(ctx, a, body, "always");
    return frames.hinge ? this.hinge(reading, frames.hinge, heads, body, ctx, false, true) : true;
  }

  /**
   * Rows 5–7 and R1-5: a condition hinge; neither its condition nor its outcome is claimed. R4e-1: the reading claims
   * the conditional, `if(c(Id), o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), and each rule
   * takes it in its body. R4e-3: a denied conditional (`thohem thul blarl`) claims `neg(T)` and runs no rule. A hinge on
   * a universal, over MAY, under MAY or with MAY in its condition keeps its rules with no term. R4b-1: a `bl-` noun
   * condition reads as its kind.
   */
  hinge(reading: Reading, frame: Frame, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx, mayOutcome = false, because = false): true | Why {
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    const noun = this.nounCondition(frame);
    const cond = noun ? undefined : this.condition(reading, frame);
    // R4e finding 1: a first mention in the condition is written as its kind (R1-3), so its frame is no bar.
    const condFrames = cond?.frames.filter((f) => f.key !== "slot:newMember") ?? [];
    // R3-5: MAY inside the condition makes the condition a chance (causation.md#if).
    const mayCond = condFrames.length === 1 && condFrames[0]!.key === "overlay:may:th" && !condFrames[0]!.holderHost;
    if (heads.length !== 1 || (!noun && (!cond || (condFrames.length && !mayCond) || this.unrowed(cond) || claimTerms(cond.claim).some((t) => termFrames(t).length || isOrList(t))))) return bad;
    if (claimTerms(heads[0]!.claim, false).some(isOrList)) return bad;
    const gloss = frame.values.gloss ?? "";
    const termName = CONDITIONAL[gloss];
    if (!termName) return bad;
    // R3-1 row 6 and R3-5 have only the forward rule of *if*.
    if ((mayCond || mayOutcome) && gloss !== "if") return bad;
    // R4a-9: a hinge over a say word (`thohem blarth` first): the outcome is the say term, the condition your own claim.
    const sayOut = ctx.wrap?.kind === "say";
    if (sayOut && (mayCond || mayOutcome || ctx.gate || because)) return bad;
    const condClaim = noun?.claim ?? cond!.claim;
    const condSite = cond ?? reading;
    const condText = noun?.text ?? this.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false });
    if (/\bX\b/.test(condText)) return bad;
    const universal = body.length > 0;
    const denied = hingeDenied(reading) === frame;
    // A denied conditional on a universal (R4e open decision 2), with MAY, in a wrap or beside *because* has no row.
    // R4e-5: a holder's denied conditional is the holder's view, `view(H, neg(if(..)))`.
    if (denied && (universal || mayCond || mayOutcome || ctx.gate || (ctx.wrap && !plainView(ctx.wrap)) || because)) return bad;
    const h = heads[0]!;
    const c = `c(${ctx.id})`;
    const o = `o(${ctx.id})`;
    this.slots.set(c, { reading: condSite.id, claim: condClaim });
    this.pool(condSite, condText, condClaim, 1);
    // R2-5: inside a view, the holder's own rule runs on the holder's views.
    const w = (t: string): string => this.w(ctx, t);
    // R4a-9: under a say word the condition is unwrapped, and the outcome's denial is the say term's (a ban's `neg(say(..))`).
    const wc = (t: string): string => (sayOut ? t : w(t));
    const wneg = (slot: string, n: string): string => (slot === o && sayOut ? `neg(${w(n)})` : slot === o ? w(`neg(${n})`) : wc(`neg(${n})`));
    const truth = (slot: string, n: string): Literal[] => [{ atom: `fits(${slot},${n})` }, { atom: `holds(${slot === o ? w(n) : wc(n)})`, premise: slot === o ? w(n) : wc(n) }];
    const falsity = (slot: string, n: string): Literal[] => [{ atom: `fits(${n},${slot})` }, { atom: `holds(${wneg(slot, n)})`, premise: wneg(slot, n) }];
    const out = w(h.sign < 0 ? `neg(${h.text})` : h.text);
    const notOut = sayOut && h.sign > 0 ? `neg(${w(h.text)})` : w(h.sign < 0 ? h.text : `neg(${h.text})`);
    const outTrue = (n: string): Literal[] => (h.sign < 0 ? falsity(o, n) : truth(o, n));
    const outFalse = (n: string): Literal[] => (h.sign < 0 ? truth(o, n) : falsity(o, n));
    if (!universal) {
      this.slots.set(o, { reading: reading.id, claim: h.claim });
      this.pool(reading, h.text, h.claim, 1);
    }
    // R4e-1: the conditional as a claim term over the reading's own slots.
    const plain = !universal && !mayCond && !mayOutcome && !ctx.gate && !sayOut;
    const term = `${termName}(${c},${h.sign < 0 ? `neg(${o})` : o})`;
    if (plain) this.conditionals.set(term, { reading: reading.id, name: termName, id: ctx.id, negOut: h.sign < 0, denied });
    if (denied) {
      // R4e-3 (say-reasons.md#arguments: "only that the link fails"): the link denied, nothing else claimed.
      this.rule(ctx, w(`neg(${term})`), []);
      this.useDenied(reading, frame);
      return true;
    }
    const gate: Literal[] = plain ? [{ atom: `holds(${w(term)})`, premise: w(term) }] : [];
    if (plain) this.rule(ctx, w(term), []);
    if (mayCond) {
      // R3-5: the body reads `may(P)`; a stated condition gives it too. No backward rule.
      this.rule(ctx, w("may(P)"), [{ atom: `fits(${c},P)` }, { atom: `holds(${w("P")})`, premise: w("P") }]);
      this.rule(ctx, out, [...body, { atom: `fits(${c},P)` }, { atom: `holds(${w("may(P)")})`, premise: w("may(P)") }]);
    } else if (mayOutcome) {
      // R3-1 row 6: a hinge over MAY makes the outcome only possible: a choice, and no backward rule.
      this.rule({ ...ctx, choice: true }, out, [...body, ...truth(c, "P")]);
    } else if (gloss === "if" || gloss === "iff") {
      this.rule(ctx, out, [...gate, ...body, ...truth(c, "P")]);
      if (!universal) this.rule(ctx, wc(`neg(${condText})`), [...gate, ...outFalse("P")]);
    }
    if (gloss === "only-if" || gloss === "iff") {
      this.rule(ctx, notOut, [...gate, ...body, ...falsity(c, "P")]);
      if (!universal) this.rule(ctx, wc(condText), [...gate, ...outTrue("P")]);
    }
    this.use(frame, mayCond ? condFrames[0] : undefined);
    return true;
  }

  /** R4b-1: a `bl-` common noun as a hinge's condition (`thahum blerulal`) reads as its kind K, matched as *there is K*. */
  nounCondition(frame: Frame): { text: string; claim: Claim } | undefined {
    const t = frame.hosted;
    if (t?.kind !== "thing" || t.named || t.details.length) return undefined;
    this.kinds.set(name(t.root), t);
    return { text: name(t.root), claim: { roles: { z: t }, predicate: [], details: [] } };
  }

  /**
   * R4e-7 (causation.md#if: "a noun outcome says *there is X if there is Y*"): a `/ɡ/` hinge on a common noun. The
   * outcome is the existence claim `isa(nm(Id, z), K)`, the condition `isa(nm(Id, bl), K2)`, each matched as *there is
   * K*. *If* claims the conditional and its forward rule; *only if* its back rule; *iff* both (no denied existence term,
   * so no rule from a denial). *Because* (row 10) claims both sides and `cause(C, O)`, `-l` / `-r` adding row 12's marker.
   */
  nounHinge(reading: Reading, g: NounHinge): void {
    const gloss = g.detail.values.gloss ?? "";
    const termName = CONDITIONAL[gloss];
    if (!termName && !["because", "because.fault", "because.share"].includes(gloss)) return this.leave(reading, { construction: g.frame.construction, key: g.frame.key, reason: "noRow" });
    const id = str(reading.id);
    const out: string[] = [];
    const ctx: Ctx = { reading, id, subst: new Map(), asserted: false, out };
    const k = name(g.outcome.root);
    const k2 = name(g.cond.root);
    this.kinds.set(k, g.outcome);
    this.kinds.set(k2, g.cond);
    const o = `isa(nm(${id},z),${k})`;
    const c = `isa(nm(${id},bl),${k2})`;
    const oClaim: Claim = { roles: { z: g.outcome }, predicate: [], details: [] };
    const cClaim: Claim = { roles: { z: g.cond }, predicate: [], details: [] };
    this.pool(reading, o, oClaim, 1);
    this.pool(reading, c, cClaim, 1);
    // R4b-3: the stacked `gebem` adds row 6 on the same condition (row 13), as *only if* does here.
    const conditional = termName ?? (g.stack ? "onlyif" : undefined);
    if (!termName) {
      this.rule(ctx, o, []);
      this.rule(ctx, c, []);
      this.rule(ctx, `cause(${c},${o})`, []);
      if (gloss === "because.fault") this.rule(ctx, `fault(${c},${o})`, []);
      if (gloss === "because.share") this.rule(ctx, `share(${c},${o})`, []);
    }
    if (conditional) {
      const termName = conditional;
      const cs = `c(${id})`;
      const os = `o(${id})`;
      this.slots.set(cs, { reading: reading.id, claim: cClaim });
      this.slots.set(os, { reading: reading.id, claim: oClaim });
      const term = `${termName}(${cs},${os})`;
      this.conditionals.set(term, { reading: reading.id, name: termName, id, negOut: false, denied: false });
      this.rule(ctx, term, []);
      const gate: Literal = { atom: `holds(${term})`, premise: term };
      if (termName !== "onlyif") this.rule(ctx, o, [gate, { atom: `fits(${cs},P)` }, { atom: "holds(P)", premise: "P" }]);
      if (termName !== "if") this.rule(ctx, c, [gate, { atom: `fits(${os},P)` }, { atom: "holds(P)", premise: "P" }]);
    }
    this.use(g.frame, g.detail, g.stack?.frame, g.stack?.detail, ...reading.frames);
    const parts = readingParts(reading);
    const unused = parts.filter((p) => !this.used.has(p.of));
    if (unused.length) return this.leave(reading, { construction: unused[0]!.key, key: unused[0]!.key, reason: "unused", unused: unused.map((p) => p.text) });
    this.accounting.set(reading.id, { parts, used: this.used });
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${id}).`, ...out);
  }

  /**
   * R4e-2: `fits(B, A)` for each ordered pair of conditionals where A says at least B, matched by their slots, never by
   * their texts: the same name, or A an *iff*; the same outcome sign; *if* needs B's condition to say at least A's and
   * A's outcome at least B's (reversed for a denied outcome), *only if* the converse, *iff* both.
   */
  conditionalPairs(): string[] {
    const out: string[] = [];
    const m = (q: string, t: string): boolean => {
      const a = this.slots.get(q);
      const b = this.slots.get(t);
      return !!a && !!b && !!match(a.claim, b.claim, this.sites(a.reading, b.reading));
    };
    for (const [tb, b] of this.conditionals) {
      for (const [ta, a] of this.conditionals) {
        if (tb === ta || !(a.name === b.name || a.name === "iff") || a.negOut !== b.negOut) continue;
        const [cA, cB, oA, oB] = [`c(${a.id})`, `c(${b.id})`, `o(${a.id})`, `o(${b.id})`];
        const enough = (): boolean => m(cA, cB) && (b.negOut ? m(oA, oB) : m(oB, oA));
        const needs = (): boolean => m(cB, cA) && (b.negOut ? m(oB, oA) : m(oA, oB));
        if (!(b.name === "if" ? enough() : b.name === "onlyif" ? needs() : enough() && needs())) continue;
        out.push(`fits(${tb},${ta}).`);
        const set = this.conditionalFits.get(tb) ?? new Set<string>();
        set.add(ta);
        this.conditionalFits.set(tb, set);
      }
    }
    return out;
  }

  /**
   * R3-7: a stance number (number-roles.md#number-as-stance-by-marker, special-values.md#special-number-as-stance). An
   * estimate (`th+N`, `th+`, `th-`, ending `-l` or `-m`) is R3-1 row 1's choice with the figure as data, `likely(Id, V)`;
   * certain (`th+e`) is a plain claim and no chance (`th+0e`) a denial. Other markers and endings have no row.
   */
  likely(frame: Frame, ctx: Ctx): true | Why {
    const word = frame.words[0];
    const stem = word && wordStem(word);
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    if (!word || !stem || (word.ending !== "l" && word.ending !== "m")) return bad;
    if (stem.marker === "+" && !stem.groups.length && word.ending === "l" && (stem.digitlessExp === "e" || stem.digitlessExp === "0e")) {
      ctx.deny = stem.digitlessExp === "0e";
      return true;
    }
    if (stem.digitlessExp || !(stem.marker === "+" || (stem.marker === "-" && !stem.groups.length))) return bad;
    const value = stem.groups.length ? wordValue(word) : undefined;
    if (stem.groups.length && value?.kind !== "scalar") return bad;
    ctx.choice = true;
    this.rule(ctx, `likely(${ctx.id},${value ? this.value(word) : valueTerm(word)})`, [], "likely");
    return true;
  }

  /**
   * R3-1 row 8 and R3-3: an *or* list (joins.md#choice-e, set-joins.md#exclusivity-and-denying-a-whole-list). Each item
   * is a choice; `el`, `ael` and `aem` need at least one (`clash(noneof(Id))`, and the last item when the rest are
   * denied: "even `-m` still needs at least one of the listed items"); `el` and `em` allow at most one (one held denies
   * the rest). Joined on `fits(i(Id, K), P)`.
   */
  orList(reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx): true | Why {
    const { series } = list.values;
    if (!orRow(list)) return { construction: `join.${series}`, key: `joinSeries:${series}`, reason: "noRow" };
    this.orBounds(list, this.items(reading, claim, list, ctx), ctx);
    return true;
  }

  /** R3-1 row 8: each item a choice, with the list's bounds (a list {@link orRow} accepts). */
  orBounds(list: ListTerm, items: { text: string; slot: string }[], ctx: Ctx): void {
    const { series, ending } = list.values;
    const atLeast = ending === "l" || series === "ae";
    const atMost = series === "e";
    for (const it of items) this.rule({ ...ctx, choice: true }, it.text, []);
    if (atLeast) {
      items.forEach((_, k) => this.rule(ctx, `some(${ctx.id})`, held(items, k), "some"));
      this.rule(ctx, `noneof(${ctx.id})`, [{ atom: `not some(${ctx.id})` }], "clash");
      if (items.length > 1) items.forEach((it, k) => this.rule(ctx, it.text, items.flatMap((_, j) => (j === k ? [] : denied(items, j)))));
    }
    if (atMost) items.forEach((_, k) => items.forEach((jt, j) => j !== k && this.rule(ctx, `neg(${jt.text})`, held(items, k))));
  }

  /**
   * R3-1 row 7: *not exactly one* (`vel vul`): one item held with every other denied clashes, `clash(notone(Id))`; with
   * two items each holds or is denied with the other. *Not at most one* (`vem vul`) adds the clash with no item held.
   */
  notOne(reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx, none: boolean): true {
    const items = this.items(reading, claim, list, ctx);
    // R4a-2: inside a holder's view, row 21 runs on the holder's views.
    const w = (t: string): string => this.w(ctx, t);
    const rest = (k: number): Literal[] => items.flatMap((_, j) => (j === k ? [] : denied(items, j, w)));
    items.forEach((_, k) => this.rule(ctx, w(`notone(${ctx.id})`), [...held(items, k, w), ...rest(k)], "clash"));
    if (none) this.rule(ctx, w(`notone(${ctx.id})`), items.flatMap((_, j) => denied(items, j, w)), "clash");
    if (items.length === 2) {
      for (const [k, j] of [[0, 1], [1, 0]] as const) {
        this.rule(ctx, w(items[j]!.text), held(items, k, w));
        this.rule(ctx, w(`neg(${items[j]!.text})`), denied(items, k, w));
      }
    }
    return true;
  }

  /** Each item of a list as the claim with that item, its slot `i(Id, K)`, and its term in the pool. */
  items(reading: Reading, claim: Claim, list: ListTerm, ctx: Ctx): { text: string; slot: string }[] {
    return list.members.map((m, i) => {
      const item = this.substituted(claim, list, m, { ...ctx, asserted: false });
      const slot = `i(${ctx.id},${i + 1})`;
      this.slots.set(slot, { reading: reading.id, claim: item.claim });
      this.pool(reading, item.text, item.claim, 1);
      return { text: item.text, slot };
    });
  }

  pool(reading: Reading, text: string, claim: Claim, sign: number): void {
    if (/\bX\d*\b/.test(text)) return;
    if (!this.terms.has(text)) this.terms.set(text, { reading: reading.id, claim });
    if (sign < 0) this.denied.add(text);
  }

  // ── After the readings ──

  sites(query: ReadingId, target: ReadingId): { querySite: TermSite; targetSite: TermSite } {
    return { querySite: this.site(query), targetSite: this.site(target) };
  }

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
        if (match(s.claim, p.claim, this.sites(s.reading, p.reading))) fits.push(`fits(${slot},${text}).`);
        if (match(p.claim, s.claim, this.sites(p.reading, s.reading))) fits.push(`fits(${text},${slot}).`);
      }
    }
    for (const q of this.denied) {
      const source = this.terms.get(q)!;
      for (const [text, p] of pool) if (text !== q && match(source.claim, p.claim, this.sites(source.reading, p.reading))) fits.push(`fits(${q},${text}).`);
    }
    fits.push(...this.conditionalPairs());
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
      ...section("Say words inside a holder's view (R4a-13).", [...this.wraps.values()].some((w) => sayOf(w) && w.kind === "view") ? VIEW_SAY : []),
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

/** R3-1 row 8: an *or* list with a row: `e` or `ae`, ending `-l` or `-m`. */
function orRow(list: ListTerm): boolean {
  const { series, ending } = list.values;
  return (series === "e" || series === "ae") && (ending === "l" || ending === "m");
}

/** Item k held: a claim that says at least the item (row 4's join). */
function held(items: readonly { slot: string }[], k: number, w: (t: string) => string = (t) => t): Literal[] {
  return [{ atom: `fits(${items[k]!.slot},P${k + 1})` }, { atom: `holds(${w(`P${k + 1}`)})`, premise: w(`P${k + 1}`) }];
}

/** R4a-2: a holder's own view, with no MAY and no say word inside it, where the holder's rules run as stated. */
function plainView(wrap: Wrap): boolean {
  return wrap.kind === "view" && !wrap.may && !wrap.say;
}

/** Item j denied: a denial the item says at least (row 6's join). */
function denied(items: readonly { slot: string }[], j: number, w: (t: string) => string = (t) => t): Literal[] {
  return [{ atom: `fits(N${j + 1},${items[j]!.slot})` }, { atom: `holds(${w(`neg(N${j + 1})`)})`, premise: w(`neg(N${j + 1})`) }];
}

/** A claim with no role, predicate, verb, detail or clause (a call alone, `yazozon.`). */
function isEmptyClaim(claim: Claim): boolean {
  return !claim.verb && !claim.predicate.length && !Object.keys(claim.roles).length && !claim.details.length && !claim.clauses;
}

/** Does frame `a` cover frame `b`? */
function over(reading: Reading, a: Frame, b: Frame): boolean {
  return reading.order.some((o) => o.over === a && o.under === b);
}

/** R3-1 row 3: the MAY frame a `thul` stance list denies (`thomam thul`), when that is the reading's one stance list. */
function mayDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  return member && !("kind" in member && member.kind === "stanceList") && (member as Frame).key === "overlay:may:th" ? (member as Frame) : undefined;
}

/** R2-1 row 6: the *because* hinge a `thul` stance list denies (*not because*), when that is the reading's one stance list. */
function becauseDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  if (!member || ("kind" in member && member.kind === "stanceList")) return undefined;
  const f = member as Frame;
  return HINGE_KEYS.has(f.key) && /^because(\.|$)/.test(f.values.gloss ?? "") ? f : undefined;
}

/** R4e-3: the condition hinge a `thul` stance list denies (`thohem thul blarl`), when that is the reading's one stance list. */
function hingeDenied(reading: Reading): Frame | undefined {
  const lists = reading.stanceLists ?? [];
  const only = lists.length === 1 ? lists[0]! : undefined;
  const member = only?.key === "joinSeries:u" && only.values.ending === "l" && !only.details?.length && only.members.length === 1 ? only.members[0] : undefined;
  if (!member || ("kind" in member && member.kind === "stanceList")) return undefined;
  const f = member as Frame;
  return HINGE_KEYS.has(f.key) && CONDITIONAL[f.values.gloss ?? ""] ? f : undefined;
}

/**
 * R4e-7: a `/ɡ/` hinge on a common noun with no verb (`zerulal gohem blugalal.`): the outcome noun, the hinge's detail
 * and frame, and its `bl-` noun. Undefined for any other shape, or when the reading has any other frame or part.
 */
type NounHinge = { outcome: Extract<Term, { kind: "thing" }>; detail: Detail; frame: Frame; cond: Extract<Term, { kind: "thing" }>; stack?: { detail: Detail; frame: Frame } };
function nounHinge(reading: Reading): NounHinge | undefined {
  const c = reading.claim;
  const z = c.roles.z;
  const pred = c.predicate[0];
  if (c.verb || c.roles.d || c.roles.b || c.details.length || c.clauses || z?.kind !== "thing") return undefined;
  if (reading.unread.length || reading.stanceLists?.length || reading.frames.some((f) => f.key !== "slot:newMember")) return undefined;
  if (!c.predicate.length) return stackedNounHinge(z);
  if (c.predicate.length !== 1 || pred?.kind !== "thing") return undefined;
  const detail = pred.details.length === 1 ? pred.details[0]! : undefined;
  const frame = detail?.frames?.length === 1 ? detail.frames[0]! : undefined;
  const cond = detail?.hosted;
  if (!detail || !frame || detail.key !== "overlay:clause_hinge:g" || frame.key !== detail.key || detail.content?.length || cond?.kind !== "thing") return undefined;
  if (z.named || z.details.length || cond.named || cond.details.length) return undefined;
  return { outcome: z, detail, frame, cond };
}

/**
 * R4b-3 (because-and-iff.md#choosing-a-hinge): *only because* on a noun, `zerulal gebem gahum blugalal.`: the outcome
 * noun's two details, `gebem` then `gahum`, sharing one `hosted` noun (the reader's stacked hinge).
 */
function stackedNounHinge(z: Extract<Term, { kind: "thing" }>): NounHinge | undefined {
  const [needs, fact] = z.details;
  const hinge = (d: Detail | undefined, gloss: string): Frame | undefined =>
    d?.key === "overlay:clause_hinge:g" && d.values.gloss === gloss && d.frames?.length === 1 && d.frames[0]!.key === d.key && !d.content?.length ? d.frames[0] : undefined;
  if (z.details.length !== 2 || z.named || !needs || !fact) return undefined;
  const needsFrame = hinge(needs, "only-if");
  const frame = hinge(fact, "because");
  const cond = fact.hosted;
  if (!needsFrame || !frame || cond?.kind !== "thing" || needs.hosted !== cond || cond.named || cond.details.length) return undefined;
  return { outcome: { ...z, details: [] }, detail: fact, frame, cond, stack: { detail: needs, frame: needsFrame } };
}

/** A join word's series and ending. */
function joinOf(word: LexWord | undefined): { series: string; ending: string } | undefined {
  return word?.family.kind === "joinMarker" ? { series: word.family.series, ending: word.ending ?? "" } : undefined;
}

/** An *or* list (R3-1 row 8): one `e` or `ae` part, no frame on it. */
/** A list's SHARED `/ɡ/` adjectives that reach each member (`slot:adj`, role `distribute`), when every SHARED detail is one. */
function sharedAdjectives(list: ListTerm): Detail[] | undefined {
  const shared = list.sharedDetails ?? [];
  return shared.length && shared.every((d) => d.key === "slot:adj" && d.values.role === "distribute" && !d.hosted && !d.details?.length) ? shared : undefined;
}

function isOrList(term: Term): term is ListTerm {
  return term.kind === "list" && (term.values.series === "e" || term.values.series === "ae") && term.parts.length === 1 && !term.frames?.length && !term.bound;
}

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

/**
 * The accounting guard's inventory of one reading: its frames (with the frames held inside them and a stance list's
 * own), its links, the SHARED details of its lists, its blanks, and (`members`, the reading itself rather than a
 * condition or a clause it holds) each list the matcher reads members of.
 */
export function readingParts(reading: Reading, members = true): Part[] {
  const out: Part[] = [];
  const id = reading.id;
  const add = (kind: Part["kind"], of: object, key: string, words: readonly { raw: string }[]): void => {
    out.push({ kind, of, reading: id, key, text: `${kind} ${key} "${raws(words)}"` });
  };
  const frame = (f: Frame): void => {
    add("frame", f, f.key, f.words);
    f.inner?.forEach(frame);
  };
  reading.frames.forEach(frame);
  for (const list of reading.stanceLists ?? []) list.inner?.forEach(frame);
  for (const l of reading.links) add("link", l, l.key, l.words);
  for (const t of claimTerms(reading.claim)) {
    if (t.kind === "list") for (const d of t.sharedDetails ?? []) add("shared", d, d.key, d.words);
    if (t.kind === "blank") add("blank", t, "blank", [t.word]);
  }
  if (members) for (const l of claimMemberLists(reading.claim, reading).keys()) if (l.kind === "list") add("list", l, `joinSeries:${l.values.series}`, l.join ? [l.join] : []);
  return out;
}

/** Translate a log's readings (top level; nested readings are reached through their frames) to a Clingo program. */
export function translate(log: Pick<Log, "readings"> & { entries?: readonly LogEntry[] }, options: TranslateOptions = {}): Translation {
  const t = new Translator(options);
  // The turn's speaker (a say word's `-m` on `v`, `uwen` in a role), from the log's entries when given.
  (log.entries ?? []).forEach((entry, turn) => {
    for (const r of entry.readings) {
      t.speakers.set(r.id, entry.speaker);
      t.turns.set(r.id, turn);
      if (entry.addressees) t.addressees.set(r.id, entry.addressees);
    }
  });
  for (const reading of log.readings) t.byId.set(reading.id, reading);
  for (const reading of log.readings) t.reading(reading);
  const program = t.finish();
  return { program, readings: t.readings, terms: t.terms, slots: t.slots, left: t.left, notes: t.notes, wraps: t.wraps, witnesses: t.witnesses, holders: t.holders, accounting: t.accounting, site: (id) => t.site(id), conditionals: t.conditionals, conditionalFits: t.conditionalFits };
}
