import { parseWord } from "../parse/word.js";
import { isClarityRootShape } from "../word-converter.js";

import { rewriteParsedWord } from "./rebuild.js";

export type RetieChange = {
  from: string;
  to: string;
  index: number;
};

export type RewriteMarkdownResult = {
  text: string;
  changes: RetieChange[];
};

/** Rewrite one orthographic word. Never substitutes inside a larger token. */
export function retieCore(core: string, map: ReadonlyMap<string, string>): string | null {
  if (!core || map.size === 0) {
    return null;
  }
  const bare = map.get(core);
  if (bare && isClarityRootShape(core)) {
    return bare === core ? null : bare;
  }
  try {
    return rewriteParsedWord(parseWord(core), map);
  } catch {
    return null;
  }
}

const TRAILING_PUNCT = new Set([".", "?", "!", ",", ":", ";", ")", "]", "}", ">", '"', "'"]);
const LEADING_PUNCT = new Set(["(", "[", "{", "<", '"', "'"]);

export function peelChunk(chunk: string): { prefix: string; core: string; suffix: string } {
  let prefix = "";
  let suffix = "";
  let core = chunk;

  while (core.length > 0 && TRAILING_PUNCT.has(core.at(-1)!)) {
    suffix = core.at(-1)! + suffix;
    core = core.slice(0, -1);
  }
  while (core.length > 0 && LEADING_PUNCT.has(core[0]!)) {
    prefix += core[0]!;
    core = core.slice(1);
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

function rewriteWhitespaceTokens(
  text: string,
  map: ReadonlyMap<string, string>,
  baseIndex: number,
  changes: RetieChange[],
): string {
  return text.replace(/[^\s]+/g, (chunk, offset: number) => {
    const { prefix, core, suffix } = peelChunk(chunk);
    if (!core) {
      return chunk;
    }
    const next = retieCore(core, map);
    if (next == null || next === core) {
      return chunk;
    }
    changes.push({ from: core, to: next, index: baseIndex + offset + prefix.length });
    return `${prefix}${next}${suffix}`;
  });
}

function scanMarkdown(
  input: string,
  map: ReadonlyMap<string, string>,
  baseIndex: number,
  changes: RetieChange[],
): string {
  let out = "";
  let i = 0;

  const take = (end: number) => {
    out += input.slice(i, end);
    i = end;
  };

  while (i < input.length) {
    if (input.startsWith("<!--", i)) {
      const close = input.indexOf("-->", i + 4);
      take(close < 0 ? input.length : close + 3);
      continue;
    }

    if (input.startsWith("```", i) || input.startsWith("~~~", i)) {
      const fence = input.slice(i, i + 3);
      const openLineEnd = input.indexOf("\n", i);
      if (openLineEnd < 0) {
        take(input.length);
        continue;
      }
      const closeAt = input.indexOf(`\n${fence}`, openLineEnd);
      if (closeAt < 0) {
        out += input.slice(i, openLineEnd + 1);
        out += rewriteWhitespaceTokens(input.slice(openLineEnd + 1), map, baseIndex + openLineEnd + 1, changes);
        i = input.length;
        continue;
      }
      out += input.slice(i, openLineEnd + 1);
      out += rewriteWhitespaceTokens(input.slice(openLineEnd + 1, closeAt), map, baseIndex + openLineEnd + 1, changes);
      const closeEnd = closeAt + 1 + fence.length;
      out += input.slice(closeAt, closeEnd);
      i = closeEnd;
      continue;
    }

    if (input[i] === "`") {
      const close = input.indexOf("`", i + 1);
      if (close < 0 || input.slice(i + 1, close).includes("\n")) {
        out += "`";
        i += 1;
        continue;
      }
      out += "`";
      out += rewriteWhitespaceTokens(input.slice(i + 1, close), map, baseIndex + i + 1, changes);
      out += "`";
      i = close + 1;
      continue;
    }

    const image = input.startsWith("![", i);
    if (image || input[i] === "[") {
      const parsed = parseInlineLink(input, i, image);
      if (parsed) {
        if (image) {
          out += "!";
        }
        out += "[";
        out += scanMarkdown(parsed.label, map, baseIndex + parsed.labelIndex, changes);
        out += parsed.afterLabel;
        i = parsed.end;
        continue;
      }
    }

    const next = nextMarkup(input, i);
    out += rewriteWhitespaceTokens(input.slice(i, next), map, baseIndex + i, changes);
    i = next;
  }

  return out;
}

function parseInlineLink(
  input: string,
  start: number,
  image: boolean,
): { label: string; labelIndex: number; afterLabel: string; end: number } | null {
  const labelOpen = image ? start + 1 : start;
  if (input[labelOpen] !== "[") {
    return null;
  }
  const labelClose = input.indexOf("]", labelOpen + 1);
  if (labelClose < 0) {
    return null;
  }
  if (input[labelClose + 1] !== "(") {
    return null;
  }
  const targetClose = input.indexOf(")", labelClose + 2);
  if (targetClose < 0) {
    return null;
  }
  return {
    label: input.slice(labelOpen + 1, labelClose),
    labelIndex: labelOpen + 1,
    afterLabel: input.slice(labelClose, targetClose + 1),
    end: targetClose + 1,
  };
}

function nextMarkup(input: string, from: number): number {
  const keys = ["```", "~~~", "<!--", "`", "![", "["] as const;
  let next = input.length;
  for (const key of keys) {
    const at = input.indexOf(key, from);
    if (at >= 0 && at < next) {
      next = at;
    }
  }
  return next === from ? from + 1 : next;
}

export function rewriteMarkdown(input: string, map: ReadonlyMap<string, string>): RewriteMarkdownResult {
  const changes: RetieChange[] = [];
  const text = scanMarkdown(input, map, 0, changes);
  return { text, changes };
}

export function lineNumberAt(text: string, index: number): number {
  let line = 1;
  const end = Math.min(index, text.length);
  for (let i = 0; i < end; i++) {
    if (text[i] === "\n") {
      line += 1;
    }
  }
  return line;
}
