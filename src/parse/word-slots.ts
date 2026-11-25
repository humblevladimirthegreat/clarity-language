// Word slots: data/word-slots.csv, which PoS letters and endings each word feature is allowed on.
//
// One row per feature: the `feature` name, the `rejection` id (in `REJECTIONS`) that closes the
// other cells, the `letters` the feature is allowed on, the `endings` it is allowed with, a `note`
// for any condition the columns can't express (naming the function and file that check it), and
// the `anchor` (`page.md#id`) of the section that teaches the rule.
//
// `letters` and `endings` are space-separated: PoS letters as the parser spells them
// (`z d b v g w h th x y`), endings without the hyphen (`l m r`). An empty field means the row
// limits no letter (or no ending). `enforce` reads `letters` through `slotAllows`; ending rules and
// the conditions in `note` stay in code. The CSV text reaches the parser through `ClassifyTables`
// (`createClassifyTables`), like the lexicon CSVs, so this module needs no `node:fs`.
import { parseCsv } from "../csv.js";
import type { Pos } from "./types.js";

export const WORD_SLOT_HEADERS = ["feature", "rejection", "letters", "endings", "note", "anchor"] as const;

export const WORD_SLOTS_FILE = "word-slots.csv";

const POS_LETTERS: ReadonlySet<string> = new Set<Pos>(["z", "d", "b", "v", "g", "w", "h", "th", "x", "y"]);

/** The features `enforce` reads letters for; each must have a row with letters. */
export const SLOT_FEATURES = [
  "sake word",
  "prescription",
  "label reach",
  "role compound",
  "hook prefix",
  "hooked join",
  "ability",
  "aside span",
  "cite, mention or opaque span",
  "name instance -ln",
  "tag pronoun",
  "role pointer",
  "plural -x",
] as const;
export type SlotFeature = (typeof SLOT_FEATURES)[number];

export type WordSlotRow = {
  feature: string;
  rejection: string;
  /** PoS letters the feature is allowed on; null when the row limits no letter. */
  letters: ReadonlySet<string> | null;
  /** Endings the feature is allowed with; null when the row limits no ending. */
  endings: ReadonlySet<string> | null;
  note: string;
  /** `page.md#id`: the section that teaches the rule. */
  anchor: string;
};

/** Rows keyed by feature. */
export type WordSlots = ReadonlyMap<string, WordSlotRow>;

function splitSet(value: string): ReadonlySet<string> | null {
  const parts = value.split(/\s+/).filter(Boolean);
  return parts.length > 0 ? new Set(parts) : null;
}

/** Parse word-slots CSV text; throws on a wrong header, a missing field, an unknown letter, a bad anchor, or a duplicate feature. */
export function parseWordSlotsCsv(text: string): WordSlots {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== WORD_SLOT_HEADERS.join(",")) {
    throw new Error(`Unexpected word-slots CSV header: ${headers.join(",")}`);
  }
  const slots = new Map<string, WordSlotRow>();
  rows.forEach((row, index) => {
    const line = index + 2;
    const [feature, rejection, letters, endings, note, anchor] = WORD_SLOT_HEADERS.map((h) => (row[h] ?? "").trim()) as [
      string,
      string,
      string,
      string,
      string,
      string,
    ];
    for (const [name, value] of [["feature", feature], ["rejection", rejection], ["anchor", anchor]] as const) {
      if (!value) throw new Error(`word-slots.csv line ${line}: missing ${name}`);
    }
    const letterSet = splitSet(letters);
    for (const letter of letterSet ?? []) {
      if (!POS_LETTERS.has(letter)) throw new Error(`word-slots.csv line ${line}: unknown PoS letter ${letter}`);
    }
    if (!/^[\w-]+\.md#[\w-]+$/.test(anchor)) {
      throw new Error(`word-slots.csv line ${line}: anchor ${anchor} is not page.md#id`);
    }
    if (slots.has(feature)) throw new Error(`word-slots.csv line ${line}: duplicate feature ${feature}`);
    slots.set(feature, { feature, rejection, letters: letterSet, endings: splitSet(endings), note, anchor });
  });
  return slots;
}

/** Whether `feature` is allowed on PoS letter `pos`; throws when the table has no letters for the feature. */
export function slotAllows(slots: WordSlots, feature: SlotFeature, pos: string): boolean {
  const letters = slots.get(feature)?.letters;
  if (!letters) throw new Error(`word-slots.csv: no letters for feature ${feature}`);
  return letters.has(pos);
}
