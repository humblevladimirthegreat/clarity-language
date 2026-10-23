import type { MorphWord, NumberGroup, NumberMarker, NumberStem } from "../parse/types.js";

/** Spoken digit syllables and exponent sign (numbers.md § Counts, § Exponents). */
export type NumberSyllables = {
  digits: Record<string, string>;
  plus: string;
  minus: string;
};

export const NUMBER_SYLLABLES: NumberSyllables = {
  digits: { "1": "ba", "2": "do", "3": "ge", "4": "hu", "5": "za", "6": "vo", "7": "re", "8": "lu", "9": "na", "0": "mo" },
  plus: "wa",
  minus: "wu",
};

export function markerToSpeech(marker: NumberMarker): string {
  if (marker === "+" || marker === "ra") return "ra";
  if (marker === "-" || marker === "ru") return "ru";
  if (marker === "#" || marker === "re") return "re";
  if (marker === "#-" || marker === "rue") return "rue";
  if (marker === "#_" || marker === "ruo") return "ruo";
  if (marker === "+-" || marker === "rua") return "rua";
  return "ro";
}

/** Letter names for code characters ([phonology § Letter names](../../docs/grammar/phonotactics.md#letter-names)). */
const CODE_LETTER_NAMES: Record<string, string> = {
  b: "bu", d: "de", g: "go", h: "ha", z: "zu", v: "ve", r: "ro", l: "la", n: "nu", m: "me", th: "tho", w: "wa", y: "yu",
};

/**
 * Speech for one code field (`b12` → `bubado`): digit syllables, letter names, and a break `'` before each vowel
 * ([letter codes](../../docs/grammar/numbers-applied.md#letter-codes)). Offsets are each character's vowel.
 */
export function codeToSyllables(code: string, table = NUMBER_SYLLABLES): { text: string; vowels: number[] } {
  let text = "";
  const vowels: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const ch = code.startsWith("th", i) ? "th" : code[i]!;
    i += ch.length - 1;
    const syllable = table.digits[ch] ?? CODE_LETTER_NAMES[ch] ?? (/^[uaoe]$/.test(ch) ? `'${ch}` : "");
    text += syllable;
    vowels.push(text.length - 1);
  }
  return { text, vowels };
}

export function digitsToSyllables(digits: string, table = NUMBER_SYLLABLES): string {
  let out = "";
  for (const ch of digits) {
    if (ch === ".") out += "ye";
    else out += table.digits[ch] ?? "";
  }
  return out;
}

const DIGITLESS_EXP_RE = /^(\d*)e(-?)(\d*)$/;

/**
 * Speech for the parser's exponent shorthand (`e`, `1e-`, `e3`, `0e-1`, …).
 * With exponent digits: `wa`/`wu` + digits, then `ya` + any mantissa.
 * Without: mantissa, then bare `wa`/`wu`.
 */
export function digitlessExpToSpeech(exp: string, table = NUMBER_SYLLABLES): string {
  const m = DIGITLESS_EXP_RE.exec(exp);
  if (!m) return "";
  const [, mantissa, minus, expDigits] = m;
  const sign = minus ? table.minus : table.plus;
  if (expDigits) {
    return sign + digitsToSyllables(expDigits, table) + (mantissa ? "ya" + digitsToSyllables(mantissa, table) : "");
  }
  return digitsToSyllables(mantissa!, table) + sign;
}

/** Vowel offset (within digitlessExpToSpeech output) that carries stress. */
function digitlessExpStress(exp: string): number | undefined {
  const m = DIGITLESS_EXP_RE.exec(exp);
  if (!m) return undefined;
  const expDigits = m[3]!;
  // Last exponent digit when present; otherwise the first syllable (mantissa or bare marker).
  return expDigits ? 2 + (expDigits.length - 1) * 2 + 1 : 1;
}

function groupToSpeech(group: NumberGroup, table: NumberSyllables): string {
  return groupToSpeechStressed(group, table).text;
}

/** Speech text for one group plus char offsets (within that text) of vowels to stress. */
function groupToSpeechStressed(group: NumberGroup, table: NumberSyllables): { text: string; stress: number[] } {
  let text = "";
  const stress: number[] = [];
  const hasExponent = !!group.exponentSign;
  const hasMantissa = group.mantissa !== undefined && group.mantissa !== "";

  if (hasExponent) {
    const signStart = text.length;
    text += group.exponentSign === "wu" ? table.minus : table.plus;
    if (group.exponentDigits) {
      text += digitsToSyllables(group.exponentDigits, table);
      // Stress the LAST exponent digit's vowel — the group-final boundary cue.
      // Marker "wa"/"wu" is 2 chars; each digit syllable is 2 chars; vowel is the 2nd.
      stress.push(signStart + 2 + (group.exponentDigits.length - 1) * 2 + 1);
    } else {
      // Digitless exponent marker (`wa` / `wu` alone): stress the marker vowel.
      stress.push(signStart + 1);
    }
  }

  if (hasMantissa) {
    if (hasExponent) text += "ya";
    const mantissaStart = text.length;
    text += digitsToSyllables(group.mantissa!, table);
    if (!hasExponent) {
      // No exponent: stress the LAST mantissa digit's vowel.
      stress.push(mantissaStart + (group.mantissa!.length - 1) * 2 + 1);
    }
    // ye (decimal point) is always stressed wherever it appears.
    let at = mantissaStart;
    for (const ch of group.mantissa!) {
      if (ch === ".") stress.push(at + 1);
      at += ch === "." ? 2 : 2;
    }
  }

  if (group.percent) {
    stress.push(text.length + 1); // yo / yu always stressed
    text += group.percent;
  }

  return { text, stress };
}

/** Serialize a normalized number stem to speech CV (marker + body, no PoS or ending). */
export function numberStemToSpeech(stem: NumberStem, table = NUMBER_SYLLABLES): string {
  return numberStemToSpeechStressed(stem, table).text;
}

/** Speech text plus char offsets of vowels to carry primary stress. */
export function numberStemToSpeechStressed(stem: NumberStem, table = NUMBER_SYLLABLES): {
  text: string;
  stress: number[];
} {
  const stress: number[] = [];
  // Calendar-ordinal dates (`_` + `#`, numbers.md § Time) speak the digraph marker `roe`.
  const marker = stem.calendarOrdinal ? "roe" : markerToSpeech(stem.marker);
  // Spoken comma (digitless-exponents.md#group-separator).
  const separator = "the";
  let text = marker;
  if (stem.groups.length === 0 && !stem.digitlessExp) {
    // Digitless word: stress the marker vowel.
    stress.push(1);
  }

  if (stem.digitlessExp) {
    // Spelled-out stems keep leading mantissa digits in groups (`gramowal`: mo + wa).
    for (const group of stem.groups) text += groupToSpeech(group, table);
    const exp = digitlessExpToSpeech(stem.digitlessExp, table);
    const at = digitlessExpStress(stem.digitlessExp);
    if (at !== undefined) stress.push(text.length + at);
    text += exp;
    return { text, stress };
  }

  if (stem.marker === "_" || stem.marker === "ro") {
    // Code: last character of each field.
    for (const [i, group] of stem.groups.entries()) {
      if (i > 0) text += separator;
      const start = text.length;
      if (group.code !== undefined) {
        const spoken = codeToSyllables(group.code, table);
        text += spoken.text;
        stress.push(start + spoken.vowels[spoken.vowels.length - 1]!);
        continue;
      }
      const mantissa = group.mantissa ?? "";
      text += digitsToSyllables(mantissa, table);
      if (mantissa.length > 0) stress.push(start + (mantissa.length - 1) * 2 + 1);
    }
    return { text, stress };
  }

  for (const [i, group] of stem.groups.entries()) {
    if (i > 0) text += separator;
    const part = groupToSpeechStressed(group, table);
    for (const s of part.stress) stress.push(text.length + s);
    text += part.text;
  }
  return { text, stress };
}

function posPrefix(word: MorphWord): string {
  if (!word.pos) return "";
  return word.gl ? "gl" : word.bl ? "bl" : word.pos;
}

function endingSuffix(word: MorphWord): string {
  let out = word.ending ?? "";
  if (word.plural) out += "x";
  return out;
}

/** Full speech CV surface for a free number word. */
export function numberWordToSpeech(word: MorphWord, table = NUMBER_SYLLABLES): string {
  return numberWordToSpeechStressed(word, table).raw;
}

/**
 * Speech CV surface plus char offsets of vowels that carry primary stress
 * for TTS rhythm (last digit of each group; digitless stresses the marker).
 */
export function numberWordToSpeechStressed(word: MorphWord, table = NUMBER_SYLLABLES): {
  raw: string;
  stress: number[];
} {
  const family = word.family;
  let head = "";
  let stem: NumberStem;
  if (family.kind === "number") {
    head = posPrefix(word);
    stem = family.stem;
  } else {
    throw new Error(`Not a number word: ${word.raw}`);
  }

  const body = numberStemToSpeechStressed(stem, table);
  const raw = head + body.text + endingSuffix(word);
  return { raw, stress: body.stress.map((s) => s + head.length) };
}
