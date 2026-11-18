/**
 * The log: readings in order, each with who said it and when (docs/meta/interpreter.md#terms, **log**).
 *
 * A session reads each new turn together with the transcript so far (or the host's window of it), so the resolver's
 * bindings cross turns with no parser change. The same turns always give the same log. A turn that does not parse adds
 * nothing and is reported in `rejected`.
 *
 * A sentence is one body of an utterance (`/y/` turns split utterances, periods split bodies), the unit a top-level
 * reading reads; a turn holds a run of them, so its range counts sentences, not utterances. A turn that is a call alone
 * is its own entry and keeps its sentence: a call closed by a period reaches its own turn only, so the next body starts
 * an utterance of its own (sentence-linkers.md#past-a-period). A turn that is another turn word alone (an interjection,
 * a *yes*) is its own entry too; once a bare body follows it in the parse, that body joins its utterance, so its entry
 * keeps no sentence and the next turn's body counts as its own new sentence.
 *
 * Speakers: the log parses the window with each sentence's speaker (`ParseOptions.speakers`), so the resolve stage keeps
 * a carried frame per speaker (`ResolveInfo.carried`): another speaker's reply neither takes nor ends it
 * (evidentiality.md#carry-forward).
 */
import type { ClassifyTables } from "../parse/classify.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { ParseResult } from "../parse/types.js";
import { readParse } from "./read.js";
import type { Reading } from "./types.js";

/** One turn as the host gives it. `at` is the host's time or sequence number. */
export type Turn = { speaker: string; at: number; text: string };

export type LogEntry = Turn & {
  /** The turn's sentences in the log's parse, in text order: `[first, first + count)`. Absent for a turn outside the window. */
  sentences?: { first: number; count: number };
  /** Its sentences' readings (top level; nested readings sit inside them). Empty outside the window. */
  readings: Reading[];
};

export type Rejected = Turn & { error: string };

export type LogOptions = {
  /** How many earlier turns the host parses with each new one. Unset: the whole transcript. */
  window?: number;
  /** The text id that starts every reading id. */
  text?: string;
};

export type Log = {
  options: LogOptions;
  entries: LogEntry[];
  rejected: Rejected[];
  /** The parse of the turns in the window, and their readings in text order. */
  parse?: ParseResult;
  readings: Reading[];
};

export function emptyLog(options: LogOptions = {}): Log {
  return { options, entries: [], rejected: [], readings: [] };
}

/**
 * A turn the host hands in is a closed turn: without a final `.`, `?` or `!` it would run into the next turn when the
 * transcript is parsed again (a `/y/` word starts a turn only after a period), so the log closes it with `.`.
 */
const closed = (text: string): string => {
  const t = text.trim();
  return t && !/[.?!]$/.test(t) ? `${t}.` : t;
};

const transcript = (turns: readonly Turn[]): string => turns.map((t) => closed(t.text)).join(" ");

/** The sentence index of each (utterance, body) in a parse: a bodiless utterance is one sentence, as in the reader. */
function sentenceIndex(parse: ParseResult): Map<string, number> {
  const out = new Map<string, number>();
  parse.utterances.forEach((u, ui) => {
    for (let bi = 0; bi < Math.max(u.bodies.length, 1); bi++) out.set(`${ui}.${bi}`, out.size);
  });
  return out;
}

/** The turns read together with the next one. */
function windowOf(entries: readonly LogEntry[], window: number | undefined): LogEntry[] {
  return window === undefined ? [...entries] : entries.slice(Math.max(0, entries.length - window));
}

/**
 * Whether the context's last turn gives its sentence to the new one. A turn can end on a turn word alone, a bodiless
 * utterance; when the parse puts the new turn's first body in that utterance, the turn word's own sentence is gone from
 * the combined parse. That turn stays its own entry, now with no sentence, and the new turn's sentences are counted
 * from it. A call alone keeps its sentence: the body after it starts its own utterance (sentence-linkers.md#past-a-period).
 */
function absorbsCall(log: Log, context: readonly LogEntry[], parsed: ParseResult, tables: ClassifyTables): boolean {
  if (!context.length || log.parse?.utterances.at(-1)?.bodies.length !== 0) return false;
  const alone = parseWithTables(transcript(context), tables);
  const last = alone.utterances.length - 1;
  return alone.utterances[last]?.bodies.length === 0 && (parsed.utterances[last]?.bodies.length ?? 0) > 0;
}

/** The context with its last turn's sentence handed on, when the new turn absorbs a call. */
function handOn(context: readonly LogEntry[]): LogEntry[] {
  const last = context[context.length - 1]!;
  return [...context.slice(0, -1), { ...last, sentences: { first: last.sentences?.first ?? 0, count: (last.sentences?.count ?? 1) - 1 } }];
}

/** Add one turn: parse it with the window before it; a turn that does not parse, or holds no sentence, is rejected. */
export function appendTurn(log: Log, turn: Turn, tables: ClassifyTables): Log {
  let context = windowOf(log.entries, log.options.window);
  let parsed: ParseResult;
  try {
    parsed = parseWithTables(transcript([...context, turn]), tables);
  } catch (error) {
    return { ...log, rejected: [...log.rejected, { ...turn, error: error instanceof Error ? error.message : String(error) }] };
  }
  let entries = log.entries;
  if (turn.text.trim() && absorbsCall(log, context, parsed, tables)) {
    const handed = handOn(context);
    entries = [...entries.slice(0, -1), handed[handed.length - 1]!];
    context = handed;
  }
  const before = context.reduce((n, e) => n + (e.sentences?.count ?? 0), 0);
  const count = (turn.text.trim() ? sentenceIndex(parsed).size : 0) - before;
  if (count < 1) return { ...log, rejected: [...log.rejected, { ...turn, error: "the turn holds no sentence" }] };
  return reread(log, [...entries, { ...turn, readings: [] }], count, tables);
}

/** Read the window again, with the new turn last, and hand each turn in it its readings. */
function reread(log: Log, entries: LogEntry[], lastCount: number, tables: ClassifyTables): Log {
  const window = log.options.window;
  const inWindow = window === undefined ? entries : entries.slice(Math.max(0, entries.length - window - 1));
  const counts = inWindow.map((e) => (e === entries[entries.length - 1] ? lastCount : (e.sentences?.count ?? 0)));
  const speakers = inWindow.flatMap((e, i) => Array<string>(counts[i]!).fill(e.speaker));
  const parse = parseWithTables(transcript(inWindow), tables, { speakers });
  const readings = readParse(parse, { tables, text: log.options.text ?? "t" });
  const index = sentenceIndex(parse);
  const at = (r: Reading): number => index.get(`${r.source.utterance}.${r.source.body}`) ?? -1;
  let first = 0;
  const out = entries.map((entry): LogEntry => {
    if (!inWindow.includes(entry)) {
      const { sentences: _gone, ...rest } = entry;
      return { ...rest, readings: [] };
    }
    const count = entry === entries[entries.length - 1] ? lastCount : (entry.sentences?.count ?? 0);
    const range = { first, count };
    first += count;
    return { ...entry, sentences: range, readings: readings.filter((r) => at(r) >= range.first && at(r) < range.first + count) };
  });
  return { ...log, entries: out, parse, readings };
}

export type QuestionOptions = {
  /** Who asks: the carried frames are kept per speaker. Unset: a speaker of its own, not one of the log's. */
  speaker?: string;
  /** The text id that starts every reading id of the question. */
  text?: string;
};

/**
 * Read a question against the log the way the log reads a new turn: parsed after the log's window, so the resolver binds
 * its pronouns to the log's terms (a resume with nothing earlier in the question's own text, pronouns.md#resume-r). The
 * log does not change. Returns the question's top-level readings, in text order; it throws when the text does not parse.
 */
export function readQuestion(log: Log, text: string, tables: ClassifyTables, options: QuestionOptions = {}): Reading[] {
  let context = windowOf(log.entries, log.options.window).filter((e) => e.sentences);
  const sized = parseWithTables(transcript([...context, { speaker: "", at: 0, text }]), tables);
  if (text.trim() && absorbsCall(log, context, sized, tables)) context = handOn(context);
  const before = context.reduce((n, e) => n + e.sentences!.count, 0);
  const count = sentenceIndex(sized).size - before;
  if (count < 1) return [];
  const speakers = [...context.flatMap((e) => Array<string>(e.sentences!.count).fill(e.speaker)), ...Array<string>(count).fill(options.speaker ?? "\u0000question")];
  const parse = parseWithTables(transcript([...context, { speaker: "", at: 0, text }]), tables, { speakers });
  const index = sentenceIndex(parse);
  const readings = readParse(parse, { tables, text: options.text ?? "q" });
  return readings.filter((r) => (index.get(`${r.source.utterance}.${r.source.body}`) ?? -1) >= before);
}

/** A log of the given turns, in order. */
export function buildLog(turns: readonly Turn[], tables: ClassifyTables, options: LogOptions = {}): Log {
  return turns.reduce((log, turn) => appendTurn(log, turn, tables), emptyLog(options));
}

/** The turn a top-level reading of the log belongs to. */
export function entryOf(log: Log, reading: Reading): LogEntry | undefined {
  return log.entries.find((e) => e.readings.includes(reading));
}

/**
 * Who said each sentence of the log's parse, by utterance and body index.
 */
export function sentenceSpeakers(log: Log): { utterance: number; body: number; speaker: string }[] {
  if (!log.parse) return [];
  const speakers = log.entries.flatMap((e) => (e.sentences ? Array<string>(e.sentences.count).fill(e.speaker) : []));
  return [...sentenceIndex(log.parse)].map(([key, i]) => {
    const [utterance, body] = key.split(".").map(Number) as [number, number];
    return { utterance, body, speaker: speakers[i]! };
  });
}
