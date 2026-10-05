const POS = new Set(["z", "d", "b", "v", "g", "w", "h", "x", "y"]);
const OPEN_CLOSE: Record<string, string> = {
  "[": "]",
  "(": ")",
  "<": ">",
};

/** Index just after a paired span starting at `openAt` (the opening bracket). */
export function scanPairedEnd(text: string, openAt: number): number | undefined {
  const open = text[openAt];
  if (!open) return undefined;
  const close = OPEN_CLOSE[open];
  if (!close) return undefined;

  if (open === "<") {
    const gt = text.indexOf(">", openAt + 1);
    return gt < 0 ? undefined : gt + 1;
  }

  let depth = 1;
  let i = openAt + 1;
  while (i < text.length) {
    const c = text[i]!;
    if (c === "<") {
      const inner = scanPairedEnd(text, i);
      if (inner === undefined) return undefined;
      i = inner;
      continue;
    }
    if (c === open) {
      depth += 1;
      i += 1;
      continue;
    }
    if (c === close) {
      depth -= 1;
      i += 1;
      if (depth === 0) return i;
      continue;
    }
    i += 1;
  }
  return undefined;
}

/**
 * Length of a leading tone mark at `i`, or 0. A mark is a stack of `! ? % & ;` in any order, each
 * at most twice (`!!`, `?!`, `&;`, `%?!`); the longest such prefix of the run counts.
 */
export function toneMarkLength(text: string, i: number): number {
  const seen = new Map<string, number>();
  let j = i;
  for (; j < text.length && "!?%&;".includes(text[j]!); j += 1) {
    const count = (seen.get(text[j]!) ?? 0) + 1;
    if (count > 2) break;
    seen.set(text[j]!, count);
  }
  return j - i;
}

/** Length of the run of tone-mark characters at `i` (valid mark or not), or 0. */
export function toneRunLength(text: string, i: number): number {
  let j = i;
  while (j < text.length && "!?%&;".includes(text[j]!)) j += 1;
  return j - i;
}

function skipMarks(text: string, i: number): number {
  // `^` only opens the instance mark `^@` (spans.md#when-required).
  while (i < text.length && (text[i] === "@" || text[i] === "~" || text.startsWith("^@", i))) i += text[i] === "^" ? 2 : 1;
  return i;
}

/**
 * If `start` begins a writing-span atom (`d[…]`, `th(…)`, `z@<Sam>`, `@<Sam>`),
 * return the index after the closing bracket.
 */
export function writingSpanEnd(text: string, start: number): number | undefined {
  let i = start;
  if (i >= text.length) return undefined;

  const posLen = text.startsWith("th", i) ? 2 : POS.has(text[i]!) ? 1 : 0;
  if (posLen > 0 && i + posLen < text.length) {
    i += posLen;
    i = skipMarks(text, i);
    if (text[i] && text[i]! in OPEN_CLOSE) {
      return scanPairedEnd(text, i);
    }
    return undefined;
  }

  i = skipMarks(text, start);
  if (i > start && text[i] === "<") {
    return scanPairedEnd(text, i);
  }
  if (text[start] === "<") {
    return scanPairedEnd(text, start);
  }
  return undefined;
}

function peelPunct(chunk: string): string {
  if (chunk.length > 1 && ".?!".includes(chunk.at(-1)!)) return chunk.slice(0, -1);
  return chunk;
}

/** Word tokens: writing spans stay whole; island edges skipped; trailing `.?!` peeled. */
export function scanWordTokens(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const tokens: string[] = [];
  let i = 0;
  while (i < trimmed.length) {
    while (i < trimmed.length && /\s/.test(trimmed[i]!)) i += 1;
    if (i >= trimmed.length) break;
    if (trimmed[i] === "{" || trimmed[i] === "}") {
      i += 1;
      continue;
    }
    const tone = toneMarkLength(trimmed, i);
    if (tone) {
      i += tone;
      continue;
    }
    const spanEnd = writingSpanEnd(trimmed, i);
    if (spanEnd !== undefined) {
      tokens.push(trimmed.slice(i, spanEnd));
      i = spanEnd;
      // A sentence mark right after the span is peeled, as it is after any other word.
      let mark = i;
      while (mark < trimmed.length && ".?!".includes(trimmed[mark]!)) mark += 1;
      if (mark > i && (mark >= trimmed.length || /\s/.test(trimmed[mark]!))) i = mark;
      continue;
    }
    let j = i;
    while (j < trimmed.length && !/\s/.test(trimmed[j]!) && trimmed[j] !== "{" && trimmed[j] !== "}") j += 1;
    const word = peelPunct(trimmed.slice(i, j));
    if (word) tokens.push(word);
    i = j;
  }
  return tokens;
}

/**
 * Whitespace-separated chunks of an utterance, with each written span kept whole (a span may hold spaces)
 * and any leading tone mark or trailing sentence mark left on its chunk.
 */
export function scanChunks(text: string): { text: string; start: number }[] {
  const chunks: { text: string; start: number }[] = [];
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i]!)) {
      i += 1;
      continue;
    }
    const start = i;
    let j = i + toneRunLength(text, i);
    const spanEnd = writingSpanEnd(text, j);
    if (spanEnd !== undefined) j = spanEnd;
    while (j < text.length && !/\s/.test(text[j]!)) j += 1;
    chunks.push({ text: text.slice(start, j), start });
    i = j;
  }
  return chunks;
}
