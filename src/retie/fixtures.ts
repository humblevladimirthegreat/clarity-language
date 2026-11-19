/**
 * Solver fixtures (`src/interpret/fixtures/*.txt`) hold Ageben one sentence to a line. The retie reads
 * one as a Markdown page: each Ageben line becomes a code span, so it is retied like a doc example, and
 * the comment and English lines stay prose, so house names follow. `fixtureFromMarkdown` undoes the view.
 *
 * Line kinds: `# comment` (Ageben in backticks, names in English), `@ label`, `= English`, blank, and
 * the rest Ageben, optionally after a `Speaker: ` label (`paid.txt`).
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** The `.lp` golden beside a `solve-*.txt` fixture: `translate.test.ts` writes it when it is missing. */
export function goldenOf(fixture: string): string | null {
  return /(^|\/)solve-[^/]*\.txt$/.test(fixture) ? fixture.replace(/\.txt$/, ".lp") : null;
}

export function listFixtures(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".txt"))
    .sort()
    .map((name) => join(dir, name));
}

const SPEAKER_RE = /^([A-Z][a-z]*: )?(.*)$/;

type LineKind = "comment" | "ageben" | "other";

function kindOf(line: string): LineKind {
  if (line.startsWith("#")) return "comment";
  if (line.trim() === "" || line.startsWith("@") || line.startsWith("=")) return "other";
  return "ageben";
}

/** The fixture as Markdown: a comment's `#` escaped (not a heading), each Ageben line in a code span. Line count is kept. */
export function fixtureToMarkdown(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const kind = kindOf(line);
      if (kind === "comment") return `\\${line}`;
      if (kind === "other") return line;
      const [, speaker = "", body = ""] = SPEAKER_RE.exec(line)!;
      return `${speaker}\`${body}\``;
    })
    .join("\n");
}

/** Undo {@link fixtureToMarkdown} on its retied output, reading each line's kind from the original fixture. */
export function fixtureFromMarkdown(markdown: string, original: string): string {
  const kinds = original.split("\n").map(kindOf);
  const lines = markdown.split("\n");
  if (lines.length !== kinds.length) throw new Error("a retied fixture changed its line count");
  return lines
    .map((line, i) => {
      if (kinds[i] === "comment") return line.replace(/^\\/, "");
      if (kinds[i] === "other") return line;
      const [, speaker = "", body = ""] = SPEAKER_RE.exec(line)!;
      if (!body.startsWith("`") || !body.endsWith("`")) throw new Error(`a retied fixture line lost its code span: ${line}`);
      return speaker + body.slice(1, -1);
    })
    .join("\n");
}
