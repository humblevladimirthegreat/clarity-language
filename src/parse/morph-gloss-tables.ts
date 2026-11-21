/** Morph-gloss job tables, shared types, and number words ([glosses.md](../../docs/meta/glosses.md)). */

import { type HookJob } from "./hook-jobs.js";
import { CLOSED, closedDerived, namedEnglish } from "../closed-roots.js";
import { type Ending, type LexWord, type NumberGroup } from "./types.js";

export const houseCast = closedDerived(
  (): Record<string, string> =>
    Object.fromEntries([CLOSED.swan, CLOSED.lion, CLOSED.hibiscus].map((root) => [root, namedEnglish(root)])),
);

/** Number writing mark → form suffix (glosses.md § Round trip). */
export const NUMBER_MARK_SUFFIX: Record<string, string> = { "~": ".about", "@": ".named", "=": ".again" };
const SPELLED_ENDING_MARK: Record<string, string> = { m: "~", n: "@", r: "=" };

/** Digitless number **-r** by marker: fill-ask blank under question, else *some number* ([digitless-exponents § Digitless](../../docs/grammar/digitless-exponents.md#digitless)). */
export const NUMBER_BLANK: Record<string, { ask: string; some: string }> = {
  "+": { ask: "how-many", some: "some-amount" },
  "-": { ask: "how-far-below-zero", some: "some-negative-amount" },
  "#": { ask: "which-place", some: "some-place" },
  "#-": { ask: "which-place-from-end", some: "some-place-from-end" },
  _: { ask: "what-code", some: "some-code" },
};

export function numberMarkSuffix(word: LexWord, ctx: MorphGlossContext): string {
  if (word.family.kind !== "number") return "";
  // Spelled words carry the ending letter instead of a second-slot mark (`gram` = `g~+`).
  return NUMBER_MARK_SUFFIX[word.family.writingEndingMark ?? SPELLED_ENDING_MARK[word.ending ?? ""] ?? ""] ?? "";
}

export const specialPronoun = closedDerived(
  (): Record<string, string> => ({
    [CLOSED.microphone]: "speaker",
    [CLOSED.headphones]: "listener",
    [CLOSED.handshake]: "interlocutors",
  }),
);

/** The topic and generic pronouns gloss in capitals on `/z/` `/d/` `/b/` only (glosses.md § Specials). */
export const markedPronoun = closedDerived(
  (): Record<string, string> => ({
    [CLOSED.star]: "TOPIC",
    [CLOSED.person]: "ONE",
  }),
);

/** Standalone readings ([joins.md § Vowels and endings](../../docs/grammar/joins.md#join-type-vowel-series)). */
export const JOIN_JOB_STANDALONE: Record<string, string> = {
  a: "none",
  e: "no-options",
  u: "no",
  ua: "everything",
};

export const LIST_VERB: Record<string, string> = {
  a: "includes",
  e: "choose",
  ae: "picks",
  u: "denies",
  ua: "excludes",
  ue: "bars",
  o: "prioritizes",
  ao: "starts-with",
  oe: "equates",
  uo: "deprioritizes",
};

export const JOIN_RELATION: Record<string, string> = {
  a: "including",
  e: "exclusive-for",
  ae: "open-to",
  u: "against",
  ua: "without",
  ue: "anything-but",
  o: "prioritizing",
  ao: "starting-with",
  oe: "on-a-par",
  uo: "deprioritizing",
};

export const HOOK_JOB: Record<string, string> = {
  al: "additionally",
  am: "additionally.open",
  an: "additionally.named",
  ol: "in.other.words",
  om: "in.other.words.open",
  aol: "in.fact",
  aom: "in.fact.open",
  ael: "for.example",
  aem: "for.example.open",
  el: "instead",
  em: "instead.open",
  ul: "except",
  um: "except.open",
  ar: "going.back.to.that",
  or: "as.I.said",
  er: "anyway",
  ur: "never.mind.that",
};

export const HOOK_IN_CLAUSE: Record<string, string> = {
  al: "including",
  am: "including.open",
  an: "including.named",
  ol: "rather",
  om: "rather.open",
  el: "instead",
  em: "instead.open",
  ul: "except",
  um: "except.open",
  on: "rather.named",
  en: "instead.named",
  un: "except.named",
};

export const HOOK_EXTRA_NOUN: Record<string, string> = {
  ar: "in.there",
  er: "there",
  ur: "from.there",
  or: "for.that",
  aer: "on.it",
  aor: "with.it",
  uer: "through.there",
  al: "in",
  am: "amid",
  an: "in.named",
  el: "at",
  em: "near",
  en: "at.named",
  ul: "from",
  um: "away-from",
  un: "from.named",
  ol: "for",
  om: "used-by",
  on: "for.named",
  ael: "on",
  aem: "over",
  aen: "on.named",
  oel: "toward",
  oem: "in-the-direction-of",
  oen: "toward.named",
  ual: "out-of",
  uam: "out-from-among",
  uan: "out-of.named",
  uel: "through",
  uem: "by-way-of",
  uen: "through.named",
  aol: "using",
  aom: "by",
  aon: "using.named",
  uol: "against",
  uom: "contrary-to",
  uon: "against.named",
};

export const FORCE_JOB: Record<string, string> = {
  a: "statement",
  o: "command",
  e: "question",
  u: "prohibition",
};

export const FORCE_JOB_SOFT: Record<string, string> = {
  a: "soft-statement",
  o: "request",
  e: "soft-question",
  u: "soft-prohibition",
};

/** Act words with **-r**: an act held for now (speech-moves.md § For now). */
export const FORCE_JOB_FOR_NOW: Record<string, string> = {
  a: "provisional-statement",
  o: "command-for-now",
  e: "working-question",
  u: "hold-off",
};

export const POLAR_JOB: Record<string, string> = {
  ae: "sure",
  ue: "refuse-option",
  ao: "yes",
  uo: "no",
  ua: "reject-frame",
  oe: "decline",
};

export const ABILITY_STANCE: Record<string, string> = {
  a: "able",
  o: "unable-temporary",
  e: "unable-modifiable",
  u: "unable-irreversible",
};

/** Label reach seam vowels (label-seams.md#reach-vowels). */
export const REACH_VOWEL: Record<string, string> = {
  a: "type",
  e: "pair",
  o: "role",
  u: "episode",
  ae: "situation",
  ao: "using",
  oe: "toward-role",
  ua: "except-episode",
  ue: "except-pair",
  uo: "outside-role",
};

/** Say word parts, answers, and endings (permission-consent.md#say-words). */
export const SAY_PART: Record<string, string> = { z: "agent", d: "patient", b: "recipient", v: "event" };
export const SAY_ANSWER: Record<string, string> = { a: "ALLOW", u: "FORBID", o: "REQUIRE", e: "CHOICE" };
export const SAY_ENDING: Record<string, string> = { l: "rule", m: "said", r: "tacit" };

export const SAKE_STANCE: Record<string, string> = {
  a: "met",
  e: "ought",
  o: "motive",
  u: "unmet",
};

/** Ending grain on values (time horizon / prescription warrant / time horizon / changeability). */
export const SAKE_GRAIN: Record<string, Partial<Record<Ending, string>>> = {
  a: { l: "lasting", m: "any-term", r: "immediate" },
  e: { l: "invited", m: "unasked", r: "tryout" },
  o: { l: "lasting", m: "any-term", r: "immediate" },
  u: { l: "irreversible", m: "modifiable", r: "passing" },
};

/** Emotion tail (how-you-feel.md#feeling-word): urge hook vowel(s), then duration ending. */
export const EMOTION_URGE: Record<string, string> = {
  a: "STAYING",
  ae: "HELD",
  ue: "UNPLACED",
  e: "AIMED",
  oe: "TOWARD",
  uo: "RESISTING",
  o: "GIVING",
  u: "AWAY",
  ua: "RELEASING",
  ao: "PLACATING",
};
export const EMOTION_DURATION: Record<string, string> = { r: "FLEETING", m: "OPEN", l: "SETTLED" };

export const GREETING_STANCE: Record<string, string> = {
  a: "presence",
  o: "minutes",
  e: "ask",
  u: "passing",
};

/** Role word part consonants (roles.md#role-compounds, role-parts.md#content-of-the-event). */
export const ROLE_PART: Record<string, string> = {
  z: "agent",
  d: "patient",
  b: "recipient",
  h: "manner",
  g: "state",
  th: "stance",
  w: "extent",
  y: "move",
  x: "outcome",
  v: "event",
};

/** A role word's front: its label reach, then its part (`episode-agent`; glosses.md § Round trip). */
export function roleFront(reach: string | undefined, part: string | undefined): string {
  return `${REACH_VOWEL[reach ?? ""] ?? "reach"}-${ROLE_PART[part ?? ""] ?? "role"}`;
}

export function pointerFront(reach: string | undefined, part: string | undefined): string {
  return `${REACH_VOWEL[reach ?? ""] ?? "reach"}-${ROLE_PART[part ?? ""] ?? "role"}`;
}

/** Role pointer vowel: which event the pointer reads (pronouns.md#role-pointers). */
/** Role pointer ending suffix: **-l** a new one, **-m** a share; **-r** is the participant itself. */
export const POINTER_ENDING: Record<string, string> = { l: ".new", m: ".part" };

export const POINTER_VOWEL: Record<string, string> = { e: "same", a: "other", o: "self", u: "unsaid" };

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

/** A content word the lexicon cannot gloss (missing root, or **-m** with no abstract sense). */
export class UnknownWordError extends Error {
  constructor(readonly raw: string) {
    super(`unknown word: ${raw}`);
    this.name = "UnknownWordError";
  }
}

export type MorphGlossContext = {
  antecedent?: LexWord;
  fillAsk?: boolean;
  /** The job the parser gave this hook (hooks.md); absent when the line does not parse. */
  hookJob?: HookJob;
  restrictorListed?: boolean;
  /** `/v/` join-shaped form used as the head of a following dependent sentence. */
  dependentVerb?: boolean;
  /** Join closing no items (shared `/ɡ/` allowed): `zal` *none*, `zual` *everything*. */
  standaloneJoin?: boolean;
  /** Standalone `zuan` + the kind on shared `/ɡ/`: the kind itself. */
  kindReference?: boolean;
  /** Digitless `g+` / `h+` right after a rank join: the amount / frequency scale. */
  scale?: boolean;  /** `/ɡ/` `g-N` right after a plain noun: *1/N of* that noun. */
  fraction?: boolean;
  /** Number word beside another number that needs shorthand: the whole run prefers shorthand. */
  shorthandRun?: boolean;
};

export type CompareMorphGlossResult = {
  ok: boolean;
  expected: string;
  actual: string;
  parseError?: string;
};

export type ExampleBlockPair = {
  ageben: string;
  morph: string;
  agebenIndex: number;
};

export type TeachBlock = {
  ageben: string;
  morph: string | null;
  loose: string | null;
  agebenIndex: number;
};

export function formatNumberGroup(g: NumberGroup): string {
  let s = g.code ?? g.mantissa ?? "";
  if (g.exponentDigits) {
    s += `${g.exponentSign === "wu" ? "e-" : "e"}${g.exponentDigits}`;
  } else if (!g.mantissa && g.exponentSign) {
    s += g.exponentSign === "wu" ? "e-" : "e";
  }
  if (g.percent === "yo") s += "yo";
  if (g.percent === "yu") s += "yu";
  return s;
}

export function cardinalEnglish(n: number): string {
  if (Number.isInteger(n) && n >= 0 && n < CARDINALS.length) return CARDINALS[n]!;
  return String(n);
}

/** Digit ordinals (`1st`, `2nd`, `11th`) — never an English sense of a lexicon root. */
export function ordinalEnglish(n: number): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = Math.abs(n) % 10;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}
