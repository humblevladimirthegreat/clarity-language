/**
 * CMU Pronouncing Dictionary lookup for the root converter.
 * The file is tmp/cmudict.dict (pinned download in scripts/echo-pronunciation.ts).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const CMU_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "tmp", "cmudict.dict");

/**
 * CMU variant to use when the first pronunciation is the wrong sense
 * (`tear` 2 = *teer*, `st` 2 = *saint*). Every other word uses its first variant.
 */
export const CMU_VARIANTS: Record<string, number> = {
  tear: 2, wind: 2, id: 2, un: 2, us: 2, st: 2, record: 2,
};

/** Our own pronunciations (CMU phonemes) for labels CMU lacks and no CMU word replaces. */
export const CMU_OVERRIDES: Record<string, string> = {
  hibiscus: "HH AY0 B IH1 S K AH0 S",
  khanda: "K AA1 N D AH0",
  unlink: "AH0 N L IH1 NG K",
  interrobang: "IH0 N T EH1 R AH0 B AE2 NG",
  tamale: "T AH0 M AA1 L IY0",
  tempura: "T EH0 M P UH1 R AH0",
  pinata: "P IY0 N Y AA1 T AH0",
  mahjong: "M AA1 ZH AA2 NG",
  sagittarius: "S AE2 JH IH0 T EH1 R IY0 AH0 S",
  ophiuchus: "AO2 F IY0 UW1 K AH0 S",
  // Places: keyed by the whole label, one primary stress per word, `|` between words.
  uae: "Y UW2 EY2 IY1",
  "bouvet-island": "B UW0 V EY1 | AY1 L AH0 N D",
  "cote-d-ivoire": "K OW1 T | D IY0 V W AA1 R",
  "clipperton-island": "K L IH1 P ER0 T AH0 N | AY1 L AH0 N D",
  czechia: "CH EH1 K IY0 AH0",
  ceuta: "S EY1 UW0 T AH0",
  "faroe-islands": "F EH1 R OW0 | AY1 L AH0 N D Z",
  "guinea-bissau": "G IH1 N IY0 | B IH0 S AW1",
  chagos: "CH AA1 G OW0 S",
  nauru: "N AA0 UW1 R UW0",
  niue: "N IY0 UW1 EY0",
  "pitcairn-islands": "P IH1 T K EH0 R N | AY1 L AH0 N D Z",
  svalbard: "S V AA1 L B AA0 R",
  "sint-maarten": "S IH1 N T | M AA1 R T AH0 N",
  eswatini: "EH2 S W AA0 T IY1 N IY0",
  "turks-caicos": "T ER1 K S | K EY1 K OW0 S",
  tokelau: "T OW1 K AH0 L AW0",
  "timor-leste": "T IY1 M AO0 R | L EH1 S T EY0",
  turkiye: "T ER1 K IY0 Y EH0",
};

let cached: Map<string, string[]> | undefined;

/** word → chosen CMU phones (`|` is a word break inside an override). */
export function loadCmu(): Map<string, string[]> {
  if (cached) return cached;
  if (!existsSync(CMU_PATH)) {
    throw new Error(`${CMU_PATH} missing: run node scripts/echo-pronunciation.ts`);
  }
  const variants = new Map<string, string[][]>();
  for (const line of readFileSync(CMU_PATH, "utf8").split("\n")) {
    const [head, ...rest] = line.replace(/\s*#.*$/, "").trim().split(/\s+/);
    if (!head || rest.length === 0) continue;
    const word = head.replace(/\(\d+\)$/, "");
    const list = variants.get(word);
    if (list) list.push(rest);
    else variants.set(word, [rest]);
  }
  const cmu = new Map<string, string[]>();
  for (const [word, list] of variants) {
    // hasOwn, not a bare lookup: `constructor` is a CMU word and also lives on Object.prototype.
    const pick = Object.hasOwn(CMU_VARIANTS, word) ? CMU_VARIANTS[word]! : 1;
    const phones = list[pick - 1];
    if (!phones) throw new Error(`${word} has no CMU variant ${pick}`);
    cmu.set(word, phones);
  }
  for (const [word, phones] of Object.entries(CMU_OVERRIDES)) {
    if (cmu.has(word)) throw new Error(`override ${word} is already in CMU`);
    cmu.set(word, phones.split(" "));
  }
  return (cached = cmu);
}

/**
 * CMU phones for an English label, `|` between words. Exact entry, else each
 * hyphen- or space-separated part. No spelling fallback.
 */
export function lookupPronunciation(label: string): string {
  const cmu = loadCmu();
  const text = label.trim().toLowerCase();
  const exact = cmu.get(text);
  if (exact) return exact.join(" ");
  const parts = text.split(/[-\s]+/).filter(Boolean);
  if (parts.length > 1 && parts.every((part) => cmu.has(part))) {
    return parts.map((part) => cmu.get(part)!.join(" ")).join(" | ");
  }
  throw new Error(`no CMU pronunciation for "${label}"`);
}
