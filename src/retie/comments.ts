/**
 * Backticked Ageben in source comments (`//`, `/* *\/`, JSDoc), retied like a doc code span: each
 * comment goes through the Markdown pass, so only spans the doc lint reads as Ageben move. Words
 * outside backticks and English names are never touched: a comment states the rule, not a house name.
 */
import ts from "typescript";

import { rewriteMarkdown, type RetiedSpan, type RetieReview } from "./markdown.js";
import { fileRetieContext, type SourceRetieContext } from "./source.js";
import type { RetieChange } from "./tokens.js";

export type SourceComment = { index: number; text: string };

/** Comments in a TypeScript body, each once, in source order. */
function scriptComments(source: string, fileName: string): SourceComment[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const seen = new Map<number, SourceComment>();
  const add = (ranges: ts.CommentRange[] | undefined) => {
    for (const range of ranges ?? []) {
      if (!seen.has(range.pos)) seen.set(range.pos, { index: range.pos, text: source.slice(range.pos, range.end) });
    }
  };
  // Every comment is trivia before some token: leading after a line break, trailing on the token's own line.
  const visit = (node: ts.Node) => {
    const at = node.getFullStart();
    add(ts.getLeadingCommentRanges(source, at));
    add(ts.getTrailingCommentRanges(source, at));
    for (const child of node.getChildren(file)) visit(child);
  };
  visit(file);
  return [...seen.values()].sort((a, b) => a.index - b.index);
}

/** Comments in a source file; for a `.vue` file, those in its `<script>` blocks. */
export function sourceComments(source: string, fileName = "source.ts"): SourceComment[] {
  if (!fileName.endsWith(".vue")) return scriptComments(source, fileName);
  const out: SourceComment[] = [];
  for (const match of source.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/g)) {
    const bodyAt = match.index! + match[1]!.length;
    for (const comment of scriptComments(match[2]!, "script.ts")) out.push({ ...comment, index: comment.index + bodyAt });
  }
  return out;
}

export type CommentRetieResult = {
  text: string;
  changes: RetieChange[];
  reviews: RetieReview[];
  /** Retied code spans, for the same verification as a doc's. */
  spans: RetiedSpan[];
};

/** Identifiers that spell like Ageben but name tooling (`ageben` fences, `lint:ageben`). */
const SOURCE_IDENTIFIERS = ["ageben"];

/** Retie the backticked Ageben in `source`'s comments. A test's own fixture roots stay, as in its literals. */
export function rewriteSourceComments(source: string, fileName: string, ctx: SourceRetieContext): CommentRetieResult {
  const fileCtx = fileRetieContext(source, fileName, ctx);
  const tables = { old: fileCtx.tables, current: fileCtx.current ?? fileCtx.tables };
  const keep = new Set([...(fileCtx.keep ?? []), ...SOURCE_IDENTIFIERS]);
  const changes: RetieChange[] = [];
  const reviews: RetieReview[] = [];
  const spans: RetiedSpan[] = [];
  let text = "";
  let at = 0;
  for (const comment of sourceComments(source, fileName)) {
    if (!comment.text.includes("`")) continue;
    const result = rewriteMarkdown(comment.text, fileCtx.map, tables, { deferFollow: true, english: fileCtx.english, keep });
    text += source.slice(at, comment.index) + result.text;
    at = comment.index + comment.text.length;
    for (const change of result.changes) changes.push({ ...change, index: change.index + comment.index });
    // Prose words in a comment are English: only code spans are reviewed.
    for (const review of result.reviews) {
      if (!/prose word/.test(review.reason)) reviews.push({ ...review, index: review.index + comment.index });
    }
    for (const span of result.spans) spans.push({ ...span, index: span.index + comment.index });
  }
  return { text: text + source.slice(at), changes, reviews, spans };
}
