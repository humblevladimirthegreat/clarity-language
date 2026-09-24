import { writingSpanEnd } from "../parse/span-scan.js";
import { loadDefaultTables, parse } from "../parse/index.js";
import { parseWord } from "../parse/word.js";

import { retieCore } from "./rebuild.js";
import { antecedentStemRoots, contentStemRoots, type ResumeScope } from "./resume.js";

export { retieCore } from "./rebuild.js";

export type RetieChange = {
  from: string;
  to: string;
  index: number;
};

export type RewriteMarkdownResult = {
  text: string;
  changes: RetieChange[];
};

export type CoreRewrite = (core: string) => string | null;

const TRAILING_SENTENCE = new Set([".", "?", "!", ",", ":", ";", '"', "'", "`"]);
const LEADING_QUOTE = new Set(['"', "'", "`"]);

export function peelChunk(chunk: string): { prefix: string; core: string; suffix: string } {
  const spanEnd = writingSpanEnd(chunk, 0);
  if (spanEnd !== undefined && spanEnd > 0) {
    return { prefix: "", core: chunk.slice(0, spanEnd), suffix: chunk.slice(spanEnd) };
  }

  let prefix = "";
  let suffix = "";
  let core = chunk;

  while (core.length > 0 && TRAILING_SENTENCE.has(core.at(-1)!)) {
    suffix = core.at(-1)! + suffix;
    core = core.slice(0, -1);
  }
  while (core.length > 0 && LEADING_QUOTE.has(core[0]!)) {
    prefix += core[0]!;
    core = core.slice(1);
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

function forEachPlainChunk(
  text: string,
  baseIndex: number,
  visit: (chunk: string, index: number) => string,
): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i]!)) {
      out += text[i];
      i += 1;
      continue;
    }
    const spanEnd = writingSpanEnd(text, i);
    let end = spanEnd ?? i;
    if (spanEnd === undefined) {
      while (end < text.length && !/\s/.test(text[end]!)) {
        end += 1;
      }
    } else {
      while (end < text.length && TRAILING_SENTENCE.has(text[end]!)) {
        end += 1;
      }
    }
    const chunk = text.slice(i, end);
    out += visit(chunk, baseIndex + i);
    i = end;
  }
  return out;
}

function rewritePlainTokens(
  text: string,
  rewriteCore: CoreRewrite,
  baseIndex: number,
  changes: RetieChange[],
): string {
  return forEachPlainChunk(text, baseIndex, (chunk, index) => {
    const { prefix, core, suffix } = peelChunk(chunk);
    if (!core) {
      return chunk;
    }
    const next = rewriteCore(core);
    if (next == null || next === core) {
      return chunk;
    }
    changes.push({ from: core, to: next, index: index + prefix.length });
    return `${prefix}${next}${suffix}`;
  });
}

/**
 * Walk Markdown, rewriting fenced / inline code via `transformCode` and
 * other text via `transformProse`. HTML comments are copied unchanged.
 * Link labels are walked with the same pair so nested backticks still count.
 * Link targets are copied unchanged.
 */
function transformMarkdown(
  input: string,
  baseIndex: number,
  transformCode: (text: string, index: number) => string,
  transformProse: (text: string, index: number) => string,
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
        out += transformCode(input.slice(openLineEnd + 1), baseIndex + openLineEnd + 1);
        i = input.length;
        continue;
      }
      out += input.slice(i, openLineEnd + 1);
      out += transformCode(input.slice(openLineEnd + 1, closeAt), baseIndex + openLineEnd + 1);
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
      out += transformCode(input.slice(i + 1, close), baseIndex + i + 1);
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
        out += transformMarkdown(
          parsed.label,
          baseIndex + parsed.labelIndex,
          transformCode,
          transformProse,
        );
        out += parsed.afterLabel;
        i = parsed.end;
        continue;
      }
    }

    const next = nextMarkup(input, i);
    out += transformProse(input.slice(i, next), baseIndex + i);
    i = next;
  }

  return out;
}

function scanMarkdown(
  input: string,
  rewriteCore: CoreRewrite,
  baseIndex: number,
  changes: RetieChange[],
): string {
  const rewrite = (text: string, index: number) =>
    rewritePlainTokens(text, rewriteCore, index, changes);
  return transformMarkdown(input, baseIndex, rewrite, rewrite);
}

export type MarkdownCodeToken = {
  chunk: string;
  index: number;
  /** Ordinal of the code span or fenced block holding this token. */
  block: number;
};

/** Whitespace tokens inside inline backticks and fenced code (not prose, comments, or URLs). */
export function forEachMarkdownCodeToken(
  input: string,
  visit: (token: MarkdownCodeToken) => void,
): void {
  let block = -1;
  transformMarkdown(
    input,
    0,
    (text, index) => {
      block += 1;
      forEachPlainChunk(text, index, (chunk, chunkIndex) => {
        visit({ chunk, index: chunkIndex, block });
        return chunk;
      });
      return text;
    },
    (text) => text,
  );
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

export function rewriteMarkdownCores(
  input: string,
  rewriteCore: CoreRewrite,
): RewriteMarkdownResult {
  const changes: RetieChange[] = [];
  const text = scanMarkdown(input, rewriteCore, 0, changes);
  return { text, changes };
}

export function rewriteMarkdown(input: string, map: ReadonlyMap<string, string>): RewriteMarkdownResult {
  const stems = collectContentStems(input);
  const changes: RetieChange[] = [];
  const text = transformMarkdown(
    input,
    0,
    (span, index) => rewritePlainTokens(span, resumeRewrite(map, stems, span), index, changes),
    (prose, index) => rewritePlainTokens(prose, resumeRewrite(map, stems), index, changes),
  );
  return { text, changes };
}

function resumeRewrite(
  map: ReadonlyMap<string, string>,
  stems: ReadonlySet<string>,
  codeSpan?: string,
): CoreRewrite {
  const boundByRaw = codeSpan ? contentResumeBinds(codeSpan) : null;
  const seen = new Map<string, number>();
  return (core) => {
    let boundAntecedentRoots: string[] | undefined;
    if (boundByRaw) {
      const list = boundByRaw.get(core);
      if (list && list.length > 0) {
        const n = seen.get(core) ?? 0;
        seen.set(core, n + 1);
        boundAntecedentRoots = list[n];
      }
    }
    const scope: ResumeScope = boundAntecedentRoots
      ? { stems, boundAntecedentRoots }
      : { stems };
    return retieCore(core, map, scope);
  };
}

function collectContentStems(input: string): Set<string> {
  const stems = new Set<string>();
  const addChunk = (chunk: string) => {
    const { core } = peelChunk(chunk);
    if (!core) {
      return chunk;
    }
    try {
      for (const root of antecedentStemRoots(parseWord(core))) {
        stems.add(root);
      }
    } catch {
      // not an Agalan word
    }
    return chunk;
  };
  transformMarkdown(
    input,
    0,
    (text) => {
      forEachPlainChunk(text, 0, addChunk);
      return text;
    },
    (text) => {
      forEachPlainChunk(text, 0, addChunk);
      return text;
    },
  );
  return stems;
}

function contentResumeBinds(span: string): Map<string, string[][]> | null {
  try {
    const resolved = parse(span, loadDefaultTables()).resolve;
    if (!resolved) {
      return null;
    }
    const byRaw = new Map<string, string[][]>();
    for (const bind of resolved.anaphors) {
      if (bind.kind !== "content" || !bind.antecedent) {
        continue;
      }
      const roots = contentStemRoots(bind.antecedent);
      if (roots.length === 0) {
        continue;
      }
      const raw = bind.pronoun.raw;
      const list = byRaw.get(raw);
      if (list) {
        list.push(roots);
      } else {
        byRaw.set(raw, [roots]);
      }
    }
    return byRaw.size > 0 ? byRaw : null;
  } catch {
    return null;
  }
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
