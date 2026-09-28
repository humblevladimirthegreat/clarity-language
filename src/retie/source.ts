/**
 * Retie Agalan held in source code: string literals in `src/` (tests included), `scripts/`
 * and the grammar site. Literals that read as Agalan are rewritten like a doc span; English
 * names that copy a named word follow it. Anything else that still spells an old root is
 * reported, so root tables (house cast, special pronouns, sample fillers) are not left stale.
 */
import ts from "typescript";

import { ENGLISH_IN_CODE, classifyAgalanSpan } from "../lint/agalan-docs.js";
import { fillSelf } from "../learner-name.js";
import type { ClassifyTables } from "../parse/classify.js";
import { parseWord } from "../parse/word.js";

import type { FollowPairs } from "./follow.js";
import { contentStemRoots } from "./resume.js";
import type { RetieReview } from "./markdown.js";
import { collectStemOccurrences, resumeRewrite, rewritePlainTokens, type RetieChange } from "./tokens.js";

export type SourceLiteral = {
  /** Offset of the literal body (after the opening quote). */
  index: number;
  body: string;
};

/**
 * String literals (and template literals without `${…}`) found by the TypeScript parser.
 * For a `.vue` file, pass only a `<script>` body and add its offset. Escaped literals are
 * skipped (their source text is not their value).
 */
export function sourceLiterals(source: string, fileName = "source.ts"): SourceLiteral[] {
  const out: SourceLiteral[] = [];
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const start = node.getStart(file) + 1;
      const body = source.slice(start, node.getEnd() - 1);
      if (!body.includes("\\")) out.push({ index: start, body });
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}

/** Literals in each `<script>` block of a Vue file. */
export function vueLiterals(source: string): SourceLiteral[] {
  const out: SourceLiteral[] = [];
  for (const match of source.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/g)) {
    const bodyAt = match.index! + match[1]!.length;
    for (const literal of sourceLiterals(match[2]!)) out.push({ ...literal, index: literal.index + bodyAt });
  }
  return out;
}

const REWRITE_CLASSES = new Set(["sentence", "phrase", "template", "word"]);

export type SourceRetieResult = {
  text: string;
  changes: RetieChange[];
  reviews: RetieReview[];
};

export type SourceRetieContext = {
  map: ReadonlyMap<string, string>;
  tables: ClassifyTables;
  follow: FollowPairs;
  /** Common English words: a one-word literal that is one of these is reported, not retied. */
  english: ReadonlySet<string>;
  /** Roots published after the retie (a literal spelling one is current, not stale). */
  currentRoots: ReadonlySet<string>;
};

/**
 * Identifiers that spell like an Agalan word but name tooling: the `agalan` fence info string,
 * `lint:agalan`, file names, storage keys. They follow the language's English name, not a root.
 */
const SOURCE_IDENTIFIERS = new Set(["agalan"]);

const NAME_RE = /(?<![A-Za-z])[A-Z][a-z]+(?![A-Za-z])/g;

export function rewriteSourceLiterals(source: string, fileName: string, ctx: SourceRetieContext): SourceRetieResult {
  const changes: RetieChange[] = [];
  const reviews: RetieReview[] = [];
  const isTest = /\.test\.[mc]?ts$/.test(fileName);
  let text = "";
  let at = 0;
  const literals = fileName.endsWith(".vue") ? vueLiterals(source) : sourceLiterals(source, fileName);
  for (const literal of literals) {
    text += source.slice(at, literal.index);
    text += rewriteLiteral(literal, isTest, ctx, changes, reviews);
    at = literal.index + literal.body.length;
  }
  text += source.slice(at);

  // Root-table keys (`{ azawa: "Azawan" }`) are identifiers, not literals: report stale ones.
  for (const match of source.matchAll(/^\s*([a-z]{3,}):/gm)) {
    const key = match[1]!;
    if (ctx.map.has(key) && !ctx.currentRoots.has(key)) {
      reviews.push({ text: key, index: match.index!, reason: `object key spells old root ${key} (now ${ctx.map.get(key)})` });
    }
  }
  return { text, changes, reviews };
}

function isEnglish(word: string, ctx: SourceRetieContext): boolean {
  return ctx.english.has(word) || ENGLISH_IN_CODE.has(word);
}

/**
 * Which literals are rewritten: a sentence, phrase or template with no common English word,
 * or (in a test) one word with a role letter (`zazawan`). Any other one-word literal may be
 * a key or an English label (`"agalan"`, `"one"`), so it is only reported.
 */
function rewritable(body: string, isTest: boolean, ctx: SourceRetieContext): boolean {
  const cls = classifyAgalanSpan(fillSelf(body));
  if (!REWRITE_CLASSES.has(cls)) return false;
  const words = body.match(/(?<![A-Za-z])[a-z]+(?![A-Za-z])/g) ?? [];
  if (words.some((word) => isEnglish(word, ctx))) return false;
  if (cls !== "word") return true;
  if (!isTest) return false;
  try {
    return parseWord(body.trim().replace(/[.?!,]$/, "")).pos !== undefined;
  } catch {
    return false;
  }
}

function rewriteLiteral(
  literal: SourceLiteral,
  isTest: boolean,
  ctx: SourceRetieContext,
  changes: RetieChange[],
  reviews: RetieReview[],
): string {
  const { body, index } = literal;
  if (!/[a-z]/.test(body)) return body;
  let out = body;
  if (rewritable(body, isTest, ctx)) {
    const stems = new Set(collectStemOccurrences(`\`${body}\``).map((o) => o.root));
    out = rewritePlainTokens(body, resumeRewrite(ctx.map, stems, body, ctx.tables), index, changes);
  }
  // English names copied from named words (`"z-Ululon | v-walk"`).
  out = out.replace(NAME_RE, (name, offset: number) => {
    const next = ctx.follow.names.get(name);
    if (next === undefined) return name;
    changes.push({ from: name, to: next, index: index + offset });
    return next;
  });
  if (out === body) {
    for (const match of body.matchAll(/(?<![A-Za-z])[a-z]{3,}(?![A-Za-z])/g)) {
      const word = match[0];
      if (isEnglish(word, ctx) || SOURCE_IDENTIFIERS.has(word)) continue;
      const stale = staleRoot(word, ctx);
      if (stale) {
        reviews.push({
          text: body,
          index: index + match.index!,
          reason: `string literal "${body.length > 60 ? `${body.slice(0, 57)}…` : body}" spells old root ${stale} (now ${ctx.map.get(stale)}); not retied`,
        });
      }
    }
  }
  return out;
}

/** An old root this token spells (as a bare root or inside a parsed word), if it is no longer published. */
function staleRoot(word: string, ctx: SourceRetieContext): string | undefined {
  const moved = (root: string) => ctx.map.has(root) && !ctx.currentRoots.has(root);
  if (moved(word)) return word;
  try {
    return contentStemRoots(parseWord(word)).find(moved);
  } catch {
    return undefined;
  }
}
