/**
 * Letter breakdowns for flashcard backs (flashcards.md#letters): where each letter of a root, closed word or
 * overlay word comes from. Root letters come from the row's `kind`, `shape`, `size` and `onset` cells, read
 * against the learner tables on root-tails.md; a word's pieces come from `parseWord`. A root's first vowel
 * only keeps it apart from its neighbors, so it is never explained, and a letter that breaks the rule it
 * should follow (an onset or size vowel given up in a full cell) is left out rather than explained wrongly.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SCALE_ENDING_KINDS } from "./flashcards.js";
import type { CompoundRow } from "./lexicon-compounds.js";
import type { PublishedRow } from "./lexicon-search.js";
import { parseWord } from "./parse/index.js";
import { onlyPage, roleLetterTable, rootTailTables } from "./page-contracts.js";
import { GRAMMAR_DIR } from "./repo-paths.js";
import { KIND_LETTERS, PLACE_KIND, SHAPE_VOWELS, SIZE_VOWELS, UNSIZED_KINDS, type Kind, type Size } from "./root-tails.js";

/** One explained piece: the letters, and what they say, with `*…*` for an English word. */
export type LetterLine = { letters: string; text: string };

/** Learner wording for each letter job, from the grammar pages ({@link loadLetterTables}). */
export type LetterTables = {
  /** Tail consonant → kind (root-tails.md). */
  kind: ReadonlyMap<string, string>;
  /** Last vowel → job (root-tails.md). */
  job: ReadonlyMap<string, string>;
  /** Middle vowel → size (root-tails.md). */
  size: ReadonlyMap<string, string>;
  /** Role letter (`th` as one) → job (consonants cheat sheet, role letters). */
  role: ReadonlyMap<string, string>;
};


/** Rows of the first Markdown table whose header starts with `first`: each row's cells, trimmed. */
function tableRows(markdown: string, first: string): string[][] {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`| ${first} |`));
  if (start < 0) throw new Error(`no table headed "${first}"`);
  const rows: string[][] = [];
  for (const line of lines.slice(start + 2)) {
    if (!line.startsWith("|")) break;
    rows.push(line.split("|").slice(1, -1).map((cell) => cell.trim()));
  }
  return rows;
}

/** The letter in a cell's first code span (`` `z` ``, `` [`/th/`](…) ``); the IPA `ɡ` reads as `g`. */
function cellLetter(cell: string): string {
  const code = /`\/?([^`/]+)\/?`/.exec(cell)?.[1];
  if (!code) throw new Error(`no letter in table cell ${cell}`);
  return code.replace("ɡ", "g");
}

/** A cell's wording up to its first colon or semicolon, without Markdown. */
function cellText(cell: string): string {
  return cell.split(/[:;]/)[0]!.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*]/g, "").trim();
}

/** The tables from the grammar pages; `pageText` reads a stage page by name. */
export function loadLetterTables(pageText: (page: string) => string): LetterTables {
  // The tails page through `pageText`; the role-letter cheat sheet from disk, since it lists `/y/` and `/x/` too.
  const tails = pageText(onlyPage(rootTailTables));
  const table = (markdown: string, first: string) => new Map(tableRows(markdown, first).map((cells) => [cellLetter(cells[0]!), cellText(cells[1]!)]));
  const tables: LetterTables = {
    kind: table(tails, "Second consonant"),
    job: table(tails, "Last vowel"),
    size: table(tails, "Middle vowel"),
    role: table(readFileSync(join(GRAMMAR_DIR, onlyPage(roleLetterTable)), "utf8"), "Letter"),
  };
  const missing = [
    ...Object.values(KIND_LETTERS).filter((c) => !tables.kind.has(c)),
    ...Object.values(SHAPE_VOWELS).filter((v) => !tables.job.has(v)),
    ...Object.values(SIZE_VOWELS).filter((v) => !tables.size.has(v)),
  ];
  if (missing.length > 0) throw new Error(`${onlyPage(rootTailTables)} tables lack letters ${missing.join(" ")}`);
  return tables;
}

const loaded = new WeakMap<(page: string) => string, LetterTables>();

/** {@link loadLetterTables}, once per `pageText` reader. */
export function letterTablesFor(pageText: (page: string) => string): LetterTables {
  let tables = loaded.get(pageText);
  if (!tables) loaded.set(pageText, (tables = loadLetterTables(pageText)));
  return tables;
}

/** A flag or place label as its name: `ascension-island-flag` → `ascension island`. */
function placeName(concrete: string): string {
  return concrete.replace(/-flag$/, "").replace(/-/g, " ");
}

/**
 * A root's letters after its first vowel. A place-name root is spelled from the English sound as a whole.
 * On a five-letter root the first consonant is explained only when it is the `onset`, and the middle
 * vowel only when it is the size's (a `mind` row has no size, so its middle vowel is free).
 */
export function rootLetters(row: Pick<PublishedRow, "root" | "concrete" | "kind" | "shape" | "size" | "onset">, tables: LetterTables): LetterLine[] {
  const { root } = row;
  if (row.kind === PLACE_KIND) return [{ letters: root, text: `spelled from the English sound of *${placeName(row.concrete)}*` }];
  const tail = (consonant: string, vowel: string): LetterLine[] => [
    { letters: consonant, text: `kind: ${tables.kind.get(consonant) ?? ""}` },
    { letters: vowel, text: `job: ${tables.job.get(vowel) ?? ""}` },
  ];
  if (root.length === 3) return tail(root[1]!, root[2]!);
  if (root.length !== 5) return [];
  const lines: LetterLine[] = [];
  if (row.onset && root[1] === row.onset) lines.push({ letters: root[1]!, text: `echoes the first sound of *${row.concrete}*` });
  const size = row.size as Size | "";
  if (size && !UNSIZED_KINDS.has(row.kind as Kind) && SIZE_VOWELS[size] === root[2]) lines.push({ letters: root[2]!, text: `size: ${tables.size.get(root[2]!) ?? ""}` });
  return [...lines, ...tail(root[3]!, root[4]!)];
}

/**
 * A dictionary compound's pieces (compounds.md#words-you-look-up-not-build): the left root, the join letter
 * (its everyday or abstract sense), and the right root or a tail suffix (kind + job, tail-suffixes.md).
 * Undefined when a piece is neither, such as an extra-noun hook: the card then keeps the plain parts line.
 */
export function compoundLetters(row: Pick<CompoundRow, "left" | "join" | "right">, published: ReadonlyMap<string, PublishedRow>, tables: LetterTables): LetterLine[] | undefined {
  const left = published.get(row.left);
  if (!left) return undefined;
  const lines: LetterLine[] = [{ letters: row.left, text: `left piece: *${left.concrete}*` }];
  if (row.join === "l") lines.push({ letters: "l", text: "join: the left piece in its everyday sense" });
  else if (row.join === "m") lines.push({ letters: "m", text: left.abstract ? `join: the left piece in its abstract sense, *${left.abstract}*` : "join: the left piece in its abstract sense" });
  else if (row.join) return undefined;
  const right = published.get(row.right);
  if (right) return [...lines, { letters: row.right, text: `kind of thing: *${right.concrete}*` }];
  if (row.join || row.right.length !== 2 || !tables.kind.has(row.right[0]!) || !tables.job.has(row.right[1]!)) return undefined;
  return [
    ...lines,
    { letters: row.right[0]!, text: `kind: ${tables.kind.get(row.right[0]!)!}` },
    { letters: row.right[1]!, text: `job: ${tables.job.get(row.right[1]!)!}` },
  ];
}

// ── Word pieces ──

/** Act vowels on `/y/` (speech-moves.md#speech-act-beginner): one vowel is the act. */
const ACT_VOWELS: Readonly<Record<string, string>> = { a: "statement", o: "command", e: "question", u: "prohibition" };
/** Polar words stack two vowels (polar-inventory.md): the first names the family, the second what you answer. */
const POLAR_FAMILY: Readonly<Record<string, string>> = { u: "not", a: "add", o: "pass" };
const POLAR_ANSWERS: Readonly<Record<string, string>> = { o: "the claim or the order", e: "this option", a: "the question's own premise" };
/** Endings on `/y/` words (firm-soft.md, polar-inventory.md#polar-endings). */
const ACT_ENDINGS: Readonly<Record<string, string>> = { l: "firm", m: "soft", r: "for now" };
/** Join vowels (joins.md#join-type-vowel-series): how much list is left. */
const JOIN_VOWELS: Readonly<Record<string, string>> = { a: "*and* (grows)", o: "rank (stays)", e: "choice (one)", u: "*not* (gone)" };
/** Mid-word letter + stance vowel after a host (vowels cheat sheet; sakes.md#word-shape, can-and-cant.md#ability). */
const STANCE_SERIES: Readonly<Record<string, { name: string; vowels: Readonly<Record<string, string>> }>> = {
  sake: { name: "sake stance", vowels: { a: "met / serves", o: "motive", e: "prescription", u: "unmet / detracts" } },
  ability: { name: "ability", vowels: { a: "can", o: "can't right now", e: "can't yet", u: "never" } },
};
const STANCE_LETTER: Readonly<Record<string, string>> = { sake: "th", ability: "x" };
/** The settled-to-passing scale (knowing.md#settled-to-passing). */
const SCALE_ENDS: Readonly<Record<string, string>> = { l: "settled end of the settled-to-passing scale", r: "passing end of the settled-to-passing scale" };
/** Overlay kinds whose `-l` / `-r` forms sit on the settled-to-passing scale, as their pages teach. */
function onScale(kind: string): boolean {
  return SCALE_ENDING_KINDS.has(kind) || ["may", "plan", "notional"].includes(kind);
}

/** What a word is, for its ending: a closed word, or an overlay word of one kind. */
export type WordContext = { overlayKind?: string };

/** The ending's line, or none when no rule covers it. */
function endingLine(ending: string, pos: string | undefined, host: Pick<PublishedRow, "abstract"> | undefined, context: WordContext): LetterLine | undefined {
  const abstract = () => ({ letters: "m", text: host?.abstract ? `abstract ending: *${host.abstract}*` : "abstract ending" });
  if (context.overlayKind !== undefined) {
    if (ending === "m") return abstract();
    return onScale(context.overlayKind) && SCALE_ENDS[ending] ? { letters: ending, text: SCALE_ENDS[ending]! } : undefined;
  }
  if (pos === "y") return ACT_ENDINGS[ending] ? { letters: ending, text: ACT_ENDINGS[ending]! } : undefined;
  if (pos === "x") {
    if (ending === "m") return abstract();
    if (ending === "l") return { letters: "l", text: "firm: the link holds" };
    return undefined;
  }
  if (!pos && ending === "n") return { letters: "n", text: "these pronouns end in `-n`, like a name" };
  return undefined;
}

/** Vowel lines of a `/y/` word or a join word. */
function seriesLines(series: string, pos: string | undefined): LetterLine[] {
  if (pos === "y" && series.length === 1) return [{ letters: series, text: `act: ${ACT_VOWELS[series] ?? ""}` }];
  if (pos === "y" && series.length === 2) {
    return [
      { letters: series[0]!, text: `family: ${POLAR_FAMILY[series[0]!] ?? ""}` },
      { letters: series[1]!, text: `answering: ${POLAR_ANSWERS[series[1]!] ?? ""}` },
    ];
  }
  return [...series].map((v) => ({ letters: v, text: `join: ${JOIN_VOWELS[v] ?? ""}` }));
}

/**
 * Pieces of a closed word or an overlay word (role letter + sense form), from its parse: the role letter,
 * the root's letters and its concrete sense, or the stacked vowels, then the ending where a rule covers it.
 */
export function wordLetters(word: string, published: ReadonlyMap<string, PublishedRow>, tables: LetterTables, context: WordContext = {}): LetterLine[] {
  const parsed = parseWord(word);
  const pos = parsed.pos;
  const lines: LetterLine[] = [];
  if (pos && parsed.gl) lines.push({ letters: "gl", text: "role: adjective before the noun" });
  else if (pos) {
    const role = tables.role.get(pos);
    if (role) lines.push({ letters: pos, text: `role: ${role}` });
  }
  let host: PublishedRow | undefined;
  const hostLines = (root: string) => {
    host = published.get(root);
    if (host) lines.push(...rootLetters(host, tables), { letters: root, text: `${context.overlayKind === undefined ? "root" : "host"}: *${host.concrete}*` });
  };
  const { family } = parsed;
  let stanceEnding = false;
  if (family.kind === "content" && family.roots.length === 1) hostLines(family.roots[0]!);
  else if (family.kind === "joinMarker") lines.push(...seriesLines(family.series, pos));
  else if (family.kind === "x" && family.leftRoots.length === 1 && family.stanceVowel && STANCE_SERIES[family.xFamily]) {
    // A stance word's ending comes from its stance's own table, so only the host and the stance are explained.
    const series = STANCE_SERIES[family.xFamily]!;
    hostLines(family.leftRoots[0]!);
    lines.push({ letters: `${STANCE_LETTER[family.xFamily]}${family.stanceVowel}`, text: `${series.name}: ${series.vowels[family.stanceVowel] ?? ""}` });
    stanceEnding = true;
  }
  const ending = parsed.ending && !stanceEnding ? endingLine(parsed.ending, pos, host, context) : undefined;
  if (ending) lines.push(ending);
  return lines;
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Letter lines as HTML: one `.letter` line each, the letters in `<code>` beside the text in a `<span>` (two columns, so a long line wraps under its text), `*…*` as italics and `` `…` `` as code. */
export function lettersHtml(lines: readonly LetterLine[]): string {
  return lines
    .map(({ letters, text }) => {
      const body = escapeHtml(text).replace(/\*([^*]+)\*/g, "<i>$1</i>").replace(/`([^`]+)`/g, "<code>$1</code>");
      return `<div class="letter"><code>${escapeHtml(letters)}</code><span>${body}</span></div>`;
    })
    .join("");
}
