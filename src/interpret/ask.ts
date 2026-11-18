/**
 * Asking a log (the matcher in the interpreter plan): every reading in the log whose claim fits the question's, with the
 * blanks it binds and the frame path it sits under.
 *
 * The question's frames other than its own ask force are filters: a reading matches only if its path carries a frame of
 * that family with equal values and a matching party. A frame a stance list denies or excludes is not carried. The
 * matcher never decides that a framed claim holds; that is the host's verdict.
 */
import { entryOf, type Log, type LogEntry } from "./log.js";
import { framePath, match, negated, readingTree, type Binding, type FramePath, type MatchOptions, type Switch, type TermSite } from "./match.js";
import type { Frame, Reading, Term } from "./types.js";

/** What the host supplies to a question. */
export type Host = {
  /**
   * The host's referent for a term, when it can tell (a person or object in its world). Terms that both resolve match
   * by referent; otherwise by root. A `speaker` term in the log has its turn's speaker in `entry`.
   */
  referent?: (term: Term, side: "query" | "target", site: TermSite & { entry?: LogEntry }) => string | undefined;
  /** Switches, off by default ({@link Switch}). */
  switches?: Partial<Record<Switch, boolean>>;
};

export type Match = {
  reading: Reading;
  /** The turn it was said in. */
  entry?: LogEntry;
  binding: Binding;
  path: FramePath;
  /** The pairs no rule orders on the path: a consumer never files this match under an order. */
  unsettled: [Frame, Frame][];
  switches: Switch[];
};

/** The question's own ask force: the act word's frame that carries the question type. */
function isAskForce(frame: Frame): boolean {
  return frame.family === "force" && frame.values.ask !== undefined;
}

const sameValues = (a: Record<string, string>, b: Record<string, string>): boolean => {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
};

/** Frames on the question, other than its ask force: each must be carried on the path. */
export function questionFilters(question: Reading): Frame[] {
  return question.frames.filter((f) => !isAskForce(f));
}

function carries(path: FramePath, filter: Frame, options: MatchOptions): boolean {
  return path.frames.some(
    (pf) =>
      !negated(pf) &&
      pf.frame.family === filter.family &&
      sameValues(pf.frame.values, filter.values) &&
      (!filter.party ||
        (pf.frame.party !== undefined &&
          match({ roles: { z: filter.party }, predicate: [], details: [] }, { roles: { z: pf.frame.party }, predicate: [], details: [] }, options) !== undefined)),
  );
}

/** Every reading in the log, nested ones included, that answers the question. */
export function ask(question: Reading, log: Log, host: Host = {}): Match[] {
  const tree = readingTree([...log.readings, question]);
  const filters = questionFilters(question);
  const out: Match[] = [];
  for (const [reading] of tree) {
    if (reading === question) continue;
    let top = reading;
    for (let parent = tree.get(top); parent; parent = tree.get(top)) top = parent.reading;
    const entry = entryOf(log, top);
    const options: MatchOptions = {
      ...(host.referent
        ? { referent: (term, side, site) => host.referent!(term, side, side === "target" ? { ...site, ...(entry ? { entry } : {}) } : site) }
        : {}),
      querySite: { reading: question },
      targetSite: { reading },
      ...(host.switches ? { switches: host.switches } : {}),
    };
    const binding = match(question.claim, reading.claim, options);
    if (!binding) continue;
    const path = framePath(reading, tree);
    if (!filters.every((f) => carries(path, f, options))) continue;
    out.push({ reading, ...(entry ? { entry } : {}), binding, path, unsettled: path.unsettled, switches: binding.switches });
  }
  return out;
}
