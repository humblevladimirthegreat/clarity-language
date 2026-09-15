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
 * | `jol` / `jom` | `j-question` / `j-soft-question` | |
 * | `zam` / `zal` | `z-and.open` / `z-and` | open vs closed |
 * | `al` left-edge | `additionally` | isolated word too |
 * | `al` in-clause | `including` | |
 * | `hal` listed / bare | `h-only-when` / `h-never` | listed = preceding `/h/`/`/w/` |
 * | `ham` listed | `h-when.open` | open listed; not exclusive |
 * | `an` in-clause | `including.named` | titled / stock including |
 * | `har` statement / fill-ask | `h-sometimes` / `h-when` | `-r` is unspecified occasion, not `hal` |
 * | `hual` bare | `h-always` | |
 * | `howoram` | `h-plan-sketch` | overlay grain `-m` |
 * | mid-word `x` | always `-x-` segments | never a fused English name |
 * | house-cast `-n` | `Azawan` / `Ululon` / `Uhubun` | |
 * | `zugobon` / `zedonen` / `zahan` / `zenenun` | `speaker` / `listener` / `interlocutors` / `someone` | |
 */

import { classify, type ClassifyTables } from "./classify.js";
import { parseWithTables } from "./parse-core.js";
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
import { parseWord, WordParseError } from "./word.js";

const PUNCT = new Set([".", "?", "!"]);

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
  adoro: "next-clause",
};

const IDEATION: Record<string, string> = {
  uzebu: "problem",
  agego: "solution",
  olala: "goal",
};

const NEED_ENGLISH: Record<string, string> = {
  alodo: "autonomy",
  olozo: "competence",
  onogo: "relatedness",
  awero: "pleasure",
  uhuhe: "survival",
  ege: "need",
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
  ae: "as…as",
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

const REVISER_JOB: Record<string, string> = {
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

const FORCE_JOB: Record<string, string> = {
  a: "statement",
  o: "question",
  e: "command",
  u: "prohibition",
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
  e: "motive",
  o: "prescription",
  u: "unmet",
};

const GREETING_STANCE: Record<string, string> = {
  a: "presence",
  o: "ask",
  e: "queue",
  u: "passing",
};

const ROLE_VOWEL: Record<string, string> = {
  a: "agent",
  u: "patient",
  o: "reltum",
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

const OVERLAY_TAG: Record<string, string> = {
  uvuvum: "WITNESSED",
  adezem: "LIVE",
  eregom: "RECORDED",
  abawam: "PATTERN",
  unevem: "INFERRED",
  eraram: "TOLD",
  eherem: "FELT",
  orolom: "STORY",
  oworam: "plan-sketch",
  oworal: "plan-itinerary",
  oworan: "plan",
  oworar: "plan-fork",
  elezom: "predict",
  egegel: "DECISION-irreversible",
  egegem: "DECISION-modifiable",
  egegen: "DECISION",
  egeger: "DECISION-temporary",
  odohom: "COMMENT",
  odohol: "COMMENT-fused",
  odohon: "COMMENT",
  odohor: "COMMENT-return",
  adadem: "NOTIONAL",
  adadel: "NOTIONAL-fused",
  adaden: "NOTIONAL",
  adader: "NOTIONAL-return",
  ogegam: "HIGH",
  ejelom: "MED",
  ozowom: "LOW",
  abobom: "INTERNAL",
  orurum: "EXTERNAL",
  anedem: "CIRCUM",
  egeram: "ABIL",
  arogul: "COMMON",
  abulul: "UNCOUNTERED",
  arazal: "FORMAL",
  abelel: "NATURAL",
  ebebel: "RULE",
  onunul: "SAME",
  adorom: "if",
  ezazem: "iff",
  urugum: "because",
  ezebam: "although",
  egemum: "while",
  udumem: "until",
  ababam: "before",
  oranem: "after",
  egegam: "CAUSE",
  uzebum: "problem",
  agegom: "solution",
  olalam: "goal",
  ojun: "Average",
  ahaman: "Typical",
  ugoboxrawon: "Mine",
  uluden: "Social",
  alaban: "Professional",
  uan: "Everyone",
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
  discourseReviser?: boolean;
  restrictorListed?: boolean;
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

/** English / TAG body of one word (no PoS prefix). Overlay chips use this. */
export function senseLabel(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  const body = sensePieces(word, tables, ctx).join("-x-");
  if (word.plural) return body ? `${body}-x` : "-x";
  return body;
}

/** One morph-gloss word: `{PoS}-{english}(-x-…)*[-x]`, or prefix-less English. */
export function morphGlossFor(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  const body = senseLabel(word, tables, ctx);
  if (word.family.kind === "reviser") return body;
  const prefix =
    word.gl ? "gl" : word.pos ? word.pos : word.family.kind === "spanClose" ? "x" : "";
  if (!prefix) return body;
  return `${prefix}-${body}`;
}

/** Spaced ` | ` morph line for an Agalan string. */
export function morphGlossLine(text: string, tables: ClassifyTables): string {
  const { words, ctxByIndex } = analyzeLine(text, tables);
  return words
    .map((word, index) => morphGlossFor(word, tables, ctxByIndex[index] ?? {}))
    .join(" | ");
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

const MORPH_TOKEN_RE =
  /^(?:[zdbvgwhxj]l?-)?(?:←)?[A-Za-z0-9…/'’.+-]+(?:-x-[A-Za-z0-9…/'’.+-]+)*(?:-x)?$/;

export function looksLikeMorphLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("`") || trimmed.startsWith('"')) return false;
  if (/^(strict|loose):/i.test(trimmed)) return false;
  const parts = trimmed.split(/\s+\|\s+|\s+·\s+|\s+;\s+/);
  return parts.length > 0 && parts.every((part) => MORPH_TOKEN_RE.test(part));
}

/**
 * Parse glosses.md-style example blockquotes.
 * First non-empty: backticked Agalan. Next: morph line. Quoted free English ignored.
 */
export function extractExampleBlocks(markdown: string): ExampleBlockPair[] {
  const pairs: ExampleBlockPair[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!isBlockquoteLine(lines[i]!)) {
      i += 1;
      continue;
    }
    const block: { text: string; abs: number }[] = [];
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
    const nonempty = block.filter((row) => row.text.trim().length > 0);
    const first = nonempty[0];
    const second = nonempty[1];
    if (!first || !second) continue;
    const agalan = unwrapCode(first.text.trim());
    if (!agalan) continue;
    const morphSource = second.text.trim();
    if (!looksLikeMorphLine(morphSource)) continue;
    pairs.push({
      agalan,
      morph: morphSource.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | "),
      agalanIndex: first.abs,
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

function peelWord(chunk: string): string {
  if (chunk.length > 1 && PUNCT.has(chunk.at(-1)!)) return chunk.slice(0, -1);
  return chunk;
}

function analyzeLine(
  text: string,
  tables: ClassifyTables,
): { words: LexWord[]; ctxByIndex: MorphGlossContext[] } {
  const words: LexWord[] = [];
  const chunks = text.match(/\S+/g) ?? [];
  for (const chunk of chunks) {
    if (chunk === "^") continue;
    const core = peelWord(chunk);
    if (!core) continue;
    words.push(classify(parseWord(core), tables));
  }

  let parsed: ParseResult | undefined;
  try {
    parsed = parseWithTables(text, tables);
  } catch {
    parsed = undefined;
  }

  const ctxByIndex = words.map((word, index) =>
    contextFor(word, index, words, parsed?.resolve, parsed),
  );
  return { words, ctxByIndex };
}

function contextFor(
  word: LexWord,
  index: number,
  words: LexWord[],
  resolve: ResolveInfo | undefined,
  parsed: ParseResult | undefined,
): MorphGlossContext {
  const ctx: MorphGlossContext = {};
  if (resolve) {
    const bind = bindFor(word, index, words, resolve.anaphors);
    if (bind?.antecedent) ctx.antecedent = bind.antecedent;
    ctx.fillAsk = isFillAsk(word, resolve.asks);
  }
  if (parsed) ctx.discourseReviser = isLeftEdgeReviser(word, parsed);
  if (word.reading === "restrictor") {
    const prev = words[index - 1];
    ctx.restrictorListed = Boolean(prev && (prev.pos === "h" || prev.pos === "w"));
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

function isLeftEdgeReviser(word: LexWord, parsed: ParseResult): boolean {
  if (word.family.kind !== "reviser") return false;
  return parsed.utterances.some((utt) => utt.left.reviser?.raw === word.raw);
}

function sensePieces(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
): string[] {
  const resume =
    ctx.antecedent &&
    word.ending === "r" &&
    word.reading !== "value" &&
    word.reading !== "ability" &&
    word.family.kind !== "joinMarker";
  if (resume && ctx.antecedent) {
    return [`←${senseLabel(ctx.antecedent, tables, {})}`];
  }

  const family = word.family;
  switch (family.kind) {
    case "reviser":
      return [reviserLabel(family.form, ctx)];
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
    default:
      return [word.reading];
  }
}

function reviserLabel(form: string, ctx: MorphGlossContext): string {
  if (form === "al") {
    if (ctx.discourseReviser === false) return "including";
    return "additionally";
  }
  return REVISER_JOB[form] ?? form;
}

function joinMarkerLabel(word: LexWord, ctx: MorphGlossContext): string {
  const family = word.family;
  if (family.kind !== "joinMarker") return "join";
  const { series } = family;
  const ending = word.ending;

  if (word.reading === "joinAct") return JOIN_ACT[series] ?? "join-act";
  if (word.reading === "joinRelation") return JOIN_RELATION[series] ?? "join-relation";

  if (word.pos === "j") {
    if (series.length === 1) {
      if (ending === "m" && series === "o") return "soft-question";
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

function numberLabel(stem: NumberStem, pos: Pos | undefined): string {
  const exp = stem.digitlessExp;
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
      rootSense(root, word.ending === "n" ? "n" : "m", tables, { named: word.ending === "n" }),
    );
    return [role, ...host];
  }

  if (family.xFamily === "valueAbility") {
    const hostRoot = family.leftRoots[0] ?? "host";
    const host =
      tables.hostlessAbilityRoot && hostRoot === tables.hostlessAbilityRoot
        ? "ABIL"
        : rootSense(hostRoot, word.ending, tables, {
            named: word.reading === "greeting" || word.ending === "n",
            need: word.reading === "value",
          });
    // Ability / greeting bids: one hyphenated english slot (`walking-unable-temporary`,
    // `Ululon-queue`). Values keep a visible `-x-` hinge (`competence-x-motive`).
    if (word.reading === "greeting") {
      const stance = GREETING_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "greeting";
      return [`${host}-${stance}`];
    }
    if (word.reading === "value") {
      return [host, VALUE_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "stance"];
    }
    const stance = ABILITY_STANCE[family.stanceVowel ?? ""] ?? family.stanceVowel ?? "ability";
    return [`${host}-${stance}`];
  }

  if (family.xFamily === "numeric") {
    const host = family.leftRoots.map((root) =>
      rootSense(root, word.ending, tables, { named: word.ending === "n" }),
    );
    const num = family.numberStem ? numberLabel(family.numberStem, word.pos) : "num";
    return [...host, num];
  }

  const named = word.ending === "n";
  const unpackCitation = named && !word.pos;
  const all = [...family.leftRoots, ...(family.rightRoots ?? [])];
  return all.map((root, i) =>
    rootSense(root, word.ending, tables, {
      named: named && !unpackCitation,
      nameLast: named && !unpackCitation && i === all.length - 1,
      citationEtymology: unpackCitation,
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
  const stem = payload.endsWith("n") ? payload.slice(0, -1) : payload;
  if (HOUSE_CAST[stem] && payload.endsWith("n")) return HOUSE_CAST[stem]!;
  if (HOUSE_CAST[payload]) return HOUSE_CAST[payload]!;
  return payload;
}

function contentBody(word: LexWord, roots: string[], tables: ClassifyTables): string {
  if (word.overlay) return overlayLabel(word.overlay, word);
  if (word.lexicalCompound) {
    return hyphenEnglish(
      word.rootGloss?.literal || word.rootGloss?.metaphorical || roots[0] || "compound",
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
    });
  }
  return roots
    .map((root) =>
      rootSense(root, word.ending, tables, {
        named: word.ending === "n",
        need: word.reading === "value",
      }),
    )
    .join("-x-");
}

function overlayLabel(overlay: LexOverlay, word: LexWord): string {
  const tagged = OVERLAY_TAG[overlay.senseForm];
  if (tagged) return tagged;
  if (word.reading === "joinAct" && word.family.kind === "joinMarker") {
    return JOIN_ACT[word.family.series] ?? overlay.senseForm;
  }
  if (word.reading === "joinRelation" && word.family.kind === "joinMarker") {
    return JOIN_RELATION[word.family.series] ?? overlay.senseForm;
  }
  if (word.reading === "value") {
    const root = overlay.senseForm.replace(/[lmnr]$/, "");
    return NEED_ENGLISH[root] ?? hyphenEnglish(overlay.definition.split(/[,(]/)[0] ?? overlay.senseForm);
  }
  const caps = overlay.definition.match(/\b([A-Z]{2,})\b/);
  if (caps) return caps[1]!;
  return hyphenEnglish(overlay.definition.split(/[,(]/)[0] ?? overlay.senseForm);
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
  } = {},
): string {
  if (opts.citationEtymology) {
    const row = tables.published.get(root);
    return hyphenEnglish(row?.metaphorical || row?.literal || root);
  }

  if (opts.need && NEED_ENGLISH[root]) return NEED_ENGLISH[root]!;

  if (root === "ugobo") {
    return ending === "l" ? "microphone" : "speaker";
  }

  if (ending === "n" || opts.named) {
    if (HOUSE_CAST[root]) return HOUSE_CAST[root]!;
    if (SPECIAL_PRONOUN[root]) return SPECIAL_PRONOUN[root]!;
    if (opts.named) return titleAgalanName(root, opts.nameLast !== false);
  }

  if (root === "adoro") return SPECIAL_PRONOUN[root]!;
  if (IDEATION[root]) return IDEATION[root]!;
  if (NEED_ENGLISH[root] && (wordIsNeedTopic(ending) || opts.need)) return NEED_ENGLISH[root]!;

  const row = tables.published.get(root);
  if (ending === "m") return hyphenEnglish(row?.metaphorical || row?.literal || root);
  if (row?.literal) return hyphenEnglish(row.literal);
  if (row?.metaphorical) return hyphenEnglish(row.metaphorical);
  return root;
}

function wordIsNeedTopic(ending: Ending | undefined): boolean {
  return ending === "l" || ending === "r" || ending === undefined;
}

function titleAgalanName(root: string, withN: boolean): string {
  const stem = withN ? `${root}n` : root;
  return stem.charAt(0).toUpperCase() + stem.slice(1);
}

function hyphenEnglish(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "");
}
