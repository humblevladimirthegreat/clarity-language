import { toneMarkLength, writingSpanEnd } from "./span-scan.js";

export type PeeledChunk = { prefix: string; core: string; suffix: string };

const TRAILING = new Set([".", "?", "!", ",", ":", ";", '"', "'", "`"]);
const LEADING_QUOTE = new Set(['"', "'", "`"]);

/**
 * Split one whitespace chunk into wrapping punctuation and the spelled word.
 * Shared by the doc lint and retie so both read the same word out of a chunk:
 * a writing span at the start stays whole; otherwise trailing punctuation,
 * leading quotes, a tone mark (`!`, `?!`, `&`, …), `( … )` and `*` / `**` emphasis peel off.
 */
export function peelWordChunk(chunk: string): PeeledChunk {
  const spanEnd = writingSpanEnd(chunk, 0);
  if (spanEnd !== undefined && spanEnd > 0) {
    return { prefix: "", core: chunk.slice(0, spanEnd), suffix: chunk.slice(spanEnd) };
  }

  let prefix = "";
  let suffix = "";
  let core = chunk;

  while (core.length > 0 && TRAILING.has(core.at(-1)!)) {
    suffix = core.at(-1)! + suffix;
    core = core.slice(0, -1);
  }
  while (core.length > 0 && LEADING_QUOTE.has(core[0]!)) {
    prefix += core[0]!;
    core = core.slice(1);
  }
  const tone = toneMarkLength(core, 0);
  if (tone && core.length > tone) {
    prefix += core.slice(0, tone);
    core = core.slice(tone);
  }

  if (core.startsWith("(") && core.endsWith(")") && core.length > 2) {
    prefix += "(";
    suffix = `)${suffix}`;
    core = core.slice(1, -1);
  }

  while (core.startsWith("**") && core.endsWith("**") && core.length > 4) {
    prefix += "**";
    suffix = `**${suffix}`;
    core = core.slice(2, -2);
  }
  while (core.startsWith("*") && core.endsWith("*") && core.length > 2 && !core.startsWith("**")) {
    prefix += "*";
    suffix = `*${suffix}`;
    core = core.slice(1, -1);
  }

  return { prefix, core, suffix };
}
