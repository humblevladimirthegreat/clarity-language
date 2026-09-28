import { peelWordChunk } from "../parse/peel.js";
import { writingSpanEnd } from "../parse/span-scan.js";
import { classifiedShape, hasClosedOverlay, type ClassifyTables } from "../parse/classify.js";
import type { MorphWord } from "../parse/types.js";
import { loadDefaultTables, parse } from "../parse/index.js";
import { parseWord } from "../parse/word.js";

import { retieCore } from "./rebuild.js";
import { antecedentStemRoots, contentStemRoots, type ResumeScope, type StemOccurrence } from "./resume.js";

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

/** `index` is where the word starts in the page, when the caller knows it. */
export type CoreRewrite = (core: string, index?: number) => string | null;

const TRAILING_SENTENCE = new Set([".", "?", "!", ",", ":", ";", '"', "'", "`"]);

export const peelChunk = peelWordChunk;

export function forEachPlainChunk(
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

export function rewritePlainTokens(
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
    const next = rewriteCore(core, index + prefix.length);
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
/** Where a code chunk came from, for callers that classify whole spans. */
export type CodeSpanMeta = {
  kind: "inline" | "fence";
  /** Fence info string (` ```text ` → `text`); empty for inline code. */
  info: string;
  /** Body of an HTML comment that sits right before the span, with only whitespace between. */
  marker?: string;
};

export function transformMarkdown(
  input: string,
  baseIndex: number,
  transformCode: (text: string, index: number, meta: CodeSpanMeta) => string,
  transformProse: (text: string, index: number) => string,
): string {
  let out = "";
  let i = 0;
  let comment: { body: string; end: number } | undefined;
  const markerAt = (at: number): string | undefined =>
    comment && input.slice(comment.end, at).trim() === "" ? comment.body : undefined;

  const take = (end: number) => {
    out += input.slice(i, end);
    i = end;
  };

  while (i < input.length) {
    if (input.startsWith("<!--", i)) {
      const close = input.indexOf("-->", i + 4);
      const end = close < 0 ? input.length : close + 3;
      comment = { body: input.slice(i + 4, close < 0 ? input.length : close).trim(), end };
      take(end);
      continue;
    }

    if (input.startsWith("```", i) || input.startsWith("~~~", i)) {
      const fence = input.slice(i, i + 3);
      const openLineEnd = input.indexOf("\n", i);
      const fenceMeta: CodeSpanMeta = {
        kind: "fence",
        info: input.slice(i + 3, openLineEnd < 0 ? input.length : openLineEnd).trim(),
        marker: markerAt(i),
      };
      if (openLineEnd < 0) {
        take(input.length);
        continue;
      }
      const closeAt = input.indexOf(`\n${fence}`, openLineEnd);
      if (closeAt < 0) {
        out += input.slice(i, openLineEnd + 1);
        out += transformCode(input.slice(openLineEnd + 1), baseIndex + openLineEnd + 1, fenceMeta);
        i = input.length;
        continue;
      }
      out += input.slice(i, openLineEnd + 1);
      out += transformCode(input.slice(openLineEnd + 1, closeAt), baseIndex + openLineEnd + 1, fenceMeta);
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
      out += transformCode(input.slice(i + 1, close), baseIndex + i + 1, {
        kind: "inline",
        info: "",
        marker: markerAt(i),
      });
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

export type MarkdownCodeToken = {
  chunk: string;
  index: number;
  /** Ordinal of the code span or fenced block holding this token. */
  block: number;
};

export type MarkdownCodeSpan = CodeSpanMeta & { text: string; index: number };

/** Each inline code span and fenced block as a whole (not prose, comments, or URLs). */
export function forEachMarkdownCodeSpan(input: string, visit: (span: MarkdownCodeSpan) => void): void {
  transformMarkdown(
    input,
    0,
    (text, index, meta) => {
      visit({ ...meta, text, index });
      return text;
    },
    (text) => text,
  );
}

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

export function resumeRewrite(
  map: ReadonlyMap<string, string>,
  stems: ReadonlySet<string>,
  codeSpan?: string,
  tables?: ClassifyTables,
  occurrences?: readonly StemOccurrence[],
): CoreRewrite {
  const boundByRaw = codeSpan ? contentResumeBinds(codeSpan, tables) : null;
  const seen = new Map<string, number>();
  const boundFor = (raw: string): string[] | undefined => {
    const list = boundByRaw?.get(raw);
    if (!list || list.length === 0) return undefined;
    const n = seen.get(raw) ?? 0;
    seen.set(raw, n + 1);
    return list[n];
  };
  // `tables` knows the old spellings, so an overlay -r (`therar` TOLD.weak) is told from a resume.
  const isOverlay = tables ? (word: MorphWord) => hasClosedOverlay(word, tables) : undefined;
  const reshape = tables ? (word: MorphWord) => classifiedShape(word, tables) : undefined;
  return (core, at) => {
    const boundAntecedentRoots = boundFor(core);
    const scope: ResumeScope = boundAntecedentRoots
      ? { stems, boundAntecedentRoots, boundFor, occurrences, at, isOverlay, reshape }
      : { stems, boundFor, occurrences, at, isOverlay, reshape };
    return retieCore(core, map, scope);
  };
}

export function collectContentStems(input: string): Set<string> {
  return new Set(collectStemOccurrences(input).map((o) => o.root));
}

/** Each non-resume content root on the page, with where its word starts, in page order. */
export function collectStemOccurrences(input: string): StemOccurrence[] {
  const out: StemOccurrence[] = [];
  const addChunk = (chunk: string, index: number) => {
    const { core } = peelChunk(chunk);
    if (!core) {
      return chunk;
    }
    try {
      for (const root of antecedentStemRoots(parseWord(core))) {
        out.push({ root, index });
      }
    } catch {
      // not an Agalan word
    }
    return chunk;
  };
  const visit = (text: string, index: number) => {
    forEachPlainChunk(text, index, addChunk);
    return text;
  };
  transformMarkdown(input, 0, visit, visit);
  return out;
}

/** `tables` should know the old roots (see `bridgeTables`), or binds to moved roots are lost. */
function contentResumeBinds(span: string, tables = loadDefaultTables()): Map<string, string[][]> | null {
  try {
    const resolved = parse(span, tables).resolve;
    if (!resolved) {
      return null;
    }
    const byRaw = new Map<string, string[][]>();
    for (const bind of resolved.anaphors) {
      if (bind.kind !== "content" || !bind.antecedent) {
        continue;
      }
      const raw = bind.pronoun.raw;
      // A resume bound to an earlier resume (`zazar … zazar`) follows that one's antecedent.
      const chained = bind.antecedent.ending === "r" ? byRaw.get(bind.antecedent.raw)?.at(-1) : undefined;
      const roots = chained ?? contentStemRoots(bind.antecedent);
      if (roots.length === 0) {
        continue;
      }
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
