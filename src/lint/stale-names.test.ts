import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createClassifyTablesFromRows } from "../parse/classify.js";
import { emptyPosEnglish } from "../lexicon-search.js";

import { lintStaleNames } from "./stale-names.js";

const tables = createClassifyTablesFromRows(
  ["uzoze", "ame"].map((root) => ({
    emoji: "",
    concrete: root,
    abstract: "",
    root,
    mnemonic: "",
    englishByPos: "",
    posEnglish: emptyPosEnglish(),
  })),
  [],
);

const names = (text: string) => lintStaleNames(text, tables).map((issue) => issue.name);

describe("lintStaleNames", () => {
  it("passes names of current roots, the language's name, English words and foreign names", () => {
    assert.deepEqual(names('"Uzozen walks." Amen. Egabon. Even so. Hamlet, Sam, UZOZEN, *some Uzozens*'), []);
  });

  it("flags a name whose root is not in the lexicon, in prose, morph lines and code", () => {
    assert.deepEqual(names("*Azawan* `z-Azawan | v-walk` `z-←Azawan` *some Azawans* AZAWAN"), [
      "Azawan",
      "Azawan",
      "Azawan",
      "Azawans",
      "AZAWAN",
    ]);
  });

  it("skips foreign payloads", () => {
    assert.deepEqual(names('`z@<Azawan>` <code>z@&lt;Azawan&gt;</code> b-NAME.OPAQUE["Azawan"]'), []);
  });
});
