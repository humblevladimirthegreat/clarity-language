/**
 * Morph-gloss serializer — [docs/meta/glosses.md](../../docs/meta/glosses.md).
 *
 * Canonical freeze (parser reading wins; dual teaching labels pick one):
 *
 * | Surface | Canonical | Notes |
 * |---------|-----------|--------|
 * | `zar` fill-ask | `z-who` | `resolve.asks` fill-ask |
 * | `zar` join `-r` | `z-something` | unspecified member |
 * | `zur` fill-ask | `z-who-else` | |
 * | `jol` / `jom` / `jam` / `jem` / `jum` | `j-question` / `j-soft-question` / `j-soft-statement` / `j-request` / `j-soft-prohibition` | `-m` act words |
 * | `zam` / `zal` | `z-and.open` / `z-and` | open vs closed |
 * | `al` left-edge | `additionally` | isolated word too |
 * | `al` in-clause | `including` | |
 * | `hal` listed / bare | `h-only-when` / `h-never` | listed = preceding `/h/`/`/w/` |
 * | `ham` listed | `h-when.open` | open listed; not exclusive |
 * | `an` in-clause | `including.named` | proper-name phrase |
 * | `har` statement / fill-ask | `h-sometimes` / `h-when` | `-r` is unspecified occasion, not `hal` |
 * | `hual` bare | `h-always` | |
 * | `themabam` | `th-plan-sketch` | overlay grain `-m` |
 * | mid-word `x` | always `-x-` segments | never a fused English name |
 * | house-cast `-n` | `Azawan` / `Ululon` / `Uhubun` | |
 * | mention `{…}` / spoken TYPE **o** interior | pass through the surface (`z-odogo`, `odogol`) | not the English lemma |
 * | `zugobon` / `zedonen` / `zahan` / `zenenun` | `speaker` / `listener` / `interlocutors` / `someone` | |
 * | ordinary lexicon (`vejel`, `vajul`, …) | packed `english_by_pos` when present for this role + sense, else literal / metaphor | [glosses.md](../../docs/meta/glosses.md#role-english) |
 */

import { classify, type ClassifyTables } from "./classify.js";
import type { PublishedRow } from "../lexicon-search.js";
import { parseWithTables } from "./parse-core.js";
import { parseWords, WordParseError } from "./word.js";
import type {
  AnaphorBind,
  AskRecord,
  Ending,
  LexOverlay,
  LexWord,
  NumberGroup,
  NumberStem,
  ParseResult,
  Pos,
  ResolveInfo,
} from "./types.js";

const HOUSE_CAST: Record<string, string> = {
  azawa: "Azawan",
  ululo: "Ululon",
  uhubu: "Uhubun",
};

const SPECIAL_PRONOUN: Record<string, string> = {
  ugobo: "speaker",
  edone: "listener",
  aha: "interlocutors",
  enenu: "someone",
};

const LINKER_ENGLISH: Record<string, string> = {
  ezaza: "therefore",
  ezeba: "however",
  anelo: "meanwhile",
  uvumu: "next",
  onugo: "but",
};

const JOIN_JOB: Record<string, string> = {
  a: "and",
  o: "or-exactly-one",
  ao: "and/or",
  u: "not",
  ua: "everything-but",
  uo: "anything-but",
  e: "rank/more",
  ae: "equal-rank",
  oe: "ranked-or",
  ue: "rank/less",
};

const JOIN_ACT: Record<string, string> = {
  a: "includes",
  o: "choose",
  ao: "picks",
  u: "denies",
  ua: "excludes",
  uo: "bars",
  e: "prioritizes",
  ae: "equates",
  oe: "tries",
  ue: "deprioritizes",
};

const JOIN_RELATION: Record<string, string> = {
  a: "including",
  o: "exclusive-for",
  ao: "open-to",
  u: "against",
  ua: "without",
  uo: "anything-but",
  e: "prioritizing",
  ae: "on-a-par",
  oe: "for-trying",
  ue: "deprioritizing",
};

const HOOK_JOB: Record<string, string> = {
  al: "additionally",
  am: "including.open",
  an: "including.named",
  el: "rather",
  em: "rather.open",
  ol: "instead",
  om: "instead.open",
  ul: "except",
  um: "except.open",
};

const HOOK_IN_CLAUSE: Record<string, string> = {
  al: "including",
  am: "including.open",
  an: "including.named",
  el: "rather",
  em: "rather.open",
  ol: "instead",
  om: "instead.open",
  ul: "except",
  um: "except.open",
  en: "rather.named",
  on: "instead.named",
  un: "except.named",
};

const HOOK_EXTRA_NOUN: Record<string, string> = {
  al: "in",
  am: "amid",
  an: "in.named",
  ol: "at",
  om: "near",
  on: "at.named",
  ul: "from",
  um: "away-from",
  un: "from.named",
  el: "for",
  em: "with-in-mind",
  en: "for.named",
  aol: "on",
  aom: "over",
  aon: "on.named",
  oel: "toward",
  oem: "in-the-direction-of",
  oen: "toward.named",
  ual: "out-of",
  uam: "out-from-among",
  uan: "out-of.named",
  uol: "through",
  uom: "by-way-of",
  uon: "through.named",
  ael: "using",
  aem: "by",
  aen: "using.named",
  uel: "against",
  uem: "contrary-to",
  uen: "against.named",
};

const FORCE_JOB: Record<string, string> = {
  a: "statement",
  o: "question",
  e: "command",
  u: "prohibition",
};

const FORCE_JOB_SOFT: Record<string, string> = {
  a: "soft-statement",
  o: "soft-question",
  e: "request",
  u: "soft-prohibition",
};

const POLAR_JOB: Record<string, string> = {
  ae: "yes",
  ue: "no",
  ao: "sure",
  uo: "refuse-option",
};

const ABILITY_STANCE: Record<string, string> = {
  a: "able",
  e: "unable-temporary",
  o: "unable-modifiable",
  u: "unable-irreversible",
};

const VALUE_STANCE: Record<string, string> = {
  a: "met",
  e: "ought",
  o: "motive",
  u: "unmet",
};

/** Ending grain on values (contact / prescription warrant / preference / changeability). */
const VALUE_GRAIN: Record<string, Partial<Record<Ending, string>>> = {
  a: { l: "physical", m: "mental", r: "spiritual" },
  e: { l: "invited", m: "offered", r: "protective" },
  o: { l: "circumstantial", m: "internal", r: "protective" },
  u: { l: "irreversible", m: "modifiable", r: "temporary" },
};

const GREETING_STANCE: Record<string, string> = {
  a: "presence",
  o: "ask",
  e: "minutes",
  u: "passing",
};

const ROLE_VOWEL: Record<string, string> = {
  a: "agent",
  e: "place",
  u: "patient",
  o: "recipient",
};

const SPAN_TYPE: Record<string, string> = {
  a: "cite",
  e: "aside",
  o: "mention",
  u: "opaque",
};

const SPAN_EDGE: Record<string, string> = {
  a: "multi",
  e: "clause",
  o: "atomic",
  u: "empty",
};

const CARDINALS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const ORDINALS = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
];

export type MorphGlossContext = {
  antecedent?: LexWord;
  fillAsk?: boolean;
  discourseHook?: boolean;
  extraNounHook?: boolean;
  restrictorListed?: boolean;
  /** Spoken mention interior (TYPE **o**): gloss the surface, not the lemma. */
  passThrough?: boolean;
  /** `/v/` join-shaped form used as the head of a following dependent sentence. */
  dependentVerb?: boolean;
};

export type CompareMorphGlossResult = {
  ok: boolean;
  expected: string;
  actual: string;
  parseError?: string;
};

export type ExampleBlockPair = {
  agalan: string;
  morph: string;
  agalanIndex: number;
};

export type TeachBlock = {
  agalan: string;
  morph: string | null;
  loose: string | null;
  agalanIndex: number;
};

/** English / TAG body of one word (no PoS prefix). Overlay chips use this. */
export function senseLabel(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  if (word.family.kind === "x" && word.family.xFamily === "numeric") {
    const body = sensePieces(word, tables, ctx).join(`-${word.family.join ?? "l"}-`);
    if (word.plural) return body ? `${body}-x` : "-x";
    return body;
  }
  const hinge =
    word.family.kind === "x" && (word.family.xFamily === "value" || word.family.xFamily === "lateral")
      ? "-th-"
      : "-x-";
  const body = sensePieces(word, tables, ctx).join(hinge);
  if (word.plural) return body ? `${body}-x` : "-x";
  return body;
}

/** One morph-gloss word: `{PoS}-{english}(-x-…)*[-x]`, or prefix-less English. */
export function morphGlossFor(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  if (ctx.passThrough) return word.raw;
  const body = senseLabel(word, tables, ctx);
  if (word.family.kind === "hook") return body;
  const prefix =
    word.gl ? "gl" : word.pos ? word.pos : word.family.kind === "spanClose" ? "x" : "";
  if (!prefix) return body;
  return `${prefix}-${body}`;
}

/** Spaced ` | ` morph line for an Agalan string. */
export function morphGlossLine(text: string, tables: ClassifyTables): string {
  const normalized = normalizeAgalan(text);
  const { words, ctxByIndex } = analyzeLine(normalized, tables);
  const pieces: string[] = [];
  let wordIdx = 0;
  let islandOpen = true;
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(normalized)) !== null) {
    const chunk = match[0]!;
    if (chunk === "^") {
      pieces.push(islandOpen ? "^-start" : "^-end");
      islandOpen = !islandOpen;
      continue;
    }
    const peeled = /[.?!]$/.test(chunk) ? chunk.slice(0, -1) : chunk;
    if (!peeled) continue;
    if (wordIdx >= words.length) break;
    pieces.push(...morphGlossTokens(words[wordIdx]!, tables, ctxByIndex[wordIdx] ?? {}));
    wordIdx += 1;
  }
  return pieces.join(" | ");
}

function morphGlossTokens(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
  nested = false,
): string[] {
  const family = word.family;
  if (family.kind === "writingSpan" && !family.anaphor) {
    const payload = family.payload.trim();
    if (payload && family.bracket === "{") {
      const prefix = word.gl ? "gl" : word.pos ? word.pos : "";
      const chunks = payload.match(/\S+/g) ?? [payload];
      if (chunks.length === 1 && prefix) {
        if (nested) return [`${prefix}-mention`, chunks[0]!];
        return [`${prefix}-${chunks[0]!}`];
      }
      return prefix ? [`${prefix}-mention`, ...chunks] : chunks;
    }
    if (payload && family.bracket !== "<") {
      const inner: string[] = [];
      try {
        for (const innerWord of parseWords(payload)) {
          inner.push(...morphGlossTokens(classify(innerWord, tables), tables, {}, true));
        }
      } catch {
        for (const chunk of payload.match(/\S+/g) ?? []) {
          inner.push(chunk);
        }
      }
      const prefix =
        word.gl ? "gl" : word.pos ? word.pos : "";
      const fence =
        family.bracket === "["
          ? "cite"
          : family.bracket === "{"
            ? "mention"
            : family.bracket === "("
              ? "aside"
              : "opaque";
      if (inner.length === 1 && prefix) {
        const token = inner[0]!;
        const body = token.includes("-") ? token.slice(token.indexOf("-") + 1) : token;
        const collapsed = [`${prefix}-${body}`];
        if (nested) return [`${prefix}-${fence}`, ...collapsed];
        return collapsed;
      }
      if (prefix) {
        const open = family.bracket === "(" ? `${prefix}-` : `${prefix}-${fence}`;
        return [open, ...inner];
      }
      return inner;
    }
  }
  return [morphGlossFor(word, tables, ctx)];
}

export function normalizeMorphLine(line: string): string {
  return line
    .normalize("NFC")
    .trim()
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\| ?/g, " | ");
}

export function normalizeAgalan(text: string): string {
  let t = text.normalize("NFC").trim();
  if (/[.?!]$/.test(t)) t = t.slice(0, -1).trimEnd();
  return t;
}

export function compareMorphGloss(
  agalan: string,
  documented: string,
  tables: ClassifyTables,
): CompareMorphGlossResult {
  const expected = normalizeMorphLine(documented);
  try {
    const actual = normalizeMorphLine(morphGlossLine(normalizeAgalan(agalan), tables));
    return { ok: expected === actual, expected, actual };
  } catch (error) {
    const parseError = error instanceof WordParseError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    return { ok: false, expected, actual: "", parseError };
  }
}

/** Loose free English for redundancy checks — [glosses.md#example-block](../../docs/meta/glosses.md#example-block). */
export function normalizeLooseEnglish(loose: string): string {
  let t = loose.normalize("NFC").trim();
  if (t.startsWith('"') && t.includes('"', 1)) {
    const end = t.indexOf('"', 1);
    t = t.slice(1, end);
  }
  t = t.trim().toLowerCase();
  t = t.replace(/[.?!]+$/g, "").trim();
  return t;
}

const MORPH_POS_PREFIX_RE = /^(?:th|[zdbvgwhxj])l?-(.+)$/;

function morphSegmentBodyForLooseCompare(segment: string): string {
  const m = MORPH_POS_PREFIX_RE.exec(segment.trim());
  return (m ? m[1]! : segment).trim().toLowerCase();
}

/**
 * True when an omitted morph line is allowed: parser output is one segment and matches loose English.
 * See [glosses.md#example-block](../../docs/meta/glosses.md#example-block).
 */
export function morphRedundantWithLoose(
  agalan: string,
  loose: string,
  tables: ClassifyTables,
): boolean {
  let canonical: string;
  try {
    canonical = normalizeMorphLine(morphGlossLine(normalizeAgalan(agalan), tables));
  } catch {
    return false;
  }
  if (canonical.includes(" | ")) return false;
  const looseNorm = normalizeLooseEnglish(loose);
  if (!looseNorm) return false;
  const morphBody = morphSegmentBodyForLooseCompare(canonical);
  return morphBody === looseNorm;
}

const MORPH_TOKEN_RE =
  /^(?:(?:th|[zdbvgwhxj])l?-)?(?:←)?[A-Za-z0-9…/'’._#+∞≤≥≠@{}^|,-]*(?:-x-[A-Za-z0-9…/'’._#+∞≤≥≠@{}^|,-]+)*(?:-x)?$|^[<>^]$|^\^-start$|^\^-end$/;

export function looksLikeMorphLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("`") || trimmed.startsWith('"')) return false;
  if (/^(strict|loose):/i.test(trimmed)) return false;
  const parts = trimmed.split(/\s+\|\s+|\s+·\s+|\s+;\s+/);
  return parts.length > 0 && parts.every((part) => MORPH_TOKEN_RE.test(part));
}

function collectBlockquoteGroup(
  lines: string[],
  start: number,
): { block: { text: string; abs: number }[]; next: number } {
  const block: { text: string; abs: number }[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (isBlockquoteLine(line)) {
      block.push({ text: stripBlockquote(line), abs: i });
      i += 1;
      continue;
    }
    if (line.trim() === "") {
      const next = lines[i + 1];
      if (next !== undefined && isBlockquoteLine(next)) {
        i += 1;
        continue;
      }
    }
    break;
  }
  return { block, next: i };
}

function parseLooseFromBlockquoteLine(text: string): string | null {
  const trimmed = text.trim();
  const m = trimmed.match(/^"([^"]*)"/);
  return m ? m[1]! : null;
}

function normalizeBlockMorphLine(source: string): string {
  return source.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | ");
}

/** glosses.md-style teach blockquotes: backticked Agalan, optional morph, optional quoted loose English. */
export function extractTeachBlocks(markdown: string): TeachBlock[] {
  const blocks: TeachBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!isBlockquoteLine(lines[i]!)) {
      i += 1;
      continue;
    }
    const { block, next } = collectBlockquoteGroup(lines, i);
    i = next;
    const nonempty = block.filter((row) => row.text.trim().length > 0);
    const first = nonempty[0];
    if (!first) continue;
    const agalan = unwrapCode(first.text.trim());
    if (!agalan) continue;

    let morph: string | null = null;
    let loose: string | null = null;
    for (let j = 1; j < nonempty.length; j++) {
      const line = nonempty[j]!.text.trim();
      if (loose == null) {
        const quoted = parseLooseFromBlockquoteLine(line);
        if (quoted != null) {
          loose = quoted;
          continue;
        }
      }
      if (morph == null && looksLikeMorphLine(line)) {
        morph = normalizeBlockMorphLine(line);
      }
    }

    blocks.push({ agalan, morph, loose, agalanIndex: first.abs });
  }
  return blocks;
}

/**
 * Parse glosses.md-style example blockquotes that include an explicit morph line.
 */
export function extractExampleBlocks(markdown: string): ExampleBlockPair[] {
  const pairs: ExampleBlockPair[] = [];
  for (const block of extractTeachBlocks(markdown)) {
    if (!block.morph) continue;
    pairs.push({
      agalan: block.agalan,
      morph: block.morph,
      agalanIndex: block.agalanIndex,
    });
  }
  return pairs;
}

function isBlockquoteLine(line: string): boolean {
  return /^[ \t]*>/.test(line);
}

function stripBlockquote(line: string): string {
  return line.replace(/^[ \t]*>[ \t]?/, "");
}

function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`\.?$/);
  return m ? m[1]! : null;
}

function analyzeLine(
  text: string,
  tables: ClassifyTables,
): { words: LexWord[]; ctxByIndex: MorphGlossContext[] } {
  const morphWords = parseWords(text);
  const words = morphWords.map((word) => classify(word, tables));

  let parsed: ParseResult | undefined;
  try {
    parsed = parseWithTables(text, tables);
  } catch {
    parsed = undefined;
  }

  const dependentVerbCounts = new Map<string, number>();
  const collectClause = (clause: ParseResult["utterances"][number]["bodies"][number]["clause"]): void => {
    const dependent = clause.dependent;
    if (!dependent) return;
    if (dependent.orodo.pos === "v") {
      dependentVerbCounts.set(dependent.orodo.raw, (dependentVerbCounts.get(dependent.orodo.raw) ?? 0) + 1);
    }
    collectClause(dependent.clause);
  };
  parsed?.utterances.forEach((utterance) => utterance.bodies.forEach((body) => collectClause(body.clause)));
  const dependentVerbIndexes = new Set<number>();
  words.forEach((word, index) => {
    const remaining = dependentVerbCounts.get(word.raw) ?? 0;
    if (remaining > 0 && word.pos === "v") {
      dependentVerbIndexes.add(index);
      dependentVerbCounts.set(word.raw, remaining - 1);
    }
  });

  const passThrough = mentionPassThroughFlags(words);
  const ctxByIndex = words.map((word, index) =>
    contextFor(word, index, words, parsed?.resolve, parsed, passThrough[index], dependentVerbIndexes.has(index)),
  );
  return { words, ctxByIndex };
}

/** Spoken TYPE **o** interiors (atomic next token, or until the matching close). */
function mentionPassThroughFlags(words: LexWord[]): boolean[] {
  const flags = words.map(() => false);
  const stack: string[] = [];
  let atomicMentionNext = false;
  for (let i = 0; i < words.length; i++) {
    if (atomicMentionNext) {
      flags[i] = true;
      atomicMentionNext = false;
      continue;
    }
    const family = words[i]!.family;
    if (family.kind === "spanClose") {
      stack.pop();
      continue;
    }
    if (family.kind === "x" && family.xFamily === "span") {
      const type = family.typeVowel ?? "";
      const edge = family.edgeVowel ?? "";
      if (stack.includes("o")) flags[i] = true;
      if (edge === "u") continue;
      if (edge === "o") {
        if (type === "o") atomicMentionNext = true;
        continue;
      }
      stack.push(type);
      continue;
    }
    if (stack.includes("o")) flags[i] = true;
  }
  return flags;
}

function contextFor(
  word: LexWord,
  index: number,
  words: LexWord[],
  resolve: ResolveInfo | undefined,
  parsed: ParseResult | undefined,
  passThrough?: boolean,
  dependentVerb = false,
): MorphGlossContext {
  const ctx: MorphGlossContext = {};
  if (dependentVerb) ctx.dependentVerb = true;
  if (passThrough) ctx.passThrough = true;
  if (resolve) {
    const bind = bindFor(word, index, words, resolve.anaphors);
    if (bind?.antecedent) ctx.antecedent = bind.antecedent;
    ctx.fillAsk = isFillAsk(word, resolve.asks);
  }
  if (parsed) ctx.discourseHook = isLeftEdgeHook(word, parsed);
  if (word.family.kind === "hook") {
    const next = words[index + 1];
    let i = index - 1;
    while (words[i]?.pos === "w") i -= 1;
    const prev = words[i];
    ctx.extraNounHook = next?.pos === "b" && prev?.pos !== "b";
  }
  if (word.reading === "restrictor") {
    const prev = words[index - 1];
    ctx.restrictorListed = Boolean(prev && (prev.pos === "h" || prev.pos === "th" || prev.pos === "w"));
  }
  return ctx;
}

function bindFor(
  word: LexWord,
  index: number,
  words: LexWord[],
  binds: AnaphorBind[],
): AnaphorBind | undefined {
  if (word.ending !== "r" || word.family.kind === "joinMarker") return undefined;
  const seen = words.slice(0, index).filter((w) => w.raw === word.raw && w.ending === "r").length;
  let n = 0;
  for (const bind of binds) {
    if (bind.pronoun.raw !== word.raw) continue;
    if (n === seen) return bind;
    n += 1;
  }
  return undefined;
}

function isFillAsk(word: LexWord, asks: AskRecord[]): boolean {
  return asks.some(
    (ask) => ask.kind === "fillAsk" && ask.gaps.some((gap) => gap.raw === word.raw),
  );
}

function isLeftEdgeHook(word: LexWord, parsed: ParseResult): boolean {
  if (word.family.kind !== "hook") return false;
  return parsed.utterances.some((utt) => utt.left.hook?.raw === word.raw);
}

function sensePieces(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
): string[] {
  const family = word.family;
  const resume =
    word.ending === "r" &&
    word.reading !== "value" &&
    word.reading !== "ability" &&
    family.kind !== "joinMarker";
  if (resume) {
    if (ctx.antecedent) {
      return [`←${senseLabel(ctx.antecedent, tables, {})}`];
    }
    if (family.kind === "content") {
      const house = family.roots.map((root) => HOUSE_CAST[root]).find(Boolean);
      if (house) return [`←${house}`];
    }
  }
  switch (family.kind) {
    case "hook":
      return [hookLabel(family.form, ctx)];
    case "spanClose":
      if (family.flavor === "editorial") return ["span-close-editorial"];
      if (family.flavor === "closeAll") return ["span-close-all"];
      return ["span-close"];
    case "joinMarker":
      return [joinMarkerLabel(word, ctx)];
    case "number":
      return [numberLabel(family.stem, word.pos)];
    case "x":
      return xPieces(word, tables);
    case "writingSpan":
      return [writingSpanLabel(word, tables, ctx)];
    case "foreign":
      return [family.payload];
    case "content":
      return [contentBody(word, family.roots, tables)];
    case "hookCompound":
      return [contentBody(word, [family.leftRoot], tables)];
    default:
      return [word.reading];
  }
}

function hookLabel(form: string, ctx: MorphGlossContext): string {
  if (ctx.extraNounHook) return HOOK_EXTRA_NOUN[form] ?? form;
  if (ctx.discourseHook) return HOOK_JOB[form] ?? form;
  return HOOK_IN_CLAUSE[form] ?? HOOK_JOB[form] ?? form;
}

function joinMarkerLabel(word: LexWord, ctx: MorphGlossContext): string {
  const family = word.family;
  if (family.kind !== "joinMarker") return "join";
  const { series } = family;
  const ending = word.ending;

  if ((word.reading === "standInNamed" || ctx.dependentVerb) && word.pos === "v") {
    const verbalDependent: Record<string, [string, string]> = {
      a: ["state", "offer-as-view"],
      o: ["question", "invite-answer"],
      e: ["command", "request"],
      u: ["prohibit", "caution-against"],
      ae: ["confirm", "tentatively-confirm"],
      ue: ["deny", "express-doubt"],
      ao: ["agree", "tentatively-agree"],
      uo: ["decline", "hesitate-to"],
      ua: ["vehemently-refuse", "strongly-object-to"],
    };
    const action = verbalDependent[series] ?? verbalDependent.a!;
    return action[0];
  }

  if (word.reading === "standInNamed") {
    const namedContent: Record<string, string> = {
      a: "statement",
      o: "question",
      e: "command",
      u: "prohibition",
      ae: "confirmation",
      ue: "denial",
      ao: "agreement",
      uo: "decline",
      ua: "refusal",
    };
    return namedContent[series] ?? "sentence-content";
  }

  if (word.reading === "joinAct") return JOIN_ACT[series] ?? "join-act";
  if (word.reading === "joinRelation") return JOIN_RELATION[series] ?? "join-relation";

  if (word.pos === "j") {
    if (series.length === 1) {
      if (ending === "m") return FORCE_JOB_SOFT[series] ?? FORCE_JOB[series] ?? series;
      return FORCE_JOB[series] ?? series;
    }
    const polar = POLAR_JOB[series];
    if (polar) return ending === "m" ? `${polar}-soft` : polar;
  }

  if (word.reading === "restrictor") {
    return restrictorLabel(series, ending, ctx.restrictorListed, ctx.fillAsk);
  }

  return fenceJoinLabel(series, ending, word.pos, ctx);
}

function fenceJoinLabel(
  series: string,
  ending: Ending | undefined,
  pos: Pos | undefined,
  ctx: MorphGlossContext,
): string {
  if (ending === "rl" || ending === "rm") {
    const open = ending === "rm" ? ".open" : "";
    if (series === "o") return `whether-clause${open}`;
    if (series === "e") return `to-clause${open}`;
    if (series === "u") return `lest-clause${open}`;
    return `that-clause${open}`;
  }

  if (ending === "r") {
    if (ctx.fillAsk) {
      if (series === "u") return "who-else";
      if (series === "o") return "which";
      if (series === "e") return "which-rank";
      return "who";
    }
    if (series === "u") return "something-else";
    if (series === "o") return "anything";
    if (series === "e") return "whatever-ranks";
    return "something";
  }

  if (series === "a" && ending === "n" && pos === "x") return "and-then";

  const job = JOIN_JOB[series] ?? series;
  if (ending === "m") return `${job}.open`;
  if (ending === "n") return `${job}.named`;
  return job;
}

function restrictorLabel(
  series: string,
  ending: Ending | undefined,
  listed: boolean | undefined,
  fillAsk: boolean | undefined,
): string {
  if (ending === "r") {
    if (series === "a") return fillAsk ? "when" : "sometimes";
    if (series === "o") return "anytime";
    if (series === "u") return "some-other-time";
    if (series === "ae") return "equally-often";
    return `${series}-r`;
  }
  const open = ending === "m" ? ".open" : "";
  if (series === "a") {
    if (!listed) return `never${open}`;
    if (ending === "m") return "when.open";
    return "only-when";
  }
  if (series === "ua") return `${listed ? "always-except" : "always"}${open}`;
  if (series === "u") return `not-when${open}`;
  if (series === "o") return `when-one${open}`;
  if (series === "e") return `when-ranked${open}`;
  if (series === "ae") return `whenever${open}`;
  return `${series}${open}`;
}

function numericKindLabel(stem: NumberStem, pos: Pos | undefined): string {
  const exp = stem.digitlessExp;
  const noMantissa = stem.groups.every((g) => !g.mantissa && !g.exponentDigits);
  if (noMantissa) {
    if (stem.marker === "+" && exp === "e") return "infinity";
    if (stem.marker === "+" && (exp === "e-" || exp === "-")) return "grain";
    if (stem.marker === "-" && exp === "e") return "void";
    if (stem.marker === "-" && (exp === "e-" || exp === "-e-" || exp === "-")) return "quasi";
    if (stem.marker === "#" && (exp === "e-" || exp === "-")) return "origin";
    if (stem.marker === "#" && exp === "e") return "telos";
    if ((stem.marker === "+" || stem.marker === "ra") && !exp) return "poly";
    if ((stem.marker === "-" || stem.marker === "ru") && !exp) return "de";
  }
  return numberLabel(stem, pos);
}

/** Stance `/th/` numbers (numbers.md § Number as stance): likelihood, as-if, source. */
function stanceNumberLabel(stem: NumberStem): string | null {
  const exp = stem.digitlessExp;
  const groups = stem.groups;
  if (groups.length === 0) {
    if (!exp) {
      if (stem.marker === "+") return "likely";
      if (stem.marker === "-") return "unlikely";
      if (stem.marker === "_") return "per-a-source";
      return null;
    }
    if (stem.marker === "+" && exp === "e") return "certain";
    if (stem.marker === "+" && exp === "0e") return "no-chance";
    if (stem.marker === "+" && exp === "1e") return "gazillion-percent-sure";
    if (stem.marker === "-" && exp === "e-") return "as-if";
    return null;
  }
  const body = groups.map(formatNumberGroup).filter(Boolean).join(",");
  if (stem.marker === "_" && !exp) return `per-source-${body}`;
  const only = groups[0]!;
  if (
    stem.marker === "+" &&
    !exp &&
    groups.length === 1 &&
    only.mantissa !== undefined &&
    !only.exponentDigits &&
    !only.percent
  ) {
    return `${only.mantissa}-percent-likely`;
  }
  return null;
}

function numberLabel(stem: NumberStem, pos: Pos | undefined): string {
  const exp = stem.digitlessExp;
  if (pos === "th") {
    const stance = stanceNumberLabel(stem);
    if (stance) return stance;
  }
  if (exp) {
    if (stem.marker === "#" && (exp === "e-" || exp === "-")) {
      return pos === "x" ? "starting-with" : "start-place";
    }
    if (stem.marker === "#" && exp === "e") {
      return pos === "x" ? "finally" : "last-place";
    }
    if (stem.marker === "+" && exp === "e") return "infinity";
  }

  if (stem.groups.length === 0 && !exp) {
    if (stem.marker === "+") return "more-than-one";
    if (stem.marker === "-") return "negative-unspecified";
    if (stem.marker === "#") return "some-rank";
    return String(stem.marker);
  }

  const first = stem.groups[0];
  const simpleMantissa =
    first?.mantissa !== undefined &&
    stem.groups.length === 1 &&
    !first.exponentDigits &&
    !first.percent &&
    !first.decimal &&
    !exp;
  if (simpleMantissa) {
    const value = Number(first.mantissa);
    if (stem.marker === "#-") return `${ordinalEnglish(value)}-from-end`;
    if (stem.marker === "#") return ordinalEnglish(value);
    if (stem.marker === "+") return cardinalEnglish(value);
    if (stem.marker === "-") return `minus-${cardinalEnglish(value)}`;
  }

  const body = stem.groups.map(formatNumberGroup).filter(Boolean).join(",");
  if (stem.marker === "#_" || stem.marker === "ruo") {
    return body ? `negative-label-${body}` : "negative-label";
  }
  if (stem.marker === "+-" || stem.marker === "rua") {
    return body ? `plus-minus-${body}` : "plus-minus-bound";
  }
  if (stem.marker === "_" || stem.marker === "ro") {
    return body ? `_${body}` : "_";
  }
  if ((stem.marker === "+" || stem.marker === "ra") && !exp) return body;
  if ((stem.marker === "-" || stem.marker === "ru") && !exp) {
    return body ? `minus-${body}` : "minus";
  }
  return [String(stem.marker), exp, body].filter(Boolean).join("-");
}

function formatNumberGroup(g: NumberGroup): string {
  let s = g.mantissa ?? "";
  if (g.exponentDigits) {
    s += `${g.exponentSign === "bu" ? "e-" : "e"}${g.exponentDigits}`;
  } else if (!g.mantissa && g.exponentSign) {
    s += g.exponentSign === "bu" ? "e-" : "e";
  }
  if (g.percent === "jo") s += "jo";
  if (g.percent === "ju") s += "ju";
  return s;
}

function cardinalEnglish(n: number): string {
  if (Number.isInteger(n) && n >= 0 && n < CARDINALS.length) return CARDINALS[n]!;
  return String(n);
}

function ordinalEnglish(n: number): string {
  if (Number.isInteger(n) && n >= 0 && n < ORDINALS.length) return ORDINALS[n]!;
  return `${cardinalEnglish(n)}-th`;
}

function xPieces(word: LexWord, tables: ClassifyTables): string[] {
  const family = word.family;
  if (family.kind !== "x") return [];

  if (family.xFamily === "span") {
    const type = SPAN_TYPE[family.typeVowel ?? ""] ?? family.typeVowel ?? "span";
    const edge = SPAN_EDGE[family.edgeVowel ?? ""] ?? family.edgeVowel;
    return edge ? [type, edge] : [type];
  }

  if (family.xFamily === "role") {
    const role = ROLE_VOWEL[family.roleVowel ?? ""] ?? "role";
    const host = (family.rightRoots ?? []).map((root) =>
      rootSense(root, word.ending, tables, {
        named: word.ending === "n",
        pos: word.pos,
      }),
    );
    return [role, ...host];
  }

  if (family.xFamily === "value" || family.xFamily === "ability") {
    const hostRoot = family.leftRoots[0] ?? "host";
    const host =
      tables.hostlessAbilityRoot && hostRoot === tables.hostlessAbilityRoot
        ? "ABIL"
        : rootSense(hostRoot, word.ending, tables, {
            named: word.reading === "greeting" || word.ending === "n",
            need: word.reading === "value",
            pos: word.pos,
          });
    // Ability / greeting bids: one hyphenated english slot (`walking-unable-temporary`,
    // `Ululon-minutes`). Values keep a visible `-th-` hinge (`competence-th-motive`).
    if (word.reading === "greeting") {
      const stance = GREETING_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "greeting";
      return [`${host}-${stance}`];
    }
    if (word.reading === "value") {
      const stance = VALUE_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "stance";
      const grain =
        family.stanceVowel && word.ending
          ? VALUE_GRAIN[family.stanceVowel]?.[word.ending]
          : undefined;
      return grain ? [`${host}-${stance}-${grain}`] : [host, stance];
    }
    const stance = ABILITY_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "ability";
    return [`${host}-${stance}`];
  }

  if (family.xFamily === "numeric") {
    const host = family.leftRoots.map((root) =>
      rootSense(root, word.ending, tables, { named: word.ending === "n", pos: word.pos }),
    );
    const num = family.numberStem ? numericKindLabel(family.numberStem, word.pos) : "num";
    return [...host, num];
  }

  if (family.xFamily === "lateral") {
    const dir = rootSense(family.leftRoots[0]!, "l", tables, { named: false, pos: word.pos });
    const anchors = (family.rightRoots ?? []).map((root, i, all) =>
      rootSense(root, word.ending, tables, {
        named: word.ending === "n",
        nameLast: word.ending === "n" && i === all.length - 1,
        pos: word.pos,
      }),
    );
    return [dir, anchors.join("-x-")];
  }

  const named = word.ending === "n";
  const unpackCitation = named && !word.pos;
  const all = [...family.leftRoots, ...(family.rightRoots ?? [])];
  return all.map((root, i) =>
    rootSense(root, word.ending, tables, {
      named: named && !unpackCitation,
      nameLast: named && !unpackCitation && i === all.length - 1,
      citationEtymology: unpackCitation,
      pos: word.pos,
    }),
  );
}

function writingSpanLabel(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
): string {
  const family = word.family;
  if (family.kind !== "writingSpan") return "span";
  if (family.anaphor) {
    if (ctx.antecedent) return `←${senseLabel(ctx.antecedent, tables, {})}`;
    if (family.bracket === "[") return "←cite";
    if (family.bracket === "(") return "←aside";
    if (family.bracket === "{") return "←mention";
    return "←opaque";
  }
  const payload = family.payload;
  if (family.bracket === "{") return payload;
  const stem = payload.endsWith("n") ? payload.slice(0, -1) : payload;
  if (HOUSE_CAST[stem] && payload.endsWith("n")) return HOUSE_CAST[stem]!;
  if (HOUSE_CAST[payload]) return HOUSE_CAST[payload]!;
  return payload;
}

function contentBody(word: LexWord, roots: string[], tables: ClassifyTables): string {
  if (word.overlay) return overlayLabel(word.overlay);
  if (word.lexicalCompound) {
    return hyphenEnglish(
      word.rootGloss?.concrete || word.rootGloss?.abstract || roots[0] || "compound",
    );
  }
  if (word.hookCompound) {
    return hyphenEnglish(
      word.rootGloss?.concrete || word.rootGloss?.abstract || word.hookCompound.stem,
    );
  }
  if (word.pos === "x" && roots.length === 1 && LINKER_ENGLISH[roots[0]!]) {
    return LINKER_ENGLISH[roots[0]!]!;
  }
  if (word.pos === "j" && roots.length === 1 && roots[0] === "awave") return "greeting";
  if (roots.length === 1) {
    return rootSense(roots[0]!, word.ending, tables, {
      named: word.ending === "n",
      need: word.reading === "value",
      pos: word.pos,
    });
  }
  return roots
    .map((root) =>
      rootSense(root, word.ending, tables, {
        named: word.ending === "n",
        need: word.reading === "value",
        pos: word.pos,
      }),
    )
    .join("-x-");
}

function overlayLabel(overlay: LexOverlay): string {
  return overlay.gloss;
}

function packedRoleLemma(
  row: PublishedRow,
  ending: Ending | undefined,
  pos: Pos | undefined,
): string | undefined {
  if (!pos) return undefined;
  const bank = ending === "m" ? row.posEnglish.abstract : row.posEnglish.concrete;
  return bank[pos];
}

function rootSense(
  root: string,
  ending: Ending | undefined,
  tables: ClassifyTables,
  opts: {
    named?: boolean;
    nameLast?: boolean;
    need?: boolean;
    citationEtymology?: boolean;
    pos?: Pos;
  } = {},
): string {
  if (opts.citationEtymology) {
    const row = tables.published.get(root);
    return hyphenEnglish(row?.abstract || row?.concrete || root);
  }

  if (opts.need && tables.needGloss.has(root)) return tables.needGloss.get(root)!;

  const compound = tables.compounds.get(root);
  if (compound) {
    const lemma =
      ending === "m"
        ? compound.abstract || compound.concrete
        : compound.concrete || compound.abstract;
    if (lemma) return hyphenEnglish(lemma);
  }

  if (root === "ugobo") {
    return ending === "l" ? "microphone" : "speaker";
  }

  if (ending === "n" || opts.named) {
    if (HOUSE_CAST[root]) return HOUSE_CAST[root]!;
    if (SPECIAL_PRONOUN[root]) return SPECIAL_PRONOUN[root]!;
    if (opts.named) return titleAgalanName(root, opts.nameLast !== false);
  }

  if (tables.needGloss.has(root) && opts.need) {
    return tables.needGloss.get(root)!;
  }

  const row = tables.published.get(root);
  const packed = row ? packedRoleLemma(row, ending, opts.pos) : undefined;
  if (packed) return hyphenEnglish(packed);
  if (ending === "m") return hyphenEnglish(row?.abstract || row?.concrete || root);
  if (row?.concrete) return hyphenEnglish(row.concrete);
  if (row?.abstract) return hyphenEnglish(row.abstract);
  return root;
}

function titleAgalanName(root: string, withN: boolean): string {
  const stem = withN ? `${root}n` : root;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

function hyphenEnglish(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
}
