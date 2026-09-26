/**
 * The learner's own Agalan name: one published root + **-n**, filling `SELF` slots
 * in grammar examples. Unset → the speaker special **`ugobon`**.
 */
import type { OverlayRow, PublishedRow } from "./lexicon-search.js";

/** Root shown in `SELF` slots when the learner has not chosen a name. */
export const DEFAULT_SELF_ROOT = "ugobo";

/** Gloss English for the default (the speaker overlay's gloss). */
const DEFAULT_SELF_GLOSS = "speaker";

/** Discourse-role specials: roles, not names. */
const SPECIAL_ROOTS = ["ugobo", "edone", "aha", "enenu"];
/** House-cast people (Azawan / Ululon / Uhubun) would collide with third-person examples. */
const HOUSE_CAST_ROOTS = ["azawa", "ululo", "uhubu"];
/** The language's own name. */
const LANGUAGE_ROOT = "agala";

/**
 * Roots whose senses make a poor personal name (death, disgust, deception, …).
 * Editor-curated; applies to the helper and the lexicon's "Use as my name" alike.
 */
export const NAME_DENY = [
  "uzulu", // skull / death
  "ulone", // skull-crossbones / danger
  "obobo", // poop / vulgarity
  "ovomu", // vomit / revulsion
  "ananu", // nauseated / disgust
  "ulule", // lie / deception
  "uzu", // sick / pathology
  "ugu", // curse / profanity
  "arage", // rage / destructiveness
  "abaga", // pig / gluttony
  "uguge", // chicken / cowardice
  "ozogo", // scorpion / betrayal
  "edede", // dead tree / decay
  "agabe", // grape / envy
  "egere", // greed / wealth
  "enede", // spend / waste
  "awaza", // wastebasket / discard
  "ugumu", // climb / failure
  "owozo", // woozy / intoxication
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

/** Regional-indicator flag emoji: country rows, whose abstract is a demonym. */
const FLAG_RE = /[\u{1F1E6}-\u{1F1FF}]/u;

/**
 * Published roots a learner may take as a name: both senses present (the helper shows both),
 * not a special / house-cast / language root, not a flag, not on {@link NAME_DENY}, and not a
 * root whose **-n** citation is already a closed overlay (`ehegen`, `odohon`, …).
 */
export function eligibleNames(rows: PublishedRow[], overlays: OverlayRow[] = []): LearnerNameOption[] {
  const excluded = new Set([...SPECIAL_ROOTS, ...HOUSE_CAST_ROOTS, LANGUAGE_ROOT, ...NAME_DENY]);
  const overlayNames = new Set(overlays.map((o) => o.senseForm).filter((form) => form.endsWith("n")));
  const seen = new Set<string>();
  const out: LearnerNameOption[] = [];
  for (const row of rows) {
    const root = row.clarity;
    if (!root || !row.concrete || !row.abstract) continue;
    if (excluded.has(root) || seen.has(root) || overlayNames.has(`${root}n`)) continue;
    if (FLAG_RE.test(row.emoji)) continue;
    seen.add(root);
    out.push({
      root,
      name: `${root}n`,
      emoji: row.emoji,
      concrete: row.concrete,
      abstract: row.abstract,
      mnemonic: row.mnemonic === "REVIEW" ? "" : row.mnemonic,
    });
  }
  return out;
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
