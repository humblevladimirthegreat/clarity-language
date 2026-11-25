/** Word-shape checks, run on the token stream before the sentence grammar: each word's slot, ending and plural, tone marks, and `bl-` hosts. */
import type { IToken } from "chevrotain";
import { CLOSED } from "../closed-roots.js";
import { type ClassifyTables, clauseSentences, isSameRoleRoot, isStandIn, isHolderSeamW, arrowRoots } from "./classify.js";
import { enforceRetiredWord } from "./enforce-retired.js";
import { ConstructionError, isAny } from "./enforce.js";
import { series } from "./enforce-structure.js";
import { isTopicSpan, isTopicCompound, linkerEnglish } from "./linkers.js";
import { rolePronounRoots, isGenericPronoun } from "./resolve.js";
import { joinHook, POINT_BACK_HOOKS, TIME_JOINS, TIME_HOOKS } from "./series.js";
import { Tone, Period, QMark, Bang, IslandOpen, IslandClose, type TokenPayload, isLexWordPayload, HostedB, HostedOdo, LateOdo, HostedBJoined, W, GPlain, B, JoinB, classifyTokenBranch } from "./tokens.js";
import type { LexWord, ToneRecord, ToneScope, NumberStem, NumberMarker } from "./types.js";
import { slotAllows, type WordSlots } from "./word-slots.js";

/** Slot-rule parts: the participant that sat in that slot (roles.md#role-compounds). */
const SLOT_PARTS = new Set(["z", "d", "b"]);

/**
 * A hooked join goes on `/z/`, `/d/`, `/b/` or `/h/`, never hosted (hooked-joins.md#hooked-joins). Its point-back is a hook
 * that points back on its own. On `/h/` the join is a bare restrictor and the hook one with a time reading.
 */
function enforceHookedJoinWord(word: LexWord, slots: WordSlots): void {
  const hook = joinHook(word);
  if (!hook) return;
  if (!word.pos || !slotAllows(slots, "hooked join", word.pos) || word.bl) throw new ConstructionError("hookedJoinSlot", word.raw);
  if (hook.endsWith("r") && !POINT_BACK_HOOKS.has(hook)) throw new ConstructionError("hookedJoinPointBack", word.raw);
  if (word.pos !== "h") return;
  if (word.reading !== "restrictor" || !TIME_JOINS.has(series(word)! + word.ending)) throw new ConstructionError("hookedJoinRestrictor", word.raw);
  if (!TIME_HOOKS.has(hook)) throw new ConstructionError("hookedJoinTime", word.raw);
}

const TONE_MARKS: Record<string, string> = {
  "!": "strong",
  "?": "unsure",
  "%": "joking",
  "&": "contrast",
  ";": "warm",
};

/** A stack is `! ? % & ;` in any order, each at most twice. Returns the mark names, or undefined. */
function toneStackNames(mark: string): string[] | undefined {
  const counts = new Map<string, number>();
  for (const char of mark) counts.set(char, (counts.get(char) ?? 0) + 1);
  const names: string[] = [];
  for (const [char, count] of counts) {
    const name = TONE_MARKS[char];
    if (!name || count > 2) return undefined;
    names.push(count === 2 ? `${name}2` : name);
  }
  return names;
}

/**
 * Tone-mark placement (speech-moves.md § tone marks). A mark is a valid mark
 * attached to a word, an island's opening `{`, or a span, or free-standing
 * before words of the same sentence. Returns the tokens without tone marks, the
 * `tone.*` constructions they used, and a record of each mark: what it colors.
 */
export function enforceTones(tokens: IToken[]): { tokens: IToken[]; constructions: string[]; tones: ToneRecord[] } {
  const kept: IToken[] = [];
  const constructions = new Set<string>();
  const tones: ToneRecord[] = [];
  tokens.forEach((token, i) => {
    if (token.tokenType !== Tone) {
      kept.push(token);
      return;
    }
    const { mark, attached } = token.payload as { mark: string; attached: boolean };
    const names = toneStackNames(mark);
    if (!names) throw new ConstructionError("toneStack", `"${mark}"`);
    const next = tokens[i + 1];
    let scope: ToneScope;
    if (!next || next.tokenType === Period || next.tokenType === QMark || next.tokenType === Bang) {
      throw new ConstructionError("toneTarget", `"${mark}" before ${next ? `"${next.image}"` : "the end"}`);
    } else if (!attached) {
      // Marks in a row are a stack even when spaced (`! ! zazawan`, `! !zazawan`).
      if (next.tokenType === Tone) throw new ConstructionError("toneStack", `"${mark} ${next.image}"`);
      scope = "rest";
    } else if (next.tokenType === IslandOpen) {
      scope = "island";
    } else if (next.tokenType === IslandClose) {
      throw new ConstructionError("toneTarget", `"${mark}" on a closing }`);
    } else if (isWritingSpan(next)) {
      scope = "span";
    } else if (next.tokenType === Tone) {
      throw new ConstructionError("toneStack", `"${mark}${next.image}"`);
    } else {
      scope = "word";
    }
    for (const name of names) constructions.add(`tone.mark.${name}`);
    if (names.length > 1) constructions.add("tone.mark.stack");
    constructions.add(`tone.scope.${scope}`);
    const words = tonedWords(tokens, i + 1, scope);
    const at = words[0]?.at;
    const before = tokens[i - 1];
    const initial = scope === "rest" && (!before || before.tokenType === Period || before.tokenType === QMark || before.tokenType === Bang);
    if (at !== undefined) tones.push({ mark, names, scope, at, words, ...(initial ? { initial: true as const } : {}) });
  });
  return { tokens: kept, constructions: [...constructions], tones };
}

/**
 * The words a tone colors, from the token after the mark: that word or span, the island up to its `}`, or, for a
 * free-standing mark, the words up to the period or the next free-standing mark, which takes over from its place on.
 */
function tonedWords(tokens: IToken[], from: number, scope: ToneScope): LexWord[] {
  const wordOf = (token: IToken | undefined): LexWord | undefined => {
    const payload = token?.payload as TokenPayload | undefined;
    return payload && isLexWordPayload(payload) ? payload : undefined;
  };
  if (scope === "word" || scope === "span") {
    const word = wordOf(tokens[from]);
    return word ? [word] : [];
  }
  const words: LexWord[] = [];
  let depth = 0;
  for (let i = from; i < tokens.length; i++) {
    const token = tokens[i]!;
    if (scope === "rest" && token.tokenType === Period) break;
    if (scope === "rest" && token.tokenType === Tone && !(token.payload as { attached: boolean }).attached) break;
    if (scope === "island" && token.tokenType === IslandOpen) depth++;
    if (scope === "island" && token.tokenType === IslandClose && --depth === 0) break;
    const word = wordOf(token);
    if (word) words.push(word);
  }
  return words;
}

/** A written span fence (`d[…]`, `th(…)`, `@<Sam>`), one token. */
function isWritingSpan(token: IToken): boolean {
  return /[[({<]/.test(token.image);
}

/** In a clause, a bare word on a same-role root ends in **-m** or **-l**; **-n** and **-r** have no reading (same-role-words.md). */
export function enforceSameRoleEndings(tokens: IToken[], tables: ClassifyTables): void {
  const words: LexWord[] = [];
  const sentenceOf: number[] = [];
  let sentence = 0;
  for (const token of tokens) {
    if (isAny(token, [Period, QMark, Bang])) sentence += 1;
    const payload = token.payload as TokenPayload | undefined;
    if (!payload || !isLexWordPayload(payload)) continue;
    words.push(payload);
    sentenceOf.push(sentence);
  }
  const clauses = clauseSentences(words, sentenceOf);
  words.forEach((word, i) => {
    if (!clauses.has(sentenceOf[i]!) || word.reading === "sameRole" || (word.ending !== "n" && word.ending !== "r")) return;
    if (isSameRoleRoot(word, tables)) throw new ConstructionError("sameRoleEnding", word.raw);
  });
}

/**
 * A `bl-` word completes the `/ɡ/`, `/h/` or `/th/` word or the hooked join right before it, so it needs that host; a
 * plain `/b/` there is the recipient. In a hosted list every `/b/` item takes `bl-`, and the join word does not
 * (clause.md#extra-nouns). Only an `/h/` hooked join takes a clause (hooked-joins.md#hooked-joins-clause).
 */
export function enforceLocks(tokens: IToken[]): void {
  let list = false;
  let prev: LexWord | undefined;
  for (const [i, token] of tokens.entries()) {
    const before = prev;
    const word = tokenWord(token);
    prev = word;
    if (!word) continue;
    if (isAny(token, [HostedB, HostedOdo, LateOdo])) {
      // The parse marks a list at its second `bl-` word; it is one only if a `/b/` join closes it.
      list = token.tokenType === HostedBJoined && hostedListCloses(tokens, i + 1);
      continue;
    }
    if (list && word.pos === "b" && word.family.kind !== "hook") {
      if (word.family.kind === "joinMarker" && !word.bl) {
        list = false;
        continue;
      }
      if (!word.bl) throw new ConstructionError("blListItem", word.raw);
      continue;
    }
    if (list && !isAny(token, [W, GPlain])) list = false;
    if (word.bl && joinHook(before) && isStandIn(word)) throw new ConstructionError("hookedJoinClause", `${before!.raw} ${word.raw}`);
    if (word.bl) throw new ConstructionError("blNoHost", word.raw);
  }
}

/** `/b/` words from `from`, then a `/b/` join. */
function hostedListCloses(tokens: IToken[], from: number): boolean {
  let at = from;
  while (tokens[at]?.tokenType === B) at += 1;
  return tokens[at]?.tokenType === JoinB;
}

function tokenWord(token: IToken | undefined): LexWord | undefined {
  const payload = token?.payload as TokenPayload | undefined;
  return payload && isLexWordPayload(payload) ? payload : undefined;
}

/**
 * Which slots a span fence fills (spans.md#pos): an aside only under `/th/`, `/ɡ/` (and `gl-`), `/w/`,
 * or `/h/`; a cite, mention or opaque in a content slot or `/w/` (never `/th/`) or as an `/x/` topic word.
 * An aside resume (`dexur`) may recast the aside into another slot.
 */
function enforceSpanSlot(word: LexWord, slots: WordSlots): void {
  const family = word.family;
  if (family.kind !== "writingSpan" || word.pos === "y" || !word.pos) return;
  if (word.pos === "x") {
    if (!isTopicSpan(word)) throw new ConstructionError("spanSlot", word.raw);
    return;
  }
  if (!slotAllows(slots, family.bracket === "(" ? "aside span" : "cite, mention or opaque span", word.pos)) throw new ConstructionError("spanSlot", word.raw);
}

/** **-ln** and span `^@` name one thing a name applies to: a noun slot or a citation only (proper-names.md#name-instance--ln). */
function enforceNameInstance(word: LexWord, slots: WordSlots): void {
  if (word.ending !== "ln") return;
  if (word.gl || (word.pos && !slotAllows(slots, "name instance -ln", word.pos))) throw new ConstructionError("nameInstanceSlot", word.raw);
  const roots = word.family.kind === "content" ? word.family.roots : [];
  if (roots.some((root) => rolePronounRoots().has(root) || root === CLOSED.star || root === CLOSED.person)) {
    throw new ConstructionError("nameInstanceSlot", word.raw);
  }
}

/** Stacked join **-r** (`zuar` / `vaor` / `xuar` / `gaor`) has no reading outside the `/th/` fill-ask (verb-and-stance-joins.md § Standalone stance joins). */
function enforceStackedJoinR(word: LexWord): void {
  const family = word.family;
  if (family.kind !== "joinMarker" || word.ending !== "r" || family.series.length < 2) return;
  if (["z", "d", "b", "v", "x", "g"].includes(word.pos ?? "")) throw new ConstructionError("stackedJoinResume", word.raw);
}

/** A stand-in fills a `/z/` `/d/` `/b/` slot; `/v/` has the verbal dependents (dependents.md § Stand-in vowels). */
function enforceStandInRole(word: LexWord): void {
  const family = word.family;
  if (family.kind !== "joinMarker" || family.series.length !== 1 || !"aoeu".includes(family.series)) return;
  if (!["rl", "rm", "rth", "rn"].includes(word.ending ?? "")) return;
  if (["g", "h", "w", "th"].includes(word.pos ?? "")) throw new ConstructionError("standInRole", word.raw);
}

/** Stacked range hook **-r** (`oer` / `uar` / `uor`) is only a range member between same-role words (ranges.md#ranges). `aor` / `aer` / `uer` with nothing on the right point back (extra noun); between same-role words `aor` / `uer` are range members. */
export function enforceStackedHookR(word: LexWord, tokens: IToken[], i: number): void {
  if (word.family.kind !== "hook" || word.ending !== "r" || word.family.form.length < 3) return;
  if (["ao", "ae", "ue"].includes(word.family.form.slice(0, -1))) return;
  let j = i - 1;
  while (tokenWord(tokens[j])?.pos === "w") j -= 1;
  const prev = tokenWord(tokens[j]);
  const next = tokenWord(tokens[i + 1]);
  if (!prev?.pos || prev.pos !== next?.pos) throw new ConstructionError("stackedHookResume", word.raw);
}

export function enforceWord(word: LexWord, tables: ClassifyTables): void {
  const slots = tables.wordSlots;
  enforceHookedJoinWord(word, slots);
  // A holder names people, so it takes -x like any noun (`thodumazawanx`, holder.md#naming-a-holder).
  const holder = word.family.kind === "x" && word.family.xFamily === "holder";
  // A topic word is a noun, so it takes -x like one (`xazawanx`, topic.md#topic-groups); a published linker does not.
  const topic = word.pos === "x" && (word.family.kind === "content" || isTopicCompound(word)) && !linkerEnglish(word);
  if (word.plural && word.pos && !slotAllows(slots, "plural -x", word.pos) && !holder && !topic) {
    throw new ConstructionError("pluralOnPos", word.raw);
  }
  const stemRoot = word.family.kind === "content" && word.family.roots.length === 1 ? word.family.roots[0] : undefined;
  const nounish = word.pos === "z" || word.pos === "d" || word.pos === "b" || word.pos === "x";
  if (nounish && stemRoot === CLOSED.star && (word.ending === "r" || (word.ending === "n" && word.pos === "x"))) {
    throw new ConstructionError("topicOfTopic", word.raw);
  }
  if (word.family.kind === "tag") enforceTag(word, slots);
  if (isHolderSeamW(word, tables)) throw new ConstructionError("holderSeamW", word.raw);
  // The speaker is never a holder: your own view needs no seam (D-68, holder.md#what-the-holder-covers).
  if (holder && word.family.kind === "x" && word.family.rightRoots?.[0] === CLOSED.microphone) throw new ConstructionError("holderSeamSpeaker", word.raw);
  enforceJoinPlural(word);
  enforceRetiredWord(word, stemRoot);
  if (word.pos === "th" && word.family.kind === "number") enforceStanceNumber(word, word.family.stem);
  if (word.pos === "w" && word.family.kind === "number") enforceDegreeNumber(word, word.family.stem);
  if (word.plural && isGenericPronoun(word)) throw new ConstructionError("genericPlural", word.raw);
  if (word.plural && word.family.kind === "number" && !isPluralLabel(word)) {
    throw new ConstructionError("numberPlural", word.raw);
  }
  if (word.plural && word.pos === "y" && classifyTokenBranch(word).branch === "yInterjection") {
    throw new ConstructionError("pluralInterjection", word.raw);
  }
  const family = word.family;
  // Under `/y/` only an opaque or cite span calls or reacts (spans.md#y-spans).
  if (word.pos === "y") {
    if (family.kind === "writingSpan" && family.bracket === "(") throw new ConstructionError("ySpanType", word.raw);
  }
  enforceSpanSlot(word, slots);
  enforceNameInstance(word, slots);
  enforceStackedJoinR(word);
  enforceStandInRole(word);
  if (family.kind === "x" && family.xFamily === "sake") {
    if (word.pos && !slotAllows(slots, "sake word", word.pos)) throw new ConstructionError("sakeSlot", word.raw);
    if (family.stanceVowel && family.stanceVowel.length > 1) throw new ConstructionError("sakeStackedVowel", word.raw);
    if (family.horizon && (family.stanceVowel === "e" || word.ending === "n")) {
      throw new ConstructionError("emotionTail", word.raw);
    }
    if (family.stanceVowel === "e" && word.pos && !slotAllows(slots, "prescription", word.pos)) throw new ConstructionError("prescriptionSlot", word.raw);
    if (word.ending === "n") throw new ConstructionError("sakeEnding", word.raw);
  }
  // A sake root + `th` + vowel + **-n** + tail is not a lateral; a sake word never takes **-n** (sakes.md#word-shape).
  if (family.kind === "x" && family.xFamily === "lateral" && family.leftRoots.some((root) => tables.sakeRoots.has(root))) {
    throw new ConstructionError("sakeEnding", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "scope") {
    if (word.pos && !slotAllows(slots, "label reach", word.pos)) throw new ConstructionError("labelReachSlot", word.raw);
    if (family.leftRoots.some((root) => arrowRoots().has(root))) throw new ConstructionError("labelReachArrow", word.raw);
    if (word.ending === "n" && family.leftRoots.some((root) => rolePronounRoots().has(root))) throw new ConstructionError("labelReachStem", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "role" && !word.overlay) {
    const callEnding = word.ending === "n" || word.ending === "r";
    const actingAs = word.pos === "h" && !!family.part && SLOT_PARTS.has(family.part);
    if (
      word.pos &&
      (!slotAllows(slots, "role compound", word.pos) || (word.pos === "y" && !callEnding) || (word.pos === "h" && !actingAs))
    ) {
      throw new ConstructionError("roleCompoundSlot", word.raw);
    }
    if (word.ending === "n" && (family.rightRoots ?? []).some((root) => rolePronounRoots().has(root))) {
      throw new ConstructionError("roleCompoundStem", word.raw);
    }
  }
  if (family.kind === "x" && family.xFamily === "hookPrefix" && word.pos && !slotAllows(slots, "hook prefix", word.pos)) {
    throw new ConstructionError("hookPrefixSlot", word.raw);
  }
  if (family.kind === "x" && family.xFamily === "ability" && word.reading === "ability" && word.pos) {
    const hostless = tables.hostlessAbilityRoot !== null && family.leftRoots[0] === tables.hostlessAbilityRoot;
    if (!slotAllows(slots, "ability", word.pos) && !hostless) throw new ConstructionError("abilitySlot", word.raw);
  }
}

/** The one plain-digit group of a stem (`#2`), else undefined: no exponent, decimal, percent or digitless exponent. */
function plainDigits(stem: NumberStem): number | undefined {
  const only = stem.groups[0];
  if (stem.groups.length !== 1 || stem.digitlessExp || !only || only.exponentDigits || only.exponentSign || only.decimal || only.percent) {
    return undefined;
  }
  return /^\d+$/.test(only.mantissa ?? "") ? Number(only.mantissa) : undefined;
}

const isMinus = (m: NumberMarker) => m === "-" || m === "ru";

export const isRankMarker = (m: NumberMarker) => m === "#" || m === "ro";

/** `/th/` + number (numbers.md § Number as stance): `+` likelihood, `_` source, `#N` Nth-hand from 2. */
function enforceStanceNumber(word: LexWord, stem: NumberStem): void {
  const { marker, groups } = stem;
  if (marker === "#-" || marker === "ruo" || (isMinus(marker) && groups.length > 0)) {
    throw new ConstructionError("stanceNumber", word.raw);
  }
  if (!isRankMarker(marker)) return;
  const blank = word.ending === "r" && groups.length === 0 && !stem.digitlessExp;
  const depth = plainDigits(stem);
  if (!blank && (depth === undefined || depth < 2)) throw new ConstructionError("handDepth", word.raw);
}

/** `/w/` + number: the *how much?* blank, *barely* / *almost*, or an ordinal place on a scale (checked in a rank frame). */
function enforceDegreeNumber(word: LexWord, stem: NumberStem): void {
  const { marker, groups } = stem;
  const blank = word.ending === "r" && groups.length === 0 && !stem.digitlessExp;
  const hairs = groups.length === 0 && stem.digitlessExp === "e-" && (marker === "+" || marker === "ra" || isMinus(marker));
  if (blank || hairs) return;
  const place = isRankMarker(marker) ? plainDigits(stem) : undefined;
  if (place === undefined || place < 2) throw new ConstructionError("degreeNumber", word.raw);
}

/**
 * Tag pronouns (tag-pronouns.md#naming-with-a-tag): `/z/` `/d/` `/b/` only (`/y/` `/x/` closed by D-24, the rest open),
 * gl- never; **-l** / **-r** / **-m** / **-n**; **-x** only on **-r** / **-n** (*A and associates*); a pair (`zwaor`) recalls or shares only.
 */
function enforceTag(word: LexWord, slots: WordSlots): void {
  if (word.gl || !word.pos || !slotAllows(slots, "tag pronoun", word.pos)) throw new ConstructionError("tagSlot", word.raw);
  if (word.ending !== "l" && word.ending !== "r" && word.ending !== "m" && word.ending !== "n") throw new ConstructionError("tagEnding", word.raw);
  if (word.ending === "l" && word.family.kind === "tag" && word.family.vowels.length > 1) throw new ConstructionError("tagPairAssign", word.raw);
  if (word.plural && word.ending !== "r" && word.ending !== "n") throw new ConstructionError("tagPlural", word.raw);
}

/**
 * **-x** on a join: after **-r** on a noun slot, an unspecified group (`zarx`, joins.md#unspecified-member-r-phrase);
 * on a `/v/` join, one shared act, as on any verb (`zayan varx`, collectives.md#verbs-v).
 */
function enforceJoinPlural(word: LexWord): void {
  if (!word.plural || word.family.kind !== "joinMarker") return;
  if (word.reading === "join" && word.ending === "r" && (word.pos === "z" || word.pos === "d" || word.pos === "b")) return;
  if (word.reading === "join" && word.pos === "v") return;
  throw new ConstructionError("joinPlural", word.raw);
}

/** A digit-string label with digits takes **-x** for the group English pluralizes: `z_90x` *the ’90s* (digit-strings.md#plural-labels). */
function isPluralLabel(word: LexWord): boolean {
  if (word.family.kind !== "number" || !(word.pos === "z" || word.pos === "d" || word.pos === "b")) return false;
  const stem = word.family.stem;
  return stem.marker === "_" && stem.groups.some((group) => group.mantissa !== undefined || group.code !== undefined);
}
