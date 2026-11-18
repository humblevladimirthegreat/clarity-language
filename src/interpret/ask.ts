/**
 * Asking a log (the matcher in the interpreter plan): every reading in the log whose claim fits the question's, with the
 * blanks it binds and the frame path it sits under.
 *
 * The question's frames other than its own ask force and its new-member binders are filters: a reading matches only if
 * its path carries a frame of that family with equal values and a matching party. A frame a stance list denies or
 * excludes still passes, with its standing on the path: the matcher never decides that a framed claim holds; that is
 * the host's verdict.
 *
 * Read the question against the log with `readQuestion` (log.ts), so its pronouns bind to the log's terms.
 */
import { entryOf, type Log, type LogEntry } from "./log.js";
import { framePath, match, withIslands, withListFrames, readingTree, type Binding, type FramePath, type MatchOptions, type Switch, type TermSite } from "./match.js";
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
  /** The parser's lexicon tables; `widen` reads compound heads from them. */
  lexicon?: MatchOptions["lexicon"];
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

/**
 * A new-member binder on a question term (`slot:newMember`, open decision 18, decided (b)): not a filter. *Who saw a
 * cat?* asks about a cat, not about a cat newly brought in, so the term matches by root (or referent) like a bare noun:
 * it finds *Sam saw the cat*. Other binders (universals, *no*) stay filters.
 */
function isNewMember(frame: Frame): boolean {
  return frame.family === "binder" && frame.key === "slot:newMember";
}

/** Frames on the question, other than its ask force and its new-member binders: each must be carried on the path. */
export function questionFilters(question: Reading): Frame[] {
  return question.frames.filter((f) => !isAskForce(f) && !isNewMember(f));
}

/**
 * The values a filter compares. On a holder seam the word's ending is the holder's own (`-n` a name, `-r` a resume;
 * holder.md#holder), so it is the party's form, not the frame's: the party match compares the holder, through referent
 * and antecedent, and the ending is left out. This holds for the holder frame and for its host stance.
 */
function filterValues(frame: Frame): Record<string, string> {
  if (!frame.party && !frame.holderHost) return frame.values;
  const { ending: _party, ...rest } = frame.values;
  return rest;
}

function carries(path: FramePath, filter: Frame, options: MatchOptions): boolean {
  return path.frames.some(
    (pf) =>
      pf.frame.family === filter.family &&
      sameValues(filterValues(pf.frame), filterValues(filter)) &&
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
      ...(host.lexicon ? { lexicon: host.lexicon } : {}),
    };
    const binding = match(question.claim, reading.claim, options);
    if (!binding) continue;
    const path = withIslands(withListFrames(framePath(reading, tree), binding.listFrames, reading), binding.islands);
    if (!filters.every((f) => carries(path, f, options))) continue;
    out.push({ reading, ...(entry ? { entry } : {}), binding, path, unsettled: path.unsettled, switches: binding.switches });
  }
  return out;
}
