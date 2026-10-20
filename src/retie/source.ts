/**
 * Retie Egabon held in source code: string literals in `src/` (tests included), `scripts/`
 * and the grammar site. Literals that read as Egabon are rewritten like a doc span; English
 * names that copy a named word follow it. Anything else that still spells an old root is
 * reported, so root tables (house cast, special pronouns, sample fillers) are not left stale.
 */
import ts from "typescript";

import { ENGLISH_IN_CODE, classifyEgabonSpan } from "../lint/egabon-docs.js";
import { fillSelf } from "../learner-name.js";
import { namedEnglish } from "../closed-roots.js";
import { isEgabonRootShape } from "../root-shape.js";
import type { ClassifyTables } from "../parse/classify.js";
import { parseWord } from "../parse/word.js";

import { followPairs, type FollowPairs } from "./follow.js";
import { retieCore } from "./rebuild.js";
import { contentStemRoots } from "./resume.js";
import { rewriteMarkdown, type RetieReview } from "./markdown.js";
import { resumeRewrite, rewritePlainTokens, type RetieChange } from "./tokens.js";

export type SourceLiteral = {
  /** Offset of the literal body (after the opening quote). */
  index: number;
  body: string;
  /** Has an escape (`\\``): its source text is not its value, so it is decoded before rewriting. */
  escaped?: boolean;
  /** A regular expression body: its escapes (`\|`, `\d`) are read as regex escapes. */
  regex?: boolean;
};

/**
 * String literals and template literal text found by the TypeScript parser: a template with `${…}`
 * gives each text piece between substitutions (`` `zazawan uem ${held}.` `` → `zazawan uem `, `.`).
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
      out.push(body.includes("\\") ? { index: start, body, escaped: true } : { index: start, body });
    } else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      // A head opens with `` ` `` and a middle or tail with `}`; a head or middle closes with `${`, a tail with `` ` ``.
      const start = node.getStart(file) + 1;
      const body = source.slice(start, node.getEnd() - (ts.isTemplateTail(node) ? 1 : 2));
      if (body) out.push(body.includes("\\") ? { index: start, body, escaped: true } : { index: start, body });
    } else if (ts.isRegularExpressionLiteral(node)) {
      // A pattern that quotes Egabon (`/`wonathumer` does not appear/`); flags after the last slash.
      const start = node.getStart(file) + 1;
      const text = source.slice(start - 1, node.getEnd());
      const body = text.slice(1, text.lastIndexOf("/"));
      if (/[a-z]{3,}/.test(body)) out.push({ index: start, body, regex: true, ...(body.includes("\\") ? { escaped: true } : {}) });
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
  /** Words and English names never respelled (the language's own name, renamed by hand). */
  keep?: ReadonlySet<string>;
  /** The lexicon after the retie: with it, a named word's gloss pairs its English names (`Uzuhe`-x-… ). */
  current?: ClassifyTables;
};

/**
 * Identifiers that spell like an Egabon word but name tooling: the `egabon` fence info string,
 * `lint:egabon`, file names, storage keys. They follow the language's English name, not a root.
 */
const SOURCE_IDENTIFIERS = new Set(["egabon"]);

function isKept(word: string, ctx: SourceRetieContext): boolean {
  return SOURCE_IDENTIFIERS.has(word) || (ctx.keep?.has(word) ?? false);
}

const NAME_RE = /(?<![A-Za-z])[A-Z][a-z]+(?![A-Za-z])/g;
const OVERLAY_ID_RE = /^overlay\.([a-z]+)\.([a-z]+)$/;

export function rewriteSourceLiterals(source: string, fileName: string, ctx: SourceRetieContext): SourceRetieResult {
  const isTest = /\.test\.[mc]?ts$/.test(fileName);
  // A test that reads the real lexicon names real roots: its stale spellings are rewritten, not just reported.
  const realLexicon = isTest && REAL_LEXICON_RE.test(source);
  const literals = fileName.endsWith(".vue") ? vueLiterals(source) : sourceLiterals(source, fileName);
  // In a test, a bare old root as a literal (`root: "eye"`, `"abede"`) is a fixture the file defines for itself:
  // words on that root are about the fixture, not the lexicon, so this file never respells them. A test that
  // asserts a real root names it through `CLOSED` instead (`assert.equal(root, CLOSED.walk)`), so it follows.
  // Outside tests, such a literal names a real row (`LANGUAGE_ROOT = "agala"`) and stays reported.
  const fixtures = new Set(
    isTest ? literals.map((literal) => literal.body).filter((body) => /^[a-z]+$/.test(body) && ctx.map.has(body)) : [],
  );
  // A fixture keeps its English name too (`root: "azawa"` and *Azawan* stay together).
  const fixtureNames = new Set([...fixtures].map(namedEnglish));
  const fileCtx =
    fixtures.size > 0
      ? {
          ...ctx,
          map: new Map([...ctx.map].filter(([root]) => !fixtures.has(root))),
          follow: { ...ctx.follow, names: new Map([...ctx.follow.names].filter(([name]) => !fixtureNames.has(name))) },
          keep: new Set([...(ctx.keep ?? []), ...fixtureNames]),
        }
      : ctx;
  const results = literals.map((literal) => rewriteLiteral(literal, isTest, realLexicon, fileCtx));
  keepFileConsistent(results, fileCtx);

  const changes: RetieChange[] = [];
  const reviews: RetieReview[] = [];
  let text = "";
  let at = 0;
  for (const result of results) {
    const { index, body } = result.literal;
    text += source.slice(at, index);
    const out = result.decoded ? (encodeValue(result.decoded, result.value) ?? body) : body;
    if (result.decoded && out === body && result.value !== result.decoded.value) {
      reviews.push({ text: body, index, reason: "literal could not be rewritten around its escapes; respell it by hand" });
    }
    text += out;
    if (out !== body) changes.push(...result.changes);
    at = index + body.length;
    // Also after a partial rewrite: a word the tokenizer could not reach (`[[zeman`) stays stale.
    const written = new Set(result.changes.flatMap((change) => change.to.match(/[a-z]+/g) ?? []));
    reviewStale(body, out === body ? (result.decoded?.value ?? body) : result.value, index, fileCtx, reviews, written);
  }
  text += source.slice(at);

  // Root-table keys (`{ azawa: "Azawan" }`) are identifiers, not literals: report moved ones,
  // including a spelling another root has since taken (the table now names the wrong row).
  for (const match of source.matchAll(/^\s*([a-z]{3,}):/gm)) {
    const key = match[1]!;
    if (ctx.map.has(key)) {
      reviews.push({ text: key, index: match.index!, reason: `object key spells old root ${key} (now ${ctx.map.get(key)}${reusedNote(key, ctx)})` });
    }
  }
  return { text, changes, reviews };
}

/** Markdown held in a string: its code spans close (a pattern cut mid-span, `` vahahal\.` ``, is plain text). */
function isMarkdown(value: string): boolean {
  const ticks = value.match(/`/g)?.length ?? 0;
  return ticks > 0 && ticks % 2 === 0;
}

/** A test reads the real lexicon when it loads the default tables, the lexicon CSVs, or closed roots. */
const REAL_LEXICON_RE = /\bloadDefaultTables\b|lexicon-(?:published|overlays|compounds)\.csv|closed-roots\.js/;

/** A literal's value with, for each value character, its offset in the source body. */
type Decoded = { body: string; value: string; at: number[] };

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r", "\\": "\\", '"': '"', "'": "'", "`": "`", $: "$" };

/** A letter or digit escape in a regex (`\d`, `\n`): one non-letter stand-in, so the letter runs around it stay apart. */
const REGEX_LETTER_ESCAPE = "\u0001";

/**
 * Decode a regex body: `\|` reads as `|`, and a letter or digit escape as one non-letter stand-in.
 * A retie rewrites only letter runs, so {@link encodeValue} writes every escape back as written.
 */
export function decodeRegexLiteral(body: string): Decoded {
  let value = "";
  const at: number[] = [];
  for (let i = 0; i < body.length; i++) {
    at.push(i);
    if (body[i] !== "\\" || i + 1 >= body.length) {
      value += body[i];
      continue;
    }
    const next = body[i + 1]!;
    value += /[A-Za-z0-9]/.test(next) ? REGEX_LETTER_ESCAPE : next;
    i += 1;
  }
  return { body, value, at };
}

/** Decode simple escapes (`\n`, `\``); null for any other (`\u…`, a line continuation). */
export function decodeLiteral(body: string): Decoded | null {
  let value = "";
  const at: number[] = [];
  for (let i = 0; i < body.length; i++) {
    if (body[i] !== "\\") {
      value += body[i];
      at.push(i);
      continue;
    }
    const decoded = ESCAPES[body[i + 1] ?? ""];
    if (decoded === undefined) return null;
    value += decoded;
    at.push(i);
    i += 1;
  }
  return { body, value, at };
}

const LETTER_RUN_RE = /[A-Za-z]+/g;

/**
 * Write a rewritten value back over the source body, letter run by letter run, so escapes stay as
 * written. A retie only respells words, so anything else changing means it cannot be mapped: null.
 */
export function encodeValue(decoded: Decoded, value: string): string | null {
  if (value === decoded.value) return decoded.body;
  const runsOf = (text: string) => [...text.matchAll(LETTER_RUN_RE)];
  const before = runsOf(decoded.value);
  const after = runsOf(value);
  if (before.length !== after.length || decoded.value.replace(LETTER_RUN_RE, "") !== value.replace(LETTER_RUN_RE, "")) return null;
  let out = decoded.body;
  for (let k = before.length - 1; k >= 0; k--) {
    const run = before[k]!;
    if (run[0] === after[k]![0]) continue;
    const start = decoded.at[run.index!]!;
    const end = decoded.at[run.index! + run[0].length - 1]! + 1;
    out = out.slice(0, start) + after[k]![0] + out.slice(end);
  }
  return out;
}

type LiteralResult = {
  literal: SourceLiteral;
  /** Null when the literal has an escape this pass cannot map back. */
  decoded: Decoded | null;
  /** The rewritten value. */
  value: string;
  changes: RetieChange[];
  /** Read as a whole Egabon sentence or phrase: its words give the file its context. */
  sentence: boolean;
  /** A one-word literal, rewritten with no sentence around it. */
  lone: boolean;
};

function rewriteLiteral(literal: SourceLiteral, isTest: boolean, realLexicon: boolean, ctx: SourceRetieContext): LiteralResult {
  const decoded = !/[a-z]/.test(literal.body) ? null : literal.regex ? decodeRegexLiteral(literal.body) : decodeLiteral(literal.body);
  const result: LiteralResult = { literal, decoded, value: decoded?.value ?? literal.body, changes: [], sentence: false, lone: false };
  if (!decoded) return result;
  const { index } = literal;
  const sourceAt = (valueIndex: number) => index + (decoded.at[valueIndex] ?? valueIndex);
  const record = (local: RetieChange[]) => {
    for (const change of local) result.changes.push({ ...change, index: sourceAt(change.index) });
  };

  // Construction id of an overlay (`overlay.unem.th`): the sense form moves with its root.
  const overlayId = OVERLAY_ID_RE.exec(decoded.value);
  if (overlayId) {
    const [, senseForm, pos] = overlayId;
    const next = retieCore(`${pos}${senseForm}`, ctx.map);
    if (next?.startsWith(pos!) && next !== `${pos}${senseForm}`) {
      result.value = `overlay.${next.slice(pos!.length)}.${pos}`;
      result.changes.push({ from: decoded.value, to: result.value, index });
    }
    return result;
  }

  let value = decoded.value;
  const local: RetieChange[] = [];
  const cls = rewritableClass(value, isTest, ctx);
  if (isMarkdown(value)) {
    // Markdown held in a string (a doc fixture, a word-bank row): retie it as a page.
    const md = rewriteMarkdown(value, ctx.map, ctx.tables, { deferFollow: true, english: ctx.english, keep: ctx.keep });
    value = md.text;
    local.push(...md.changes);
  } else if (cls) {
    const rewrite = resumeRewrite(ctx.map, ctx.tables);
    value = rewritePlainTokens(value, (core, at) => (isKept(core, ctx) ? null : rewrite(core, at)), 0, local);
    result.sentence = cls !== "word";
    result.lone = cls === "word";
  }
  // English names copied from named words (`"z-Ululon | v-walk"`).
  value = value.replace(NAME_RE, (name, offset: number) => {
    const next = ctx.follow.names.get(name);
    if (next === undefined) return name;
    local.push({ from: name, to: next, index: offset });
    return next;
  });
  if (realLexicon) value = retieStaleTokens(value, ctx, local);
  record(local);
  result.value = value;
  return result;
}

/**
 * In a test that reads the real lexicon, every token still spelling an old root is respelled:
 * bare roots (`root=abede`), sense forms (`olon`), seams (`theha`), compounds. Words this retie
 * just wrote are skipped, so a new spelling that is another row's old root is not moved twice.
 */
function retieStaleTokens(value: string, ctx: SourceRetieContext, local: RetieChange[]): string {
  const written = new Set(local.flatMap((change) => change.to.match(/[a-z]+/g) ?? []));
  // Read with the old lexicon's shapes, so a lateral or a holder seam (`hewezathaxar`, `thunemazawan`) moves too.
  const rewrite = resumeRewrite(ctx.map, ctx.tables);
  return value.replace(/(?<![A-Za-z])[a-z]{3,}(?![A-Za-z])/g, (word, offset: number) => {
    if (written.has(word) || isEnglish(word, ctx) || isKept(word, ctx)) return word;
    const next = ctx.map.get(word) ?? rewrite(word);
    if (!next || next === word) return word;
    local.push({ from: word, to: next, index: offset });
    return next;
  });
}

/**
 * One spelling per word across a file. A one-word literal rewritten with no context is undone when
 * a sentence literal in the file kept that word (its binding gave the context). Then each word
 * change is applied to literals the pass could not read (tone marks, English mixed in), unless two
 * literals disagree on it.
 */
function keepFileConsistent(results: LiteralResult[], ctx: SourceRetieContext): void {
  const words = (text: string) => text.match(/(?<![A-Za-z])[a-z]+(?![A-Za-z])/g) ?? [];
  // Word pairs of a change (`zagadal]` → `zagadul]`, `d[a b]` → `d[a c]`), when it keeps its word count.
  const wordPairs = (changes: readonly RetieChange[]): [string, string][] =>
    changes.flatMap(({ from, to }) => {
      const a = words(from);
      const b = words(to);
      return a.length === b.length ? a.map((word, i): [string, string] => [word, b[i]!]).filter(([x, y]) => x !== y) : [];
    });
  // Word changes made inside sentences, and words sentences kept: the context a lone word lacks.
  const kept = new Set<string>();
  const inSentences = new Map<string, string>();
  const conflicts = new Set<string>();
  const add = (map: Map<string, string>, from: string, to: string) => {
    if (!/^[a-z]+$/.test(from) || !/^[a-z]+$/.test(to) || conflicts.has(from)) return;
    const had = map.get(from);
    if (had !== undefined && had !== to) {
      map.delete(from);
      conflicts.add(from);
    } else {
      map.set(from, to);
    }
  };
  for (const result of results) {
    if (!result.sentence || !result.decoded) continue;
    const pairs = wordPairs(result.changes);
    const changed = new Set(pairs.map(([from]) => from));
    for (const word of words(result.decoded.value)) if (!changed.has(word)) kept.add(word);
    for (const [from, to] of pairs) add(inSentences, from, to);
  }
  for (const word of kept) {
    if (inSentences.has(word)) {
      inSentences.delete(word);
      conflicts.add(word);
    }
  }
  for (const result of results) {
    if (!result.lone || result.changes.length === 0) continue;
    const word = result.decoded!.value.trim().replace(/[.?!,]$/, "");
    const follow = inSentences.get(word);
    if (kept.has(word) || conflicts.has(word)) {
      result.value = result.decoded!.value;
      result.changes = [];
    } else if (follow !== undefined && !result.changes.some((change) => change.to === follow)) {
      result.value = result.decoded!.value.replace(word, follow);
      result.changes = [{ from: word, to: follow, index: result.changes[0]!.index }];
    }
  }
  const wordMap = new Map(inSentences);
  for (const result of results) {
    if (result.sentence) continue;
    for (const [from, to] of wordPairs(result.changes)) if (!kept.has(from)) add(wordMap, from, to);
  }
  // A name the file followed in English (`"Alahen's house"`) is also its lowercase token (`normal === "alahen"`).
  for (const result of results) {
    for (const { from, to } of result.changes) {
      if (/^[A-Z][a-z]+$/.test(from) && /^[A-Z][a-z]+$/.test(to)) add(wordMap, from.toLowerCase(), to.toLowerCase());
    }
  }
  for (const result of results) {
    // A literal the pass read only in part (`"hewezathaxar→zazawan"`: one word respelled) takes the rest of the
    // file's word changes; words it already wrote are new spellings and never move twice.
    // Markdown in a string was retied as a page, which decides each word itself (an opaque payload stays).
    if (!result.decoded || result.sentence || result.lone || isMarkdown(result.decoded.value) || wordMap.size === 0) continue;
    const { index } = result.literal;
    const own = new Set(result.changes.flatMap((change) => words(change.to)));
    result.value = result.value.replace(/(?<![A-Za-z])[a-z]+(?![A-Za-z])/g, (word, offset: number) => {
      const next = wordMap.get(word);
      if (next === undefined || own.has(word) || isEnglish(word, ctx) || isKept(word, ctx)) return word;
      result.changes.push({ from: word, to: next, index: index + (result.decoded!.at[offset] ?? offset) });
      return next;
    });
  }
  // English names spelled from a moved root (`"z-Egevan"` after `egeva` → `egevo`) follow it.
  const names = new Map<string, string>();
  for (const result of results) {
    for (const [from, to] of wordPairs(result.changes)) {
      const a = nameRoot(from);
      const b = nameRoot(to);
      if (a !== undefined && b !== undefined && a !== b && !isKept(namedEnglish(a), ctx)) names.set(namedEnglish(a), namedEnglish(b));
    }
  }
  // Each piece of an x-compound name (`z-Uzuhe-x-Agave-x-Edehen`), paired from the word's gloss before and after.
  if (ctx.current) {
    const glossed = followPairs(results.flatMap((result) => result.changes.filter((change) => /^[a-z]/.test(change.from))), { old: ctx.tables, current: ctx.current });
    for (const [from, to] of glossed.names) if (!names.has(from) && !isKept(from, ctx)) names.set(from, to);
  }
  if (names.size === 0) return;
  for (const result of results) {
    if (!result.decoded) continue;
    const { index } = result.literal;
    const own = new Set(result.changes.map((change) => change.to));
    result.value = result.value.replace(NAME_RE, (name, offset: number) => {
      const next = names.get(name);
      if (next === undefined || own.has(name)) return name;
      result.changes.push({ from: name, to: next, index: index + (result.decoded!.at[offset] ?? offset) });
      return next;
    });
  }
}

function isHook(word: string): boolean {
  try {
    return parseWord(word).family.kind === "hook";
  } catch {
    return false;
  }
}

function isEnglish(word: string, ctx: SourceRetieContext): boolean {
  return ctx.english.has(word) || ENGLISH_IN_CODE.has(word);
}

/**
 * Which literals are rewritten, by lint class: a sentence, phrase or template with no common
 * English word, or (in a test) one word with a role letter (`zazawan`). Any other one-word
 * literal may be a key or an English label (`"egabon"`, `"one"`), so it is only reported.
 */
function rewritableClass(body: string, isTest: boolean, ctx: SourceRetieContext): string | undefined {
  const cls = classifyEgabonSpan(fillSelf(body));
  if (!REWRITE_CLASSES.has(cls)) return undefined;
  // A lone letter is a role letter (`b_#22,7`, `g+3`), not the English word list's `b`.
  // Hooks (`ol`, `al`) are closed Egabon forms even where the English list has them.
  const words = (body.match(/(?<![A-Za-z])[a-z]+(?![A-Za-z])/g) ?? []).filter((word) => word.length > 1 && !isHook(word));
  if (words.some((word) => isEnglish(word, ctx))) return undefined;
  if (cls !== "word") return cls;
  if (!isTest) return undefined;
  try {
    return parseWord(body.trim().replace(/[.?!,]$/, "")).pos !== undefined ? cls : undefined;
  } catch {
    return undefined;
  }
}

/** Report old-root spellings left in a literal (`written`: words the retie just produced, already new). */
function reviewStale(
  body: string,
  text: string,
  index: number,
  ctx: SourceRetieContext,
  reviews: RetieReview[],
  written: ReadonlySet<string> = new Set(),
): void {
  for (const match of text.matchAll(/(?<![A-Za-z])[a-z]{3,}(?![A-Za-z])/g)) {
    const word = match[0];
    if (written.has(word) || isEnglish(word, ctx) || isKept(word, ctx)) continue;
    const stale = staleRoot(word, ctx);
    if (stale) {
      reviews.push({
        text: body,
        index: index + match.index!,
        reason: `string literal "${body.length > 60 ? `${body.slice(0, 57)}…` : body}" spells old root ${stale} (now ${ctx.map.get(stale)}${reusedNote(stale, ctx)}); not retied — name closed roots through src/closed-roots.ts`,
      });
    }
  }
}

/** Note for an old spelling that another root has taken since (so the literal still parses). */
function reusedNote(root: string, ctx: SourceRetieContext): string {
  return ctx.currentRoots.has(root) ? `; ${root} is now another row's root` : "";
}

/**
 * An old root this token spells (as a bare root or inside a parsed word). A spelling another
 * root has taken since counts too: the code still names the old row's meaning.
 */
function staleRoot(word: string, ctx: SourceRetieContext): string | undefined {
  const moved = (root: string) => ctx.map.has(root);
  if (moved(word)) return word;
  try {
    const parsed = parseWord(word);
    return contentStemRoots(parsed).find(moved);
  } catch {
    return undefined;
  }
}

/** The one content root a word is built on (`zegevan` → `egeva`), or the word itself when it is a bare root. */
function nameRoot(word: string): string | undefined {
  if (isEgabonRootShape(word)) return word;
  try {
    const roots = contentStemRoots(parseWord(word));
    return roots.length === 1 ? roots[0] : undefined;
  } catch {
    return undefined;
  }
}
