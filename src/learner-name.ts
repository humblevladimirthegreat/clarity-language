/**
 * The learner's own Agalan name: one published root + **-n**, filling `SELF` slots
 * in grammar examples. Unset → the speaker special **`ugobon`**.
 */
import type { OverlayRow, PublishedRow } from "./lexicon-search.js";

/** Root shown in `SELF` slots when the learner has not chosen a name. */
export const DEFAULT_SELF_ROOT = "ugobo";

/** Gloss English for the default (the speaker overlay's gloss). */
const DEFAULT_SELF_GLOSS = "speaker";

/** Discourse-role specials: with **-n** they already mean a role, not a person. */
const ROLE_WORDS: Record<string, string> = {
  ugobo: "whoever is speaking",
  edone: "whoever is listening",
  aha: "inclusive we",
  enenu: "someone",
};
/** House-cast people: a learner of the same name would collide with them in examples. */
const HOUSE_CAST: Record<string, string> = { azawa: "Azawan", ululo: "Ululon", uhubu: "Uhubun" };
/** The language's own name. */
const LANGUAGE_ROOT = "agala";

/**
 * Hand-picked names the helper suggests at random (both senses read well as a name).
 * The lexicon's "Use as my name" allows any root that is not {@link nameBanReason banned}.
 */
export const SUGGESTED_ROOTS = [
  // feelings and character
  "uguru", "uzumu", "alalu", "olove", "azada", "erelu", "ozede", "aba", "uhugu", "agade",
  // animals
  "agada", "odogo", "odere", "ubudu", "odove", "egaga", "owo", "ebede",
  // nature and sky
  "unowe", "ezede", "ere", "eneze", "adado", "oduna", "ulugu", "oro",
  // objects and craft
  "ogomo", "anogo", "alane", "abogo", "agego", "urude", "araha", "uzugo", "abadu", "agara",
];

export type LearnerNameOption = {
  root: string;
  /** The **-n** citation (`ugurun`). */
  name: string;
  emoji: string;
  concrete: string;
  abstract: string;
  mnemonic: string;
};

/** Regional-indicator flag emoji: country rows, where **-n** names the country. */
const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]/u;

/**
 * Why a root cannot be a learner's name, or null when it can. Only names that would be
 * confusing (read as something other than a person) are banned, not ones that are merely unflattering.
 */
export function nameBanReason(row: PublishedRow, overlays: OverlayRow[] = []): string | null {
  const root = row.clarity;
  const name = `${root}n`;
  if (ROLE_WORDS[root]) return `${name} already means ${ROLE_WORDS[root]}, not a person.`;
  if (HOUSE_CAST[root]) return `${HOUSE_CAST[root]} is a character in the examples; your name would clash with theirs.`;
  if (root === LANGUAGE_ROOT) return `${name} is the name of the language.`;
  const overlay = overlays.find((o) => o.senseForm === name);
  if (overlay) return `${name} is already a grammar word (${overlay.gloss}).`;
  if (FLAG_RE.test(row.emoji)) return `${name} is the name of the country (${row.concrete}).`;
  return null;
}

function toOption(row: PublishedRow): LearnerNameOption {
  return {
    root: row.clarity,
    name: `${row.clarity}n`,
    emoji: row.emoji,
    concrete: row.concrete,
    abstract: row.abstract,
    mnemonic: row.mnemonic === "REVIEW" ? "" : row.mnemonic,
  };
}

/** Every published root a learner may take as a name (not {@link nameBanReason banned}). */
export function eligibleNames(rows: PublishedRow[], overlays: OverlayRow[] = []): LearnerNameOption[] {
  const seen = new Set<string>();
  const out: LearnerNameOption[] = [];
  for (const row of rows) {
    if (!row.clarity || seen.has(row.clarity) || nameBanReason(row, overlays)) continue;
    seen.add(row.clarity);
    out.push(toOption(row));
  }
  return out;
}

/** The helper's suggestions ({@link SUGGESTED_ROOTS}), in list order. */
export function suggestedNames(rows: PublishedRow[]): LearnerNameOption[] {
  const byRoot = new Map(rows.map((row) => [row.clarity, row]));
  return SUGGESTED_ROOTS.flatMap((root) => {
    const row = byRoot.get(root);
    return row ? [toOption(row)] : [];
  });
}

/** English name for a gloss line (`z-Ugurun`), per the glosses names rule. */
export function selfGlossEnglish(root: string): string {
  if (root === DEFAULT_SELF_ROOT) return DEFAULT_SELF_GLOSS;
  const name = `${root}n`;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** `SELF` standing alone in a morph-gloss line (`z-SELF`, or a bare citation's `SELF`). */
const GLOSS_SLOT_RE = /(?<![A-Za-z0-9])SELF(?![A-Za-z0-9])/g;
/** `SELF` inside an Agalan word (`zSELFn`, `SELFn.`). */
const WORD_SLOT_RE = /SELF(?=[a-z])/g;

/** True when the text has a `SELF` slot. */
export function hasSelfSlot(text: string): boolean {
  return /SELF(?=[a-z])|(?<![A-Za-z0-9])SELF(?![A-Za-z0-9])/.test(text);
}

/**
 * Fill `SELF` slots with a root: words get the root (`zSELFn` → `zugobon`),
 * a free-standing `SELF` (gloss lines) gets the English name (`z-SELF` → `z-speaker` / `z-Ugurun`).
 */
export function fillSelf(text: string, root: string = DEFAULT_SELF_ROOT): string {
  return text.replace(GLOSS_SLOT_RE, selfGlossEnglish(root)).replace(WORD_SLOT_RE, root);
}
