/**
 * Grapheme → phoneme for native Agelan spelling.
 * IPA targets are from docs/grammar/phonology.md. eSpeak names are the
 * closest English-voice phones (approximation, not a claim of identity):
 *
 *   e̞→e  ʌ→V  o→o  ɑ→A  ɦ→h  ʒ→Z  ʃ→S  ɹ→r  ɡ→g
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

const LETTER_ESPEAK: Record<string, string> = {
  e: "e",
  u: "V",
  o: "o",
  a: "A",
  h: "h",
  w: "w",
  g: "g",
  d: "d",
  j: "j",
  b: "b",
  z: "z",
  m: "m",
  n: "n",
  v: "v",
  l: "l",
  r: "r",
  x: "Z",
};

export type Phone = {
  letter: string;
  ipa: string;
  espeak: string;
  vowel: boolean;
  /** Char index of this phone's source letter in the raw word. */
  index: number;
};

export type Syllable = {
  phones: Phone[];
  ipa: string;
  espeak: string;
};

export type PhonemeWord = {
  raw: string;
  syllables: Syllable[];
  ipa: string;
  espeak: string;
};

const NATIVE_WORD = /^[aegouhwdjbzmnvlrx]+(?:sh)?$/;

export function isNativeSurface(raw: string): boolean {
  return NATIVE_WORD.test(raw);
}

function phonesOf(raw: string): Phone[] {
  const phones: Phone[] = [];
  let i = 0;
  while (i < raw.length) {
    if (i === raw.length - 2 && raw.endsWith("sh")) {
      phones.push({ letter: "sh", ipa: "ʃ", espeak: "S", vowel: false, index: i });
      break;
    }
    const letter = raw[i]!;
    const ipa = LETTER_IPA[letter];
    const espeak = LETTER_ESPEAK[letter];
    if (!ipa || !espeak) {
      throw new Error(`No phoneme for letter ${letter} in ${raw}`);
    }
    phones.push({ letter, ipa, espeak, vowel: VOWELS.has(letter), index: i });
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
        last.espeak = last.phones.map((p) => p.espeak).join("");
        // NOTE: caller re-maps via syllableFrom for stress; keep raw merge here.
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
  const espeak = phones.map((p) => (p.vowel && stress.has(p.index) ? `'${p.espeak}` : p.espeak)).join("");
  const ipa = phones.map((p) => (p.vowel && stress.has(p.index) ? `ˈ${p.ipa}` : p.ipa)).join("");
  return { phones, ipa, espeak };
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
    espeak: syllables.map((s) => s.espeak).join("."),
  };
}
