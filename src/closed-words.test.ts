import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { CLOSED_WORD_KINDS, loadClosedWords, parseClosedWordsCsv } from "./closed-words.ts";
import { pageSections } from "./lint/learning-order.ts";
import { parseWord } from "./parse/word.ts";
import { grammarFile } from "./repo-paths.ts";

const rows = loadClosedWords();

describe("closed-words.csv", () => {
  it("has rows of every kind it uses, from the fixed kind list", () => {
    assert.ok(rows.length > 0);
    for (const r of rows) assert.ok((CLOSED_WORD_KINDS as readonly string[]).includes(r.kind));
  });

  it("parses every form as one word", () => {
    const bad: string[] = [];
    for (const r of rows) {
      try {
        const word = parseWord(r.form);
        if (word.raw !== r.form) bad.push(`${r.form}: parsed as ${word.raw}`);
      } catch (e) {
        bad.push(`${r.form}: ${(e as Error).message.split("\n")[0]}`);
      }
    }
    assert.deepEqual(bad, [], "closed-words.csv forms that do not parse");
  });

  it("spells every form in a code span in its anchor section, bare or after a PoS letter", () => {
    const pages = new Map<string, { markdown: string; sections: ReturnType<typeof pageSections> }>();
    const missing: string[] = [];
    for (const r of rows) {
      const [file, id] = r.anchor.split("#") as [string, string];
      if (!pages.has(file)) {
        const markdown = readFileSync(grammarFile(file), "utf8");
        pages.set(file, { markdown, sections: pageSections(file, markdown) });
      }
      const { markdown, sections } = pages.get(file)!;
      const section = sections.anchors.get(id);
      if (!section) {
        missing.push(`${r.form}: anchor ${r.anchor} lands in no section`);
        continue;
      }
      const text = markdown.slice(section.offset, section.end);
      // Bare, or after one PoS letter: a pronoun section may spell it only in a slot (`zalen`, `zeyen`).
      const word = new RegExp(`(?<![a-z])(?:th|[zdbvgwhx])?${r.form}(?![a-z])`);
      const spans = text.match(/`[^`\n]+`/g) ?? [];
      if (!spans.some((s) => word.test(s))) missing.push(`${r.form}: not in a code span under ${r.anchor}`);
    }
    assert.deepEqual(missing, [], "closed-words.csv forms not spelled in their anchor section");
  });
});

describe("parseClosedWordsCsv", () => {
  const header = "form,english,kind,anchor\n";
  it("reads quoted English with commas", () => {
    assert.deepEqual(parseClosedWordsCsv(`${header}eyen,"*one*, *people*",pronoun,pronouns.md#generic-pronoun\n`), [
      { form: "eyen", english: "*one*, *people*", kind: "pronoun", anchor: "pronouns.md#generic-pronoun" },
    ]);
  });
  it("rejects an unknown kind", () => {
    assert.throws(() => parseClosedWordsCsv(`${header}uwen,*I*,verb,pronouns.md#special-pronouns\n`), /unknown kind/);
  });
  it("rejects a wrong header", () => {
    assert.throws(() => parseClosedWordsCsv("form,english,anchor\nuwen,*I*,pronouns.md#x\n"), /header/);
  });
  it("rejects an anchor that is not page.md#id", () => {
    assert.throws(() => parseClosedWordsCsv(`${header}uwen,*I*,pronoun,pronouns.md\n`), /page\.md#id/);
  });
});
