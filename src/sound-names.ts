// Digit syllables and letter names: data/sound-names.csv.
//
// One row per name: its `group` (one set note per group), the spelled `form`, the `reading` shown beside the
// blank (the digit or the letter it names), the English `cue` from the page table, the `anchor` (`page.md#id`)
// of the section that teaches it, and the `checkpoint` (`page.md#id`) whose Practice unlocks the card.
// The flashcards read these rows; `sound-names.test.ts` checks every row against the page tables.
import { parseCsv } from "./csv.js";
import { readData } from "./repo-paths.js";

export const SOUND_NAME_HEADERS = ["group", "form", "reading", "cue", "anchor", "checkpoint"] as const;

export const SOUND_NAME_FILE = "sound-names.csv";

export type SoundNameGroup = "digits" | "digit-letters" | "other-letters" | "vowels";

/** Groups in note order, with the set note's title. */
export const SOUND_NAME_GROUPS: Readonly<Record<SoundNameGroup, string>> = {
  digits: "Digit syllables",
  "digit-letters": "Digit-letter names",
  "other-letters": "Other letter names",
  vowels: "Vowel names",
};

export type SoundNameRow = {
  group: SoundNameGroup;
  form: string;
  /** The digit or letter the form names. */
  reading: string;
  /** English cue from the page table; empty for digits. */
  cue: string;
  anchor: string;
  checkpoint: string;
};

const PAGE_ID = /^[\w-]+\.md#[\w-]+$/;

/** Parse sound-names CSV text; throws on a wrong header, an empty field, an unknown group, a bad anchor, or a duplicate form. */
export function parseSoundNamesCsv(text: string): SoundNameRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== SOUND_NAME_HEADERS.join(",")) throw new Error(`Unexpected sound-names CSV header: ${headers.join(",")}`);
  const seen = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    const get = (h: (typeof SOUND_NAME_HEADERS)[number]) => (row[h] ?? "").trim();
    for (const h of ["group", "form", "reading", "anchor", "checkpoint"] as const) {
      if (!get(h)) throw new Error(`sound-names.csv line ${line}: missing ${h}`);
    }
    if (!(get("group") in SOUND_NAME_GROUPS)) throw new Error(`sound-names.csv line ${line}: unknown group ${get("group")}`);
    for (const h of ["anchor", "checkpoint"] as const) {
      if (!PAGE_ID.test(get(h))) throw new Error(`sound-names.csv line ${line}: ${h} ${get(h)} is not page.md#id`);
    }
    const key = `${get("group")}\0${get("form")}`;
    if (seen.has(key)) throw new Error(`sound-names.csv line ${line}: duplicate row ${get("form")} in ${get("group")}`);
    seen.add(key);
    return {
      group: get("group") as SoundNameGroup,
      form: get("form"),
      reading: get("reading"),
      cue: get("cue"),
      anchor: get("anchor"),
      checkpoint: get("checkpoint"),
    };
  });
}

/** Rows of data/sound-names.csv, in file order. */
export function loadSoundNames(): SoundNameRow[] {
  return parseSoundNamesCsv(readData(SOUND_NAME_FILE));
}
