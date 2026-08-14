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
  let out = "";
  const hasExponent = !!group.exponentSign;
  const hasMantissa = group.mantissa !== undefined && group.mantissa !== "";

  if (hasExponent) {
    out += group.exponentSign!;
    if (group.exponentDigits) out += digitsToSyllables(group.exponentDigits);
  }

  if (hasMantissa) {
    if (hasExponent) out += "ja";
    out += digitsToSyllables(group.mantissa!);
  }

  if (group.percent) out += group.percent;
  return out;
}

/** Serialize a normalized number stem to speech CV (marker + body, no PoS or ending). */
export function numberStemToSpeech(stem: NumberStem): string {
  let out = markerToSpeech(stem.marker);

  if (stem.digitlessExp) {
    out += digitlessExpToSpeech(stem.digitlessExp);
    return out;
  }

  if (stem.marker === "_" || stem.marker === "ro") {
    const digits = stem.groups.map((g) => g.mantissa ?? "").join("");
    out += digitsToSyllables(digits);
    return out;
  }

  for (const group of stem.groups) {
    out += groupToSpeech(group);
  }
  return out;
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
  const family = word.family;
  if (family.kind === "number") {
    return posPrefix(word) + numberStemToSpeech(family.stem) + endingSuffix(word);
  }
  if (family.kind === "x" && family.xFamily === "numeric" && family.numberStem) {
    const host = family.leftRoots.join("");
    return posPrefix(word) + host + "x" + numberStemToSpeech(family.numberStem) + endingSuffix(word);
  }
  throw new Error(`Not a number word: ${word.raw}`);
}
