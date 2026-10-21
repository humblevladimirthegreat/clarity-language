/**
 * The sandbox's turn log: each line typed, its parse, and what happened. It stays in the browser; the
 * player exports it as JSON, and it picks the next handlers, overrides, error-table rows and generator shapes.
 */
import type { ErrorCard, GateCheck, Line, Outcome, TurnResult } from "./types.js";

export type LogLine = {
  kind: Line["kind"];
  agebon?: string;
  gloss?: string;
  english?: string;
  /** Who spoke, for speech, recasts and refusals in character. */
  speaker?: string;
  parts?: string[];
  card?: ErrorCard;
  gate?: GateCheck;
  options?: string[];
};

export type LogEntry = {
  turn: number;
  at: string;
  input: string;
  outcome: Outcome;
  gloss?: string;
  /** The Agebon that ran, when a recast replaced the input. */
  ran?: string;
  constructions?: string[];
  lines: LogLine[];
};

function logLine(line: Line): LogLine {
  switch (line.kind) {
    case "player":
      return { kind: line.kind, agebon: line.agebon, ...(line.gloss ? { gloss: line.gloss } : {}) };
    case "speech":
      return { kind: line.kind, speaker: line.speaker, agebon: line.spoken.agebon, gloss: line.spoken.gloss, english: line.spoken.english, gate: line.gate };
    case "narration":
    case "refusal":
      return {
        kind: line.kind,
        english: line.english,
        ...("speaker" in line && line.speaker ? { speaker: line.speaker } : {}),
        ...(line.spoken ? { agebon: line.spoken.agebon, gloss: line.spoken.gloss } : {}),
        ...(line.gate ? { gate: line.gate } : {}),
      };
    case "recast":
      return { kind: line.kind, agebon: line.spoken.agebon, gloss: line.spoken.gloss, ...(line.speaker ? { speaker: line.speaker } : {}), ...(line.why ? { english: line.why } : {}) };
    case "choice":
      return { kind: line.kind, options: line.options.map((o) => o.agebon) };
    case "beyond":
      return { kind: line.kind, english: line.english, parts: line.parts };
    case "confused":
      return { kind: line.kind, card: line.card, ...(line.speaker ? { speaker: line.speaker } : {}) };
    case "note":
    case "quest":
      return { kind: line.kind, english: line.english };
  }
}

export function logEntry(result: TurnResult, turn: number, at: Date = new Date()): LogEntry {
  return {
    turn,
    at: at.toISOString(),
    input: result.input,
    outcome: result.outcome,
    ...(result.gloss ? { gloss: result.gloss } : {}),
    ...(result.ran ? { ran: result.ran } : {}),
    ...(result.constructions ? { constructions: result.constructions } : {}),
    lines: result.lines.map(logLine),
  };
}

/** The log as a JSON file, with what the session was run with. */
export function exportTurnLog(entries: readonly LogEntry[], meta: { position: number | "everything"; build?: string }): string {
  return `${JSON.stringify({ kind: "agebon-sandbox-turn-log", version: 1, ...meta, turns: entries }, null, 2)}\n`;
}
