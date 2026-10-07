import type { MorphWord, NumberGroup, NumberMarker, NumberStem } from "../parse/types.js";

const DIGIT_TO_SYLLABLE: Record<string, string> = {
  "0": "zo",
  "1": "wo",
  "2": "du",
  "3": "re",
  "4": "mo",
  "5": "va",
  "6": "gu",
  "7": "le",
  "8": "ha",
  "9": "na",
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

export function digitsToSyllables(digits: string): string {
  let out = "";
  for (const ch of digits) {
    if (ch === ".") out += "ye";
    else out += DIGIT_TO_SYLLABLE[ch] ?? "";
  }
  return out;
}

const DIGITLESS_EXP_RE = /^(\d*)e(-?)(\d*)$/;

/**
 * Speech for the parser's exponent shorthand (`e`, `1e-`, `e3`, `0e-1`, …).
 * With exponent digits: `ba`/`bu` + digits, then `ya` + any mantissa.
 * Without: mantissa, then bare `ba`/`bu`.
 */
export function digitlessExpToSpeech(exp: string): string {
  const m = DIGITLESS_EXP_RE.exec(exp);
  if (!m) return "";
  const [, mantissa, minus, expDigits] = m;
  const sign = minus ? "bu" : "ba";
  if (expDigits) {
    return sign + digitsToSyllables(expDigits) + (mantissa ? "ya" + digitsToSyllables(mantissa) : "");
  }
  return digitsToSyllables(mantissa!) + sign;
}

/** Vowel offset (within digitlessExpToSpeech output) that carries stress. */
function digitlessExpStress(exp: string): number | undefined {
  const m = DIGITLESS_EXP_RE.exec(exp);
  if (!m) return undefined;
  const expDigits = m[3]!;
  // Last exponent digit when present; otherwise the first syllable (mantissa or bare marker).
  return expDigits ? 2 + (expDigits.length - 1) * 2 + 1 : 1;
}

function groupToSpeech(group: NumberGroup): string {
  return groupToSpeechStressed(group).text;
}

/** Speech text for one group plus char offsets (within that text) of vowels to stress. */
function groupToSpeechStressed(group: NumberGroup): { text: string; stress: number[] } {
  let text = "";
  const stress: number[] = [];
  const hasExponent = !!group.exponentSign;
  const hasMantissa = group.mantissa !== undefined && group.mantissa !== "";

  if (hasExponent) {
    const signStart = text.length;
    text += group.exponentSign!;
    if (group.exponentDigits) {
      text += digitsToSyllables(group.exponentDigits);
      // Stress the LAST exponent digit's vowel — the group-final boundary cue.
      // Marker "ba"/"bu" is 2 chars; each digit syllable is 2 chars; vowel is the 2nd.
      stress.push(signStart + 2 + (group.exponentDigits.length - 1) * 2 + 1);
    } else {
      // Digitless exponent marker (`ba` / `bu` alone): stress the marker vowel.
      stress.push(signStart + 1);
    }
  }

  if (hasMantissa) {
    if (hasExponent) text += "ya";
    const mantissaStart = text.length;
    text += digitsToSyllables(group.mantissa!);
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
export function numberStemToSpeech(stem: NumberStem): string {
  return numberStemToSpeechStressed(stem).text;
}

/** Speech text plus char offsets of vowels to carry primary stress. */
export function numberStemToSpeechStressed(stem: NumberStem): {
  text: string;
  stress: number[];
} {
  const stress: number[] = [];
  // Calendar-ordinal dates (`_` + `#`, numbers.md § Time) speak the digraph marker `roe`.
  const marker = stem.calendarOrdinal ? "roe" : markerToSpeech(stem.marker);
  // Spoken comma: `th` + the marker's first vowel (numbers.md § Saying it aloud).
  const separator = `th${marker.charAt(1)}`;
  let text = marker;
  if (stem.groups.length === 0 && !stem.digitlessExp) {
    // Digitless word: stress the marker vowel.
    stress.push(1);
  }

  if (stem.digitlessExp) {
    // Spelled-out stems keep leading mantissa digits in groups (`grazobal`: zo + ba).
    for (const group of stem.groups) text += groupToSpeech(group);
    const exp = digitlessExpToSpeech(stem.digitlessExp);
    const at = digitlessExpStress(stem.digitlessExp);
    if (at !== undefined) stress.push(text.length + at);
    text += exp;
    return { text, stress };
  }

  if (stem.marker === "_" || stem.marker === "ro") {
    // Digit-string label: last digit of each comma group.
    for (const [i, group] of stem.groups.entries()) {
      if (i > 0) text += separator;
      const start = text.length;
      const mantissa = group.mantissa ?? "";
      text += digitsToSyllables(mantissa);
      if (mantissa.length > 0) stress.push(start + (mantissa.length - 1) * 2 + 1);
    }
    return { text, stress };
  }

  for (const [i, group] of stem.groups.entries()) {
    if (i > 0) text += separator;
    const part = groupToSpeechStressed(group);
    for (const s of part.stress) stress.push(text.length + s);
    text += part.text;
  }
  return { text, stress };
}

function posPrefix(word: MorphWord): string {
  if (!word.pos) return "";
  return word.gl ? "gl" : word.pos;
}

function endingSuffix(word: MorphWord): string {
  let out = word.ending ?? "";
  if (word.plural) out += "x";
  return out;
}

/** Full speech CV surface for a free number word or numeric-derivation host. */
export function numberWordToSpeech(word: MorphWord): string {
  return numberWordToSpeechStressed(word).raw;
}

/**
 * Speech CV surface plus char offsets of vowels that carry primary stress
 * for TTS rhythm (last digit of each group; digitless stresses the marker).
 */
export function numberWordToSpeechStressed(word: MorphWord): {
  raw: string;
  stress: number[];
} {
  const family = word.family;
  let head = "";
  let stem: NumberStem;
  if (family.kind === "number") {
    head = posPrefix(word);
    stem = family.stem;
  } else if (family.kind === "x" && family.xFamily === "numeric" && family.numberStem) {
    stem = family.numberStem;
    // Numeric derivation: host root + lexical join (`l` / `m`), not mid-word `x`.
    head = posPrefix(word) + family.leftRoots.join("") + (family.join ?? "x");
  } else {
    throw new Error(`Not a number word: ${word.raw}`);
  }

  const body = numberStemToSpeechStressed(stem);
  const raw = head + body.text + endingSuffix(word);
  return { raw, stress: body.stress.map((s) => s + head.length) };
}
