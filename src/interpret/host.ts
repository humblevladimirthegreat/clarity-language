/**
 * The host (the interpreter plan's host section): what an application supplies to the interpreter. Every member is
 * optional; a host with none is a pure reader's client. `ask` (ask.ts) reads `referent`, `refer`, `switches` and
 * `lexicon`; the loop (run.ts) reads the rest.
 *
 * The loop's pass-through list is here too: the frame families a command may carry and still run. It is a const, not
 * a host member, because no host may widen it (`accepts` only narrows).
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { FrameFamily } from "../parse/scope.js";
import type { LogEntry } from "./log.js";
import type { Log } from "./log.js";
import type { MatchOptions, Switch, TermSite } from "./match.js";
import type { Match } from "./ask.js";
import type { Claim, Detail, Frame, Reading, ReadingId, Term } from "./types.js";
import { detailNumber } from "./value.js";

/** What a term refers to in the host's world: one entity, several (ask *which one?*), or none. */
export type Referent<E> = { kind: "one"; entity: E } | { kind: "several"; entities: E[] } | { kind: "none" };

export type RoleLetter = "z" | "d" | "b";

/** Where a term sits when the host is asked to refer it. */
export type ReferCtx<E> = TermSite & {
  /** The role the term fills, when it fills one. */
  role?: RoleLetter;
  /** A question's term (`query`) or a logged reading's (`target`); unset when the loop resolves a command's role. */
  side?: "query" | "target";
  /** The turn a logged term was said in: a `speaker` term's speaker is `entry.speaker`. */
  entry?: LogEntry;
  /** The session, when the loop asks. */
  session?: Session<E>;
};

/** The referents of a claim's roles, as the loop resolved them. */
export type Bound<E> = Partial<Record<RoleLetter, Referent<E>>>;

/**
 * Live state the host holds about a question's claim (beyond what the log says). `holds` is whether the claim holds;
 * `answers` gives a fill question's answer per blank as a morph-gloss leaf (`z-dog`), written by the host from a
 * concrete sense, never a spelling. A blank that fills a role is keyed by its role letter; any blank, including one
 * hosted in a detail (a *where* blank), by its `at` ({@link blankSites}). `source` names the state, for *why*.
 */
export type Held = { holds: boolean; source: string; answers?: Partial<Record<RoleLetter | string, { leaf: string; english: string }>> };

/** A blank in a question's claim and its `at`: the same id a log match gives the blank it binds (match.ts). */
export type BlankSite = { at: string; blank: Term; detail?: Detail };

/**
 * Every blank in a claim's roles and details, with its `at`: a role's is its letter (`z`), a detail's hosted blank's is
 * its path (`claim/detail.0/hosted`; a number blank ends in `/number`). A host keys {@link Held} answers by it.
 */
export function blankSites(claim: Claim): BlankSite[] {
  const out: BlankSite[] = [];
  const details = (list: readonly Detail[], at: string): void =>
    list.forEach((d, i) => {
      const here = `${at}/detail.${i}`;
      if (d.hosted?.kind === "blank") out.push({ at: detailNumber(d) ? `${here}/number` : `${here}/hosted`, blank: d.hosted, detail: d });
      else if (d.hosted && "details" in d.hosted && d.hosted.details) details(d.hosted.details, `${here}/hosted`);
      details(d.details ?? [], here);
    });
  for (const [letter, term] of Object.entries(claim.roles) as [RoleLetter, Term][]) {
    if (term.kind === "blank") out.push({ at: letter, blank: term });
    if ("details" in term && term.details) details(term.details, letter);
  }
  details(claim.details, "claim");
  return out;
}

/** What a turn did beyond being read: the host's own record, opaque to the loop. */
export type Effect = { kind: string; reading?: ReadingId; data?: unknown };

/** A command or prohibition, its roles resolved, handed to the verb's handler. */
export type Action<E> = {
  reading: Reading;
  /** True for a prohibition: the handler is asked to keep from the act. */
  prohibition: boolean;
  roles: Partial<Record<RoleLetter, E>>;
  session: Session<E>;
};

/** The host said no: the reading is `refused`, with this reason. */
export type Refusal = { ok: false; reason: string };

export type HandlerResult = { ok: true; effects?: Effect[] } | Refusal;

/** What a verb does, for a host that acts. */
export type Handler<E> = (action: Action<E>) => HandlerResult;

/**
 * The host's ruling on a question. `because` lists the readings that decided, by id (and held state by `source`).
 * `fill` answers are terms from the log or leaves from held state.
 */
export type Verdict =
  | { kind: "yes" | "no" | "unknown"; because: string[] }
  | { kind: "fill"; answers: FillAnswer[]; because: string[] }
  | { kind: "refused"; reason: string };

/** One answer to a fill question: the blank's role and the answer, a log term or a held leaf. */
export type FillAnswer = { at: string; term?: Term; leaf?: { leaf: string; english: string } };

export type Host<E = string> = {
  /**
   * The host's referent for a term, when it can tell (a person or object in its world). Terms that both resolve match
   * by referent; otherwise by root. A `speaker` term in the log has its turn's speaker in `entry`. When unset, `ask`
   * uses `refer`: one entity that is a string or number is its own referent.
   */
  referent?: (term: Term, side: "query" | "target", site: TermSite & { entry?: LogEntry }) => string | undefined;
  /** What a term refers to: one, several, none. The loop resolves a command's roles with it. */
  refer?: (term: Term, ctx: ReferCtx<E>) => Referent<E>;
  /** Live state, for a host with more than a log. */
  holds?: (claim: Claim, bound: Bound<E>) => Held[];
  /** What a verb does, by its root, for a host that acts. */
  handler?: (root: string) => Handler<E> | undefined;
  /**
   * What a statement does beyond being logged. Called before the turn is logged; a {@link Refusal} makes the reading
   * `refused`, and the turn then leaves the log as it was.
   */
  told?: (reading: Reading, session: Session<E>) => Effect[] | Refusal;
  /** Which frames count, and who wins. Unset: the loop's default verdict (run.ts). */
  verdict?: (question: Reading, matches: Match[], held: Held[]) => Verdict;
  /** Parts of a reading this host cannot act on yet: each makes the turn `beyond`. Narrows only. */
  accepts?: (reading: Reading) => string[];
  /** How many earlier turns are parsed with each new one (decision 5). Unset: the whole transcript. */
  window?: number;
  /** Switches, off by default ({@link Switch}). */
  switches?: Partial<Record<Switch, boolean>>;
  /** The parser's lexicon tables; `widen` reads compound heads from them. */
  lexicon?: MatchOptions["lexicon"];
};

/** One conversation with a host: its log, and who the user is. */
export type Session<E = string> = {
  host: Host<E>;
  tables: ClassifyTables;
  log: Log;
  /** The user's speaker name in the log. */
  speaker: string;
  /** The next turn's `at`. */
  at: number;
};

/** The referent `ask` compares, from `referent`, or from `refer` when it gives one string or number. */
export function referentOf<E>(host: Host<E>): Host<E>["referent"] {
  if (host.referent) return host.referent;
  const refer = host.refer;
  if (!refer) return undefined;
  return (term, side, site) => {
    const r = refer(term, { ...site, side });
    if (r.kind !== "one") return undefined;
    return typeof r.entity === "string" || typeof r.entity === "number" ? String(r.entity) : undefined;
  };
}

// ── The pass-through list (interpreter plan, the loop) ──────────────────────

/**
 * A frame family a command may carry and still run, because the owning grammar section shows it leaves what the
 * command does unchanged. `force` covers only the act words after the first: the first is the turn's own force.
 */
export type PassThroughRow = {
  family: FrameFamily;
  /** When set, the row holds only frames with this table key. */
  key?: string;
  /** When set, the row holds a frame only when this says so; `all` is every frame the command carries other than its force. */
  when?: (frame: Frame, all: readonly Frame[]) => boolean;
  anchors: readonly string[];
  why: string;
};

/** A number on a noun: the number word read as its adjective (number-roles.md#number-as-roles). */
const isNumber = (d: Detail): boolean => d.key.startsWith("lexReading:number") || d.hosted?.kind === "number";

/**
 * A lone first-mention noun: the binder hosts one noun (not a list: no and-list, no `-r` join, no `zual`), with no
 * number on it, and no other binder rides on the command.
 */
function loneNewMember(frame: Frame, all: readonly Frame[]): boolean {
  const noun = frame.hosted;
  if (!noun || noun.kind !== "thing" || noun.details.some(isNumber)) return false;
  return all.every((f) => f === frame || f.family !== "binder");
}

export const PASS_THROUGH: readonly PassThroughRow[] = [
  {
    family: "binder",
    key: "slot:newMember",
    when: loneNewMember,
    anchors: ["joins.md#new-member-in-a-command"],
    why: "In a command, a noun mentioned for the first time asks the listener to act on one such thing, whichever one they pick; the host's `refer` picks it, and several give *which one?*.",
  },
  {
    family: "force",
    anchors: ["more-turn-words.md#doubled-act", "more-turn-words.md#stacked-acts"],
    why: "A doubled act word keeps the act and only grows more insistent; in two different act words the first is what you really do and the second only says how it sounds.",
  },
  {
    family: "call",
    anchors: ["speech-moves.md#vocative"],
    why: "A call names who the turn is for and commutes with every other frame in its clause.",
  },
  {
    family: "attitude",
    anchors: ["tone-marks.md#tone-marks", "feelings.md#speaker-attitude", "speech-manner.md#speech-manner"],
    why: "A tone mark changes only your voice and never the speech act; a speaker attitude or speech manner is always the speaker's own, never part of the act.",
  },
] as const;

/** The pass-through row that holds a frame, if one does; `all` is every frame the command carries other than its force. */
export function passThrough(frame: Frame, all: readonly Frame[] = [frame]): PassThroughRow | undefined {
  return PASS_THROUGH.find(
    (row) => row.family === frame.family && (row.key === undefined || row.key === frame.key) && (!row.when || row.when(frame, all)),
  );
}
