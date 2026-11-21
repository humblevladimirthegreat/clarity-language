/**
 * Morph-gloss serializer — [docs/meta/glosses.md](../../docs/meta/glosses.md).
 *
 * Canonical freeze (parser reading wins; dual teaching labels pick one):
 *
 * | Surface | Canonical | Notes |
 * |---------|-----------|--------|
 * | `zar` fill-ask | `z-wh` | `resolve.asks` fill-ask |
 * | `zar` join `-r` | `z-something` | unspecified member |
 * | `zur` fill-ask | `z-wh-else` | |
 * | `thar` / `thur` fill-ask | `th-why` / `th-why-else` | stance grounds |
 * | `yol` / `yom` / `yam` / `yem` / `yum` | `y-question` / `y-soft-question` / `y-soft-statement` / `y-request` / `y-soft-prohibition` | `-m` act words |
 * | `yar` / `yor` / `yer` / `yur` | `y-provisional-statement` / `y-working-question` / `y-command-for-now` / `y-hold-off` | `-r` act words |
 * | `zam` / `zal` | `z-and.open` / `z-and` | open vs closed |
 * | `al` left-edge | `additionally` | isolated word too |
 * | `al` in-clause | `including` | |
 * | `hal` listed / bare | `h-only-when` / `h-never` | listed = preceding `/h/`/`/w/` |
 * | `ham` listed | `h-when.open` | open listed; not exclusive |
 * | `an` in-clause | `including.named` | proper-name phrase |
 * | `har` statement / fill-ask | `h-sometimes` / `h-when` | `-r` is unspecified occasion, not `hal` |
 * | `hor` statement / fill-ask | `h-preferred-time` / `h-when-best` | `-r` on rank **o**: the first-ranked occasion |
 * | `hual` bare | `h-always` | |
 * | `themabam` | `th-plan-itinerary` | overlay grain `-m` |
 * | mid-word `x` | always `-x-` segments | never a fused English name |
 * | named `-n` (house cast included) | the root capitalised + `n` | |
 * | mention `{…}` / spoken TYPE **o** interior | pass through the surface (`z-odogo`, `odogol`) | not the English lemma |
 * | `zeman` / `zehan` / `zohan` | `speaker` / `listener` / `interlocutors` | |
 * | ordinary lexicon (`vejel`, `vajul`, …) | packed `english_by_pos` when present for this role + sense, else literal / metaphor | [glosses.md](../../docs/meta/glosses.md#role-english) |
 */

import { isKindReference, isScaleShared, visitResult } from "./ast-walk.js";
import { hookJobsByPosition, type HookJob } from "./hook-jobs.js";
import { JOIN_SERIES } from "./series.js";
import { classifyAll, hookCompoundGloss, overlayKey, SAME_ROLE_POS, type ClassifyTables } from "./classify.js";
import { type ExtraNounHook } from "./hook-compounds.js";
import { type PublishedRow } from "../lexicon-search.js";
import { CLOSED, closedDerived, namedEnglish, withLexiconClosedRoots } from "../closed-roots.js";
import { linkerEnglish } from "./linkers.js";
import { buildGlossTree, renderGlossNodes, tokenGlossTree, unwrapLoneBracket, bracketsByWord, type GlossNode, type WordBrackets } from "./gloss-structure.js";
import { scanChunks, toneMarkLength } from "./span-scan.js";
import { parseWithTables } from "./parse-core.js";
import { stripFlagSuffix } from "../flag-label.js";
import { isDigitlessNumberBlank } from "./resolve.js";
import { parseWords, WordParseError } from "./word.js";
import { type AnaphorBind, type AskRecord, type Ending, type LexOverlay, type LexWord, type NumberGroup, type NumberStem, type ParseResult, type Pos, type ResolveInfo } from "./types.js";
import { houseCast, NUMBER_BLANK, numberMarkSuffix, REACH_VOWEL, SAY_PART, SAY_ANSWER, SAY_ENDING, roleFront, pointerFront, POINTER_ENDING, POINTER_VOWEL, UnknownWordError, type MorphGlossContext, ordinalEnglish } from "./morph-gloss-tables.js";
import { normalizeAgeben } from "./morph-gloss-blocks.js";
import { senseLabel, WRITTEN_SPAN, hookLabel, hookedJoinHookLabel, joinMarkerLabel, numberLabel, xPieces, writingSpanLabel, contentBody, rootSense, markShorthandRuns, numberSurfaceSuffix } from "./morph-gloss-labels.js";

/** One morph-gloss word: `{PoS}-{english}(-x-…)*[-x]`, or prefix-less English. */
export function morphGlossFor(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext = {},
): string {
  // A short resume's stem is not a lexicon root; its antecedent supplies the sense.
  if (word.reading === "unknown" && !word.overlay && word.family.kind === "content" && !ctx.antecedent) {
    throw new UnknownWordError(word.raw);
  }
  const body = senseLabel(word, tables, ctx);
  if (word.family.kind === "hook") return body;
  const prefix =
    word.gl ? "gl" : word.bl ? "bl" : (word.pos ?? "");
  if (!prefix) return body;
  return `${prefix}-${body}`;
}

/** Morph line for an Ageben string: words joined by ` | `, units in `[ … ]` (glosses.md § Phrase brackets). */
export type MorphGlossOptions = {
  /** Throw when the sentence does not parse, instead of glossing word by word (lint uses this). */
  strict?: boolean;
};

export function morphGlossLine(text: string, tables: ClassifyTables, options: MorphGlossOptions = {}): string {
  return withLexiconClosedRoots(tables.published, () => morphGlossLineIn(text, tables, options));
}

function morphGlossLineIn(text: string, tables: ClassifyTables, options: MorphGlossOptions): string {
  const normalized = normalizeAgeben(text);
  const finalMark = text.trim().match(/[?!]$/)?.[0];
  const { words, ctxByIndex, parsed } = analyzeLine(normalized, tables, options);
  const braces: number[] = [];
  /** Sentence mark after word index (`.` / `?` / `!`). */
  const marks = new Map<number, string>();
  /** Tone mark before word index: attached (`!`) or free-standing (its own `! | ` slot). */
  const tones = new Map<number, string>();
  /** Tone mark before an island's opening `{`, by the island's first word index: colors the `SCOPE[…]`. */
  const islandTones = new Map<number, string>();
  let wordIdx = 0;
  for (let { text: chunk } of scanChunks(normalized)) {
    const tone = toneMarkLength(chunk, 0);
    if (tone) {
      tones.set(wordIdx, chunk.length === tone ? `${chunk} | ` : chunk.slice(0, tone));
      chunk = chunk.slice(tone);
      if (!chunk) continue;
    }
    if (chunk === "{" || chunk === "}") {
      if (chunk === "{" && tones.has(wordIdx)) {
        islandTones.set(wordIdx, tones.get(wordIdx)!);
        tones.delete(wordIdx);
      }
      braces.push(wordIdx);
      continue;
    }
    const mark = chunk.match(/[.?!]$/)?.[0];
    const peeled = mark ? chunk.slice(0, -1) : chunk;
    if (peeled) wordIdx += 1;
    if (mark && wordIdx > 0) marks.set(wordIdx - 1, mark);
  }
  const tree = (parsed && buildGlossTree(parsed, words)) || tokenGlossTree(words, braces);
  markIslandTones(tree, islandTones);
  const leaf = (node: { i: number; named?: boolean }) => {
    const gloss = (tones.get(node.i) ?? "") + wordGloss(words[node.i]!, tables, ctxByIndex[node.i] ?? {});
    return node.named ? gloss.replace(/\.named$/, "") : gloss;
  };
  // Sentences: internal marks sit between them (` . `); a final `?` / `!` trails; a final `.` is implicit.
  const sentences: { nodes: GlossNode[]; mark?: string }[] = [{ nodes: [] }];
  for (const node of tree) {
    sentences[sentences.length - 1]!.nodes.push(node);
    const last = lastLeafIndex(node);
    const mark = last === undefined ? undefined : marks.get(last);
    if (mark) {
      sentences[sentences.length - 1]!.mark = mark;
      sentences.push({ nodes: [] });
    }
  }
  if (sentences.length > 1 && sentences[sentences.length - 1]!.nodes.length === 0) sentences.pop();
  let out = "";
  sentences.forEach((sentence, k) => {
    out += renderGlossNodes(sentence.nodes, leaf);
    const final = k === sentences.length - 1;
    if (!final) out += ` ${sentence.mark ?? "."} `;
  });
  if (finalMark) out += ` ${finalMark}`;
  return out;
}

/** Put each island's tone mark on its `SCOPE[…]` group. */
function markIslandTones(nodes: GlossNode[], islandTones: Map<number, string>): void {
  for (const node of nodes) {
    if (node.t !== "group") continue;
    const first = firstLeafIndex(node);
    if (node.label === "SCOPE" && first !== undefined && islandTones.has(first)) node.tone = islandTones.get(first);
    markIslandTones(node.kids, islandTones);
  }
}

function firstLeafIndex(node: GlossNode): number | undefined {
  if (node.t === "leaf") return node.i;
  if (node.t !== "group") return undefined;
  for (const kid of node.kids) {
    const i = firstLeafIndex(kid);
    if (i !== undefined) return i;
  }
  return undefined;
}

/** Last word index a node covers, including a spoken span's folded close word. */
function lastLeafIndex(node: GlossNode): number | undefined {
  if (node.t === "leaf") return node.i;
  if (node.t !== "group") return undefined;
  for (let k = node.kids.length - 1; k >= 0; k--) {
    const found = lastLeafIndex(node.kids[k]!);
    if (found !== undefined) return found;
  }
  return undefined;
}

/** Each word's leaf gloss in its line context (inverse index input). */
export function morphGlossWords(text: string, tables: ClassifyTables): { raw: string; gloss: string }[] {
  const { words, ctxByIndex } = analyzeLine(normalizeAgeben(text), tables);
  return words.map((word, i) => ({ raw: word.raw, gloss: wordGloss(word, tables, ctxByIndex[i] ?? {}) }));
}

/** Per-word bracket marks for the gloss overlay (same tree as {@link morphGlossLine}). */
export function morphGlossBrackets(text: string, tables: ClassifyTables): WordBrackets[] {
  const normalized = normalizeAgeben(text);
  const { words, parsed } = analyzeLine(normalized, tables);
  const braces: number[] = [];
  let wordIdx = 0;
  for (const { text: raw } of scanChunks(normalized)) {
    const chunk = raw.slice(toneMarkLength(raw, 0));
    if (chunk === "{" || chunk === "}") braces.push(wordIdx);
    else if (chunk.replace(/[.?!]$/, "")) wordIdx += 1;
  }
  const tree = (parsed && buildGlossTree(parsed, words)) || tokenGlossTree(words, braces);
  return bracketsByWord(tree, words.length);
}

/** Quoted pass-through payload (`"…"`, inner `"` doubled). */
export function quotePayload(payload: string): string {
  return `"${payload.replace(/"/g, '""')}"`;
}

/** One leaf of the morph line; written spans render as a labeled bracket. */
/** Word indexes of scale numbers: a digitless `+` right after a rank join ([comparatives § Amount scale](../../docs/grammar/comparative-arity.md#amount-scale)). */
function scaleIndexes(parsed: ParseResult | undefined): Set<number> {
  const out = new Set<number>();
  if (!parsed) return out;
  visitResult(parsed, {
    enter(node) {
      if (node.kind === "shared" && isScaleShared(node.item) && node.item.word.at !== undefined) out.add(node.item.word.at);
    },
  });
  return out;
}

/** What each PoS's scale number ranks: how many, how often, how late. */
const SCALE_GLOSS: Record<string, string> = { g: "amount", h: "how-often", b: "later" };

const FRACTION_NAMES: Record<number, string> = { 2: "half", 3: "third", 4: "quarter" };

/** `/ɡ/` `g-N` (whole N ≥ 2) right after a plain **-l** noun ([numbers-applied § Fractions](../../docs/grammar/measures-and-percent.md#fractions)). */
function isFraction(word: LexWord, prev: LexWord | undefined): boolean {
  const family = word.family;
  if (family.kind !== "number" || word.pos !== "g" || family.stem.marker !== "-" || family.stem.digitlessExp) return false;
  const [group, ...rest] = family.stem.groups;
  if (!group?.mantissa || rest.length || group.exponentDigits || group.decimal || group.percent) return false;
  if (Number(group.mantissa) < 2) return false;
  if (isCountBefore(prev)) return true;
  return prev?.family.kind === "content" && (prev.ending === "l" || prev.ending === "ln") && (prev.pos === "z" || prev.pos === "d" || prev.pos === "b");
}

/** A plain `/ɡ/` count (`g+N`) right before `g-M`: the numerator of *two thirds*, in any slot, after a unit too. */
function isCountBefore(prev: LexWord | undefined): boolean {
  if (prev?.family.kind !== "number" || prev.pos !== "g" || prev.ending !== "l") return false;
  const { marker, groups, digitlessExp } = prev.family.stem;
  const only = groups[0];
  return (
    (marker === "+" || marker === "ra") &&
    !digitlessExp &&
    groups.length === 1 &&
    !!only?.mantissa &&
    !only.exponentDigits &&
    !only.decimal &&
    !only.percent
  );
}

function fractionGloss(word: LexWord): string {
  const family = word.family as Extract<LexWord["family"], { kind: "number" }>;
  const n = Number(family.stem.groups[0]!.mantissa);
  return `g-${FRACTION_NAMES[n] ?? `one-${ordinalEnglish(n)}`}-of`;
}

function wordGloss(word: LexWord, tables: ClassifyTables, ctx: MorphGlossContext): string {
  if (ctx.fraction) return fractionGloss(word);
  if (ctx.scale && word.family.kind === "number" && word.pos && SCALE_GLOSS[word.pos]) {
    const about = word.family.writingEndingMark === "~" || word.ending === "m" ? ".about" : "";
    return `${word.pos}-${SCALE_GLOSS[word.pos]}${about}`;
  }
  const family = word.family;
  if (family.kind !== "writingSpan") return morphGlossFor(word, tables, ctx);
  let payload = family.payload.trim();
  // Written editorial `#]` / close-all `|]` / both `#|]` (spans.md § Close).
  const closeMatch = payload.match(/(?:^|\s|(?<=[a-z]))(#?\|?)$/);
  const close = closeMatch?.[1] ?? "";
  if (close) payload = payload.slice(0, -close.length).trim();
  const instance = family.marks.includes("^@");
  const named = instance || family.marks.includes("@") ? "NAME." : "";
  const about = family.marks.includes("~") ? ".about" : "";
  const label = `${named}${WRITTEN_SPAN[family.bracket]}${instance ? ".instance" : ""}${about}`;
  const prefix = word.gl ? "gl-" : word.bl ? "bl-" : word.pos ? `${word.pos}-` : "";
  let inner = "";
  if (payload) {
    if (family.bracket === "<") inner = quotePayload(payload);
    else {
      try {
        inner = unwrapLoneBracket(morphGlossLine(payload, tables));
      } catch {
        inner = quotePayload(payload);
      }
    }
  }
  return `${prefix}${label}[${inner}]${close}`;
}

function analyzeLine(
  text: string,
  tables: ClassifyTables,
  options: MorphGlossOptions = {},
): { words: LexWord[]; ctxByIndex: MorphGlossContext[]; parsed?: ParseResult } {
  const morphWords = parseWords(text);
  const words = classifyAll(morphWords, tables);

  let parsed: ParseResult | undefined;
  try {
    parsed = parseWithTables(text, tables);
  } catch (error) {
    if (options.strict) throw error;
    parsed = undefined;
  }
  // A listed citation is a same-role word only in a clause, which the parse knows (same-role-words.md).
  if (parsed) {
    visitResult(parsed, {
      word(word) {
        if (word.reading === "sameRole" && word.at !== undefined && words[word.at]) words[word.at] = word;
      },
    });
  }

  const dependentVerbIndexes = new Set<number>();
  const collectClause = (clause: ParseResult["utterances"][number]["bodies"][number]["clause"]): void => {
    const dependent = clause.dependent;
    if (!dependent) return;
    if (dependent.orodo.pos === "v" && dependent.orodo.at !== undefined) dependentVerbIndexes.add(dependent.orodo.at);
    collectClause(dependent.clause);
  };
  parsed?.utterances.forEach((utterance) => utterance.bodies.forEach((body) => collectClause(body.clause)));

  // A lone join word is a form citation (`zam` = z-and.open), not a standalone join.
  const citation = words.length === 1;
  const standaloneIndexes = citation ? new Set<number>() : standaloneJoinIndexes(words, parsed);
  const kindIndexes = citation ? new Set<number>() : kindReferenceIndexes(parsed);
  const scaleWords = scaleIndexes(parsed);
  const hookJobs = parsed ? hookJobsByPosition(parsed) : new Map<number, HookJob>();
  const ctxByIndex = words.map((word, index) => {
    const ctx = contextFor(word, index, words, parsed?.resolve, hookJobs, dependentVerbIndexes.has(index));
    if (standaloneIndexes.has(index)) ctx.standaloneJoin = true;
    if (kindIndexes.has(index)) ctx.kindReference = true;
    if (scaleWords.has(index)) ctx.scale = true;
    if (isFraction(word, words[index - 1])) ctx.fraction = true;
    return ctx;
  });
  markShorthandRuns(words, ctxByIndex);
  return { words, ctxByIndex, parsed };
}

/** Word indexes of join closes whose coord part has no items. */
function standaloneJoinIndexes(words: LexWord[], parsed: ParseResult | undefined): Set<number> {
  const out = new Set<number>();
  if (!parsed) return out;
  visitResult(parsed, {
    join(join, site) {
      // Clause chain: only a lone link with no clause on either side stands alone (`xal.` / stand-in `xal`).
      // A part with no items after an earlier part closes over that part (`vawalal vurunul val vul`), so only a first part can stand alone.
      const standalone =
        site.kind === "clauseCoord"
          ? !site.coord.first && site.coord.links.length === 1 && !site.coord.links[site.index]!.clause
          : site.index === 0 && site.coord.parts[0]!.items.length === 0;
      const word = join.at === undefined ? undefined : words[join.at];
      if (standalone && word && closesAlone(word)) out.add(join.at!);
    },
    // A join that is the whole hosted `/b/` (`hewom blal` *like nothing*), or a hooked join's whole landmark, has no items either.
    word(word, slot) {
      if ((slot === "bound" || slot === "joinLandmark") && word.at !== undefined && closesAlone(word)) out.add(word.at);
    },
  });
  return out;
}

function closesAlone(word: LexWord): boolean {
  return word.family.kind === "joinMarker" && word.reading === "join";
}

/** Word indexes of kind-reference joins (`zuan` + kind). */
function kindReferenceIndexes(parsed: ParseResult | undefined): Set<number> {
  const out = new Set<number>();
  if (!parsed) return out;
  visitResult(parsed, {
    join(join, site) {
      if (site.kind === "np" && join.at !== undefined && isKindReference(site.coord.parts[site.index]!)) out.add(join.at);
    },
  });
  return out;
}

function contextFor(
  word: LexWord,
  index: number,
  words: LexWord[],
  resolve: ResolveInfo | undefined,
  hookJobs: Map<number, HookJob>,
  dependentVerb = false,
): MorphGlossContext {
  const ctx: MorphGlossContext = {};
  if (dependentVerb) ctx.dependentVerb = true;
  if (resolve) {
    const bind = bindFor(word, resolve.anaphors);
    if (bind?.antecedent) ctx.antecedent = rootAntecedent(bind.antecedent, resolve.anaphors);
    ctx.fillAsk = isFillAsk(word, resolve.asks);
  }
  if (word.family.kind === "hook") ctx.hookJob = hookJobs.get(word.at ?? -1);
  if (word.reading === "restrictor") {
    const prev = words[index - 1];
    ctx.restrictorListed = Boolean(prev && (prev.pos === "h" || prev.pos === "th" || prev.pos === "w"));
  }
  return ctx;
}

function bindFor(word: LexWord, binds: AnaphorBind[]): AnaphorBind | undefined {
  if (word.ending !== "r" || word.family.kind === "joinMarker" || word.at === undefined) return undefined;
  return binds.find((bind) => bind.pronoun.at === word.at);
}

/** A resume of a resume (`zazawar … zazawar`) glosses the original referent, not `←←`. */
function rootAntecedent(antecedent: LexWord, binds: AnaphorBind[]): LexWord {
  let current = antecedent;
  const seen = new Set<LexWord>();
  while (current.ending === "r" && !seen.has(current)) {
    seen.add(current);
    const next = binds.find((bind) => bind.pronoun === current)?.antecedent;
    if (!next) break;
    current = next;
  }
  return current;
}

function isFillAsk(word: LexWord, asks: AskRecord[]): boolean {
  if (word.at === undefined) return false;
  return asks.some(
    (ask) =>
      ((ask.kind === "fillAsk" || ask.kind === "rhetorical") && ask.gaps.some((gap) => gap.at === word.at)) ||
      (ask.inner?.some((gap) => gap.at === word.at) ?? false),
  );
}

export function sensePieces(
  word: LexWord,
  tables: ClassifyTables,
  ctx: MorphGlossContext,
): string[] {
  const family = word.family;
  // A tag glosses its letter name, never the referent: `tag.A` assigns, `←tag.A` recalls, `←tag.A.part` shares;
  // a pseudonym is a name, so `tag.A.name` takes no arrow whether it assigns or recalls; a pair is `←tag.A+E` (glosses.md § Anaphors).
  if (family.kind === "tag") {
    const name = `tag.${family.vowels.map((vowel) => vowel.toUpperCase()).join("+")}`;
    if (word.ending === "n") return [`${name}.name`];
    return [word.ending === "l" ? name : `←${name}${word.ending === "m" ? ".part" : ""}`];
  }
  // A say word: reach, whose say, the answer, and how it stands (`h-episode-patient-ALLOW-said`; glosses.md § Say words).
  if (family.kind === "say") {
    return [[REACH_VOWEL[family.reach] ?? "reach", SAY_PART[family.part], SAY_ANSWER[family.answer], SAY_ENDING[word.ending ?? ""] ?? "say"].join("-")];
  }
  const resume =
    (word.ending === "r" || (family.kind === "x" && family.xFamily === "pointer")) &&
    // A holder or lateral keeps its host or direction; its anchor glosses inside xPieces.
    !(family.kind === "x" && (family.xFamily === "holder" || family.xFamily === "lateral")) &&
    word.reading !== "sake" &&
    word.reading !== "ability" &&
    family.kind !== "joinMarker";
  if (resume) {
    // A role pointer glosses its reach, part, and which event, never the referent (glosses.md § Anaphors).
    if (family.kind === "x" && family.xFamily === "pointer") {
      return [`←${pointerFront(family.reachVowel, family.part)}.${POINTER_VOWEL[family.pointerVowel ?? ""] ?? "pointer"}${POINTER_ENDING[word.ending ?? ""] ?? ""}`];
    }
    if (ctx.antecedent) {
      // A role-compound resume keeps its reach and part, so the doer and undergoer of one event stay apart (glosses.md § Round trip).
      if (family.kind === "x" && family.xFamily === "role" && !word.overlay) {
        // After an earlier role compound of the same event, only its stem (`←episode-agent-walk`).
        const prior = ctx.antecedent.family;
        const stem =
          prior.kind === "x" && prior.xFamily === "role"
            ? (prior.rightRoots ?? []).map((root) => rootSense(root, ctx.antecedent!.ending, tables, { pos: ctx.antecedent!.pos })).join("-x-")
            : senseLabel(ctx.antecedent, tables, {});
        return [`←${roleFront(family.reachVowel, family.part)}-${stem}`];
      }
      return [`←${senseLabel(ctx.antecedent, tables, {})}`];
    }
    if (family.kind === "content") {
      const house = family.roots.map((root) => houseCast()[root]).find(Boolean);
      if (house) return [`←${house}`];
      // No antecedent: the stem's own sense, or the stem itself (glosses.md § Anaphors).
      // Overlay -r (map resolution, changeability, …) is an ending, not a resume.
      if (!word.overlay) {
        const stem = family.roots.join("");
        const body = contentBody(word, family.roots, tables);
        if (body === stem) return [`←${quotePayload(stem)}`];
        return [`←${body}`];
      }
    }
  }
  switch (family.kind) {
    case "hook":
      return [hookLabel(family.form, ctx)];
    case "joinMarker": {
      const label = joinMarkerLabel(word, ctx);
      return [family.hook ? `${hookedJoinHookLabel(family.hook, word.pos)}-x-${label}` : label];
    }
    case "number":
      if (isDigitlessNumberBlank(word)) {
        const blank = NUMBER_BLANK[family.stem.marker];
        if (blank) return [ctx.fillAsk ? blank.ask : blank.some];
      }
      return [
        `${numberLabel(family.stem, word.pos)}${numberMarkSuffix(word, ctx)}${numberSurfaceSuffix(word.raw, family.stem, ctx)}`,
      ];
    case "x":
      return xPieces(word, tables, ctx.antecedent);
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
