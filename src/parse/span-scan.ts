const POS = new Set(["z", "d", "b", "v", "g", "w", "h", "x", "j"]);
const OPEN_CLOSE: Record<string, string> = {
  "[": "]",
  "{": "}",
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

function skipMarks(text: string, i: number): number {
  while (i < text.length && (text[i] === "@" || text[i] === "~")) i += 1;
  return i;
}

/**
 * If `start` begins a writing-span atom (`d[…]`, `h(…)`, `z@<Sam>`, `@<Sam>`),
 * return the index after the closing bracket.
 */
export function writingSpanEnd(text: string, start: number): number | undefined {
  let i = start;
  if (i >= text.length) return undefined;

  if (POS.has(text[i]!) && i + 1 < text.length) {
    i += 1;
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

/** Word tokens: writing spans stay whole; `^` skipped; trailing `.?!` peeled. */
export function scanWordTokens(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const tokens: string[] = [];
  let i = 0;
  while (i < trimmed.length) {
    while (i < trimmed.length && /\s/.test(trimmed[i]!)) i += 1;
    if (i >= trimmed.length) break;
    if (trimmed[i] === "^") {
      i += 1;
      continue;
    }
    const spanEnd = writingSpanEnd(trimmed, i);
    if (spanEnd !== undefined) {
      tokens.push(trimmed.slice(i, spanEnd));
      i = spanEnd;
      continue;
    }
    let j = i;
    while (j < trimmed.length && !/\s/.test(trimmed[j]!) && trimmed[j] !== "^") j += 1;
    const word = peelPunct(trimmed.slice(i, j));
    if (word) tokens.push(word);
    i = j;
  }
  return tokens;
}
