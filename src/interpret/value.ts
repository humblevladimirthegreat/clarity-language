/**
 * Values (the matcher in the interpreter plan, unit M2): a number's and a measure's value from its `NumberStem`, for
 * comparison, and literal payload equality.
 *
 * The value is read from the stem the parser built, never from the spelling: the written form (`g+3`) and the spoken one
 * (`gragel`) have one stem, so they have one value. What a marker makes of its digits (number-markers.md#marker-vowel-referential-identity):
 * - `+` / `-` (`ra` / `ru`): a signed **scalar**; each digit group is its mantissa times ten to its exponent
 *   (digitless-exponents.md#exponents), and a multi-group scalar is the sum of its groups (digitless-exponents.md#group-separator).
 *   A `yo` / `yu` closer makes it a percent or percentage points (measures-and-percent.md#percent-and-percentage-points).
 * - `#` (`ro`): a **rank** from the start; more groups are ranks within ranks (`g#2,3`, digitless-exponents.md#group-separator).
 * - `#-` (`ruo`): a rank from the end (stacked-markers.md#from-the-end-end-relative-ordinal-marker-uo).
 * - `_` (`re`): a **code**, read digit by digit; unsigned. A calendar ordinal is a code too (digit-strings.md#time).
 * A digitless word, a digitless exponent, a negative label (`#_`) or an error bound (`+-`, stacked-markers.md#stacked-markers)
 * has no value here: such words compare by their stem only.
 */
import { numberMarkerIdentity } from "../parse/resolve.js";
import type { LexWord, NumberGroup, NumberStem } from "../parse/types.js";
import type { Detail, Term } from "./types.js";

export type NumberValue =
  | { kind: "scalar"; value: number; percent?: "percent" | "points" }
  | { kind: "rank"; ranks: number[]; fromEnd?: true }
  | { kind: "code"; fields: string[] };

/** A unit noun with its amount (measures-and-percent.md#measure-phrases): the unit's root and the amount's value. */
export type MeasureValue = { unit: string; amount: NumberValue; approx?: true };

const MARKERS: Record<string, "scalar+" | "scalar-" | "rank" | "rankFromEnd" | "code"> = {
  "+": "scalar+",
  ra: "scalar+",
  "-": "scalar-",
  ru: "scalar-",
  "#": "rank",
  ro: "rank",
  "#-": "rankFromEnd",
  ruo: "rankFromEnd",
  _: "code",
  re: "code",
  roe: "code",
};

function groupAmount(group: NumberGroup): number | undefined {
  if (group.code !== undefined) return undefined;
  const hasMantissa = group.mantissa !== undefined && group.mantissa !== "";
  const hasExponent = group.exponentDigits !== undefined && group.exponentDigits !== "";
  if (!hasMantissa && !hasExponent) return undefined;
  const mantissa = hasMantissa ? Number(group.mantissa) : 1;
  if (!Number.isFinite(mantissa)) return undefined;
  const exponent = hasExponent ? Number(group.exponentDigits) * (group.exponentSign === "wu" ? -1 : 1) : 0;
  return mantissa * 10 ** exponent;
}

/** The value of a number stem; undefined when the stem has none (digitless, or a marker not listed above). */
export function numberValue(stem: NumberStem): NumberValue | undefined {
  if (stem.digitlessExp !== undefined || stem.groups.length === 0) return undefined;
  const kind = stem.calendarOrdinal ? "code" : MARKERS[stem.marker];
  if (!kind) return undefined;
  if (kind === "code") {
    return { kind: "code", fields: stem.groups.map((g) => g.code ?? `${g.exponentDigits ?? ""}${g.mantissa ?? ""}`) };
  }
  const amounts = stem.groups.map(groupAmount);
  if (amounts.some((a) => a === undefined)) return undefined;
  if (kind === "rank" || kind === "rankFromEnd") {
    return { kind: "rank", ranks: amounts as number[], ...(kind === "rankFromEnd" ? { fromEnd: true as const } : {}) };
  }
  const percents = new Set(stem.groups.map((g) => g.percent).filter((p) => p !== undefined));
  if (percents.size > 1) return undefined;
  const closer = [...percents][0];
  const sum = (amounts as number[]).reduce((a, b) => a + b, 0);
  return {
    kind: "scalar",
    value: kind === "scalar-" ? -sum : sum,
    ...(closer ? { percent: closer === "yo" ? ("percent" as const) : ("points" as const) } : {}),
  };
}

/** The stem of a number word, or undefined. */
export function wordStem(word: LexWord): NumberStem | undefined {
  return word.family.kind === "number" ? word.family.stem : undefined;
}

/** The value of a number word; undefined when it is not a number or has no value. */
export function wordValue(word: LexWord): NumberValue | undefined {
  const stem = wordStem(word);
  return stem ? numberValue(stem) : undefined;
}

/** Do two values name the same number? */
export function sameValue(a: NumberValue, b: NumberValue): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "scalar" && b.kind === "scalar") return a.value === b.value && a.percent === b.percent;
  if (a.kind === "rank" && b.kind === "rank") return a.fromEnd === b.fromEnd && a.ranks.length === b.ranks.length && a.ranks.every((r, i) => r === b.ranks[i]);
  if (a.kind === "code" && b.kind === "code") return a.fields.length === b.fields.length && a.fields.every((f, i) => f === b.fields[i]);
  return false;
}

/**
 * Order two values: negative when `a` is less, zero when equal, positive when greater. Only scalars of one kind
 * (plain, percent, or points) and ranks counted from the same end order; anything else is undefined (a code is a label,
 * not an amount).
 */
export function compareValues(a: NumberValue, b: NumberValue): number | undefined {
  if (a.kind === "scalar" && b.kind === "scalar") return a.percent === b.percent ? Math.sign(a.value - b.value) : undefined;
  if (a.kind === "rank" && b.kind === "rank") {
    if (a.fromEnd !== b.fromEnd) return undefined;
    for (let i = 0; i < Math.min(a.ranks.length, b.ranks.length); i++) {
      if (a.ranks[i] !== b.ranks[i]) return Math.sign(a.ranks[i]! - b.ranks[i]!);
    }
    return a.ranks.length === b.ranks.length ? 0 : undefined;
  }
  return undefined;
}

/** Fuzzy `-m` on a number word: *about* that amount (measures-and-percent.md#measure-phrases). */
function approx(word: LexWord): boolean {
  return word.ending === "m";
}

/** The number word a detail is, when the detail is one number word (a count or amount on a noun). */
export function detailNumber(detail: Detail): LexWord | undefined {
  return detail.words.length === 1 && wordStem(detail.words[0]!) ? detail.words[0] : undefined;
}

/** A term's own number word: a number term, or a predicate number the reader keeps as a word. */
export function termNumber(term: Term): LexWord | undefined {
  if (term.kind === "number") return term.word;
  if (term.kind === "thing" && wordStem(term.head)) return term.head;
  return undefined;
}

/** The value of a term that is a number, or undefined. */
export function termValue(term: Term): NumberValue | undefined {
  const word = termNumber(term);
  return word ? wordValue(word) : undefined;
}

/**
 * The value of a measure phrase: a unit noun carrying one number word as a detail (measures-and-percent.md#measure-phrases).
 * Undefined when the term is not a noun with exactly one number detail of known value.
 */
export function measureValue(term: Term): MeasureValue | undefined {
  if (term.kind !== "thing" || wordStem(term.head)) return undefined;
  const numbers = term.details.map(detailNumber).filter((w): w is LexWord => w !== undefined);
  if (numbers.length !== 1) return undefined;
  const amount = wordValue(numbers[0]!);
  if (!amount) return undefined;
  return { unit: term.root, amount, ...(approx(numbers[0]!) ? { approx: true as const } : {}) };
}

/** Two number words are the same kind of number: the same marker identity (a count, a rank, ...; numbers.md#markers). */
export function sameNumberKind(a: LexWord, b: LexWord): boolean {
  const sa = wordStem(a);
  const sb = wordStem(b);
  return sa !== undefined && sb !== undefined && numberMarkerIdentity(sa.marker) === numberMarkerIdentity(sb.marker);
}

/** Two number words name the same number: equal values and the same ending (an exact amount is not an *about* one); words without a value compare by stem. */
export function sameNumberWord(a: LexWord, b: LexWord): boolean {
  if (a.ending !== b.ending) return false;
  const va = wordValue(a);
  const vb = wordValue(b);
  if (va && vb) return sameValue(va, vb);
  if (va || vb) return false;
  return JSON.stringify(wordStem(a)) === JSON.stringify(wordStem(b));
}

/** Literal payload equality: a foreign or quoted payload matches only itself, character for character. */
export function samePayload(a: Term, b: Term): boolean {
  return a.kind === "literal" && b.kind === "literal" && a.payload === b.payload;
}
