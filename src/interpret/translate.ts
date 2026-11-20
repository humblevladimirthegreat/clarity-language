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
import { asMember, claimMemberLists, collective, compoundHeads, memberList, throughAntecedent, universalInstance, type ListTerm } from "./steps.js";
import type { Claim, Detail, Frame, Reading, ReadingId, Term } from "./types.js";
import { compareValues, detailNumber, wordStem, wordValue, type NumberValue } from "./value.js";

import { KEPT_HOOK, sayOf, wrapText, type Conditional, type Ctx, type EveryHinge, type Frames, type LeftOut, type Literal, type MayOver, type Note, type Part, type Subst, type Talk, type TermSource, type TranslateOptions, type Translation, type Why, type Wrap } from "./translate-types.js";
import { CONDITIONAL, HINGE_KEYS, ZONE_INTENTIONS, answerable, bareFrames, becauseDenied, claimTerms, denied, detailRange, fragment, held, hingeDenied, inRange, isEmptyClaim, isOrList, joinOf, mayDenied, name, nounHinge, orRow, over, ownChannel, placeOf, plainView, raws, replaceTerm, sharedAdjectives, str, termDetails, termFrames, valueTerm, type NounHinge, type Range } from "./translate-helpers.js";

// ── The program ─────────────────────────────────────────────────────────────


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

const VIEW_SAY_TITLE = "Say words inside a holder's view (R4a-13).";

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
  "% Rank and ties (R4c decision 1, R4c-2, D17): a rank one way and the other, or a closed tie and a rank, on one scale.",
  "clash(more(S, B, A)) :- holds(more(S, A, B)), holds(more(S, B, A)).",
  "clash(tie(S, A, B, l)) :- holds(tie(S, A, B, l)), holds(more(S, A, B)).",
  "% A place on a scale (D22): one place per member and scale, and a place below the top denies the top.",
  "clash(place(S, A, M)) :- holds(place(S, A, N)), holds(place(S, A, M)), N != M.",
  "holds(neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).",
  "fired(place, neg(most(S, A))) :- holds(place(S, A, N)), N != rk(1).",
  "used(place, neg(most(S, A)), place(S, A, N)) :- holds(place(S, A, N)), N != rk(1).",
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

/**
 * A program's own lines: the text without what every program shares (the generic rules, and the holder's-view say
 * rules when a reading holds a say word in a view), for probing one case. A text that does not start with the
 * generic block comes back whole.
 */
export function ownProgram(program: string): string {
  const lines = program.split("\n");
  if (GENERIC.some((l, i) => lines[i] !== l)) return program;
  let rest = lines.slice(GENERIC.length);
  const title = `% ${VIEW_SAY_TITLE}`;
  const at = rest.indexOf(title);
  if (at > 0 && rest[at - 1] === "" && VIEW_SAY.every((l, i) => rest[at + 1 + i] === l)) rest = [...rest.slice(0, at - 1), ...rest.slice(at + 1 + VIEW_SAY.length)];
  return rest.join("\n");
}


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
  readonly everyHinges: EveryHinge[] = [];
  /** R4d decision O-1: each plain claim's term (row 1, no frame, no list), by reading, for *therefore*'s `cause`. */
  readonly plainTerms = new Map<ReadingId, string>();

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
      // R4c-3 (D7): `ue` with a verb denies each listed item, as `u` does.
      for (const f of termFrames(t)) if (!(t.kind === "list" && (f.key === "joinSeries:u" || (f.key === "joinSeries:ue" && reading.claim.verb)))) return { construction: f.construction, key: f.key, reason: "noRow" };
      for (const d of termDetails(t)) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    }
    for (const d of reading.claim.details) if (d.frames?.length || d.content?.length) return { construction: d.construction, key: d.key, reason: "noRow" };
    return undefined;
  }

  readingFrames(reading: Reading, skip?: ReadonlySet<Frame>): Frames {
    const out: Frames = { standalone: [] };
    const holder = reading.frames.some((f) => f.key === "xFamily:holder");
    const denied = mayDenied(reading);
    for (const f of reading.frames) {
      if (f.key === "slot:newMember" || f.key === "edge:vocative" || skip?.has(f)) continue;
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
    // R4c decision 5: a verbless list is a fragment, with no claim term.
    const frag = reading.unread.length ? undefined : fragment(reading);
    if (frag) return this.leave(reading, frag);
    const why = this.unrowed(reading);
    if (why) return this.leave(reading, why);
    // R4a-8: a call is read through `LogEntry.addressees`, so its frame is used; a reading with only a call claims nothing.
    this.use(...reading.frames.filter((f) => f.key === "edge:vocative"));
    // R4d: linkers, topic words, tags, kept discourse hooks and polar words add no term of their own.
    const talk = this.talk(reading);
    this.use(...talk.used);
    // R4d-1: a topic word alone writes nothing; R4d-2, R4d-3: a bare polar word claims only its verdict, if any.
    if (reading.frames.every((f) => f.key === "edge:vocative") && isEmptyClaim(reading.claim)) {
      const parts = readingParts(reading);
      const unused = parts.filter((p) => !this.used.has(p.of));
      if (unused.length) return this.leave(reading, { construction: unused[0]!.key, key: unused[0]!.key, reason: "unused", unused: unused.map((p) => p.text) });
      const out: string[] = [];
      this.talkRules(reading, talk, out);
      this.accounting.set(reading.id, { parts, used: this.used });
      talk.used.forEach((l) => this.notes.push({ reading: reading.id, frame: { ...l, construction: l.key } }));
      this.readings.push(reading.id);
      this.lines.push(`% ${reading.id}`, `on(${str(reading.id)}).`, ...out);
      return;
    }
    // R4c-8 (D8): a channel on your own claim, with any stance number, is row 1; the frames go to the notes.
    const own = ownChannel(reading);
    const frames = this.readingFrames(reading, own?.frames);
    if (frames.other) return this.leave(reading, { construction: frames.other.construction, key: frames.other.key, reason: "noRow" });
    // R4c-8: a bare sentence a channel carries to is row 1 too.
    const carriedChannel = reading.frames.every((f) => f.key === "slot:newMember" || f.key === "edge:vocative") && !reading.links.some((l) => l.kind === "carriedFrame" && l.key === "carry:holder") ? reading.links.find((l) => l.kind === "carriedFrame" && l.key === "carry:channel") : undefined;
    // R4a-12 (D1): a say word over a hinge, *because*, MAY or a contrary zone keeps the wrap as data.
    const sayOver = frames.say ? [frames.hinge, frames.because, frames.may, frames.zone].filter((f): f is Frame => !!f) : [];
    if (frames.say && sayOver.length === 1 && over(reading, frames.say, sayOver[0]!)) return this.sayData(reading, frames, sayOver[0]!);
    const kinds = [frames.hinge, frames.universal, frames.restrictor].filter(Boolean).length;
    if (kinds > 1 && !(frames.hinge && frames.universal)) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    // R2-1 row 8: a hinge beside *because* only as *only because*, `thebem` over `thahum`; contrary to only on a plain claim.
    const onlyBecause = !frames.hinge || (frames.because && frames.hinge.values.gloss === "only-if" && over(reading, frames.hinge, frames.because) && !becauseDenied(reading));
    // R4b-2: *because* inside a holder's view; R4b-5, R4b-6 (D3, D11): MAY right before or after it; R4b-7 (D12): under
    // `hual` / `huam`, the restrictor over the hinge.
    const becauseOk =
      !(frames.mayHost || frames.likely || frames.say || frames.zone) &&
      onlyBecause &&
      (!frames.may || !(frames.holder || frames.hinge || frames.restrictor)) &&
      (!frames.restrictor || (!frames.holder && !frames.hinge && !!frames.because && over(reading, frames.restrictor, frames.because)));
    if (frames.because && !becauseOk) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
    // Row 14 on a plain claim; R4b-9: beside MAY; R4b-12, R4b-13: on a closed universal; R4b-14: with `hual` / `hal`;
    // R4b-15 (D14, R4e decision 3): with a hinge. One of these at a time.
    const zoneOk = !(frames.mayHost || frames.likely || frames.holder || frames.say) && [frames.may, frames.hinge, frames.universal, frames.restrictor].filter(Boolean).length <= 1;
    if (frames.zone && !zoneOk) return this.leave(reading, { construction: "frameCombination", reason: "noRow" });
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
    if (frames.may && (frames.mayHost || frames.likely)) return this.leave(reading, combination);
    // R4b-20: MAY over a plain say word (`thomam … hwuvam`); the say word first stays R4a-12's data (`say(.., may(T))`).
    if (frames.may && frames.say && !(over(reading, frames.may, frames.say) && !(frames.universal || frames.restrictor || frames.hinge || frames.holder || frames.because || frames.zone))) return this.leave(reading, combination);
    // R4b-21 to R4b-23: MAY with a universal or a restrictor, and nothing else.
    if (frames.may && (frames.universal || frames.restrictor) && (frames.hinge || frames.holder || frames.because || frames.zone)) return this.leave(reading, combination);
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
    } else if (frames.may && (frames.universal || frames.restrictor)) {
      // R4b-21: MAY first gates the whole generalization; the binder first is a choice per member (no `mayOver`).
      // R4b-22: MAY over `hual` / `hal` gates row 15; R4b-23 (D13): `hual` over MAY is `may(T)` on every occasion.
      const other = (frames.universal ?? frames.restrictor)!;
      if (over(reading, frames.may, other)) mayOver = "gate";
      else if (over(reading, other, frames.may)) mayOver = frames.restrictor ? "outcome" : undefined;
      else return this.leave(reading, combination);
    }
    const wrapped = this.wrap(reading, frames, ctx);
    if (wrapped && "reason" in wrapped) return this.leave(reading, wrapped);
    // R4b-2: *because* runs inside a holder's own view, never under a say word.
    if (wrapped && (frames.zone || (frames.because && (wrapped.kind !== "view" || wrapped.say)))) return this.leave(reading, combination);
    if (wrapped) {
      // R3-6: the holder covers its own MAY. R4b-27 (D6): so does a carried holder (holder.md#naming-a-holder), on a
      // plain claim only, as the holder's own MAY is.
      const carriedMay = !!frames.may && !frames.holder && wrapped.kind === "view" && !wrapped.say;
      if (carriedMay && (frames.hinge || frames.because || frames.universal || frames.restrictor || frames.say)) return this.leave(reading, combination);
      if (frames.may && !frames.holder && !carriedMay && !(frames.say && wrapped.kind === "say")) return this.leave(reading, combination);
      if (frames.may && wrapped.kind === "view") wrapped.may = true;
      ctx.wrap = wrapped;
      ctx.asserted = false;
      // R4a-1: a restrictor runs inside a holder's view; a say word keeps no restrictor.
      // R4a-9: a hinge over a say word; R4a-10, R4a-11: a universal with a plain say word, either order.
      const hingeOverSay = !!frames.hinge && wrapped.kind === "say" && !!frames.say && over(reading, frames.hinge, frames.say) && !frames.universal;
      const sayUniversal = !!frames.universal && wrapped.kind === "say" && !frames.hinge;
      if ((frames.restrictor && wrapped.kind !== "view") || frames.likely || (frames.say && (frames.restrictor || (frames.hinge && !hingeOverSay) || (frames.universal && !sayUniversal)))) return this.leave(reading, combination);
    }
    if (frames.mayHost || (frames.may && !frames.holder && ctx.wrap?.kind !== "view" && !mayOver)) ctx.choice = true;
    if (frames.likely) {
      const likely = this.likely(frames.likely, ctx);
      if (likely !== true) return this.leave(reading, likely);
    }
    // R4c decision 6 (evidentiality.md#evidence-clause): the grounds after `blarl` are your claim too.
    const grounds = own?.channel.hosted && own.channel.hosted.kind !== "thing" ? this.grounds(reading, own.channel, ctx) : undefined;
    if (grounds && "reason" in grounds) return this.leave(reading, grounds);
    const done = this.body(reading, frames, ctx, mayOver);
    if (done !== true) return this.leave(reading, done);
    if (grounds) {
      this.rule(ctx, grounds.text, []);
      this.rule(ctx, `grounds(${grounds.text},${this.claim(reading.claim, ctx)})`, []);
      this.pool(grounds.reading, grounds.text, grounds.reading.claim, 1);
    }
    if (own) this.use(...own.frames);
    this.use(carriedChannel);
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
    if (own) own.frames.forEach((frame) => this.notes.push({ reading: reading.id, frame }));
    talk.used.forEach((l) => this.notes.push({ reading: reading.id, frame: { ...l, construction: l.key } }));
    // R4d decision O-1: a plain claim keeps its term for a later *therefore*.
    const plain = bareFrames(frames, ctx) && !ctx.choice && !grounds && !claimTerms(reading.claim).some((t) => t.kind === "list" || t.kind === "clause" || t.kind === "quote" || t.kind === "blank");
    if (plain) this.plainTerms.set(reading.id, this.claim(reading.claim, ctx));
    this.talkRules(reading, talk, out);
    this.readings.push(reading.id);
    this.lines.push(`% ${reading.id}`, `on(${ctx.id}).`, ...out);
  }

  /**
   * R4d-1, R4d-3 to R4d-5 (R4d decisions O-4, O-5): the links that add no term. Used: a sentence linker, topic word or
   * agenda number (`unit:linker`), a span topic (`body:topicMarker`), a tag (`slot:tag`; its phrase takes its own row),
   * a discourse hook that adds, rewords or returns (`edge:hook`, {@link KEPT_HOOK}), and a polar word with no verdict
   * (`ua`, `oe`, `ae`, `ue`, or any polar word on a command or with no reading before it). R4d-2: `ao` / `uo` on any
   * ending (`-r` too, O-4) on a yes / no question or a statement is a verdict on that reading's claim; on a fill question,
   * or a reading with a frame or a list, it stays unused. O-1: `xahom` names the reading its `cause` starts from.
   */
  talk(reading: Reading): Talk {
    const out: Talk = { used: [] };
    for (const l of reading.links) {
      const text = raws(l.words);
      if (l.key === "unit:linker" || l.key === "body:topicMarker" || l.key === "slot:tag") {
        out.used.push(l);
        if (l.key === "unit:linker" && text === "xahom" && l.to) out.therefore = l.to;
      } else if (l.key === "edge:hook" && l.kind === "discourse" && KEPT_HOOK.test(text)) out.used.push(l);
      else if (l.key === "edge:polar") {
        const m = /^y([aeiou]+)[lmr]$/.exec(text);
        if (!m) continue;
        const to = l.to ? this.byId.get(l.to) : undefined;
        const force = to?.frames.find((f) => f.key === "edge:force");
        const command = force?.values.series === "o" || force?.values.series === "u";
        if (["ua", "oe", "ae", "ue"].includes(m[1]!) || ((m[1] === "ao" || m[1] === "uo") && (!to || command))) out.used.push(l);
        else if ((m[1] === "ao" || m[1] === "uo") && to && answerable(to)) {
          out.used.push(l);
          out.answer = { to, sign: m[1] === "ao" ? 1 : -1 };
        }
      }
    }
    return out;
  }

  /**
   * R4d-2: a verdict takes the claim T of the reading it answers, written at that reading's sites (so its `zawan` stays
   * the one answering): `holds(T) :- on(Id).` for `ao`, row 2's `holds(neg(T)) :- on(Id).` for `uo`. A first mention in
   * T takes the answer's own constants under `ao` (row 14; its witness lines are the answer's) and its kind under `uo`.
   * R4d decision O-1: `xahom` between two plain claims adds row 10's `holds(cause(Prior, Next)) :- on(Id).`
   */
  talkRules(reading: Reading, talk: Talk, out: string[]): void {
    if (talk.answer) {
      const { to, sign } = talk.answer;
      if (sign > 0) for (const f of to.frames) if (f.key === "slot:newMember" && f.hosted) this.newMembers.add(f.hosted);
      const had = this.witnesses.get(to.id);
      const ctx: Ctx = { reading: to, id: str(reading.id), subst: new Map(), asserted: sign > 0, out };
      const t = this.claim(to.claim, ctx);
      this.rule(ctx, sign > 0 ? t : `neg(${t})`, []);
      this.pool(reading, t, to.claim, sign);
      const lines = this.witnesses.get(to.id);
      if (!had && lines) {
        this.witnesses.delete(to.id);
        this.witnesses.set(reading.id, new Set([...(this.witnesses.get(reading.id) ?? []), ...lines]));
      }
    }
    const prior = talk.therefore ? this.plainTerms.get(talk.therefore) : undefined;
    const next = this.plainTerms.get(reading.id);
    if (prior && next) this.rule({ reading, id: str(reading.id), subst: new Map(), asserted: true, out }, `cause(${prior},${next})`, []);
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
   * R4c decision 6 (evidentiality.md#evidence-clause): a reasoned channel's grounds after `blarl`, a plain clause with
   * no list, claimed as row 1, with the data `grounds(E, C)` (kept apart from `cause`). Checked before the claim is
   * written; the caller writes it. A `bl-` source noun is no grounds: it stays in the notes. Why it has no row: another source, a frame or a list in the grounds, or a list in the
   * claim.
   */
  grounds(reading: Reading, channel: Frame, ctx: Ctx): { text: string; reading: Reading } | Why {
    const bad = { construction: channel.construction, key: channel.key, reason: "noRow" };
    const hosted = channel.hosted;
    const link = hosted?.kind === "clause" ? reading.links.find((l) => l.kind === "standIn" && l.to === hosted.reading.id) : undefined;
    if (hosted?.kind !== "clause") return bad;
    if (!link || link.words.map((w) => w.raw).join(" ") !== "blarl" || isEmptyClaim(reading.claim)) return bad;
    if (claimTerms(reading.claim).some((t) => t.kind === "list")) return bad;
    const cond = hosted.reading;
    if (cond.frames.some((f) => f.key !== "slot:newMember") || this.unrowed(cond) || cond.stanceLists?.length || claimTerms(cond.claim).some((t) => t.kind === "list" || termFrames(t).length)) return bad;
    this.condition(reading, channel);
    return { text: this.claim(cond.claim, { ...ctx, reading: cond, asserted: false }), reading: cond };
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
   * Answer, Ending[, to(X)])` with the say word's wrap. A plan with no holder is the turn speaker's. R4b decision 3: a
   * want or a decision is `want(H)` / `decision(H)`, as a plan. R4a-6, R4b-10, R4b-11 (contrary-to.md#contrary-to-holder,
   * #channel-zone): a holder after `uom` names `H` (Holders row 3), on its channel alone `channel(Gloss, H)`; a channel
   * with no holder is the turn speaker's. The holder's own channel before an intention is used with no term.
   */
  zone(reading: Reading, frame: Frame, ctx: Ctx): { term: string; say?: Extract<Wrap, { kind: "say" }> } | Why {
    const bad = { construction: frame.construction, key: frame.key, reason: "noRow" };
    const inner = frame.inner ?? [];
    const holder = inner[0]?.key === "xFamily:holder" ? inner[0] : undefined;
    const rest = holder ? inner.slice(1) : inner;
    if (rest.length > 1 || (!holder && !rest.length)) return bad;
    const f = rest[0];
    const host = holder?.inner?.length === 1 && holder.inner[0]!.key === "overlay:evidential:th" ? holder.inner[0] : undefined;
    const intention = f ? ZONE_INTENTIONS[f.key] : undefined;
    const channel = f ? (f.key === "overlay:evidential:th" && !f.holderHost ? f : undefined) : host;
    const gloss = intention ? undefined : channel?.values.gloss;
    if (holder && (!host || !(intention || (!f && gloss)))) return bad;
    if (intention || gloss) {
      const who = holder ? this.holder(holder, { ...ctx, choice: false }) : this.speaker(reading);
      if (!who) return bad;
      this.use(frame, f, holder, host);
      return { term: intention ? `${intention}(${who})` : `channel(${name(gloss!.toLowerCase())},${who})` };
    }
    if (!f || f.key !== "wordFamily:say") return bad;
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
    // R4c-3 (D7): `ue` (*anything but*) denies each listed item, as `u` does; the outside item adds no rule.
    const denies = (t: ListTerm, key: string): boolean => !!t.frames?.some((f) => f.key === key);
    const denials = claimTerms(claim, false).filter((t): t is ListTerm => t.kind === "list" && (denies(t, "joinSeries:u") || denies(t, "joinSeries:ue")));
    // R4c-4 (D9): two `u` lists in one clause deny every pairing, on a plain claim only.
    const second = denials[1];
    const listedOnly = (t: ListTerm): boolean => denies(t, "joinSeries:u") && !(t.parts.length > 1 && t.parts.at(-1)!.members.length === 0);
    if (denials.length > 2 || (second && (!denials.every(listedOnly) || frames.universal || frames.because || frames.hinge || frames.restrictor || frames.zone || ctx.deny))) return { construction: "join.u", key: "joinSeries:u", reason: "noRow" };
    const denial = denials[0];
    for (const d of denials) this.use(...(d.frames ?? []).filter((f) => f.key === "joinSeries:ue"));
    // R3-1 row 7: the list a whole-list denial denies; `vael vul` denies each item, as a plain denial does.
    const inner = denial && denial.parts.length > 1 && denial.parts.at(-1)!.members.length === 0 ? joinOf(denial.parts[0]!.join) : undefined;
    // R4b-24: `vaem vul` as `vael vul` ("On `ae`, even `-m` still needs at least one of the listed items").
    const whole = !!inner && !(inner.series === "ae" && (inner.ending === "l" || inner.ending === "m"));
    const ors = claimTerms(claim, false).filter(isOrList);
    const noRow = (key: string): Why => ({ construction: key.replace("joinSeries:", "join."), key, reason: "noRow" });
    // R4b-7 (D12): *because* with an *or* list in its outcome, alone.
    const becauseOr = !!frames.because && !(frames.may || frames.restrictor || frames.hinge || becauseDenied(reading));
    if (ors.length > 1 || (ors.length && (denial || frames.universal || frames.restrictor || frames.hinge || (frames.because && !becauseOr) || frames.zone || ctx.wrap || ctx.deny || frames.likely))) return noRow(`joinSeries:${ors[0]!.values.series}`);
    if (ctx.deny && denial) return noRow("joinSeries:u");
    // R3-1 row 5: MAY over an or list gates it, as over a hinge.
    if (ors.length && frames.may) [ctx.choice, mayOver] = [false, "gate"];
    // R4b-18, R4b-19: plain MAY over members or over a whole-list denial gates them, as over an *or* list. Any other
    // choice or gate over them has no row.
    const listed = whole || claimMemberLists(claim, reading).size > 0;
    const plainMay = !!frames.may && !ctx.wrap && !frames.mayHost && !frames.likely && !frames.universal && !frames.restrictor && !frames.zone && !frames.because;
    if (listed && ctx.choice && !mayOver && plainMay) [ctx.choice, mayOver] = [false, "gate"];
    else if (listed && (ctx.choice || mayOver)) return { construction: "frameCombination", reason: "noRow" };
    // R4e-6: MAY over a hinge is row 15 on the conditional term, with no `maybe(Id)` gate (the hinge's rules wait on the term).
    if (mayOver === "gate" && !frames.hinge) {
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
      // R4b-21: MAY with a closed universal only (row 8), never with *no K* and no verb.
      const lone = !claim.verb && !claim.predicate.length && Object.keys(claim.roles).length === 1;
      if (frames.may && (open || lone)) return { construction: "frameCombination", reason: "noRow" };
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
      ctx.every = { list, kind: k };
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

    // The heads: the claim, or each denied item (row 2); a rank or tie list claims its rank terms (R1-8, R4c-1, R4c-2).
    // R4c-5: a verb join's SHARED part goes into each verb's term; R4c-6, R4c-7: a likeness or a collective word on the members.
    const ranked: { heads: { text: string; claim: Claim; unasked?: true }[]; acts?: ListTerm; one?: true } | undefined = denial ? undefined : (this.ranked(reading, claim, frames, ctx) ?? this.verbJoin(reading, claim, frames, ctx) ?? this.asOne(claim, frames, ctx));
    const heads: { text: string; claim: Claim; sign: 1 | -1; unasked?: true }[] = second
      ? denial!.members.flatMap((a) => second.members.map((b) => ({ ...this.substitutedAll(claim, [[denial!, a], [second, b]], { ...ctx, asserted: false }), sign: -1 as const })))
      : denial
      ? denial.members.map((m) => ({ ...this.substituted(claim, denial, m, { ...ctx, asserted: false }), sign: -1 as const }))
      : (ranked?.heads ?? [{ text: this.claim(claim, ctx), claim }]).map((h) => ({ ...h, sign: ctx.deny ? -1 : sign }));
    if (frames.universal && denial) heads.forEach((h) => (h.sign = -1));
    const lit = (h: { text: string; sign: number }): string => (h.sign < 0 ? `neg(${h.text})` : h.text);

    if (frames.because) return this.because(reading, frames, claim, heads, body, ctx, mayOver);
    // Row 14's zone, outside MAY's choice. A say-word zone only on a plain claim or beside MAY (R4b-9); on a universal
    // only a closed `zual` (R4b-12, R4b-13).
    const zone = frames.zone ? this.zone(reading, frames.zone, { ...ctx, choice: false }) : undefined;
    if (zone && "reason" in zone) return zone;
    const zoneBad = { construction: frames.zone?.construction ?? "", key: frames.zone?.key, reason: "noRow" };
    if (zone && ((zone.say && (frames.universal || frames.restrictor || frames.hinge)) || (frames.universal && (frames.universal.key !== "joinSeries:ua" || open)))) return zoneBad;
    if (frames.hinge) {
      // R4b-15 (D14): the earlier covers the later; a zone first marks the conditional (R4e decision 3).
      const first = zone && (over(reading, frames.zone!, frames.hinge) ? true : over(reading, frames.hinge, frames.zone!) ? false : undefined);
      if (zone && first === undefined) return zoneBad;
      return this.hinge(reading, frames.hinge, heads, body, ctx, mayOver, false, zone ? { term: zone.term, first: !!first } : undefined);
    }

    if (frames.restrictor) {
      const v = frames.restrictor.values;
      const listed = claim.details.some((d) => d.key === "unit:h");
      const always = v.series === "ua" && v.ending === "l";
      const never = v.series === "a" && v.ending === "l";
      const usually = v.series === "ua" && v.ending === "m";
      const bad = { construction: frames.restrictor.construction, key: frames.restrictor.key, reason: "noRow" };
      if (denial || !(always || never || usually) || (usually && listed)) return bad;
      // R4b-22: MAY over bare `hual` / `hal` gates row 15 (the gate is already on ctx); `huam` has no row there.
      if (frames.may && usually) return bad;
      if (frames.may && mayOver === "outcome") {
        // R4b-23 (D13, restrictors.md#always-hual): `hual` over MAY is `may(T)` with the marker `always(may(T))`; it
        // clashes with *never*, not with one *not*. D18: it also writes row 15's choice on T.
        if (!always || listed) return bad;
        this.use(frames.restrictor);
        const t = heads[0]!.text;
        const marker = `always(may(${t}))`;
        this.rule({ ...ctx, choice: true }, t, []);
        this.rule(ctx, `may(${t})`, []);
        this.rule(ctx, `may(${t})`, [], "always");
        this.rule(ctx, marker, [{ atom: `never(${t})`, premise: `never(${t})` }], "clash");
        this.rule(ctx, marker, [{ atom: "never(P)", premise: "never(P)" }, { atom: `fits(P,${t})` }], "clash");
        this.pool(reading, t, heads[0]!.claim, 1);
        return true;
      }
      // R4b-14: a zone only with bare `hual` / `hal`.
      if (zone && (usually || listed)) return zoneBad;
      this.use(frames.restrictor);
      const h = heads[0]!;
      // R4a-1: inside a holder's view each term is wrapped, the marker too (`always(view(H, T))`).
      if (usually) {
        this.open(ctx, h.text, []);
      } else {
        if (!listed) this.rule(ctx, this.w(ctx, always ? h.text : `neg(${h.text})`), []);
        this.rule(ctx, this.w(ctx, h.text), [], always ? "always" : "never");
      }
      // R4b-14 (restrictors.md#always-hual): `hual` marks its act against the zone, the marker too; `hal` has no event to mark.
      if (zone && always) {
        this.rule(ctx, `against(${h.text},${zone.term})`, []);
        this.rule(ctx, `against(${h.text},${zone.term})`, [], "always");
      }
      this.pool(reading, h.text, h.claim, never && !listed ? -1 : 1);
      return true;
    }

    // R2-7, R2-9: a ban's act is matched against the acts it may meet, as a denied term is.
    const ban = sayOf(ctx.wrap)?.answer === "u";
    for (const h of heads) {
      if (open) this.open(ctx, h.text, body);
      else this.rule(ctx, this.w(ctx, lit(h)), body);
      if (zone) {
        // R2-1 row 9, R2-11: the act is still your claim, marked against its zone; a say-word zone claims its say word.
        // R4b-9: beside MAY the mark needs the act; R4b-12: on a universal, each member's.
        const plain = { ...ctx, choice: false };
        this.rule(plain, `against(${lit(h)},${zone.term})`, ctx.choice ? [{ atom: `holds(${lit(h)})`, premise: lit(h) }] : body);
        if (zone.say) this.rule(plain, wrapText(zone.say, lit(h)), []);
        if (zone.say?.answer === "u") this.pool(reading, h.text, h.claim, -1);
      }
      if (list) this.templates.push({ ctx, list, claim: h.claim, sign: ban ? -1 : h.sign });
      else if (!h.unasked) this.pool(reading, h.text, h.claim, ban ? -1 : h.sign);
      // R3-5: every MAY reading gives `may(T)`, which a hinge on a MAY condition reads; the holder's own MAY (R3-6) is
      // already a term inside the view.
      // R4b-18: over members the gate's `may(T)` is on the list term, ungated. R4b-20: over a say word, `may(say(..T))`.
      // R4b-21: the binder over MAY gives `may(T[X])` per member; MAY over the binder has only the gate.
      const mayRow = (frames.may && (!ctx.wrap || ctx.wrap.kind === "say") && !(frames.universal && mayOver === "gate")) || frames.mayHost;
      if (mayRow) this.rule({ ...ctx, choice: false, gate: undefined }, `may(${this.w(ctx, lit(h))})`, list ? body : []);
    }

    // Membership (row 10): the claim keeps its list term, and each member (or each paired place) holds; R2-5, inside a
    // view too. R4a-11 (D1): under a plain say word the content stays one wrapped term, and `a` and `o` reach each member.
    // R4c-2 (D17), R4c decision 2: a rank or tie with a verb gives each member's act, as row 11 does.
    const lists = ranked?.acts ? new Map<Term, object | undefined>([[ranked.acts, undefined]]) : undefined;
    if (!denial && !frames.universal && !ranked?.one && (!sayOf(ctx.wrap) || ctx.wrap?.kind === "say")) this.members(reading, claim, ctx, lists);
    return true;
  }

  /** Row 9: an open generalization gives only *could be*; with everyday defaults switched on it holds until denied. */
  open(ctx: Ctx, head: string, body: Literal[]): void {
    const exception: Literal = { atom: `not holds(${this.w(ctx, `neg(${head})`)})` };
    this.rule(ctx, this.w(ctx, head), [...body, exception], "choice");
    this.rule(ctx, this.w(ctx, head), [...body, exception, { atom: "switch(defaults)" }]);
  }

  /**
   * A rank or tie list on one shared scale, and nothing else in the clause but a verb: the terms it claims, each with
   * the claim a question is matched against, and the list whose members each act; undefined for any other shape.
   * - R1-8: two names before `zol`, `more(S, A, B)`, the scale with its degree (comparative-arity.md#amount-scale).
   * - R4c decision 3: three or more before `zol`, `more(S, Xi, Xj)` for each i < j in text order; `zaol` sorts low to
   *   high, so each later name ranks higher (list-structure.md#shared-after-the-join).
   * - R4c-1: one name before `zol`, the superlative `most(S, A)` (comparatives.md#superlatives); a `/w/` degree goes to
   *   the notes.
   * - D22: an ordinal on `/w/` there is a place on the scale, `place(S, A, N)` (comparative-arity.md#place-on-a-scale);
   *   no `more(..)`, since the set it ranks in is unstated. The generic rules clash two places and deny the top.
   * - R4c-2 (D17): a tie, `tie(S, A, B, E)` per ordered pair, E `l` or `m` (comparatives.md#equatives).
   * - R4c decision 4: a closed tie of two with a factor is `ratio(S, A, B, V)`, no tie (comparative-arity.md#factor);
   *   D21: pooled for questions, since `match()` compares the scale, the factor and the ending.
   * - R4c decision 2, D17: with a verb the scale is `/h/` and each member's act holds (comparative-arity.md#manner-scale).
   * Beyond R1-8 the clause has no frame: a denied rank and `zom` wait.
   */
  ranked(reading: Reading, claim: Claim, frames: Frames, ctx: Ctx): { heads: { text: string; claim: Claim; unasked?: true }[]; acts?: ListTerm } | undefined {
    const z = claim.roles.z;
    if (claim.predicate.length || claim.roles.d || claim.roles.b || claim.details.length) return undefined;
    if (z?.kind !== "list" || z.parts.length !== 1 || z.frames?.length || z.bound) return undefined;
    const shared = z.sharedDetails ?? [];
    const scale = shared[0];
    if (shared.length !== 1 || !scale) return undefined;
    const { series, ending } = z.values;
    const n = z.members.length;
    const named: string[] = [];
    const names = (i: number): string => (named[i] ??= this.kind(z.members[i]!, `z${i + 1}`, ctx));
    if (!claim.verb && series === "o" && n === 2 && scale.values.role === "scale") {
      this.use(z, scale);
      return { heads: [{ text: `more(${this.detail(scale, ctx)},${names(0)},${names(1)})`, claim }] };
    }
    if (!bareFrames(frames, ctx) || (claim.verb && (scale.kind !== "adverb" || collective(claim)))) return undefined;
    // The claim over two of the members, in that order, as `zol` or `zoel`: what a question about the pair is matched against.
    const pair = (i: number, j: number): Claim => {
      const members = [z.members[i]!, z.members[j]!];
      const values = series === "ao" ? { ...z.values, series: "o" } : z.values;
      return replaceTerm(claim, z, { ...z, members, values, parts: [{ ...z.parts[0]!, members }] });
    };
    const heads: { text: string; claim: Claim; unasked?: true }[] = [];
    const inner = scale.details ?? [];
    if (series === "o" && scale.values.role === "scale" && n === 1) {
      const place = inner.length === 1 ? detailNumber(inner[0]!) : undefined;
      if (place) {
        if (claim.verb) return undefined;
        heads.push({ text: `place(${this.detail({ ...scale, details: undefined }, ctx)},${names(0)},${this.value(place)})`, claim });
      } else {
        if (inner.some((d) => detailNumber(d))) return undefined;
        heads.push({ text: `most(${this.detail({ ...scale, details: undefined }, ctx)},${names(0)})`, claim });
        inner.forEach((d) => this.notes.push({ reading: reading.id, frame: d }));
      }
    } else if ((series === "o" || (series === "ao" && !claim.verb)) && scale.values.role === "scale" && n >= 2) {
      const s = this.detail(scale, ctx);
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const [hi, lo] = series === "o" ? [i, j] : [j, i];
          heads.push({ text: `more(${s},${names(hi)},${names(lo)})`, claim: pair(hi, lo) });
        }
    } else if (series === "oe" && scale.values.role === "equative" && n >= 2 && (ending === "l" || ending === "m")) {
      const factor = inner.length === 1 && inner[0]!.kind === "amount" ? detailNumber(inner[0]!) : undefined;
      if (factor) {
        if (ending !== "l" || n !== 2 || claim.verb) return undefined;
        // The inverse marker `ru` divides (*half as big*): the same ratio the other way round.
        const inverse = ["-", "ru"].includes(wordStem(factor)?.marker ?? "");
        const v = this.value(factor);
        if (inverse && !/^v\(-/.test(v)) return undefined;
        const [a, b] = inverse ? [names(1), names(0)] : [names(0), names(1)];
        heads.push({ text: `ratio(${this.detail({ ...scale, details: undefined }, ctx)},${a},${b},${inverse ? v.replace(/^v\(-/, "v(") : v})`, claim });
      } else {
        if (inner.length) return undefined;
        const s = this.detail(scale, ctx);
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) heads.push({ text: `tie(${s},${names(i)},${names(j)},${ending})`, claim: pair(i, j) });
      }
    } else return undefined;
    this.use(z, scale);
    if (!claim.verb) return { heads };
    return { heads: [{ text: this.claim(claim, ctx), claim }, ...heads], acts: z };
  }

  /** The claim with one list term replaced by one of its items. */
  substituted(claim: Claim, list: Term, item: Term, ctx: Ctx): { text: string; claim: Claim } {
    return this.substitutedAll(claim, [[list, item]], ctx);
  }

  /** The claim with each list term replaced by the item paired with it (R4c-4: one item of each of two denial lists). */
  substitutedAll(claim: Claim, pairs: [Term, Term][], ctx: Ctx): { text: string; claim: Claim } {
    const subst: Subst = new Map(ctx.subst);
    let out = claim;
    for (const [list, item] of pairs) {
      const enc = list === claim.verb && item.kind === "thing" ? name(item.root) : claim.predicate.includes(list) ? this.kind(item, "g", ctx) : this.term(item, placeOf(claim, list), ctx);
      subst.set(list, { text: enc, term: item });
      this.use(list);
      out = replaceTerm(out, list, item);
    }
    return { text: this.claim(claim, { ...ctx, subst }), claim: out };
  }

  /**
   * R4c-5 (list-structure.md#shared-after-the-join): a verb join with a SHARED `/h/` adverb, or a `/d/` or `/b/` after
   * it (the `verbShared` link): `holds(T[v])` per verb, each term with the shared part. A plain claim with no other
   * list; undefined for any other shape, or a verb join with nothing shared.
   */
  verbJoin(reading: Reading, claim: Claim, frames: Frames, ctx: Ctx): { heads: { text: string; claim: Claim }[] } | undefined {
    const v = claim.verb;
    if (v?.kind !== "list" || !memberList(v) || !bareFrames(frames, ctx)) return undefined;
    if (claimTerms(claim, false).some((t) => t !== v && t.kind === "list")) return undefined;
    const shared = v.sharedDetails ?? [];
    const links = reading.links.filter((l) => l.kind === "verbShared");
    if ((!shared.length && !links.length) || !shared.every((d) => d.key === "unit:h" && d.values.role === "distribute")) return undefined;
    const each: Claim = { ...claim, details: [...claim.details, ...shared] };
    const heads = v.members.map((m) => this.substituted(each, v, m, ctx));
    this.use(v, ...shared, ...links);
    return { heads };
  }

  /**
   * Members as one, with no verb and no member rule (`one`):
   * - R4c-7 (collectives.md#adjectives-g): a collective SHARED `/ɡ/` adjective (`-x`), `isa(ls(Id, z), K)`, the list as
   *   one unit, with no `member` facts and no `isa` per member (as row 11 for a collective verb).
   * - R4c-6 (relations.md, likeness): a SHARED likeness with no `bl-` word on named members, each to each other member:
   *   for each ordered pair A ≠ B the term of `A gewem blB.`
   */
  asOne(claim: Claim, frames: Frames, ctx: Ctx): { heads: { text: string; claim: Claim }[]; one: true } | undefined {
    const z = claim.roles.z;
    if (claim.verb || claim.predicate.length || claim.roles.d || claim.roles.b || claim.details.length) return undefined;
    if (z?.kind !== "list" || !memberList(z) || !bareFrames(frames, ctx)) return undefined;
    const shared = z.sharedDetails ?? [];
    const d = shared[0];
    if (shared.length !== 1 || !d || d.hosted || d.details?.length || d.words.length !== 1) return undefined;
    const word = d.words[0]!;
    if (word.family.kind !== "content") return undefined;
    const root = word.family.roots.join("");
    const kindOf = (detail: Detail): Term => ({ kind: "thing", head: word, root, named: false, details: [detail] });
    const heads: { text: string; claim: Claim }[] = [];
    if (d.values.role === "collective" && d.key === "slot:adj") {
      const one: Claim = { ...claim, predicate: [kindOf(d)] };
      heads.push({ text: `isa(${this.term(z, "z", ctx)},${this.kind(one.predicate[0]!, "g", ctx)})`, claim: one });
    } else if (d.values.role === "distribute" && d.key === "overlay:likeness:g" && z.members.every((m) => m.kind === "thing" && m.named)) {
      z.members.forEach((a, i) =>
        z.members.forEach((b, j) => {
          if (i === j) return;
          const pair: Claim = { roles: { z: a }, predicate: [kindOf({ ...d, hosted: b })], details: [] };
          heads.push({ text: this.claim(pair, ctx), claim: pair });
        }),
      );
    } else return undefined;
    this.use(z, d);
    return { heads, one: true };
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
    // R4c-5 (list-structure.md#shared-after-the-join): a hosting `/ɡ/` word, a SHARED hook, or a likeness with its model, too.
    const all = list.sharedDetails ?? [];
    const each = (d: Detail): boolean => d.values.role === "distribute" && (d.key === "slot:adj" || d.key === "hookJob:genitive" || (d.key === "overlay:likeness:g" && !!d.hosted));
    const shared = all.length && all.every(each) ? all : undefined;
    return shared && ctx.asserted && list.members.every((m) => this.newMembers.has(m)) ? shared : undefined;
  }

  members(reading: Reading, claim: Claim, ctx: Ctx, lists = claimMemberLists(claim, reading)): void {
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
    return frames.hinge ? this.hinge(reading, frames.hinge, heads, body, ctx, undefined, true) : true;
  }

  /**
   * Rows 5–7 and R1-5: a condition hinge; neither its condition nor its outcome is claimed. R4e-1: the reading claims
   * the conditional, `if(c(Id), o(Id))`, `onlyif(..)` or `iff(..)` (`neg(o(Id))` for a denied outcome), and each rule
   * takes it in its body. R4e-3: a denied conditional (`thohem thul blarl`) claims `neg(T)` and runs no rule. A hinge on
   * a universal keeps its rules with no term. R4e-6: MAY over the hinge makes the term a choice; MAY on the condition or
   * under the hinge wraps that slot of the term in `may(..)`. R4b-1: a `bl-` noun
   * condition reads as its kind.
   */
  hinge(reading: Reading, frame: Frame, heads: { text: string; claim: Claim; sign: 1 | -1 }[], body: Literal[], ctx: Ctx, mayOver?: MayOver, because = false, zone?: { term: string; first: boolean }): true | Why {
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
    // R4e-6: MAY first (`thomam … thohem blarl`) makes the conditional a choice; the hinge first (`blarth` over MAY) makes the
    // outcome possible.
    const mayGate = mayOver === "gate";
    const mayOutcome = mayOver === "outcome";
    // R4a-9: a hinge over a say word (`thohem blarth` first): the outcome is the say term, the condition your own claim.
    const sayOut = ctx.wrap?.kind === "say";
    if (sayOut && (mayCond || mayOutcome || mayGate || because)) return bad;
    const condClaim = noun?.claim ?? cond!.claim;
    const condSite = cond ?? reading;
    const universal = body.length > 0;
    const every = universal ? ctx.every : undefined;
    if (universal && !every) return bad;
    // R4b-16 (usually-vs-must.md#how-things-work): a resume pronoun in the condition whose antecedent the universal binds
    // is the member, `X`.
    const bound = every && cond ? claimTerms(cond.claim).filter((t) => t.kind === "pronoun" && this.boundBy(t)) : [];
    const condSubst = new Map(ctx.subst);
    bound.forEach((t) => condSubst.set(t, { text: "X" }));
    const condText = noun?.text ?? this.claim(cond!.claim, { ...ctx, reading: cond!, asserted: false, subst: condSubst });
    if (!bound.length && /\bX\b/.test(condText)) return bad;
    const denied = hingeDenied(reading) === frame;
    // A denied conditional on a universal (R4e open decision 2), with MAY, in a wrap or beside *because* has no row.
    // R4e-5: a holder's denied conditional is the holder's view, `view(H, neg(if(..)))`.
    if (denied && (universal || mayCond || mayOutcome || mayGate || (ctx.wrap && !plainView(ctx.wrap)) || because)) return bad;
    // R4b-15 (D14): a hinge over a zone marks the outcome its *if* rule gives; *only if* gives no outcome to mark. R4e
    // decision 3: a zone over a hinge marks the conditional, which needs its term.
    if (zone && (denied || universal || mayCond || mayOutcome || mayGate || sayOut || (!zone.first && gloss === "only-if"))) return bad;
    const h = heads[0]!;
    // R4b-16: on a universal the rules run over the member's slots, `c(Id, X)` / `o(Id, X)`, built per stated member.
    const c = universal ? `c(${ctx.id},X)` : `c(${ctx.id})`;
    const o = universal ? `o(${ctx.id},X)` : `o(${ctx.id})`;
    if (!universal) this.slots.set(c, { reading: condSite.id, claim: condClaim });
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
    // R4e-1: the conditional as a claim term over the reading's own slots. R4e-6: MAY on the condition is
    // `if(may(c(Id)), o(Id))`, MAY under the hinge `if(c(Id), may(o(Id)))`; MAY over the hinge keeps the plain term.
    // R4e decision 2 (c): on a universal, the template term over `c(Id)` / `o(Id)`, claimed once, gives a member term over
    // `c(Id, X)` / `o(Id, X)` for each member; the rules take the member term.
    const termed = !sayOut;
    const shape = (cs: string, os: string): string => {
      const oSlot = h.sign < 0 ? `neg(${os})` : os;
      return `${termName}(${mayCond ? `may(${cs})` : cs},${mayOutcome ? `may(${oSlot})` : oSlot})`;
    };
    const term = shape(`c(${ctx.id})`, `o(${ctx.id})`);
    const member = shape(c, o);
    const may: Conditional["may"] = mayCond ? "cond" : mayOutcome ? "out" : undefined;
    const conditional = { reading: reading.id, name: termName, negOut: h.sign < 0, denied, ...(may ? { may } : {}) };
    if (termed && !universal) this.conditionals.set(term, { ...conditional, id: ctx.id });
    if (universal) this.everyHinges.push({ reading, condSite, ctx, cond: condClaim, bound, out: h.claim, list: every!.list, kind: every!.kind, member, conditional });
    if (denied) {
      // R4e-3 (say-reasons.md#arguments: "only that the link fails"): the link denied, nothing else claimed.
      this.rule(ctx, w(`neg(${term})`), []);
      this.useDenied(reading, frame);
      return true;
    }
    const gate: Literal[] = termed ? [{ atom: `holds(${w(member)})`, premise: w(member) }] : [];
    if (termed && mayGate) {
      // R4e-6: row 15 on the term, `{ holds(T) }` and `holds(may(T))`.
      this.rule({ ...ctx, choice: true }, w(term), []);
      this.rule(ctx, w(`may(${term})`), []);
    } else if (termed) this.rule(ctx, w(term), []);
    if (termed && universal) this.rule(ctx, w(member), [{ atom: `holds(${w(term)})`, premise: w(term) }, ...body]);
    if (zone?.first) this.rule(ctx, `against(${term},${zone.term})`, []);
    const enough = gloss === "if" || gloss === "iff";
    const needs = gloss === "only-if" || gloss === "iff";
    if (mayCond) {
      // R3-5: the body reads `may(P)`; a stated condition gives it too. No backward rule for *if*. R4b-25 (D5): *only if*
      // and *iff* add row 6 on `may(P)`, and its back rule gives the condition as MAY on a claim (row 15).
      this.rule(ctx, w("may(P)"), [...body, { atom: `fits(${c},P)` }, { atom: `holds(${w("P")})`, premise: w("P") }]);
      if (enough) this.rule(ctx, out, [...gate, ...body, { atom: `fits(${c},P)` }, { atom: `holds(${w("may(P)")})`, premise: w("may(P)") }]);
      if (needs) {
        this.rule(ctx, notOut, [...gate, ...body, { atom: `fits(P,${c})` }, { atom: `holds(${w("neg(may(P))")})`, premise: w("neg(may(P))") }]);
        if (!universal) {
          this.rule({ ...ctx, choice: true }, w(condText), [...gate, ...outTrue("P")]);
          this.rule(ctx, w(`may(${condText})`), [...gate, ...outTrue("P")]);
        }
      }
    } else if (mayOutcome) {
      // R3-1 row 6: a hinge over MAY makes the outcome only possible: a choice, and no backward rule. R4b-26 (D5, R4b
      // decision 1): the *only if* half stays plain, without the condition the outcome is not even possible. D19: with
      // the condition held, every hinge over MAY gives the choice on the outcome (MAY gives a choice wherever it is held).
      this.rule({ ...ctx, choice: true }, out, [...gate, ...body, ...truth(c, "P")]);
      if (needs) this.rule(ctx, notOut, [...gate, ...body, ...falsity(c, "P")]);
    } else {
      if (enough) {
        this.rule(ctx, out, [...gate, ...body, ...truth(c, "P")]);
        if (zone && !zone.first) this.rule(ctx, `against(${out},${zone.term})`, [...gate, ...body, ...truth(c, "P")]);
        // R4b-16: on a universal, back per member; R4b-17: a definition (*iff*) both ways.
        this.rule(ctx, wc(`neg(${condText})`), [...gate, ...body, ...outFalse("P")]);
      }
      if (needs) {
        this.rule(ctx, notOut, [...gate, ...body, ...falsity(c, "P")]);
        this.rule(ctx, wc(condText), [...gate, ...body, ...outTrue("P")]);
      }
    }
    this.use(frame, mayCond ? condFrames[0] : undefined);
    for (const l of cond?.links ?? []) if (l.kind === "anaphor" && bound.some((t) => t.kind === "pronoun" && l.words.includes(t.word))) this.used.add(l);
    return true;
  }

  /** A pronoun whose antecedent the current reading's universal binds (its kind word). */
  boundBy(term: Term): boolean {
    const t = throughAntecedent(term);
    return t.kind === "thing" && this.bound.has(t.head);
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
        if (tb === ta || !(a.name === b.name || a.name === "iff") || a.negOut !== b.negOut || a.may !== b.may) continue;
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
    // R4b-16, R4e decision 2 (c): a universal hinge's member slots and member conditional, per member the log states of
    // its kind (`isa(M, K)` in the pool); a member known only through `widen` gets none.
    for (const e of this.everyHinges) {
      for (const [text, term] of this.individuals) {
        if (!this.terms.has(`isa(${text},${e.kind})`)) continue;
        const id = `${e.ctx.id},${text}`;
        const cond = e.bound.reduce((claim, b) => replaceTerm(claim, b, term), e.cond);
        const out = replaceTerm(e.out, e.list, term);
        const condSubst: Subst = new Map(e.ctx.subst);
        e.bound.forEach((b) => condSubst.set(b, { text, term }));
        const outSubst: Subst = new Map(e.ctx.subst).set(e.list, { text, term });
        this.slots.set(`c(${id})`, { reading: e.condSite.id, claim: cond });
        this.slots.set(`o(${id})`, { reading: e.reading.id, claim: out });
        this.pool(e.condSite, this.claim(cond, { ...e.ctx, reading: e.condSite, asserted: false, subst: condSubst, out: [] }), cond, 1);
        this.pool(e.reading, this.claim(out, { ...e.ctx, asserted: false, subst: outSubst, out: [] }), out, 1);
        this.conditionals.set(e.member.replace(/\bX\b/g, () => text), { ...e.conditional, id });
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
      ...section(VIEW_SAY_TITLE, [...this.wraps.values()].some((w) => sayOf(w) && w.kind === "view") ? VIEW_SAY : []),
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
