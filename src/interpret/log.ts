/**
 * The log: readings in order, each with who said it and when (docs/meta/interpreter.md#terms, **log**).
 *
 * A session reads each new turn together with the transcript so far (or the host's window of it), so the resolver's
 * bindings cross turns with no parser change. The same turns always give the same log. A turn that does not parse adds
 * nothing and is reported in `rejected`.
 *
 * A sentence is one body of an utterance (`/y/` turns split utterances, periods split bodies), the unit a top-level
 * reading reads; a turn holds a run of them, so its range counts sentences, not utterances.
 *
 * Speakers: the parse has no speakers, so the resolve stage's carried frames (`ResolveInfo.carried`) still treat the
 * transcript as one speaker (evidentiality.md#carry-forward says another speaker's reply neither takes nor ends a carried
 * frame). {@link sentenceSpeakers} is the per-sentence list the resolve stage needs once it takes speakers.
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

const transcript = (turns: readonly Turn[]): string => turns.map((t) => t.text.trim()).join(" ");

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

/** Add one turn: parse it with the window before it; a turn that does not parse, or holds no sentence, is rejected. */
export function appendTurn(log: Log, turn: Turn, tables: ClassifyTables): Log {
  const context = windowOf(log.entries, log.options.window);
  const before = context.reduce((n, e) => n + (e.sentences?.count ?? 0), 0);
  let parsed: ParseResult;
  try {
    parsed = parseWithTables(transcript([...context, turn]), tables);
  } catch (error) {
    return { ...log, rejected: [...log.rejected, { ...turn, error: error instanceof Error ? error.message : String(error) }] };
  }
  const count = (turn.text.trim() ? sentenceIndex(parsed).size : 0) - before;
  if (count < 1) return { ...log, rejected: [...log.rejected, { ...turn, error: "the turn holds no sentence" }] };
  return reread(log, [...log.entries, { ...turn, readings: [] }], count, tables);
}

/** Read the window again, with the new turn last, and hand each turn in it its readings. */
function reread(log: Log, entries: LogEntry[], lastCount: number, tables: ClassifyTables): Log {
  const window = log.options.window;
  const inWindow = window === undefined ? entries : entries.slice(Math.max(0, entries.length - window - 1));
  const parse = parseWithTables(transcript(inWindow), tables);
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

/** A log of the given turns, in order. */
export function buildLog(turns: readonly Turn[], tables: ClassifyTables, options: LogOptions = {}): Log {
  return turns.reduce((log, turn) => appendTurn(log, turn, tables), emptyLog(options));
}

/** The turn a top-level reading of the log belongs to. */
export function entryOf(log: Log, reading: Reading): LogEntry | undefined {
  return log.entries.find((e) => e.readings.includes(reading));
}

/**
 * Who said each sentence of the log's parse, by utterance and body index: what the resolve stage needs to keep carried
 * frames per speaker.
 */
export function sentenceSpeakers(log: Log): { utterance: number; body: number; speaker: string }[] {
  if (!log.parse) return [];
  const speakers = log.entries.flatMap((e) => (e.sentences ? Array<string>(e.sentences.count).fill(e.speaker) : []));
  return [...sentenceIndex(log.parse)].map(([key, i]) => {
    const [utterance, body] = key.split(".").map(Number) as [number, number];
    return { utterance, body, speaker: speakers[i]! };
  });
}
