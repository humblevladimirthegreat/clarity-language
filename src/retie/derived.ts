/**
 * Text a page derives from a spelling without being one: whole-line IPA (`/ ˈzʉ.zä.zo̞n /`),
 * italic syllable hints (*o-wo-re-lul*), and a word spelled aloud inline (`` `egazo` is `e` `ga` … ``).
 * The retie moves the Ageben; this pass makes each copy follow its word, using the page's own
 * word changes, so text that never spelled a moved word is left alone.
 */
import { toPhonemeWord } from "../tts/phonemes.js";

import { spellOut } from "./letter-names.js";
import type { RetieChange } from "./tokens.js";

export type DerivedFix = { index: number; from: string; to: string };

const WORD_RE = /(?<![A-Za-z])[a-z]+(?![A-Za-z])/g;

/**
 * Old word → new word for the page, from each change's letter runs paired in order (a change that
 * moves a cite pairs each word inside it). A word changed two ways on one page is left out.
 */
export function wordPairsOf(changes: readonly RetieChange[]): Map<string, string> {
  const pairs = new Map<string, string>();
  const conflicts = new Set<string>();
  for (const { from, to } of changes) {
    const a = from.match(WORD_RE) ?? [];
    const b = to.match(WORD_RE) ?? [];
    if (a.length !== b.length) continue;
    a.forEach((word, i) => {
      const next = b[i]!;
      if (word === next || word.length < 2 || conflicts.has(word)) return;
      const had = pairs.get(word);
      if (had !== undefined && had !== next) {
        pairs.delete(word);
        conflicts.add(word);
      } else {
        pairs.set(word, next);
      }
    });
  }
  return pairs;
}

const VOWELS = new Set(["a", "e", "o", "u"]);

/** Spelling split at syllables, as the hints write it: a consonant starts a syllable, a final one closes the last (`o-wo-re-lul`). */
export function syllableHint(word: string): string {
  const letters: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const letter = word.startsWith("th", i) ? "th" : word[i]!;
    letters.push(letter);
    i += letter.length - 1;
  }
  const syllables: string[] = [];
  let onset = "";
  for (const letter of letters) {
    if (VOWELS.has(letter)) {
      syllables.push(onset + letter);
      onset = "";
    } else {
      onset += letter;
    }
  }
  if (syllables.length === 0) return word;
  // Consonants after the last vowel close the last syllable.
  syllables[syllables.length - 1] += onset;
  return syllables.join("-");
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Old → new IPA, longest first, so a short word's IPA never matches inside a longer one. */
function ipaPairs(pairs: ReadonlyMap<string, string>): [string, string][] {
  const out: [string, string][] = [];
  for (const [from, to] of pairs) {
    try {
      const a = toPhonemeWord(from).ipa;
      const b = toPhonemeWord(to).ipa;
      if (a && b && a !== b) out.push([a, b]);
    } catch {
      // not a native spelling: no IPA to follow
    }
  }
  return out.sort((x, y) => y[0].length - x[0].length);
}

const IPA_LINE_RE = /^([ \t]*(?:>[ \t]*)?)\/(.+)\/[ \t]*$/gm;
const HINT_RE = /(?<![*\w])\*([a-z]+(?:-[a-z]+)+)\*(?![*\w])/g;
const SPELLED_RE = /`([a-z]+)` (is|→|=) ((?:`[a-z]+`(?: |(?=[^`]|$)))+)/g;

/**
 * Respell what `text` derives from the words in `pairs` (old → new). `names` is the letter-name
 * table (letter → name) for words spelled aloud; without it those are skipped.
 */
export function respellDerived(
  text: string,
  pairs: ReadonlyMap<string, string>,
  names: ReadonlyMap<string, string> = new Map(),
): { text: string; fixes: DerivedFix[] } {
  const fixes: DerivedFix[] = [];
  if (pairs.size === 0) return { text, fixes };

  // Whole-line IPA. A word's IPA is bounded by a space, a bracket, the slash, a stress mark, or a
  // sentence period (a period followed by a space or the slash, not a syllable dot).
  const ipa = ipaPairs(pairs);
  let out = text;
  if (ipa.length > 0) {
    const byOld = new Map(ipa);
    const ipaRe = new RegExp(`(?<=^|[\\s(/ˈ])(${ipa.map(([a]) => escape(a)).join("|")})(?=$|[\\s)/,]|\\.(?:\\s|/|$))`, "gu");
    out = out.replace(IPA_LINE_RE, (line: string, lead: string, body: string, offset: number) => {
      const next = body.replace(ipaRe, (match) => byOld.get(match) ?? match);
      if (next === body) return line;
      const fixed = `${lead}/${next}/`;
      fixes.push({ index: offset, from: line, to: fixed });
      return fixed + line.slice(lead.length + body.length + 2);
    });
  }

  // Syllable hints: the letters of one or more moved words, split at syllables.
  const olds = [...pairs.keys()].sort((a, b) => b.length - a.length);
  const oldRe = new RegExp(olds.map(escape).join("|"), "g");
  out = out.replace(HINT_RE, (hint: string, body: string, offset: number) => {
    const spelled = body.replace(/-/g, "");
    if (syllableHint(spelled) !== body) return hint;
    const moved = spelled.replace(oldRe, (word) => pairs.get(word) ?? word);
    if (moved === spelled) return hint;
    const fixed = `*${syllableHint(moved)}*`;
    fixes.push({ index: offset, from: hint, to: fixed });
    return fixed;
  });

  // A word spelled aloud inline: the names still spell the word's old letters.
  if (names.size > 0) {
    const oldOf = new Map([...pairs].map(([from, to]) => [to, from]));
    out = out.replace(SPELLED_RE, (whole: string, word: string, verb: string, run: string, offset: number) => {
      const old = oldOf.get(word);
      const written = (run.match(/`([a-z]+)`/g) ?? []).map((span) => span.slice(1, -1));
      const was = old ? spellOut(old, names) : undefined;
      const now = spellOut(word, names);
      if (!was || !now || written.join(" ") !== was.join(" ")) return whole;
      const trailing = run.endsWith(" ") ? " " : "";
      const fixed = `\`${word}\` ${verb} ${now.map((name) => `\`${name}\``).join(" ")}${trailing}`;
      fixes.push({ index: offset, from: whole, to: fixed });
      return fixed;
    });
  }
  return { text: out, fixes };
}
