/**
 * Solver (clingo-solver proposal, Sketch): what follows from a log, what could be, and what clashes, from the program
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
import { match } from "./match.js";
import type { StepLexicon } from "./steps.js";
import { detailRange, inRange, translate, type LeftOut, type Translation } from "./translate.js";
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
export type SolveSwitch = "widen" | "defaults" | "closedWorld";

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
      else if (id !== ctx.question) {
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

/** The conclusions a `clash` atom rests on. */
function clashPremises(model: Model, atom: string): string[] {
  const denial = `neg(${atom})`;
  if (model.holds.has(atom) && model.holds.has(denial)) return [atom, denial];
  const met = model.holds.has(denial) ? (model.fits.get(atom) ?? []).find((p) => model.holds.has(p)) : undefined;
  // Otherwise a clash a reading derives itself: `notall(Id)` (row 4) or `none(Id)` (R1-2).
  return met ? [denial, met] : [atom];
}

// ── Questions ───────────────────────────────────────────────────────────────

const isQuestionForce = (reading: Reading): Reading["frames"] => reading.frames.filter((f) => f.family !== "force");

/** A thing term's range detail (R1-7), if it carries one. */
function rangeDetail(term: Term | undefined): Detail | undefined {
  return term?.kind === "thing" ? term.details.find((d) => detailRange(d)) : undefined;
}

/**
 * Whether a stated claim answers the question: {@link match}, with a range on a question noun decided by
 * {@link inRange} against the target noun's count (row 12) and left out of the match.
 */
function fitsQuestion(question: Claim, target: Claim, options: SolveOptions): SolveSwitch[] | undefined {
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
  const binding = match(q, t, { switches: { widen: !!options.widen }, lexicon: options.lexicon });
  return binding?.switches.filter((s): s is "widen" => s === "widen");
}

type Prepared =
  | { ok: true; translation: Translation; program: string; qid?: string; claim?: Claim; ctx: Context }
  | { ok: false; answer: Answer };

/**
 * The log's program, with the question as one more reading whose claim is switched off: only the facts a
 * first-mention noun in it brings (its kind, count and details) stay on, as a witness. With `keepClaim` the claim stays
 * on, as {@link whyNot} needs.
 */
function prepare(log: Pick<Log, "readings">, question: Reading | Claim | undefined, options: SolveOptions, keepClaim = false): Prepared {
  const switches = { widen: !!options.widen, defaults: !!options.defaults, closed: !!options.closedWorld };
  let qReading: Reading | undefined;
  if (question && "claim" in question) {
    const frames = isQuestionForce(question);
    const beyond = frames.find((f) => f.key !== "slot:newMember");
    if (beyond || question.unread.length) {
      const construction = beyond?.construction ?? question.unread[0]!.construction;
      return { ok: false, answer: { verdict: "beyond", because: [], switches: [], left: [{ reading: question.id, construction, key: beyond?.key, reason: "noRow" }] } };
    }
    qReading = { ...question, id: `?${question.id}`, frames };
  } else if (question) {
    qReading = { id: "?", source: undefined as never, frames: [], order: [], unordered: [], claim: question, links: [], unread: [] };
  }
  const readings = qReading ? [...log.readings.filter((r) => r !== question), qReading] : log.readings;
  const translation = translate({ readings }, { lexicon: options.lexicon, switches });
  const left = translation.left.filter((l) => l.reading !== qReading?.id);
  if (qReading && translation.left.length !== left.length) {
    return { ok: false, answer: { verdict: "beyond", because: [], switches: [], left: translation.left } };
  }
  let program = translation.program;
  if (qReading && !keepClaim) {
    const qid = JSON.stringify(qReading.id);
    // Keep the witness facts; drop the question's own claim.
    const witness = new RegExp(`^(holds\\(isa\\(|count\\(|detail\\(|fired\\(${escape(qid)},(isa|count|detail)\\()nm\\(${escape(qid)},`);
    program = program
      .split("\n")
      .filter((line) => !line.includes(`on(${qid})`) || line === `on(${qid}).` || witness.test(line))
      .join("\n");
  }
  const ctx: Context = { translation: { ...translation, left }, options, question: qReading?.id, open: openReadings(program) };
  return { ok: true, translation: { ...translation, left }, program, qid: qReading?.id, claim: qReading?.claim, ctx };
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const refused = (why: string, left: LeftOut[]): Answer => ({ verdict: "refused", because: [], switches: [], left, english: why });

/** The `holds` atoms the question fits (yes) and the denials that rule it out (no), with any match switches. */
function hits(model: Model, p: Extract<Prepared, { ok: true }>): { yes: string[]; no: string[]; switches: SolveSwitch[] } {
  const yes: string[] = [];
  const no: string[] = [];
  const switches = new Set<SolveSwitch>();
  for (const atom of model.holds) {
    const inner = negOf(atom);
    const source = p.translation.terms.get(inner ?? atom);
    if (!source) continue;
    // A denial rules the question out when the question says at least the denied claim.
    const fit = inner ? fitsQuestion(source.claim, p.claim!, p.ctx.options) : fitsQuestion(p.claim!, source.claim, p.ctx.options);
    if (!fit) continue;
    (inner ? no : yes).push(atom);
    fit.forEach((s) => switches.add(s));
  }
  return { yes, no, switches: [...switches] };
}

function answer(verdict: SolveVerdict, model: Model, start: string[], p: Extract<Prepared, { ok: true }>, extra: SolveSwitch[]): Answer {
  const why = explain(model, start, p.ctx);
  const switches = (["widen", "defaults", "closedWorld"] as const).filter((s) => why.switches.includes(s) || extra.includes(s));
  return { verdict, because: why.because, switches, left: p.translation.left };
}

/**
 * Does the question follow from the log? *yes* when a claim it fits holds in every world (cautious consequences),
 * *no* when a denial that rules it out does, *unknown* otherwise.
 */
export async function follows(log: Pick<Log, "readings">, question: Reading | Claim, options: SolveOptions = {}): Promise<Answer> {
  const p = prepare(log, question, options);
  if (!p.ok) return p.answer;
  const big = tooLarge(p.program, options);
  if (big) return refused(big, p.translation.left);
  const run = await consequences(p.program, "cautious");
  if (!run.ok) return refused(run.why, p.translation.left);
  const model = new Model(run.atoms);
  const h = hits(model, p);
  if (h.yes.length && h.no.length) return answer("both", model, [...h.yes, ...h.no], p, h.switches);
  if (h.yes.length) return answer("yes", model, h.yes, p, h.switches);
  if (h.no.length) return answer("no", model, h.no, p, h.switches);
  return { verdict: "unknown", because: [], switches: [], left: p.translation.left };
}

/**
 * Could the question be so? *yes* when a claim it fits holds in some world (brave consequences), *no* when a denial
 * that rules it out holds in every world, *unknown* otherwise.
 */
export async function couldBe(log: Pick<Log, "readings">, question: Reading | Claim, options: SolveOptions = {}): Promise<Answer> {
  const p = prepare(log, question, options);
  if (!p.ok) return p.answer;
  const big = tooLarge(p.program, options);
  if (big) return refused(big, p.translation.left);
  const brave = await consequences(p.program, "brave");
  if (!brave.ok) return refused(brave.why, p.translation.left);
  const some = new Model(brave.atoms);
  const b = hits(some, p);
  if (b.yes.length) {
    // In some world: only what is in every world is *no*, so a brave denial alone does not settle it.
    return answer("yes", some, b.yes, p, b.switches);
  }
  const cautious = await consequences(p.program, "cautious");
  if (!cautious.ok) return refused(cautious.why, p.translation.left);
  const every = new Model(cautious.atoms);
  const c = hits(every, p);
  if (c.no.length) return answer("no", every, c.no, p, c.switches);
  return { verdict: "unknown", because: [], switches: [], left: p.translation.left };
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
    out.push({ atom, readings, switches: why.switches, english: `These cannot all hold: ${readings.join(", ")}.` });
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
    out.push({ atom, readings, switches, english: `These cannot all hold: ${readings.join(", ")}.` });
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
