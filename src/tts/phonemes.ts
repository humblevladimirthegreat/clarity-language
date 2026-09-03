/**
 * Grapheme → phoneme for native Agalan spelling.
 * IPA targets are from docs/grammar/phonology.md.
 *
 * Browser Speak maps this IPA to KittenTTS input_ids (see kitten-ids.ts).
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
};

export type PhonemeWord = {
  raw: string;
  syllables: Syllable[];
  /** Syllable IPA joined with dots (display / citation). */
  ipa: string;
};

const NATIVE_WORD = /^[aegouhwdjbzmnvlrx]+(?:sh)?$/;

export function isNativeSurface(raw: string): boolean {
  return NATIVE_WORD.test(raw);
}

/**
 * Concatenate syllable IPA for Kitten (no dots).
 * Hiatus (vowel–vowel) gets primary stress on the second nucleus so the model
 * does not diphthongize (unless that syllable is already stressed).
 */
export function wordIpaPhones(word: PhonemeWord): string {
  let out = "";
  let prevEndedVowel = false;
  for (const syl of word.syllables) {
    const first = syl.phones[0];
    if (prevEndedVowel && first?.vowel && !syl.ipa.startsWith("ˈ")) {
      out += `ˈ${syl.ipa}`;
    } else {
      out += syl.ipa;
    }
    prevEndedVowel = syl.phones.at(-1)?.vowel ?? false;
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
  return { phones, ipa };
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
  };
}
