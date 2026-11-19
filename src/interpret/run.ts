/**
 * The loop (the interpreter plan's loop section): `run(text, session)` reads one user turn against the session's log and
 * dispatches each top-level reading on its force frame.
 *
 * | Force | Loop does |
 * |-------|-----------|
 * | statement | calls `told`, then adds the turn to the log unless `told` refused |
 * | said | as a statement: a turn word that makes no claim (a greeting, an interjection alone) |
 * | question | `ask`, then `holds`, then `verdict`; replies |
 * | command, prohibition | resolves the roles with `refer`, then runs `handler` |
 *
 * A framed command fails closed: it runs only when every frame on it, other than its force, is on the pass-through
 * list (host.ts). Outcomes: `parse` (did not parse), `beyond` (parsed, but something on it is not read, not ordered,
 * not accepted, not handled, or framed off the list; always named), `refused` (the host or its verdict said no), `ok`.
 * A turn with any reading beyond dispatches nothing and leaves the log as it was; a turn with a refused statement
 * dispatches the rest and leaves the log as it was. A turn is logged whole or not at all.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { ask, type Match } from "./ask.js";
import { blankSites, passThrough, type Bound, type Effect, type FillAnswer, type Held, type Host, type RoleLetter, type Session, type Verdict } from "./host.js";
import { appendTurn, emptyLog, readQuestion } from "./log.js";
import { allReadings } from "./read.js";
import {
  answerLeaf,
  cannotSayDraft,
  fillClauseDraft,
  fillFragmentDrafts,
  heldLeaf,
  placeBlank,
  firstReply,
  noDraft,
  whichOneDraft,
  whyReply,
  yesDraft,
  type PlaceBlank,
  type Reply,
} from "./reply.js";
import type { Detail, Frame, Reading, ReadingId, Term } from "./types.js";

export type Outcome = "parse" | "beyond" | "refused" | "ok";

/**
 * `said`: a turn word that is neither an act word nor *yes* / *no* (a greeting, an interjection alone) makes no claim; it
 * is logged and handed to `told` like a statement, and no handler runs. A *yes* / *no* is a statement: the polar word
 * implies `yal` / `yam` (sentence-linkers.md#past-a-period).
 */
export type Force = "statement" | "said" | "question" | "command" | "prohibition";

/** One thing that put a turn beyond the loop, named. */
export type BeyondPart = {
  kind: "unread" | "unordered" | "accepts" | "force" | "frame" | "clauses" | "verb" | "handler" | "refer";
  reading: ReadingId;
  /** The construction, frame key, host part, or verb root. */
  name: string;
  frame?: Frame;
};

export type ReadingResult = {
  reading: Reading;
  force: Force;
  outcome: Exclude<Outcome, "parse">;
  /** Why it was refused: the host's or the verdict's reason. */
  refused?: string;
  effects: Effect[];
  replies: Reply[];
  matches?: Match[];
  held?: Held[];
  verdict?: Verdict;
};

export type TurnResult = {
  outcome: Outcome;
  /** The parse error, for `parse`. */
  error?: string;
  /** For `beyond`: every part, named. */
  beyond: BeyondPart[];
  readings: ReadingResult[];
  effects: Effect[];
  replies: Reply[];
};

/** A session with a host: its log starts empty, with the host's re-parse window. */
export function createSession<E>(host: Host<E>, tables: ClassifyTables, options: { speaker?: string; text?: string } = {}): Session<E> {
  return {
    host,
    tables,
    log: emptyLog({ ...(host.window !== undefined ? { window: host.window } : {}), ...(options.text ? { text: options.text } : {}) }),
    speaker: options.speaker ?? "user",
    at: 0,
  };
}

/** The reading's own force frame: its first act word. */
function forceFrame(reading: Reading): Frame | undefined {
  return reading.frames.find((f) => f.family === "force");
}

const SERIES_FORCE: Readonly<Record<string, Force>> = { a: "statement", e: "question", o: "command", u: "prohibition" };

/** A claim with nothing in it: no verb, role, predicate, detail or clause join. */
function emptyClaim(reading: Reading): boolean {
  const { verb, roles, predicate, details, clauses } = reading.claim;
  return !verb && !clauses && !Object.keys(roles).length && !predicate.length && !details.length;
}

/** The force a reading is dispatched on; undefined for an act the loop does not dispatch. */
function forceOf(reading: Reading): Force | undefined {
  const frame = forceFrame(reading);
  if (frame?.key === "reading:greeting") return "said";
  if (!frame) return emptyClaim(reading) && reading.frames.some((f) => f.key === "edge:interjection") ? "said" : "statement";
  return SERIES_FORCE[frame.values.series ?? ""];
}

/** Logged and handed to `told`: a statement, or a turn word that makes no claim. */
const isTold = (force: Force | undefined): boolean => force === "statement" || force === "said";

/** Every frame a command carries other than its force: on the clause, and on its terms and details at any depth. */
function commandFrames(reading: Reading): Frame[] {
  const own = forceFrame(reading);
  const out: Frame[] = reading.frames.filter((f) => f !== own);
  const seen = new Set<object>();
  const detail = (d: Detail): void => {
    if (seen.has(d)) return;
    seen.add(d);
    out.push(...(d.frames ?? []));
    d.details?.forEach(detail);
    if (d.hosted) term(d.hosted);
  };
  const term = (t: Term): void => {
    if (seen.has(t)) return;
    seen.add(t);
    if ("frames" in t && t.frames) out.push(...t.frames);
    if ("details" in t && t.details) t.details.forEach(detail);
    if (t.kind === "list") {
      t.members.forEach(term);
      t.sharedDetails?.forEach(detail);
      if (t.bound) detail(t.bound);
    }
  };
  const { claim } = reading;
  if (claim.verb) term(claim.verb);
  Object.values(claim.roles).forEach((t) => t && term(t));
  claim.predicate.forEach(term);
  claim.details.forEach(detail);
  for (const list of reading.stanceLists ?? []) out.push(...(list.inner ?? []));
  return [...new Set(out)];
}

const ROLES: readonly RoleLetter[] = ["z", "d", "b"];

/** What puts a reading beyond the loop before dispatch. */
function beyondBefore<E>(reading: Reading, host: Host<E>): BeyondPart[] {
  const out: BeyondPart[] = [];
  for (const r of allReadings([reading])) {
    for (const u of r.unread) out.push({ kind: "unread", reading: r.id, name: u.construction });
    for (const [a, b] of r.unordered) out.push({ kind: "unordered", reading: r.id, name: `${a.key} / ${b.key}` });
  }
  for (const part of host.accepts?.(reading) ?? []) out.push({ kind: "accepts", reading: reading.id, name: part });
  const force = forceOf(reading);
  if (!force) out.push({ kind: "force", reading: reading.id, name: forceFrame(reading)!.key, frame: forceFrame(reading)! });
  if (force === "command" || force === "prohibition") {
    const frames = commandFrames(reading);
    for (const frame of frames) {
      if (!passThrough(frame, frames)) out.push({ kind: "frame", reading: reading.id, name: `${frame.family}:${frame.key}`, frame });
    }
    if (reading.claim.clauses) out.push({ kind: "clauses", reading: reading.id, name: "clause join" });
    const verb = reading.claim.verb;
    if (!verb || verb.kind !== "thing") out.push({ kind: "verb", reading: reading.id, name: verb?.kind ?? "none" });
    else if (!host.handler?.(verb.root)) out.push({ kind: "handler", reading: reading.id, name: verb.root });
    if (!host.refer && ROLES.some((role) => reading.claim.roles[role])) out.push({ kind: "refer", reading: reading.id, name: "refer" });
  }
  return out;
}

/** A command: refer its roles, then run the verb's handler. */
function command<E>(reading: Reading, force: Force, session: Session<E>): ReadingResult | BeyondPart[] {
  const { host } = session;
  const verb = reading.claim.verb;
  if (!verb || verb.kind !== "thing") return [{ kind: "verb", reading: reading.id, name: verb?.kind ?? "none" }];
  const handler = host.handler?.(verb.root);
  if (!handler) return [{ kind: "handler", reading: reading.id, name: verb.root }];
  const roles: Partial<Record<RoleLetter, E>> = {};
  const base = { reading, force, effects: [] as Effect[] };
  for (const role of ROLES) {
    const term = reading.claim.roles[role];
    if (!term) continue;
    if (!host.refer) return [{ kind: "refer", reading: reading.id, name: role }];
    const r = host.refer(term, { reading, role, session });
    if (r.kind === "several") {
      const reply = firstReply("whichOne", [whichOneDraft(role)], session.tables);
      return { ...base, outcome: "refused", refused: `${role}: several referents`, replies: reply ? [reply] : [] };
    }
    if (r.kind === "none") return { ...base, outcome: "refused", refused: `${role}: no referent`, replies: [] };
    roles[role] = r.entity;
  }
  const result = handler({ reading, prohibition: force === "prohibition", roles, session });
  if (!result.ok) return { ...base, outcome: "refused", refused: result.reason, replies: [] };
  return { ...base, outcome: "ok", effects: (result.effects ?? []).map((e) => ({ reading: reading.id, ...e })), replies: [] };
}

/**
 * A match counts by default only when it is a plain claim: every frame on its path is on the pass-through list, no
 * unsettled pair, no switch. A call does not change what the sentence claims (speech-moves.md#vocative); in a statement,
 * a first-mention noun says the claim holds of one such thing (joins.md#new-member-in-a-statement). A speaker attitude
 * and a first-mention noun are ordered by text order, like any frame pair (feelings.md#speaker-attitude), and each
 * passes through on its own, so a path with both is plain.
 */
const plain = (m: Match): boolean => {
  const frames = m.path.frames.map((p) => p.frame);
  return frames.every((f) => passThrough(f, frames) !== undefined) && m.unsettled.length === 0 && m.switches.length === 0;
};

/**
 * The loop's verdict when the host gives none: held state first (a held claim that does not hold says *no*), then plain
 * matches from the log. A framed match never decides by default; that is the host's verdict.
 */
export function defaultVerdict(question: Reading, matches: readonly Match[], held: readonly Held[]): Verdict {
  const counted = matches.filter(plain);
  const ids = counted.map((m) => m.reading.id);
  if (forceFrame(question)?.values.ask === "fillAsk") {
    const answers: FillAnswer[] = [
      ...counted.flatMap((m) => m.binding.blanks.map((b) => ({ at: b.at, term: b.term }))),
      ...held.filter((h) => h.holds).flatMap((h) => Object.entries(h.answers ?? {}).map(([at, leaf]) => ({ at, leaf: leaf! }))),
    ];
    const because = [...ids, ...held.filter((h) => h.holds).map((h) => h.source)];
    return answers.length ? { kind: "fill", answers, because } : { kind: "unknown", because: [] };
  }
  const yes = held.filter((h) => h.holds).map((h) => h.source);
  const no = held.filter((h) => !h.holds).map((h) => h.source);
  if (no.length && !yes.length && !ids.length) return { kind: "no", because: no };
  if (yes.length || ids.length) return { kind: "yes", because: [...ids, ...yes] };
  return { kind: "unknown", because: [] };
}

/** The referents of a question's roles that are not blanks. */
function boundOf<E>(reading: Reading, session: Session<E>): Bound<E> {
  const out: Bound<E> = {};
  const refer = session.host.refer;
  if (!refer) return out;
  for (const role of ROLES) {
    const term = reading.claim.roles[role];
    if (term && term.kind !== "blank") out[role] = refer(term, { reading, role, side: "query", session });
  }
  return out;
}

/** A question: ask the log, then live state, then the verdict, then replies. */
function question<E>(reading: Reading, text: string, session: Session<E>): ReadingResult {
  const { host, tables } = session;
  const matches = ask(reading, session.log, host);
  const held = host.holds?.(reading.claim, boundOf(reading, session)) ?? [];
  const verdict = host.verdict ? host.verdict(reading, matches, held) : defaultVerdict(reading, matches, held);
  const base = { reading, force: "question" as const, effects: [], matches, held, verdict };
  if (verdict.kind === "refused") return { ...base, outcome: "refused", refused: verdict.reason, replies: [] };
  const replies: Reply[] = [];
  const push = (reply: Reply | undefined) => reply && replies.push(reply);
  if (verdict.kind === "yes") push(firstReply("yes", [yesDraft()], tables));
  else if (verdict.kind === "no") push(firstReply("no", [noDraft()], tables));
  else if (verdict.kind === "unknown") push(firstReply("cannotSay", [cannotSayDraft(tables)], tables));
  else if (verdict.kind === "fill") {
    // A where blank (a detail's, from blankSites) answers with the question's hook, and is found in its line by its at.
    const sites = blankSites(reading.claim);
    const placeAt = (at: string): PlaceBlank | undefined => {
      const site = sites.find((s) => s.at === at);
      return site ? placeBlank(text, site, sites, tables) : undefined;
    };
    const leaves = verdict.answers.flatMap((a) => {
      const place = placeAt(a.at);
      const leaf = a.leaf ? heldLeaf(a.leaf, place) : a.term ? answerLeaf(a.term, a.at, tables, place) : undefined;
      return leaf ? [{ at: a.at, place, ...leaf }] : [];
    });
    const unique = [...new Map(leaves.map((l) => [l.leaf, l])).values()];
    push(firstReply("fillFragment", fillFragmentDrafts(unique), tables));
    if (unique.length === 1) {
      const clause = fillClauseDraft(text, unique[0]!.at, unique[0]!, tables, unique[0]!.place);
      if (clause) push(firstReply("fillClause", [clause], tables));
    }
    if (!replies.length) push(firstReply("cannotSay", [cannotSayDraft(tables)], tables));
  }
  if (verdict.because.length) replies.push(whyReply(verdict.because));
  return { ...base, outcome: "ok", replies };
}

/** Read one user turn against the session and act on it. Updates `session.log` and `session.at` for a turn with a statement none refused. */
export function run<E>(text: string, session: Session<E>): TurnResult {
  const { host, tables } = session;
  const empty = { beyond: [], readings: [], effects: [], replies: [] };
  let read: Reading[];
  try {
    read = readQuestion(session.log, text, tables, { speaker: session.speaker });
  } catch (error) {
    return { outcome: "parse", error: error instanceof Error ? error.message : String(error), ...empty };
  }
  if (!read.length) return { outcome: "parse", error: "the turn holds no sentence", ...empty };
  const beyond = read.flatMap((r) => beyondBefore(r, host));
  if (beyond.length) return { ...empty, outcome: "beyond", beyond };

  let readings = read;
  let logged: Session<E>["log"] | undefined;
  if (read.some((r) => isTold(forceOf(r)))) {
    const log = appendTurn(session.log, { speaker: session.speaker, at: session.at, text }, tables);
    const entry = log.entries[log.entries.length - 1];
    if (log.rejected.length > session.log.rejected.length || !entry) {
      return { outcome: "parse", error: log.rejected[log.rejected.length - 1]?.error ?? "not logged", ...empty };
    }
    logged = log;
    readings = entry.readings;
  }

  // Statements (and turn words that make no claim) first: `told` runs before the turn is logged, and a refusal keeps the turn out of the log.
  const results: (ReadingResult | undefined)[] = readings.map((reading) => {
    const force = forceOf(reading);
    if (force !== "statement" && force !== "said") return undefined;
    const told = host.told?.(reading, session) ?? [];
    if (!Array.isArray(told)) return { reading, force, outcome: "refused", refused: told.reason, effects: [], replies: [] };
    return { reading, force, outcome: "ok", effects: told.map((e) => ({ reading: reading.id, ...e })), replies: [] };
  });
  if (logged && !results.some((r) => r?.outcome === "refused")) {
    session.log = logged;
    session.at += 1;
  }

  const late: BeyondPart[] = [];
  readings.forEach((reading, i) => {
    const force = forceOf(reading)!;
    if (force === "statement" || force === "said") return;
    if (force === "question") results[i] = question(reading, text, session);
    else {
      const out = command(reading, force, session);
      if (Array.isArray(out)) late.push(...out);
      else results[i] = out;
    }
  });
  const done = results.filter((r): r is ReadingResult => r !== undefined);
  const effects = done.flatMap((r) => r.effects);
  const replies = done.flatMap((r) => r.replies);
  if (late.length) return { outcome: "beyond", beyond: late, readings: done, effects, replies };
  const outcome: Outcome = done.some((r) => r.outcome === "refused") ? "refused" : "ok";
  return { outcome, beyond: [], readings: done, effects, replies };
}
