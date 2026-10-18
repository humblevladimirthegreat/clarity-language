import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { dataPath } from "../repo-paths.js";
import { analyzeEnglish, createHelperData, suggestionChip, type HelperPayload } from "./browser.js";
import { helperPayload, loadHelperData } from "./load.js";

const SENTENCES = ["My sister could not come to the tea shop.", "The teacher saw/n a puppy by the living room.", "Azawan walks."];

describe("English helper in the browser", () => {
  const node = loadHelperData();
  // The Inspect page gets the payload as JSON from a VitePress data loader.
  const payload = JSON.parse(JSON.stringify(helperPayload())) as HelperPayload;
  const csv = (name: string) => readFileSync(dataPath(name), "utf8");
  const page = createHelperData(
    payload,
    { published: csv("lexicon-published.csv"), overlays: csv("lexicon-overlays.csv"), compounds: csv("lexicon-compounds.csv") },
    loadDefaultTables(),
  );

  it("analyzes from the JSON payload exactly as the CLI does", () => {
    for (const text of SENTENCES) assert.deepEqual(analyzeEnglish(page, text), analyzeEnglish(node, text), text);
  });

  it("gives every chip a known section link, and a form to copy for spelled words", () => {
    for (const text of SENTENCES) {
      for (const slot of analyzeEnglish(page, text).clauses.flatMap((c) => c.slots)) {
        for (const s of slot.suggestions) {
          const chip = suggestionChip(s);
          for (const link of chip.links) assert.ok(page.sections.has(link), `${slot.text}: ${link}`);
          if (s.kind === "lexicon" && s.word) assert.equal(chip.form, s.word);
          if (chip.copy) assert.ok(chip.form);
        }
      }
    }
  });
});
