/**
 * KittenTTS TextCleaner token mapping (Apache-2.0, from KittenML / kitten-tts-js).
 * Maps IPA phoneme strings to model input_ids — no English G2P.
 */

const _pad = "$";
const _punctuation = ";:,.!?¡¿—…\"«»\"\" ";
const _letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const _letters_ipa =
  "ɑɐɒæɓʙβɔɕçɗɖðʤəɘɚɛɜɝɞɟʄɡɠɢʛɦɧħɥʜɨɪʝɭɬɫɮʟɱɯɰŋɳɲɴøɵɸθœɶʘɹɺɾɻʀʁɽʂʃʈʧʉʊʋⱱʌɣɤʍχʎʏʑʐʒʔʡʕʢǀǁǂǃˈˌːˑʼʴʰʱʲʷˠˤ˞↓↑→↗↘'̩'ᵻ";

export const KITTEN_SYMBOLS = [_pad, ..._punctuation, ..._letters, ..._letters_ipa];

const SYMBOL_TO_ID = new Map<string, number>();
KITTEN_SYMBOLS.forEach((symbol, index) => SYMBOL_TO_ID.set(symbol, index));

/** Kitten end marker (U+2026) between content and trailing pad. */
export const KITTEN_END_MARKER_ID = 10;

/** Max input_ids length before splitting on word boundaries. */
export const KITTEN_MAX_INPUT_IDS = 510;

const KITTEN_ALLOWED = new Set(KITTEN_SYMBOLS);

/** Strip combining marks not in Kitten's alphabet (e̞ → e, etc.). */
export function normalizeIpaForKitten(ipa: string): string {
  let out = "";
  for (const ch of ipa.normalize("NFD")) {
    if (ch === "\u031E") continue;
    if (KITTEN_ALLOWED.has(ch)) out += ch;
  }
  return out;
}

export function textToKittenIds(text: string): number[] {
  const ids: number[] = [];
  for (const ch of text) {
    const id = SYMBOL_TO_ID.get(ch);
    if (id !== undefined) ids.push(id);
  }
  return ids;
}

export function wrapKittenIds(contentIds: number[]): number[] {
  return [0, ...contentIds, KITTEN_END_MARKER_ID, 0];
}

export class KittenTextCleaner {
  clean(phonemes: string): number[] {
    return wrapKittenIds(textToKittenIds(phonemes));
  }
}

const cleaner = new KittenTextCleaner();

export function ipaToKittenIds(ipaPhonemes: string): number[] {
  return cleaner.clean(normalizeIpaForKitten(ipaPhonemes));
}

/** Split long utterances on spaces so each chunk stays under the id cap. */
export function chunkIpaPhonemes(ipaPhonemes: string, maxIds = KITTEN_MAX_INPUT_IDS): string[] {
  const normalized = normalizeIpaForKitten(ipaPhonemes);
  if (wrapKittenIds(textToKittenIds(normalized)).length <= maxIds) return [normalized];

  const chunks: string[] = [];
  let current = "";
  for (const word of normalized.split(" ")) {
    if (!word) continue;
    const candidate = current ? `${current} ${word}` : word;
    if (wrapKittenIds(textToKittenIds(candidate)).length > maxIds) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function ipaPhonemesToKittenIdChunks(ipaPhonemes: string): number[][] {
  return chunkIpaPhonemes(ipaPhonemes).map((chunk) => ipaToKittenIds(chunk));
}
