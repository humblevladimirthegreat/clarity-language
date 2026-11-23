/**
 * Page contracts: each page-shape dependency code has on a grammar page, as data. A reader takes the
 * id or pattern from its contract instead of a literal (`section(markdown, lessonGap.id)`), and
 * `npm run page-readers` lists each contract on the pages it covers, with the files that import it
 * as its readers, and fails when a covered page lacks the part.
 *
 * Page keys are those of `npm run page-refs`: `claritish/x.md` for a Claritish page,
 * `cheat-sheets/x.md` for a cheat sheet, the bare filename for a stage page.
 */

/** Which pages a contract covers. A contract on every page or every stage page is listed once, in grammar-docs.md. */
export type PageSet =
  | { kind: "every page" }
  | { kind: "stage pages" }
  | { kind: "lessons"; except?: readonly string[] }
  | { kind: "cheat sheets" }
  | { kind: "pages"; pages: readonly string[] };

/** The part of a page a contract reads. */
export type PagePart = "h1" | "section" | "anchor" | "tables" | "practice" | "examples" | "marker" | "links";

export type PageContract = {
  pages: PageSet;
  part: PagePart;
  /** The section or anchor id (`section`, `anchor`). */
  id?: string;
  /** The pattern the reader matches (`h1`, `practice`, `marker`, `links`). */
  pattern?: RegExp;
  /** The part's name in a read-by line when `part` and `id` do not give it (a marker's text). */
  label?: string;
  /**
   * One English line: what the page must hold. It is written into an HTML comment on the page that
   * readers also scan, so it holds no backticks, no `-->` and no marker text.
   */
  requires: string;
};

export const CLARITISH_FOLDER = "claritish";
export const CHEAT_SHEETS_FOLDER = "cheat-sheets";

/** Files in claritish/ that are not lessons. */
export const CLARITISH_NOT_LESSONS: ReadonlySet<string> = new Set(["index.md", "learn.md", "cheat-sheet.md", "flashcards.md", "editor.md"]);

/** Whether a page key is a Claritish lesson. */
export function isLessonPage(key: string): boolean {
  const prefix = `${CLARITISH_FOLDER}/`;
  return key.startsWith(prefix) && !CLARITISH_NOT_LESSONS.has(key.slice(prefix.length));
}

/** Whether `set` covers the page key. */
export function coversPage(set: PageSet, key: string): boolean {
  const stage = !key.includes("/");
  switch (set.kind) {
    case "every page":
      return true;
    case "stage pages":
      return stage;
    case "lessons":
      return isLessonPage(key) && !(set.except ?? []).includes(key.slice(CLARITISH_FOLDER.length + 1));
    case "cheat sheets":
      return key.startsWith(`${CHEAT_SHEETS_FOLDER}/`);
    case "pages":
      return set.pages.includes(key);
  }
}

// ---------------------------------------------------------------- Claritish lessons

export const lessonTitle: PageContract = {
  pages: { kind: "lessons" },
  part: "h1",
  pattern: /^#\s+(.*?)\s*(?:\{#[\w-]+\})?\s*$/m,
  requires: "the journal editor's lesson title",
};

export const lessonGap: PageContract = {
  pages: { kind: "lessons" },
  part: "section",
  id: "gap",
  requires: "a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt",
};

export const lessonForms: PageContract = {
  pages: { kind: "lessons" },
  part: "anchor",
  id: "forms",
  requires: "the editor's \"Learn this\" link",
};

export const lessonPracticeItems: PageContract = {
  pages: { kind: "lessons" },
  part: "practice",
  pattern: /^\*\*\d+\.\*\* (?:\*(.+?)\*|([^*\s][^(\n]*?))\s*(?:\((.+)\))?\s*\n\n::: details Show answer\n(.+)\n:::/gm,
  requires: "numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block",
};

/** Lessons whose tables teach a pattern, not drop-ins, so their spans need not be on the cheat sheet. */
export const lessonTables: PageContract = {
  pages: { kind: "lessons", except: ["what-a-feeling-wants.md", "feelings.md"] },
  part: "tables",
  requires: "each table row's spans are on the Claritish cheat sheet",
};

export const lessonOrder: PageContract = {
  pages: { kind: "pages", pages: [`${CLARITISH_FOLDER}/index.md`] },
  part: "links",
  pattern: /\]\(([\w-]+)\.md\)/g,
  label: "lesson links",
  requires: "the order of the links to lessons is the track's lesson order",
};

export const claritishSheetTables: PageContract = {
  pages: { kind: "pages", pages: [`${CLARITISH_FOLDER}/cheat-sheet.md`] },
  part: "tables",
  requires: "the sheet's tables are the reference set of drop-ins; flows name its sections and columns",
};

// ---------------------------------------------------------------- cheat sheets

export const cheatSheetParadigms: PageContract = {
  pages: { kind: "cheat sheets" },
  part: "tables",
  requires: "each table is a paradigm block whose rows hold code-span forms, italic English and section links, for the English helper",
};

// ---------------------------------------------------------------- every page

export const pageTitle: PageContract = {
  pages: { kind: "every page" },
  part: "h1",
  pattern: /^# (.+)$/m,
  requires: "the first H1 is the page's title in the grammar map (the filename when there is none)",
};

export const stageSections: PageContract = {
  pages: { kind: "stage pages" },
  part: "section",
  pattern: /^### (.+)$/,
  label: "H3 headings",
  requires: "each H3 heading outside code fences, Practice aside, is listed as a section in the grammar map",
};

// ---------------------------------------------------------------- stage pages

export const cheatSheetMarker: PageContract = {
  pages: { kind: "stage pages" },
  part: "marker",
  pattern: /<!--\s*cheat-sheet:\s*(\S+)\s*-->/g,
  label: "cheat-sheet markers",
  requires: "each marker names a sheet id and sits right before a table whose forms are on that sheet",
};

/** The one page a single-page contract covers. */
export function onlyPage(contract: PageContract): string {
  if (contract.pages.kind !== "pages" || contract.pages.pages.length !== 1) throw new Error("onlyPage: the contract covers more than one page");
  return contract.pages.pages[0]!;
}
