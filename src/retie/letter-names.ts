/**
 * A word spelled aloud letter by letter (`agadu` → `a` `ga` `a` `da` `u`) copies its root's letters,
 * so a retie must respell the names too. The line sits in the fence after a
 * `<!-- retie: letter-names -->` marker, and the names come from the page's own letter-name table
 * ([phonology.md § letter names](../../docs/grammar/phonology.md#letter-names)).
 */

const MARKER_RE = /<!--\s*retie:\s*letter-names\s*-->\s*\n(```|~~~)[^\n]*\n([\s\S]*?)\n\1/g;
const LINE_RE = /^`([a-z]+)` → ((?:`[a-z]+` ?)+)$/;
const ROW_RE = /^\| `([a-z]+)` \| `([a-z]+)` \|/gm;

/** Letter → name, from the `| Agazan | Name |` rows on the page (empty when it has none). */
export function letterNameTable(markdown: string): Map<string, string> {
  return new Map([...markdown.matchAll(ROW_RE)].map((row) => [row[1]!, row[2]!]));
}

/** The names of a word's letters (`th` is one letter), or `undefined` when a letter has no name. */
export function spellOut(word: string, names: ReadonlyMap<string, string>): string[] | undefined {
  const out: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const letter = word.startsWith("th", i) ? "th" : word[i]!;
    const name = names.get(letter);
    if (name === undefined) return undefined;
    out.push(name);
    i += letter.length - 1;
  }
  return out;
}

export type LetterNameFix = { index: number; from: string; to: string };

/** Respell each marked line's names from its word. `fixes` lists the lines that were stale. */
export function respellLetterNames(markdown: string, names = letterNameTable(markdown)): { text: string; fixes: LetterNameFix[] } {
  const fixes: LetterNameFix[] = [];
  if (names.size === 0) return { text: markdown, fixes };
  const text = markdown.replace(MARKER_RE, (block: string, _fence: string, body: string, offset: number) => {
    const bodyAt = block.indexOf(body);
    let lineAt = 0;
    const next = body
      .split("\n")
      .map((line) => {
        const at = lineAt;
        lineAt += line.length + 1;
        const match = LINE_RE.exec(line);
        const spelled = match ? spellOut(match[1]!, names) : undefined;
        if (!match || !spelled) return line;
        const fixed = `\`${match[1]}\` → ${spelled.map((name) => `\`${name}\``).join(" ")}`;
        if (fixed !== line) fixes.push({ index: offset + bodyAt + at, from: line, to: fixed });
        return fixed;
      })
      .join("\n");
    return block.slice(0, bodyAt) + next + block.slice(bodyAt + body.length);
  });
  return { text, fixes };
}
