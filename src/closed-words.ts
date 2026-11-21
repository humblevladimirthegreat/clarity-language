// Closed words with a fixed English reading: data/closed-words.csv.
//
// One row per word: the spelled `form`, its `english` reading (with `*…*` markup),
// its `kind`, and the `anchor` (`page.md#id`) of the section that teaches it.
// The cheat sheets and the flashcards read these rows; `closed-words.test.ts`
// checks that every form parses and is spelled in its anchor section.
import { parseCsv } from "./csv.js";
import { readData } from "./repo-paths.js";

export const CLOSED_WORD_HEADERS = ["form", "english", "kind", "anchor"] as const;

export const CLOSED_WORD_KINDS = ["pronoun", "linker", "polar", "stance", "turn"] as const;
export type ClosedWordKind = (typeof CLOSED_WORD_KINDS)[number];

export const CLOSED_WORDS_FILE = "closed-words.csv";

export type ClosedWordRow = {
  form: string;
  /** English reading, with `*…*` markup. */
  english: string;
  kind: ClosedWordKind;
  /** `page.md#id`: the section that teaches the word. */
  anchor: string;
};

const KIND_SET: ReadonlySet<string> = new Set(CLOSED_WORD_KINDS);

/** Parse closed-words CSV text; throws on a wrong header, an empty field, an unknown kind, a bad anchor, or a duplicate row. */
export function parseClosedWordsCsv(text: string): ClosedWordRow[] {
  const { headers, rows } = parseCsv(text);
  if (headers.join(",") !== CLOSED_WORD_HEADERS.join(",")) {
    throw new Error(`Unexpected closed-words CSV header: ${headers.join(",")}`);
  }
  const seen = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    const [form, english, kind, anchor] = CLOSED_WORD_HEADERS.map((h) => (row[h] ?? "").trim()) as [
      string,
      string,
      string,
      string,
    ];
    for (const [name, value] of [["form", form], ["english", english], ["kind", kind], ["anchor", anchor]] as const) {
      if (!value) throw new Error(`closed-words.csv line ${line}: missing ${name}`);
    }
    if (!KIND_SET.has(kind)) {
      throw new Error(`closed-words.csv line ${line}: unknown kind ${kind} (expected ${CLOSED_WORD_KINDS.join(", ")})`);
    }
    if (!/^[\w-]+\.md#[\w-]+$/.test(anchor)) {
      throw new Error(`closed-words.csv line ${line}: anchor ${anchor} is not page.md#id`);
    }
    const key = `${form}\0${english}`;
    if (seen.has(key)) throw new Error(`closed-words.csv line ${line}: duplicate row ${form} (${english})`);
    seen.add(key);
    return { form, english, kind: kind as ClosedWordKind, anchor };
  });
}

/** Rows of data/closed-words.csv, in file order. */
export function loadClosedWords(): ClosedWordRow[] {
  return parseClosedWordsCsv(readData(CLOSED_WORDS_FILE));
}
