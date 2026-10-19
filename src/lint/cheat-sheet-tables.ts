// Pipe-table parsing shared by the cheat sheet lint (scripts/lint-cheat-sheets.ts) and the
// Claritish editor data (src/claritish-editor/data.ts), which reads its forms from the sheet.

/** Code spans in `text`, without the backticks. */
export function spans(text: string): string[] {
  return [...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]!);
}

export type TableRow = { text: string; index: number };

export type Table = {
  header: string;
  rows: TableRow[];
  /** Offset of the header line in the page. */
  index: number;
  /** Prose between the nearest heading above the table and the table. */
  intro: string;
  /** `{#id}` of the nearest heading above the table, if it has one. */
  section: string | undefined;
};

const HEADING_ID_RE = /^#{1,6}\s.*\{#([\w-]+)\}\s*$/;

/** Pipe tables outside `<!-- generated -->` blocks, each with its intro prose and section. */
export function tables(markdown: string): Table[] {
  const out: Table[] = [];
  const lines = markdown.split("\n");
  let offset = 0;
  let intro: string[] = [];
  let section: string | undefined;
  let current: Table | undefined;
  let generated = false;
  for (const line of lines) {
    // Generated blocks are owned by the data and checked by cheat-sheet-blocks.ts.
    if (/^<!--\s*generated:/.test(line)) generated = true;
    else if (/^<!--\s*\/generated\s*-->/.test(line)) generated = false;
    if (generated) {
      current = undefined;
    } else if (line.startsWith("|")) {
      if (!current) {
        current = { header: line, rows: [], index: offset, intro: intro.join("\n"), section };
        out.push(current);
      } else if (!/^\|[\s|:-]+\|?\s*$/.test(line)) {
        current.rows.push({ text: line, index: offset });
      }
    } else {
      if (current) intro = [];
      current = undefined;
      if (/^#{1,6}\s/.test(line)) {
        intro = [];
        section = HEADING_ID_RE.exec(line)?.[1];
      } else intro.push(line);
    }
    offset += line.length + 1;
  }
  return out;
}

/** The cells of one table line, trimmed (`| a | b |` → `["a", "b"]`). */
export function cells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((cell) => cell.trim());
}
