/**
 * Initials follow their title (initials.md#initials). A long title's handle (`z@_nl`) copies each
 * title root's first consonant, and its 🔊 line (`zrenulan`) speaks that handle. When the retie moves
 * a title root to one with another first consonant, the handle, its speech and the English capitals
 * (*the NL*) on the same page move with it. Two titles on one page that share the old initials are
 * left for review: nothing says which of them a handle names.
 */
import { parseWord } from "../parse/word.js";
import { numberWordToSpeech } from "../tts/numbers.js";

export type InitialsFix = { index: number; from: string; to: string };
export type InitialsReview = { index: number; text: string; reason: string };

/** A hyphenated name (`ROOT x ROOT … + -n`): PoS letter, a vowel-initial root, `x`, …, ending `n`. */
const TITLE_RE = /(?<![a-z])[a-z][aeou][a-z]*x[a-z]*n(?![a-z])/g;

/** Each title root's first consonant, `th` as one letter; `undefined` when `word` is not a hyphenated name. */
export function titleInitials(word: string): string | undefined {
  let family;
  try {
    family = parseWord(word).family;
  } catch {
    return undefined;
  }
  if (family.kind !== "x" || family.xFamily !== "compound") return undefined;
  const roots = [...family.leftRoots, ...(family.rightRoots ?? [])];
  const letters = roots.map((root) => /th|[^aeou]/.exec(root)?.[0]);
  return letters.every((letter) => letter !== undefined) ? letters.join("") : undefined;
}

/** A title's roots: the word without its PoS letter and ending. */
function rootsOf(title: string): string {
  return title.slice(1, -1);
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function speechOf(handle: string): string | undefined {
  try {
    return numberWordToSpeech(parseWord(handle));
  } catch {
    return undefined;
  }
}

/**
 * Respell initials on one page. `before` is the page as it was, `text` the retied page, and `pairs`
 * the page's word changes (old → new, from `wordPairsOf`).
 */
export function respellInitials(
  before: string,
  text: string,
  pairs: ReadonlyMap<string, string>,
): { text: string; fixes: InitialsFix[]; reviews: InitialsReview[] } {
  const fixes: InitialsFix[] = [];
  const reviews: InitialsReview[] = [];

  // Old initials → new initials, from each title the page moved.
  const moved = new Map<string, string>();
  for (const [from, to] of pairs) {
    const was = titleInitials(from);
    const now = titleInitials(to);
    if (was && now && was !== now) moved.set(from, now);
  }
  if (moved.size === 0) return { text, fixes, reviews };

  // Every title the page spelled before the retie, by its initials; a title is its roots, whatever its PoS letter.
  const titlesByInitials = new Map<string, { titles: Map<string, string>; index: number }>();
  for (const match of before.matchAll(TITLE_RE)) {
    const initials = titleInitials(match[0]);
    if (!initials) continue;
    const entry = titlesByInitials.get(initials) ?? { titles: new Map<string, string>(), index: match.index };
    entry.titles.set(rootsOf(match[0]), match[0]);
    titlesByInitials.set(initials, entry);
  }

  const renames = new Map<string, string>();
  for (const [title, to] of moved) {
    const was = titleInitials(title)!;
    const shared = titlesByInitials.get(was);
    if (shared && shared.titles.size > 1) {
      reviews.push({
        index: shared.index,
        text: [...shared.titles.values()].join(" / "),
        reason: `titles share initials ${was}; respell their handles and 🔊 lines by hand`,
      });
      continue;
    }
    const clash = titlesByInitials.get(to);
    if (clash && [...clash.titles.keys()].some((other) => other !== rootsOf(title))) {
      reviews.push({
        index: clash.index,
        text: `${title} → ${pairs.get(title)}`,
        reason: `new initials ${to} are already ${[...clash.titles.values()].join(" / ")}'s; check which title each handle names`,
      });
    }
    if (renames.has(was) && renames.get(was) !== to) {
      renames.delete(was);
      continue;
    }
    renames.set(was, to);
  }
  if (renames.size === 0) return { text, fixes, reviews };

  const olds = [...renames.keys()].sort((a, b) => b.length - a.length);

  // Handles: PoS letter, its marks, `_`, the initials (a morph copy such as `z-_nl` included).
  const handleRe = new RegExp(`(?<![A-Za-z])([a-z][^A-Za-z0-9\\s\`_]{0,2}_)(${olds.map(escape).join("|")})(?![a-z0-9])`, "g");
  const speech = new Map<string, string>();
  let out = text.replace(handleRe, (whole: string, head: string, initials: string, offset: number) => {
    const fixed = `${head}${renames.get(initials)!}`;
    const said = speechOf(whole);
    const now = speechOf(fixed);
    if (said && now) speech.set(said, now);
    fixes.push({ index: offset, from: whole, to: fixed });
    return fixed;
  });

  // 🔊 lines that speak an old handle.
  if (speech.size > 0) {
    const saids = [...speech.keys()].sort((a, b) => b.length - a.length);
    const saidRe = new RegExp(`(?<![a-z])(${saids.map(escape).join("|")})(?![a-z])`, "g");
    out = out.replace(/🔊 `([^`]+)`/g, (whole: string, body: string, offset: number) => {
      const next = body.replace(saidRe, (word) => speech.get(word)!);
      if (next === body) return whole;
      const fixed = `🔊 \`${next}\``;
      fixes.push({ index: offset, from: whole, to: fixed });
      return fixed;
    });
  }

  // The English capitals (*the NL*).
  const capsRe = new RegExp(`(?<![A-Za-z])(${olds.map((initials) => escape(initials.toUpperCase())).join("|")})(?![A-Za-z])`, "g");
  out = out.replace(capsRe, (caps: string, _: string, offset: number) => {
    const fixed = renames.get(caps.toLowerCase())!.toUpperCase();
    fixes.push({ index: offset, from: caps, to: fixed });
    return fixed;
  });

  return { text: out, fixes, reviews };
}
