/**
 * Asking a log (the matcher in the interpreter plan): every reading in the log whose claim fits the question's, with the
 * blanks it binds and the frame path it sits under.
 *
 * The question's frames other than its own ask force, its new-member binders, and the frames outside what is asked
 * (those a command passes through, and MIRATIVE) are filters: a reading matches only if
 * its path carries a frame of that family with equal values and a matching party. A frame a stance list denies or
 * excludes still passes, with its standing on the path: the matcher never decides that a framed claim holds; that is
 * the host's verdict.
 *
 * Read the question against the log with `readQuestion` (log.ts), so its pronouns bind to the log's terms.
 */
import { entryOf, speakerId, turnPersons, type Log, type LogEntry } from "./log.js";
import { passThrough, referentOf, type Host } from "./host.js";
import { framePath, match, withIslands, withListFrames, readingTree, type Binding, type FramePath, type MatchOptions, type PathFrame, type Switch } from "./match.js";
import type { Frame, Reading } from "./types.js";

export type { Host };

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

/**
 * Frames outside what is asked (open decision 25, decided (a)): every frame a command passes through (`passThrough`:
 * a later act word, a call, an attitude, a clause sake, contrary to a stance), plus MIRATIVE, which mirative.md#mirative
 * keeps outside what is asked. Adding one to a question asks the same thing.
 */
function outsideAsked(frame: Frame, rest: readonly Frame[]): boolean {
  return frame.family === "mirative" || passThrough(frame, rest) !== undefined;
}

/**
 * Frames on the question, other than its ask force, its new-member binders, and the frames outside what is asked: each
 * must be carried on the path.
 */
export function questionFilters(question: Reading): Frame[] {
  const rest = question.frames.filter((f) => !isAskForce(f));
  return rest.filter((f) => !isNewMember(f) && !outsideAsked(f, rest));
}

/**
 * The values a filter compares. On a holder seam the word's ending is the holder's own (`-n` a name, `-r` a resume;
 * holder.md#naming-a-holder), so it is the party's form, not the frame's: the party match compares the holder, through referent
 * and antecedent, and the ending is left out. This holds for the holder frame and for its host stance.
 */
function filterValues(frame: Frame): Record<string, string> {
  // A say word's party (permission-consent.md#say-words) is who says it, and its ending still counts.
  if ((!frame.party || frame.key === "wordFamily:say") && !frame.holderHost) return frame.values;
  const { ending: _party, ...rest } = frame.values;
  return rest;
}

/**
 * D1 (reader-solver boundary B5): a NOTIONAL question's `supposition` link (readQuestion) names the one supposition it
 * asks inside, so its NOTIONAL filter is carried only by that reading's frame, stated there or carried from it. With no
 * link, any NOTIONAL frame carries it.
 */
function supposedBy(question: Reading, filter: Frame): ((pf: PathFrame) => boolean) | undefined {
  const to = filter.family === "notional" ? question.links.find((l) => l.kind === "supposition")?.to : undefined;
  if (to === undefined) return undefined;
  return (pf) => (pf.how === "carried" ? pf.link?.to : pf.reading.id) === to;
}

function carries(path: FramePath, filter: Frame, options: MatchOptions, supposed?: (pf: PathFrame) => boolean): boolean {
  return path.frames.some(
    (pf) =>
      pf.frame.family === filter.family &&
      (!supposed || supposed(pf)) &&
      sameValues(filterValues(pf.frame), filterValues(filter)) &&
      (!filter.party ||
        (pf.frame.party !== undefined &&
          match({ roles: { z: filter.party }, predicate: [], details: [] }, { roles: { z: pf.frame.party }, predicate: [], details: [] }, options) !== undefined)),
  );
}

export type AskOptions = {
  /**
   * Who asks, as the log names speakers. A speaker term in the question then fits only a reading said by the asker
   * (`TermSite`): *did I walk?* is about the asker. Unset: a speaker term fits any turn's speaker.
   */
  asker?: string;
};

/** Every reading in the log, nested ones included, that answers the question. */
export function ask<E>(question: Reading, log: Log, host: Host<E> = {}, ask: AskOptions = {}): Match[] {
  const referent = referentOf(host);
  const tree = readingTree([...log.readings, question]);
  const filters = questionFilters(question);
  const out: Match[] = [];
  for (const [reading] of tree) {
    if (reading === question) continue;
    let top = reading;
    for (let parent = tree.get(top); parent; parent = tree.get(top)) top = parent.reading;
    const entry = entryOf(log, top);
    const options: MatchOptions = {
      ...(referent
        ? { referent: (term, side, site) => referent(term, side, side === "target" ? { ...site, ...(entry ? { entry } : {}) } : site) }
        : {}),
      querySite: { reading: question, ...(ask.asker !== undefined ? { speaker: speakerId(ask.asker) } : {}) },
      targetSite: { reading, ...(entry ? turnPersons(entry, log.entries.indexOf(entry)) : {}) },
      ...(host.switches ? { switches: host.switches } : {}),
      ...(host.lexicon ? { lexicon: host.lexicon } : {}),
    };
    const binding = match(question.claim, reading.claim, options);
    if (!binding) continue;
    const path = withIslands(withListFrames(framePath(reading, tree), binding.listFrames, reading), binding.islands);
    if (!filters.every((f) => carries(path, f, options, supposedBy(question, f)))) continue;
    out.push({ reading, ...(entry ? { entry } : {}), binding, path, unsettled: path.unsettled, switches: binding.switches });
  }
  return out;
}
