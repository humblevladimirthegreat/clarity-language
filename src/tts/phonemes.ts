/**
 * Grapheme → phoneme for native Agalan spelling.
 * IPA targets are from docs/grammar/phonology.md.
 *
 * Engine tokens are lowercase Latin respellings (one per syllable). This WASM
 * eSpeak does not honor `[[phoneme]]` input, so Kirshenbaum / `A:` / CamelCase
 * is spoken as English punctuation and letter names.
 */

const VOWELS = new Set(["e", "u", "o", "a"]);

const LETTER_IPA: Record<string, string> = {
  e: "e̞",
  u: "ʌ",
  o: "o",
  a: "ɑ",
  h: "ɦ",
  w: "w",
  g: "ɡ",
  d: "d",
  j: "j",
  b: "b",
  z: "z",
  m: "m",
  n: "n",
  v: "v",
  l: "l",
  r: "ɹ",
  x: "ʒ",
};

/** English-voice cue spellings so eSpeak reads a syllable as one word, not letters. */
const VOWEL_ENGINE: Record<string, string> = {
  a: "ah",
  e: "eh",
  u: "uh",
  o: "oh",
};

const CONS_ENGINE: Record<string, string> = {
  h: "h",
  w: "w",
  g: "g",
  d: "d",
  j: "y",
  b: "b",
  z: "z",
  m: "m",
  n: "n",
  v: "v",
  l: "l",
  r: "r",
  x: "zh",
  sh: "sh",
};

export type Phone = {
  letter: string;
  ipa: string;
  vowel: boolean;
  /** Char index of this phone's source letter in the raw word. */
  index: number;
};

export type Syllable = {
  phones: Phone[];
  ipa: string;
  /** One lowercase token; eSpeak treats spaces as word (syllable) breaks. */
  engine: string;
};

export type PhonemeWord = {
  raw: string;
  syllables: Syllable[];
  ipa: string;
  /** Syllable engine tokens joined with spaces. */
  engine: string;
};

export type EngineSyllable = {
  text: string;
  ipa: string;
};

export type EngineWord = {
  raw: string;
  syllables: EngineSyllable[];
};

export type EngineUtterance = {
  words: EngineWord[];
  /** Flattened string sent to eSpeak (syllable tokens + punctuation). */
  text: string;
};

const NATIVE_WORD = /^[aegouhwdjbzmnvlrx]+(?:sh)?$/;

export function isNativeSurface(raw: string): boolean {
  return NATIVE_WORD.test(raw);
}

export function engineTokenFromPhones(phones: Phone[]): string {
  let out = "";
  for (const phone of phones) {
    if (phone.vowel) out += VOWEL_ENGINE[phone.letter] ?? "ah";
    else out += CONS_ENGINE[phone.letter] ?? phone.letter;
  }
  return out;
}

function phonesOf(raw: string): Phone[] {
  const phones: Phone[] = [];
  let i = 0;
  while (i < raw.length) {
    if (i === raw.length - 2 && raw.endsWith("sh")) {
      phones.push({ letter: "sh", ipa: "ʃ", vowel: false, index: i });
      break;
    }
    const letter = raw[i]!;
    const ipa = LETTER_IPA[letter];
    if (!ipa) {
      throw new Error(`No phoneme for letter ${letter} in ${raw}`);
    }
    phones.push({ letter, ipa, vowel: VOWELS.has(letter), index: i });
    i += 1;
  }
  return phones;
}

/** Split so each vowel is a nucleus; consonants before the next vowel are onsets; leftover after the last vowel is coda. */
export function syllabify(phones: Phone[]): Syllable[] {
  const syllables: Syllable[] = [];
  let i = 0;
  while (i < phones.length) {
    const start = i;
    while (i < phones.length && !phones[i]!.vowel) i += 1;
    if (i >= phones.length) {
      const leftover = phones.slice(start);
      const last = syllables.at(-1);
      if (last) {
        last.phones.push(...leftover);
        last.ipa = last.phones.map((p) => p.ipa).join("");
        last.engine = engineTokenFromPhones(last.phones);
      } else {
        syllables.push(syllableFrom(leftover));
      }
      break;
    }
    i += 1;
    const laterVowel = phones.slice(i).some((p) => p.vowel);
    if (!laterVowel) i = phones.length;
    syllables.push(syllableFrom(phones.slice(start, i)));
  }
  return syllables;
}

function syllableFrom(phones: Phone[], stress: ReadonlySet<number> = new Set()): Syllable {
  const ipa = phones.map((p) => (p.vowel && stress.has(p.index) ? `ˈ${p.ipa}` : p.ipa)).join("");
  return { phones, ipa, engine: engineTokenFromPhones(phones) };
}

export function toPhonemeWord(
  raw: string,
  stressVowels?: Iterable<number>,
): PhonemeWord {
  const stress = new Set(stressVowels ?? []);
  const syllables = syllabify(phonesOf(raw)).map((s) => syllableFrom(s.phones, stress));
  return {
    raw,
    syllables,
    ipa: syllables.map((s) => s.ipa).join("."),
    engine: syllables.map((s) => s.engine).join(" "),
  };
}

export function toEngineWord(word: PhonemeWord): EngineWord {
  return {
    raw: word.raw,
    syllables: word.syllables.map((s) => ({ text: s.engine, ipa: s.ipa })),
  };
}

/** eSpeak word tokens in engine text (letters only). Matches one token per syllable. */
export function engineSyllableTokens(text: string): string[] {
  return text.split(/[^a-z]+/).filter(Boolean);
}
