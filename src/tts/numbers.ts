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
  if (marker === "#-" || marker === "reu") return "reu";
  return "ro";
}

export function digitsToSyllables(digits: string): string {
  let out = "";
  for (const ch of digits) {
    if (ch === ".") out += "je";
    else out += DIGIT_TO_SYLLABLE[ch] ?? "";
  }
  return out;
}

export function digitlessExpToSpeech(exp: string): string {
  switch (exp) {
    case "e":
      return "ba";
    case "e-":
      return "bu";
    case "0e":
      return "zoba";
    case "0e-":
      return "zobu";
    case "1e":
      return "woba";
    case "1e-":
      return "wobu";
    case "0e-1":
      return "buwojazo";
    default:
      return "";
  }
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
    if (hasExponent) text += "ja";
    const mantissaStart = text.length;
    text += digitsToSyllables(group.mantissa!);
    if (!hasExponent) {
      // No exponent: stress the LAST mantissa digit's vowel.
      stress.push(mantissaStart + (group.mantissa!.length - 1) * 2 + 1);
    }
    // je (decimal point) is always stressed wheredegur it appears.
    let at = mantissaStart;
    for (const ch of group.mantissa!) {
      if (ch === ".") stress.push(at + 1);
      at += ch === "." ? 2 : 2;
    }
  }

  if (group.percent) {
    stress.push(text.length + 1); // jo / ju always stressed
    text += group.percent;
  }

  return { text, stress };
}

/** Serialize a normalized number stem to speech CV (marker + body, no PoS or ending). */
export function numberStemToSpeech(stem: NumberStem): string {
  return numberStemToSpeechStressed(stem).text;
}

const DIGITLESS_EXP_STRESS: Record<string, number> = {
  // text: marker/digit vowel offsets within digitlessExpToSpeech output
  e: 1, // ba — bare marker
  "e-": 1, // bu — bare marker
  "0e": 1, // zoba — mantissa zo (no exponent digits)
  "0e-": 1, // zobu
  "1e": 1, // woba
  "1e-": 1, // wobu
  "0e-1": 3, // bu·wo·ja·zo — last exponent digit wo
};

/** Speech text plus char offsets of vowels to carry primary stress. */
export function numberStemToSpeechStressed(stem: NumberStem): {
  text: string;
  stress: number[];
} {
  const stress: number[] = [];
  // Calendar-ordinal dates (`_` + `#`, numbers.md § Time) speak the digraph marker `roe`.
  let text = stem.calendarOrdinal ? "roe" : markerToSpeech(stem.marker);
  if (stem.groups.length === 0 && !stem.digitlessExp) {
    // Digitless word: stress the marker vowel.
    stress.push(1);
  }

  if (stem.digitlessExp) {
    text += digitlessExpToSpeech(stem.digitlessExp);
    const at = DIGITLESS_EXP_STRESS[stem.digitlessExp];
    if (at !== undefined) stress.push(text.length - digitlessExpToSpeech(stem.digitlessExp).length + at);
    return { text, stress };
  }

  if (stem.marker === "_" || stem.marker === "ro") {
    // Digit-string label: last digit of each comma group.
    for (const group of stem.groups) {
      const start = text.length;
      const mantissa = group.mantissa ?? "";
      text += digitsToSyllables(mantissa);
      if (mantissa.length > 0) stress.push(start + (mantissa.length - 1) * 2 + 1);
    }
    return { text, stress };
  }

  for (const group of stem.groups) {
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
  if (word.plural) out += "sh";
  return out;
}

/** Full speech CV surface for a free number word or numeric-derivation host. */
export function numberWordToSpeech(word: MorphWord): string {
  return numberWordToSpeechStressed(word).raw;
}

/**
 * Speech CV surface plus char offsets of vowels that carry primary stress
 * ([numbers.md § Stress](../../../docs/grammar/numbers.md)).
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
    head = posPrefix(word) + family.leftRoots.join("") + "x";
  } else {
    throw new Error(`Not a number word: ${word.raw}`);
  }

  const body = numberStemToSpeechStressed(stem);
  const raw = head + body.text + endingSuffix(word);
  return { raw, stress: body.stress.map((s) => s + head.length) };
}
