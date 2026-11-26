/**
 * Number words for the realizer (docs/meta/realizer.md, *Number glosses*): a number's morph-gloss leaf, written from the
 * stem the meaning view keeps and the ending its `values` record, never from the glosser's own label code. A count, a
 * rank or a signed amount with one run of digits has a rule; digitless forms, special values, digit strings, exponents
 * and the rest throw a `noRule` {@link Unrealized} until their unit.
 */
import type { MeaningDetail, MeaningTerm, NumberStem } from "./meaning.js";
import { Unrealized } from "./terms.js";

const noRule = (detail: string): Unrealized => new Unrealized("noRule", detail);

/** A plain number: its marker (`+` count, `#` rank, `-` negative amount) and its digits. */
type Plain = { marker: "+" | "#" | "-"; digits: string };

/** The cardinals the glosser spells out (glosses.md#round-trip); a larger count glosses as its digits. */
const CARDINALS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** A number ending's form suffix (glosses.md *Form suffixes*): `.about` on **-m**, `.named` on **-n**. */
const ENDING_SUFFIX: Record<string, string> = { l: "", m: ".about", n: ".named" };

const SPEECH_MARKER: Record<string, Plain["marker"]> = { ra: "+", ro: "#", ru: "-" };

const isPlainMarker = (marker: string): marker is Plain["marker"] => marker === "+" || marker === "#" || marker === "-";

function plain(marker: string, digits: string): Plain {
  const symbol = SPEECH_MARKER[marker] ?? marker;
  if (symbol === "_") throw noRule("a digit-string number");
  if (!isPlainMarker(symbol)) throw noRule(`a number with marker ${marker}`);
  if (!digits) throw noRule("a digitless number");
  if (!/^\d+$/.test(digits)) throw noRule("a number with an exponent, decimal, percent or several groups");
  if (digits.length > 1 && digits.startsWith("0")) throw noRule("a number with leading zeros");
  return { marker: symbol, digits };
}

/** A number term's stem as a plain number, or a `noRule` throw. */
function fromStem(stem: NumberStem): Plain {
  if (stem.calendarOrdinal || stem.digitlessExp !== undefined) throw noRule("a calendar date or a special value");
  if (stem.groups.length > 1) throw noRule("a number of several digit groups");
  const group = stem.groups[0];
  if (group && (group.exponentDigits || group.exponentSign || group.decimal || group.percent || group.code !== undefined)) {
    throw noRule("a number with an exponent, decimal, percent or code");
  }
  return plain(stem.marker, group?.mantissa ?? "");
}

/** A number detail's value (`values.number`, the stem in shorthand) as a plain number, or a `noRule` throw. */
function fromBody(body: string | undefined): Plain {
  if (body === undefined) throw new Unrealized("missingValue", "a number detail with no value in the view");
  const match = body.match(/^(#-|#_|\+-|_#|[+#_-])(.*)$/);
  if (!match) throw noRule(`a number ${body}`);
  return plain(match[1]!, match[2]!);
}

/** Digit ordinals (`1st`, `2nd`, `11th`), as the glosser writes a rank (glosses.md *Ordinals use digits*). */
function ordinal(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : mod10 === 1 ? "st" : mod10 === 2 ? "nd" : mod10 === 3 ? "rd" : "th";
  return `${n}${suffix}`;
}

/** The sense label of a plain number: `three`, `twenty` as `20`, `2nd`, `minus-three`. */
function label(number: Plain): string {
  const n = Number(number.digits);
  const cardinal = CARDINALS[n] ?? number.digits;
  if (number.marker === "#") return ordinal(n);
  return number.marker === "-" ? `minus-${cardinal}` : cardinal;
}

/** A numeric prefix's digitless kind by its shorthand body (numeric-derivation.md), as the glosser labels it. */
const NUMERIC_KIND: Record<string, string> = {
  "+e": "infinity",
  "+e-": "grain",
  "+-": "grain",
  "-e": "void",
  "-e-": "quasi",
  "--e-": "quasi",
  "--": "quasi",
  "#e-": "origin",
  "#-": "origin",
  "#e": "telos",
  "+": "poly",
  "-": "de",
};

/**
 * A numeric prefix's number (numeric-derivation.md), from its shorthand body: a digitless kind by its label
 * (`quasi`), a digit string as `_` and its digits (`_1`), else the plain number's label (`two`, `1st`).
 */
export function numericLabel(body: string | undefined): string {
  if (body === undefined) throw new Unrealized("missingValue", "a numeric prefix with no number in the view");
  const kind = NUMERIC_KIND[body];
  if (kind) return kind;
  const digits = body.match(/^_(\d+)$/);
  return digits ? `_${digits[1]}` : label(fromBody(body));
}

/**
 * The leaf of a plain number under `pos`, on its ending. The preferred writing takes no surface suffix
 * (number-markers.md#writing-style-numeric-vs-spelled), so the gloss names the preferred one and `spell` writes it.
 */
function leafOf(number: Plain, pos: string, ending: string | undefined, signed = false): string {
  if (ending === undefined) throw new Unrealized("missingValue", "a number with no ending in the view");
  const suffix = ENDING_SUFFIX[ending];
  if (suffix === undefined) throw noRule(`a number on -${ending}`);
  // A negative number on a noun is a fraction (measures-and-percent.md#fractions), a value of its own.
  if (number.marker === "-" && pos === "g" && !signed) throw noRule("a negative number on a noun");
  return `${pos}-${label(number)}${suffix}`;
}

/** A digitless signed number on `/b/`, an unmeasured offset from now (evidentiality.md#forecast), by its sign. */
const OFFSET: Record<string, string> = { "+": "later", "-": "earlier" };

/** A number term in a role (number-markers.md#parts-of-speech-on-numbers): its leaf under the role letter. */
export function numberTermLeaf(term: Extract<MeaningTerm, { kind: "number" }>, pos: "z" | "d" | "b"): string {
  if (term.values?.gloss) throw noRule("a number with a reading of its own");
  // `blral` *some time after now*, `blrul` *some time before now* (evidentiality.md#forecast).
  const stem = term.stem;
  const offset = pos === "b" && !stem.groups.length && stem.digitlessExp === undefined && !stem.calendarOrdinal ? OFFSET[SPEECH_MARKER[stem.marker] ?? stem.marker] : undefined;
  if (offset) {
    const ending = term.values?.ending;
    if (ending !== "l" && ending !== "m") throw noRule(`an offset on -${ending}`);
    return `b-${offset}${ENDING_SUFFIX[ending]}`;
  }
  return leafOf(fromStem(term.stem), pos, term.values?.ending);
}

/** A number on a noun or as the predicate (numbers.md#counts, #ordinals): a `lexReading:number` detail as a `/ɡ/` leaf. */
export function numberDetailLeaf(detail: MeaningDetail): string {
  if (detail.content || detail.hosted || detail.details?.length || detail.frames?.length) throw noRule("a number with a detail, frame or hosted word");
  if (detail.values.gloss) throw noRule("a number with a reading of its own");
  return leafOf(fromBody(detail.values.number), "g", detail.values.ending);
}

/**
 * A signed count on a time noun that dates a channel (dated-channel.md#counting-from-now: `blagorum grugel`, *three
 * hours ago*): the noun's `slot:hosted` amount, a `/ɡ/` number whose sign counts back or ahead from now.
 */
export function measureLeaf(detail: MeaningDetail): string {
  if (detail.content || detail.hosted || detail.details?.length || detail.frames?.length) throw noRule("a measure with a detail, frame or hosted word");
  if (detail.values.gloss) throw noRule("a measure with a reading of its own");
  return leafOf(fromBody(detail.values.number), "g", detail.values.ending, true);
}

/** The parts a fraction names one of, by their English (measures-and-percent.md#fractions); others are `one-Nth`. */
const FRACTION_NAMES: Record<number, string> = { 2: "half", 3: "third", 4: "quarter" };

/** A plain `/ɡ/` count on **-l** (`g+N`), which makes a minus number right after it a fraction. */
export function isPlainCount(detail: MeaningDetail): boolean {
  if (detail.key !== "lexReading:number" || detail.values.ending !== "l" || detail.values.gloss || detail.values.built) return false;
  try {
    return fromBody(detail.values.number).marker === "+";
  } catch {
    return false;
  }
}

/**
 * A minus number N (N ≥ 2) right after a plain noun or a count, which names one part in N
 * (measures-and-percent.md#fractions: `zedudal grugel`, *a third of the tea*), or undefined when the detail is not one.
 */
export function fractionLeaf(detail: MeaningDetail): string | undefined {
  if (detail.key !== "lexReading:number" || detail.values.gloss || detail.values.built) return undefined;
  if (detail.content || detail.hosted || detail.details?.length || detail.frames?.length) return undefined;
  let number: Plain;
  try {
    number = fromBody(detail.values.number);
  } catch {
    return undefined;
  }
  const n = Number(number.digits);
  if (number.marker !== "-" || n < 2) return undefined;
  // The fraction's gloss names no ending; only the exact one reads back the same.
  if (detail.values.ending !== "l") throw noRule(`a fraction on -${detail.values.ending ?? "?"}`);
  return `g-${FRACTION_NAMES[n] ?? `one-${ordinal(n)}`}-of`;
}

/**
 * A digitless number shared after a rank join (comparative-arity.md#amount-scale, #frequency-scale, #time-scale): the
 * scale it ranks on, which the reader records in `values.scale`, is its letter and its label (`g-amount`,
 * `h-how-often`, `b-later`), on its ending.
 */
const SCALE: Record<string, [string, string]> = { amount: ["g", "amount"], frequency: ["h", "how-often"], time: ["b", "later"] };

/** A shared word that is a number: a digitless scale word by its scale, else a plain number on `/ɡ/`. */
export function sharedNumberLeaf(detail: MeaningDetail): string {
  const scale = detail.values.scale;
  if (scale === undefined) return numberDetailLeaf(detail);
  const [pos, name] = SCALE[scale] ?? [];
  const suffix = ENDING_SUFFIX[detail.values.ending ?? ""];
  if (!pos || suffix === undefined) throw noRule(`a ${scale} scale on -${detail.values.ending ?? "?"}`);
  if (detail.content || detail.hosted || detail.details?.length || detail.frames?.length) throw noRule("a scale word with a detail, frame or hosted word");
  return `${pos}-${name}${suffix}`;
}

/**
 * A factor on a shared scale word (comparative-arity.md#factor: `zoel gelazem hradol`, *twice as big as*): an `amount`
 * detail of the scale word, written as an `/h/` number right after it.
 */
export function hNumberLeaf(detail: MeaningDetail): string {
  if (detail.content || detail.hosted || detail.details?.length || detail.frames?.length) throw noRule("an /h/ number with a detail, frame or hosted word");
  if (detail.values.gloss) throw noRule("an /h/ number with a reading of its own");
  const number = fromBody(detail.values.number);
  // The inverse marker divides (comparative-arity.md#factor: `hrudol`, *half as*).
  if (number.marker !== "-") return leafOf(number, "h", detail.values.ending);
  const minus = leafOf(number, "h", detail.values.ending);
  return minus.replace(/^h-minus-/, "h-divided-by-");
}

/** The label a resume of a number term glosses with after `←` (number-markers.md#number-endings). */
export function resumedNumberLabel(term: Extract<MeaningTerm, { kind: "number" }>): string {
  if (term.values?.gloss) throw noRule("a resume of a number with a reading of its own");
  if (term.values?.ending !== "l") throw noRule(`a resume of a number on -${term.values?.ending ?? "?"}`);
  return label(fromStem(term.stem));
}
