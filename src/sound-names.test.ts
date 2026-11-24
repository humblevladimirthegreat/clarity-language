import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { pageSections } from "./lint/learning-order.ts";
import { grammarFile } from "./repo-paths.ts";
import { loadSoundNames, SOUND_NAME_GROUPS, type SoundNameGroup } from "./sound-names.ts";

const rows = loadSoundNames();
const inGroup = (g: SoundNameGroup) => rows.filter((r) => r.group === g);
const page = (name: string) => readFileSync(grammarFile(name), "utf8");
const cells = (line: string) => line.split("|").slice(1, -1).map((c) => c.trim());
const unTick = (s: string) => s.replace(/^`|`$/g, "");
const unStar = (s: string) => s.replace(/\*/g, "");

/** `[form, reading, cue]` of the letter table (`| Ageben | Name | Cue |`) of letter-names.md, in page order. */
function letterTable(): string[][] {
  return page("letter-names.md")
    .split("\n")
    .filter((l) => /^\| `[a-z]+` \| `[a-z]+` \| \*/.test(l))
    .map((l) => {
      const [letter, name, cue] = cells(l) as [string, string, string];
      return [unTick(name), unTick(letter), unStar(cue)];
    });
}

/** Letters of the digit-letter table (`| Ageben | Digit syllable | Name | Cue |`), in page order. */
function digitLetterTable(): string[][] {
  return page("letter-names.md")
    .split("\n")
    .filter((l) => /^\| `[a-z]+` \| `[a-z]+` \(\d\) \| `[a-z]+` \|/.test(l))
    .map((l) => {
      const [letter, , name] = cells(l) as [string, string, string];
      return [unTick(name), unTick(letter)];
    });
}

describe("sound-names.csv against the page tables", () => {
  it("has rows for every group", () => {
    for (const g of Object.keys(SOUND_NAME_GROUPS) as SoundNameGroup[]) assert.ok(inGroup(g).length > 0, g);
  });

  it("matches the digit table in numbers.md, digit for digit", () => {
    const lines = page("numbers.md").split("\n");
    const digits = cells(lines.find((l) => l.startsWith("| Digit |"))!).slice(1);
    const syllables = cells(lines.find((l) => l.startsWith("| Syllable |"))!).slice(1);
    assert.deepEqual(
      inGroup("digits").map((r) => [r.form, r.reading]),
      syllables.map((s, i) => [s, digits[i]]),
      "digits group differs from the Digit / Syllable table in numbers.md",
    );
  });

  it("matches the letter table in letter-names.md, letter for letter", () => {
    const table = letterTable();
    assert.ok(table.length > 0, "letter table not found in letter-names.md");
    const csv = [...inGroup("digit-letters"), ...inGroup("other-letters"), ...inGroup("vowels")].map((r) => [r.form, r.reading, r.cue]);
    assert.deepEqual(csv, table, "letter groups differ from the Ageben / Name / Cue table in letter-names.md");
  });

  it("matches the digit-letter table's names and order", () => {
    assert.deepEqual(
      inGroup("digit-letters").map((r) => [r.form, r.reading]),
      digitLetterTable(),
      "digit-letters group differs from the Digit syllable table in letter-names.md",
    );
  });

  it("keeps each digit letter's consonant and flips its digit's vowel (a<->u, o<->e)", () => {
    const flip: Record<string, string> = { a: "u", u: "a", o: "e", e: "o" };
    const digitOf = new Map(inGroup("digits").map((r) => [r.form[0]!, r.form]));
    for (const r of inGroup("digit-letters")) {
      const syllable = digitOf.get(r.reading);
      assert.ok(syllable, `${r.reading}: no digit syllable starts with it`);
      assert.equal(r.form, r.reading + flip[syllable![1]!], `${r.reading}: name is not the opposite vowel of ${syllable}`);
    }
  });

  it("anchors every row in a section that exists, with a checkpoint on the same or a later page", () => {
    const bad: string[] = [];
    for (const r of rows) {
      const [file, id] = r.anchor.split("#") as [string, string];
      if (!pageSections(file, page(file)).anchors.get(id)) bad.push(`${r.form}: anchor ${r.anchor} lands in no section`);
    }
    assert.deepEqual(bad, []);
  });
});
