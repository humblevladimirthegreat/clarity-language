/**
 * Solver (docs/meta/solver.md): what follows from a log, what could be, and what clashes, from the program
 * {@link translate} writes. The only importer of `clingo-wasm`; every call is asynchronous, so the loop (`run`) and a
 * host's verdict never call it.
 *
 * - {@link follows}: cautious consequences. *yes* when a claim the question fits holds in every world, *no* when a
 *   denial of it does, *unknown* (*I can't say.*) otherwise.
 * - {@link couldBe}: brave consequences. *yes* when the claim holds in some world, *no* when its denial holds in every
 *   world, *unknown* otherwise.
 * - {@link clashes}: the smallest clashes. One world: each `clash` atom in it, with the readings behind it, shrunk by
 *   one removal pass. Several worlds: re-solved with the switch atoms free (QuickXplain).
 * - {@link giveUp}: a smallest set to give up, by one optimization run. {@link whyNot}: the smallest clash a claim joins.
 * - {@link stands}: what stands, each reading in, out or undecided over the attacks clashes give (ASPARTIX encodings).
 * - {@link fill}: what fills a fill question's blanks, from the solved atoms (R4c-9 to R4c-11, D10).
 *
 * Fitting stays the matcher's: the question is matched in TypeScript, by {@link match}, against the claims the answer
 * set's `holds` atoms stand for ({@link Translation.terms}). A question's fit to a stated range is {@link inRange}'s.
 * *Why* is a plain walk over `fired` and `used`; it ends in reading ids, ready for `whyReply`.
 *
 * The question goes into the program as one more reading with its claim switched off: its ground term joins the fits
 * and the closed world's candidates, and a first-mention noun in it (*a cat*) stays as a witness, an arbitrary member of
 * its kind, so a closed universal reaches it as the matcher's `infer` step does.
 */
import clingo from "clingo-wasm";

import type { Log } from "./log.js";
import { match, throughAntecedent, type TermSite } from "./match.js";
import type { StepLexicon } from "./steps.js";
import { detailRange, inRange, notionalHolder } from "./translate-helpers.js";
import { sayOf, unwrapText, type LeftOut, type Translation } from "./translate-types.js";
import { translate } from "./translate.js";
import type { Claim, Detail, Reading, Term } from "./types.js";
import { detailNumber, wordValue } from "./value.js";

/** About 1 MiB: `clingo-wasm` copies the program text onto a fixed WebAssembly stack, and a larger text fails (Research, S1). */
export const MAX_PROGRAM_BYTES = 1024 * 1024;

export type SolveOptions = {
  /** The parser's lexicon tables: compound heads for `widen`, in the program and in the question's match. */
  lexicon?: StepLexicon;
  /** A compound fits on its head (R1-4); an answer that used it names it. */
  widen?: boolean;
  /** Everyday defaults for open universals (row 9): a member holds until an exception is shown. */
  defaults?: boolean;
  /** The unsaid is false: every term the log or the question mentions that does not hold is denied. */
  closedWorld?: boolean;
  /** The program size the solver refuses past; {@link MAX_PROGRAM_BYTES} by default. */
  maxBytes?: number;
};

/** A switch an answer went through, as `Match.switches` names the matcher's. */
/** `couldBe`: a MAY question (R4b-28, D6) was run as {@link couldBe} by another job. */
export type SolveSwitch = "widen" | "defaults" | "closedWorld" | "couldBe";

/**
 * `yes` / `no` / `unknown` as `Verdict` has them; `both` when the question's claim and its denial both follow (the log
 * clashes on it); `beyond` when the question has a frame with no row; `refused` when the program is too large or Clingo
 * failed, with `english` saying so.
 */
export type SolveVerdict = "yes" | "no" | "unknown" | "both" | "beyond" | "refused";

export type Answer = {
  verdict: SolveVerdict;
  /** Reading ids behind the answer, in log order: `whyReply(because)`. */
  because: string[];
  switches: SolveSwitch[];
  /** Readings the program left out (a frame with no row): the answer is from the rest. */
  left: LeftOut[];
  english?: string;
};

export type Clash = {
  /** The `clash` atom's argument. */
  atom: string;
  /** A clash's readings after one removal pass, in log order. */
  readings: string[];
  switches: SolveSwitch[];
  english: string;
};

export type ClashResult = { clashes: Clash[]; left: LeftOut[]; refused?: string };

// ── Clingo ──────────────────────────────────────────────────────────────────

type Run = { ok: true; atoms: string[] } | { ok: false; why: string };

const bytes = (program: string): number => new TextEncoder().encode(program).length;

function tooLarge(program: string, options: SolveOptions): string | undefined {
  const size = bytes(program);
  const limit = options.maxBytes ?? MAX_PROGRAM_BYTES;
  return size > limit ? `The log is too large for the solver: its program is ${size} bytes, over the ${limit}-byte limit.` : undefined;
}

type Raw =
  | { ok: true; unsat: boolean; witnesses: string[][]; more: boolean }
  | { ok: false; why: string };

/** One Clingo call: every witness printed, whether the program had no world, and whether more models were left. */
async function call(program: string, models: number, args: string[]): Promise<Raw> {
  try {
    const result = (await clingo.run(program, models, args)) as {
      Result: string;
      Error?: string;
      Call?: ({ Witnesses?: { Value: string[] }[] } | null)[];
      Models?: { More?: string };
    };
    if (result.Result === "ERROR") return { ok: false, why: `The solver failed: ${result.Error ?? "unknown error"}.` };
    const witnesses = (result.Call?.[0]?.Witnesses ?? []).map((w) => w.Value);
    return { ok: true, unsat: result.Result === "UNSATISFIABLE", witnesses, more: result.Models?.More === "yes" };
  } catch (error) {
    return { ok: false, why: `The solver failed: ${error instanceof Error ? error.message : String(error)}.` };
  }
}

/** One run in `cautious` (every world) or `brave` (some world) mode: the consequences, or why there are none. */
async function consequences(program: string, mode: "cautious" | "brave"): Promise<Run> {
  const r = await call(program, 0, [`--enum-mode=${mode}`, "--quiet=1"]);
  if (!r.ok) return r;
  if (r.unsat) return { ok: false, why: "The solver found no world." };
  return { ok: true, atoms: r.witnesses.at(-1) ?? [] };
}

/**
 * R3-4: the worlds a question reads. Clash-free worlds first (`:- clash(P).`); when every world clashes, every world, so
 * the log's own clash shows as `both`. A one-world log answers as before.
 */
async function worlds(program: string): Promise<string | { why: string }> {
  const free = `${program}\n:- clash(P).`;
  const r = await call(free, 1, []);
  if (!r.ok) return { why: r.why };
  return r.unsat ? program : free;
}

/** Whether the program has more than one world: the choices (row 9's open rules, the closed world's loops) matter. */
async function severalWorlds(program: string): Promise<boolean | string> {
  const r = await call(program, 2, []);
  if (!r.ok) return r.why;
  return r.witnesses.length > 1;
}

/** Split `f(a,g(b),"c,d")` into its name and top-level arguments. */
export function splitAtom(atom: string): { name: string; args: string[] } {
  const open = atom.indexOf("(");
  if (open < 0) return { name: atom, args: [] };
  const args: string[] = [];
  let depth = 0;
  let quoted = false;
  let start = open + 1;
  for (let i = open + 1; i < atom.length - 1; i++) {
    const ch = atom[i]!;
    if (quoted) {
      if (ch === "\\") i++;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      args.push(atom.slice(start, i));
      start = i + 1;
    }
  }
  args.push(atom.slice(start, atom.length - 1));
  return { name: atom.slice(0, open), args };
}

const unquote = (s: string): string => (s.startsWith('"') ? (JSON.parse(s) as string) : s);
const negOf = (t: string): string | undefined => (t.startsWith("neg(") && t.endsWith(")") ? t.slice(4, -1) : undefined);

/** An answer set, indexed for the *why* walk. */
class Model {
  readonly holds = new Set<string>();
  readonly clash: string[] = [];
  readonly fired = new Map<string, string[]>();
  readonly used = new Map<string, string[]>();
  readonly fits = new Map<string, string[]>();
  readonly candidate = new Set<string>();

  constructor(atoms: readonly string[]) {
    for (const atom of atoms) {
      const { name, args } = splitAtom(atom);
      const push = (map: Map<string, string[]>, key: string, value: string): void => void map.set(key, [...(map.get(key) ?? []), value]);
      if (name === "holds") this.holds.add(args[0]!);
      else if (name === "clash") this.clash.push(args[0]!);
      else if (name === "fired") push(this.fired, args[1]!, unquote(args[0]!));
      else if (name === "used") push(this.used, `${unquote(args[0]!)}|${args[1]!}`, args[2]!);
      else if (name === "fits") push(this.fits, args[0]!, args[1]!);
      else if (name === "candidate") this.candidate.add(args[0]!);
    }
  }
}

// ── Explaining ──────────────────────────────────────────────────────────────

type Context = { translation: Translation; options: SolveOptions; question?: string; open: Set<string> };

/** Reading ids with an open rule (row 9): an answer through one under `switch(defaults)` used the defaults. */
function openReadings(program: string): Set<string> {
  const out = new Set<string>();
  for (const m of program.matchAll(/switch\(defaults\), on\(("(?:[^"\\]|\\.)*")\)/g)) out.add(unquote(m[1]!));
  return out;
}

/**
 * `fired` ids of generic rules that are not readings: a requirement's permission (R2-8), an act against a ban (R2-9), a
 * ban's denied permission (permission-consent.md#requirement), a place below the top's denied top (D22).
 */
const GENERIC_IDS = new Set(["requires", "against", "bans", "place"]);

/** Walk from conclusions back through `fired` and `used` to the readings that produced them. */
function explain(model: Model, start: readonly string[], ctx: Context): { because: string[]; switches: SolveSwitch[] } {
  const ids = new Set<string>();
  const switches = new Set<SolveSwitch>();
  const seen = new Set<string>();
  const queue = [...start];
  while (queue.length) {
    const c = queue.pop()!;
    if (seen.has(c)) continue;
    seen.add(c);
    const by = model.fired.get(c) ?? [];
    if (!by.length) {
      const inner = negOf(c);
      if (ctx.options.closedWorld && inner && model.candidate.has(inner) && !model.holds.has(inner)) switches.add("closedWorld");
    }
    for (const id of by) {
      if (id === "widen") switches.add("widen");
      else if (GENERIC_IDS.has(id)) {
        // A generic rule (R2-8, R2-9): no reading of its own; its premises name them.
      } else if (id !== ctx.question) {
        ids.add(id);
        if (ctx.options.defaults && ctx.open.has(id)) switches.add("defaults");
      }
      queue.push(...(model.used.get(`${id}|${c}`) ?? []));
    }
  }
  const order = ctx.translation.readings;
  const because = [...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return { because, switches: (["widen", "defaults", "closedWorld"] as const).filter((s) => switches.has(s)) };
}

/** The held grant or demand a ban's say word (its arguments) meets, each term wrapped by `w`. */
function sayMet(model: Model, args: readonly string[], w: (t: string) => string): string | undefined {
  const acts = [args[5]!, ...(model.fits.get(args[5]!) ?? [])];
  return ["a", "o"].flatMap((a) => acts.map((t) => w(`say(${[...args.slice(0, 3), a, args[4], t, ...args.slice(6)].join(",")})`))).find((t) => model.holds.has(t));
}

/** The conclusions a `clash` atom rests on. */
function clashPremises(model: Model, atom: string): string[] {
  const { name, args } = splitAtom(atom);
  // R2-2: inside one holder's view, the view and its denial (or a view the denied term fits).
  if (name === "view" && args.length === 2) {
    const [h, p] = args as [string, string];
    // R4a-13: a ban and the grant or demand it meets, inside one holder's view.
    const said = splitAtom(p);
    if (said.name === "say" && said.args[3] === "u") {
      const other = sayMet(model, said.args, (t) => `view(${h},${t})`);
      return other ? [atom, other] : [atom];
    }
    const denial = `view(${h},neg(${p}))`;
    if (model.holds.has(atom) && model.holds.has(denial)) return [atom, denial];
    const met = (model.fits.get(p) ?? []).map((t) => `view(${h},${t})`).find((t) => model.holds.has(t));
    return met ? [denial, met] : [atom];
  }
  // R2-7: a ban and the grant or demand it meets, with the same party, part, reach and ending.
  if (name === "say" && args[3] === "u") {
    const other = sayMet(model, args, (t) => t);
    return other ? [atom, other] : [atom];
  }
  // R4c decision 1, R4c-2 (D17): a rank one way and the other, or a closed tie and the rank it meets.
  if (name === "more" && args.length === 3) return [atom, `more(${args[0]},${args[2]},${args[1]})`];
  if (name === "tie" && args.length === 4) return [atom, `more(${args[0]},${args[1]},${args[2]})`];
  // D22: two places for one member on one scale.
  if (name === "place" && args.length === 3) {
    const other = [...model.holds].find((h) => {
      const p = splitAtom(h);
      return p.name === "place" && p.args[0] === args[0] && p.args[1] === args[1] && p.args[2] !== args[2];
    });
    return other ? [atom, other] : [atom];
  }
  const denial = `neg(${atom})`;
  if (model.holds.has(atom) && model.holds.has(denial)) return [atom, denial];
  const met = model.holds.has(denial) ? (model.fits.get(atom) ?? []).find((p) => model.holds.has(p)) : undefined;
  // Otherwise a clash a reading derives itself: `notall(Id)` (row 4) or `none(Id)` (R1-2).
  return met ? [denial, met] : [atom];
}

// ── Questions ───────────────────────────────────────────────────────────────

const isQuestionForce = (reading: Reading): Reading["frames"] => reading.frames.filter((f) => f.family !== "force" && !questionMay(reading, f));

/**
 * R4b-28 (D6, knowing.md#may): a question's own MAY (`yel zazozon vabuvul thomal dalazun.`) asks whether it could be so.
 * The question runs without it, as {@link couldBe}, whichever job is called. A holder's MAY stays the holder's (R3-6).
 */
function questionMay(reading: Reading, f: Reading["frames"][number]): boolean {
  return f.key === "overlay:may:th" && !f.holderHost && !reading.frames.some((g) => g.key === "xFamily:holder");
}

const mayQuestion = (question: Reading | Claim): question is Reading =>
  "claim" in question && question.frames.some((f) => f.family === "force") && question.frames.some((f) => questionMay(question, f));

/** A thing term's range detail (R1-7), if it carries one. */
function rangeDetail(term: Term | undefined): Detail | undefined {
  return term?.kind === "thing" ? term.details.find((d) => detailRange(d)) : undefined;
}

/**
 * Whether a stated claim answers the question: {@link match}, with a range on a question noun decided by
 * {@link inRange} against the target noun's count (row 12) and left out of the match. A speaker or listener term fits
 * only its own turn's, from the translation's sites (a question has no turn).
 */
function fitsQuestion(question: Claim, target: Claim, options: SolveOptions, sites: { querySite: TermSite; targetSite: TermSite }): SolveSwitch[] | undefined {
  let q = question;
  let t = target;
  for (const r of ["z", "d", "b"] as const) {
    const qt = q.roles[r];
    const range = rangeDetail(qt);
    if (!range || qt?.kind !== "thing") continue;
    const tt = t.roles[r];
    if (tt?.kind !== "thing") return undefined;
    const count = tt.details.find((d) => detailNumber(d) && !detailRange(d));
    const value = count && wordValue(detailNumber(count)!);
    if (!value || inRange(value, detailRange(range)!.range) !== true) return undefined;
    q = { ...q, roles: { ...q.roles, [r]: { ...qt, details: qt.details.filter((d) => d !== range) } } };
    t = { ...t, roles: { ...t.roles, [r]: { ...tt, details: tt.details.filter((d) => d !== count) } } };
  }
  const binding = match(q, t, { switches: { widen: !!options.widen }, lexicon: options.lexicon, ...sites });
  return binding?.switches.filter((s): s is "widen" => s === "widen");
}

type Prepared =
  | { ok: true; translation: Translation; program: string; qid?: string; claim?: Claim; negated?: boolean; ctx: Context }
  | { ok: false; answer: Answer };

/**
 * The log's program, with the question as one more reading whose claim is switched off: only the facts a
 * first-mention noun in it brings (its kind, count and details) stay on, as a witness. With `keepClaim` the claim stays
 * on, as {@link whyNot} needs.
 */
function prepare(log: Pick<Log, "readings">, question: Reading | Claim | undefined, options: SolveOptions, keepClaim = false, blanks?: ReadonlySet<object>): Prepared {
  const switches = { widen: !!options.widen, defaults: !!options.defaults, closed: !!options.closedWorld };
  let qReading: Reading | undefined;
  if (question && "claim" in question) {
    const frames = isQuestionForce(question);
    // A holder or a say word on the question is the translator's (R2-1): the question is asked inside its wrap.
    // R3-6: so is the holder's own MAY, a term inside the view.
    const holder = frames.some((f) => f.key === "xFamily:holder");
    // Decision 4 (notional.md#notional-as-if-framing): so is NOTIONAL, asked inside the latest supposition's view.
    const wrapping = (f: Reading["frames"][number]): boolean => f.key === "xFamily:holder" || f.key === "wordFamily:say" || f.key === "overlay:notional:th" || !!f.holderHost || (holder && f.key === "overlay:may:th");
    // R4e-4: a condition hinge on a question asks whether the conditional holds; the translator gives its term.
    const conditional = (f: Reading["frames"][number]): boolean => (f.key === "overlay:clause_hinge:th" || f.key === "overlay:clause_hinge:g") && ["if", "only-if", "iff"].includes(f.values.gloss ?? "");
    const beyond = frames.find((f) => f.key !== "slot:newMember" && !wrapping(f) && !conditional(f));
    if (beyond || question.unread.length) {
      const construction = beyond?.construction ?? question.unread[0]!.construction;
      return { ok: false, answer: { verdict: "beyond", because: [], switches: [], left: [{ reading: question.id, construction, key: beyond?.key, reason: "noRow" }] } };
    }
    qReading = { ...question, id: `?${question.id}`, frames };
  } else if (question) {
    qReading = { id: "?", source: undefined as never, frames: [], order: [], unordered: [], claim: question, links: [], unread: [] };
  }
  const readings = qReading ? [...log.readings.filter((r) => r !== question), qReading] : log.readings;
  const translation = translate({ readings, entries: (log as Partial<Log>).entries }, { lexicon: options.lexicon, switches, blanks });
  const left = translation.left.filter((l) => l.reading !== qReading?.id);
  if (qReading && translation.left.length !== left.length) {
    return { ok: false, answer: { verdict: "beyond", because: [], switches: [], left: translation.left } };
  }
  // A NOTIONAL question with no supposition in the log keeps its own holder, which nothing holds: unknown.
  const wrap = qReading && translation.wraps.get(qReading.id);
  if (wrap?.kind === "view" && wrap.holder === notionalHolder(JSON.stringify(qReading!.id))) {
    return { ok: false, answer: { verdict: "unknown", because: [], switches: [], left: [] } };
  }
  let program = translation.program;
  if (qReading && !keepClaim) {
    const qid = JSON.stringify(qReading.id);
    // Keep the witness facts; drop the question's own claim, even where it is a fact about the witness
    // (`yel zodozel gamahum.`: the dog's kind stays, *is caring* goes).
    const witness = translation.witnesses.get(qReading.id) ?? new Set<string>();
    program = program
      .split("\n")
      .filter((line) => !line.includes(`on(${qid})`) || line === `on(${qid}).` || witness.has(line))
      .join("\n");
  }
  const ctx: Context = { translation: { ...translation, left }, options, question: qReading?.id, open: openReadings(program) };
  const asked = qReading && positive(qReading.claim);
  return { ok: true, translation: { ...translation, left }, program, qid: qReading?.id, claim: asked?.claim ?? qReading?.claim, negated: asked?.negated, ctx };
}

const refused = (why: string, left: LeftOut[]): Answer => ({ verdict: "refused", because: [], switches: [], left, english: why });

/** The `holds` atoms the question fits (yes) and the denials that rule it out (no), with any match switches. */
/**
 * A question *not P?* (one item denied on one term, joins.md#negation-u) as P with its answer flipped: *yes* when P's
 * denial holds, *no* when P does (R3-1 row 2 asks *Alazun didn't leave?*).
 */
function positive(claim: Claim): { claim: Claim; negated: boolean } {
  const swap = (from: Term, to: Term) => (t: Term | undefined): Term | undefined => (t === from ? to : t);
  for (const t of [claim.verb, claim.roles.z, claim.roles.d, claim.roles.b, ...claim.predicate]) {
    if (t?.kind !== "list" || !t.frames?.some((f) => f.key === "joinSeries:u") || t.members.length !== 1 || t.parts.length !== 1) continue;
    const s = swap(t, t.members[0]!);
    const roles: Claim["roles"] = {};
    for (const r of ["z", "d", "b"] as const) if (claim.roles[r]) roles[r] = s(claim.roles[r]);
    return { claim: { ...claim, verb: s(claim.verb), roles, predicate: claim.predicate.map((x) => s(x)!) }, negated: true };
  }
  return { claim, negated: false };
}

function hits(model: Model, p: Extract<Prepared, { ok: true }>): { yes: string[]; no: string[]; switches: SolveSwitch[] } {
  const yes: string[] = [];
  const no: string[] = [];
  const switches = new Set<SolveSwitch>();
  // A wrapped question (a holder's view, a say word) is matched inside atoms with the same wrap; a plain one, outside any.
  const wrap = p.qid ? p.translation.wraps.get(p.qid) : undefined;
  // R4e-4: a question over a hinge asks for its conditional, matched through the R4e-2 fits between conditionals.
  const asked = p.qid ? [...p.translation.conditionals].find(([, c]) => c.reading === p.qid) : undefined;
  if (asked) {
    const [tq, cq] = asked;
    const fits = p.translation.conditionalFits;
    for (const held of model.holds) {
      const atom = wrap ? unwrapText(wrap, held) : held;
      if (atom === undefined) continue;
      const inner = negOf(atom);
      if (inner === undefined ? fits.get(tq)?.has(atom) : fits.get(inner)?.has(tq)) (inner === undefined ? yes : no).push(held);
    }
    return cq.denied ? { yes: no, no: yes, switches: [] } : { yes, no, switches: [] };
  }
  for (const held of model.holds) {
    // A wrapped denial, `neg(say(..))` (a ban's denied permission), rules out the question inside the same wrap; R4a-13,
    // inside a holder's view too, `view(H, neg(say(..)))`.
    const outer = wrap?.kind === "view" && wrap.say ? unwrapText({ ...wrap, say: undefined }, held) : held;
    const denial = wrap && outer !== undefined ? negOf(outer) : undefined;
    const inside = denial === undefined ? undefined : unwrapText(sayOf(wrap) ?? wrap!, denial);
    const atom = wrap ? (unwrapText(wrap, held) ?? (inside === undefined ? undefined : `neg(${inside})`)) : held;
    if (atom === undefined) continue;
    const inner = negOf(atom);
    const source = p.translation.terms.get(inner ?? atom);
    if (!source) continue;
    // A denial rules the question out when the question says at least the denied claim.
    const asked = p.translation.site(p.qid ?? "?");
    const stated = p.translation.site(source.reading);
    const fit = inner
      ? fitsQuestion(source.claim, p.claim!, p.ctx.options, { querySite: stated, targetSite: asked })
      : fitsQuestion(p.claim!, source.claim, p.ctx.options, { querySite: asked, targetSite: stated });
    if (!fit) continue;
    (inner ? no : yes).push(held);
    fit.forEach((s) => switches.add(s));
  }
  return p.negated ? { yes: no, no: yes, switches: [...switches] } : { yes, no, switches: [...switches] };
}

function answer(verdict: SolveVerdict, model: Model, start: string[], p: Extract<Prepared, { ok: true }>, extra: SolveSwitch[]): Answer {
  const why = explain(model, start, p.ctx);
  const switches = (["widen", "defaults", "closedWorld"] as const).filter((s) => why.switches.includes(s) || extra.includes(s));
  return { verdict, because: why.because, switches, left: p.translation.left };
}

/**
 * Does the question follow from the log? *yes* when a claim it fits holds in every world (cautious consequences; the
 * clash-free worlds when there are any, R3-4), *no* when a denial that rules it out does, *unknown* otherwise.
 */
/**
 * A fill question (`ask:fillAsk`, questions.md#fill-ask) asks for a term, not yes or no: {@link follows} and
 * {@link couldBe} answer it `beyond`, with reason `fillAsk`, whatever the rows make of its blank.
 */
function fillQuestion(question: Reading | Claim): Answer | undefined {
  if (!("claim" in question)) return undefined;
  const force = question.frames.find((f) => f.family === "force" && f.values.ask === "fillAsk");
  if (!force) return undefined;
  return { verdict: "beyond", because: [], switches: [], left: [{ reading: question.id, construction: force.construction, key: force.key, reason: "fillAsk" }] };
}

export async function follows(log: Pick<Log, "readings">, question: Reading | Claim, options: SolveOptions = {}): Promise<Answer> {
  const fill = fillQuestion(question);
  if (fill) return fill;
  if (mayQuestion(question)) {
    const a = await couldBe(log, question, options);
    return a.verdict === "beyond" || a.verdict === "refused" ? a : { ...a, switches: [...a.switches, "couldBe"] };
  }
  const p = prepare(log, question, options);
  if (!p.ok) return p.answer;
  const big = tooLarge(p.program, options);
  if (big) return refused(big, p.translation.left);
  const program = await worlds(p.program);
  if (typeof program !== "string") return refused(program.why, p.translation.left);
  const run = await consequences(program, "cautious");
  if (!run.ok) return refused(run.why, p.translation.left);
  const model = new Model(run.atoms);
  const h = hits(model, p);
  if (h.yes.length && h.no.length) return answer("both", model, [...h.yes, ...h.no], p, h.switches);
  if (h.yes.length) return answer("yes", model, h.yes, p, h.switches);
  if (h.no.length) return answer("no", model, h.no, p, h.switches);
  return { verdict: "unknown", because: [], switches: [], left: p.translation.left };
}

/**
 * Could the question be so? *yes* when a claim it fits holds in some world (brave consequences; the clash-free worlds
 * when there are any, R3-4), *no* when a denial that rules it out holds in every world, *unknown* otherwise.
 */
export async function couldBe(log: Pick<Log, "readings">, question: Reading | Claim, options: SolveOptions = {}): Promise<Answer> {
  const fill = fillQuestion(question);
  if (fill) return fill;
  const p = prepare(log, question, options);
  if (!p.ok) return p.answer;
  const big = tooLarge(p.program, options);
  if (big) return refused(big, p.translation.left);
  const program = await worlds(p.program);
  if (typeof program !== "string") return refused(program.why, p.translation.left);
  const brave = await consequences(program, "brave");
  if (!brave.ok) return refused(brave.why, p.translation.left);
  const some = new Model(brave.atoms);
  const b = hits(some, p);
  if (b.yes.length) {
    // In some world: only what is in every world is *no*, so a brave denial alone does not settle it.
    return answer("yes", some, b.yes, p, b.switches);
  }
  const cautious = await consequences(program, "cautious");
  if (!cautious.ok) return refused(cautious.why, p.translation.left);
  const every = new Model(cautious.atoms);
  const c = hits(every, p);
  if (c.no.length) return answer("no", every, c.no, p, c.switches);
  return { verdict: "unknown", because: [], switches: [], left: p.translation.left };
}

// ── Filling ─────────────────────────────────────────────────────────────────

/** Where a blank sits in the question: the place {@link match} names (`z`, `d`, `b`, nested with `/`). */
export type BlankSite = string;

/** One answer to a fill question: a term per blank, in question order, and the readings behind it, in log order. */
export type Filler = { at: BlankSite[]; term: string[]; because: string[] };

/**
 * `filled` lists the fillers; `unknown` when none is found, `nobody` under `closedWorld`. A `…er` question (existence,
 * R4c-11) answers `yes` (with `because`, no fillers), else `unknown`, `no` under `closedWorld`. `beyond` and `refused`
 * as {@link Answer} has them.
 */
export type FillVerdict = "filled" | "unknown" | "nobody" | "yes" | "no" | "beyond" | "refused";

export type FillAnswer = {
  verdict: FillVerdict;
  fillers: Filler[];
  /** Reading ids behind the answer, in log order: every filler's, or the existence's. */
  because: string[];
  switches: SolveSwitch[];
  left: LeftOut[];
  english?: string;
};

/** `possible`: brave, a filler that holds in some world; cautious (in every world) by default. */
export type FillOptions = SolveOptions & { possible?: boolean };

/**
 * A blank the fill job reads (R4c-10): an open blank `zar`, `zarx` for every member, `…er` for existence (R4c-11), or a
 * listed blank, `zazozon zalazun zar` (only the listed items fill it). Each sits in a role.
 */
type FillBlank = { at: BlankSite; term: Term; listed?: Term[]; existence: boolean };

/**
 * The question's blanks, or the part no fill row reads: a blank in another place or series (`zur`, `zor`, a blank inside
 * `derl` / `darl`: R4c decision 7). R4c-12: `gar` on a verbless claim asks what kind, from `isa` only; `ger`, whether it
 * is like anything, is existence over the same `isa` atoms (R4c-11).
 */
function fillBlanks(claim: Claim): FillBlank[] | { key: string } {
  const out: FillBlank[] = [];
  for (const [i, t] of claim.predicate.entries()) {
    if (t.kind !== "blank") continue;
    const family = t.word.family;
    const series = family?.kind === "joinMarker" ? family.series : undefined;
    if (claim.verb || (series !== "a" && series !== "e")) return { key: `blank:${t.word.raw}` };
    out.push({ at: `predicate.${i}`, term: t, existence: series === "e" });
  }
  for (const r of ["z", "d", "b"] as const) {
    const t = claim.roles[r];
    if (t?.kind === "blank") {
      const family = t.word.family;
      const series = family?.kind === "joinMarker" ? family.series : undefined;
      if (series !== "a" && series !== "e") return { key: `blank:${t.word.raw}` };
      out.push({ at: r, term: t, existence: series === "e" });
    } else if (t?.kind === "list" && t.values.ending === "r") {
      if (t.values.series !== "a" || t.members.length < 2 || t.members.some((m) => m.kind === "blank")) return { key: `blank:${t.join?.raw ?? "list"}` };
      out.push({ at: r, term: t, listed: t.members, existence: false });
    }
  }
  const existence = out.filter((b) => b.existence).length;
  if (!out.length || (existence && existence !== out.length)) return { key: "blank" };
  return out;
}

/** A filler's spelled term: a thing by its word, through a pronoun's antecedent. */
function fillerText(term: Term): string {
  const t = throughAntecedent(term);
  switch (t.kind) {
    case "thing":
      return t.head.raw;
    case "number":
    case "quote":
    case "blank":
      return t.word.raw;
    case "literal":
      return t.payload;
    case "list":
      return t.members.map(fillerText).join(" ");
    default:
      return t.kind;
  }
}

const roleClaim = (t: Term): Claim => ({ roles: { z: t }, predicate: [], details: [] });

/** Where a term's word sits in its sentence. */
function termAt(term: Term): number {
  const t = throughAntecedent(term);
  if (t.kind === "thing") return t.head.at ?? 0;
  if (t.kind === "list") return Math.min(...t.members.map(termAt));
  return "word" in t ? (t.word.at ?? 0) : 0;
}

/** A clause filler (*why*, R4c-13) spelled: its claim's terms in sentence order. */
const claimText = (claim: Claim): string =>
  [claim.verb, ...Object.values(claim.roles), ...claim.predicate]
    .filter((t): t is Term => t !== undefined)
    .sort((a, b) => termAt(a) - termAt(b))
    .map(fillerText)
    .join(" ");

/**
 * R4c-13 (D10, fill-ask-jobs.md#why): `thahum blar`, *why?*, a *because* hinge hosting the blank `blar`. Other condition
 * words with `blar` (*what for?*, *under what condition?*) wait for their rows.
 */
const whyFrame = (question: Reading): Reading["frames"][number] | undefined =>
  question.frames.find((f) => f.key === "overlay:clause_hinge:th" && /^because(\.|$)/.test(f.values.gloss ?? "") && f.hosted?.kind === "blank" && f.hosted.word.family?.kind === "joinMarker" && f.hosted.word.family.series === "a");

/**
 * The fill job (R4c-9 to R4c-11, D10; questions.md#fill-ask, #fill-all, fill-ask-roles.md#fill-ask-arity): what fills
 * each blank of a fill question. The log is solved (cautious: atoms in every clash-free world; `possible`: in some), and
 * each `holds` atom is matched against the question by {@link match}, each blank binding the term in its place, so the
 * fillers a universal, a hinge or a list gives come from the solved atoms. Several fillers are all listed (D10), as
 * tuples in the blanks' order for fill-all. A filler source is one more loop over the model here.
 */
export async function fill(log: Pick<Log, "readings">, question: Reading, options: FillOptions = {}): Promise<FillAnswer> {
  const out = (verdict: FillVerdict, rest: Partial<FillAnswer> = {}): FillAnswer => ({ verdict, fillers: [], because: [], switches: [], left: [], ...rest });
  const force = question.frames.find((f) => f.family === "force" && f.values.ask === "fillAsk");
  if (!force) return out("beyond", { left: [{ reading: question.id, construction: "fillAsk", reason: "notFillAsk" }], english: "That is not a fill question." });
  // A question's own MAY asks what could fill it (R4b-28): the job runs brave.
  const may = question.frames.some((f) => questionMay(question, f));
  const possible = !!options.possible || may;
  // R4c-13: a *why* frame is the fill job's; the question is asked without it, and its blank binds a cause's condition.
  const whyF = whyFrame(question);
  const asking = whyF ? { ...question, frames: question.frames.filter((f) => f !== whyF) } : question;
  const frame = isQuestionForce(asking).find((f) => f.key !== "slot:newMember");
  if (frame) return out("beyond", { left: [{ reading: question.id, construction: frame.construction, key: frame.key, reason: "noRow" }] });
  const found0 = fillBlanks(question.claim);
  // A why question fills only its condition: a blank in the claim too is beyond.
  const blanks = whyF ? (Array.isArray(found0) ? { key: "blank" } : []) : found0;
  if (!Array.isArray(blanks)) return out("beyond", { left: [{ reading: question.id, construction: "fillAsk", key: blanks.key, reason: "noRow" }] });
  const p = prepare({ ...log, readings: log.readings.filter((r) => r !== question) }, asking, options, false, new Set(blanks.map((b) => b.term)));
  if (!p.ok) return out(p.answer.verdict === "refused" ? "refused" : "beyond", { left: p.answer.left, english: p.answer.english });
  const left = p.translation.left;
  const big = tooLarge(p.program, options);
  if (big) return out("refused", { left, english: big });
  const program = await worlds(p.program);
  if (typeof program !== "string") return out("refused", { left, english: program.why });
  const run = await consequences(program, possible ? "brave" : "cautious");
  if (!run.ok) return out("refused", { left, english: run.why });
  const model = new Model(run.atoms);
  // The question with each listed blank as one open blank; its bindings are kept only among the listed items.
  const asked: Claim = { ...p.claim!, roles: { ...p.claim!.roles } };
  const open = new Map<FillBlank, Term>();
  for (const b of blanks) {
    if (!b.listed) continue;
    const list = b.term as Extract<Term, { kind: "list" }>;
    const blank: Term = { kind: "blank", word: list.join! };
    asked.roles[b.at as "z" | "d" | "b"] = blank;
    open.set(b, blank);
  }
  const querySite = p.translation.site(p.qid!);
  const found = new Map<string, { filler: Filler; start: string[]; terms: Term[] }>();
  const switches = new Set<SolveSwitch>();
  // R4c-13: *why* binds C from each held `cause(C, Out)` whose Out fits the question's claim; a met *if* gives none.
  for (const held of whyF ? model.holds : []) {
    const { name: link, args } = splitAtom(held);
    if (link !== "cause" || args.length !== 2) continue;
    const outInner = negOf(args[1]!);
    if (!!outInner !== !!p.negated) continue;
    const outcome = p.translation.terms.get(outInner ?? args[1]!);
    const condition = p.translation.terms.get(args[0]!);
    if (!outcome || !condition || outcome.reading === p.qid) continue;
    const binding = match(asked, outcome.claim, { switches: { widen: !!options.widen }, lexicon: options.lexicon, querySite, targetSite: p.translation.site(outcome.reading) });
    if (!binding) continue;
    const term = [claimText(condition.claim)];
    const entry = found.get(term[0]!) ?? { filler: { at: ["bl"], term, because: [] }, start: [], terms: [] };
    entry.start.push(held);
    found.set(term[0]!, entry);
    binding.switches.forEach((s) => s === "widen" && switches.add("widen"));
  }
  for (const held of whyF ? [] : model.holds) {
    if (negOf(held) !== undefined) continue;
    const source = p.translation.terms.get(held);
    if (!source || source.reading === p.qid) continue;
    const targetSite = p.translation.site(source.reading);
    const binding = match(asked, source.claim, { switches: { widen: !!options.widen }, lexicon: options.lexicon, querySite, targetSite });
    if (!binding) continue;
    const terms: Term[] = [];
    const ok = blanks.every((b) => {
      const blank = open.get(b) ?? b.term;
      const bound = binding.blanks.find((x) => x.blank === blank && x.at === b.at)?.term;
      if (!bound) return false;
      terms.push(bound);
      return !b.listed || b.listed.some((item) => match(roleClaim(item), roleClaim(bound), { lexicon: options.lexicon, querySite, targetSite }));
    });
    if (!ok) continue;
    const term = terms.map(fillerText);
    const key = term.join("\u0000");
    const entry = found.get(key) ?? { filler: { at: blanks.map((b) => b.at), term, because: [] }, start: [], terms };
    entry.start.push(held);
    found.set(key, entry);
    binding.switches.forEach((s) => s === "widen" && switches.add("widen"));
  }
  const order = p.translation.readings;
  const rank = (ids: string[]): number => Math.min(...ids.map((id) => order.indexOf(id)), Infinity);
  // A list bound whole, whose members each fill the blank too (an *and* list's claim beside its members'), gives way to them.
  const listed = (terms: Term[]): boolean =>
    terms.some((t, i) => t.kind === "list" && t.members.every((m) => found.has(terms.map((x, j) => (j === i ? fillerText(m) : fillerText(x))).join("\u0000"))));
  const at = (terms: Term[]): number => {
    if (!terms[0]) return 0;
    const t = throughAntecedent(terms[0]);
    return t.kind === "thing" ? (t.head.at ?? 0) : 0;
  };
  const fillers: (Filler & { pos: number })[] = [];
  for (const { filler, start, terms } of found.values()) {
    if (listed(terms)) continue;
    const why = explain(model, start, p.ctx);
    why.switches.forEach((s) => switches.add(s));
    fillers.push({ ...filler, because: why.because, pos: at(terms) });
  }
  // Log order of the readings behind each filler, then the filler's place in its sentence.
  fillers.sort((a, b) => rank(a.because) - rank(b.because) || a.pos - b.pos || a.term.join(" ").localeCompare(b.term.join(" ")));
  const because = [...new Set(fillers.flatMap((f) => f.because))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const closed = !!options.closedWorld;
  if (closed && !fillers.length) switches.add("closedWorld");
  if (may) switches.add("couldBe");
  const used = (["widen", "defaults", "closedWorld", "couldBe"] as const).filter((s) => switches.has(s));
  if (blanks[0]?.existence) return out(fillers.length ? "yes" : closed ? "no" : "unknown", { because, switches: used, left });
  return out(fillers.length ? "filled" : closed ? "nobody" : "unknown", { fillers: fillers.map(({ pos: _, ...f }) => f), because, switches: used, left });
}

/** The program with only the given readings switched on. */
function only(program: string, keep: ReadonlySet<string>): string {
  return program
    .split("\n")
    .filter((line) => {
      const m = /^on\(("(?:[^"\\]|\\.)*")\)\.$/.exec(line);
      return !m || keep.has(unquote(m[1]!));
    })
    .join("\n");
}

// ── Clashes ─────────────────────────────────────────────────────────────────

/** The reading ids the program switches on (`on("…").` facts), in program order. */
function switchIds(program: string): string[] {
  return [...program.matchAll(/^on\(("(?:[^"\\]|\\.)*")\)\.$/gm)].map((m) => unquote(m[1]!));
}

/**
 * A re-solve over the readings' switch atoms (Sketch, naming a clash: clashes under choices). A set of readings is
 * consistent when some world of it has no `clash` atom; every call is one plain program, so it runs on Clingo 5 and 6.
 */
class Resolver {
  runs = 0;
  failed?: string;
  private readonly memo = new Map<string, boolean>();

  constructor(
    readonly program: string,
    readonly order: readonly string[],
  ) {}

  private key(set: ReadonlySet<string>): string {
    return this.order.filter((id) => set.has(id)).join(" ");
  }

  /** Whether some world of the given readings has no clash. A failed run counts as consistent and is kept in `failed`. */
  async consistent(set: ReadonlySet<string>): Promise<boolean> {
    const key = this.key(set);
    const known = this.memo.get(key);
    if (known !== undefined) return known;
    this.runs++;
    const r = await call(`${only(this.program, set)}\n:- clash(P).`, 1, []);
    const ok = r.ok ? !r.unsat : true;
    if (!r.ok) this.failed ??= r.why;
    this.memo.set(key, ok);
    return ok;
  }

  /**
   * QuickXplain (Junker): a smallest clash among `candidates` given the `background` readings, which stay on and are
   * not returned. Undefined when background and candidates together are consistent; empty when the background alone
   * clashes.
   */
  async quickXplain(background: readonly string[], candidates: readonly string[]): Promise<string[] | undefined> {
    if (await this.consistent(new Set([...background, ...candidates]))) return undefined;
    if (!candidates.length) return [];
    const qx = async (b: readonly string[], d: readonly string[], c: readonly string[]): Promise<string[]> => {
      if (d.length && !(await this.consistent(new Set(b)))) return [];
      if (c.length === 1) return [...c];
      const half = Math.ceil(c.length / 2);
      const [c1, c2] = [c.slice(0, half), c.slice(half)];
      const d2 = await qx([...b, ...c1], c1, c2);
      const d1 = await qx([...b, ...d2], d2, c1);
      return [...d1, ...d2];
    };
    const found = await qx(background, [], candidates);
    return this.order.filter((id) => found.includes(id));
  }

  /**
   * Every smallest clash, by Reiter's hitting-set tree over {@link quickXplain}: each clash found is broken by giving up
   * one of its readings at a time, until what is left is consistent. Stops after `limit` nodes.
   */
  async allClashes(limit = 256): Promise<string[][]> {
    const found: string[][] = [];
    const fixes: Set<string>[] = [];
    const seen = new Set<string>();
    const queue: Set<string>[] = [new Set()];
    for (let nodes = 0; queue.length && nodes < limit; nodes++) {
      const removed = queue.shift()!;
      const key = this.key(removed);
      if (seen.has(key)) continue;
      seen.add(key);
      if (fixes.some((f) => [...f].every((id) => removed.has(id)))) continue;
      let clash = found.find((c) => c.every((id) => !removed.has(id)));
      if (!clash) {
        clash = await this.quickXplain([], this.order.filter((id) => !removed.has(id)));
        if (clash === undefined) {
          fixes.push(removed);
          continue;
        }
        found.push(clash);
      }
      for (const id of clash) queue.push(new Set([...removed, id]));
    }
    return found;
  }
}

/** A clash's switches and atom, from one run of its readings alone: a clash atom true in every world, else in some. */
async function describe(readings: readonly string[], p: Extract<Prepared, { ok: true }>): Promise<{ atom: string; switches: SolveSwitch[] }> {
  const program = only(p.program, new Set([...readings, ...(p.qid ? [p.qid] : [])]));
  for (const mode of ["cautious", "brave"] as const) {
    const run = await consequences(program, mode);
    if (!run.ok) continue;
    const model = new Model(run.atoms);
    const atom = model.clash[0];
    if (atom !== undefined) return { atom, switches: explain(model, clashPremises(model, atom), p.ctx).switches };
  }
  return { atom: "", switches: [] };
}

/** *These cannot all hold*; a clash inside one holder's view names the holder (R2-2: *In Azozon's view …*). */
function clashEnglish(atom: string, readings: readonly string[], translation: Translation): string {
  const { name, args } = splitAtom(atom);
  const holder = name === "view" ? translation.holders.get(args[0]!) : undefined;
  return `${holder ? `In ${holder} view these` : "These"} cannot all hold: ${readings.join(", ")}.`;
}

function sortClashes(out: Clash[], order: readonly string[]): Clash[] {
  const rank = (c: Clash): number[] => c.readings.map((r) => order.indexOf(r));
  return out.sort((a, b) => {
    const [x, y] = [rank(a), rank(b)];
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i]! - y[i]!;
    return x.length - y.length;
  });
}

/** One world: each `clash` atom true in it, with the readings the `fired` walk names, shrunk by one removal pass. */
async function clashesOneWorld(p: Extract<Prepared, { ok: true }>): Promise<ClashResult> {
  const run = await consequences(p.program, "cautious");
  if (!run.ok) return { clashes: [], left: p.translation.left, refused: run.why };
  const model = new Model(run.atoms);
  const out: Clash[] = [];
  const sets = new Set<string>();
  for (const atom of model.clash) {
    const why = explain(model, clashPremises(model, atom), p.ctx);
    let keep = new Set(why.because);
    const still = async (set: Set<string>): Promise<boolean> => {
      const r = await consequences(only(p.program, set), "cautious");
      return r.ok && new Model(r.atoms).clash.includes(atom);
    };
    if (await still(keep)) {
      for (const id of why.because) {
        const trial = new Set([...keep].filter((r) => r !== id));
        if (await still(trial)) keep = trial;
      }
    }
    const readings = why.because.filter((r) => keep.has(r));
    const key = readings.join(" ");
    if (sets.has(key)) continue;
    sets.add(key);
    out.push({ atom, readings, switches: why.switches, english: clashEnglish(atom, readings, p.translation) });
  }
  return { clashes: sortClashes(out, p.translation.readings), left: p.translation.left };
}

/** Several worlds: the smallest clashes by re-solving with the switch atoms free (QuickXplain under a hitting-set tree). */
async function clashesUnderChoices(p: Extract<Prepared, { ok: true }>): Promise<ClashResult> {
  const resolver = new Resolver(p.program, switchIds(p.program));
  const sets = await resolver.allClashes();
  if (resolver.failed) return { clashes: [], left: p.translation.left, refused: resolver.failed };
  const out: Clash[] = [];
  for (const readings of sets) {
    const { atom, switches } = await describe(readings, p);
    out.push({ atom, readings, switches, english: clashEnglish(atom, readings, p.translation) });
  }
  return { clashes: sortClashes(out, p.translation.readings), left: p.translation.left };
}

/**
 * What clashes. When the program has one world: each `clash` atom true in it, with the readings the `fired` walk
 * names, shrunk by one removal pass (a reading whose loss leaves the same clash is dropped), so a fact derived two ways
 * does not keep a reading the clash does not need. When it has several (an open rule's choice, a closed-world loop), a
 * set of readings clashes when none of its worlds is free of `clash` atoms, and each smallest such set is found by
 * re-solving with the switch atoms free (S1-1). Clashes with the same readings are given once.
 */
export async function clashes(log: Pick<Log, "readings">, options: SolveOptions = {}): Promise<ClashResult> {
  const p = prepare(log, undefined, options);
  if (!p.ok) return { clashes: [], left: p.answer.left, refused: p.answer.english };
  const big = tooLarge(p.program, options);
  if (big) return { clashes: [], left: p.translation.left, refused: big };
  const several = await severalWorlds(p.program);
  if (typeof several === "string") return { clashes: [], left: p.translation.left, refused: several };
  return several ? clashesUnderChoices(p) : clashesOneWorld(p);
}

export type GiveUpResult = {
  /** A smallest set of readings whose removal leaves a world with no clash, in log order; empty when nothing clashes. */
  giveUp: string[];
  english?: string;
  left: LeftOut[];
  refused?: string;
};

/**
 * A smallest set to give up (Sketch, naming a clash): one optimization run with every reading's switch atom free,
 * forbidding a `clash` atom and keeping as many readings as it can. The readings left out take one from every clash.
 */
export async function giveUp(log: Pick<Log, "readings">, options: SolveOptions = {}): Promise<GiveUpResult> {
  const p = prepare(log, undefined, options);
  if (!p.ok) return { giveUp: [], left: p.answer.left, refused: p.answer.english };
  const ids = switchIds(p.program);
  const free = only(p.program, new Set());
  const program = [free, `{ ${ids.map((id) => `on(${JSON.stringify(id)})`).join("; ")} }.`, ":- clash(P).", ...ids.map((id) => `:~ not on(${JSON.stringify(id)}). [1@0,${JSON.stringify(id)}]`)].join("\n");
  const big = tooLarge(program, options);
  if (big) return { giveUp: [], left: p.translation.left, refused: big };
  const r = await call(program, 0, ["--opt-mode=opt", "--quiet=1"]);
  if (!r.ok) return { giveUp: [], left: p.translation.left, refused: r.why };
  if (r.unsat) return { giveUp: [], left: p.translation.left, refused: "The solver found no world, even with every reading given up." };
  const kept = new Set((r.witnesses.at(-1) ?? []).filter((a) => a.startsWith("on(")).map((a) => unquote(splitAtom(a).args[0]!)));
  const out = ids.filter((id) => !kept.has(id));
  return { giveUp: out, english: out.length ? `Giving up ${out.join(", ")} resolves every clash.` : undefined, left: p.translation.left };
}

export type WhyNotResult = {
  /** The smallest clash the claim joins: the log's readings in it (the claim itself left out), or none when it fits. */
  clash?: Clash;
  left: LeftOut[];
  /** `beyond` when the claim has a frame with no row, as {@link follows} has it. */
  verdict?: "beyond";
  refused?: string;
};

/**
 * *Why not?* (Sketch, naming a clash): the claim joins the log as one more reading, switched on, and the reply is the
 * smallest clash it joins, found by QuickXplain with the claim as background: one reason, which is what a reply needs.
 * When the log clashes on its own, the hitting-set tree finds every clash and the smallest one with the claim is given.
 */
export async function whyNot(log: Pick<Log, "readings">, claim: Reading | Claim, options: SolveOptions = {}): Promise<WhyNotResult> {
  const p = prepare(log, claim, options, true);
  if (!p.ok) return p.answer.verdict === "beyond" ? { left: p.answer.left, verdict: "beyond" } : { left: p.answer.left, refused: p.answer.english };
  const big = tooLarge(p.program, options);
  if (big) return { left: p.translation.left, refused: big };
  const ids = switchIds(p.program);
  const resolver = new Resolver(p.program, ids);
  const rest = ids.filter((id) => id !== p.qid);
  let found: string[] | undefined;
  if (await resolver.consistent(new Set(rest))) found = await resolver.quickXplain([p.qid!], rest);
  else {
    // The log clashes already: a clash without the claim is not one it joins, so walk them all and keep the claim's.
    const joined = (await resolver.allClashes()).filter((c) => c.includes(p.qid!)).sort((a, b) => a.length - b.length);
    found = joined[0]?.filter((id) => id !== p.qid);
  }
  if (resolver.failed) return { left: p.translation.left, refused: resolver.failed };
  if (found === undefined) return { left: p.translation.left };
  const { atom, switches } = await describe(found, p);
  const english = found.length ? `That cannot hold with ${found.join(", ")}.` : "That cannot hold on its own.";
  return { clash: { atom, readings: found, switches, english }, left: p.translation.left };
}

// ── What stands ─────────────────────────────────────────────────────────────

/** R2-13: grounded by default; credulous and skeptical acceptance over stable or preferred extensions. */
export type Semantics = "grounded" | "stable" | "preferred";

export type StandsOptions = SolveOptions & { semantics?: Semantics };

/** `in`: accepted (grounded, or skeptically); `out`: attacked by a reading that is in; `undec`: neither. */
export type Label = "in" | "out" | "undec";

export type Standing = {
  reading: string;
  label: Label;
  /** In some extension (brave): under grounded, the same as `in`. */
  credulous: boolean;
};

export type StandsResult = {
  semantics: Semantics;
  /** Each translated reading, in log order. */
  stands: Standing[];
  /** `[attacker, attacked]`, in log order. */
  attacks: [string, string][];
  /** The extensions, each in log order: one under grounded; at most {@link MAX_EXTENSIONS} under stable or preferred. */
  extensions: string[][];
  english?: string;
  left: LeftOut[];
  refused?: string;
};

/** The extensions `stands` lists under stable or preferred; acceptance comes from brave and cautious runs, not this list. */
export const MAX_EXTENSIONS = 64;

/**
 * R2-12: the attack relation, added to the log's program. Arguments are the log's readings; the readings whose `fired`
 * gives a clash's two sides rebut each other, both ways. A conclusion of a generic rule (a requirement's permission, a
 * ban's denial, an act against a ban, a compound's head) is the readings' behind its premises.
 */
const ATTACKS = [
  "% What stands (docs/meta/solver.md, what stands): who fired a conclusion, and rebut on each clash's two sides.",
  "gen_rule(requires). gen_rule(against). gen_rule(bans). gen_rule(place). gen_rule(widen).",
  "src(A, C) :- fired(A, C), on(A).",
  "src(A, C) :- fired(G, C), gen_rule(G), used(G, C, P), src(A, P).",
  "rebut(A, B) :- src(A, P), src(B, neg(P)).",
  "rebut(A, B) :- src(A, P), src(B, neg(Q)), fits(Q, P).",
  "rebut(A, B) :- src(A, view(H, P)), src(B, view(H, neg(P))).",
  "rebut(A, B) :- src(A, view(H, P)), src(B, view(H, neg(Q))), fits(Q, P).",
  "rebut(A, B) :- src(A, notall(A)), used(A, notall(A), P), src(B, P).",
  "rebut(A, B) :- src(A, none(A)), used(A, none(A), P), src(B, P).",
  "% D13 (R4b-23): always possible against never, plain and in the fits form.",
  "rebut(A, B) :- src(A, always(may(P))), src(B, never(P)).",
  "rebut(A, B) :- src(A, always(may(P))), src(B, never(Q)), fits(Q, P).",
  "% R4a-2, R4a-3: the same inside a holder's view.",
  "rebut(A, B) :- src(A, view(H, notall(A))), used(A, view(H, notall(A)), P), src(B, P).",
  "rebut(A, B) :- src(A, view(H, none(A))), used(A, view(H, none(A)), P), src(B, P).",
  "att(A, B) :- rebut(A, B).",
  "att(B, A) :- rebut(A, B).",
].join("\n");

/** ASPARTIX's order over the arguments (Egly, Gaggl, Woltran 2010), for encodings with no conditional literals. */
const ORDER = [
  "lt(X, Y) :- arg(X), arg(Y), X < Y.",
  "nsucc(X, Z) :- lt(X, Y), lt(Y, Z).",
  "succ(X, Y) :- lt(X, Y), not nsucc(X, Y).",
  "ninf(X) :- lt(Y, X).",
  "nsup(X) :- lt(X, Y).",
  "inf(X) :- not ninf(X), arg(X).",
  "sup(X) :- not nsup(X), arg(X).",
];

/** The ASPARTIX encodings: grounded (`ground.dl`), stable (`stable.dl`), preferred by saturation (`prefex.dl`). */
const ENCODINGS: Record<Semantics, string[]> = {
  grounded: [
    ...ORDER,
    "defended_upto(X, Y) :- inf(Y), arg(X), not att(Y, X).",
    "defended_upto(X, Y) :- inf(Y), in(Z), att(Z, Y), att(Y, X).",
    "defended_upto(X, Y) :- succ(Z, Y), defended_upto(X, Z), not att(Y, X).",
    "defended_upto(X, Y) :- succ(Z, Y), defended_upto(X, Z), in(V), att(V, Y), att(Y, X).",
    "defended(X) :- sup(Y), defended_upto(X, Y).",
    "in(X) :- defended(X).",
  ],
  stable: [
    "in(X) :- not out(X), arg(X).",
    "out(X) :- not in(X), arg(X).",
    ":- in(X), in(Y), att(X, Y).",
    "defeated(X) :- in(Y), att(Y, X).",
    ":- out(X), not defeated(X).",
  ],
  preferred: [
    "in(X) :- not out(X), arg(X).",
    "out(X) :- not in(X), arg(X).",
    ":- in(X), in(Y), att(X, Y).",
    "defeated(X) :- in(Y), att(Y, X).",
    "not_defended(X) :- att(Y, X), not defeated(Y).",
    ":- in(X), not_defended(X).",
    ...ORDER,
    "inN(X) :- in(X).",
    "inN(X) | outN(X) :- out(X).",
    "eq_upto(Y) :- inf(Y), in(Y), inN(Y).",
    "eq_upto(Y) :- inf(Y), out(Y), outN(Y).",
    "eq_upto(Y) :- succ(Z, Y), in(Y), inN(Y), eq_upto(Z).",
    "eq_upto(Y) :- succ(Z, Y), out(Y), outN(Y), eq_upto(Z).",
    "eq :- sup(Y), eq_upto(Y).",
    "undefeated_upto(X, Y) :- inf(Y), outN(X), outN(Y).",
    "undefeated_upto(X, Y) :- inf(Y), outN(X), not att(Y, X).",
    "undefeated_upto(X, Y) :- succ(Z, Y), undefeated_upto(X, Z), outN(Y).",
    "undefeated_upto(X, Y) :- succ(Z, Y), undefeated_upto(X, Z), not att(Y, X).",
    "undefeated(X) :- sup(Y), undefeated_upto(X, Y).",
    "spoil :- eq.",
    "spoil :- inN(X), inN(Y), att(X, Y).",
    "spoil :- inN(X), outN(Y), att(Y, X), undefeated(Y).",
    "inN(X) :- spoil, arg(X).",
    "outN(X) :- spoil, arg(X).",
    ":- not spoil.",
  ],
};

/** The `in(..)` arguments of a witness. */
const ins = (atoms: readonly string[]): Set<string> => new Set(atoms.filter((a) => a.startsWith("in(")).map((a) => unquote(splitAtom(a).args[0]!)));

/**
 * What stands (R2-12, R2-13): each reading labelled `in`, `out` or `undec`. The attacks come from one run of the log's
 * program with {@link ATTACKS} (brave, so under choices an attack in any world counts); the `att` facts then feed an
 * ASPARTIX encoding in a second run. Grounded by default; under `stable` or `preferred`, `in` is skeptical (cautious) and
 * `credulous` brave. With every attack mutual, grounded is exactly the unattacked readings.
 */
export async function stands(log: Pick<Log, "readings">, options: StandsOptions = {}): Promise<StandsResult> {
  const semantics = options.semantics ?? "grounded";
  const empty = (left: LeftOut[], refused?: string): StandsResult => ({ semantics, stands: [], attacks: [], extensions: [], left, refused });
  const p = prepare(log, undefined, options);
  if (!p.ok) return empty(p.answer.left, p.answer.english);
  const first = `${p.program}\n${ATTACKS}\n`;
  const big = tooLarge(first, options);
  if (big) return empty(p.translation.left, big);
  const ids = switchIds(p.program);
  const order = (id: string): number => ids.indexOf(id);
  const run = await consequences(first, "brave");
  if (!run.ok) return empty(p.translation.left, run.why);
  const attacks = run.atoms
    .filter((a) => a.startsWith("att("))
    .map((a) => splitAtom(a).args.map(unquote) as [string, string])
    .filter(([a, b]) => order(a) >= 0 && order(b) >= 0)
    .sort((x, y) => order(x[0]) - order(y[0]) || order(x[1]) - order(y[1]));
  if (!ids.length) return { semantics, stands: [], attacks, extensions: [], left: p.translation.left };
  const second = [...ids.map((id) => `arg(${JSON.stringify(id)}).`), ...attacks.map(([a, b]) => `att(${JSON.stringify(a)},${JSON.stringify(b)}).`), ...ENCODINGS[semantics]].join("\n");
  const sorted = (set: ReadonlySet<string>): string[] => ids.filter((id) => set.has(id));
  let skeptical: Set<string>;
  let credulous: Set<string>;
  let extensions: string[][];
  if (semantics === "grounded") {
    const g = await call(second, 1, []);
    if (!g.ok) return empty(p.translation.left, g.why);
    skeptical = credulous = ins(g.witnesses.at(-1) ?? []);
    extensions = [sorted(skeptical)];
  } else {
    const all = await call(second, MAX_EXTENSIONS, []);
    if (!all.ok) return empty(p.translation.left, all.why);
    extensions = all.witnesses.map((w) => sorted(ins(w)));
    if (all.unsat) [skeptical, credulous] = [new Set(), new Set()];
    else {
      const [brave, cautious] = [await call(second, 0, ["--enum-mode=brave", "--quiet=1"]), await call(second, 0, ["--enum-mode=cautious", "--quiet=1"])];
      if (!brave.ok) return empty(p.translation.left, brave.why);
      if (!cautious.ok) return empty(p.translation.left, cautious.why);
      credulous = ins(brave.witnesses.at(-1) ?? []);
      skeptical = ins(cautious.witnesses.at(-1) ?? []);
    }
  }
  const out = new Set(attacks.filter(([a]) => skeptical.has(a)).map(([, b]) => b));
  const result = ids.map((reading): Standing => ({ reading, label: skeptical.has(reading) ? "in" : out.has(reading) ? "out" : "undec", credulous: credulous.has(reading) }));
  const named = (label: Label): string[] => result.filter((s) => s.label === label).map((s) => s.reading);
  const parts = [["Standing", named("in")], ["Out", named("out")], ["Undecided", named("undec")]] as const;
  const english = parts.filter(([, list]) => list.length).map(([title, list]) => `${title}: ${list.join(", ")}.`).join(" ");
  return { semantics, stands: result, attacks, extensions, english, left: p.translation.left };
}
