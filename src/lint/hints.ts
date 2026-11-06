/**
 * The fix and the owning rule for each `lint:ageben` summary line. Each hint says the edit to
 * make and names the editor note that owns the rule as `docs/meta/<file>.md#<anchor>`.
 * `hints.test.ts` checks that every anchor exists and that none points into `docs/proposals/`.
 */
export const LINT_HINTS = {
  practiceItem:
    "Follow the template and decision-item rules: give each block the item count the line asks for (docs/meta/translation-exercises.md#template, docs/meta/translation-exercises.md#item-types).",
  wordBank:
    "Add a **New words** / **Review** row for each root a drill uses, and use or drop each row no drill uses (docs/meta/translation-exercises.md#vocab-table).",
  coreVocabulary:
    "Match **New words** / **Review** to the core column, or retarget the cells (docs/meta/translation-exercises.md#core-vocabulary).",
  lookAlike:
    "Keep roots apart only in the middle vowel out of nearby checkpoints. A swapped word must still fit each item: reread them, and rewrite any that the new word makes false or odd (docs/meta/translation-exercises.md#look-alikes).",
  checkpointInventory:
    "Give every sitting one allowlist row by file, with its status and setting, and keep settings unique; a **generate** row needs its checkpoint written (docs/meta/drill-generation.md#allowlist).",
  levelReview:
    "One item per stage checkpoint, each ending with a **Rule:** link to its section (docs/meta/translation-exercises.md#level-reviews).",
  learningOrder:
    "Rewrite each listed example with forms taught by that point, or move the construction's home section earlier (docs/meta/learning-levels.md#learning-order-check).",
  drillCoverage:
    "Add ### Practice {#<band>-practice}, or an item in it that uses the family, or merge duplicate sections, or mark the page + band skip in its allowlist row (docs/meta/drill-generation.md#allowlist).",
  retieFormat:
    "Pin an English heading id, put Ageben in backticks, or fix the shared-prefix mark (docs/meta/grammar-docs.md#retie-safe-writing).",
  freeEnglish:
    'Write "sentence" (note) with a plain-English note (docs/meta/glosses.md#free-english-sentence-and-note).',
} as const;

export type LintHint = keyof typeof LINT_HINTS;

/** `docs/meta/<file>.md#<anchor>` references in a hint. */
export function hintTargets(hint: string): { file: string; anchor: string }[] {
  return [...hint.matchAll(/docs\/(meta|proposals)\/([\w./-]+\.md)#([\w-]+)/g)].map((m) => ({
    file: `docs/${m[1]}/${m[2]}`,
    anchor: m[3]!,
  }));
}
